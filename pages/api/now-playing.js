import { getNowPlaying } from "../../lib/spotify";

export default async function handler(req, res) {
  const response = await getNowPlaying();
  if (response.status === 204 || response.status > 400) {
    return res.status(200).json({ isPlaying: false });
  }

  const song = await response.json();

  const track = {
    title: song.item.name,
    artist: song.item.artists.map((a) => a.name).join(", "),
    album: song.item.album.name,
    albumImageUrl: song.item.album.images[0].url,
    songUrl: song.item.external_urls.spotify,
    isPlaying: song.is_playing,
  };

  res.status(200).json(track);
}
