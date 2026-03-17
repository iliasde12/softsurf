async function artisten() {

   const token = localStorage.getItem("access_token_spotify");
   const idBurnaBoy = "3wcj11K77LjEY1PkEazffa"; 
   const idWizKid = "3tVQdUvClmAT7URs9V3rsp";

   try{

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

        showArtisten(data.artists[0],data.artists[1]);


   }catch(error){
     throw new Error("Error fetching Spotify artisten:", error);
   }

}

artisten();


function showArtisten(artist1,artist2){
   //later als het werkende is ga ik gewoon de hele array sturen
   //1ste artist
   document.getElementById("profiel-pic-eerste-artist").src = artist1.images[0].url;
   document.getElementById("naam-eerste-artist").textContent = artist1.name;
   document.getElementById("pop-eerste-artist").textContent = artist1.popularity;
   document.getElementById("followers-eerste-artist").textContent = artist1.followers.total.toLocaleString();

    //2de artist
    document.getElementById("profiel-pic-tweede-artist").src = artist2.images[0].url;
    document.getElementById("naam-tweede-artist").textContent = artist2.name;
    document.getElementById("pop-tweede-artist").textContent = artist2.popularity;
    document.getElementById("followers-tweede-artist").textContent = artist2.followers.total.toLocaleString();
}