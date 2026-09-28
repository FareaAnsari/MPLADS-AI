import pytest
from fastapi.testclient import TestClient
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../app')))
from main import app

client = TestClient(app)

def test_get_project_supply_chain_summary():
    response = client.get("/api/v1/supply-chain/projects/WRK-2024-BR01-001")
    assert response.status_code == 200
    data = response.json()
    assert data["project_id"] == "WRK-2024-BR01-001"
    assert data["total_materials_tracked"] >= 2
    assert "records" in data
    # Cement record has 24% under-delivery flag
    assert data["flagged_variance_count"] >= 1
    assert data["risk_signal"] is not None
    assert data["risk_signal"]["signal_type"] == "MATERIAL_QUANTITY_DISCREPANCY"
    assert data["risk_signal"]["risk_contribution"] >= 22

def test_create_procurement_order():
    payload = {
        "project_id": "WRK-2024-TEST-009",
        "material_type": "OPC 53 Grade Cement",
        "category": "Cement",
        "ordered_quantity": 600.0,
        "unit": "Bags",
        "unit_rate": 372.0,
        "vendor_id": "v-01",
        "vendor_name": "Patna Building Materials Co",
        "vendor_gstin": "10AABCP1234F1Z5",
        "po_reference": "PO/MPLADS/2024/TEST/01"
    }
    response = client.post("/api/v1/supply-chain/procurement", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["project_id"] == "WRK-2024-TEST-009"
    assert data["ordered_quantity"] == 600.0
    assert data["reconciliation_status"] == "PENDING_VERIFICATION"
    record_id = data["id"]

    # Test Dispatch
    dispatch_payload = {
        "record_id": record_id,
        "dispatched_quantity": 600.0,
        "eway_bill_number": "EWB-8899776655"
    }
    res_disp = client.post("/api/v1/supply-chain/dispatch", json=dispatch_payload)
    assert res_disp.status_code == 200
    assert res_disp.json()["dispatched_quantity"] == 600.0

    # Test Delivery with GPS
    delivery_payload = {
        "record_id": record_id,
        "delivered_quantity": 600.0,
        "gps_lat": 26.1528,
        "gps_lng": 87.4947,
        "challan_number": "CH-TEST-12"
    }
    res_del = client.post("/api/v1/supply-chain/delivery", json=delivery_payload)
    assert res_del.status_code == 200
    assert res_del.json()["delivered_quantity"] == 600.0

    # Test Installation with deliberate mismatch (installed 400 out of 600 -> -33.3% variance)
    install_payload = {
        "record_id": record_id,
        "installed_quantity": 400.0,
        "measurement_book_ref": "MB-TEST/P-01"
    }
    res_inst = client.post("/api/v1/supply-chain/installation", json=install_payload)
    assert res_inst.status_code == 200
    inst_data = res_inst.json()
    assert inst_data["reconciliation_status"] == "UNDER_DELIVERY_FLAGGED"
    assert inst_data["variance_percentage"] == -33.33
    assert inst_data["risk_penalty_points"] >= 22

def test_vendor_supply_performance():
    response = client.get("/api/v1/supply-chain/vendors/v-01/performance")
    assert response.status_code == 200
    data = response.json()
    assert data["vendor_id"] == "v-01"
    assert "on_time_delivery_pct" in data
    assert "avg_quantity_variance_pct" in data
    assert "reputation_score" in data
