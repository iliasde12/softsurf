import express, { Express } from "express";
import dotenv from "dotenv";
import path from "path";
import { connect } from "./database/database";
import session from "./sessions/session";
import mainRoutes from "./routes/main";
import protectedRoutes from "./routes/protected";
import apiRoutes from "./routes/api";
//middleware
import { spotifyMiddleware } from "./middleware/spotifyMiddleware";
import { secureMiddleware } from "./middleware/secureMiddleware";

dotenv.config();

const app: Express = express();
app.set("view engine", "ejs");

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.set("views", path.join(__dirname, "views"));
app.use(session);
app.set("port", process.env.PORT || 3000);

//routes voegen
app.use(mainRoutes);
//kan cors voegen voor zekerheid
//beide zijn beschermd dus ze moeten ingelogd zijn en acces token komt ook vrij als ze het hebben
app.use(secureMiddleware, spotifyMiddleware, protectedRoutes);
app.use("/api", secureMiddleware, spotifyMiddleware, apiRoutes);



app.listen(app.get("port"), async () => {
  try {
    await connect();
    console.log("Server started on http://localhost:" + app.get("port"));
  } catch (e) {
    console.log(e);
    process.exit(1);
  }
});
