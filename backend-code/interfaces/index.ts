//ilias moet dit nog nakijken om zeker te zijn
//interfaces zijn niet 100%
//sommige waardes mogen null zijn hangt er van af wat doel nog is
import { ObjectId } from "mongodb";

//enum in verband met de mood in de songs kan geupdate worden naar een eigen collection in mongodb
export type Mood = "happy" | "sad" | "energetic" | "chill" | "angry" | "romantic";

//user interface
export interface User {
  _id?: ObjectId;
  username: string;
  email: string;
  password: string;
  avatar: { url: string; alt: string };
  createdAt:Date;
  updatedAt:Date;
}

//spotify token interface om te connecten met user
//belangrkijk voor connectie met spotify api 
export interface SpotifySession {
  _id?: ObjectId;
  userId: ObjectId;           
  accessToken: string;  // 1 uur geldig na 1 uur wordt geudate
  refreshToken: string; // onbeperkt en wordt soms ook geupdate
  expiresAt: Date;            
  createdAt: Date;
  updatedAt: Date;
}

export interface SpotifyExternalUrls {
  spotify: string;
}

export interface SpotifyImage {
  url: string;
  // height en width zijn niet perse nodig was gewoon om de api na tebootsen
  //height: number;
  //width: number;
}



export interface SpotifyArtist {
  external_urls: SpotifyExternalUrls;
  href: string;
  id: string;
  name: string;
  type: "artist";
  uri: string;
}

export interface SpotifyAlbum {
  album_type: "single" | "album" | "compilation";
  total_tracks: number;
  available_markets: string[];
  external_urls: SpotifyExternalUrls;
  href: string;
  id: string;
  images: SpotifyImage[];
  name: string;
  release_date: string;
  release_date_precision: "day" | "month" | "year";
  type: "album";
  uri: string;
  artists: SpotifyArtist[];
}

export interface SpotifyExternalIds {
  isrc?: string;
  ean?: string;
  upc?: string;
}

export interface SpotifyTrack {
  album: SpotifyAlbum;
  artists: SpotifyArtist[];
  available_markets: string[];
  disc_number: number;
  duration_ms: number;
  explicit: boolean;
  external_ids: SpotifyExternalIds;
  external_urls: SpotifyExternalUrls;
  href: string;
  id: string;
  name: string;
  popularity: number;
  preview_url: string | null;
  track_number: number;
  type: "track";
  uri: string;
  is_local: boolean;
}

//neemt alle fields van de spotify track maar voegt er een mongodb aan toe en mood zodat het lokaal kan werken
export interface Song extends SpotifyTrack {
  _id?: ObjectId;
  mood: Mood | null;
  createdAt: Date;
  updatedAt: Date;
}
