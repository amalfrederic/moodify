"use client";

import { useState, useEffect } from "react";
import ReactMarkdown from 'react-markdown';

const GEMINI_API_PATH = "/api/mood";
const SPOTIFY_API_PATH = "/api/spotify-playlist";
const SPOTIFY_CLIENT_ID = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
const REDIRECT_URI = process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI;
const SCOPES = "user-read-private user-read-email playlist-read-private playlist-read-collaborative";
const AUTH_URL = `https://accounts.spotify.com/authorize?client_id=${SPOTIFY_CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=${encodeURIComponent(SCOPES)}`;

export default function Home() {
  const [mood, setMood] = useState("");
  const [geminiText, setGeminiText] = useState(""); 
  const [tracks, setTracks] = useState([]); 
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [spotifyAccessToken, setSpotifyAccessToken] = useState(null);

  useEffect(() => {
  const match = document.cookie.match(/spotify_access_token=([^;]+)/);
  if (match) {
    setSpotifyAccessToken(match[1]);
  }
}, []);

  const handleSpotifyLogin = () => {
    window.location.href = AUTH_URL;
  };

  const handleClick = async () => {
    if (!mood.trim()) {
      setErrorMessage("Please enter a mood!");
      return;
    }
    if (!spotifyAccessToken) {
      setErrorMessage("Please login with Spotify first.");
      return;
    }

    setLoading(true);
    setGeminiText("");
    setTracks([]);
    setErrorMessage("");

    try {
      // 1. Gemini AI
      const res = await fetch(GEMINI_API_PATH, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mood }),
      });

      if (!res.ok) {
        const errText = await res.text();
        console.error("Gemini API Error:", errText);
        setErrorMessage("Gemini request failed.");
        return;
      }

      const data = await res.json();
      setGeminiText(data.text);

      // 2. Spotify playlist using access token
      const spotifyRes = await fetch(SPOTIFY_API_PATH, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${spotifyAccessToken}`,
        },
        body: JSON.stringify({ mood: data.text }),
      });

      if (!spotifyRes.ok) {
        const errText = await spotifyRes.text();
        console.error("Spotify API Error:", errText);
        setErrorMessage("Spotify request failed.");
        return;
      }

      const spotifyData = await spotifyRes.json();
      setTracks(Array.isArray(spotifyData.tracks) ? spotifyData.tracks : []);
    } catch (err) {
      console.error("Network or unexpected error:", err);
      setErrorMessage("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="font-sans min-h-screen p-8 pb-20">
      <main className="flex flex-col gap-6 items-center w-full max-w-full mx-auto">
        <h1 className="text-3xl font-bold text-center">Mood → Music 🎶</h1>
        <p className="text-center text-gray-600">Type your mood below and click "Generate Playlist"</p>

        {!spotifyAccessToken && (
          <button
            onClick={handleSpotifyLogin}
            className="bg-green-500 text-white px-4 py-2 rounded w-full"
          >
            Login with Spotify
          </button>
        )}

        <input
          type="text"
          placeholder="Describe your mood..."
          value={mood}
          onChange={(e) => setMood(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2 w-full"
        />

        <button
          onClick={handleClick}
          className="bg-blue-500 text-white px-4 py-2 rounded w-full"
          disabled={!spotifyAccessToken || loading}
        >
          {loading ? "Generating..." : "Generate Playlist"}
        </button>

        {errorMessage && <p className="text-red-500 mt-2">{errorMessage}</p>}

        {geminiText && (
          <div className="mt-6 p-4 border border-gray-300 rounded w-full bg-gray-50">
            <h2 className="font-semibold mb-2">Gemini AI Interpretation:</h2>
            <div className="text-black">
              <ReactMarkdown>{geminiText}</ReactMarkdown>
            </div>
          </div>
        )}

        {tracks.length > 0 && (
          <div className="mt-6 w-full">
            <h2 className="font-semibold mb-2">Spotify Recommendations:</h2>
            {tracks.map(track => (
              <div key={track.id} className="flex items-center gap-2 mb-4 border-b pb-2">
                <img src={track.album.images?.[0]?.url || "/fallback.jpg"} alt={track.name} className="w-16 h-16 object-cover" />
                <div>
                  <p className="font-semibold">{track.name}</p>
                  <p className="text-sm">{track.artists.map(a => a.name).join(", ")}</p>
                  <a href={track.external_urls.spotify} target="_blank" rel="noopener noreferrer" className="text-blue-500 text-sm">
                    Listen on Spotify
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <footer className="flex gap-[24px] flex-wrap items-center justify-center mt-8">
        <p className="text-gray-500 text-sm">Moodify Demo — Spotify & Gemini AI Integration</p>
      </footer>
    </div>
  );
}