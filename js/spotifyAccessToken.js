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
    const accessToken = "BQBXiZrIXog6hEqa3bb-38emzk4RhmIKwwOtrCDHQKvenY266hoIx3HEbnd7zuHDWHin9uGeYTBBFadcNAdLh4VQnTK0HBP_JWh8U_0TJBUJ-eud2_Dd4-unaqDHbMJE8zEydnxvpvm1MX0IlUpP-OUEkSGvhYd20LVKE37Ya62FwFn-Zz04-EMVAlXBc448iKNRFSukKTDArVDfz7lFtIb0jEbJhb_HWOUbGXEGvO_Cy4K-54EcopNQTMN_-tYlpw92Cv9tp8aMYUFloNJCbxGRcSnI0pMSw_I8UQ_Pg7TMw5OwORPxvKZkM1Mw_BIv1_1xhGliLfD6Ds1pgj4n_qcFPsyCKEJ26HX9GjNCh3-MB4PLMWU59tEF8v3faHoYlj0U0nM9Qbria01OUvBImEXZP5H5gsI";
    if (!localStorage.getItem("access_token_spotify")) {
        localStorage.setItem("access_token_spotify", accessToken);
    }

}






