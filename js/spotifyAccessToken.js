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
  const accessToken = "BQBeGA1Ub6qvN5-93NPaebR0lDpeh8CcLGiTvE7dTUR-07umAMkiJPCcaqrk0zJpBHRiIP-1s8jszFV-fdGIcO94wh86vCEt1mEZv8_ZLaxBFO9BRkTAmRkAvl-UKOosTjrybDg75YrhbBDZVHNpKCkTVyvZj6cQojY_aelY63FRSHX1y2pHdaFlZilK2qbs9yI3byhSpsvHNSdQt1GH3iogy5Vl0zCZONlNa3j6X6MSKvJjP6fQbw0gVf0-O6LfM733xevl9HZtllP5ZikbGt4VX56_YwkfKwpS8id6hl9lCeVNk04_ZexnYbaJvApf2MFWzU20tmkCNXBH0qx2_MnWV_OrFW0IPEL5mJ5DrOcrTUizB9yBPUBQU2IrFAw4NCOieFbQC21uCD_St7Jv5oxBV4Z4Qec";
    if (!localStorage.getItem("access_token_spotify")) {
        localStorage.setItem("access_token_spotify", accessToken);
    }

}






