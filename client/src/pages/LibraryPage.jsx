import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './LibraryPage.css';

const LibraryPage = () => {
  const [activeTab, setActiveTab] = useState('playlists');
  const [filterQuery, setFilterQuery] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [libraryItems, setLibraryItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLibraryItems = async () => {
      try {
        setLoading(true);
        // In a real app, this would be an API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Mock library data
        const mockLibrary = [
          {
            id: 'playlist1',
            name: 'Liked Songs',
            type: 'playlist',
            owner: { display_name: 'You' },
            images: [{ url: '/placeholder.svg?height=160&width=160' }],
            description: 'Your liked songs',
            tracks: { total: 123 },
            added_at: '2023-01-15T12:00:00Z'
          },
          {
            id: 'playlist2',
            name: 'Discover Weekly',
            type: 'playlist',
            owner: { display_name: 'Spotify' },
            images: [{ url: '/placeholder.svg?height=160&width=160' }],
            description: 'Your weekly mixtape of fresh music',
            tracks: { total: 30 },
            added_at: '2023-04-10T12:00:00Z'
          },
          {
            id: 'playlist3',
            name: 'Release Radar',
            type: 'playlist',
            owner: { display_name: 'Spotify' },
            images: [{ url: '/placeholder.svg?height=160&width=160' }],
            description: 'Catch all the latest music from artists you follow',
            tracks: { total: 30 },
            added_at: '2023-04-05T12:00:00Z'
          },
          {
            id: 'album1',
            name: 'After Hours',
            type: 'album',
            artists: [{ name: 'The Weeknd' }],
            images: [{ url: '/placeholder.svg?height=160&width=160' }],
            tracks: { total: 14 },
            added_at: '2023-03-20T12:00:00Z'
          },
          {
            id: 'album2',
            name: 'Midnights',
            type: 'album',
            artists: [{ name: 'Taylor Swift' }],
            images: [{ url: '/placeholder.svg?height=160&width=160' }],
            tracks: { total: 13 },
            added_at: '2023-02-15T12:00:00Z'
          },
          {
            id: 'artist1',
            name: 'The Weeknd',
            type: 'artist',
            images: [{ url: '/placeholder.svg?height=160&width=160' }],
            added_at: '2023-01-10T12:00:00Z'
          },
          {
            id: 'artist2',
            name: 'Taylor Swift',
            type: 'artist',
            images: [{ url: '/placeholder.svg?height=160&width=160' }],
            added_at: '2023-01-05T12:00:00Z'
          },
          {
            id: 'playlist4',
            name: 'Chill Vibes',
            type: 'playlist',
            owner: { display_name: 'You' },
            images: [{ url: '/placeholder.svg?height=160&width=160' }],
            description: 'Relaxing tunes for your downtime',
            tracks: { total: 45 },
            added_at: '2022-12-20T12:00:00Z'
          }
        ];
        
        setLibraryItems(mockLibrary);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching library:', error);
        setLoading(false);
      }
    };
    
    fetchLibraryItems();
  }, []);

  // Filter items based on active tab and search query
  const filteredItems = libraryItems.filter(item => {
    // Filter by tab
    if (activeTab !== 'all' && item.type !== activeTab.slice(0, -1)) {
      return false;
    }
    
    // Filter by search query
    if (filterQuery) {
      const query = filterQuery.toLowerCase();
      const name = item.name.toLowerCase();
      const creator = item.owner?.display_name?.toLowerCase() || 
                     item.artists?.map(a => a.name.toLowerCase()).join(' ') || 
                     '';
      
      return name.includes(query) || creator.includes(query);
    }
    
    return true;
  });

  // Sort items
  const sortedItems = [...filteredItems].sort((a, b) => {
    if (sortBy === 'recent') {
      return new Date(b.added_at) - new Date(a.added_at);
    } else if (sortBy === 'alphabetical') {
      return a.name.localeCompare(b.name);
    } else if (sortBy === 'creator') {
      const creatorA = a.owner?.display_name || a.artists?.[0]?.name || '';
      const creatorB = b.owner?.display_name || b.artists?.[0]?.name || '';
      return creatorA.localeCompare(creatorB);
    }
    return 0;
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div className="library-page">
      <div className="library-header">
        <div className="library-tabs">
          <button 
            className={`library-tab ${activeTab === 'playlists' ? 'active' : ''}`}
            onClick={() => setActiveTab('playlists')}
          >
            Playlists
          </button>
          <button 
            className={`library-tab ${activeTab === 'artists' ? 'active' : ''}`}
            onClick={() => setActiveTab('artists')}
          >
            Artists
          </button>
          <button 
            className={`library-tab ${activeTab === 'albums' ? 'active' : ''}`}
            onClick={() => setActiveTab('albums')}
          >
            Albums
          </button>
          <button 
            className={`library-tab ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All
          </button>
        </div>
        
        <div className="library-actions">
          <div className="library-filter">
            <button 
              className="filter-button"
              onClick={() => setShowFilterMenu(!showFilterMenu)}
            >
              <svg viewBox="0 0 16 16" className="filter-icon">
                <path d="M5 3.5h6v1H5v-1zm0 4h6v1H5v-1zm0 4h6v1H5v-1z"></path>
                <path d="M14 1H2a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z"></path>
              </svg>
            </button>
            
            {showFilterMenu && (
              <div className="filter-menu">
                <div className="filter-input-container">
                  <svg viewBox="0 0 16 16" className="search-icon">
                    <path d="M7 1.75a5.25 5.25 0 1 0 0 10.5 5.25 5.25 0 0 0 0-10.5zM.25 7a6.75 6.75 0 1 1 12.096 4.12l3.184 3.185a.75.75 0 1 1-1.06 1.06L11.304 12.2A6.75 6.75 0 0 1 .25 7z"></path>
                  </svg>
                  <input
                    type="text"
                    className="filter-input"
                    placeholder="Filter"
                    value={filterQuery}
                    onChange={(e) => setFilterQuery(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>
          
          <div className="library-sort">
            <button 
              className="sort-button"
              onClick={() => setShowSortMenu(!showSortMenu)}
            >
              <span className="sort-text">Sort by: {sortBy === 'recent' ? 'Recents' : sortBy === 'alphabetical' ? 'A-Z' : 'Creator'}</span>
              <svg viewBox="0 0 16 16" className="sort-icon">
                <path d="m14 6-6 6-6-6h12z"></path>
              </svg>
            </button>
            
            {showSortMenu && (
              <div className="sort-menu">
                <button 
                  className={`sort-option ${sortBy === 'recent' ? 'active' : ''}`}
                  onClick={() => {
                    setSortBy('recent');
                    setShowSortMenu(false);
                  }}
                >
                  Recents
                </button>
                <button 
                  className={`sort-option ${sortBy === 'alphabetical' ? 'active' : ''}`}
                  onClick={() => {
                    setSortBy('alphabetical');
                    setShowSortMenu(false);
                  }}
                >
                  Alphabetical
                </button>
                <button 
                  className={`sort-option ${sortBy === 'creator' ? 'active' : ''}`}
                  onClick={() => {
                    setSortBy('creator');
                    setShowSortMenu(false);
                  }}
                >
                  Creator
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {loading ? (
        <div className="library-loading">
          <div className="loading-spinner"></div>
        </div>
      ) : sortedItems.length > 0 ? (
        <div className="library-grid">
          {sortedItems.map(item => (
            <Link 
              key={item.id} 
              to={`/${item.type}/${item.id}`}
              className="library-item"
            >
              <div className="library-item-image-container">
                <img 
                  src={item.images[0].url || "/placeholder.svg"} 
                  alt={item.name}
                  className={`library-item-image ${item.type === 'artist' ? 'artist-image' : ''}`}
                />
                <button className="library-play-button">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 5.14v14l11-7-11-7z" fill="currentColor" />
                  </svg>
                </button>
              </div>
              <div className="library-item-info">
                <h3 className="library-item-name">{item.name}</h3>
                <div className="library-item-details">
                  <span className="library-item-type">{item.type.charAt(0).toUpperCase() + item.type.slice(1)}</span>
                  <span className="library-item-separator">•</span>
                  <span className="library-item-creator">
                    {item.owner?.display_name || item.artists?.map(a => a.name).join(', ') || ''}
                  </span>
                </div>
              </div>
              <div className="library-item-date">
                {formatDate(item.added_at)}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="library-empty">
          <h2>No results found</h2>
          {filterQuery && (
            <p>Try adjusting your filter or search for something else.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default LibraryPage;
