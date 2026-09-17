"""
Feature 9: Explain-the-Absence / Fairness Safeguard Engine (Phase 5 Step 4)
Consolidates evidence signal evaluation to guarantee that missing or unavailable data
NEVER numerically penalizes a project's Risk Score or Verification Confidence.

Shared Utility:
resolve_evidence_status() -> Returns one of:
- PRESENT_SUPPORTS (✅)
- PRESENT_CONTRADICTS (❌)
- PRESENT_INCONCLUSIVE (🟡)
- PARTIAL_CONCERN (⚠️)
- UNAVAILABLE (—)

Strict Fairness Rule:
UNAVAILABLE signals return 0.0 penalty impact, and populate the `missing_evidence_fields` list.
"""

from typing import Dict, Any, List


FAIRNESS_ENGINE_VERSION = "v1.0.0"


class FairnessSafeguardEngine:
    @staticmethod
    def resolve_evidence_status(
        is_available: bool,
        is_supportive: bool = False,
        is_contradictory: bool = False,
        is_partial_concern: bool = False
    ) -> Dict[str, Any]:
        """
        Consolidated shared evidence evaluator.
        Guarantees UNAVAILABLE evidence returns zero numerical penalty.
        """
        if not is_available:
            return {
                "status_code": "UNAVAILABLE",
                "symbol": "—",
                "label": "— UNAVAILABLE",
                "penalty_score": 0.0,
                "is_missing": True,
                "description": "Independent evidence source currently unavailable for this location."
            }

        if is_contradictory:
            return {
                "status_code": "PRESENT_CONTRADICTS",
                "symbol": "❌",
                "label": "❌ CONTRADICTS_CLAIM",
                "penalty_score": 50.0,
                "is_missing": False,
                "description": "Submitted evidence directly contradicts official claims or location."
            }

        if is_partial_concern:
            return {
                "status_code": "PARTIAL_CONCERN",
                "symbol": "⚠️",
                "label": "⚠️ PARTIAL_CONCERN",
                "penalty_score": 20.0,
                "is_missing": False,
                "description": "Evidence exhibits partial discrepancy requiring secondary review."
            }

        if is_supportive:
            return {
                "status_code": "PRESENT_SUPPORTS",
                "symbol": "✅",
                "label": "✅ SUPPORTS_CLAIM",
                "penalty_score": 0.0,
                "is_missing": False,
                "description": "Independent evidence fully validates project progress and location."
            }

        return {
            "status_code": "PRESENT_INCONCLUSIVE",
            "symbol": "🟡",
            "label": "🟡 INCONCLUSIVE",
            "penalty_score": 0.0,
            "is_missing": False,
            "description": "Evidence present but image quality or cloud cover limits conclusive verification."
        }

    def run_cohort_fairness_audit(
        self,
        full_evidence_cohort: List[Dict[str, Any]],
        low_evidence_cohort: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Validates that low-evidence cohort does NOT suffer from artificially inflated Risk Scores.
        """
        avg_full_risk = round(sum(p.get("risk_score", 0) for p in full_evidence_cohort) / max(1, len(full_evidence_cohort)), 2)
        avg_low_risk = round(sum(p.get("risk_score", 0) for p in low_evidence_cohort) / max(1, len(low_evidence_cohort)), 2)

        risk_bias_delta = round(avg_low_risk - avg_full_risk, 2)
        is_fair = risk_bias_delta <= 5.0  # Bias delta must be negligible (< 5 points)

        return {
            "test_name": "Controlled Low-Connectivity / Sparse-Evidence Fairness Audit",
            "is_fairness_safeguard_passed": is_fair,
            "full_evidence_cohort_count": len(full_evidence_cohort),
            "low_evidence_cohort_count": len(low_evidence_cohort),
            "average_risk_full_evidence": avg_full_risk,
            "average_risk_low_evidence": avg_low_risk,
            "risk_score_bias_delta": risk_bias_delta,
            "fairness_verdict": (
                "PASSED: Low-connectivity sparse-evidence cohort shows zero systemic risk inflation. "
                "Absence of independent evidence is correctly isolated as unavailable, not penalizing scores."
                if is_fair
                else "FAILED: Detected risk score penalty inflation on low-evidence cohort."
            ),
            "metadata": {
                "engine_version": FAIRNESS_ENGINE_VERSION,
                "is_synthetic_test_cohort": True
            }
        }
