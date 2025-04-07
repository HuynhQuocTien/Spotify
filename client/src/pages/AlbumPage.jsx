"use client"

import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import { useMusicPlayer } from "../contexts/MusicPlayerContext"
import "./PlaylistPage.css" // Reusing playlist styles

const AlbumPage = () => {
  const { id } = useParams()
  const [album, setAlbum] = useState(null)
  const [loading, setLoading] = useState(true)
  const { playTrack } = useMusicPlayer()

  useEffect(() => {
    const fetchAlbum = async () => {
      try {
        setLoading(true)
        // In a real app, this would be an API call
        await new Promise((resolve) => setTimeout(resolve, 500))

        // Mock album data
        const mockAlbum = {
          id,
          name: "Album Title",
          artists: [{ id: "artist1", name: "Artist Name" }],
          release_date: "2023-01-01",
          images: [{ url: "/placeholder.svg?height=300&width=300" }],
          total_tracks: 12,
          tracks: {
            items: Array.from({ length: 12 }, (_, i) => ({
              id: `track-${i}`,
              name: `Track ${i + 1}`,
              artists: [{ id: "artist1", name: "Artist Name" }],
              duration_ms: 180000 + i * 10000,
              track_number: i + 1,
            })),
          },
        }

        setAlbum(mockAlbum)
        setLoading(false)
      } catch (error) {
        console.error("Error fetching album:", error)
        setLoading(false)
      }
    }

    fetchAlbum()
  }, [id])

  const handlePlayTrack = (track, index) => {
    // Get all tracks from the album
    const tracks = album.tracks.items

    // Play the clicked track and add the rest to the queue
    const tracksAfterCurrent = tracks.slice(index + 1)
    const tracksBeforeCurrent = tracks.slice(0, index)

    playTrack(track, [...tracksAfterCurrent, ...tracksBeforeCurrent])
  }

  const formatDuration = (ms) => {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  const formatReleaseDate = (dateString) => {
    const date = new Date(dateString)
    return date.getFullYear()
  }

  if (loading) {
    return (
      <div className="playlist-loading">
        <div className="loading-spinner"></div>
      </div>
    )
  }

  if (!album) {
    return (
      <div className="playlist-error">
        <h2>Album not found</h2>
        <p>The album you're looking for doesn't exist or has been removed.</p>
      </div>
    )
  }

  return (
    <div className="playlist-page">
      <div className="playlist-header">
        <div className="playlist-cover">
          <img src={album.images[0].url || "/placeholder.svg"} alt={album.name} className="playlist-image" />
        </div>
        <div className="playlist-info">
          <div className="playlist-type">Album</div>
          <h1 className="playlist-name">{album.name}</h1>
          <div className="playlist-meta">
            <span className="playlist-owner">{album.artists.map((artist) => artist.name).join(", ")}</span>
            <span className="meta-separator">•</span>
            <span className="playlist-year">{formatReleaseDate(album.release_date)}</span>
            <span className="meta-separator">•</span>
            <span className="playlist-tracks">{album.total_tracks} songs</span>
          </div>
        </div>
      </div>

      <div className="playlist-actions">
        <button className="play-all-button" onClick={() => handlePlayTrack(album.tracks.items[0], 0)}>
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 5.14v14l11-7-11-7z" fill="currentColor" />
          </svg>
        </button>
      </div>

      <div className="playlist-tracks">
        <div className="tracks-header album-tracks-header">
          <div className="track-number">#</div>
          <div className="track-title">Title</div>
          <div className="track-duration">
            <svg viewBox="0 0 16 16" className="duration-icon">
              <path d="M8 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13zM0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8z"></path>
              <path d="M8 3.25a.75.75 0 0 1 .75.75v3.25H11a.75.75 0 0 1 0 1.5H7.25V4A.75.75 0 0 1 8 3.25z"></path>
            </svg>
          </div>
        </div>

        <div className="tracks-list">
          {album.tracks.items.map((track, index) => (
            <div
              key={track.id}
              className="track-item album-track-item"
              onDoubleClick={() => handlePlayTrack(track, index)}
            >
              <div className="track-number">
                <span className="track-index">{track.track_number}</span>
                <button className="track-play-button" onClick={() => handlePlayTrack(track, index)}>
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 5.14v14l11-7-11-7z" fill="currentColor" />
                  </svg>
                </button>
              </div>
              <div className="track-title album-track-title">
                <div className="track-info">
                  <div className="track-name">{track.name}</div>
                  <div className="track-artist">{track.artists.map((artist) => artist.name).join(", ")}</div>
                </div>
              </div>
              <div className="track-duration">{formatDuration(track.duration_ms)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default AlbumPage

