import express, { Router } from "express";
import { secureMiddleware } from "../middleware/secureMiddleware";
import authSpotifyRouter from "./authSpotify";
import { spotifyMiddleware } from "../middleware/spotifyMiddleware";
import { searchSongs } from "../helpers/search";
import {
  GetPlaylists,
  GetPlaylist,
  GetPlaylistSongs,
  GetCurrentUser,
  savePlaylistSongs,
} from "../helpers/spotify";
import { GetSongs, UpdateSongMood, GetSongsByMood } from "../database/database";
import { moods } from "../interfaces/mood";

const router: Router = express.Router();

//wordt alleen gebruikt als user spotify acc heeft
router.use(secureMiddleware);
router.use(spotifyMiddleware);

router.get("/playlists", async (req, res) => {
  const accessToken = res.locals.spotifyToken;

  let myPlaylists = [];

  if(accessToken) {
    //promise all zodat zei beide tergelijker tijd worden opgroepen en samen worden uitegevoerd
    const [data, user] = await Promise.all([
      GetPlaylists(accessToken),
      GetCurrentUser(accessToken),
    ]);

    //kijkt naar owner uit spotify en returnd alleen playlisten die door de user zijn gemaakt en niet de rest als je bij paar anderen ben geabonneerd
    myPlaylists = (data ?? []).filter(
        (p: { owner: { id: any } }) => p.owner.id === user.id,
    );
  }

  //console.log(playlists);
  res.render("playlist", {
    user: req.session.user,
    playlists: myPlaylists,
  });
});

router.post("/playlist/create", async (req, res) => {

});

router.get("/playlist/songs/:id", async (req, res) => {
  const accessToken = res.locals.spotifyToken;
  const playlistId = req.params.id;
  const songs = await GetPlaylistSongs(accessToken, playlistId);
  const playlist = await GetPlaylist(accessToken, playlistId);

  res.render("playlistsongs", { songs: songs, playlist: playlist });
});

router.get("/account", async (req, res) => {
  res.render("account", {
    user: req.session.user,
  });
});

router.get("/collectie", async (req, res) => {
  const userId = req.session.user?._id;
  const songs = await GetSongs(userId);
  res.render("collectie", {
    user: req.session.user,
    songs: songs,
    moods: moods,
  });
});

router.get("/mood", async (req, res) => {
  const userId = req.session.user?._id;
  const songs = await GetSongsByMood(userId);
  res.render("mood", { songs: songs, moods: moods });
});

router.get("/vergelijken-artiesten", (req, res) => {
  res.render("vergelijken-artisten");
});

router.get("/vergelijken-nummers", (req, res) => {
  res.render("vergelijken-nummers");
});

router.get("/guessthesong", (req, res) => {
  res.render("guessthesong");
});

//get search
router.get("/search", (req, res) => {
  res.render("search");
});

//is voor live data uit search en combineert db en spotify
router.get("/api/search", async (req, res) => {
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

//tijdelijke router om songs van api op teslagen in mongodb
//je moet gewoon id meegeven van een playlist waar wij aan kunnen
router.get("/playlist/:id/save", async (req, res) => {
  const accessToken = res.locals.spotifyToken;
  const playlistId = req.params.id;
  const songs = await GetPlaylistSongs(accessToken, playlistId);
  const tracks = songs.map((s: any) => s.item);
  await savePlaylistSongs(tracks);
  res.redirect(`/playlist/songs/${req.params.id}`);
});

// kan de user de mood aanpassen in de song
router.post("/song/:id/mood", async (req, res) => {
  const mood = parseInt(req.body.mood);
  const userId = req.session.user?._id;
  const songId = req.params.id;
  await UpdateSongMood(userId, songId, mood);
  res.json({ success: true });
});


router.use("/auth", authSpotifyRouter);

export default router;
