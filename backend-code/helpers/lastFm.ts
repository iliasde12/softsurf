// helpers/lastfm.ts
const LASTFM_API_KEY = process.env.LASTFM_API_KEY!;
const BASE = "https://ws.audioscrobbler.com/2.0/";

export async function searchLastFmArtist(name: string) {
    const [infoRes, albumsRes] = await Promise.all([
        fetch(`${BASE}?method=artist.getinfo&artist=${encodeURIComponent(name)}&api_key=${LASTFM_API_KEY}&format=json`),
        fetch(`${BASE}?method=artist.gettopalbums&artist=${encodeURIComponent(name)}&api_key=${LASTFM_API_KEY}&format=json&limit=50`),
    ]);

    const infoData = await infoRes.json();
    const albumsData = await albumsRes.json();
    const artist = infoData.artist;
    if (!artist) return null;

    const listeners = parseInt(artist.stats?.listeners ?? "0", 10);
    const albums = albumsData.topalbums?.album?.filter((a: any) => a.name !== "(null)").length ?? 0;
    const image = artist.image?.find((i: any) => i.size === "extralarge")?.["#text"] ?? null;

    return {
        name: artist.name as string,
        image: (image || null) as string | null,
        popularity: Math.min(100, Math.round((listeners / 10_000_000) * 100)),
        followers: null,
        albums,
        monthlyListeners: listeners,
        genre: (artist.tags?.tag?.[0]?.name ?? null) as string | null,
        source: "lastfm" as const,
    };
}