"use client";

import { useState, useEffect } from "react";
import ReactMarkdown from 'react-markdown'; // Markdown renderer

// Define the API endpoint paths
const GEMINI_API_PATH = "/api/mood";
const SPOTIFY_API_PATH = "/api/spotify-playlist";

export default function Home() {
  const [mood, setMood] = useState("");
  const [geminiText, setGeminiText] = useState(""); // Gemini AI output
  const [tracks, setTracks] = useState([]); // Spotify tracks
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(""); // Inline error messages

  // Intercept console errors only in development
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      const originalConsoleError = console.error;
      console.error = (...args) => {
        console.log("[Intercepted Console Error]:", ...args);
        originalConsoleError.apply(console, args);
      };
      return () => {
        console.error = originalConsoleError; // Restore on unmount
      };
    }
  }, []);

  // Handle Gemini AI and Spotify requests
  const handleClick = async () => {
    if (!mood.trim()) {
      setErrorMessage("Please enter a mood!");
      return;
    }

    setLoading(true);
    setGeminiText("");
    setTracks([]);
    setErrorMessage("");

    try {
      // 1️⃣ Gemini AI
      const res = await fetch(GEMINI_API_PATH, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mood })
      });

      if (!res.ok) {
        const errText = await res.text();
        console.error("Gemini API Error:", errText, "Status:", res.status, "StatusText:", res.statusText);
        setErrorMessage("Gemini request failed. See console for details.");
        return;
      }

      const data = await res.json();
      setGeminiText(data.text);

      // 2️⃣ Spotify
      const spotifyRes = await fetch(SPOTIFY_API_PATH, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mood: data.text })
      });

      if (!spotifyRes.ok) {
        const errText = await spotifyRes.text();
        console.error("Spotify API Error:", errText, "Status:", spotifyRes.status, "StatusText:", spotifyRes.statusText);
        setErrorMessage("Spotify request failed. See console for details.");
        return;
      }

      const spotifyData = await spotifyRes.json();
      setTracks(Array.isArray(spotifyData.tracks) ? spotifyData.tracks : []);

    } catch (err) {
      console.error("Network or unexpected error:", err);
      setErrorMessage("Something went wrong. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="font-sans min-h-screen p-8 pb-20">
      <main className="flex flex-col gap-6 items-center w-full max-w-full mx-auto">
        <h1 className="text-3xl font-bold text-center">Mood → Music 🎶</h1>
        <p className="text-center text-gray-600">
          Type your mood below and click "Generate Playlist"
        </p>

        <input
          type="text"
          placeholder="Describe your mood..."
          aria-label="Mood input"
          value={mood}
          onChange={(e) => setMood(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2 w-full"
        />

        <button
          onClick={handleClick}
          className="bg-blue-500 text-white px-4 py-2 rounded w-full"
          disabled={loading}
        >
          {loading ? "Generating..." : "Generate Playlist"}
        </button>

        {/* Display inline error */}
        {errorMessage && (
          <p className="text-red-500 mt-2">{errorMessage}</p>
        )}

        {/* Gemini AI Output */}
        {geminiText && (
          <div className="mt-6 p-4 border border-gray-300 rounded w-full bg-gray-50">
            <h2 className="font-semibold mb-2">Gemini AI Interpretation:</h2>
            <div className="text-black">
              <ReactMarkdown>{geminiText}</ReactMarkdown>
            </div>
          </div>
        )}

        {/* Loading message for Spotify */}
        {loading && !geminiText && <p className="mt-2 text-gray-700">Loading Spotify recommendations...</p>}

        {/* Spotify Recommendations */}
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
        <p className="text-gray-500 text-sm">
          Moodify Demo — Spotify & Gemini AI Integration
        </p>
      </footer>
    </div>
  );
}