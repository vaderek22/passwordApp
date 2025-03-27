from rest_framework import serializers
from .models import User
from .hashing import HASH_METHODS


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'password', 'hash_method', 'password_hash', 'last_login']
        extra_kwargs = {'password_hash': {'read_only': True}, 'last_login': {'read_only': True}}

    def validate(self, data):
        password = data.get('password')
        hash_method = data.get('hash_method')

        if not password:
            raise serializers.ValidationError({"password": "To pole jest wymagane."})

        if not hash_method:
            raise serializers.ValidationError({"hash_method": "To pole jest wymagane."})

        if hash_method in HASH_METHODS:
            data['password_hash'] = HASH_METHODS[hash_method](password)
        else:
            raise serializers.ValidationError({"hash_method": "Niepoprawna metoda hashowania."})

        return data

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User.objects.create(**validated_data)
        return user