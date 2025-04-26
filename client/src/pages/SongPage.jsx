"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useMusicPlayer } from "../contexts/MusicPlayerContext"
import "./SongPage.css"
import api from "../services/api"

const SongPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [song, setSong] = useState(null)
  const [loading, setLoading] = useState(true)
  const [relatedSongs, setRelatedSongs] = useState([])
  const { playSong, currentSong, isPlaying, togglePlay } = useMusicPlayer()
  

  useEffect(() => {
    const fetchSongData = async () => {
      try {
        setLoading(true)
        
        // Fetch song details
        const songRes = await api.getSong(id)
        setSong(songRes.data)
        
        // Fetch related songs (could be from same album or artist)
        const relatedRes = await api.getRelatedSongs(id)
        setRelatedSongs(relatedRes.data.songs.slice(0, 5))
        
        setLoading(false)
      } catch (error) {
        console.error("Error fetching song data:", error)
        setLoading(false)
      }
    }

    fetchSongData()
  }, [id])

  const handlePlayClick = () => {
    if (currentSong?.id === song.id) {
      togglePlay()
    } else {
      playSong({
        id: song.id,
        name: song.name,
        artists: song.artists || [],
        album: song.album || { name: '', image: '' },
        duration: song.duration || 0,
        audio: song.audio || song.preview_url,
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
    <div className="song-page">
      <div className="song-header">
        <div className="song-cover">
          <img 
            src={song.image || song.album?.image || "/placeholder.svg"} 
            alt={song.name} 
            className="song-image" 
          />
        </div>
        
        <div className="song-info">
          <h1 className="song-title">{song.name}</h1>
          
          <div className="song-artists">
            {song.artists.map((artist, index) => (
              <span key={artist.id}>
                <Link to={`/artist/${artist.id}`} className="artist-link">
                  {artist.name}
                </Link>
                {index < song.artists.length - 1 && ', '}
              </span>
            ))}
          </div>
          
          <div className="song-album">
            From the album: <Link to={`/album/${song.album?.id}`}>{song.album?.name}</Link>
          </div>
          
          <div className="song-meta">
            <span>{formatDuration(song.duration)}</span>
            <span>•</span>
            <span>{song.popularity}% popularity</span>
          </div>
          
          <div className="song-actions">
            <button 
              className={`play-button ${currentSong?.id === song.id && isPlaying ? 'playing' : ''}`}
              onClick={handlePlayClick}
            >
              {currentSong?.id === song.id && isPlaying ? 'Pause' : 'Play'}
            </button>
            
            <button className="add-to-playlist">
              Add to Playlist
            </button>
          </div>
        </div>
      </div>
      
      <div className="song-details">
        <div className="lyrics-section">
          <h3>Lyrics</h3>
          {song.lyrics ? (
            <pre className="lyrics-text">{song.lyrics}</pre>
          ) : (
            <p>No lyrics available for this song.</p>
          )}
        </div>
        
        {relatedSongs.length > 0 && (
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
        )}
      </div>
    </div>
  )
}

export default SongPage