"""
Feature 2: Peer Comparison Engine (Phase 2 Enhanced)
Builds contextual peer comparison cohorts based on:
1. Work Category (e.g., Roads, School Rooms, Community Halls)
2. State / Geography
3. Budget Tier (< ₹5L, ₹5L-20L, > ₹20L)
4. Fiscal Year (e.g., 2024-2025)

Calculates distributional statistics (mean, median, std, IQR, q25, q75).
Handles small peer groups (< 5 projects) by flagging them as INSUFFICIENT_PEER_DATA
and falling back to state/category macro statistics.
"""

import pandas as pd
import numpy as np
from typing import Dict, List, Any


class PeerComparisonEngine:
    MIN_PEER_SAMPLE_SIZE = 5

    @staticmethod
    def get_budget_tier(amount: float) -> str:
        """Determines project budget size band."""
        if amount <= 500000:
            return "TIER_1_SMALL (<5L)"
        elif amount <= 2000000:
            return "TIER_2_MEDIUM (5L-20L)"
        else:
            return "TIER_3_LARGE (>20L)"

    def build_peer_group_key(self, work_category: str, state: str, amount: float, fiscal_year: str = "2024-2025") -> str:
        """Constructs unique peer group key."""
        tier = self.get_budget_tier(amount)
        cat_clean = (work_category or "GENERAL").upper().strip().replace(" ", "_")
        st_clean = (state or "NATIONAL").upper().strip().replace(" ", "_")
        fy_clean = (fiscal_year or "2024-2025").strip()
        return f"{cat_clean}::{st_clean}::{tier}::{fy_clean}"

    def build_macro_fallback_key(self, work_category: str, state: str) -> str:
        """Macro fallback key (Category + State)."""
        cat_clean = (work_category or "GENERAL").upper().strip().replace(" ", "_")
        st_clean = (state or "NATIONAL").upper().strip().replace(" ", "_")
        return f"MACRO::{cat_clean}::{st_clean}"

    def compute_peer_benchmarks(self, projects: List[Dict[str, Any]]) -> Dict[str, Dict[str, Any]]:
        """Computes localized peer cohort statistics for all projects."""
        if not projects:
            return {}

        df = pd.DataFrame(projects)
        if "disbursed_amount_inr" not in df.columns:
            df["disbursed_amount_inr"] = df.get("sanctioned_amount_inr", 0)

        df["peer_key"] = df.apply(
            lambda r: self.build_peer_group_key(
                r.get("work_category", ""),
                r.get("state", ""),
                r.get("disbursed_amount_inr", 0),
                r.get("fiscal_year", "2024-2025")
            ),
            axis=1
        )
        
        df["macro_key"] = df.apply(
            lambda r: self.build_macro_fallback_key(
                r.get("work_category", ""),
                r.get("state", "")
            ),
            axis=1
        )

        benchmarks = {}

        # 1. Micro Peer Cohort benchmarks
        for key, group in df.groupby("peer_key"):
            amounts = group["disbursed_amount_inr"].values
            count = len(amounts)
            
            if count >= self.MIN_PEER_SAMPLE_SIZE:
                q25, q75 = np.percentile(amounts, [25, 75])
                mean_val = float(np.mean(amounts))
                std_val = float(np.std(amounts)) if count > 1 else 0.0
                median_val = float(np.median(amounts))
                iqr_val = float(q75 - q25)
                status = "SUFFICIENT_PEER_DATA"
            else:
                mean_val = float(np.mean(amounts))
                std_val = 0.0
                median_val = float(np.median(amounts))
                iqr_val = 0.0
                q25, q75 = mean_val, mean_val
                status = "INSUFFICIENT_PEER_DATA"

            benchmarks[key] = {
                "peer_group_id": key,
                "peer_status": status,
                "count": count,
                "mean": mean_val,
                "median": median_val,
                "std": std_val,
                "iqr": iqr_val,
                "q25": float(q25),
                "q75": float(q75)
            }

        # 2. Macro Fallback benchmarks (for small micro cohorts)
        for key, group in df.groupby("macro_key"):
            amounts = group["disbursed_amount_inr"].values
            count = len(amounts)
            q25, q75 = np.percentile(amounts, [25, 75])
            benchmarks[key] = {
                "peer_group_id": key,
                "peer_status": "MACRO_FALLBACK",
                "count": count,
                "mean": float(np.mean(amounts)),
                "median": float(np.median(amounts)),
                "std": float(np.std(amounts)) if count > 1 else 0.0,
                "iqr": float(q75 - q25),
                "q25": float(q25),
                "q75": float(q75)
            }

        return benchmarks

    def get_peer_stats(self, project: Dict[str, Any], benchmarks: Dict[str, Dict[str, Any]]) -> Dict[str, Any]:
        """
        Reusable service function returning peer group stats and project deviation.
        Handles small peer groups gracefully without generating false-confidence Z-scores.
        """
        amount = float(project.get("disbursed_amount_inr", 0) or project.get("sanctioned_amount_inr", 0))
        peer_key = self.build_peer_group_key(
            project.get("work_category", ""),
            project.get("state", ""),
            amount,
            project.get("fiscal_year", "2024-2025")
        )
        
        peer_info = benchmarks.get(peer_key)
        
        # If micro cohort has < 5 projects, fallback to macro cohort stats
        if not peer_info or peer_info["peer_status"] == "INSUFFICIENT_PEER_DATA":
            macro_key = self.build_macro_fallback_key(project.get("work_category", ""), project.get("state", ""))
            fallback_info = benchmarks.get(macro_key)
            
            if fallback_info:
                peer_info = {
                    **fallback_info,
                    "peer_group_id": peer_key,
                    "peer_status": "INSUFFICIENT_PEER_DATA_FALLBACK_APPLIED",
                    "note": f"Micro peer group had only {peer_info['count'] if peer_info else 0} records (<5 required). Used state/category macro benchmark."
                }
            else:
                peer_info = {
                    "peer_group_id": peer_key,
                    "peer_status": "NO_PEER_DATA",
                    "count": 1,
                    "mean": amount,
                    "median": amount,
                    "std": 0.0,
                    "iqr": 0.0,
                    "q25": amount,
                    "q75": amount,
                    "note": "No comparable peer data available in database."
                }

        # Calculate deviation metrics
        mean_val = peer_info["mean"]
        std_val = peer_info["std"]
        median_val = peer_info["median"]
        
        z_score = float((amount - mean_val) / std_val) if std_val > 0 else 0.0
        deviation_from_mean_pct = round(((amount - mean_val) / mean_val) * 100.0, 2) if mean_val > 0 else 0.0
        deviation_from_median_pct = round(((amount - median_val) / median_val) * 100.0, 2) if median_val > 0 else 0.0

        return {
            "project_id": project.get("id") or project.get("work_id"),
            "amount_inr": amount,
            "peer_stats": peer_info,
            "deviation": {
                "z_score": round(z_score, 2),
                "deviation_from_mean_pct": deviation_from_mean_pct,
                "deviation_from_median_pct": deviation_from_median_pct
            }
        }
