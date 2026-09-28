"""
Backend Notifications Test Suite
Tests:
1. Device registration and multi-device management
2. Device unregistration on logout
3. User-scoped notification listing
4. Category filtering
5. Unread count calculation
6. Mark notification as read (with user ownership enforcement)
7. Security rejection when attempting to mark another user's notification as read
8. Notification preferences retrieval and update
"""

import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'app')))
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import unittest
from fastapi.testclient import TestClient
from main import app
from auth.user_store import user_db
from schemas.auth_schemas import UserRole
from auth.security import generate_access_token


class TestBackendNotifications(unittest.TestCase):

    def setUp(self):
        self.client = TestClient(app)
        
        # Officer credentials & token
        self.officer_token = generate_access_token("usr-officer-001", UserRole.DISTRICT_OFFICER.value)
        self.officer_headers = {"Authorization": f"Bearer {self.officer_token}"}
        
        # Citizen credentials & token
        self.citizen_token = generate_access_token("usr-citizen-001", UserRole.CITIZEN.value)
        self.citizen_headers = {"Authorization": f"Bearer {self.citizen_token}"}

    def test_01_device_registration(self):
        res = self.client.post(
            "/api/v1/notifications/devices",
            headers=self.officer_headers,
            json={
                "push_token": "ExponentPushToken[test-officer-token]",
                "device_id": "test-device-uuid-001",
                "platform": "ios",
                "app_version": "1.0.0",
            },
        )
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["status"], "REGISTERED")
        self.assertEqual(data["device_id"], "test-device-uuid-001")

    def test_02_device_unregistration_on_logout(self):
        res = self.client.delete(
            "/api/v1/notifications/devices/test-device-uuid-001",
            headers=self.officer_headers,
        )
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["status"], "UNREGISTERED")

    def test_03_notification_feed_scoping(self):
        # Citizen feed should contain citizen notifications
        res_cit = self.client.get("/api/v1/notifications", headers=self.citizen_headers)
        self.assertEqual(res_cit.status_code, 200)
        cit_notifs = res_cit.json()
        self.assertIsInstance(cit_notifs, list)
        self.assertGreaterEqual(len(cit_notifs), 1)
        for n in cit_notifs:
            self.assertIn(n["role"], ["CITIZEN", "ALL"])

        # Officer feed should contain officer notifications
        res_off = self.client.get("/api/v1/notifications", headers=self.officer_headers)
        self.assertEqual(res_off.status_code, 200)
        off_notifs = res_off.json()
        self.assertIsInstance(off_notifs, list)
        self.assertGreaterEqual(len(off_notifs), 1)
        for n in off_notifs:
            self.assertIn(n["role"], ["DISTRICT_OFFICER", "ALL"])

    def test_04_category_filtering(self):
        res = self.client.get(
            "/api/v1/notifications?category=RISK",
            headers=self.officer_headers,
        )
        self.assertEqual(res.status_code, 200)
        risk_notifs = res.json()
        for n in risk_notifs:
            self.assertEqual(n["category"], "RISK")

    def test_05_unread_count(self):
        res = self.client.get("/api/v1/notifications/unread-count", headers=self.officer_headers)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("unread_count", data)
        self.assertIsInstance(data["unread_count"], int)

    def test_06_mark_notification_as_read(self):
        # Officer marks own notification as read
        res = self.client.post(
            "/api/v1/notifications/notif-off-001/read",
            headers=self.officer_headers,
        )
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIsNotNone(data["read_at"])

    def test_07_unauthorized_mark_read_rejection(self):
        # Citizen attempts to mark an officer's notification as read -> 403 Forbidden
        res = self.client.post(
            "/api/v1/notifications/notif-off-002/read",
            headers=self.citizen_headers,
        )
        self.assertEqual(res.status_code, 403)

    def test_08_notification_preferences(self):
        # Get default preferences
        res_get = self.client.get("/api/v1/notifications/preferences", headers=self.citizen_headers)
        self.assertEqual(res_get.status_code, 200)
        prefs = res_get.json()
        self.assertTrue(prefs["push_enabled"])

        # Update preferences
        res_put = self.client.put(
            "/api/v1/notifications/preferences",
            headers=self.citizen_headers,
            json={
                "push_enabled": True,
                "evidence_updates": True,
                "risk_alerts": False,
                "sla_alerts": False,
                "inspection_updates": False,
                "project_milestones": True,
            },
        )
        self.assertEqual(res_put.status_code, 200)
        updated = res_put.json()
        self.assertFalse(updated["risk_alerts"])
        self.assertTrue(updated["evidence_updates"])


if __name__ == '__main__':
    unittest.main()
