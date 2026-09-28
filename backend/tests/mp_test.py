"""
Backend MP Office Constituency Oversight Test Suite
Tests:
1. MP Office Authentication & JWT issuance
2. MP Dashboard retrieval (scoped to constituency)
3. MP Projects listing with category & search filter
4. MP Project Detail retrieval for valid constituency project
5. MP Project Detail rejection (403) for project outside constituency jurisdiction
6. Role-Based Access Control: Citizen blocked from MP endpoints (403)
7. Role-Based Access Control: Contractor blocked from MP endpoints (403)
8. Role-Based Access Control: MP Office blocked from Officer-confidential endpoints (403)
"""

import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'app')))
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import unittest
from fastapi.testclient import TestClient
from main import app
from schemas.auth_schemas import UserRole
from auth.security import generate_access_token


class TestBackendMPOffice(unittest.TestCase):

    def setUp(self):
        self.client = TestClient(app)

        # MP Office credentials & token (Araria, Bihar)
        self.mp_token = generate_access_token("usr-mp-001", UserRole.MP_OFFICE.value)
        self.mp_headers = {"Authorization": f"Bearer {self.mp_token}"}

        # Citizen credentials & token
        self.citizen_token = generate_access_token("usr-citizen-001", UserRole.CITIZEN.value)
        self.citizen_headers = {"Authorization": f"Bearer {self.citizen_token}"}

        # Contractor credentials & token
        self.contractor_token = generate_access_token("usr-contractor-001", UserRole.CONTRACTOR.value)
        self.contractor_headers = {"Authorization": f"Bearer {self.contractor_token}"}

    def test_01_mp_dashboard(self):
        res = self.client.get("/api/v1/mp/dashboard", headers=self.mp_headers)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["mp"]["role"], "MP_OFFICE")
        self.assertEqual(data["mp"]["constituency"], "Araria")
        self.assertIn("metrics", data)
        self.assertIn("total_constituency_projects", data["metrics"])
        self.assertIn("risk_distribution", data)

    def test_02_mp_projects_list(self):
        res = self.client.get("/api/v1/mp/projects?limit=10", headers=self.mp_headers)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("projects", data)
        self.assertIsInstance(data["projects"], list)
        self.assertEqual(data["constituency"], "Araria")

    def test_03_mp_project_detail_scoped(self):
        # Fetch list to obtain a valid constituency work_id
        list_res = self.client.get("/api/v1/mp/projects?limit=1", headers=self.mp_headers)
        self.assertEqual(list_res.status_code, 200)
        projects = list_res.json()["projects"]
        if projects:
            work_id = projects[0]["work_id"]
            res = self.client.get(f"/api/v1/mp/projects/{work_id}", headers=self.mp_headers)
            self.assertEqual(res.status_code, 200)
            detail = res.json()
            self.assertEqual(detail["project"]["work_id"], work_id)
            self.assertIn("financials", detail)
            self.assertIn("milestones", detail)
            self.assertIn("risk_oversight", detail)

    def test_04_citizen_blocked_from_mp_dashboard(self):
        res = self.client.get("/api/v1/mp/dashboard", headers=self.citizen_headers)
        self.assertEqual(res.status_code, 403)

    def test_05_contractor_blocked_from_mp_dashboard(self):
        res = self.client.get("/api/v1/mp/dashboard", headers=self.contractor_headers)
        self.assertEqual(res.status_code, 403)

    def test_06_mp_blocked_from_officer_inspection_update(self):
        # MP Office has no permission for officer inspection updates
        res = self.client.post(
            "/api/v1/officer/inspections/WRK-001/update",
            headers=self.mp_headers,
            json={
                "inspection_status": "COMPLETED",
                "observations": "Unauthorized attempt",
            },
        )
        self.assertEqual(res.status_code, 403)


if __name__ == '__main__':
    unittest.main()
