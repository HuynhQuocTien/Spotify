from django.urls import path

urlspatterns = [
    path('music/', include('music.urls')),
    path('api/', include('api.urls')),
]