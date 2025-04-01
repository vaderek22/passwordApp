from django.db import models
from django.contrib.auth.models import BaseUserManager, AbstractBaseUser
from django.utils import timezone
from .hashing import HASH_METHODS,VERIFY_METHODS

class UserManager(BaseUserManager):
    def create_user(self, username, password, hash_method='argon2'):
        if self.filter(username=username).exists():
            raise ValueError("Użytkownik już istnieje!")

        if hash_method not in HASH_METHODS:
            raise ValueError("Niepoprawna metoda hashowania.")

        hashed_password = HASH_METHODS[hash_method](password)

        user = self.model(username=username, password_hash=hashed_password, hash_method=hash_method)
        user.save(using=self._db)
        return user

class User(AbstractBaseUser):
    username = models.CharField(max_length=150, unique=True)
    password_hash = models.TextField()
    hash_method = models.CharField(max_length=20, choices=[(h, h) for h in HASH_METHODS.keys()])
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