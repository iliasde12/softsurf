import { searchSongs } from "../helpers/search";
import express, {Router} from "express";
import{ CreateSong, playlistCollection,GetPlaylists } from "../database/database";
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


router.get('/playlists', async (req, res) => {
    const userId = req.session.user?._id;

    if (!userId) return res.status(401).json({ error: 'Niet ingelogd' });

    const playlists = await GetPlaylists(userId);
    res.json(playlists);
});


router.post('/playlist/genereren', async (req, res) => {

});


export default router;
