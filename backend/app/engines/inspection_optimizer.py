"""
Feature 7: Inspection Resource Optimizer Engine (Phase 4 Step 2)
Greedy / heuristic multi-objective optimization algorithm for field inspection allocation.

Configurable Named Weights:
- WEIGHT_RISK = 0.40 (Phase 2 Risk Score contribution)
- WEIGHT_CONFIDENCE_GAP = 0.30 (Phase 3 Verification Confidence gap contribution: 100 - vert_conf)
- WEIGHT_PROJECT_VALUE = 0.20 (Disbursed amount value contribution)
- WEIGHT_DISTANCE_PENALTY = 0.10 (Travel distance penalty from inspector base)

Greedy Nearest-Neighbor Routing:
Assigns projects to inspectors by jurisdiction, scores composite priority, and orders
visits in a geographically sensible sequence within weekly capacity limits (e.g. 8/week).
"""

import math
from typing import Dict, List, Any


OPTIMIZER_ENGINE_VERSION = "v1.0.0"


class InspectionOptimizerEngine:
    WEIGHT_RISK: float = 0.40
    WEIGHT_CONFIDENCE_GAP: float = 0.30
    WEIGHT_PROJECT_VALUE: float = 0.20
    WEIGHT_DISTANCE_PENALTY: float = 0.10

    @staticmethod
    def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """Geodesic distance in kilometers between two lat/lon points."""
        R = 6371.0
        dlat = math.radians(lat2 - lat1)
        dlon = math.radians(lon2 - lon1)
        a = (math.sin(dlat / 2) ** 2) + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * (math.sin(dlon / 2) ** 2)
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        return R * c

    def compute_composite_priority(
        self,
        risk_score: float,
        verification_confidence: float,
        disbursed_amount: float,
        distance_km: float
    ) -> Dict[str, Any]:
        """
        Computes composite priority score with explicit factor reasoning breakdown.
        """
        risk_contrib = round(risk_score * self.WEIGHT_RISK, 2)
        confidence_gap = max(0.0, 100.0 - verification_confidence)
        conf_contrib = round(confidence_gap * self.WEIGHT_CONFIDENCE_GAP, 2)
        value_score = min(100.0, (disbursed_amount / 2500000.0) * 100.0)
        value_contrib = round(value_score * self.WEIGHT_PROJECT_VALUE, 2)
        dist_penalty_score = min(100.0, (distance_km / 50.0) * 100.0)
        dist_penalty = round(dist_penalty_score * self.WEIGHT_DISTANCE_PENALTY, 2)

        composite_score = round(risk_contrib + conf_contrib + value_contrib - dist_penalty, 2)
        composite_score = max(0.0, min(100.0, composite_score))

        reasoning = (
            f"Priority Score {composite_score:.1f}: High risk (+{risk_contrib:.1f}), "
            f"low verification confidence gap (+{conf_contrib:.1f}), "
            f"high project value (+{value_contrib:.1f}), distance penalty (-{dist_penalty:.1f})."
        )

        return {
            "composite_priority_score": composite_score,
            "reasoning_summary": reasoning,
            "factor_breakdown": {
                "risk_contribution": risk_contrib,
                "confidence_gap_contribution": conf_contrib,
                "value_contribution": value_contrib,
                "distance_penalty": dist_penalty
            }
        }

    def generate_inspector_route(
        self,
        inspector: Dict[str, Any],
        candidate_projects: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Assigns and orders projects for a single inspector using greedy nearest-neighbor clustering.
        """
        base_lat = inspector["base_lat"]
        base_lon = inspector["base_lon"]
        capacity = inspector.get("max_weekly_capacity", 8)
        state_jurisdiction = inspector.get("jurisdiction_state", "")

        jurisdiction_candidates = [
            p for p in candidate_projects
            if not state_jurisdiction or state_jurisdiction.lower() in p.get("state", "").lower()
        ]

        if not jurisdiction_candidates:
            jurisdiction_candidates = candidate_projects[:20]

        scored_candidates = []
        for p in jurisdiction_candidates:
            p_lat = p.get("latitude", base_lat)
            p_lon = p.get("longitude", base_lon)
            dist_km = self.haversine_km(base_lat, base_lon, p_lat, p_lon)

            r_score = p.get("risk_score", 40.0)
            v_conf = p.get("verification_confidence", 50.0)
            disbursed = p.get("disbursed_amount_inr", 500000.0)

            p_analysis = self.compute_composite_priority(r_score, v_conf, disbursed, dist_km)

            scored_candidates.append({
                "project_id": p.get("id") or p.get("work_id"),
                "work_id": p.get("work_id"),
                "work_title": p.get("work_title"),
                "state": p.get("state"),
                "constituency": p.get("constituency"),
                "disbursed_amount_inr": disbursed,
                "risk_score": r_score,
                "verification_confidence": v_conf,
                "distance_from_base_km": round(dist_km, 2),
                "latitude": p_lat,
                "longitude": p_lon,
                "priority_analysis": p_analysis
            })

        scored_candidates.sort(key=lambda x: x["priority_analysis"]["composite_priority_score"], reverse=True)
        top_candidates = scored_candidates[:capacity]

        current_lat, current_lon = base_lat, base_lon
        remaining = list(top_candidates)
        ordered_route = []

        visit_order = 1
        while remaining:
            nearest_idx = min(
                range(len(remaining)),
                key=lambda i: self.haversine_km(current_lat, current_lon, remaining[i]["latitude"], remaining[i]["longitude"])
            )
            next_stop = remaining.pop(nearest_idx)
            
            leg_dist = self.haversine_km(current_lat, current_lon, next_stop["latitude"], next_stop["longitude"])
            next_stop["visit_order_rank"] = visit_order
            next_stop["leg_distance_km"] = round(leg_dist, 2)
            
            ordered_route.append(next_stop)
            current_lat, current_lon = next_stop["latitude"], next_stop["longitude"]
            visit_order += 1

        total_route_distance_km = round(sum(stop["leg_distance_km"] for stop in ordered_route), 2)

        return {
            "inspector_id": inspector["inspector_id"],
            "inspector_name": inspector["name"],
            "jurisdiction_state": state_jurisdiction,
            "base_location": {"lat": base_lat, "lon": base_lon},
            "capacity_summary": {
                "max_weekly_capacity": capacity,
                "assigned_inspections": len(ordered_route),
                "capacity_utilization_pct": round((len(ordered_route) / capacity) * 100.0, 1)
            },
            "total_route_distance_km": total_route_distance_km,
            "assigned_route": ordered_route,
            "provenance": {
                "source": inspector.get("source", "Synthetic Inspector Roster"),
                "is_synthetic": inspector.get("is_synthetic", True)
            }
        }
