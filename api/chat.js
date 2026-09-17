// Mission Lakshya - Khushi AI API
// File: api/chat.js

export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Browser preflight
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Only POST allowed
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      error: "Method not allowed"
    });
  }

  // AI API settings
  const API_KEY = process.env.AI_API_KEY;
  const API_URL =
    process.env.AI_API_URL ||
    "https://api.openai.com/v1/chat/completions";
  const MODEL =
    process.env.AI_MODEL || "gpt-4o-mini";

  // Check API key
  if (!API_KEY) {
    return res.status(500).json({
      success: false,
      error: "AI API key is not configured."
    });
  }

  try {
    // Read request body
    const body = req.body || {};

    const userMessage =
      typeof body.message === "string"
        ? body.message.trim()
        : "";

    // Optional conversation history
    const history = Array.isArray(body.history)
      ? body.history
      : [];

    if (!userMessage) {
      return res.status(400).json({
        success: false,
        error: "Message is required."
      });
    }

    // Limit history size
    const safeHistory = history
      .filter(
        (item) =>
          item &&
          typeof item.role === "string" &&
          typeof item.content === "string"
      )
      .slice(-10)
      .map((item) => ({
        role:
          item.role === "assistant"
            ? "assistant"
            : "user",
        content: item.content.slice(0, 6000)
      }));

    // Khushi AI system instructions
    const systemMessage = `
You are Khushi AI, the friendly AI study assistant
inside Mission Lakshya – NEET & JEE 2027.

Your job is to help students study Physics, Chemistry,
Biology and Mathematics.

Rules:
- Explain concepts clearly and step-by-step.
- Prefer simple language.
- You can answer in Hindi, English or Hinglish.
- For numerical questions, show the calculation steps.
- For science questions, explain the concept before the final answer.
- For NEET/JEE preparation, focus on educational explanations.
- If the student asks for a short answer, keep it short.
- Never pretend that you can see an image unless image data
  is actually provided to you.
- Be encouraging and respectful.
- Do not claim to be a human teacher.
`;

    // Build messages
    const messages = [
      {
        role: "system",
        content: systemMessage
      },
      ...safeHistory,
      {
        role: "user",
        content: userMessage
      }
    ];

    // Send request to AI provider
    const response = await fetch(API_URL, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`
      },

      body: JSON.stringify({
        model: MODEL,
        messages,
        temperature: 0.4
      })
    });

    // Read response
    const data = await response.json();

    // Provider error
    if (!response.ok) {
      console.error("AI API error:", data);

      return res.status(response.status).json({
        success: false,
        error:
          data?.error?.message ||
          "AI request failed.",
        details: data?.error || null
      });
    }

    // Extract answer
    const answer =
      data?.choices?.[0]?.message?.content ||
      "";

    if (!answer) {
      return res.status(502).json({
        success: false,
        error: "AI returned an empty response."
      });
    }

    // Send answer to frontend
    return res.status(200).json({
      success: true,
      answer: answer.trim(),
      model: MODEL
    });

  } catch (error) {
    console.error("Khushi AI server error:", error);

    return res.status(500).json({
      success: false,
      error: "Unable to connect to Khushi AI.",
      message: error?.message || "Unknown error"
    });
  }
}
