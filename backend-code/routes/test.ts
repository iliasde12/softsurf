import express, { Router } from "express";

const router: Router = express.Router();

router.get("/", (req, res) => {
  res.render("index", {
    title: "Hello World",
    message: "Hello World",
  });
});

module.exports = router;
