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
    const accessToken = "BQBkP5mhaJncZ0oZPOAU3RTF_McB4paP-ZPpIB6CIt3yZcrw0XbKRObG3rxkX5D-_LoavL9nO8636YCkIlu6H9OmwNyIGSp74J4_hyYRSN-mOLV6UTc06GEvd8f-EuBBktgwf9dFHAzS1fL-pw7LJPoMHgLvWSSpSW_85QCDlgOll6VOGSDLAu0paDAl99-8QuA1P5T_GkQbqnKtXPLDduBNvprwKRlShSNRVgxOf1fDKtnWZthA76hHOzgFseq_uPIpoEW1Ue9pfvPZW0vmyoIWiInPswTrGOOdPe3LQ5TCCfQ5ZIL0qxuIcHlFcziWSt9cmBIJLNFYtkCQcBNKSVqYm04WHcRFROw9FCjGPUowMFkgbtAGT7WanOvmO2d9VpRhYrC9Qj4vDhEmXTzY46eaJyPsybg";
    localStorage.setItem("access_token_spotify", accessToken);
}






