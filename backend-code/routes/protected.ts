import express, { Router } from "express";
import { secureMiddleware } from "../middleware/secureMiddleware";
import { GetSpotifyToken } from "../database/database";
import { ObjectId } from "mongodb";
import authSpotifyRouter from "./authSpotify";
import { spotifyMiddleware } from "../middleware/spotifyMiddleware";
import { GetPlaylistSongs } from "../helpers/spotify"

const router: Router = express.Router();

router.use(secureMiddleware);
//wordt alleen gebruikt als user spotify acc heeft
router.use(spotifyMiddleware);

router.get("/playlist",async (req, res) => {
  const accessToken = res.locals.spotifyToken;
  console.log("accessToken:", accessToken);
  const playlistId = "5OPl4KPp228zY2lX7CHqf2"; 

  const songs = await GetPlaylistSongs(accessToken, playlistId);

  res.render("playlist", { 
    user: req.session.user,
    songs: songs ?? [] 
  });
});

router.get("/account", async (req, res) => {
 
  res.render("account", { 
    user: req.session.user,

  });
});

router.get("/collectie", (req, res) => {
  res.render("collectie", { user: req.session.user });
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

router.put("/player/play", async (req, res) => {
  try {
    const accessToken = res.locals.spotifyToken;
    const { uri } = req.body;

    const response = await fetch(`https://api.spotify.com/v1/me/player/play`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ uris: [uri] }),
    });

    if (!response.ok) {
      return res.json({ success: false, status: response.status });
    }

    res.json({ success: true });
  } catch (e) {
    console.error("player/play error:", e);
    res.json({ success: false });
  }
});



router.use("/auth", authSpotifyRouter);

export default router;
