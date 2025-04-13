// pages/api/now-playing.js
import { getSpotifyAccessToken } from "@/lib/spotify";

export default async function handler(req, res) {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith("Bearer ")) {
    return res.status(400).json({ error: "Missing or invalid access token" });
  }

  const accessToken = authorization.split(" ")[1];

  try {
    const response = await fetch(
      "https://api.spotify.com/v1/me/player/currently-playing",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      return res
        .status(response.status)
        .json({ error: "Failed to fetch now playing" });
    }

    const track = await response.json();
    res.status(200).json(track); // Send the track data back
  } catch (error) {
    console.error("Error fetching track:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
