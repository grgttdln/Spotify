import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import styles from "../../styles/Play.module.css";
import Image from "next/image";
import Script from "next/script";

export default function Play() {
  const router = useRouter();
  const { access_token, playlist_id } = router.query;

  const [playlist, setPlaylist] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [deviceId, setDeviceId] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [progressMs, setProgressMs] = useState(0);
  const [durationMs, setDurationMs] = useState(0);
  const [rotation, setRotation] = useState(0);

  const playerRef = useRef(null);
  const rotationRef = useRef(0);
  const animationFrameRef = useRef(null);

  const currentTrack = playlist[currentIndex]?.track;

  // Play the song when currentIndex changes
  useEffect(() => {
    if (isPlayerReady && deviceId && currentTrack?.uri) {
      playCurrentTrack();
    }
  }, [currentIndex]);

  useEffect(() => {
    if (!router.isReady || !access_token || !playlist_id) return;

    fetch(`https://api.spotify.com/v1/playlists/${playlist_id}`, {
      headers: { Authorization: `Bearer ${access_token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setPlaylist(data.tracks.items || []);
      })
      .catch((err) => console.error("Playlist fetch error:", err));
  }, [router.isReady, access_token, playlist_id]);

  useEffect(() => {
    if (!access_token || deviceId) return;

    const setupPlayer = () => {
      const player = new window.Spotify.Player({
        name: "Georgette's Web Player",
        getOAuthToken: (cb) => cb(access_token),
        volume: 0.5,
      });

      player.addListener("ready", ({ device_id }) => {
        console.log("Player is ready with device ID:", device_id);
        setDeviceId(device_id);
        setIsPlayerReady(true);

        if (playlist.length > 0 && currentTrack?.uri) {
          startPlayback(device_id);
        }
      });

      player.addListener("player_state_changed", (state) => {
        if (state) {
          setIsPlaying(!state.paused);
          setProgressMs(state.position);
          setDurationMs(state.duration);
        }
      });

      player.connect();
      playerRef.current = player;
    };

    if (window.Spotify) {
      setupPlayer();
    } else {
      window.onSpotifyWebPlaybackSDKReady = setupPlayer;
    }
  }, [access_token, deviceId]);

  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        setProgressMs((prev) => {
          if (prev + 1000 >= durationMs) {
            clearInterval(interval);
            return durationMs;
          }
          return prev + 1000;
        });
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isPlaying, durationMs]);

  useEffect(() => {
    let lastTime = null;

    const rotate = (timestamp) => {
      if (!lastTime) lastTime = timestamp;
      const delta = timestamp - lastTime;
      lastTime = timestamp;

      rotationRef.current += (delta / 1000) * 72;

      setRotation(rotationRef.current);
      animationFrameRef.current = requestAnimationFrame(rotate);
    };

    if (isPlaying) {
      animationFrameRef.current = requestAnimationFrame(rotate);
    } else {
      cancelAnimationFrame(animationFrameRef.current);
    }

    return () => cancelAnimationFrame(animationFrameRef.current);
  }, [isPlaying]);

  const startPlayback = (deviceId) => {
    if (!currentTrack?.uri) return;

    fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        context_uri: `spotify:playlist:${playlist_id}`,
        offset: { position: currentIndex },
      }),
    })
      .then((res) => {
        if (!res.ok) res.text().then(console.error);
        else setIsPlaying(true);
      })
      .catch(console.error);
  };

  const resumeSpotifyAudioContext = async () => {
    try {
      const context = playerRef.current?._options?.audioContext;
      if (context?.state === "suspended") await context.resume();
    } catch (err) {
      console.warn("Could not resume audio context:", err);
    }
  };

  const playCurrentTrack = async () => {
    if (!deviceId || !currentTrack?.uri) return;
    await resumeSpotifyAudioContext();

    fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        context_uri: `spotify:playlist:${playlist_id}`,
        offset: { position: currentIndex },
        position_ms: 0,
      }),
    })
      .then((res) => {
        if (!res.ok) res.text().then(console.error);
        else setIsPlaying(true);
      })
      .catch(console.error);
  };

  const pauseTrack = () => {
    fetch("https://api.spotify.com/v1/me/player/pause", {
      method: "PUT",
      headers: { Authorization: `Bearer ${access_token}` },
    })
      .then(() => setIsPlaying(false))
      .catch(console.error);
  };

  const togglePlay = () => {
    isPlaying ? pauseTrack() : playCurrentTrack();
  };

  const handleNext = () => {
    if (currentIndex < playlist.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setProgressMs(0);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setProgressMs(0);
    }
  };

  const formatTime = (ms) => {
    const totalSec = Math.floor(ms / 1000);
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    return `${min}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <>
      <Head>
        <title>Spotify Player</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Script
          src="https://sdk.scdn.co/spotify-player.js"
          strategy="beforeInteractive"
        />
      </Head>

      <main className={styles.container}>
        {playlist.length > 0 && currentTrack ? (
          <div className={styles.track}>
            <div className={styles.info}>
              <h2 className={styles.songTitle}>{currentTrack.name}</h2>
              <p className={styles.artist}>
                {currentTrack.artists.map((a) => a.name).join(", ")}
              </p>
            </div>
            <div className={styles.visuals}>
              <img
                src={currentTrack.album.images[0].url}
                alt="Album Art"
                className={styles.albumCover}
              />
              <Image
                src="/images/record.png"
                alt="Record"
                width={600}
                height={600}
                className={styles.vinyl}
                style={{
                  transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
                }}
                priority
              />
            </div>

            <div className={styles.timeline}>
              <div className={styles.progressBar}>
                <div
                  className={styles.progress}
                  style={{ width: `${(progressMs / durationMs) * 100 || 0}%` }}
                />
              </div>
              <div className={styles.timeStamps}>
                <span>{formatTime(progressMs)}</span>
                <span>{formatTime(durationMs)}</span>
              </div>
            </div>

            <div className={styles.controls}>
              <button onClick={handlePrevious} disabled={currentIndex === 0}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="24px"
                  viewBox="0 -960 960 960"
                  width="24px"
                  fill="#1f1f1f"
                >
                  <path d="M220-240v-480h80v480h-80Zm520 0L380-480l360-240v480Z" />
                </svg>
              </button>
              <button
                onClick={togglePlay}
                disabled={!isPlayerReady || !deviceId || !currentTrack?.uri}
              >
                {isPlaying ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    height="24px"
                    viewBox="0 -960 960 960"
                    width="24px"
                    fill="#1f1f1f"
                  >
                    <path d="M560-200v-560h160v560H560Zm-320 0v-560h160v560H240Z" />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    height="24px"
                    viewBox="0 -960 960 960"
                    width="24px"
                    fill="#1f1f1f"
                  >
                    <path d="M320-200v-560l440 280-440 280Z" />
                  </svg>
                )}
              </button>
              <button
                onClick={handleNext}
                disabled={currentIndex === playlist.length - 1}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="24px"
                  viewBox="0 -960 960 960"
                  width="24px"
                  fill="#1f1f1f"
                >
                  <path d="M660-240v-480h80v480h-80Zm-440 0v-480l360 240-360 240Z" />
                </svg>
              </button>
            </div>
          </div>
        ) : (
          <div className={styles.loader} />
        )}
      </main>
    </>
  );
}
