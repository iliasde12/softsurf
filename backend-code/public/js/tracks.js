document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("searchInput");
  const searchResults = document.getElementById("searchResults");

  // state van de twee slots — null als leeg, anders het track-object
  const slots = { first: null, second: null };

  // welke slot wordt volgende keer gevuld als beide al vol zijn
  let nextSlot = "first";

  let searchTimeout = null;

  // ─── SEARCH ──────────────────────────────────────────────────────────────
  searchInput.addEventListener("input", () => {
    const q = searchInput.value.trim();
    clearTimeout(searchTimeout);

    if (!q) {
      hideResults();
      return;
    }
    // debounce 300ms zodat we niet bij elke toetsaanslag fetchen
    searchTimeout = setTimeout(() => fetchTracks(q), 300);
  });

  // klik buiten de dropdown → sluit ze
  document.addEventListener("click", (e) => {
    if (!searchResults.contains(e.target) && e.target !== searchInput) {
      hideResults();
    }
  });

  async function fetchTracks(query) {
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      if (!res.ok) return;
      const { fromSpotify } = await res.json();
      showResults(fromSpotify ?? []);
    } catch (e) {
      console.error("Search error:", e);
    }
  }

  function showResults(tracks) {
    searchResults.innerHTML = "";
    if (!tracks.length) {
      searchResults.innerHTML = `<p class="px-4 py-3 text-sm text-muted">Geen resultaten</p>`;
      searchResults.classList.remove("hidden");
      return;
    }

    tracks.forEach((track) => {
      const item = document.createElement("button");
      item.className =
        "flex items-center gap-3 w-full px-3 py-2 hover:bg-card text-left transition";

      const cover = track.album?.images?.[0]?.url ?? "";
      const artist = track.artists?.[0]?.name ?? "Onbekend";

      const img = document.createElement("img");
      img.src = cover;
      img.className = "w-10 h-10 rounded-md object-cover shrink-0";

      const info = document.createElement("div");
      info.className = "min-w-0 flex-1";
      const name = document.createElement("p");
      name.className = "text-sm text-light truncate";
      name.textContent = track.name;
      const art = document.createElement("p");
      art.className = "text-xs text-muted truncate";
      art.textContent = artist;
      info.append(name, art);

      item.append(img, info);
      item.addEventListener("click", () => addTrack(track.id));
      searchResults.appendChild(item);
    });

    searchResults.classList.remove("hidden");
  }

  function hideResults() {
    searchResults.classList.add("hidden");
    searchResults.innerHTML = "";
  }

  // ─── ADD / REMOVE ────────────────────────────────────────────────────────
  async function addTrack(spotifyId) {
    hideResults();
    searchInput.value = "";

    // welke slot? eerste lege, anders volgens toggle
    let slot;
    if (!slots.first) slot = "first";
    else if (!slots.second) slot = "second";
    else slot = nextSlot;

    try {
      const res = await fetch(`/api/track/${spotifyId}`);
      if (!res.ok) return;
      const track = await res.json();

      slots[slot] = track;
      renderSlot(slot);
      nextSlot = slot === "first" ? "second" : "first";
      renderSummary();
    } catch (e) {
      console.error("addTrack error:", e);
    }
  }

  function removeTrack(slot) {
    slots[slot] = null;
    document.getElementById(`empty-${slot}`).classList.remove("hidden");
    document.getElementById(`filled-${slot}`).classList.add("hidden");
    nextSlot = slot;
    renderSummary();
  }

  document
    .getElementById("remove-first")
    .addEventListener("click", () => removeTrack("first"));
  document
    .getElementById("remove-second")
    .addEventListener("click", () => removeTrack("second"));

  // ─── RENDER ──────────────────────────────────────────────────────────────
  function renderSlot(slot) {
    const t = slots[slot];
    if (!t) return;

    document.getElementById(`empty-${slot}`).classList.add("hidden");
    document.getElementById(`filled-${slot}`).classList.remove("hidden");

    document.getElementById(`img-${slot}`).src = t.image ?? "";
    document.getElementById(`name-${slot}`).textContent = t.name;
    document.getElementById(`meta-${slot}`).textContent =
      `${t.artist}${t.year ? " · " + t.year : ""}`;

    document.getElementById(`pop-${slot}`).textContent = t.popularity;
    document.getElementById(`pop-bar-${slot}`).style.width = `${t.popularity}%`;
    document.getElementById(`dur-${slot}`).textContent = msToTime(
      t.duration_ms,
    );
    document.getElementById(`rank-${slot}`).textContent = `${t.popularity}/100`;
    document.getElementById(`genre-${slot}`).textContent =
      t.genre || "Onbekend";
  }

  function renderSummary() {
    const summary = document.getElementById("summary");
    const text = document.getElementById("summary-text");

    if (!slots.first || !slots.second) {
      summary.classList.add("hidden");
      return;
    }

    const a = slots.first;
    const b = slots.second;
    let winner = null;
    let loser = null;
    if (a.popularity > b.popularity) {
      winner = a;
      loser = b;
    } else if (b.popularity > a.popularity) {
      winner = b;
      loser = a;
    }

    if (winner) {
      text.innerHTML =
        `<span class="text-light font-semibold">${winner.name}</span> ` +
        `scoort hoger op populariteit dan ` +
        `<span class="text-light font-semibold">${loser.name}</span>.`;
    } else {
      text.innerHTML =
        `<span class="text-light font-semibold">${a.name}</span> en ` +
        `<span class="text-light font-semibold">${b.name}</span> hebben ` +
        `dezelfde populariteit.`;
    }

    summary.classList.remove("hidden");
  }

  // ─── HELPERS ─────────────────────────────────────────────────────────────
  function msToTime(ms) {
    const totalSec = Math.floor(ms / 1000);
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    return `${min}:${sec.toString().padStart(2, "0")}`;
  }
});
