"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { fetchFeaturedPlaylists, fetchNewReleases, fetchUserTopArtists } from "../services/spotify"
import { useAuth } from "../contexts/AuthContext"
import { usePlayer } from "../contexts/PlayerContext"
import { Play } from "lucide-react"

const Home = () => {
  const [featuredPlaylists, setFeaturedPlaylists] = useState([])
  const [newReleases, setNewReleases] = useState([])
  const [topArtists, setTopArtists] = useState([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const { playTrack } = usePlayer()

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // In a real app, these would be API calls to your backend or Spotify API
        const playlists = await fetchFeaturedPlaylists()
        const releases = await fetchNewReleases()
        const artists = await fetchUserTopArtists()

        setFeaturedPlaylists(playlists)
        setNewReleases(releases)
        setTopArtists(artists)
      } catch (error) {
        console.error("Error fetching home data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">
        {getGreeting()}, {user?.displayName || "Music Lover"}
      </h1>

      {/* Recently played */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Recently played</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {featuredPlaylists.slice(0, 5).map((playlist) => (
            <PlaylistCard key={playlist.id} playlist={playlist} />
          ))}
        </div>
      </section>

      {/* Made for you */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Made for you</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {featuredPlaylists.slice(5, 10).map((playlist) => (
            <PlaylistCard key={playlist.id} playlist={playlist} />
          ))}
        </div>
      </section>

      {/* New releases */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">New releases</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {newReleases.map((album) => (
            <AlbumCard key={album.id} album={album} />
          ))}
        </div>
      </section>

      {/* Your top artists */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Your top artists</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {topArtists.map((artist) => (
            <ArtistCard key={artist.id} artist={artist} />
          ))}
        </div>
      </section>
    </div>
  )
}

const PlaylistCard = ({ playlist }) => {
  const { playTrack } = usePlayer()
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      className="bg-[#181818] p-4 rounded-md transition-all duration-200 hover:bg-[#282828] relative group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link to={`/playlist/${playlist.id}`}>
        <div className="relative mb-4">
          <img
            src={playlist.images?.[0]?.url || "/placeholder.svg"}
            alt={playlist.name}
            className="w-full aspect-square object-cover rounded shadow-lg"
          />
          {isHovered && (
            <button
              className="absolute bottom-2 right-2 bg-green-500 rounded-full p-3 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0"
              onClick={(e) => {
                e.preventDefault()
                if (playlist.tracks?.items?.[0]?.track) {
                  playTrack(
                    playlist.tracks.items[0].track,
                    playlist.tracks.items.map((item) => item.track),
                  )
                }
              }}
            >
              <Play size={20} fill="white" className="text-black" />
            </button>
          )}
        </div>
        <h3 className="font-semibold truncate">{playlist.name}</h3>
        <p className="text-gray-400 text-sm mt-1 truncate">
          {playlist.description || `By ${playlist.owner?.display_name || "Spotify"}`}
        </p>
      </Link>
    </div>
  )
}

const AlbumCard = ({ album }) => {
  const { playTrack } = usePlayer()
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      className="bg-[#181818] p-4 rounded-md transition-all duration-200 hover:bg-[#282828] relative group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link to={`/album/${album.id}`}>
        <div className="relative mb-4">
          <img
            src={album.images?.[0]?.url || "/placeholder.svg"}
            alt={album.name}
            className="w-full aspect-square object-cover rounded shadow-lg"
          />
          {isHovered && (
            <button
              className="absolute bottom-2 right-2 bg-green-500 rounded-full p-3 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0"
              onClick={(e) => {
                e.preventDefault()
                if (album.tracks?.items?.[0]) {
                  playTrack(album.tracks.items[0], album.tracks.items)
                }
              }}
            >
              <Play size={20} fill="white" className="text-black" />
            </button>
          )}
        </div>
        <h3 className="font-semibold truncate">{album.name}</h3>
        <p className="text-gray-400 text-sm mt-1 truncate">{album.artists?.map((artist) => artist.name).join(", ")}</p>
      </Link>
    </div>
  )
}

const ArtistCard = ({ artist }) => {
  return (
    <Link to={`/artist/${artist.id}`}>
      <div className="bg-[#181818] p-4 rounded-md transition-all duration-200 hover:bg-[#282828]">
        <div className="mb-4">
          <img
            src={artist.images?.[0]?.url || "/placeholder.svg"}
            alt={artist.name}
            className="w-full aspect-square object-cover rounded-full shadow-lg"
          />
        </div>
        <h3 className="font-semibold truncate">{artist.name}</h3>
        <p className="text-gray-400 text-sm mt-1">Artist</p>
      </div>
    </Link>
  )
}

const getGreeting = () => {
  const hour = new Date().getHours()
  if (hour < 12) return "Good morning"
  if (hour < 18) return "Good afternoon"
  return "Good evening"
}

export default Home

