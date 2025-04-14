"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import { useMusicPlayer } from "../contexts/MusicPlayerContext"
import "./Section.css"
import api from "../services/api"
import { getMediaUrl } from "../services/api"

const Section = ({ 
  title, 
  items = [], 
  seeAllLink, 
  type = "grid", // 'grid' | 'list' | 'carousel'
  limit = 6,
  showPlayButton = true
}) => {
  const { playTrack, currentTrack, isPlaying, togglePlay } = useMusicPlayer()
  const [hoveredItem, setHoveredItem] = useState(null)
  
  const handlePlayClick = async (e, item) => {
    e.preventDefault()
    e.stopPropagation()
  
    try {
      let tracks = []
      let contextUri = null
      
      // Xử lý từng loại item khác nhau
      switch (item.type) {
        case 'track':
        case 'song':
          // Nếu đang phát bài hát này rồi thì toggle play/pause
          if (currentTrack?.id === item.id) {
            togglePlay()
            return
          }
          console.log("Playing track in section:", item)
          // Nếu là track đơn, phát ngay
          playTrack({
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
          const playlistRes = await api.getPlaylistTracks(item.id)
          tracks = playlistRes.data.tracks
          if (tracks.length > 0) {
            contextUri = `playlist:${item.id}`
            playTrack({
              ...tracks[0],
              contextUri,
              contextTracks: tracks
            })
          }
          break
          
        case 'album':
          const albumRes = await api.getAlbumTracks(item.id)
          tracks = albumRes.data.tracks
          if (tracks.length > 0) {
            contextUri = `album:${item.id}`
            playTrack({
              ...tracks[0],
              contextUri,
              contextTracks: tracks
            })
          }
          break
          
        case 'artist':
          const artistRes = await api.getArtistTopTracks(item.id)
          tracks = artistRes.data.tracks
          if (tracks.length > 0) {
            contextUri = `artist:${item.id}`
            playTrack({
              ...tracks[0],
              contextUri,
              contextTracks: tracks
            })
          }
          break
          
        default:
          console.warn('Unknown item type:', item.type)
      }
    } catch (error) {
      console.error("Error playing track:", error)
    }
  }

  const isCurrentTrackPlaying = (item) => {
    if (item.type === 'track' || item.type === 'song') {
      return currentTrack?.id === item.id && isPlaying
    }
    return currentTrack?.contextUri === `${item.type}:${item.id}` && isPlaying
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

      <div className={`section-items ${type}`}>
        {displayedItems.map((item) => (
          <Link
            key={item.id}
            to={`/${item.type}/${item.id}`}
            className={`section-item ${currentTrack?.contextUri === `${item.type}:${item.id}` ? 'active' : ''}`}
            onMouseEnter={() => setHoveredItem(item.id)}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <div className="item-image-container">
              <img 
                src={item.image || item.album?.image || item.album?.cover_image || getMediaUrl('/test.png')} 
                alt={item.name} 
                className="item-image"
                loading="lazy"
              />
              
              {showPlayButton && (hoveredItem === item.id || currentTrack?.contextUri === `${item.type}:${item.id}`) && (
                <button 
                  className={`play-button ${isCurrentTrackPlaying(item) ? 'playing' : ''}`}
                  onClick={(e) => handlePlayClick(e, item)}
                  aria-label={`Play ${item.name}`}
                >
                  <svg viewBox="0 0 24 24">
                    <path d={isCurrentTrackPlaying(item) ? "M6 19h4V5H6v14zm8-14v14h4V5h-4z" : "M8 5v14l11-7z"} />
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
                    {(item.type === 'track' || item.type === 'song') && 
                      `${item.artists?.map(a => a.name).join(', ')}${item.album ? ` • ${item.album.name}` : ''}`}
                  </>
                )}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}

export default Section