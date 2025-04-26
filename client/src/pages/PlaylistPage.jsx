import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useMusicPlayer } from '../contexts/MusicPlayerContext';
// import './PlaylistPage.css';

const PlaylistPage = () => {
  const { id } = useParams();
  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const { playSong } = useMusicPlayer();

  useEffect(() => {
    const fetchPlaylist = async () => {
      try {
        setLoading(true);
        // In a real app, this would be an API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Mock playlist data
        const mockPlaylist = {
          id,
          name: id === '1' ? 'Liked Songs' : 'Discover Weekly',
          description: id === '1' 
            ? 'Your liked songs' 
            : 'Your weekly mixtape of fresh music. Enjoy new discoveries and deep cuts chosen just for you.',
          owner: { display_name: id === '1' ? 'You' : 'Spotify' },
          followers: { total: id === '1' ? 0 : 12345678 },
          images: [{ url: '/placeholder.svg?height=300&width=300' }],
          songs: {
            total: 30,
            items: Array.from({ length: 30 }, (_, i) => ({
              added_at: new Date(Date.now() - i * 86400000).toISOString(),
              song: {
                id: `song-${i}`,
                name: `Song ${i + 1}`,
                artists: [{ name: `Artist ${i % 5 + 1}` }],
                album: {
                  name: `Album ${Math.floor(i / 3) + 1}`,
                  images: [{ url: '/placeholder.svg?height=40&width=40' }],
                  release_date: '2023-01-01'
                },
                duration_ms: 180000 + i * 10000
              }
            }))
          }
        };
        
        setPlaylist(mockPlaylist);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching playlist:', error);
        setLoading(false);
      }
    };
    
    fetchPlaylist();
  }, [id]);

  const handlePlaySong = (song, index) => {
    // Get all songs from the playlist
    const songs = playlist.songs.items.map(item => item.song);
    
    // Play the clicked song and add the rest to the queue
    const songsAfterCurrent = songs.slice(index + 1);
    const songsBeforeCurrent = songs.slice(0, index);
    
    playSong(song, [...songsAfterCurrent, ...songsBeforeCurrent]);
  };

  const formatDuration = (ms) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
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
      <div className="playlist-loading">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="playlist-error">
        <h2>Playlist not found</h2>
        <p>The playlist you're looking for doesn't exist or has been removed.</p>
      </div>
    );
  }

  return (
    <div className="playlist-page">
      <div className="playlist-header">
        <div className="playlist-cover">
          <img 
            src={playlist.images[0].url || "/placeholder.svg"} 
            alt={playlist.name}
            className="playlist-image"
          />
        </div>
        <div className="playlist-info">
          <div className="playlist-type">Playlist</div>
          <h1 className="playlist-name">{playlist.name}</h1>
          <div className="playlist-description">{playlist.description}</div>
          <div className="playlist-meta">
            <span className="playlist-owner">{playlist.owner.display_name}</span>
            {playlist.followers.total > 0 && (
              <>
                <span className="meta-separator">•</span>
                <span className="playlist-followers">{formatFollowers(playlist.followers.total)} likes</span>
              </>
            )}
            <span className="meta-separator">•</span>
            <span className="playlist-songs">{playlist.songs.total} songs</span>
          </div>
        </div>
      </div>
      
      <div className="playlist-actions">
        <button className="play-all-button" onClick={() => handlePlaySong(playlist.songs.items[0].song, 0)}>
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 5.14v14l11-7-11-7z" fill="currentColor" />
          </svg>
        </button>
      </div>
      
      <div className="playlist-songs">
        <div className="songs-header">
          <div className="song-number">#</div>
          <div className="song-title">Title</div>
          <div className="song-album">Album</div>
          <div className="song-date-added">Date added</div>
          <div className="song-duration">
            <svg viewBox="0 0 16 16" className="duration-icon">
              <path d="M8 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13zM0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8z"></path>
              <path d="M8 3.25a.75.75 0 0 1 .75.75v3.25H11a.75.75 0 0 1 0 1.5H7.25V4A.75.75 0 0 1 8 3.25z"></path>
            </svg>
          </div>
        </div>
        
        <div className="songs-list">
          {playlist.songs.items.map((item, index) => (
            <div 
              key={item.song.id} 
              className="song-item"
              onDoubleClick={() => handlePlaySong(item.song, index)}
            >
              <div className="song-number">
                <span className="song-index">{index + 1}</span>
                <button 
                  className="song-play-button"
                  onClick={() => handlePlaySong(item.song, index)}
                >
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 5.14v14l11-7-11-7z" fill="currentColor" />
                  </svg>
                </button>
              </div>
              <div className="song-title">
                <img 
                  src={item.song.album.images[0].url || "/placeholder.svg"} 
                  alt={item.song.name}
                  className="song-image"
                />
                <div className="song-info">
                  <div className="song-name">{item.song.name}</div>
                  <div className="song-artist">{item.song.artists.map(artist => artist.name).join(', ')}</div>
                </div>
              </div>
              <div className="song-album">{item.song.album.name}</div>
              <div className="song-date-added">{formatDate(item.added_at)}</div>
              <div className="song-duration">{formatDuration(item.song.duration_ms)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PlaylistPage;
