"""
Typed Database & Structured Fact Retrieval Tools for the Universal MPLADS Intelligence Agent.
Directly interfaces with CanonicalDataAccess and attaches Tier 1 provenance metadata.
"""

from typing import Dict, Any, Optional, List
import time
from datetime import datetime
from agent.tools.base import TypedTool, ToolResult, ToolMetadata, ProvenanceTier, UserRole
from agent.data_access import data_access


class GetProjectTool(TypedTool):
    name = "get_project"
    description = "Retrieves complete verified facts for an MPLADS project by exact work_id or clean alias."
    min_role = UserRole.CITIZEN

    async def execute(self, params: Dict[str, Any], user_role: UserRole = UserRole.CITIZEN) -> ToolResult:
        start_t = time.time()
        work_id = params.get("work_id", "")
        project = data_access.get_project_by_id(work_id)

        if not project:
            return ToolResult(
                tool_name=self.name,
                success=False,
                data=None,
                error=f"No verified MPLADS record found for work_id '{work_id}'.",
                metadata=ToolMetadata(
                    source="eSAKSHI Official Public Export",
                    provenance_tier=ProvenanceTier.TIER_1,
                    timestamp=datetime.utcnow().isoformat(),
                    record_count=0
                ),
                execution_time_ms=round((time.time() - start_t) * 1000, 2)
            )

        return ToolResult(
            tool_name=self.name,
            success=True,
            data=project,
            metadata=ToolMetadata(
                source="eSAKSHI Official Public Export (30,002 Base Records)",
                provenance_tier=ProvenanceTier.TIER_1,
                citable_anchor=f"Work Record: {project.get('work_id')}",
                timestamp=datetime.utcnow().isoformat(),
                record_count=1
            ),
            execution_time_ms=round((time.time() - start_t) * 1000, 2)
        )


class SearchProjectsTool(TypedTool):
    name = "search_projects"
    description = "Searches and filters MPLADS works across 30,002 records by state, district, category, MP, amount, or text query."
    min_role = UserRole.CITIZEN

    async def execute(self, params: Dict[str, Any], user_role: UserRole = UserRole.CITIZEN) -> ToolResult:
        start_t = time.time()
        limit = min(int(params.get("limit", 20)), 100)
        offset = int(params.get("offset", 0))

        records, total_count = data_access.search_projects(
            query=params.get("query"),
            state=params.get("state"),
            district=params.get("district"),
            constituency=params.get("constituency"),
            category=params.get("category"),
            mp_name=params.get("mp_name"),
            fiscal_year=params.get("fiscal_year"),
            min_amount=float(params.get("min_amount")) if params.get("min_amount") is not None else None,
            max_amount=float(params.get("max_amount")) if params.get("max_amount") is not None else None,
            limit=limit,
            offset=offset
        )

        return ToolResult(
            tool_name=self.name,
            success=True,
            data={
                "projects": records,
                "total_matched": total_count,
                "limit": limit,
                "offset": offset
            },
            metadata=ToolMetadata(
                source="eSAKSHI Official Public Export (30,002 Base Records)",
                provenance_tier=ProvenanceTier.TIER_1,
                citable_anchor=f"Filtered {total_count} matching works from central registry",
                timestamp=datetime.utcnow().isoformat(),
                record_count=len(records)
            ),
            execution_time_ms=round((time.time() - start_t) * 1000, 2)
        )


class GetMPTool(TypedTool):
    name = "get_mp"
    description = "Retrieves MP allocation limits, house (Lok Sabha / Rajya Sabha), state, and constituency by name or constituency."
    min_role = UserRole.CITIZEN

    async def execute(self, params: Dict[str, Any], user_role: UserRole = UserRole.CITIZEN) -> ToolResult:
        start_t = time.time()
        query = params.get("query") or params.get("mp_name") or params.get("constituency") or ""
        mp_info = data_access.get_mp_by_name_or_constituency(query)

        if not mp_info:
            return ToolResult(
                tool_name=self.name,
                success=False,
                data=None,
                error=f"No MP profile found matching '{query}'.",
                metadata=ToolMetadata(
                    source="Allocated Limit for Hon'ble MPs Official Registry",
                    provenance_tier=ProvenanceTier.TIER_1,
                    timestamp=datetime.utcnow().isoformat(),
                    record_count=0
                ),
                execution_time_ms=round((time.time() - start_t) * 1000, 2)
            )

        # Also get count of projects sponsored
        proj_matches, count = data_access.search_projects(mp_name=mp_info.get("mp_name"), limit=5)
        mp_data = dict(mp_info)
        mp_data["recorded_projects_count"] = count
        mp_data["sample_projects"] = proj_matches

        return ToolResult(
            tool_name=self.name,
            success=True,
            data=mp_data,
            metadata=ToolMetadata(
                source="data.gov.in / eSAKSHI MP Allocation Limits",
                provenance_tier=ProvenanceTier.TIER_1,
                citable_anchor=f"Hon'ble MP {mp_info.get('mp_name')} ({mp_info.get('house')})",
                timestamp=datetime.utcnow().isoformat(),
                record_count=1
            ),
            execution_time_ms=round((time.time() - start_t) * 1000, 2)
        )


class GetStateStatisticsTool(TypedTool):
    name = "get_state_statistics"
    description = "Calculates exact aggregate sanctioned amount, disbursed amount, utilization %, and category breakdowns for a state or nationwide."
    min_role = UserRole.CITIZEN

    async def execute(self, params: Dict[str, Any], user_role: UserRole = UserRole.CITIZEN) -> ToolResult:
        start_t = time.time()
        state = params.get("state")
        summary = data_access.get_state_summary(state)

        return ToolResult(
            tool_name=self.name,
            success=True,
            data=summary,
            metadata=ToolMetadata(
                source="eSAKSHI Official 30,002 Aggregated Dataset",
                provenance_tier=ProvenanceTier.TIER_1,
                citable_anchor=f"Statistical aggregation for {summary.get('state')}",
                timestamp=datetime.utcnow().isoformat(),
                record_count=summary.get("total_works", 0)
            ),
            execution_time_ms=round((time.time() - start_t) * 1000, 2)
        )


class GetTimeSeriesTool(TypedTool):
    name = "get_time_series"
    description = "Retrieves annual / fiscal year spending distribution trends for a state or national dataset."
    min_role = UserRole.CITIZEN

    async def execute(self, params: Dict[str, Any], user_role: UserRole = UserRole.CITIZEN) -> ToolResult:
        start_t = time.time()
        state = params.get("state")
        series = data_access.get_time_series_by_state(state)

        return ToolResult(
            tool_name=self.name,
            success=True,
            data={"state": state or "National", "time_series": series},
            metadata=ToolMetadata(
                source="eSAKSHI Time-Series Aggregation",
                provenance_tier=ProvenanceTier.TIER_1,
                timestamp=datetime.utcnow().isoformat(),
                record_count=len(series)
            ),
            execution_time_ms=round((time.time() - start_t) * 1000, 2)
        )
