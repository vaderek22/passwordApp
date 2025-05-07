from django.test import TestCase, Client
from django.urls import reverse
from .models import User
from django.utils import timezone
from datetime import timedelta
import pyotp

class UserModelTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="testuser", password="testpassword")

    def test_check_password(self):
        self.assertTrue(self.user.check_password("testpassword"))
        self.assertFalse(self.user.check_password("wrongpassword"))

    def test_is_account_locked(self):
        self.assertFalse(self.user.is_account_locked())
        self.user.locked_until = timezone.now() + timedelta(minutes=5)
        self.assertTrue(self.user.is_account_locked())

    def test_generate_otp_secret(self):
        self.user.generate_otp_secret()
        self.assertIsNotNone(self.user.otp_secret)

    def test_verify_otp(self):
        self.user.generate_otp_secret()
        otp = pyotp.TOTP(self.user.otp_secret).now()
        self.assertTrue(self.user.verify_otp(otp))
        self.assertFalse(self.user.verify_otp("000000"))

    def test_increment_failed_attempt(self):
        self.assertEqual(self.user.failed_login_attempts, 0)
        self.user.increment_failed_attempt()
        self.assertEqual(self.user.failed_login_attempts, 1)
        for _ in range(2):
            self.user.increment_failed_attempt()
        self.assertTrue(self.user.is_account_locked())

    def test_update_last_login_resets_attempts(self):
        self.user.failed_login_attempts = 3
        self.user.locked_until = timezone.now() + timedelta(minutes=30)
        self.user.update_last_login()
        self.assertEqual(self.user.failed_login_attempts, 0)
        self.assertIsNone(self.user.locked_until)

class UserIntegrationTests(TestCase):
    def setUp(self):
        self.client = Client()
        self.register_url = reverse("register")
        self.login_url = reverse("login")
        self.user = User.objects.create_user(username="testuser", password="testpassword")

    def test_register_user(self):
        response = self.client.post(self.register_url, {
            "username": "newuser",
            "password": "newpassword25@",
            "hash_method": "argon2"
        })
        self.assertEqual(response.status_code, 201)
        self.assertTrue(User.objects.filter(username="newuser").exists())

    def test_login_user(self):
        response = self.client.post(self.login_url, {
            "username": "testuser",
            "password": "testpassword"
        })
        self.assertEqual(response.status_code, 200)
        self.assertIn("sessionid", response.cookies)

    def test_failed_login_attempts_counter(self):
        self.client.post(self.login_url, {
            "username": "testuser",
            "password": "wrongpassword"
        })
        self.user.refresh_from_db()
        self.assertEqual(self.user.failed_login_attempts, 1)

        self.client.post(self.login_url, {
            "username": "testuser",
            "password": "wrongpassword"
        })
        self.user.refresh_from_db()
        self.assertEqual(self.user.failed_login_attempts, 2)

    def test_account_lock_after_max_attempts(self):
        max_attempts = 3
        
        for _ in range(max_attempts):
            self.client.post(self.login_url, {
                "username": "testuser",
                "password": "wrongpassword"
            })
        
        self.user.refresh_from_db()
        self.assertTrue(self.user.is_account_locked())

    def test_2fa_verification(self):
        self.user.generate_otp_secret()
        self.user.otp_enabled = True
        self.user.save()
        
        response = self.client.post(self.login_url, {
            "username": "testuser",
            "password": "testpassword"
        })
        
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data.get("requires_2fa"))
        
        otp = pyotp.TOTP(self.user.otp_secret).now()
        verify_url = reverse("verify-2fa-login")
        response = self.client.post(verify_url, {
            "username": "testuser",
            "token": otp,
            "session_key": self.client.session.session_key
        })
        
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data.get("success"))