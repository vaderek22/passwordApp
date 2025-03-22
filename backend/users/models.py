from django.db import models
from django.contrib.auth.models import BaseUserManager, AbstractBaseUser
import hashlib
from passlib.hash import argon2, bcrypt, sha1_crypt
from django.utils import timezone

# Definicja metod haszowania
HASH_METHODS = {
    'md5': lambda p: hashlib.md5(p.encode()).hexdigest(),
    'sha1': lambda p: sha1_crypt.hash(p),
    'bcrypt': lambda p: bcrypt.hash(p),
    'argon2': lambda p: argon2.hash(p),
}

# Definicja metod weryfikacji hasła
VERIFY_METHODS = {
    'md5': lambda p, h: hashlib.md5(p.encode()).hexdigest() == h,
    'sha1': lambda p, h: sha1_crypt.verify(p, h),
    'bcrypt': lambda p, h: bcrypt.verify(p, h),
    'argon2': lambda p, h: argon2.verify(p, h),
}

class UserManager(BaseUserManager):
    def create_user(self, username, password, hash_method='argon2'):
        if self.filter(username=username).exists():
            raise ValueError("Użytkownik już istnieje!")

        if hash_method not in HASH_METHODS:
            raise ValueError("Invalid hash method.")

        hashed_password = HASH_METHODS[hash_method](password)

        user = self.model(username=username, password_hash=hashed_password, hash_method=hash_method)
        user.save(using=self._db)
        return user

class User(AbstractBaseUser):
    username = models.CharField(max_length=150, unique=True)
    password_hash = models.TextField()
    hash_method = models.CharField(max_length=10, choices=[(h, h) for h in HASH_METHODS.keys()])
    last_login = models.DateTimeField(null=True, blank=True)

    objects = UserManager()

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = []

    def __str__(self):
        return self.username

    def check_password(self, password):
        return VERIFY_METHODS[self.hash_method](password, self.password_hash)

    def set_password(self, password):
        self.password_hash = HASH_METHODS[self.hash_method](password)
        self.save()

    def update_last_login(self):
        self.last_login = timezone.now()
        self.save()