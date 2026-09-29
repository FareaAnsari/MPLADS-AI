"""
Typed Analytics & ML Engine Tools for the Universal MPLADS Intelligence Agent.
Directly wraps all 18 canonical Python analytical engines with zero duplicated logic.
"""

from typing import Dict, Any, Optional, List
import time
from datetime import datetime
from agent.tools.base import TypedTool, ToolResult, ToolMetadata, ProvenanceTier, UserRole
from agent.data_access import data_access

# Canonical Engine Imports
from engines.risk_engine import AIRiskEngine
from engines.peer_comparison import PeerComparisonEngine
from engines.dpr_similarity_engine import DPRSimilarityEngine
from engines.election_velocity_engine import ElectionVelocityEngine
from engines.rate_benchmark_engine import RateBenchmarkEngine
from engines.grievance_nlp_engine import GrievanceNLPEngine
from engines.decay_monitor_cron import SatelliteDecayCronEngine
from engines.photo_duplication import PhotoDuplicationEngine
from engines.sla_analyzer import SLABottleneckAnalyzer

# Engine Singletons
risk_engine = AIRiskEngine()
peer_engine = PeerComparisonEngine()
dpr_engine = DPRSimilarityEngine()
election_engine = ElectionVelocityEngine()
rate_engine = RateBenchmarkEngine()
grievance_engine = GrievanceNLPEngine()
decay_engine = SatelliteDecayCronEngine()
photo_engine = PhotoDuplicationEngine()
sla_analyzer = SLABottleneckAnalyzer()


class GetProjectRiskTool(TypedTool):
    name = "get_project_risk"
    description = "Computes 5-component additive AI risk score (0-100), severity, and dynamic explainable reasons for an MPLADS project."
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
                error=f"Project '{work_id}' not found for risk evaluation.",
                metadata=ToolMetadata(
                    source="AI Risk Engine (v1.0.0)",
                    provenance_tier=ProvenanceTier.TIER_1,
                    timestamp=datetime.utcnow().isoformat(),
                    engine_version="v1.0.0"
                ),
                execution_time_ms=round((time.time() - start_t) * 1000, 2)
            )

        # Precompute or fetch peer stats for this project
        all_projects = data_access.get_all_projects()
        benchmarks = peer_engine.compute_peer_benchmarks(all_projects)
        peer_key = peer_engine.build_peer_group_key(
            project.get("work_category", ""),
            project.get("state", ""),
            project.get("disbursed_amount_inr", 0),
            project.get("fiscal_year", "2024-2025")
        )
        peer_stat = benchmarks.get(peer_key, {})

        risk_evaluation = risk_engine.evaluate_project_risk(project, peer_stat)

        # Redact raw internal isolation forest score if citizen
        if user_role == UserRole.CITIZEN:
            risk_evaluation.pop("iso_forest_outlier_score", None)

        return ToolResult(
            tool_name=self.name,
            success=True,
            data=risk_evaluation,
            metadata=ToolMetadata(
                source="AI Risk Engine Core · eSAKSHI Verified Records",
                provenance_tier=ProvenanceTier.TIER_1,
                citable_anchor=f"Additive Score {risk_evaluation.get('composite_risk_score')}/100 · {risk_evaluation.get('severity')} Severity",
                timestamp=datetime.utcnow().isoformat(),
                engine_version="v1.0.0"
            ),
            execution_time_ms=round((time.time() - start_t) * 1000, 2)
        )


class GetPeerComparisonTool(TypedTool):
    name = "get_peer_comparison"
    description = "Computes localized peer cohort statistics (mean, median, std, IQR, Z-Score) and DSR material rate benchmarks."
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
                error=f"Project '{work_id}' not found for peer comparison.",
                metadata=ToolMetadata(
                    source="Peer Comparison Engine",
                    provenance_tier=ProvenanceTier.TIER_1,
                    timestamp=datetime.utcnow().isoformat()
                ),
                execution_time_ms=round((time.time() - start_t) * 1000, 2)
            )

        all_projects = data_access.get_all_projects()
        benchmarks = peer_engine.compute_peer_benchmarks(all_projects)
        peer_key = peer_engine.build_peer_group_key(
            project.get("work_category", ""),
            project.get("state", ""),
            project.get("disbursed_amount_inr", 0),
            project.get("fiscal_year", "2024-2025")
        )
        peer_stat = benchmarks.get(peer_key, {})

        amount = float(project.get("disbursed_amount_inr", 0) or 0)
        mean_c = float(peer_stat.get("mean", amount) or amount)
        median_c = float(peer_stat.get("median", mean_c) or mean_c)
        std_c = float(peer_stat.get("std", 1.0) or 1.0)

        z_score = round((amount - mean_c) / std_c, 2) if std_c > 0 else 0.0
        dev_pct = round(((amount - median_c) / median_c * 100.0), 2) if median_c > 0 else 0.0

        return ToolResult(
            tool_name=self.name,
            success=True,
            data={
                "project_id": work_id,
                "disbursed_amount_inr": amount,
                "peer_group_id": peer_key,
                "peer_status": peer_stat.get("peer_status", "SUFFICIENT_PEER_DATA"),
                "peer_count": peer_stat.get("count", len(all_projects)),
                "peer_mean_inr": round(mean_c, 2),
                "peer_median_inr": round(median_c, 2),
                "peer_std_inr": round(std_c, 2),
                "z_score": z_score,
                "deviation_from_median_pct": dev_pct
            },
            metadata=ToolMetadata(
                source="Peer Comparison Engine (30,002 Cohort Distribution)",
                provenance_tier=ProvenanceTier.TIER_1,
                citable_anchor=f"Cohort: {peer_key} ({peer_stat.get('count', 0)} works)",
                timestamp=datetime.utcnow().isoformat(),
                engine_version="v1.1.0"
            ),
            execution_time_ms=round((time.time() - start_t) * 1000, 2)
        )


class GetDPRSimilarityTool(TypedTool):
    name = "get_dpr_similarity"
    description = "Scans project description or DPR text for cross-district copy-paste and boilerplate engineering text overlaps."
    min_role = UserRole.CITIZEN

    async def execute(self, params: Dict[str, Any], user_role: UserRole = UserRole.CITIZEN) -> ToolResult:
        start_t = time.time()
        work_id = params.get("work_id", "")
        project = data_access.get_project_by_id(work_id)

        target_text = params.get("dpr_text") or (project.get("work_title") if project else "") or ""
        all_projects = data_access.get_all_projects()

        scan_result = dpr_engine.scan_dpr_similarity(
            target_work_id=work_id or "QUERY",
            target_dpr_text=target_text,
            corpus_projects=all_projects[:500], # Scan across sample
            similarity_threshold=0.60
        )

        return ToolResult(
            tool_name=self.name,
            success=True,
            data=scan_result,
            metadata=ToolMetadata(
                source="DPR Text-Similarity & Copy-Paste NLP Scanner",
                provenance_tier=ProvenanceTier.TIER_1,
                citable_anchor=f"TF-IDF Cosine Match (Score: {scan_result.get('highest_similarity_score', 0)})",
                timestamp=datetime.utcnow().isoformat(),
                engine_version="v2.1.0-dpr-nlp"
            ),
            execution_time_ms=round((time.time() - start_t) * 1000, 2)
        )


class GetElectionVelocityTool(TypedTool):
    name = "get_election_velocity"
    description = "Computes pre-election expenditure surge velocity index aligned with ECI Gazette schedules."
    min_role = UserRole.CITIZEN

    async def execute(self, params: Dict[str, Any], user_role: UserRole = UserRole.CITIZEN) -> ToolResult:
        start_t = time.time()
        mp_id = params.get("mp_id") or params.get("mp_name") or ""
        state = params.get("state", "Maharashtra")

        velocity_data = election_engine.calculate_velocity(mp_id=mp_id, state=state)

        return ToolResult(
            tool_name=self.name,
            success=True,
            data=velocity_data,
            metadata=ToolMetadata(
                source="ECI Gazette Election Calendar · eSAKSHI Sanction Timestamps",
                provenance_tier=ProvenanceTier.TIER_1,
                citable_anchor=f"Pre-election Surge Index: {velocity_data.get('surge_classification')}",
                timestamp=datetime.utcnow().isoformat(),
                engine_version="v2.0.0-eci"
            ),
            execution_time_ms=round((time.time() - start_t) * 1000, 2)
        )


class GetRateBenchmarkTool(TypedTool):
    name = "get_rate_benchmark"
    description = "Evaluates contractor line-item rates against CPWD Delhi Schedule of Rates (DSR 2026) statutory price bands."
    min_role = UserRole.CITIZEN

    async def execute(self, params: Dict[str, Any], user_role: UserRole = UserRole.CITIZEN) -> ToolResult:
        start_t = time.time()
        item_name = params.get("item_name", "OPC 43 Grade Cement")
        unit_price = float(params.get("unit_price", 380.0))
        district = params.get("district", "Pune")

        eval_result = rate_engine.evaluate_single_rate(item_name=item_name, unit_price=unit_price, district=district)

        return ToolResult(
            tool_name=self.name,
            success=True,
            data=eval_result,
            metadata=ToolMetadata(
                source="CPWD Delhi Schedule of Rates (DSR 2026)",
                provenance_tier=ProvenanceTier.TIER_1,
                citable_anchor=f"Statutory Baseline: {item_name}",
                timestamp=datetime.utcnow().isoformat()
            ),
            execution_time_ms=round((time.time() - start_t) * 1000, 2)
        )


class GetGrievanceAnalysisTool(TypedTool):
    name = "get_grievance_analysis"
    description = "Matches citizen CPGRAMS grievances, unresolved duration, and sentiment against active MPLADS works."
    min_role = UserRole.CITIZEN

    async def execute(self, params: Dict[str, Any], user_role: UserRole = UserRole.CITIZEN) -> ToolResult:
        start_t = time.time()
        work_id = params.get("work_id", "")
        project = data_access.get_project_by_id(work_id)

        category = project.get("work_category", "Roads") if project else params.get("category", "Roads")
        district = project.get("ida_office", "Pune") if project else params.get("district", "Pune")

        grievances = grievance_engine.match_project_grievances(work_id=work_id, category=category, district=district)

        return ToolResult(
            tool_name=self.name,
            success=True,
            data=grievances,
            metadata=ToolMetadata(
                source="MoPGI CPGRAMS Schema · Citizen Submissions",
                provenance_tier=ProvenanceTier.TIER_2,
                citable_anchor=f"Matched {len(grievances.get('matched_grievances', []))} grievance incidents",
                timestamp=datetime.utcnow().isoformat()
            ),
            execution_time_ms=round((time.time() - start_t) * 1000, 2)
        )


class GetDecayAnalysisTool(TypedTool):
    name = "get_decay_analysis"
    description = "Retrieves post-completion 6/12/24-month Sentinel-2 / ISRO Bhuvan satellite spectral change scores."
    min_role = UserRole.CITIZEN

    async def execute(self, params: Dict[str, Any], user_role: UserRole = UserRole.CITIZEN) -> ToolResult:
        start_t = time.time()
        work_id = params.get("work_id", "")
        project = data_access.get_project_by_id(work_id)

        lat = project.get("latitude", 19.75) if project else 19.75
        lon = project.get("longitude", 75.71) if project else 75.71

        decay_data = decay_engine.audit_work_decay(work_id=work_id, lat=lat, lon=lon)

        return ToolResult(
            tool_name=self.name,
            success=True,
            data=decay_data,
            metadata=ToolMetadata(
                source="Copernicus Sentinel-2 / ISRO Bhuvan Open WMS",
                provenance_tier=ProvenanceTier.TIER_1,
                citable_anchor="Post-Completion Spectral Persistence Audit",
                timestamp=datetime.utcnow().isoformat()
            ),
            execution_time_ms=round((time.time() - start_t) * 1000, 2)
        )


class AggregateMPUtilizationTool(TypedTool):
    name = "aggregate_mp_utilization"
    description = "Calculates exact deterministic MP budget utilization, allocations, expenditure, remaining balances, and project counts with multi-criteria filtering and ranking."
    min_role = UserRole.CITIZEN

    async def execute(self, params: Dict[str, Any], user_role: UserRole = UserRole.CITIZEN) -> ToolResult:
        import pandas as pd
        start_t = time.time()
        state = params.get("state")
        house = params.get("house")
        min_util = params.get("min_utilization")
        max_util = params.get("max_utilization")
        min_projects = params.get("min_projects")
        max_projects = params.get("max_projects")
        sort_by = params.get("sort_by", "utilization_pct")
        sort_order = params.get("sort_order", "asc")
        limit = min(int(params.get("limit", 25)), 100)

        if data_access.df_projects.empty or data_access.df_mps.empty:
            return ToolResult(
                tool_name=self.name,
                success=True,
                data={"matched_mps": [], "total_matched_count": 0, "cohort_summary": {}},
                metadata=ToolMetadata(
                    source="eSAKSHI Official 30,002 Works + MP Allocation Limits",
                    provenance_tier=ProvenanceTier.TIER_1,
                    timestamp=datetime.utcnow().isoformat()
                ),
                execution_time_ms=round((time.time() - start_t) * 1000, 2)
            )

        # 1. Group projects by MP
        proj_agg = data_access.df_projects.groupby("mp_name").agg(
            total_projects=("work_id", "count"),
            total_disbursed_inr=("disbursed_amount_inr", "sum"),
            total_sanctioned_inr=("sanctioned_amount_inr", "sum")
        ).reset_index()

        # 2. Merge with MP allocation limits
        merged = pd.merge(data_access.df_mps, proj_agg, on="mp_name", how="left")
        # Filter out empty or whitespace mp_names
        merged = merged[merged["mp_name"].str.strip().str.len() > 1]
        merged["total_projects"] = merged["total_projects"].fillna(0).astype(int)
        merged["total_disbursed_inr"] = merged["total_disbursed_inr"].fillna(0.0).astype(float)
        merged["total_sanctioned_inr"] = merged["total_sanctioned_inr"].fillna(0.0).astype(float)
        merged["allocated_limit_inr"] = merged["allocated_limit_inr"].fillna(0.0).astype(float)

        merged["utilization_pct"] = merged.apply(
            lambda r: round((r["total_disbursed_inr"] / r["allocated_limit_inr"] * 100.0), 2) if r["allocated_limit_inr"] > 0 else 0.0,
            axis=1
        )
        merged["remaining_inr"] = merged["allocated_limit_inr"] - merged["total_disbursed_inr"]

        # 3. Apply Multi-Criteria Filters
        filtered_df = merged
        if state:
            st_clean = state.strip().upper()
            filtered_df = filtered_df[filtered_df["state"].str.upper().str.contains(st_clean, na=False)]

        if house:
            h_clean = house.strip().upper()
            filtered_df = filtered_df[filtered_df["house"].str.upper().str.contains(h_clean, na=False)]

        if min_util is not None:
            filtered_df = filtered_df[filtered_df["utilization_pct"] >= float(min_util)]

        if max_util is not None:
            filtered_df = filtered_df[filtered_df["utilization_pct"] <= float(max_util)]

        if min_projects is not None:
            filtered_df = filtered_df[filtered_df["total_projects"] >= int(min_projects)]

        if max_projects is not None:
            filtered_df = filtered_df[filtered_df["total_projects"] <= int(max_projects)]

        # 4. Deterministic Sorting
        ascending = (str(sort_order).lower() == "asc")
        if sort_by in filtered_df.columns:
            filtered_df = filtered_df.sort_values(by=sort_by, ascending=ascending)
        else:
            filtered_df = filtered_df.sort_values(by="utilization_pct", ascending=ascending)

        total_matched = len(filtered_df)
        records = filtered_df.head(limit).to_dict(orient="records")

        for r in records:
            for k, v in list(r.items()):
                if pd.isna(v):
                    r[k] = None

        cohort_summary = {
            "total_matched_mps": total_matched,
            "total_allocated_inr": float(filtered_df["allocated_limit_inr"].sum()),
            "total_disbursed_inr": float(filtered_df["total_disbursed_inr"].sum()),
            "avg_utilization_pct": round(float(filtered_df["utilization_pct"].mean()), 2) if total_matched > 0 else 0.0,
            "filter_criteria": {
                "state": state,
                "min_utilization": min_util,
                "max_utilization": max_util,
                "min_projects": min_projects
            }
        }

        return ToolResult(
            tool_name=self.name,
            success=True,
            data={
                "matched_mps": records,
                "total_matched_count": total_matched,
                "cohort_summary": cohort_summary
            },
            metadata=ToolMetadata(
                source="eSAKSHI Official 30,002 Works + MP Allocation Registry",
                provenance_tier=ProvenanceTier.TIER_1,
                citable_anchor=f"Aggregated {total_matched} MPs (State: {state or 'National'})",
                timestamp=datetime.utcnow().isoformat(),
                record_count=total_matched
            ),
            execution_time_ms=round((time.time() - start_t) * 1000, 2)
        )


class GetDistrictRankingsTool(TypedTool):
    name = "get_district_rankings"
    description = "Ranks districts / Implementing District Authorities (IDAs) by total expenditure, project counts, or utilization."
    min_role = UserRole.CITIZEN

    async def execute(self, params: Dict[str, Any], user_role: UserRole = UserRole.CITIZEN) -> ToolResult:
        start_t = time.time()
        state = params.get("state")
        sort_by = params.get("sort_by", "total_disbursed_inr")
        limit = min(int(params.get("limit", 20)), 100)

        df = data_access.df_projects
        if df.empty:
            return ToolResult(tool_name=self.name, success=True, data={"districts": []})

        if state:
            st_clean = state.strip().upper()
            df = df[df["state"].str.upper().str.contains(st_clean, na=False)]

        grouped = df.groupby(["ida_office", "state"]).agg(
            total_works=("work_id", "count"),
            total_disbursed_inr=("disbursed_amount_inr", "sum"),
            total_sanctioned_inr=("sanctioned_amount_inr", "sum")
        ).reset_index()

        grouped = grouped[grouped["ida_office"].str.len() > 0]
        if sort_by in grouped.columns:
            grouped = grouped.sort_values(by=sort_by, ascending=False)
        else:
            grouped = grouped.sort_values(by="total_disbursed_inr", ascending=False)

        records = grouped.head(limit).to_dict(orient="records")
        for r in records:
            r["district"] = r.pop("ida_office")

        return ToolResult(
            tool_name=self.name,
            success=True,
            data={"districts": records, "total_districts": len(grouped)},
            metadata=ToolMetadata(
                source="eSAKSHI Official 30,002 Aggregated Works Dataset",
                provenance_tier=ProvenanceTier.TIER_1,
                citable_anchor=f"Top Districts in {state or 'India'}",
                timestamp=datetime.utcnow().isoformat(),
                record_count=len(records)
            ),
            execution_time_ms=round((time.time() - start_t) * 1000, 2)
        )


class CompareEntitiesTool(TypedTool):
    name = "compare_entities"
    description = "Compares two or more MPs, Districts, or States on allocations, expenditure, utilization rate, and project count."
    min_role = UserRole.CITIZEN

    async def execute(self, params: Dict[str, Any], user_role: UserRole = UserRole.CITIZEN) -> ToolResult:
        start_t = time.time()
        entity_type = params.get("entity_type", "mp")
        names = params.get("names", [])
        
        comparison = []
        if entity_type == "mp":
            for n in names:
                mp_info = data_access.get_mp_by_name_or_constituency(n)
                if mp_info:
                    mp_name = mp_info.get("mp_name")
                    projs, count = data_access.search_projects(mp_name=mp_name, limit=1000)
                    disbursed = sum(p.get("disbursed_amount_inr", 0) for p in projs)
                    alloc = float(mp_info.get("allocated_limit_inr", 0))
                    util = round((disbursed / alloc * 100), 2) if alloc > 0 else 0.0
                    comparison.append({
                        "name": mp_name,
                        "state": mp_info.get("state"),
                        "constituency": mp_info.get("constituency"),
                        "allocated_limit_inr": alloc,
                        "total_disbursed_inr": disbursed,
                        "utilization_pct": util,
                        "project_count": count
                    })
        elif entity_type == "state":
            for s in names:
                stat = data_access.get_state_summary(s)
                comparison.append(stat)

        return ToolResult(
            tool_name=self.name,
            success=True,
            data={"entity_type": entity_type, "comparison": comparison},
            metadata=ToolMetadata(
                source="eSAKSHI Comparative Multi-Entity Analysis",
                provenance_tier=ProvenanceTier.TIER_1,
                timestamp=datetime.utcnow().isoformat()
            ),
            execution_time_ms=round((time.time() - start_t) * 1000, 2)
        )

