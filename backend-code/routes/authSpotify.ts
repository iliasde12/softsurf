import express, { Router } from "express";
import { CreateSpotifyToken  } from "../database/database";
import { ObjectId } from "mongodb";


const router: Router = express.Router();

//link van spotify flow https://developer.spotify.com/documentation/web-api/tutorials/client-credentials-flow

router.get("/spotify", (req, res) => {

 console.log("CLIENT_ID:", process.env.SPOTIFY_CLIENT_ID);
  console.log("REDIRECT_URI:", process.env.SPOTIFY_REDIRECT_URI);

 const params = new URLSearchParams({
  client_id: process.env.SPOTIFY_CLIENT_ID!,
  response_type: "code",
  redirect_uri: process.env.SPOTIFY_REDIRECT_URI!,
  scope: [
    "user-read-private",
    "user-read-email",
    "user-library-read",
    "user-library-modify",
    "playlist-read-private",
    "playlist-read-collaborative",
    "playlist-modify-private",
    "playlist-modify-public",
    "streaming",
    "user-read-playback-state",
    "user-modify-playback-state",
    "user-read-currently-playing",
    "user-top-read",
    "user-read-recently-played",
  ].join(" "),
  show_dialog: "true",
});

  res.redirect(`https://accounts.spotify.com/authorize?${params}`);
});


router.get("/spotify/callback", async (req, res) => {
  try {
    const code = req.query.code as string;

    // Wissel code in voor tokens
    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(
          `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
        ).toString("base64")}`,
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code: code,
        redirect_uri: process.env.SPOTIFY_REDIRECT_URI!,
      }),
    });

    const data = await response.json();
    const userid: ObjectId | undefined =  req.session.user!._id;

    // Sla tokens op in database
    await CreateSpotifyToken(
      userid,
      data.access_token,
      data.refresh_token,
      new Date(Date.now() + data.expires_in * 1000), // expires_in is in seconden
    );

    res.redirect("/account"); // terug naar account pagina
  } catch (e) {
    console.error("Spotify callback error:", e);
    res.redirect("/account");
  }
});





export default router;
