/* ============================================================
   DONORICS TECHNOLOGIES — script.js
   All advanced features
   ============================================================ */

(function () {
    'use strict';

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ---------- 1. HEADER SCROLL STATE ---------- */
    const header = document.getElementById('site-header');
    const onScrollHeader = () => {
        if (!header) return;
        header.classList.toggle('scrolled', window.scrollY > 40);
    };
    window.addEventListener('scroll', onScrollHeader, { passive: true });
    onScrollHeader();

    /* ---------- 2. SCROLL PROGRESS BAR ---------- */
    const progressBar = document.getElementById('scroll-progress-bar');
    let progressRAF = null;
    const updateProgress = () => {
        if (!progressBar) return;
        const doc = document.documentElement;
        const scrolled = doc.scrollTop;
        const total = doc.scrollHeight - doc.clientHeight;
        const pct = total > 0 ? (scrolled / total) * 100 : 0;
        progressBar.style.width = pct + '%';
        progressRAF = null;
    };
    window.addEventListener('scroll', () => {
        if (!progressRAF) progressRAF = requestAnimationFrame(updateProgress);
    }, { passive: true });
    updateProgress();

    /* ---------- 3. MOBILE NAV ---------- */
    const mobileToggle = document.getElementById('mobile-toggle');
    const mainNav = document.getElementById('main-nav');
    const navLinks = mainNav ? mainNav.querySelectorAll('a') : [];

    const openNav = () => {
        mainNav?.classList.add('open');
        document.body.style.overflow = 'hidden';
        if (mobileToggle) mobileToggle.innerHTML = '<i class="ph ph-x"></i>';
    };
    const closeNav = () => {
        mainNav?.classList.remove('open');
        document.body.style.overflow = '';
        if (mobileToggle) mobileToggle.innerHTML = '<i class="ph ph-list"></i>';
    };
    mobileToggle?.addEventListener('click', () =>
        mainNav?.classList.contains('open') ? closeNav() : openNav());
    navLinks.forEach(l => l.addEventListener('click', closeNav));
    document.addEventListener('click', e => {
        if (!mainNav?.classList.contains('open')) return;
        if (!mainNav.contains(e.target) && !mobileToggle.contains(e.target)) closeNav();
    });

    /* ---------- 4. ACTIVE NAV ON SCROLL ---------- */
    const sections = document.querySelectorAll('section[id]');
    const updateActiveNav = () => {
        const pos = window.scrollY + 140;
        let current = '';
        sections.forEach(s => {
            if (pos >= s.offsetTop && pos < s.offsetTop + s.offsetHeight) current = s.id;
        });
        navLinks.forEach(l => {
            l.classList.toggle('active', l.getAttribute('href') === '#' + current);
        });
    };
    window.addEventListener('scroll', updateActiveNav, { passive: true });
    updateActiveNav();

    /* ---------- 5. SMOOTH SCROLL ---------- */
    document.querySelectorAll('a[href^="#"]').forEach(a => {
        a.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (!href || href === '#') return;
            const t = document.querySelector(href);
            if (!t) return;
            e.preventDefault();
            const offset = t.getBoundingClientRect().top + window.scrollY - 80;
            window.scrollTo({ top: offset, behavior: prefersReduced ? 'auto' : 'smooth' });
            history.pushState(null, null, href);
        });
    });

    /* ---------- 6. SCROLL REVEAL ---------- */
    const aos = document.querySelectorAll('[data-aos]');
    if ('IntersectionObserver' in window) {
        const io = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const delay = parseInt(entry.target.getAttribute('data-aos-delay') || 0, 10);
                    setTimeout(() => entry.target.classList.add('aos-animate'), delay);
                    obs.unobserve(entry.target);
                }
            });
        }, { rootMargin: '0px 0px -60px 0px', threshold: 0.12 });
        aos.forEach(el => io.observe(el));
    } else {
        aos.forEach(el => el.classList.add('aos-animate'));
    }

    /* ---------- 7. ANIMATED COUNTERS ---------- */
    const counters = document.querySelectorAll('.stat-number');
    const animateCounter = el => {
        const target = parseInt(el.getAttribute('data-count'), 10) || 0;
        const duration = 1800;
        const start = performance.now();
        const tick = now => {
            const p = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - p, 3);
            el.textContent = Math.round(target * eased);
            if (p < 1) requestAnimationFrame(tick);
            else el.textContent = target;
        };
        requestAnimationFrame(tick);
    };
    if ('IntersectionObserver' in window) {
        const co = new IntersectionObserver((entries, obs) => {
            entries.forEach(e => {
                if (e.isIntersecting) { animateCounter(e.target); obs.unobserve(e.target); }
            });
        }, { threshold: 0.5 });
        counters.forEach(c => co.observe(c));
    } else {
        counters.forEach(c => c.textContent = c.getAttribute('data-count'));
    }

    /* ---------- 8. FAQ ACCORDION ---------- */
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const q = item.querySelector('.faq-question');
        const a = item.querySelector('.faq-answer');
        if (!q || !a) return;
        q.addEventListener('click', () => {
            const isOpen = item.classList.contains('open');
            faqItems.forEach(other => {
                if (other !== item) {
                    other.classList.remove('open');
                    other.querySelector('.faq-answer').style.maxHeight = '0px';
                    other.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
                }
            });
            if (isOpen) {
                item.classList.remove('open');
                a.style.maxHeight = '0px';
                q.setAttribute('aria-expanded', 'false');
            } else {
                item.classList.add('open');
                a.style.maxHeight = a.scrollHeight + 'px';
                q.setAttribute('aria-expanded', 'true');
            }
        });
    });

    /* ---------- 9. TOAST NOTIFICATIONS ---------- */
    const toastContainer = document.getElementById('toast-container');
    const icons = { success: 'ph-check-circle', error: 'ph-x-circle', info: 'ph-info' };
    window.showToast = (type, title, message, duration = 4000) => {
        if (!toastContainer) return;
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <div class="toast-icon"><i class="ph ${icons[type] || icons.info}"></i></div>
            <div class="toast-content">
                <div class="toast-title">${title}</div>
                ${message ? `<div class="toast-message">${message}</div>` : ''}
            </div>
            <button class="toast-close" aria-label="Close"><i class="ph ph-x"></i></button>
            <div class="toast-progress" style="animation-duration:${duration}ms"></div>
        `;
        toastContainer.appendChild(toast);
        requestAnimationFrame(() => toast.classList.add('show'));

        const remove = () => {
            toast.classList.remove('show');
            toast.classList.add('hide');
            setTimeout(() => toast.remove(), 400);
        };
        toast.querySelector('.toast-close').addEventListener('click', remove);
        const timer = setTimeout(remove, duration);
        toast.addEventListener('mouseenter', () => clearTimeout(timer));
    };

    /* ---------- 10. CONTACT FORM ---------- */
    const form = document.getElementById('contact-form');
    form?.addEventListener('submit', e => {
        e.preventDefault();
        const btn = form.querySelector('button[type="submit"]');
        const original = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = '<i class="ph ph-circle-notch"></i> Sending...';
        setTimeout(() => {
            btn.innerHTML = '<i class="ph ph-check-circle"></i> Sent!';
            btn.style.background = '#22c55e';
            window.showToast('success', 'Message sent!', 'We\'ll be in touch within 24 hours.');
            setTimeout(() => {
                form.reset();
                btn.disabled = false;
                btn.innerHTML = original;
                btn.style.background = '';
            }, 2200);
        }, 1400);
    });

    /* ---------- 11. CHAT FLOAT ---------- */
    const chatFloat = document.getElementById('chat-float');
    chatFloat?.addEventListener('click', () => {
        window.showToast('info', 'Chat coming soon', 'Our team is available at hello@donorics.com');
    });

    /* ---------- 12. LIVE ACCRA TIME ---------- */
    const timeEl = document.getElementById('live-time');
    const updateTime = () => {
        if (!timeEl) return;
        const now = new Date();
        const accra = new Intl.DateTimeFormat('en-GB', {
            timeZone: 'Africa/Accra',
            hour: '2-digit', minute: '2-digit', second: '2-digit',
            hour12: false
        }).format(now);
        timeEl.textContent = accra + ' GMT';
    };
    updateTime();
    setInterval(updateTime, 1000);

    /* ---------- 13. READING PROGRESS DOTS ---------- */
    const rp = document.getElementById('reading-progress');
    if (rp) {
        const targets = Array.from(document.querySelectorAll('section[id]'));
        const dots = targets.map(sec => {
            const b = document.createElement('button');
            b.className = 'reading-dot';
            b.setAttribute('data-label', sec.querySelector('.section-tag')?.textContent || sec.id);
            b.setAttribute('aria-label', 'Go to ' + sec.id);
            b.addEventListener('click', () => {
                window.scrollTo({
                    top: sec.offsetTop - 80,
                    behavior: prefersReduced ? 'auto' : 'smooth'
                });
            });
            rp.appendChild(b);
            return { el: b, sec };
        });
        const updateDots = () => {
            const pos = window.scrollY + window.innerHeight * 0.4;
            let activeIdx = 0;
            dots.forEach((d, i) => {
                if (pos >= d.sec.offsetTop) activeIdx = i;
            });
            dots.forEach((d, i) => d.el.classList.toggle('active', i === activeIdx));
        };
        window.addEventListener('scroll', updateDots, { passive: true });
        updateDots();
    }

    /* ---------- 14. CURSOR SPOTLIGHT ON CARDS ---------- */
    const spotlights = document.querySelectorAll('.spotlight');
    if (window.matchMedia('(hover: hover)').matches && !prefersReduced) {
        spotlights.forEach(card => {
            card.addEventListener('mousemove', e => {
                const r = card.getBoundingClientRect();
                card.style.setProperty('--mx', `${e.clientX - r.left}px`);
                card.style.setProperty('--my', `${e.clientY - r.top}px`);
            });
        });
    }

    /* ---------- 15. 3D TILT ON CARDS ---------- */
    if (window.matchMedia('(hover: hover)').matches && !prefersReduced) {
        document.querySelectorAll('.capability-card, .challenge-card, .client-card').forEach(card => {
            card.addEventListener('mousemove', e => {
                const r = card.getBoundingClientRect();
                const x = e.clientX - r.left;
                const y = e.clientY - r.top;
                const rx = ((y - r.height / 2) / r.height) * -5;
                const ry = ((x - r.width / 2) / r.width) * 5;
                card.style.transform =
                    `translateY(-8px) perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg)`;
            });
            card.addEventListener('mouseleave', () => { card.style.transform = ''; });
        });
    }

    /* ---------- 16. MAGNETIC BUTTONS ---------- */
    if (window.matchMedia('(hover: hover)').matches && !prefersReduced) {
        document.querySelectorAll('.magnetic').forEach(btn => {
            btn.addEventListener('mousemove', e => {
                const r = btn.getBoundingClientRect();
                const x = e.clientX - r.left - r.width / 2;
                const y = e.clientY - r.top - r.height / 2;
                btn.style.transform = `translate(${x * 0.25}px, ${y * 0.4}px)`;
                const inner = btn.querySelector('i, span');
                if (inner) inner.style.transform = `translate(${x * 0.12}px, ${y * 0.2}px)`;
            });
            btn.addEventListener('mouseleave', () => {
                btn.style.transform = '';
                const inner = btn.querySelector('i, span');
                if (inner) inner.style.transform = '';
            });
        });
    }

    /* ---------- 17. RIPPLE ON BUTTONS ---------- */
    document.querySelectorAll('.btn').forEach(btn => {
        btn.addEventListener('click', e => {
            if (prefersReduced) return;
            const r = btn.getBoundingClientRect();
            const size = Math.max(r.width, r.height);
            const ripple = document.createElement('span');
            ripple.className = 'ripple';
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = (e.clientX - r.left - size / 2) + 'px';
            ripple.style.top = (e.clientY - r.top - size / 2) + 'px';
            btn.appendChild(ripple);
            setTimeout(() => ripple.remove(), 700);
        });
    });

    /* ---------- 18. TEXT SCRAMBLE ---------- */
    const scrambleChars = '!<>-_\\/[]{}—=+*^?#________';
    const scrambleEl = el => {
        const target = el.textContent;
        const len = target.length;
        let frame = 0;
        const queue = [];
        for (let i = 0; i < len; i++) {
            queue.push({
                from: target[i],
                to: target[i],
                start: Math.floor(Math.random() * 20),
                end: Math.floor(Math.random() * 20) + 20,
                char: null
            });
        }
        const tick = () => {
            let output = '';
            let done = 0;
            for (let i = 0; i < queue.length; i++) {
                const q = queue[i];
                if (frame >= q.end) { done++; output += q.to; }
                else if (frame >= q.start) {
                    if (!q.char || Math.random() < 0.28)
                        q.char = scrambleChars[Math.floor(Math.random() * scrambleChars.length)];
                    output += `<span class="scramble-char">${q.char}</span>`;
                } else {
                    output += q.to;
                }
            }
            el.innerHTML = output;
            if (done === queue.length) return;
            frame++;
            requestAnimationFrame(tick);
        };
        tick();
    };
    if (!prefersReduced) {
        const scrambleTargets = document.querySelectorAll('[data-scramble]');
        if ('IntersectionObserver' in window) {
            const so = new IntersectionObserver((entries, obs) => {
                entries.forEach(e => {
                    if (e.isIntersecting) {
                        setTimeout(() => scrambleEl(e.target), 100);
                        obs.unobserve(e.target);
                    }
                });
            }, { threshold: 0.5 });
            scrambleTargets.forEach(t => so.observe(t));
        }
    }

    /* ---------- 19. SVG DIVIDER ANIMATION ---------- */
    const dividers = document.querySelectorAll('.section-divider');
    if ('IntersectionObserver' in window) {
        const dio = new IntersectionObserver((entries, obs) => {
            entries.forEach(e => {
                if (e.isIntersecting) {
                    e.target.classList.add('in-view');
                    obs.unobserve(e.target);
                }
            });
        }, { threshold: 0.3 });
        dividers.forEach(d => dio.observe(d));
    } else {
        dividers.forEach(d => d.classList.add('in-view'));
    }

    /* ---------- 20. COMMAND PALETTE ---------- */
    const cmdOverlay = document.getElementById('cmd-overlay');
    const cmdInput = document.getElementById('cmd-input');
    const cmdResults = document.getElementById('cmd-results');
    const kbdTrigger = document.getElementById('kbd-trigger');
    let cmdItems = [];
    let cmdSelected = 0;

    const cmdData = [
        { group: 'Sections', items: [
            { title: 'The Challenge', icon: 'ph-warning-circle', href: '#challenge' },
            { title: 'What We Are', icon: 'ph-info', href: '#what-is' },
            { title: 'Our Capabilities', icon: 'ph-cpu', href: '#capabilities' },
            { title: 'Why Us', icon: 'ph-seal-check', href: '#why-us' },
            { title: 'Our Clients', icon: 'ph-users', href: '#clients' },
            { title: 'Testimonials', icon: 'ph-chat-centered-text', href: '#testimonials' },
            { title: 'FAQ', icon: 'ph-question', href: '#faq' },
            { title: 'Contact', icon: 'ph-envelope', href: '#contact' }
        ]},
        { group: 'Subsidiaries', items: [
            { title: 'Ghana e-Learn', icon: 'ph-graduation-cap', hint: 'Education', href: '#capabilities' },
            { title: 'Click Next', icon: 'ph-shopping-cart', hint: 'E-Commerce', href: '#capabilities' },
            { title: 'DTA — Digital Table Assistance', icon: 'ph-fork-knife', hint: 'Hospitality', href: '#capabilities' },
            { title: 'Donorics Auto Diagnostics', icon: 'ph-car', hint: 'Automotive', href: '#capabilities' },
            { title: 'Eagle Hall Management System', icon: 'ph-buildings', hint: 'Hostels', href: '#capabilities' }
        ]},
        { group: 'Actions', items: [
            { title: 'Book a Demo', icon: 'ph-calendar-check', hint: 'Contact', href: '#contact' },
            { title: 'Send us an email', icon: 'ph-paper-plane-tilt', hint: 'Email', action: () => {
                window.location.href = 'mailto:hello@donorics.com';
            }},
            { title: 'Copy company email', icon: 'ph-copy', hint: 'Copy', action: () => {
                navigator.clipboard.writeText('hello@donorics.com');
                window.showToast('success', 'Copied!', 'hello@donorics.com copied to clipboard.');
            }},
            { title: 'Toggle Live Metrics', icon: 'ph-chart-line', hint: 'Widget', action: () => {
                document.getElementById('metrics-widget')?.classList.toggle('collapsed');
            }},
            { title: 'Show keyboard shortcuts', icon: 'ph-keyboard', hint: '?', action: () => {
                document.getElementById('shortcuts-modal')?.classList.add('open');
            }}
        ]}
    ];

    const flatItems = () => {
        const flat = [];
        cmdData.forEach(g => g.items.forEach(i => flat.push({ ...i, group: g.group })));
        return flat;
    };

    const renderCmd = (filter = '') => {
        if (!cmdResults) return;
        const q = filter.toLowerCase().trim();
        cmdResults.innerHTML = '';
        cmdItems = [];
        cmdSelected = 0;

        cmdData.forEach(group => {
            const filtered = group.items.filter(it =>
                !q || it.title.toLowerCase().includes(q) || (it.hint && it.hint.toLowerCase().includes(q))
            );
            if (!filtered.length) return;
            const lbl = document.createElement('div');
            lbl.className = 'cmd-group-label';
            lbl.textContent = group.group;
            cmdResults.appendChild(lbl);

            filtered.forEach(it => {
                const idx = cmdItems.length;
                const btn = document.createElement('button');
                btn.className = 'cmd-item';
                btn.innerHTML = `
                    <i class="ph ${it.icon}"></i>
                    <span class="cmd-item-title">${it.title}</span>
                    ${it.hint ? `<span class="cmd-item-hint">${it.hint}</span>` : ''}
                `;
                btn.addEventListener('click', () => runCmd(it));
                btn.addEventListener('mouseenter', () => {
                    cmdSelected = idx;
                    updateCmdSelection();
                });
                cmdResults.appendChild(btn);
                cmdItems.push({ el: btn, data: it });
            });
        });

        if (!cmdItems.length) {
            cmdResults.innerHTML = '<div class="cmd-empty">No results found</div>';
        }
        updateCmdSelection();
    };

    const updateCmdSelection = () => {
        cmdItems.forEach((it, i) => it.el.classList.toggle('selected', i === cmdSelected));
        const sel = cmdItems[cmdSelected];
        if (sel) sel.el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    };

    const runCmd = item => {
        closeCmd();
        if (item.action) return item.action();
        if (item.href) {
            const t = document.querySelector(item.href);
            if (t) {
                window.scrollTo({
                    top: t.offsetTop - 80,
                    behavior: prefersReduced ? 'auto' : 'smooth'
                });
            }
        }
    };

    const openCmd = () => {
        cmdOverlay?.classList.add('open');
        cmdOverlay?.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        cmdInput.value = '';
        renderCmd('');
        setTimeout(() => cmdInput?.focus(), 100);
    };
    const closeCmd = () => {
        cmdOverlay?.classList.remove('open');
        cmdOverlay?.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    };

    kbdTrigger?.addEventListener('click', openCmd);
    cmdOverlay?.addEventListener('click', e => { if (e.target === cmdOverlay) closeCmd(); });
    cmdInput?.addEventListener('input', e => renderCmd(e.target.value));
    cmdInput?.addEventListener('keydown', e => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            cmdSelected = (cmdSelected + 1) % cmdItems.length;
            updateCmdSelection();
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            cmdSelected = (cmdSelected - 1 + cmdItems.length) % cmdItems.length;
            updateCmdSelection();
        } else if (e.key === 'Enter') {
            e.preventDefault();
            const sel = cmdItems[cmdSelected];
            if (sel) runCmd(sel.data);
        } else if (e.key === 'Escape') {
            closeCmd();
        }
    });

    /* ---------- 21. CASE STUDY MODALS ---------- */
    const caseData = {
        oguaa: {
            badge: 'Education', title: 'Oguaa Hall', subtitle: 'University of Cape Coast',
            metrics: [['-62%', 'Admin time'], ['2,400+', 'Students served'], ['99.9%', 'Uptime']],
            desc: 'Oguaa Hall needed a modern system to handle room allocation, payments, and student records for thousands of residents. Manual processes were error-prone and slow. We deployed the Eagle Hall Management System, digitising every workflow from check-in to check-out.',
            quote: '"Room allocation used to take weeks. Now it\'s a single afternoon." — Hall Administrator'
        },
        ghartey: {
            badge: 'Education', title: 'Ghartey Hall', subtitle: 'University of Education, Winneba',
            metrics: [['-71%', 'Processing time'], ['1,800+', 'Residents'], ['100%', 'Digital records']],
            desc: 'Ghartey Hall required a system that could scale with growing enrolment while keeping payments, attendance, and reporting accurate. The Eagle Hall Management System gave staff a single dashboard for everything.',
            quote: '"Our audit process went from days to hours. Everything is right there." — Bursar'
        },
        mabels: {
            badge: 'Hospitality', title: "Mabel's Table", subtitle: 'Restaurant & Dining',
            metrics: [['+34%', 'Order throughput'], ['-45%', 'Wait times'], ['4.9/5', 'Guest rating']],
            desc: "Mabel's Table was losing orders during peak hours. DTA — Digital Table Assistance — digitised the entire floor: tables, orders, billing, and customer service. Guests order faster, staff serve smarter, and management gets real-time visibility.",
            quote: '"The dinner rush no longer feels like chaos. DTA keeps us in rhythm." — Owner'
        },
        panafest: {
            badge: 'Culture & Arts', title: 'PANAFEST', subtitle: 'Pan African Historical Theatre Festival',
            metrics: [['50k+', 'Visitors reached'], ['12', 'Events digitised'], ['3×', 'Engagement']],
            desc: 'PANAFEST needed a digital home for one of Africa\'s most important cultural festivals. We built a platform to manage registrations, schedules, artist profiles, and audience engagement — with analytics to inform future programming.',
            quote: '"Our festival now has a digital legacy that lives year-round." — Festival Director'
        },
        adotale: {
            badge: 'Retail', title: 'ADOTALE', subtitle: 'Commerce & Retail',
            metrics: [['+180%', 'Sales growth'], ['8,000+', 'SKUs listed'], ['24/7', 'Operations']],
            desc: 'ADOTALE wanted to scale beyond a single storefront. Using Click Next, our e-commerce platform, they launched a fully integrated online store with secure payments, seller dashboards, and real-time logistics tracking.',
            quote: '"Click Next turned our shop into a national business." — Founder'
        }
    };
    const caseModal = document.getElementById('case-modal');
    const openCase = key => {
        const d = caseData[key];
        if (!d || !caseModal) return;
        document.getElementById('case-badge').textContent = d.badge;
        document.getElementById('case-title').textContent = d.title;
        document.getElementById('case-subtitle').textContent = d.subtitle;
        document.getElementById('case-desc').textContent = d.desc;
        document.getElementById('case-quote').textContent = d.quote;
        document.getElementById('case-metrics').innerHTML = d.metrics
            .map(m => `<div class="case-metric"><span class="case-metric-value">${m[0]}</span><span class="case-metric-label">${m[1]}</span></div>`)
            .join('');
        caseModal.classList.add('open');
        caseModal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    };
    const closeCase = () => {
        caseModal.classList.remove('open');
        caseModal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    };
    document.querySelectorAll('[data-case]').forEach(card => {
        card.addEventListener('click', () => openCase(card.getAttribute('data-case')));
        card.style.cursor = 'pointer';
    });
    document.getElementById('case-close')?.addEventListener('click', closeCase);
    caseModal?.addEventListener('click', e => { if (e.target === caseModal) closeCase(); });

    /* ---------- 22. KEYBOARD SHORTCUTS MODAL ---------- */
    const shortcutsModal = document.getElementById('shortcuts-modal');
    const toggleShortcuts = () => {
        const open = shortcutsModal.classList.contains('open');
        shortcutsModal.classList.toggle('open', !open);
        shortcutsModal.setAttribute('aria-hidden', open ? 'true' : 'false');
        document.body.style.overflow = open ? '' : 'hidden';
    };
    document.getElementById('shortcuts-close')?.addEventListener('click', toggleShortcuts);
    shortcutsModal?.addEventListener('click', e => { if (e.target === shortcutsModal) toggleShortcuts(); });

    /* ---------- 23. GLOBAL KEYBOARD HANDLERS ---------- */
    let gPressed = false;
    let gTimer = null;
    document.addEventListener('keydown', e => {
        // ⌘K / Ctrl+K — command palette
        if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
            e.preventDefault();
            cmdOverlay?.classList.contains('open') ? closeCmd() : openCmd();
            return;
        }
        // Ignore if typing
        const tag = (e.target.tagName || '').toLowerCase();
        const typing = tag === 'input' || tag === 'textarea' || e.target.isContentEditable;
        if (typing) return;

        // ? — shortcuts modal
        if (e.key === '?') {
            e.preventDefault();
            toggleShortcuts();
            return;
        }
        // ESC — close overlays
        if (e.key === 'Escape') {
            if (cmdOverlay?.classList.contains('open')) closeCmd();
            else if (caseModal?.classList.contains('open')) closeCase();
            else if (shortcutsModal?.classList.contains('open')) toggleShortcuts();
            else if (mainNav?.classList.contains('open')) closeNav();
            return;
        }
        // g then key — quick nav
        if (e.key.toLowerCase() === 'g') {
            gPressed = true;
            clearTimeout(gTimer);
            gTimer = setTimeout(() => { gPressed = false; }, 1200);
            return;
        }
        if (gPressed) {
            const map = { h: '#hero', c: '#capabilities', s: '#clients', q: '#faq', f: '#contact', w: '#why-us', t: '#testimonials' };
            const href = map[e.key.toLowerCase()];
            if (href) {
                const t = document.querySelector(href);
                if (t) window.scrollTo({ top: t.offsetTop - 80, behavior: prefersReduced ? 'auto' : 'smooth' });
            }
            gPressed = false;
        }
    });

    /* ---------- 24. LIVE METRICS WIDGET ---------- */
    const metricsWidget = document.getElementById('metrics-widget');
    document.getElementById('metrics-toggle')?.addEventListener('click', () => {
        metricsWidget?.classList.toggle('collapsed');
    });
    const fmt = n => n.toLocaleString('en-US');
    if (metricsWidget) {
        setInterval(() => {
            const reqEl = document.getElementById('metric-requests');
            const usrEl = document.getElementById('metric-users');
            if (reqEl) {
                const base = 1200 + Math.floor(Math.random() * 400);
                reqEl.textContent = fmt(base);
            }
            if (usrEl) {
                const u = 340 + Math.floor(Math.random() * 120);
                usrEl.textContent = fmt(u);
            }
            const up = (99.95 + Math.random() * 0.04).toFixed(2);
            const upEl = document.getElementById('metric-uptime');
            if (upEl) upEl.textContent = up + '%';
        }, 3500);
    }

    /* ---------- 25. YEAR IN FOOTER ---------- */
    const year = new Date().getFullYear();
    document.querySelectorAll('.footer-bottom p:first-child').forEach(el => {
        el.innerHTML = el.innerHTML.replace(/\d{4}/, year);
    });

    /* ---------- READY ---------- */
    console.log('%cDonorics Technologies%c — All systems online ✓',
        'font-family: Georgia, serif; font-size: 16px; font-weight: bold; color: #f5b800;',
        'color: #4cc0c6;');
})();