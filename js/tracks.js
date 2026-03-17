async function GetSpotifyTraks() {
    const token = localStorage.getItem("access_token_spotify");
    //console.log("token", token);
    const spotifySongsIds = ["id1","id2"];
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
        console.log("Playlist tracks:", data.tracks.items);

        displaySongs(data.items.items);

    } catch (error) {
         throw new Error("Error fetching Spotify playlist:", error);
    }

}


GetSpotifyTraks();