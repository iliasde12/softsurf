import express, { Router } from "express";
import authSpotifyRouter from "./authSpotify";

import {
  GetPlaylistsSpotify,
  GetPlaylist,
  GetPlaylistSongs,
  GetCurrentUser,
  savePlaylistSongs,
} from "../helpers/spotify";
import {
  GetSongs,
  UpdateSongMood,
  GetSongsByMood,
  createPlaylist,
  GetPlaylists,
  GetPlaylistById,
  GetSongsByIds
} from "../database/database";
import { moods } from "../interfaces/mood";

import multer from 'multer';
import path from 'path';
import {ObjectId} from "mongodb";

const storage = multer.diskStorage({
  destination: path.join(__dirname, '../public/uploads/'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  }
});

const upload = multer({ storage });
const router: Router = express.Router();



router.get("/playlists", async (req, res) => {
  const accessToken = res.locals.spotifyToken;
  const userId = req.session.user?._id;

  let myPlaylists:any = [];
  let myCustomPlaylists:any = [];

  // Altijd uit database halen
  if (userId) {
    myCustomPlaylists = await GetPlaylists(userId);
  }

  // Alleen spotify als er een token is
  if (accessToken) {
    const [data, user] = await Promise.all([
      GetPlaylistsSpotify(accessToken),
      GetCurrentUser(accessToken),
    ]);

    myPlaylists = (data ?? []).filter(
        (p: { owner: { id: any } }) => p.owner.id === user.id,
    );
  }

  res.render("playlist", {
    user: req.session.user,
    playlists: myPlaylists,
    customPlaylists: myCustomPlaylists,
  });
});

router.post("/playlist/create", upload.single('image'), async (req, res) => {
  const { name, description, songs } = req.body;
  const image = req.file ? req.file.filename : undefined;
  const songsList = songs ? JSON.parse(songs) : [];
  const userId = req.session.user?._id;

  console.log(req.file);
  console.log("file name: " + req.file);

  if (!userId) return res.redirect('/login');

  try {
    await createPlaylist(
        userId,
        name,
        description,
        image,
        songsList
    );
  }catch (e){
    console.log(e);
  }

  res.redirect('/playlists');
});

router.get("/playlist/songs/:id", async (req, res) => {
  const accessToken = res.locals.spotifyToken;
  const playlistId = req.params.id;


  if (playlistId.startsWith('db_')) {
    const realId = playlistId.replace('db_', '');
    const userId = new ObjectId(req.session.user?._id);
    const playlist = await GetPlaylistById(new ObjectId(realId), userId);

    const songIds = (playlist?.songs || []) as unknown as ObjectId[];
    //data uit databnak moet naam veranderen later
    const songs = await GetSongsByIds(userId, songIds);

    //console.log(songs);

    return res.render("playlistsongs", { songs, playlist, user: req.session.user });
  }

  const songs = await GetPlaylistSongs(accessToken, playlistId);
  const playlist = await GetPlaylist(accessToken, playlistId);
  console.log(songs);

  res.render("playlistsongs", { songs, playlist });
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
