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

    function applyLanguage(lang) {
        currentLang = lang;
        try { localStorage.setItem('site-lang', lang); } catch (e) { /* kein Speicher */ }
        document.documentElement.lang = lang;

        if (langToggleBtn) langToggleBtn.textContent = lang === 'de' ? 'EN' : 'DE';

        document.querySelectorAll('[data-de][data-en]').forEach(el => {
            const text = el.getAttribute(`data-${lang}`);
            if (text !== null) el.replaceChildren(buildSafeFragment(text));
        });

        // Reine Beschriftungen: der Inhalt bleibt unangetastet.
        document.querySelectorAll('[data-de-label][data-en-label]').forEach(el => {
            el.setAttribute('aria-label', el.getAttribute(`data-${lang}-label`));
        });
    }

    if (langToggleBtn) {
        langToggleBtn.addEventListener('click', () => applyLanguage(currentLang === 'de' ? 'en' : 'de'));
    }

    if (currentLang !== 'de') applyLanguage(currentLang);

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
            de: 'Ehrenamt:\n • Fachschaftsrat FIN: zwei Erstsemesterwochen (150 und 80 Studierende), IT-Administration, Wiki\n • CJD Droyßig: Klassensprecher\n\nFachlich:\n • SIDUM e.V.: Workshop mit d-fine, PwC GenAI Masterclass',
            en: 'Volunteering:\n • FIN student council: two orientation weeks (150 and 80 students), IT administration, wiki\n • CJD Droyßig: class representative\n\nProfessional:\n • SIDUM e.V.: workshop with d-fine, PwC GenAI Masterclass'
        },
        interessen: {
            de: "Prozessautomatisierung mit n8n und LLMs, digitale Souveränität Europas, Finanzbildung (Finanztip, Finanzfluss), IT-Podcasts (Kuketz, c't 3003).",
            en: "Process automation with n8n and LLMs, European digital sovereignty, financial literacy (Finanztip, Finanzfluss), IT podcasts (Kuketz, c't 3003)."
        },
        help: {
            de: 'Befehle: whoami, projekte, skills, erfahrung, engagement, interessen, kontakt, impressum, clear',
            en: 'Commands: whoami, projects, skills, experience, engagement, interests, contact, impressum, clear'
        }
    };

    const aliasMap = {
        about: 'whoami', profil: 'whoami', profile: 'whoami',
        projects: 'projekte', webseiten: 'projekte', websites: 'projekte',
        kenntnisse: 'skills', tech: 'skills', stack: 'skills', zertifikate: 'skills',
        experience: 'erfahrung', werdegang: 'erfahrung', cv: 'erfahrung',
        ehrenamt: 'engagement', sidum: 'engagement', farafin: 'engagement',
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

        if (reduceMotion.matches) {
            result.textContent = text;
            terminalOutput.scrollTop = terminalOutput.scrollHeight;
            announce(text);
            return;
        }

        // Schreibanimation, schnell genug zum Mitlesen
        const cursor = document.createElement('span');
        cursor.className = 'terminal-cursor';
        cursor.textContent = '▌';
        result.appendChild(cursor);
        let i = 0;
        typingTimer = setInterval(() => {
            if (i < text.length) {
                cursor.before(text.slice(i, i + 2));
                i += 2;
                terminalOutput.scrollTop = terminalOutput.scrollHeight;
            } else {
                clearInterval(typingTimer);
                typingTimer = null;
                cursor.remove();
                announce(text);
            }
        }, 12);
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

    // --- Einblenden beim Scrollen ---
    if ('IntersectionObserver' in window && !reduceMotion.matches) {
        document.documentElement.classList.add('js-reveal');
        const revealTargets = document.querySelectorAll('.project, .cv li, .facts, #ueber-mich p, .terminal');
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
});
