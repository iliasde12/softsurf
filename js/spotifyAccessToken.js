//functie heeft geen nut want moet een oauth zijn dus de nodige params in de url en dan inloggen via spotify dan returnt het naar de page 
// met de nodige oauth token

/*export async function getSpotifyAccessToken() {
    const clientId = "82d9b9d16b58426e8f889f35d5af88aa";
    const clientSecret = "1c856ece54f84ca9ad86cf10a0c394a1";

    //btoa is een functie voor js die een string omzet naar base64 encoding
    const authString = btoa(`${clientId}:${clientSecret}`);

    try {
        const response = await fetch("https://accounts.spotify.com/api/token", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Authorization": `Basic ${authString}`
            },
            body: "grant_type=client_credentials"
        });

        if (!response.ok) {
            throw new Error(`Spotify API error: ${response.status}`);
        }

        const data = await response.json();
        const token = data.access_token;
        console.log("Spotify Access Token:", token);
        localStorage.setItem("access_token_spotify", token);
        //return token;

    } catch (error) {
        console.error("Error getting Spotify token:", error);
        throw error;
    }
}*/

export function TestToken() {
  const accessToken = "BQCAMvcTvDDPWFGXMr-iUqHf29zUHpX1xZOnsBuNTZvKgdAdTLNORyg7e0sumQ0H0G0IkyR82EDtLDwdMjXoGqC7hpfJlbYMXu_sAoVPEqcz4FmzSEdaplTGsBeg-9VDYO-m59PE6O1s6kCj9Nq89M4LckPUNkzISMbq-BweLT6ghXwULKRohtNHAXwxi6J3UbjhJb8njFWoM_XnYM6z9QRvchU3obut2O_9L2KgqVU4O4eGORIC48-t32G9u1Y10p1N9XK59rmsfZXgGXpwWnHjuuCggq4rq_qHi4mGYGhELeghqdSaCxSjeFTv_W7X3B2F5ZqUAPY7r4tAw51cwI83jFSMGfyLYHY6MA5WBTMV9tt6y4SgS5PuLV7SrbirOwkU6aUaSKuVO1BEzm77hmNnuebABiE";
    if (!localStorage.getItem("access_token_spotify")) {
        localStorage.setItem("access_token_spotify", accessToken);
    }

}






