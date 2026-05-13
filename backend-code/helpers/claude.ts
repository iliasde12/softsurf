import Anthropic from "@anthropic-ai/sdk";
import { TrackSuggestion, PlaylistRequest, ClaudePlaylistResponse } from "../interfaces";

const client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function generatePlaylistSuggestions(
    req: PlaylistRequest
): Promise<ClaudePlaylistResponse> {
    const { stemming, aantal, mixtype } = req;
    const randomSeed = Math.floor(Math.random() * 10000);

    try {
        const response = await client.messages.create({
            model: "claude-sonnet-4-5",
            max_tokens: 1024,
            messages: [
                {
                    role: "user",
                    content: `Genereer een VERRASSENDE en GEVARIEERDE afspeellijst van ${aantal} nummers voor stemming: "${stemming}", mix type: "${mixtype}". (variatie: ${randomSeed})

Kies elke keer ANDERE nummers, vermijd voor de hand liggende keuzes. Mix verschillende jaren, subgenres en artiesten. Wees creatief en onverwacht in je keuzes.

Geef ALLEEN een JSON-array terug, geen uitleg, geen markdown, geen backticks. Elk object heeft:
- title (string)
- artist (string)

Voorbeeld: [{"title":"Blinding Lights","artist":"The Weeknd"}]`,
                },
            ],
        });

        const raw = response.content
            .filter((b: any) => b.type === "text")
            .map((b: any) => b.text)
            .join("")
            .replace(/```json|```/g, "")
            .trim();

        const suggestions: TrackSuggestion[] = JSON.parse(raw);

        return { success: true, suggestions };
    } catch (err) {
        const message = err instanceof Error ? err.message : "Onbekende fout";
        return { success: false, suggestions: [], error: message };
    }
}

export async function generatePlaylistName({
                                               stemming,
                                               mixtype,
                                               tracks,
                                           }: {
    stemming: string;
    mixtype: string;
    tracks: { title: string; artist: string }[];
}): Promise<string> {
    const randomSeed = Math.floor(Math.random() * 10000);

    try {
        const trackList = tracks.map((t) => `${t.title} - ${t.artist}`).join(", ");

        const response = await client.messages.create({
            model: "claude-sonnet-4-5",
            max_tokens: 64,
            messages: [
                {
                    role: "user",
                    content: `Bedenk een CREATIEVE en UNIEKE playlistnaam (max 4 woorden) voor een "${stemming}" playlist met mix type "${mixtype}". (variatie: ${randomSeed})
De nummers zijn: ${trackList}.
Geef ALLEEN de naam terug, geen uitleg, geen aanhalingstekens.`,
                },
            ],
        });

        return response.content
            .filter((b: any) => b.type === "text")
            .map((b: any) => b.text)
            .join("")
            .trim();
    } catch {
        return `${stemming} mix`;
    }
}