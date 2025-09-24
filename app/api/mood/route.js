/**
 * POST /api/mood
 * Handles Gemini AI mood interpretation
 */
export async function POST(req) {
  const MAX_RETRIES = 2;
  let currentRetry = 0;

  try {
    const { mood } = await req.json();
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${process.env.GEMINI_API_KEY}`;
  
    const requestBody = {
      contents: [
        {
          role: "user",
          parts: [
            { text: `Interpret this mood for music: ${mood}` }
          ]
        }
      ]
    };

    while (currentRetry < MAX_RETRIES) {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody)
      });

      if (response.ok) {
        const data = await response.json();
        // Check for the required structure before accessing it
        const textOutput = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (textOutput) {
             return new Response(JSON.stringify({ text: textOutput }), { status: 200 });
        } else {
             throw new Error("Invalid response structure from Gemini API");
        }
      }

      if (response.status === 429) {
        if (currentRetry < MAX_RETRIES - 1) {
          const waitTimeMs = 33 * 1000;
          await new Promise(resolve => setTimeout(resolve, waitTimeMs));
          currentRetry++;
          continue;
        } else {
          const errorData = await response.json();
          return new Response(JSON.stringify(errorData), { status: response.status });
        }
      }

      const errorData = await response.json();
      return new Response(JSON.stringify(errorData), { status: response.status });
    }

    // If the loop finishes without success
    return new Response(JSON.stringify({ error: "Gemini API failed after all retries." }), { status: 503 });

  } catch (err) {
    console.error("Mood API critical error:", err);
    return new Response(JSON.stringify({ error: "Something went wrong" }), { status: 500 });
  }
}