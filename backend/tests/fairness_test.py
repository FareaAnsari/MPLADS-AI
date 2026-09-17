"""
Phase 5 Step 5: Fairness Validation Test Suite
Tests whether the fairness safeguard prevents risk score inflation on sparse/low-evidence projects.

Constructs:
1. Full Evidence Cohort (50 projects with citizen photos + satellite data)
2. Low Evidence Cohort (50 projects with sparse/missing citizen photos + satellite data)

Executes fairness audit and outputs verification metrics.
"""

import os
import sys

# Add backend/app and backend to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../app')))
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from engines.risk_engine import AIRiskEngine
from engines.fairness_engine import FairnessSafeguardEngine
from engines.peer_comparison import PeerComparisonEngine


def run_fairness_validation():
    risk_engine = AIRiskEngine()
    fairness_engine = FairnessSafeguardEngine()

    peer_stats = {
        "cost_mean": 500000.0,
        "cost_std": 200000.0,
        "duration_mean": 180.0,
        "sample_size": 100
    }

    full_evidence_cohort = []
    low_evidence_cohort = []

    # Construct 50 controlled benchmark projects
    for i in range(50):
        base_project = {
            "work_id": f"TEST/FULL/{i+1}",
            "work_title": f"Test Project Full Evidence #{i+1}",
            "disbursed_amount_inr": 500000.0,
            "duration_days": 180.0,
            "is_march_rush": False,
            "spatial_risk_cluster_ratio": 0.10,
            "evidence_contradiction_flag": False,
            "has_official_images": True,
            "has_satellite_data": True
        }
        res = risk_engine.evaluate_project_risk(base_project, peer_stats)
        full_evidence_cohort.append(res)

        low_project = {
            "work_id": f"TEST/LOW/{i+1}",
            "work_title": f"Test Project Low Evidence Remote #{i+1}",
            "disbursed_amount_inr": 500000.0,
            "duration_days": 180.0,
            "is_march_rush": False,
            "spatial_risk_cluster_ratio": 0.10,
            "evidence_contradiction_flag": False,
            "has_official_images": False,  # Missing
            "has_satellite_data": False    # Missing
        }
        res_low = risk_engine.evaluate_project_risk(low_project, peer_stats)
        low_evidence_cohort.append(res_low)

    audit_result = fairness_engine.run_cohort_fairness_audit(full_evidence_cohort, low_evidence_cohort)
    return audit_result


if __name__ == "__main__":
    result = run_fairness_validation()
    print("=========================================================")
    print("       PRATYAKSH FAIRNESS SAFEGUARD TEST REPORT          ")
    print("=========================================================")
    print(f"Test Name: {result['test_name']}")
    print(f"Is Safeguard Passed: {result['is_fairness_safeguard_passed']}")
    print(f"Full Evidence Cohort Average Risk: {result['average_risk_full_evidence']}")
    print(f"Low Evidence Cohort Average Risk: {result['average_risk_low_evidence']}")
    print(f"Risk Score Bias Delta: {result['risk_score_bias_delta']}")
    print(f"Verdict: {result['fairness_verdict']}")
    print("=========================================================")
