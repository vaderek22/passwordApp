import hashlib
import secrets
from passlib.hash import argon2, bcrypt

def generate_salt(length=16):
    return secrets.token_hex(length)

def strengthened_md5(password, salt=None, iterations=10000):
    salt = salt or generate_salt(8)
    dk = password.encode() + salt.encode()
    for _ in range(iterations):
        dk = hashlib.md5(dk).digest()
    return f"$md5${iterations}${salt}${dk.hex()}"

def strengthened_sha1(password, salt=None, iterations=10000):
    salt = salt or generate_salt(8)
    dk = password.encode() + salt.encode()
    for _ in range(iterations):
        dk = hashlib.sha1(dk).digest()
    return f"$sha1${iterations}${salt}${dk.hex()}"

BCRYPT_ROUNDS = 15  
ARGON2_PARAMS = {
    'time_cost': 4,
    'memory_cost': 131072,
    'parallelism': 8,
    'hash_len': 64,
    'salt_len': 32
}

HASH_METHODS = {
    'md5': lambda p: strengthened_md5(p),
    'sha1': lambda p: strengthened_sha1(p),
    'bcrypt': lambda p: bcrypt.using(rounds=BCRYPT_ROUNDS).hash(p),
    'argon2': lambda p: argon2.using(**ARGON2_PARAMS).hash(p),
}

VERIFY_METHODS = {
    'md5': lambda p, h: strengthened_md5(p, h.split('$')[3], int(h.split('$')[2])) == h,
    'sha1': lambda p, h: strengthened_sha1(p, h.split('$')[3], int(h.split('$')[2])) == h,
    'bcrypt': lambda p, h: bcrypt.verify(p, h),
    'argon2': lambda p, h: argon2.verify(p, h),
}