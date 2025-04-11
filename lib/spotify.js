let cachedToken = null;
let tokenExpiry = null;

export async function getSpotifyAccessToken() {
  const now = Date.now();

  if (cachedToken && tokenExpiry && now < tokenExpiry) {
    return cachedToken;
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization:
        "Basic " +
        Buffer.from(`${clientId}:${clientSecret}`).toString("base64"),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      `Spotify token error: ${data.error_description || "Unknown error"}`
    );
  }

  cachedToken = data.access_token;
  tokenExpiry = now + data.expires_in * 1000; // usually 3600s = 1hr

  return cachedToken;
}
