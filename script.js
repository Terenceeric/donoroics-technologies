/* ============================================================
   DONORICS TECHNOLOGIES — script.js
   Complete, consolidated · All features & fixes
   ============================================================ */

(function () {
    'use strict';

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isTouch = window.matchMedia('(hover: none)').matches;

    /* --------------------------------------------------------
       1. PAGE LOADER
       -------------------------------------------------------- */
    const loader = document.getElementById('page-loader');
    const loaderProgress = document.getElementById('loader-progress');
    const hasLoadedBefore = sessionStorage.getItem('donorics-loaded');
    let loadProgress = 0;
    let loaderTick = null;

    if (hasLoadedBefore) {
        loader?.classList.add('hidden');
        setTimeout(() => loader?.remove(), 400);
    } else {
        loaderTick = setInterval(() => {
            loadProgress = Math.min(loadProgress + Math.random() * 18 + 6, 100);
            if (loaderProgress) {
                loaderProgress.style.strokeDashoffset = 276 - (loadProgress / 100) * 276;
            }
            if (loadProgress >= 100) {
                clearInterval(loaderTick);
                setTimeout(() => {
                    loader?.classList.add('hidden');
                    sessionStorage.setItem('donorics-loaded', '1');
                    setTimeout(() => loader?.remove(), 700);
                }, 250);
            }
        }, 160);
    }

    /* --------------------------------------------------------
       2. CUSTOM CURSOR
       -------------------------------------------------------- */
    const cursorDot = document.getElementById('cursor-dot');
    const cursorRing = document.getElementById('cursor-ring');
    if (!isTouch && !prefersReduced && cursorDot && cursorRing) {
        let mx = 0, my = 0, rx = 0, ry = 0;
        document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
        const animateCursor = () => {
            rx += (mx - rx) * 0.18;
            ry += (my - ry) * 0.18;
            cursorDot.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;
            cursorRing.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
            requestAnimationFrame(animateCursor);
        };
        animateCursor();

        document.querySelectorAll('a, button, .spotlight, .chip, .reading-dot').forEach(el => {
            el.addEventListener('mouseenter', () => cursorRing.classList.add('hover'));
            el.addEventListener('mouseleave', () => cursorRing.classList.remove('hover'));
        });
        document.addEventListener('mousedown', () => cursorRing.classList.add('click'));
        document.addEventListener('mouseup', () => cursorRing.classList.remove('click'));
    }

    /* --------------------------------------------------------
       3. HEADER SCROLL STATE
       -------------------------------------------------------- */
    const header = document.getElementById('site-header');
    const onScrollHeader = () => header?.classList.toggle('scrolled', window.scrollY > 40);
    window.addEventListener('scroll', onScrollHeader, { passive: true });
    onScrollHeader();

    /* --------------------------------------------------------
       4. SCROLL PROGRESS + BACK TO TOP
       -------------------------------------------------------- */
    const progressBar = document.getElementById('scroll-progress-bar');
    const backTop = document.getElementById('back-top');
    const btRing = document.getElementById('bt-ring');
    let progressRAF = null;

    const updateProgress = () => {
        const doc = document.documentElement;
        const scrolled = doc.scrollTop;
        const total = doc.scrollHeight - doc.clientHeight;
        const pct = total > 0 ? (scrolled / total) * 100 : 0;
        if (progressBar) progressBar.style.width = pct + '%';
        if (btRing) btRing.style.strokeDashoffset = 100 - pct;
        backTop?.classList.toggle('visible', scrolled > 500);
        progressRAF = null;
    };

    window.addEventListener('scroll', () => {
        if (!progressRAF) progressRAF = requestAnimationFrame(updateProgress);
    }, { passive: true });
    updateProgress();

    backTop?.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: prefersReduced ? 'auto' : 'smooth' });
        playSound('click');
    });

    /* --------------------------------------------------------
       5. MOBILE NAV
       -------------------------------------------------------- */
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

    /* --------------------------------------------------------
       6. ACTIVE NAV ON SCROLL
       -------------------------------------------------------- */
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

    /* --------------------------------------------------------
       7. SMOOTH SCROLL
       -------------------------------------------------------- */
    document.querySelectorAll('a[href^="#"]').forEach(a => {
        a.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (!href || href === '#') return;
            const t = document.querySelector(href);
            if (!t) return;
            e.preventDefault();
            window.scrollTo({ top: t.offsetTop - 80, behavior: prefersReduced ? 'auto' : 'smooth' });
            history.pushState(null, null, href);
        });
    });

    /* --------------------------------------------------------
       8. SCROLL REVEAL (AOS)
       -------------------------------------------------------- */
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

    /* --------------------------------------------------------
       9. TIMELINE REVEAL
       -------------------------------------------------------- */
    const timelineSteps = document.querySelectorAll('.timeline-step');
    if ('IntersectionObserver' in window) {
        const tio = new IntersectionObserver((entries, obs) => {
            entries.forEach(e => {
                if (e.isIntersecting) {
                    const step = e.target;
                    const delay = (parseInt(step.getAttribute('data-step'), 10) - 1) * 120;
                    setTimeout(() => step.classList.add('in-view'), delay);
                    obs.unobserve(step);
                }
            });
        }, { threshold: 0.3 });
        timelineSteps.forEach(s => tio.observe(s));
    } else {
        timelineSteps.forEach(s => s.classList.add('in-view'));
    }

    /* --------------------------------------------------------
       10. COUNTERS
       -------------------------------------------------------- */
    const counters = document.querySelectorAll('.stat-number');
    const animateCounter = el => {
        const target = parseInt(el.getAttribute('data-count'), 10) || 0;
        const duration = 1800;
        const start = performance.now();
        const tick = now => {
            const p = Math.min((now - start) / duration, 1);
            el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
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
    }

    /* --------------------------------------------------------
       11. FAQ ACCORDION
       -------------------------------------------------------- */
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const q = item.querySelector('.faq-question');
        const a = item.querySelector('.faq-answer');
        if (!q || !a) return;
        q.addEventListener('click', () => {
            const isOpen = item.classList.contains('open');
            faqItems.forEach(o => {
                if (o !== item) {
                    o.classList.remove('open');
                    o.querySelector('.faq-answer').style.maxHeight = '0px';
                    o.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
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

    /* --------------------------------------------------------
       12. TOAST NOTIFICATIONS
       -------------------------------------------------------- */
    const toastContainer = document.getElementById('toast-container');
    const toastIcons = { success: 'ph-check-circle', error: 'ph-x-circle', info: 'ph-info' };

    window.showToast = (type, title, message, duration = 4000) => {
        if (!toastContainer) return;
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <div class="toast-icon"><i class="ph ${toastIcons[type] || toastIcons.info}"></i></div>
            <div class="toast-content">
                <div class="toast-title">${title}</div>
                ${message ? `<div class="toast-message">${message}</div>` : ''}
            </div>
            <button class="toast-close" aria-label="Close"><i class="ph ph-x"></i></button>
            <div class="toast-progress" style="animation-duration:${duration}ms"></div>`;
        toastContainer.appendChild(toast);
        requestAnimationFrame(() => toast.classList.add('show'));

        const remove = () => {
            toast.classList.remove('show');
            toast.classList.add('hide');
            setTimeout(() => toast.remove(), 400);
        };
        toast.querySelector('.toast-close').addEventListener('click', remove);
        setTimeout(remove, duration);
    };

    /* --------------------------------------------------------
       13. SOUND DESIGN (with toggle switch)
       -------------------------------------------------------- */
    let soundOn = false;
    const soundBtn = document.getElementById('sound-btn');
    const soundIcon = document.getElementById('sound-icon');
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    let audioCtx = null;

    const playSound = (type = 'click') => {
        if (!soundOn || !AudioCtx) return;
        try {
            if (!audioCtx) audioCtx = new AudioCtx();
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            const now = audioCtx.currentTime;
            if (type === 'click') {
                osc.frequency.setValueAtTime(880, now);
                osc.frequency.exponentialRampToValueAtTime(440, now + 0.08);
                gain.gain.setValueAtTime(0.04, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
                osc.start(now);
                osc.stop(now + 0.1);
            } else if (type === 'success') {
                osc.frequency.setValueAtTime(523, now);
                osc.frequency.setValueAtTime(659, now + 0.08);
                osc.frequency.setValueAtTime(784, now + 0.16);
                gain.gain.setValueAtTime(0.05, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
                osc.start(now);
                osc.stop(now + 0.3);
            }
        } catch (e) { /* silent fail */ }
    };

    soundBtn?.addEventListener('click', () => {
        soundOn = !soundOn;
        soundBtn.setAttribute('aria-checked', soundOn ? 'true' : 'false');
        if (soundIcon) {
            soundIcon.className = `ph ph-speaker-${soundOn ? 'high' : 'slash'}`;
        }
        if (soundOn) {
            window.showToast('info', 'Sound enabled', 'UI sounds are now active.');
            playSound('success');
        }
    });

    /* --------------------------------------------------------
       14. LIVE TIME (Accra)
       -------------------------------------------------------- */
    const timeEl = document.getElementById('live-time');
    const updateTime = () => {
        if (!timeEl) return;
        const accra = new Intl.DateTimeFormat('en-GB', {
            timeZone: 'Africa/Accra',
            hour: '2-digit', minute: '2-digit', second: '2-digit',
            hour12: false
        }).format(new Date());
        timeEl.textContent = accra + ' GMT';
    };
    updateTime();
    setInterval(updateTime, 1000);

    /* --------------------------------------------------------
       15. READING PROGRESS DOTS
       -------------------------------------------------------- */
    const rp = document.getElementById('reading-progress');
    if (rp) {
        const targets = Array.from(document.querySelectorAll('section[id]'));
        const dots = targets.map(sec => {
            const b = document.createElement('button');
            b.className = 'reading-dot';
            b.setAttribute('data-label', sec.querySelector('.section-tag')?.textContent || sec.id);
            b.setAttribute('aria-label', 'Go to ' + sec.id);
            b.addEventListener('click', () => {
                window.scrollTo({ top: sec.offsetTop - 80, behavior: prefersReduced ? 'auto' : 'smooth' });
            });
            rp.appendChild(b);
            return { el: b, sec };
        });
        const updateDots = () => {
            const pos = window.scrollY + window.innerHeight * 0.4;
            let activeIdx = 0;
            dots.forEach((d, i) => { if (pos >= d.sec.offsetTop) activeIdx = i; });
            dots.forEach((d, i) => d.el.classList.toggle('active', i === activeIdx));
        };
        window.addEventListener('scroll', updateDots, { passive: true });
        updateDots();
    }

    /* --------------------------------------------------------
       16. CURSOR SPOTLIGHT
       -------------------------------------------------------- */
    if (!isTouch && !prefersReduced) {
        document.querySelectorAll('.spotlight').forEach(card => {
            card.addEventListener('mousemove', e => {
                const r = card.getBoundingClientRect();
                card.style.setProperty('--mx', `${e.clientX - r.left}px`);
                card.style.setProperty('--my', `${e.clientY - r.top}px`);
            });
        });
    }

    /* --------------------------------------------------------
       17. 3D TILT ON CARDS
       -------------------------------------------------------- */
    if (!isTouch && !prefersReduced) {
        document.querySelectorAll('.capability-card, .challenge-card, .client-card, .team-card').forEach(card => {
            card.addEventListener('mousemove', e => {
                const r = card.getBoundingClientRect();
                const x = e.clientX - r.left;
                const y = e.clientY - r.top;
                const rx = ((y - r.height / 2) / r.height) * -5;
                const ry = ((x - r.width / 2) / r.width) * 5;
                card.style.transform = `translateY(-8px) perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg)`;
            });
            card.addEventListener('mouseleave', () => { card.style.transform = ''; });
        });
    }

    /* --------------------------------------------------------
       18. MAGNETIC BUTTONS
       -------------------------------------------------------- */
    if (!isTouch && !prefersReduced) {
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

    /* --------------------------------------------------------
       19. RIPPLE
       -------------------------------------------------------- */
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
            playSound('click');
        });
    });

    /* --------------------------------------------------------
       20. TEXT SCRAMBLE
       -------------------------------------------------------- */
    const scrambleChars = '!<>-_\\/[]{}—=+*^?#________';
    const scrambleEl = el => {
        const target = el.textContent;
        const queue = Array.from({ length: target.length }, (_, i) => ({
            from: target[i], to: target[i],
            start: Math.floor(Math.random() * 20),
            end: Math.floor(Math.random() * 20) + 20,
            char: null
        }));
        let frame = 0;
        const tick = () => {
            let output = '', done = 0;
            for (const q of queue) {
                if (frame >= q.end) { done++; output += q.to; }
                else if (frame >= q.start) {
                    if (!q.char || Math.random() < 0.28)
                        q.char = scrambleChars[Math.floor(Math.random() * scrambleChars.length)];
                    output += `<span class="scramble-char">${q.char}</span>`;
                } else output += q.to;
            }
            el.innerHTML = output;
            if (done === queue.length) return;
            frame++;
            requestAnimationFrame(tick);
        };
        tick();
    };
    if (!prefersReduced && 'IntersectionObserver' in window) {
        const so = new IntersectionObserver((entries, obs) => {
            entries.forEach(e => {
                if (e.isIntersecting) {
                    setTimeout(() => scrambleEl(e.target), 100);
                    obs.unobserve(e.target);
                }
            });
        }, { threshold: 0.5 });
        document.querySelectorAll('[data-scramble]').forEach(t => so.observe(t));
    }

    /* --------------------------------------------------------
       21. SVG DIVIDER ANIMATION
       -------------------------------------------------------- */
    if ('IntersectionObserver' in window) {
        const dio = new IntersectionObserver((entries, obs) => {
            entries.forEach(e => {
                if (e.isIntersecting) {
                    e.target.classList.add('in-view');
                    obs.unobserve(e.target);
                }
            });
        }, { threshold: 0.3 });
        document.querySelectorAll('.section-divider').forEach(d => dio.observe(d));
    }

    /* --------------------------------------------------------
       22. NOTIFICATION BELL
       -------------------------------------------------------- */
    const bellBtn = document.getElementById('bell-btn');
    const bellPanel = document.getElementById('bell-panel');
    const langPanel = document.getElementById('lang-panel');

    bellBtn?.addEventListener('click', e => {
        e.stopPropagation();
        bellPanel?.classList.toggle('open');
        langPanel?.classList.remove('open');
    });

    document.getElementById('bell-clear')?.addEventListener('click', () => {
        document.querySelectorAll('.bell-item').forEach(i => i.remove());
        const badge = bellBtn?.querySelector('.bell-badge');
        if (badge) badge.remove();
        bellBtn?.classList.remove('has-new');
        window.showToast('success', 'Notifications cleared', 'All caught up.');
    });

    /* --------------------------------------------------------
       23. LANGUAGE SWITCHER
       -------------------------------------------------------- */
    const translations = {
        tw: {
            'nav.challenge': 'Ɔsɛnkɔ', 'nav.what': 'Yɛn Ne Hwan', 'nav.capabilities': 'Yɛn Adwuma',
            'nav.process': 'Ɔkwan', 'nav.team': 'Yɛn Nnipa', 'nav.clients': 'Yɛn Ananmusifo', 'nav.faq': 'Nsɛmmisa',
            'header.demo': 'Bɔ Yɛn So', 'header.accra': 'Accra',
            'hero.badge': 'Yɛreboa Ghana fi 2013', 'hero.cta1': 'Hwɛ Yɛn Adwuma', 'hero.cta2': 'Bɔ Yɛn So',
            'hero.sub': 'Donorics Technologies yɛ Ghana technology adwuma a ɛboa nnipa wɔ Adesua, E-Commerce, Ayaresabea, ne Kar ne Kar mu.',
            'hero.title': 'Yɛte Nnipa Asɛm Ho <span class="text-accent">Technology</span> So',
            'stat.years': 'Mfe a Yɛadi', 'stat.subs': 'Adwuma Ahodoɔ', 'stat.industries': 'Adwuma Fã', 'stat.uptime': 'Ɔsom Pa %',
            'challenge.tag': 'Ɔsɛnkɔ', 'challenge.title': 'Ɔhaw a Sukuu Hwɛ',
            'challenge.c1t': 'Nneɛma a Ɛnka', 'challenge.c1d': 'Nhyehyɛe ahodoɔ di nkɔsoɔ so wɔ kwan ahodoɔ so a ɛnka.',
            'challenge.c2t': 'Nsaano Nnwuma', 'challenge.c2d': 'Adwumayɛfoɔ yɛ nsaano nnwuma de siesie nhyehyɛe a ɛnka.',
            'challenge.c3t': 'Nhwɛsoɔ Kakra', 'challenge.c3d': 'Akannifoɔ nni nsɛm pɛpɛɛpɛ a ɛfa adwuma ho.',
            'challenge.c4t': 'Adwuma Mu Nsɛm', 'challenge.c4d': 'Adwumayɛfoɔ te nneɛma nyinaa mu.',
            'what.tag': 'Deɛ Donorics Yɛ', 'what.title': 'Sistema Baako. Ntɛm. Zero.',
            'what.p1': 'Donorics Technologies yɛ nhyehyɛeɛ a ɛdan nnipa asɛm mu yɛ adwuma baako.',
            'what.p2': 'Yɛde adwuma nsɛm nyinaa ba baabi koro.',
            'what.cta': 'Hwɛ Yɛn Platform',
            'visual.title': 'AI Nsɛm', 'visual.f1': 'Nsɛm a ɛba ntɛm', 'visual.f2': 'Ahobammɔ',
            'cap.tag': 'Yɛn Tumi', 'cap.title': 'Adwuma & Services',
            'cap.desc': 'Yɛn adwuma ahodoɔ a ɛboa nnipa wɔ adwuma ahodoɔ mu.',
            'proc.tag': 'Sɛnea Yɛyɛ Adwuma', 'proc.title': 'Fi Adwene Kosi Nkɔso',
            'proc.desc': 'Ɔkwan a yɛfa so yɛ adwuma a ɛyɛ 40+ wɔ Ghana.',
            'proc.s1t': 'Nhwehwɛmu', 'proc.s1d': 'Yɛhwɛ wo adwuma so, tie wo team, na yɛhu nsɛm.',
            'proc.s2t': 'Nhwɛsoɔ', 'proc.s2d': 'Yɛyɛ nhyehyɛeɛ na yɛne wo team di ho nkɔmmɔ.',
            'proc.s3t': 'Yɛ', 'proc.s3d': 'Yɛyɛ adwuma ntɛmntɛm na wuhu nkɔsoɔ.',
            'proc.s4t': 'Fi Ase', 'proc.s4d': 'Yɛde adwuma no bɛhyɛ wo nsa mu a ɛnyɛ den.',
            'proc.s5t': 'Mmoa', 'proc.s5d': 'Yɛhwɛ adwuma no so 24/7.',
            'team.tag': 'Akannifoɔ', 'team.title': 'Nnipa a Wɔwɔ Donorics',
            'team.desc': 'Ghana nnipa a wɔyɛ Ghana technology ma wiase.',
            'team.r1': 'Ɔhwɛfoɔ Panyin', 'team.b1': 'Mfe 15 akannifoɔ wɔ Africa technology mu.',
            'team.r2': 'Ɔhwɛfoɔ a Ɔhwɛ Technology So', 'team.b2': 'Systems architect a ɔwɔ nimdeɛ wɔ AI mu.',
            'team.r3': 'Ɔhwɛfoɔ a Ɔhwɛ Nneɛma So', 'team.b3': 'Ɔyɛ nneɛma a ɛboa nnipa. Ex-Google.',
            'team.r4': 'Ɔhwɛfoɔ a Ɔhwɛ Nnipa So', 'team.b4': 'Ɔhwɛ yɛn mmoa team ne client nyinaa so.',
            'dash.tag': 'Demo a Ɛrekɔ So', 'dash.title': 'Deɛ Yɛn Ananmusifo Hwɛ',
            'dash.desc': 'Eagle Hall dashboard a sukuu ahodoɔ wɔ Ghana de di dwuma.',
            'why.tag': 'Deɛ Enti Sukuu Paw Donorics', 'why.title': 'Yɛyɛ Adwuma Kɛse. Yɛwɔ Nimdeɛ.',
            'why.desc': 'Yɛboa adwuma kɛse wɔ baabi ahodoɔ.',
            'why.w1t': 'Nokware', 'why.w1d': '99%+ osom pa wɔ platform nyinaa so.',
            'why.w2t': 'Ahobammɔ', 'why.w2d': 'Ahobammɔ kɛse de bɔ wo nsɛm ho ban.',
            'why.w3t': 'Kɛse', 'why.w3d': 'Nhyehyɛe a ɛkɔ so kɛse.',
            'why.w4t': 'Mmoa 24/7', 'why.w4d': 'Mmoa nyinaa a ebi nni hɔ.',
            'quote': '"Ghana, technology nyɛ anikaa nko — ɛyɛ nokware, gyidie, ne nsɛm a ɛyɛ nokware."',
            'clients.tag': 'Yɛn Ananmusifo', 'clients.title': 'Nnipa a Wɔfoa Yɛn',
            'clients.desc': 'Fi sukuu kosi afahyɛ, restaurant kosi shop — yɛyɛ technology ma Ghana.',
            'map.title': 'Baabi a Yɛwɔ', 'map.desc': 'Yɛwɔ Ghana mmeaeɛ nyinaa.',
            'test.tag': 'Deɛ Nya Nnyinasoɔ', 'test.title': 'Nya Pa Ma Daakye',
            'faq.tag': 'Nsɛmmisa', 'faq.title': 'Nsɛmmisa a Wɔtaa Bisa',
            'contact.tag': 'Fi Ase', 'contact.title': 'Woayɛ Krado Sɛ Wobɛsesa?',
            'contact.desc': 'Ma yɛnkɔmmɔ sɛnea Donorics Technologies bɛboa wo.',
            'form.name': 'Din Nyinaa', 'form.company': 'Adwuma', 'form.role': 'Wo Dwuma',
            'form.email': 'Email', 'form.message': 'Yɛbɛyɛ dɛn aboa?', 'form.send': 'Soma',
            'form.next': 'Kɔ So', 'form.back': 'San Kɔ', 'form.interest': 'Me pɛ',
            'form.budget': 'Sika a Wobɛtumi', 'step.about': 'Yɛn Ho', 'step.project': 'Adwuma', 'step.contact': 'Nkitahodi',
            'footer.about': 'Ghana technology adwuma a ɛboa nnipa fi 2013.',
            'footer.subs': 'Yɛn Adwuma', 'footer.company': 'Adwuma', 'footer.support': 'Mmoa',
            'footer.newsletter': 'Bɛka Yɛn Ho', 'footer.newsletterHint': 'Nkɔso amanneɛbɔ, spam biara nni hɔ.',
            'skip': 'Kɔ Nsɛm So'
        }
    };

    const applyLang = lang => {
        const dict = lang === 'tw' ? translations.tw : {};
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (!el.getAttribute('data-i18n-orig')) {
                el.setAttribute('data-i18n-orig', el.innerHTML);
            }
            const orig = el.getAttribute('data-i18n-orig');
            el.innerHTML = dict[key] || orig;
        });
        const labelEl = document.getElementById('lang-label');
        if (labelEl) labelEl.textContent = lang.toUpperCase();
        localStorage.setItem('donorics-lang', lang);
        document.documentElement.setAttribute('lang', lang);
    };

    const langBtn = document.getElementById('lang-btn');
    langBtn?.addEventListener('click', e => {
        e.stopPropagation();
        langPanel?.classList.toggle('open');
        bellPanel?.classList.remove('open');
    });

    langPanel?.querySelectorAll('button').forEach(b => {
        b.addEventListener('click', () => {
            const lang = b.getAttribute('data-lang');
            applyLang(lang);
            langPanel.classList.remove('open');
            window.showToast('success', lang === 'tw' ? 'Kasa no asesa!' : 'Language changed!', lang === 'tw' ? 'Yɛn kasa yɛ Twi seesei.' : 'Switched to English.');
        });
    });

    const savedLang = localStorage.getItem('donorics-lang');
    if (savedLang && savedLang !== 'en') applyLang(savedLang);

    /* --------------------------------------------------------
       24. THEME TOGGLE SWITCH
       -------------------------------------------------------- */
    const themeBtn = document.getElementById('theme-btn');
    const themeIcon = document.getElementById('theme-icon');

    const setTheme = theme => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('donorics-theme', theme);
        if (themeBtn) {
            themeBtn.setAttribute('aria-checked', theme === 'dark' ? 'true' : 'false');
        }
        if (themeIcon) {
            themeIcon.className = theme === 'dark' ? 'ph ph-moon' : 'ph ph-sun';
        }
    };

    setTheme(localStorage.getItem('donorics-theme') || 'dark');

    themeBtn?.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        setTheme(next);
        window.showToast('info', next === 'dark' ? 'Dark mode on' : 'Light mode on');
    });

    /* --------------------------------------------------------
       25. CLOSE PANELS ON OUTSIDE CLICK
       -------------------------------------------------------- */
    document.addEventListener('click', e => {
        if (!bellPanel?.contains(e.target) && !bellBtn?.contains(e.target)) bellPanel?.classList.remove('open');
        if (!langPanel?.contains(e.target) && !langBtn?.contains(e.target)) langPanel?.classList.remove('open');
    });

    /* --------------------------------------------------------
       26. COMMAND PALETTE
       -------------------------------------------------------- */
    const cmdOverlay = document.getElementById('cmd-overlay');
    const cmdInput = document.getElementById('cmd-input');
    const cmdResults = document.getElementById('cmd-results');
    let cmdItems = [];
    let cmdSelected = 0;

    const cmdData = [
        { group: 'Sections', items: [
            { title: 'The Challenge', icon: 'ph-warning-circle', href: '#challenge' },
            { title: 'What We Are', icon: 'ph-info', href: '#what-is' },
            { title: 'Our Capabilities', icon: 'ph-cpu', href: '#capabilities' },
            { title: 'How We Work', icon: 'ph-path', href: '#process' },
            { title: 'Our Team', icon: 'ph-users', href: '#team' },
            { title: 'Live Dashboard', icon: 'ph-chart-line-up', href: '#dashboard' },
            { title: 'Why Us', icon: 'ph-seal-check', href: '#why-us' },
            { title: 'Our Clients', icon: 'ph-buildings', href: '#clients' },
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
            { title: 'Toggle Dark / Light', icon: 'ph-circle-half', hint: 'Theme', action: () => themeBtn?.click() },
            { title: 'Toggle Sound', icon: 'ph-speaker-high', hint: 'Audio', action: () => soundBtn?.click() },
            { title: 'Send us an email', icon: 'ph-paper-plane-tilt', hint: 'Email', action: () => { window.location.href = 'mailto:hello@donorics.com'; } },
            { title: 'Copy company email', icon: 'ph-copy', hint: 'Copy', action: () => {
                navigator.clipboard.writeText('hello@donorics.com');
                window.showToast('success', 'Copied!', 'hello@donorics.com copied to clipboard.');
            }},
            { title: 'Show keyboard shortcuts', icon: 'ph-keyboard', hint: '?', action: () => {
                document.getElementById('shortcuts-modal')?.classList.add('open');
            }}
        ]}
    ];

    const renderCmd = (filter = '') => {
        if (!cmdResults) return;
        const q = filter.toLowerCase().trim();
        cmdResults.innerHTML = '';
        cmdItems = [];
        cmdSelected = 0;
        cmdData.forEach(group => {
            const filtered = group.items.filter(it =>
                !q || it.title.toLowerCase().includes(q) || (it.hint && it.hint.toLowerCase().includes(q)));
            if (!filtered.length) return;
            const lbl = document.createElement('div');
            lbl.className = 'cmd-group-label';
            lbl.textContent = group.group;
            cmdResults.appendChild(lbl);
            filtered.forEach(it => {
                const idx = cmdItems.length;
                const btn = document.createElement('button');
                btn.className = 'cmd-item';
                btn.innerHTML = `<i class="ph ${it.icon}"></i><span class="cmd-item-title">${it.title}</span>${it.hint ? `<span class="cmd-item-hint">${it.hint}</span>` : ''}`;
                btn.addEventListener('click', () => runCmd(it));
                btn.addEventListener('mouseenter', () => { cmdSelected = idx; updateCmdSelection(); });
                cmdResults.appendChild(btn);
                cmdItems.push({ el: btn, data: it });
            });
        });
        if (!cmdItems.length) cmdResults.innerHTML = '<div class="cmd-empty">No results found</div>';
        updateCmdSelection();
    };

    const updateCmdSelection = () => {
        cmdItems.forEach((it, i) => it.el.classList.toggle('selected', i === cmdSelected));
        cmdItems[cmdSelected]?.el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    };

    const runCmd = item => {
        closeCmd();
        if (item.action) return item.action();
        if (item.href) {
            const t = document.querySelector(item.href);
            if (t) window.scrollTo({ top: t.offsetTop - 80, behavior: prefersReduced ? 'auto' : 'smooth' });
        }
    };

    const openCmd = () => {
        cmdOverlay?.classList.add('open');
        cmdOverlay?.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        if (cmdInput) cmdInput.value = '';
        renderCmd('');
        setTimeout(() => cmdInput?.focus(), 100);
    };
    const closeCmd = () => {
        cmdOverlay?.classList.remove('open');
        cmdOverlay?.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    };

    document.getElementById('kbd-trigger')?.addEventListener('click', openCmd);
    cmdOverlay?.addEventListener('click', e => { if (e.target === cmdOverlay) closeCmd(); });
    cmdInput?.addEventListener('input', e => renderCmd(e.target.value));
    cmdInput?.addEventListener('keydown', e => {
        if (e.key === 'ArrowDown') { e.preventDefault(); cmdSelected = (cmdSelected + 1) % cmdItems.length; updateCmdSelection(); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); cmdSelected = (cmdSelected - 1 + cmdItems.length) % cmdItems.length; updateCmdSelection(); }
        else if (e.key === 'Enter') { e.preventDefault(); if (cmdItems[cmdSelected]) runCmd(cmdItems[cmdSelected].data); }
        else if (e.key === 'Escape') closeCmd();
    });

    /* --------------------------------------------------------
       27. CASE STUDY MODALS
       -------------------------------------------------------- */
    const caseData = {
        oguaa: { badge: 'Education', title: 'Oguaa Hall', subtitle: 'University of Cape Coast',
            metrics: [['-62%', 'Admin time'], ['2,400+', 'Students'], ['99.9%', 'Uptime']],
            desc: 'Oguaa Hall needed a modern system to handle room allocation, payments, and student records for thousands of residents. We deployed the Eagle Hall Management System, digitising every workflow.',
            quote: '"Room allocation used to take weeks. Now it\'s a single afternoon." — Hall Administrator' },
        ghartey: { badge: 'Education', title: 'Ghartey Hall', subtitle: 'University of Education, Winneba',
            metrics: [['-71%', 'Processing time'], ['1,800+', 'Residents'], ['100%', 'Digital']],
            desc: 'Ghartey Hall required a system that could scale with growing enrolment while keeping payments, attendance, and reporting accurate. Eagle Hall gave staff a single dashboard.',
            quote: '"Our audit process went from days to hours." — Bursar' },
        mabels: { badge: 'Hospitality', title: "Mabel's Table", subtitle: 'Restaurant & Dining',
            metrics: [['+34%', 'Throughput'], ['-45%', 'Wait times'], ['4.9/5', 'Rating']],
            desc: "Mabel's Table was losing orders during peak hours. DTA digitised the entire floor: tables, orders, billing, and customer service.",
            quote: '"The dinner rush no longer feels like chaos." — Owner' },
        panafest: { badge: 'Culture', title: 'PANAFEST', subtitle: 'Pan African Historical Theatre Festival',
            metrics: [['50k+', 'Visitors'], ['12', 'Events'], ['3×', 'Engagement']],
            desc: 'PANAFEST needed a digital home for one of Africa\'s most important festivals. We built a platform to manage registrations, schedules, artist profiles, and audience engagement.',
            quote: '"Our festival now has a digital legacy that lives year-round." — Director' },
        adotale: { badge: 'Retail', title: 'ADOTALE', subtitle: 'Commerce & Retail',
            metrics: [['+180%', 'Sales'], ['8,000+', 'SKUs'], ['24/7', 'Operations']],
            desc: 'ADOTALE wanted to scale beyond a single storefront. Using Click Next, they launched a fully integrated online store with secure payments and real-time logistics.',
            quote: '"Click Next turned our shop into a national business." — Founder' }
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
            .map(m => `<div class="case-metric"><span class="case-metric-value">${m[0]}</span><span class="case-metric-label">${m[1]}</span></div>`).join('');
        caseModal.classList.add('open');
        caseModal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    };
    const closeCase = () => {
        caseModal.classList.remove('open');
        caseModal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    };
    document.getElementById('case-close')?.addEventListener('click', closeCase);
    caseModal?.addEventListener('click', e => { if (e.target === caseModal) closeCase(); });

    /* --------------------------------------------------------
       28. VIDEO MODAL
       -------------------------------------------------------- */
    const videoModal = document.getElementById('video-modal');
    document.getElementById('video-thumb')?.addEventListener('click', () => {
        const embed = document.getElementById('video-embed');
        if (embed) embed.innerHTML = '<div style="color:rgba(255,255,255,0.6); padding:40px; text-align:center;">🎬 Video placeholder — replace with your YouTube/Vimeo embed iframe.</div>';
        videoModal?.classList.add('open');
        videoModal?.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    });
    const closeVideo = () => {
        videoModal?.classList.remove('open');
        videoModal?.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        const embed = document.getElementById('video-embed');
        if (embed) embed.innerHTML = '';
    };
    document.getElementById('video-close')?.addEventListener('click', closeVideo);
    videoModal?.addEventListener('click', e => { if (e.target === videoModal) closeVideo(); });

    /* --------------------------------------------------------
       29. KEYBOARD SHORTCUTS MODAL
       -------------------------------------------------------- */
    const shortcutsModal = document.getElementById('shortcuts-modal');
    const toggleShortcuts = () => {
        const open = shortcutsModal.classList.contains('open');
        shortcutsModal.classList.toggle('open', !open);
        shortcutsModal.setAttribute('aria-hidden', open ? 'true' : 'false');
        document.body.style.overflow = open ? '' : 'hidden';
    };
    document.getElementById('shortcuts-close')?.addEventListener('click', toggleShortcuts);
    shortcutsModal?.addEventListener('click', e => { if (e.target === shortcutsModal) toggleShortcuts(); });

    /* --------------------------------------------------------
       30. GLOBAL KEYBOARD HANDLERS
       -------------------------------------------------------- */
    let gPressed = false, gTimer = null;
    let konamiIndex = 0;
    const konamiCode = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];

    document.addEventListener('keydown', e => {
        // Konami code
        const key = e.key.toLowerCase();
        const expected = konamiCode[konamiIndex].toLowerCase();
        if (key === expected || e.key === konamiCode[konamiIndex]) {
            konamiIndex++;
            if (konamiIndex === konamiCode.length) {
                konamiIndex = 0;
                triggerKonami();
            }
        } else {
            konamiIndex = 0;
        }

        // ⌘K / Ctrl+K
        if ((e.metaKey || e.ctrlKey) && key === 'k') {
            e.preventDefault();
            cmdOverlay?.classList.contains('open') ? closeCmd() : openCmd();
            return;
        }

        const tag = (e.target.tagName || '').toLowerCase();
        const typing = tag === 'input' || tag === 'textarea' || tag === 'select' || e.target.isContentEditable;
        if (typing) return;

        if (e.key === '?') { e.preventDefault(); toggleShortcuts(); return; }

        if (e.key === 'Escape') {
            if (cmdOverlay?.classList.contains('open')) closeCmd();
            else if (caseModal?.classList.contains('open')) closeCase();
            else if (videoModal?.classList.contains('open')) closeVideo();
            else if (shortcutsModal?.classList.contains('open')) toggleShortcuts();
            else if (mainNav?.classList.contains('open')) closeNav();
            return;
        }

        if (key === 'g') {
            gPressed = true;
            clearTimeout(gTimer);
            gTimer = setTimeout(() => gPressed = false, 1200);
            return;
        }

        if (gPressed) {
            const map = {
                h: '#hero', c: '#capabilities', s: '#clients', q: '#faq', f: '#contact',
                w: '#why-us', t: '#testimonials', p: '#process', m: '#team', d: '#dashboard'
            };
            const href = map[key];
            if (href) {
                const t = document.querySelector(href);
                if (t) window.scrollTo({ top: t.offsetTop - 80, behavior: prefersReduced ? 'auto' : 'smooth' });
            }
            gPressed = false;
        }
    });

    /* --------------------------------------------------------
       31. KONAMI EASTER EGG
       -------------------------------------------------------- */
    const konamiOverlay = document.getElementById('konami-overlay');
    const konamiCanvas = document.getElementById('konami-canvas');
    let konamiRAF = null;

    const triggerKonami = () => {
        if (!konamiOverlay || !konamiCanvas) return;
        konamiOverlay.classList.add('open');
        konamiOverlay.setAttribute('aria-hidden', 'false');

        const ctx = konamiCanvas.getContext('2d');
        const resize = () => {
            konamiCanvas.width = window.innerWidth;
            konamiCanvas.height = window.innerHeight;
        };
        resize();

        const cols = Math.floor(konamiCanvas.width / 20);
        const drops = Array(cols).fill(1);
        const chars = 'DONORICS01アイウエオ';

        const draw = () => {
            ctx.fillStyle = 'rgba(4, 40, 43, 0.1)';
            ctx.fillRect(0, 0, konamiCanvas.width, konamiCanvas.height);
            ctx.fillStyle = '#f5b800';
            ctx.font = '16px monospace';
            drops.forEach((y, i) => {
                const txt = chars[Math.floor(Math.random() * chars.length)];
                ctx.fillText(txt, i * 20, y * 20);
                if (y * 20 > konamiCanvas.height && Math.random() > 0.975) drops[i] = 0;
                drops[i]++;
            });
            konamiRAF = requestAnimationFrame(draw);
        };
        draw();

        window.addEventListener('resize', resize);

        const stop = () => {
            cancelAnimationFrame(konamiRAF);
            window.removeEventListener('resize', resize);
        };

        document.getElementById('konami-close')?.addEventListener('click', () => {
            konamiOverlay.classList.remove('open');
            konamiOverlay.setAttribute('aria-hidden', 'true');
            stop();
        }, { once: true });

        setTimeout(() => {
            if (konamiOverlay.classList.contains('open')) {
                konamiOverlay.classList.remove('open');
                konamiOverlay.setAttribute('aria-hidden', 'true');
                stop();
            }
        }, 10000);
    };

    /* --------------------------------------------------------
       32. LIVE METRICS WIDGET
       -------------------------------------------------------- */
    const metricsWidget = document.getElementById('metrics-widget');
    document.getElementById('metrics-toggle')?.addEventListener('click', () => {
        metricsWidget?.classList.toggle('collapsed');
    });

    const fmt = n => n.toLocaleString('en-US');
    setInterval(() => {
        const reqEl = document.getElementById('metric-requests');
        const usrEl = document.getElementById('metric-users');
        const upEl = document.getElementById('metric-uptime');
        if (reqEl) reqEl.textContent = fmt(1200 + Math.floor(Math.random() * 400));
        if (usrEl) usrEl.textContent = fmt(340 + Math.floor(Math.random() * 120));
        if (upEl) upEl.textContent = (99.95 + Math.random() * 0.04).toFixed(2) + '%';
    }, 3500);

    /* --------------------------------------------------------
       33. DASHBOARD DEMO CHART
       -------------------------------------------------------- */
    const chartBars = document.getElementById('chart-bars');
    if (chartBars) {
        const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
        const tealHeights = [55, 72, 48, 85, 92, 60, 40];
        const yellowHeights = [40, 55, 62, 70, 78, 95, 65];

        days.forEach((d, i) => {
            const group = document.createElement('div');
            group.className = 'chart-bar-group';
            group.innerHTML = `
                <div class="chart-bar teal" style="height:0%"></div>
                <div class="chart-bar yellow" style="height:0%"></div>
                <label>${d}</label>`;
            chartBars.appendChild(group);
        });

        const animateChart = () => {
            const bars = chartBars.querySelectorAll('.chart-bar-group');
            bars.forEach((g, i) => {
                const t = g.querySelector('.teal');
                const y = g.querySelector('.yellow');
                setTimeout(() => {
                    if (t) t.style.height = tealHeights[i] + '%';
                    if (y) y.style.height = yellowHeights[i] + '%';
                }, i * 80);
            });
        };

        if ('IntersectionObserver' in window) {
            const chartObs = new IntersectionObserver((entries, obs) => {
                entries.forEach(e => {
                    if (e.isIntersecting) { animateChart(); obs.unobserve(e.target); }
                });
            }, { threshold: 0.3 });
            chartObs.observe(chartBars);
        } else {
            animateChart();
        }

        setInterval(() => {
            const bars = chartBars.querySelectorAll('.chart-bar-group');
            bars.forEach((g, i) => {
                if (Math.random() > 0.7) {
                    const t = g.querySelector('.teal');
                    const y = g.querySelector('.yellow');
                    if (t) t.style.height = (tealHeights[i] + (Math.random() - 0.5) * 15) + '%';
                    if (y) y.style.height = (yellowHeights[i] + (Math.random() - 0.5) * 15) + '%';
                }
            });
        }, 4000);
    }

    /* --------------------------------------------------------
       34. GHANA MAP TOOLTIP
       -------------------------------------------------------- */
    const mapTooltip = document.getElementById('map-tooltip');
    document.querySelectorAll('.map-city').forEach(dot => {
        dot.addEventListener('mouseenter', () => {
            if (!mapTooltip) return;
            mapTooltip.textContent = dot.getAttribute('data-city');
            const r = dot.getBoundingClientRect();
            const mapR = dot.closest('.ghana-map').getBoundingClientRect();
            mapTooltip.style.left = (r.left - mapR.left + r.width / 2) + 'px';
            mapTooltip.style.top = (r.top - mapR.top - 40) + 'px';
            mapTooltip.style.transform = 'translateX(-50%)';
            mapTooltip.classList.add('show');
        });
        dot.addEventListener('mouseleave', () => mapTooltip?.classList.remove('show'));
    });

    /* --------------------------------------------------------
       35. HORIZONTAL SCROLL BUILDERS
       -------------------------------------------------------- */
    // Capabilities
    const capTrack = document.getElementById('cap-track');
    if (capTrack) {
        const capabilities = [
            { icon: 'ph-graduation-cap', color: '#4cc0c6', bg: 'rgba(76,192,198,0.15)', name: 'Ghana e-Learn', desc: 'Our flagship education subsidiary. A cutting-edge digital learning platform revolutionizing education accessibility in Ghana.', features: ['WASSCE Platform', 'BECE Platform', "Teacher's Platform", 'Performance Analytics'] },
            { icon: 'ph-shopping-cart', color: '#fbcb2c', bg: 'rgba(250,204,21,0.18)', name: 'Click Next', desc: 'Our innovative e-commerce platform designed to connect buyers and sellers seamlessly, providing a fast, secure, and user-friendly online shopping experience.', features: ['Secure Payments', 'Seller Dashboard', 'Real-time Tracking'] },
            { icon: 'ph-fork-knife', color: '#16a3ab', bg: 'rgba(22,163,171,0.18)', name: 'DTA - Digital Table Assistance', desc: 'A smart restaurant management solution that helps restaurants operate efficiently. DTA streamlines orders, table management, billing, and customer service.', features: ['Order Management', 'Table Tracking', 'Billing System'] },
            { icon: 'ph-car', color: '#f5b800', bg: 'rgba(250,204,21,0.22)', name: 'Donorics Auto Diagnostics', desc: 'Our modernized car diagnostic service that uses advanced machines to accurately detect and diagnose vehicle problems. We Diagnose It Right.', features: ['Advanced Diagnostics', 'Accurate Detection', 'Expert Analysis'] },
            { icon: 'ph-buildings', color: '#4cc0c6', bg: 'rgba(76,192,198,0.15)', name: 'Eagle Hall Management System', desc: 'A comprehensive system that handles the day-to-day activities of hostels and halls — including student records, room allocation, payments, attendance, key tracking, and reporting.', features: ['Student Records', 'Room Allocation', 'Payment Tracking', 'Attendance & Reporting'] }
        ];

        const buildCapCard = c => `
            <div class="capability-card spotlight">
                <div class="capability-icon" style="--icon-bg: ${c.bg}; --icon-color: ${c.color};"><i class="ph ${c.icon}"></i></div>
                <h3>${c.name}</h3>
                <p>${c.desc}</p>
                <ul class="capability-features">${c.features.map(f => `<li><i class="ph ph-check-circle"></i> ${f}</li>`).join('')}</ul>
                <a href="#" class="capability-link">Learn more <i class="ph ph-arrow-right"></i></a>
            </div>`;

        const setHtml = capabilities.map(buildCapCard).join('');
        capTrack.innerHTML = `<div class="hscroll-set">${setHtml}</div><div class="hscroll-set" aria-hidden="true">${setHtml}</div>`;

        // Re-attach spotlight tracking
        if (!isTouch && !prefersReduced) {
            capTrack.querySelectorAll('.spotlight').forEach(card => {
                card.addEventListener('mousemove', e => {
                    const r = card.getBoundingClientRect();
                    card.style.setProperty('--mx', `${e.clientX - r.left}px`);
                    card.style.setProperty('--my', `${e.clientY - r.top}px`);
                });
            });
        }
    }

    // Clients
    const clientTrack = document.getElementById('client-track');
    if (clientTrack) {
        const clients = [
            { caseKey: 'oguaa', icon: 'ph-buildings', color: '#4cc0c6', bg: 'rgba(76,192,198,0.15)', badge: 'Education', name: 'Oguaa Hall', sub: 'University of Cape Coast', footer: 'Hall Management System' },
            { caseKey: 'ghartey', icon: 'ph-bank', color: '#fbcb2c', bg: 'rgba(250,204,21,0.18)', badge: 'Education', name: 'Ghartey Hall', sub: 'University of Education, Winneba', footer: 'Hall Management System' },
            { caseKey: 'mabels', icon: 'ph-fork-knife', color: '#16a3ab', bg: 'rgba(22,163,171,0.18)', badge: 'Hospitality', name: "Mabel's Table", sub: 'Restaurant & Dining', footer: 'Digital Table Assistance' },
            { caseKey: 'panafest', icon: 'ph-music-notes', color: '#f5b800', bg: 'rgba(250,204,21,0.22)', badge: 'Culture & Arts', name: 'PANAFEST', sub: 'Pan African Historical Theatre Festival', footer: 'Digital Platform' },
            { caseKey: 'adotale', icon: 'ph-storefront', color: '#4cc0c6', bg: 'rgba(76,192,198,0.15)', badge: 'Retail', name: 'ADOTALE', sub: 'Commerce & Retail', footer: 'E-Commerce Solutions' }
        ];

        const buildClientCard = c => `
            <div class="client-card spotlight" data-case="${c.caseKey}">
                <div class="client-icon" style="--icon-bg: ${c.bg}; --icon-color: ${c.color};"><i class="ph ${c.icon}"></i></div>
                <span class="client-badge">${c.badge}</span>
                <h3>${c.name}</h3>
                <p>${c.sub}</p>
                <div class="client-footer"><i class="ph ph-seal-check"></i><span>${c.footer}</span></div>
            </div>`;

        const setHtml = clients.map(buildClientCard).join('');
        clientTrack.innerHTML = `<div class="hscroll-set">${setHtml}</div><div class="hscroll-set" aria-hidden="true">${setHtml}</div>`;

        // Click handlers for all client cards
        clientTrack.querySelectorAll('[data-case]').forEach(card => {
            card.addEventListener('click', () => openCase(card.getAttribute('data-case')));
            card.style.cursor = 'pointer';
        });

        // Re-attach spotlight tracking
        if (!isTouch && !prefersReduced) {
            clientTrack.querySelectorAll('.spotlight').forEach(card => {
                card.addEventListener('mousemove', e => {
                    const r = card.getBoundingClientRect();
                    card.style.setProperty('--mx', `${e.clientX - r.left}px`);
                    card.style.setProperty('--my', `${e.clientY - r.top}px`);
                });
            });
        }
    }

    /* --------------------------------------------------------
       36. MULTI-STEP FORM
       -------------------------------------------------------- */
    const contactForm = document.getElementById('contact-form');

    const goStep = n => {
        contactForm?.querySelectorAll('.step-panel').forEach(p =>
            p.classList.toggle('active', p.getAttribute('data-panel') === String(n)));
        contactForm?.querySelectorAll('.step-bar').forEach(b => {
            const step = parseInt(b.getAttribute('data-step'), 10);
            b.classList.toggle('active', step <= n);
        });
    };

    contactForm?.querySelectorAll('.step-next').forEach(btn => {
        btn.addEventListener('click', () => {
            const next = btn.getAttribute('data-next');
            const activePanel = contactForm.querySelector('.step-panel.active');
            if (activePanel?.getAttribute('data-panel') === '1') {
                const name = contactForm.querySelector('#name');
                if (name && !name.value.trim()) {
                    window.showToast('error', 'Please enter your name', 'This field is required.');
                    name.focus();
                    return;
                }
            }
            goStep(next);
            playSound('click');
        });
    });

    contactForm?.querySelectorAll('.step-back').forEach(btn => {
        btn.addEventListener('click', () => {
            goStep(btn.getAttribute('data-back'));
            playSound('click');
        });
    });

    contactForm?.querySelectorAll('.chip').forEach(chip => {
        chip.addEventListener('click', () => {
            chip.classList.toggle('selected');
            playSound('click');
        });
    });

    contactForm?.addEventListener('submit', e => {
        e.preventDefault();
        const btn = contactForm.querySelector('button[type="submit"]');
        const original = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = '<i class="ph ph-circle-notch"></i> Sending...';
        setTimeout(() => {
            btn.innerHTML = '<i class="ph ph-check-circle"></i> Sent!';
            btn.style.background = '#22c55e';
            window.showToast('success', 'Message sent!', "We'll be in touch within 24 hours.");
            playSound('success');
            setTimeout(() => {
                contactForm.reset();
                contactForm.querySelectorAll('.chip').forEach(c => c.classList.remove('selected'));
                goStep(1);
                btn.disabled = false;
                btn.innerHTML = original;
                btn.style.background = '';
            }, 2200);
        }, 1400);
    });

    /* --------------------------------------------------------
       37. NEWSLETTER
       -------------------------------------------------------- */
    document.getElementById('newsletter')?.addEventListener('submit', e => {
        e.preventDefault();
        const input = e.target.querySelector('input');
        if (!input.value.trim()) return;
        window.showToast('success', 'Subscribed!', 'Thanks for joining the Donorics newsletter.');
        input.value = '';
        playSound('success');
    });

    /* --------------------------------------------------------
       38. CHAT PANEL
       -------------------------------------------------------- */
    const chatFloat = document.getElementById('chat-float');
    const chatPanel = document.getElementById('chat-panel');
    const chatBody = document.getElementById('chat-body');
    const chatInput = document.getElementById('chat-input');
    const chatQuick = document.getElementById('chat-quick');

    const openChat = () => {
        chatPanel?.classList.add('open');
        playSound('click');
        setTimeout(() => chatInput?.focus(), 300);
    };
    const closeChat = () => chatPanel?.classList.remove('open');

    chatFloat?.addEventListener('click', () =>
        chatPanel?.classList.contains('open') ? closeChat() : openChat());
    document.getElementById('chat-close')?.addEventListener('click', closeChat);

    const botReplies = {
        'what do you build': "We build 5 flagship products: Ghana e-Learn (education), Click Next (e-commerce), DTA (restaurants), Auto Diagnostics (vehicles), and Eagle Hall (hostels). Which one interests you?",
        'pricing': "Pricing depends on scale and features. Most clients start between GHS 50,000–200,000 for a full deployment. Want me to connect you with a specialist?",
        'book a demo': "Great! Scroll to the contact form, or email hello@donorics.com. A demo typically takes 30 minutes and we tailor it to your industry.",
        'demo': "Great! Scroll to the contact form, or email hello@donorics.com. A demo typically takes 30 minutes.",
        'talk to human': "I'll connect you. You can email hello@donorics.com or call +233 (0) 123 456 789 — a real person will respond within an hour.",
        'human': "I'll connect you. Email hello@donorics.com or call +233 (0) 123 456 789.",
        'ghana e-learn': "Ghana e-Learn is our education platform for WASSCE, BECE, and teachers. It includes performance analytics and real-time learning support.",
        'click next': "Click Next is our e-commerce platform — secure payments, seller dashboards, and real-time tracking.",
        'dta': "DTA (Digital Table Assistance) helps restaurants manage orders, tables, billing, and customer service in one system.",
        'auto diagnostics': "Donorics Auto Diagnostics uses advanced machines to detect and diagnose vehicle problems accurately. We Diagnose It Right.",
        'eagle hall': "Eagle Hall is our hostel and hall management system — student records, room allocation, payments, attendance, and reporting.",
        'hello': "Hi! 👋 How can I help you today?",
        'hi': "Hi! 👋 How can I help you today?",
        'thanks': "You're welcome! Anything else I can help with?",
        'thank you': "You're welcome! Anything else I can help with?"
    };

    const addMsg = (text, who = 'bot') => {
        const m = document.createElement('div');
        m.className = `chat-msg ${who}`;
        m.innerHTML = `<p>${text}</p>`;
        chatBody?.appendChild(m);
        chatBody?.scrollTo({ top: chatBody.scrollHeight, behavior: 'smooth' });
    };

    const showTyping = () => {
        const t = document.createElement('div');
        t.className = 'chat-typing';
        t.id = 'chat-typing';
        t.innerHTML = '<span></span><span></span><span></span>';
        chatBody?.appendChild(t);
        chatBody?.scrollTo({ top: chatBody.scrollHeight, behavior: 'smooth' });
    };
    const hideTyping = () => document.getElementById('chat-typing')?.remove();

    const respond = text => {
        const lower = text.toLowerCase().trim();
        let reply = null;
        for (const k of Object.keys(botReplies)) {
            if (lower.includes(k)) { reply = botReplies[k]; break; }
        }
        if (!reply) reply = "I'm not sure about that one. Try asking about our products, pricing, or type 'talk to human' for personal help.";
        showTyping();
        setTimeout(() => {
            hideTyping();
            addMsg(reply);
        }, 800 + Math.random() * 600);
    };

    const sendChat = () => {
        const text = chatInput?.value.trim();
        if (!text) return;
        addMsg(text, 'user');
        chatInput.value = '';
        respond(text);
    };

    document.getElementById('chat-send')?.addEventListener('click', sendChat);
    chatInput?.addEventListener('keydown', e => { if (e.key === 'Enter') sendChat(); });
    chatQuick?.querySelectorAll('button').forEach(b => {
        b.addEventListener('click', () => {
            const q = b.getAttribute('data-q');
            addMsg(q, 'user');
            respond(q);
        });
    });

    /* --------------------------------------------------------
       39. SCROLL SNAP (optional)
       -------------------------------------------------------- */
    if (localStorage.getItem('donorics-snap') === '1') document.body.classList.add('snap-on');

    /* --------------------------------------------------------
       40. YEAR IN FOOTER
       -------------------------------------------------------- */
    const year = new Date().getFullYear();
    document.querySelectorAll('.footer-bottom p:first-child').forEach(el => {
        el.innerHTML = el.innerHTML.replace(/\d{4}/, year);
    });

    /* --------------------------------------------------------
       READY LOG
       -------------------------------------------------------- */
    console.log(
        '%cDonorics Technologies%c — Elite edition loaded ✓',
        'font-family: Georgia, serif; font-size: 16px; font-weight: bold; color: #f5b800;',
        'color: #4cc0c6;'
    );
})();
