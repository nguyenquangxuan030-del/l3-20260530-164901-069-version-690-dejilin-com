(() => {
    const players = document.querySelectorAll("[data-player]");

    players.forEach((player) => {
        const video = player.querySelector("video");
        const cover = player.querySelector(".play-cover");
        const message = player.querySelector(".player-message");
        const source = player.dataset.video;
        let loaded = false;

        const setMessage = (text) => {
            if (message) {
                message.textContent = text;
            }
        };

        const attachSource = () => {
            if (loaded || !video || !source) {
                return;
            }

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
                loaded = true;
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                const hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });

                hls.loadSource(source);
                hls.attachMedia(video);
                loaded = true;
                return;
            }

            video.src = source;
            loaded = true;
        };

        const start = () => {
            attachSource();

            if (cover) {
                cover.classList.add("is-hidden");
            }

            const promise = video.play();

            if (promise && typeof promise.catch === "function") {
                promise.catch(() => {
                    if (cover) {
                        cover.classList.remove("is-hidden");
                    }
                    setMessage("播放暂时无法加载，请稍后再试。");
                });
            }
        };

        if (cover) {
            cover.addEventListener("click", start);
        }

        player.addEventListener("click", (event) => {
            if (event.target === player) {
                start();
            }
        });

        video.addEventListener("play", () => {
            if (cover) {
                cover.classList.add("is-hidden");
            }
            setMessage("");
        });
    });
})();
