"use client"

import { createContext, useContext, useState, useEffect, useRef } from "react"

const MusicPlayerContext = createContext()

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
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  // Queue management
  const [queue, setQueue] = useState([])
  const [history, setHistory] = useState([])

  // Playback modes
  const [shuffle, setShuffle] = useState(false)
  const [repeat, setRepeat] = useState("off") // 'off', 'all', 'one'

  // Audio element reference
  const audioRef = useRef(null)

  // Initialize audio element
  useEffect(() => {
    audioRef.current = new Audio()

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
        audioRef.current.currentTime = 0
        audioRef.current.play().catch(console.error)
      } else {
        playNextTrack()
      }
    }

    audioRef.current.addEventListener("timeupdate", handleTimeUpdate)
    audioRef.current.addEventListener("ended", handleTrackEnd)
    audioRef.current.addEventListener("loadedmetadata", handleMetadataLoaded)

    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener("timeupdate", handleTimeUpdate)
        audioRef.current.removeEventListener("ended", handleTrackEnd)
        audioRef.current.removeEventListener("loadedmetadata", handleMetadataLoaded)
        audioRef.current.pause()
      }
    }
  }, [repeat])

  useEffect(() => {
    if (!audioRef.current || !currentTrack) return
    
    console.log("Current track:", currentTrack)
    const playAudio = async () => {
      try {
        setIsLoading(true)
        setError(null)
  
        audioRef.current.src = currentTrack.audio || currentTrack.preview_url || ""
  
        // Không cần await load()
        audioRef.current.load()
  
        if (isPlaying) {
          await audioRef.current.play()
        }
      } catch (err) {
        setError(err.message)
        setIsPlaying(false)
      } finally {
        setIsLoading(false)
      }
    }
  
    playAudio()
  }, [currentTrack])
  // Handle play/pause state changes
  useEffect(() => {
    if (!audioRef.current || !currentTrack) return

    const handlePlayback = async () => {
      try {
        if (isPlaying) {
          await audioRef.current.play()
        } else {
          audioRef.current.pause()
        }
      } catch (err) {
        setError(err.message)
        setIsPlaying(false)
      }
    }

    handlePlayback()
  }, [isPlaying, currentTrack])

  // Handle volume changes
  useEffect(() => {
    if (!audioRef.current) return
    audioRef.current.volume = isMuted ? 0 : volume
  }, [volume, isMuted])

  // Player controls
  const playTrack = async (track, tracks = []) => {
    try {
      setIsLoading(true)
      setError(null)
      
      if (currentTrack) {
        setHistory((prev) => [currentTrack, ...prev.slice(0, 19)])
      }

      setCurrentTrack({
        ...track,
        contextTracks: tracks.length > 0 ? tracks : track.contextTracks || []
      })

      // Update queue if context tracks are provided
      if (tracks.length > 0 || track.contextTracks) {
        const contextTracks = tracks.length > 0 ? tracks : track.contextTracks
        const remainingTracks = contextTracks.filter(t => t.id !== track.id)
        setQueue(shuffle ? shuffleArray([...remainingTracks]) : remainingTracks)
      }
      
      setIsPlaying(true)
    } catch (err) {
      setError(err.message)
      setIsPlaying(false)
    } finally {
      setIsLoading(false)
    }
  }

  const togglePlay = () => {
    if (!currentTrack) return
    setIsPlaying((prev) => !prev)
  }

  const playNextTrack = () => {
    if (queue.length === 0) {
      if (repeat === "all" && history.length > 0) {
        // Restart from the beginning if repeat all is enabled
        const allTracks = [...history, currentTrack].reverse()
        playTrack(allTracks[0], allTracks.slice(1))
      } else {
        setIsPlaying(false)
      }
      return
    }

    const nextTrack = queue[0]
    const newQueue = queue.slice(1)

    if (currentTrack) {
      setHistory((prev) => [currentTrack, ...prev.slice(0, 19)])
    }

    setCurrentTrack(nextTrack)
    setQueue(newQueue)
    setIsPlaying(true)
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
    setVolume(Math.max(0, Math.min(1, newVolume)))
    setIsMuted(newVolume === 0)
  }

  const toggleShuffle = () => {
    setShuffle((prev) => {
      const newShuffle = !prev
      if (newShuffle && queue.length > 0) {
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

  // Helper functions
  const shuffleArray = (array) => {
    const newArray = [...array]
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[newArray[i], newArray[j]] = [newArray[j], newArray[i]]
    }
    return newArray
  }

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
    isLoading,
    error,

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