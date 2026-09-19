"""
FastAPI MP Office Constituency Oversight Router
Endpoints:
- GET /api/v1/mp/dashboard
- GET /api/v1/mp/projects
- GET /api/v1/mp/projects/{work_id}
- GET /api/v1/mp/risk-overview
Enforces strict constituency / jurisdiction scoping and MP_OFFICE RBAC.
"""

from fastapi import APIRouter, HTTPException, Query, Depends, status
from typing import List, Dict, Any, Optional
from datetime import datetime

from schemas.auth_schemas import UserModel, UserRole
from schemas.mp_schemas import (
    MPDashboardResponse,
    MPProjectListResponse,
    MPProjectDetailResponse,
    MPProfileSummary,
    MPMetrics,
    MPRiskDistribution,
    MPFinancialSummary,
    MPMilestone,
    MPOversightRisk,
)
from auth.dependencies import require_role
from routers.projects import WORK_RECORDS, EXPENDITURE_RECORDS
from routers.intelligence import EVALUATED_CACHE, EVIDENCE_STORE

router = APIRouter(prefix="/mp", tags=["MP Office Constituency Oversight"])


def _get_constituency_projects(current_user: UserModel) -> List[Dict[str, Any]]:
    """Helper to filter dataset records strictly scoped to the authenticated MP's constituency / state."""
    state_scope = (current_user.jurisdiction_state or "").lower().strip()
    constituency_scope = (current_user.constituency or "").lower().strip()
    mp_name_scope = (current_user.full_name or "").lower().strip()

    filtered = [
        p for p in WORK_RECORDS
        if (
            (constituency_scope and constituency_scope in p.get("constituency", "").lower())
            or (constituency_scope and constituency_scope in p.get("ida_office", "").lower())
            or (state_scope and state_scope in p.get("state", "").lower())
        )
    ]

    # Fallback to state scope if no direct constituency match
    if not filtered and state_scope:
        filtered = [p for p in WORK_RECORDS if state_scope in p.get("state", "").lower()]

    return filtered


@router.get("/dashboard", response_model=MPDashboardResponse, summary="Get MP Constituency Oversight Dashboard")
def get_mp_dashboard(
    current_user: UserModel = Depends(require_role([UserRole.MP_OFFICE]))
):
    """
    Returns constituency-scoped oversight metrics, financial summary, and risk distribution.
    Strictly isolated to authenticated MP jurisdiction.
    """
    projects = _get_constituency_projects(current_user)
    project_ids = set(p["work_id"].lower() for p in projects)

    total_sanctioned = sum(float(p.get("sanctioned_amount_inr", 0)) for p in projects)
    total_disbursed = sum(float(p.get("disbursed_amount_inr", 0)) for p in projects)
    utilization_pct = round((total_disbursed / total_sanctioned * 100), 1) if total_sanctioned > 0 else 0.0

    active_count = len([p for p in projects if "PROGRESS" in p.get("current_stage", "") or "SANCTION" in p.get("current_stage", "")])
    completed_count = len([p for p in projects if "COMPLETION" in p.get("current_stage", "") or "COMMISSION" in p.get("current_stage", "")])
    
    # Scoped evaluated risk items
    scoped_risks = [r for r in EVALUATED_CACHE if r["work_id"].lower() in project_ids]
    
    low_count = len([r for r in scoped_risks if r.get("risk_score", 0) < 40])
    medium_count = len([r for r in scoped_risks if 40 <= r.get("risk_score", 0) < 70])
    high_count = len([r for r in scoped_risks if 70 <= r.get("risk_score", 0) < 90])
    critical_count = len([r for r in scoped_risks if r.get("risk_score", 0) >= 90])
    high_risk_attention = high_count + critical_count

    # Delayed projects count
    delayed_count = len([
        r for r in scoped_risks
        if r.get("component_breakdown", {}).get("delay_anomaly", 0) > 40
    ])

    # Public verified evidence in constituency
    public_evidence = [
        e for e in EVIDENCE_STORE
        if e.get("project_id", "").lower() in project_ids
    ]

    return MPDashboardResponse(
        mp=MPProfileSummary(
            id=current_user.id,
            full_name=current_user.full_name,
            role=current_user.role.value,
            constituency=current_user.constituency or "General Constituency",
            state=current_user.jurisdiction_state or "National",
        ),
        metrics=MPMetrics(
            total_constituency_projects=len(projects),
            active_count=active_count,
            completed_count=completed_count,
            delayed_count=delayed_count,
            total_sanctioned_inr=round(total_sanctioned, 2),
            total_disbursed_inr=round(total_disbursed, 2),
            high_risk_attention_count=high_risk_attention,
            public_evidence_count=len(public_evidence),
            utilization_percentage=utilization_pct,
        ),
        risk_distribution=MPRiskDistribution(
            low=low_count,
            medium=medium_count,
            high=high_count,
            critical=critical_count,
        ),
        recent_projects=projects[:8],
    )


@router.get("/projects", response_model=MPProjectListResponse, summary="List Constituency Projects for MP")
def list_mp_projects(
    search: Optional[str] = None,
    work_category: Optional[str] = None,
    stage: Optional[str] = None,
    risk_level: Optional[str] = None,
    limit: int = Query(50, le=500),
    offset: int = 0,
    current_user: UserModel = Depends(require_role([UserRole.MP_OFFICE]))
):
    """
    Lists projects strictly within the MP's authorized constituency and state.
    Rejects any attempts to access projects outside jurisdiction.
    """
    filtered = _get_constituency_projects(current_user)

    if search:
        q = search.lower().strip()
        filtered = [
            p for p in filtered
            if q in p.get("work_title", "").lower() or q in p.get("work_id", "").lower() or q in (p.get("work_description") or "").lower()
        ]

    if work_category:
        filtered = [p for p in filtered if work_category.lower() in p.get("work_category", "").lower()]

    if stage:
        filtered = [p for p in filtered if stage.lower() in p.get("current_stage", "").lower()]

    # Risk level filtering if requested
    if risk_level:
        risk_map = {r["work_id"].lower(): r.get("risk_score", 0) for r in EVALUATED_CACHE}
        if risk_level.upper() == "HIGH":
            filtered = [p for p in filtered if risk_map.get(p["work_id"].lower(), 0) >= 70]
        elif risk_level.upper() == "MEDIUM":
            filtered = [p for p in filtered if 40 <= risk_map.get(p["work_id"].lower(), 0) < 70]
        elif risk_level.upper() == "LOW":
            filtered = [p for p in filtered if risk_map.get(p["work_id"].lower(), 0) < 40]

    paginated = filtered[offset : offset + limit]

    return MPProjectListResponse(
        total=len(filtered),
        limit=limit,
        offset=offset,
        constituency=current_user.constituency or "Constituency",
        state=current_user.jurisdiction_state or "State",
        projects=paginated,
    )


@router.get("/projects/{work_id:path}", response_model=MPProjectDetailResponse, summary="Get MP Project Oversight Detail")
def get_mp_project_detail(
    work_id: str,
    current_user: UserModel = Depends(require_role([UserRole.MP_OFFICE]))
):
    """
    Returns oversight detail for a project. Validates jurisdiction scoping:
    If the requested project does not belong to the MP's state/constituency, returns 403 Forbidden.
    """
    constituency_projects = _get_constituency_projects(current_user)
    target = next((p for p in constituency_projects if p["work_id"].lower() == work_id.lower()), None)

    if not target:
        # Check if project exists globally in dataset
        global_target = next((p for p in WORK_RECORDS if p["work_id"].lower() == work_id.lower()), None)
        if global_target:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access Denied: Project '{work_id}' is located outside your authorized constituency jurisdiction.",
            )
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project record '{work_id}' not found.",
        )

    # Financials
    sanctioned = float(target.get("sanctioned_amount_inr", 0))
    disbursed = float(target.get("disbursed_amount_inr", 0))
    related_exps = [e for e in EXPENDITURE_RECORDS if e.get("work_id", "").lower() == work_id.lower()]
    total_exp = sum(float(e.get("fund_disbursed_amount_inr", 0)) for e in related_exps) or disbursed
    balance = max(0.0, sanctioned - total_exp)
    utilization_pct = round((total_exp / sanctioned * 100), 1) if sanctioned > 0 else 0.0

    financials = MPFinancialSummary(
        sanctioned_amount_inr=sanctioned,
        disbursed_amount_inr=disbursed,
        expenditure_inr=total_exp,
        remaining_balance_inr=balance,
        utilization_percentage=utilization_pct,
    )

    # Standardized MPLADS workflow milestones
    current_stage = target.get("current_stage", "PROPOSAL_SUBMITTED")
    stages = [
        ("PROPOSAL_SUBMITTED", "Proposal Submitted", 30),
        ("FEASIBILITY_VERIFIED", "Feasibility Inspection", 45),
        ("ADMIN_SANCTION_ISSUED", "Administrative Sanction", 30),
        ("IMPLEMENTATION_IN_PROGRESS", "Implementation & Works", 180),
        ("PHYSICAL_COMPLETION", "Completion & Handover", 30),
    ]

    current_idx = 0
    for idx, (s_code, _, _) in enumerate(stages):
        if s_code == current_stage:
            current_idx = idx
            break

    milestones = []
    for idx, (s_code, s_name, b_days) in enumerate(stages):
        is_completed = idx < current_idx or current_stage == "PHYSICAL_COMPLETION"
        is_current = idx == current_idx and current_stage != "PHYSICAL_COMPLETION"
        milestones.append(
            MPMilestone(
                stage_id=s_code,
                stage_name=s_name,
                is_completed=is_completed,
                is_current=is_current,
                benchmark_days=b_days,
                days_in_stage=14 if is_current else None,
                status="COMPLETED" if is_completed else "IN_PROGRESS" if is_current else "PENDING",
            )
        )

    # High-level Authorized Risk Signal (Without sensitive internal officer audit commentary)
    risk_record = next((r for r in EVALUATED_CACHE if r["work_id"].lower() == work_id.lower()), None)
    if risk_record:
        r_score = float(risk_record.get("risk_score", 0))
        r_level = "CRITICAL" if r_score >= 90 else "HIGH" if r_score >= 70 else "MEDIUM" if r_score >= 40 else "LOW"
        risk_oversight = MPOversightRisk(
            risk_score=r_score,
            risk_level=r_level,
            attention_required=r_score >= 70,
            primary_risk_signal=risk_record.get("explanation", {}).get("primary_reason"),
            top_contributing_factor=risk_record.get("top_contributing_factor"),
        )
    else:
        risk_oversight = MPOversightRisk(
            risk_score=15.0,
            risk_level="LOW",
            attention_required=False,
            primary_risk_signal="Normal milestone progress within expected benchmarks.",
        )

    # Public/Authorized Evidence
    public_evidence = [
        {
            "evidence_id": e.get("evidence_id"),
            "submitted_at": e.get("timestamp_captured"),
            "location_verified": e.get("location_verified", True),
            "verification_status": e.get("verification_status", "VERIFIED"),
        }
        for e in EVIDENCE_STORE
        if e.get("project_id", "").lower() == work_id.lower()
    ]

    return MPProjectDetailResponse(
        project=target,
        financials=financials,
        milestones=milestones,
        risk_oversight=risk_oversight,
        public_evidence=public_evidence,
        expenditures=related_exps,
    )


@router.get("/risk-overview", summary="Get MP Constituency Risk Overview")
def get_mp_risk_overview(
    current_user: UserModel = Depends(require_role([UserRole.MP_OFFICE]))
):
    """
    Returns constituency-wide risk intelligence overview for MP oversight.
    """
    projects = _get_constituency_projects(current_user)
    project_ids = set(p["work_id"].lower() for p in projects)

    scoped_risks = [r for r in EVALUATED_CACHE if r["work_id"].lower() in project_ids]
    
    attention_projects = [
        {
            "work_id": r["work_id"],
            "risk_score": r.get("risk_score", 0),
            "anomaly_flag": r.get("anomaly_flag", "NORMAL"),
            "primary_reason": r.get("explanation", {}).get("primary_reason", "Statistical anomaly detected."),
        }
        for r in scoped_risks
        if r.get("risk_score", 0) >= 70
    ]

    return {
        "constituency": current_user.constituency or "Constituency",
        "state": current_user.jurisdiction_state or "State",
        "total_assessed_projects": len(scoped_risks),
        "attention_count": len(attention_projects),
        "attention_projects": attention_projects,
    }
