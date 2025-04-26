import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useMusicPlayer } from '../contexts/MusicPlayerContext';
import HeartFilledIcon from '../components/HeartFilledIcon';
import HeartOutlineIcon from '../components/HeartOutlineIcon';
import api from '../services/api';
import './ArtistPage.css';

const ArtistPage = () => {
  const { id } = useParams();
  const [artist, setArtist] = useState(null);
  const [topTracks, setTopTracks] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const { playTrack, currentTrack, isPlaying, favorites, updateFavorites } = useMusicPlayer();

  const audioRef = useRef(null);
  const FAVORITE_TYPE = {
    SONG: 'song',
    ALBUM: 'album'
  };
  useEffect(() => {
    const fetchArtistData = async () => {
      try {
        setLoading(true);
        const [artistRes, albumsRes, songsRes] = await Promise.all([
          api.getArtist(id),
          api.getArtistAlbums(id),
          api.getArtistTopTracks(id),
        ]);
      setArtist(artistRes.data);
      setAlbums(albumsRes.data.items);
      setTopTracks(songsRes.data.tracks);

        // Thêm logic khôi phục favorite từ localStorage
        const processedTracks = songsRes.data.tracks.map((track) => ({
          ...track,
          is_favorite: JSON.parse(
            localStorage.getItem(`favorite_song_${track.id}`) || "false"
          ),
        }));

        setTopTracks(processedTracks);
        // ... phần còn lại giữ nguyên
      } catch (err) {
        console.error('Error loading artist data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchArtistData();
  }, [id]);

  const formatDuration = (ms) => {
    const m = Math.floor(ms / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const formatFollowers = (count) => {
    if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M followers`;
    if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K followers`;
    return `${count} followers`;
  };

  const handlePlayTrack = async (e, track) => {
    e?.preventDefault();
    e?.stopPropagation();

    if (!track.audio_file || loading) return;

    try {
      await playTrack({
        ...track,
        audio: track.audio_file,
        contextTracks: topTracks,
        contextUri: `artist:${id}:track:${track.id}`,
      });
    } catch (err) {
      console.error('Playback failed:', err);
    }
  };

  const handlePlayArtist = async (e) => {
    e?.preventDefault();
    if (topTracks.length > 0) {
      await playTrack({
        ...topTracks[0],
        audio: topTracks[0].audio_file,
        contextTracks: topTracks,
        contextUri: `artist:${id}`,
      });
    }
  };

  // Thêm vào hàm handleToggleFavorite
  const handleToggleFavorite = async (e, trackId, isCurrentlyFavorite, type) => {
    e.stopPropagation();
    const newState = !isCurrentlyFavorite;

    // 1. Cập nhật UI ngay lập tức
    setTopTracks(prev => prev.map(track =>
      track.id === trackId ? { ...track, is_favorite: newState } : track
    ));

    // 2. Lưu vào localStorage
    localStorage.setItem(`favorite_${type}_${trackId}`, JSON.stringify(newState));

    try {
      await api.addFavoriteTrack(trackId, type);

      // 4. (Optional) Cập nhật context nếu có
      if (updateFavorites) {
        updateFavorites(trackId, type, newState ? 'add' : 'remove');
      }
    } catch (err) {
      // Rollback nếu lỗi
      setTopTracks(prev => prev.map(track =>
        track.id === trackId ? { ...track, is_favorite: isCurrentlyFavorite } : track
      ));
      localStorage.setItem(`favorite_${type}_${trackId}`, JSON.stringify(isCurrentlyFavorite));
      console.error('Toggle favorite failed:', err);
    }
  };


  if (loading) {
    return (
      <div className="artist-loading">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (!artist) {
    return (
      <div className="artist-error">
        <h2>Artist not found</h2>
        <p>The artist you're looking for doesn't exist or has been removed.</p>
      </div>
    );
  }

  return (
    <div className="artist-page">
      <div
        className="artist-header"
        style={{
          backgroundImage: `linear-gradient(transparent 0, rgba(0, 0, 0, 0.5)), url(${artist.image})`,
        }}
      >
        <div className="artist-header-content">
          <div className="artist-info">
            <div className="verified-badge">
              <svg viewBox="0 0 24 24" className="verified-icon">
                <path d="M12 1a11 11 0 1 0 0 22 11 11 0 0 0 0-22zm5.2 15.37l-1.93 1.93L12 15.03l-3.27 3.27-1.93-1.93L10.07 13 6.8 9.73l1.93-1.93L12 11.07l3.27-3.27 1.93 1.93L13.93 13l3.27 3.37z"></path>
              </svg>
              Verified Artist
            </div>
            <h1 className="artist-name">{artist.name}</h1>
            <div className="artist-followers">1</div>
          </div>
        </div>
      </div>

      <div className="artist-actions">
        <button className="play-button" onClick={handlePlayArtist}>
          <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z" fill="currentColor" /></svg>
        </button>
        <button className="follow-button">Follow</button>
        <button className="more-button">
          <svg viewBox="0 0 16 16">
            <path d="M3 8a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm6.5 0a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zM16 8a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"></path>
          </svg>
        </button>
      </div>

      <div className="popular-tracks-section">
        <h2 className="section-title">Popular</h2>
        <div className="tracks-list">
          {topTracks.map((track, index) => (
            <div
              key={track.id}
              className={`track-row ${currentTrack?.id === track.id && isPlaying ? 'active' : ''}`}
              onClick={(e) => handlePlayTrack(e, track)}
            >
              <div className="track-number">
                {currentTrack?.id === track.id && isPlaying ? (
                  <div className="playing-animation">
                    <span className="bar"></span>
                    <span className="bar"></span>
                    <span className="bar"></span>
                  </div>
                ) : (
                  index + 1
                )}
              </div>
              <div className="track-info">
                <div className="track-name">{track.title}</div>
                <div className="track-artists">
                  {track.artists.map((a, i) => (
                    <span key={a.id}>
                      {i > 0 && ', '}
                      <Link to={`/artist/${a.id}`} className="artist-link" onClick={(e) => e.stopPropagation()}>
                        {a.name}
                      </Link>
                    </span>
                  ))}
                </div>
              </div>
              <div className="track-album">
                <Link to={`/album/${track.album.id}`} onClick={(e) => e.stopPropagation()}>
                  {track.album.name}
                </Link>
              </div>
              <div className="track-duration">{track.duration}</div>
              <div className="track-actions">
                <button
                  className={`favorite-btn ${track.is_favorite ? 'active' : ''}`}
                  onClick={(e) => handleToggleFavorite(e, track.id, track.is_favorite, 'song')}
                >
                  {track.is_favorite ? <HeartFilledIcon /> : <HeartOutlineIcon />}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ArtistPage;
