/**
 * GET /api/spotify-token
 * Returns a Spotify user access token using Authorization Code flow
 */
export async function GET(req) {
  const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
  const redirectUri = process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    console.error("Missing Spotify client ID or redirect URI in environment variables.");
    return new Response(JSON.stringify({ error: "Missing Spotify credentials" }), { status: 500, headers: { "Content-Type": "application/json" } });
  }

  const scopes = [
    "user-read-private",
    "user-read-email",
    "playlist-read-private",
    "playlist-read-collaborative"
  ].join(" ");

  const state = Math.random().toString(36).substring(2, 15); // simple random string
  const authUrl = `https://accounts.spotify.com/authorize?response_type=code&client_id=${clientId}&scope=${encodeURIComponent(scopes)}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}`;

  console.debug("Spotify authorization URL:", authUrl);

  return new Response(JSON.stringify({ authUrl, state }), { status: 200, headers: { "Content-Type": "application/json" } });
}

// Callback route to exchange authorization code for user token
export async function POST(req) {
  const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  const redirectUri = process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI;

  const { code } = await req.json();
  if (!code) {
    return new Response(JSON.stringify({ error: "Missing authorization code" }), { status: 400, headers: { "Content-Type": "application/json" } });
  }

  const tokenUrl = "https://accounts.spotify.com/api/token";
  const bodyParams = new URLSearchParams();
  bodyParams.append("grant_type", "authorization_code");
  bodyParams.append("code", code);
  bodyParams.append("redirect_uri", redirectUri);

  const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  try {
    const res = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        "Authorization": `Basic ${basicAuth}`,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: bodyParams.toString()
    });

    const tokenData = await res.json();
    if (!res.ok) {
      console.error("Spotify token exchange error:", tokenData);
      return new Response(JSON.stringify({ error: "Failed to exchange code for token", details: tokenData }), { status: res.status, headers: { "Content-Type": "application/json" } });
    }

    console.debug("Spotify user access token acquired successfully.");
    return new Response(JSON.stringify(tokenData), { status: 200, headers: { "Content-Type": "application/json" } });

  } catch (err) {
    console.error("Spotify token exchange critical error:", err);
    return new Response(JSON.stringify({ error: "Token exchange failed", details: err.message }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}
