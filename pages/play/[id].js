import { useEffect, useState } from "react";
import Head from "next/head";
import styles from "../../styles/Play.module.css";

export default function Play() {
  const [track, setTrack] = useState(null);

  useEffect(() => {
    fetch("/api/now-playing")
      .then((res) => res.json())
      .then(setTrack);
  }, []);

  return (
    <>
      <Head>
        <title>Now Playing</title>
        <meta name="description" content="Now Playing from Spotify" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <main className={styles.container}>
        {track?.isPlaying ? (
          <>
            <div className={styles.info}>
              <h2 className={styles.songTitle}>{track.title}</h2>
              <p className={styles.artist}>{track.artist}</p>
            </div>

            <div className={styles.visuals}>
              <img
                src={track.albumImageUrl}
                alt="Album Art"
                className={styles.albumCover}
              />
              <img src="/vinyl.png" alt="Vinyl" className={styles.vinyl} />
            </div>

            <iframe
              src={`https://open.spotify.com/embed/track/${track.songUrl
                .split("/")
                .pop()}`}
              width="80%"
              height="80"
              frameBorder="0"
              allow="encrypted-media"
              className={styles.iframe}
            ></iframe>
          </>
        ) : (
          <p>Not playing anything...</p>
        )}
      </main>
    </>
  );
}
