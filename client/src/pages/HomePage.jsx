"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import Section from "../components/Section"
import "./HomePage.css"

const HomePage = () => {
  const [greeting, setGreeting] = useState("")
  const [recentlyPlayed, setRecentlyPlayed] = useState([])
  const [topPlaylists, setTopPlaylists] = useState([])
  const [madeForYou, setMadeForYou] = useState([])
  const [loading, setLoading] = useState(true)

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

    // Fetch data (mock data for now)
    const fetchData = async () => {
      try {
        setLoading(true)

        // In a real app, these would be API calls
        await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate API delay

        setRecentlyPlayed([
          {
            id: "1",
            name: "Liked Songs",
            type: "playlist",
            images: [{ url: "/placeholder.svg?height=80&width=80" }],
            owner: { display_name: "You" },
          },
          {
            id: "2",
            name: "Discover Weekly",
            type: "playlist",
            images: [{ url: "/placeholder.svg?height=80&width=80" }],
            owner: { display_name: "Spotify" },
          },
          {
            id: "3",
            name: "Daily Mix 1",
            type: "playlist",
            images: [{ url: "/placeholder.svg?height=80&width=80" }],
            owner: { display_name: "Spotify" },
          },
          {
            id: "4",
            name: "Release Radar",
            type: "playlist",
            images: [{ url: "/placeholder.svg?height=80&width=80" }],
            owner: { display_name: "Spotify" },
          },
          {
            id: "5",
            name: "Chill Hits",
            type: "playlist",
            images: [{ url: "/placeholder.svg?height=80&width=80" }],
            owner: { display_name: "Spotify" },
          },
          {
            id: "6",
            name: "Rock Classics",
            type: "playlist",
            images: [{ url: "/placeholder.svg?height=80&width=80" }],
            owner: { display_name: "Spotify" },
          },
        ])

        setTopPlaylists([
          {
            id: "7",
            name: "Today's Top Hits",
            description: "Jung Kook is on top of the Hottest 50!",
            type: "playlist",
            images: [{ url: "/placeholder.svg?height=300&width=300" }],
            owner: { display_name: "Spotify" },
          },
          {
            id: "8",
            name: "RapCaviar",
            description: "New music from Drake, Kendrick Lamar and more.",
            type: "playlist",
            images: [{ url: "/placeholder.svg?height=300&width=300" }],
            owner: { display_name: "Spotify" },
          },
          {
            id: "9",
            name: "All Out 2010s",
            description: "The biggest songs of the 2010s.",
            type: "playlist",
            images: [{ url: "/placeholder.svg?height=300&width=300" }],
            owner: { display_name: "Spotify" },
          },
          {
            id: "10",
            name: "Rock Classics",
            description: "Rock legends & epic songs that continue to inspire generations.",
            type: "playlist",
            images: [{ url: "/placeholder.svg?height=300&width=300" }],
            owner: { display_name: "Spotify" },
          },
          {
            id: "11",
            name: "Chill Hits",
            description: "Kick back to the best new and recent chill hits.",
            type: "playlist",
            images: [{ url: "/placeholder.svg?height=300&width=300" }],
            owner: { display_name: "Spotify" },
          },
        ])

        setMadeForYou([
          {
            id: "12",
            name: "Daily Mix 1",
            description: "The Weeknd, Drake, Kendrick Lamar and more",
            type: "playlist",
            images: [{ url: "/placeholder.svg?height=300&width=300" }],
            owner: { display_name: "Spotify" },
          },
          {
            id: "13",
            name: "Daily Mix 2",
            description: "Taylor Swift, Olivia Rodrigo, Billie Eilish and more",
            type: "playlist",
            images: [{ url: "/placeholder.svg?height=300&width=300" }],
            owner: { display_name: "Spotify" },
          },
          {
            id: "14",
            name: "Daily Mix 3",
            description: "Post Malone, Justin Bieber, Ed Sheeran and more",
            type: "playlist",
            images: [{ url: "/placeholder.svg?height=300&width=300" }],
            owner: { display_name: "Spotify" },
          },
          {
            id: "15",
            name: "Discover Weekly",
            description: "Your weekly mixtape of fresh music. Enjoy new discoveries and deep cuts chosen just for you.",
            type: "playlist",
            images: [{ url: "/placeholder.svg?height=300&width=300" }],
            owner: { display_name: "Spotify" },
          },
          {
            id: "16",
            name: "Release Radar",
            description: "Catch all the latest music from artists you follow.",
            type: "playlist",
            images: [{ url: "/placeholder.svg?height=300&width=300" }],
            owner: { display_name: "Spotify" },
          },
        ])

        setLoading(false)
      } catch (error) {
        console.error("Error fetching home data:", error)
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    )
  }

  return (
    <div className="home-page">
      <h1 className="greeting-title">{greeting}</h1>

      <div className="recently-played-grid">
        {recentlyPlayed.map((item) => (
          <Link key={item.id} to={`/${item.type}/${item.id}`} className="recently-played-item">
            <div className="recently-played-image">
              <img src={item.images[0].url || "/placeholder.svg"} alt={item.name} />
            </div>
            <div className="recently-played-info">
              <span className="recently-played-name">{item.name}</span>
            </div>
            <button className="play-button">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 5.14v14l11-7-11-7z" fill="currentColor" />
              </svg>
            </button>
          </Link>
        ))}
      </div>

      <Section title="Your top mixes" items={madeForYou} seeAllLink="/genre/made-for-you" />

      <Section title="Popular playlists" items={topPlaylists} seeAllLink="/genre/featured-playlists" />
    </div>
  )
}

export default HomePage

