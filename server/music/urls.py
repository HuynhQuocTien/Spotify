from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    GenreViewSet, ArtistViewSet, AlbumViewSet,
    SongViewSet, PlaylistViewSet, UserProfileView,
    CustomTokenObtainPairView, RegisterView
)

router = DefaultRouter()
router.register(r'genres', GenreViewSet)
router.register(r'artists', ArtistViewSet)
router.register(r'albums', AlbumViewSet)
router.register(r'songs', SongViewSet)
router.register(r'playlists', PlaylistViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('auth/login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('profile/', UserProfileView.as_view(), name='profile'),
]