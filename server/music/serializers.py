from rest_framework import serializers

from .models import Genre, Artist, Album, Song, Playlist, UserProfile, ChatHistory
from django.contrib.auth.models import User
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from mutagen.mp3 import MP3
from django.db import models

class GenreSerializer(serializers.ModelSerializer):
    class Meta:
        model = Genre
        fields = '__all__'


class ArtistSerializer(serializers.ModelSerializer):
    genres = GenreSerializer(many=True)

    class Meta:
        model = Artist
        fields = '__all__'


class AlbumSerializer(serializers.ModelSerializer):
    artist = ArtistSerializer()
    genre = GenreSerializer()

    class Meta:
        model = Album
        fields = '__all__'


class SongSerializer(serializers.ModelSerializer):
    album = AlbumSerializer()
    audio_file = models.FileField(upload_to='songs/')

    class Meta:
        model = Song
        fields = '__all__'

    def get_duration(self):
        try:
            audio = MP3(self.audio_file.path)
            return int(audio.info.length)  # duration in seconds
        except Exception as e:
            return None


class PlaylistSerializer(serializers.ModelSerializer):
    songs = SongSerializer(many=True)
    user = serializers.StringRelatedField()

    class Meta:
        model = Playlist
        fields = '__all__'


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']


class UserProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer()
    favorite_songs = SongSerializer(many=True)
    favorite_albums = AlbumSerializer(many=True)

    class Meta:
        model = UserProfile
        fields = '__all__'


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # Add custom claims
        token['username'] = user.username
        token['email'] = user.email

        return token

class ChatHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatHistory
        fields = ['id', 'message', 'response', 'timestamp', 'read']

class ForgotPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()

class VerifyOTPSerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp = serializers.CharField(max_length=6)

class ResetPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp = serializers.CharField(max_length=6)
    new_password = serializers.CharField(min_length=6)
