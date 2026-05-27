// middleware/spotifyMiddleware.ts
import { Request, Response, NextFunction } from "express";
import { RefreshSpotifyToken } from "../helpers/spotify";

export async function spotifyMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.session.user?._id) return next();

    const accessToken = await RefreshSpotifyToken(req.session.user._id);

    if (accessToken) {
      res.locals.spotifyToken = accessToken; // beschikbaar in alle routes
    }

    next();
  } catch (e) {
    console.error("spotifyMiddleware error:", e);
    next();
  }
}