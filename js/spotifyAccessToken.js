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
    const accessToken = "BQDHqEVH0pf0fTgABrfd1a1DTK8Pc-_KIaSerI5TeejDHgo1dDZ3X5L0DEnESaIjuzCaKp844Uq7bC5zBYnx4wxHVDCFCWhfLNNQeGTRNVBaO9xka_FVYS4-OI51q9hXzfFhxYvQr4AK1OHB01oJQB-00l4jvUiK_K1y5kHp1xjk87cN2CLVKbPIUwSZVzJ0sF2JGxp5n3aHBajcpfuPQdZMvK38uvXmnwACKOA-WSCpByu9d6ilgcQBSv4o9RafXl3zwlJaRrfrmxwf9qLmSo3NIRLMPSLWUcEnYkb0xlQh37j5oFyInnEasIWxmH2a5MVVWSl5ukB-H25n3Ock_qJFm43BHWnIFzlapsZG_BUaKygCL8og3z3ESG-gyOByNNCovX0LIw5k2T5iHEGK8UKT7Z7t0Wc";
    if (!localStorage.getItem("access_token_spotify")) {
        localStorage.setItem("access_token_spotify", accessToken);
    }

}






