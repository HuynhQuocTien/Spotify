"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import { useMusicPlayer } from "../contexts/MusicPlayerContext"
import "./Section.css"

const Section = ({ title, items, seeAllLink }) => {
  const { playTrack } = useMusicPlayer()
  const [hoveredIndex, setHoveredIndex] = useState(null)

  const handlePlayClick = (e, item) => {
    e.preventDefault()
    e.stopPropagation()

    // In a real app, you would fetch the tracks for this item
    // and then play the first track
    const mockTrack = {
      id: `track-${item.id}`,
      name: `First track from ${item.name}`,
      artists: [{ name: item.owner.display_name }],
      album: {
        name: item.name,
        images: item.images,
      },
      duration_ms: 180000, // 3 minutes
    }

    playTrack(mockTrack)
  }

  return (
    <section className="content-section">
      <div className="section-header">
        <h2 className="section-title">{title}</h2>
        {seeAllLink && (
          <Link to={seeAllLink} className="see-all-link">
            Show all
          </Link>
        )}
      </div>

      <div className="section-grid">
        {items.map((item, index) => (
          <Link
            key={item.id}
            to={`/${item.type}/${item.id}`}
            className="section-item"
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <div className="section-item-image-container">
              <img src={item.images[0].url || "/placeholder.svg"} alt={item.name} className="section-item-image" />
              {hoveredIndex === index && (
                <button className="section-item-play-button" onClick={(e) => handlePlayClick(e, item)}>
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 5.14v14l11-7-11-7z" fill="currentColor" />
                  </svg>
                </button>
              )}
            </div>
            <div className="section-item-info">
              <h3 className="section-item-title">{item.name}</h3>
              <p className="section-item-description">{item.description || `By ${item.owner.display_name}`}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}

export default Section

