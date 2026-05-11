//update alles wordt nu uit param query gehaald is beter want is de standaard en kunnnen mensen gewoon query kopieren en dan te werk gaan zo kunnen wij dan ook
// songs delen
document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById("searchInput");

    // Haal query uit URL als die er is
    const urlParams = new URLSearchParams(window.location.search);
    const initialQuery = urlParams.get('q') || "";

    if (initialQuery) {
        searchInput.value = initialQuery;
    }

    const fetchSongs = async (query) => {
        const searchQuery = query || "Top hits 2026";

        // Update URL zonder pagina te herladen
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
        const containerPlaylist = document.getElementById("containerSongs");
        containerPlaylist.textContent = "";
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

            const trackContainer = document.createElement("div");
            trackContainer.className = `grid grid-cols-[40px_1fr_40px] md:grid-cols-[40px_1fr_160px_100px_80px_40px] gap-2 items-center ${index % 2 === 0 ? "bg-[#1E1B3A]" : ""} hover:bg-[#1E1B3A] rounded-xl px-2 py-2 cursor-pointer transition`;

            const number = document.createElement("span");
            const img = document.createElement("img");
            img.className = "w-5 mx-auto";
            img.src = "./img/plus-solid-full.svg";

            number.addEventListener('click', async () => {
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
        });
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
});