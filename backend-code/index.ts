import express, { Express } from "express";
import dotenv from "dotenv";
import path from "path";
import { MongoClient } from "mongodb";

dotenv.config();

const app: Express = express();
//later moet dit naar env voor securty
const URI: string =
  "mongodb+srv://SoftSurfUser:softsurf990304@softsurf.pxq1kmm.mongodb.net/?appName=SoftSurf";
const client: MongoClient = new MongoClient(URI);

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.set("views", path.join(__dirname, "views"));

app.set("port", process.env.PORT || 3000);

//import routes
const mainRoutes = require("./routes/main");

//routes voegen
app.use("/", mainRoutes);

/*app.get("/", (req, res) => {
  res.render("index", {
    title: "Hello World",
    message: "Hello World",
  });
});*/

app.listen(app.get("port"), () => {
  console.log("Server started on http://localhost:" + app.get("port"));
});
