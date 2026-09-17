"""
Feature 5: Multi-Signal Evidence Triangulation Engine (Phase 3 Step 3)
Calculates multi-signal Verification Confidence score (0-100) per project.

Signals Evaluated:
1. Official Agency Claim (25% weight)
2. Citizen Mobile Verification (35% weight)
3. Photo Uniqueness & Duplication Check (25% weight)
4. Satellite Remote Sensing (15% weight)

Decoupled Design:
Verification Confidence is SEPARATE from Risk Score.
Missing evidence fields return '— UNAVAILABLE' status and NEVER penalize scores (Fairness Safeguard).
"""

from typing import Dict, Any, Optional, List


TRIANGULATION_ENGINE_VERSION = "v1.0.0"


class EvidenceTriangulationEngine:
    def evaluate_verification_confidence(
        self,
        project_id: str,
        has_agency_claim: bool = True,
        citizen_verification: Optional[Dict[str, Any]] = None,
        photo_similarity: Optional[Dict[str, Any]] = None,
        satellite_data: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Evaluates multi-signal verification confidence (0-100) across available inputs.
        """
        available_signals = []
        signal_details = {}
        missing_fields = []

        # 1. Agency Claim Signal
        if has_agency_claim:
            available_signals.append(("agency_claim", 25.0, 1.0))
            signal_details["agency_claim"] = {
                "status": "✅ SUPPORTS_CLAIM",
                "score_contrib": 25.0,
                "detail": "Official agency work recommendation & progress report recorded."
            }
        else:
            missing_fields.append("official_agency_claim")
            signal_details["agency_claim"] = {
                "status": "— UNAVAILABLE",
                "score_contrib": 0.0,
                "detail": "Agency report record unavailable."
            }

        # 2. Citizen Mobile Verification Signal
        if citizen_verification:
            is_valid = citizen_verification.get("is_valid", False)
            if is_valid:
                available_signals.append(("citizen_evidence", 35.0, 1.0))
                signal_details["citizen_evidence"] = {
                    "status": "✅ SUPPORTS_CLAIM",
                    "score_contrib": 35.0,
                    "detail": f"Verified via Citizen Mobile PWA live camera ({citizen_verification.get('distance_meters', 0.0):.1f}m from site)."
                }
            else:
                available_signals.append(("citizen_evidence", 35.0, 0.0))
                signal_details["citizen_evidence"] = {
                    "status": "❌ CONTRADICTS_CLAIM",
                    "score_contrib": 0.0,
                    "detail": citizen_verification.get("rejection_reason", "Citizen location discrepancy.")
                }
        else:
            missing_fields.append("citizen_live_camera")
            signal_details["citizen_evidence"] = {
                "status": "— UNAVAILABLE",
                "score_contrib": 0.0,
                "detail": "Citizen mobile evidence not yet submitted for this site."
            }

        # 3. Photo Similarity Signal
        if photo_similarity:
            is_dup = photo_similarity.get("is_duplicate", False)
            if is_dup:
                available_signals.append(("photo_uniqueness", 25.0, 0.0))
                signal_details["photo_uniqueness"] = {
                    "status": "❌ CONTRADICTS_CLAIM",
                    "score_contrib": 0.0,
                    "detail": f"Duplicate image detected! Matches {photo_similarity.get('matching_project_id')} ({photo_similarity.get('similarity_score_pct'):.1f}% similarity)."
                }
            else:
                available_signals.append(("photo_uniqueness", 25.0, 1.0))
                signal_details["photo_uniqueness"] = {
                    "status": "✅ SUPPORTS_CLAIM",
                    "score_contrib": 25.0,
                    "detail": "Perceptual hashing confirms image is unique and un-duplicated."
                }
        else:
            missing_fields.append("official_agency_photos")
            signal_details["photo_uniqueness"] = {
                "status": "— UNAVAILABLE",
                "score_contrib": 0.0,
                "detail": "No completion photo uploaded to eSAKSHI registry yet."
            }

        # 4. Satellite Data Signal
        if satellite_data:
            sat_status = satellite_data.get("status", "INCONCLUSIVE")
            if sat_status == "SUPPORTS":
                available_signals.append(("satellite", 15.0, 1.0))
                signal_details["satellite"] = {
                    "status": "✅ SUPPORTS_CLAIM",
                    "score_contrib": 15.0,
                    "detail": "Sentinel-2 remote sensing confirms structure/earthworks footprint."
                }
            elif sat_status == "CONTRADICTS":
                available_signals.append(("satellite", 15.0, 0.0))
                signal_details["satellite"] = {
                    "status": "❌ CONTRADICTS_CLAIM",
                    "score_contrib": 0.0,
                    "detail": "Satellite imagery shows bare ground without planned construction."
                }
            else:
                signal_details["satellite"] = {
                    "status": "🟡 INCONCLUSIVE",
                    "score_contrib": 0.0,
                    "detail": "Cloud cover limits remote sensing resolution."
                }
        else:
            missing_fields.append("satellite_imagery")
            signal_details["satellite"] = {
                "status": "— UNAVAILABLE",
                "score_contrib": 0.0,
                "detail": "High-resolution satellite pass unavailable for this coordinate."
            }

        # Normalize score over AVAILABLE SIGNALS ONLY (Fairness Safeguard)
        total_available_weight = sum(weight for _, weight, _ in available_signals)
        earned_weight = sum(weight * multiplier for _, weight, multiplier in available_signals)

        if total_available_weight > 0:
            final_confidence = round((earned_weight / total_available_weight) * 100.0, 1)
        else:
            final_confidence = 50.0  # Neutral baseline when zero independent evidence exists

        return {
            "project_id": project_id,
            "verification_confidence": final_confidence,
            "signal_weights": {
                "earned_weight": earned_weight,
                "total_available_weight": total_available_weight
            },
            "signals": signal_details,
            "missing_evidence_fields": missing_fields,
            "fairness_safeguard_note": (
                f"{len(missing_fields)} evidence sources unavailable. "
                "Unavailable fields were excluded from denominator and DID NOT penalize confidence score."
            )
        }
