from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import Artist, Album, Song, Playlist, Video
from .serializers import ArtistSerializer, AlbumSerializer, SongSerializer, PlaylistSerializer, VideoSerializer
from django.shortcuts import get_object_or_404

class ArtistViewSet(viewsets.ModelViewSet):
    queryset = Artist.objects.all()
    serializer_class = ArtistSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

class AlbumViewSet(viewsets.ModelViewSet):
    queryset = Album.objects.all()
    serializer_class = AlbumSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

class SongViewSet(viewsets.ModelViewSet):
    queryset = Song.objects.all()
    serializer_class = SongSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    @action(detail=True, methods=['post'])
    def play(self, request, pk=None):
        song = self.get_object()
        song.plays += 1
        song.save()
        return Response({'status': 'play count updated'})

class PlaylistViewSet(viewsets.ModelViewSet):
    serializer_class = PlaylistSerializer
    permission_classes = [permissions.IsAuthenticated]

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

class VideoViewSet(viewsets.ModelViewSet):
    queryset = Video.objects.all()
    serializer_class = VideoSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    @action(detail=True, methods=['post'])
    def view(self, request, pk=None):
        video = self.get_object()
        video.views += 1
        video.save()
        return Response({'status': 'view count updated'})