"""
Backend Authentication & JWT Security Utilities
Pure Python implementation using standard hashlib (PBKDF2-HMAC-SHA256) and HMAC-SHA256 JWT tokens.
"""

import hmac
import hashlib
import base64
import json
import secrets
from datetime import datetime, timedelta
from typing import Dict, Any, Optional
from config import config

# -----------------------------------------------------------------------------
# 1. Secure Password Hashing (PBKDF2-HMAC-SHA256 with random salt)
# -----------------------------------------------------------------------------

def hash_password(password: str) -> str:
    """Hashes password with random salt using PBKDF2-HMAC-SHA256 (100,000 iterations)."""
    salt = secrets.token_hex(16)
    pwd_hash = hashlib.pbkdf2_hmac(
        'sha256',
        password.encode('utf-8'),
        salt.encode('utf-8'),
        100000
    ).hex()
    return f"{salt}${pwd_hash}"


def verify_password(password: str, stored_hash: str) -> bool:
    """Verifies plain password against stored salt$hash format using constant-time comparison."""
    try:
        salt, expected_hash = stored_hash.split('$', 1)
        pwd_hash = hashlib.pbkdf2_hmac(
            'sha256',
            password.encode('utf-8'),
            salt.encode('utf-8'),
            100000
        ).hex()
        return hmac.compare_digest(pwd_hash, expected_hash)
    except Exception:
        return False


# -----------------------------------------------------------------------------
# 2. JWT Token Engine (HMAC-SHA256 / Base64URL)
# -----------------------------------------------------------------------------

def _b64url_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b'=').decode('utf-8')


def _b64url_decode(data_str: str) -> bytes:
    padding = 4 - (len(data_str) % 4)
    if padding != 4:
        data_str += '=' * padding
    return base64.urlsafe_b64decode(data_str.encode('utf-8'))


def create_jwt_token(payload: Dict[str, Any], secret_key: str = config.JWT_SECRET_KEY) -> str:
    """Encodes a signed JWT HS256 token."""
    header = {"alg": "HS256", "typ": "JWT"}
    encoded_header = _b64url_encode(json.dumps(header, separators=(',', ':')).encode('utf-8'))
    encoded_payload = _b64url_encode(json.dumps(payload, separators=(',', ':')).encode('utf-8'))

    signing_input = f"{encoded_header}.{encoded_payload}".encode('utf-8')
    signature = hmac.new(secret_key.encode('utf-8'), signing_input, hashlib.sha256).digest()
    encoded_signature = _b64url_encode(signature)

    return f"{encoded_header}.{encoded_payload}.{encoded_signature}"


def verify_jwt_token(token: str, secret_key: str = config.JWT_SECRET_KEY) -> Optional[Dict[str, Any]]:
    """Decodes and validates a signed JWT token; returns payload or None if invalid/expired."""
    try:
        parts = token.split('.')
        if len(parts) != 3:
            return None

        encoded_header, encoded_payload, encoded_signature = parts
        
        # 1. Header Validation against algorithm substitution / confusion
        header_bytes = _b64url_decode(encoded_header)
        header = json.loads(header_bytes.decode('utf-8'))
        if header.get("alg") != "HS256" or header.get("typ") != "JWT":
            return None

        # 2. Signature Validation using constant-time comparison
        signing_input = f"{encoded_header}.{encoded_payload}".encode('utf-8')
        expected_sig = hmac.new(secret_key.encode('utf-8'), signing_input, hashlib.sha256).digest()
        provided_sig = _b64url_decode(encoded_signature)

        if not hmac.compare_digest(expected_sig, provided_sig):
            return None

        # 3. Payload Extraction & Expiration Validation
        payload_bytes = _b64url_decode(encoded_payload)
        payload = json.loads(payload_bytes.decode('utf-8'))

        exp = payload.get("exp")
        if exp and datetime.utcnow().timestamp() > exp:
            return None

        return payload
    except Exception:
        return None


def generate_access_token(user_id: str, role: str) -> str:
    now = datetime.utcnow()
    expire = now + timedelta(minutes=config.ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {
        "sub": user_id,
        "role": role,
        "type": "access",
        "iat": int(now.timestamp()),
        "exp": int(expire.timestamp()),
    }
    return create_jwt_token(payload)


def generate_refresh_token(user_id: str) -> str:
    now = datetime.utcnow()
    expire = now + timedelta(days=config.REFRESH_TOKEN_EXPIRE_DAYS)
    payload = {
        "sub": user_id,
        "type": "refresh",
        "iat": int(now.timestamp()),
        "exp": int(expire.timestamp()),
    }
    return create_jwt_token(payload)
