from rest_framework import serializers
from .models import Genre, Artist, Album, Song, Playlist, UserProfile
from django.contrib.auth.models import User
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer


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
    duration = serializers.SerializerMethodField()

    class Meta:
        model = Song
        fields = '__all__'

    def get_duration(self, obj):
        return obj.get_duration()


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