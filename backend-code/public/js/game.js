// public/js/game.js

const MAX_RONDES = 10;

let sessionId = null;
let huidigeLied = null;
let score = 0;
let totaal = 0;
let streak = 0;
let besteStreak = 0;
let geraden = false;
let ytPlayer = null;
let ytKlaar = false;
let ytPlayerKlaar = false;

// ─── Schermen ─────────────────────────────────────────────────────────────────

function toonScherm(naam) {
    document.getElementById("startScherm").classList.add("hidden");
    document.getElementById("gameScherm").classList.add("hidden");
    document.getElementById("eindeScherm").classList.add("hidden");
    const el = document.getElementById(naam);
    el.classList.remove("hidden");
    el.classList.add("flex");
}

// ─── YouTube ──────────────────────────────────────────────────────────────────

function laadYouTubeAPI() {
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(tag);
}

window.onYouTubeIframeAPIReady = function () {
    console.log("✅ YouTube API klaar");
    ytKlaar = true;
};

function laadVideo(youtubeId) {
    ytPlayerKlaar = false;

    // Reset container zodat destroy() het element niet kwijtraakt
    const container = document.getElementById("ytContainer");
    container.innerHTML = '<div id="ytPlayer"></div>';

    console.log("🎬 Video laden:", youtubeId);

    ytPlayer = new YT.Player("ytPlayer", {
        videoId: youtubeId,
        width: "1",
        height: "1",
        playerVars: { autoplay: 0, controls: 0, origin: window.location.origin },
        events: {
            onReady: (e) => {
                console.log("✅ YT player klaar");
                ytPlayerKlaar = true;
            },
            onError: (e) => {
                console.error("❌ YT fout code:", e.data);
            },
            onStateChange: (e) => {
                if (e.data === YT.PlayerState.PLAYING) startProgressBar();
                else stopProgressBar();
            }
        }
    });
}

let progressInterval;
function startProgressBar() {
    clearInterval(progressInterval);
    progressInterval = setInterval(() => {
        if (!ytPlayer || !ytPlayerKlaar) return;
        const duration = ytPlayer.getDuration();
        const current = ytPlayer.getCurrentTime();
        if (duration > 0) {
            document.getElementById("progressBar").style.width = `${(current / duration) * 100}%`;
        }
    }, 200);
}

function stopProgressBar() {
    clearInterval(progressInterval);
}

document.getElementById("playBtn").addEventListener("click", () => {
    if (!ytPlayer || !ytPlayerKlaar || typeof ytPlayer.getPlayerState !== "function") {
        console.warn("Player nog niet klaar");
        return;
    }
    const state = ytPlayer.getPlayerState();
    if (state === YT.PlayerState.PLAYING) {
        ytPlayer.pauseVideo();
        document.getElementById("playIcon").innerHTML = '<polygon points="5,3 19,12 5,21"/>';
    } else {
        ytPlayer.playVideo();
        document.getElementById("playIcon").innerHTML = '<rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>';
    }
});

// ─── Game flow ────────────────────────────────────────────────────────────────

document.getElementById("startBtn").addEventListener("click", startSpel);
document.getElementById("opnieuwBtn").addEventListener("click", startSpel);
//document.getElementById("indienBtn").addEventListener("click", dienIn);
document.getElementById("volgendeBtn").addEventListener("click", volgendeRonde);
/*document.getElementById("guessInput").addEventListener("keydown", (e) => {
    if (e.key === "Enter") dienIn();
});*/

async function startSpel() {
    score = 0; totaal = 0; streak = 0; besteStreak = 0;
    updateStats();

    const res = await fetch("/api/game/session", { method: "POST" });
    const data = await res.json();
    sessionId = data.sessionId;

    toonScherm("gameScherm");
    await volgendeRonde();
}

async function volgendeRonde() {
    if (totaal >= MAX_RONDES) {
        eindeSpel();
        return;
    }

    geraden = false;
    ytPlayerKlaar = false;
    document.getElementById("feedbackBanner").classList.add("hidden");
    document.getElementById("volgendeBtn").classList.add("hidden");
    //document.getElementById("guessInput").value = "";
    //document.getElementById("guessInput").disabled = false;
    //document.getElementById("indienBtn").disabled = false;
    document.getElementById("artiestLabel").textContent = "Artiest verborgen";
    document.getElementById("progressBar").style.width = "0%";
    document.getElementById("playIcon").innerHTML = '<polygon points="5,3 19,12 5,21"/>';

    const res = await fetch("/api/game/round");
    if (!res.ok) {
        console.error("Ronde ophalen mislukt:", res.status);
        return;
    }
    const data = await res.json();
    console.log("🎵 Ronde data:", data);
    huidigeLied = data;

    // Wacht tot YouTube API klaar is
    if (!ytKlaar) {
        await new Promise(resolve => {
            const check = setInterval(() => {
                if (ytKlaar) { clearInterval(check); resolve(); }
            }, 100);
        });
    }

    laadVideo(data.youtubeId);
    toonSuggesties(data.options);
}

// ─── Suggesties ───────────────────────────────────────────────────────────────

function toonSuggesties(options) {
    const container = document.getElementById("suggestiesContainer");
    container.innerHTML = options.map((opt, i) => `
        <div class="suggestion-row flex items-center gap-4 px-5 py-4 cursor-pointer"
             style="${i < options.length - 1 ? "border-bottom:1px solid #1f1d38" : ""}"
             onmouseover="this.style.background='rgba(123,107,245,0.08)'"
             onmouseout="this.style.background='transparent'"
             onclick="kiesSuggestie('${opt.name.replace(/'/g, "\\'")}')">
            <div class="rounded-lg flex-shrink-0 flex items-center justify-center" style="width:2.5rem;height:2.5rem;background:#2a2648">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#5B5A7A"><path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3z"/></svg>
            </div>
            <span style="font-size:1rem">
                <span style="font-weight:600;color:#e2e0ff">${opt.name}</span>
                ${opt.artist ? `<span style="color:#5b5a7a">· ${opt.artist}</span>` : ""}
            </span>
        </div>
    `).join("");
}
function kiesSuggestie(naam) {
    dienIn(naam);
}

// ─── Guess indienen ───────────────────────────────────────────────────────────

async function dienIn(naam) {
    if (geraden || !huidigeLied) return;
    if (!naam) return;

    geraden = true;
    if (ytPlayer && ytPlayerKlaar) ytPlayer.pauseVideo();

    const res = await fetch("/api/game/guess", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, songId: huidigeLied.songId, guess: naam }),
    });
    const data = await res.json();

    totaal++;
    if (data.correct) {
        score++;
        streak++;
        if (streak > besteStreak) besteStreak = streak;
        toonFeedback(true, `✓ Correct! Het was "${huidigeLied.correctAnswer}"`);
    } else {
        streak = 0;
        toonFeedback(false, `✗ Fout! Het was "${huidigeLied.correctAnswer}"`);
    }

    updateStats();

    // Suggesties disablen
    document.querySelectorAll(".suggestion-row").forEach(row => {
        row.style.pointerEvents = "none";
        row.style.opacity = "0.4";
    });

    document.getElementById("artiestLabel").textContent = huidigeLied.artiest ?? "";
    document.getElementById("volgendeBtn").classList.remove("hidden");

    if (totaal >= MAX_RONDES) {
        document.getElementById("volgendeBtn").textContent = "Bekijk resultaten →";
    }
}

function toonFeedback(correct, tekst) {
    const banner = document.getElementById("feedbackBanner");
    banner.textContent = tekst;
    banner.style.background = correct ? "rgba(94,252,160,0.1)" : "rgba(248,113,113,0.1)";
    banner.style.color = correct ? "#5efca0" : "#f87171";
    banner.style.border = `1px solid ${correct ? "rgba(94,252,160,0.2)" : "rgba(248,113,113,0.2)"}`;
    banner.classList.remove("hidden");
}

function updateStats() {
    document.getElementById("statGoed").textContent = score;
    document.getElementById("statTotaal").textContent = totaal;
    document.getElementById("statReeks").textContent = streak;

}

// ─── Einde ────────────────────────────────────────────────────────────────────

async function eindeSpel() {
    if (ytPlayer && ytPlayerKlaar) ytPlayer.stopVideo();

    await fetch("/api/game/session/end", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, score, total: totaal, streak: besteStreak }),
    });

    document.getElementById("eindeGoed").textContent = score;
    document.getElementById("eindeTotaal").textContent = totaal;
    document.getElementById("eindeReeks").textContent = besteStreak;
    toonScherm("eindeScherm");
}

// ─── Init ─────────────────────────────────────────────────────────────────────

laadYouTubeAPI();
toonScherm("startScherm");