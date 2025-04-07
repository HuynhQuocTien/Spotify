import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api'; // Your Django backend URL

const api = {
  // Auth
  login: (credentials) => axios.post(`${API_BASE_URL}/auth/login/`, credentials),
  register: (userData) => axios.post(`${API_BASE_URL}/auth/register/`, userData),
  
  // Songs
  getRecentlyPlayed: () => axios.get(`${API_BASE_URL}/songs/recent/`),
  getSong: (id) => axios.get(`${API_BASE_URL}/songs/${id}/`),
  incrementPlays: (id) => axios.post(`${API_BASE_URL}/songs/${id}/increment_plays/`),
  
  // Albums
  getNewReleases: () => axios.get(`${API_BASE_URL}/albums/new_releases/`),
  getAlbum: (id) => axios.get(`${API_BASE_URL}/albums/${id}/`),
  getAlbumSongs: (id) => axios.get(`${API_BASE_URL}/albums/${id}/songs/`),
  
  // Artists
  getArtist: (id) => axios.get(`${API_BASE_URL}/artists/${id}/`),
  getArtistAlbums: (id) => axios.get(`${API_BASE_URL}/artists/${id}/albums/`),
  
  // Playlists
  getUserPlaylists: () => axios.get(`${API_BASE_URL}/playlists/`),
  createPlaylist: (data) => axios.post(`${API_BASE_URL}/playlists/`, data),
  getPlaylist: (id) => axios.get(`${API_BASE_URL}/playlists/${id}/`),
  addSongToPlaylist: (playlistId, songId) => 
    axios.post(`${API_BASE_URL}/playlists/${playlistId}/add_song/`, { song_id: songId }),
  removeSongFromPlaylist: (playlistId, songId) => 
    axios.post(`${API_BASE_URL}/playlists/${playlistId}/remove_song/`, { song_id: songId }),
  
  // User
  getUserProfile: () => axios.get(`${API_BASE_URL}/profile/`),
  addFavoriteSong: (songId) => 
    axios.post(`${API_BASE_URL}/profile/add_favorite_song/`, { song_id: songId }),
  removeFavoriteSong: (songId) => 
    axios.post(`${API_BASE_URL}/profile/remove_favorite_song/`, { song_id: songId }),
  
  // Search
  search: (query) => axios.get(`${API_BASE_URL}/search/?q=${query}`),
};

// Add request interceptor to include auth token
axios.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => {
  return Promise.reject(error);
});

// Add response interceptor to handle errors
axios.interceptors.response.use(response => {
  return response;
}, error => {
  if (error.response && error.response.status === 401) {
    // Handle unauthorized access (e.g., redirect to login)
    localStorage.removeItem('token');
    window.location.href = '/login';
  }
  return Promise.reject(error);
});

export default api;