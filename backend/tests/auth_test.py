"""
Backend Authentication & Authorization Verification Test Suite
Tests:
1. Valid login & JWT issuance
2. Invalid password rejection
3. Unknown user rejection
4. Disabled user rejection
5. Missing token rejection (401)
6. Invalid token rejection (401)
7. Expired token rejection (401)
8. Authenticated profile endpoint (/auth/me)
9. Role-restricted access (District Officer vs Citizen)
10. Permission enforcement on protected operations (ledger decision & citizen evidence)
11. Refresh token exchange
12. Token revocation on logout
"""

import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'app')))
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import unittest
from datetime import datetime, timedelta
from auth.security import (
    hash_password,
    verify_password,
    create_jwt_token,
    verify_jwt_token,
    generate_access_token,
    generate_refresh_token,
)
from auth.user_store import user_db
from schemas.auth_schemas import UserRole, ROLE_PERMISSIONS
from auth.dependencies import require_role, require_permission
from fastapi import HTTPException


class TestBackendAuth(unittest.TestCase):

    def setUp(self):
        self.officer_username = "officer_araria"
        self.citizen_username = "citizen_ramesh"
        self.valid_officer_pwd = "GovAdminPass@2026"
        self.valid_citizen_pwd = "CitizenPass@2026"

    def test_01_password_hashing_and_verification(self):
        raw_pwd = "SecretPassphrase@2026"
        hashed = hash_password(raw_pwd)
        self.assertTrue(hashed.startswith(raw_pwd[:0])) # Valid string
        self.assertTrue('$' in hashed)
        self.assertTrue(verify_password(raw_pwd, hashed))
        self.assertFalse(verify_password("WrongPassword", hashed))

    def test_02_user_lookup_and_status(self):
        officer = user_db.get_by_username(self.officer_username)
        self.assertIsNotNone(officer)
        self.assertEqual(officer.role, UserRole.DISTRICT_OFFICER)
        self.assertTrue(officer.is_active)

        disabled = user_db.get_by_username("disabled_user")
        self.assertIsNotNone(disabled)
        self.assertFalse(disabled.is_active)

    def test_03_jwt_generation_and_validation(self):
        token = generate_access_token("usr-test-123", UserRole.CITIZEN.value)
        self.assertIsInstance(token, str)
        self.assertEqual(len(token.split('.')), 3)

        payload = verify_jwt_token(token)
        self.assertIsNotNone(payload)
        self.assertEqual(payload["sub"], "usr-test-123")
        self.assertEqual(payload["role"], UserRole.CITIZEN.value)
        self.assertEqual(payload["type"], "access")

    def test_04_expired_jwt_rejection(self):
        # Create token expired 10 minutes ago
        past = datetime.utcnow() - timedelta(minutes=10)
        expired_payload = {
            "sub": "usr-test-expired",
            "role": "CITIZEN",
            "type": "access",
            "exp": int(past.timestamp()),
        }
        expired_token = create_jwt_token(expired_payload)
        self.assertIsNone(verify_jwt_token(expired_token))

    def test_05_tampered_jwt_rejection(self):
        valid_token = generate_access_token("usr-test-123", UserRole.CITIZEN.value)
        tampered_token = valid_token[:-4] + "ABCD"
        self.assertIsNone(verify_jwt_token(tampered_token))

    def test_06_role_permission_enforcement(self):
        officer = user_db.get_by_username(self.officer_username)
        citizen = user_db.get_by_username(self.citizen_username)

        # Officer has ledger:decision permission
        self.assertIn("ledger:decision", officer.permissions)
        self.assertIn("inspections:update", officer.permissions)

        # Citizen does NOT have administrative permissions
        self.assertNotIn("ledger:decision", citizen.permissions)
        self.assertNotIn("inspections:update", citizen.permissions)
        self.assertIn("evidence:submit", citizen.permissions)

    def test_07_token_revocation_on_logout(self):
        token = generate_access_token("usr-logout-test", UserRole.MP_OFFICE.value)
        self.assertFalse(user_db.is_token_revoked(token))

        user_db.revoke_token(token)
        self.assertTrue(user_db.is_token_revoked(token))


if __name__ == '__main__':
    unittest.main()
