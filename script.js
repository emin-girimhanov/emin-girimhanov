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
            de: 'Emin Girimhanov. Student der Wirtschaftsinformatik an der OVGU Magdeburg (IT-Sicherheit & Data Science), Werkstudent bei der Falcos GmbH, Übungsleiter für Software Engineering & IT-Projektmanagement, Stipendiat der Stiftung der Deutschen Wirtschaft (sdw) und von e-fellows.net.',
            en: 'Emin Girimhanov. Business informatics student at OVGU Magdeburg (IT security & data science), working student at Falcos GmbH, teaching assistant for Software Engineering & IT-Projektmanagement, scholar of the Foundation of German Business (sdw) and e-fellows.net.'
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
            de: 'seit 10/2026  Übungsleiter Software Engineering & IT-Projektmanagement, OVGU\nseit 06/2025  Werkstudent Softwareentwicklung, Falcos GmbH (XÖV, ZUGFeRD)\nseit 04/2025  SIDUM e.V., Ressort Finanzen & Recht\nseit 03/2025  Stellvertreter im Fachschaftsrat FIN\nseit 10/2024  B.Sc. Wirtschaftsinformatik, OVGU Magdeburg (schneller als der Regelstudienplan)\n     06/2024  Abitur, CJD Droyßig',
            en: 'since 10/2026  Teaching assistant Software Engineering & IT-Projektmanagement, OVGU\nsince 06/2025  Working student software development, Falcos GmbH (XÖV, ZUGFeRD)\nsince 04/2025  SIDUM e.V., finance & legal\nsince 03/2025  Deputy, FIN student council\nsince 10/2024  B.Sc. Business Informatics, OVGU Magdeburg (ahead of the standard study plan)\n      06/2024  Abitur, CJD Droyßig'
        },
        engagement: {
            de: 'Ehrenamt:\n • Fachschaftsrat FIN: Erstsemesterwochen im Winter- und Sommersemester (150+ und 80+ Studierende), IT-Administration, Wiki\n • CJD Droyßig: Klassensprecher\n\nFachlich:\n • SIDUM e.V.: Workshop mit d-fine, PwC GenAI Masterclass',
            en: 'Volunteering:\n • FIN student council: orientation weeks in winter and summer (150+ and 80+ students), IT administration, wiki\n • CJD Droyßig: class representative\n\nProfessional:\n • SIDUM e.V.: workshop with d-fine, PwC GenAI Masterclass'
        },
        ewoche: {
            de: 'E-Woche der Fakultät für Informatik:\n • Koordination für den Fachschaftsrat FIN, Winter- und Sommersemester\n • 150+ Erstis im Winter, 80+ im Sommer\n • bis zu 20 Freiwillige, eigenes Portal für Mentor:innen und Helfende\n • Campusrallye (Passierschein A38), Stundenplanbau, Stadtrallye, Party\n • Di.Day, Spieleabend, Instaparty, Abschlussgrillen\n • Programm: https://farafin.de/erstsemester/e-woche/',
            en: 'Orientation week of the Faculty of Computer Science:\n • coordinated for the FIN student council, winter and summer semester\n • 150+ students in winter, 80+ in summer\n • up to 20 volunteers, my own portal for mentors and helpers\n • campus rally (permit A38), timetable building, city rally, party\n • Di.Day, games night, party, closing barbecue\n • Programme: https://farafin.de/erstsemester/e-woche/'
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

    // Versteckte Befehle: stehen weder in 'help' noch auf den Knoepfen.
    let reprintCampus = null;
    const easterEggs = {
        a38: {
            de: 'Antrag auf Passierschein A38 wird bearbeitet …\n → Schalter 1: Bitte Formular blau ausfüllen.\n → Schalter 2: Zuständig ist Etage 3.\n → Etage 3: Ohne Stempel von Schalter 1 geht da nichts.\n → Schalter 1: Bitte Formular blau ausfüllen.\n → …\nFehler: Endlosschleife in der Verwaltung erkannt.\n\nZweiter Versuch, digital: Antrag online gestellt, Daten als XÖV-Nachricht übertragen, Bescheid nach 0,3 Sekunden.\nSo sollte Verwaltung laufen.',
            en: 'Processing application for permit A38 …\n → Desk 1: Please fill in the blue form.\n → Desk 2: Floor 3 is responsible.\n → Floor 3: Not without a stamp from desk 1.\n → Desk 1: Please fill in the blue form.\n → …\nError: infinite loop detected in public administration.\n\nSecond attempt, digital: applied online, data sent as an XÖV message, decision after 0.3 seconds.\nThat is how administration should work.'
        },
        druck: {
            de: 'Druckauftrag gesendet: campus_droyssig.gcode\nMaßstab 1:150, PLA weiß, Schichthöhe 0,2 mm.\nDrucker startet, nach oben scrollen …',
            en: 'Print job sent: campus_droyssig.gcode\nScale 1:150, white PLA, layer height 0.2 mm.\nPrinter starting, scrolling up …'
        },
        sudo: {
            de: 'emin is not in the sudoers file. Dieser Vorfall wird dem Fachschaftsrat gemeldet.',
            en: 'emin is not in the sudoers file. This incident will be reported to the student council.'
        }
    };
    const eggAliases = {
        'passierschein a38': 'a38', 'passierschein': 'a38', 'permit a38': 'a38',
        print: 'druck', drucken: 'druck', '3d': 'druck', 'make campus': 'druck'
    };

    function commandText(cmd) {
        const lang = currentLang;
        const egg = cmd.startsWith('sudo') ? 'sudo' : eggAliases[cmd] || (easterEggs[cmd] ? cmd : null);
        if (egg) {
            if (egg === 'druck' && reprintCampus) {
                setTimeout(() => {
                    const top = document.getElementById('top');
                    if (top) top.scrollIntoView({ behavior: reduceMotion.matches ? 'auto' : 'smooth' });
                    reprintCampus();
                }, 1400);
            }
            return easterEggs[egg][lang];
        }
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
        const revealTargets = document.querySelectorAll('.project, .cv li, .facts, #ueber-mich p, .terminal-stage, .ewoche-figure');
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
            lightboxImg.classList.toggle('is-portrait', img.classList.contains('portrait'));
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
    // --- 3D-Ansicht: das echte Campus-Modell (FreeCAD/Blender, als STL exportiert, fuer das Web vereinfacht) ---
    // Eigener kleiner WebGL2-Renderer ohne Bibliothek: Flaechen in Hintergrundfarbe, Kanten als Linien (CAD-Look).
    // Beim Laden "druckt" es sich Schicht fuer Schicht auf. Ohne WebGL2 erscheint ein Foto des Modells.
    (function campusModel() {
        const canvas = document.getElementById('campus-canvas');
        const overlay = document.getElementById('campus-overlay');
        if (!canvas) return;
        const layerLabel = document.getElementById('vp-layer');
        const gl = canvas.getContext('webgl2', { antialias: true, alpha: true, premultipliedAlpha: false });
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

        function fallback() {
            const frame = canvas.parentElement;
            frame.classList.add('is-fallback');
            const img = document.createElement('img');
            img.src = 'assets/img/schulcampus_3d.jpg';
            img.alt = 'Foto des 3D-gedruckten Campus-Modells';
            img.className = 'viewport-fallback';
            frame.appendChild(img);
        }
        if (!gl) { fallback(); return; }

        const vs = `#version 300 es
            in vec3 aPos;
            uniform mat4 uMvp;
            uniform float uExtent;
            out vec3 vPos;
            void main() {
                vec3 p = aPos * uExtent;
                vPos = p;
                gl_Position = uMvp * vec4(p, 1.0);
            }`;
        const fsFace = `#version 300 es
            precision highp float;
            in vec3 vPos;
            uniform float uCut;
            uniform vec3 uBg, uInk, uAccent, uLight;
            out vec4 o;
            void main() {
                if (vPos.y > uCut) discard;
                vec3 n = normalize(cross(dFdx(vPos), dFdy(vPos)));
                float l = abs(dot(n, uLight));
                vec3 c = mix(uBg, uInk, 0.03 + 0.10 * (1.0 - l));
                if (uCut - vPos.y < 0.7) c = mix(c, uAccent, 0.55);
                o = vec4(c, 1.0);
            }`;
        const fsLine = `#version 300 es
            precision highp float;
            in vec3 vPos;
            uniform float uCut;
            uniform vec4 uColor;
            out vec4 o;
            void main() {
                if (vPos.y > uCut) discard;
                o = uColor;
            }`;

        function program(vsrc, fsrc) {
            const p = gl.createProgram();
            [[gl.VERTEX_SHADER, vsrc], [gl.FRAGMENT_SHADER, fsrc]].forEach(([type, src]) => {
                const s = gl.createShader(type);
                gl.shaderSource(s, src);
                gl.compileShader(s);
                gl.attachShader(p, s);
            });
            gl.bindAttribLocation(p, 0, 'aPos');
            gl.linkProgram(p);
            if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
            const u = {};
            ['uMvp', 'uExtent', 'uCut', 'uBg', 'uInk', 'uAccent', 'uLight', 'uColor'].forEach(n => { u[n] = gl.getUniformLocation(p, n); });
            return { p, u };
        }

        let progFace, progLine;
        try {
            progFace = program(vs, fsFace);
            progLine = program(vs, fsLine);
        } catch (e) { fallback(); return; }

        let model = null;      // { vao, nFaces, nEdges, extent, maxY }
        let helpers = null;    // Raster und Druckebene
        let yaw = 0.45, pitch = 0.62, yawVel = 0;
        let progress = reduce.matches ? 1 : 0;
        let dragging = false, lastX = 0, lastY = 0, lastInteract = -1e9;
        let visible = true, raf = null, lastT = 0, w = 0, h = 0, dpr = 1;
        let colors = {};

        // CSS-Farbe -> [r, g, b] (0..1), egal ob Hex, rgb() oder Name
        const probe = document.createElement('canvas').getContext('2d');
        function rgb(css) {
            probe.fillStyle = '#000';
            probe.fillStyle = css;
            const v = probe.fillStyle;
            if (v[0] === '#') return [1, 3, 5].map(i => parseInt(v.slice(i, i + 2), 16) / 255);
            return v.match(/[\d.]+/g).slice(0, 3).map(x => x / 255);
        }
        function readColors() {
            const cs = getComputedStyle(document.documentElement);
            const get = (name, def) => cs.getPropertyValue(name).trim() || def;
            colors = {
                bg: rgb(get('--bg', '#fbfaf7')),
                text: rgb(get('--text', '#1d1d1b')),
                muted: rgb(get('--muted', '#63615b')),
                accent: rgb(get('--accent', '#1f5c99')),
                mutedCss: get('--muted', '#63615b'),
                accentCss: get('--accent', '#1f5c99'),
                mono: get('--mono', 'monospace')
            };
        }

        function buffer(target, data) {
            const b = gl.createBuffer();
            gl.bindBuffer(target, b);
            gl.bufferData(target, data, gl.STATIC_DRAW);
            return b;
        }

        function load() {
            fetch('assets/model/campus.bin')
                .then(r => { if (!r.ok) throw new Error(r.status); return r.arrayBuffer(); })
                .then(buf => {
                    const head = new Uint32Array(buf, 4, 3);
                    const nv = head[0], nf = head[1], ne = head[2];
                    const inv = new Float32Array(buf, 16, 1)[0];
                    let off = 20;
                    const pos = new Int16Array(buf, off, nv * 3);
                    off += nv * 6; off += (4 - (off % 4)) % 4;
                    const faces = new Uint16Array(buf, off, nf * 3);
                    off += nf * 6; off += (4 - (off % 4)) % 4;
                    const edges = new Uint16Array(buf, off, ne * 2);

                    let maxY = 0;
                    for (let i = 1; i < pos.length; i += 3) maxY = Math.max(maxY, pos[i]);
                    const extent = 32767 * inv;

                    const vao = gl.createVertexArray();
                    gl.bindVertexArray(vao);
                    buffer(gl.ARRAY_BUFFER, pos);
                    gl.enableVertexAttribArray(0);
                    gl.vertexAttribPointer(0, 3, gl.SHORT, true, 0, 0);
                    const faceBuf = buffer(gl.ELEMENT_ARRAY_BUFFER, faces);
                    gl.bindVertexArray(null);
                    const edgeBuf = buffer(gl.ELEMENT_ARRAY_BUFFER, edges);

                    let maxX = 0, maxZ = 0;
                    for (let i = 0; i < pos.length; i += 3) {
                        maxX = Math.max(maxX, Math.abs(pos[i]));
                        maxZ = Math.max(maxZ, Math.abs(pos[i + 2]));
                    }
                    model = { vao, faceBuf, edgeBuf, nFaces: nf * 3, nEdges: ne * 2, extent,
                        maxY: maxY * inv, halfX: maxX * inv, halfZ: maxZ * inv };
                    buildHelpers();
                    canvas.parentElement.classList.add('is-ready');
                    start();
                })
                .catch(fallback);
        }

        // Bodenraster (10er-Schritte) und Rahmen der Druckebene als Linien in Weltkoordinaten
        function buildHelpers() {
            const gx = Math.ceil(model.halfX / 10) * 10 + 10, gz = Math.ceil(model.halfZ / 10) * 10 + 10;
            const grid = [];
            for (let x = -gx; x <= gx; x += 10) grid.push(x, 0, -gz, x, 0, gz);
            for (let z = -gz; z <= gz; z += 10) grid.push(-gx, 0, z, gx, 0, z);
            const vao = gl.createVertexArray();
            gl.bindVertexArray(vao);
            buffer(gl.ARRAY_BUFFER, new Float32Array(grid));
            gl.enableVertexAttribArray(0);
            gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);
            const plane = gl.createVertexArray();
            gl.bindVertexArray(plane);
            const px = model.halfX + 4, pz = model.halfZ + 4;
            buffer(gl.ARRAY_BUFFER, new Float32Array([-px, 0, -pz, px, 0, -pz, px, 0, pz, -px, 0, pz]));
            gl.enableVertexAttribArray(0);
            gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);
            gl.bindVertexArray(null);
            helpers = { grid: vao, gridCount: grid.length / 3, plane };
        }

        // 4x4-Matrizen (Spaltenreihenfolge)
        function perspective(fovy, aspect, near, far) {
            const f = 1 / Math.tan(fovy / 2), nf = 1 / (near - far);
            return [f / aspect, 0, 0, 0, 0, f, 0, 0, 0, 0, (far + near) * nf, -1, 0, 0, 2 * far * near * nf, 0];
        }
        function mul(a, b) {
            const o = new Array(16);
            for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) {
                let s = 0;
                for (let k = 0; k < 4; k++) s += a[k * 4 + r] * b[c * 4 + k];
                o[c * 4 + r] = s;
            }
            return o;
        }
        function view(dist, targetY) {
            const cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
            // Rotation um Y (yaw), dann um X (pitch), dann Kamera zurueck
            const ry = [cy, 0, -sy, 0, 0, 1, 0, 0, sy, 0, cy, 0, 0, 0, 0, 1];
            const rx = [1, 0, 0, 0, 0, cp, sp, 0, 0, -sp, cp, 0, 0, 0, 0, 1];
            const t = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, -targetY, 0, 1];
            const back = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, -dist, 1];
            return mul(back, mul(rx, mul(ry, t)));
        }

        function resize() {
            const r = canvas.getBoundingClientRect();
            dpr = Math.min(window.devicePixelRatio || 1, 2);
            w = r.width; h = r.height;
            [canvas, overlay].forEach(c => {
                if (!c) return;
                c.width = Math.round(w * dpr);
                c.height = Math.round(h * dpr);
            });
            draw();
        }

        function draw() {
            if (!w || !h) return;
            gl.viewport(0, 0, canvas.width, canvas.height);
            gl.clearColor(0, 0, 0, 0);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            drawOverlay();
            if (!model) return;

            const eased = 1 - Math.pow(1 - progress, 3);
            const cut = progress >= 1 ? 1e9 : eased * (model.maxY + 0.01);
            const radius = Math.hypot(model.halfX, model.halfZ);
            const aspect = w / h;
            const fov = 0.5;
            const dist = (radius * 1.05) / Math.tan(fov / 2) / Math.min(1, aspect * 0.9);
            const mvp = mul(perspective(fov, aspect, dist * 0.2, dist * 4), view(dist, model.maxY * 0.25));
            const light = [0.35, 0.85, 0.4];

            gl.enable(gl.DEPTH_TEST);
            gl.enable(gl.BLEND);
            gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

            // Raster
            gl.useProgram(progLine.p);
            gl.uniformMatrix4fv(progLine.u.uMvp, false, mvp);
            gl.uniform1f(progLine.u.uExtent, 1);
            gl.uniform1f(progLine.u.uCut, 1e9);
            gl.uniform4f(progLine.u.uColor, ...colors.muted, 0.16);
            gl.depthMask(false);
            gl.bindVertexArray(helpers.grid);
            gl.drawArrays(gl.LINES, 0, helpers.gridCount);
            gl.depthMask(true);

            // Flaechen, leicht nach hinten versetzt, damit die Kanten sauber obenauf liegen
            gl.useProgram(progFace.p);
            gl.uniformMatrix4fv(progFace.u.uMvp, false, mvp);
            gl.uniform1f(progFace.u.uExtent, model.extent);
            gl.uniform1f(progFace.u.uCut, cut);
            gl.uniform3f(progFace.u.uBg, ...colors.bg);
            gl.uniform3f(progFace.u.uInk, ...colors.text);
            gl.uniform3f(progFace.u.uAccent, ...colors.accent);
            gl.uniform3f(progFace.u.uLight, ...light.map(v => v / Math.hypot(...light)));
            gl.enable(gl.POLYGON_OFFSET_FILL);
            gl.polygonOffset(1.5, 2);
            gl.bindVertexArray(model.vao);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.faceBuf);
            gl.drawElements(gl.TRIANGLES, model.nFaces, gl.UNSIGNED_SHORT, 0);
            gl.disable(gl.POLYGON_OFFSET_FILL);

            // Kanten
            gl.useProgram(progLine.p);
            gl.uniformMatrix4fv(progLine.u.uMvp, false, mvp);
            gl.uniform1f(progLine.u.uExtent, model.extent);
            gl.uniform1f(progLine.u.uCut, cut);
            gl.uniform4f(progLine.u.uColor, ...colors.text, 0.78);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.edgeBuf);
            gl.drawElements(gl.LINES, model.nEdges, gl.UNSIGNED_SHORT, 0);
            gl.bindVertexArray(null);
            // Index-Puffer des VAO wiederherstellen
            gl.bindVertexArray(model.vao);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.faceBuf);
            gl.bindVertexArray(null);

            // Druckebene
            if (progress < 1) {
                gl.uniform1f(progLine.u.uExtent, 1);
                gl.uniform1f(progLine.u.uCut, 1e9);
                gl.uniformMatrix4fv(progLine.u.uMvp, false, mul(mvp, [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, cut, 0, 1]));
                gl.uniform4f(progLine.u.uColor, ...colors.accent, 0.8);
                gl.bindVertexArray(helpers.plane);
                gl.drawArrays(gl.LINE_LOOP, 0, 4);
                gl.bindVertexArray(null);
            }

            if (layerLabel) {
                layerLabel.textContent = progress < 1
                    ? (currentLang === 'de' ? 'DRUCK ' : 'PRINT ') + String(Math.round(eased * 100)).padStart(3, ' ') + ' %'
                    : 'STL · ' + Math.round(model.nFaces / 3 / 1000) + 'K ' + (currentLang === 'de' ? 'DREIECKE' : 'TRIANGLES');
            }
        }

        // Achsenkreuz unten links (2D-Ebene ueber dem WebGL-Bild)
        function drawOverlay() {
            if (!overlay) return;
            const ctx = overlay.getContext('2d');
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            ctx.clearRect(0, 0, w, h);
            const cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
            const ox = 34, oy = h - 34, len = 18;
            ctx.font = '10px ' + colors.mono;
            [[[1, 0, 0], 'x'], [[0, 1, 0], 'y'], [[0, 0, -1], 'z']].forEach(([d, name]) => {
                const x1 = d[0] * cy + d[2] * sy;
                const z1 = -d[0] * sy + d[2] * cy;
                const y2 = d[1] * cp - z1 * sp;
                const ex = ox + x1 * len, ey = oy - y2 * len;
                ctx.strokeStyle = ctx.fillStyle = name === 'y' ? colors.accentCss : colors.mutedCss;
                ctx.lineWidth = 1.2;
                ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(ex, ey); ctx.stroke();
                ctx.fillText(name, ex + (x1 >= 0 ? 3 : -9), ey - 3);
            });
        }

        function frame(t) {
            raf = null;
            const dt = Math.min(0.05, (t - (lastT || t)) / 1000);
            lastT = t;
            let animating = false;
            if (model && progress < 1) {
                progress = Math.min(1, progress + dt / 3.6);
                animating = true;
            }
            if (!dragging) {
                const idle = t - lastInteract > 2500;
                if (Math.abs(yawVel) > 0.0005) { yaw += yawVel; yawVel *= 0.94; animating = true; }
                else if (!reduce.matches && idle) { yaw += dt * 0.1; animating = true; }
                else if (!idle) animating = true;
            }
            draw();
            if (animating && visible && !document.hidden) raf = requestAnimationFrame(frame);
        }
        function start() {
            if (!raf && visible && !document.hidden) { lastT = 0; raf = requestAnimationFrame(frame); }
        }

        canvas.addEventListener('pointerdown', e => {
            dragging = true; lastX = e.clientX; lastY = e.clientY; yawVel = 0;
            canvas.setPointerCapture(e.pointerId);
        });
        canvas.addEventListener('pointermove', e => {
            if (!dragging) return;
            const dx = e.clientX - lastX, dy = e.clientY - lastY;
            lastX = e.clientX; lastY = e.clientY;
            yaw += dx * 0.008;
            yawVel = dx * 0.008;
            if (e.pointerType === 'mouse') pitch = Math.max(0.1, Math.min(1.35, pitch + dy * 0.006));
            lastInteract = performance.now();
            draw();
        });
        const endDrag = () => { if (dragging) { dragging = false; lastInteract = performance.now(); start(); } };
        canvas.addEventListener('pointerup', endDrag);
        canvas.addEventListener('pointercancel', endDrag);
        canvas.addEventListener('keydown', e => {
            const step = { ArrowLeft: [-0.15, 0], ArrowRight: [0.15, 0], ArrowUp: [0, -0.08], ArrowDown: [0, 0.08] }[e.key];
            if (!step) return;
            e.preventDefault();
            yaw += step[0];
            pitch = Math.max(0.1, Math.min(1.35, pitch + step[1]));
            lastInteract = performance.now();
            draw();
        });

        if ('IntersectionObserver' in window) {
            new IntersectionObserver(entries => {
                visible = entries[0].isIntersecting;
                if (visible) start();
            }).observe(canvas);
        }
        document.addEventListener('visibilitychange', start);
        if ('ResizeObserver' in window) new ResizeObserver(resize).observe(canvas);
        else window.addEventListener('resize', resize);
        new MutationObserver(() => { readColors(); draw(); })
            .observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'lang'] });
        if (darkQuery.addEventListener) darkQuery.addEventListener('change', () => { readColors(); draw(); });

        reprintCampus = () => {
            progress = reduce.matches ? 1 : 0;
            lastInteract = -1e9;
            start();
        };

        readColors();
        resize();
        load();
    })();

    // --- Tiefe: Projektbilder kippen, Konsole richtet sich auf, E-Woche-Bild mit Parallaxe ---
    if (!reduceMotion.matches) {
        if (window.matchMedia('(hover: hover)').matches) {
            document.querySelectorAll('.project').forEach(project => {
                const img = project.querySelector('.project-img');
                const btn = project.querySelector('.img-btn');
                if (!img || !btn) return;
                btn.addEventListener('pointermove', e => {
                    const r = btn.getBoundingClientRect();
                    const nx = (e.clientX - r.left) / r.width - 0.5;
                    const ny = (e.clientY - r.top) / r.height - 0.5;
                    project.classList.add('is-tilting');
                    img.style.setProperty('--ry', (nx * 10).toFixed(2) + 'deg');
                    img.style.setProperty('--rx', (-ny * 8).toFixed(2) + 'deg');
                    img.style.setProperty('--sx', (nx * 16).toFixed(1));
                    img.style.setProperty('--sy', (ny * 10).toFixed(1));
                });
                btn.addEventListener('pointerleave', () => {
                    project.classList.remove('is-tilting');
                    ['--rx', '--ry', '--sx', '--sy'].forEach(v => img.style.removeProperty(v));
                });
            });
        }

        const terminal = document.querySelector('.terminal');
        const ewocheImg = document.querySelector('.ewoche-img');
        function updateDepth() {
            const vh = window.innerHeight;
            if (terminal) {
                const r = terminal.getBoundingClientRect();
                // unten im Bild: gekippt, ab 55 % Hoehe: aufrecht
                const t = Math.max(0, Math.min(1, (r.top - vh * 0.55) / (vh * 0.45)));
                terminal.style.setProperty('--tilt', (t * 18).toFixed(2) + 'deg');
            }
            if (ewocheImg) {
                const r = ewocheImg.parentElement.getBoundingClientRect();
                if (r.bottom > 0 && r.top < vh) {
                    const c = (r.top + r.height / 2 - vh / 2) / vh;
                    ewocheImg.style.setProperty('--py', (c * -24).toFixed(1) + 'px');
                }
            }
        }
        let depthTick = false;
        window.addEventListener('scroll', () => {
            if (depthTick) return;
            depthTick = true;
            requestAnimationFrame(() => { updateDepth(); depthTick = false; });
        }, { passive: true });
        updateDepth();
    }
});
