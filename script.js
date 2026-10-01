// Force unregister any legacy service workers & clear old browser caches
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(registrations => {
        for (let registration of registrations) {
            registration.unregister();
        }
    });
}
if ('caches' in window) {
    caches.keys().then(names => {
        for (let name of names) {
            caches.delete(name);
        }
    });
}

window.openLightbox = function(src, caption) {
    const lightboxModal = document.getElementById('lightbox-modal');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCaption = document.getElementById('lightbox-caption');
    if (lightboxModal && lightboxImg && lightboxCaption) {
        lightboxImg.src = src;
        lightboxImg.alt = caption || 'Projekt Vorschau';
        lightboxCaption.innerText = caption || '';
        lightboxModal.classList.add('active');
        lightboxModal.setAttribute('aria-hidden', 'false');
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const langToggleBtn = document.getElementById('lang-toggle-btn');
    const langLabel = document.getElementById('lang-label');
    let currentLang = localStorage.getItem('site-lang') || 'de';

    const textExperienceDE = "Erfahrungen & Produkte:\n 1. Falcos GmbH (Werkstudent Public Sector: XÖV-ZUGFeRD-Parser, Top-100-Verwaltungsleistungen des EU Single Digital Gateway)\n 2. OVGU Magdeburg (Übungsleiter Software Engineering, davor Tutor für Algorithmen & Datenstrukturen und Vorkurs Mathematik)\n 3. Autohaus Kleinjena (Eigenentwicklung Web-Portal & Schaufenster: https://autohaus-kleinjena.netlify.app/)\n 4. FIM Schulung (Co-Entwickler E-Learning Plattform im Public Sector: https://fim-schulung.de/)\n 5. Softwareprojekt OSCAR (selbst gewähltes Studienprojekt im Viererteam: modularer Discord-Bot zur Semesterplanung: https://github.com/emin-girimhanov/oscar-discord-bot)\n 6. SIDUM e.V. (Kreditentscheidungs-Use-Cases mit d-fine & PwC GenAI Masterclass)\n 7. Autonomer Mähroboter & CJD Droyßig 3D-Schulcampus (Digitalisierungspreis)";
    const textExperienceEN = "Experience & Products:\n 1. Falcos GmbH (working student, public sector: XÖV-ZUGFeRD parsers, top 100 services of the EU Single Digital Gateway)\n 2. OVGU Magdeburg (teaching assistant for Software Engineering, before that tutor for Algorithms & Data Structures and the maths prep course)\n 3. Autohaus Kleinjena (Full Web Portal & Car Showroom: https://autohaus-kleinjena.netlify.app/)\n 4. FIM Schulung (Co-developer E-Learning Platform Public Sector: https://fim-schulung.de/)\n 5. Software project OSCAR (self-chosen university project, team of four: modular Discord bot for semester planning: https://github.com/emin-girimhanov/oscar-discord-bot)\n 6. SIDUM e.V. (Credit decision models with d-fine & PwC GenAI Masterclass)\n 7. Autonomous Mower & CJD Droyßig 3D School Campus (Digitalization Award)";

    const textWebsitesDE = "Web-Anwendungen:\n • Autohaus Kleinjena: https://autohaus-kleinjena.netlify.app/\n • FIM Schulung: https://fim-schulung.de/\n • Falcos GmbH Public Sector: https://falcos.de/";
    const textWebsitesEN = "Web Applications:\n • Autohaus Kleinjena: https://autohaus-kleinjena.netlify.app/\n • FIM Schulung: https://fim-schulung.de/\n • Falcos GmbH Public Sector: https://falcos.de/";

    const textWhoamiDE = "Emin Girimhanov. B.Sc. Wirtschaftsinformatik-Student @OVGU Magdeburg, Schwerpunkte IT-Sicherheit & Data Science, e-fellows.net Stipendiat, Werkstudent @Falcos GmbH & Übungsleiter für Software Engineering an der FIN OVGU.";
    const textWhoamiEN = "Emin Girimhanov. Business Informatics student @OVGU Magdeburg, focus IT Security & Data Science, e-fellows.net scholar, working student @Falcos GmbH & teaching assistant for Software Engineering at FIN OVGU.";

    const textSkillsDE = "IT: Java, Python, Web (HTML, CSS, JavaScript), SQL & Datenbanken, Git, Proxmox VE (Nextcloud, Paperless-ngx, Stirling-PDF, Firefly III, SearXNG, n8n), 3D-Druck (FDM), XÖV-Modellierung.\nZertifikate: Certified ScrumMaster® (CSM, 2025), FIM-Methodenexperte (2025), FIM-Informationsmanager.\nSprachen: Deutsch (Muttersprache), Englisch (kommunikationssicher).\nInteressen: Prozessautomatisierung (n8n & LLM), Digitale Souveränität Europas, Finanzbildung, IT-Podcasts (Kuketz, c't 3003).";
    const textSkillsEN = "IT: Java, Python, web (HTML, CSS, JavaScript), SQL & databases, Git, Proxmox VE (Nextcloud, Paperless-ngx, Stirling-PDF, Firefly III, SearXNG, n8n), 3D printing (FDM), XÖV modeling.\nCertificates: Certified ScrumMaster® (CSM, 2025), FIM Method Expert (2025), FIM Information Manager.\nLanguages: German (native), English (professional working proficiency).\nInterests: process automation (n8n & LLM), European digital sovereignty, financial literacy, IT podcasts (Kuketz, c't 3003).";

    const textEngagementDE = "Gesellschaftliches Engagement (ehrenamtlich):\n 1. Fachschaftsrat FIN OVGU (Gewählter Stellvertreter: Erstsemesterwochen für 150+ Studierende, IT-Adminreferat, Wiki-Ausbau)\n 2. CJD Droyßig (Gewählter Klassensprecher, 3D-Schulcampus Digitalpreis)\n\nFachliches Engagement:\n 1. SIDUM e.V. (Ressort Finanzen & Recht, PwC GenAI Masterclass, d-fine Kreditentscheidungs-Modelle, JC-NetworkDays)";
    const textEngagementEN = "Community engagement (voluntary):\n 1. Student Council FIN OVGU (Elected Representative: Orientation weeks for 150+ students, IT Administration, Wiki expansion)\n 2. CJD Droyßig (Elected Class Representative, 3D Campus Digitalization Award)\n\nProfessional engagement:\n 1. SIDUM e.V. (Finance & Legal, PwC GenAI Masterclass, d-fine credit decision models, JC-NetworkDays)";

    const textKontaktDE = "Kontakt:\n • E-Mail: emin.girimhanov@posteo.de\n • Signal: emingirimhanov.01\n • Mastodon: https://machteburch.social/@emin\n • LinkedIn: https://www.linkedin.com/in/emin-girimhanov/\n • GitHub: https://github.com/emin-girimhanov";
    const textKontaktEN = "Contact:\n • E-Mail: emin.girimhanov@posteo.de\n • Signal: emingirimhanov.01\n • Mastodon: https://machteburch.social/@emin\n • LinkedIn: https://www.linkedin.com/in/emin-girimhanov/\n • GitHub: https://github.com/emin-girimhanov";

    // Command Aliases Map
    const aliasMap = {
        whoami: 'whoami', about: 'whoami', profil: 'whoami', profile: 'whoami',
        webseiten: 'webseiten', produkte: 'webseiten', autohaus: 'webseiten', fim: 'webseiten', websites: 'webseiten',
        skills: 'skills', kenntnisse: 'skills', tech: 'skills', stack: 'skills', zertifikate: 'skills',
        erfahrung: 'erfahrung', erfahrungen: 'erfahrung', projekte: 'erfahrung', projects: 'erfahrung', experience: 'erfahrung', oscar: 'erfahrung', tutor: 'erfahrung',
        engagement: 'engagement', consulting: 'engagement', sidum: 'engagement', farafin: 'engagement',
        impressum: 'impressum', legal: 'impressum', imprint: 'impressum',
        datenschutz: 'datenschutz', privacy: 'datenschutz', dsgvo: 'datenschutz',
        kontakt: 'kontakt', contact: 'kontakt', email: 'kontakt', mail: 'kontakt', linkedin: 'kontakt'
    };

    let previouslyFocusedElement = null;

    function openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            previouslyFocusedElement = document.activeElement;
            modal.classList.add('active');
            modal.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';

            const closeBtn = modal.querySelector('.modal-close-btn');
            if (closeBtn) {
                setTimeout(() => closeBtn.focus(), 50);
            }
        }
    }

    function closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
            modal.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';

            if (previouslyFocusedElement && typeof previouslyFocusedElement.focus === 'function') {
                previouslyFocusedElement.focus();
            }
        }
    }

    function getCommandText(primaryCmd, lang) {
        if (primaryCmd === 'impressum') {
            setTimeout(() => { window.location.href = 'impressum.html'; }, 700);
            return lang === 'de' ? "Öffne Impressum (impressum.html) ..." : "Opening imprint (impressum.html) ...";
        }

        if (primaryCmd === 'datenschutz') {
            setTimeout(() => { window.location.href = 'datenschutz.html'; }, 700);
            return lang === 'de' ? "Öffne Datenschutzerklärung ..." : "Opening privacy policy ...";
        }

        if (lang === 'de') {
            switch (primaryCmd) {
                case 'whoami': return textWhoamiDE;
                case 'webseiten': return textWebsitesDE;
                case 'skills': return textSkillsDE;
                case 'erfahrung': return textExperienceDE;
                case 'engagement': return textEngagementDE;
                case 'kontakt': return textKontaktDE;
                case 'help': return "Optionen: whoami, webseiten, skills, erfahrung, engagement, impressum, kontakt, clear";
                default: return null;
            }
        } else {
            switch (primaryCmd) {
                case 'whoami': return textWhoamiEN;
                case 'webseiten': return textWebsitesEN;
                case 'skills': return textSkillsEN;
                case 'erfahrung': return textExperienceEN;
                case 'engagement': return textEngagementEN;
                case 'kontakt': return textKontaktEN;
                case 'help': return "Options: whoami, webseiten, skills, experience, engagement, impressum, contact, clear";
                default: return null;
            }
        }
    }

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

    function applyLanguage(lang) {
        currentLang = lang;
        localStorage.setItem('site-lang', lang);
        document.documentElement.lang = lang;

        if (langLabel) {
            langLabel.innerText = lang === 'de' ? 'EN' : 'DE';
        }

        const elements = document.querySelectorAll('[data-de][data-en]');
        elements.forEach(el => {
            const text = el.getAttribute(`data-${lang}`);
            if (text !== null) {
                el.replaceChildren(buildSafeFragment(text));
            }
        });

        const inputs = document.querySelectorAll('[data-de-placeholder][data-en-placeholder]');
        inputs.forEach(input => {
            const placeholder = input.getAttribute(`data-${lang}-placeholder`);
            if (placeholder) {
                const tempDoc = new DOMParser().parseFromString(placeholder, 'text/html');
                input.placeholder = tempDoc.body.textContent;
            }
        });

        // Reine Beschriftungen: Der Inhalt bleibt unangetastet, damit
        // Icon-Knoepfe ihr SVG behalten.
        const labelled = document.querySelectorAll('[data-de-label][data-en-label]');
        labelled.forEach(el => {
            const label = el.getAttribute(`data-${lang}-label`);
            if (label) {
                el.setAttribute('aria-label', label);
                if (el.hasAttribute('title')) el.setAttribute('title', label);
            }
        });
    }

    if (langToggleBtn) {
        langToggleBtn.addEventListener('click', () => {
            const nextLang = currentLang === 'de' ? 'en' : 'de';
            applyLanguage(nextLang);
        });
    }

    applyLanguage(currentLang);

    // --- Mobile Navigation (Burger) ---
    const navToggleBtn = document.getElementById('nav-toggle-btn');
    const navLinks = document.getElementById('nav-links');

    if (navToggleBtn && navLinks) {
        const setNavOpen = (open) => {
            navLinks.classList.toggle('open', open);
            navToggleBtn.setAttribute('aria-expanded', String(open));
            navToggleBtn.setAttribute('aria-label', open ? 'Menü schließen' : 'Menü öffnen');
        };

        navToggleBtn.addEventListener('click', () => {
            setNavOpen(navToggleBtn.getAttribute('aria-expanded') !== 'true');
        });

        // Nach dem Antippen eines Links schliesst sich das Menue wieder.
        navLinks.addEventListener('click', (e) => {
            if (e.target.closest('a')) setNavOpen(false);
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') setNavOpen(false);
        });
    }

    // --- Lightbox: mit Maus UND Tastatur bedienbar (WCAG 2.1.1) ---
    document.querySelectorAll('[data-lightbox]').forEach(el => {
        const show = () => openLightbox(el.dataset.lightbox, el.dataset.lightboxCaption || '');

        if (!el.hasAttribute('aria-label')) {
            const caption = el.dataset.lightboxCaption || el.getAttribute('alt') || 'Bild';
            el.setAttribute('aria-label', caption + ' vergrößern');
        }

        el.addEventListener('click', show);
        el.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                show();
            }
        });
    });

    // Terminal Command Execution
    const terminalInput = document.getElementById('terminal-input');
    const terminalOutput = document.getElementById('terminal-output');
    const presetBtns = document.querySelectorAll('.preset-btn');

    let currentTypingTimer = null;

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

    function runCommand(cmd) {
        const rawCmd = cmd.trim().toLowerCase();
        const inputLine = document.createElement('p');
        inputLine.className = 'terminal-line';
        const mkSpan = (cls, txt) => {
            const el = document.createElement('span');
            el.className = cls;
            el.textContent = txt;
            return el;
        };
        inputLine.append(mkSpan('prompt-user', 'emin'), '@', mkSpan('prompt-host', 'ovgu'),
                         ':', mkSpan('prompt-path', '~'), '$ ', rawCmd);
        terminalOutput.appendChild(inputLine);

        if (rawCmd === 'clear') {
            if (currentTypingTimer) {
                clearInterval(currentTypingTimer);
                currentTypingTimer = null;
            }
            terminalOutput.innerHTML = '';
            return;
        }

        if (rawCmd === '') {
            return;
        }

        const primaryCmd = aliasMap[rawCmd] || rawCmd;
        const responseText = getCommandText(primaryCmd, currentLang) || (currentLang === 'de' 
            ? `Befehl '${rawCmd}' unbekannt. Tippe 'help' für Hilfe.`
            : `Command '${rawCmd}' not found. Type 'help' for options.`);

        const resultLine = document.createElement('div');
        resultLine.className = 'terminal-result';
        terminalOutput.appendChild(resultLine);

        // Smooth & Readable Schreibanimation (1 Zeichen alle 18ms für gut mitlesbares Tippen)
        if (currentTypingTimer) {
            clearInterval(currentTypingTimer);
            currentTypingTimer = null;
        }

        const cursorSpan = document.createElement('span');
        cursorSpan.className = 'terminal-cursor';
        cursorSpan.innerText = ' ▌';
        resultLine.appendChild(cursorSpan);

        let i = 0;
        const chunkSize = 1;
        const speed = 13;   // Millisekunden je Zeichen

        currentTypingTimer = setInterval(() => {
            if (i < responseText.length) {
                const chunk = responseText.substr(i, chunkSize);
                cursorSpan.before(document.createTextNode(chunk));
                i += chunkSize;
                terminalOutput.scrollTop = terminalOutput.scrollHeight;
            } else {
                clearInterval(currentTypingTimer);
                currentTypingTimer = null;
                cursorSpan.remove();
                announce(responseText);
            }
        }, speed);
    }

    if (terminalInput) {
        terminalInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                runCommand(terminalInput.value);
                terminalInput.value = '';
            }
        });
    }

    presetBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const cmd = btn.getAttribute('data-cmd');
            if (terminalInput) {
                terminalInput.value = cmd;
                setTimeout(() => {
                    runCommand(cmd);
                    terminalInput.value = '';
                }, 100);
            } else {
                runCommand(cmd);
            }
        });
    });

    // Portfolio Category Filtering (Supports Multiple Categories)
    const filterBtns = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.getAttribute('data-filter');

            projectCards.forEach(card => {
                const categories = (card.getAttribute('data-category') || '').split(' ');
                if (filter === 'all' || categories.includes(filter)) {
                    card.style.display = 'flex';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });

    // Copy Email to Clipboard
    const copyEmailBtn = document.getElementById('copy-email-btn');
    if (copyEmailBtn) {
        copyEmailBtn.addEventListener('click', () => {
            const email = "emin.girimhanov@posteo.de";

            function meldung(ok) {
                const tooltip = document.getElementById('copy-tooltip');
                if (!tooltip) return;
                if (ok) {
                    tooltip.innerText = currentLang === 'de' ? 'Kopiert! ✓' : 'Copied! ✓';
                    copyEmailBtn.classList.add('copied');
                } else {
                    tooltip.innerText = currentLang === 'de' ? 'Bitte manuell kopieren' : 'Please copy manually';
                }
                setTimeout(() => {
                    tooltip.innerText = currentLang === 'de' ? 'Kopieren' : 'Copy';
                    copyEmailBtn.classList.remove('copied');
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

    // Modal Trigger Listeners
    const closeLightboxBtn = document.getElementById('close-lightbox-btn');
    const closeCaseStudyBtn = document.getElementById('close-case-study-btn');

    if (closeLightboxBtn) closeLightboxBtn.addEventListener('click', () => closeModal('lightbox-modal'));
    if (closeCaseStudyBtn) closeCaseStudyBtn.addEventListener('click', () => closeModal('case-study-modal'));

    // --- Case Study Modals Data Map ---
    const caseStudies = {
        autohaus: {
            title: "Autohaus Kleinjena",
            type: "Webentwicklung",
            badgeClass: "badge-context",
            badgeDE: "Kundenprojekt",
            badgeEN: "Client Project",
            problemDE: "Autohaus Kleinjena hatte keinen eigenen Web-Auftritt. Fahrzeuge sollten sichtbar werden und Kunden sollten Service-Anfragen direkt stellen können.",
            problemEN: "Autohaus Kleinjena had no website of its own. Vehicles needed to be visible, and customers needed a direct way to send service requests.",
            solutionDE: "Konzeption und Entwicklung eines responsiven Web-Portals mit Fahrzeug-Filterung und Modals für Servicetermine. Gehostet auf Netlify.",
            solutionEN: "Designed and built a responsive web portal with vehicle filtering and modals for service appointments. Hosted on Netlify.",
            roleDE: "Full-Stack Webentwickler & Designer (Eigenentwicklung). Tech-Stack: HTML5, CSS3, JavaScript, Netlify Hosting, SEO & Accessibility Optimierung.",
            roleEN: "Full-Stack Web Developer & Designer (Independent Project). Tech-Stack: HTML5, CSS3, JavaScript, Netlify Hosting, SEO & Accessibility Optimization.",
            impactDE: "Seitdem hat das Autohaus eine eigene Webseite mit Fahrzeugübersicht und Kontaktformular, ausgeliefert über das CDN von Netlify. Zahlen zu Serviceanfragen liegen mir nicht vor.",
            impactEN: "The dealership now has its own website with a vehicle overview and contact form, delivered via the Netlify CDN. I do not have figures on inquiry volume.",
            link: "https://autohaus-kleinjena.netlify.app/"
        },
        fim: {
            title: "FIM Schulung – Lernportal",
            type: "Öffentliche Verwaltung",
            badgeClass: "badge-context",
            badgeDE: "Berufsprojekt",
            badgeEN: "Professional Project",
            problemDE: "Die bestehende Schulungsplattform für das Föderale Informationsmanagement (FIM) war visuell und funktional veraltet. Lerninhalte sollten barrierefrei und leichter auffindbar werden.",
            problemEN: "The existing training platform for Federal Information Management (FIM) was visually and functionally outdated. Learning content needed to be accessible and easier to find.",
            solutionDE: "Neugestaltung der Benutzeroberfläche im Zweierteam. Neue Navigationsstruktur und ein Lern-UI, das Verwaltungsmitarbeiter ohne Vorwissen bedienen können.",
            solutionEN: "Redesigned the UI in a two-person team. New navigation structure and a learning UI that public sector staff can use without prior knowledge.",
            roleDE: "Frontend-Entwicklung und UI/UX im Zweierteam. Tech-Stack: FIM-Standard, Web-Standards, WCAG 2.1 AA als Richtschnur. Ein förmliches Barrierefreiheits-Audit gab es nicht.",
            roleEN: "Frontend development and UI/UX in a two-person team. Tech stack: FIM standard, web standards, WCAG 2.1 AA as a guideline. There was no formal accessibility audit.",
            impactDE: "Die überarbeitete Plattform ist unter fim-schulung.de öffentlich erreichbar. Belastbare Nutzungszahlen habe ich nicht.",
            impactEN: "The reworked platform is publicly available at fim-schulung.de. I do not have reliable usage figures.",
            link: "https://fim-schulung.de/"
        },
        falcos: {
            title: "Softwareentwicklung im Public Sector",
            type: "Werkstudent seit 06/2025",
            badgeClass: "badge-work",
            badgeDE: "Falcos GmbH",
            badgeEN: "Falcos GmbH",
            problemDE: "Täglich laufen in Behörden große Mengen strukturierter und unstrukturierter Daten auf (XÖV / ZUGFeRD). Ohne Automatisierung bedeutet das lange manuelle Erfassungszeiten.",
            problemEN: "Public sector entities handle large volumes of structured XÖV / ZUGFeRD data daily, causing high manual data entry workloads without automated processing.",
            solutionDE: "Entwicklung von XÖV-ZUGFeRD-Parsern, Dokumentationsportalen mit Docusaurus und LLM-gestützten Prozessautomatisierungen mit Google AppScripts.",
            solutionEN: "Building XÖV-ZUGFeRD parsers, documentation portals with Docusaurus, and LLM-assisted process automation using Google AppScripts.",
            roleDE: "Werkstudent im Public Sector @ Falcos GmbH, 20 Stunden pro Woche. Tech-Stack: Python, Java, XÖV, Docusaurus, WordPress, LLM / AppScripts.",
            roleEN: "Working student in the public sector @ Falcos GmbH, 20 hours per week. Tech stack: Python, Java, XÖV, Docusaurus, WordPress, LLM / AppScripts.",
            impactDE: "Rechnungsdaten aus ZUGFeRD werden ausgelesen, statt von Hand abgetippt zu werden. Konkrete Kennzahlen kann ich öffentlich nicht nennen.",
            impactEN: "ZUGFeRD invoice data is parsed instead of being typed in by hand. I cannot share concrete figures publicly.",
            link: "https://falcos.de"
        },
        sidum: {
            title: "Studentische Unternehmensberatung (SIDUM e.V.)",
            type: "Ressort Finanzen & Recht",
            badgeClass: "badge-engagement",
            badgeDE: "Fachliches Engagement",
            badgeEN: "Professional Engagement",
            problemDE: "Hinter jeder Kreditentscheidung einer Bank steht ein Risikomodell. Im Workshop ging es um die Frage, wie sich solche Modelle sauber aufbauen lassen.",
            problemEN: "Credit decisions at banks rely on risk models. The workshop asked how such models can be built properly.",
            solutionDE: "Mitarbeit an Expected-Goals-Kreditentscheidungsmodellen in Zusammenarbeit mit d-fine sowie Teilnahme an der zertifizierten PwC GenAI Masterclass für angewandte KI-Methoden.",
            solutionEN: "Collaborating on Expected-Goals credit decision models with d-fine and completing the certified PwC GenAI Masterclass for applied AI methods.",
            roleDE: "Consultant / Ressort Finanzen & Recht @ SIDUM e.V. Tech-Stack: Expected-Goals-Modellierung, d-fine Workshop, PwC GenAI Frameworks.",
            roleEN: "Consultant / Finance & Legal @ SIDUM e.V. Tech-Stack: Expected-Goals Modeling, d-fine Workshop, PwC GenAI Frameworks.",
            impactDE: "Ergebnis war ein Modellentwurf im Workshop-Kontext, kein produktives System. Die PwC GenAI Masterclass habe ich abgeschlossen.",
            impactEN: "The outcome was a model draft in a workshop setting, not a production system. I completed the PwC GenAI Masterclass.",
            link: "https://www.sidum.de/"
        },
        mower: {
            title: "Autonomer Rasenmäherroboter",
            type: "Mechatronik",
            badgeClass: "badge-hardware",
            badgeDE: "Eigenbau",
            badgeEN: "Self-built",
            problemDE: "Entwicklung eines funktionalen, autonomen Rasenmäherroboters inklusive eigener Sensorik, Aktorik und Gehäusekonstruktion im Rahmen der Informatik-Kursarbeit.",
            problemEN: "Designing a functional autonomous robotic mower including custom sensors, actuators, and chassis construction for computer science coursework.",
            solutionDE: "Sämtliche Kunststoffbauteile und Chassis-Komponenten entstanden eigenhändig im 3D-Druck. Steuerung, Sensorik und Aktorik haben wir im Zweierteam programmiert.",
            solutionEN: "Custom 3D printing of all plastic chassis components. Programming digital control, sensors, and actuators in a 2-person team.",
            roleDE: "Hardware & Software Co-Developer. Tech-Stack: FDM 3D-Druck, Sensorik & Aktorik, Digitale Steuerung, Python, CAD.",
            roleEN: "Hardware & Software Co-Developer. Tech-Stack: FDM 3D Printing, Sensors & Actuators, Digital Control, Python, CAD.",
            impactDE: "Am Ende fuhr er autonom. Alle Kunststoffteile – Chassis, Gehäuse, Halterungen – stammten aus dem eigenen 3D-Drucker.",
            impactEN: "The robot worked in the end and drove autonomously. All plastic parts came from my own 3D printer.",
            link: null
        },
        campus3d: {
            title: "Schulcampus-Modell (1:150)",
            type: "3D-Druck & Modellbau",
            badgeClass: "badge-award",
            badgeDE: "Sonderpreis Digitalisierung",
            badgeEN: "Digitalization Award",
            problemDE: "Erstellung eines maßstabsgetreuen 3D-Modells des gesamten historischen Schulgebäudeensembles der CJD Christophorusschule Droyßig.",
            problemEN: "Creating a scale-accurate 3D model of the entire historical school building ensemble at CJD Droyßig.",
            solutionDE: "Digitalisierung historischer Baupläne, Fotos und Vermessungen mit CAD-Software. 3D-Druck des kompletten Gebäudekomplexes im Maßstab 1:150.",
            solutionEN: "Digitalized historical building plans, photos, and site measurements using CAD software. 3D printed the entire campus ensemble at 1:150 scale.",
            roleDE: "Projektleiter & CAD-Designer. Tech-Stack: CAD (Computer-Aided Design), FDM 3D-Druck, Bauplandigitalisierung.",
            roleEN: "Project Lead & CAD Designer. Tech-Stack: CAD (Computer-Aided Design), FDM 3D Printing, Architectural Digitalization.",
            impactDE: "Ausgezeichnet mit dem 'Sonderpreis für Digitalisierung / Modellierung / Digitaltechnik 2024'. Das Modell ist dauerhaft im Paulusraum der Schule ausgestellt.",
            impactEN: "Awarded the 'Special Digitalization / Modeling Prize 2024'. Permanently displayed in the school's Paulusraum.",
            link: null
        },
        farafin: {
            title: "Fachschaftsrat der Fakultät für Informatik (FIN OVGU)",
            type: "Hochschulgremium",
            badgeClass: "badge-engagement",
            badgeDE: "Ehrenamt",
            badgeEN: "Volunteering",
            problemDE: "Betreuung und Koordination von über 150 Erstsemester-Studierenden, Vorbereitung von Großveranstaltungen und barrierefreie Wissensbereitstellung für Informatikstudierende an der OVGU.",
            problemEN: "Coordinating and guiding 150+ freshman students, managing large orientation events, and structuring knowledge access for CS students.",
            solutionDE: "Eigenverantwortliche Leitung von 2 Erstsemesterwochen (150+ / 80+ Studierende), Implementierung automatisierter Workflows mit n8n & LLMs für Fachschaftsprozesse, Ausbau des Wikis und Betreuung der IT-Infrastruktur.",
            solutionEN: "Leading 2 orientation weeks for 150+ / 80+ students, implementing automated workflows with n8n & LLMs for student council tasks, expanding the internal wiki, and managing council IT.",
            roleDE: "Gewählter Stellvertreter & IT-Adminreferat. Tech-Stack: n8n, LLM Workflows, MediaWiki, Linux Server, Event Logistik.",
            roleEN: "Elected Representative & IT Administrator. Tech-Stack: n8n, LLM Workflows, MediaWiki, Linux Server, Event Logistics.",
            impactDE: "Zwei Erstsemesterwochen sind gelaufen. Genutzt wird das Wiki weiterhin, und mehrere wiederkehrende Abläufe laufen inzwischen automatisch. Für die E-Woche gibt es ein eigenes Mentoren- und Helferportal.",
            impactEN: "Two orientation weeks took place. The wiki is still in use, and several recurring tasks now run automatically. The orientation week has its own portal for mentors and helpers.",
            link: "https://farafin.de"
        },
        oscar: {
            title: "OSCAR Semesterplaner",
            type: "Softwareprojekt im Studium",
            badgeClass: "badge-context",
            badgeDE: "Studienprojekt",
            badgeEN: "University Project",
            problemDE: "Zu Studienbeginn gleichen Informatik-Studierende Modulpläne, Voraussetzungen und Stundenpläne von Hand ab. Das Thema haben wir uns im Softwareprojekt selbst ausgesucht.",
            problemEN: "Computer science freshmen align module plans, prerequisites, and schedules by hand. We chose this topic ourselves for the university software project.",
            solutionDE: "Im Viererteam entstand ein modularer Discord-Bot (Organized Study Choice & Academic Roadmapper). Er unterstützt bei der Semesterplanung und soll in die Erstsemesterwoche und die Grundlagenveranstaltungen (Code Games) eingebettet werden.",
            solutionEN: "A team of four built a modular Discord bot (Organized Study Choice & Academic Roadmapper). It supports semester planning and is meant to be embedded into the orientation week and the introductory courses (Code Games).",
            roleDE: "Softwareentwickler in einem Team aus vier Kommilitonen. Tech-Stack: Python, Bot-Frameworks, modulare Architektur.",
            roleEN: "Software developer in a team of four fellow students. Tech stack: Python, bot frameworks, modular architecture.",
            impactDE: "Das Projekt ist abgeschlossen. Der Bot läuft auf dem Discord-Server FIN EMporium und hilft bei Modulwahl und Semesterplanung. Der Code liegt offen auf GitHub unter Apache-2.0-Lizenz, mit Dokumentation und einer Anleitung zum Selbstbetrieb. So können auch andere Hochschulen ihn nutzen.",
            impactEN: "The project is finished. The bot runs on the FIN EMporium Discord server and helps with choosing modules and planning semesters. The code is public on GitHub under the Apache 2.0 license, with documentation and a guide to run it yourself. Other universities can use it too.",
            link: "https://github.com/emin-girimhanov/oscar-discord-bot"
        }
    };

    window.openCaseStudy = function(key) {
        const cs = caseStudies[key];
        if (!cs) return;

        const title = document.getElementById('case-study-title');
        const type = document.getElementById('case-study-type');
        const badge = document.getElementById('case-study-badge');
        const problem = document.getElementById('case-study-problem');
        const solution = document.getElementById('case-study-solution');
        const role = document.getElementById('case-study-role');
        const impact = document.getElementById('case-study-impact');
        const link = document.getElementById('case-study-link');

        if (title) title.innerText = cs.title;
        if (type) type.innerText = cs.type;
        if (badge) {
            badge.className = `badge-role ${cs.badgeClass}`;
            badge.innerText = currentLang === 'de' ? cs.badgeDE : cs.badgeEN;
        }
        if (problem) problem.innerText = currentLang === 'de' ? cs.problemDE : cs.problemEN;
        if (solution) solution.innerText = currentLang === 'de' ? cs.solutionDE : cs.solutionEN;
        if (role) role.innerText = currentLang === 'de' ? cs.roleDE : cs.roleEN;
        if (impact) impact.innerText = currentLang === 'de' ? cs.impactDE : cs.impactEN;
        if (link) {
            // Ohne oeffentliches Ziel wird der Knopf ausgeblendet statt ins Leere zu fuehren.
            link.href = cs.link || '#';
            link.hidden = !cs.link;
        }

        openModal('case-study-modal');
    };

    document.querySelectorAll('.case-study-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const key = btn.getAttribute('data-project');
            if (key) openCaseStudy(key);
        });
    });

    // Close Modals on Overlay Click
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                closeModal(overlay.id);
            }
        });
    });

    // Close Modals on ESC Key Press (A11Y)
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal('lightbox-modal');
            closeModal('case-study-modal');
        }
    });

    // --- Scroll-Driven Auto-Growing Line & Station Highlight for "Meine Reise" ---
    const timelineWrapper = document.querySelector('.timeline-wrapper');
    const timelineProgressBar = document.getElementById('timeline-progress-bar');
    const timelineItems = document.querySelectorAll('.timeline-item');

    function updateTimelineProgress() {
        if (!timelineWrapper || !timelineProgressBar) return;

        const rect = timelineWrapper.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        
        // Compute how far scroll has progressed relative to the timeline container
        const startOffset = viewportHeight * 0.65;
        const currentY = startOffset - rect.top;
        const totalHeight = rect.height;

        let progressRatio = currentY / totalHeight;
        progressRatio = Math.max(0, Math.min(1, progressRatio));

        timelineProgressBar.style.height = (progressRatio * 100) + '%';

        // Station items highlight as progress line reaches them
        timelineItems.forEach(item => {
            const itemRect = item.getBoundingClientRect();
            if (itemRect.top < viewportHeight * 0.70) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }

    // --- Zurueck nach oben ---
    // Der Knopf taucht erst auf, wenn eine gute Bildschirmhoehe gescrollt
    // ist, und verschwindet etwas frueher wieder. Die Luecke zwischen den
    // beiden Schwellen verhindert Flackern genau an der Grenze.
    const backToTop = document.getElementById('back-to-top');
    const SHOW_AT = 600;
    const HIDE_AT = 400;

    function updateBackToTop() {
        if (!backToTop) return;
        const y = window.pageYOffset || document.documentElement.scrollTop;
        const shown = backToTop.classList.contains('is-visible');

        if (!shown && y > SHOW_AT) {
            backToTop.hidden = false;
            // Erzwingt einen Frame, damit der Uebergang wirklich laeuft
            void backToTop.offsetWidth;
            backToTop.classList.add('is-visible');
        } else if (shown && y < HIDE_AT) {
            backToTop.classList.remove('is-visible');
        }
    }

    if (backToTop) {
        backToTop.addEventListener('click', () => {
            const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
            // Fokus zurueck an den Seitenanfang, damit Tastatur und
            // Screenreader der Bewegung folgen.
            const hero = document.getElementById('hero');
            if (hero) {
                hero.setAttribute('tabindex', '-1');
                hero.focus({ preventScroll: true });
            }
        });

        // Nach dem Ausblenden wieder komplett aus dem Baum nehmen
        backToTop.addEventListener('transitionend', (e) => {
            if (e.propertyName === 'opacity' && !backToTop.classList.contains('is-visible')) {
                backToTop.hidden = true;
            }
        });
    }

    let scrollTicking = false;
    window.addEventListener('scroll', () => {
        if (scrollTicking) return;
        scrollTicking = true;
        requestAnimationFrame(() => {
            updateTimelineProgress();
            updateBackToTop();
            scrollTicking = false;
        });
    }, { passive: true });
    window.addEventListener('resize', updateTimelineProgress);
    updateTimelineProgress();
    updateBackToTop();

    // --- Canvas UI Interactive Particle & Shimmer Effect (CanvasUI.dev inspired) ---
    const canvas = document.getElementById('canvas-ui-bg');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let width = canvas.width = window.innerWidth;
        let height = canvas.height = window.innerHeight;
        
        let mouse = { x: width / 2, y: height / 2, active: false };

        window.addEventListener('resize', () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        });

        window.addEventListener('mousemove', (e) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
            mouse.active = true;
        });

        window.addEventListener('mouseleave', () => {
            mouse.active = false;
        });

        const particleCount = Math.min(Math.floor(width * 0.035), 45);
        const particles = [];

        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * 0.45,
                vy: (Math.random() - 0.5) * 0.45,
                radius: Math.random() * 2 + 1,
                color: Math.random() > 0.5 ? 'rgba(167, 139, 250, ' : 'rgba(56, 189, 248, '
            });
        }

        function renderCanvas() {
            ctx.clearRect(0, 0, width, height);

            for (let i = 0; i < particles.length; i++) {
                let p = particles[i];
                p.x += p.vx;
                p.y += p.vy;

                if (p.x < 0) p.x = width;
                if (p.x > width) p.x = 0;
                if (p.y < 0) p.y = height;
                if (p.y > height) p.y = 0;

                // Gentle mouse attraction
                if (mouse.active) {
                    let dx = mouse.x - p.x;
                    let dy = mouse.y - p.y;
                    let dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 180) {
                        p.x += dx * 0.008;
                        p.y += dy * 0.008;
                    }
                }

                // Draw Particle
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fillStyle = p.color + '0.75)';
                ctx.fill();

                // Draw Particle Connections
                for (let j = i + 1; j < particles.length; j++) {
                    let p2 = particles[j];
                    let dx = p.x - p2.x;
                    let dy = p.y - p2.y;
                    let dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < 125) {
                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.strokeStyle = p.color + (1 - dist / 125) * 0.22 + ')';
                        ctx.lineWidth = 0.8;
                        ctx.stroke();
                    }
                }
            }
        }

        // Animation nur, wenn sie erwuenscht und die Seite sichtbar ist.
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
        let rafId = null;

        function loop() {
            renderCanvas();
            rafId = requestAnimationFrame(loop);
        }

        function startCanvas() {
            if (rafId === null && !reduceMotion.matches && !document.hidden) {
                rafId = requestAnimationFrame(loop);
            }
        }

        function stopCanvas() {
            if (rafId !== null) {
                cancelAnimationFrame(rafId);
                rafId = null;
            }
        }

        document.addEventListener('visibilitychange', () => {
            if (document.hidden) stopCanvas();
            else startCanvas();
        });

        reduceMotion.addEventListener('change', () => {
            stopCanvas();
            if (reduceMotion.matches) {
                ctx.clearRect(0, 0, width, height);
            } else {
                startCanvas();
            }
        });

        if (reduceMotion.matches) {
            renderCanvas();   // ein einziges statisches Bild, keine Bewegung
        } else {
            startCanvas();
        }
    }

    // --- Glassmorphism Card Mouse Spotlight Position Tracking ---
    document.querySelectorAll('.glass-card').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        });
    });
});
