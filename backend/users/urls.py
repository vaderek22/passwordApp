from django.urls import path
from .views import RegisterView, LoginView, UpdatePasswordView, CheckSessionView, LogoutView,DeleteAccountView,CheckPasswordView, setup_2fa,verify_2fa_login,verify_2fa_setup,get_2fa_status,manage_2fa,disable_2fa

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('update-password/', UpdatePasswordView.as_view(), name='update-password'),
    path('check-session/', CheckSessionView.as_view(), name='check-session'),
    path('delete-account/', DeleteAccountView.as_view(), name='delete-account'),
    path('check-password/', CheckPasswordView.as_view(), name='check-password'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('setup-2fa/', setup_2fa, name='setup-2fa'),
    path('verify-2fa-setup/', verify_2fa_setup, name='verify-2fa-setup'),
    path('verify-2fa-login/', verify_2fa_login, name='verify-2fa-login'),
    path('manage-2fa/', manage_2fa, name='manage-2fa'),
    path('disable-2fa/', disable_2fa, name='disable-2fa'),
    path('get-2fa-status/', get_2fa_status, name='get-2fa-status'),
]
