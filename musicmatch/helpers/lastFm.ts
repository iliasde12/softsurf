// Last.fm helpers
export async function GetArtistLastFm(artistName: string) {
    const apiKey = process.env.LASTFM_API_KEY;

    const [info, topTracks, similar] = await Promise.all([
        fetch(`https://ws.audioscrobbler.com/2.0/?method=artist.getinfo&artist=${encodeURIComponent(artistName)}&api_key=${apiKey}&format=json`).then(r => r.json()),
        fetch(`https://ws.audioscrobbler.com/2.0/?method=artist.gettoptracks&artist=${encodeURIComponent(artistName)}&api_key=${apiKey}&format=json&limit=1`).then(r => r.json()),
        fetch(`https://ws.audioscrobbler.com/2.0/?method=artist.getsimilar&artist=${encodeURIComponent(artistName)}&api_key=${apiKey}&format=json&limit=10`).then(r => r.json()),
    ]);

    return {
        name: info.artist?.name ?? artistName,
        image: info.artist?.image?.find((i: any) => i.size === "extralarge")?.["#text"] ?? null,
        listeners: parseInt(info.artist?.stats?.listeners ?? "0"),
        playcount: parseInt(info.artist?.stats?.playcount ?? "0"),
        genre: info.artist?.tags?.tag?.[0]?.name ?? "Onbekend",
        topTrack: topTracks.toptracks?.track?.[0]?.name ?? "Onbekend",
        similarCount: similar.similarartists?.artist?.length ?? 0,
    };
}

// Zoeken via Last.fm
export async function SearchArtistLastFm(query: string) {
    const apiKey = process.env.LASTFM_API_KEY;
    const res = await fetch(
        `https://ws.audioscrobbler.com/2.0/?method=artist.search&artist=${encodeURIComponent(query)}&api_key=${apiKey}&format=json&limit=5`
    );
    const data = await res.json();
    return data.results?.artistmatches?.artist ?? [];
}