let player;
let isPlaying = false;
let isMuted = false;
let queue = JSON.parse(localStorage.getItem('songQueue') || '[]');
let queueIndex = parseInt(localStorage.getItem('queueIndex') || '0');
let currentSong = { name: null, artist: null, youtubeId: null };

// wordt aangeroepen zodra de YouTube iframe API geladen is, herstelt vorige sessie
window.onYouTubeIframeAPIReady = function () {
    const saved = queue[queueIndex];
    const savedVol = parseInt(localStorage.getItem('volume') || '70');
    document.getElementById('volumeBar').style.width = `${savedVol}%`;
    if (saved) loadSong(saved, false);
};

// voegt een song toe aan de queue en speelt hem af, als hij al in de queue zit springt hij ernaar
function playSong(youtubeId, name, artist) {
    const existing = queue.findIndex(s => s.youtubeId === youtubeId);
    if (existing === -1) {
        queue.push({ youtubeId, name, artist });
        queueIndex = queue.length - 1;
    } else {
        queueIndex = existing;
    }
    saveQueue();
    loadSong(queue[queueIndex], true);
}

// laadt een song in de player, update de UI en speelt af als autoplay true is
function loadSong(song, autoplay = true) {
    if (!song) return;
    currentSong = song;

    document.getElementById('playerName').textContent = song.name;
    document.getElementById('playerArtist').textContent = song.artist;

    const thumb = document.getElementById('playerThumb');
    const fallback = document.getElementById('playerThumbFallback');
    thumb.src = `https://img.youtube.com/vi/${song.youtubeId}/mqdefault.jpg`;
    thumb.classList.remove('hidden');
    fallback.classList.add('hidden');

    if (player && player.loadVideoById) {
        if (autoplay) {
            player.loadVideoById(song.youtubeId);
        } else {
            player.cueVideoById(song.youtubeId);
        }
    } else {
        player = new YT.Player('ytPlayer', {
            height: '0',
            width: '0',
            videoId: song.youtubeId,
            playerVars: { autoplay: autoplay ? 1 : 0 },
            events: {
                onReady: (e) => {
                    const savedVol = parseInt(localStorage.getItem('volume') || '70');
                    e.target.setVolume(savedVol);
                    if (autoplay) e.target.playVideo();
                },
                onStateChange: onPlayerStateChange
            }
        });
    }
}

// gaat naar de volgende song in de queue
function nextSong() {
    if (queueIndex < queue.length - 1) {
        queueIndex++;
        saveQueue();
        loadSong(queue[queueIndex], true);
    }
}

// gaat naar de vorige song, of herstart de huidige als die al meer dan 3 seconden speelt
function prevSong() {
    if (!player) return;
    const current = player.getCurrentTime();
    if (current > 3) {
        player.seekTo(0, true);
    } else if (queueIndex > 0) {
        queueIndex--;
        saveQueue();
        loadSong(queue[queueIndex], true);
    }
}

// wisselt tussen afspelen en pauzeren
function togglePlay() {
    if (!player) return;
    if (isPlaying) {
        player.pauseVideo();
    } else {
        player.playVideo();
    }
}

// luistert naar statuswijzigingen van de player en update het play/pause icoon
function onPlayerStateChange(event) {
    const pauseImg = document.getElementById('pauseBtn');
    if (event.data === YT.PlayerState.PLAYING) {
        isPlaying = true;
        pauseImg.src = "/img/pause.svg";
    } else if (event.data === YT.PlayerState.ENDED) {
        isPlaying = false;
        pauseImg.src = "/img/play.svg";
        nextSong();
    } else {
        isPlaying = false;
        pauseImg.src = "/img/play.svg";
    }
}

// stelt het volume in op basis van waar de gebruiker op de volumebalk klikt
function setVolume(event) {
    if (!player) return;
    const track = document.getElementById('volumeTrack');
    const rect = track.getBoundingClientRect();
    const pct = Math.min(Math.max((event.clientX - rect.left) / rect.width, 0), 1);
    const vol = Math.round(pct * 100);

    player.setVolume(vol);
    document.getElementById('volumeBar').style.width = `${vol}%`;
    localStorage.setItem('volume', vol);

    const icon = document.getElementById('volIcon');
    icon.src = vol === 0 ? '/img/volume-solid-mute.svg' : '/img/volume-solid-full.svg';
    isMuted = vol === 0;
}

// zet het geluid aan of uit, onthoudt het vorige volume om terug te zetten
function toggleMute() {
    if (!player) return;
    if (isMuted) {
        const saved = parseInt(localStorage.getItem('volume') || '70');
        player.setVolume(saved);
        document.getElementById('volumeBar').style.width = `${saved}%`;
        document.getElementById('volIcon').src = '/img/volume-solid-full.svg';
        isMuted = false;
    } else {
        player.setVolume(0);
        document.getElementById('volumeBar').style.width = '0%';
        document.getElementById('volIcon').src = '/img/volume-solid-mute.svg';
        isMuted = true;
    }
}

// slaat de huidige queue en index op in localStorage
function saveQueue() {
    localStorage.setItem('songQueue', JSON.stringify(queue));
    localStorage.setItem('queueIndex', queueIndex.toString());
}

// update elke seconde de progressbalk en tijdweergave
setInterval(() => {
    if (!player || !player.getCurrentTime) return;
    const current = player.getCurrentTime();
    const duration = player.getDuration();
    if (!duration) return;
    const pct = (current / duration) * 100;

    document.getElementById('progressBar').style.width = `${pct}%`;
    document.getElementById('currentTime').textContent = formatTime(current);
    document.getElementById('duration').textContent = formatTime(duration);
}, 1000);

// zet seconden om naar een leesbaar tijdformaat zoals 3:45
function formatTime(seconds) {
    if (!seconds || isNaN(seconds)) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
}

// springt naar het punt in de song waar de gebruiker op de progressbalk klikt
function seekTo(event) {
    if (!player) return;
    const track = document.getElementById('progressTrack');
    const rect = track.getBoundingClientRect();
    const pct = Math.min(Math.max((event.clientX - rect.left) / rect.width, 0), 1);
    const duration = player.getDuration();
    if (!duration) return;
    player.seekTo(pct * duration, true);
}