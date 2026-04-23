/* ============================================================
   MEGI — Lord of the Rings Premium Wedding Site
   script.js — Step 2: Hero + Night Mode
   ============================================================ */

(function () {
    'use strict';

    var envelope    = document.getElementById('envelope');
    var pageContent = document.getElementById('page-content');
    var nightToggle = document.getElementById('night-toggle');
    var musicToggle = document.getElementById('music-toggle');
    var langToggle  = document.getElementById('lang-toggle');
    var bgAudio     = document.getElementById('bg-audio');

    /* ---- Audio fade helpers ---- */
    var fadeInterval = null;

    function fadeIn(duration) {
        bgAudio.volume = 0;
        bgAudio.play().catch(function () {}); // autoplay policy guard
        clearInterval(fadeInterval);
        var steps = 40;
        var stepTime = duration / steps;
        var stepVol  = 0.4 / steps;
        fadeInterval = setInterval(function () {
            bgAudio.volume = Math.min(0.4, bgAudio.volume + stepVol);
            if (bgAudio.volume >= 0.4) clearInterval(fadeInterval);
        }, stepTime);
    }

    function fadeOut(duration, cb) {
        clearInterval(fadeInterval);
        var steps = 20;
        var stepTime = duration / steps;
        var stepVol  = bgAudio.volume / steps;
        fadeInterval = setInterval(function () {
            bgAudio.volume = Math.max(0, bgAudio.volume - stepVol);
            if (bgAudio.volume <= 0) {
                clearInterval(fadeInterval);
                bgAudio.pause();
                if (cb) cb();
            }
        }, stepTime);
    }

    /* ---- Music toggle button ---- */
    musicToggle.addEventListener('click', function () {
        if (bgAudio.paused) {
            fadeIn(800);
            musicToggle.classList.add('playing');
            musicToggle.setAttribute('aria-label', 'Pause music');
            musicToggle.setAttribute('aria-pressed', 'true');
        } else {
            fadeOut(600);
            musicToggle.classList.remove('playing');
            musicToggle.setAttribute('aria-label', 'Play music');
            musicToggle.setAttribute('aria-pressed', 'false');
        }
    });

    /* ---- Pause when tab/app goes hidden, resume when visible ---- */
    document.addEventListener('visibilitychange', function () {
        if (document.hidden) {
            if (!bgAudio.paused) {
                bgAudio.pause();
            }
        } else {
            if (musicToggle.classList.contains('playing')) {
                bgAudio.play().catch(function () {});
            }
        }
    });

    /* ---- Language ---- */
    function setLanguage(lang) {
        localStorage.setItem('lang', lang);
        if (lang === 'es') {
            document.body.classList.add('lang-es');
            document.documentElement.setAttribute('lang', 'es');
            langToggle.setAttribute('aria-checked', 'true');
        } else {
            document.body.classList.remove('lang-es');
            document.documentElement.setAttribute('lang', 'ka');
            langToggle.setAttribute('aria-checked', 'false');
        }
        document.querySelectorAll('[data-ka]').forEach(function (el) {
            var text = lang === 'es' ? el.getAttribute('data-es') : el.getAttribute('data-ka');
            if (text !== null) el.textContent = text;
        });
    }

    /* Restore language preference before paint */
    setLanguage(localStorage.getItem('lang') || 'ka');

    langToggle.addEventListener('click', function () {
        var current = localStorage.getItem('lang') || 'ka';
        setLanguage(current === 'ka' ? 'es' : 'ka');
    });

    /* ---- Restore night mode preference before paint ---- */
    if (localStorage.getItem('nightMode') === '1') {
        document.body.classList.add('night-mode');
        nightToggle.setAttribute('aria-checked', 'true');
    }

    /* ---- Night mode toggle ---- */
    nightToggle.addEventListener('click', function () {
        var isNight = document.body.classList.toggle('night-mode');
        this.setAttribute('aria-checked', isNight ? 'true' : 'false');
        localStorage.setItem('nightMode', isNight ? '1' : '0');
    });

    /* ---- Envelope open ---- */
    function openEnvelope() {
        if (envelope.classList.contains('open')) return;

        envelope.classList.add('open');

        // Show background immediately through the opening flaps
        pageContent.classList.add('bg-visible');

        // After flaps clear: unlock scroll, reveal content, show night toggle
        setTimeout(function () {
            document.documentElement.style.scrollbarGutter = 'stable';
            document.body.style.overflow = 'auto';

            requestAnimationFrame(function () {
                document.documentElement.classList.add('scrollable');
            });

            pageContent.classList.add('content-revealed');
            nightToggle.classList.add('visible');
            musicToggle.classList.add('visible');
            langToggle.classList.add('visible');

            // Auto-start music with fade-in (browser may block until user interaction;
            // the envelope click counts as a gesture so this normally succeeds)
            fadeIn(3000);
            musicToggle.classList.add('playing');
            musicToggle.setAttribute('aria-label', 'Pause music');
            musicToggle.setAttribute('aria-pressed', 'true');
        }, 1200);
    }

    envelope.addEventListener('click', openEnvelope);

    envelope.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openEnvelope();
        }
    });

    /* ---- Scroll reveal ---- */
    var revealObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12 });

    document.querySelectorAll('.reveal').forEach(function (el) {
        revealObserver.observe(el);
    });

    /* ---- Timeline popup ---- */
    var popupData = {
        ceremony: {
            label:    { ka: 'სტუმრების მიღება',  es: 'Recepción de Invitados' },
            title:    { ka: 'სტუმრების მიღება',  es: 'Recepción de Invitados' },
            location: 'Chateau Vartsikhe',
            body:     {
                ka: 'ყველა გმირული ამბავი იწყება შეხვედრით. კეთილი იყოს შენი მობრძანება!',
                es: 'Toda gran aventura comienza con un encuentro. Bienvenido/a!'
            }
        },
        photoshoot: {
            label:    { ka: 'ხელის მოწერის ცერემონია',   es: 'Ceremonia' },
            title:    { ka: 'ხელის მოწერის ცერემონია',   es: 'Ceremonia' },
            location: 'Chateau Vartsikhe',
            body:     {
                ka: 'ერთი ბეჭედი, ერთი სიყვარული და ერთი სამუდამო პირობა. შემოგვიერთდით, რათა ვიზეიმოთ ჩვენი გზების გაერთიანება ვარსკვლავების ქვეშ.',
                es: 'Un anillo, un amor y una promesa eterna. Únete a nosotros para celebrar la unión de nuestros caminos bajo las estrellas.'
            }
        },
        reception: {
            label:    { ka: 'ვახშამი',     es: 'Banquete' },
            title:    { ka: 'ვახშამი',     es: 'Banquete' },
            location: 'Chateau Vartsikhe',
            body:     {
                ka: 'დროა ნამდვილი ჰობიტური ნადიმისთვის! მოკალათდით, მოიმარჯვეთ ჩანგლები და ისიამოვნეთ შირის საუკეთესო კერძებით. გპირდებით, აქ არცერთი მუცელი დარჩება მშიერი!',
                es: '¡Es hora de un auténtico festín hobbit! Pónganse cómodos, preparen sus cubiertos y disfruten de los mejores platos de la Comarca. ¡Prometemos que nadie se quedará con hambre aquí!'
            }
        }
    };

    var popupOverlay = document.getElementById('popup-overlay');
    var popupLabel   = document.getElementById('popup-label');
    var popupTitle   = document.getElementById('popup-title');
    var popupLoc     = document.getElementById('popup-location');
    var popupBody    = document.getElementById('popup-body');
    var popupClose   = document.getElementById('popup-close');

    function currentLang() {
        return localStorage.getItem('lang') || 'ka';
    }

    function openPopup(id) {
        var data = popupData[id];
        if (!data) return;
        var lang = currentLang();
        popupLabel.textContent   = data.label[lang]    || data.label.ka;
        popupTitle.textContent   = data.title[lang]    || data.title.ka;
        popupLoc.textContent     = data.location;
        popupBody.textContent    = data.body[lang]     || data.body.ka;
        popupOverlay.classList.add('active');
        popupOverlay.setAttribute('aria-hidden', 'false');
    }

    function closePopup() {
        popupOverlay.classList.remove('active');
        popupOverlay.setAttribute('aria-hidden', 'true');
    }

    document.querySelectorAll('.timeline-step').forEach(function (step) {
        step.addEventListener('click', function () {
            openPopup(this.dataset.popup);
        });
    });

    popupClose.addEventListener('click', closePopup);

    popupOverlay.addEventListener('click', function (e) {
        if (e.target === popupOverlay) closePopup();
    });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') closePopup();
    });

    /* ---- RSVP form ---- */
    var rsvpForm        = document.getElementById('rsvp-form');
    var rsvpThanks      = document.getElementById('rsvp-thanks');
    var rsvpThanksBody  = document.getElementById('rsvp-thanks-body');
    var rsvpGuestsField = document.getElementById('rsvp-guests-field');

    // Show / hide guest count based on attendance answer
    document.querySelectorAll('input[name="attending"]').forEach(function (radio) {
        radio.addEventListener('change', function () {
            if (this.value === 'yes') {
                rsvpGuestsField.removeAttribute('hidden');
            } else {
                rsvpGuestsField.setAttribute('hidden', '');
                document.querySelectorAll('input[name="guests"]').forEach(function (r) {
                    r.checked = false;
                });
            }
        });
    });

    rsvpForm.addEventListener('submit', function (e) {
        e.preventDefault();

        var name      = (document.getElementById('rsvp-name').value || '').trim();
        var attending = (document.querySelector('input[name="attending"]:checked') || {}).value;
        var lang      = currentLang();

        if (!name) {
            document.getElementById('rsvp-name').focus();
            return;
        }
        if (!attending) return;

        var msg;
        if (attending === 'yes') {
            msg = lang === 'es'
                ? '¡Gracias, ' + name + '! Te esperamos el 24 de agosto en Chateau Vartsikhe.'
                : 'გმადლობთ, ' + name + '! გელოდებით 24 აგვისტოს, Chateau Vartsikhe-ში.';
        } else {
            msg = lang === 'es'
                ? name + ', sentimos que no puedas acompañarnos. ¡Te echaremos de menos!'
                : name + ', ვწუხვართ, რომ ვერ გვეახლები. მოგვაკლდები!';
        }

        rsvpThanksBody.textContent = msg;
        rsvpForm.setAttribute('hidden', '');
        rsvpThanks.removeAttribute('hidden');
    });

}());
