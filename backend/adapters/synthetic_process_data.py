"""
Pratyaksh Process & Inspector Synthetic Data Generator (Phase 4 Step 0)
Generates:
1. Standard 6-stage MPLADS workflow stage event logs for projects with realistic SLA durations
   and injected bottleneck cases (e.g. 4.1x delay in District Review stage).
2. Inspector Roster of 8 District Inspectors with jurisdiction, base coordinates, and weekly capacity.

All generated records carry explicit provenance tags:
- is_synthetic: True
- source_type: "SYNTHETIC_DEMO"
- source: "Synthetic Process & Inspector Roster — Demonstration Data"
"""

import uuid
from datetime import datetime, timedelta
from typing import Dict, List, Any

# Standard MPLADS 6-Stage Workflow Benchmarks (Days)
STAGE_BENCHMARKS = {
    "PROPOSAL_RECOMMENDATION": {"benchmark_days": 15.0, "role": "District Nodal Cell"},
    "DISTRICT_REVIEW": {"benchmark_days": 22.0, "role": "District Planning Officer (IDA)"},
    "ADMINISTRATIVE_SANCTION": {"benchmark_days": 30.0, "role": "District Authority Collectorate"},
    "AGENCY_PROCUREMENT": {"benchmark_days": 45.0, "role": "Implementing Agency Procurement"},
    "WORK_EXECUTION": {"benchmark_days": 120.0, "role": "Contractor Division / IDA"},
    "COMPLETION_VERIFICATION": {"benchmark_days": 15.0, "role": "District Technical Inspector"}
}

# Synthetic Inspector Roster
SYNTHETIC_INSPECTORS = [
    {
        "inspector_id": "insp-01",
        "name": "Inspector Team Bihar North (Araria/Purnia)",
        "jurisdiction_state": "Bihar",
        "district": "Araria",
        "base_lat": 26.1500,
        "base_lon": 87.5200,
        "max_weekly_capacity": 8,
        "source": "Synthetic Inspector Roster",
        "is_synthetic": True
    },
    {
        "inspector_id": "insp-02",
        "name": "Inspector Team Kerala Coastal (Kollam)",
        "jurisdiction_state": "Kerala",
        "district": "Kollam",
        "base_lat": 8.8932,
        "base_lon": 76.6141,
        "max_weekly_capacity": 8,
        "source": "Synthetic Inspector Roster",
        "is_synthetic": True
    },
    {
        "inspector_id": "insp-03",
        "name": "Inspector Team Punjab Malwa (Faridkot)",
        "jurisdiction_state": "Punjab",
        "district": "Faridkot",
        "base_lat": 30.6769,
        "base_lon": 74.7583,
        "max_weekly_capacity": 6,
        "source": "Synthetic Inspector Roster",
        "is_synthetic": True
    },
    {
        "inspector_id": "insp-04",
        "name": "Inspector Team MP Nimar (Khargone)",
        "jurisdiction_state": "Madhya Pradesh",
        "district": "Khargone",
        "base_lat": 21.8242,
        "base_lon": 75.6111,
        "max_weekly_capacity": 8,
        "source": "Synthetic Inspector Roster",
        "is_synthetic": True
    },
    {
        "inspector_id": "insp-05",
        "name": "Inspector Team UP Purvanchal (Ghazipur)",
        "jurisdiction_state": "Uttar Pradesh",
        "district": "Ghazipur",
        "base_lat": 25.5800,
        "base_lon": 83.5700,
        "max_weekly_capacity": 8,
        "source": "Synthetic Inspector Roster",
        "is_synthetic": True
    },
    {
        "inspector_id": "insp-06",
        "name": "Inspector Team Maharashtra West (Hingoli)",
        "jurisdiction_state": "Maharashtra",
        "district": "Hingoli",
        "base_lat": 19.7167,
        "base_lon": 77.1500,
        "max_weekly_capacity": 6,
        "source": "Synthetic Inspector Roster",
        "is_synthetic": True
    }
]


class SyntheticProcessGenerator:
    @staticmethod
    def generate_project_stage_history(project: Dict[str, Any], idx: int) -> List[Dict[str, Any]]:
        """Generates realistic stage event log for a project with occasional SLA bottlenecks."""
        stage_history = []
        now = datetime.now()

        # Inject bottleneck case for specific demo indices
        inject_bottleneck = (idx % 3 == 0)

        elapsed_offset = 240 # days ago
        for stage_key, meta in STAGE_BENCHMARKS.items():
            bm_days = meta["benchmark_days"]
            
            if inject_bottleneck and stage_key == "DISTRICT_REVIEW":
                actual_days = round(bm_days * 4.1, 1) # 91 days vs 22 days (4.1x deviation!)
            elif inject_bottleneck and stage_key == "AGENCY_PROCUREMENT":
                actual_days = round(bm_days * 2.3, 1)
            else:
                actual_days = round(bm_days * ((idx % 4 + 7) / 10.0), 1) # Normal range 0.7x-1.0x

            entered_dt = now - timedelta(days=elapsed_offset)
            exited_dt = entered_dt + timedelta(days=actual_days)
            elapsed_offset -= actual_days

            delay_ratio = round(actual_days / bm_days, 2)

            stage_history.append({
                "stage_key": stage_key,
                "stage_name": stage_key.replace("_", " ").title(),
                "entered_at": entered_dt.strftime("%Y-%m-%d"),
                "exited_at": exited_dt.strftime("%Y-%m-%d") if elapsed_offset > 0 else None,
                "actual_duration_days": actual_days,
                "benchmark_days": bm_days,
                "delay_ratio": delay_ratio,
                "responsible_role": meta["role"],
                "is_bottleneck": delay_ratio >= 2.0,
                "is_synthetic": True
            })

            if elapsed_offset <= 0:
                break

        return stage_history
