function search() {
    const searchInput = document.getElementById("searchData");
    const token = localStorage.getItem("access_token_spotify");

    searchInput.addEventListener("input", async () => {
        const inputValue = searchInput.value;

        try {
         const response = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(inputValue)}&type=track&limit=10`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`Spotify API error: ${response.status}`);
        }

        const data = await response.json();
        console.log(data);

    } catch (error) {
        console.error("Error fetching Spotify playlist:", error);
    }


    })
}

search();