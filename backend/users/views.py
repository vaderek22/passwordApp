from rest_framework import status, generics
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import authenticate
from .models import User, HASH_METHODS
from .serializers import UserSerializer
from django.http import JsonResponse
from django.contrib.auth import authenticate, login, logout


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
            return Response({"message": "invalid credentials"}, status=status.HTTP_400_BAD_REQUEST)

        if not user.check_password(password):
            return Response({"message": "invalid credentials"}, status=status.HTTP_400_BAD_REQUEST)

        user.update_last_login()

        request.session['user_id'] = user.id
        request.session['username'] = user.username
        request.session.modified = True
        request.session.save()

        return Response({"message": "login successful"}, status=status.HTTP_200_OK)

class UserListView(APIView):
    def get(self, request):
        users = User.objects.all()
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class UpdatePasswordView(APIView):
    def post(self, request):
        username = request.data.get('username')
        old_password = request.data.get('old_password')
        new_password = request.data.get('new_password')
        hash_method = request.data.get('hash_method', 'argon2')
        # Sprawdzenie, czy użytkownik ma aktywną sesję
        if 'user_id' not in request.session:
            return Response({"message": "Unauthorized"}, status=status.HTTP_401_UNAUTHORIZED)

        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            return Response({"message": "User not found"}, status=status.HTTP_404_NOT_FOUND)

        if not user.check_password(old_password):
            return Response({"message": "Invalid old password"}, status=status.HTTP_400_BAD_REQUEST)

        if hash_method not in HASH_METHODS:
            return Response({"message": "Invalid hash method"}, status=status.HTTP_400_BAD_REQUEST)

        user.hash_method = hash_method
        user.set_password(new_password)
        user.save()

        return Response({"message": "Password updated successfully"}, status=status.HTTP_200_OK)

class LogoutView(APIView):
    def post(self, request):
        logout(request)
        return Response({"message": "Logged out"}, status=status.HTTP_200_OK)

class DeleteAccountView(APIView):
    def post(self, request):
        if 'user_id' not in request.session:
            return Response({"message": "Unauthorized"}, status=status.HTTP_401_UNAUTHORIZED)

        password1 = request.data.get('password1')
        password2 = request.data.get('password2')

        if not password1 or not password2:
            return Response({"message": "Both passwords are required"}, status=status.HTTP_400_BAD_REQUEST)

        if password1 != password2:
            return Response({"message": "Passwords do not match"}, status=status.HTTP_400_BAD_REQUEST)

        user_id = request.session.get('user_id')
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({"message": "User not found"}, status=status.HTTP_404_NOT_FOUND)

        if not user.check_password(password1):
            return Response({"message": "Incorrect password"}, status=status.HTTP_400_BAD_REQUEST)

        user.delete()

        logout(request)

        return Response({"message": "Account deleted successfully"}, status=status.HTTP_200_OK)

class CheckPasswordView(APIView):
    def post(self, request):
        if 'user_id' not in request.session:
            return Response({"message": "Unauthorized"}, status=status.HTTP_401_UNAUTHORIZED)

        password = request.data.get('password')

        user_id = request.session.get('user_id')
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({"message": "User not found"}, status=status.HTTP_404_NOT_FOUND)

        if not user.check_password(password):
            return Response({"message": "Incorrect password"}, status=status.HTTP_400_BAD_REQUEST)

        return Response({"message": "Password is correct"}, status=status.HTTP_200_OK)

class CheckSessionView(APIView):
    def get(self, request):
        print("Request cookies:", request.COOKIES)
        print("Request session (before save):", request.session.items())

        request.session.modified = True
        request.session.save()

        session_id = request.COOKIES.get('sessionid')
        if session_id:
            print(f"Session ID found: {session_id}")

        if 'user_id' in request.session:
            print("Active session:", request.session.items())
            return Response({"authenticated": True, "username": request.session.get('username')})

        print("Brak aktywnej sesji!")
        return Response({"authenticated": False}, status=status.HTTP_401_UNAUTHORIZED)


