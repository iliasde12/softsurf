let currentTrackId = null;

document.addEventListener('click', async (e) => {
    const btn = e.target.closest('.addSong');
    if (btn) {
        currentTrackId = btn.dataset.trackId;

        const res = await fetch('/api/playlists');
        const playlists = await res.json();

        const list = document.getElementById('playlistList');
        list.innerHTML = '';
        playlists.forEach(playlist => {
            const div = document.createElement('div');
            div.className = 'text-white bg-[#2A2750] rounded-xl px-4 py-2 cursor-pointer hover:bg-[#33306b]';
            div.textContent = playlist.name;
            div.addEventListener('click', async () => {
                await addSongToPlaylist(playlist._id, currentTrackId);
                document.getElementById('addSongModal').classList.add('hidden');
            });
            list.appendChild(div);
        });

        document.getElementById('addSongModal').classList.remove('hidden');
    }
});

document.getElementById('sluitAddModal').addEventListener('click', () => {
    document.getElementById('addSongModal').classList.add('hidden');
});


async function addSongToPlaylist(playlistId, trackId) {
    const response = await fetch('/api/playlist/add-song', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playlistId, trackId })
    });
    return await response.json();
}