import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import api from "../services/api"
import "./UserAlbumsPage.css"

const UserAlbumsPage = () => {
  const [albums, setAlbums] = useState([])
  const [loading, setLoading] = useState(true)
  const [newAlbumName, setNewAlbumName] = useState("")
  const [showCreateForm, setShowCreateForm] = useState(false)

  useEffect(() => {
    const fetchUserAlbums = async () => {
      try {
        const response = await api.getUserAlbums()
        setAlbums(response.data)
      } catch (error) {
        console.error("Error fetching user albums:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchUserAlbums()
  }, [])

  const handleCreateAlbum = async () => {
    if (!newAlbumName.trim()) return
    
    try {
      const response = await api.createUserAlbum({
        title: newAlbumName,
        description: "My personal album"
      })
      setAlbums([...albums, response.data])
      setNewAlbumName("")
      setShowCreateForm(false)
    } catch (error) {
      console.error("Error creating album:", error)
    }
  }

  const handleDeleteAlbum = async (albumId) => {
    try {
      await api.deleteUserAlbum(albumId)
      setAlbums(albums.filter(album => album.id !== albumId))
    } catch (error) {
      console.error("Error deleting album:", error)
    }
  }

  if (loading) {
    return <div className="loading-spinner" />
  }

  return (
    <div className="user-albums-page">
      <div className="page-header">
        <h1>My Albums</h1>
        <button 
          className="create-album-btn"
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          {showCreateForm ? "Cancel" : "Create New Album"}
        </button>
      </div>

      {showCreateForm && (
        <div className="create-album-form">
          <input
            type="text"
            value={newAlbumName}
            onChange={(e) => setNewAlbumName(e.target.value)}
            placeholder="Album name"
            className="album-name-input"
          />
          <button 
            onClick={handleCreateAlbum}
            className="submit-album-btn"
          >
            Create
          </button>
        </div>
      )}

      <div className="albums-grid">
        {albums.map(album => (
          <div key={album.id} className="album-card">
            <Link to={`/user-album/${album.id}`} className="album-link">
              <div className="album-cover">
                {album.cover_image ? (
                  <img src={album.cover_image} alt={album.title} />
                ) : (
                  <div className="default-cover">
                    <span>{album.title.charAt(0)}</span>
                  </div>
                )}
              </div>
              <div className="album-info">
                <h3 className="album-title">{album.title}</h3>
                <p className="album-track-count">{album.tracks_count || 0} tracks</p>
              </div>
            </Link>
            <button 
              className="delete-album-btn"
              onClick={() => handleDeleteAlbum(album.id)}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default UserAlbumsPage