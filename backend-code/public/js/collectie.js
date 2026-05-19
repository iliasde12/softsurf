document.addEventListener("DOMContentLoaded", () => {
  function updateViewButtons() {
    const lijstBtn = document.getElementById("lijstBtn");
    const rasterBtn = document.getElementById("rasterBtn");

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

  document.getElementById("lijstBtn").addEventListener("click", () => {
    viewMode = "lijst";
    updateViewButtons();
    showSongs(lastSongs);
  });

  document.getElementById("rasterBtn").addEventListener("click", () => {
    viewMode = "raster";
    updateViewButtons();
    showSongs(lastSongs);
  });

  updateViewButtons();

  songs.forEach((song, index) => {
    const mood = moodType[index % moodType.length];
    const color = moodColor[index % moodColor.length];
    const trackId = song.id;

    if (viewMode === "raster") {
      const card = document.createElement("div");
      card.className =
        "bg-[#1E1B3A] rounded-xl p-3 flex flex-col gap-2 cursor-pointer hover:bg-[#2A2750] transition";

      const albumArt = document.createElement("img");
      albumArt.className = "w-full aspect-square rounded-lg object-cover";
      albumArt.src = song.album.images[0]?.url ?? "./img/default.svg";
      albumArt.alt = song.name;

      const trackName = document.createElement("p");
      trackName.className = "text-white text-sm font-semibold truncate";
      trackName.textContent = song.name;

      const artistName = document.createElement("p");
      artistName.className = "text-[#6B6B8A] text-xs truncate";
      artistName.textContent = song.artists?.[0]?.name ?? "Onbekend";

      const addBtn = document.createElement("img");
      addBtn.className = "w-5 cursor-pointer";
      addBtn.src = "./img/plus-solid-full.svg";
      addBtn.addEventListener("click", async (e) => {
        e.stopPropagation();
        await openPlaylistModal(trackId);
      });

      card.append(albumArt, trackName, artistName, addBtn);
      containerPlaylist.appendChild(card);
    } else {
      const trackContainer = document.createElement("div");
      trackContainer.className = `grid grid-cols-[40px_1fr_40px] md:grid-cols-[40px_1fr_160px_100px_80px_40px] gap-2 items-center ${index % 2 === 0 ? "bg-[#1E1B3A]" : ""} hover:bg-[#1E1B3A] rounded-xl px-2 py-2 cursor-pointer transition`;

      const number = document.createElement("span");
      const img = document.createElement("img");
      img.className = "w-5 mx-auto";
      img.src = "./img/plus-solid-full.svg";
      number.addEventListener("click", async () => {
        await openPlaylistModal(trackId);
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
        ? new Date(song.album.release_date).toLocaleDateString("nl-NL", {
            day: "numeric",
            month: "short",
          })
        : "";

      const popularity = document.createElement("span");
      popularity.className = "hidden md:block text-[#A0A0C0] text-xs";
      popularity.textContent = song.popularity;

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
});
