// public/js/artisten.js

let geselecteerdeArtiesten = [];

const zoekInput = document.querySelector('input[type="search"]');

// ─── Zoeken ────────────────────────────────────────────────────────────────────

let zoekTimeout;
zoekInput.addEventListener("input", () => {
    clearTimeout(zoekTimeout);
    const q = zoekInput.value.trim();
    if (q.length < 2) return verbergDropdown();
    zoekTimeout = setTimeout(() => zoekArtiest(q), 400);
});

async function zoekArtiest(q) {
    try {
        const res = await fetch(`/api/vergelijken/artist?q=${encodeURIComponent(q)}`);
        if (!res.ok) return;
        const artist = await res.json();
        toonDropdown(artist);
    } catch (e) {
        console.error("Zoeken mislukt:", e);
    }
}

// ─── Dropdown op body niveau (boven alles) ─────────────────────────────────────

function toonDropdown(artist) {
    verbergDropdown();

    const inputRect = zoekInput.getBoundingClientRect();

    const dropdown = document.createElement("div");
    dropdown.id = "suggestie-dropdown";
    dropdown.style.cssText = `
        position: fixed;
        top: ${inputRect.bottom + 4}px;
        left: ${inputRect.left}px;
        width: ${inputRect.width}px;
        z-index: 9999;
        background: #1a1828;
        border: 1px solid #2e2b42;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 8px 32px rgba(0,0,0,0.4);
    `;

    dropdown.innerHTML = `
        <button style="width:100%;display:flex;align-items:center;gap:12px;padding:12px 16px;background:transparent;border:none;cursor:pointer;text-align:left;" 
                onmouseover="this.style.background='rgba(124,106,255,0.1)'" 
                onmouseout="this.style.background='transparent'">
            ${artist.image
        ? `<img src="${artist.image}" style="width:40px;height:40px;border-radius:8px;object-fit:cover;">`
        : `<div style="width:40px;height:40px;border-radius:8px;background:#2e2b42;display:flex;align-items:center;justify-content:center;color:white;font-size:18px;">${artist.name.charAt(0)}</div>`
    }
            <div>
                <p style="color:white;font-size:14px;font-weight:600;margin:0;">${artist.name}</p>
                <p style="color:#6b6889;font-size:12px;margin:0;">${artist.genre ?? "Onbekend genre"}</p>
            </div>
        </button>
    `;

    dropdown.querySelector("button").addEventListener("click", () => {
        selecteerArtiest(artist);
        verbergDropdown();
        zoekInput.value = "";
    });

    document.body.appendChild(dropdown);
}

function verbergDropdown() {
    document.getElementById("suggestie-dropdown")?.remove();
}

document.addEventListener("click", (e) => {
    if (!zoekInput.contains(e.target)) verbergDropdown();
});

// Dropdown positie updaten bij scrollen/resizen
window.addEventListener("scroll", verbergDropdown, true);
window.addEventListener("resize", verbergDropdown);

// ─── Artiest selecteren ────────────────────────────────────────────────────────

function selecteerArtiest(artist) {
    if (geselecteerdeArtiesten.length >= 2) {
        // Reset en opnieuw beginnen
        geselecteerdeArtiesten = [];
        resetKaart("eerste");
        resetKaart("tweede");
    }
    if (geselecteerdeArtiesten.find((a) => a.name === artist.name)) return;

    geselecteerdeArtiesten.push(artist);

    if (geselecteerdeArtiesten.length === 1) vulKaart("eerste", artist);
    if (geselecteerdeArtiesten.length === 2) {
        vulKaart("tweede", artist);
        vergelijk();
    }
}

// ─── Kaart leeg maken ──────────────────────────────────────────────────────────

function resetKaart(positie) {
    const s = positie === "eerste" ? "eerste" : "tweede";
    document.getElementById(`profiel-pic-${s}-artist`).src = "";
    document.getElementById(`naam-${s}-artist`).textContent = "";
    document.getElementById(`pop-${s}-artist`).textContent = "–";
    document.getElementById(`followers-${s}-artist`).textContent = "–";
    document.getElementById(`albums-${s}-artist`).textContent = "–";
    document.getElementById(`luisteraars-${s}-artist`).textContent = "–";
    document.getElementById(`genre-${s}-artist`).textContent = "–";
}

// ─── Kaart vullen ──────────────────────────────────────────────────────────────

function vulKaart(positie, artist) {
    const s = positie === "eerste" ? "eerste" : "tweede";

    const img = document.getElementById(`profiel-pic-${s}-artist`);
    if (img) img.src = artist.image ?? "";

    document.getElementById(`naam-${s}-artist`).textContent = artist.name;
    document.getElementById(`pop-${s}-artist`).textContent = artist.popularity ?? "–";
    document.getElementById(`followers-${s}-artist`).textContent = artist.followers ? formatGetal(artist.followers) : "–";
    document.getElementById(`albums-${s}-artist`).textContent = artist.albums ?? "–";
    document.getElementById(`luisteraars-${s}-artist`).textContent = artist.monthlyListeners ? formatGetal(artist.monthlyListeners) : "–";
    document.getElementById(`genre-${s}-artist`).textContent = artist.genre ?? "–";
}
// ─── Vergelijken & bars updaten ────────────────────────────────────────────────

async function vergelijk() {
    const [a, b] = geselecteerdeArtiesten;
    try {
        const res = await fetch(
            `/api/vergelijken/compare?artist1=${encodeURIComponent(a.name)}&artist2=${encodeURIComponent(b.name)}`
        );
        if (!res.ok) return;
        const data = await res.json();

        // Waarden updaten met volledige data van compare
        vulKaart("eerste", data.a);
        vulKaart("tweede", data.b);

        // Bars
        updateStat("eerste", "pop-bar",         data.compare.popularity === "a",       data.a.popularity,       data.b.popularity);
        updateStat("tweede", "pop-bar",         data.compare.popularity === "b",       data.b.popularity,       data.a.popularity);
        updateStat("eerste", "followers-bar",   data.compare.followers === "a",        data.a.followers,        data.b.followers);
        updateStat("tweede", "followers-bar",   data.compare.followers === "b",        data.b.followers,        data.a.followers);
        updateStat("eerste", "albums-bar",      data.compare.albums === "a",           data.a.albums,           data.b.albums);
        updateStat("tweede", "albums-bar",      data.compare.albums === "b",           data.b.albums,           data.a.albums);
        updateStat("eerste", "luisteraars-bar", data.compare.monthlyListeners === "a", data.a.monthlyListeners, data.b.monthlyListeners);
        updateStat("tweede", "luisteraars-bar", data.compare.monthlyListeners === "b", data.b.monthlyListeners, data.a.monthlyListeners);

        // Icoontjes
        updateIcoon("eerste", "pop-icoon",          data.compare.popularity === "a");
        updateIcoon("tweede", "pop-icoon",          data.compare.popularity === "b");
        updateIcoon("eerste", "followers-icoon",    data.compare.followers === "a");
        updateIcoon("tweede", "followers-icoon",    data.compare.followers === "b");
        updateIcoon("eerste", "albums-icoon",       data.compare.albums === "a");
        updateIcoon("tweede", "albums-icoon",       data.compare.albums === "b");
        updateIcoon("eerste", "luisteraars-icoon",  data.compare.monthlyListeners === "a");
        updateIcoon("tweede", "luisteraars-icoon",  data.compare.monthlyListeners === "b");

        // Summary
        document.getElementById("summary-tekst").innerHTML =
            `<span class="text-light font-semibold">${data.a.name}</span> vs <span class="text-light font-semibold">${data.b.name}</span> — bekijk de statistieken hierboven.`;

    } catch (e) {
        console.error("Vergelijken mislukt:", e);
    }
}
function updateStat(positie, barId, isWinnaar, eigen, ander) {
    const s = positie === "eerste" ? "eerste" : "tweede";
    const bar = document.getElementById(`${barId}-${s}`);
    if (!bar) return;
    const max = Math.max(eigen ?? 0, ander ?? 0);
    const pct = max > 0 ? Math.round(((eigen ?? 0) / max) * 100) : 0;
    bar.style.width = `${pct}%`;
    bar.className = `h-full rounded-full bg-gradient-to-r ${isWinnaar ? "from-accent to-violet-400" : "from-red-400 to-red-400/60"}`;
}

function updateIcoon(positie, icoonId, isWinnaar) {
    const s = positie === "eerste" ? "eerste" : "tweede";
    const el = document.getElementById(`${icoonId}-${s}`);
    if (!el) return;

    const groen = `<span class="grid place-items-center w-[20px] h-[20px] rounded-full shrink-0" style="background:rgba(74,222,128,0.15)">
        <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="#4ade80" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="2,6 5,9 10,3"/></svg>
    </span>`;
    const rood = `<span class="w-[20px] h-[20px] rounded-full flex items-center justify-center shrink-0" style="background:rgba(248,113,113,0.15)">
        <svg width="15" height="15" viewBox="0 0 12 12" fill="none" stroke="#f87171" stroke-width="2" stroke-linecap="round"><line x1="3" y1="3" x2="9" y2="9"/><line x1="9" y1="3" x2="3" y2="9"/></svg>
    </span>`;

    el.innerHTML = isWinnaar ? groen : rood;
    el.className = `flex items-center gap-1.5 text-[1rem] font-semibold ${isWinnaar ? "text-green" : "text-red"}`;
}

// ─── Formattering ──────────────────────────────────────────────────────────────

function formatGetal(n) {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
    return n.toString();
}

// ─── Init: kaarten leeg starten ───────────────────────────────────────────────

resetKaart("eerste");
resetKaart("tweede");