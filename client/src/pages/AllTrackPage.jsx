"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useMusicPlayer } from "../contexts/MusicPlayerContext"
import "./AllTracksPage.css"
import api from "../services/api"

const AllTracksPage = () => {
  const { playlistId, albumId } = useParams()
  const navigate = useNavigate()
  const [tracks, setTracks] = useState([])
  const [loading, setLoading] = useState(true)
  const [contextInfo, setContextInfo] = useState(null)
  const { playTrack, currentTrack, isPlaying, togglePlay } = useMusicPlayer()

  useEffect(() => {
    const fetchTracks = async () => {
      try {
        setLoading(true)
        
        if (playlistId) {
          const playlistRes = await api.getPlaylistTracks(playlistId)
          setTracks(playlistRes.data.tracks)
          setContextInfo({
            type: 'playlist',
            name: playlistRes.data.name,
            image: playlistRes.data.image
          })
        } else if (albumId) {
          const albumRes = await api.getAlbumTracks(albumId)
          setTracks(albumRes.data.tracks)
          setContextInfo({
            type: 'album',
            name: albumRes.data.name,
            image: albumRes.data.image
          })
        }
        
        setLoading(false)
      } catch (error) {
        console.error("Error fetching tracks:", error)
        setLoading(false)
      }
    }

    fetchTracks()
  }, [playlistId, albumId])

  const handlePlayTrack = (track, index) => {
    if (currentTrack?.id === track.id && currentTrack?.contextUri === `${contextInfo.type}:${playlistId || albumId}`) {
      togglePlay()
    } else {
      playTrack({
        ...track,
        contextUri: `${contextInfo.type}:${playlistId || albumId}`,
        contextTracks: tracks
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
      <div className="tracks-loading">
        <div className="loading-spinner"></div>
      </div>
    )
  }

  return (
    <div className="all-tracks-page">
      <div className="tracks-header">
        {contextInfo?.image && (
          <img 
            src={contextInfo.image} 
            alt={contextInfo.name} 
            className="context-image"
          />
        )}
        
        <div className="tracks-header-info">
          <h1>{contextInfo?.name || 'All Tracks'}</h1>
          <p>{tracks.length} tracks</p>
          
          <div className="tracks-actions">
            <button 
              className="play-all-button"
              onClick={() => handlePlayTrack(tracks[0], 0)}
            >
              Play All
            </button>
          </div>
        </div>
      </div>
      
      <div className="tracks-list">
        <div className="tracks-list-header">
          <div className="track-number">#</div>
          <div className="track-title">Title</div>
          <div className="track-duration">
            <svg viewBox="0 0 16 16" className="duration-icon">
              <path d="M8 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13zM0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8z"></path>
              <path d="M8 3.25a.75.75 0 0 1 .75.75v3.25H11a.75.75 0 0 1 0 1.5H7.25V4A.75.75 0 0 1 8 3.25z"></path>
            </svg>
          </div>
        </div>
        
        {tracks.map((track, index) => (
          <div
            key={track.id}
            className={`track-item ${currentTrack?.id === track.id ? 'active' : ''}`}
            onDoubleClick={() => handlePlayTrack(track, index)}
          >
            <div className="track-number">
              <span className="track-index">{index + 1}</span>
              <button 
                className="track-play-button"
                onClick={() => handlePlayTrack(track, index)}
              >
                {currentTrack?.id === track.id && isPlaying ? (
                  <svg viewBox="0 0 24 24">
                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </button>
            </div>
            
            <div className="track-info">
              <div className="track-title">
                <Link to={`/track/${track.id}`} className="track-link">
                  {track.name}
                </Link>
              </div>
              <div className="track-artists">
                {track.artists.map((artist, i) => (
                  <span key={artist.id}>
                    <Link to={`/artist/${artist.id}`} className="artist-link">
                      {artist.name}
                    </Link>
                    {i < track.artists.length - 1 && ', '}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="track-duration">
              {formatDuration(track.duration_ms || track.duration || 0)}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default AllTracksPage