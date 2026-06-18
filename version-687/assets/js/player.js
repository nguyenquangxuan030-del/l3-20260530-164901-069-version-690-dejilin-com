(function () {
  function bindPlayer(container) {
    var video = container.querySelector('video');
    var overlay = container.querySelector('[data-play-overlay]');
    var url = video ? video.getAttribute('data-url') : '';
    var loaded = false;
    var hls = null;

    if (!video || !overlay || !url) {
      return;
    }

    function loadVideo() {
      if (loaded) {
        return;
      }

      loaded = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(url);
        hls.attachMedia(video);
      } else {
        video.src = url;
      }
    }

    function start() {
      loadVideo();
      video.controls = true;
      overlay.classList.add('is-hidden');
      var playResult = video.play();

      if (playResult && typeof playResult.catch === 'function') {
        playResult.catch(function () {
          overlay.classList.remove('is-hidden');
        });
      }
    }

    overlay.addEventListener('click', start);

    video.addEventListener('click', function () {
      if (video.paused) {
        start();
      }
    });

    video.addEventListener('ended', function () {
      overlay.classList.remove('is-hidden');
    });

    window.addEventListener('beforeunload', function () {
      if (hls && typeof hls.destroy === 'function') {
        hls.destroy();
      }
    });
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(bindPlayer);
})();
