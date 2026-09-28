import os
import sys
import pytest
from fastapi.testclient import TestClient

# Add app and backend directories to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../app')))
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from main import app

client = TestClient(app)

P1_ID = "WS/MP418/2024-2025/133409"      # Bihar project
P2_ID = "WS/MP18152/2024-2025/133691"    # Punjab project


def test_risk_assessment_endpoint_p1_bihar():
    """Verify live computed risk assessment for Bihar project."""
    response = client.get(f"/api/projects/{P1_ID}/risk-assessment")
    assert response.status_code == 200
    data = response.json()
    
    assert data["work_id"] == P1_ID
    assert data["state"] == "Bihar"
    assert "risk_score" in data
    assert "component_breakdown" in data
    assert "explainable_reasons" in data
    assert len(data["explainable_reasons"]) > 0
    assert any("Bihar" in r for r in data["explainable_reasons"])


def test_risk_assessment_endpoint_p2_punjab():
    """Verify live computed risk assessment for Punjab project."""
    response = client.get(f"/api/projects/{P2_ID}/risk-assessment")
    assert response.status_code == 200
    data = response.json()
    
    assert data["work_id"] == P2_ID
    assert data["state"] == "Punjab"
    assert "risk_score" in data
    assert "component_breakdown" in data
    assert "explainable_reasons" in data
    assert len(data["explainable_reasons"]) > 0
    assert any("Punjab" in r for r in data["explainable_reasons"])


def test_bihar_and_punjab_produce_different_live_outputs():
    """Prove that Bihar and Punjab projects produce DIFFERENT scores and reasons."""
    r1 = client.get(f"/api/projects/{P1_ID}/risk-assessment").json()
    r2 = client.get(f"/api/projects/{P2_ID}/risk-assessment").json()

    # Scores must be computed from different real data
    assert r1["risk_score"] != r2["risk_score"]
    assert r1["component_breakdown"]["cost_anomaly"] != r2["component_breakdown"]["cost_anomaly"]
    assert r1["explainable_reasons"] != r2["explainable_reasons"]


def test_peer_comparison_endpoint_cohort_variance():
    """Prove that peer statistics reflect genuine cohort distributions."""
    r1 = client.get(f"/api/projects/{P1_ID}/peer-comparison").json()
    r2 = client.get(f"/api/projects/{P2_ID}/peer-comparison").json()

    assert r1["peer_stats"]["peer_group_id"] != r2["peer_stats"]["peer_group_id"]
    assert r1["peer_stats"]["median"] != r2["peer_stats"]["median"]
    assert r1["peer_stats"]["mean"] != r2["peer_stats"]["mean"]
    assert r1["deviation"]["deviation_from_median_pct"] != r2["deviation"]["deviation_from_median_pct"]
    assert len(r1["material_benchmarks"]) > 0


def test_officer_decision_persistence_lifecycle():
    """Prove officer decision writes to database and is retrieved on subsequent requests."""
    decision_payload = {
        "decision": "CONFIRM_ISSUE",
        "notes": "Automated integration test verified on-site MB discrepancy.",
        "officer_id": "TEST-OFFICER-42",
        "officer_name": "Executive Verification Inspector"
    }

    # 1. Post decision
    post_res = client.post(f"/api/projects/{P1_ID}/decision", json=decision_payload)
    assert post_res.status_code == 200
    res_data = post_res.json()
    assert res_data["status"] == "SUCCESS"
    assert res_data["decision"]["decision"] == "CONFIRM_ISSUE"

    # 2. Retrieve decision
    get_res = client.get(f"/api/projects/{P1_ID}/decision")
    assert get_res.status_code == 200
    history = get_res.json()
    assert history["total_decisions"] >= 1
    assert history["latest_decision"]["decision"] == "CONFIRM_ISSUE"
    assert history["latest_decision"]["notes"] == decision_payload["notes"]
    assert history["latest_decision"]["officer_id"] == "TEST-OFFICER-42"
