(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var toggle = document.querySelector(".nav-toggle");
        var nav = document.querySelector(".main-nav");

        if (toggle && nav) {
            toggle.addEventListener("click", function () {
                nav.classList.toggle("is-open");
            });
        }

        var slider = document.querySelector(".hero-slider");

        if (slider) {
            var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
            var dots = Array.prototype.slice.call(slider.querySelectorAll(".hero-dot"));
            var prev = slider.querySelector(".hero-control.prev");
            var next = slider.querySelector(".hero-control.next");
            var current = 0;

            function show(index) {
                current = (index + slides.length) % slides.length;
                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle("is-active", slideIndex === current);
                });
                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle("is-active", dotIndex === current);
                });
            }

            if (slides.length > 1) {
                if (prev) {
                    prev.addEventListener("click", function () {
                        show(current - 1);
                    });
                }

                if (next) {
                    next.addEventListener("click", function () {
                        show(current + 1);
                    });
                }

                dots.forEach(function (dot, index) {
                    dot.addEventListener("click", function () {
                        show(index);
                    });
                });

                window.setInterval(function () {
                    show(current + 1);
                }, 5600);
            }
        }

        var searchInput = document.getElementById("movieSearchInput");
        var cards = Array.prototype.slice.call(document.querySelectorAll(".searchable-grid .movie-card"));

        if (searchInput && cards.length) {
            var params = new URLSearchParams(window.location.search);
            var initial = params.get("q") || "";
            searchInput.value = initial;

            function applyFilter() {
                var query = searchInput.value.trim().toLowerCase();
                cards.forEach(function (card) {
                    var haystack = card.getAttribute("data-search") || "";
                    card.classList.toggle("is-hidden", query && haystack.indexOf(query) === -1);
                });
            }

            searchInput.addEventListener("input", applyFilter);
            applyFilter();
        }
    });
})();
