from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Artist(models.Model):
    name = models.CharField(max_length=255)
    bio = models.TextField(blank=True)
    image = models.ImageField(upload_to='artists/', null=True, blank=True)

    def __str__(self):
        return self.name

class Album(models.Model):
    title = models.CharField(max_length=255)
    artist = models.ForeignKey(Artist, on_delete=models.CASCADE, related_name='albums')
    release_date = models.DateField()
    cover_image = models.ImageField(upload_to='albums/', null=True, blank=True)

    def __str__(self):
        return f"{self.title} by {self.artist.name}"

class Song(models.Model):
    title = models.CharField(max_length=255)
    album = models.ForeignKey(Album, on_delete=models.CASCADE, related_name='songs')
    duration = models.DurationField()
    audio_file = models.FileField(upload_to='songs/')
    track_number = models.PositiveIntegerField()
    plays = models.PositiveIntegerField(default=0)

    def __str__(self):
        return f"{self.title} from {self.album.title}"

class Playlist(models.Model):
    name = models.CharField(max_length=255)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='playlists')
    songs = models.ManyToManyField(Song, related_name='playlists')
    is_public = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} by {self.user.username}"

class Video(models.Model):
    title = models.CharField(max_length=255)
    artist = models.ForeignKey(Artist, on_delete=models.CASCADE, related_name='videos')
    video_file = models.FileField(upload_to='videos/')
    duration = models.DurationField()
    views = models.PositiveIntegerField(default=0)
    thumbnail = models.ImageField(upload_to='video_thumbnails/')

    def __str__(self):
        return self.title