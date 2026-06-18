(function () {
    function $(selector, root) {
        return (root || document).querySelector(selector);
    }

    function $all(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function setupMenu() {
        var button = $('.menu-toggle');
        var panel = $('.mobile-panel');
        if (!button || !panel) {
            return;
        }
        button.addEventListener('click', function () {
            var open = panel.hasAttribute('hidden');
            if (open) {
                panel.removeAttribute('hidden');
            } else {
                panel.setAttribute('hidden', '');
            }
            button.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
    }

    function setupHero() {
        var hero = $('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = $all('[data-hero-slide]', hero);
        var dots = $all('[data-hero-dot]', hero);
        var next = $('[data-hero-next]', hero);
        var prev = $('[data-hero-prev]', hero);
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                restart();
            });
        });
        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                restart();
            });
        }
        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                restart();
            });
        }
        restart();
    }

    function setupSearchPage() {
        var input = $('.js-live-filter');
        var queryInput = $('.js-search-input');
        var clear = $('.clear-filter');
        var cards = $all('.search-grid .movie-card');
        if (!input || !cards.length) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var initial = params.get('q') || '';
        input.value = initial;
        if (queryInput) {
            queryInput.value = initial;
        }

        function apply(value) {
            var q = String(value || '').trim().toLowerCase();
            cards.forEach(function (card) {
                var haystack = [
                    card.getAttribute('data-title'),
                    card.getAttribute('data-genre'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-tags')
                ].join(' ').toLowerCase();
                card.classList.toggle('is-hidden', q && haystack.indexOf(q) === -1);
            });
        }

        input.addEventListener('input', function () {
            apply(input.value);
        });
        if (clear) {
            clear.addEventListener('click', function () {
                input.value = '';
                if (queryInput) {
                    queryInput.value = '';
                }
                apply('');
            });
        }
        apply(initial);
    }

    function setupPlayer() {
        var section = $('.player-section');
        var video = $('.js-video-player');
        var trigger = $('.js-play-trigger');
        if (!section || !video || !trigger) {
            return;
        }
        var stream = section.getAttribute('data-stream');
        var ready = false;
        var hls = null;

        function attach() {
            if (ready) {
                return Promise.resolve();
            }
            ready = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = stream;
                return Promise.resolve();
            }
            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(stream);
                hls.attachMedia(video);
                return Promise.resolve();
            }
            video.src = stream;
            return Promise.resolve();
        }

        function start() {
            attach().then(function () {
                trigger.classList.add('is-hidden');
                var playPromise = video.play();
                if (playPromise && typeof playPromise.catch === 'function') {
                    playPromise.catch(function () {
                        trigger.classList.remove('is-hidden');
                    });
                }
            });
        }

        trigger.addEventListener('click', start);
        video.addEventListener('click', function () {
            if (!ready || video.paused) {
                start();
            } else {
                video.pause();
            }
        });
        video.addEventListener('play', function () {
            trigger.classList.add('is-hidden');
        });
        video.addEventListener('pause', function () {
            if (video.currentTime === 0) {
                trigger.classList.remove('is-hidden');
            }
        });
        window.addEventListener('beforeunload', function () {
            if (hls) {
                hls.destroy();
            }
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        setupMenu();
        setupHero();
        setupSearchPage();
        setupPlayer();
    });
})();
