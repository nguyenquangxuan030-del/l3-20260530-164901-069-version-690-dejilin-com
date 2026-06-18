(() => {
    const menuButton = document.querySelector("[data-menu-toggle]");
    const mobilePanel = document.querySelector("[data-mobile-panel]");

    if (menuButton && mobilePanel) {
        menuButton.addEventListener("click", () => {
            mobilePanel.classList.toggle("is-open");
        });
    }

    const carousel = document.querySelector("[data-hero-carousel]");

    if (carousel) {
        const slides = Array.from(carousel.querySelectorAll("[data-hero-slide]"));
        const dots = Array.from(carousel.querySelectorAll("[data-hero-dot]"));
        const nextButton = carousel.querySelector("[data-hero-next]");
        const prevButton = carousel.querySelector("[data-hero-prev]");
        let activeIndex = 0;
        let timer = null;

        const setActive = (index) => {
            activeIndex = (index + slides.length) % slides.length;

            slides.forEach((slide, slideIndex) => {
                const active = slideIndex === activeIndex;
                slide.classList.toggle("is-active", active);
                slide.setAttribute("aria-hidden", active ? "false" : "true");
            });

            dots.forEach((dot, dotIndex) => {
                dot.classList.toggle("is-active", dotIndex === activeIndex);
            });
        };

        const restart = () => {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(() => setActive(activeIndex + 1), 5200);
        };

        dots.forEach((dot) => {
            dot.addEventListener("click", () => {
                setActive(Number(dot.dataset.heroDot));
                restart();
            });
        });

        if (nextButton) {
            nextButton.addEventListener("click", () => {
                setActive(activeIndex + 1);
                restart();
            });
        }

        if (prevButton) {
            prevButton.addEventListener("click", () => {
                setActive(activeIndex - 1);
                restart();
            });
        }

        restart();
    }

    const applyQueryToFilters = () => {
        const params = new URLSearchParams(window.location.search);
        const query = params.get("q");

        if (!query) {
            return;
        }

        document.querySelectorAll("[data-filter-search]").forEach((input) => {
            input.value = query;
            input.dispatchEvent(new Event("input"));
        });
    };

    const normalize = (value) => String(value || "").trim().toLowerCase();

    document.querySelectorAll("[data-filter-panel]").forEach((panel) => {
        const target = document.querySelector(panel.dataset.filterTarget);

        if (!target) {
            return;
        }

        const cards = Array.from(target.querySelectorAll(".movie-card"));
        const searchInput = panel.querySelector("[data-filter-search]");
        const selectors = Array.from(panel.querySelectorAll("[data-filter-field]"));

        const run = () => {
            const query = normalize(searchInput ? searchInput.value : "");
            const activeFilters = selectors.map((selector) => ({
                field: selector.dataset.filterField,
                value: normalize(selector.value)
            })).filter((item) => item.value);
            let shown = 0;

            cards.forEach((card) => {
                const haystack = normalize([
                    card.dataset.title,
                    card.dataset.genre,
                    card.dataset.region,
                    card.dataset.type,
                    card.dataset.year,
                    card.dataset.category,
                    card.textContent
                ].join(" "));

                const matchesQuery = !query || haystack.includes(query);
                const matchesFilters = activeFilters.every((item) => {
                    return normalize(card.dataset[item.field]).includes(item.value);
                });
                const visible = matchesQuery && matchesFilters;

                card.classList.toggle("is-hidden", !visible);
                if (visible) {
                    shown += 1;
                }
            });

            panel.classList.toggle("is-empty", shown === 0);
        };

        if (searchInput) {
            searchInput.addEventListener("input", run);
        }

        selectors.forEach((selector) => {
            selector.addEventListener("change", run);
        });

        run();
    });

    applyQueryToFilters();
})();
