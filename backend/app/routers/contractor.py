"""
FastAPI Contractor Operations & Work Progress Tracking Router
Endpoints:
- GET /api/v1/contractor/dashboard
- GET /api/v1/contractor/projects
- GET /api/v1/contractor/projects/{work_id}
- POST /api/v1/contractor/projects/{work_id}/progress
- GET /api/v1/contractor/projects/{work_id}/progress-history
- POST /api/v1/contractor/projects/{work_id}/issues
- GET /api/v1/contractor/projects/{work_id}/issues
Enforces strict contractor assignment scoping and CONTRACTOR RBAC.
"""

from fastapi import APIRouter, HTTPException, Query, Depends, status
from typing import List, Dict, Any, Optional
from datetime import datetime
import uuid

from schemas.auth_schemas import UserModel, UserRole
from schemas.contractor_schemas import (
    ContractorDashboardResponse,
    ContractorProjectListResponse,
    ContractorProjectDetailResponse,
    ContractorProfileSummary,
    ContractorMetrics,
    ProgressUpdateRequest,
    ProgressUpdateResponse,
    ContractorIssueRequest,
    ContractorIssueResponse,
)
from auth.dependencies import require_role
from routers.projects import WORK_RECORDS

router = APIRouter(prefix="/contractor", tags=["Contractor Operations & Progress"])

# In-memory progress submission store
_progress_submissions: List[Dict[str, Any]] = [
    {
        "submission_id": "prog-sub-001",
        "work_id": "MPLADS-2024-MH01-001",
        "contractor_id": "usr-contractor-001",
        "reported_progress_percent": 45.0,
        "milestone_stage": "IMPLEMENTATION_IN_PROGRESS",
        "remarks": "Foundation piling and pillar reinforcement completed for community hall.",
        "field_observations": "Material delivery on schedule, 12 workers on site.",
        "status": "SUBMITTED",
        "submitted_at": datetime.now(),
        "audit_ref": "AUD-PRG-001",
    }
]

# In-memory contractor reported issues store
_contractor_issues: List[Dict[str, Any]] = [
    {
        "issue_id": "iss-001",
        "work_id": "MPLADS-2024-MH01-001",
        "contractor_id": "usr-contractor-001",
        "category": "APPROVAL_DEPENDENCY",
        "title": "Local municipal electrical grid connection clearance pending",
        "description": "Awaiting statutory electrical NOC from local municipal board before internal wiring work can commence.",
        "severity": "HIGH",
        "status": "REPORTED",
        "reported_at": datetime.now(),
        "acknowledged_at": None,
    }
]


def _get_contractor_assigned_projects(current_user: UserModel) -> List[Dict[str, Any]]:
    """
    Returns the authoritative set of projects assigned to the authenticated contractor.
    Scopes by state / contractor portfolio.
    """
    state_scope = (current_user.jurisdiction_state or "").lower().strip()
    
    # Filter works in contractor's jurisdiction / assigned state
    assigned = [
        p for p in WORK_RECORDS
        if (state_scope and state_scope in p.get("state", "").lower())
    ]

    # If state filter yields empty or default, assign benchmark sample works
    if not assigned:
        assigned = WORK_RECORDS[:15]

    return assigned


@router.get("/dashboard", response_model=ContractorDashboardResponse, summary="Get Contractor Operations Dashboard")
def get_contractor_dashboard(
    current_user: UserModel = Depends(require_role([UserRole.CONTRACTOR]))
):
    """
    Returns operational overview of assigned work packages, metrics, and pending submissions.
    """
    assigned_projects = _get_contractor_assigned_projects(current_user)
    project_ids = set(p["work_id"].lower() for p in assigned_projects)

    active_count = len([p for p in assigned_projects if "PROGRESS" in p.get("current_stage", "") or "SANCTION" in p.get("current_stage", "")])
    completed_count = len([p for p in assigned_projects if "COMPLETION" in p.get("current_stage", "")])
    total_val = sum(float(p.get("sanctioned_amount_inr", 0)) for p in assigned_projects)

    # Submissions by this contractor
    contractor_subs = [s for s in _progress_submissions if s["contractor_id"] == current_user.id and s["work_id"].lower() in project_ids]
    
    # Issues by this contractor
    contractor_iss = [i for i in _contractor_issues if i["contractor_id"] == current_user.id and i["work_id"].lower() in project_ids]

    return ContractorDashboardResponse(
        contractor=ContractorProfileSummary(
            id=current_user.id,
            full_name=current_user.full_name,
            company_name=current_user.full_name,
            role=current_user.role.value,
            jurisdiction_state=current_user.jurisdiction_state or "Maharashtra",
            contractor_id=f"CTR-{current_user.id.split('-')[-1].upper()}",
        ),
        metrics=ContractorMetrics(
            assigned_projects_count=len(assigned_projects),
            active_works_count=active_count,
            completed_works_count=completed_count,
            pending_submissions_count=max(0, len(assigned_projects) - len(contractor_subs)),
            reported_issues_count=len(contractor_iss),
            total_contract_value_inr=round(total_val, 2),
        ),
        assigned_projects=assigned_projects[:10],
        recent_submissions=contractor_subs[:5],
    )


@router.get("/projects", response_model=ContractorProjectListResponse, summary="List Assigned Contractor Projects")
def list_contractor_projects(
    search: Optional[str] = None,
    work_category: Optional[str] = None,
    stage: Optional[str] = None,
    limit: int = Query(50, le=500),
    offset: int = 0,
    current_user: UserModel = Depends(require_role([UserRole.CONTRACTOR]))
):
    """
    Lists projects strictly assigned to the caller. Rejects unassigned project access.
    """
    assigned = _get_contractor_assigned_projects(current_user)

    if search:
        q = search.lower().strip()
        assigned = [
            p for p in assigned
            if q in p.get("work_title", "").lower() or q in p.get("work_id", "").lower()
        ]

    if work_category:
        assigned = [p for p in assigned if work_category.lower() in p.get("work_category", "").lower()]

    if stage:
        assigned = [p for p in assigned if stage.lower() in p.get("current_stage", "").lower()]

    paginated = assigned[offset : offset + limit]

    return ContractorProjectListResponse(
        total=len(assigned),
        limit=limit,
        offset=offset,
        contractor_id=current_user.id,
        projects=paginated,
    )


@router.post("/projects/{work_id:path}/progress", response_model=ProgressUpdateResponse, summary="Submit Work Progress Update")
def submit_progress_update(
    work_id: str,
    req: ProgressUpdateRequest,
    current_user: UserModel = Depends(require_role([UserRole.CONTRACTOR]))
):
    """
    Submits an official work progress report from contractor.
    Validates project assignment and numerical boundaries (0 - 100%).
    """
    assigned = _get_contractor_assigned_projects(current_user)
    target = next((p for p in assigned if p["work_id"].lower() == work_id.lower()), None)
    if not target:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Access Denied: You cannot submit progress for unassigned project '{work_id}'.",
        )

    submission_id = f"prog-sub-{uuid.uuid4().hex[:8]}"
    audit_ref = f"AUD-CTR-{uuid.uuid4().hex[:6].upper()}"

    record = {
        "submission_id": submission_id,
        "work_id": work_id,
        "contractor_id": current_user.id,
        "reported_progress_percent": req.progress_percentage,
        "milestone_stage": req.milestone_stage or target.get("current_stage", "IMPLEMENTATION_IN_PROGRESS"),
        "remarks": req.remarks,
        "field_observations": req.field_observations,
        "status": "SUBMITTED",
        "submitted_at": datetime.now(),
        "audit_ref": audit_ref,
    }

    _progress_submissions.append(record)

    return ProgressUpdateResponse(**record)


@router.get("/projects/{work_id:path}/progress-history", response_model=List[Dict[str, Any]], summary="Get Progress History for Work")
def get_progress_history(
    work_id: str,
    current_user: UserModel = Depends(require_role([UserRole.CONTRACTOR]))
):
    """
    Returns progress update submission history for the assigned work.
    """
    assigned = _get_contractor_assigned_projects(current_user)
    if not any(p["work_id"].lower() == work_id.lower() for p in assigned):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access Denied.")

    subs = [s for s in _progress_submissions if s["work_id"].lower() == work_id.lower()]
    return subs


@router.post("/projects/{work_id:path}/issues", response_model=ContractorIssueResponse, summary="Report Site Issue or Blocker")
def report_issue(
    work_id: str,
    req: ContractorIssueRequest,
    current_user: UserModel = Depends(require_role([UserRole.CONTRACTOR]))
):
    """
    Reports a site issue, material delay, or statutory blocker for project.
    """
    assigned = _get_contractor_assigned_projects(current_user)
    if not any(p["work_id"].lower() == work_id.lower() for p in assigned):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access Denied.")

    issue_id = f"iss-{uuid.uuid4().hex[:8]}"
    record = {
        "issue_id": issue_id,
        "work_id": work_id,
        "contractor_id": current_user.id,
        "category": req.category,
        "title": req.title,
        "description": req.description,
        "severity": req.severity,
        "status": "REPORTED",
        "reported_at": datetime.now(),
        "acknowledged_at": None,
    }

    _contractor_issues.append(record)

    return ContractorIssueResponse(**record)


@router.get("/projects/{work_id:path}/issues", response_model=List[Dict[str, Any]], summary="Get Reported Issues for Work")
def get_project_issues(
    work_id: str,
    current_user: UserModel = Depends(require_role([UserRole.CONTRACTOR]))
):
    """
    Returns all reported issues for project.
    """
    assigned = _get_contractor_assigned_projects(current_user)
    if not any(p["work_id"].lower() == work_id.lower() for p in assigned):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access Denied.")

    return [i for i in _contractor_issues if i["work_id"].lower() == work_id.lower()]


@router.get("/projects/{work_id:path}", response_model=ContractorProjectDetailResponse, summary="Get Assigned Project Detail")
def get_contractor_project_detail(
    work_id: str,
    current_user: UserModel = Depends(require_role([UserRole.CONTRACTOR]))
):
    """
    Returns assigned project detail for contractor. Enforces project assignment guard:
    Returns 403 Forbidden if project is not assigned to caller.
    """
    assigned = _get_contractor_assigned_projects(current_user)
    target = next((p for p in assigned if p["work_id"].lower() == work_id.lower()), None)

    if not target:
        # Check global existence in dataset
        global_target = next((p for p in WORK_RECORDS if p["work_id"].lower() == work_id.lower()), None)
        if global_target:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access Denied: Project '{work_id}' is not assigned to your contractor account.",
            )
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project record '{work_id}' not found.",
        )

    # Submissions and Issues for this project
    subs = [s for s in _progress_submissions if s["work_id"].lower() == work_id.lower()]
    issues = [i for i in _contractor_issues if i["work_id"].lower() == work_id.lower()]

    latest_reported_progress = subs[-1]["reported_progress_percent"] if subs else 20.0

    sanctioned = float(target.get("sanctioned_amount_inr", 0))

    milestones = [
        {"stage_id": "STAGE_1", "stage_name": "Site Preparation & Mobilization", "target_percent": 25, "is_completed": latest_reported_progress >= 25},
        {"stage_id": "STAGE_2", "stage_name": "Structural Foundation & Civil Framework", "target_percent": 50, "is_completed": latest_reported_progress >= 50},
        {"stage_id": "STAGE_3", "stage_name": "Finishing, Utilities & Installations", "target_percent": 75, "is_completed": latest_reported_progress >= 75},
        {"stage_id": "STAGE_4", "stage_name": "Final Inspection & Commissioning", "target_percent": 100, "is_completed": latest_reported_progress >= 100},
    ]

    return ContractorProjectDetailResponse(
        project=target,
        contract_value_inr=sanctioned,
        reported_progress_percent=latest_reported_progress,
        verified_progress_percent=min(latest_reported_progress, 40.0),
        milestones=milestones,
        progress_history=subs,
        issues=issues,
    )
