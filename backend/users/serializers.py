from rest_framework import serializers
from .models import User
from .hashing import HASH_METHODS
from django.core.exceptions import ValidationError

PASSWORD_LENGTH_ERROR = "Hasło musi mieć minimum 12 znaków."

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})

    class Meta:
        model = User
        fields = ['username', 'password', 'hash_method', 'password_hash', 'last_login', 'otp_enabled']
        extra_kwargs = {
            'password_hash': {'read_only': True},
            'last_login': {'read_only': True},
            'otp_enabled': {'read_only': True},
        }

    def validate(self, data):
        if data.get('hash_method') not in HASH_METHODS:
            raise serializers.ValidationError({"hash_method": "Niepoprawna metoda hashowania."})
        password = data.get('password')
        if password and len(password) < 12:
            raise serializers.ValidationError({"password": PASSWORD_LENGTH_ERROR})
        return data

    def create(self, validated_data):
        password = validated_data.pop('password')
        if len(password) < 12:
            raise ValidationError(PASSWORD_LENGTH_ERROR)
        user = User.objects.create(**validated_data)
        user.set_password(password)
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        
        if password:
            if len(password) < 12:
                raise ValidationError(PASSWORD_LENGTH_ERROR)
            instance.set_password(password)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()
        return instance