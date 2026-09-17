// Mission Lakshya - Khushi AI
// Gemini API backend
// File: api/chat.js

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      error: "Method not allowed"
    });
  }

  const API_KEY = process.env.GEMINI_API_KEY;

  if (!API_KEY) {
    return res.status(500).json({
      success: false,
      error: "Gemini API key is not configured."
    });
  }

  try {
    const body = req.body || {};

    const userMessage =
      typeof body.message === "string"
        ? body.message.trim()
        : "";

    const history = Array.isArray(body.history)
      ? body.history
      : [];

    if (!userMessage) {
      return res.status(400).json({
        success: false,
        error: "Message is required."
      });
    }

    const safeHistory = history
      .filter(
        (item) =>
          item &&
          typeof item.role === "string" &&
          typeof item.content === "string"
      )
      .slice(-10)
      .map((item) => ({
        role: item.role === "assistant" ? "model" : "user",
        parts: [
          {
            text: item.content.slice(0, 6000)
          }
        ]
      }));

    const systemInstruction = `
You are Khushi AI, the friendly study assistant
inside Mission Lakshya – NEET & JEE 2027.

Help students with:
- Physics
- Chemistry
- Biology
- Mathematics
- NEET preparation
- JEE preparation
- Study planning
- Doubt solving

Rules:
- Explain concepts step by step.
- Use simple Hindi, English or Hinglish.
- For numerical questions, show the calculation.
- Give the final answer clearly.
- For difficult topics, use simple examples.
- Be friendly, encouraging and respectful.
- Do not pretend to see an image unless image data
  has actually been provided.
`;

    const contents = [
      {
        role: "user",
        parts: [
          {
            text: systemInstruction
          }
        ]
      },
      {
        role: "model",
        parts: [
          {
            text: "Understood. I am Khushi AI, ready to help with studies."
          }
        ]
      },
      ...safeHistory,
      {
        role: "user",
        parts: [
          {
            text: userMessage
          }
        ]
      }
    ];

    const model =
      process.env.GEMINI_MODEL || "gemini-3.8-flash";

    const apiUrl =
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

    const response = await fetch(apiUrl, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": API_KEY
      },

      body: JSON.stringify({
        contents,

        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 2048
        }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Gemini API error:", data);

      return res.status(response.status).json({
        success: false,
        error:
          data?.error?.message ||
          "Gemini API request failed."
      });
    }

    const answer =
      data?.candidates?.[0]?.content?.parts
        ?.map((part) => part.text || "")
        .join("")
        .trim() || "";

    if (!answer) {
      return res.status(502).json({
        success: false,
        error: "Gemini returned an empty response."
      });
    }

    return res.status(200).json({
      success: true,
      answer,
      model
    });

  } catch (error) {
    console.error("Khushi AI error:", error);

    return res.status(500).json({
      success: false,
      error: "Unable to connect to Gemini.",
      message: error?.message || "Unknown error"
    });
  }
}
