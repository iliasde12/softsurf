import express, { Express } from "express";

const router = express.Router();

router.get("/", (req, res) => {
  res.render("index", {
    title: "Hello World",
    message: "Hello World",
  });
});

module.exports = router;
