import hashlib
from passlib.hash import argon2, bcrypt

HASH_METHODS = {
    'md5': lambda p: hashlib.md5(p.encode()).hexdigest(),
    'sha1': lambda p: hashlib.sha1(p.encode()).hexdigest(),
    'bcrypt': lambda p: bcrypt.hash(p),
    'argon2': lambda p: argon2.hash(p),
}

VERIFY_METHODS = {
    'md5': lambda p, h: hashlib.md5(p.encode()).hexdigest() == h,
    'sha1': lambda p, h: hashlib.sha1(p.encode()).hexdigest() == h,
    'bcrypt': lambda p, h: bcrypt.verify(p, h),
    'argon2': lambda p, h: argon2.verify(p, h),
}