import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

//later moet dit naar env voor securty
const URI: string =
  "mongodb+srv://SoftSurfUser:softsurf990304@softsurf.pxq1kmm.mongodb.net/?appName=SoftSurf";
const client: MongoClient = new MongoClient(URI);
