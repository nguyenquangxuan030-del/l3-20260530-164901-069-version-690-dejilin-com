(function () {
    'use strict';

    function qs(selector, root) {
        return (root || document).querySelector(selector);
    }

    function qsa(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function initMissingImages() {
        qsa('img').forEach(function (img) {
            img.addEventListener('error', function () {
                img.classList.add('image-missing');
            });
        });
    }

    function initMobileMenu() {
        var button = qs('[data-mobile-menu-button]');
        var panel = qs('[data-mobile-panel]');
        if (!button || !panel) {
            return;
        }
        button.addEventListener('click', function () {
            var isHidden = panel.hasAttribute('hidden');
            if (isHidden) {
                panel.removeAttribute('hidden');
                button.setAttribute('aria-label', '关闭菜单');
            } else {
                panel.setAttribute('hidden', '');
                button.setAttribute('aria-label', '打开菜单');
            }
        });
    }

    function initSearchForms() {
        qsa('[data-search-form]').forEach(function (form) {
            form.addEventListener('submit', function (event) {
                event.preventDefault();
                var input = qs('input[name="q"]', form);
                var target = form.getAttribute('data-search-target') || 'search.html';
                var query = input ? input.value.trim() : '';
                if (query) {
                    window.location.href = target + '?q=' + encodeURIComponent(query);
                } else {
                    window.location.href = target;
                }
            });
        });
    }

    function initHeroCarousel() {
        var carousel = qs('[data-hero-carousel]');
        if (!carousel) {
            return;
        }
        var slides = qsa('[data-hero-slide]', carousel);
        var dots = qsa('[data-hero-dot]', carousel);
        var prev = qs('[data-hero-prev]', carousel);
        var next = qs('[data-hero-next]', carousel);
        var active = 0;
        var timer;

        function show(index) {
            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === active);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === active);
            });
        }

        function auto() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(active + 1);
            }, 5000);
        }

        if (!slides.length) {
            return;
        }
        if (prev) {
            prev.addEventListener('click', function () {
                show(active - 1);
                auto();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(active + 1);
                auto();
            });
        }
        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(parseInt(dot.getAttribute('data-hero-dot'), 10) || 0);
                auto();
            });
        });
        show(0);
        auto();
    }

    function initFilters() {
        var grid = qs('[data-filter-grid]');
        var panel = qs('[data-filter-panel]');
        if (!grid || !panel) {
            return;
        }
        var cards = qsa('.movie-card', grid);
        var queryInput = qs('[data-live-search]', panel);
        var regionSelect = qs('[data-filter-region]', panel);
        var typeSelect = qs('[data-filter-type]', panel);
        var yearSelect = qs('[data-filter-year]', panel);
        var genreSelect = qs('[data-filter-genre]', panel);
        var visibleCount = qs('[data-visible-count]', panel);
        var totalCount = qs('[data-total-count]', panel);
        var reset = qs('[data-filter-reset]', panel);
        var empty = qs('[data-empty-state]');

        if (totalCount) {
            totalCount.textContent = String(cards.length);
        }

        if (grid.getAttribute('data-read-query') === 'true' && queryInput) {
            var params = new URLSearchParams(window.location.search);
            var q = params.get('q');
            if (q) {
                queryInput.value = q;
            }
        }

        function text(card, name) {
            return (card.getAttribute(name) || '').toLowerCase();
        }

        function apply() {
            var q = queryInput ? queryInput.value.trim().toLowerCase() : '';
            var region = regionSelect ? regionSelect.value : '';
            var type = typeSelect ? typeSelect.value : '';
            var year = yearSelect ? yearSelect.value : '';
            var genre = genreSelect ? genreSelect.value.toLowerCase() : '';
            var shown = 0;

            cards.forEach(function (card) {
                var haystack = [
                    text(card, 'data-title'),
                    text(card, 'data-region-name'),
                    text(card, 'data-type'),
                    text(card, 'data-year'),
                    text(card, 'data-genre'),
                    text(card, 'data-tags')
                ].join(' ');
                var ok = true;
                if (q && haystack.indexOf(q) === -1) {
                    ok = false;
                }
                if (region && card.getAttribute('data-region') !== region) {
                    ok = false;
                }
                if (type && card.getAttribute('data-type') !== type) {
                    ok = false;
                }
                if (year && card.getAttribute('data-year') !== year) {
                    ok = false;
                }
                if (genre && text(card, 'data-genre').indexOf(genre) === -1) {
                    ok = false;
                }
                card.hidden = !ok;
                if (ok) {
                    shown += 1;
                }
            });

            if (visibleCount) {
                visibleCount.textContent = String(shown);
            }
            if (empty) {
                empty.hidden = shown !== 0;
            }
        }

        [queryInput, regionSelect, typeSelect, yearSelect, genreSelect].forEach(function (control) {
            if (!control) {
                return;
            }
            control.addEventListener('input', apply);
            control.addEventListener('change', apply);
        });

        if (reset) {
            reset.addEventListener('click', function () {
                [queryInput, regionSelect, typeSelect, yearSelect, genreSelect].forEach(function (control) {
                    if (control) {
                        control.value = '';
                    }
                });
                apply();
            });
        }

        apply();
    }

    function initPlayers() {
        qsa('[data-player-shell]').forEach(function (shell) {
            var video = qs('video[data-video-src]', shell);
            var overlay = qs('[data-play-overlay]', shell);
            var hlsInstance = null;
            var started = false;
            if (!video || !overlay) {
                return;
            }

            function loadAndPlay() {
                var src = video.getAttribute('data-video-src');
                if (!src) {
                    return;
                }
                if (!started) {
                    if (window.Hls && window.Hls.isSupported()) {
                        hlsInstance = new window.Hls({
                            enableWorker: true,
                            lowLatencyMode: true
                        });
                        hlsInstance.loadSource(src);
                        hlsInstance.attachMedia(video);
                        hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                            if (!data || !data.fatal || !hlsInstance) {
                                return;
                            }
                            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                                hlsInstance.startLoad();
                            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                                hlsInstance.recoverMediaError();
                            } else {
                                hlsInstance.destroy();
                            }
                        });
                    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                        video.src = src;
                    } else {
                        video.src = src;
                    }
                    started = true;
                }
                overlay.classList.add('is-hidden');
                var playPromise = video.play();
                if (playPromise && typeof playPromise.catch === 'function') {
                    playPromise.catch(function () {
                        overlay.classList.remove('is-hidden');
                    });
                }
            }

            overlay.addEventListener('click', loadAndPlay);
            video.addEventListener('play', function () {
                overlay.classList.add('is-hidden');
            });
            video.addEventListener('pause', function () {
                if (!video.ended) {
                    overlay.classList.remove('is-hidden');
                }
            });
            window.addEventListener('beforeunload', function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                }
            });
        });
    }

    function initBackToTop() {
        var button = qs('[data-back-to-top]');
        if (!button) {
            return;
        }
        window.addEventListener('scroll', function () {
            button.classList.toggle('is-visible', window.scrollY > 420);
        });
        button.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        initMissingImages();
        initMobileMenu();
        initSearchForms();
        initHeroCarousel();
        initFilters();
        initPlayers();
        initBackToTop();
    });
})();
