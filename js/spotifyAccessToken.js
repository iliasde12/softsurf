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
    const accessToken = "BQAPKkcMPTbyQg7HbKWKBt9xa0oFH-FGHK5Pluw6Xha8cTMyf6MTcEyiQHgJKd1MjPH76x93q_Hm40BCwL7QDttvSYKiYLErGFmM5QI2gKTPZmfEfM7kIVowD75FhR5lYuBhlCX9sNxpYhbtJ80kt8jLn5tps1xtm6nbrIWsUekxLonG8BL8dLsHnVjhXRBa-Ph4QP48GBEWw27dSNe09x4cieKv5Gh-wEo69FqGkAm6Nt6TRQ7T8tTO4msZ7URkDK6y8NU9ZZ2RJnWrFxpbuVIZ7-dpwro7QEG85TapQlmLDNV2lT2Tx6rhBykrY0O0Lsa2CVaN8UYWu_W2Qt6oRvhjwKDKoLgc3_qkIpavlSrL-kmXLB5TrzFLERUM-0hT-brSskHa7-WXIKJhCwFtwjrjPnC3JgE";
    localStorage.setItem("access_token_spotify", accessToken);
}






