import Anthropic from '@anthropic-ai/sdk';
import { TrackSuggestion, PlaylistRequest } from "../interfaces";

const client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});

// ─── Playlist suggesties ───────────────────────────────────────────────────────

export interface ClaudePlaylistResponse {
    success: boolean;
    suggestions: TrackSuggestion[];
    error?: string;
}

export async function generatePlaylistSuggestions(
    req: PlaylistRequest
): Promise<ClaudePlaylistResponse> {
    const { stemming, aantal, mixtype } = req;

    try {
        const response = await client.messages.create({
            model: "claude-sonnet-4-5",
            max_tokens: 1024,
            messages: [
                {
                    role: "user",
                    content: `Genereer een afspeellijst van ${aantal} nummers voor stemming: "${stemming}", mix type: "${mixtype}".

Geef ALLEEN een JSON-array terug, geen uitleg, geen markdown, geen backticks. Elk object heeft:
- title (string)
- artist (string)

Voorbeeld: [{"title":"Blinding Lights","artist":"The Weeknd"}]`,
                },
            ],
        });

        const raw = response.content
            .filter((b:any) => b.type === "text")
            .map((b:any) => b.text)
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

// ─── Playlistnaam genereren ────────────────────────────────────────────────────

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
            model: "claude-sonnet-4-5",
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
            .filter((b:any) => b.type === "text")
            .map((b:any) => b.text)
            .join("")
            .trim();
    } catch {
        return `${stemming} mix`;
    }
}