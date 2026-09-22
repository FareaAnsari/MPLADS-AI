"""
Integration and Unit Tests for Gap-Closing Intelligence Engines (Phases 1-11)
"""

import pytest
from fastapi.testclient import TestClient
import sys
import os

# Add backend and backend/app to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "app")))
from main import app

client = TestClient(app)

from routers.projects import WORK_RECORDS

def test_phase1_fund_flow_sankey():
    target_id = WORK_RECORDS[0]["work_id"]
    response = client.get(f"/api/v1/intelligence/fund-flow/{target_id}")
    assert response.status_code == 200
    data = response.json()
    assert "hops" in data
    assert "nodes" in data
    assert len(data["hops"]) == 4
    assert len(data["nodes"]) == 5
    assert data["nodes"][0]["category"] == "MINISTRY"


def test_phase3_satellite_imagery():
    target_id = WORK_RECORDS[0]["work_id"]
    response = client.get(f"/api/v1/satellite/imagery/{target_id}")
    assert response.status_code == 200
    data = response.json()
    assert "spectral_change_index" in data
    assert "disclaimer" in data


def test_phase4_rate_benchmarks():
    response = client.get("/api/v1/intelligence/rates/benchmarks")
    assert response.status_code == 200
    data = response.json()
    assert "benchmarks" in data
    assert len(data["benchmarks"]) > 0
    assert "CPWD" in data["data_source"]

    # Test evaluation
    eval_resp = client.post("/api/v1/intelligence/rates/evaluate", json={
        "work_category": "Civil Construction",
        "items": [
            {"item_name": "Cement (PPC 50kg bag)", "claimed_rate_inr": 620.0, "quantity": 100}
        ]
    })
    assert eval_resp.status_code == 200
    eval_data = eval_resp.json()
    assert eval_data["has_rate_anomalies"] is True


def test_phase5_entity_resolution():
    audit_resp = client.get("/api/v1/intelligence/entity-resolution/vendor-registry")
    assert audit_resp.status_code == 200
    audit_data = audit_resp.json()
    assert "vendor_clusters" in audit_data

    gst_resp = client.get("/api/v1/intelligence/entity-resolution/verify-gstin/10AAACB1234F1Z5")
    assert gst_resp.status_code == 200
    assert gst_resp.json()["is_valid_format"] is True


def test_phase6_cross_scheme():
    response = client.get("/api/v1/intelligence/cross-scheme/HERO-MPLADS-2024-001")
    assert response.status_code == 200
    data = response.json()
    assert "matched_schemes" in data
    assert "transparency_notice" in data


def test_phase7_grievance_nlp():
    response = client.get("/api/v1/intelligence/grievances/HERO-MPLADS-2024-001")
    assert response.status_code == 200
    data = response.json()
    assert "matched_grievances" in data
    assert "transparency_notice" in data


def test_phase8_dpr_similarity():
    response = client.get("/api/v1/intelligence/dpr-similarity/HERO-MPLADS-2024-001")
    assert response.status_code == 200
    data = response.json()
    assert "similarity_threshold" in data
    assert "audit_observation" in data


def test_phase9_election_velocity():
    response = client.get("/api/v1/intelligence/election-velocity/mp-001")
    assert response.status_code == 200
    data = response.json()
    assert "velocity_surge_detected" in data
    assert "transparency_notice" in data


def test_phase10_decay_monitor():
    response = client.get("/api/v1/intelligence/decay-monitor/HERO-MPLADS-2024-001")
    assert response.status_code == 200
    data = response.json()
    assert "integrity_score" in data
    assert "transparency_notice" in data


def test_phase11_pre_sanction_sandbox():
    response = client.post("/api/v1/intelligence/pre-sanction-simulate", json={
        "work_title": "Construction of High Density Rural Road",
        "work_category": "Roads & Bridges",
        "state": "Bihar",
        "district": "Araria",
        "estimated_cost_inr": 8500000.0,
        "proposed_duration_months": 18,
        "latitude": 26.1512,
        "longitude": 87.5215,
        "dpr_justification": "Construction of rural bituminous road connecting NH-57 to Raniganj."
    })
    assert response.status_code == 200
    data = response.json()
    assert data["is_simulation"] is True
    assert "PRE-SANCTION SIMULATION" in data["disclaimer"]
    assert "projected_risk_score" in data
    assert "peer_group_benchmark" in data
    assert len(data["pre_sanction_recommendations"]) > 0
