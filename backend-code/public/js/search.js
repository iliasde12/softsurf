document.addEventListener("DOMContentLoaded", () => {
const searchInput = document.getElementById("searchInput");

const fetchSongs = async (query) => {
    const searchQuery = query || "Top hits 2026";

    try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
        const { fromDB, fromSpotify } = await response.json();

        // Normaliseer DB songs naar Spotify structuur
        const normalizedDB = fromDB.map(song => ({
            name: song.name,
            popularity: song.popularity ?? 0,
            artists: [{ name: song.album?.artists?.[0]?.name ?? "Onbekend" }],
            album: {
                images: [{ url: song.album?.images?.[0]?.url ?? "./img/default.svg" }],
                release_date: song.album?.release_date ?? ""
            }
        }));

        showSongs([...normalizedDB, ...fromSpotify]);

    } catch (error) {
        console.error("Error fetching songs:", error);
    }
};

fetchSongs();

searchInput.addEventListener("input", () => {
    fetchSongs(searchInput.value);
});

function showSongs(songs) {
    const containerPlaylist = document.getElementById("containerSongs");
    containerPlaylist.textContent = "";
    const moodType = ["favorieten", "chill", "workout"];
    const moodColor = ["#E91E8C", "#2A5A3A", "#1E3A5A"];


    console.log(songs);

    songs.forEach((song, index) => {
        const mood = moodType[index % moodType.length];
        const color = moodColor[index % moodColor.length];
        const trackId = song.id;

        //console.log(trackId);

        const trackContainer = document.createElement("div");
        trackContainer.className = `grid grid-cols-[40px_1fr_40px] md:grid-cols-[40px_1fr_160px_100px_80px_40px] gap-2 items-center ${index % 2 === 0 ? "bg-[#1E1B3A]" : ""} hover:bg-[#1E1B3A] rounded-xl px-2 py-2 cursor-pointer transition`;

        const number = document.createElement("span");
        number.className = 'addSong';
        number.dataset.trackId = trackId;
        const img = document.createElement("img");
        img.className = "w-5 mx-auto";
        img.src = "./img/plus-solid-full.svg";
        number.append(img);

        const infoWrapper = document.createElement("div");
        infoWrapper.className = "flex items-center gap-3";

        const albumArt = document.createElement("img");
        albumArt.className = "w-9 h-9 rounded-lg object-cover shrink-0";
        albumArt.src = song.album.images[0].url;
        albumArt.alt = song.name;

        const textDiv = document.createElement("div");

        const trackName = document.createElement("p");
        trackName.className = "text-white text-sm font-semibold";
        trackName.textContent = song.name;

        const artistName = document.createElement("p");
        artistName.className = "text-[#6B6B8A] text-xs";
        artistName.textContent = song.album?.artists?.[0]?.name ?? 'Onbekend';

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
        date.textContent = new Date(song.album.release_date).toLocaleDateString("nl-NL", { day: "numeric", month: "short" });;

        const popularity = document.createElement("span");
        popularity.className = "hidden md:block text-[#A0A0C0] text-xs";
        popularity.textContent = song.popularity;

        const heart = document.createElement("span");
        heart.className = "text-[#E91E8C] text-sm";
        heart.textContent = "♥";

        trackContainer.append(number, infoWrapper, labelWrapper, date, popularity, heart);
        containerPlaylist.appendChild(trackContainer);

    });

}

});