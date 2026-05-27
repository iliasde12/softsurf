document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("searchInput");
  const searchResults = document.getElementById("searchResults");

  const slots = { first: null, second: null };
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
    searchTimeout = setTimeout(() => fetchArtists(q), 300);
  });

  document.addEventListener("click", (e) => {
    if (!searchResults.contains(e.target) && e.target !== searchInput) {
      hideResults();
    }
  });

  async function fetchArtists(query) {
    try {
      const res = await fetch(
        `/api/search/artist?q=${encodeURIComponent(query)}`,
      );
      if (!res.ok) return;
      const artists = await res.json();
      showResults(artists);
    } catch (e) {
      console.error("Search error:", e);
    }
  }

  function showResults(artists) {
    searchResults.innerHTML = "";
    if (!artists.length) {
      searchResults.innerHTML = `<p class="px-4 py-3 text-sm text-muted">Geen resultaten</p>`;
      searchResults.classList.remove("hidden");
      return;
    }

    artists.forEach((a) => {
      const item = document.createElement("button");
      item.className =
        "flex items-center gap-3 w-full px-3 py-2 hover:bg-card text-left transition";

      const img = document.createElement("img");
      img.src = a.image ?? "";
      img.className = "w-10 h-10 rounded-full object-cover shrink-0";

      const info = document.createElement("div");
      info.className = "min-w-0 flex-1";
      const name = document.createElement("p");
      name.className = "text-sm text-light truncate";
      name.textContent = a.name;
      const sub = document.createElement("p");
      sub.className = "text-xs text-muted truncate";
      sub.textContent = `${formatNumber(a.followers)} volgers`;
      info.append(name, sub);

      item.append(img, info);
      item.addEventListener("click", () => addArtist(a.id));
      searchResults.appendChild(item);
    });

    searchResults.classList.remove("hidden");
  }

  function hideResults() {
    searchResults.classList.add("hidden");
    searchResults.innerHTML = "";
  }

  // ─── ADD / REMOVE ────────────────────────────────────────────────────────
  async function addArtist(artistId) {
    hideResults();
    searchInput.value = "";

    let slot;
    if (!slots.first) slot = "first";
    else if (!slots.second) slot = "second";
    else slot = nextSlot;

    try {
      const res = await fetch(`/api/artist/${artistId}`);
      if (!res.ok) return;
      const artist = await res.json();

      slots[slot] = artist;
      renderSlot(slot);
      nextSlot = slot === "first" ? "second" : "first";
      renderSummary();
    } catch (e) {
      console.error("addArtist error:", e);
    }
  }

  function removeArtist(slot) {
    slots[slot] = null;
    document.getElementById(`empty-${slot}`).classList.remove("hidden");
    document.getElementById(`filled-${slot}`).classList.add("hidden");
    nextSlot = slot;
    renderSummary();
  }

  document
    .getElementById("remove-first")
    .addEventListener("click", () => removeArtist("first"));
  document
    .getElementById("remove-second")
    .addEventListener("click", () => removeArtist("second"));

  // ─── RENDER ──────────────────────────────────────────────────────────────
  function renderSlot(slot) {
    const a = slots[slot];
    if (!a) return;

    document.getElementById(`empty-${slot}`).classList.add("hidden");
    document.getElementById(`filled-${slot}`).classList.remove("hidden");

    document.getElementById(`img-${slot}`).src = a.image ?? "";
    document.getElementById(`name-${slot}`).textContent = a.name;

    document.getElementById(`pop-${slot}`).textContent = a.popularity;
    document.getElementById(`pop-bar-${slot}`).style.width = `${a.popularity}%`;
    document.getElementById(`followers-${slot}`).textContent = formatNumber(
      a.followers,
    );
    document.getElementById(`albums-${slot}`).textContent = a.albumsCount;
    document.getElementById(`genre-${slot}`).textContent =
      a.genre || "Onbekend";
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

    const popWinner =
      a.popularity > b.popularity ? a : b.popularity > a.popularity ? b : null;
    const followersWinner =
      a.followers > b.followers ? a : b.followers > a.followers ? b : null;
    const albumsWinner =
      a.albumsCount > b.albumsCount
        ? a
        : b.albumsCount > a.albumsCount
          ? b
          : null;

    const parts = [];
    if (popWinner)
      parts.push(
        `<span class="text-light font-semibold">${popWinner.name}</span> scoort hoger op populariteit`,
      );
    if (followersWinner)
      parts.push(
        `${followersWinner === popWinner ? "en" : "<span class='text-light font-semibold'>" + followersWinner.name + "</span> heeft meer"} volgers`,
      );
    if (albumsWinner)
      parts.push(
        `<span class="text-light font-semibold">${albumsWinner.name}</span> heeft meer albums uitgebracht`,
      );

    text.innerHTML = parts.length
      ? parts.join(". ") + "."
      : `<span class="text-light font-semibold">${a.name}</span> en <span class="text-light font-semibold">${b.name}</span> scoren gelijk.`;

    summary.classList.remove("hidden");
  }

  // ─── HELPERS ─────────────────────────────────────────────────────────────
  function formatNumber(n) {
    if (n === undefined || n === null) return "0";
    if (n >= 1_000_000)
      return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
    if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
    return n.toString();
  }
});
