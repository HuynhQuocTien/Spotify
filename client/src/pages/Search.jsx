"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { searchItems } from "../services/spotify"
import { usePlayer } from "../contexts/PlayerContext"
import { Play, SearchIcon } from "lucide-react"

const Search = () => {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const { playTrack } = usePlayer()

  useEffect(() => {
    const searchTimeout = setTimeout(() => {
      if (query.trim().length > 1) {
        performSearch()
      } else {
        setResults(null)
      }
    }, 500)

    return () => clearTimeout(searchTimeout)
  }, [query])

  const performSearch = async () => {
    try {
      setLoading(true)
      const searchResults = await searchItems(query)
      setResults(searchResults)
    } catch (error) {
      console.error("Error searching:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6">
      <div className="sticky top-0 z-10 bg-black pb-4">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="What do you want to listen to?"
            className="w-full pl-10 pr-4 py-3 bg-[#242424] rounded-full text-white focus:outline-none focus:ring-2 focus:ring-white"
          />
        </div>
      </div>

      {loading && (
        <div className="flex justify-center my-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
        </div>
      )}

      {results && !loading && (
        <div className="mt-6">
          {/* Top result */}
          {(results.artists?.items.length > 0 || results.tracks?.items.length > 0) && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Top result</h2>
              <div className="bg-[#181818] hover:bg-[#282828] p-5 rounded-md transition-colors">
                {results.artists?.items[0] ? (
                  <div>
                    <img
                      src={results.artists.items[0].images?.[0]?.url || "/placeholder.svg"}
                      alt={results.artists.items[0].name}
                      className="w-24 h-24 rounded-full mb-4 object-cover"
                    />
                    <h3 className="text-2xl font-bold">{results.artists.items[0].name}</h3>
                    <p className="text-sm text-gray-400 mt-1">Artist</p>
                  </div>
                ) : results.tracks?.items[0] ? (
                  <div className="flex items-center justify-between">
                    <div>
                      <img
                        src={results.tracks.items[0].album?.images?.[0]?.url || "/placeholder.svg"}
                        alt={results.tracks.items[0].name}
                        className="w-24 h-24 rounded mb-4 object-cover"
                      />
                      <h3 className="text-xl font-bold">{results.tracks.items[0].name}</h3>
                      <p className="text-sm text-gray-400 mt-1">
                        {results.tracks.items[0].artists?.map((artist) => artist.name).join(", ")}
                      </p>
                    </div>
                    <button
                      className="bg-green-500 rounded-full p-3 shadow-lg hover:scale-105 transition-transform"
                      onClick={() => playTrack(results.tracks.items[0])}
                    >
                      <Play size={24} fill="white" className="text-black" />
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          )}

          {/* Songs */}
          {results.tracks?.items.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Songs</h2>
              <div className="grid gap-2">
                {results.tracks.items.slice(0, 4).map((track) => (
                  <div
                    key={track.id}
                    className="flex items-center p-2 rounded-md hover:bg-[#282828] transition-colors group"
                  >
                    <img
                      src={track.album?.images?.[0]?.url || "/placeholder.svg"}
                      alt={track.name}
                      className="w-10 h-10 mr-4 object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">{track.name}</h3>
                      <p className="text-sm text-gray-400 truncate">
                        {track.artists?.map((artist) => artist.name).join(", ")}
                      </p>
                    </div>
                    <button
                      className="opacity-0 group-hover:opacity-100 p-2 text-white hover:text-green-500 transition-opacity"
                      onClick={() => playTrack(track)}
                    >
                      <Play size={20} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Artists */}
          {results.artists?.items.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Artists</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {results.artists.items.slice(0, 5).map((artist) => (
                  <Link
                    key={artist.id}
                    to={`/artist/${artist.id}`}
                    className="bg-[#181818] p-4 rounded-md hover:bg-[#282828] transition-colors"
                  >
                    <img
                      src={artist.images?.[0]?.url || "/placeholder.svg"}
                      alt={artist.name}
                      className="w-full aspect-square object-cover rounded-full mb-4"
                    />
                    <h3 className="font-medium truncate">{artist.name}</h3>
                    <p className="text-sm text-gray-400">Artist</p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Albums */}
          {results.albums?.items.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Albums</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {results.albums.items.slice(0, 5).map((album) => (
                  <Link
                    key={album.id}
                    to={`/album/${album.id}`}
                    className="bg-[#181818] p-4 rounded-md hover:bg-[#282828] transition-colors"
                  >
                    <img
                      src={album.images?.[0]?.url || "/placeholder.svg"}
                      alt={album.name}
                      className="w-full aspect-square object-cover rounded mb-4"
                    />
                    <h3 className="font-medium truncate">{album.name}</h3>
                    <p className="text-sm text-gray-400 truncate">
                      {album.artists?.map((artist) => artist.name).join(", ")}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Playlists */}
          {results.playlists?.items.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Playlists</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {results.playlists.items.slice(0, 5).map((playlist) => (
                  <Link
                    key={playlist.id}
                    to={`/playlist/${playlist.id}`}
                    className="bg-[#181818] p-4 rounded-md hover:bg-[#282828] transition-colors"
                  >
                    <img
                      src={playlist.images?.[0]?.url || "/placeholder.svg"}
                      alt={playlist.name}
                      className="w-full aspect-square object-cover rounded mb-4"
                    />
                    <h3 className="font-medium truncate">{playlist.name}</h3>
                    <p className="text-sm text-gray-400 truncate">{playlist.description}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* No results */}
          {!results.tracks?.items.length &&
            !results.artists?.items.length &&
            !results.albums?.items.length &&
            !results.playlists?.items.length && (
              <div className="text-center py-12">
                <p className="text-xl">No results found for "{query}"</p>
                <p className="text-gray-400 mt-2">Please check your spelling or try different keywords.</p>
              </div>
            )}
        </div>
      )}

      {!query && !results && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Browse all</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {["Pop", "Hip-Hop", "Rock", "Latin", "Mood", "Indie", "Workout", "Electronic"].map((genre) => (
              <div
                key={genre}
                className="relative overflow-hidden rounded-lg aspect-square bg-gradient-to-br from-purple-700 to-blue-500 p-4 flex items-end"
                style={{
                  backgroundColor: getRandomColor(genre),
                }}
              >
                <h3 className="text-xl font-bold z-10">{genre}</h3>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Helper function to generate consistent colors based on genre name
const getRandomColor = (str) => {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }

  const colors = [
    "from-red-500 to-orange-500",
    "from-blue-500 to-purple-500",
    "from-green-500 to-teal-500",
    "from-yellow-500 to-red-500",
    "from-purple-500 to-pink-500",
    "from-indigo-500 to-blue-500",
    "from-pink-500 to-red-500",
    "from-teal-500 to-blue-500",
  ]

  return colors[Math.abs(hash) % colors.length]
}

export default Search

