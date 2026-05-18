//ilias moet dit nog nakijken om zeker te zijn
//interfaces zijn niet 100%
//sommige waardes mogen null zijn hangt er van af wat doel nog is
import { ObjectId } from "mongodb";
import { Mood } from "./mood";

//interface moet geupdate worden


//user interface
//bespreking morgen voor stemming
export interface User {
  _id?: ObjectId;
  username: string;
  email: string;
  password: string;
  avatar: { url: string; alt: string };
  //mood?: Mood;
  createdAt: Date;
  updatedAt: Date;
  //is voor de puten bij te houden en hoeveel games je hebt gedaan
  totalScore: number;
  gamesPlayed: number;
  bestStreak: number;
}

//spotify token interface om te connecten met user
//belangrkijk voor connectie met spotify api
export interface SpotifySession {
  _id?: ObjectId;
  userId: ObjectId | undefined;
  accessToken: string; // 1 uur geldig na 1 uur wordt geudate
  refreshToken: string; // onbeperkt en wordt soms ook geupdate
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

/*export interface SpotifyExternalUrls {
  spotify: string;
}*/

export interface SpotifyImage {
  url: string;
  // height en width zijn niet perse nodig was gewoon om de api na tebootsen
  //height: number;
  //width: number;
}

export interface SpotifyArtist {
  //external_urls: SpotifyExternalUrls;
  href: string;
  id: string;
  name: string;
  type: "artist";
  uri: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SpotifyAlbum {
  album_type: "single" | "album" | "compilation";
  total_tracks: number;
  //available_markets: string[];
  //external_urls: SpotifyExternalUrls;
  href: string;
  id: string;
  images: SpotifyImage[];
  name: string;
  release_date: string;
  release_date_precision: "day" | "month" | "year";
  type: "album";
  uri: string;
  artist_ids?: ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

/*export interface SpotifyExternalIds {
  isrc?: string;
  ean?: string;
  upc?: string;
}*/

export interface SpotifyTrack {
  album: SpotifyAlbum;
  artists: SpotifyArtist[];
  //available_markets: string[];
  disc_number: number;
  duration_ms: number;
  explicit: boolean;
  href: string;
  id: string;
  name: string;
  popularity: number;
  preview_url: string | null;
  track_number: number;
  type: "track";
  uri: string;
  //is_local: boolean;
}

//neemt alle fields van de spotify track maar voegt er een mongodb aan toe en mood zodat het lokaal kan werken
export interface Song {
  _id?: ObjectId;
  album_id?: ObjectId;      // referentie naar album collection
  artist_ids?: ObjectId[];  // referentie naar artists collection
  id: string;
  name: string;
  duration_ms: number;
  explicit: boolean;
  popularity: number;
  preview_url: string | null;
  track_number: number;
  disc_number: number;
  href: string;
  uri: string;
  type: "track";
  createdAt: Date;
  updatedAt: Date;
}

//inverband met user kan die eigen mood voegen aan de song en niet dat elke user elke mood veranderd
export interface UserSong {
  _id?: ObjectId ;
  userId: ObjectId;
  songId: ObjectId ;
  mood: number | null;
  createdAt: Date;
  updatedAt: Date;
}

//playlist van databank
export interface Playlist {
  _id?: ObjectId;
  userId: ObjectId;
  name: string;
  description?: string;
  songs?: ObjectId[];
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
}

//playbale song
export interface SongPlayable {
  _id?: ObjectId;
  songId: ObjectId;
  youtubeId: string | null;
  previewUrl: string | null;
  source: "youtube" | "spotify_preview";
  createdAt: Date;
}

//playlist spotify
export interface SpotifyPlaylist {
  id: string;
  name: string;
  description: string;
  images: { url: string }[];
  tracks: { total: number };
  owner: { display_name: string };
  external_urls: { spotify: string };
}

//playlistRequest voor claude genereren
export interface PlaylistRequest {
  stemming: string;
  aantal: number;
  mixtype: string;
}

//song suggesties
export interface TrackSuggestion {
  title: string;
  artist: string;
}
//response claude
export interface ClaudePlaylistResponse {
  success: boolean;
  suggestions: TrackSuggestion[];
  error?: string;
}

//raad de game is voor de session bij te houden
export interface GameSession {
  _id?: ObjectId;
  userId: ObjectId;           // → users
  playlistId?: ObjectId;      // optioneel, welke playlist
  score: number;              // "7 goed"
  total: number;              // "12 totaal"
  streak: number;             // "3 reeks"
  startedAt: Date;
  endedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}


//data van wat je hebt geguest
export interface Guess {
  _id?: ObjectId;
  sessionId: ObjectId;        // → game_sessions
  songId: ObjectId;           // → songs
  guessedName: string;        // wat de speler typte
  correct: boolean;
  timeMs?: number;            // hoe snel geraden
  createdAt: Date;
}

//houdt data bij van de round
export interface CurrentRound {
  _id?: ObjectId;
  sessionId: ObjectId;      // → game_sessions
  songId: ObjectId;         // → songs (het juiste antwoord)
  roundNumber: number;      // hoeveelste nummer in de sessie
  previewUrl: string;       // Spotify preview URL (30 sec)
  options: string[];        // 3 foute + 1 juiste optie voor meerkeuze
  startedAt: Date;
  answeredAt?: Date;
}