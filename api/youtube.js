// Mission Lakshya - YouTube API
// File: api/youtube.js

export default async function handler(req, res) {
  // Allow frontend requests
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle browser preflight request
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Only GET is allowed
  if (req.method !== "GET") {
    return res.status(405).json({
      success: false,
      error: "Method not allowed"
    });
  }

  // YouTube API key must be added in Vercel Environment Variables
  const API_KEY = process.env.YOUTUBE_API_KEY;

  if (!API_KEY) {
    return res.status(500).json({
      success: false,
      error: "YouTube API key is not configured."
    });
  }

  try {
    // Read query parameters
    const query =
      typeof req.query?.q === "string"
        ? req.query.q.trim()
        : "";

    const live =
      String(req.query?.live || "").toLowerCase() === "true";

    const maxResultsRaw = Number(req.query?.maxResults || 12);

    // Keep API usage under control
    const maxResults = Math.min(
      Math.max(Number.isFinite(maxResultsRaw) ? maxResultsRaw : 12, 1),
      50
    );

    // Default search
    const searchQuery = query || "NEET JEE live classes";

    // YouTube Data API URL
    const url = new URL(
      "https://www.googleapis.com/youtube/v3/search"
    );

    url.searchParams.set("part", "snippet");
    url.searchParams.set("type", "video");
    url.searchParams.set("maxResults", String(maxResults));
    url.searchParams.set("q", searchQuery);
    url.searchParams.set("key", API_KEY);

    // Only currently live videos
    if (live) {
      url.searchParams.set("eventType", "live");
    }

    // Request YouTube
    const response = await fetch(url.toString());

    const data = await response.json();

    // YouTube returned an error
    if (!response.ok) {
      console.error("YouTube API error:", data);

      return res.status(response.status).json({
        success: false,
        error:
          data?.error?.message ||
          "YouTube API request failed.",
        details: data?.error?.errors || []
      });
    }

    // Convert YouTube response into a simpler format
    const videos = (data.items || []).map((item) => {
      const videoId = item?.id?.videoId || "";

      return {
        videoId,

        title: item?.snippet?.title || "Untitled Video",

        description:
          item?.snippet?.description || "",

        channelTitle:
          item?.snippet?.channelTitle || "Unknown Channel",

        channelId:
          item?.snippet?.channelId || "",

        publishedAt:
          item?.snippet?.publishedAt || null,

        thumbnails: {
          default:
            item?.snippet?.thumbnails?.default?.url || "",

          medium:
            item?.snippet?.thumbnails?.medium?.url || "",

          high:
            item?.snippet?.thumbnails?.high?.url || ""
        },

        youtubeUrl: videoId
          ? `https://www.youtube.com/watch?v=${videoId}`
          : "",

        embedUrl: videoId
          ? `https://www.youtube.com/embed/${videoId}`
          : ""
      };
    });

    return res.status(200).json({
      success: true,

      query: searchQuery,

      live,

      totalResults:
        data?.pageInfo?.totalResults || videos.length,

      resultsPerPage:
        data?.pageInfo?.resultsPerPage || videos.length,

      videos
    });
  } catch (error) {
    console.error("YouTube server error:", error);

    return res.status(500).json({
      success: false,
      error: "Unable to connect to YouTube.",
      message: error?.message || "Unknown error"
    });
  }
  }
