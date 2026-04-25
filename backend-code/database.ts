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

import bcrypt from "bcrypt";
const saltRounds : number = 10;
const now : Date = new Date();

// Connection config MongoDB
export const MONGODB_URI : string = "mongodb+srv://SoftSurfUser:softsurf990304@softsurf.pxq1kmm.mongodb.net/?appName=SoftSurf";
const client: MongoClient = new MongoClient(MONGODB_URI);

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
export const userCollection = client.db("softsurf").collection<User>("users");


export async function createUser(username:string,email:string,password:string,avatar:string) {

    await userCollection.insertOne({
        username:username,
        email: email,
        password: await bcrypt.hash(password, saltRounds),
        avatar:avatar,
        createdAt: now,
        updatedAt: now,
    });
}

export async function login(email: string, password: string) {
    if (email === "" || password === "") {
        throw new Error("Email and password required");
    }

    let user : User | null = await userCollection.findOne<User>({email: email});

    if (user) {
        if (await bcrypt.compare(password, user.password!)) {
            return user;
        } else {
            throw new Error("Password incorrect");
        }
    } else {
        throw new Error("User not found");
    }
}