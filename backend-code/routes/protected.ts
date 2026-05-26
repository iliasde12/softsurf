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
  GetSongsByMood,
  createPlaylist,
  GetPlaylists,
  GetPlaylistById,
  GetSongsByIds,
    userCollection
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
  const songsList: ObjectId[] = songs
      ? JSON.parse(songs).map((id: string) => new ObjectId(id))  // ← strings naar ObjectId
      : [];
  const userId = req.session.user?._id;

  console.log("songs: ", songsList);

  if (!userId) return res.redirect('/login');

  try {
    await createPlaylist(
        userId,
        name,
        description,
        image,
        songsList
    );
  } catch (e) {
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

router.get('/songs', async (req, res) => {
  const userId = req.session.user?._id;
  const songs = await GetSongs(userId);
  res.render('songs', { songs, moods, currentPath: '/songs', user: req.session.user });
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


//leaderboard voor punten
router.get("/leaderboard", async (req, res) => {
  const userId = req.session.user?._id;
  if (!userId) return res.redirect("/login");

  try {
    const topUsers = await userCollection.find(
        {},
        {
          sort: { totalScore: -1 },
          limit: 10,
          projection: { username: 1, avatar: 1, totalScore: 1, gamesPlayed: 1, bestStreak: 1 }
        }
    ).toArray();

    const currentUser = await userCollection.findOne(
        { _id: new ObjectId(userId) },
        { projection: { username: 1, avatar: 1, totalScore: 1, gamesPlayed: 1, bestStreak: 1 } }
    );

    // Rank van huidige gebruiker berekenen
    const userRank = await userCollection.countDocuments({ totalScore: { $gt: currentUser?.totalScore ?? 0 } }) + 1;

    return res.render("leaderboard", {
      topUsers,
      currentUser,
      userRank,
      currentPath: "/leaderboard",
    });
  } catch (e) {
    console.error("leaderboard error:", e);
    return res.status(500).send("Er ging iets mis");
  }
});


//alle auth voor spotify
router.use("/auth", authSpotifyRouter);

export default router;
