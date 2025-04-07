"use client"

import { useState } from "react"
import { useMusicPlayer } from "../contexts/MusicPlayerContext"

const SongList = ({ tracks, showAlbum = true, showDateAdded = true, showDuration = true }) => {
  const { currentTrack, isPlaying, playTrack, formatTime } = useMusicPlayer()

  const [hoveredIndex, setHoveredIndex] = useState(null)

  const handlePlayTrack = (track, index) => {
    // Play the clicked track and add the rest to the queue
    const tracksAfterCurrent = tracks.slice(index + 1)
    const tracksBeforeCurrent = tracks.slice(0, index)

    // Combine tracks to create a queue that starts from the clicked track
    // and continues with the rest of the tracks in order
    playTrack(track, [...tracksAfterCurrent, ...tracksBeforeCurrent])
  }

  return (
    <div className="song-list">
      <table className="w-full text-left">
        <thead className="border-b border-[#282828] text-gray-400 text-sm">
          <tr>
            <th className="pb-2 w-12">#</th>
            <th className="pb-2">Title</th>
            {showAlbum && <th className="pb-2">Album</th>}
            {showDateAdded && <th className="pb-2">Date added</th>}
            {showDuration && (
              <th className="pb-2 text-right pr-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-4 h-4"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {tracks.map((track, index) => (
            <tr
              key={track.id}
              className={`hover:bg-[#282828] group ${currentTrack?.id === track.id ? "text-green-500" : ""}`}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <td className="py-2 px-2">
                <div className="relative w-4 h-4 flex items-center justify-center">
                  {hoveredIndex === index ? (
                    <button className="text-white" onClick={() => handlePlayTrack(track, index)}>
                      {currentTrack?.id === track.id && isPlaying ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="w-4 h-4"
                        >
                          <rect x="6" y="4" width="4" height="16"></rect>
                          <rect x="14" y="4" width="4" height="16"></rect>
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="w-4 h-4"
                        >
                          <polygon points="5 3 19 12 5 21 5 3"></polygon>
                        </svg>
                      )}
                    </button>
                  ) : (
                    <span className={currentTrack?.id === track.id ? "text-green-500" : ""}>
                      {currentTrack?.id === track.id && isPlaying ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="w-4 h-4 text-green-500"
                        >
                          <path d="M8 5.14v14l11-7-11-7z" />
                        </svg>
                      ) : (
                        index + 1
                      )}
                    </span>
                  )}
                </div>
              </td>
              <td className="py-2">
                <div className="flex items-center">
                  <img
                    src={track.album?.images?.[0]?.url || "/placeholder.svg"}
                    alt={track.name}
                    className="w-10 h-10 mr-3 object-cover"
                  />
                  <div>
                    <div className={`font-medium ${currentTrack?.id === track.id ? "text-green-500" : ""}`}>
                      {track.name}
                    </div>
                    <div className="text-sm text-gray-400">
                      {track.artists?.map((artist) => artist.name).join(", ")}
                    </div>
                  </div>
                </div>
              </td>
              {showAlbum && <td className="py-2 text-gray-400">{track.album?.name}</td>}
              {showDateAdded && (
                <td className="py-2 text-gray-400">
                  {track.added_at ? new Date(track.added_at).toLocaleDateString() : ""}
                </td>
              )}
              {showDuration && (
                <td className="py-2 text-gray-400 text-right pr-4">{formatTime(track.duration_ms / 1000)}</td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default SongList

