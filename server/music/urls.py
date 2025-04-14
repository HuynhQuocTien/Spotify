from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    GenreViewSet, ArtistViewSet, AlbumViewSet,
    SongViewSet, PlaylistViewSet, UserProfileView,
    CustomTokenObtainPairView, RegisterView, ChatAPI,
    ForgotPasswordView, VerifyOTPView, ResetPasswordView,
    PlaylistTracksView, AlbumTracksView, ArtistTopTracksView,
    TopSongsView, NewReleasesView, FeaturedArtistsView, SearchView
)

router = DefaultRouter()
router.register(r'genres', GenreViewSet)
router.register(r'artists', ArtistViewSet)
router.register(r'albums', AlbumViewSet)
router.register(r'songs', SongViewSet)
router.register(r'playlists', PlaylistViewSet)

urlpatterns = [
    # Router URLs
    path('', include(router.urls)),

    # Authentication
    path('auth/login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/forgot-password/', ForgotPasswordView.as_view(), name='forgot-password'),
    path('auth/verify-otp/', VerifyOTPView.as_view(), name='verify-otp'),
    path('auth/reset-password/', ResetPasswordView.as_view(), name='reset-password'),

    # User Profile
    path('profile/', UserProfileView.as_view(), name='profile'),
    path('profile/favorite/song/<int:song_id>/', UserProfileView.as_view(), name='add-favorite-song'),
    path('profile/favorite/song/<int:song_id>/remove/', UserProfileView.as_view(), name='remove-favorite-song'),

    # Music Resources (for frontend use)
    path('getGenres/', GenreViewSet.as_view({'get': 'list'}), name='get-genres'),
    path('getArtists/', ArtistViewSet.as_view({'get': 'list'}), name='get-artists'),
    path('getAlbums/', AlbumViewSet.as_view({'get': 'list'}), name='get-albums'),
    path('getSongs/', SongViewSet.as_view({'get': 'list'}), name='get-songs'),
    path('getPlaylists/', PlaylistViewSet.as_view({'get': 'list'}), name='get-playlists'),

    # Playlist / Album / Artist Detail
    path('playlists/<int:playlist_id>/tracks/', PlaylistTracksView.as_view(), name='playlist-tracks'),
    path('albums/<int:album_id>/tracks/', AlbumTracksView.as_view(), name='album-tracks'),
    path('artists/<int:artist_id>/top-tracks/', ArtistTopTracksView.as_view(), name='artist-top-tracks'),

    # Artist detail & albums
    path('getArtist/<int:artist_id>/', ArtistViewSet.as_view({'get': 'retrieve'}), name='get-artist'),
    path('getArtistAlbums/<int:pk>/', ArtistViewSet.as_view({'get': 'albums'}), name='get-artist-albums'),

    # Discovery
    path('songs/top/', TopSongsView.as_view(), name='top-songs'),
    path('albums/new-releases/', NewReleasesView.as_view(), name='new-releases'),
    path('artists/featured/', FeaturedArtistsView.as_view(), name='featured-artists'),

    # Others
    path('search/', SearchView.as_view(), name='search'),
    path('chat/', ChatAPI.as_view(), name='chat-api'),
]
