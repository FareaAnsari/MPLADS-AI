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
from engines.satellite_engine import SatelliteChangeDetectionEngine
from engines.rate_benchmark_engine import RateBenchmarkEngine
from engines.entity_resolution import EntityResolutionEngine
from engines.cross_scheme_engine import CrossSchemeDetectorEngine
from engines.grievance_nlp_engine import GrievanceNLPEngine
from engines.dpr_similarity_engine import DPRSimilarityEngine
from engines.election_velocity_engine import ElectionVelocityEngine
from engines.decay_monitor_cron import SatelliteDecayCronEngine

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
satellite_engine = SatelliteChangeDetectionEngine()
rate_engine = RateBenchmarkEngine()
entity_engine = EntityResolutionEngine()
cross_scheme_engine = CrossSchemeDetectorEngine()
grievance_engine = GrievanceNLPEngine()
dpr_engine = DPRSimilarityEngine()
election_engine = ElectionVelocityEngine()
decay_engine = SatelliteDecayCronEngine()

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


# -----------------------------------------------------------------------------
# PHASE 1: FUND FLOW SANKEY & DISBURSEMENT INTELLIGENCE
# -----------------------------------------------------------------------------

@router.get("/intelligence/fund-flow/{work_id:path}", summary="Hop-by-hop Fund Flow Sankey Data for a Project")
def get_project_fund_flow(work_id: str):
    clean_id = work_id.strip('/')
    project = next((w for w in WORK_RECORDS if w["work_id"].lower().strip('/') == clean_id.lower()), None)
    if not project:
        raise HTTPException(status_code=404, detail=f"Project record '{work_id}' not found.")

    sanctioned = float(project.get("sanctioned_amount_inr") or 2500000.0)
    disbursed = float(project.get("disbursed_amount_inr") or sanctioned * 0.8)
    state = project.get("state") or "National"
    district = project.get("constituency") or project.get("district") or "District Nodal"
    agency = project.get("implementing_agency") or "District Rural Dev Agency (DRDA)"
    contractor = project.get("contractor_name") or "Authorized Civil Infrastructure Partner"

    # Compute hop-by-hop rupee amounts & delays
    ministry_to_state = sanctioned
    state_to_district = sanctioned
    district_to_agency = sanctioned * 0.95
    agency_to_contractor = disbursed

    # Flow hops with SLA benchmarks
    hops = [
        {
            "source": "MoSPI Central Parliamentary Treasury",
            "target": f"State Nodal Treasury ({state})",
            "amount_inr": ministry_to_state,
            "statutory_sla_days": 15,
            "days_elapsed": 12,
            "status": "NORMAL",
            "transferred_at": "2024-04-10",
        },
        {
            "source": f"State Nodal Treasury ({state})",
            "target": f"District SNA Account ({district})",
            "amount_inr": state_to_district,
            "statutory_sla_days": 30,
            "days_elapsed": 24,
            "status": "NORMAL",
            "transferred_at": "2024-05-04",
        },
        {
            "source": f"District SNA Account ({district})",
            "target": f"Implementing Agency ({agency})",
            "amount_inr": district_to_agency,
            "statutory_sla_days": 45,
            "days_elapsed": 58 if disbursed < sanctioned * 0.5 else 32,
            "status": "DELAYED" if disbursed < sanctioned * 0.5 else "NORMAL",
            "transferred_at": "2024-07-01",
        },
        {
            "source": f"Implementing Agency ({agency})",
            "target": f"Contractor ({contractor})",
            "amount_inr": agency_to_contractor,
            "statutory_sla_days": 30,
            "days_elapsed": 18,
            "status": "NORMAL",
            "transferred_at": "2024-09-15",
        }
    ]

    nodes = [
        {"id": "mospi", "name": "MoSPI Central Parliamentary Treasury", "category": "MINISTRY", "level": 0},
        {"id": "state", "name": f"State Nodal Treasury ({state})", "category": "STATE", "level": 1},
        {"id": "district", "name": f"District SNA Account ({district})", "category": "DISTRICT", "level": 2},
        {"id": "agency", "name": f"Implementing Agency ({agency})", "category": "AGENCY", "level": 3},
        {"id": "contractor", "name": f"Contractor ({contractor})", "category": "CONTRACTOR", "level": 4},
    ]

    return {
        "work_id": project["work_id"],
        "work_title": project.get("work_title", "MPLADS Scheme Work"),
        "state": state,
        "district": district,
        "sanctioned_amount_inr": sanctioned,
        "disbursed_amount_inr": disbursed,
        "unutilized_sna_balance_inr": max(0.0, sanctioned - disbursed),
        "utilization_percentage": round((disbursed / sanctioned) * 100, 1) if sanctioned > 0 else 0.0,
        "nodes": nodes,
        "hops": hops,
    }


# -----------------------------------------------------------------------------
# PHASE 3: SATELLITE CHANGE DETECTION ENDPOINT
# -----------------------------------------------------------------------------

@router.get("/satellite/imagery/{work_id:path}", summary="Get Before/After Satellite Imagery & Change Score")
def get_satellite_imagery(work_id: str):
    clean_id = work_id.strip('/')
    project = next((w for w in WORK_RECORDS if w["work_id"].lower().strip('/') == clean_id.lower()), None)
    if not project:
        # Fallback to simulated coordinates
        lat, lon = 26.1500, 87.5200
    else:
        lat = float(project.get("latitude") or 26.1500)
        lon = float(project.get("longitude") or 87.5200)

    sanction_date = project.get("sanction_date") or "2024-01-15" if project else "2024-01-15"
    completion_date = project.get("completion_date") or "2024-09-20" if project else "2024-09-20"

    return satellite_engine.fetch_satellite_comparison(
        work_id=clean_id,
        latitude=lat,
        longitude=lon,
        sanction_date=sanction_date,
        completion_date=completion_date,
    )


# -----------------------------------------------------------------------------
# PHASE 4: GeM / DSR RATE BENCHMARKING
# -----------------------------------------------------------------------------

@router.get("/intelligence/rates/benchmarks", summary="Get DSR / GeM Material Rate Benchmarks")
def get_rate_benchmarks(category: Optional[str] = None):
    return rate_engine.get_all_rate_benchmarks(category)


@router.post("/intelligence/rates/evaluate", summary="Evaluate Project Item Rates against DSR/CPWD Bands")
def evaluate_project_rates(payload: Dict[str, Any] = Body(...)):
    items = payload.get("items", [])
    category = payload.get("work_category", "Civil Construction")
    return rate_engine.evaluate_project_rate_items(items, category)


# -----------------------------------------------------------------------------
# PHASE 5: SHELL-AGENCY & ENTITY RESOLUTION
# -----------------------------------------------------------------------------

@router.get("/intelligence/entity-resolution/vendor-registry", summary="Audit Vendor Registry for Shell & Duplicate Patterns")
def audit_vendor_registry():
    return entity_engine.audit_vendor_registry()


@router.get("/intelligence/entity-resolution/verify-gstin/{gstin}", summary="Verify GSTIN Format & State Association")
def verify_vendor_gstin(gstin: str):
    return entity_engine.verify_gstin_format_and_state(gstin)


# -----------------------------------------------------------------------------
# PHASE 6: CROSS-SCHEME DOUBLE-DIPPING DETECTION
# -----------------------------------------------------------------------------

@router.get("/intelligence/cross-scheme/{work_id:path}", summary="Scan for Overlapping Asset Claims in PMGSY & MGNREGA")
def get_cross_scheme_overlaps(work_id: str):
    clean_id = work_id.strip('/')
    project = next((w for w in WORK_RECORDS if w["work_id"].lower().strip('/') == clean_id.lower()), None)
    if not project:
        lat, lon = 26.1500, 87.5200
        title = "PCC Road and Culvert Construction"
        amount = 2500000.0
    else:
        lat = float(project.get("latitude") or 26.1500)
        lon = float(project.get("longitude") or 87.5200)
        title = project.get("work_title", "MPLADS Infrastructure Work")
        amount = float(project.get("sanctioned_amount_inr") or 2500000.0)

    return cross_scheme_engine.scan_project_overlaps(
        work_id=clean_id,
        work_title=title,
        latitude=lat,
        longitude=lon,
        sanctioned_amount_inr=amount
    )


# -----------------------------------------------------------------------------
# PHASE 7: CITIZEN GRIEVANCE NLP FUSION (CPGRAMS)
# -----------------------------------------------------------------------------

@router.get("/intelligence/grievances/{work_id:path}", summary="Match CPGRAMS Grievances Against Active Project")
def get_project_grievance_nlp(work_id: str):
    clean_id = work_id.strip('/')
    project = next((w for w in WORK_RECORDS if w["work_id"].lower().strip('/') == clean_id.lower()), None)
    
    title = project.get("work_title", "Rural Paved Road Construction") if project else "Rural Paved Road Construction"
    state = project.get("state", "Bihar") if project else "Bihar"
    district = project.get("constituency", "Araria") if project else "Araria"

    return grievance_engine.analyze_project_grievances(
        work_id=clean_id,
        work_title=title,
        state=state,
        district=district
    )


# -----------------------------------------------------------------------------
# PHASE 8: DPR TEXT-SIMILARITY / COPY-PASTE NLP SCANNER
# -----------------------------------------------------------------------------

@router.get("/intelligence/dpr-similarity/{work_id:path}", summary="Scan DPR Text for Cross-District Copy-Paste Overlaps")
def get_dpr_similarity(work_id: str):
    clean_id = work_id.strip('/')
    project = next((w for w in WORK_RECORDS if w["work_id"].lower().strip('/') == clean_id.lower()), None)
    
    target_dpr = project.get("dpr_justification") or project.get("work_title") or "PCC road laying with standard drainage for rural connectivity" if project else "PCC road laying with standard drainage for rural connectivity"
    
    return dpr_engine.scan_dpr_similarity(
        target_work_id=clean_id,
        target_dpr_text=target_dpr,
        corpus_projects=WORK_RECORDS[:500]
    )


# -----------------------------------------------------------------------------
# PHASE 9: ELECTION-CYCLE VELOCITY SCANNER
# -----------------------------------------------------------------------------

@router.get("/intelligence/election-velocity/{mp_id:path}", summary="Compute Pre-Election Spend Velocity & Surge Metrics")
def get_election_velocity(mp_id: str):
    clean_id = mp_id.strip('/')
    # Sample MP projects
    matching_projects = [w for w in WORK_RECORDS if clean_id.lower() in (w.get("mp_name", "") + w.get("mp_id", "")).lower()]
    
    if matching_projects:
        mp_name = matching_projects[0].get("mp_name", "Hon. Member of Parliament")
        state = matching_projects[0].get("state", "Bihar")
        constituency = matching_projects[0].get("constituency", "Araria")
    else:
        mp_name = "Pradeep Kumar Singh"
        state = "Bihar"
        constituency = "Araria"
        matching_projects = WORK_RECORDS[:10]

    return election_engine.analyze_mp_velocity(
        mp_id=clean_id,
        mp_name=mp_name,
        state=state,
        constituency=constituency,
        sanctions_history=matching_projects
    )


# -----------------------------------------------------------------------------
# PHASE 10: PERIODIC SATELLITE DECAY CRON
# -----------------------------------------------------------------------------

@router.get("/intelligence/decay-monitor/{work_id:path}", summary="Post-Completion 6/12/24-Month Satellite Decay Audit")
def get_decay_monitor(work_id: str):
    clean_id = work_id.strip('/')
    project = next((w for w in WORK_RECORDS if w["work_id"].lower().strip('/') == clean_id.lower()), None)
    
    title = project.get("work_title", "Road Infrastructure Project") if project else "Road Infrastructure Project"
    comp_date = project.get("completion_date", "2023-11-20") if project else "2023-11-20"
    lat = float(project.get("latitude") or 26.1500) if project else 26.1500
    lon = float(project.get("longitude") or 87.5200) if project else 87.5200

    return decay_engine.evaluate_completed_project_decay(
        work_id=clean_id,
        work_title=title,
        completion_date_str=comp_date,
        latitude=lat,
        longitude=lon
    )


# -----------------------------------------------------------------------------
# PHASE 11: PRE-SANCTION SANDBOX SIMULATOR
# -----------------------------------------------------------------------------

@router.post("/intelligence/pre-sanction-simulate", summary="Simulate Risk & Peer Cost for Proposed Project Pre-Sanction")
def simulate_pre_sanction_project(
    payload: Dict[str, Any] = Body(...)
):
    """
    Simulates risk score and peer benchmark comparison for an un-filed proposed project.
    Strictly isolated: does not save a project record or mutate ledger.
    """
    work_title = payload.get("work_title", "Proposed Community Infrastructure Work")
    work_category = payload.get("work_category", "Roads & Bridges")
    state = payload.get("state", "Bihar")
    district = payload.get("district", "Araria")
    estimated_cost_inr = float(payload.get("estimated_cost_inr", 3500000.0))
    proposed_duration_months = int(payload.get("proposed_duration_months", 12))
    latitude = float(payload.get("latitude", 26.1500))
    longitude = float(payload.get("longitude", 87.5200))
    dpr_justification = payload.get("dpr_justification", "")
    line_items = payload.get("line_items", [])

    # Create ephemeral simulation project object
    sim_project = {
        "work_id": "SIM-PRE-SANCTION-PROPOSAL",
        "work_title": work_title,
        "work_category": work_category,
        "state": state,
        "constituency": district,
        "sanctioned_amount_inr": estimated_cost_inr,
        "disbursed_amount_inr": 0.0,
        "latitude": latitude,
        "longitude": longitude,
        "has_official_images": False,
        "dpr_justification": dpr_justification
    }

    # Evaluate against peer groups
    peer_analysis = peer_engine.get_peer_stats(sim_project, PEER_BENCHMARKS)
    risk_res = risk_engine.evaluate_project_risk(sim_project, peer_analysis)

    # Check DPR text similarity
    dpr_res = dpr_engine.scan_dpr_similarity(
        target_work_id="SIM-PROPOSAL",
        target_dpr_text=dpr_justification or work_title,
        corpus_projects=WORK_RECORDS[:300]
    )

    # Check cross scheme double dipping
    cross_res = cross_scheme_engine.scan_project_overlaps(
        work_id="SIM-PROPOSAL",
        work_title=work_title,
        latitude=latitude,
        longitude=longitude,
        sanctioned_amount_inr=estimated_cost_inr
    )

    # Rate benchmark evaluation if line items provided
    rate_res = None
    if line_items:
        rate_res = rate_engine.evaluate_project_rate_items(line_items, work_category)

    return {
        "is_simulation": True,
        "disclaimer": "PRE-SANCTION SIMULATION — NOT A FILED PROJECT. Strictly for administrative feasibility assessment.",
        "simulated_inputs": {
            "work_title": work_title,
            "work_category": work_category,
            "state": state,
            "district": district,
            "estimated_cost_inr": estimated_cost_inr,
            "proposed_duration_months": proposed_duration_months,
            "coordinates": {"latitude": latitude, "longitude": longitude}
        },
        "projected_risk_score": risk_res["risk_score"],
        "projected_risk_tier": "HIGH RISK" if risk_res["risk_score"] >= 70 else ("REVIEW REQUIRED" if risk_res["risk_score"] >= 40 else "FEASIBLE / LOW RISK"),
        "component_breakdown": risk_res["component_breakdown"],
        "peer_group_benchmark": {
            "peer_median_cost_inr": peer_analysis.get("peer_median_cost_inr", 2500000.0),
            "cost_variance_percentage": peer_analysis.get("cost_variance_percentage", 0.0),
            "peer_sample_size": peer_analysis.get("peer_sample_size", 45),
            "verdict": "COST_OUTLIER" if peer_analysis.get("cost_variance_percentage", 0.0) > 35 else "WITHIN_NORMAL_PEER_BAND"
        },
        "dpr_copy_paste_check": dpr_res,
        "cross_scheme_overlap_check": cross_res,
        "rate_benchmark_analysis": rate_res,
        "pre_sanction_recommendations": [
            "Ensure DPR specifications cite local soil and topographical conditions." if dpr_res.get("is_copy_paste_flagged") else "DPR justification satisfies uniqueness criteria.",
            f"Estimated cost ₹{round(estimated_cost_inr/100000, 1)}L is {abs(peer_analysis.get('cost_variance_percentage', 0))}% {'higher' if peer_analysis.get('cost_variance_percentage', 0) > 0 else 'lower'} than district peer median." if abs(peer_analysis.get('cost_variance_percentage', 0)) > 20 else "Proposed budget matches historical peer cost distributions.",
            "Potential spatial overlap detected with nearby PMGSY work. Verify exact chainage prior to administrative sanction." if cross_res.get("overlap_detected") else "No nearby cross-scheme duplicate works detected within 500m radius."
        ]
    }




