// Alte Service Worker und Caches frueherer Versionen entfernen
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(regs => regs.forEach(r => r.unregister()));
}
if ('caches' in window) {
    caches.keys().then(names => names.forEach(name => caches.delete(name)));
}

document.addEventListener('DOMContentLoaded', () => {
    let currentLang = 'de';
    try { currentLang = localStorage.getItem('site-lang') || 'de'; } catch (e) { /* kein Speicher */ }

    // Die E-Mail-Adresse steht nirgends im Klartext, damit einfache Scraper sie nicht finden.
    // Sie wird erst bei der ersten Eingabe eines Menschen (Maus, Touch, Taste, Scrollen) eingesetzt.
    const mailAddr = () => ['ed.oetsop', String.fromCharCode(64), 'vonahmirig.nime']
        .map(part => part.split('').reverse().join('')).reverse().join('');
    let mailShown = false;
    function revealMail() {
        if (mailShown) return;
        mailShown = true;
        const addr = mailAddr();
        document.querySelectorAll('.js-mail-link').forEach(a => { a.href = 'mailto:' + addr; });
        document.querySelectorAll('.js-mail-text').forEach(el => {
            // Ab jetzt nicht mehr beim Sprachwechsel ueberschreiben
            el.removeAttribute('data-de');
            el.removeAttribute('data-en');
            el.textContent = addr;
        });
    }
    ['pointermove', 'pointerdown', 'touchstart', 'keydown', 'scroll', 'focusin'].forEach(evt =>
        window.addEventListener(evt, revealMail, { once: true, passive: true }));

    // Beim Sprachwechsel erlaubte Auszeichnungen. Alles andere wird reiner Text.
    const ALLOWED_TAGS = ['A', 'STRONG', 'EM', 'B', 'I', 'BR', 'SPAN'];

    function buildSafeFragment(html) {
        const parsed = new DOMParser().parseFromString(html, 'text/html');
        const fragment = document.createDocumentFragment();

        function copy(source, target) {
            source.childNodes.forEach(node => {
                if (node.nodeType === Node.TEXT_NODE) {
                    target.appendChild(document.createTextNode(node.nodeValue));
                    return;
                }
                if (node.nodeType !== Node.ELEMENT_NODE) return;

                if (!ALLOWED_TAGS.includes(node.tagName)) {
                    copy(node, target);
                    return;
                }

                const el = document.createElement(node.tagName.toLowerCase());

                if (node.tagName === 'A') {
                    const href = node.getAttribute('href') || '';
                    if (/^(https?:|mailto:|#)/i.test(href)) {
                        el.setAttribute('href', href);
                    }
                    if (/^https?:/i.test(href)) {
                        el.target = '_blank';
                        el.rel = 'noopener noreferrer';
                    }
                }

                ['class', 'aria-label', 'title'].forEach(attr => {
                    const val = node.getAttribute(attr);
                    if (val) el.setAttribute(attr, val);
                });

                copy(node, el);
                target.appendChild(el);
            });
        }

        copy(parsed.body, fragment);
        return fragment;
    }

    const langToggleBtn = document.getElementById('lang-toggle-btn');
    // Seiten ohne Sprachumschalter (Impressum, Datenschutz) gibt es nur auf Deutsch
    if (!langToggleBtn) currentLang = 'de';

    // --- Hell / Dunkel ---
    const themeBtn = document.getElementById('theme-toggle-btn');
    const darkQuery = window.matchMedia('(prefers-color-scheme: dark)');

    function currentTheme() {
        const set = document.documentElement.getAttribute('data-theme');
        if (set === 'light' || set === 'dark') return set;
        return darkQuery.matches ? 'dark' : 'light';
    }

    function updateThemeButton() {
        if (!themeBtn) return;
        const dark = currentTheme() === 'dark';
        // Der Knopf zeigt, wohin er schaltet
        themeBtn.querySelector('.icon-moon').hidden = dark;
        themeBtn.querySelector('.icon-sun').hidden = !dark;
        const target = dark ? 'light' : 'dark';
        themeBtn.setAttribute('aria-label', themeBtn.getAttribute(`data-${currentLang}-label-${target}`));
    }

    if (themeBtn) {
        themeBtn.addEventListener('click', () => {
            const next = currentTheme() === 'dark' ? 'light' : 'dark';
            // Uebergaenge kurz abschalten, damit alle Farben sofort wechseln
            const root = document.documentElement;
            root.classList.add('theme-switching');
            root.setAttribute('data-theme', next);
            void root.offsetWidth;
            setTimeout(() => root.classList.remove('theme-switching'), 50);
            try { localStorage.setItem('site-theme', next); } catch (e) { /* kein Speicher */ }
            updateThemeButton();
        });
        // Systemwechsel uebernehmen, solange niemand selbst gewaehlt hat
        const onSystemChange = () => updateThemeButton();
        if (darkQuery.addEventListener) darkQuery.addEventListener('change', onSystemChange);
        else if (darkQuery.addListener) darkQuery.addListener(onSystemChange);
    }

    // Links in neuem Tab fuer Screenreader kennzeichnen
    function markExternalLinks() {
        const hint = currentLang === 'de' ? ' (öffnet in neuem Tab)' : ' (opens in new tab)';
        document.querySelectorAll('a[target="_blank"]').forEach(a => {
            let span = a.querySelector('.ext-hint');
            if (!span) {
                span = document.createElement('span');
                span.className = 'sr-only ext-hint';
                a.appendChild(span);
            }
            span.textContent = hint;
        });
    }

    function applyLanguage(lang) {
        currentLang = lang;
        try { localStorage.setItem('site-lang', lang); } catch (e) { /* kein Speicher */ }
        document.documentElement.lang = lang;

        if (langToggleBtn) {
            langToggleBtn.textContent = lang === 'de' ? 'EN' : 'DE';
            // Die Beschriftung steht in der Zielsprache
            langToggleBtn.lang = lang === 'de' ? 'en' : 'de';
        }

        document.querySelectorAll('[data-de][data-en]').forEach(el => {
            const text = el.getAttribute(`data-${lang}`);
            if (text !== null) el.replaceChildren(buildSafeFragment(text));
        });

        // Reine Beschriftungen: der Inhalt bleibt unangetastet.
        document.querySelectorAll('[data-de-label][data-en-label]').forEach(el => {
            el.setAttribute('aria-label', el.getAttribute(`data-${lang}-label`));
        });

        markExternalLinks();
        updateThemeButton();
    }

    if (langToggleBtn) {
        langToggleBtn.addEventListener('click', () => applyLanguage(currentLang === 'de' ? 'en' : 'de'));
    }

    if (currentLang !== 'de') {
        applyLanguage(currentLang);
    } else {
        markExternalLinks();
        updateThemeButton();
    }

    // E-Mail-Adresse kopieren
    const copyEmailBtn = document.getElementById('copy-email-btn');
    if (copyEmailBtn) {
        copyEmailBtn.addEventListener('click', () => {
            const email = mailAddr();
            revealMail();

            function meldung(ok) {
                const de = ok ? 'kopiert' : 'bitte von Hand kopieren';
                const en = ok ? 'copied' : 'please copy manually';
                copyEmailBtn.textContent = currentLang === 'de' ? de : en;
                announce(copyEmailBtn.textContent);
                setTimeout(() => {
                    copyEmailBtn.textContent = currentLang === 'de' ? 'kopieren' : 'copy';
                }, 2000);
            }

            // Aelterer Weg fuer Safari und fuer Seiten ohne HTTPS,
            // wo navigator.clipboard nicht bereitsteht.
            function kopiereNotfalls(text) {
                try {
                    const feld = document.createElement('textarea');
                    feld.value = text;
                    feld.setAttribute('readonly', '');
                    feld.style.position = 'fixed';
                    feld.style.top = '-1000px';
                    document.body.appendChild(feld);
                    feld.select();
                    const ok = document.execCommand('copy');
                    document.body.removeChild(feld);
                    return ok;
                } catch (e) {
                    return false;
                }
            }

            if (navigator.clipboard && window.isSecureContext) {
                navigator.clipboard.writeText(email)
                    .then(() => meldung(true))
                    .catch(() => meldung(kopiereNotfalls(email)));
            } else {
                meldung(kopiereNotfalls(email));
            }
        });
    }
    // --- Konsole ---
    const terminalTexts = {
        whoami: {
            de: 'Emin Girimhanov. Student der Wirtschaftsinformatik an der OVGU Magdeburg (IT-Sicherheit & Data Science), Werkstudent bei der Falcos GmbH, Übungsleiter für Software Engineering, e-fellows.net-Stipendiat.',
            en: 'Emin Girimhanov. Business informatics student at OVGU Magdeburg (IT security & data science), working student at Falcos GmbH, teaching assistant for Software Engineering, e-fellows.net scholar.'
        },
        projekte: {
            de: 'Projekte:\n • Autohaus Kleinjena: https://autohaus-kleinjena.netlify.app/\n • OSCAR Semesterplaner: https://github.com/emin-girimhanov/oscar-discord-bot\n • FIM Schulung: https://fim-schulung.de/\n • Autonomer Mähroboter (Raspberry Pi, Python, 3D-Druck)\n • Schulcampus-Modell 1:150 (Sonderpreis für Digitalisierung)\n • E-Woche-Portal: https://github.com/emin-girimhanov/e-week-mentor-website\n • Homelab mit Proxmox',
            en: 'Projects:\n • Autohaus Kleinjena: https://autohaus-kleinjena.netlify.app/\n • OSCAR semester planner: https://github.com/emin-girimhanov/oscar-discord-bot\n • FIM Schulung: https://fim-schulung.de/\n • Autonomous lawn mower (Raspberry Pi, Python, 3D printing)\n • School campus model 1:150 (digitalization award)\n • Orientation week portal: https://github.com/emin-girimhanov/e-week-mentor-website\n • Proxmox homelab'
        },
        skills: {
            de: 'Programmierung: Java, Python, HTML/CSS/JavaScript, SQL, Git\nSelf-Hosting: Proxmox VE, n8n, Nextcloud, Paperless-ngx, Stirling-PDF, Firefly III, SearXNG\nVerwaltung: FIM-Methodenexperte (2025), FIM-Informationsmanager, XÖV-Modellierung\nSonstiges: Certified ScrumMaster (2025), CAD & 3D-Druck (FDM)\nSprachen: Deutsch (Muttersprache), Englisch (kommunikationssicher)',
            en: 'Programming: Java, Python, HTML/CSS/JavaScript, SQL, Git\nSelf-hosting: Proxmox VE, n8n, Nextcloud, Paperless-ngx, Stirling-PDF, Firefly III, SearXNG\nPublic sector: FIM method expert (2025), FIM information manager, XÖV modelling\nOther: Certified ScrumMaster (2025), CAD & 3D printing (FDM)\nLanguages: German (native), English (fluent)'
        },
        erfahrung: {
            de: 'seit 10/2026  Übungsleiter Software Engineering, OVGU\nseit 06/2025  Werkstudent Softwareentwicklung, Falcos GmbH (XÖV, ZUGFeRD)\nseit 04/2025  SIDUM e.V., Ressort Finanzen & Recht\nseit 03/2025  Stellvertreter im Fachschaftsrat FIN\nseit 10/2024  B.Sc. Wirtschaftsinformatik, OVGU Magdeburg (schneller als der Regelstudienplan)\n     06/2024  Abitur, CJD Droyßig',
            en: 'since 10/2026  Teaching assistant Software Engineering, OVGU\nsince 06/2025  Working student software development, Falcos GmbH (XÖV, ZUGFeRD)\nsince 04/2025  SIDUM e.V., finance & legal\nsince 03/2025  Deputy, FIN student council\nsince 10/2024  B.Sc. Business Informatics, OVGU Magdeburg (ahead of the standard study plan)\n      06/2024  Abitur, CJD Droyßig'
        },
        engagement: {
            de: 'Ehrenamt:\n • Fachschaftsrat FIN: Erstsemesterwochen im Winter- und Sommersemester (150+ und 80+ Studierende), IT-Administration, Wiki\n • CJD Droyßig: Klassensprecher\n\nFachlich:\n • SIDUM e.V.: Workshop mit d-fine, PwC GenAI Masterclass',
            en: 'Volunteering:\n • FIN student council: orientation weeks in winter and summer (150+ and 80+ students), IT administration, wiki\n • CJD Droyßig: class representative\n\nProfessional:\n • SIDUM e.V.: workshop with d-fine, PwC GenAI Masterclass'
        },
        ewoche: {
            de: 'E-Woche der Fakultät für Informatik:\n • Koordination für den Fachschaftsrat FIN, Winter- und Sommersemester\n • 150+ Erstis im Winter, 80+ im Sommer\n • bis zu 20 Freiwillige, eigenes Portal für Mentor:innen und Helfende\n • Campusrallye (Passierschein A38), Stundenplanbau, Stadtrallye, Party\n • Motto eines Impulses: "Dare to have fun"',
            en: 'Orientation week of the Faculty of Computer Science:\n • coordinated for the FIN student council, winter and summer semester\n • 150+ students in winter, 80+ in summer\n • up to 20 volunteers, my own portal for mentors and helpers\n • campus rally (permit A38), timetable building, city rally, party\n • motto of one talk: "Dare to have fun"'
        },
        interessen: {
            de: "Prozessautomatisierung mit n8n und LLMs, digitale Souveränität Europas, Finanzbildung (Finanztip, Finanzfluss), IT-Podcasts (Kuketz, c't 3003).",
            en: "Process automation with n8n and LLMs, European digital sovereignty, financial literacy (Finanztip, Finanzfluss), IT podcasts (Kuketz, c't 3003)."
        },
        help: {
            de: 'Befehle: whoami, projekte, ewoche, skills, erfahrung, engagement, interessen, kontakt, impressum, clear',
            en: 'Commands: whoami, projects, ewoche, skills, experience, engagement, interests, contact, impressum, clear'
        }
    };

    const aliasMap = {
        about: 'whoami', profil: 'whoami', profile: 'whoami',
        projects: 'projekte', webseiten: 'projekte', websites: 'projekte',
        kenntnisse: 'skills', tech: 'skills', stack: 'skills', zertifikate: 'skills',
        experience: 'erfahrung', werdegang: 'erfahrung', cv: 'erfahrung',
        ehrenamt: 'engagement', 'e-woche': 'ewoche', ersti: 'ewoche', erstis: 'ewoche', orientation: 'ewoche', sidum: 'engagement', farafin: 'engagement',
        interests: 'interessen', hobbys: 'interessen', podcasts: 'interessen',
        contact: 'kontakt', email: 'kontakt', mail: 'kontakt',
        imprint: 'impressum', legal: 'impressum',
        privacy: 'datenschutz', dsgvo: 'datenschutz',
        hilfe: 'help', '?': 'help', ls: 'help'
    };

    function commandText(cmd) {
        const lang = currentLang;
        if (cmd === 'kontakt') {
            return (lang === 'de' ? 'Kontakt:' : 'Contact:') +
                '\n • E-Mail: ' + mailAddr() +
                '\n • Signal: emingirimhanov.01' +
                '\n • Mastodon: https://machteburch.social/@emin' +
                '\n • LinkedIn: https://www.linkedin.com/in/emin-girimhanov/' +
                '\n • GitHub: https://github.com/emin-girimhanov';
        }
        if (cmd === 'impressum' || cmd === 'datenschutz') {
            setTimeout(() => { window.location.href = cmd + '.html'; }, 700);
            return (lang === 'de' ? 'Öffne ' : 'Opening ') + cmd + '.html ...';
        }
        const entry = terminalTexts[cmd];
        return entry ? entry[lang] : null;
    }

    const terminalInput = document.getElementById('terminal-input');
    const terminalOutput = document.getElementById('terminal-output');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let typingTimer = null;

    // Screenreader-Meldung: eine Ansage pro Befehl statt pro Zeichen.
    let liveRegion = null;
    function announce(message) {
        if (!liveRegion) {
            liveRegion = document.createElement('div');
            liveRegion.className = 'sr-only';
            liveRegion.setAttribute('aria-live', 'polite');
            document.body.appendChild(liveRegion);
        }
        liveRegion.textContent = message;
    }

    function runCommand(input) {
        if (!terminalOutput) return;
        const raw = input.trim().toLowerCase();

        if (typingTimer) { clearInterval(typingTimer); typingTimer = null; }

        if (raw === 'clear') {
            terminalOutput.replaceChildren();
            return;
        }

        const line = document.createElement('p');
        const prompt = document.createElement('span');
        prompt.className = 't-prompt';
        prompt.textContent = 'emin@ovgu:~$';
        line.append(prompt, ' ' + raw);
        terminalOutput.appendChild(line);
        if (raw === '') return;

        const cmd = aliasMap[raw] || raw;
        const text = commandText(cmd) || (currentLang === 'de'
            ? `Befehl '${raw}' unbekannt. Tippe 'help'.`
            : `Command '${raw}' not found. Type 'help'.`);

        const result = document.createElement('p');
        result.className = 't-result';
        terminalOutput.appendChild(result);

        // Schreibanimation, Zeichen fuer Zeichen. Laeuft bewusst auch bei
        // reduzierter Bewegung: es bewegt sich nichts ueber den Bildschirm.
        const cursor = document.createElement('span');
        cursor.className = 'terminal-cursor';
        cursor.textContent = '▌';
        result.appendChild(cursor);
        let i = 0;
        typingTimer = setInterval(() => {
            if (i < text.length) {
                cursor.before(text.charAt(i));
                i += 1;
                terminalOutput.scrollTop = terminalOutput.scrollHeight;
            } else {
                clearInterval(typingTimer);
                typingTimer = null;
                cursor.remove();
                announce(text);
            }
        }, 13);
    }

    if (terminalInput) {
        terminalInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                runCommand(terminalInput.value);
                terminalInput.value = '';
            }
        });
    }

    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.addEventListener('click', () => runCommand(btn.dataset.cmd));
    });

    // Sobald die Konsole sichtbar ist, tippt sie einmal von selbst "whoami".
    if (terminalOutput && 'IntersectionObserver' in window) {
        const autoRun = new IntersectionObserver(entries => {
            if (entries.some(e => e.isIntersecting)) {
                autoRun.disconnect();
                setTimeout(() => { if (!typingTimer) runCommand('whoami'); }, 400);
            }
        }, { threshold: 0.5 });
        autoRun.observe(terminalOutput);
    }

    // --- Einblenden beim Scrollen ---
    if ('IntersectionObserver' in window && !reduceMotion.matches) {
        document.documentElement.classList.add('js-reveal');
        const revealTargets = document.querySelectorAll('.project, .cv li, .facts, #ueber-mich p, .terminal, .ewoche-figure');
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { rootMargin: '0px 0px -8% 0px' });
        revealTargets.forEach(el => {
            el.classList.add('reveal');
            observer.observe(el);
        });
    }

    // --- Werdegang: Linie waechst beim Scrollen mit ---
    const cvWrap = document.querySelector('.cv-wrap');
    const cvProgress = document.getElementById('cv-progress');
    const cvItems = document.querySelectorAll('.cv li');

    function updateTimeline() {
        if (!cvWrap || !cvProgress) return;
        const rect = cvWrap.getBoundingClientRect();
        const mark = window.innerHeight * 0.65;
        const ratio = Math.max(0, Math.min(1, (mark - rect.top) / rect.height));
        cvProgress.style.height = (ratio * 100) + '%';
        cvItems.forEach(item => {
            item.classList.toggle('active', item.getBoundingClientRect().top + 12 < mark);
        });
    }

    // --- Zurueck nach oben ---
    // Erscheint nach 600 px, verschwindet unter 400 px. Die Luecke verhindert Flackern.
    const backToTop = document.getElementById('back-to-top');

    function updateBackToTop() {
        if (!backToTop) return;
        const y = window.scrollY;
        const shown = backToTop.classList.contains('is-visible');
        if (!shown && y > 600) {
            backToTop.hidden = false;
            void backToTop.offsetWidth; // Frame erzwingen, damit der Uebergang laeuft
            backToTop.classList.add('is-visible');
        } else if (shown && y < 400) {
            backToTop.classList.remove('is-visible');
        }
    }

    if (backToTop) {
        backToTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: reduceMotion.matches ? 'auto' : 'smooth' });
            // Fokus an den Seitenanfang, damit Tastatur und Screenreader folgen
            const top = document.getElementById('top');
            if (top) {
                top.setAttribute('tabindex', '-1');
                top.focus({ preventScroll: true });
            }
        });
        backToTop.addEventListener('transitionend', (e) => {
            if (e.propertyName === 'opacity' && !backToTop.classList.contains('is-visible')) {
                backToTop.hidden = true;
            }
        });
    }

    let ticking = false;
    window.addEventListener('scroll', () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
            updateTimeline();
            updateBackToTop();
            ticking = false;
        });
    }, { passive: true });
    window.addEventListener('resize', updateTimeline);
    updateTimeline();
    updateBackToTop();

    // --- Bildansicht ---
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const hasDialog = lightbox && lightboxImg && typeof lightbox.showModal === 'function';
    document.querySelectorAll('[data-lightbox]').forEach(btn => {
        btn.addEventListener('click', () => {
            const img = btn.querySelector('img');
            if (!hasDialog) {
                // Aeltere Browser ohne <dialog>: Bild in neuem Tab
                window.open(img.src, '_blank', 'noopener');
                return;
            }
            lightboxImg.src = img.src;
            lightboxImg.alt = img.alt;
            lightbox.showModal();
        });
    });
    if (hasDialog) {
        // Klick neben das Bild schliesst
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) lightbox.close();
        });
    }

    // --- Navigation: aktuellen Abschnitt markieren ---
    const navLinks = [...document.querySelectorAll('.nav a[href^="#"]')];
    const navSections = navLinks.map(a => document.getElementById(a.getAttribute('href').slice(1)));

    function updateNav() {
        const mark = window.innerHeight * 0.4;
        let current = -1;
        navSections.forEach((sec, idx) => {
            if (sec && sec.getBoundingClientRect().top <= mark) current = idx;
        });
        // Ganz unten zaehlt der letzte Abschnitt, auch wenn er kurz ist
        if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
            current = navSections.length - 1;
        }
        navLinks.forEach((a, idx) => {
            a.classList.toggle('active', idx === current);
            if (idx === current) a.setAttribute('aria-current', 'location');
            else a.removeAttribute('aria-current');
        });
    }
    window.addEventListener('scroll', updateNav, { passive: true });
    updateNav();
});
