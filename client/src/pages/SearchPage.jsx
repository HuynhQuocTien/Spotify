import { useState, useEffect } from 'react';
import './SearchPage.css';
import api from '../services/api';
import { useMusicPlayer } from '../contexts/MusicPlayerContext';


const SearchPage = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [songs, setSongs] = useState([]); // State để lưu danh sách bài hát ban đầu
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [cancelTokenSource, setCancelTokenSource] = useState(null);
  const { playSong, currentSong, isPlaying, favorites, updateFavorites } = useMusicPlayer();

  useEffect(() => {
    // Load danh sách bài hát khi trang được tải
    const fetchInitialSongs = async () => {
      try {
        setLoading(true);
        // Gọi API để lấy danh sách bài hát phổ biến
        const response = await api.getSongs(); // Bạn cần thêm API này vào service

        // Format dữ liệu tương tự như kết quả search
        setSongs(response.data || []);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching initial songs:', error);
        setLoading(false);
      }
    };

    fetchInitialSongs();
  }, []);

  useEffect(() => {
    if (cancelTokenSource) {
      cancelTokenSource.cancel('Operation canceled due to new request');
    }

    const source = api.createCancelToken();
    setCancelTokenSource(source);
    const searchTimeout = setTimeout(() => {
      if (query.trim().length > 1) {
        performSearch(source.token);
      } else {
        setResults(null);
        // Khi không có query, hiển thị lại danh sách bài hát ban đầu
        if (songs.length > 0) {
          setResults({ songs: { items: songs } });
        }
      }
    }, 500);

    return () => {
      clearTimeout(searchTimeout);
      if (cancelTokenSource) {
        cancelTokenSource.cancel('Operation canceled by component unmount');
      }
    };
  }, [query, activeTab, songs]);

  const performSearch = async (cancelToken) => {
    try {
      setLoading(true);
      const response = await api.search(query, cancelToken);
      console.log('Search results:', response.data);
      const formattedResults = {
        songs: response.data.songs || [],
        artists: response.data.artists || [],
        albums: response.data.albums || []
        
      };
      console.log('Formatted results:', formattedResults);
      if (activeTab === 'songs') {
        setResults({ songs: formattedResults.songs });
      } else if (activeTab === 'artists') {
        setResults({ artists: formattedResults.artists });
      } else if (activeTab === 'albums') {
        setResults({ albums: formattedResults.albums });
      } else {
        setResults(formattedResults);
      }
      console.log('Search results set:', results);
      setLoading(false);
    } catch (error) {
      if (!api.isCancel(error)) {
        console.error('Error searching:', error);
        setLoading(false);
      }
    }
  };

  const handlePlaySong = async (e, song) => {
    e?.preventDefault();
    e?.stopPropagation();

    if (!song.audio_file || loading) return;

    try {
      await playSong({
        ...song,
        audio: song.audio_file,
      });
    } catch (err) {
      console.error('Playback failed:', err);
    }
  };

  return (
    <div className="search-page">
      <div className="search-header">
        <input
          type="text"
          className="search-input"
          placeholder="What do you want to listen to?"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
      </div>

      {query && (
        <div className="search-tabs">
          <button
            className={`search-tab ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All
          </button>
          <button
            className={`search-tab ${activeTab === 'songs' ? 'active' : ''}`}
            onClick={() => setActiveTab('songs')}
          >
            Songs
          </button>
          <button
            className={`search-tab ${activeTab === 'artists' ? 'active' : ''}`}
            onClick={() => setActiveTab('artists')}
          >
            Artists
          </button>
          <button
            className={`search-tab ${activeTab === 'albums' ? 'active' : ''}`}
            onClick={() => setActiveTab('albums')}
          >
            Albums
          </button>
        </div>
      )}

      {loading && (
        <div className="search-loading">
          <div className="loading-spinner"></div>
        </div>
      )}

      {!query && !results && songs.length > 0 && (
        <div className="search-results">
          <div className="search-section">
            <h2 className="search-section-title">Popular Songs</h2>
            <div className="songs-list">
              {songs.map((song, index) => (
                <div key={song.id} className="song-item-s">
                  <div className="song-number">{index + 1}</div>
                  <img
                    src={song.album?.cover_image}
                    alt={song.title}
                    className="song-image"
                  />
                  <div className="song-info">
                    <span className="song-name">{song.title}</span>
                    <span className="song-artist">
                      {song.artists?.map(artist => artist.name).join(', ')}
                    </span>
                  </div>
                  <div className="song-album">{song.album?.title}</div>
                  <div className="song-duration">{song.duration}</div>
                  <div className="song-popularity">
                    <div className="popularity-bar" style={{ width: "20%" }}></div>
                  </div>
                  <button className="song-play-button">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M8 5.14v14l11-7-11-7z" fill="currentColor" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {results && !loading && (
        <div className="search-results">
          {/* Các phần hiển thị kết quả search giữ nguyên như trước */}
          {activeTab === 'all' && (results.artists?.items.length > 0 || results.songs?.items.length > 0) && (
            <div className="search-section">
              <h2 className="search-section-title">Top result</h2>
              <div className="top-result">
                {results.artists[0] ? (
                  <div className="top-result-artist">
                    <img
                      src={results.artists.cover_image}
                      alt={results.artists.name}
                      className="top-result-image"
                    />
                    <h3 className="top-result-name">{results.artists.name}</h3>
                    <span className="top-result-type">Artist</span>
                    <span className="top-result-followers">
                      12 followers
                    </span>
                    <button className="song-play-button">
                      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8 5.14v14l11-7-11-7z" fill="currentColor" />
                      </svg>
                    </button>
                  </div>
                ) : results.songs ? (
                  <div className="top-result-song">
                    <img
                      src={results.songs.album?.cover_image}
                      alt={results.songstitle}
                      className="top-result-image"
                    />
                    <h3 className="top-result-name">{results.songs.album?.title}  </h3>
                    <span className="top-result-artist">
                    {results.songs.artists?.map(artist => artist.name).join(', ')}
                    </span>
                    <span className="top-result-popularity">
                      Popularity: 50/100
                    </span>
                    <button className="song-play-button">
                      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8 5.14v14l11-7-11-7z" fill="currentColor" />
                      </svg>
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          )}

          {(activeTab === 'all' || activeTab === 'songs') && results.songs?.length > 0 && (
            <div className="search-section">
              <h2 className="search-section-title">Songs</h2>
              <div className="songs-list">
                {results.songs.map((song, index) => (
                  <div key={song.id} className="song-item-s"
                  onClick={(e) => handlePlaySong(e, song)}>
                    <div className="song-number">{index + 1}</div>
                    <img
                      src={song.image}
                      alt={song.title}
                      className="song-image"
                    />
                    <div className="song-info">
                      <span className="song-name">{song.title}</span>
                      <span className="song-artist">
                        {song.artists?.map(artist => artist.name).join(', ')}
                      </span>
                    </div>
                    <div className="song-album">{song.album?.title}</div>
                    <div className="song-duration">{song.duration}</div>
                    <div className="song-popularity">
                      <div className="popularity-bar" style={{ width: "20%"}}></div>
                    </div>
                    <button className="song-play-button">
                      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8 5.14v14l11-7-11-7z" fill="currentColor" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!results.songs?.length &&
            !results.artists?.length &&
            !results.albums?.length && (
              <div className="no-results">
                <h2>No results found for "{query}"</h2>
                <p>Please check your spelling or try different keywords.</p>
              </div>
            )}
        </div>
      )}
    </div>
  );
};

export default SearchPage;