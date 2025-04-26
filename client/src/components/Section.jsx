"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import { useMusicPlayer } from "../contexts/MusicPlayerContext"
import "./Section.css"
import api, { getMediaUrl } from "../services/api"


const Section = ({
  title,
  items = [],
  seeAllLink,
  type = "grid", // 'grid' | 'list' | 'carousel' | 'songlist'
  limit = 6,
  showPlayButton = true
}) => {
  const { playSong, currentSong, isPlaying, togglePlay } = useMusicPlayer()
  const [hoveredItem, setHoveredItem] = useState(null)
  const [expandedAlbum, setExpandedAlbum] = useState(null)
  const handlePlayClick = async (e, item) => {
    e.preventDefault()
    e.stopPropagation()

    try {
      let songs = []
      let contextUri = null

      switch (item.type) {
        case 'video':
          if (currentSong?.id === item.id) {
            togglePlay()
            return
          }
          playSong({
            id: item.id,
            name: item.name,
            artists: item.artists || [],
            album: { name: 'Video', image: item.image },
            duration: item.duration || item.duration_ms || 0,
            audio: item.video, // Dùng `audio` làm key chung cho audio/video
            image: item.image,
            isVideo: true // (Tuỳ chọn) flag để frontend biết đây là video
          })
          break
        case 'song':
          if (currentSong?.id === item.id) {
            togglePlay()
            return
          }
          playSong({
            id: item.id,
            name: item.name,
            artists: item.artists || [],
            album: item.album || { name: '', image: '' },
            duration: item.duration || 0,
            audio: item.audio || item.preview_url,
            image: item.image || item.album?.image || item.album?.cover_image
          })
          break

        case 'playlist':
          const playlistRes = await api.getPlaylistSongs(item.id)
          songs = playlistRes.data.songs
          if (songs.length > 0) {
            contextUri = `playlist:${item.id}`
            playSong({
              ...songs[0],
              contextUri,
              contextSongs: songs
            })
          }
          break

        case 'album':
          const albumRes = await api.getAlbumSongs(item.id)
          songs = albumRes.data.songs
          if (songs.length > 0) {
            contextUri = `album:${item.id}`
            playSong({
              ...songs[0],
              contextUri,
              contextSongs: songs
            })
          }
          break

        case 'artist':
          const artistRes = await api.getArtistTopSongs(item.id)
          songs = artistRes.data.songs
          if (songs.length > 0) {
            contextUri = `artist:${item.id}`
            playSong({
              ...songs[0],
              contextUri,
              contextSongs: songs
            })
          }
          break

        default:
          console.warn('Unknown item type:', item.type)
      }
    } catch (error) {
      console.error("Error playing song:", error)
    }
  }

  const isCurrentSongPlaying = (item) => {
    if (item.type === 'song' || item.type === 'song') {
      return currentSong?.id === item.id && isPlaying
    }
    return currentSong?.contextUri === `${item.type}:${item.id}` && isPlaying
  }

  const formatDuration = (ms) => {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  const toggleAlbumExpand = (albumId) => {
    setExpandedAlbum(expandedAlbum === albumId ? null : albumId)
  }

  const displayedItems = items.slice(0, limit)

  if (displayedItems.length === 0) return null

  return (
    <section className={`section ${type}`}>
      <div className="section-header">
        <Link to={seeAllLink || `#`} className="section-title-link">
          <h2 className="section-title">{title}</h2>
        </Link>


        {seeAllLink && (
          <Link to={seeAllLink} className="see-all-link">
            Show all
          </Link>
        )}
      </div>

      {type === 'songlist' ? (
        <div className="album-songlist">
          {displayedItems.map((album) => (
            <div key={album.id} className="album-container">
              <div
                className="album-header"
                onClick={() => toggleAlbumExpand(album.id)}
              >
                <img
                  src={album.image || album.cover_image || getMediaUrl('/test.png')}
                  alt={album.name}
                  className="album-thumbnail"
                />
                <div className="album-info">
                  <h3>{album.name}</h3>
                  <p>{album.artists?.map(a => a.name).join(', ') || 'Various Artists'}</p>
                  <p>{album.total_songs || album.songs?.length || 0} songs</p>
                </div>
                <button
                  className="expand-button"
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleAlbumExpand(album.id)
                  }}
                >
                  {expandedAlbum === album.id ? '▼' : '▶'}
                </button>
              </div>

              {expandedAlbum === album.id && album.songs && (
                <div className="songlist">
                  {album.songs.map((song, index) => (
                    <div
                      key={song.id}
                      className="song-item"
                      onDoubleClick={() => handlePlayClick({ preventDefault: () => { } }, song)}
                    >
                      <div className="song-number">{index + 1}</div>
                      <div className="song-info">
                        <div className="song-name">{song.name}</div>
                        <div className="song-artists">
                          {song.artists?.map(a => a.name).join(', ')}
                        </div>
                      </div>
                      <div className="song-duration">
                        {formatDuration(song.duration_ms || song.duration || 0)}
                      </div>
                      <button
                        className="play-song-button"
                        onClick={(e) => handlePlayClick(e, song)}
                      >
                        <svg viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className={`section-items ${type}`}>
          {displayedItems.map((item) => (
            <Link
              key={item.id}
              to={`/${(item.type === 'song' || item.type === 'song') ? 'song' : item.type}/${item.id}`}
              className={`section-item ${currentSong?.contextUri === `${item.type}:${item.id}` ? 'active' : ''}`}
              onMouseEnter={() => setHoveredItem(item.id)}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <div className="item-image-container">
                {item.type === 'video' ? (
                  <video
                    src={item.video}
                    poster={item.image}
                    controls
                    className="item-video"
                  />
                ) : (
                  <img
                    src={item.image || item.album?.image || item.album?.cover_image || getMediaUrl('/test.png')}
                    alt={item.name}
                    className="item-image"
                    loading="lazy"
                  />
                )}


                {showPlayButton && item.type !== 'video' && (hoveredItem === item.id || isCurrentSongPlaying(item)) && (
                  <button
                    className={`play-button ${isCurrentSongPlaying(item) ? 'playing' : ''}`}
                    onClick={(e) => handlePlayClick(e, item)}
                    aria-label={`Play ${item.name}`}
                  >
                    <svg viewBox="0 0 24 24">
                      <path d={isCurrentSongPlaying(item) ? "M6 19h4V5H6v14zm8-14v14h4V5h-4z" : "M8 5v14l11-7z"} />
                    </svg>
                  </button>
                )}

              
              </div>

              <div className="item-info">
                <h3 className="item-title">{item.name}</h3>
                <p className="item-subtitle">
                  {item.description || (
                    <>
                      {item.type === 'playlist' && `By ${item.owner?.display_name || 'Unknown'}`}
                      {item.type === 'album' && `By ${item.artists?.map(a => a.name).join(', ') || 'Various Artists'}`}
                      {item.type === 'artist' && 'Artist'}
                      {(item.type === 'song' || item.type === 'song') &&
                        `${item.artists?.map(a => a.name).join(', ')}${item.album ? ` • ${item.album.name}` : ''}`}

                      {(item.type === 'video') &&
                        `${item.artists?.map(a => a.name).join(', ')}${item.album ? ` • ${item.album.name}` : ''}`}
                    </>
                  )}
                </p>
              </div>
            </Link>

          ))}
        </div>
      )}
    </section>
  )
}

export default Section
