"use client"

import { createContext, useContext, useState, useEffect, useRef } from "react"

// Create the context
const MusicPlayerContext = createContext()

// Custom hook to use the music player context
export const useMusicPlayer = () => {
  const context = useContext(MusicPlayerContext)
  if (!context) {
    throw new Error("useMusicPlayer must be used within a MusicPlayerProvider")
  }
  return context
}

export const MusicPlayerProvider = ({ children }) => {
  // Player state
  const [currentTrack, setCurrentTrack] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(0.7)
  const [isMuted, setIsMuted] = useState(false)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [progress, setProgress] = useState(0)

  // Queue management
  const [queue, setQueue] = useState([])
  const [history, setHistory] = useState([])

  // Additional controls
  const [shuffle, setShuffle] = useState(false)
  const [repeat, setRepeat] = useState("off") // 'off', 'all', 'one'

  // Audio element reference
  const audioRef = useRef(null)

  // Initialize audio element
  useEffect(() => {
    audioRef.current = new Audio()

    // Set up event listeners
    audioRef.current.addEventListener("timeupdate", handleTimeUpdate)
    audioRef.current.addEventListener("ended", handleTrackEnd)
    audioRef.current.addEventListener("loadedmetadata", handleMetadataLoaded)

    // Clean up event listeners
    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener("timeupdate", handleTimeUpdate)
        audioRef.current.removeEventListener("ended", handleTrackEnd)
        audioRef.current.removeEventListener("loadedmetadata", handleMetadataLoaded)
        audioRef.current.pause()
      }
    }
  }, [])

  // Update audio source when current track changes
  useEffect(() => {
    if (!audioRef.current || !currentTrack) return

    audioRef.current.src = currentTrack.preview_url || currentTrack.audio || ""
    audioRef.current.load()

    if (isPlaying) {
      audioRef.current.play().catch((error) => {
        console.error("Playback failed:", error)
        setIsPlaying(false)
      })
    }
  }, [currentTrack])

  // Handle play/pause state changes
  useEffect(() => {
    if (!audioRef.current) return

    if (isPlaying) {
      audioRef.current.play().catch((error) => {
        console.error("Playback failed:", error)
        setIsPlaying(false)
      })
    } else {
      audioRef.current.pause()
    }
  }, [isPlaying])

  // Handle volume changes
  useEffect(() => {
    if (!audioRef.current) return
    audioRef.current.volume = isMuted ? 0 : volume
  }, [volume, isMuted])

  // Event handlers
  const handleTimeUpdate = () => {
    if (!audioRef.current) return

    const current = audioRef.current.currentTime
    const duration = audioRef.current.duration

    setCurrentTime(current)
    setProgress((current / duration) * 100 || 0)
  }

  const handleMetadataLoaded = () => {
    if (!audioRef.current) return
    setDuration(audioRef.current.duration)
  }

  const handleTrackEnd = () => {
    if (repeat === "one") {
      // Repeat the current track
      audioRef.current.currentTime = 0
      audioRef.current.play().catch(console.error)
    } else {
      // Play next track
      playNextTrack()
    }
  }

  // Player controls
  const playTrack = (track, tracks = []) => {
    if (currentTrack) {
      // Add current track to history
      setHistory((prev) => [currentTrack, ...prev.slice(0, 19)])
    }

    setCurrentTrack(track)

    // If tracks are provided, set them as the queue (excluding the current track)
    if (tracks.length > 0) {
      const remainingTracks = tracks.filter((t) => t.id !== track.id)
      setQueue(shuffle ? shuffleArray([...remainingTracks]) : remainingTracks)
    }

    setIsPlaying(true)
  }

  const togglePlay = () => {
    if (!currentTrack) return
    setIsPlaying((prev) => !prev)
  }

  const playNextTrack = () => {
    if (queue.length === 0) {
      if (repeat === "all" && history.length > 0) {
        // If repeat all is enabled and we have history, restart from the beginning
        const allTracks = [...history, currentTrack].reverse()
        playTrack(allTracks[0], allTracks.slice(1))
      } else {
        setIsPlaying(false)
      }
      return
    }

    const nextTrack = queue[0]
    const newQueue = queue.slice(1)

    setCurrentTrack(nextTrack)
    setQueue(newQueue)
    setIsPlaying(true)

    if (currentTrack) {
      setHistory((prev) => [currentTrack, ...prev.slice(0, 19)])
    }
  }

  const playPreviousTrack = () => {
    // If we're more than 3 seconds into the song, restart it
    if (audioRef.current && audioRef.current.currentTime > 3) {
      audioRef.current.currentTime = 0
      return
    }

    // Otherwise play the previous track from history
    if (history.length > 0) {
      const prevTrack = history[0]
      const newHistory = history.slice(1)

      // Add current track to the beginning of the queue
      setQueue((prev) => (currentTrack ? [currentTrack, ...prev] : [...prev]))
      setCurrentTrack(prevTrack)
      setHistory(newHistory)
      setIsPlaying(true)
    } else {
      // If no history, just restart the current track
      if (audioRef.current) {
        audioRef.current.currentTime = 0
      }
    }
  }

  const seekToPosition = (percent) => {
    if (!audioRef.current || !duration) return

    const time = (percent / 100) * duration
    audioRef.current.currentTime = time
    setCurrentTime(time)
    setProgress(percent)
  }

  const toggleMute = () => {
    setIsMuted((prev) => !prev)
  }

  const changeVolume = (newVolume) => {
    setVolume(newVolume)
    setIsMuted(newVolume === 0)
  }

  const toggleShuffle = () => {
    setShuffle((prev) => {
      const newShuffle = !prev
      if (newShuffle) {
        setQueue(shuffleArray([...queue]))
      }
      return newShuffle
    })
  }

  const toggleRepeat = () => {
    setRepeat((prev) => {
      if (prev === "off") return "all"
      if (prev === "all") return "one"
      return "off"
    })
  }

  const addToQueue = (track) => {
    setQueue((prev) => [...prev, track])
  }

  const clearQueue = () => {
    setQueue([])
  }

  // Helper function to shuffle an array
  const shuffleArray = (array) => {
    const newArray = [...array]
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[newArray[i], newArray[j]] = [newArray[j], newArray[i]]
    }
    return newArray
  }

  // Format time for display (e.g., 3:45)
  const formatTime = (timeInSeconds) => {
    if (isNaN(timeInSeconds)) return "0:00"

    const minutes = Math.floor(timeInSeconds / 60)
    const seconds = Math.floor(timeInSeconds % 60)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  // Context value
  const value = {
    // Current state
    currentTrack,
    isPlaying,
    volume,
    isMuted,
    duration,
    currentTime,
    progress,
    queue,
    history,
    shuffle,
    repeat,

    // Player controls
    playTrack,
    togglePlay,
    playNextTrack,
    playPreviousTrack,
    seekToPosition,
    toggleMute,
    changeVolume,
    toggleShuffle,
    toggleRepeat,
    addToQueue,
    clearQueue,

    // Utilities
    formatTime,
  }

  return <MusicPlayerContext.Provider value={value}>{children}</MusicPlayerContext.Provider>
}

export default MusicPlayerProvider

