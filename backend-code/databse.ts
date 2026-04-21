import bcrypt from "bcrypt";
import { Db, MongoClient, ObjectId } from "mongodb";
import { User } from "./interfaces/index";

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
    updatedAt: now,
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
