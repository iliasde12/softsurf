import express, { Express } from "express";
import dotenv from "dotenv";
import path from "path";
import { connect } from "./database/database";
import session from "./sessions/session";
import mainRoutes from "./routes/main";
import protectedRoutes from "./routes/protected";

dotenv.config();

const app: Express = express();
app.set("view engine", "ejs");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.set("views", path.join(__dirname, "views"));
app.use(session);
app.set("port", process.env.PORT || 3000);

//routes voegen
app.use(mainRoutes);
app.use(protectedRoutes);

app.listen(app.get("port"), async () => {
  try {
    await connect();
    console.log("Server started on http://localhost:" + app.get("port"));
  } catch (e) {
    console.log(e);
    process.exit(1);
  }
});
