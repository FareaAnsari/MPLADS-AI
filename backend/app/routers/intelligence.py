from fastapi import APIRouter, HTTPException, Query, Body
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


@router.post("/ledger/entry/{entry_id}/decision", summary="Feature 8: POST /ledger/entry/{entry_id}/decision")
def record_officer_human_decision(
    entry_id: str,
    human_decision: str = Body(..., embed=True),
    outcome_notes: Optional[str] = Body(None, embed=True)
):
    updated = ledger_engine.update_human_decision(entry_id, human_decision, outcome_notes)
    if not updated:
        raise HTTPException(status_code=404, detail=f"Ledger entry '{entry_id}' not found.")
    return {"status": "SUCCESS", "updated_entry": updated}


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
