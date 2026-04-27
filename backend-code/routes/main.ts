import express, { Router } from "express";
import { User } from "../interfaces"
import { login } from "../database"
import { avatars } from "../interfaces/avatars";
import { createUser } from "../database"

 

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
  res.render("register",{avatars,error : ""});
});


router.post("/register", async (req, res) => {

    const { username, email, password, avatar } = req.body;

    // validatie
    if (!username || username.length < 3) {
        return res.render("register", { avatars, error: "Gebruikersnaam moet minimaal 3 karakters zijn" });
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.render("register", { avatars, error: "Voer een geldig email adres in" });
    }
    if (!password || password.length < 8) {
        return res.render("register", { avatars, error: "Wachtwoord moet minimaal 8 karakters zijn" });
    }
    if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/\d/.test(password)) {
        return res.render("register", { avatars, error: "Wachtwoord moet hoofdletters, kleine letters en cijfers bevatten" });
    }

    const validAvatar = avatars.find(a => a.url === avatar);

    if (!validAvatar) {
        return res.render("register", { avatars, error: "Ongeldige avatar" });
    }

    try {
        await createUser(username, email, password, validAvatar);
        return res.render("/login", {error: "account aangemaakt je kan nu inloggen"});
    } catch (e: any) {
        res.render("register", { avatars, error: e });
    }
});



module.exports = router;
