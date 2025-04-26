// import { useState, useEffect } from "react";
// import { useMusicPlayer } from "../contexts/MusicPlayerContext";
// import api from "../services/api";
// import "./FavoritesPage.css";

// const FavoritesPage = () => {
//   const [favorites, setFavorites] = useState({ tracks: [], albums: [] });
//   const [loading, setLoading] = useState(true);
//   const { playTrack, currentTrack, isPlaying, togglePlay } = useMusicPlayer();

//   useEffect(() => {
//     const fetchFavorites = async () => {
//       try {
//         setLoading(true);
//         // Fetch cả tracks và albums yêu thích albumsResponse
//         const [tracksResponse] = await Promise.all([
//           api.getFavoriteTracks(),
//         ]);
//         setFavorites({
//           tracks: tracksResponse.data.songs || [],
//           albums: tracksResponse.data.albums || []
//         });
//       } catch (error) {
//         console.error("Error fetching favorites:", error);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchFavorites();
//   }, []);

//   const handleRemoveFavorite = async (id, type) => {
//     try {
//       await api.removeFavorite(id, type);
//       setFavorites(prev => ({
//         ...prev,
//         [type]: prev[type].filter(item => item.id !== id)
//       }));
//     } catch (error) {
//       console.error("Error removing favorite:", error);
//     }
//   };

//   const handlePlayTrack = (track, index) => {
//     if (currentTrack?.id === track.id) {
//       togglePlay();
//       return;
//     }

//     playTrack({
//       id: track.id,
//       name: track.title,
//       artists: track.artists || [],
//       album: track.album || { name: "", image: "" },
//       duration: track.duration || 0,
//       audio: track.audio_file,
//       image: track.image || track.album?.image,
//       contextUri: "favorites",
//       contextTracks: favorites.tracks
//     });
//   };

//   const handlePlayAlbum = async (album) => {
//     try {
//       // Lấy danh sách bài hát trong album
//       const response = await api.getAlbumTracks(album.id);
//       const tracks = response.data || [];
      
//       if (tracks.length > 0) {
//         playTrack({
//           ...tracks[0],
//           name: tracks[0].title,
//           audio: tracks[0].audio_file,
//           contextUri: `album:${album.id}`,
//           contextTracks: tracks
//         });
//       }
//     } catch (error) {
//       console.error("Error playing album:", error);
//     }
//   };

//   const formatDuration = (ms) => {
//     if (!ms) return "0:00";
//     const minutes = Math.floor(ms / 60000);
//     const seconds = Math.floor((ms % 60000) / 1000);
//     return `${minutes}:${seconds.toString().padStart(2, '0')}`;
//   };

//   if (loading) {
//     return (
//       <div className="favorites-loading">
//         <div className="loading-spinner"></div>
//       </div>
//     );
//   }

//   const totalFavorites = favorites.tracks.length + favorites.albums.length;

//   return (
//     <div className="favorites-page">
//       <h1>Your Favorites</h1>
      
//       {totalFavorites === 0 ? (
//         <div className="no-favorites">
//           <p>You haven't added any favorites yet.</p>
//         </div>
//       ) : (
//         <div className="favorites-container">
//           {/* Favorite Tracks Section */}
//           {favorites.tracks.length > 0 && (
//             <div className="favorites-section">
//               <h2>Songs</h2>
//               <div className="favorites-list">
//                 {favorites.tracks.map((track, index) => (
//                   <div key={`track-${track.id}`} className="favorite-item">
//                     <div className="item-info">
//                       <div className="item-number">{index + 1}</div>
//                       <button 
//                         className="item-play"
//                         onClick={() => handlePlayTrack(track, index)}
//                       >
//                         {currentTrack?.id === track.id && isPlaying ? (
//                           <span>⏸</span>
//                         ) : (
//                           <span>▶</span>
//                         )}
//                       </button>
//                       <img 
//                         src={track.image || track.album?.image} 
//                         alt={track.title} 
//                         className="item-image"
//                       />
//                       <div className="item-details">
//                         <div className="item-title">{track.title}</div>
//                         <div className="item-artist">
//                           {track.artists?.map(artist => artist.name).join(", ")}
//                         </div>
//                         <div className="item-meta">
//                           {formatDuration(track.duration)}
//                         </div>
//                       </div>
//                     </div>
//                     <button 
//                       className="remove-favorite"
//                       onClick={() => handleRemoveFavorite(track.id, 'tracks')}
//                     >
//                       Remove
//                     </button>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}

//           {/* Favorite Albums Section */}
//           {favorites.albums.length > 0 && (
//             <div className="favorites-section">
//               <h2>Albums</h2>
//               <div className="favorites-list">
//                 {favorites.albums.map((album, index) => (
//                   <div key={`album-${album.id}`} className="favorite-item">
//                     <div className="item-info">
//                       <div className="item-number">{index + 1}</div>
//                       <button 
//                         className="item-play"
//                         onClick={() => handlePlayAlbum(album)}
//                       >
//                         <span>▶</span>
//                       </button>
//                       <img 
//                         src={album.image} 
//                         alt={album.title} 
//                         className="item-image"
//                       />
//                       <div className="item-details">
//                         <div className="item-title">{album.title}</div>
//                         <div className="item-artist">
//                           {album.artist?.name}
//                         </div>
//                         <div className="item-meta">
//                           Album • {album.release_date} • {album.total_tracks} songs
//                         </div>
//                       </div>
//                     </div>
//                     <button 
//                       className="remove-favorite"
//                       onClick={() => handleRemoveFavorite(album.id, 'albums')}
//                     >
//                       Remove
//                     </button>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// };

// export default FavoritesPage;

import { useState, useEffect } from "react";
import { useMusicPlayer } from "../contexts/MusicPlayerContext";
import api from "../services/api";
import "./FavoritesPage.css";
import HeartFilledIcon from '../components/HeartFilledIcon';
import HeartOutlineIcon from '../components/HeartOutlineIcon';

const FavoritesPage = () => {
  const [favorites, setFavorites] = useState({ tracks: [], albums: [] });
  const [loading, setLoading] = useState(true);
  const { playTrack, currentTrack, isPlaying } = useMusicPlayer();

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        setLoading(true);
        const [tracksResponse] = await Promise.all([
          api.getFavoriteTracks()
        ]);
        console.log(tracksResponse.data);
        setFavorites({
          tracks: tracksResponse.data.songs || [],
          albums: tracksResponse.data.albums || []
        });
      } catch (error) {
        console.error("Error fetching favorites:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchFavorites();
  }, []);

  const handlePlayTrack = (track, index) => {
    if (currentTrack?.id === track.id) {
      // Handle pause logic if needed
      return;
    }

    playTrack({
      ...track,
      audio: track.audio_file,
      contextTracks: favorites.tracks,
      contextUri: `favorites:track:${track.id}`,
    });
  };

  const handlePlayAlbum = async (album) => {
    try {
      const response = await api.getAlbumTracks(album.id);
      const tracks = response.data || [];
      
      if (tracks.length > 0) {
        playTrack({
          ...tracks[0],
          audio: tracks[0].audio_file,
          contextTracks: tracks,
          contextUri: `album:${album.id}`,
        });
      }
    } catch (error) {
      console.error("Error playing album:", error);
    }
  };

  const handleRemoveFavorite = async (id, type) => {
    try {
      await api.removeFavorite(id, type);
      setFavorites(prev => ({
        ...prev,
        [type]: prev[type].filter(item => item.id !== id)
      }));
    } catch (error) {
      console.error("Error removing favorite:", error);
    }
  };

  if (loading) {
    return (
      <div className="favorites-loading">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="favorites-page">
      <div className="favorites-header">
        <div className="favorites-header-content">
          <h1 className="favorites-title">My Favorites</h1>
          <p className="favorites-description">
            {favorites.tracks.length} songs • {favorites.albums.length} albums
          </p>
        </div>
      </div>

      <div className="action-buttons">
        <button className="play-button">
          <svg viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" fill="currentColor" />
          </svg>
        </button>
      </div>

      {/* Favorite Tracks Section */}
      {favorites.tracks.length > 0 && (
        <>
          <h2 className="section-title">Favorite Songs</h2>
          <div className="tracks-list">
            {favorites.tracks.map((track, index) => (
              <div
                key={`track-${track.id}`}
                className={`track-row ${currentTrack?.id === track.id && isPlaying ? 'active' : ''}`}
                onClick={() => handlePlayTrack(track, index)}
              >
                <div className="track-number">
                  {currentTrack?.id === track.id && isPlaying ? (
                    <div className="playing-animation">
                      <span className="bar"></span>
                      <span className="bar"></span>
                      <span className="bar"></span>
                    </div>
                  ) : (
                    index + 1
                  )}
                </div>
                <div className="track-info">
                  <div className="track-name">{track.title}</div>
                  <div className="track-artists">
                    {track.artists?.map(artist => artist.name).join(", ")}
                  </div>
                </div>
                <div className="track-album">{track.album?.name}</div>
                <div className="track-duration">{track.duration}</div>
                <button
                  className="favorite-btn active"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveFavorite(track.id, 'tracks');
                  }}
                >
                  <svg viewBox="0 0 16 16">
                    <path d="M8 1.314C12.438-3.248 23.534 4.735 8 15-7.534 4.736 3.562-3.248 8 1.314z" />
                  </svg>
                </button>
                {track.is_favorite ? <HeartFilledIcon /> : <HeartOutlineIcon />}
              </div>
            ))}
          </div>
        </>
      )}

      {/* Favorite Albums Section */}
      {favorites.albums.length > 0 && (
        <>
          <h2 className="section-title">Favorite Albums</h2>
          <div className="albums-grid">
            {favorites.albums.map(album => (
              <div key={`album-${album.id}`} className="album-card">
                <div className="album-cover">
                  <img src={album.image} alt={album.title} className="album-image" />
                  <button 
                    className="play-button"
                    onClick={() => handlePlayAlbum(album)}
                  >
                    <svg viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" fill="currentColor" />
                    </svg>
                  </button>
                </div>
                <div className="album-info">
                  <div className="album-name">{album.title}</div>
                  <div className="album-meta">{album.artist?.name}</div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {favorites.tracks.length === 0 && favorites.albums.length === 0 && (
        <div className="no-favorites">
          <p>You haven't added any favorites yet.</p>
        </div>
      )}
    </div>
  );
};

export default FavoritesPage;