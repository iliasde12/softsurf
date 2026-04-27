import express, { Router } from "express";
import { secureMiddleware } from "../secureMiddleware";

const router: Router = express.Router();

/*router.get("/mood", (req, res) => {
  res.render("index");
});*/

router.get("/playlist",secureMiddleware, (req, res) => {
  res.render("playlist", { user: req.session.user });
});



module.exports = router;
