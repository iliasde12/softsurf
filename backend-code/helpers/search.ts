import { searchSpotifyTracks } from "./spotify";
import { SearchSongs,GetSongs } from "../database/database";

export async function searchSongsDbSpotify(query: string, accessToken?: string) {
    const dbResults = query ? await SearchSongs(query) : await GetSongs(undefined);

    let spotifyTracks = [];
    if (accessToken) {
        spotifyTracks = await searchSpotifyTracks(query, accessToken);
    }

    return { fromDB: dbResults, fromSpotify: spotifyTracks };
}