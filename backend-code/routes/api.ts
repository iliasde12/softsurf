import { searchSongs } from "../helpers/search";
import express, {Router} from "express";
import{ CreateSong, playlistCollection,GetPlaylists,songPlayableCollection,GetSongsByIds,CreateSongPlayable,createPlaylist } from "../database/database";
import { GetTrackSpotify } from "../helpers/spotify";
import {ObjectId } from "mongodb";


const router: Router = express.Router();

//is voor live data uit search en combineert db en spotify
router.get("/search", async (req, res) => {
    try {
        const { q } = req.query as { q: string };
        const accessToken = res.locals.spotifyToken;

        if (!q) {
            return res.json({ fromDB: [], fromSpotify: [] });
        }

        const { fromDB, fromSpotify } = await searchSongs(q, accessToken);
        res.json({ fromDB, fromSpotify });

    } catch (error) {
        res.status(500).json({ error: "Er ging iets mis bij het zoeken" });
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
    const songId = new ObjectId(req.params.id);
    const userId = req.session.user?._id;

    // check of al bestaat
    const existing = await songPlayableCollection.findOne({ songId });
    if (existing) return res.json(existing);

    // ophalen song voor naam en artiest
    const songs = await GetSongsByIds(userId, [songId]);
    const song = songs[0];
    if (!song) return res.status(404).json({ error: 'Song niet gevonden' });

    // youtube zoeken en opslaan
    await CreateSongPlayable(songId, song.name, song.artists?.[0]?.name ?? "");
    const playable = await songPlayableCollection.findOne({ songId });

    res.json(playable);
});

//moet nog gemaakt worden ga er claude in bouwen en kan die afspeellijsten generen
router.post('/playlist/genereren', async (req, res) => {
    const { stemming, aantal, mixtype } = req.body;

    try {
        // 1. Claude bedenkt welke nummers passen
        const { success, suggestions, error } = await generatePlaylistSuggestions({
            stemming,
            aantal: Number(aantal),
            mixtype,
        });

        if (!success) return res.json({ success: false, error });

        // 2. Spotify zoekt de echte track data op
        const resolved = await searchTracks(suggestions);

        const tracks = resolved.map(({ suggestion, result }) => ({
            id: result?.id ?? null,
            name: result?.name ?? suggestion.title,
            artist: result?.artists?.[0]?.name ?? suggestion.artist,
            album_cover: result?.album?.images?.[0]?.url ?? null,
            uri: result?.uri ?? null,
            duration_ms: result?.duration_ms ?? 0,
            preview_url: result?.preview_url ?? null,
            found_on_spotify: result !== null,
        }));

        // 3. Claude genereert ook een playlistnaam
        const nameRes = await generatePlaylistName({ stemming, mixtype, tracks: suggestions });

        res.json({ success: true, tracks, playlistName: nameRes });
    } catch (err) {
        res.json({ success: false, error: err.message });
    }
});
//crearen van de gegeneerde playlist
router.post("/create-generated", async (req, res) => {
    const { name, songIds } = req.body;
    const userId = req.session.user?._id;

    if (!userId) return res.status(401).json({ success: false, error: "Niet ingelogd" });
    if (!name || !songIds?.length) return res.status(400).json({ success: false, error: "Naam of nummers ontbreken" });

    try {
        const playlist = await createPlaylist(
            new ObjectId(userId),
            name,
            "",
            undefined,
            //lijst van ids
            songIds
        );

        res.json({ success: true, playlist });
    } catch (err) {
        // @ts-ignore
        res.json({ success: false, error: err.message });
    }
});

export default router;
