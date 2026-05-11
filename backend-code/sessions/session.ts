import session from "express-session";
import MongoStore from "connect-mongo";
import { MONGODB_URI } from "../database/database";
import { User } from "../interfaces";

declare module "express-session" {
  interface SessionData {
    user?: User;
  }
}


//console.log(process.env.SESSION_SECRET);

export default session({
  secret:
    process.env.SESSION_SECRET ?? "",
    store: MongoStore.create({
    mongoUrl: MONGODB_URI,
    dbName: "softsurf",
    collectionName: "sessions",
    //is het geen json string maar een object
    stringify: false,
  }),
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
});
