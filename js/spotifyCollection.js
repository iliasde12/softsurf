async function GetSpotifyPlaylistColection() {
    const accessToken  = localStorage.getItem("access_token_spotify");
    const idPlaylist = "1TFmBO87jfnxCNGUIVS9AM";

     try {
        const response = await fetch(`https://api.spotify.com/v1/playlists/${idPlaylist}/items`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${accessToken}`
            }
        });
 
        //console.log(response.status);

        if (!response.ok) {
            throw new Error(`Spotify API error: ${response.status}`);
        }

        const data = await response.json();
        console.log(data);

     
    } catch (error) {
        console.error("Error getting Spotify token:", error);
        throw error;
    }


}

GetSpotifyPlaylistColection();

function CreateElementDom(){

}