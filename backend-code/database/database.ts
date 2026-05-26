import { MongoClient, ObjectId } from "mongodb";
import {
  SpotifyTrack,
  Song,
  SpotifyArtist,
  SpotifyAlbum,
  UserSong,
  SpotifySession,
  User,
  Playlist,
  SongPlayable,
  Guess,
  GameSession,
  AlbumDocument,
} from "../interfaces/index";

import bcrypt from "bcrypt";
import dotenv from 'dotenv';
import { SearchYouTube } from "../helpers/youtube";


const saltRounds: number = 10;
const now: Date = new Date();
dotenv.config();

//uri
//console.log(`MongoDB URI: ${process.env.MONGODB_URI}`);

// Connection config MongoDB
export const MONGODB_URI: string = process.env.MONGODB_URI ?? "";



const client: MongoClient = new MongoClient(MONGODB_URI);

//db connection
export const db = client.db("softsurf");

//exit function
async function exit() {
  try {
    await client.close();
    console.log("Disconnected from database");
  } catch (error) {
    console.error(error);
  }
  process.exit(0);
}

//connect function
export async function connect() {
  await client.connect();
  console.log("Connected to database");
  process.on("SIGINT", exit);
}

//users
export const userCollection = db.collection<User>("users");
export const spotifyTokenColletion =
  db.collection<SpotifySession>("SpotifySession");
export const userSongCollection = db.collection<UserSong>("userSongs");
// songs
export const spotifySongCollection = db.collection<Song>("songs");
export const spotifyAlbumCollection = db.collection<AlbumDocument>("albums");
export const spotifyArtistCollection = db.collection<SpotifyArtist>("artisten");
//song play
export const songPlayableCollection = db.collection<SongPlayable>("SongPlayable");
//playlist
export const playlistCollection = db.collection<Playlist>("playlists");
//game
export const gameSessionCollection = db.collection<GameSession>("game_sessions");
export const guessCollection = db.collection<Guess>("guesses");

// create users
export async function createUser(
  username: string,
  email: string,
  password: string,
  avatar: { url: string; alt: string },
) {
  //als de email al bestaat
  const existingUser = await userCollection.findOne({ email });
  if (existingUser) {
    throw new Error("Email is al in gebruik");
  }

  try {
    //alles op nul zetten als start bij game enzo
    await userCollection.insertOne({
      username: username,
      email: email,
      password: await bcrypt.hash(password, saltRounds),
      avatar: avatar,
      createdAt: now,
      updatedAt: now,
      //later gevoegd voor de game
      totalScore: 0,
      gamesPlayed: 0,
      bestStreak: 0,
    });
  } catch (e) {
    throw new Error("error: " + e);
  }
}

// update users
export async function editUser(
  username: string,
  email: string,
  password: string,
  avatar: { url: string; alt: string },
) {
  try {
  } catch (e) {
    console.log(e);
  }
}

// login user
export async function login(email: string, password: string): Promise<User> {
  if (email === "" || password === "") {
    throw new Error("Email and password required");
  }

  const user = await userCollection.findOne<User>({ email });

  if (!user) {
    throw new Error("User not found");
  }

  const passwordMatch = await bcrypt.compare(password, user.password!);
  if (!passwordMatch) {
    throw new Error("Password incorrect");
  }

  return user;
}

// create spotify token
export async function CreateSpotifyToken(
  userId: ObjectId | undefined,
  accessToken: string,
  refreshToken: string,
  expiresAt: Date,
): Promise<ObjectId | null> {

  if(userId == undefined){
     throw new Error("error er is geen userId");
  }
  
  try {
    const result = await spotifyTokenColletion.insertOne({ 
      userId: userId,
      accessToken: accessToken, 
      refreshToken: refreshToken,
      expiresAt: expiresAt,
      createdAt: now,
      updatedAt: now,
    });

    return result.insertedId;
  } catch (e) {
    console.error(e); 
    return null;
  }
}

// get spotify token
export async function GetSpotifyToken(userId: ObjectId | undefined) {
  if(userId == undefined){
     throw new Error("error er is geen userId");
  }
  try {
    const tokens = await spotifyTokenColletion.findOne({ userId: userId }); 

    if (!tokens) return null; 

    return tokens;
  } catch (e) {
    console.error(e);
    return null;
  }
}

// create song
export async function CreateSong(songData: SpotifyTrack): Promise<ObjectId | null> {
  try {
    const [artistIds, albumId] = await Promise.all([
      Promise.all(songData.artists.map(artist => CreateArtist(artist))),
      CreateAlbum(songData.album),
    ]);

    const existing = await spotifySongCollection.findOne({ id: songData.id });
    if (existing) {
      return existing._id!;
    }

    const { album, artists, ...trackData } = songData; //album en artists eruit

    const result = await spotifySongCollection.insertOne({
      ...trackData,
      album_id: albumId ?? undefined,
      artist_ids: artistIds.filter((id): id is ObjectId => id !== null),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return result.insertedId;
  } catch (e) {
    console.error("CreateSong error:", e);
    return null;
  }
}

// create album
export async function CreateAlbum(albumData: SpotifyAlbum): Promise<ObjectId | null> {
  try {
    const existing = await spotifyAlbumCollection.findOne({ id: albumData.id });
    if (existing) return existing._id!;

    // Artists aanmaken en IDs ophalen
    const artistIds = await Promise.all(
        albumData.artists.map(artist => CreateArtist(artist))
    );

    // Artists eruit destructuren
    const { artists, ...albumWithoutArtists } = albumData;

    const result = await spotifyAlbumCollection.insertOne({
      ...albumWithoutArtists,
      artist_ids: artistIds.filter((id): id is ObjectId => id !== null),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return result.insertedId;
  } catch (e) {
    console.error("CreateAlbum error:", e);
    return null;
  }
}
// create artist
export async function CreateArtist(artistData: SpotifyArtist): Promise<ObjectId | null> {
  try {
  
    const existing = await spotifyArtistCollection.findOne({ id: artistData.id });

    if (existing) {
      return existing._id!;
    }

    const result = await spotifyArtistCollection.insertOne({
      ...artistData,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return result.insertedId;
  } catch (e) {
    console.error("CreateArtist error:", e);
    return null;
  }
}


// get Songs uit mongb collection songs
export async function GetSongs(userId: ObjectId | undefined): Promise<any[]> {
  return await spotifySongCollection.aggregate([
    {
      $lookup: {
        from: "artisten",
        localField: "artist_ids",
        foreignField: "_id",
        as: "artists",
      },
    },
    {
      $lookup: {
        from: "albums",
        localField: "album_id",
        foreignField: "_id",
        as: "album",
      },
    },
    {
      $unwind: { path: "$album", preserveNullAndEmptyArrays: true },
    },
    {
      $lookup: {
        from: "userSongs",
        let: { songId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$songId", "$$songId"] },
                  { $eq: ["$userId", new ObjectId(userId)] }, // ← ObjectId hier
                ],
              },
            },
          },
        ],
        as: "userSong",
      },
    },
    {
      $unwind: { path: "$userSong", preserveNullAndEmptyArrays: true },
    },
  ]).toArray();
}

//get songs voor playlist page
export async function GetSongsByIds(userId: ObjectId | undefined, songIds: ObjectId[]): Promise<any[]> {
  return await spotifySongCollection.aggregate([
    {
      $match: { _id: { $in: songIds } }
    },
    {
      $lookup: {
        from: "artisten",  //geupdate
        localField: "artist_ids",
        foreignField: "_id",
        as: "artists",
      },
    },
    {
      $lookup: {
        from: "albums",
        localField: "album_id",
        foreignField: "_id",
        as: "album",
      },
    },
    {
      $unwind: { path: "$album", preserveNullAndEmptyArrays: true },
    },
    {
      $lookup: {
        from: "userSongs",
        let: { songId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$songId", "$$songId"] },
                  { $eq: ["$userId", new ObjectId(userId)] },
                ],
              },
            },
          },
        ],
        as: "userSong",
      },
    },
    {
      $unwind: { path: "$userSong", preserveNullAndEmptyArrays: true },
    },
  ]).toArray();
}
// update mood  voor elke user is her anders 
export async function UpdateSongMood(userId: ObjectId | undefined, songId: string, mood: number | null): Promise<boolean> {
  try {
    const result = await userSongCollection.updateOne(
      { userId: userId, songId: new ObjectId(songId) },
      { $set: { mood, updatedAt: new Date() } },
      { upsert: true }
    );
    return result.modifiedCount === 1 || result.upsertedCount === 1;
  } catch (e) {
    console.error("UpdateSongMood error:", e);
    return false;
  }
}

// zoek songs aan de hand van moods
export async function GetSongsByMood(userId: ObjectId | undefined): Promise<any> {
  const userSongs = await userSongCollection.find({ 
    userId: userId
  }).toArray();

  const result: Record<number, any[]> = {};

  for (const userSong of userSongs) {
    if (userSong.mood === null) continue;

    const song = await spotifySongCollection.aggregate([
      { $match: { _id: userSong.songId } },
      {
        $lookup: {
          from: "artists",
          localField: "artist_ids",
          foreignField: "_id",
          as: "artists",
        },
      },
      {
        $lookup: {
          from: "albums",
          localField: "album_id",
          foreignField: "_id",
          as: "album",
        },
      },
      { $unwind: { path: "$album", preserveNullAndEmptyArrays: true } },
    ]).toArray();

    if (!result[userSong.mood]) result[userSong.mood] = [];
    result[userSong.mood].push(song[0]);
  }

  return result;
}
//search songs
export async function SearchSongs(query: string): Promise<any[]> {
  return await spotifySongCollection.aggregate([
    {
      $match: {
        name: { $regex: query, $options: "i" }
      }
    },
    {
      $lookup: {
        from: "artists",
        localField: "artist_ids",
        foreignField: "_id",
        as: "artists",
      },
    },
    {
      $lookup: {
        from: "albums",
        localField: "album_id",
        foreignField: "_id",
        as: "album",
      },
    },
    {
      $unwind: { path: "$album", preserveNullAndEmptyArrays: true },
    },
  ]).toArray();
}


//create playlist
export async function createPlaylist(userId: ObjectId, name: string, description?: string, image?:string,  songs?: ObjectId[]): Promise<Playlist> {
  const playlist: Playlist = {
    userId,
    name,
    description,
    songs: songs || undefined,
    image: image || null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const result = await playlistCollection.insertOne(playlist);
  return { _id: result.insertedId, ...playlist };
}

//alle playlisten uit db aan de hand van userid
export async function GetPlaylists(userId: ObjectId): Promise<Playlist[]> {
  return await playlistCollection.find({ userId }).toArray();
}

//aan de hand van id van afspeellijst en userid zodat niet iedereen er in kan
export async function GetPlaylistById(id: ObjectId, userId: ObjectId): Promise<Playlist | null> {
  return await playlistCollection.findOne({ _id: id, userId });
}

//create songpalyable
export async function CreateSongPlayable(songId: ObjectId, songName: string, artistName: string, previewUrl?: string): Promise<void> {
  const existing = await songPlayableCollection.findOne({ songId });
  if (existing) return;

  const youtubeId = await SearchYouTube(`${songName} ${artistName}`);

  console.log('zoeken op youtube:', `${songName} ${artistName}`);

  await songPlayableCollection.insertOne({
    songId,
    youtubeId,
    previewUrl: previewUrl ?? null,
    source: youtubeId ? "youtube" : "spotify_preview",
    createdAt: new Date()
  });

}

//dit is favorite
export async function ToggleFavorite(userId: ObjectId, songId: ObjectId): Promise<boolean> {
  const existing = await userSongCollection.findOne({ userId, songId });

  const newValue = !(existing?.isFavorite ?? false);

  await userSongCollection.updateOne(
      { userId, songId },
      {
        $set: { isFavorite: newValue, updatedAt: new Date() },
        $setOnInsert: { mood: null, createdAt: new Date() }
      },
      { upsert: true }
  );

  return newValue;
}

//krijg favoriete
export async function GetFavorites(userId: ObjectId): Promise<any[]> {
  const favorites = await userSongCollection.find({ userId, isFavorite: true }).toArray();
  const songIds = favorites.map(f => f.songId);
  return await GetSongsByIds(userId, songIds);
}