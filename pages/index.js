import { useState } from "react";
import Image from "next/image";
import styles from "../styles/Home.module.css";

export default function Home() {
  const [accessToken, setAccessToken] = useState("");
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Step 1: Function to fetch playlists
  const handleFetchPlaylists = async () => {
    setLoading(true);
    setError(null);
    setPlaylists([]);

    try {
      // Make a request to your API to fetch the user's playlists using the access token
      const res = await fetch(
        `/api/user-playlists?access_token=${accessToken}`
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch playlists");
      setPlaylists(data.items);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Function to initiate the login with Spotify
  const loginWithSpotify = () => {
    window.location.href = "/api/login"; // This will start the OAuth flow
  };

  return (
    <div>
      {/* Step 3: Display login button if no access token is available */}
      {!accessToken ? (
        <div className={styles.container}>
          <div className={styles.imageWrapper}>
            <Image
              src="/images/player.png"
              alt="Spotify Logo"
              width={854.94}
              height={718.48}
            />
          </div>
          <div className={styles.content}>
            <div className={styles.title}>Player</div>
            <button className={styles.btn} onClick={loginWithSpotify}>
              Login with Spotify
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="24px"
                viewBox="0 -960 960 960"
                width="24px"
                fill="#2D1B6B"
                style={{ marginLeft: "8px", verticalAlign: "middle" }}
              >
                <path d="M647-440H160v-80h487L423-744l57-56 320 320-320 320-57-56 224-224Z" />
              </svg>
            </button>
          </div>
        </div>
      ) : (
        <div>
          <label>Access Token:</label>
          <input
            type="text"
            value={accessToken}
            onChange={(e) => setAccessToken(e.target.value)}
          />
          <button onClick={handleFetchPlaylists}>Get Playlists</button>
        </div>
      )}

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {playlists.length > 0 && (
        <ul>
          {playlists.map((playlist) => (
            <li key={playlist.id}>{playlist.name}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
