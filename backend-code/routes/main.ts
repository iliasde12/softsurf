import express, { Router } from "express";
import { User } from "../interfaces"
import { login } from "../database"
 

const router: Router = express.Router();

router.get("/", (req, res) => {
  res.render("index");
});


router.get("/login", (req, res) => {
  res.render("login");
});

router.post("/login", async(req, res) => {
    const email : string = req.body.email;
    const password : string = req.body.password;
    try {
      //returnd een user
        let user : User = await login(email, password);
        //delete de password uit de object
        delete user.password; 
        //zet de rest in de session 
        req.session.user = user;
        res.redirect("/")
    } catch (e : any) {
        res.redirect("/login");
    }
});

router.get("/register", (req, res) => {
  res.render("register");
});


module.exports = router;
