const selectedSongs = [];

// Modal openen
document.querySelector("#maak-playlist").addEventListener("click", () => {
    document.getElementById("createModal").classList.remove("hidden");
});

// Modal sluiten
document.querySelector("#sluitModal").addEventListener("click", () => {
    document.getElementById("createModal").classList.add("hidden");
    resetModal();
});

// Afbeelding preview
document.querySelector("#imagePreview").addEventListener("click", () => {
    document.querySelector("#playlistImage").click();
});

document.querySelector("#playlistImage").addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
        const preview = document.getElementById("imagePreview");
        preview.innerHTML = `<img src="${ev.target.result}" class="w-full h-full object-cover rounded-xl"/>`;
    };
    reader.readAsDataURL(file);
});

// Nummers zoeken
document.querySelector("#songSearch").addEventListener("input", async (e) => {
    const query = e.target.value;
    const container = document.getElementById("searchResults");
    container.textContent = "";

    if (!query) return;

    const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
    const { fromDB, fromSpotify } = await res.json();

    const normalizedDB = fromDB.map(song => ({
        name: song.name,
        popularity: song.popularity ?? 0,
        artists: [{ name: song.album?.artists?.[0]?.name ?? "Onbekend" }],
        album: {
            images: [{ url: song.album?.images?.[0]?.url ?? "./img/default.svg" }],
            release_date: song.album?.release_date ?? ""
        }
    }));

    const songs = [...normalizedDB, ...fromSpotify];

    songs.slice(0, 5).forEach(song => {
        const item = document.createElement("div");
        item.className = "flex items-center gap-3 bg-[#2A2750] hover:bg-[#33306b] px-3 py-2 rounded-xl cursor-pointer";

        const img = document.createElement("img");
        img.className = "w-8 h-8 rounded-lg object-cover shrink-0";
        img.src = song.album?.images?.[0]?.url ?? "./img/default.svg";

        const text = document.createElement("div");

        const name = document.createElement("p");
        name.className = "text-white text-sm font-semibold";
        name.textContent = song.name;

        const artist = document.createElement("p");
        artist.className = "text-[#6B6B8A] text-xs";
        artist.textContent =  song.album?.artists?.[0]?.name ?? "Onbekend";

        text.append(name, artist);
        item.append(img, text);
        item.addEventListener("click", () => addSong(song));
        container.appendChild(item);
    });
});

// Nummer toevoegen
function addSong(song) {
    if (selectedSongs.find(s => s.name === song.name)) return;
    selectedSongs.push(song);

    const container = document.getElementById("selectedSongs");

    const item = document.createElement("div");
    item.className = "flex items-center gap-3 bg-[#1E1B3A] border border-[#E91E8C33] px-3 py-2 rounded-xl";

    const img = document.createElement("img");
    img.className = "w-8 h-8 rounded-lg object-cover shrink-0";
    img.src = song.album?.images?.[0]?.url ?? "./img/default.svg";

    const text = document.createElement("div");
    text.className = "flex-1";

    const name = document.createElement("p");
    name.className = "text-white text-sm font-semibold";
    name.textContent = song.name;

    const artist = document.createElement("p");
    artist.className = "text-[#6B6B8A] text-xs";
    artist.textContent = song.artists?.[0]?.name ?? "Onbekend";

    text.append(name, artist);

    const remove = document.createElement("span");
    remove.className = "text-[#E91E8C] cursor-pointer text-xs ml-auto";
    remove.textContent = "✕";
    remove.addEventListener("click", () => {
        selectedSongs.splice(selectedSongs.indexOf(song), 1);
        item.remove();
    });

    item.append(img, text, remove);
    container.appendChild(item);
}


// Reset modal
function resetModal() {
    document.getElementById("playlistName").value = "";
    document.getElementById("playlistDescription").value = "";
    document.getElementById("playlistImage").value = "";
    document.getElementById("imagePreview").innerHTML = `<span class="text-[#6B6B8A] text-sm">+ Klik om afbeelding te uploaden</span>`;
    document.getElementById("searchResults").textContent = "";
    document.getElementById("selectedSongs").textContent = "";
    selectedSongs.length = 0;
}