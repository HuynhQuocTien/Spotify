from rest_framework import serializers
from .models import Genre, Artist, Album, Song, Playlist, UserProfile, ChatHistory, PasswordResetOTP
from django.contrib.auth.models import User
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from mutagen.mp3 import MP3
from mutagen import MutagenError
from django.core.validators import FileExtensionValidator
import os


class DynamicFieldsModelSerializer(serializers.ModelSerializer):
    """
    A ModelSerializer that takes an additional `fields` argument that
    controls which fields should be displayed.
    """

    def __init__(self, *args, **kwargs):
        fields = kwargs.pop('fields', None)
        super().__init__(*args, **kwargs)

        if fields is not None:
            allowed = set(fields)
            existing = set(self.fields)
            for field_name in existing - allowed:
                self.fields.pop(field_name)


class GenreSerializer(DynamicFieldsModelSerializer):
    class Meta:
        model = Genre
        fields = ['id', 'name']
        read_only_fields = ['id']


class ArtistBasicSerializer(DynamicFieldsModelSerializer):
    class Meta:
        model = Artist
        fields = ['id', 'name', 'image']


class ArtistSerializer(DynamicFieldsModelSerializer):
    genres = GenreSerializer(many=True, read_only=True)
    albums_count = serializers.SerializerMethodField()
    songs_count = serializers.SerializerMethodField()

    class Meta:
        model = Artist
        fields = ['id', 'name', 'bio', 'image', 'genres', 'albums_count', 'songs_count']
        read_only_fields = ['id', 'albums_count', 'songs_count']

    def get_albums_count(self, obj):
        return obj.albums.count()

    def get_songs_count(self, obj):
        return obj.songs.count()


class AlbumBasicSerializer(DynamicFieldsModelSerializer):
    artist = ArtistBasicSerializer(read_only=True)

    class Meta:
        model = Album
        fields = ['id', 'title', 'artist', 'cover_image', 'release_date']


class AlbumSerializer(DynamicFieldsModelSerializer):
    artist = ArtistBasicSerializer(read_only=True)
    genre = GenreSerializer(read_only=True)
    songs_count = serializers.SerializerMethodField()
    duration = serializers.SerializerMethodField()

    class Meta:
        model = Album
        fields = ['id', 'title', 'artist', 'genre', 'release_date',
                  'cover_image', 'songs_count', 'duration']
        read_only_fields = ['id', 'songs_count', 'duration']

    def get_songs_count(self, obj):
        return obj.songs.count()

    def get_duration(self, obj):
        total = sum(song.duration.total_seconds() for song in obj.songs.all())
        minutes = int(total // 60)
        seconds = int(total % 60)
        return f"{minutes}:{seconds:02}"


class SongBasicSerializer(DynamicFieldsModelSerializer):
    class Meta:
        model = Song
        fields = ['id', 'title', 'duration', 'audio_file', 'image']


class SongSerializer(DynamicFieldsModelSerializer):
    album = AlbumBasicSerializer(read_only=True)
    artists = ArtistBasicSerializer(many=True, read_only=True)
    duration_str = serializers.SerializerMethodField()
    is_favorite = serializers.SerializerMethodField()
    image = serializers.ImageField(required=False)

    class Meta:
        model = Song
        fields = ['id', 'title', 'album', 'artists', 'duration',
                  'duration_str', 'audio_file', 'plays', 'created_at', 'is_favorite', 'image']
        read_only_fields = ['id', 'plays', 'created_at', 'is_favorite']
        extra_kwargs = {
            'audio_file': {
                'validators': [FileExtensionValidator(allowed_extensions=['mp3', 'wav', 'ogg'])]
            }
        }

    def get_duration_str(self, obj):
        total_seconds = int(obj.duration.total_seconds())
        minutes = total_seconds // 60
        seconds = total_seconds % 60
        return f"{minutes}:{seconds:02d}"

    def get_is_favorite(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.favorited_by.filter(user=request.user).exists()
        return False

    def validate_audio_file(self, value):
        try:
            audio = MP3(value)
            if not audio.info.length:
                raise serializers.ValidationError("Invalid audio file")
        except MutagenError:
            raise serializers.ValidationError("Unsupported audio format")
        return value


class PlaylistBasicSerializer(DynamicFieldsModelSerializer):
    class Meta:
        model = Playlist
        fields = ['id', 'title', 'cover_image']


class PlaylistSerializer(DynamicFieldsModelSerializer):
    songs = SongBasicSerializer(many=True, read_only=True)
    user = serializers.StringRelatedField()
    songs_count = serializers.SerializerMethodField()
    total_duration = serializers.SerializerMethodField()

    class Meta:
        model = Playlist
        fields = ['id', 'title', 'user', 'description', 'songs',
                  'songs_count', 'total_duration', 'cover_image',
                  'is_public', 'created_at']
        read_only_fields = ['id', 'user', 'created_at']

    def get_songs_count(self, obj):
        return obj.songs.count()

    def get_total_duration(self, obj):
        total = sum(song.duration.total_seconds() for song in obj.songs.all())
        minutes = int(total // 60)
        seconds = int(total % 60)
        return f"{minutes}:{seconds:02}"


class UserSerializer(DynamicFieldsModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']
        extra_kwargs = {
            'email': {'required': True},
            'username': {'read_only': True}
        }


class UserProfileSerializer(DynamicFieldsModelSerializer):
    user = UserSerializer(read_only=True)
    favorite_songs = SongBasicSerializer(many=True, read_only=True)
    favorite_albums = AlbumBasicSerializer(many=True, read_only=True)

    class Meta:
        model = UserProfile
        fields = ['id', 'user', 'profile_picture', 'favorite_songs', 'favorite_albums']


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        refresh = self.get_token(self.user)

        data['refresh'] = str(refresh)
        data['access'] = str(refresh.access_token)
        data['user'] = UserSerializer(self.user).data

        return data


class ChatHistorySerializer(DynamicFieldsModelSerializer):
    class Meta:
        model = ChatHistory
        fields = ['id', 'message', 'response', 'timestamp', 'read']
        read_only_fields = ['id', 'timestamp']


class PasswordResetOTPSerializer(DynamicFieldsModelSerializer):
    class Meta:
        model = PasswordResetOTP
        fields = ['id', 'otp', 'created_at', 'expires_at', 'is_used']
        read_only_fields = ['id', 'created_at', 'expires_at', 'is_used']


class ForgotPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)


class VerifyOTPSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    otp = serializers.CharField(max_length=6, required=True)


class ResetPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    otp = serializers.CharField(max_length=6, required=True)
    new_password = serializers.CharField(min_length=6, required=True)
    confirm_password = serializers.CharField(min_length=6, required=True)

    def validate(self, data):
        if data['new_password'] != data['confirm_password']:
            raise serializers.ValidationError("Passwords do not match")
        return data
