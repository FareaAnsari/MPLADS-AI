import pytest
from fastapi.testclient import TestClient
import sys
import os

app_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'app'))
if app_dir not in sys.path:
    sys.path.insert(0, app_dir)

from main import app

client = TestClient(app)

def test_list_tenders_and_provenance():
    """Verify tenders endpoint returns populated Tier-3 demo records with correct schema."""
    res = client.get("/api/v1/tenders")
    assert res.status_code == 200
    data = res.json()
    assert len(data) >= 10
    for t in data:
        assert "tender_id" in t
        assert "work_id" in t
        assert "estimated_cost" in t
        assert t["data_provenance"] == "TIER_3_DEMO"
        assert t["tender_type"] in ["OPEN_TENDER", "LIMITED_TENDER", "SINGLE_TENDER_NOMINATION", "GEM_DIRECT"]

def test_get_tender_detail_with_scrutiny_signals():
    """Verify tender detail includes competitive bids and AI Bidder Scrutiny signals."""
    # Fetch first tender
    tenders_res = client.get("/api/v1/tenders")
    assert tenders_res.status_code == 200
    tenders = tenders_res.json()
    t1 = tenders[0]
    
    res = client.get(f"/api/v1/tenders/{t1['tender_id']}")
    assert res.status_code == 200
    detail = res.json()
    assert detail["tender_id"] == t1["tender_id"]
    assert len(detail["bids"]) >= 3
    # Verify scrutiny signals present
    assert "scrutiny_signals" in detail
    assert isinstance(detail["scrutiny_signals"], list)

def test_create_and_bid_and_award_lifecycle():
    """End-to-end lifecycle: create tender -> submit bid -> award tender -> check contract and supply chain link."""
    # 1. Create tender
    create_payload = {
        "work_id": "MPLADS-2024-TEST-099",
        "work_title": "Construction of High-Speed Digital Lab at Test Taluka",
        "category": "Education & Skills",
        "tender_type": "OPEN_TENDER",
        "estimated_cost": 2000000.0,
        "submission_deadline": "2026-10-15",
        "district": "Pune",
        "state": "Maharashtra",
        "procuring_entity": "District DRDA Pune"
    }
    create_res = client.post("/api/v1/tenders", json=create_payload)
    assert create_res.status_code == 201
    created = create_res.json()
    tender_id = created["tender_id"]
    assert created["status"] == "PUBLISHED"
    
    # 2. Submit bid
    bid_payload = {
        "vendor_id": "VEND-001",
        "vendor_name": "Bharat Infra Projects Ltd",
        "bid_amount": 1850000.0,
        "technical_score": 94.0
    }
    bid_res = client.post(f"/api/v1/tenders/{tender_id}/bids", json=bid_payload)
    assert bid_res.status_code == 200
    tender_after_bid = bid_res.json()
    assert tender_after_bid["bid_count"] == 1
    assert tender_after_bid["status"] == "BIDDING_OPEN"
    submitted_bid_id = tender_after_bid["bids"][0]["bid_id"]
    
    # 3. Award tender
    award_payload = {
        "selected_bid_id": submitted_bid_id,
        "contract_commencement_date": "2026-10-20",
        "scheduled_completion_date": "2027-02-20"
    }
    award_res = client.post(f"/api/v1/tenders/{tender_id}/award", json=award_payload)
    assert award_res.status_code == 200
    contract = award_res.json()
    assert contract["tender_id"] == tender_id
    assert contract["work_id"] == "MPLADS-2024-TEST-099"
    assert contract["contract_value"] == 1850000.0
    assert contract["status"] == "ACTIVE"
    assert contract["supply_chain_record_id"] == "SC-MPLADS-2024-TEST-099-01"
    assert contract["measurement_book_ref"] is not None

def test_list_and_get_contracts():
    """Verify contracts list and contract detail."""
    res = client.get("/api/v1/tenders/contracts/all")
    assert res.status_code == 200
    contracts = res.json()
    assert len(contracts) >= 1
    c1 = contracts[0]
    
    detail_res = client.get(f"/api/v1/tenders/contracts/{c1['contract_id']}")
    assert detail_res.status_code == 200
    c_detail = detail_res.json()
    assert c_detail["contract_id"] == c1["contract_id"]
    assert c_detail["data_provenance"] == "TIER_3_DEMO"
