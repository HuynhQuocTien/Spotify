"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useMusicPlayer } from "../contexts/MusicPlayerContext"
import "./TrackPage.css"
import api from "../services/api"

const TrackPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [track, setTrack] = useState(null)
  const [loading, setLoading] = useState(true)
  const [relatedTracks, setRelatedTracks] = useState([])
  const { playTrack, currentTrack, isPlaying, togglePlay } = useMusicPlayer()

  useEffect(() => {
    const fetchTrackData = async () => {
      try {
        setLoading(true)
        
        // Fetch track details
        const trackRes = await api.getSong(id)
        setTrack(trackRes.data)
        
        // Fetch related tracks (could be from same album or artist)
        const relatedRes = await api.getRelatedTracks(id)
        setRelatedTracks(relatedRes.data.tracks.slice(0, 5))
        
        setLoading(false)
      } catch (error) {
        console.error("Error fetching track data:", error)
        setLoading(false)
      }
    }

    fetchTrackData()
  }, [id])

  const handlePlayClick = () => {
    if (currentTrack?.id === track.id) {
      togglePlay()
    } else {
      playTrack({
        id: track.id,
        name: track.name,
        artists: track.artists || [],
        album: track.album || { name: '', image: '' },
        duration: track.duration || 0,
        audio: track.audio || track.preview_url,
        image: track.image || track.album?.image || track.album?.cover_image
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
      <div className="track-loading">
        <div className="loading-spinner"></div>
      </div>
    )
  }

  if (!track) {
    return (
      <div className="track-error">
        <h2>Track not found</h2>
        <p>The track you're looking for doesn't exist or has been removed.</p>
        <button onClick={() => navigate(-1)}>Go back</button>
      </div>
    )
  }

  return (
    <div className="track-page">
      <div className="track-header">
        <div className="track-cover">
          <img 
            src={track.image || track.album?.image || "/placeholder.svg"} 
            alt={track.name} 
            className="track-image" 
          />
        </div>
        
        <div className="track-info">
          <h1 className="track-title">{track.name}</h1>
          
          <div className="track-artists">
            {track.artists.map((artist, index) => (
              <span key={artist.id}>
                <Link to={`/artist/${artist.id}`} className="artist-link">
                  {artist.name}
                </Link>
                {index < track.artists.length - 1 && ', '}
              </span>
            ))}
          </div>
          
          <div className="track-album">
            From the album: <Link to={`/album/${track.album?.id}`}>{track.album?.name}</Link>
          </div>
          
          <div className="track-meta">
            <span>{formatDuration(track.duration)}</span>
            <span>•</span>
            <span>{track.popularity}% popularity</span>
          </div>
          
          <div className="track-actions">
            <button 
              className={`play-button ${currentTrack?.id === track.id && isPlaying ? 'playing' : ''}`}
              onClick={handlePlayClick}
            >
              {currentTrack?.id === track.id && isPlaying ? 'Pause' : 'Play'}
            </button>
            
            <button className="add-to-playlist">
              Add to Playlist
            </button>
          </div>
        </div>
      </div>
      
      <div className="track-details">
        <div className="lyrics-section">
          <h3>Lyrics</h3>
          {track.lyrics ? (
            <pre className="lyrics-text">{track.lyrics}</pre>
          ) : (
            <p>No lyrics available for this track.</p>
          )}
        </div>
        
        {relatedTracks.length > 0 && (
          <div className="related-tracks">
            <h3>You might also like</h3>
            <div className="related-tracks-list">
              {relatedTracks.map(relatedTrack => (
                <div 
                  key={relatedTrack.id} 
                  className="related-track-item"
                  onClick={() => navigate(`/track/${relatedTrack.id}`)}
                >
                  <img 
                    src={relatedTrack.image || relatedTrack.album?.image || "/placeholder.svg"} 
                    alt={relatedTrack.name}
                    className="related-track-image"
                  />
                  <div className="related-track-info">
                    <h4>{relatedTrack.name}</h4>
                    <p>
                      {relatedTrack.artists.map(a => a.name).join(', ')}
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

export default TrackPage