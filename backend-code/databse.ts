import bcrypt from "bcrypt";
import { Db, MongoClient, ObjectId } from "mongodb";
import {
  SpotifyTrack,
  Song,
  SpotifyExternalUrls,
  SpotifyArtist,
  SpotifyAlbum,
  SpotifyExternalIds,
  SpotifyImage,
  User
} from"./interfaces/index";

// Connection config MongoDB
const URI: string =
  "mongodb+srv://SoftSurfUser:softsurf990304@softsurf.pxq1kmm.mongodb.net/?appName=SoftSurf";
const client: MongoClient = new MongoClient(URI);
let connectionPromise: Promise<Db> | null = null;

export function connectDB(): Promise<Db> {
  if (!connectionPromise) {
    connectionPromise = client.connect().then(() => client.db("softsurf"));
  }
  return connectionPromise;
}

// Users functions

// Create
export async function createUser(
  username: string,
  email: string,
  password: string,
  image: string = "",
) {
  const db = await connectDB();
  const users = db.collection<User>("users");

  const existing = await users.findOne({ $or: [{ email }, { username }] });
  if (existing) throw new Error("E-mail of gebruikersnaam is al in gebruik");

  const now = new Date();
  return await users.insertOne({
    username,
    email,
    password: await bcrypt.hash(password, 12),
    image,
    createdAt: now,
    updatedAt:now,
  });
}

// Update
export async function updateUser(
  id: string,
  data: Partial<Omit<User, "createdAt">>,
) {
  const db = await connectDB();
  const users = db.collection<User>("users");

  if (data.password) {
    data.password = await bcrypt.hash(data.password, 12);
  }

  return await users.updateOne(
    { _id: new ObjectId(id) },
    { $set: { ...data, updatedAt: new Date() } },
  );
}

// FindByEmail
export async function findUserByEmail(email: string) {
  const db = await connectDB();
  return await db.collection<User>("users").findOne({ email });
}

// FindByUsername
export async function findUserByUsername(username: string) {
  const db = await connectDB();
  return await db.collection<User>("users").findOne({ username });
}

// Delete User
export async function deleteUser(id: string) {
  const db = await connectDB();
  return await db
    .collection<User>("users")
    .deleteOne({ _id: new ObjectId(id) });
}


// Songs function 

// Create
export async function createSong(track: SpotifyTrack) {
  const db = await connectDB();
  const songs = db.collection<Song>("songs");

  const existing = await songs.findOne({ id: track.id });
  if (existing) throw new Error("Song bestaat al in de database");

  const now = new Date();
  return await songs.insertOne({
    ...track,
    //null is test maar moet later geupdate worden door een mood 
    mood: null,
    createdAt: now,
    updatedAt: now,
  });
}


// SongById
export async function findSongBySpotifyId(spotifyId: string) {
  const db = await connectDB();
  const song = await db.collection<Song>("songs").findOne({ id: spotifyId });
  if (!song) throw new Error("Song niet gevonden");
  return song;
}


// SongByArtist
export async function findSongsByArtist(artistName: string) {
  const db = await connectDB();
  return await db
    .collection<Song>("songs")
    .find({ "artists.name": artistName })
    .toArray();
}

// findBySongs
export async function findAllSongs() {
  const db = await connectDB();
  return await db.collection<Song>("songs").find().toArray();
}

// Update Song
export async function updateSong(
  id: string,
  data: Partial<Omit<Song, "createdAt" | "_id">>,
) {
  const db = await connectDB();
  return await db
    .collection<Song>("songs")
    .updateOne(
      { _id: new ObjectId(id) },
      { $set: { ...data, updatedAt: new Date() } },
    );
}

// Delete Song
export async function deleteSong(id: string) {
  const db = await connectDB();
  return await db
    .collection<Song>("songs")
    .deleteOne({ _id: new ObjectId(id) });
}






