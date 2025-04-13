export default function handler(req, res) {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const redirectUri = encodeURIComponent(process.env.SPOTIFY_REDIRECT_URI); // e.g., 'http://localhost:3000/api/callback'
  const scopes = [
    "playlist-read-private",
    "playlist-read-collaborative",
    "user-read-playback-state",
    "user-modify-playback-state",
    "streaming",
    "user-read-email",
    "user-read-private",
    "user-read-currently-playing",
    "app-remote-control",
  ].join(" "); // Specify required permissions

  const authUrl = `https://accounts.spotify.com/authorize?response_type=code&client_id=${clientId}&scope=${scopes}&redirect_uri=${redirectUri}`;

  res.redirect(authUrl); // Redirect to Spotify for login
}
