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
    const accessToken = "BQBak-xrp2RU4_BpkQ9K8OVSiLJFlrJr-jaPUdkVwb-O7_SUR9RmxZS7ln1B98GU23mCJ4hYdst7KsywzfdsNIylqWJAkuAulyqb3R3ZoPGDKoK7nk6PJgRTM7x-urVa0vznAoPrdtm-b5I3m6G6qJCyJQ-ZL8CtXmeOAQcSzcJYqPMExiHSjlbTth9IDyrn3T-PBfaiwwt2_ZHAI6PX9N0xzoxw2d1AthZ9oeuXBYYDJuRcVYvv7nKgDrp5F41s2TKEdroNsNPYlcAMPi0H1_EStAtPXUZvc3D5f0ChU-BwfSi9BgFyhYmL15bwVzqxt_5So5_qfre2iy0RHU7L3sYGp2piO3pIU5tXWxySuFErKU-d9eDiIIJzy9oVy4P3JFT-Zpaaemb0NhI_cALycXdAQJoI9Eo";
    localStorage.setItem("access_token_spotify", accessToken);
}






