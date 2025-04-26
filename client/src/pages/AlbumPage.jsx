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
import "./AlbumPage.css"

const AlbumPage = () => {
  const { id } = useParams()
  const [album, setAlbum] = useState(null)
  const [songs, setSongs] = useState([])
  const [loading, setLoading] = useState(true)
  const [downloadingAll, setDownloadingAll] = useState(false)
  const { playTrack, currentTrack, togglePlay } = useMusicPlayer()
  const [favorites, setFavorites] = useState([])

  const FAVORITE_TYPE = {
    SONG: 'song',
    ALBUM: 'album'
  };
  const isFavorite = (trackId, type) => {
    if (!favorites || typeof favorites !== 'object') return false;
  
    if (type === 'song') {
      console.log(favorites.songs?.some((fav) => fav.id === trackId));
      return favorites.songs?.some((fav) => fav.id === trackId);
    }
  
    if (type === 'album') {
      return favorites.albums?.some((fav) => fav.id === trackId);
    }
  
    return false;
  };
  const handleToggleFavorite = async (e, trackId, isCurrentlyFavorite, type) => {
    e.stopPropagation();
    setTopTracks(prev => 
      prev.map(track => 
        track.id === trackId 
          ? { ...track, is_favorite: !isCurrentlyFavorite } 
          : track
      )
    );
    try {
        await api.addFavoriteTrack(trackId, type);
  
      setTopTracks((prev) =>
        prev.map((t) =>
          t.id === trackId ? { ...t, is_favorite: !t.isCurrentlyFavorite } : t
        )
      );
    } catch (err) {
      console.error('Toggle favorite failed:', err);
    }
  };

  useEffect(() => {
    const fetchAlbumAndSongs = async () => {
      try {
        setLoading(true)
        const [albumRes, songsRes] = await Promise.all([
          api.getAlbum(id),
          api.getAlbumTracks(id)
        ])
        setAlbum(albumRes.data)
        setSongs(songsRes.data.tracks)
        console.log("Album data:", albumRes.data)
        console.log("Songs data:", songsRes.data.tracks)
      } catch (error) {
        console.error("Error fetching album or songs:", error)
      } finally {
        setLoading(false)
      }
    }
  
    fetchAlbumAndSongs()
  }, [id])
  

  const handlePlayTrack = (track, index) => {
    if (!track || !songs || songs.length === 0) return
  
    if (currentTrack?.id === track.id) {
      togglePlay()
      return
    }
  
    const contextUri = `album:${album.id}`
    const contextTracks = songs
  
    playTrack({
      id: track.id,
      name: track.name,
      artists: track.artists || [],
      album: album
        ? { name: album.title, image: album.cover_image }
        : { name: '', image: '' },
      duration: track.duration || track.duration_ms || 0,
      audio: track.audio_file || track.preview_url,
      image: track.image || album.cover_image,
      contextUri,
      contextTracks
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
            <span className="playlist-tracks">{album.songs_count} songs</span>
          </div>
        </div>
      </div>

      <div className="playlist-actions">
        {songs.length > 0 && (
          <>
            <button className="play-all-button" onClick={() => handlePlayTrack(songs[0], 0)}> <svg viewBox="0 0 24 24" fill="none"><path d="M8 5.14v14l11-7-11-7z" fill="currentColor" /></svg> </button>
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

      <div className="playlist-tracks">
        <div className="tracks-header album-tracks-header">
          <div className="track-number">#</div>
          <div className="track-title">Title</div>
          <div className="track-duration">
            <svg viewBox="0 0 16 16" className="duration-icon">
              <path d="M8 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13z" />
              <path d="M8 3.25a.75.75 0 0 1 .75.75v3.25H11a.75.75 0 0 1 0 1.5H7.25V4A.75.75 0 0 1 8 3.25z" />
            </svg>
          </div>
          <div className="track-download">Download</div>
        </div>

        <div className="tracks-list">
          {songs.map((track, index) => (
            <div key={track.id} className="track-item album-track-item" onDoubleClick={() => handlePlayTrack(track, index)}>
              <div className="track-number">
                <span className="track-index">{index + 1}</span>
                <button className="track-play-button" onClick={() => handlePlayTrack(track, index)}>
                  <svg viewBox="0 0 24 24" fill="none"><path d="M8 5.14v14l11-7-11-7z" fill="currentColor" /></svg>
                </button>
              </div>
            
              <div className="track-title album-track-title">
                <div className="track-info">
                  <div className="track-name">{track.title}</div>
                  <div className="track-artist">{track.artists[0].name}</div>
                </div>
              </div>
            
              <div className="track-duration">{track.duration}</div>
            
              <div className="track-download">
                {track.audio_file && (
                  <a 
                    href={track.audio_file} 
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
                onClick={(e) => handleToggleFavorite(e, track.id, track.is_favorite, 'song')}
              >
                {track.is_favorite ? (
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