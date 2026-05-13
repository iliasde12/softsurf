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

//hier komt mondal van gegeneerde
document.addEventListener("DOMContentLoaded", () => {
    const generateBtn = document.querySelector("button.bg-\\[\\#934c99\\]");
    // selecteer specifiek de genereer knop via data attribute (zie EJS aanpassing)
    const generateSection = document.getElementById("generateBtn");
    if (generateSection) generateSection.addEventListener("click", openGenerateModal);
});

// ─── Generate modal openen ────────────────────────────────────────────────────

async function openGenerateModal() {
    const stemming = document.getElementById("stemmingSelect")?.value || "Feest";
    const aantal = document.getElementById("aantalSelect")?.value || 4;
    const mixtype = document.getElementById("mixtypeSelect")?.value || "Populair + ontdekking";

    // Toon loading modal
    showGenerateModal({ loading: true, stemming, aantal, mixtype });

    try {
        const res = await fetch("/playlist/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ stemming, aantal, mixtype }),
        });

        const data = await res.json();
        if (!data.success) throw new Error(data.error);

        showGenerateModal({
            loading: false,
            stemming,
            aantal,
            mixtype,
            tracks: data.tracks,
            playlistName: data.playlistName,
        });
    } catch (err) {
        showGenerateModal({ loading: false, error: err.message });
    }
}

// ─── Modal renderen ───────────────────────────────────────────────────────────

function showGenerateModal({ loading, tracks, playlistName, error, stemming, aantal, mixtype }) {
    // Verwijder bestaande modal
    document.getElementById("generateModal")?.remove();

    const modal = document.createElement("div");
    modal.id = "generateModal";
    modal.className = "fixed inset-0 bg-black/60 flex items-center justify-center z-50";
    modal.innerHTML = `
    <div class="bg-[#1E1B3A] rounded-2xl p-6 w-full max-w-lg max-h-[90vh] flex flex-col">
 
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-white font-bold text-lg">
          ${loading ? "Genereren..." : error ? "Fout" : "Gegenereerde playlist"}
        </h2>
        <button onclick="closeGenerateModal()" class="text-[#6B6B8A] hover:text-white text-xl transition">✕</button>
      </div>
 
      ${loading ? `
        <div class="flex flex-col items-center justify-center py-12 gap-4">
          <div class="w-8 h-8 border-2 border-[#934c99] border-t-transparent rounded-full animate-spin"></div>
          <p class="text-[#6B6B8A] text-sm">Claude bedenkt je playlist...</p>
        </div>
      ` : error ? `
        <p class="text-red-400 text-sm py-4">${error}</p>
      ` : `
        <!-- Playlist naam -->
        <div class="mb-4">
          <label class="text-[#6B6B8A] text-xs mb-1 block">Naam</label>
          <input
            id="generatedPlaylistName"
            type="text"
            value="${playlistName || ''}"
            class="w-full bg-[#2A2750] text-white text-sm rounded-xl px-4 py-2 outline-none focus:ring-1 focus:ring-[#934c99]"
          />
        </div>
 
        <!-- Tracks -->
        <div class="flex flex-col gap-2 overflow-y-auto flex-1 mb-4 pr-1">
          ${tracks.map((t, i) => `
            <div class="flex items-center gap-3 bg-[#2A2750] rounded-xl px-4 py-3">
              <span class="text-[#6B6B8A] text-xs w-5 text-right">${i + 1}</span>
              ${t.album_cover
        ? `<img src="${t.album_cover}" class="w-10 h-10 rounded-lg object-cover flex-shrink-0" />`
        : `<div class="w-10 h-10 rounded-lg bg-[#3a3760] flex items-center justify-center text-lg flex-shrink-0">🎵</div>`
    }
              <div class="flex flex-col min-w-0 flex-1">
                <span class="text-white text-sm font-medium truncate">${t.name || t.title}</span>
                <span class="text-[#6B6B8A] text-xs truncate">${t.artist || ''}</span>
              </div>
              ${t.found_on_spotify === false
        ? `<span class="text-xs text-[#6B6B8A] italic flex-shrink-0">niet gevonden</span>`
        : `<span class="text-xs text-green-400 flex-shrink-0">✓</span>`
    }
            </div>
          `).join("")}
        </div>
 
        <!-- Acties -->
        <div class="flex gap-2 pt-2 border-t border-[#2A2750]">
          <button
            onclick="closeGenerateModal()"
            class="flex-1 text-[#6B6B8A] text-sm py-2 hover:text-white transition"
          >
            Annuleren
          </button>
          <button
            onclick="createGeneratedPlaylist(${JSON.stringify(tracks).replace(/"/g, '&quot;')})"
            class="flex-1 bg-[#934c99] hover:brightness-110 transition text-white text-sm font-semibold px-5 py-2 rounded-full"
          >
            Maak aan
          </button>
        </div>
      `}
    </div>
  `;

    // Sluit op achtergrond klik
    modal.addEventListener("click", (e) => {
        if (e.target === modal) closeGenerateModal();
    });

    document.body.appendChild(modal);
}

// ─── Playlist aanmaken na bevestiging ─────────────────────────────────────────

async function createGeneratedPlaylist(tracks) {
    const name = document.getElementById("generatedPlaylistName")?.value?.trim();
    if (!name) return alert("Geef je playlist een naam");

    const songIds = tracks
        .filter((t) => t.id || t.spotify_id)
        .map((t) => t.id || t.spotify_id);

    try {
        const res = await fetch("/playlist/create-generated", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, songIds }),
        });

        const data = await res.json();
        if (!data.success) throw new Error(data.error);

        closeGenerateModal();
        window.location.reload();
    } catch (err) {
        alert("Fout bij aanmaken: " + err.message);
    }
}

function closeGenerateModal() {
    document.getElementById("generateModal")?.remove();
}