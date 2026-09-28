from fastapi import APIRouter, HTTPException, Query, Body, status
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
import os

from adapters.dataset_adapter import DatasetAdapter
from engines.risk_engine import AIRiskEngine, RISK_ENGINE_VERSION, RULES_VERSION
from engines.peer_comparison import PeerComparisonEngine
from engines.ledger_engine import AuditLedgerEngine
from database import save_officer_decision, get_officer_decisions, get_latest_officer_decision

router = APIRouter(prefix="/projects", tags=["MPLADS Projects & Works"])

# Instantiate DatasetAdapter pointing to Dataset directory
def _resolve_dataset_dir() -> str:
    env_dir = os.getenv("DATASET_DIR")
    if env_dir and os.path.exists(env_dir):
        return env_dir
    candidates = [
        os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "Dataset")),
        os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "Dataset")),
        os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "Dataset")),
        "Dataset",
        "../Dataset",
    ]
    for c in candidates:
        if os.path.exists(c):
            return c
    return "Dataset"

DATASET_DIR = _resolve_dataset_dir()
adapter = DatasetAdapter(dataset_dir=DATASET_DIR)

# In-memory cached dataset records for fast prototype API queries
MP_RECORDS = adapter.parse_mp_allocated_limits()
WORK_RECORDS = adapter.parse_works_completed()
EXPENDITURE_RECORDS = adapter.parse_expenditures()

# Initialize Engines
risk_engine = AIRiskEngine()
peer_engine = PeerComparisonEngine()
ledger_engine = AuditLedgerEngine()

# Compute peer benchmarks at startup across all works
PEER_BENCHMARKS = peer_engine.compute_peer_benchmarks(WORK_RECORDS)


def _find_project(work_id: str) -> Optional[Dict[str, Any]]:
    """Helper to find project by work_id with flexible formatting."""
    clean_id = work_id.strip('/').rstrip('-').strip().lower()
    match = next(
        (w for w in WORK_RECORDS if w["work_id"].lower().strip('/').rstrip('-').strip() == clean_id),
        None
    )
    if not match:
        # Check by code or alternative format
        match = next(
            (w for w in WORK_RECORDS if clean_id in w["work_id"].lower()),
            None
        )
    return match


class DecisionPayload(BaseModel):
    decision: str = Field(..., description="Decision enum e.g. CONFIRM_ISSUE, CONFIRMED, FALSE_ALARM, REQUEST_MORE_EVIDENCE, REQUIRES_FIELD")
    notes: str = Field(..., min_length=1, description="Officer justification remarks")
    officer_id: Optional[str] = Field("OFFICER-001", description="Officer ID")
    officer_name: Optional[str] = Field("District Planning Officer", description="Officer Name")


@router.get("/dataset-summary", summary="Get overall MPLADS dataset statistics")
def get_dataset_summary():
    total_sanctioned = sum(w.get("sanctioned_amount_inr", 0) for w in WORK_RECORDS)
    total_disbursed = sum(e.get("fund_disbursed_amount_inr", 0) for e in EXPENDITURE_RECORDS)
    
    return {
        "total_mps_indexed": len(MP_RECORDS),
        "total_works_indexed": len(WORK_RECORDS),
        "total_expenditures_indexed": len(EXPENDITURE_RECORDS),
        "total_sanctioned_inr": round(total_sanctioned, 2),
        "total_disbursed_inr": round(total_disbursed, 2),
        "provenance": {
            "source": "data.gov.in / eSAKSHI",
            "source_type": "OFFICIAL_PUBLIC",
            "is_synthetic": False
        }
    }


@router.get("/mps", summary="List Members of Parliament with allocated limits")
def list_mps(
    state: Optional[str] = None,
    house: Optional[str] = None,
    limit: int = Query(50, le=500)
):
    results = MP_RECORDS
    if state:
        results = [m for m in results if state.lower() in m["state"].lower()]
    if house:
        results = [m for m in results if house.upper() in m["house"].upper()]
    return {
        "count": len(results[:limit]),
        "total": len(results),
        "mps": results[:limit]
    }


@router.get("/list", summary="List MPLADS Works / Projects with pagination and filters")
def list_projects(
    state: Optional[str] = None,
    work_category: Optional[str] = None,
    mp_name: Optional[str] = None,
    limit: int = Query(50, le=500),
    offset: int = 0
):
    filtered = WORK_RECORDS
    if state:
        filtered = [w for w in filtered if state.lower() in w["state"].lower()]
    if work_category:
        filtered = [w for w in filtered if work_category.lower() in w["work_category"].lower()]
    if mp_name:
        filtered = [w for w in filtered if w.get("mp_name") and mp_name.lower() in w["mp_name"].lower()]

    paginated = filtered[offset : offset + limit]
    return {
        "total": len(filtered),
        "limit": limit,
        "offset": offset,
        "projects": paginated
    }


# -----------------------------------------------------------------------------
# STEP 1 & 2: LIVE RISK ASSESSMENT & PEER COMPARISON ENDPOINTS
# -----------------------------------------------------------------------------

@router.get("/{work_id:path}/risk-assessment", summary="Live AI Risk Assessment for a specific project")
def get_project_risk_assessment(work_id: str):
    """
    Evaluates project risk dynamically using risk_engine.evaluate_project_risk()
    and peer cohort statistics from official dataset.
    """
    project = _find_project(work_id)
    if not project:
        raise HTTPException(status_code=404, detail=f"Work record with ID '{work_id}' not found in dataset.")

    peer_stats = peer_engine.get_peer_stats(project, PEER_BENCHMARKS)
    risk_evaluation = risk_engine.evaluate_project_risk(project, peer_stats)
    
    # Retrieve latest officer decision if any
    latest_decision = get_latest_officer_decision(work_id)
    
    return {
        **risk_evaluation,
        "peer_group_summary": peer_stats,
        "latest_officer_decision": latest_decision
    }


@router.get("/{work_id:path}/peer-comparison", summary="Real Computed Peer Statistics for a specific project")
def get_project_peer_comparison(work_id: str):
    """
    Computes real localized peer statistics (mean, median, IQR, Z-Score, and material benchmarks)
    for a specific project's category, state, and cost band.
    """
    project = _find_project(work_id)
    if not project:
        raise HTTPException(status_code=404, detail=f"Work record with ID '{work_id}' not found in dataset.")

    peer_stats = peer_engine.get_peer_stats(project, PEER_BENCHMARKS)
    return peer_stats


# -----------------------------------------------------------------------------
# STEP 3: OFFICER DECISION PERSISTENCE & HISTORY ENDPOINTS
# -----------------------------------------------------------------------------

@router.post("/{work_id:path}/decision", summary="Submit & persist officer decision to database")
def submit_officer_decision(work_id: str, payload: DecisionPayload):
    """
    Records the district officer's decision, justification notes, officer ID,
    and timestamp into the SQLite database and updates the immutable audit ledger.
    """
    clean_id = work_id.strip('/').rstrip('-').strip()
    
    # Save to SQLite Database
    persisted = save_officer_decision(
        project_id=clean_id,
        decision=payload.decision,
        notes=payload.notes,
        officer_id=payload.officer_id or "OFFICER-001",
        officer_name=payload.officer_name or "District Planning Officer"
    )

    # Record in Audit Ledger
    ledger_engine.record_entry(
        project_id=clean_id,
        decision_type="OFFICER_HUMAN_DECISION",
        computed_score=0.0,
        component_breakdown={},
        data_sources_used=[{"source_name": "District Nodal Officer Input", "source_type": "OFFICIAL_GOV_OFFICER", "is_synthetic": False}],
        human_decision=payload.decision,
        outcome=payload.notes
    )

    return {
        "status": "SUCCESS",
        "message": "Officer decision recorded in official database.",
        "decision": persisted
    }


@router.get("/{work_id:path}/decision", summary="Get latest officer decision for project")
@router.get("/{work_id:path}/decisions", summary="Get all officer decision history for project")
def get_project_decisions(work_id: str):
    """
    Retrieves the persisted officer decision history for a project from SQLite database.
    """
    clean_id = work_id.strip('/').rstrip('-').strip()
    history = get_officer_decisions(clean_id)
    latest = history[0] if history else None

    return {
        "project_id": clean_id,
        "total_decisions": len(history),
        "latest_decision": latest,
        "decisions": history
    }


@router.get("/{work_id:path}", summary="Get detailed record of a specific work project")
def get_project_by_id(work_id: str):
    match = _find_project(work_id)
    if not match:
        raise HTTPException(status_code=404, detail=f"Work record with ID '{work_id}' not found.")
    
    # Associated expenditures
    clean_id = match["work_id"].lower()
    related_exps = [e for e in EXPENDITURE_RECORDS if e["work_id"].lower() == clean_id]
    
    return {
        "project": match,
        "expenditures": related_exps
    }


@router.patch("/{work_id:path}/stage", summary="Update project execution stage on Kanban Board")
def update_project_stage(
    work_id: str,
    new_stage: str = Query(..., description="Target Kanban stage: TODO | IN_PROGRESS | DONE | BLOCKED"),
    notes: Optional[str] = None
):
    """
    Updates the execution stage of an MPLADS project and records the transition in audit memory.
    """
    valid_stages = ["TODO", "IN_PROGRESS", "DONE", "BLOCKED", "RECOMMENDED", "SANCTIONED", "COMPLETION_REPORTED"]
    normalized_stage = new_stage.upper().strip()
    if normalized_stage not in valid_stages:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid stage '{new_stage}'. Must be one of: {valid_stages}"
        )

    match = _find_project(work_id)
    if not match:
        raise HTTPException(status_code=404, detail=f"Work record with ID '{work_id}' not found.")

    old_stage = match.get("current_stage", "RECOMMENDED")
    match["current_stage"] = normalized_stage
    match["last_updated_stage"] = normalized_stage

    return {
        "status": "SUCCESS",
        "work_id": match["work_id"],
        "old_stage": old_stage,
        "new_stage": normalized_stage,
        "notes": notes or "Updated via Project Execution Kanban Board"
    }
