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
    const accessToken = "BQAaJQWcYKDrmuiAdNJ1Kd2CteC8XD18EgdyDEeWZq_ZLydCCNoQz9kIp0KECER9fgUSwKSc5Sj0_1twqj5kte4cNJdTV_Tmwm-esRDtMyZijFxnxcy-b77RouAhmj2s-iNYANCVhtEkJj1lzecUBqw4lWUBPrvrRLQWqF4d3QiIMNLXZf5pJNJjwkE5gA2bBdVr4ub_VGtGigxUARKjGiDx7PTtoQ2auWxOEafZID9rQqZIyVCb5-0rDhZHQpo16HFyUfUEREQW8zOI7Ney3bsGTcmyr1FbZoKAa4xCAAW9-s7w1pDPJ7z33J2lP52NSe0UbKDfyvEEpqLpi3rKr9gHsvADsQbkUKJeJXdYZUDF949cgM55-p45R51vHJ5ZkyhT_aGVA3DbjPGEUAOe1-KQ1WNGfUk";
    localStorage.setItem("access_token_spotify", accessToken);
}






