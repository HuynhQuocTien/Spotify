import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import { useMusicPlayer } from "../contexts/MusicPlayerContext"
import api from "../services/api"
import "./UserAlbumPage.css"

const UserAlbumPage = () => {
  const { id } = useParams()
  const [album, setAlbum] = useState(null)
  const [tracks, setTracks] = useState([])
  const [loading, setLoading] = useState(true)
  const { playTrack, currentTrack, togglePlay } = useMusicPlayer()

  useEffect(() => {
    const fetchAlbumData = async () => {
      try {
        const [albumRes, tracksRes] = await Promise.all([
          api.getUserAlbum(id),
          api.getAlbumTracks(id) // Giả sử API tương tự
        ])
        setAlbum(albumRes.data)
        setTracks(tracksRes.data.tracks || [])
      } catch (error) {
        console.error("Error fetching album data:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchAlbumData()
  }, [id])

  const handlePlayTrack = (track, index) => {
    if (currentTrack?.id === track.id) {
      togglePlay()
      return
    }

    const contextUri = `user-album:${album.id}`
    playTrack({
      id: track.id,
      name: track.title,
      artists: track.artists || [],
      album: {
        name: album.title,
        image: album.cover_image || ""
      },
      duration: track.duration || 0,
      audio: track.audio_file,
      image: track.image || album.cover_image,
      contextUri,
      contextTracks: tracks
    })
  }

  const handleRemoveTrack = async (trackId) => {
    try {
      await api.removeTrackFromUserAlbum(id, trackId)
      setTracks(tracks.filter(track => track.id !== trackId))
    } catch (error) {
      console.error("Error removing track:", error)
    }
  }

  if (loading) {
    return <div className="loading-spinner" />
  }

  if (!album) {
    return <div className="not-found">Album not found</div>
  }

  return (
    <div className="user-album-page">
      <div className="album-header">
        <div className="album-cover">
          {album.cover_image ? (
            <img src={album.cover_image} alt={album.title} />
          ) : (
            <div className="default-cover">
              <span>{album.title.charAt(0)}</span>
            </div>
          )}
        </div>
        <div className="album-info">
          <h1 className="album-title">{album.title}</h1>
          <p className="album-description">{album.description}</p>
          <p className="album-meta">{tracks.length} tracks</p>
        </div>
      </div>

      <div className="album-tracks">
        <div className="tracks-header">
          <div className="header-number">#</div>
          <div className="header-title">Title</div>
          <div className="header-actions">Actions</div>
        </div>

        <div className="tracks-list">
          {tracks.map((track, index) => (
            <div key={track.id} className="track-item">
              <div className="track-number">
                <span>{index + 1}</span>
                <button 
                  className="play-btn"
                  onClick={() => handlePlayTrack(track, index)}
                >
                  Play
                </button>
              </div>
              <div className="track-info">
                <div className="track-title">{track.title}</div>
                <div className="track-artist">
                  {track.artists?.map(artist => artist.name).join(", ")}
                </div>
              </div>
              <div className="track-actions">
                <button 
                  className="remove-btn"
                  onClick={() => handleRemoveTrack(track.id)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default UserAlbumPage