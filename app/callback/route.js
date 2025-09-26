import { Buffer } from 'buffer';

/**
 * GET /callback
 * Handles Spotify redirect, exchanges 'code' for tokens, and sets cookies.
 */
export async function GET(req) {
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');

    console.log("Received /callback request");
    console.log("Code:", code ? code.substring(0, 20) + '...' : 'None');
    console.log("State:", state);

    if (!code) {
        return new Response("Authorization failed: No code received.", { status: 400 });
    }

    const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
    const redirectUri = "https://moodify.vercel.app/callback";

    if (!clientId || !clientSecret) {
        console.error("Missing Spotify credentials in environment variables.");
        return new Response("Server configuration error: Missing Spotify credentials.", { status: 500 });
    }

    const authHeader = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

    try {
        console.log("Exchanging authorization code for access token...");

        const tokenRes = await fetch("https://accounts.spotify.com/api/token", {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${authHeader}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: redirectUri,
            }).toString(),
        });

        const tokenData = await tokenRes.json();
        console.log("Token response:", tokenData);

        if (!tokenRes.ok) {
            console.error("Spotify token exchange failed:", tokenData);
            return new Response(JSON.stringify({ error: "Token exchange failed", details: tokenData }), { status: 400 });
        }

        console.log("Successfully received access and refresh tokens.");

        const headers = new Headers();
        
        // Set the Access Token as a cookie (NOT HttpOnly)
        headers.append('Set-Cookie', `spotify_access_token=${tokenData.access_token}; Path=/; Max-Age=${tokenData.expires_in}; SameSite=Lax`);
        
        // Set the Refresh Token as HttpOnly (optional, for server-side use)
        if (tokenData.refresh_token) {
            headers.append('Set-Cookie', `spotify_refresh_token=${tokenData.refresh_token}; Path=/; HttpOnly; Max-Age=2592000; SameSite=Lax`);
        }

        headers.append('Location', '/');

        return new Response(null, { status: 302, headers });

    } catch (err) {
        console.error("Token exchange error:", err);
        return new Response("Internal server error during token exchange.", { status: 500 });
    }
}
