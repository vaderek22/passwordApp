from django.db import models
from django.contrib.auth.models import BaseUserManager, AbstractBaseUser
from django.utils import timezone
from datetime import timedelta
from .hashing import HASH_METHODS, VERIFY_METHODS
import pyotp
import qrcode
import io
import base64

class UserManager(BaseUserManager):
    def create_user(self, username, password, hash_method='argon2'):
        if self.filter(username=username).exists():
            raise ValueError("Użytkownik już istnieje!")

        if hash_method not in HASH_METHODS:
            raise ValueError("Niepoprawna metoda hashowania.")

        hashed_password = HASH_METHODS[hash_method](password)

        user = self.model(
            username=username, 
            password_hash=hashed_password, 
            hash_method=hash_method,
            failed_login_attempts=0,
            locked_until=None
        )
        user.save(using=self._db)
        return user
    def create_superuser(self, username, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')
        return self.create_user(username=username, password=password, **extra_fields)

class User(AbstractBaseUser):
    username = models.CharField(max_length=150, unique=True)
    password_hash = models.TextField()
    hash_method = models.CharField(max_length=20, choices=[(h, h) for h in HASH_METHODS.keys()])
    last_login = models.DateTimeField(null=True, blank=True)
    failed_login_attempts = models.IntegerField(default=0)
    locked_until = models.DateTimeField(null=True, blank=True)
    otp_secret = models.CharField(max_length=32, blank=True)
    otp_enabled = models.BooleanField(default=False)

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
        self.failed_login_attempts = 0
        self.locked_until = None
        self.save()

    def increment_failed_attempt(self):
        self.failed_login_attempts += 1
        if self.failed_login_attempts >= 3:
            self.locked_until = timezone.now() + timedelta(minutes=30)
        self.save()

    def is_account_locked(self):
        if self.locked_until and timezone.now() < self.locked_until:
            return True
        elif self.locked_until and timezone.now() >= self.locked_until:
            self.failed_login_attempts = 0
            self.locked_until = None
            self.save()
            return False
        return False
    def generate_otp_secret(self):
        self.otp_secret = pyotp.random_base32()
        self.save()
        return self.otp_secret
    
    def get_otp_uri(self):
        if not self.otp_secret:
            self.generate_otp_secret()
        
        return pyotp.totp.TOTP(self.otp_secret).provisioning_uri(
            name=self.username,
            issuer_name="passwordApp"
        )
    
    def get_otp_qr_code(self):
        uri = self.get_otp_uri()
        img = qrcode.make(uri)
        buffer = io.BytesIO()
        img.save(buffer, format="PNG")
        return base64.b64encode(buffer.getvalue()).decode()
    
    def verify_otp(self, token):
        if not self.otp_secret:
            return False
        totp = pyotp.TOTP(self.otp_secret)
        return totp.verify(token)
    
    def disable_otp(self):
        self.otp_enabled = False
        self.otp_secret = ""
        self.save()