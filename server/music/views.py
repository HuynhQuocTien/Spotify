import threading

from django.conf import settings
from django.core.mail import send_mail
from rest_framework import viewsets, status, permissions
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