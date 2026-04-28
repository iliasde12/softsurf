// helpers/spotify.ts
import { GetSpotifyToken,spotifyTokenColletion,CreateSong } from "../database/database";
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

//api call voor playlist
export async function GetPlaylistSongs(accessToken: string, playlistId: string) {
  try {
    const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/`, {
  headers: { 
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  },
});

    const data = await response.json();
    //console.log(data);
    //console.log("Playlist:", data.items);
 
    console.log("FULL DATA:", JSON.stringify(data, null, 2));
    
    //console.log('data: ' + data.items.items);
    return data.items.items;
  } catch (e) {
    console.error("GetPlaylistSongs error:", e);
    return null;
  }
}
