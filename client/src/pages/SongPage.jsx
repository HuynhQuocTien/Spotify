"use client"

import { useState, useEffect, use } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { useMusicPlayer } from "../contexts/MusicPlayerContext"
import "./SongPage.css"
import api from "../services/api"
import HeartFilledIcon from '../components/HeartFilledIcon';
import HeartOutlineIcon from '../components/HeartOutlineIcon';


const SongPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [song, setSong] = useState(null)
  const [loading, setLoading] = useState(true)
  const { playSong, currentSong, isPlaying, togglePlay,updateFavorites } = useMusicPlayer()

  const FAVORITE_TYPE = {
    SONG: 'song',
    ALBUM: 'album'
  };
  useEffect(() => {
    const fetchSongData = async () => {
      try {
        setLoading(true)
        
        // Fetch song details
        const songRes = await api.getSong(id)
        setSong(songRes.data)
        setLoading(false)
        try {
          const favRes = await api.checkFavoriteStatus(id,'song')
        } catch (err) {
          console.error("Error checking favorite status:", err)
        }
      } catch (error) {
        console.error("Error fetching song data:", error)
        setLoading(false)
      }
    }

    fetchSongData()
  }, [id])

    // Thêm vào hàm handleToggleFavorite
  const handleToggleFavorite = async (e, songId, isCurrentlyFavorite) => {
    e.stopPropagation();
    const newState = !isCurrentlyFavorite;

    // Optimistic UI update
    setSong({ ...song, is_favorite: newState });

    // Update localStorage
    localStorage.setItem(`favorite_${FAVORITE_TYPE.SONG}_${songId}`, JSON.stringify(newState));

    try {
      // Gọi API để đồng bộ với server
      await api.addFavoriteSong(songId, FAVORITE_TYPE.SONG);

      // Cập nhật context nếu cần
      updateFavorites && updateFavorites(songId, FAVORITE_TYPE.SONG, newState ? 'add' : 'remove');
    } catch (err) {
      // Rollback nếu có lỗi
      setSong({ ...song, is_favorite: isCurrentlyFavorite });

      localStorage.setItem(`favorite_${FAVORITE_TYPE.SONG}_${songId}`, JSON.stringify(isCurrentlyFavorite));

      console.error('Toggle favorite failed:', err);
      alert('Failed to update favorite. Please try again.');
    }
  };
  const handlePlayClick = () => {
    if (currentSong?.id === song.id) {
      togglePlay()
    } else {
      playSong({
        id: song.id,
        name: song.name,
        artists: song.artists || [],
        album: song.album || { 
          title: "",
          artist: {
            name: "",
            image: ""
        },
        cover_image: "",
        release_date: "" 
      },
        duration: song.duration || 0,
        audio: song.audio_file || song.preview_url,
        image: song.image || song.album?.image || song.album?.cover_image
      })
    }
  }

  const formatDuration = (ms) => {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }  
  


  if (loading) {
    return (
      <div className="song-loading">
        <div className="loading-spinner"></div>
      </div>
    )
  }

  if (!song) {
    return (
      <div className="song-error">
        <h2>Song not found</h2>
        <p>The song you're looking for doesn't exist or has been removed.</p>
        <button onClick={() => navigate(-1)}>Go back</button>
      </div>
    )
  }

  return (
    <div className="song-page-s">
      <div className="song-header-s">
        <div className="song-cover-s">
          <img 
            src={song.image || song.album?.cover_image || "/placeholder.svg"} 
            alt={song.title} 
            className="song-image-s" 
          />
        </div>
        
        <div className="song-info-s">
          <h1 className="song-title-s">{song.title}</h1>
          
          <div className="song-artists-s">
            {song.artists.map((artist, index) => (
              <span key={artist.id}>
                <Link to={`/artist/${artist.id}`} className="artist-link">
                  {artist.name}
                </Link>
                {index < song.artists.length - 1 && ', '}
              </span>
            ))}
          </div>
          
          <div className="song-album-s">
            From the album: <Link to={`/album/${song.album?.id}`}>{song.album?.title}</Link>
          </div>
          
          <div className="song-meta-s">
            <span>{song.duration}</span>
            {/* <span>•</span>
            <span>{song.popularity}% popularity</span> */}
          </div>
          
          <div className="song-actions">
            <button 
              className={`play-button-s ${currentSong?.id === song.id && isPlaying ? 'playing' : ''}`}
              onClick={handlePlayClick}
            >
              {currentSong?.id === song.id && isPlaying ? 'Pause' : 'Play'}
            </button>
            
            <button className="add-to-playlist-s">
              Add to Playlist
            </button>
            <button 
              className={`favorite-button-s ${song.is_favorite ? 'favorite-active' : ''}`}
              onClick={(e) => handleToggleFavorite(e, song.id, song.is_favorite)}
              aria-label={song.is_favorite ? "Remove from favorites" : "Add to favorites"}
              title={song.is_favorite ? "Remove from favorites" : "Add to favorites"}
            >
              {song.is_favorite ? (
                    <HeartFilledIcon className="heart-icon" />
                  ) : (
                    <HeartOutlineIcon className="heart-icon" />
                  )}
            </button>
          </div>
        </div>
      </div>
      
      <div className="song-details-s">
        <div className="lyrics-section-s">
          <h3>Lyrics</h3>
          {song.lyrics ? (
            <pre className="lyrics-text-s">{song.lyrics}</pre>
          ) : (
            <p>No lyrics available for this song.</p>
          )}
        </div>
        
        {/* {relatedSongs.length > 0 && (
          <div className="related-songs">
            <h3>You might also like</h3>
            <div className="related-songs-list">
              {relatedSongs.map(relatedSong => (
                <div 
                  key={relatedSong.id} 
                  className="related-song-item"
                  onClick={() => navigate(`/song/${relatedSong.id}`)}
                >
                  <img 
                    src={relatedSong.image || relatedSong.album?.image || "/placeholder.svg"} 
                    alt={relatedSong.name}
                    className="related-song-image"
                  />
                  <div className="related-song-info">
                    <h4>{relatedSong.name}</h4>
                    <p>
                      {relatedSong.artists.map(a => a.name).join(', ')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )} */}
      </div>
    </div>
  )
}

export default SongPage