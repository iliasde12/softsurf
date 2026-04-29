// helpers/spotify.ts
import { GetSpotifyToken,spotifyTokenColletion,CreateSong } from "../database/database";
import { SpotifyTrack  } from "../interfaces"
import { ObjectId } from "mongodb";


export async function RefreshSpotifyToken(userId: ObjectId): Promise<string | null> {
  try {
    const tokenDoc = await GetSpotifyToken(userId);

    if (!tokenDoc) return null;

    // Check of token nog geldig is
    if (tokenDoc.expiresAt > new Date()) {
      return tokenDoc.accessToken; // nog geldig, gewoon teruggeven
    }

    // Token verlopen, refresh via Spotify API
    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(
          `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
        ).toString("base64")}`,
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: tokenDoc.refreshToken,
      }),
    });

    const data = await response.json();

    // Update token in database
    await spotifyTokenColletion.updateOne(
      { userId },
      {
        $set: {
          accessToken: data.access_token,
          expiresAt: new Date(Date.now() + data.expires_in * 1000),
          updatedAt: new Date(),
        },
      }
    );

    return data.access_token;
  } catch (e) {
    console.error("RefreshSpotifyToken error:", e);
    return null;
  }
}

//api call voor playlists
export async function GetPlaylists(accessToken: string) {
  try {
    const response = await fetch(`https://api.spotify.com/v1/me/playlists`, {
  headers: { 
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  },
});

    const data = await response.json();
    //console.log("FULL DATA:", JSON.stringify(data, null, 2));
    //console.log('data: ' + data.items.items);
    return data.items;
  } catch (e) {
    console.error("GetPlaylistSongs error:", e);
    return null;
  }
}


//api call voor playlist song
export async function GetPlaylistSongs(accessToken: string, playlistId: string) {
  try {
    //limit van 50 songs
    const response = await fetch(
        `https://api.spotify.com/v1/playlists/${playlistId}/items`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
    );

    const data = await response.json();
    console.log("STATUS:", response.status);
    console.log("FULL DATA:", JSON.stringify(data, null, 2));
    return data.items;
  } catch (e) {
    console.error("GetPlaylistSongs error:", e);
    return null;
  }
}

//api call voor 1 playlist
export async function GetPlaylist(accessToken: string, playlistId: string) {
  try {
    const response = await fetch(
      `https://api.spotify.com/v1/playlists/${playlistId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();
    return data;
  } catch (e) {
    console.error("GetPlaylist error:", e);
    return null;
  }
}

//api call voor user van spotify
export async function GetCurrentUser(accessToken: string) {
  try {
    const response = await fetch(`https://api.spotify.com/v1/me`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();
    return data;
  } catch (e) {
    console.error("GetCurrentUser error:", e);
    return null;
  }
}

//api call en songs opslagen
export async function savePlaylistSongs(tracks: SpotifyTrack[]): Promise<void> {
  await Promise.all(tracks.map(track => CreateSong(track)));
}