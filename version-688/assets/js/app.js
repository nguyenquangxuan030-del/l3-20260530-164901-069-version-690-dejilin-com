(function () {
  var body = document.body;
  var menuToggle = document.querySelector("[data-menu-toggle]");
  var mobileNav = document.querySelector("[data-mobile-nav]");

  if (menuToggle && mobileNav) {
    menuToggle.addEventListener("click", function () {
      mobileNav.classList.toggle("is-open");
      body.classList.toggle("menu-open");
    });
  }

  var hero = document.querySelector("[data-hero]");
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        showSlide(current - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        showSlide(current + 1);
        restart();
      });
    }

    restart();
  }

  document.querySelectorAll("[data-filter-area]").forEach(function (area) {
    var input = area.querySelector(".movie-search");
    var buttons = Array.prototype.slice.call(area.querySelectorAll(".filter-btn"));
    var cards = Array.prototype.slice.call(area.querySelectorAll(".movie-card"));
    var active = "all";

    function cardText(card) {
      return [
        card.getAttribute("data-title"),
        card.getAttribute("data-type"),
        card.getAttribute("data-region"),
        card.getAttribute("data-year"),
        card.getAttribute("data-tags")
      ].join(" ").toLowerCase();
    }

    function applyFilter() {
      var keyword = input ? input.value.trim().toLowerCase() : "";
      cards.forEach(function (card) {
        var text = cardText(card);
        var matchesKeyword = !keyword || text.indexOf(keyword) !== -1;
        var matchesFilter = active === "all" || text.indexOf(active.toLowerCase()) !== -1;
        card.classList.toggle("is-hidden", !(matchesKeyword && matchesFilter));
      });
    }

    if (input) {
      input.addEventListener("input", applyFilter);
    }

    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        active = button.getAttribute("data-filter-value") || "all";
        buttons.forEach(function (item) {
          item.classList.toggle("is-active", item === button);
        });
        applyFilter();
      });
    });
  });

  document.querySelectorAll("[data-player]").forEach(function (player) {
    var video = player.querySelector("video[data-src]");
    var cover = player.querySelector(".player-cover");
    var button = player.querySelector(".play-toggle");
    var loaded = false;

    function bindSource() {
      if (!video || loaded) {
        return;
      }
      loaded = true;
      var source = video.getAttribute("data-src");
      if (!source) {
        return;
      }
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(source);
        hls.attachMedia(video);
        video._hls = hls;
      } else {
        video.src = source;
      }
    }

    function startPlayback() {
      bindSource();
      if (!video) {
        return;
      }
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {});
      }
    }

    if (button) {
      button.addEventListener("click", startPlayback);
    }

    if (video) {
      video.addEventListener("play", function () {
        if (cover) {
          cover.classList.add("is-hidden");
        }
      });
      video.addEventListener("pause", function () {
        if (cover && video.currentTime === 0) {
          cover.classList.remove("is-hidden");
        }
      });
    }
  });
})();
