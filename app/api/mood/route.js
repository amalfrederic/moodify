/**
 * POST /api/mood
 * Handles Gemini AI mood interpretation
 */
export async function POST(req) {
  try {
    const { mood } = await req.json();
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.NEXT_PUBLIC_GEMINI_API_KEY}`;

    // Build request body following Gemini spec
    const requestBody = {
      contents: [
        {
          role: "user",
          parts: [
            { text: `Interpret this mood for music: ${mood}` }
          ]
        }
      ]
      // Optionally add generationConfig if the model supports it:
      // generationConfig: { responseMimeType: "application/json" }
    };

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
        // Alternative: some docs use this instead of query param
        // "x-goog-api-key": process.env.GEMINI_API_KEY
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Gemini API Error:", response.status, response.statusText, err);
      return new Response(JSON.stringify({
        error: "Gemini API failed",
        details: err,
        status: response.status,
        statusText: response.statusText
      }), { status: response.status });
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      console.error("Gemini output missing expected text:", JSON.stringify(data));
      return new Response(JSON.stringify({
        error: "Invalid Gemini response structure",
        details: JSON.stringify(data)
      }), { status: 500 });
    }

    return new Response(JSON.stringify({ text }), { status: 200 });

  } catch (err) {
    console.error("Gemini route catch error:", err);
    return new Response(JSON.stringify({
      error: "Internal server error",
      details: err.message
    }), { status: 500 });
  }
}