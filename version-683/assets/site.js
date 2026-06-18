(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  ready(function () {
    var toggle = document.querySelector(".nav-toggle");
    if (toggle) {
      toggle.addEventListener("click", function () {
        document.body.classList.toggle("nav-open");
      });
    }

    var carousel = document.querySelector("[data-hero-carousel]");
    if (carousel) {
      var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
      var dots = Array.prototype.slice.call(carousel.querySelectorAll(".hero-dot"));
      var index = 0;
      var show = function (next) {
        if (!slides.length) {
          return;
        }
        index = (next + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle("is-active", i === index);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle("is-active", i === index);
        });
      };
      dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
          show(parseInt(dot.getAttribute("data-slide-target"), 10) || 0);
        });
      });
      if (slides.length > 1) {
        window.setInterval(function () {
          show(index + 1);
        }, 5200);
      }
    }

    var inputs = Array.prototype.slice.call(document.querySelectorAll(".filter-input"));
    inputs.forEach(function (input) {
      input.addEventListener("input", function () {
        var q = input.value.trim().toLowerCase();
        var scope = input.closest("section") || document;
        var cards = Array.prototype.slice.call(scope.querySelectorAll(".filter-card"));
        cards.forEach(function (card) {
          var text = (card.getAttribute("data-filter-text") || card.textContent || "").toLowerCase();
          card.classList.toggle("is-hidden-card", q && text.indexOf(q) === -1);
        });
      });
    });

    Array.prototype.slice.call(document.querySelectorAll("img")).forEach(function (img) {
      img.addEventListener("error", function () {
        img.classList.add("image-fallback");
      });
    });

    Array.prototype.slice.call(document.querySelectorAll(".media-player")).forEach(function (player) {
      var video = player.querySelector("video");
      var mask = player.querySelector(".player-mask");
      var source = video && video.querySelector("source");
      var streamUrl = source ? source.getAttribute("src") : "";
      var loaded = false;
      var hlsInstance = null;
      var loadStream = function () {
        if (!video || loaded || !streamUrl) {
          return;
        }
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = streamUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hlsInstance.loadSource(streamUrl);
          hlsInstance.attachMedia(video);
        } else {
          video.src = streamUrl;
        }
        loaded = true;
      };
      var start = function () {
        loadStream();
        if (mask) {
          mask.classList.add("is-hidden");
        }
        if (video) {
          video.controls = true;
          var attempt = video.play();
          if (attempt && typeof attempt.catch === "function") {
            attempt.catch(function () {});
          }
        }
      };
      if (mask) {
        mask.addEventListener("click", start);
      }
      if (video) {
        video.addEventListener("click", function () {
          if (video.paused) {
            start();
          }
        });
        window.addEventListener("beforeunload", function () {
          if (hlsInstance) {
            hlsInstance.destroy();
          }
        });
      }
    });
  });
})();
