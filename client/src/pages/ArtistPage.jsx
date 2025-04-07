import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useMusicPlayer } from '../contexts/MusicPlayerContext';
import './ArtistPage.css';

const ArtistPage = () => {
  const { id } = useParams();
  const [artist, setArtist] = useState(null);
  const [topTracks, setTopTracks] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [relatedArtists, setRelatedArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const { playTrack } = useMusicPlayer();

  useEffect(() => {
    const fetchArtistData = async () => {
      try {
        setLoading(true);
        // In a real app, these would be API calls
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Mock artist data
        const mockArtist = {
          id,
          name: 'Artist Name',
          images: [{ url: '/placeholder.svg?height=300&width=300' }],
          followers: { total: 12345678 },
          genres: ['Pop', 'R&B', 'Dance'],
          monthly_listeners: 45678901
        };
        
        // Mock top tracks
        const mockTopTracks = Array.from({ length: 5 }, (_, i) => ({
          id: `track-${i}`,
          name: `Popular Track ${i + 1}`,
          artists: [{ id, name: 'Artist Name' }],
          album: {
            id: `album-${i % 3}`,
            name: `Album ${i % 3 + 1}`,
            images: [{ url: '/placeholder.svg?height=64&width=64' }]
          },
          duration_ms: 180000 + i * 10000,
          popularity: 100 - i * 5
        }));
        
        // Mock albums
        const mockAlbums = Array.from({ length: 6 }, (_, i) => ({
          id: `album-${i}`,
          name: `Album ${i + 1}`,
          artists: [{ id, name: 'Artist Name' }],
          images: [{ url: '/placeholder.svg?height=160&width=160' }],
          album_type: i % 3 === 0 ? 'album' : i % 3 === 1 ? 'single' : 'compilation',
          release_date: `202${3 - Math.floor(i / 2)}`
        }));
        
        // Mock related artists
        const mockRelatedArtists = Array.from({ length: 6 }, (_, i) => ({
          id: `related-artist-${i}`,
          name: `Related Artist ${i + 1}`,
          images: [{ url: '/placeholder.svg?height=160&width=160' }]
        }));
        
        setArtist(mockArtist);
        setTopTracks(mockTopTracks);
        setAlbums(mockAlbums);
        setRelatedArtists(mockRelatedArtists);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching artist data:', error);
        setLoading(false);
      }
    };
    
    fetchArtistData();
  }, [id]);

  const handlePlayTrack = (track) => {
    playTrack(track, topTracks);
  };

  const formatFollowers = (count) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count;
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
      <div className="artist-header">
        <div className="artist-info">
          <div className="verified-badge">
            <svg viewBox="0 0 24 24" className="verified-icon">
              <path d="M12 1a11 11 0 1 0 0 22 11 11 0 0 0 0-22zm5.2 15.37l-1.93 1.93L12 15.03l-3.27 3.27-1.93-1.93L10.07 13 6.8 9.73l1.93-1.93L12 11.07l3.27-3.27 1.93 1.93L13.93 13l3.27 3.37z"></path>
            </svg>
            Verified Artist
          </div>
          <h1 className="artist-name">{artist.name}</h1>
          <div className="artist-stats">
            <span className="artist-monthly-listeners">{formatFollowers(artist.monthly_listeners)} monthly listeners</span>
          </div>
        </div>
      </div>
      
      <div className="artist-actions">
        <button className="play-all-button" onClick={() => handlePlayTrack(topTracks[0])}>
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 5.14v14l11-7-11-7z" fill="currentColor" />
          </svg>
        </button>
        <button className="follow-button">Follow</button>
        <button className="more-button">
          <svg viewBox="0 0 16 16" className="more-icon">
            <path d="M3 8a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm6.5 0a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zM16 8a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"></path>
          </svg>
        </button>
      </div>
      
      <div className="artist-content">
        <section className="popular-section">
          <h2 className="section-title">Popular</h2>
          <div className="popular-tracks">
            {topTracks.map((track, index) => (
              <div 
                key={track.id} 
                className="popular-track"
                onDoubleClick={() => handlePlayTrack(track)}
              >
                <div className="track-position">{index + 1}</div>
                <div className="track-cover">
                  <img 
                    src={track.album.images[0].url || "/placeholder.svg"} 
                    alt={track.album.name}
                    className="track-image"
                  />
                  <button 
                    className="track-play-button"
                    onClick={() => handlePlayTrack(track)}
                  >
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M8 5.14v14l11-7-11-7z" fill="currentColor" />
                    </svg>
                  </button>
                </div>
                <div className="track-info">
                  <div className="track-name">{track.name}</div>
                </div>
                <div className="track-popularity">
                  <div className="popularity-bar">
                    <div 
                      className="popularity-fill" 
                      style={{ width: `${track.popularity}%` }}
                    ></div>
                  </div>
                </div>
                <div className="track-duration">
                  {formatDuration(track.duration_ms)}
                </div>
              </div>
            ))}
          </div>
          <button className="see-more-button">See more</button>
        </section>
        
        <section className="discography-section">
          <div className="section-header">
            <h2 className="section-title">Discography</h2>
            <div className="section-tabs">
              <button className="section-tab active">All</button>
              <button className="section-tab">Albums</button>
              <button className="section-tab">Singles and EPs</button>
              <button className="section-tab">Compilations</button>
            </div>
          </div>
          
          <div className="albums-grid">
            {albums.map(album => (
              <Link 
                key={album.id} 
                to={`/album/${album.id}`}
                className="album-card"
              >
                <div className="album-cover">
                  <img 
                    src={album.images[0].url || "/placeholder.svg"} 
                    alt={album.name}
                    className="album-image"
                  />
                  <button className="album-play-button">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M8 5.14v14l11-7-11-7z" fill="currentColor" />
                    </svg>
                  </button>
                </div>
                <div className="album-info">
                  <h3 className="album-name">{album.name}</h3>
                  <div className="album-meta">
                    <span className="album-year">{album.release_date}</span>
                    <span className="meta-separator">•</span>
                    <span className="album-type">{album.album_type.charAt(0).toUpperCase() + album.album_type.slice(1)}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
        
        <section className="related-artists-section">
          <h2 className="section-title">Fans also like</h2>
          <div className="artists-grid">
            {relatedArtists.map(artist => (
              <Link 
                key={artist.id} 
                to={`/artist/${artist.id}`}
                className="artist-card"
              >
                <div className="artist-avatar">
                  <img 
                    src={artist.images[0].url || "/placeholder.svg"} 
                    alt={artist.name}
                    className="artist-avatar-image"
                  />
                  <button className="artist-play-button">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M8 5.14v14l11-7-11-7z" fill="currentColor" />
                    </svg>
                  </button>
                </div>
                <h3 className="artist-card-name">{artist.name}</h3>
                <div className="artist-card-type">Artist</div>
              </Link>
            ))}
          </div>
        </section>
        
        <section className="about-section">
          <h2 className="section-title">About</h2>
          <div className="about-content">
            <div className="artist-stats-card">
              <div className="monthly-listeners">
                <h3 className="stats-number">{formatFollowers(artist.monthly_listeners)}</h3>
                <div className="stats-label">Monthly Listeners</div>
              </div>
              <div className="followers">
                <h3 className="stats-number">{formatFollowers(artist.followers.total)}</h3>
                <div className="stats-label">Followers</div>
              </div>
            </div>
            
            <div className="artist-bio">
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, 
                nunc sit amet ultricies lacinia, nisl nisl aliquam nisl, eget aliquam
                nisl nisl sit amet nisl. Sed euismod, nunc sit amet ultricies lacinia,
                nisl nisl aliquam nisl, eget aliquam nisl nisl sit amet nisl.
              </p>
            </div>
            
            <div className="artist-genres">
              <h3 className="genres-title">Genres:</h3>
              <div className="genres-list">
                {artist.genres.map(genre => (
                  <span key={genre} className="genre-tag">{genre}</span>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

const formatDuration = (ms) => {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

export default ArtistPage;
