"use client"

import { createContext, useContext, useState } from "react"

const PlayerContext = createContext()

export const usePlayer = () => {
  return useContext(PlayerContext)
}

export const PlayerProvider = ({ children }) => {
  const [currentTrack, setCurrentTrack] = useState(null)
  const [queue, setQueue] = useState([])
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [volume, setVolume] = useState(0.7)

  const playTrack = (track, tracks = []) => {
    setCurrentTrack(track)
    setQueue(tracks.filter((t) => t.id !== track.id))
    setIsPlaying(true)
  }

  const togglePlay = () => {
    setIsPlaying(!isPlaying)
  }

  const nextTrack = () => {
    if (queue.length === 0) {
      setIsPlaying(false)
      return
    }

    const nextTrack = queue[0]
    setCurrentTrack(nextTrack)
    setQueue(queue.slice(1))
    setIsPlaying(true)
  }

  const prevTrack = () => {
    // This is simplified - a real implementation would need to track history
    if (!currentTrack) return

    // For now, just restart the current track
    setProgress(0)
  }

  const addToQueue = (track) => {
    setQueue([...queue, track])
  }

  const clearQueue = () => {
    setQueue([])
  }

  const value = {
    currentTrack,
    queue,
    isPlaying,
    progress,
    volume,
    playTrack,
    togglePlay,
    nextTrack,
    prevTrack,
    addToQueue,
    clearQueue,
    setProgress,
    setVolume,
  }

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>
}

