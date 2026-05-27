import { NextFunction, Request, Response } from "express";

export function secureMiddleware(req: Request, res: Response, next: NextFunction) {
    if (req.session.user) {
        res.locals.user = req.session.user;
        //stuurt dan paths mee
        res.locals.currentPath = req.path;
        next();
    } else {
        res.redirect("/login");
    }
};