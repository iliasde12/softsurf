async function GetSpotifyTraks() {
    const token = localStorage.getItem("access_token_spotify");
    //console.log("token", token);
    const spotifySongsIds = ["5YbPxJwPfrj7uswNwoF1pJ", "5FG7Tl93LdH117jEKYl3Cm"];
    console.log(spotifySongsIds);

    try {
        const idsString = spotifySongsIds.join(",");
        console.log(idsString);

        const response = await fetch(`https://api.spotify.com/v1/tracks?ids=${idsString}`, {
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
        console.log("tracks:", data);

        domElement("eerste", data.tracks[0]);
        domElement("tweede", data.tracks[1]);

    } catch (error) {
        throw new Error("Error fetching Spotify playlist:", error);
    }

}


GetSpotifyTraks();


function domElement(nummer, artist) {

    document.getElementById(`muziek-pic-${nummer}-song`).src = song.images[0].url;
    document.getElementById(`naam-${nummer}-artist`).textContent = artist.name;
    document.getElementById(`pop-${nummer}-artist`).textContent = artist.popularity;
    document.getElementById(`followers-${nummer}-artist`).textContent = artist.followers.total.toLocaleString();
}