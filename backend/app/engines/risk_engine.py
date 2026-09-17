"""
Feature 1: AI Risk Engine Core (Phase 2)
Computes explainable, additive composite Risk Score (0-100) per project.

Scoring Components (Additive, sum up to 100):
1. Cost Anomaly Component (Weight: 25%) - Statistical Z-Score / IQR deviation from peer cohort budget
2. Delay Anomaly Component (Weight: 25%) - Execution timeline vs peer cohort duration benchmark
3. Payment Pattern Component (Weight: 25%) - Fiscal rush detection (e.g. March disbursement spikes)
4. Spatial Signal Component (Weight: 15%) - Geographic risk density / high-risk neighbor proximity
5. Evidence Issue Component (Weight: 10%) - Contradictory evidence (Never penalizes missing data)

Isolation Forest Integration:
Provides un-supervised outlier anomaly probability score as an auxiliary signal.
"""

import numpy as np
from typing import Dict, Any, List, Optional
from sklearn.ensemble import IsolationForest


RISK_ENGINE_VERSION = "v1.0.0"
RULES_VERSION = "v1.2.0-sih2026"


class AIRiskEngine:
    def __init__(self):
        self.iso_forest: Optional[IsolationForest] = None
        self.is_fitted = False

    def fit_isolation_forest(self, feature_matrix: np.ndarray):
        """Fits unsupervised Isolation Forest model on historical project features."""
        if len(feature_matrix) > 0:
            self.iso_forest = IsolationForest(contamination=0.1, random_state=42)
            self.iso_forest.fit(feature_matrix)
            self.is_fitted = True

    def calculate_cost_anomaly_score(self, project: Dict[str, Any], peer_stats: Dict[str, Any]) -> float:
        """Calculates budget deviation relative to peer cohort mean & std dev."""
        disbursed = float(project.get("disbursed_amount_inr", 0) or 0)
        mean_cost = float(peer_stats.get("cost_mean", 500000.0))
        std_cost = float(peer_stats.get("cost_std", 200000.0))

        if std_cost == 0:
            return 0.0

        z_score = (disbursed - mean_cost) / std_cost
        if z_score <= 1.0:
            return 0.0
        elif z_score <= 2.0:
            return 40.0
        elif z_score <= 3.0:
            return 75.0
        else:
            return 100.0

    def calculate_delay_anomaly_score(self, project: Dict[str, Any], peer_stats: Dict[str, Any]) -> float:
        """Calculates timeline delay relative to peer cohort duration benchmark."""
        duration = float(project.get("duration_days", 0) or 0)
        mean_duration = float(peer_stats.get("duration_mean", 180.0))

        if mean_duration == 0:
            return 0.0

        ratio = duration / mean_duration
        if ratio <= 1.2:
            return 0.0
        elif ratio <= 1.5:
            return 50.0
        elif ratio <= 2.0:
            return 80.0
        else:
            return 100.0

    def calculate_payment_pattern_score(self, project: Dict[str, Any]) -> float:
        """Flags fiscal rush patterns (e.g. >70% disbursements occurring in March)."""
        is_march_rush = bool(project.get("is_march_rush", False))
        disbursement_ratio = float(project.get("fiscal_rush_ratio", 0.0) or 0.0)

        if is_march_rush or disbursement_ratio > 0.70:
            return 85.0
        elif disbursement_ratio > 0.50:
            return 40.0
        return 0.0

    def calculate_spatial_signal_score(self, project: Dict[str, Any]) -> float:
        """Calculates risk density based on high-risk geographic clustering."""
        nearby_risk_ratio = float(project.get("spatial_risk_cluster_ratio", 0.0) or 0.0)
        return min(100.0, nearby_risk_ratio * 100.0)

    def calculate_evidence_issue_score(self, project: Dict[str, Any]) -> float:
        """
        Calculates score based ON CONTRADICTORY EVIDENCE ONLY.
        NEVER penalizes missing or unavailable evidence (Fairness Safeguard).
        """
        has_contradiction = bool(project.get("evidence_contradiction_flag", False))
        if has_contradiction:
            return 100.0
        return 0.0

    def evaluate_project_risk(self, project: Dict[str, Any], peer_stats: Dict[str, Any]) -> Dict[str, Any]:
        """
        Evaluates project risk and produces explainable additive component breakdown.
        """
        cost_score = self.calculate_cost_anomaly_score(project, peer_stats)
        delay_score = self.calculate_delay_anomaly_score(project, peer_stats)
        payment_score = self.calculate_payment_pattern_score(project)
        spatial_score = self.calculate_spatial_signal_score(project)
        evidence_score = self.calculate_evidence_issue_score(project)

        # Explicit Weighted Additive Formula
        composite_score = round(
            (0.25 * cost_score) +
            (0.25 * delay_score) +
            (0.25 * payment_score) +
            (0.15 * spatial_score) +
            (0.10 * evidence_score),
            2
        )

        iso_score = 0.0
        if self.is_fitted and self.iso_forest:
            features = np.array([[cost_score, delay_score, payment_score, spatial_score, evidence_score]])
            decision = self.iso_forest.decision_function(features)[0]
            iso_score = float(round((1.0 - decision) * 50.0, 2))

        # Flag mapping
        if composite_score >= 70.0:
            flag = "POTENTIAL_ANOMALY"
        elif composite_score >= 40.0:
            flag = "REQUIRES_VERIFICATION"
        elif cost_score >= 75.0:
            flag = "HIGH_RISK_COST_DEVIATION"
        else:
            flag = "NORMAL"

        # Explicit top contributing factor identification
        factors = {
            "Cost Anomaly": 0.25 * cost_score,
            "Timeline Delay": 0.25 * delay_score,
            "Payment Pattern": 0.25 * payment_score,
            "Spatial Signal": 0.15 * spatial_score,
            "Evidence Issues": 0.10 * evidence_score
        }
        top_factor = max(factors, key=factors.get)

        # Missing evidence fields explicit tracking
        missing_evidence = []
        if not project.get("has_official_images", False):
            missing_evidence.append("official_agency_photos")
        if not project.get("has_satellite_data", False):
            missing_evidence.append("satellite_imagery")

        return {
            "work_id": project.get("work_id", "UNKNOWN"),
            "work_title": project.get("work_title", "Untitled Work"),
            "state": project.get("state", "India"),
            "constituency": project.get("constituency", "N/A"),
            "disbursed_amount_inr": float(project.get("disbursed_amount_inr", 0) or 0),
            "risk_score": composite_score,
            "anomaly_flag": flag,
            "top_contributing_factor": top_factor,
            "component_breakdown": {
                "cost_anomaly": round(cost_score, 2),
                "delay_anomaly": round(delay_score, 2),
                "payment_pattern": round(payment_score, 2),
                "spatial_signal": round(spatial_score, 2),
                "evidence_issue": round(evidence_score, 2),
                "isolation_forest_auxiliary_score": iso_score
            },
            "missing_evidence_fields": missing_evidence,
            "engine_metadata": {
                "model_version": RISK_ENGINE_VERSION,
                "rules_version": RULES_VERSION,
                "peer_cohort_sample_size": peer_stats.get("sample_size", 0)
            },
            "provenance": {
                "source": project.get("source", "eSAKSHI Official Public Export"),
                "source_type": project.get("source_type", "OFFICIAL_PUBLIC"),
                "is_synthetic": project.get("is_synthetic", False)
            }
        }
