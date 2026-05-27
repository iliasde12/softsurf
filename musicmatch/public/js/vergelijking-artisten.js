document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.querySelector("input[type='search']");
    let selectedArtists = [null, null];
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
                const res = await fetch(`/api/vergelijk/artiest/zoek?q=${encodeURIComponent(q)}`);
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
    function renderDropdown(artists) {
        dropdown.innerHTML = "";
        if (!artists || artists.length === 0) { dropdown.classList.add("hidden"); return; }

        artists.forEach((artist) => {
            const item = document.createElement("div");
            item.className = "flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-accent/10 transition";

            const img = document.createElement("img");
            const imgUrl = Array.isArray(artist.image)
                ? artist.image.find(i => i.size === "medium")?.["#text"]
                : null;
            img.src = imgUrl && imgUrl !== "" ? imgUrl : "https://placehold.co/36x36/1a1828/6b6889?text=?";
            img.className = "w-9 h-9 rounded-lg object-cover shrink-0";

            const name = document.createElement("span");
            name.className = "text-light text-sm font-medium";
            name.textContent = artist.name;

            const listeners = document.createElement("span");
            listeners.className = "text-muted text-xs ml-auto";
            listeners.textContent = formatNumber(parseInt(artist.listeners ?? "0")) + " luisteraars";

            item.append(img, name, listeners);
            item.addEventListener("click", () => selectArtist(artist.name));
            dropdown.appendChild(item);
        });

        dropdown.classList.remove("hidden");
    }

    // ── Artiest selecteren ────────────────────────────────────────────────────
    async function selectArtist(artistName) {
        dropdown.classList.add("hidden");
        searchInput.value = "";
        searchResults = [];

        try {
            const res = await fetch(`/api/vergelijk/artiest/${encodeURIComponent(artistName)}`);
            const artist = await res.json();

            selectedArtists[selectingSlot] = artist;
            selectingSlot = selectingSlot === 0 ? 1 : 0;

            renderComparison();
        } catch (e) {
            console.error("Artiest laden mislukt:", e);
        }
    }

    // ── Vergelijking renderen ─────────────────────────────────────────────────
    function renderComparison() {
        const a1 = selectedArtists[0];
        const a2 = selectedArtists[1];

        if (a1) renderArtist(a1, "eerste");
        if (a2) renderArtist(a2, "tweede");
        if (a1 && a2) renderSummary(a1, a2);
    }

    function renderArtist(artist, slot) {
        document.getElementById(`naam-${slot}-artist`).textContent = artist.name;

        const img = document.getElementById(`profiel-pic-${slot}-artist`);
        if (img) {
            img.src = artist.image && artist.image !== ""
                ? artist.image
                : "https://placehold.co/80x80/1a1828/6b6889?text=?";
        }

        document.getElementById(`listeners-${slot}-artist`).textContent = formatNumber(artist.listeners);
        document.getElementById(`playcount-${slot}-artist`).textContent = formatNumber(artist.playcount);
        document.getElementById(`toptrack-${slot}-artist`).textContent = artist.topTrack;
        document.getElementById(`similar-${slot}-artist`).textContent = artist.similarCount;
        document.getElementById(`genre-${slot}-artist`).textContent = artist.genre;
    }

    function renderSummary(a1, a2) {
        updateStatIcon("listeners", a1.listeners >= a2.listeners);
        updateStatIcon("playcount", a1.playcount >= a2.playcount);
        updateStatIcon("similar", a1.similarCount >= a2.similarCount);

        updateProgressBar("listeners", a1.listeners, a2.listeners, Math.max(a1.listeners, a2.listeners));
        updateProgressBar("playcount", a1.playcount, a2.playcount, Math.max(a1.playcount, a2.playcount));
        updateProgressBar("similar", a1.similarCount, a2.similarCount, Math.max(a1.similarCount, a2.similarCount));

        const winner = a1.listeners >= a2.listeners ? a1.name : a2.name;
        const loser = a1.listeners >= a2.listeners ? a2.name : a1.name;

        const summaryText = document.getElementById("summary-text");
        if (summaryText) {
            summaryText.innerHTML = `<span class="text-light font-semibold">${winner}</span> heeft meer luisteraars en plays. <span class="text-light font-semibold">${loser}</span> scoort lager overall.`;
        }
    }

    // ── Stat helpers ──────────────────────────────────────────────────────────
    function updateStatIcon(stat, firstWins) {
        const icon1 = document.getElementById(`icon-${stat}-eerste`);
        const icon2 = document.getElementById(`icon-${stat}-tweede`);
        if (!icon1 || !icon2) return;

        if (firstWins) {
            icon1.innerHTML = greenCheck();
            icon1.className = "flex items-center gap-1.5 text-[1rem] font-semibold text-green";
            icon2.innerHTML = redCross();
            icon2.className = "flex items-center gap-1.5 text-base font-semibold text-red";
        } else {
            icon1.innerHTML = redCross();
            icon1.className = "flex items-center gap-1.5 text-base font-semibold text-red";
            icon2.innerHTML = greenCheck();
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
        bar1.className = `h-full rounded-full bg-gradient-to-r ${win1 ? "from-accent to-violet-400" : "from-red to-red/60"}`;
        bar2.className = `h-full rounded-full bg-gradient-to-r ${!win1 ? "from-accent to-violet-400" : "from-red to-red/60"}`;
    }

    // ── Format helpers ────────────────────────────────────────────────────────
    function formatNumber(n) {
        const num = typeof n === "string" ? parseInt(n) : n;
        if (!num || isNaN(num)) return "0";
        if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + "M";
        if (num >= 1_000) return (num / 1_000).toFixed(1) + "K";
        return num.toString();
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