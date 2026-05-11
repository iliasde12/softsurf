let player;
let currentSong = {
    name: null,
    artist: null,
    youtubeId: null
};

function playSong(youtubeId, name, artist) {
    currentSong = { name, artist, youtubeId };

    // update UI
    document.getElementById('playerName').textContent = name;
    document.getElementById('playerArtist').textContent = artist;

    if (player) {
        player.loadVideoById(youtubeId);
    } else {
        player = new YT.Player('ytPlayer', {
            height: '0',
            width: '0',
            videoId: youtubeId,
            playerVars: { autoplay: 1 },
            events: {
                onReady: (e) => e.target.playVideo(),
                onStateChange: onPlayerStateChange
            }
        });
    }
}

function onPlayerStateChange(event) {
    const pauseBtn = document.getElementById('pauseBtn');
    if (event.data === YT.PlayerState.PLAYING) {
        pauseBtn.src = "img/pause.svg";
    } else {
        pauseBtn.src = "img/play.svg";
    }
}

setInterval(() => {
    if (!player || !player.getCurrentTime) return;
    const current = player.getCurrentTime();
    const duration = player.getDuration();
    const pct = (current / duration) * 100;

    document.getElementById('progressBar').style.width = `${pct}%`;
    document.getElementById('currentTime').textContent = formatTime(current);
    document.getElementById('duration').textContent = formatTime(duration);
}, 1000);

function formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
}