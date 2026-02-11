"""
Encryption Module — Encrypt/decrypt API keys stored in database
Uses Fernet symmetric encryption
"""
import os
import base64
import hashlib
from cryptography.fernet import Fernet

# Derive a valid Fernet key from env var
_raw_key = os.getenv("ENCRYPTION_KEY", "default-encryption-key-change-me!")
_key_hash = hashlib.sha256(_raw_key.encode()).digest()
_fernet_key = base64.urlsafe_b64encode(_key_hash)
_fernet = Fernet(_fernet_key)


def encrypt_value(value: str) -> str:
    """Encrypt a string value"""
    if not value:
        return ""
    return _fernet.encrypt(value.encode()).decode()


def decrypt_value(encrypted: str) -> str:
    """Decrypt an encrypted string"""
    if not encrypted:
        return ""
    try:
        return _fernet.decrypt(encrypted.encode()).decode()
    except Exception:
        return ""


def mask_api_key(key: str) -> str:
    """Mask API key for safe display: show first 4 and last 4 chars"""
    if not key or len(key) <= 8:
        return "****"
    return f"{key[:4]}{'*' * (len(key) - 8)}{key[-4:]}"
