"use client"

import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import { fetchPlaylist } from "../services/spotify"
import { usePlayer } from "../contexts/PlayerContext"
import { Clock, Play } from "lucide-react"

const Playlist = () => {
  const { id } = useParams()
  const [playlist, setPlaylist] = useState(null)
  const [loading, setLoading] = useState(true)
  const { playTrack, currentTrack, isPlaying } = usePlayer()

  useEffect(() => {
    const getPlaylist = async () => {
      try {
        setLoading(true)
        const data = await fetchPlaylist(id)
        setPlaylist(data)
      } catch (error) {
        console.error("Error fetching playlist:", error)
      } finally {
        setLoading(false)
      }
    }

    getPlaylist()
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    )
  }

  if (!playlist) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold">Playlist not found</h1>
      </div>
    )
  }

  const tracks = playlist.tracks?.items?.map((item) => item.track) || []
  const totalDuration = tracks.reduce((total, track) => total + (track.duration_ms || 0), 0)

  return (
    <div>
      {/* Header */}
      <div
        className="flex flex-col md:flex-row items-center md:items-end gap-6 p-6 bg-gradient-to-b from-[rgba(80,80,80,0.6)] to-[rgba(0,0,0,0)]"
        style={{
          backgroundImage: playlist.images?.[0]?.url
            ? `linear-gradient(transparent 0, rgba(0,0,0,.5) 100%), url(${playlist.images[0].url})`
            : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
          paddingTop: "140px",
        }}
      >
        <div className="flex-shrink-0">
          <img
            src={playlist.images?.[0]?.url || "/placeholder.svg"}
            alt={playlist.name}
            className="w-48 h-48 shadow-lg object-cover"
          />
        </div>
        <div>
          <p className="text-sm uppercase font-bold">Playlist</p>
          <h1 className="text-5xl font-bold mt-2 mb-4">{playlist.name}</h1>
          <p className="text-gray-300 text-sm">{playlist.description}</p>
          <div className="flex items-center mt-2 text-sm text-gray-300">
            <span className="font-bold">{playlist.owner?.display_name || "Spotify"}</span>
            <span className="mx-1">•</span>
            <span>{playlist.followers?.total || 0} likes</span>
            <span className="mx-1">•</span>
            <span>{tracks.length} songs,</span>
            <span className="ml-1">{formatDuration(totalDuration)}</span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="p-6 flex items-center gap-4">
        <button
          className="bg-green-500 rounded-full p-4 shadow-lg hover:scale-105 transition-transform"
          onClick={() => {
            if (tracks.length > 0) {
              playTrack(tracks[0], tracks)
            }
          }}
        >
          <Play size={24} fill="white" className="text-black" />
        </button>
      </div>

      {/* Tracks */}
      <div className="px-6 pb-32">
        <table className="w-full text-left">
          <thead className="border-b border-[#282828] text-gray-400 text-sm">
            <tr>
              <th className="pb-2 w-12">#</th>
              <th className="pb-2">Title</th>
              <th className="pb-2">Album</th>
              <th className="pb-2">Date added</th>
              <th className="pb-2 text-right pr-4">
                <Clock size={16} />
              </th>
            </tr>
          </thead>
          <tbody>
            {tracks.map((track, index) => (
              <tr
                key={track.id}
                className={`hover:bg-[#282828] group ${currentTrack?.id === track.id ? "text-green-500" : ""}`}
              >
                <td className="py-2 px-2">
                  <div className="relative w-4 h-4 flex items-center justify-center">
                    <span className="group-hover:hidden">
                      {currentTrack?.id === track.id && isPlaying ? (
                        <img src="/playing.gif" alt="Now playing" className="w-4 h-4" />
                      ) : (
                        index + 1
                      )}
                    </span>
                    <button className="hidden group-hover:block absolute" onClick={() => playTrack(track, tracks)}>
                      <Play size={16} />
                    </button>
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
                <td className="py-2 text-gray-400">{track.album?.name}</td>
                <td className="py-2 text-gray-400">1 week ago</td>
                <td className="py-2 text-gray-400 text-right pr-4">{formatTime(track.duration_ms)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const formatTime = (ms) => {
  if (!ms) return "0:00"

  const minutes = Math.floor(ms / 60000)
  const seconds = Math.floor((ms % 60000) / 1000)
  return `${minutes}:${seconds.toString().padStart(2, "0")}`
}

const formatDuration = (ms) => {
  if (!ms) return "0 min"

  const minutes = Math.floor(ms / 60000)
  const hours = Math.floor(minutes / 60)

  if (hours > 0) {
    const remainingMinutes = minutes % 60
    return `${hours} hr ${remainingMinutes > 0 ? remainingMinutes + " min" : ""}`
  }

  return `${minutes} min`
}

export default Playlist

