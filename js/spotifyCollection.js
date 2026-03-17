async function GetSpotifySongs() {
    const token = localStorage.getItem("access_token_spotify");
    //console.log("token", token);
    const idPlaylist = "1TFmBO87jfnxCNGUIVS9AM";

    try {
        const response = await fetch(`https://api.spotify.com/v1/playlists/${idPlaylist}`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`Spotify API error: ${response.status}`);
        }

        const data = await response.json();
        //console.log(data);
        //console.log("Playlist:", data.items);
        console.log("Playlist tracks:", data.tracks.items);

        displaySongs(data.items.items);

    } catch (error) {
         throw new Error("Error fetching Spotify playlist:", error);
    }

}

GetSpotifySongs();



function displaySongs(songs) {
    const containerPlaylist = document.getElementById("tracksContainer");
    const moodType = ["favorieten", "chill", "workout"];
    const moodColor = ["#E91E8C", "#2A5A3A", "#1E3A5A"];


    console.log(songs);

    songs.forEach((song, index) => {
        const mood = moodType[index % moodType.length];
        const color = moodColor[index % moodColor.length];

        const trackContainer = document.createElement("div");
        trackContainer.className = `grid grid-cols-[40px_1fr_40px] md:grid-cols-[40px_1fr_160px_100px_80px_40px] gap-2 items-center ${index % 2 === 0 ? "bg-[#1E1B3A]" : ""} hover:bg-[#1E1B3A] rounded-xl px-2 py-2 cursor-pointer transition`;

        const number = document.createElement("span");
        number.className = "text-[#6B6B8A] text-sm text-center";
        number.textContent = index + 1;

        const infoWrapper = document.createElement("div");
        infoWrapper.className = "flex items-center gap-3";

        const albumArt = document.createElement("img");
        albumArt.className = "w-9 h-9 rounded-lg object-cover shrink-0";
        albumArt.src = song.item.album.images[2].url;
        albumArt.alt = song.item.name;

        const textDiv = document.createElement("div");

        const trackName = document.createElement("p");
        trackName.className = "text-white text-sm font-semibold";
        trackName.textContent = song.item.name;

        const artistName = document.createElement("p");
        artistName.className = "text-[#6B6B8A] text-xs";
        artistName.textContent = song.item.artists[0].name;;

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
        date.textContent = new Date(song.added_at).toLocaleDateString("nl-NL", { day: "numeric", month: "short" });;

        const popularity = document.createElement("span");
        popularity.className = "hidden md:block text-[#A0A0C0] text-xs";
        popularity.textContent = song.item.popularity;;

        const heart = document.createElement("span");
        heart.className = "text-[#E91E8C] text-sm";
        heart.textContent = "♥";

        trackContainer.append(number, infoWrapper, labelWrapper, date, popularity, heart);
        containerPlaylist.appendChild(trackContainer);

    });


}
