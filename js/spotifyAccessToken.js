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
    const accessToken = "BQD3IGKTGr4Vf3qD-XuVELzbr3OMCv6uipAF4HLV7CX2zbSGLKOOxiE3yXZgvmsqdmOm_6nf3U2Kld65UKXn5BbCV360CGIx18LuiDQEhQ6Sq-3KlBWxiTrbGfzf5DBXdgj7hAGRTEphwzVFBX2GUgHsh35X563a2A6dUQ56bAMg2kXNeuui4SFx6wfl_WKR6tZx__yYeBuUNIz2vXOYJWe_wrl8ns3LM33OlvHDwVwLTRtJd5GRwlVJd02DQCvC8V6fmwvA2xAUOQ0vLfKHoc2dIOqY6IMQAZukimGgM-h4ls1k2NzPsw4CuUe9V3hvgGo7cEsq7v8LxKKtut4mRcJFtVuIQ-rXRejsAJTkVvsRhPzLRY2m_l1HpAxHGGtZ5hN2OQ";
    localStorage.setItem("access_token_spotify", accessToken);
}






