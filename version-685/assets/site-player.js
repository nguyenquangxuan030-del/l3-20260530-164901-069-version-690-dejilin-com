(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var shells = Array.prototype.slice.call(document.querySelectorAll(".player-shell"));

        shells.forEach(function (shell) {
            var video = shell.querySelector("video");
            var button = shell.querySelector(".player-start");
            var source = video ? video.querySelector("source") : null;
            var src = source ? source.getAttribute("src") : "";
            var attached = false;
            var hls = null;

            function attachPlayer() {
                if (!video || !src || attached) {
                    return;
                }

                attached = true;

                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = src;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(src);
                    hls.attachMedia(video);
                } else {
                    video.src = src;
                }
            }

            function playVideo() {
                attachPlayer();
                shell.classList.add("is-playing");

                var playPromise = video.play();

                if (playPromise && playPromise.catch) {
                    playPromise.catch(function () {
                        shell.classList.remove("is-playing");
                    });
                }
            }

            if (!video) {
                return;
            }

            attachPlayer();

            if (button) {
                button.addEventListener("click", playVideo);
            }

            video.addEventListener("play", function () {
                shell.classList.add("is-playing");
            });

            video.addEventListener("pause", function () {
                if (!video.ended) {
                    shell.classList.remove("is-playing");
                }
            });

            video.addEventListener("ended", function () {
                shell.classList.remove("is-playing");
            });
        });
    });
})();
