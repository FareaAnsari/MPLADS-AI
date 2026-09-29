"""
Safe Structured Query Execution Tool for the Universal MPLADS Intelligence Agent.
Converts structured QueryPlan ASTs into safe, parameterized, read-only analytics queries.
"""

from typing import Dict, Any, Optional, List
import time
from datetime import datetime
from agent.tools.base import TypedTool, ToolResult, ToolMetadata, ProvenanceTier, UserRole
from agent.data_access import data_access
import pandas as pd


class RunStructuredQueryTool(TypedTool):
    name = "run_structured_query"
    description = "Executes validated structured query plans (aggregations, rankings, grouping, sums, counts) over the 30,002 verified records."
    min_role = UserRole.CITIZEN

    async def execute(self, params: Dict[str, Any], user_role: UserRole = UserRole.CITIZEN) -> ToolResult:
        start_t = time.time()
        plan = params.get("plan") or params
        
        df = data_access.df_projects
        if df.empty:
            return ToolResult(
                tool_name=self.name,
                success=False,
                data=None,
                error="Underlying dataset unavailable.",
                metadata=ToolMetadata(
                    source="Canonical Data Engine",
                    provenance_tier=ProvenanceTier.TIER_1,
                    timestamp=datetime.utcnow().isoformat()
                )
            )

        # 1. Apply Filters
        filters = plan.get("filters", {})
        if filters.get("state"):
            df = df[df["state"].str.upper().str.contains(str(filters["state"]).strip().upper(), na=False)]
        if filters.get("category"):
            df = df[df["work_category"].str.upper().str.contains(str(filters["category"]).strip().upper(), na=False)]
        if filters.get("district"):
            df = df[df["ida_office"].str.upper().str.contains(str(filters["district"]).strip().upper(), na=False)]
        if filters.get("mp_name"):
            df = df[df["mp_name"].str.upper().str.contains(str(filters["mp_name"]).strip().upper(), na=False)]
        if filters.get("fiscal_year"):
            df = df[df["fiscal_year"].astype(str).str.contains(str(filters["fiscal_year"]).strip(), na=False)]
        if filters.get("min_amount"):
            df = df[df["disbursed_amount_inr"] >= float(filters["min_amount"])]
        if filters.get("max_amount"):
            df = df[df["disbursed_amount_inr"] <= float(filters["max_amount"])]

        operation = plan.get("operation", "aggregate")
        group_by = plan.get("group_by")
        metric = plan.get("metric", "disbursed_amount_inr")
        aggregations = plan.get("aggregations", ["sum", "count"])
        limit = min(int(plan.get("limit", 20)), 100)

        result_data = {}

        if group_by and group_by in df.columns:
            # Map canonical group_by
            col_map = {
                "state": "state",
                "category": "work_category",
                "district": "ida_office",
                "mp": "mp_name",
                "fiscal_year": "fiscal_year"
            }
            actual_col = col_map.get(group_by, group_by)
            if actual_col in df.columns:
                grouped = df.groupby(actual_col).agg(
                    count=("work_id", "count"),
                    total_disbursed=("disbursed_amount_inr", "sum"),
                    mean_disbursed=("disbursed_amount_inr", "mean")
                ).reset_index()
                
                sort_by = "total_disbursed" if "sum" in aggregations else "count"
                grouped = grouped.sort_values(by=sort_by, ascending=False).head(limit)
                result_data["grouped_results"] = grouped.to_dict(orient="records")
        else:
            # Global aggregation
            result_data["total_records"] = len(df)
            result_data["sum_disbursed_inr"] = round(float(df["disbursed_amount_inr"].sum()), 2) if "disbursed_amount_inr" in df.columns else 0.0
            result_data["mean_disbursed_inr"] = round(float(df["disbursed_amount_inr"].mean()), 2) if len(df) > 0 else 0.0
            result_data["median_disbursed_inr"] = round(float(df["disbursed_amount_inr"].median()), 2) if len(df) > 0 else 0.0

        return ToolResult(
            tool_name=self.name,
            success=True,
            data=result_data,
            metadata=ToolMetadata(
                source="eSAKSHI Official 30,002 Aggregation Engine",
                provenance_tier=ProvenanceTier.TIER_1,
                citable_anchor=f"Structured Query on {len(df)} records",
                timestamp=datetime.utcnow().isoformat(),
                record_count=len(df)
            ),
            execution_time_ms=round((time.time() - start_t) * 1000, 2)
        )
