import express, { Router } from "express";
import { secureMiddleware } from "../secureMiddleware";

const router: Router = express.Router();
router.use(secureMiddleware);

router.get("/playlist",(req, res) => {
  res.render("playlist", { user: req.session.user });
});

router.get("/account", (req, res) => {
  res.render("account", { user: req.session.user });
});

router.get("/collectie", (req, res) => {
  res.render("collectie", { user: req.session.user });
});


router.get("/mood", (req, res) => {
  res.render("mood");
});

router.get("/vergelijken-artiesten",(req,res)=>{
   res.render("vergelijken-artisten");
})

router.get("/vergelijken-nummers",(req,res)=>{
   res.render("vergelijken-nummers");
})

router.get("/guessthesong",(req,res)=>{
   res.render("guessthesong");
})


router.get("/search",(req,res)=>{
   res.render("search");
})


module.exports = router;
