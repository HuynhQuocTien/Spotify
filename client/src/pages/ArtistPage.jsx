import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useMusicPlayer } from '../contexts/MusicPlayerContext';
import './ArtistPage.css';
import api from '../services/api';

const ArtistPage = () => {
  const { id } = useParams();
  const [artist, setArtist] = useState(null);
  const [topTracks, setTopTracks] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const { playTrack, currentTrack, isPlaying } = useMusicPlayer();

  useEffect(() => {
    const fetchArtistData = async () => {
      try {
        setLoading(true);
        
        // Fetch all data in parallel
        const [artistResponse, albumsResponse, songsResponse] = await Promise.all([
          api.getArtist(id),
          api.getArtistAlbums(id),
          api.getArtistTopTracks(id)
        ]);
        
        console.log('Artist Response:', artistResponse.data);
        console.log('Albums Response:', albumsResponse);
        console.log('Top Tracks Response:', songsResponse);
        // Process artist data
        const processedArtist = {
          ...artistResponse.data,
          images: artistResponse.data.image
            ? [{ url: artistResponse.data.image }]
            : [{ url: '/placeholder.svg?height=640&width=640' }],
          followers: { total: artistResponse.data.followers || 0 }
        };
        
        // Process top tracks
        const processedTopTracks = songsResponse.data.tracks.map((track) => ({
          id: track.id,
          name: track.title,
          artists: track.artists.map((artist) => ({
            id: artist.id,
            name: artist.name,
            image: artist.image,
          })),
          album: {
            id: track.album.id,
            name: track.album.title,
            images: track.album.cover_image
              ? [{ url: track.album.cover_image }]
              : [{ url: '/placeholder.svg?height=64&width=64' }],
          },
          duration_ms: convertDurationToMs(track.duration) || 0,
          duration_str: track.duration_str,
          audio_file: track.audio_file,
          image: track.image,
          is_favorite: track.is_favorite,
        }));
        
        // Process albums
        const processedAlbums = albumsResponse.data.map((album) => ({
          id: album.id,
          name: album.title,
          artists: album.artists || [],
          images: album.cover_image
            ? [{ url: album.cover_image }]
            : [{ url: '/placeholder.svg?height=160&width=160' }],
          album_type: album.album_type || 'album',
          release_date: album.release_date || 'Unknown',
          type: 'album',
        }));

        setArtist(processedArtist);
        setTopTracks(processedTopTracks);
        setAlbums(processedAlbums);
      } catch (error) {
        console.error('Error fetching artist data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchArtistData();
  }, [id]);

  const convertDurationToMs = (durationStr) => {
    if (!durationStr) return 0;
    
    const parts = durationStr.split(':');
    if (parts.length === 3) {
      // Format HH:mm:ss
      const hours = parseInt(parts[0]);
      const minutes = parseInt(parts[1]);
      const seconds = parseInt(parts[2]);
      return (hours * 3600 + minutes * 60 + seconds) * 1000;
    } else if (parts.length === 2) {
      // Format mm:ss
      const minutes = parseInt(parts[0]);
      const seconds = parseInt(parts[1]);
      return (minutes * 60 + seconds) * 1000;
    }
    return 0;
  };
  const handlePlayTrack = (track) => {
    playTrack(track, topTracks);
  };

  const handlePlayArtist = () => {
    if (topTracks.length > 0) {
      playTrack(topTracks[0], topTracks);
    }
  };

  const formatFollowers = (count) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M followers`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K followers`;
    }
    return `${count} followers`;
  };

  const formatDuration = (ms) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
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
      {/* Artist Header Section */}
      <div className="artist-header" style={{ 
        backgroundImage: `linear-gradient(transparent 0, rgba(0, 0, 0, 0.5) 100%), url(${artist.images[0].url})`
      }}>
        <div className="artist-header-content">
          <div className="artist-info">
            <div className="verified-badge">
              <svg viewBox="0 0 24 24" className="verified-icon">
                <path d="M12 1a11 11 0 1 0 0 22 11 11 0 0 0 0-22zm5.2 15.37l-1.93 1.93L12 15.03l-3.27 3.27-1.93-1.93L10.07 13 6.8 9.73l1.93-1.93L12 11.07l3.27-3.27 1.93 1.93L13.93 13l3.27 3.37z"></path>
              </svg>
              Verified Artist
            </div>
            <h1 className="artist-name">{artist.name}</h1>
            <div className="artist-followers">{formatFollowers(artist.followers.total)}</div>
          </div>
        </div>
      </div>

      {/* Artist Actions */}
      <div className="artist-actions">
        <button 
          className="play-button"
          onClick={handlePlayArtist}
        >
          <svg viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" fill="currentColor" />
          </svg>
        </button>
        <button className="follow-button">Follow</button>
        <button className="more-button">
          <svg viewBox="0 0 16 16">
            <path d="M3 8a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm6.5 0a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zM16 8a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"></path>
          </svg>
        </button>
      </div>

      {/* Popular Tracks Section */}
      <div className="popular-tracks-section">
        <h2 className="section-title">Popular</h2>
        <div className="tracks-list">
          {topTracks.map((track, index) => (
            <div 
              key={track.id} 
              className={`track-row ${currentTrack?.id === track.id && isPlaying ? 'active' : ''}`}
              onClick={() => handlePlayTrack(track)}
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
                <div className="track-name">{track.name}</div>
                <div className="track-artists">
                  {track.artists.map((artist, i) => (
                    <span key={artist.id}>
                      {i > 0 && ', '}
                      <Link to={`/artist/${artist.id}`} className="artist-link" onClick={e => e.stopPropagation()}>
                        {artist.name}
                      </Link>
                    </span>
                  ))}
                </div>
              </div>
              <div className="track-album">
                <Link to={`/album/${track.album.id}`} onClick={e => e.stopPropagation()}>
                  {track.album.name}
                </Link>
              </div>
              <div className="track-duration">
                {formatDuration(track.duration_ms)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Albums Section */}
      <div className="albums-section">
        <h2 className="section-title">Albums</h2>
        <div className="albums-grid">
          {albums.map(album => (
            <Link 
              key={album.id} 
              to={`/album/${album.id}`}
              className="album-card"
            >
              <div className="album-cover">
                <img 
                  src={album.images[0].url} 
                  alt={album.name}
                  className="album-image"
                />
                <button 
                  className="play-button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const albumTracks = topTracks.filter(t => t.album.id === album.id);
                    if (albumTracks.length > 0) {
                      playTrack(albumTracks[0], albumTracks);
                    }
                  }}
                >
                  <svg viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" fill="currentColor" />
                  </svg>
                </button>
              </div>
              <div className="album-info">
                <h3 className="album-name">{album.name}</h3>
                <div className="album-meta">
                  <span className="album-year">{album.release_date.split('-')[0]}</span>
                  <span className="meta-separator">•</span>
                  <span className="album-type">{album.album_type.charAt(0).toUpperCase() + album.album_type.slice(1)}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ArtistPage;