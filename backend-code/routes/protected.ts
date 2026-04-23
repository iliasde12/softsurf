import express, { Router } from "express";

const router: Router = express.Router();

/*router.get("/mood", (req, res) => {
  res.render("index");
});*/

router.get("/playlist", (req, res) => {
  res.render("playlist");
});



module.exports = router;
