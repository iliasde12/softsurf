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
    const accessToken = "BQASswDHOuCsc34ggHtqY-2MQY4kpezVj6XpbobXKCChz2ptdTA2F43BNdzqGF3d6Z4uuirsn2-mP4zWWYzLvnwFYY2kau06m3p4PKJMfFMjrOTKzbUTksBLddF5kaMwhshpgaLwhjOKXvrqZoiBNXbXQtY5bRlTgww3DmSydAuiXHfFoHguGIUwiXsELAJcYfQIrvS3vgxy-faKaaszp0IsEuUeRcn1Q8K1bW1LQBa4hUusIhzG1B3caAIxre5A-3tfMRazcv6Nh9g0QYzlPagcoBWJhGS2azT-5tdRkUBMJaorIAyPA2anXuOnXQ2nEDlKF6476SCfmlAPLe2AVIV4OTjkQ-n1ANq6Gj7ztC4gYzHYCFxiC_MfplYJJGZ9m-BAGg";
    localStorage.setItem("access_token_spotify", accessToken);
}






