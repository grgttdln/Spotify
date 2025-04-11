// pages/api/user-playlists.js

export default async function handler(req, res) {
  const accessToken = req.query.access_token;

  console.log("🔐 Access Token received by API route:", accessToken);

  if (!accessToken) {
    return res.status(400).json({ error: "Missing access token" });
  }

  try {
    const response = await fetch("https://api.spotify.com/v1/me/playlists", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const data = await response.json();

    console.log("📦 Spotify API raw response:", JSON.stringify(data, null, 2));

    if (!response.ok) {
      console.error("❌ Spotify API error:", data);
      return res
        .status(response.status)
        .json({ error: data.error?.message || "Failed to fetch playlists" });
    }

    res.status(200).json(data);
  } catch (error) {
    console.error("🔥 Unexpected server error:", error);
    res.status(500).json({ error: "Server error" });
  }
}
