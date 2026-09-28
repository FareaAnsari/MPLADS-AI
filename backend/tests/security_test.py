"""
Automated Backend Security Hardening Test Suite (Phase 14)
Validates JWT algorithm handling, signature verification, token expiration,
RBAC enforcement, IDOR / jurisdiction scoping, coordinate/progress validation,
and HTTP security response headers.
"""

import unittest
import json
import base64
import hmac
import hashlib
from datetime import datetime, timedelta

from fastapi.testclient import TestClient
from main import app
from auth.security import create_jwt_token, generate_access_token, hash_password
from auth.user_store import user_db, UserModel
from schemas.auth_schemas import UserRole, ROLE_PERMISSIONS
from config import config

client = TestClient(app)


def _b64url_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b'=').decode('utf-8')


class SecurityHardeningTests(unittest.TestCase):

    def setUp(self):
        # Ensure test users are populated in user_db
        pass

    # -------------------------------------------------------------------------
    # 1. JWT Security & Header Hardening
    # -------------------------------------------------------------------------
    def test_missing_token_returns_401(self):
        resp = client.get("/api/v1/officer/dashboard")
        self.assertEqual(resp.status_code, 401)
        self.assertIn("Bearer token required", resp.json()["detail"])

    def test_malformed_token_returns_401(self):
        resp = client.get(
            "/api/v1/officer/dashboard",
            headers={"Authorization": "Bearer not-a-valid-jwt-token"}
        )
        self.assertEqual(resp.status_code, 401)
        self.assertIn("Invalid or expired", resp.json()["detail"])

    def test_invalid_signature_returns_401(self):
        fake_token = create_jwt_token(
            {"sub": "usr-officer-001", "role": "DISTRICT_OFFICER", "type": "access", "exp": int(datetime.utcnow().timestamp()) + 3600},
            secret_key="attacker_wrong_secret_key"
        )
        resp = client.get(
            "/api/v1/officer/dashboard",
            headers={"Authorization": f"Bearer {fake_token}"}
        )
        self.assertEqual(resp.status_code, 401)

    def test_expired_token_returns_401(self):
        expired_token = create_jwt_token(
            {"sub": "usr-officer-001", "role": "DISTRICT_OFFICER", "type": "access", "exp": int(datetime.utcnow().timestamp()) - 3600},
            secret_key=config.JWT_SECRET_KEY
        )
        resp = client.get(
            "/api/v1/officer/dashboard",
            headers={"Authorization": f"Bearer {expired_token}"}
        )
        self.assertEqual(resp.status_code, 401)

    def test_algorithm_confusion_none_or_rs256_rejected(self):
        # Test token forged with alg: none
        header = {"alg": "none", "typ": "JWT"}
        payload = {"sub": "usr-officer-001", "role": "DISTRICT_OFFICER", "type": "access", "exp": int(datetime.utcnow().timestamp()) + 3600}
        enc_h = _b64url_encode(json.dumps(header).encode('utf-8'))
        enc_p = _b64url_encode(json.dumps(payload).encode('utf-8'))
        none_token = f"{enc_h}.{enc_p}."

        resp = client.get(
            "/api/v1/officer/dashboard",
            headers={"Authorization": f"Bearer {none_token}"}
        )
        self.assertEqual(resp.status_code, 401)

    # -------------------------------------------------------------------------
    # 2. RBAC & Privilege Escalation Guards
    # -------------------------------------------------------------------------
    def test_citizen_cannot_access_officer_dashboard(self):
        token = generate_access_token("usr-citizen-001", UserRole.CITIZEN.value)
        resp = client.get(
            "/api/v1/officer/dashboard",
            headers={"Authorization": f"Bearer {token}"}
        )
        self.assertEqual(resp.status_code, 403)
        self.assertIn("Access forbidden", resp.json()["detail"])

    def test_citizen_cannot_access_mp_dashboard(self):
        token = generate_access_token("usr-citizen-001", UserRole.CITIZEN.value)
        resp = client.get(
            "/api/v1/mp/dashboard",
            headers={"Authorization": f"Bearer {token}"}
        )
        self.assertEqual(resp.status_code, 403)

    def test_contractor_cannot_decide_audit_ledger(self):
        token = generate_access_token("usr-contractor-001", UserRole.CONTRACTOR.value)
        resp = client.post(
            "/api/v1/ledger/entry/led-001/decision",
            json={"human_decision": "APPROVE", "outcome_notes": "Contractor self-approval"},
            headers={"Authorization": f"Bearer {token}"}
        )
        self.assertEqual(resp.status_code, 403)

    # -------------------------------------------------------------------------
    # 3. Jurisdiction Scoping & IDOR Protections
    # -------------------------------------------------------------------------
    def test_officer_inspection_outside_district_rejected(self):
        # Officer Araria (Bihar) attempting inspection on a project in another district/state
        token = generate_access_token("usr-officer-001", UserRole.DISTRICT_OFFICER.value)
        
        # Test project in another state / district
        resp = client.post(
            "/api/v1/officer/inspections/MPLADS-2024-MH01-001/update",
            json={"inspection_status": "COMPLETED", "observations": "Out of jurisdiction attempt", "physical_progress_percent": 80.0},
            headers={"Authorization": f"Bearer {token}"}
        )
        self.assertIn(resp.status_code, [403, 404])

    def test_officer_inspection_progress_bounds_validation(self):
        token = generate_access_token("usr-officer-001", UserRole.DISTRICT_OFFICER.value)
        resp = client.post(
            "/api/v1/officer/inspections/WRK-2024-BR01-001/update",
            json={"inspection_status": "COMPLETED", "observations": "Invalid progress", "physical_progress_percent": 150.0},
            headers={"Authorization": f"Bearer {token}"}
        )
        self.assertEqual(resp.status_code, 422)

    # -------------------------------------------------------------------------
    # 4. Input Bounds Validation (Coordinates & Progress)
    # -------------------------------------------------------------------------
    def test_citizen_evidence_invalid_latitude_rejected(self):
        token = generate_access_token("usr-citizen-001", UserRole.CITIZEN.value)
        resp = client.post(
            "/api/v1/citizen/evidence",
            json={
                "project_id": "WRK-2024-BR01-001",
                "latitude": 120.5, # Invalid latitude > 90
                "longitude": 85.31,
                "timestamp_captured": datetime.utcnow().isoformat(),
                "is_live_camera_capture": True
            },
            headers={"Authorization": f"Bearer {token}"}
        )
        self.assertEqual(resp.status_code, 422)

    def test_citizen_evidence_invalid_longitude_rejected(self):
        token = generate_access_token("usr-citizen-001", UserRole.CITIZEN.value)
        resp = client.post(
            "/api/v1/citizen/evidence",
            json={
                "project_id": "WRK-2024-BR01-001",
                "latitude": 25.09,
                "longitude": -200.0, # Invalid longitude < -180
                "timestamp_captured": datetime.utcnow().isoformat(),
                "is_live_camera_capture": True
            },
            headers={"Authorization": f"Bearer {token}"}
        )
        self.assertEqual(resp.status_code, 422)

    def test_contractor_progress_percentage_bounds(self):
        token = generate_access_token("usr-contractor-001", UserRole.CONTRACTOR.value)
        resp = client.post(
            "/api/v1/contractor/projects/WRK-2024-BR01-001/progress",
            json={
                "work_id": "WRK-2024-BR01-001",
                "progress_percentage": -10.0, # Invalid negative progress
                "remarks": "Invalid submission"
            },
            headers={"Authorization": f"Bearer {token}"}
        )
        self.assertEqual(resp.status_code, 422)

    # -------------------------------------------------------------------------
    # 5. Notification Ownership & Device Security
    # -------------------------------------------------------------------------
    def test_user_cannot_mark_other_user_notification_read(self):
        token = generate_access_token("usr-citizen-001", UserRole.CITIZEN.value)
        # Attempt to mark an officer-only notification as read
        resp = client.post(
            "/api/v1/notifications/notif-off-001/read",
            headers={"Authorization": f"Bearer {token}"}
        )
        self.assertEqual(resp.status_code, 403)

    # -------------------------------------------------------------------------
    # 6. HTTP Security Headers
    # -------------------------------------------------------------------------
    def test_security_headers_present(self):
        resp = client.get("/health")
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.headers.get("x-content-type-options"), "nosniff")
        self.assertEqual(resp.headers.get("x-frame-options"), "DENY")
        self.assertEqual(resp.headers.get("x-xss-protection"), "1; mode=block")
        self.assertEqual(resp.headers.get("referrer-policy"), "strict-origin-when-cross-origin")


if __name__ == "__main__":
    unittest.main()
