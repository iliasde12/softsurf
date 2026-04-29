import express, { Router } from "express";
import { secureMiddleware } from "../middleware/secureMiddleware";
import authSpotifyRouter from "./authSpotify";
import { spotifyMiddleware } from "../middleware/spotifyMiddleware";
import {GetPlaylists,GetPlaylist,GetPlaylistSongs,GetCurrentUser,savePlaylistSongs} from "../helpers/spotify"
import { GetSongs } from "../database/database";


const router: Router = express.Router();

router.use(secureMiddleware);
//wordt alleen gebruikt als user spotify acc heeft
router.use(spotifyMiddleware);

router.get("/playlists",async (req, res) => {
  const accessToken = res.locals.spotifyToken;
  
  //promise all zodat zei beide tergelijker tijd worden opgroepen en samen worden uitegevoerd
  const [data, user] = await Promise.all([
    GetPlaylists(accessToken),
    GetCurrentUser(accessToken),
  ]);

  //kijkt naar owner uit spotify en returnd alleen playlisten die door de user zijn gemaakt en niet de rest als je bij paar anderen ben geabonneerd
  const myPlaylists = data.filter((p: { owner: { id: any; }; }) => p.owner.id === user.id);

  //console.log(playlists);
  res.render("playlist", { 
    user: req.session.user,
    playlists: myPlaylists,
  });
});


router.get('/playlist/songs/:id', async (req, res) => {
  const accessToken = res.locals.spotifyToken;
  const playlistId = req.params.id;
  const songs = await GetPlaylistSongs(accessToken, playlistId);
  const playlist = await GetPlaylist(accessToken, playlistId);

  res.render('playlistsongs', { songs: songs,playlist:playlist });
});


router.get("/account", async (req, res) => {
 
  res.render("account", { 
    user: req.session.user,

  });
});

router.get("/collectie", async (req, res) => {
  const songs = await GetSongs();
  res.render("collectie", { user: req.session.user,songs:songs });
});

router.get("/mood", (req, res) => {
  res.render("mood");
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

router.get("/search", (req, res) => {
  res.render("search");
});

//tijdelijke router om songs van api op teslagen in mongodb
router.get('/playlist/:id/save', async (req, res) => {
  const accessToken = res.locals.spotifyToken;
  const playlistId = req.params.id;
  const songs = await GetPlaylistSongs(accessToken, playlistId);
  const tracks = songs.map((s: any) => s.item);
  await savePlaylistSongs(tracks);
  res.redirect(`/playlist/songs/${req.params.id}`);
});




router.use("/auth", authSpotifyRouter);

export default router;
