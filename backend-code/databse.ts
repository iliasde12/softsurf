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






