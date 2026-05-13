import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function generatePlaylistName({
                                               stemming,
                                               mixtype,
                                               tracks,
                                           }: {
    stemming: string;
    mixtype: string;
    tracks: { title: string; artist: string }[];
}): Promise<string> {
    try {
        const trackList = tracks.map((t) => `${t.title} - ${t.artist}`).join(", ");

        const response = await client.messages.create({
            model: "claude-sonnet-4-20250514",
            max_tokens: 64,
            messages: [
                {
                    role: "user",
                    content: `Bedenk een creatieve, korte playlistnaam (max 4 woorden) voor een "${stemming}" playlist met mix type "${mixtype}". 
De nummers zijn: ${trackList}.
Geef ALLEEN de naam terug, geen uitleg, geen aanhalingstekens.`,
                },
            ],
        });

        return response.content
            .filter((b) => b.type === "text")
            .map((b) => b.text)
            .join("")
            .trim();
    } catch {
        return `${stemming} mix`;
    }
}