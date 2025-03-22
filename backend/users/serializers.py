from rest_framework import serializers
from .models import User
from passlib.hash import argon2, bcrypt, sha1_crypt
import hashlib

HASH_METHODS = {
    'md5': lambda p: hashlib.md5(p.encode()).hexdigest(),
    'sha1': lambda p: sha1_crypt.hash(p),
    'bcrypt': lambda p: bcrypt.hash(p),
    'argon2': lambda p: argon2.hash(p),
}

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
            raise serializers.ValidationError({"password": "This field is required."})

        if not hash_method:
            raise serializers.ValidationError({"hash_method": "This field is required."})

        if hash_method in HASH_METHODS:
            data['password_hash'] = HASH_METHODS[hash_method](password)
        else:
            raise serializers.ValidationError({"hash_method": "Invalid hash method."})

        return data

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User.objects.create(**validated_data)
        return user