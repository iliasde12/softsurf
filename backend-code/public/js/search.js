document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById("searchInput");
    let lastSongs = [];
    let viewMode = 'lijst';

    // Haal query uit URL als die er is
    const urlParams = new URLSearchParams(window.location.search);
    const initialQuery = urlParams.get('q') || "";

    if (initialQuery) {
        searchInput.value = initialQuery;
    }

    function updateViewButtons() {
        const lijstBtn = document.getElementById('lijstBtn');
        const rasterBtn = document.getElementById('rasterBtn');

        if (viewMode === 'lijst') {
            lijstBtn.className = "bg-[#7B6BF5] text-white text-xs px-3 py-1 rounded-full";
            rasterBtn.className = "border border-[#3A3760] text-[#A0A0C0] text-xs px-3 py-1 rounded-full hover:bg-[#1E1B3A] transition";
        } else {
            rasterBtn.className = "bg-[#7B6BF5] text-white text-xs px-3 py-1 rounded-full";
            lijstBtn.className = "border border-[#3A3760] text-[#A0A0C0] text-xs px-3 py-1 rounded-full hover:bg-[#1E1B3A] transition";
        }
    }

    document.getElementById('lijstBtn').addEventListener('click', () => {
        viewMode = 'lijst';
        updateViewButtons();
        showSongs(lastSongs);
    });

    document.getElementById('rasterBtn').addEventListener('click', () => {
        viewMode = 'raster';
        updateViewButtons();
        showSongs(lastSongs);
    });

    updateViewButtons();

    const fetchSongs = async (query) => {
        const searchQuery = query || "Top hits 2026";

        const newUrl = query
            ? `${window.location.pathname}?q=${encodeURIComponent(query)}`
            : window.location.pathname;
        window.history.replaceState(null, '', newUrl);

        try {
            const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
            const { fromDB, fromSpotify } = await response.json();

            const normalizedDB = fromDB.map(song => ({
                id: `db_${song._id}`,
                name: song.name,
                popularity: song.popularity ?? 0,
                artists: [{ name: song.album?.artists?.[0]?.name ?? "Onbekend" }],
                album: {
                    images: [{ url: song.album?.images?.[0]?.url ?? "./img/default.svg" }],
                    release_date: song.album?.release_date ?? ""
                }
            }));

            showSongs([...normalizedDB, ...fromSpotify]);

        } catch (error) {
            console.error("Error fetching songs:", error);
        }
    };

    fetchSongs(initialQuery);

    searchInput.addEventListener("input", () => {
        fetchSongs(searchInput.value);
    });

    function showSongs(songs) {
        lastSongs = songs;
        const containerPlaylist = document.getElementById("containerSongs");
        containerPlaylist.textContent = "";

        if (viewMode === 'raster') {
            containerPlaylist.className = "grid grid-cols-2 md:grid-cols-4 gap-4";
        } else {
            containerPlaylist.className = "flex flex-col";
        }

        const moodType = ["favorieten", "chill", "workout"];
        const moodColor = ["#E91E8C", "#2A5A3A", "#1E3A5A"];

        if (songs.length === 0) {
            const empty = document.createElement("p");
            empty.className = "text-white/40 text-center py-10";
            empty.textContent = "Geen songs gevonden";
            containerPlaylist.appendChild(empty);
            return;
        }

        songs.forEach((song, index) => {
            const mood = moodType[index % moodType.length];
            const color = moodColor[index % moodColor.length];
            const trackId = song.id;

            if (viewMode === 'raster') {
                const card = document.createElement("div");
                card.className = "bg-[#1E1B3A] rounded-xl p-3 flex flex-col gap-2 cursor-pointer hover:bg-[#2A2750] transition";

                const albumArt = document.createElement("img");
                albumArt.className = "w-full aspect-square rounded-lg object-cover";
                albumArt.src = song.album.images[0]?.url ?? "./img/default.svg";
                albumArt.alt = song.name;

                const trackName = document.createElement("p");
                trackName.className = "text-white text-sm font-semibold truncate";
                trackName.textContent = song.name;

                const artistName = document.createElement("p");
                artistName.className = "text-[#6B6B8A] text-xs truncate";
                artistName.textContent = song.artists?.[0]?.name ?? "Onbekend";

                const addBtn = document.createElement("img");
                addBtn.className = "w-5 cursor-pointer";
                addBtn.src = "./img/plus-solid-full.svg";
                addBtn.addEventListener('click', async (e) => {
                    e.stopPropagation();
                    await openPlaylistModal(trackId);
                });

                card.append(albumArt, trackName, artistName, addBtn);
                containerPlaylist.appendChild(card);

            } else {
                const trackContainer = document.createElement("div");
                trackContainer.className = `grid grid-cols-[40px_1fr_40px] md:grid-cols-[40px_1fr_160px_100px_80px_40px] gap-2 items-center ${index % 2 === 0 ? "bg-[#1E1B3A]" : ""} hover:bg-[#1E1B3A] rounded-xl px-2 py-2 cursor-pointer transition`;

                const number = document.createElement("span");
                const img = document.createElement("img");
                img.className = "w-5 mx-auto";
                img.src = "./img/plus-solid-full.svg";
                number.addEventListener('click', async () => {
                    await openPlaylistModal(trackId);
                });
                number.append(img);

                const infoWrapper = document.createElement("div");
                infoWrapper.className = "flex items-center gap-3";

                const albumArt = document.createElement("img");
                albumArt.className = "w-9 h-9 rounded-lg object-cover shrink-0";
                albumArt.src = song.album.images[0]?.url ?? "./img/default.svg";
                albumArt.alt = song.name;

                const textDiv = document.createElement("div");

                const trackName = document.createElement("p");
                trackName.className = "text-white text-sm font-semibold";
                trackName.textContent = song.name;

                const artistName = document.createElement("p");
                artistName.className = "text-[#6B6B8A] text-xs";
                artistName.textContent = song.artists?.[0]?.name ?? "Onbekend";

                textDiv.append(trackName, artistName);
                infoWrapper.append(albumArt, textDiv);

                const labelWrapper = document.createElement("span");
                labelWrapper.className = "hidden md:block";
                const label = document.createElement("span");
                label.className = "text-white text-[10px] px-2 py-1 rounded-full";
                label.style.backgroundColor = color;
                label.textContent = mood;
                labelWrapper.appendChild(label);

                const date = document.createElement("span");
                date.className = "hidden md:block text-[#6B6B8A] text-xs";
                date.textContent = song.album.release_date
                    ? new Date(song.album.release_date).toLocaleDateString("nl-NL", { day: "numeric", month: "short" })
                    : "";

                const popularity = document.createElement("span");
                popularity.className = "hidden md:block text-[#A0A0C0] text-xs";
                popularity.textContent = song.popularity;

                const heart = document.createElement("span");
                heart.className = "text-[#E91E8C] text-sm";
                heart.textContent = "♥";

                trackContainer.append(number, infoWrapper, labelWrapper, date, popularity, heart);
                containerPlaylist.appendChild(trackContainer);
            }
        });
    }

    async function openPlaylistModal(trackId) {
        const res = await fetch('/api/playlists');
        const playlists = await res.json();

        const list = document.getElementById('playlistList');
        list.innerHTML = '';
        playlists.forEach(playlist => {
            const div = document.createElement('div');
            div.className = 'text-white bg-[#2A2750] rounded-xl px-4 py-2 cursor-pointer hover:bg-[#33306b]';
            div.textContent = playlist.name;
            div.addEventListener('click', async () => {
                await addSongToPlaylist(playlist._id, trackId);
                document.getElementById('addSongModal').classList.add('hidden');
            });
            list.appendChild(div);
        });

        document.getElementById('addSongModal').classList.remove('hidden');
    }

    async function addSongToPlaylist(playlistId, trackId) {
        const response = await fetch('/api/playlist/add-song', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ playlistId, trackId })
        });
        return await response.json();
    }

    document.getElementById('sluitAddModal').addEventListener('click', () => {
        document.getElementById('addSongModal').classList.add('hidden');
    });


    // ── Shazam ────────────────────────────────────────────────────────────────
    let shazamRecorder = null;
    let shazamChunks = [];
    let shazamTimer = null;
    let shazamSeconds = 0;
    let shazamResult = null;

    const shazamModal        = document.getElementById('shazamModal');
    const shazamRing         = document.getElementById('shazamRing');
    const shazamTitle        = document.getElementById('shazamTitle');
    const shazamSub          = document.getElementById('shazamSub');
    const shazamTimerEl      = document.getElementById('shazamTimer');
    const shazamResultBox    = document.getElementById('shazamResult');
    const shazamResultImg    = document.getElementById('shazamResultImg');
    const shazamResultSong   = document.getElementById('shazamResultSong');
    const shazamResultArtist = document.getElementById('shazamResultArtist');
    const shazamStartBtn     = document.getElementById('shazamStart');
    const shazamAddBtn       = document.getElementById('shazamAdd');

    function shazamReset() {
        shazamResult = null;
        stopShazamRecording();
        shazamRing.textContent = '🎵';
        shazamRing.className = 'w-20 h-20 rounded-full border-2 border-accent/30 bg-accent/10 flex items-center justify-center mx-auto mb-5 text-3xl transition-all duration-300';
        shazamTitle.textContent = 'Muziek herkennen';
        shazamSub.textContent = 'Druk op starten en houd je apparaat bij de muziek.';
        shazamTimerEl.classList.add('hidden');
        shazamResultBox.classList.add('hidden');
        shazamStartBtn.classList.remove('hidden');
        shazamStartBtn.textContent = 'Starten';
        shazamStartBtn.onclick = startShazam;
        shazamAddBtn.classList.add('hidden');
    }

    function setShazamRing(state) {
        const base = 'w-20 h-20 rounded-full border-2 flex items-center justify-center mx-auto mb-5 text-3xl transition-all duration-300';
        if (state === 'listening') {
            shazamRing.className = base + ' border-pink-500 bg-pink-500/10 animate-pulse';
            shazamRing.textContent = '🎤';
        } else if (state === 'processing') {
            shazamRing.className = base + ' border-yellow-500 bg-yellow-500/10';
            shazamRing.textContent = '⏳';
        } else {
            shazamRing.className = base + ' border-accent/30 bg-accent/10';
            shazamRing.textContent = '🎵';
        }
    }

    document.getElementById('shazamBtn').addEventListener('click', () => {
        shazamReset();
        shazamModal.classList.remove('hidden');
    });

    document.getElementById('shazamCancel').addEventListener('click', () => {
        stopShazamRecording();
        shazamModal.classList.add('hidden');
    });

    shazamModal.addEventListener('click', e => {
        if (e.target === shazamModal) {
            stopShazamRecording();
            shazamModal.classList.add('hidden');
        }
    });

    shazamStartBtn.onclick = startShazam;

    async function startShazam() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mimeType = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg', 'audio/mp4']
                .find(m => MediaRecorder.isTypeSupported(m)) || '';
            shazamRecorder = new MediaRecorder(stream, mimeType ? { mimeType } : {});
            shazamChunks = [];
            shazamRecorder.ondataavailable = e => { if (e.data.size > 0) shazamChunks.push(e.data); };
            shazamRecorder.onstop = processShazam;
            shazamRecorder.start(100);

            setShazamRing('listening');
            shazamTitle.textContent = 'Luisteren...';
            shazamSub.textContent = 'Houd je apparaat bij de muziek. Stopt na 10 seconden.';
            shazamTimerEl.classList.remove('hidden');
            shazamStartBtn.classList.add('hidden');

            shazamSeconds = 0;
            shazamTimerEl.textContent = '0s';
            shazamTimer = setInterval(() => {
                shazamSeconds++;
                shazamTimerEl.textContent = shazamSeconds + 's';
                if (shazamSeconds >= 10) stopShazamRecording()
            }, 1000);

        } catch (e) {
            shazamSub.textContent = 'Microfoon toegang geweigerd. Sta dit toe in je browser.';
        }
    }

    function stopShazamRecording() {
        if (shazamTimer) { clearInterval(shazamTimer); shazamTimer = null; }
        if (shazamRecorder && shazamRecorder.state !== 'inactive') {
            shazamRecorder.stop();
            shazamRecorder.stream.getTracks().forEach(t => t.stop());
        }
    }

    async function processShazam() {
        setShazamRing('processing');
        shazamTitle.textContent = 'Herkennen...';
        shazamSub.textContent = 'Shazam analyseert de audio...';
        shazamTimerEl.classList.add('hidden');

        try {
            const blob = new Blob(shazamChunks, { type: shazamRecorder.mimeType || 'audio/webm' });
            const buffer = await blob.arrayBuffer();
            const bytes = new Uint8Array(buffer);
            let binary = '';
            for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
            const base64Audio = btoa(binary);

            const res = await fetch('/api/shazam/detect', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ audio: base64Audio })
            });

            if (res.status === 401) {
                shazamTitle.textContent = 'Niet ingelogd';
                shazamSub.textContent = 'Log opnieuw in om muziek te herkennen.';
                setShazamRing('idle');
                return;
            }

            if (!res.ok) throw new Error('HTTP ' + res.status);
            const data = await res.json();

            if (data && data.track) {
                shazamResult = {
                    name: data.track.title || 'Onbekend',
                    artist: data.track.subtitle || '',
                    img: data.track.images?.coverart || ''
                };
                shazamResultSong.textContent = shazamResult.name;
                shazamResultArtist.textContent = shazamResult.artist;
                shazamResultImg.src = shazamResult.img;
                shazamResultImg.style.display = shazamResult.img ? 'block' : 'none';
                shazamResultBox.classList.remove('hidden');
                shazamAddBtn.classList.remove('hidden');
                shazamStartBtn.classList.add('hidden');
                shazamTitle.textContent = '🎉 Gevonden!';
                shazamSub.textContent = '';
                setShazamRing('idle');
            } else {
                shazamTitle.textContent = 'Niet herkend';
                shazamSub.textContent = 'Probeer opnieuw met de muziek dichter bij je microfoon.';
                shazamStartBtn.classList.remove('hidden');
                shazamStartBtn.textContent = '↺ Opnieuw';
                shazamStartBtn.onclick = shazamReset;
                setShazamRing('idle');
            }

        } catch (err) {
            shazamTitle.textContent = 'Fout opgetreden';
            shazamSub.textContent = 'Controleer je internetverbinding en probeer opnieuw.';
            shazamStartBtn.classList.remove('hidden');
            shazamStartBtn.textContent = '↺ Opnieuw';
            shazamStartBtn.onclick = shazamReset;
            setShazamRing('idle');
            console.error(err);
        }
    }

    shazamAddBtn.addEventListener('click', () => {
        if (!shazamResult) return;
        shazamModal.classList.add('hidden');
        searchInput.value = shazamResult.name;
        fetchSongs(shazamResult.name);
    });


});