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
    const accessToken = "BQBe8wiFEFHBXWXZpfx_Y-X1JbnnidZzMIN6pNiqvTEQY-8CuEBg_1gUMxFSa-uRYLeYtIytArDQ3wWNgxSA_RAs9M_iahLx2_K3zjrHGGn3qC7A5barQjJdGI5ZhIDxH61qTL0kyKKhOGGlETkVm7I8PbcED4YiB1_Ek6kqArxpqO_ew1OYZkdv2i7faUCeGfqRK8zyeQhtJJcANSywmVKS5LS2e45HexKxJwk3gVyozJik-PQ3TEOKB86mr0fq4K_LDe4uF9lEY52BYlPLSOdcmEWxSb2ZBONog6w35BN1EVMd-oDmhj3kYEcx6QGXVtNeSKN3KPyv19uASbVfZNCh6nFzKLTSEbG8HNVqIq525XvEmoo3I6nS42XQonor5F5RUA";
    localStorage.setItem("access_token_spotify", accessToken);
}






