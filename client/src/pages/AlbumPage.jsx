import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import { useMusicPlayer } from "../contexts/MusicPlayerContext"
import axios from "axios"
import api from "../services/api"
import "./PlaylistPage.css"
import JSZip from "jszip"
import { saveAs } from "file-saver"
import HeartFilledIcon from '../components/HeartFilledIcon';
import HeartOutlineIcon from '../components/HeartOutlineIcon';
const AlbumPage = () => {
  const { id } = useParams()
  const [album, setAlbum] = useState(null)
  const [songs, setSongs] = useState([])
  const [loading, setLoading] = useState(true)
  const [downloadingAll, setDownloadingAll] = useState(false)
  const { playSong, currentSong, togglePlay } = useMusicPlayer()
  const [favorites, setFavorites] = useState([])

  const FAVORITE_TYPE = {
    SONG: 'song',
    ALBUM: 'album'
  };
  const isFavorite = (songId, type) => {
    if (!favorites || typeof favorites !== 'object') return false;
  
    if (type === 'song') {
      console.log(favorites.songs?.some((fav) => fav.id === songId));
      return favorites.songs?.some((fav) => fav.id === songId);
    }
  
    if (type === 'album') {
      return favorites.albums?.some((fav) => fav.id === songId);
    }
  
    return false;
  };
  const handleToggleFavorite = async (e, songId, isCurrentlyFavorite, type) => {
    e.stopPropagation();
    setTopSongs(prev => 
      prev.map(song => 
        song.id === song 
          ? { ...song, is_favorite: !isCurrentlyFavorite } 
          : song
      )
    );
    try {
        await api.addFavoriteSong(songId, type);
  
      setTopSongs((prev) =>
        prev.map((t) =>
          t.id === songId ? { ...t, is_favorite: !t.isCurrentlyFavorite } : t
        )
      );
    } catch (err) {
      console.error('Toggle favorite failed:', err);
    }
  };

  useEffect(() => {
    import("./AlbumPage.css").then(() => {
      setCssLoaded(true)
    })
    const fetchAlbumAndSongs = async () => {
      try {
        setLoading(true)
        const [albumRes, songsRes] = await Promise.all([
          api.getAlbum(id),
          api.getAlbumSongs(id)
        ])
        setAlbum(albumRes.data)
        setSongs(songsRes.data.songs)
        console.log("Album data:", albumRes.data)
        console.log("Songs data:", songsRes.data.songs)
      } catch (error) {
        console.error("Error fetching album or songs:", error)
      } finally {
        setLoading(false)
      }
    }
  
    fetchAlbumAndSongs()
  }, [id])
  

  const handlePlaySong= (song, index) => {
    if (!song || !songs || songs.length === 0) return
  
    if (currentSong?.id === song.id) {
      togglePlay()
      return
    }
  
    const contextUri = `album:${album.id}`
    const contextSongs = songs
  
    playSong({
      id: song.id,
      name: song.name,
      artists: song.artists || [],
      album: album
        ? { name: album.title, image: album.cover_image }
        : { name: '', image: '' },
      duration: song.duration || song.duration_ms || 0,
      audio: song.audio_file || song.preview_url,
      image: song.image || album.cover_image,
      contextUri,
      contextSongs
    })
  }

  const downloadAllSongs = async () => {
    if (!songs.length || downloadingAll) return
    
    setDownloadingAll(true)
    try {
      const zip = new JSZip()
      const folder = zip.folder(`${album.title} - ${album.artist.name}`)
      
      // Add cover image to the zip
      if (album.cover_image) {
        try {
          const imageResponse = await fetch(album.cover_image)
          const imageBlob = await imageResponse.blob()
          folder.file(`cover.jpg`, imageBlob)
        } catch (error) {
          console.error("Error downloading cover image:", error)
        }
      }
      
      // Add all songs to the zip
      for (let i = 0; i < songs.length; i++) {
        const song = songs[i]
        if (song.audio_file) {
          try {
            const response = await fetch(song.audio_file)
            const blob = await response.blob()
            const extension = song.audio_file.split('.').pop().toLowerCase()
            const fileName = `${i + 1}. ${song.title}.${extension}`
            folder.file(fileName, blob)
          } catch (error) {
            console.error(`Error downloading song ${song.title}:`, error)
          }
        }
      }
      
      // Generate the zip file
      const content = await zip.generateAsync({ type: "blob" })
      saveAs(content, `${album.title} - ${album.artist.name}.zip`)
    } catch (error) {
      console.error("Error creating zip file:", error)
    } finally {
      setDownloadingAll(false)
    }
  }

  const formatDuration = (ms) => {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  const formatReleaseDate = (dateString) => {
    const date = new Date(dateString)
    return date.getFullYear()
  }

  if (loading) {
    return <div className="playlist-loading"><div className="loading-spinner" /></div>
  }

  if (!album) {
    return (
      <div className="playlist-error">
        <h2>Album not found</h2>
      </div>
    )
  }
  return (
    <div className="playlist-page">
      <div className="playlist-header">
        <div className="playlist-cover">
          <img src={album.cover_image} alt={album.title} className="playlist-image" />
        </div>
        <div className="playlist-info">
          <div className="playlist-type">Album</div>
          <h1 className="playlist-name">{album.title}</h1>
          <div className="playlist-meta">
            <span className="playlist-owner">{album.artist.name}</span>
            <span className="meta-separator">•</span>
            <span className="playlist-year">{formatReleaseDate(album.release_date)}</span>
            <span className="meta-separator">•</span>
            <span className="playlist-songs">{album.songs_count} songs</span>
          </div>
        </div>
      </div>

      <div className="playlist-actions">
        {songs.length > 0 && (
          <>
            <button className="play-all-button" onClick={() => handlePlaySong(songs[0], 0)}> <svg viewBox="0 0 24 24" fill="none"><path d="M8 5.14v14l11-7-11-7z" fill="currentColor" /></svg> </button>
            <button 
              className="download-all-button" 
              onClick={downloadAllSongs}
              disabled={downloadingAll}
            >
              {downloadingAll ? (
                <span>Downloading...</span>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" fill="none" className="download-icon">
                    <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" fill="currentColor" />
                  </svg>
                  <span>Download All</span>
                </>
              )}
            </button>
          </>
        )}
      </div>

      <div className="playlist-songs">
        <div className="songs-header album-songs-header">
          <div className="song-number">#</div>
          <div className="song-title">Title</div>
          <div className="song-duration">
            <svg viewBox="0 0 16 16" className="duration-icon">
              <path d="M8 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13z" />
              <path d="M8 3.25a.75.75 0 0 1 .75.75v3.25H11a.75.75 0 0 1 0 1.5H7.25V4A.75.75 0 0 1 8 3.25z" />
            </svg>
          </div>
          <div className="song-download">Download</div>
        </div>

        <div className="songs-list">
          {songs.map((song, index) => (
            <div key={song.id} className="song-item album-song-item" onDoubleClick={() => handlePlaySong(song, index)}>
              <div className="song-number">
                <span className="song-index">{index + 1}</span>
                <button className="song-play-button" onClick={() => handlePlaySong(song, index)}>
                  <svg viewBox="0 0 24 24" fill="none"><path d="M8 5.14v14l11-7-11-7z" fill="currentColor" /></svg>
                </button>
              </div>
            
              <div className="song-title album-song-title">
                <div className="song-info">
                  <div className="song-name">{song.title}</div>
                  <div className="song-artist">{song.artists[0].name}</div>
                </div>
              </div>
            
              <div className="song-duration">{song.duration}</div>
            
              <div className="song-download">
                {song.audio_file && (
                  <a 
                    href={song.audio_file} 
                    download 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="download-button"
                    title="Download"
                  >
                    <svg viewBox="0 0 24 24" fill="none" className="download-icon">
                      <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" fill="currentColor" />
                    </svg>
                  </a>
                )}
              <button
                className="favorite-btn"
                onClick={(e) => handleToggleFavorite(e, song.id, song.is_favorite, 'song')}
              >
                {song.is_favorite ? (
                  <HeartFilledIcon />
                ) : (
                  <HeartOutlineIcon />
                )}
              </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default AlbumPage