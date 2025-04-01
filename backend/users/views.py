from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import User, HASH_METHODS
from .serializers import UserSerializer
from django.contrib.auth import logout

class RegisterView(APIView):
    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
class LoginView(APIView):
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')

        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            return Response({"message": "Nieprawidłowe dane uwierzytelniające"}, status=status.HTTP_400_BAD_REQUEST)

        if not user.check_password(password):
            return Response({"message": "Nieprawidłowe dane uwierzytelniające"}, status=status.HTTP_400_BAD_REQUEST)

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