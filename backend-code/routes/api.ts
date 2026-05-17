import { searchSongsDbSpotify } from "../helpers/search";
import express, {Router} from "express";
import{ CreateSong, playlistCollection,GetPlaylists,songPlayableCollection,GetSongsByIds,CreateSongPlayable,createPlaylist ,spotifySongCollection } from "../database/database";
import { GetTrackSpotify,searchTracks  } from "../helpers/spotify";
import { ObjectId  } from "mongodb";
import { generatePlaylistSuggestions, generatePlaylistName } from "../helpers/claude";
import {  SpotifyTrack } from "../interfaces/index";
//tijdelijk voor de album covers opteslagen
import path from "path";
import { writeFile } from "fs/promises";
const router: Router = express.Router();

//download functie om de album images te donwloaden
// @ts-ignore

async function downloadImage(url: string, filename: string): Promise<string | null> {
    try {
        const res = await fetch(url);
        const buffer = await res.arrayBuffer();
        const filePath = path.join(process.cwd(), "public", "uploads", filename);
        // @ts-ignore
        await writeFile(filePath, Buffer.from(buffer));
        return filename;
    } catch (e) {
        console.error("downloadImage error:", e);
        return null;
    }
}


//is voor live data uit search en combineert db en spotify
router.get("/search", async (req, res) => {
    try {
        const { q } = req.query as { q: string };
        const accessToken = res.locals.spotifyToken;

        if (!q) {
            return res.json({ fromDB: [], fromSpotify: [] });
        }

        const { fromDB, fromSpotify } = await searchSongsDbSpotify(q, accessToken);
        res.json({ fromDB, fromSpotify });

    } catch (error) {
        res.status(500).json({ error: "Er ging iets mis bij het zoeken" });
    }
});

//herkening van sound
router.post("/shazam/detect", async (req, res) => {
    try {
        const { audio } = req.body;

        if (!audio) {
            return res.status(400).json({ error: "Geen audio meegestuurd" });
        }

        const rapidApiKey = process.env.RAPID_API_KEY!;

        const response = await fetch("https://shazam.p.rapidapi.com/songs/v2/detect", {
            method: "POST",
            headers: {
                "content-type": "text/plain",
                "x-rapidapi-host": "shazam.p.rapidapi.com",
                "x-rapidapi-key": rapidApiKey,
            },
            body: audio
        });

        // Tijdelijk: log wat Shazam teruggeeft
        const rawText = await response.text();
        console.log("Shazam status:", response.status);
        console.log("Shazam response:", rawText);

        if (!response.ok) {
            return res.status(502).json({ error: "Shazam API fout: " + response.status, detail: rawText });
        }

        res.json(JSON.parse(rawText));

    } catch (error) {
        console.error("Shazam fout:", error);
        res.status(500).json({ error: "Er ging iets mis" });
    }
});



//is voor song toe tevoegen in playlist
router.post('/playlist/add-song', async (req, res) => {
    const { playlistId, trackId } = req.body;
    const accessToken = res.locals.spotifyToken;
    const userId = req.session.user?._id;

    if (!userId) return res.status(401).json({ error: 'Niet ingelogd' });

    try {
        let songId: ObjectId;

        //prefix moet altijd anders zien wij het verschill niet tussen spotify en databank want beide zijn hexa id even lang
        //omdat data letterlijk van spotify in db komt
        if (trackId.startsWith('db_')) {
            // Al in DB → gewoon ID gebruiken
            songId = new ObjectId(trackId.replace('db_', ''));
        } else {
            // Komt van Spotify → eerst opslaan in DB
            const track = await GetTrackSpotify(accessToken, trackId);
            const createdId = await CreateSong(track);
            if (!createdId) return res.status(401).json({ error: 'geen song' });
            songId = createdId;
        }

        await playlistCollection.updateOne(
            { _id: new ObjectId(playlistId), userId: new ObjectId(userId) },
            { $addToSet: { songs: songId } }
        );

        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: 'Er ging iets mis' });
    }
});

//returnd alle playlisten
router.get('/playlists', async (req, res) => {
    const userId = req.session.user?._id;

    if (!userId) return res.status(401).json({ error: 'Niet ingelogd' });

    const playlists = await GetPlaylists(userId);
    res.json(playlists);
});

//api voor muziek afpselen
router.get('/song/:id/playable', async (req, res) => {
    const rawId = req.params.id;
    const userId = req.session.user?._id;
    let songId: ObjectId;
    let songName: string;
    let songArtist: string;

    if (ObjectId.isValid(rawId) && rawId.length === 24) {
        // MongoDB ID
        songId = new ObjectId(rawId);

        const songs = await GetSongsByIds(userId, [songId]);
        const song = songs[0];
        if (!song) return res.status(404).json({ error: 'Song niet gevonden' });

        songName = song.name;
        songArtist = song.artists?.[0]?.name ?? "";
    } else {
        // Spotify ID
        const accessToken = res.locals.spotifyToken;
        if (!accessToken) return res.status(401).json({ error: 'Geen access token' });

        const spotifySong = await GetTrackSpotify(accessToken, rawId);
        if (!spotifySong) return res.status(404).json({ error: 'Spotify song niet gevonden' });

        const insertedId = await CreateSong(spotifySong);
        if (!insertedId) return res.status(500).json({ error: 'Song opslaan mislukt' });

        songId = insertedId;
        songName = spotifySong.name;
        songArtist = spotifySong.artists?.[0]?.name ?? "";
    }

    const existing = await songPlayableCollection.findOne({ songId });
    if (existing) return res.json(existing);

    await CreateSongPlayable(songId, songName, songArtist);
    const playable = await songPlayableCollection.findOne({ songId });

    res.json(playable);
});

//moet nog gemaakt worden ga er claude in bouwen en kan die afspeellijsten generen
router.post('/playlist/generate', async (req, res) => {
    const { stemming, aantal, mixtype } = req.body;
    const accessToken = res.locals.spotifyToken;

    try {
        const { success, suggestions, error } = await generatePlaylistSuggestions({
            stemming,
            aantal: Number(aantal),
            mixtype,
        });

        if (!success) return res.json({ success: false, error });

        const resolved = await searchTracks(suggestions,accessToken);

        // @ts-ignore
        const tracks = resolved.map(({ suggestion, result }) => ({
            id: result?.id ?? null,
            name: result?.name ?? suggestion.title,
            artist: result?.artists?.[0]?.name ?? suggestion.artist,
            artist_id: result?.artists?.[0]?.id ?? null,
            artists: result?.artists ?? [],   // volledige artists array toevoegen
            album_id: result?.album?.id ?? null,
            album_name: result?.album?.name ?? null,
            album_cover: result?.album?.images?.[0]?.url ?? null,
            uri: result?.uri ?? null,
            duration_ms: result?.duration_ms ?? 0,
            preview_url: result?.preview_url ?? null,
            found_on_spotify: result !== null,
        }));

        const nameRes = await generatePlaylistName({ stemming, mixtype, tracks: suggestions });

        res.json({ success: true, tracks, playlistName: nameRes });
    } catch (err) {
        res.json({ success: false, error: (err as Error).message });
    }
});

router.post("/playlist/create-generated", async (req, res) => {
    const { name, tracks, stemming, mixtype } = req.body;
    const userId = req.session.user?._id;

    if (!userId) return res.status(401).json({ success: false, error: "Niet ingelogd" });
    if (!name || !tracks?.length) return res.status(400).json({ success: false, error: "Naam of nummers ontbreken" });

    try {
        const songIds: ObjectId[] = [];

        for (const t of tracks) {
            if (!t.found_on_spotify || !t.id) continue;

            const spotifyTrack: SpotifyTrack = {
                id: t.id,
                name: t.name,
                uri: t.uri ?? "",
                href: "",
                duration_ms: t.duration_ms,
                explicit: false,
                popularity: 0,
                preview_url: t.preview_url ?? null,
                track_number: 0,
                disc_number: 0,
                type: "track",
                artists: t.artists?.length
                    ? t.artists.map((a: any) => ({
                        id: a.id,
                        name: a.name,
                        href: a.href ?? "",
                        uri: a.uri ?? "",
                        type: "artist" as const,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    }))
                    : [{
                        id: t.artist_id ?? t.id + "_artist",
                        name: t.artist,
                        href: "",
                        uri: "",
                        type: "artist" as const,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    }],
                album: {
                    id: t.album_id ?? t.id + "_album",    // echte Spotify album ID
                    name: t.album_name ?? t.name,
                    href: "",
                    uri: "",
                    album_type: "album",
                    total_tracks: 0,
                    images: t.album_cover ? [{ url: t.album_cover }] : [],
                    release_date: "",
                    release_date_precision: "day",
                    type: "album",
                    artists: [],
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            };

            const songId = await CreateSong(spotifyTrack);
            if (songId) songIds.push(songId);
        }

        const coverUrl = tracks.find((track: any) => track.album_cover)?.album_cover ?? null;
        let coverFilename: string | undefined = undefined;
        if (coverUrl) {
            const filename = `playlist_${Date.now()}.jpg`;
            const saved = await downloadImage(coverUrl, filename);
            if (saved) coverFilename = saved;
        }

        const playlist = await createPlaylist(
            new ObjectId(userId),
            name,
            `AI gegenereerd · ${stemming} · ${mixtype}`,
            coverFilename,  // lokale bestandsnaam
            songIds
        );

        res.json({ success: true, playlist });
    } catch (err) {
        res.json({ success: false, error: (err as Error).message });
    }
});

export default router;
