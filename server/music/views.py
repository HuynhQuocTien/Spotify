import os
import threading
from datetime import datetime

import jwt
from django.conf import settings
from django.core.mail import send_mail
from django.db.models import Count
from django.http import FileResponse, HttpResponse
from urllib.parse import quote
import requests
from io import BytesIO
from rest_framework import viewsets, status, permissions, generics
from rest_framework.response import Response
from rest_framework.decorators import action
from django.shortcuts import get_object_or_404
from django.contrib.auth.models import User
from .models import Genre, Artist, Album, Song, Playlist, UserProfile, ChatHistory, PasswordResetOTP
from .serializers import (
    GenreSerializer, ArtistSerializer, AlbumSerializer,
    SongSerializer, PlaylistSerializer, UserProfileSerializer,
    CustomTokenObtainPairSerializer, ChatHistorySerializer, ForgotPasswordSerializer, VerifyOTPSerializer,
    ResetPasswordSerializer
)
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from transformers import pipeline
import threading

chatbot = None


def load_model():
    global chatbot
    # chatbot = pipeline("text-generation", model="gpt2")


threading.Thread(target=load_model).start()


class ChatAPI(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if not chatbot:
            return Response({"error": "AI model is loading"}, status=503)

        message = request.data.get("message")
        if not message:
            return Response({"error": "Message is required"}, status=400)

        # Xử lý message với AI
        response = chatbot(message, max_length=100, do_sample=True)[0]['generated_text']

        # Lưu lịch sử chat vào database
        chat = ChatHistory.objects.create(
            user=request.user,
            message=message,
            response=response,
            read=False
        )
        serializer = ChatHistorySerializer(chat)
        return Response(serializer.data)

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

    def validate(self, attrs):
        data = super().validate(attrs)
        # Get the access token
        access_token = data['access']

        # Decode the JWT token to get the expiration time
        decoded_access_token = jwt.decode(access_token, options={"verify_exp": False})
        expiration_time = datetime.utcfromtimestamp(decoded_access_token['exp'])

        # Include expiration time in the response
        data['expiration_time'] = expiration_time.strftime('%Y-%m-%d %H:%M:%S')

        return data


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
    @action(detail=False, methods=['get'])
    def new_releases(self, request):
        albums = Album.objects.order_by('-release_date')[:10]
        serializer = self.get_serializer(albums, many=True)
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

    @action(detail=False, methods=['get'])
    def recent(self, request):
        recent_songs = Song.objects.order_by('-created_at')[:20]
        serializer = self.get_serializer(recent_songs, many=True)
        return Response(serializer.data)



class PlaySongView(APIView):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get(self, request, song_id):
        song = get_object_or_404(Song, id=song_id)

        # Tăng số lượt phát
        song.plays += 1
        song.save()

        # Nếu có file audio trực tiếp
        if song.audio_file:
            file_path = song.audio_file.path
            if os.path.exists(file_path):
                response = FileResponse(open(file_path, 'rb'))
                response['Content-Disposition'] = f'attachment; filename="{quote(song.title)}.mp3"'
                return response

        # Nếu có URL audio
        elif song.audio_url:
            try:
                audio_response = requests.get(song.audio_url, stream=True)
                if audio_response.status_code == 200:
                    response = HttpResponse(
                        BytesIO(audio_response.content),
                        content_type=audio_response.headers['Content-Type']
                    )
                    response['Content-Disposition'] = f'attachment; filename="{quote(song.title)}.mp3"'
                    return response
            except Exception:
                pass

        return Response({'error': 'Audio file not available'}, status=404)


class StreamSongView(APIView):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get(self, request, song_id):
        song = get_object_or_404(Song, id=song_id)

        # Tăng số lượt phát
        song.plays += 1
        song.save()

        # Nếu có file audio trực tiếp
        if song.audio_file:
            file_path = song.audio_file.path
            if os.path.exists(file_path):
                response = FileResponse(open(file_path, 'rb'))
                response['Content-Type'] = 'audio/mpeg'
                response['Content-Disposition'] = f'inline; filename="{quote(song.title)}.mp3"'
                return response

        # Nếu có URL audio
        elif song.audio_url:
            try:
                audio_response = requests.get(song.audio_url, stream=True)
                if audio_response.status_code == 200:
                    response = HttpResponse(
                        BytesIO(audio_response.content),
                        content_type='audio/mpeg'
                    )
                    response['Content-Disposition'] = f'inline; filename="{quote(song.title)}.mp3"'
                    return response
            except Exception:
                pass

        return Response({'error': 'Audio file not available'}, status=404)

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
        try:
            song = Song.objects.get(id=song_id)
            playlist.songs.remove(song)
            return Response({'status': 'song removed'})
        except Song.DoesNotExist:
            return Response({'error': 'Song not found'}, status=404)

class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        profile = get_object_or_404(UserProfile, user=request.user)
        serializer = UserProfileSerializer(profile)
        return Response(serializer.data)

    def put(self, request):
        profile, _ = UserProfile.objects.get_or_create(user=request.user)
        serializer = UserProfileSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def post(self, request, song_id=None):
        if 'remove' in request.path:
            return self.remove_favorite_song(request, song_id)
        return self.add_favorite_song(request, song_id)

    def add_favorite_song(self, request, song_id):
        profile = get_object_or_404(UserProfile, user=request.user)
        song = get_object_or_404(Song, id=song_id)
        profile.favorite_songs.add(song)
        return Response({'status': 'song added to favorites'}, status=status.HTTP_200_OK)

    def remove_favorite_song(self, request, song_id):
        profile = get_object_or_404(UserProfile, user=request.user)
        song = get_object_or_404(Song, id=song_id)
        profile.favorite_songs.remove(song)
        return Response({'status': 'song removed from favorites'}, status=status.HTTP_200_OK)

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


class ForgotPasswordView(APIView):
    def post(self, request):
        serializer = ForgotPasswordSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        email = serializer.validated_data['email']
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response(
                {'error': 'Email không tồn tại trong hệ thống'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Tạo OTP và gửi email (chạy trong thread riêng)
        def send_otp_email():
            otp_obj = PasswordResetOTP.objects.create(user=user)
            subject = 'Mã OTP đặt lại mật khẩu'
            message = f'Mã OTP của bạn là: {otp_obj.otp}. Mã có hiệu lực trong 15 phút.'
            send_mail(
                subject,
                message,
                settings.DEFAULT_FROM_EMAIL,
                [email],
                fail_silently=False,
            )

        threading.Thread(target=send_otp_email).start()

        return Response(
            {'message': 'Mã OTP đã được gửi đến email của bạn'},
            status=status.HTTP_200_OK
        )


class VerifyOTPView(APIView):
    def post(self, request):
        serializer = VerifyOTPSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        email = serializer.validated_data['email']
        otp = serializer.validated_data['otp']

        try:
            user = User.objects.get(email=email)
            otp_obj = PasswordResetOTP.objects.filter(
                user=user,
                otp=otp,
                is_used=False
            ).latest('created_at')
        except (User.DoesNotExist, PasswordResetOTP.DoesNotExist):
            return Response(
                {'error': 'Mã OTP không hợp lệ'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not otp_obj.is_valid():
            return Response(
                {'error': 'Mã OTP đã hết hạn hoặc đã sử dụng'},
                status=status.HTTP_400_BAD_REQUEST
            )

        return Response(
            {'message': 'Mã OTP hợp lệ'},
            status=status.HTTP_200_OK
        )


class ResetPasswordView(APIView):
    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        email = serializer.validated_data['email']
        otp = serializer.validated_data['otp']
        new_password = serializer.validated_data['new_password']

        try:
            user = User.objects.get(email=email)
            otp_obj = PasswordResetOTP.objects.filter(
                user=user,
                otp=otp,
                is_used=False
            ).latest('created_at')
        except (User.DoesNotExist, PasswordResetOTP.DoesNotExist):
            return Response(
                {'error': 'Mã OTP không hợp lệ'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not otp_obj.is_valid():
            return Response(
                {'error': 'Mã OTP đã hết hạn hoặc đã sử dụng'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Cập nhật mật khẩu mới
        user.set_password(new_password)
        user.save()

        # Đánh dấu OTP đã sử dụng
        otp_obj.is_used = True
        otp_obj.save()

        return Response(
            {'message': 'Đặt lại mật khẩu thành công'},
            status=status.HTTP_200_OK
        )


class PlaylistTracksView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, playlist_id):
        playlist = get_object_or_404(Playlist, id=playlist_id, user=request.user)
        tracks = playlist.songs.all()
        serializer = SongSerializer(tracks, many=True)
        return Response({
            'tracks': serializer.data,
            'total': tracks.count()
        })

class AlbumTracksView(APIView):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get(self, request, album_id):
        album = get_object_or_404(Album, id=album_id)
        tracks = album.songs.all()
        serializer = SongSerializer(tracks, many=True)
        return Response({
            'tracks': serializer.data,
            'total': tracks.count()
        })

class ArtistTopTracksView(APIView):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get(self, request, artist_id):
        artist = get_object_or_404(Artist, id=artist_id)
        tracks = Song.objects.filter(artists=artist).order_by('-plays')[:10]
        serializer = SongSerializer(tracks, many=True)
        return Response({
            'tracks': serializer.data,
            'total': len(tracks)
        })


class TopSongsView(generics.ListAPIView):
    serializer_class = SongSerializer

    def get_queryset(self):
        return Song.objects.annotate(
            play_count=Count('plays')
        ).order_by('-play_count')[:50]


class NewReleasesView(generics.ListAPIView):
    serializer_class = AlbumSerializer

    def get_queryset(self):
        return Album.objects.order_by('-release_date')[:20]


class FeaturedArtistsView(generics.ListAPIView):
    serializer_class = ArtistSerializer

    def get_queryset(self):
        return Artist.objects.annotate(
            song_count=Count('songs')
        ).order_by('-song_count')[:10]

class SearchView(APIView):
    def get(self, request):
        q = request.GET.get('q', '')
        songs = Song.objects.filter(title__icontains=q)
        albums = Album.objects.filter(title__icontains=q)
        artists = Artist.objects.filter(name__icontains=q)

        return Response({
            'songs': SongSerializer(songs, many=True).data,
            'albums': AlbumSerializer(albums, many=True).data,
            'artists': ArtistSerializer(artists, many=True).data
        })
