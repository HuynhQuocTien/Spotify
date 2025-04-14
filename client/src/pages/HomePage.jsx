"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import Section from "../components/Section"
import api from "../services/api"
import "./HomePage.css"

const HomePage = () => {
  const [greeting, setGreeting] = useState("")
  const [artists, setArtists] = useState([])
  const [albums, setAlbums] = useState([])
  const [songs, setSongs] = useState([])
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Set greeting based on time of day
    const hour = new Date().getHours()
    if (hour < 12) {
      setGreeting("Good morning")
    } else if (hour < 18) {
      setGreeting("Good afternoon")
    } else {
      setGreeting("Good evening")
    }
    const formatArtist = (artist) => ({
      id: artist.id,
      name: artist.name,
      type: "artist",
      image: artist.image || "/placeholder-artist.svg",
      description: "Artist"
    })

    const formatAlbum = (album) => ({
      id: album.id,
      name: album.title,
      type: "album",
      image: album.cover_image || "/placeholder-album.svg",
      description: `By ${album.artist?.name || "Various Artists"}`
    })

    const formatSong = (song) => ({
      id: song.id,
      name: song.title,
      type: "song",
      image: song.image || "/placeholder-song.svg",
      audio: song.audio_file,
      description: `By ${song.album.artist.name || "Unknown"}`
    })

    // Fetch data
    const fetchData = async () => {
      try {
        setIsLoaded(true)
        setError(null)

        const [
          artistsResponse,
          albumsResponse,
          songsResponse
        ] = await Promise.all([
          api.getArtists(),
          api.getAlbums(),
          api.getSongs()
        ])
        setArtists(artistsResponse.data.map(formatArtist))
        setAlbums(albumsResponse.data.map(formatAlbum))
        setSongs(songsResponse.data.map(formatSong))

        setIsLoaded(true)
      } catch (err) {
        console.error("Error fetching data:", err)
        setError("Failed to load data. Please try again.")
        setIsLoaded(false)
      }
    }

    fetchData()
  }, [])

  if (!isLoaded) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">{error}</p>
        <button
          className="retry-button"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="home-page">
      <h1 className="greeting-title">{greeting}</h1>


      {artists.length > 0 && (
        <Section
          title="Popular Artists"
          items={artists}
          seeAllLink="/browse/artists"
        />
      )}

      {albums.length > 0 && (
        <Section
          title="New Albums"
          items={albums}
          seeAllLink="/browse/albums"
        />
      )}

      {songs.length > 0 && (
        <Section
          title="Top Songs"
          items={songs}
          seeAllLink="/browse/songs"
        />
      )}

    </div>
  )
}

export default HomePage