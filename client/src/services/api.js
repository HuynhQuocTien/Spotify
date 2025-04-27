// import axios from 'axios';

// const API_BASE_URL = 'http://localhost:8000/api';
// const MEDIA_BASE_URL = '/media'; 

// export const getMediaUrl = (path) => {
//   // Trong production, bạn có thể cần absolute URL:
//   // return `${process.env.REACT_APP_MEDIA_URL || 'http://yourdomain.com'}${path}`;
//   return `${MEDIA_BASE_URL}${path}`;
// };
// const CancelToken = axios.CancelToken;
// let activeRequests = 0;

// const api = {
//   // Auth
//   login: async (credentials) => {
//     try {
//       const response = await axios.post(`${API_BASE_URL}/auth/login/`, credentials)
//       return response.data
//     } catch (error) {
//       if (error.response) {
//         console.error('Error response:', error.response.data)
//         throw new Error(error.response.data.detail || 'Login failed')
//       } else if (error.request) {
//         console.error('Error request:', error.request)
//         throw new Error('No response from server. Please try again later.')
//       } else {
//         console.error('Error message:', error.message)
//         throw new Error('An unexpected error occurred.')
//       }
//     }
//   },
  
  
//   // Các API mới cho đăng ký, quên mật khẩu
//   register: (userData) => axios.post(`${API_BASE_URL}/auth/register/`, userData),
//   verifyEmail: (token) => axios.post(`${API_BASE_URL}/auth/verify-email/`, { token }),
//   resendVerificationEmail: (email) => axios.post(`${API_BASE_URL}/auth/resend-verification/`, { email }),
  
//   forgotPassword: (email) => axios.post(`${API_BASE_URL}/auth/forgot-password/`, { email }),
//   verifyPasswordResetOTP: (data) => axios.post(`${API_BASE_URL}/auth/verify-password-reset-otp/`, data),
//   resetPassword: (data) => axios.post(`${API_BASE_URL}/auth/reset-password/`, data),
  
//   // OTP
//   sendOTP: (email) => axios.post(`${API_BASE_URL}/auth/send-otp/`, { email }),
//   verifyOTP: (data) => axios.post(`${API_BASE_URL}/auth/verify-otp/`, data),
  
//   refreshToken: (refresh) => axios.post(`${API_BASE_URL}/auth/token/refresh/`, { refresh }),
  
//   // Social auth (nếu có)
//   socialAuthenticate: (provider, accessToken) => 
//     axios.post(`${API_BASE_URL}/auth/social/${provider}/`, { access_token: accessToken }),

//   // Songs
//   getRecentlyPlayed: () => axios.get(`${API_BASE_URL}/songs/recent/`),
//   getSong: (id) => axios.get(`${API_BASE_URL}/songs/${id}/`),
//   incrementPlays: (id) => axios.post(`${API_BASE_URL}/songs/${id}/increment_plays/`),
//   getSongFileUrl: (songPath) => getMediaUrl(`/songs/${songPath}`), // Thêm hàm mới
//   getSongs: () => axios.get(`${API_BASE_URL}/songs/`),

//   //Video
//   getVideos: () => axios.get(`${API_BASE_URL}/getVideos/`),
//   getVideo: (id) => axios.get(`${API_BASE_URL}/videos/${id}/`),

//   // Genres
//   getGenres: () => axios.get(`${API_BASE_URL}/genres/`),
//   getGenre: (id) => axios.get(`${API_BASE_URL}/genres/${id}/`),
//   getGenreByArtist: (id) => axios.get(`${API_BASE_URL}/genres/artist/${id}/`),
//   getGenreSongs: (id) => axios.get(`${API_BASE_URL}/genres/${id}/songs/`),
//   getGenreImageUrl: (imagePath) => getMediaUrl(`/genres/${imagePath}`), // Thêm hàm mới

//   // Top lists
//   getTopGenres: () => axios.get(`${API_BASE_URL}/genres/top/`),
//   getTopArtists: () => axios.get(`${API_BASE_URL}/artists/top/`),
//   getTopSongs: () => axios.get(`${API_BASE_URL}/songs/top/`),
//   getTopAlbums: () => axios.get(`${API_BASE_URL}/albums/top/`),
//   getTopPlaylists: () => axios.get(`${API_BASE_URL}/playlists/top/`),
  
//   // Albums
//   getNewReleases: () => axios.get(`${API_BASE_URL}/albums/new_releases/`),
//   getAlbum: (id) => axios.get(`${API_BASE_URL}/albums/${id}/`),
//   getAlbumSongs: (id) => axios.get(`${API_BASE_URL}/albums/${id}/songs/`),
//   getAlbumCoverUrl: (coverPath) => getMediaUrl(`/albums/${coverPath}`), // Thêm hàm mới
//   getAlbums: () => axios.get(`${API_BASE_URL}/albums/`),
//   getAlbumByArtist: (id) => axios.get(`${API_BASE_URL}/albums/artist/${id}/`),

  
//   // Artists
//   getArtist: (id) => axios.get(`${API_BASE_URL}/artists/${id}/`),
//   getArtistAlbums: (id) => axios.get(`${API_BASE_URL}/getArtistAlbums/${id}/`),
//   getArtistImageUrl: (imagePath) => getMediaUrl(`/artists/${imagePath}`), // Thêm hàm mới
//   getArtists : () => axios.get(`${API_BASE_URL}/artists/`),

  
//   // Playlists
//   getUserPlaylists: () => axios.get(`${API_BASE_URL}/playlists/`),
//   createPlaylist: (data) => axios.post(`${API_BASE_URL}/playlists/`, data),
//   getPlaylist: (id) => axios.get(`${API_BASE_URL}/playlists/${id}/`),
//   addSongToPlaylist: (playlistId, songId) => 
//     axios.post(`${API_BASE_URL}/playlists/${playlistId}/add_song/`, { song_id: songId }),
//   removeSongFromPlaylist: (playlistId, songId) => 
//     axios.post(`${API_BASE_URL}/playlists/${playlistId}/remove_song/`, { song_id: songId }),
  
//   // User
//   getUserProfile: () => axios.get(`${API_BASE_URL}/profile/`),
//   updateProfile: (data) => axios.put(`${API_BASE_URL}/profile/`, data),
//   changePassword: (data) => axios.post(`${API_BASE_URL}/profile/change-password/`, data),
//   addFavoriteSong: (songId) => 
//     axios.post(`${API_BASE_URL}/profile/add_favorite_song/`, { song_id: songId }),
//   removeFavoriteSong: (songId) => 
//     axios.post(`${API_BASE_URL}/profile/remove_favorite_song/`, { song_id: songId }),
  
//  // User Albums
//  createUserAlbum: (data) => axios.post(`${API_BASE_URL}/user-albums/`, data),
//  getUserAlbums: () => axios.get(`${API_BASE_URL}/user-albums/`),
//  getUserAlbum: (id) => axios.get(`${API_BASE_URL}/user-albums/${id}/`),
//  updateUserAlbum: (id, data) => axios.put(`${API_BASE_URL}/user-albums/${id}/`, data),
//  deleteUserAlbum: (id) => axios.delete(`${API_BASE_URL}/user-albums/${id}/`),
//  addSongToUserAlbum: (albumId, songId) => axios.post(`${API_BASE_URL}/user-albums/${albumId}/songs/`, { song_id: songId }),
//  removeSongFromUserAlbum: (albumId, songId) => axios.delete(`${API_BASE_URL}/user-albums/${albumId}/songs/${songId}/`),

//  // Favorites
 
//  getFavoriteSongs: () => axios.get(`${API_BASE_URL}/favorites/`),
//  addFavoriteSong: (songId) => axios.post(`${API_BASE_URL}/favorites/`, { song_id: songId }),
//  removeFavoriteSong: (songId) => axios.delete(`${API_BASE_URL}/favorites/${songId}/`),

//   // Search
//   search: (query, cancelToken) => axios.get(`${API_BASE_URL}/search/?q=${query}`, {
//     cancelToken: cancelToken || CancelToken.source().token
//   }),
  
//   // Utils
//   createCancelToken: () => CancelToken.source(),

//   getPlaylistSongs: (playlistId) => axios.get(`${API_BASE_URL}/playlists/${playlistId}/songs/`),
//   getAlbumSongs: (albumId) => axios.get(`${API_BASE_URL}/albums/${albumId}/songs/`),
//   getArtistTopSongs: (artistId) => axios.get(`${API_BASE_URL}/artists/${artistId}/top-songs/`),
// };

// // Cấu hình mặc định
// axios.defaults.timeout = 10000;

// // Request interceptor
// axios.interceptors.request.use(config => {
//   activeRequests++;
//   const token = localStorage.getItem('token');
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// }, error => {
//   activeRequests--;
//   return Promise.reject(error);
// });

// // Response interceptor
// axios.interceptors.response.use(
//   response => {
//     activeRequests--;
//     return response;
//   },
//   async error => {
//     activeRequests--;
//     const originalRequest = error.config;
    
//     // Tự động refresh token khi hết hạn
//     if (error.response?.status === 401 && !originalRequest._retry) {
//       originalRequest._retry = true;
      
//       try {
//         const refresh = localStorage.getItem('refresh_token');
//         if (!refresh) throw new Error('No refresh token');
        
//         const { data } = await api.refreshToken(refresh);
//         localStorage.setItem('token', data.access);
//         originalRequest.headers.Authorization = `Bearer ${data.access}`;
//         return axios(originalRequest);
//       } catch (refreshError) {
//         localStorage.removeItem('token');
//         localStorage.removeItem('refresh_token');
//         // window.location.href = '/login';
//         return Promise.reject(refreshError);
//       }
//     }
    
//     return Promise.reject(error);
//   }
// );

// export default api;

import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';
const MEDIA_BASE_URL = '/media';

export const getMediaUrl = (path) => `${MEDIA_BASE_URL}${path}`;

const CancelToken = axios.CancelToken;
let activeRequests = 0;

axios.defaults.timeout = 10000;

// Request Interceptor
axios.interceptors.request.use(config => {
  activeRequests++;
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
}, error => {
  activeRequests--;
  return Promise.reject(error);
});

// Response Interceptor
axios.interceptors.response.use(
  response => {
    activeRequests--
    return response
  },
  async error => {
    activeRequests--
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      
      try {
        const refresh = localStorage.getItem('refresh_token')
        if (!refresh) {
          // Xử lý khi không có refresh token
          localStorage.removeItem('token')
          throw new Error('Session expired. Please login again.')
        }
        
        const { data } = await api.refreshToken(refresh)
        localStorage.setItem('token', data.access)
        originalRequest.headers.Authorization = `Bearer ${data.access}`
        return axios(originalRequest)
      } catch (refreshError) {
        localStorage.removeItem('token')
        localStorage.removeItem('refresh_token')
        throw refreshError
      }
    }

    return Promise.reject(error)
  }
)

const api = {
  // Auth
  login: async (credentials) => {
    try {
      const res = await axios.post(`${API_BASE_URL}/auth/login/`, credentials);
      return res.data;
    } catch (error) {
      const msg = error.response?.data?.detail || 'Login failed';
      throw new Error(msg);
    }
  },
  register: (data) => axios.post(`${API_BASE_URL}/auth/register/`, data),
  verifyEmail: (token) => axios.post(`${API_BASE_URL}/auth/verify-email/`, { token }),
  resendVerificationEmail: (email) => axios.post(`${API_BASE_URL}/auth/resend-verification/`, { email }),
  forgotPassword: (email) => axios.post(`${API_BASE_URL}/auth/forgot-password/`, { email }),
  verifyPasswordResetOTP: (data) => axios.post(`${API_BASE_URL}/auth/verify-password-reset-otp/`, data),
  resetPassword: (data) => axios.post(`${API_BASE_URL}/auth/reset-password/`, data),
  sendOTP: (email) => axios.post(`${API_BASE_URL}/auth/send-otp/`, { email }),
  verifyOTP: (data) => axios.post(`${API_BASE_URL}/auth/verify-otp/`, data),
  refreshToken: (refresh) => axios.post(`${API_BASE_URL}/auth/token/refresh/`, { refresh }),
  socialAuthenticate: (provider, accessToken) => axios.post(`${API_BASE_URL}/auth/social/${provider}/`, { access_token: accessToken }),

  // Songs
  getSongs: () => axios.get(`${API_BASE_URL}/songs/`),
  getSong: (id) => axios.get(`${API_BASE_URL}/songs/${id}/`),
  incrementPlays: (id) => axios.post(`${API_BASE_URL}/songs/${id}/increment_plays/`),
  getRecentlyPlayed: () => axios.get(`${API_BASE_URL}/songs/recent/`),
  getSongFileUrl: (filePath) => getMediaUrl(`/songs/${filePath}`),

  // Videos
  getVideos: () => axios.get(`${API_BASE_URL}/getVideos/`),
  getVideo: (id) => axios.get(`${API_BASE_URL}/videos/${id}/`),

  // Genres
  getGenres: () => axios.get(`${API_BASE_URL}/genres/`),
  getGenre: (id) => axios.get(`${API_BASE_URL}/genres/${id}/`),
  getGenreByArtist: (id) => axios.get(`${API_BASE_URL}/genres/artist/${id}/`),
  getGenreSongs: (id) => axios.get(`${API_BASE_URL}/genres/${id}/songs/`),
  getGenreImageUrl: (path) => getMediaUrl(`/genres/${path}`),
  getTopGenres: () => axios.get(`${API_BASE_URL}/genres/top/`),

  // Albums
  getAlbums: () => axios.get(`${API_BASE_URL}/albums/`),
  getAlbum: (id) => axios.get(`${API_BASE_URL}/albums/${id}/`),
  getAlbumSongs: (id) => axios.get(`${API_BASE_URL}/albums/${id}/songs/`),
  getAlbumByArtist: (id) => axios.get(`${API_BASE_URL}/albums/artist/${id}/`),
  getNewReleases: () => axios.get(`${API_BASE_URL}/albums/new_releases/`),
  getAlbumCoverUrl: (path) => getMediaUrl(`/albums/${path}`),

  // Artists
  getArtists: () => axios.get(`${API_BASE_URL}/artists/`),
  getArtist: (id) => axios.get(`${API_BASE_URL}/artists/${id}/`),
  getArtistAlbums: (id) => axios.get(`${API_BASE_URL}/getArtistAlbums/${id}/`),
  getArtistTopSongs: (id) => axios.get(`${API_BASE_URL}/artists/${id}/top-songs/`),
  getArtistImageUrl: (path) => getMediaUrl(`/artists/${path}`),
  getTopArtists: () => axios.get(`${API_BASE_URL}/artists/top/`),

  // Playlists
  getUserPlaylists: () => axios.get(`${API_BASE_URL}/playlists/`),
  createPlaylist: (data) => axios.post(`${API_BASE_URL}/playlists/`, data),
  getPlaylist: (id) => axios.get(`${API_BASE_URL}/playlists/${id}/`),
  getPlaylistSongs: (id) => axios.get(`${API_BASE_URL}/playlists/${id}/songs/`),
  addSongToPlaylist: (playlistId, songId) => axios.post(`${API_BASE_URL}/playlists/${playlistId}/add_song/`, { song_id: songId }),
  removeSongFromPlaylist: (playlistId, songId) => axios.post(`${API_BASE_URL}/playlists/${playlistId}/remove_song/`, { song_id: songId }),
  getTopPlaylists: () => axios.get(`${API_BASE_URL}/playlists/top/`),

  // User
  getUserProfile: () => axios.get(`${API_BASE_URL}/profile/`),
  updateProfile: (data) => axios.put(`${API_BASE_URL}/profile/`, data),
  changePassword: (data) => axios.post(`${API_BASE_URL}/profile/change-password/`, data),
  addFavoriteSong: (songId) => axios.post(`${API_BASE_URL}/profile/add_favorite_song/`, { song_id: songId }),
  removeFavoriteSong: (songId) => axios.post(`${API_BASE_URL}/profile/remove_favorite_song/`, { song_id: songId }),

  // User Albums
  getUserAlbums: () => axios.get(`${API_BASE_URL}/user-albums/`),
    
  createUserAlbum: (data) =>
    axios.post(`${API_BASE_URL}/user-albums/`, data),

  getSongsUserAlbums: (id) =>
    axios.get(`${API_BASE_URL}/user-albums/${id}/get_songs/`),

  getUserAlbum: (id) =>
    axios.get(`${API_BASE_URL}/user-albums/${id}/`),

  updateUserAlbum: (id, data) =>
    axios.put(`${API_BASE_URL}/user-albums/${id}/`, data),

  deleteUserAlbum: (id) =>
    axios.delete(`${API_BASE_URL}/user-albums/${id}/`),

  addSongToUserAlbum: (albumId, songId) =>
    axios.post(`${API_BASE_URL}/user-albums/${albumId}/add_song/`, {
      song_id: songId,
    }),

  removeSongFromUserAlbum: (albumId, songId) =>
    axios.delete(
      `${API_BASE_URL}/user-albums/${albumId}/remove_song/`,
      {
        params: { song_id: songId },
      }
    ),
  // Favorites
  getFavoriteSongs: () => axios.get(`${API_BASE_URL}/favorites/`),
  addFavoriteSong: (songId,type) => axios.post(`${API_BASE_URL}/favorites/`, { id: songId,type: type }),
  checkFavoriteStatus: (songId, type) => axios.get(`${API_BASE_URL}/favorites/check/`, { params: { id: songId, type: type } }),
  // Search
  search: (query, cancelToken) => axios.get(`${API_BASE_URL}/search/?q=${query}`, {
    cancelToken: cancelToken || CancelToken.source().token
  }),

  // Utils
  createCancelToken: () => CancelToken.source()
};

export default api;
