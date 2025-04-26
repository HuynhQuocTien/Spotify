import { useState, useEffect } from 'react';
import './SearchPage.css';

const SearchPage = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load browse categories when the page loads
    const fetchCategories = async () => {
      try {
        setLoading(true);
        // In a real app, this would be an API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setCategories([
          { id: 'pop', name: 'Pop', color: 'from-pink-500 to-purple-500' },
          { id: 'hiphop', name: 'Hip-Hop', color: 'from-yellow-500 to-orange-500' },
          { id: 'rock', name: 'Rock', color: 'from-red-500 to-pink-500' },
          { id: 'indie', name: 'Indie', color: 'from-blue-500 to-indigo-500' },
          { id: 'focus', name: 'Focus', color: 'from-green-500 to-teal-500' },
          { id: 'electronic', name: 'Electronic', color: 'from-purple-500 to-blue-500' },
          { id: 'rnb', name: 'R&B', color: 'from-red-500 to-yellow-500' },
          { id: 'wellness', name: 'Wellness', color: 'from-teal-500 to-green-500' },
          { id: 'latin', name: 'Latin', color: 'from-orange-500 to-red-500' },
          { id: 'workout', name: 'Workout', color: 'from-blue-500 to-cyan-500' },
          { id: 'party', name: 'Party', color: 'from-purple-500 to-pink-500' },
          { id: 'sleep', name: 'Sleep', color: 'from-indigo-500 to-blue-500' },
        ]);
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setLoading(false);
      }
    };
    
    fetchCategories();
  }, []);

  useEffect(() => {
    // Search when query changes
    const searchTimeout = setTimeout(() => {
      if (query.trim().length > 1) {
        performSearch();
      } else {
        setResults(null);
      }
    }, 500);

    return () => clearTimeout(searchTimeout);
  }, [query]);

  const performSearch = async () => {
    try {
      setLoading(true);
      // In a real app, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock search results
      setResults({
        songs: {
          items: [
            {
              id: 'song1',
              name: 'Blinding Lights',
              artists: [{ name: 'The Weeknd' }],
              album: { 
                name: 'After Hours',
                images: [{ url: '/placeholder.svg?height=40&width=40' }]
              },
              duration_ms: 200000
            },
            {
              id: 'song2',
              name: 'Save Your Tears',
              artists: [{ name: 'The Weeknd' }],
              album: { 
                name: 'After Hours',
                images: [{ url: '/placeholder.svg?height=40&width=40' }]
              },
              duration_ms: 215000
            },
            {
              id: 'song3',
              name: 'Starboy',
              artists: [{ name: 'The Weeknd', id: 'artist1' }, { name: 'Daft Punk', id: 'artist2' }],
              album: { 
                name: 'Starboy',
                images: [{ url: '/placeholder.svg?height=40&width=40' }]
              },
              duration_ms: 230000
            }
          ]
        },
        artists: {
          items: [
            {
              id: 'artist1',
              name: 'The Weeknd',
              images: [{ url: '/placeholder.svg?height=160&width=160' }]
            },
            {
              id: 'artist2',
              name: 'Daft Punk',
              images: [{ url: '/placeholder.svg?height=160&width=160' }]
            }
          ]
        },
        albums: {
          items: [
            {
              id: 'album1',
              name: 'After Hours',
              artists: [{ name: 'The Weeknd' }],
              images: [{ url: '/placeholder.svg?height=160&width=160' }]
            },
            {
              id: 'album2',
              name: 'Starboy',
              artists: [{ name: 'The Weeknd' }],
              images: [{ url: '/placeholder.svg?height=160&width=160' }]
            }
          ]
        },
        playlists: {
          items: [
            {
              id: 'playlist1',
              name: 'This Is The Weeknd',
              description: 'All his biggest hits and essential songs.',
              images: [{ url: '/placeholder.svg?height=160&width=160' }]
            }
          ]
        }
      });
      
      setLoading(false);
    } catch (error) {
      console.error('Error searching:', error);
      setLoading(false);
    }
  };

  // Update query from the header search input
  useEffect(() => {
    const searchInput = document.querySelector('.search-input');
    if (searchInput && window.location.pathname === '/search') {
      searchInput.focus();
      
      const handleSearchChange = (e) => {
        setQuery(e.target.value);
      };
      
      searchInput.addEventListener('input', handleSearchChange);
      
      return () => {
        searchInput.removeEventListener('input', handleSearchChange);
      };
    }
  }, []);

  return (
    <div className="search-page">
      {!query && !results && (
        <>
          <h2 className="browse-title">Browse all</h2>
          <div className="categories-grid">
            {categories.map(category => (
              <div 
                key={category.id}
                className={`category-item bg-gradient-to-br ${category.color}`}
              >
                <span className="category-name">{category.name}</span>
              </div>
            ))}
          </div>
        </>
      )}
      
      {loading && (
        <div className="search-loading">
          <div className="loading-spinner"></div>
        </div>
      )}
      
      {results && !loading && (
        <div className="search-results">
          {/* Top result */}
          {(results.artists?.items.length > 0 || results.songs?.items.length > 0) && (
            <div className="search-section">
              <h2 className="search-section-title">Top result</h2>
              <div className="top-result">
                {results.artists?.items[0] ? (
                  <div className="top-result-artist">
                    <img 
                      src={results.artists.items[0].images[0].url || "/placeholder.svg"} 
                      alt={results.artists.items[0].name}
                      className="top-result-image"
                    />
                    <h3 className="top-result-name">{results.artists.items[0].name}</h3>
                    <span className="top-result-type">Artist</span>
                    <button className="play-button">
                      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8 5.14v14l11-7-11-7z" fill="currentColor" />
                      </svg>
                    </button>
                  </div>
                ) : results.songs?.items[0] ? (
                  <div className="top-result-song">
                    <img 
                      src={results.songs.items[0].album.images[0].url || "/placeholder.svg"} 
                      alt={results.songs.items[0].name}
                      className="top-result-image"
                    />
                    <h3 className="top-result-name">{results.songs.items[0].name}</h3>
                    <span className="top-result-artist">
                      {results.songs.items[0].artists.map(artist => artist.name).join(', ')}
                    </span>
                    <button className="play-button">
                      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8 5.14v14l11-7-11-7z" fill="currentColor" />
                      </svg>
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          )}
          
          {/* Songs */}
          {results.songs?.items.length > 0 && (
            <div className="search-section">
              <h2 className="search-section-title">Songs</h2>
              <div className="songs-list">
                {results.songs.items.map(song => (
                  <div key={song.id} className="song-item">
                    <img 
                      src={song.album.images[0].url || "/placeholder.svg"} 
                      alt={song.name}
                      className="song-image"
                    />
                    <div className="song-info">
                      <span className="song-name">{song.name}</span>
                      <span className="song-artist">
                        {song.artists.map(artist => artist.name).join(', ')}
                      </span>
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
          
          {/* Artists */}
          {results.artists?.items.length > 0 && (
            <div className="search-section">
              <h2 className="search-section-title">Artists</h2>
              <div className="search-grid">
                {results.artists.items.map(artist => (
                  <div key={artist.id} className="search-grid-item">
                    <div className="search-grid-image-container">
                      <img 
                        src={artist.images[0].url || "/placeholder.svg"} 
                        alt={artist.name}
                        className="search-grid-image artist-image"
                      />
                    </div>
                    <h3 className="search-grid-name">{artist.name}</h3>
                    <span className="search-grid-type">Artist</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Albums */}
          {results.albums?.items.length > 0 && (
            <div className="search-section">
              <h2 className="search-section-title">Albums</h2>
              <div className="search-grid">
                {results.albums.items.map(album => (
                  <div key={album.id} className="search-grid-item">
                    <div className="search-grid-image-container">
                      <img 
                        src={album.images[0].url || "/placeholder.svg"} 
                        alt={album.name}
                        className="search-grid-image"
                      />
                    </div>
                    <h3 className="search-grid-name">{album.name}</h3>
                    <span className="search-grid-type">
                      {album.artists.map(artist => artist.name).join(', ')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Playlists */}
          {results.playlists?.items.length > 0 && (
            <div className="search-section">
              <h2 className="search-section-title">Playlists</h2>
              <div className="search-grid">
                {results.playlists.items.map(playlist => (
                  <div key={playlist.id} className="search-grid-item">
                    <div className="search-grid-image-container">
                      <img 
                        src={playlist.images[0].url || "/placeholder.svg"} 
                        alt={playlist.name}
                        className="search-grid-image"
                      />
                    </div>
                    <h3 className="search-grid-name">{playlist.name}</h3>
                    <span className="search-grid-type">{playlist.description}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* No results */}
          {!results.songs?.items.length &&
            !results.artists?.items.length &&
            !results.albums?.items.length &&
            !results.playlists?.items.length && (
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
