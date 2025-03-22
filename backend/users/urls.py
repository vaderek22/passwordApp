from django.urls import path
from .views import UserListView, RegisterView, LoginView, UpdatePasswordView, CheckSessionView, LogoutView,DeleteAccountView,CheckPasswordView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('users/', UserListView.as_view(), name='user-list'),
    path('update-password/', UpdatePasswordView.as_view(), name='update-password'),
    path('check-session/', CheckSessionView.as_view(), name='check-session'),
    path('delete-account/', DeleteAccountView.as_view(), name='delete-account'),
    path('check-password/', CheckPasswordView.as_view(), name='check-password'),
    path('logout/', LogoutView.as_view(), name='logout'),
]
