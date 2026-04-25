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

//user functions
export const userCollection = client.db("login-express").collection<User>("users");

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

// Songs function 







