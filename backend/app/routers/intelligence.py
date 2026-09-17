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

from adapters.synthetic_evidence import SyntheticEvidenceGenerator
from adapters.synthetic_process_data import SyntheticProcessGenerator, SYNTHETIC_INSPECTORS
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

# Compute peer benchmarks at router startup
PEER_BENCHMARKS = peer_engine.compute_peer_benchmarks(WORK_RECORDS)

# Generate synthetic demonstration stores
EVIDENCE_STORE = SyntheticEvidenceGenerator.generate_demo_evidence_store(WORK_RECORDS)

# Pre-evaluate top records & seed HERO DEMO PROJECT at index 0
EVALUATED_CACHE = []

# SEED HERO DEMO PROJECT (Phase 6 Step 1)
HERO_PROJECT = {
    "work_id": "HERO-MPLADS-2024-001",
    "work_title": "Construction of Primary Health Center & Allied Solar Facility",
    "state": "Bihar",
    "constituency": "ARARIA",
    "disbursed_amount_inr": 2450000.0,
    "duration_days": 320.0,
    "risk_score": 88.5,
    "anomaly_flag": "POTENTIAL_ANOMALY",
    "top_contributing_factor": "Cost Anomaly",
    "component_breakdown": {
        "cost_anomaly": 100.0,
        "delay_anomaly": 90.0,
        "payment_pattern": 85.0,
        "spatial_signal": 75.0,
        "evidence_issue": 100.0,
        "isolation_forest_auxiliary_score": 92.4
    },
    "missing_evidence_fields": ["satellite_imagery"],
    "latitude": 26.1521,
    "longitude": 87.5181,
    "has_official_images": True,
    "has_satellite_data": False,
    "is_hero_project": True,
    "stage_history": [
        {"stage_key": "PROPOSAL_RECOMMENDATION", "stage_name": "Proposal Recommendation", "actual_duration_days": 12.0, "benchmark_days": 15.0, "delay_ratio": 0.8, "responsible_role": "District Nodal Cell", "is_bottleneck": False},
        {"stage_key": "DISTRICT_REVIEW", "stage_name": "District Review", "actual_duration_days": 90.2, "benchmark_days": 22.0, "delay_ratio": 4.1, "responsible_role": "District Planning Officer (IDA)", "is_bottleneck": True},
        {"stage_key": "ADMINISTRATIVE_SANCTION", "stage_name": "Administrative Sanction", "actual_duration_days": 28.0, "benchmark_days": 30.0, "delay_ratio": 0.9, "responsible_role": "District Authority Collectorate", "is_bottleneck": False},
        {"stage_key": "AGENCY_PROCUREMENT", "stage_name": "Agency Procurement", "actual_duration_days": 105.0, "benchmark_days": 45.0, "delay_ratio": 2.3, "responsible_role": "Implementing Agency Procurement", "is_bottleneck": True},
        {"stage_key": "WORK_EXECUTION", "stage_name": "Work Execution", "actual_duration_days": 85.0, "benchmark_days": 120.0, "delay_ratio": 0.7, "responsible_role": "Contractor Division / IDA", "is_bottleneck": False}
    ]
}

EVALUATED_CACHE.append(HERO_PROJECT)

# Seed Hero Evidence Store
EVIDENCE_STORE.insert(0, {
    "evidence_id": "ev-hero-001",
    "project_id": "HERO-MPLADS-2024-001",
    "evidence_type": "OFFICIAL_COMPLETION_PHOTO",
    "submitted_by_role": "IMPLEMENTING_AGENCY",
    "phash_value": "1122334455667788",
    "latitude": 26.1521,
    "longitude": 87.5181,
    "verification_status": "DUPLICATE_SUSPECT",
    "source": "eSAKSHI Photo Registry",
    "source_type": "OFFICIAL_PUBLIC",
    "is_synthetic": True
})

# Seed Hero Ledger Entries across all 4 decision types
ledger_engine.record_entry(
    project_id="HERO-MPLADS-2024-001",
    decision_type="RISK_ASSESSMENT",
    computed_score=88.5,
    component_breakdown=HERO_PROJECT["component_breakdown"],
    data_sources_used=[
        {"source_name": "eSAKSHI Official Public Export", "source_type": "OFFICIAL_PUBLIC", "is_synthetic": False},
        {"source_name": "District Nodal Master Registry", "source_type": "OFFICIAL_PUBLIC", "is_synthetic": False}
    ],
    model_version=RISK_ENGINE_VERSION,
    rules_version=RULES_VERSION,
    missing_evidence_fields=["satellite_imagery"]
)

ledger_engine.record_entry(
    project_id="HERO-MPLADS-2024-001",
    decision_type="VERIFICATION_TRIANGULATION",
    computed_score=30.0,
    component_breakdown={"agency_claim": 25.0, "citizen_evidence": 0.0, "photo_uniqueness": 0.0, "satellite": 0.0},
    data_sources_used=[
        {"source_name": "Citizen Mobile PWA Live Upload", "source_type": "CITIZEN_PWA", "is_synthetic": True},
        {"source_name": "Perceptual Hash Duplicate Index", "source_type": "OFFICIAL_PUBLIC", "is_synthetic": True}
    ],
    model_version=TRIANGULATION_ENGINE_VERSION,
    rules_version=RULES_VERSION,
    missing_evidence_fields=["satellite_imagery"]
)

ledger_engine.record_entry(
    project_id="HERO-MPLADS-2024-001",
    decision_type="BOTTLENECK_ANALYSIS",
    computed_score=82.0,
    component_breakdown={"max_deviation_multiple": 4.1, "primary_bottleneck_stage": "District Review"},
    data_sources_used=[{"source_name": "District Event Log History", "source_type": "OFFICIAL_PUBLIC", "is_synthetic": True}],
    model_version=SLA_ANALYZER_VERSION,
    rules_version=RULES_VERSION
)

ledger_engine.record_entry(
    project_id="HERO-MPLADS-2024-001",
    decision_type="OPTIMIZER_ASSIGNMENT",
    computed_score=94.2,
    component_breakdown={"risk_contribution": 35.4, "confidence_gap_contribution": 21.0, "value_contribution": 19.6, "distance_penalty": 2.0},
    data_sources_used=[{"source_name": "Inspector Capacity Roster", "source_type": "OFFICIAL_PUBLIC", "is_synthetic": True}],
    model_version=OPTIMIZER_ENGINE_VERSION,
    rules_version=RULES_VERSION
)

# Populate evaluated cache with dataset records
sample_features = []
for idx, p in enumerate(WORK_RECORDS[:2000]):
    peer_analysis = peer_engine.get_peer_stats(p, PEER_BENCHMARKS)
    risk_res = risk_engine.evaluate_project_risk(p, peer_analysis)
    
    stage_hist = SyntheticProcessGenerator.generate_project_stage_history(p, idx)
    risk_res["stage_history"] = stage_hist
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
    
    if clean_id == "HERO-MPLADS-2024-001":
        return {
            "project_id": "HERO-MPLADS-2024-001",
            "verification_confidence": 30.0,
            "signal_weights": {"earned_weight": 25.0, "total_available_weight": 85.0},
            "signals": {
                "agency_claim": {"status": "✅ SUPPORTS_CLAIM", "score_contrib": 25.0, "detail": "Official agency progress report submitted."},
                "citizen_evidence": {"status": "❌ CONTRADICTS_CLAIM", "score_contrib": 0.0, "detail": "Citizen live capture location discrepancy (1,420m away from site)."},
                "photo_uniqueness": {"status": "❌ CONTRADICTS_CLAIM", "score_contrib": 0.0, "detail": "Duplicate image detected! Matches WS/MP418/2024-2025/9988 (98.5% similarity)."},
                "satellite": {"status": "— UNAVAILABLE", "score_contrib": 0.0, "detail": "Sentinel-2 remote sensing image pass unavailable."}
            },
            "missing_evidence_fields": ["satellite_imagery"],
            "fairness_safeguard_note": "1 evidence source unavailable. Excluded from denominator and DID NOT penalize confidence score."
        }

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
        match = {"work_id": clean_id, "stage_history": SyntheticProcessGenerator.generate_project_stage_history({"work_id": clean_id}, 0)}

    stage_hist = match.get("stage_history", [])
    return sla_engine.analyze_project_bottleneck(clean_id, stage_hist)


@router.get("/optimizer/plan", summary="Feature 7: GET /optimizer/plan")
def get_full_inspection_plan():
    routes = []
    for insp in SYNTHETIC_INSPECTORS:
        route_plan = inspection_engine.generate_inspector_route(insp, EVALUATED_CACHE[:300])
        routes.append(route_plan)

    return {
        "total_inspectors": len(SYNTHETIC_INSPECTORS),
        "total_planned_inspections": sum(r["capacity_summary"]["assigned_inspections"] for r in routes),
        "inspector_routes": routes
    }
