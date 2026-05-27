import { searchSongsDbSpotify } from "../helpers/search";
import express, { Router } from "express";
import {
  CreateSong,
  playlistCollection,
  GetPlaylists,
  songPlayableCollection,
  GetSongsByIds,
  CreateSongPlayable,
  createPlaylist,
  spotifySongCollection,
  userCollection,
  gameSessionCollection,
  guessCollection,
  ToggleFavorite,
  GetFavorites,
  UpdateSongMood,
} from "../database/database";
import { moods } from "../interfaces/mood";
import { GetTrackSpotify, searchTracks } from "../helpers/spotify";
import { ObjectId } from "mongodb";
import { generatePlaylistSuggestions, generatePlaylistName } from "../helpers/claude";
import { SpotifyTrack } from "../interfaces/index";
import path from "path";
import { writeFile } from "fs/promises";
const router: Router = express.Router();

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

router.get("/search", async (req, res) => {
  const { q, collection } = req.query as { q: string; collection?: string };
  const isCollection = collection === "true";

  if (!q) return res.json({ fromDB: [], fromSpotify: [] });
  try {
    if (isCollection) {
      // collectie logica
      const fromDB = await searchSongsDbSpotify(q); // alleen db
      res.json({ fromDB, fromSpotify: [] });
    } else {
      const accessToken = res.locals.spotifyToken;
      const { fromDB, fromSpotify } = await searchSongsDbSpotify(q, accessToken);
      res.json({ fromDB, fromSpotify });
    }
  } catch (error) {
    res.status(500).json({ error: "Er ging iets mis bij het zoeken" });
  }
});

router.get("/collectie", async (req, res) => {
  try {
    const userId = req.session.user?._id;
    if (!userId) return res.status(401).json({ error: "Niet ingelogd" });
    const songs = await GetFavorites(new ObjectId(userId));
    res.json({ songs, moods });
  } catch (error) {
    res.status(500).json({ error: "Er ging iets mis bij het laden van je collectie" });
  }
});

// kan de user de mood aanpassen in de song
router.post("/song/:id/mood", async (req, res) => {
  const mood = parseInt(req.body.mood);
  const userId = req.session.user?._id;
  const songId = req.params.id;
  await UpdateSongMood(userId, songId, mood);
  res.json({ success: true });
});

router.post("/shazam/detect", async (req, res) => {
  try {
    const { audio } = req.body;
    if (!audio) return res.status(400).json({ error: "Geen audio meegestuurd" });
    const rapidApiKey = process.env.RAPID_API_KEY!;
    const response = await fetch("https://shazam.p.rapidapi.com/songs/v2/detect", {
      method: "POST",
      headers: {
        "content-type": "text/plain",
        "x-rapidapi-host": "shazam.p.rapidapi.com",
        "x-rapidapi-key": rapidApiKey,
      },
      body: audio,
    });
    const rawText = await response.text();
    if (!response.ok) return res.status(502).json({ error: "Shazam API fout: " + response.status, detail: rawText });
    res.json(JSON.parse(rawText));
  } catch (error) {
    console.error("Shazam fout:", error);
    res.status(500).json({ error: "Er ging iets mis" });
  }
});

router.post("/playlist/add-song", async (req, res) => {
  const { playlistId, trackId } = req.body;
  const accessToken = res.locals.spotifyToken;
  const userId = req.session.user?._id;
  if (!userId) return res.status(401).json({ error: "Niet ingelogd" });
  try {
    let songId: ObjectId;
    if (trackId.startsWith("db_")) {
      songId = new ObjectId(trackId.replace("db_", ""));
    } else {
      const track = await GetTrackSpotify(accessToken, trackId);
      const createdId = await CreateSong(track);
      if (!createdId) return res.status(401).json({ error: "geen song" });
      songId = createdId;
    }
    await playlistCollection.updateOne({ _id: new ObjectId(playlistId), userId: new ObjectId(userId) }, { $addToSet: { songs: songId } });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: "Er ging iets mis" });
  }
});

router.get("/playlists", async (req, res) => {
  const userId = req.session.user?._id;
  if (!userId) return res.status(401).json({ error: "Niet ingelogd" });
  const playlists = await GetPlaylists(userId);
  res.json(playlists);
});

//is voor songs gezeik
router.post("/songs/save", async (req, res) => {
  try {
    const songData: SpotifyTrack = req.body;
    const _id = await CreateSong(songData);

    if (!_id) return res.status(500).json({ error: "Opslaan mislukt" });

    res.json({ _id, ...songData });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Opslaan mislukt" });
  }
});

router.get("/song/:id/playable", async (req, res) => {
  const rawId = req.params.id;
  const userId = req.session.user?._id;
  let songId: ObjectId;
  let songName: string;
  let songArtist: string;

  if (ObjectId.isValid(rawId) && rawId.length === 24) {
    songId = new ObjectId(rawId);
    const songs = await GetSongsByIds(userId, [songId]);
    const song = songs[0];
    if (!song) return res.status(404).json({ error: "Song niet gevonden" });
    songName = song.name;
    songArtist = song.artists?.[0]?.name ?? "";
  } else {
    const accessToken = res.locals.spotifyToken;
    if (!accessToken) return res.status(401).json({ error: "Geen access token" });
    const spotifySong = await GetTrackSpotify(accessToken, rawId);
    if (!spotifySong) return res.status(404).json({ error: "Spotify song niet gevonden" });
    const insertedId = await CreateSong(spotifySong);
    if (!insertedId) return res.status(500).json({ error: "Song opslaan mislukt" });
    songId = insertedId;
    songName = spotifySong.name;
    //deze werkt wel
    songArtist = spotifySong.artists?.[0]?.name ?? "";
  }

  const existing = await songPlayableCollection.findOne({ songId });
  if (existing) return res.json(existing);
  await CreateSongPlayable(songId, songName, songArtist);
  const playable = await songPlayableCollection.findOne({ songId });
  res.json(playable);
});

router.post("/playlist/generate", async (req, res) => {
  const { stemming, aantal, mixtype } = req.body;
  const accessToken = res.locals.spotifyToken;
  try {
    const { success, suggestions, error } = await generatePlaylistSuggestions({ stemming, aantal: Number(aantal), mixtype });
    if (!success) return res.json({ success: false, error });
    const resolved = await searchTracks(suggestions, accessToken);
    // @ts-ignore
    const tracks = resolved.map(({ suggestion, result }) => ({
      id: result?.id ?? null,
      name: result?.name ?? suggestion.title,
      artist: result?.artists?.[0]?.name ?? suggestion.artist,
      artist_id: result?.artists?.[0]?.id ?? null,
      artists: result?.artists ?? [],
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
          ? t.artists.map((a: any) => ({ id: a.id, name: a.name, href: a.href ?? "", uri: a.uri ?? "", type: "artist" as const, createdAt: new Date(), updatedAt: new Date() }))
          : [{ id: t.artist_id ?? t.id + "_artist", name: t.artist, href: "", uri: "", type: "artist" as const, createdAt: new Date(), updatedAt: new Date() }],
        album: {
          id: t.album_id ?? t.id + "_album",
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
    const playlist = await createPlaylist(new ObjectId(userId), name, `AI gegenereerd · ${stemming} · ${mixtype}`, coverFilename, songIds);
    res.json({ success: true, playlist });
  } catch (err) {
    res.json({ success: false, error: (err as Error).message });
  }
});

// ─── GAME ROUTES ──────────────────────────────────────────────────────────────

// POST /api/game/session
router.post("/game/session", async (req, res) => {
  const userId = req.session.user?._id;
  if (!userId) return res.status(401).json({ error: "Niet ingelogd" });
  try {
    const result = await gameSessionCollection.insertOne({
      userId: new ObjectId(userId),
      score: 0,
      total: 0,
      streak: 0,
      startedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return res.json({ sessionId: result.insertedId });
  } catch (e) {
    console.error("game/session error:", e);
    return res.status(500).json({ error: "Er ging iets mis" });
  }
});

// GET /api/game/round
router.get("/game/round", async (req, res) => {
  const userId = req.session.user?._id;
  if (!userId) return res.status(401).json({ error: "Niet ingelogd" });
  try {
    const songs = await spotifySongCollection.aggregate([{ $sample: { size: 1 } }, { $lookup: { from: "artisten", localField: "artist_ids", foreignField: "_id", as: "artists" } }]).toArray();

    const song = songs[0];
    if (!song) return res.status(404).json({ error: "Geen nummers gevonden" });

    const artiest = song.artists?.[0]?.name ?? "Onbekend";

    let playable = await songPlayableCollection.findOne({ songId: song._id });
    if (!playable) {
      await CreateSongPlayable(song._id, song.name, artiest, song.preview_url ?? undefined);
      playable = await songPlayableCollection.findOne({ songId: song._id });
    }
    if (!playable?.youtubeId) return res.status(404).json({ error: "Geen YouTube video gevonden" });

    const wrongSongs = await spotifySongCollection
      .aggregate([{ $match: { _id: { $ne: song._id } } }, { $sample: { size: 3 } }, { $lookup: { from: "artisten", localField: "artist_ids", foreignField: "_id", as: "artists" } }])
      .toArray();

    const options = [{ name: song.name, artist: artiest, correct: true }, ...wrongSongs.map((s) => ({ name: s.name, artist: s.artists?.[0]?.name ?? "Onbekend", correct: false }))].sort(
      () => Math.random() - 0.5,
    );

    return res.json({ songId: song._id, youtubeId: playable.youtubeId, correctAnswer: song.name, artiest, options });
  } catch (e) {
    console.error("game/round error:", e);
    return res.status(500).json({ error: "Er ging iets mis" });
  }
});

// POST /api/game/guess
router.post("/game/guess", async (req, res) => {
  const userId = req.session.user?._id;
  if (!userId) return res.status(401).json({ error: "Niet ingelogd" });
  const { sessionId, songId, guess, timeMs } = req.body;
  if (!sessionId || !songId || !guess) return res.status(400).json({ error: "sessionId, songId en guess zijn verplicht" });
  try {
    const song = await spotifySongCollection.findOne({ _id: new ObjectId(songId) });
    if (!song) return res.status(404).json({ error: "Nummer niet gevonden" });

    const correct = song.name.toLowerCase().trim() === guess.toLowerCase().trim();

    await guessCollection.insertOne({
      sessionId: new ObjectId(sessionId),
      songId: new ObjectId(songId),
      guessedName: guess,
      correct,
      timeMs: timeMs ?? undefined,
      createdAt: new Date(),
    });

    const session = await gameSessionCollection.findOne({ _id: new ObjectId(sessionId) });
    const nieuweStreak = correct ? (session?.streak ?? 0) + 1 : 0;

    await gameSessionCollection.updateOne({ _id: new ObjectId(sessionId) }, { $inc: { total: 1, score: correct ? 1 : 0 }, $set: { streak: nieuweStreak, updatedAt: new Date() } });

    return res.json({ correct, correctAnswer: song.name });
  } catch (e) {
    console.error("game/guess error:", e);
    return res.status(500).json({ error: "Er ging iets mis" });
  }
});

// POST /api/game/session/end
router.post("/game/session/end", async (req, res) => {
  const userId = req.session.user?._id;
  if (!userId) return res.status(401).json({ error: "Niet ingelogd" });
  const { sessionId, score, total, streak } = req.body;
  if (!sessionId) return res.status(400).json({ error: "sessionId is verplicht" });
  try {
    await gameSessionCollection.updateOne({ _id: new ObjectId(sessionId) }, { $set: { score, total, streak, endedAt: new Date(), updatedAt: new Date() } });
    await userCollection.updateOne({ _id: new ObjectId(userId) }, { $inc: { totalScore: score, gamesPlayed: 1 }, $max: { bestStreak: streak }, $set: { updatedAt: new Date() } });
    return res.json({ success: true });
  } catch (e) {
    console.error("game/session/end error:", e);
    return res.status(500).json({ error: "Er ging iets mis" });
  }
});

//favoriet
//moet voor spotify voegen
router.post("/song/:id/favorite", async (req, res) => {
  const userId = req.session.user?._id;
  if (!userId) return res.status(401).json({ error: "Niet ingelogd" });

  const rawId = req.params.id;
  const isSpotify = req.body.isSpotify ?? false;
  let songId: ObjectId;

  if (isSpotify) {
    const accessToken = res.locals.spotifyToken;
    if (!accessToken) return res.status(401).json({ error: "Geen access token" });
    const spotifySong = await GetTrackSpotify(accessToken, rawId);
    if (!spotifySong) return res.status(404).json({ error: "Song niet gevonden" });
    const insertedId = await CreateSong(spotifySong);

    if (!insertedId) return res.status(500).json({ error: "Song opslaan mislukt" });
    songId = insertedId;
  } else {
    songId = new ObjectId(rawId);
  }

  const isFavorite = await ToggleFavorite(new ObjectId(userId), songId);
  res.json({ isFavorite });
});

export default router;
