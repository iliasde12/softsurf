document.addEventListener("DOMContentLoaded", () => {
  const data = window.__COLLECTIE_DATA__ || { songs: [], moods: [] };
  const moods = Array.isArray(data.moods) ? data.moods : [];

  let lastSongs = Array.isArray(data.songs) ? data.songs : [];
  let viewMode = "lijst";

  const containerPlaylist = document.getElementById("containerSongs");
  const lijstBtn = document.getElementById("lijstBtn");
  const rasterBtn = document.getElementById("rasterBtn");

  if (!containerPlaylist || !lijstBtn || !rasterBtn) {
    console.warn("collectie.js: vereiste DOM-elementen niet gevonden.");
    return;
  }

  function updateViewButtons() {
    if (viewMode === "lijst") {
      lijstBtn.className =
        "bg-[#7B6BF5] text-white text-xs px-3 py-1 rounded-full";
      rasterBtn.className =
        "border border-[#3A3760] text-[#A0A0C0] text-xs px-3 py-1 rounded-full hover:bg-[#1E1B3A] transition";
    } else {
      rasterBtn.className =
        "bg-[#7B6BF5] text-white text-xs px-3 py-1 rounded-full";
      lijstBtn.className =
        "border border-[#3A3760] text-[#A0A0C0] text-xs px-3 py-1 rounded-full hover:bg-[#1E1B3A] transition";
    }
  }

  lijstBtn.addEventListener("click", () => {
    viewMode = "lijst";
    updateViewButtons();
    showSongs(lastSongs);
  });

  rasterBtn.addEventListener("click", () => {
    viewMode = "raster";
    updateViewButtons();
    showSongs(lastSongs);
  });

  function buildMoodSelect(song) {
    const select = document.createElement("select");
    select.className =
      "bg-[#2A2750] text-white text-xs rounded-full px-2 py-1 border-none cursor-pointer";

    select.addEventListener("click", (e) => e.stopPropagation());
    select.addEventListener("change", () => {
      if (typeof window.updateMood === "function") {
        window.updateMood(song._id, select.value);
      }
    });

    const noneOpt = document.createElement("option");
    noneOpt.value = "";
    noneOpt.textContent = "geen";
    select.appendChild(noneOpt);

    moods.forEach((mood) => {
      const opt = document.createElement("option");
      opt.value = mood.id;
      opt.textContent = `${mood.emoji ?? ""} ${mood.name ?? ""}`.trim();
      if (song.userSong && song.userSong.mood === mood.id) {
        opt.selected = true;
      }
      select.appendChild(opt);
    });

    return select;
  }

  function showSongs(songs) {
    lastSongs = songs;
    containerPlaylist.textContent = "";

    if (viewMode === "raster") {
      containerPlaylist.className =
        "grid grid-cols-2 md:grid-cols-4 gap-4 animate-fadeUp";
    } else {
      containerPlaylist.className = "flex flex-col gap-1 animate-fadeUp";
    }

    if (!songs || songs.length === 0) {
      const empty = document.createElement("p");
      empty.className = "text-white/40 text-center py-10";
      empty.textContent = "Geen songs gevonden";
      containerPlaylist.appendChild(empty);
      return;
    }

    songs.forEach((song, index) => {
      const artistName = song.album?.artists?.[0]?.name ?? "Onbekend";
      const albumImg = song.album?.images?.[0]?.url ?? "./img/default.svg";
      const release = song.album?.release_date;

      if (viewMode === "raster") {
        const card = document.createElement("div");
        card.className =
          "bg-[#1E1B3A] rounded-xl p-3 flex flex-col gap-2 cursor-pointer hover:bg-[#2A2750] transition";

        const albumArt = document.createElement("img");
        albumArt.className = "w-full aspect-square rounded-lg object-cover";
        albumArt.src = albumImg;
        albumArt.alt = song.name ?? "";

        const trackName = document.createElement("p");
        trackName.className = "text-white text-sm font-semibold truncate";
        trackName.textContent = song.name ?? "";

        const artistEl = document.createElement("p");
        artistEl.className = "text-[#6B6B8A] text-xs truncate";
        artistEl.textContent = artistName;

        const moodSelect = buildMoodSelect(song);
        moodSelect.classList.add("self-start", "mt-1");

        const bottom = document.createElement("div");
        bottom.className = "flex items-center justify-between";

        const popularity = document.createElement("span");
        popularity.className = "text-[#A0A0C0] text-xs";
        popularity.textContent = song.popularity ?? "";

        const heart = document.createElement("span");
        heart.className = "text-[#E91E8C] text-sm";
        heart.textContent = "♥";

        bottom.append(popularity, heart);

        card.append(albumArt, trackName, artistEl, moodSelect, bottom);
        containerPlaylist.appendChild(card);
      } else {
        const trackContainer = document.createElement("div");
        trackContainer.className = `grid grid-cols-[40px_1fr_40px] md:grid-cols-[40px_1fr_160px_100px_80px_40px] gap-2 items-center ${
          index % 2 === 0 ? "bg-[#1E1B3A]" : ""
        } hover:bg-[#1E1B3A] rounded-xl px-2 py-2 cursor-pointer transition`;

        const number = document.createElement("span");
        number.className = "text-[#6B6B8A] text-sm text-center";
        number.textContent = String(index + 1);

        const infoWrapper = document.createElement("div");
        infoWrapper.className = "flex items-center gap-3";

        const albumArt = document.createElement("img");
        albumArt.className = "w-9 h-9 rounded-lg object-cover shrink-0";
        albumArt.src = albumImg;
        albumArt.alt = song.name ?? "";

        const textDiv = document.createElement("div");

        const trackName = document.createElement("p");
        trackName.className = "text-white text-sm font-semibold";
        trackName.textContent = song.name ?? "";

        const artistEl = document.createElement("p");
        artistEl.className = "text-[#6B6B8A] text-xs";
        artistEl.textContent = artistName;

        textDiv.append(trackName, artistEl);
        infoWrapper.append(albumArt, textDiv);

        const labelWrapper = document.createElement("span");
        labelWrapper.className = "hidden md:block";
        labelWrapper.appendChild(buildMoodSelect(song));

        const date = document.createElement("span");
        date.className = "hidden md:block text-[#6B6B8A] text-xs";
        date.textContent = release
          ? new Date(release).toLocaleDateString("nl-NL", {
              day: "numeric",
              month: "short",
            })
          : "";

        const popularity = document.createElement("span");
        popularity.className = "hidden md:block text-[#A0A0C0] text-xs";
        popularity.textContent = song.popularity ?? "";

        const heart = document.createElement("span");
        heart.className = "text-[#E91E8C] text-sm";
        heart.textContent = "♥";

        trackContainer.append(
          number,
          infoWrapper,
          labelWrapper,
          date,
          popularity,
          heart,
        );
        containerPlaylist.appendChild(trackContainer);
      }
    });
  }

  updateViewButtons();
  showSongs(lastSongs);
});
