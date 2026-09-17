"""
Feature 6: Stage-Wise Bottleneck / SLA Analyzer Engine (Phase 4 Step 1)
Identifies workflow stage delays comparing actual duration against benchmark SLAs.
Uses strictly role / stage / office language (e.g., "District review stage exceeded expected time by 4.1×").
Never outputs individual official names.

Outputs:
1. Primary bottleneck stage (largest SLA deviation multiple)
2. Complete stage-by-stage actual vs expected breakdown
3. In-progress elapsed SLA tracking
"""

from typing import Dict, Any, List
from adapters.synthetic_process_data import STAGE_BENCHMARKS


SLA_ANALYZER_VERSION = "v1.0.0"


class SLABottleneckAnalyzer:
    def analyze_project_bottleneck(
        self,
        project_id: str,
        stage_history: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Analyzes full stage history and identifies the primary bottleneck stage.
        """
        if not stage_history:
            return {
                "project_id": project_id,
                "has_bottleneck": False,
                "primary_bottleneck": None,
                "stage_breakdown": [],
                "summary": "Stage history workflow data currently unavailable."
            }

        analyzed_stages = []
        max_deviation_multiple = 0.0
        primary_bottleneck = None

        for item in stage_history:
            stage_key = item.get("stage_key", "UNKNOWN")
            bm_days = item.get("benchmark_days", 30.0)
            actual_days = item.get("actual_duration_days", 0.0)
            delay_ratio = item.get("delay_ratio", round(actual_days / bm_days, 2) if bm_days > 0 else 1.0)
            role = item.get("responsible_role", STAGE_BENCHMARKS.get(stage_key, {}).get("role", "District Authority Division"))

            is_bottleneck = delay_ratio >= 2.0

            stage_info = {
                "stage_key": stage_key,
                "stage_name": item.get("stage_name", stage_key.replace("_", " ").title()),
                "actual_duration_days": actual_days,
                "benchmark_days": bm_days,
                "delay_ratio": delay_ratio,
                "responsible_role": role,
                "is_bottleneck": is_bottleneck,
                "status_text": (
                    f"{item.get('stage_name', stage_key)} stage handled by {role} exceeded expected time by {delay_ratio:.1f}× ({actual_days:.0f} days vs expected {bm_days:.0f} days)."
                    if is_bottleneck
                    else f"{item.get('stage_name', stage_key)} within expected SLA ({actual_days:.0f} days vs {bm_days:.0f} days)."
                )
            }

            analyzed_stages.append(stage_info)

            if delay_ratio > max_deviation_multiple and is_bottleneck:
                max_deviation_multiple = delay_ratio
                primary_bottleneck = stage_info

        if primary_bottleneck:
            summary = f"Primary workflow bottleneck identified: {primary_bottleneck['stage_name']} handled by {primary_bottleneck['responsible_role']} exceeded benchmark SLA by {primary_bottleneck['delay_ratio']}× ({primary_bottleneck['actual_duration_days']:.0f} days vs expected {primary_bottleneck['benchmark_days']:.0f} days)."
        else:
            summary = "All completed workflow stages progressed within expected SLA benchmark timelines."

        return {
            "project_id": project_id,
            "has_bottleneck": bool(primary_bottleneck),
            "max_deviation_multiple": max_deviation_multiple,
            "primary_bottleneck": primary_bottleneck,
            "stage_breakdown": analyzed_stages,
            "summary": summary
        }

    def compute_system_bottleneck_summary(self, all_project_analyses: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Computes aggregate system-wide view of most common bottleneck stages.
        """
        stage_counts = {}
        total_bottlenecks = 0

        for res in all_project_analyses:
            p_bt = res.get("primary_bottleneck")
            if p_bt:
                st_name = p_bt["stage_name"]
                stage_counts[st_name] = stage_counts.get(st_name, 0) + 1
                total_bottlenecks += 1

        sorted_bottlenecks = sorted(stage_counts.items(), key=lambda x: x[1], reverse=True)
        top_system_bottleneck = sorted_bottlenecks[0] if sorted_bottlenecks else ("None", 0)

        return {
            "total_projects_analyzed": len(all_project_analyses),
            "projects_with_bottlenecks": total_bottlenecks,
            "top_system_bottleneck_stage": top_system_bottleneck[0],
            "bottleneck_stage_distribution": dict(sorted_bottlenecks),
            "summary": f"System-wide analysis reveals '{top_system_bottleneck[0]}' as the most frequent workflow bottleneck across indexed projects."
        }
