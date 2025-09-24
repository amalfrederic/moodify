/**
 * GET /api/spotify-token
 * Returns a Spotify access token using Client Credentials flow
 */
export async function GET(req) {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.error("Missing Spotify credentials in environment variables.");
    return new Response(JSON.stringify({ error: "Missing Spotify credentials" }), { status: 500 });
  }

  // Base64 encode the Client ID and Secret for basic authorization
  const token = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  // 🟢 CORRECT SPOTIFY TOKEN URL
  const SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token";

  try {
    const res = await fetch(SPOTIFY_TOKEN_URL, {
      method: "POST",
      headers: {
        "Authorization": `Basic ${token}`,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: "grant_type=client_credentials"
    });

    // Read the response body once
    const responseBody = await res.text();

    if (!res.ok) {
      // Failure: Log the raw error from Spotify and return status
      console.error("Spotify Token Error (from Spotify):", res.status, responseBody);
      
      let errorDetails = responseBody;
      try {
        errorDetails = JSON.parse(responseBody);
      } catch (e) { /* response was not JSON */ }
      
      return new Response(JSON.stringify({ 
        error: "Failed to get Spotify token", 
        details: errorDetails 
      }), { status: res.status });
    }

    // Success: Parse the body as JSON and return
    const data = JSON.parse(responseBody);
    return new Response(JSON.stringify(data), { status: 200 });
    
  } catch (err) {
    console.error("Token route critical fetch/parse failure:", err);
    return new Response(JSON.stringify({ error: "Token route internal error", details: err.message }), { status: 500 });
  }
}