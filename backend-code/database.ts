import { Db, MongoClient, ObjectId } from "mongodb";
import {
  SpotifyTrack,
  Song,
  SpotifyArtist,
  SpotifyAlbum,
  SpotifyImage,
  SpotifySession,
  User,
} from "./interfaces/index";

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
  userId: ObjectId,
  accesToken: string,
  refreshToken: string,
  expiresAt: Date,
) {
  try {
    const tokens = spotifyTokenColletion.insertOne({
      userId: userId,
      accessToken: accesToken,
      refreshToken: refreshToken,
      expiresAt: expiresAt,
      createdAt: now,
      updatedAt: now,
    });
  } catch (e) {
    console.log(e);
  }
}

// get spotify token
export async function GetSpotifyToken(userId: ObjectId) {
  try {
    //data
    const tokens = await spotifyTokenColletion.findOne({ userId: userId });
    //accestoken en refreshtoken
    const accestoken = tokens?.accessToken;
    const refreshToken = tokens?.refreshToken;
    //return tokens
    return { accestoken, refreshToken };
  } catch (e) {
    console.log(e);
  }
}

// create song
export async function CreateSong() {
  try {
    const song = await spotifySongCollection.insertOne({});
  } catch (e) {
    console.log(e);
  }
}

// create album
export async function CreateAlbum() {
  try {
    const album = await spotifyAlbumCollection.insertOne({});
  } catch (e) {
    console.log(e);
  }
}
// create artiest
export async function CreateArtist() {
  try {
    const album = await spotifyArtistCollection.insertOne({});
  } catch (e) {
    console.log(e);
  }
}
