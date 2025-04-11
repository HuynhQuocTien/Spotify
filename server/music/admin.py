from django.contrib import admin
from .models import Genre, Artist, Album, Song, Playlist, UserProfile, ChatHistory


@admin.register(Genre)
class GenreAdmin(admin.ModelAdmin):
    list_display = ('name',)
    search_fields = ('name',)

@admin.register(Artist)
class ArtistAdmin(admin.ModelAdmin):
    list_display = ('name',)
    search_fields = ('name',)
    filter_horizontal = ('genres',)

@admin.register(Album)
class AlbumAdmin(admin.ModelAdmin):
    list_display = ('title', 'artist', 'release_date')
    list_filter = ('artist', 'genre')
    search_fields = ('title', 'artist__name')

@admin.register(Song)
class SongAdmin(admin.ModelAdmin):
    list_display = ('title', 'album', 'track_number', 'plays')
    list_filter = ('album',)
    search_fields = ('title', 'album__title')

@admin.register(Playlist)
class PlaylistAdmin(admin.ModelAdmin):
    list_display = ('title', 'user', 'created_at', 'is_public')
    list_filter = ('user', 'is_public')
    search_fields = ('title', 'user__username')
    filter_horizontal = ('songs',)

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user',)
    search_fields = ('user__username',)
    filter_horizontal = ('favorite_songs', 'favorite_albums',)

@admin.register(ChatHistory)
class ChatHistoryAdmin(admin.ModelAdmin):
    list_display = ('user', 'short_message', 'short_response', 'timestamp', 'read')
    list_filter = ('user', 'read', 'timestamp')
    search_fields = ('message', 'response')

    def short_message(self, obj):
        return obj.message[:50] + '...' if len(obj.message) > 50 else obj.message

    short_message.short_description = 'Message'

    def short_response(self, obj):
        return obj.response[:50] + '...' if len(obj.response) > 50 else obj.response

    short_response.short_description = 'Response'