export default async function handler(req, res) {
  const { code } = req.query;

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  const redirectUri = process.env.SPOTIFY_REDIRECT_URI;

  const authOptions = {
    method: "POST",
    headers: {
      Authorization:
        "Basic " +
        Buffer.from(`${clientId}:${clientSecret}`).toString("base64"),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code: code,
      redirect_uri: redirectUri,
    }),
  };

  try {
    const tokenRes = await fetch(
      "https://accounts.spotify.com/api/token",
      authOptions
    );
    const data = await tokenRes.json();

    if (!tokenRes.ok) {
      return res
        .status(tokenRes.status)
        .json({ error: data.error_description });
    }

    // ✅ REDIRECT TO DASHBOARD WITH ACCESS TOKEN
    res.redirect(`/dashboard?access_token=${data.access_token}`);
  } catch (err) {
    res.status(500).json({ error: "Token exchange failed" });
  }
}
