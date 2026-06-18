(function () {
  "use strict";

  var hlsLoaderPromise = null;

  function getSiteRoot() {
    return document.body.getAttribute("data-root") || "./";
  }

  function setupMobileMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");

    if (!toggle || !panel) {
      return;
    }

    toggle.addEventListener("click", function () {
      panel.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", panel.classList.contains("is-open") ? "true" : "false");
    });
  }

  function setupHeaderSearch() {
    var forms = document.querySelectorAll("[data-header-search]");

    forms.forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = form.querySelector("input[name='q']");
        var query = input ? input.value.trim() : "";
        var target = getSiteRoot() + "search.html";

        if (query) {
          target += "?q=" + encodeURIComponent(query);
        }

        window.location.href = target;
      });
    });
  }

  function setupHeroSlider() {
    var slider = document.querySelector("[data-hero-slider]");

    if (!slider) {
      return;
    }

    var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
    var current = 0;
    var timer = null;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function startAutoPlay() {
      if (timer || slides.length <= 1) {
        return;
      }

      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    function stopAutoPlay() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        var index = Number(dot.getAttribute("data-hero-dot"));
        stopAutoPlay();
        showSlide(index);
        startAutoPlay();
      });
    });

    slider.addEventListener("mouseenter", stopAutoPlay);
    slider.addEventListener("mouseleave", startAutoPlay);
    showSlide(0);
    startAutoPlay();
  }

  function valueIncludes(source, keyword) {
    return String(source || "").toLowerCase().indexOf(keyword) !== -1;
  }

  function setupFilterSection() {
    var section = document.querySelector("[data-filter-section]");

    if (!section) {
      return;
    }

    var input = section.querySelector("[data-filter-input]");
    var year = section.querySelector("[data-filter-year]");
    var region = section.querySelector("[data-filter-region]");
    var type = section.querySelector("[data-filter-type]");
    var category = section.querySelector("[data-filter-category]");
    var count = section.querySelector("[data-filter-count]");
    var noResults = section.querySelector("[data-no-results]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
    var urlParams = new URLSearchParams(window.location.search);
    var initialQuery = urlParams.get("q") || "";

    if (input && initialQuery) {
      input.value = initialQuery;
    }

    function applyFilters() {
      var keyword = input ? input.value.trim().toLowerCase() : "";
      var yearValue = year ? year.value : "";
      var regionValue = region ? region.value : "";
      var typeValue = type ? type.value : "";
      var categoryValue = category ? category.value : "";
      var visible = 0;

      cards.forEach(function (card) {
        var searchText = [
          card.getAttribute("data-title"),
          card.getAttribute("data-year"),
          card.getAttribute("data-region"),
          card.getAttribute("data-type"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-category"),
          card.getAttribute("data-tags")
        ].join(" ").toLowerCase();

        var matchesKeyword = !keyword || valueIncludes(searchText, keyword);
        var matchesYear = !yearValue || card.getAttribute("data-year") === yearValue;
        var matchesRegion = !regionValue || card.getAttribute("data-region") === regionValue;
        var matchesType = !typeValue || card.getAttribute("data-type") === typeValue;
        var matchesCategory = !categoryValue || card.getAttribute("data-category") === categoryValue;
        var matches = matchesKeyword && matchesYear && matchesRegion && matchesType && matchesCategory;

        card.hidden = !matches;

        if (matches) {
          visible += 1;
        }
      });

      if (count) {
        count.textContent = "当前显示 " + visible + " / " + cards.length + " 部影片";
      }

      if (noResults) {
        noResults.classList.toggle("is-visible", visible === 0);
      }
    }

    [input, year, region, type, category].forEach(function (control) {
      if (control) {
        control.addEventListener("input", applyFilters);
        control.addEventListener("change", applyFilters);
      }
    });

    applyFilters();
  }

  function loadHlsLibrary() {
    if (window.Hls) {
      return Promise.resolve(window.Hls);
    }

    if (hlsLoaderPromise) {
      return hlsLoaderPromise;
    }

    hlsLoaderPromise = new Promise(function (resolve, reject) {
      var script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/hls.js@1/dist/hls.min.js";
      script.async = true;
      script.onload = function () {
        if (window.Hls) {
          resolve(window.Hls);
        } else {
          reject(new Error("HLS library did not expose window.Hls"));
        }
      };
      script.onerror = function () {
        reject(new Error("HLS library failed to load"));
      };
      document.head.appendChild(script);
    });

    return hlsLoaderPromise;
  }

  function setupPlayers() {
    var players = document.querySelectorAll("[data-player]");

    players.forEach(function (player) {
      var video = player.querySelector("video");
      var start = player.querySelector(".player-start");
      var status = player.querySelector(".player-status");
      var source = player.getAttribute("data-source");
      var initialized = false;
      var hlsInstance = null;

      function setStatus(message) {
        if (status) {
          status.textContent = message;
        }
      }

      function attachSource() {
        if (initialized) {
          return Promise.resolve();
        }

        if (!video || !source) {
          return Promise.reject(new Error("Missing video element or HLS source"));
        }

        setStatus("正在加载播放源...");

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
          initialized = true;
          return Promise.resolve();
        }

        return loadHlsLibrary().then(function (Hls) {
          if (!Hls.isSupported()) {
            throw new Error("This browser does not support HLS playback");
          }

          hlsInstance = new Hls({
            enableWorker: true,
            lowLatencyMode: false
          });

          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
          initialized = true;

          hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
            setStatus("播放源已就绪");
          });

          hlsInstance.on(Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              setStatus("播放源加载失败，请稍后再试");
              hlsInstance.destroy();
              hlsInstance = null;
              initialized = false;
            }
          });
        });
      }

      if (!start || !video) {
        return;
      }

      start.addEventListener("click", function () {
        attachSource()
          .then(function () {
            player.classList.add("is-playing");
            setStatus("正在播放");
            return video.play();
          })
          .catch(function () {
            setStatus("播放器初始化失败，请检查网络或播放源");
          });
      });

      video.addEventListener("play", function () {
        player.classList.add("is-playing");
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    setupMobileMenu();
    setupHeaderSearch();
    setupHeroSlider();
    setupFilterSection();
    setupPlayers();
  });
})();
