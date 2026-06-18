document.addEventListener("DOMContentLoaded", function () {
    initializeMobileNavigation();
    initializeHeroCarousel();
    initializeFilters();
    initializeVideoPlayers();
});

function initializeMobileNavigation() {
    const toggle = document.querySelector("[data-mobile-menu-toggle]");
    const menu = document.querySelector("[data-mobile-menu]");

    if (!toggle || !menu) {
        return;
    }

    toggle.addEventListener("click", function () {
        menu.classList.toggle("is-open");
    });
}

function initializeHeroCarousel() {
    const carousel = document.querySelector("[data-hero-carousel]");

    if (!carousel) {
        return;
    }

    const slides = Array.from(carousel.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(carousel.querySelectorAll("[data-hero-dot]"));
    const previousButton = carousel.querySelector("[data-hero-prev]");
    const nextButton = carousel.querySelector("[data-hero-next]");
    let currentIndex = 0;
    let timer = null;

    function showSlide(nextIndex) {
        if (slides.length === 0) {
            return;
        }

        currentIndex = (nextIndex + slides.length) % slides.length;

        slides.forEach(function (slide, index) {
            slide.classList.toggle("is-active", index === currentIndex);
        });

        dots.forEach(function (dot, index) {
            dot.classList.toggle("is-active", index === currentIndex);
        });
    }

    function nextSlide() {
        showSlide(currentIndex + 1);
    }

    function previousSlide() {
        showSlide(currentIndex - 1);
    }

    function restartTimer() {
        window.clearInterval(timer);
        timer = window.setInterval(nextSlide, 5000);
    }

    dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
            const index = Number(dot.getAttribute("data-hero-dot"));
            showSlide(index);
            restartTimer();
        });
    });

    if (previousButton) {
        previousButton.addEventListener("click", function () {
            previousSlide();
            restartTimer();
        });
    }

    if (nextButton) {
        nextButton.addEventListener("click", function () {
            nextSlide();
            restartTimer();
        });
    }

    showSlide(0);
    restartTimer();
}

function initializeFilters() {
    const grids = Array.from(document.querySelectorAll(".filterable-grid"));

    if (grids.length === 0) {
        return;
    }

    const searchInput = document.querySelector("[data-search-input]");
    const yearSelect = document.querySelector("[data-filter-year]");
    const regionSelect = document.querySelector("[data-filter-region]");
    const categorySelect = document.querySelector("[data-filter-category]");
    const resetButton = document.querySelector("[data-filter-reset]");
    const countLabel = document.querySelector("[data-filter-count]");
    const cards = grids.flatMap(function (grid) {
        return Array.from(grid.querySelectorAll("[data-movie-card]"));
    });

    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    function cardMatches(card, keyword, year, region, category) {
        const haystack = normalize([
            card.dataset.title,
            card.dataset.region,
            card.dataset.type,
            card.dataset.tags,
            card.dataset.year
        ].join(" "));

        const matchesKeyword = !keyword || haystack.includes(keyword);
        const matchesYear = !year || String(card.dataset.year) === year;
        const matchesRegion = !region || String(card.dataset.region) === region;
        const matchesCategory = !category || String(card.dataset.category) === category;

        return matchesKeyword && matchesYear && matchesRegion && matchesCategory;
    }

    function applyFilters() {
        const keyword = normalize(searchInput ? searchInput.value : "");
        const year = yearSelect ? yearSelect.value : "";
        const region = regionSelect ? regionSelect.value : "";
        const category = categorySelect ? categorySelect.value : "";
        let visibleCount = 0;

        cards.forEach(function (card) {
            const isVisible = cardMatches(card, keyword, year, region, category);
            card.classList.toggle("filter-hidden", !isVisible);
            if (isVisible) {
                visibleCount += 1;
            }
        });

        if (countLabel) {
            countLabel.textContent = "当前展示 " + visibleCount + " 部影片";
        }
    }

    [searchInput, yearSelect, regionSelect, categorySelect].forEach(function (control) {
        if (control) {
            control.addEventListener("input", applyFilters);
            control.addEventListener("change", applyFilters);
        }
    });

    if (resetButton) {
        resetButton.addEventListener("click", function () {
            if (searchInput) {
                searchInput.value = "";
            }
            if (yearSelect) {
                yearSelect.value = "";
            }
            if (regionSelect) {
                regionSelect.value = "";
            }
            if (categorySelect) {
                categorySelect.value = "";
            }
            applyFilters();
        });
    }

    applyFilters();
}

function initializeVideoPlayers() {
    const players = Array.from(document.querySelectorAll("[data-video-player]"));

    players.forEach(function (player) {
        const video = player.querySelector("video[data-video-src]");
        const button = player.querySelector("[data-player-button]");

        if (!video) {
            return;
        }

        let loaded = false;
        let hlsInstance = null;
        const source = video.dataset.videoSrc;

        function loadSource() {
            if (loaded || !source) {
                return;
            }

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: false
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
            } else {
                video.src = source;
            }

            loaded = true;
        }

        function playVideo() {
            loadSource();
            const playPromise = video.play();

            if (playPromise && typeof playPromise.catch === "function") {
                playPromise.catch(function () {
                    if (button) {
                        button.classList.remove("is-hidden");
                    }
                });
            }
        }

        if (button) {
            button.addEventListener("click", playVideo);
        }

        video.addEventListener("play", function () {
            if (button) {
                button.classList.add("is-hidden");
            }
        });

        video.addEventListener("pause", function () {
            if (button && video.currentTime === 0) {
                button.classList.remove("is-hidden");
            }
        });

        video.addEventListener("error", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
                hlsInstance = null;
            }
        });
    });
}
