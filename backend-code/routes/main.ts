import express, { Router } from "express";
import { User } from "../interfaces"
import { login } from "../database/database"
import { avatars } from "../interfaces/avatars";
import { createUser } from "../database/database"

 

const router: Router = express.Router();

router.get("/", (req, res) => {
  res.render("index");
});


router.get("/login", (req, res) => {
  res.render("login",{error : ""});
});

router.post("/login", async (req, res) => {
    const email: string = req.body.email;
    const password: string = req.body.password;

    if (!email || !password) {
        return res.render("login", { error: "Vul alle velden in" });
    }

    try {
        let user: User = await login(email, password);
        delete (user as any).password; // netter dan @ts-ignore
        req.session.user = user;
        res.redirect("/playlist");
    } catch (e: any) {
        res.render("login", { error: "Email of wachtwoord incorrect" });
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
        return res.redirect("/login");
    } catch (e: any) {
        res.render("register", { avatars, error: e });
    }
});



export default router;