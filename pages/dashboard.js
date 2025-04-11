import { useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import styles from "../styles/Dashboard.module.css";

export default function Dashboard() {
  const router = useRouter();
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const token = query.get("access_token");

    if (!token) {
      setError("Missing access token");
      setLoading(false);
      return;
    }

    setAccessToken(token);

    const fetchPlaylists = async () => {
      try {
        const res = await fetch(`/api/user-playlists?access_token=${token}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to fetch playlists");

        setPlaylists(data.items);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPlaylists();
  }, []);

  const handleArrow = (direction) => {
    setActiveIndex((prev) => {
      const newIndex = direction === "left" ? prev - 1 : prev + 1;
      return Math.max(0, Math.min(playlists.length - 1, newIndex));
    });
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowLeft") handleArrow("left");
      if (e.key === "ArrowRight") handleArrow("right");
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [playlists]);

  const getVisiblePlaylists = () => {
    if (playlists.length === 0) return [];
    const left = playlists[activeIndex - 1];
    const center = playlists[activeIndex];
    const right = playlists[activeIndex + 1];
    return [left, center, right];
  };

  const handleCardClick = (id) => {
    router.push(`/play/${id}`);
  };

  return (
    <>
      <Head>
        <title>Spotify Dashboard</title>
        <meta name="description" content="Your Spotify Playlists" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <main className={styles.main}>
        {loading && <p>Loading playlists...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}
        {!loading && !error && playlists.length === 0 && (
          <p>No playlists found.</p>
        )}

        <div className={styles.carouselWrapper}>
          <div className={styles.carousel}>
            {getVisiblePlaylists().map((playlist, index) => {
              if (!playlist)
                return (
                  <div key={index} className={styles.cardPlaceholder}></div>
                );

              let cardClass = `${styles.card}`;
              if (index === 1) {
                cardClass += ` ${styles.center}`;
              } else if (index === 0) {
                cardClass += ` ${styles.side} ${styles.sideLeft}`;
              } else if (index === 2) {
                cardClass += ` ${styles.side} ${styles.sideRight}`;
              }

              return (
                <div
                  key={playlist.id}
                  className={cardClass}
                  onClick={() => handleCardClick(playlist.id)} // Add click handler here
                >
                  {playlist.images.length > 0 && (
                    <img src={playlist.images[0].url} alt={playlist.name} />
                  )}
                  <div className={styles.cardInfo}>
                    <strong>{playlist.name}</strong>
                    <p>{playlist.owner?.display_name || "Unknown"}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </>
  );
}
