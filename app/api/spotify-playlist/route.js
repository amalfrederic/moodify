/**
 * Spotify Playlist Route
 * POST /api/spotify-playlist
 * Returns Spotify recommended tracks based on mood
 */
export async function POST(req) {
  try {
    const { mood } = await req.json();
    console.log("Requesting Spotify playlist for mood:", mood);

    if (!mood) {
      return new Response(JSON.stringify({ error: "Missing mood in request body", status: 400 }), { status: 400, headers: { "Content-Type": "application/json" } });
    }

    // 1. Get Spotify access token from Authorization header
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Missing access token", status: 401 }), { status: 401, headers: { "Content-Type": "application/json" } });
    }
    const access_token = authHeader.replace("Bearer ", "");
    console.log("Received Spotify access token (first 10 chars):", access_token.substring(0, 10));

    // 2. Map mood to seed genres
    const moodLower = mood.toLowerCase();
    let seedGenres = [];
    if (moodLower.includes("sad")) seedGenres = ["ambient", "acoustic"];
    else if (moodLower.includes("happy")) seedGenres = ["pop", "dance"];
    else if (moodLower.includes("angry")) seedGenres = ["rock", "metal"];
    else if (moodLower.includes("relaxed")) seedGenres = ["chill", "acoustic"];
    else seedGenres = ["pop", "acoustic"]; // fallback

    const seedGenresParam = seedGenres.join(",");
    console.log("Mapped mood to genres:", seedGenresParam);

    // 3. Fetch recommendations from Spotify
    const SPOTIFY_API_URL = `https://api.spotify.com/v1/recommendations?seed_genres=${seedGenresParam}&limit=10`;
    console.log("Spotify request URL:", SPOTIFY_API_URL);

    try {
      const spotifyRes = await fetch(SPOTIFY_API_URL, {
        headers: { Authorization: `Bearer ${access_token}` }
      });

      const data = await spotifyRes.json();
      if (!spotifyRes.ok) {
        console.error("Spotify API error:", data);
        return new Response(JSON.stringify({ error: "Failed to get Spotify recommendations", details: data, status: spotifyRes.status, statusText: spotifyRes.statusText }), { status: spotifyRes.status, headers: { "Content-Type": "application/json" } });
      }

      // 4. Return simplified track data
      const tracks = data.tracks.map(track => ({
        id: track.id,
        name: track.name,
        artists: track.artists.map(a => a.name),
        album: {
          name: track.album.name,
          images: track.album.images
        },
        preview_url: track.preview_url,
        external_urls: track.external_urls
      }));

      return new Response(JSON.stringify({ tracks, seeds: data.seeds ?? [] }), { status: 200, headers: { "Content-Type": "application/json" } });

    } catch (spotifyErr) {
      console.error("Spotify fetch error:", spotifyErr);
      return new Response(JSON.stringify({ error: "Spotify request failed", details: spotifyErr.message, status: 500 }), { status: 500, headers: { "Content-Type": "application/json" } });
    }

  } catch (err) {
    console.error("Spotify playlist route failed:", err);
    return new Response(JSON.stringify({ error: "Route processing failed", details: err.message, status: 500 }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}