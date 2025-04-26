import { Routes, Route } from "react-router-dom"
import HomePage from "./pages/HomePage"
import SearchPage from "./pages/SearchPage"
import LibraryPage from "./pages/LibraryPage"
import PlaylistPage from "./pages/PlaylistPage"
import AlbumPage from "./pages/AlbumPage"
import ArtistPage from "./pages/ArtistPage"
import LoginPage from "./pages/LoginPage"
import TrackPage from "./pages/TrackPage"
import VideoPage from "./pages/VideoPage"
import UserAlbumsPage from "./pages/UserAlbumsPage"
import UserAlbumPage from "./pages/UserAlbumPage"
import FavoritesPage from "./pages/FavoritesPage"
import ProtectedRoute from "./components/ProtectedRoute"

// const AppRoutes = () => {
//   return (
//     <Routes>
//       <Route path="/login" element={<LoginPage />} />
//       <Route
//         path="/"
//         element={
//           <ProtectedRoute>
//             <HomePage />
//           </ProtectedRoute>
//         }
//       />
//       <Route
//         path="/search"
//         element={
//           <ProtectedRoute>
//             <SearchPage />
//           </ProtectedRoute>
//         }
//       />
//       <Route
//         path="/library"
//         element={
//           <ProtectedRoute>
//             <LibraryPage />
//           </ProtectedRoute>
//         }
//       />
//       <Route
//         path="/playlist/:id"
//         element={
//           <ProtectedRoute>
//             <PlaylistPage />
//           </ProtectedRoute>
//         }
//       />
//       <Route
//         path="/album/:id"
//         element={
//           <ProtectedRoute>
//             <AlbumPage />
//           </ProtectedRoute>
//         }
//       />
//       <Route
//         path="/artist/:id"
//         element={
//           <ProtectedRoute>
//             <ArtistPage />
//           </ProtectedRoute>
//         }
//       />
//     </Routes>
//   )
// }

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      
      <Route path="/" element={<HomePage />} />
      <Route path="/search" element={<SearchPage />} />
      <Route path="/playlist/:id" element={<PlaylistPage />} />
      <Route path="/album/:id" element={<AlbumPage />} />
      <Route path="/artist/:id" element={<ArtistPage />} />
      <Route path="/song/:id" element={<TrackPage />} />
      <Route path="/video/:id" element={<VideoPage />} />
      <Route path="/favorites" element={<FavoritesPage />} />
      <Route path="/my-albums" element={<UserAlbumsPage />} />
      <Route path="/my-album/:id" element={<UserAlbumPage />} />

      
      
      {/* Protected Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/search"
        element={
          <ProtectedRoute>
            <SearchPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/library"
        element={
          <ProtectedRoute>
            <LibraryPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}

export default AppRoutes

