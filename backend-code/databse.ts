import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import bcrypt from "bcrypt-ts";

dotenv.config();

//later moet dit naar env voor securty
const URI: string =
  "mongodb+srv://SoftSurfUser:softsurf990304@softsurf.pxq1kmm.mongodb.net/?appName=SoftSurf";
const client: MongoClient = new MongoClient(URI);

/*async function main() {
  try {
    await client.connect();

   
  } catch (e) {
    console.error(e);
  } finally {
    await client.close();
  }
}*/
let isConnected = false;

export async function connectDB() {
  if (!isConnected) {
    await client.connect();
    isConnected = true;
  }
  return client.db("softsurf");
}

//create user
export async function CreateUser(
  username: string,
  email: string,
  password: string,
) {
  const db = await connectDB();
  const users = db.collection("users");

  return await users.insertOne({
    username,
    email,
    password,
  });
}

//update user
