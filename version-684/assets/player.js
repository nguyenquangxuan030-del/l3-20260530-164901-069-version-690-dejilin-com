function setupPlayer(mediaUrl, videoId, coverId, buttonId) {
  var video = document.getElementById(videoId);
  var cover = document.getElementById(coverId);
  var button = document.getElementById(buttonId);
  var hlsInstance = null;
  var started = false;

  if (!video || !mediaUrl) {
    return;
  }

  function attach() {
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = mediaUrl;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(mediaUrl);
      hlsInstance.attachMedia(video);
      return;
    }

    video.src = mediaUrl;
  }

  function start() {
    if (!started) {
      started = true;
      attach();
    }

    if (cover) {
      cover.classList.add('is-hidden');
    }

    video.setAttribute('controls', 'controls');
    var playTask = video.play();
    if (playTask && typeof playTask.catch === 'function') {
      playTask.catch(function() {
        video.setAttribute('controls', 'controls');
      });
    }
  }

  if (cover) {
    cover.addEventListener('click', start);
  }

  if (button) {
    button.addEventListener('click', function(event) {
      event.stopPropagation();
      start();
    });
  }

  video.addEventListener('click', function() {
    if (!started) {
      start();
    }
  });

  window.addEventListener('pagehide', function() {
    if (hlsInstance) {
      hlsInstance.destroy();
      hlsInstance = null;
    }
  });
}
