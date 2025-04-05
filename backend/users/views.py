from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import User, HASH_METHODS
from .serializers import UserSerializer
from django.contrib.auth import logout
from django.utils import timezone
from rest_framework.decorators import api_view

@api_view(['GET'])
def setup_2fa(request):
    if 'user_id' not in request.session:
        return Response({"error": "Unauthorized"}, status=401)
    
    user = User.objects.get(id=request.session['user_id'])
    qr_code = user.get_otp_qr_code()
    return Response({
        "qr_code": qr_code,
        "secret": user.otp_secret
    })

@api_view(['POST'])
def verify_2fa_setup(request):
    if 'user_id' not in request.session:
        return Response({"error": "Unauthorized"}, status=401)
    
    user = User.objects.get(id=request.session['user_id'])
    token = request.data.get('token')
    
    if user.verify_otp(token):
        user.otp_enabled = True
        user.save()
        
        request.session['2fa_configured'] = True
        request.session.save()
        
        return Response({
            "success": True,
            "message": "2FA pomyślnie skonfigurowane"
        })
    return Response({"error": "Invalid token"}, status=400)

@api_view(['POST'])
def verify_2fa_login(request):
    username = request.data.get('username')
    token = request.data.get('token')
    session_key = request.data.get('session_key')
    
    try:
        from django.contrib.sessions.models import Session
        session = Session.objects.get(session_key=session_key)
    except Session.DoesNotExist:
        return Response({"error": "Invalid session"}, status=400)
    
    try:
        user = User.objects.get(username=username)
    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=404)
    
    if not user.verify_otp(token):
        return Response({"error": "Invalid token"}, status=400)
    
    session_data = session.get_decoded()
    if session_data.get('temp_user_id') != user.id:
        return Response({"error": "Session mismatch"}, status=400)
    
    request.session['user_id'] = user.id
    request.session['username'] = user.username
    user.update_last_login()
    
    if 'login_stage1' in request.session:
        del request.session['login_stage1']
    if 'temp_user_id' in request.session:
        del request.session['temp_user_id']
    
    request.session.save()
    
    return Response({"success": True, "message": "Zalogowano pomyślnie"})

@api_view(['GET'])
def get_2fa_status(request):
    if 'user_id' not in request.session:
        return Response({"error": "Unauthorized"}, status=status.HTTP_401_UNAUTHORIZED)
    
    user = User.objects.get(id=request.session['user_id'])
    return Response({
        "otp_enabled": user.otp_enabled,
        "last_enabled": user.last_login if user.otp_enabled else None,
        "device_info": request.META.get('HTTP_USER_AGENT', 'Unknown device')
    })

@api_view(['GET'])
def manage_2fa(request):
    if 'user_id' not in request.session:
        return Response({"error": "Unauthorized"}, status=status.HTTP_401_UNAUTHORIZED)
    
    user = User.objects.get(id=request.session['user_id'])
    if not user.otp_secret:
        user.generate_otp_secret()
    
    qr_code = user.get_otp_qr_code()
    return Response({
        "qr_code": qr_code,
        "secret": user.otp_secret,
        "otp_enabled": user.otp_enabled,
        "device_info": request.META.get('HTTP_USER_AGENT', 'Unknown device')
    })

@api_view(['POST'])
def disable_2fa(request):
    if 'user_id' not in request.session:
        return Response({"error": "Unauthorized"}, status=status.HTTP_401_UNAUTHORIZED)
    
    user = User.objects.get(id=request.session['user_id'])
    user.otp_enabled = False
    user.otp_secret = ""
    user.save()
    
    return Response({
        "success": True,
        "message": "2FA zostało wyłączone"
    })

class RegisterView(APIView):
    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            
            request.session['user_id'] = user.id
            request.session['username'] = user.username
            request.session.modified = True
            request.session.save()
            
            return Response({
                "message": "Rejestracja udana. Proszę skonfigurować 2FA.",
                "requires_2fa_setup": True
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')

        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            return Response({"message": "Nieprawidłowe dane uwierzytelniające"}, status=status.HTTP_400_BAD_REQUEST)
        
        if user.is_account_locked():
            remaining_time = user.locked_until - timezone.now()
            minutes = int(remaining_time.total_seconds() // 60)
            seconds = int(remaining_time.total_seconds() % 60)
            return Response({
                "message": f"Konto zablokowane. Spróbuj ponownie za {minutes} minut i {seconds} sekund."
            }, status=status.HTTP_403_FORBIDDEN)
        
        if not user.check_password(password):
            user.increment_failed_attempt()
            attempts_left = 3 - user.failed_login_attempts
            if attempts_left > 0:
                return Response({
                    "message": f"Nieprawidłowe dane uwierzytelniające. Pozostało prób: {attempts_left}"
                }, status=status.HTTP_400_BAD_REQUEST)
            else:
                return Response({
                    "message": "Konto zablokowane na 30 minut z powodu zbyt wielu nieudanych prób logowania."
                }, status=status.HTTP_403_FORBIDDEN)
        
        request.session['login_stage1'] = True
        request.session['temp_user_id'] = user.id
        request.session.save()

        if user.otp_enabled:
            return Response({
                "message": "Wprowadź kod weryfikacyjny",
                "requires_2fa": True,
                "username": username,
                "temp_session_key": request.session.session_key

            }, status=status.HTTP_200_OK)

        user.update_last_login()

        request.session['user_id'] = user.id
        request.session['username'] = user.username
        request.session.modified = True
        request.session.save()

        return Response({"message": "Zalogowano pomyślnie"}, status=status.HTTP_200_OK)

class UpdatePasswordView(APIView):
    def post(self, request):
        username = request.data.get('username')
        old_password = request.data.get('old_password')
        new_password = request.data.get('new_password')
        hash_method = request.data.get('hash_method', 'argon2')
        if 'user_id' not in request.session:
            return Response({"message": "Nieautoryzowany dostęp"}, status=status.HTTP_401_UNAUTHORIZED)

        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            return Response({"message": "Nie znaleziono użytkownika"}, status=status.HTTP_404_NOT_FOUND)

        if not user.check_password(old_password):
            return Response({"message": "Niepoprawne stare hasło"}, status=status.HTTP_400_BAD_REQUEST)

        if hash_method not in HASH_METHODS:
            return Response({"message": "Niepoprawna metoda hashująca"}, status=status.HTTP_400_BAD_REQUEST)

        user.hash_method = hash_method
        user.set_password(new_password)
        user.save()

        return Response({"message": "Hasło zaktualizowane pomyślnie"}, status=status.HTTP_200_OK)

class LogoutView(APIView):
    def post(self, request):
        logout(request)
        return Response({"message": "Wylogowano"}, status=status.HTTP_200_OK)

class DeleteAccountView(APIView):
    def post(self, request):
        if 'user_id' not in request.session:
            return Response({"message": "Nieautoryzowany dostęp"}, status=status.HTTP_401_UNAUTHORIZED)

        password1 = request.data.get('password1')
        password2 = request.data.get('password2')

        if not password1 or not password2:
            return Response({"message": "Obydwa hasła są wymagane"}, status=status.HTTP_400_BAD_REQUEST)

        if password1 != password2:
            return Response({"message": "Hasła nie są takie same"}, status=status.HTTP_400_BAD_REQUEST)

        user_id = request.session.get('user_id')
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({"message": "Nie znaleziono użytkownika"}, status=status.HTTP_404_NOT_FOUND)

        if not user.check_password(password1):
            return Response({"message": "Niepoprawne hasło"}, status=status.HTTP_400_BAD_REQUEST)

        user.delete()
        logout(request)

        return Response({"message": "Konto usunięte pomyślnie"}, status=status.HTTP_200_OK)

class CheckPasswordView(APIView):
    def post(self, request):
        if 'user_id' not in request.session:
            return Response({"message": "Nieautoryzowany dostęp"}, status=status.HTTP_401_UNAUTHORIZED)

        password = request.data.get('password')

        user_id = request.session.get('user_id')
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({"message": "Nie znaleziono użytkownika"}, status=status.HTTP_404_NOT_FOUND)

        if not user.check_password(password):
            return Response({"message": "Niepoprawne hasło"}, status=status.HTTP_400_BAD_REQUEST)

        return Response({"message": "Hasło jest prawidłowe"}, status=status.HTTP_200_OK)

class CheckSessionView(APIView):
    def get(self, request):
        request.session.modified = True
        request.session.save()

        if 'user_id' in request.session:
            print("Ciasteczka sesji:", request.COOKIES)
            print("Elementy sesji:", request.session.items())
            return Response({"authenticated": True, "username": request.session.get('username')})

        print("Brak aktywnej sesji!")
        return Response({"authenticated": False}, status=status.HTTP_401_UNAUTHORIZED)