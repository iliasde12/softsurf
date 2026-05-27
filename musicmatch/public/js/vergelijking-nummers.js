document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.querySelector("input[type='search']");
    let selectedTracks = [null, null];
    let searchResults = [];
    let selectingSlot = 0;

    // ── Dropdown ─────────────────────────────────────────────────────────────
    const dropdown = document.createElement("div");
    dropdown.className = "absolute z-[100] w-full bg-surface border border-border rounded-xl mt-1 shadow-xl overflow-hidden hidden";
    searchInput.parentElement.style.position = "relative";
    searchInput.parentElement.appendChild(dropdown);

    let searchTimeout = null;

    searchInput.addEventListener("input", () => {
        clearTimeout(searchTimeout);
        const q = searchInput.value.trim();
        if (!q) { dropdown.classList.add("hidden"); return; }

        searchTimeout = setTimeout(async () => {
            try {
                const res = await fetch(`/api/vergelijk/nummer/zoek?q=${encodeURIComponent(q)}`);
                searchResults = await res.json();
                renderDropdown(searchResults);
            } catch (e) {
                console.error("Zoekfout:", e);
            }
        }, 300);
    });

    searchInput.addEventListener("focus", () => {
        if (searchResults.length > 0) dropdown.classList.remove("hidden");
    });

    document.addEventListener("click", (e) => {
        if (!searchInput.parentElement.contains(e.target)) {
            dropdown.classList.add("hidden");
        }
    });

    // ── Dropdown renderen ─────────────────────────────────────────────────────
    function renderDropdown(tracks) {
        dropdown.innerHTML = "";
        if (!tracks || tracks.length === 0) { dropdown.classList.add("hidden"); return; }

        tracks.forEach((track) => {
            const item = document.createElement("div");
            item.className = "flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-accent/10 transition";

            const img = document.createElement("img");
            img.src = track.image && track.image !== ""
                ? track.image
                : "https://placehold.co/36x36/1a1828/6b6889?text=🎵";
            img.className = "w-9 h-9 rounded-lg object-cover shrink-0";

            const name = document.createElement("span");
            name.className = "text-light text-sm font-medium";
            name.textContent = track.name;

            const artist = document.createElement("span");
            artist.className = "text-muted text-xs ml-auto";
            artist.textContent = track.artist;

            item.append(img, name, artist);
            item.addEventListener("click", () => selectTrack(track.id));
            dropdown.appendChild(item);
        });

        dropdown.classList.remove("hidden");
    }

    // ── Nummer selecteren ─────────────────────────────────────────────────────
    async function selectTrack(trackId) {
        dropdown.classList.add("hidden");
        searchInput.value = "";
        searchResults = [];

        try {
            const res = await fetch(`/api/vergelijk/nummer/${encodeURIComponent(trackId)}`);
            const track = await res.json();

            selectedTracks[selectingSlot] = track;
            selectingSlot = selectingSlot === 0 ? 1 : 0;

            renderComparison();
        } catch (e) {
            console.error("Nummer laden mislukt:", e);
        }
    }

    // ── Vergelijking renderen ─────────────────────────────────────────────────
    function renderComparison() {
        const t1 = selectedTracks[0];
        const t2 = selectedTracks[1];

        if (t1) renderTrack(t1, "eerste");
        if (t2) renderTrack(t2, "tweede");
        if (t1 && t2) renderSummary(t1, t2);
    }

    function renderTrack(track, slot) {
        document.getElementById(`naam-${slot}-nummer`).textContent = track.name;
        document.getElementById(`sub-${slot}-nummer`).textContent = `${track.artist} · ${track.year}`;

        const img = document.getElementById(`img-${slot}-nummer`);
        if (img) {
            img.src = track.image && track.image !== ""
                ? track.image
                : "https://placehold.co/80x80/1a1828/6b6889?text=🎵";
        }

        document.getElementById(`popularity-${slot}-nummer`).textContent = track.popularity ?? "–";
        document.getElementById(`duration-${slot}-nummer`).textContent = track.duration ?? "–";
        document.getElementById(`explicit-${slot}-nummer`).textContent = track.explicit ? "Ja" : "Nee";
        document.getElementById(`genre-${slot}-nummer`).textContent = track.genre ?? "–";
    }

    function renderSummary(t1, t2) {
        updateStatIcon("popularity", t1.popularity >= t2.popularity, t1.popularity, t2.popularity);
        updateProgressBar("popularity", t1.popularity, t2.popularity, Math.max(t1.popularity, t2.popularity) || 1);
        updateProgressBar("duration", t1.duration_ms, t2.duration_ms, Math.max(t1.duration_ms, t2.duration_ms) || 1);

        const winner = t1.popularity >= t2.popularity ? t1.name : t2.name;
        const loser = t1.popularity >= t2.popularity ? t2.name : t1.name;

        const summaryText = document.getElementById("summary-text");
        if (summaryText) {
            summaryText.innerHTML = `<span class="text-light font-semibold">${winner}</span> wint op populariteit. <span class="text-light font-semibold">${loser}</span> scoort lager.`;
        }
    }

    // ── Stat helpers ──────────────────────────────────────────────────────────
    function updateStatIcon(stat, firstWins, val1, val2) {
        const icon1 = document.getElementById(`icon-${stat}-eerste`);
        const icon2 = document.getElementById(`icon-${stat}-tweede`);
        if (!icon1 || !icon2) return;

        if (firstWins) {
            icon1.innerHTML = greenCheck() + `<span id="${stat}-eerste-nummer">${val1}</span>`;
            icon1.className = "flex items-center gap-1.5 text-[1rem] font-semibold text-green";
            icon2.innerHTML = redCross() + `<span id="${stat}-tweede-nummer">${val2}</span>`;
            icon2.className = "flex items-center gap-1.5 text-base font-semibold text-red";
        } else {
            icon1.innerHTML = redCross() + `<span id="${stat}-eerste-nummer">${val1}</span>`;
            icon1.className = "flex items-center gap-1.5 text-base font-semibold text-red";
            icon2.innerHTML = greenCheck() + `<span id="${stat}-tweede-nummer">${val2}</span>`;
            icon2.className = "flex items-center gap-1.5 text-[1rem] font-semibold text-green";
        }
    }

    function updateProgressBar(stat, val1, val2, max) {
        const bar1 = document.getElementById(`bar-${stat}-eerste`);
        const bar2 = document.getElementById(`bar-${stat}-tweede`);
        if (!bar1 || !bar2) return;

        const pct1 = max > 0 ? Math.round((val1 / max) * 100) : 0;
        const pct2 = max > 0 ? Math.round((val2 / max) * 100) : 0;
        const win1 = val1 >= val2;

        bar1.style.width = `${pct1}%`;
        bar2.style.width = `${pct2}%`;
        bar1.className = `h-full rounded-full bg-gradient-to-r ${win1 ? "from-teal-600 to-accent" : "from-red to-red/60"}`;
        bar2.className = `h-full rounded-full bg-gradient-to-r ${!win1 ? "from-teal-600 to-accent" : "from-red to-red/60"}`;
    }

    function greenCheck() {
        return `<span class="grid place-items-center w-[20px] h-[20px] rounded-full shrink-0" style="background: rgba(74, 222, 128, 0.15)">
      <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="#4ade80" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="2,6 5,9 10,3" />
      </svg>
    </span>`;
    }

    function redCross() {
        return `<span class="w-[20px] h-[20px] rounded-full flex items-center justify-center shrink-0" style="background: rgba(248, 113, 113, 0.15)">
      <svg width="15" height="15" viewBox="0 0 12 12" fill="none" stroke="#f87171" stroke-width="2" stroke-linecap="round">
        <line x1="3" y1="3" x2="9" y2="9" /><line x1="9" y1="3" x2="3" y2="9" />
      </svg>
    </span>`;
    }
});