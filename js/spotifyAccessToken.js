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
    const accessToken = "BQAur27tK6OJBRnvRJ_jRWT56n8IDlSeKyjUDk3DnxTdhwdEefezoYDV1bYGQxAQ1m50u9KC9aGN1VAO2mca3GTs47P_wkL9wci6fU69fc7UZygQXibajeJsxuTLfc70Uuvg4gFKc7oSzB1LENdQJ6VNBewaSwJ-jgXZSVup4pXjfQUHGzN2AOhvADJ4KdDmDkTFXbJl14wsdppE0D_dRd0BTq_rtxUDovTL-R8OGgU93cViEHncJUTZyoBSJQh_1rpaIxUsBBNz58z1BPybeCEJrZigeaMpPQLDXRwseitNhY0Sr8GEQbQctMZnwz45gDWJpkfO4KeIFlM9FmYT-j9rvPH-nJR5Y2yBddSNGDzlJSHO7UfdzAX1PslZKi5vQIxyzQ";
    localStorage.setItem("access_token_spotify", accessToken);
}






