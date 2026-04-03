async function artisten() {

    const token = localStorage.getItem("access_token_spotify");
    const idBurnaBoy = "3wcj11K77LjEY1PkEazffa";
    const idWizKid = "3tVQdUvClmAT7URs9V3rsp";

    try {

        const response = await fetch(`https://api.spotify.com/v1/artists?ids=${idBurnaBoy},${idWizKid}`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`Spotify API error: ${response.status}`);
        }

        const data = await response.json();
        console.log(data.artists);

        //eerste artist
        domElement("eerste", data.artists[0]);
        //tweede artist
        domElement("tweede", data.artists[1]);


    } catch (error) {
        throw new Error("Error fetching Spotify artisten:", error);
    }

}

artisten();


function domElement(nummer, artist) {
    document.getElementById(`profiel-pic-${nummer}-artist`).src = artist.images[0].url;
    document.getElementById(`naam-${nummer}-artist`).textContent = artist.name;
    document.getElementById(`pop-${nummer}-artist`).textContent = artist.popularity;
    document.getElementById(`followers-${nummer}-artist`).textContent = artist.followers.total.toLocaleString();
}