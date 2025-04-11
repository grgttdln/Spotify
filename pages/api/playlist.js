import { getSpotifyAccessToken } from "@/lib/spotify";

export default async function handler(req, res) {
  try {
    const token = await getSpotifyAccessToken();

    const response = await fetch(
      "https://api.spotify.com/v1/playlists/3cEYpjA9oz9GiPac4AsH4n",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      return res.status(response.status).json({ error });
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message || "Unexpected error" });
  }
}
