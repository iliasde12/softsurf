document.addEventListener("DOMContentLoaded", () => {

    // Search
    const searchInput = document.getElementById("searchInput");
    if (searchInput) {
        searchInput.addEventListener("input", () => {
            const q = searchInput.value.toLowerCase();
            document.querySelectorAll(".song-row").forEach(row => {
                const name = row.dataset.name ?? "";
                const artist = row.dataset.artist ?? "";
                row.style.display = name.includes(q) || artist.includes(q) ? "" : "none";
            });
        });
    }

    // Hearts
    document.querySelectorAll(".heart").forEach(heart => {
        heart.addEventListener("click", async (e) => {
            e.stopPropagation();
            const songId = heart.dataset.songId;
            const res = await fetch(`api/song/${songId}/favorite`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
            });
            const data = await res.json();
            heart.dataset.favorite = data.isFavorite ? "true" : "false";
            heart.className = `heart text-sm cursor-pointer transition ${data.isFavorite ? "text-[#E91E8C]" : "text-[#6B6B8A]"}`;
        });
    });

    // Moods
    document.querySelectorAll(".mood-select").forEach(select => {
        select.addEventListener("click", (e) => e.stopPropagation());
        select.addEventListener("change", async () => {
            const songId = select.dataset.songId;
            await fetch(`api/song/${songId}/mood`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ mood: select.value }),
            });
        });
    });

});