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
    const accessToken = "BQBMqsRvpqnM-7IStH6pCX0uGuZEMIqkO7xUrwlzoESzb1X5vireUy3DxNtVzA81UxZme49agwm9S2pEHRDOnoOb-xDsMOcp9ZJT6SSpnZTrRBot0-nrKY-tRVo-JGHFNKXcq-FurbZiG-Kp1nxF1Po_kcEF2ymM3kW6dOCREFBmASu2E9_Me_zRFuZYgdtibOzdufjd4ynI1tcvYsLI4fO0xD2fnAPKT-dtu-nGJaccYxbA-TpG_T25ZciEw2i4dY2KLR8P6SlPKYfRhnH7LLettRH4Z2BOASzy6PO4FvEXqUP3bPaDeoUPoH2mAAGW15Q5cPrp5KvXjsRoGh8UAd1OG7P3vwY-6R7-uYMWHIiCvhA5y3yZaqfvuzQDJ9wvZw-4xR8BbERSVNEjxl9hl6AG9HR3ckI";
    localStorage.setItem("access_token_spotify", accessToken);
}






