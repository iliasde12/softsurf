import express, { Router } from "express";
import { User } from "../interfaces"
import { login } from "../database"
import { avatars } from "../interfaces/avatars";
 

const router: Router = express.Router();

router.get("/", (req, res) => {
  res.render("index");
});


router.get("/login", (req, res) => {
  res.render("login",{error : ""});
});

router.post("/login", async(req, res) => {
    const email : string = req.body.email;
    const password : string = req.body.password;
    try {
      //returnd een user
        let user : User = await login(email, password);
        // @ts-ignore
        delete user.password;
        req.session.user = user;
        res.redirect("/playlist")
    } catch (e : any) {
        res.render("login",{error : "email or password incorrect"});
    }
});

router.post("/logout", async(req, res) => {
    req.session.destroy(() => {
        res.redirect("/login");
    });
});

router.get("/register", (req, res) => {
  res.render("register",{avatars});
});


router.post("/register", (req, res) => {
  res.render("register",{avatars});
});


module.exports = router;
