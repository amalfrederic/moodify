/**
 * POST /api/spotify-playlist
 * Returns Spotify recommended tracks based on mood
 */
export async function POST(req) {
  try {
    const { mood } = await req.json();

    // 1. Get Spotify access token from local route
    let access_token;
    try {
      const tokenRes = await fetch("http://localhost:3000/api/spotify-token");
      const tokenBody = await tokenRes.text();
      if (!tokenRes.ok) {
        console.error("Spotify token fetch failed:", tokenBody);
        return new Response(JSON.stringify({ error: "Failed to retrieve access token", details: tokenBody }), { status: tokenRes.status });
      }
      const tokenData = JSON.parse(tokenBody);
      access_token = tokenData.access_token;
      if (!access_token) {
        console.error("Spotify access token missing:", tokenBody);
        return new Response(JSON.stringify({ error: "Access token missing", details: tokenBody }), { status: 500 });
      }
      console.log("Spotify access token acquired (first 10 chars):", access_token.substring(0, 10));
    } catch (tokenErr) {
      console.error("Error fetching Spotify token:", tokenErr);
      return new Response(JSON.stringify({ error: "Error fetching Spotify token", details: tokenErr.message }), { status: 500 });
    }

    // 2. Map mood to valid Spotify seed genres with multiple fallback genres
    // Using official Spotify genres: https://developer.spotify.com/documentation/web-api/reference/#/operations/get-recommendations
    let seedGenres = [];
    const moodLower = mood.toLowerCase();

    if (moodLower.includes("sad") || moodLower.includes("melancholy")) {
      seedGenres = ["ambient", "acoustic", "chill"];
    } else if (moodLower.includes("happy") || moodLower.includes("joyful") || moodLower.includes("cheery")) {
      seedGenres = ["pop", "dance", "chill"];
    } else if (moodLower.includes("angry") || moodLower.includes("aggressive") || moodLower.includes("intense")) {
      seedGenres = ["rock", "metal", "edm"];
    } else {
      // Generic fallback genres
      seedGenres = ["pop", "chill", "acoustic"];
    }

    // Ensure seedGenres is never empty and only contains valid genres
    // (already ensured by above)

    // Convert array to comma-separated string (no URL encoding to avoid double encoding)
    const seedGenresParam = seedGenres.join(',');

    // 3. Fetch Spotify recommendations
    const SPOTIFY_API_URL = `https://api.spotify.com/v1/recommendations?seed_genres=${seedGenresParam}&limit=10`;
    console.log("Spotify request URL:", SPOTIFY_API_URL);

    try {
      const spotifyRes = await fetch(SPOTIFY_API_URL, { 
        headers: { 
          Authorization: `Bearer ${access_token}`,
          Accept: "application/json"
        } 
      });
      const responseText = await spotifyRes.text();

      console.log("Spotify response status:", spotifyRes.status, spotifyRes.statusText);
      console.log("Spotify raw response:", responseText);

      if (!spotifyRes.ok) {
        return new Response(JSON.stringify({ error: "Failed to get Spotify recommendations", details: responseText, status: spotifyRes.status, statusText: spotifyRes.statusText }), { status: spotifyRes.status });
      }

      let playlists;
      try {
        playlists = JSON.parse(responseText);
      } catch (parseErr) {
        console.error("Failed to parse Spotify response:", responseText, parseErr);
        return new Response(JSON.stringify({ error: "Failed to parse Spotify response", details: responseText }), { status: 500 });
      }

      return new Response(JSON.stringify({ tracks: Array.isArray(playlists.tracks) ? playlists.tracks : [] }), { status: 200 });

    } catch (spotifyErr) {
      console.error("Error calling Spotify recommendations:", spotifyErr);
      return new Response(JSON.stringify({ error: "Spotify recommendations request failed", details: spotifyErr.message }), { status: 500 });
    }

  } catch (err) {
    console.error("Spotify Playlist route failed:", err);
    return new Response(JSON.stringify({ error: "Failed to process Spotify request", details: err.message }), { status: 500 });
  }
}