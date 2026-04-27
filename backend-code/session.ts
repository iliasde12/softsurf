import session from "express-session";
import MongoStore from "connect-mongo";
import { MONGODB_URI } from "./database";
import { User } from "./interfaces";

declare module "express-session" {
    interface SessionData {
        user?: User;
    }
}

export default session({
    secret: process.env.SESSION_SECRET ?? "90ff518dca1ae21b582c4d072904e1632dea9f53fc761f21ef1b26c893b663c0",
    store: MongoStore.create({
        mongoUrl: MONGODB_URI,
        dbName: "softsurf",
        collectionName: "sessions",
    }),
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7,
    }
});