import { Db, MongoClient, ObjectId } from "mongodb";
import {
  SpotifyTrack,
  Song,
  SpotifyArtist,
  SpotifyAlbum,
  SpotifyImage,
  SpotifySession,
  User,
} from "../interfaces/index";

import bcrypt from "bcrypt";
const saltRounds: number = 10;
const now: Date = new Date();

// Connection config MongoDB
export const MONGODB_URI: string =
  "mongodb+srv://SoftSurfUser:softsurf990304@softsurf.pxq1kmm.mongodb.net/?appName=SoftSurf";
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

// songs
export const spotifySongCollection = db.collection<Song>("songs");
export const spotifyAlbumCollection = db.collection<SpotifyAlbum>("ablums");
export const spotifyArtistCollection = db.collection<SpotifyArtist>("artisten");

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
    await userCollection.insertOne({
      username: username,
      email: email,
      password: await bcrypt.hash(password, saltRounds),
      avatar: avatar,
      createdAt: now,
      updatedAt: now,
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
export async function CreateSong(songData: Omit<Song, "_id">): Promise<ObjectId | null> {
  try {

    for (const artist of songData.artists) {
      await CreateArtist(artist);
    }
    await CreateAlbum(songData.album);

    // Check eerst of song al bestaat
    const existing = await spotifySongCollection.findOne({ id: songData.id });

    if (existing) {
      return existing._id!;
    }

    // Bestaat niet, insert
    const result = await spotifySongCollection.insertOne({
      ...songData,
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

    if (existing) {
      return existing._id!;
    }

    const result = await spotifyAlbumCollection.insertOne({
      ...albumData,
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