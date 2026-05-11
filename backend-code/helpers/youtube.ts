export async function SearchYouTube(query: string): Promise<string | null> {
    const res = await fetch(
        `https://www.googleapis.com/youtube/v3/search?q=${encodeURIComponent(query)}&type=video&part=snippet&maxResults=1&key=${process.env.YOUTUBE_API_KEY}`
    );
    const data = await res.json();
    return data.items?.[0]?.id?.videoId ?? null;
}