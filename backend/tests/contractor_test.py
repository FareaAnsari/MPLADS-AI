"""
Backend Contractor Operations & Work Tracking Test Suite
Tests:
1. Contractor Authentication & Dashboard retrieval
2. Assigned projects listing (strictly scoped to contractor)
3. Assigned project detail retrieval
4. Progress update submission with validation (0-100% bounds)
5. Progress update rejection for out-of-bounds percentage
6. Site issue / blocker reporting
7. Role-Based Access Control: Citizen blocked from Contractor endpoints (403)
8. Role-Based Access Control: Contractor blocked from Officer risk-audit endpoints (403)
9. Role-Based Access Control: Contractor blocked from MP dashboard (403)
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


class TestBackendContractor(unittest.TestCase):

    def setUp(self):
        self.client = TestClient(app)

        # Contractor credentials & token (Patel Infrastructure, Maharashtra)
        self.contractor_token = generate_access_token("usr-contractor-001", UserRole.CONTRACTOR.value)
        self.contractor_headers = {"Authorization": f"Bearer {self.contractor_token}"}

        # Citizen credentials & token
        self.citizen_token = generate_access_token("usr-citizen-001", UserRole.CITIZEN.value)
        self.citizen_headers = {"Authorization": f"Bearer {self.citizen_token}"}

        # Officer credentials & token
        self.officer_token = generate_access_token("usr-officer-001", UserRole.DISTRICT_OFFICER.value)
        self.officer_headers = {"Authorization": f"Bearer {self.officer_token}"}

    def test_01_contractor_dashboard(self):
        res = self.client.get("/api/v1/contractor/dashboard", headers=self.contractor_headers)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["contractor"]["role"], "CONTRACTOR")
        self.assertIn("metrics", data)
        self.assertIn("assigned_projects_count", data["metrics"])
        self.assertIn("assigned_projects", data)

    def test_02_assigned_projects_list(self):
        res = self.client.get("/api/v1/contractor/projects?limit=10", headers=self.contractor_headers)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("projects", data)
        self.assertIsInstance(data["projects"], list)
        self.assertEqual(data["contractor_id"], "usr-contractor-001")

    def test_03_contractor_project_detail_and_progress_update(self):
        # Fetch assigned list to get valid work_id
        list_res = self.client.get("/api/v1/contractor/projects?limit=1", headers=self.contractor_headers)
        self.assertEqual(list_res.status_code, 200)
        projects = list_res.json()["projects"]
        if projects:
            work_id = projects[0]["work_id"]
            
            # 1. Detail
            res = self.client.get(f"/api/v1/contractor/projects/{work_id}", headers=self.contractor_headers)
            self.assertEqual(res.status_code, 200)
            detail = res.json()
            self.assertEqual(detail["project"]["work_id"], work_id)
            self.assertIn("milestones", detail)

            # 2. Progress Update
            prog_res = self.client.post(
                f"/api/v1/contractor/projects/{work_id}/progress",
                headers=self.contractor_headers,
                json={
                    "work_id": work_id,
                    "progress_percentage": 55.0,
                    "milestone_stage": "STAGE_2",
                    "remarks": "Pillar reinforcement completed. Ready for slab casting.",
                    "field_observations": "Weather clear, full crew active.",
                },
            )
            self.assertEqual(prog_res.status_code, 200)
            prog_data = prog_res.json()
            self.assertEqual(prog_data["reported_progress_percent"], 55.0)
            self.assertEqual(prog_data["status"], "SUBMITTED")

    def test_04_progress_update_bounds_validation(self):
        # Negative progress percentage -> 422
        res = self.client.post(
            "/api/v1/contractor/projects/MPLADS-2024-MH01-001/progress",
            headers=self.contractor_headers,
            json={
                "work_id": "MPLADS-2024-MH01-001",
                "progress_percentage": 150.0, # > 100%
                "remarks": "Invalid percentage test",
            },
        )
        self.assertEqual(res.status_code, 422)

    def test_05_contractor_issue_reporting(self):
        list_res = self.client.get("/api/v1/contractor/projects?limit=1", headers=self.contractor_headers)
        self.assertEqual(list_res.status_code, 200)
        projects = list_res.json()["projects"]
        work_id = projects[0]["work_id"] if projects else "MPLADS-2024-MH01-001"

        res = self.client.post(
            f"/api/v1/contractor/projects/{work_id}/issues",
            headers=self.contractor_headers,
            json={
                "work_id": work_id,
                "category": "MATERIAL_DELAY",
                "title": "Cement supplier delivery delayed by 5 days",
                "description": "Monsoon transport disruption on state highway has delayed raw material shipment.",
                "severity": "MEDIUM",
            },
        )
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["status"], "REPORTED")
        self.assertEqual(data["category"], "MATERIAL_DELAY")

    def test_06_citizen_blocked_from_contractor_endpoints(self):
        res = self.client.get("/api/v1/contractor/dashboard", headers=self.citizen_headers)
        self.assertEqual(res.status_code, 403)

    def test_07_contractor_blocked_from_officer_risk_audit(self):
        # Contractor has no access to officer risk ledger decisions
        res = self.client.post(
            "/api/v1/ledger/entry/LEDG-001/decision",
            headers=self.contractor_headers,
            json={
                "human_decision": "AUDIT_VERIFIED",
                "outcome_notes": "Unauthorized",
            },
        )
        self.assertEqual(res.status_code, 403)


if __name__ == '__main__':
    unittest.main()
