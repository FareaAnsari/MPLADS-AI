from fastapi import APIRouter, HTTPException, Query
from typing import List, Dict, Any, Optional
import os
from adapters.dataset_adapter import DatasetAdapter

router = APIRouter(prefix="/projects", tags=["MPLADS Projects & Works"])

# Instantiate DatasetAdapter pointing to Dataset directory
DATASET_DIR = os.getenv("DATASET_DIR", "Dataset")
adapter = DatasetAdapter(dataset_dir=DATASET_DIR)

# In-memory cached dataset records for fast prototype API queries
MP_RECORDS = adapter.parse_mp_allocated_limits()
WORK_RECORDS = adapter.parse_works_completed()
EXPENDITURE_RECORDS = adapter.parse_expenditures()


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


@router.get("/{work_id}", summary="Get detailed record of a specific work project")
def get_project_by_id(work_id: str):
    match = next((w for w in WORK_RECORDS if w["work_id"].lower() == work_id.lower()), None)
    if not match:
        raise HTTPException(status_code=404, detail=f"Work record with ID '{work_id}' not found.")
    
    # Associated expenditures
    related_exps = [e for e in EXPENDITURE_RECORDS if e["work_id"].lower() == work_id.lower()]
    
    return {
        "project": match,
        "expenditures": related_exps
    }
