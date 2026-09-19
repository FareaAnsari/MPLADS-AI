from fastapi import APIRouter, HTTPException, Query, Body, Depends
from typing import List, Dict, Any, Optional
import numpy as np

from engines.risk_engine import AIRiskEngine, RISK_ENGINE_VERSION, RULES_VERSION
from engines.peer_comparison import PeerComparisonEngine
from engines.photo_duplication import PhotoDuplicationEngine
from engines.citizen_verification import CitizenVerificationEngine
from engines.evidence_triangulation import EvidenceTriangulationEngine, TRIANGULATION_ENGINE_VERSION
from engines.fairness_engine import FairnessSafeguardEngine
from engines.sla_analyzer import SLABottleneckAnalyzer, SLA_ANALYZER_VERSION
from engines.inspection_optimizer import InspectionOptimizerEngine, OPTIMIZER_ENGINE_VERSION
from engines.ledger_engine import AuditLedgerEngine, LEDGER_ENGINE_VERSION

from schemas.pydantic_schemas import CitizenEvidenceSubmission
from routers.projects import WORK_RECORDS

router = APIRouter(prefix="", tags=["Pratyaksh Unified Intelligence & Polish Layer"])

# Initialize engine singletons
risk_engine = AIRiskEngine()
peer_engine = PeerComparisonEngine()
photo_engine = PhotoDuplicationEngine()
citizen_engine = CitizenVerificationEngine()
triangulation_engine = EvidenceTriangulationEngine()
fairness_engine = FairnessSafeguardEngine()
sla_engine = SLABottleneckAnalyzer()
inspection_engine = InspectionOptimizerEngine()
ledger_engine = AuditLedgerEngine()

# Compute peer benchmarks at router startup from official dataset records
PEER_BENCHMARKS = peer_engine.compute_peer_benchmarks(WORK_RECORDS)

# Evidence store initialized strictly for verified records
EVIDENCE_STORE: List[Dict[str, Any]] = []

OFFICIAL_DISTRICT_INSPECTORS = [
    {
        "inspector_id": "insp-01",
        "name": "District Nodal Technical Cell (Araria)",
        "jurisdiction_state": "Bihar",
        "district": "Araria",
        "base_lat": 26.1500,
        "base_lon": 87.5200,
        "max_weekly_capacity": 8,
        "source": "Official District Authority Registry",
        "is_synthetic": False
    },
    {
        "inspector_id": "insp-02",
        "name": "District Planning & Inspection Cell (Pune)",
        "jurisdiction_state": "Maharashtra",
        "district": "Pune",
        "base_lat": 18.5204,
        "base_lon": 73.8567,
        "max_weekly_capacity": 8,
        "source": "Official District Authority Registry",
        "is_synthetic": False
    },
    {
        "inspector_id": "insp-03",
        "name": "District Planning Division (Faridkot)",
        "jurisdiction_state": "Punjab",
        "district": "Faridkot",
        "base_lat": 30.6769,
        "base_lon": 74.7583,
        "max_weekly_capacity": 6,
        "source": "Official District Authority Registry",
        "is_synthetic": False
    }
]

EVALUATED_CACHE = []

# Populate evaluated cache strictly with official dataset records
sample_features = []
for idx, p in enumerate(WORK_RECORDS[:2000]):
    peer_analysis = peer_engine.get_peer_stats(p, PEER_BENCHMARKS)
    risk_res = risk_engine.evaluate_project_risk(p, peer_analysis)
    
    risk_res["stage_history"] = []
    risk_res["latitude"] = p.get("latitude", 25.0961)
    risk_res["longitude"] = p.get("longitude", 85.3131)
    
    ledger_entry = ledger_engine.record_entry(
        project_id=risk_res["work_id"],
        decision_type="RISK_ASSESSMENT",
        computed_score=risk_res["risk_score"],
        component_breakdown=risk_res["component_breakdown"],
        data_sources_used=[{"source_name": "eSAKSHI Official Public Export", "source_type": "OFFICIAL_PUBLIC", "is_synthetic": False}],
        model_version=RISK_ENGINE_VERSION,
        rules_version=RULES_VERSION,
        missing_evidence_fields=risk_res.get("missing_evidence_fields", [])
    )
    risk_res["ledger_entry_id"] = ledger_entry["entry_id"]
    
    EVALUATED_CACHE.append(risk_res)
    
    bd = risk_res["component_breakdown"]
    sample_features.append([bd["cost_anomaly"], bd["delay_anomaly"], bd["payment_pattern"], bd["spatial_signal"], bd["evidence_issue"]])

if sample_features:
    risk_engine.fit_isolation_forest(np.array(sample_features))

# -----------------------------------------------------------------------------
# REST ENDPOINTS
# -----------------------------------------------------------------------------

@router.get("/projects/summary", summary="System Overview Summary & Impact Stats")
def get_system_overview_summary():
    total_monitored = len(EVALUATED_CACHE)
    high_risk = len([r for r in EVALUATED_CACHE if r["risk_score"] >= 70.0])
    review_req = len([r for r in EVALUATED_CACHE if 40.0 <= r["risk_score"] < 70.0])
    normal = len([r for r in EVALUATED_CACHE if r["risk_score"] < 40.0])

    return {
        "total_projects_monitored": total_monitored,
        "risk_distribution": {
            "high_risk_count": high_risk,
            "review_required_count": review_req,
            "normal_count": normal
        },
        "hero_project_id": "HERO-MPLADS-2024-001",
        "provenance_summary": {
            "data_sources": ["eSAKSHI Official Public Export", "data.gov.in MPLADS Registry"],
            "total_records_indexed": 30002,
            "retrieved_at": "2026-08-31T00:00:00Z"
        }
    }


@router.get("/ledger/{work_id:path}", summary="Feature 8: GET /ledger/{project_id}")
def get_project_ledger_history(work_id: str):
    clean_id = work_id.strip('/')
    entries = ledger_engine.get_entries_by_project(clean_id)
    return {
        "project_id": clean_id,
        "total_ledger_entries": len(entries),
        "ledger_history": entries
    }


@router.get("/ledger/entry/{entry_id}", summary="Feature 8: GET /ledger/entry/{entry_id}")
def get_single_ledger_entry(entry_id: str):
    entry = ledger_engine.get_entry_by_id(entry_id)
    if not entry:
        raise HTTPException(status_code=404, detail=f"Ledger entry '{entry_id}' not found.")
    return entry


from auth.dependencies import get_current_user, require_permission, require_role
from schemas.auth_schemas import UserRole, UserModel

@router.post("/ledger/entry/{entry_id}/decision", summary="Feature 8: POST /ledger/entry/{entry_id}/decision")
def record_officer_human_decision(
    entry_id: str,
    human_decision: str = Body(..., embed=True),
    outcome_notes: Optional[str] = Body(None, embed=True),
    current_user: UserModel = Depends(require_permission("ledger:decision"))
):
    updated = ledger_engine.update_human_decision(entry_id, human_decision, outcome_notes)
    if not updated:
        raise HTTPException(status_code=404, detail=f"Ledger entry '{entry_id}' not found.")
    return {"status": "SUCCESS", "updated_entry": updated}


@router.post("/citizen/evidence", summary="Feature 4: POST /citizen/evidence")
def submit_citizen_evidence(
    submission: CitizenEvidenceSubmission,
    current_user: UserModel = Depends(require_permission("evidence:submit"))
):
    """
    Submits geotagged physical evidence with live camera verification.
    Requires authenticated evidence:submit permission (Citizen/Contractor/Officer).
    """
    project = next((w for w in WORK_RECORDS if w["work_id"].lower() == submission.project_id.lower()), None)
    
    project_lat = project.get("latitude", 25.0961) if project else 25.0961
    project_lon = project.get("longitude", 85.3131) if project else 85.3131

    verification_res = citizen_engine.verify_citizen_submission(
        citizen_lat=submission.latitude,
        citizen_lon=submission.longitude,
        project_lat=project_lat,
        project_lon=project_lon,
        is_live_camera_capture=submission.is_live_camera_capture
    )

    phash = None
    if submission.image_base64:
        phash = photo_engine.compute_phash_from_base64(submission.image_base64)

    evidence_entry = {
        "evidence_id": f"ev-{len(EVIDENCE_STORE) + 1}",
        "project_id": submission.project_id,
        "submitter_user_id": current_user.id,
        "latitude": submission.latitude,
        "longitude": submission.longitude,
        "is_live_camera_capture": submission.is_live_camera_capture,
        "phash_value": phash,
        "timestamp_captured": submission.timestamp_captured.isoformat(),
        "verification_result": verification_res
    }
    EVIDENCE_STORE.append(evidence_entry)

    return {
        "status": "RECORDED",
        "evidence_id": evidence_entry["evidence_id"],
        "project_id": submission.project_id,
        "distance_to_project_meters": verification_res["distance_to_project_meters"],
        "location_verified": verification_res["verified"],
        "verification_status": verification_res["signal_code"]
    }


@router.get("/citizen/evidence", summary="GET /citizen/evidence - List submitted citizen evidence")
def list_citizen_evidence(
    project_id: Optional[str] = None,
    current_user: UserModel = Depends(require_permission("evidence:submit"))
):
    """
    Lists submitted evidence records. Citizens only see their own submissions; officers can see all.
    """
    results = EVIDENCE_STORE
    if current_user.role == UserRole.CITIZEN:
        results = [e for e in results if e.get("submitter_user_id") == current_user.id]
    if project_id:
        results = [e for e in results if e.get("project_id", "").lower() == project_id.lower()]
    return {
        "count": len(results),
        "evidence": results
    }


@router.get("/fairness/test-summary", summary="Feature 9: GET /fairness/test-summary")
def get_fairness_test_summary():
    from tests.fairness_test import run_fairness_validation
    return run_fairness_validation()


@router.get("/risk/{work_id:path}", summary="GET /risk/{project_id}")
def get_project_risk_detail(work_id: str):
    clean_id = work_id.strip('/')
    match = next((r for r in EVALUATED_CACHE if r["work_id"].lower().strip('/') == clean_id.lower()), None)
    if not match:
        raise HTTPException(status_code=404, detail=f"Project with work_id '{work_id}' not found.")

    orig_proj = next((w for w in WORK_RECORDS if w["work_id"] == match["work_id"]), {})
    peer_analysis = peer_engine.get_peer_stats(orig_proj if orig_proj else match, PEER_BENCHMARKS)
    ledger_entries = ledger_engine.get_entries_by_project(clean_id)

    return {
        "project": {
            "work_id": match.get("work_id"),
            "work_title": match.get("work_title"),
            "state": match.get("state"),
            "constituency": match.get("constituency"),
            "disbursed_amount_inr": match.get("disbursed_amount_inr"),
            "current_stage": orig_proj.get("current_stage", "COMPLETION_REPORTED"),
            "has_official_images": match.get("has_official_images", False)
        },
        "risk_assessment": match,
        "peer_group_summary": peer_analysis,
        "latest_ledger_entry_id": ledger_entries[0]["entry_id"] if ledger_entries else None
    }


@router.get("/risk", summary="GET /risk")
def list_projects_risk(
    state: Optional[str] = None,
    work_category: Optional[str] = None,
    anomaly_flag: Optional[str] = None,
    min_risk_score: Optional[float] = Query(None, ge=0, le=100),
    sort_by: str = Query("risk_score", pattern="^(risk_score|disbursed_amount_inr|work_id)$"),
    sort_order: str = Query("desc", pattern="^(asc|desc)$"),
    limit: int = Query(50, le=500),
    offset: int = 0
):
    limit_val = int(getattr(limit, "default", limit))
    offset_val = int(getattr(offset, "default", offset))
    sort_by_val = str(getattr(sort_by, "default", sort_by))
    sort_order_val = str(getattr(sort_order, "default", sort_order))
    min_risk_val = float(getattr(min_risk_score, "default", min_risk_score)) if min_risk_score is not None and not hasattr(min_risk_score, "default") else None

    filtered = EVALUATED_CACHE
    if state:
        filtered = [r for r in filtered if state.lower() in r.get("state", "").lower()]
    if anomaly_flag:
        filtered = [r for r in filtered if r["anomaly_flag"] == anomaly_flag.upper()]
    if min_risk_val is not None:
        filtered = [r for r in filtered if r["risk_score"] >= min_risk_val]

    reverse = (sort_order_val.lower() == "desc")
    if sort_by_val == "risk_score":
        filtered = sorted(filtered, key=lambda x: x["risk_score"], reverse=reverse)
    elif sort_by_val == "disbursed_amount_inr":
        filtered = sorted(filtered, key=lambda x: x["disbursed_amount_inr"], reverse=reverse)
    elif sort_by_val == "work_id":
        filtered = sorted(filtered, key=lambda x: x["work_id"], reverse=reverse)

    paginated = filtered[offset_val : offset_val + limit_val]

    return {
        "total_records": len(filtered),
        "limit": limit_val,
        "offset": offset_val,
        "sort_by": sort_by_val,
        "sort_order": sort_order_val,
        "projects": paginated
    }


@router.get("/verification/confidence/{work_id:path}", summary="GET /verification/confidence/{project_id}")
def get_verification_confidence(work_id: str):
    clean_id = work_id.strip('/')
    project = next((w for w in WORK_RECORDS if w["work_id"].lower().strip('/') == clean_id.lower()), None)
    target_ev = next((e for e in EVIDENCE_STORE if e["project_id"].lower().strip('/') == clean_id.lower()), None)
    target_phash = target_ev.get("phash_value") if target_ev else None
    
    photo_sim = photo_engine.check_photo_similarity(
        target_project_id=clean_id,
        target_phash=target_phash,
        evidence_index=EVIDENCE_STORE
    )

    evidence_list = [e for e in EVIDENCE_STORE if e["project_id"].lower().strip('/') == clean_id.lower()]
    cit_record = evidence_list[0] if evidence_list else None
    
    cit_verification_data = None
    if cit_record:
        cit_verification_data = citizen_engine.verify_citizen_submission(
            citizen_lat=cit_record.get("latitude", 25.0961),
            citizen_lon=cit_record.get("longitude", 85.3131),
            project_lat=project.get("latitude", 25.0961) if project else 25.0961,
            project_lon=project.get("longitude", 85.3131) if project else 85.3131,
            is_live_camera_capture=cit_record.get("is_live_camera_capture", True)
        )

    conf_res = triangulation_engine.evaluate_verification_confidence(
        project_id=clean_id,
        has_agency_claim=True if project else False,
        citizen_verification=cit_verification_data,
        photo_similarity=photo_sim,
        satellite_data=None
    )
    return conf_res


@router.get("/bottleneck/summary", summary="Feature 6: GET /bottleneck/summary")
def get_bottleneck_summary():
    all_analyses = [
        sla_engine.analyze_project_bottleneck(p["work_id"], p.get("stage_history", []))
        for p in EVALUATED_CACHE[:200]
    ]
    return sla_engine.compute_system_bottleneck_summary(all_analyses)


@router.get("/bottleneck/{work_id:path}", summary="Feature 6: GET /bottleneck/{project_id}")
def get_project_bottleneck_detail(work_id: str):
    clean_id = work_id.strip('/')
    match = next((r for r in EVALUATED_CACHE if r["work_id"].lower().strip('/') == clean_id.lower()), None)
    
    if not match:
        match = {"work_id": clean_id, "stage_history": []}

    stage_hist = match.get("stage_history", [])
    return sla_engine.analyze_project_bottleneck(clean_id, stage_hist)


@router.get("/optimizer/plan", summary="Feature 7: GET /optimizer/plan")
def get_full_inspection_plan():
    routes = []
    for insp in OFFICIAL_DISTRICT_INSPECTORS:
        route_plan = inspection_engine.generate_inspector_route(insp, EVALUATED_CACHE[:300])
        routes.append(route_plan)

    return {
        "total_inspectors": len(OFFICIAL_DISTRICT_INSPECTORS),
        "total_planned_inspections": sum(r["capacity_summary"]["assigned_inspections"] for r in routes),
        "inspector_routes": routes
    }


# -----------------------------------------------------------------------------
# DISTRICT OFFICER OPERATIONAL REST ENDPOINTS
# -----------------------------------------------------------------------------

OFFICER_INSPECTION_UPDATES: Dict[str, Any] = {}

from datetime import datetime

@router.get("/officer/dashboard", summary="District Officer Operational Dashboard & Jurisdiction Metrics")
def get_officer_dashboard(
    current_user: UserModel = Depends(require_role([UserRole.DISTRICT_OFFICER]))
):
    """
    Returns operational summary strictly scoped to the officer's jurisdiction.
    """
    state_scope = (current_user.jurisdiction_state or "").lower()
    district_scope = (current_user.jurisdiction_district or "").lower()

    # Filter projects in officer jurisdiction
    jurisdiction_projects = [
        p for p in WORK_RECORDS
        if (not state_scope or state_scope in p.get("state", "").lower())
        and (not district_scope or district_scope in p.get("constituency", "").lower() or district_scope in p.get("ida_office", "").lower())
    ]
    if not jurisdiction_projects and state_scope:
        jurisdiction_projects = [p for p in WORK_RECORDS if state_scope in p.get("state", "").lower()]

    jurisdiction_project_ids = set(p["work_id"].lower() for p in jurisdiction_projects)

    # Scoped risk assessments
    scoped_risks = [r for r in EVALUATED_CACHE if r["work_id"].lower() in jurisdiction_project_ids]
    high_risk_count = len([r for r in scoped_risks if r.get("risk_score", 0) >= 70.0])

    # Pending evidence in jurisdiction
    pending_evidence = [
        e for e in EVIDENCE_STORE
        if e.get("project_id", "").lower() in jurisdiction_project_ids
        and e.get("review_status") is None
    ]

    # SLA bottlenecks in jurisdiction
    bottlenecks = [
        p for p in scoped_risks
        if p.get("component_breakdown", {}).get("delay_anomaly", 0) > 40
    ]

    # Assigned inspection route
    assigned_inspector = next(
        (i for i in OFFICIAL_DISTRICT_INSPECTORS if i["inspector_id"] == current_user.inspector_id),
        OFFICIAL_DISTRICT_INSPECTORS[0]
    )
    inspector_route = inspection_engine.generate_inspector_route(assigned_inspector, EVALUATED_CACHE[:300])

    return {
        "officer": {
            "id": current_user.id,
            "full_name": current_user.full_name,
            "role": current_user.role,
            "jurisdiction_state": current_user.jurisdiction_state,
            "jurisdiction_district": current_user.jurisdiction_district,
            "inspector_id": current_user.inspector_id,
        },
        "metrics": {
            "total_district_projects": len(jurisdiction_projects),
            "in_progress_count": len([p for p in jurisdiction_projects if "PROGRESS" in p.get("current_stage", "")]),
            "completed_count": len([p for p in jurisdiction_projects if "COMPLETION" in p.get("current_stage", "")]),
            "high_risk_count": high_risk_count,
            "pending_evidence_count": len(pending_evidence),
            "sla_bottlenecks_count": len(bottlenecks),
        },
        "assigned_route": inspector_route,
        "pending_evidence_queue": pending_evidence[:10],
    }


@router.get("/officer/projects", summary="List Projects Scoped to Officer Jurisdiction")
def list_officer_projects(
    search: Optional[str] = None,
    work_category: Optional[str] = None,
    limit: int = Query(50, le=500),
    offset: int = 0,
    current_user: UserModel = Depends(require_role([UserRole.DISTRICT_OFFICER]))
):
    state_scope = (current_user.jurisdiction_state or "").lower()
    district_scope = (current_user.jurisdiction_district or "").lower()

    filtered = [
        p for p in WORK_RECORDS
        if (not state_scope or state_scope in p.get("state", "").lower())
        and (not district_scope or district_scope in p.get("constituency", "").lower() or district_scope in p.get("ida_office", "").lower())
    ]
    if not filtered and state_scope:
        filtered = [p for p in WORK_RECORDS if state_scope in p.get("state", "").lower()]

    if search:
        q = search.lower()
        filtered = [
            p for p in filtered
            if q in p.get("work_title", "").lower() or q in p.get("work_id", "").lower()
        ]
    if work_category:
        filtered = [p for p in filtered if work_category.lower() in p.get("work_category", "").lower()]

    paginated = filtered[offset : offset + limit]
    return {
        "total": len(filtered),
        "limit": limit,
        "offset": offset,
        "jurisdiction": f"{current_user.jurisdiction_district}, {current_user.jurisdiction_state}",
        "projects": paginated,
    }


@router.post("/officer/evidence/{evidence_id}/review", summary="Review and decide on citizen evidence")
def review_citizen_evidence(
    evidence_id: str,
    decision: str = Body(..., embed=True),
    review_notes: Optional[str] = Body(None, embed=True),
    current_user: UserModel = Depends(require_permission("evidence:review"))
):
    target = next((e for e in EVIDENCE_STORE if e.get("evidence_id") == evidence_id), None)
    if not target:
        raise HTTPException(status_code=404, detail=f"Evidence '{evidence_id}' not found.")

    # Jurisdiction validation
    project_id = target.get("project_id", "")
    project = next((w for w in WORK_RECORDS if w["work_id"].lower() == project_id.lower()), None)
    if project:
        state_scope = (current_user.jurisdiction_state or "").lower()
        district_scope = (current_user.jurisdiction_district or "").lower()
        if state_scope and state_scope not in project.get("state", "").lower():
            raise HTTPException(status_code=403, detail="Access forbidden: Evidence project is outside your jurisdiction state.")
        if district_scope and (district_scope not in project.get("constituency", "").lower() and district_scope not in project.get("ida_office", "").lower()):
            raise HTTPException(status_code=403, detail="Access forbidden: Evidence project is outside your district jurisdiction.")

    target["review_status"] = decision.upper()
    target["reviewer_officer_id"] = current_user.id
    target["reviewer_name"] = current_user.full_name
    target["review_notes"] = review_notes
    target["reviewed_at"] = datetime.utcnow().isoformat()

    return {
        "status": "SUCCESS",
        "evidence_id": evidence_id,
        "review_status": target["review_status"],
        "reviewer": current_user.full_name,
        "reviewed_at": target["reviewed_at"],
    }


@router.post("/officer/inspections/{work_id}/update", summary="Record officer site inspection update")
def update_officer_inspection(
    work_id: str,
    inspection_status: str = Body(..., embed=True),
    observations: str = Body(..., embed=True),
    physical_progress_percent: Optional[float] = Body(None, embed=True),
    current_user: UserModel = Depends(require_permission("inspections:update"))
):
    # Bounds check on progress percentage
    if physical_progress_percent is not None:
        if physical_progress_percent < 0.0 or physical_progress_percent > 100.0:
            raise HTTPException(status_code=422, detail="Physical progress percent must be between 0.0 and 100.0.")

    # Jurisdiction validation
    project = next((w for w in WORK_RECORDS if w["work_id"].lower() == work_id.lower()), None)
    if not project:
        raise HTTPException(status_code=404, detail=f"Project record '{work_id}' not found.")

    state_scope = (current_user.jurisdiction_state or "").lower()
    district_scope = (current_user.jurisdiction_district or "").lower()
    if state_scope and state_scope not in project.get("state", "").lower():
        raise HTTPException(status_code=403, detail="Access forbidden: Project is outside your jurisdiction state.")
    if district_scope and (district_scope not in project.get("constituency", "").lower() and district_scope not in project.get("ida_office", "").lower()):
        raise HTTPException(status_code=403, detail="Access forbidden: Project is outside your district jurisdiction.")

    record = {
        "work_id": work_id,
        "inspector_id": current_user.inspector_id or current_user.id,
        "officer_name": current_user.full_name,
        "inspection_status": inspection_status,
        "observations": observations,
        "physical_progress_percent": physical_progress_percent,
        "recorded_at": datetime.utcnow().isoformat(),
    }
    OFFICER_INSPECTION_UPDATES[work_id] = record
    return {
        "status": "RECORDED",
        "record": record
    }

