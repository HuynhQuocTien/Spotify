from rest_framework import viewsets, status, permissions
from rest_framework.response import Response
from rest_framework.decorators import action
from django.shortcuts import get_object_or_404
from django.contrib.auth.models import User
from .models import Genre, Artist, Album, Song, Playlist, UserProfile
from .serializers import (
    GenreSerializer, ArtistSerializer, AlbumSerializer,
    SongSerializer, PlaylistSerializer, UserProfileSerializer,
    CustomTokenObtainPairSerializer
)
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class GenreViewSet(viewsets.ModelViewSet):
    queryset = Genre.objects.all()
    serializer_class = GenreSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]


class ArtistViewSet(viewsets.ModelViewSet):
    queryset = Artist.objects.all()
    serializer_class = ArtistSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    @action(detail=True, methods=['get'])
    def albums(self, request, pk=None):
        artist = self.get_object()
        albums = artist.albums.all()
        serializer = AlbumSerializer(albums, many=True)
        return Response(serializer.data)


class AlbumViewSet(viewsets.ModelViewSet):
    queryset = Album.objects.all()
    serializer_class = AlbumSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    @action(detail=True, methods=['get'])
    def songs(self, request, pk=None):
        album = self.get_object()
        songs = album.songs.all()
        serializer = SongSerializer(songs, many=True)
        return Response(serializer.data)


class SongViewSet(viewsets.ModelViewSet):
    queryset = Song.objects.all()
    serializer_class = SongSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    @action(detail=True, methods=['post'])
    def increment_plays(self, request, pk=None):
        song = self.get_object()
        song.plays += 1
        song.save()
        return Response({'status': 'play count incremented'})


class PlaylistViewSet(viewsets.ModelViewSet):
    queryset = Playlist.objects.all()
    serializer_class = PlaylistSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Playlist.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['post'])
    def add_song(self, request, pk=None):
        playlist = self.get_object()
        song_id = request.data.get('song_id')
        song = get_object_or_404(Song, id=song_id)
        playlist.songs.add(song)
        return Response({'status': 'song added to playlist'})

    @action(detail=True, methods=['post'])
    def remove_song(self, request, pk=None):
        playlist = self.get_object()
        song_id = request.data.get('song_id')
        song = get_object_or_404(Song, id=song_id)
        playlist.songs.remove(song)
        return Response({'status': 'song removed from playlist'})


class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        profile = get_object_or_404(UserProfile, user=request.user)
        serializer = UserProfileSerializer(profile)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def add_favorite_song(self, request):
        profile = get_object_or_404(UserProfile, user=request.user)
        song_id = request.data.get('song_id')
        song = get_object_or_404(Song, id=song_id)
        profile.favorite_songs.add(song)
        return Response({'status': 'song added to favorites'})

    @action(detail=False, methods=['post'])
    def remove_favorite_song(self, request):
        profile = get_object_or_404(UserProfile, user=request.user)
        song_id = request.data.get('song_id')
        song = get_object_or_404(Song, id=song_id)
        profile.favorite_songs.remove(song)
        return Response({'status': 'song removed from favorites'})


class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        username = request.data.get('username')
        email = request.data.get('email')
        password = request.data.get('password')

        if not all([username, email, password]):
            return Response(
                {'error': 'Username, email and password are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if User.objects.filter(username=username).exists():
            return Response(
                {'error': 'Username already exists'},
                status=status.HTTP_400_BAD_REQUEST
            )

        user = User.objects.create_user(
            username=username,
            email=email,
            password=password
        )

        # Create user profile
        UserProfile.objects.create(user=user)

        return Response(
            {'message': 'User created successfully'},
            status=status.HTTP_201_CREATED
        )