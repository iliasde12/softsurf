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
    const accessToken = "BQCwWnzizArjEMUlf070VVLvVQIAH0-n9wS2-6Xb51gWWX8QE0kEDhMA5x-KvUUmXEJgwY-9YGOUXYYZe5miRvwLNh4_C1gDEI2i0PLshbIN2AMmYXCiSyuvxWlKKJGsHgy4q0rr2KxZPP7N--ESu43fkmFR_6nID4BtM8xn7JWo6bav2YI57cbfGL0BDYFwpdOCvQT-IspqK2Ngfx7h8JDR5bOJkRmDVK-M_lEK9rhRyhg79tqclGJ760uM4IvnTBs9z-JQSTe_FQDmV1KikwG5slN2UZrTydDpd3k11jtUTvfe__R0UVMtaSpzA_sgIcdMXXmuUcboQHu0Q2LDKuqUbslXpzre9g_iK2x4uDaPru2p4jcqZxQk2OVNk45pK0W8iM1tw1o8y9nfvUr7HuKHGEk-3X4";

    if (!localStorage.getItem("access_token_spotify")) {
        localStorage.setItem("access_token_spotify", accessToken);
    }

}






