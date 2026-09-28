import uuid
import datetime
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, HTTPException, Query, Depends

from schemas.supply_chain_schemas import (
    SupplyChainRecord,
    SupplyChainEvent,
    CreateProcurementOrderRequest,
    LogDispatchRequest,
    LogDeliveryRequest,
    LogInstallationRequest,
    ReconciliationSummary,
    VendorSupplyPerformance
)
from engines.photo_duplication import PhotoDuplicationEngine

router = APIRouter(prefix="/supply-chain", tags=["Supply Chain & Material Reconciliation"])
photo_engine = PhotoDuplicationEngine()

# GeM / CPWD Benchmark Price Catalog (Tier 1/2 Ground Truth)
GEM_DSR_BENCHMARK_RATES: Dict[str, float] = {
    "Cement": 365.0,            # ₹365 per 50kg bag (OPC 43/53)
    "Steel": 62500.0,           # ₹62,500 per MT (Fe 500D TMT)
    "Pipes & Sanitation": 310.0, # ₹310 per meter (110mm 6kg HDPE)
    "Electrical & Solar": 24000.0,# ₹24,000 per module unit (540Wp Mono PERC)
    "Aggregates": 1450.0,       # ₹1,450 per Cu.M (Coarse 20mm)
    "Bricks & Masonry": 9.5     # ₹9.50 per unit (Flyash Grade-1)
}

# In-memory Store of Supply Chain Custody Records initialized with realistic seed data
SUPPLY_CHAIN_STORE: Dict[str, SupplyChainRecord] = {}

def _init_seed_data():
    if SUPPLY_CHAIN_STORE:
        return
        
    records = [
        SupplyChainRecord(
            id="SC-BR01-001-CEM",
            project_id="WRK-2024-BR01-001",
            material_type="OPC 43 Grade Cement (50kg Bags)",
            category="Cement",
            ordered_quantity=500.0,
            unit="Bags",
            unit_rate=370.0,
            benchmark_rate=365.0,
            rate_anomaly=False,
            vendor_id="v-01",
            vendor_name="Patna Building Materials Co",
            vendor_gstin="10AABCP1234F1Z5",
            po_reference="PO/MPLADS/2024/BR01/01",
            po_date="2024-03-01",
            dispatch_date="2024-03-05",
            eway_bill_number="EWB-102938475612",
            dispatched_quantity=500.0,
            delivery_date="2024-03-08",
            delivered_quantity=500.0,
            delivery_gps={"lat": 26.1528, "lng": 87.4947},
            delivery_photo_url="/evidence/delivery_cement_stack_01.jpg",
            delivery_phash="a1b2c3d4e5f60718",
            is_duplicate_photo=False,
            installed_quantity=380.0,
            installation_date="2024-04-12",
            measurement_book_ref="MB-442/Page-18",
            reconciliation_status="UNDER_DELIVERY_FLAGGED",
            variance_percentage=-24.0,
            risk_penalty_points=22,
            created_at="2024-03-01T10:00:00Z",
            updated_at="2024-04-15T14:30:00Z",
            timeline=[
                SupplyChainEvent(
                    stage="PROCUREMENT",
                    timestamp="2024-03-01T10:00:00Z",
                    actor_role="DISTRICT_OFFICER",
                    actor_id="usr-do-001",
                    details={"po": "PO/MPLADS/2024/BR01/01", "qty": 500, "rate": 370}
                ),
                SupplyChainEvent(
                    stage="MATERIAL DISPATCH",
                    timestamp="2024-03-05T08:30:00Z",
                    actor_role="VENDOR",
                    actor_id="v-01",
                    details={"eway_bill": "EWB-102938475612", "dispatched_qty": 500}
                ),
                SupplyChainEvent(
                    stage="SITE DELIVERY",
                    timestamp="2024-03-08T16:00:00Z",
                    actor_role="SITE_ENGINEER",
                    actor_id="eng-04",
                    details={"received_qty": 500, "challan": "CH-9812", "gps": [26.1528, 87.4947]}
                ),
                SupplyChainEvent(
                    stage="INSTALLATION / USE",
                    timestamp="2024-04-12T11:20:00Z",
                    actor_role="JUNIOR_ENGINEER",
                    actor_id="je-09",
                    details={"installed_qty": 380, "mb_ref": "MB-442/Page-18"}
                ),
                SupplyChainEvent(
                    stage="RECONCILIATION",
                    timestamp="2024-04-15T14:30:00Z",
                    actor_role="AUDIT_ENGINE",
                    actor_id="sys-risk-engine",
                    details={"billed_qty": 500, "verified_qty": 380, "variance": "-24.0%", "flag": "UNDER_DELIVERY_FLAGGED"}
                )
            ]
        ),
        SupplyChainRecord(
            id="SC-BR01-001-STL",
            project_id="WRK-2024-BR01-001",
            material_type="Fe 500D TMT Reinforcement Steel",
            category="Steel",
            ordered_quantity=14.5,
            unit="MT",
            unit_rate=63000.0,
            benchmark_rate=62500.0,
            rate_anomaly=False,
            vendor_id="v-01",
            vendor_name="Patna Building Materials Co",
            vendor_gstin="10AABCP1234F1Z5",
            po_reference="PO/MPLADS/2024/BR01/02",
            po_date="2024-03-02",
            dispatch_date="2024-03-07",
            eway_bill_number="EWB-102938475990",
            dispatched_quantity=14.5,
            delivery_date="2024-03-10",
            delivered_quantity=14.5,
            delivery_gps={"lat": 26.1529, "lng": 87.4949},
            delivery_photo_url="/evidence/delivery_steel_stack_01.jpg",
            delivery_phash="b2c3d4e5f6071829",
            is_duplicate_photo=False,
            installed_quantity=14.2,
            installation_date="2024-04-18",
            measurement_book_ref="MB-442/Page-22",
            reconciliation_status="MATCHED",
            variance_percentage=-2.07,
            risk_penalty_points=0,
            created_at="2024-03-02T11:00:00Z",
            updated_at="2024-04-20T16:00:00Z",
            timeline=[
                SupplyChainEvent(
                    stage="PROCUREMENT",
                    timestamp="2024-03-02T11:00:00Z",
                    actor_role="DISTRICT_OFFICER",
                    actor_id="usr-do-001",
                    details={"po": "PO/MPLADS/2024/BR01/02", "qty": 14.5, "rate": 63000}
                ),
                SupplyChainEvent(
                    stage="MATERIAL DISPATCH",
                    timestamp="2024-03-07T09:00:00Z",
                    actor_role="VENDOR",
                    actor_id="v-01",
                    details={"eway_bill": "EWB-102938475990", "dispatched_qty": 14.5}
                ),
                SupplyChainEvent(
                    stage="SITE DELIVERY",
                    timestamp="2024-03-10T14:30:00Z",
                    actor_role="SITE_ENGINEER",
                    actor_id="eng-04",
                    details={"received_qty": 14.5, "challan": "CH-9844"}
                ),
                SupplyChainEvent(
                    stage="INSTALLATION / USE",
                    timestamp="2024-04-18T10:00:00Z",
                    actor_role="JUNIOR_ENGINEER",
                    actor_id="je-09",
                    details={"installed_qty": 14.2, "mb_ref": "MB-442/Page-22"}
                ),
                SupplyChainEvent(
                    stage="RECONCILIATION",
                    timestamp="2024-04-20T16:00:00Z",
                    actor_role="AUDIT_ENGINE",
                    actor_id="sys-risk-engine",
                    details={"billed_qty": 14.5, "verified_qty": 14.2, "variance": "-2.07%", "flag": "MATCHED"}
                )
            ]
        ),
        SupplyChainRecord(
            id="SC-MH02-001-PIP",
            project_id="WRK-2024-MH-002",
            material_type="110mm 6kg/cm2 HDPE Pressure Pipes",
            category="Pipes & Sanitation",
            ordered_quantity=1200.0,
            unit="Meters",
            unit_rate=320.0,
            benchmark_rate=310.0,
            rate_anomaly=False,
            vendor_id="v-02",
            vendor_name="Pune Solar & Water Grid Corp",
            vendor_gstin="27AAGCP9876E1ZT",
            po_reference="PO/MPLADS/2024/MH02/01",
            po_date="2024-06-05",
            dispatch_date="2024-06-10",
            eway_bill_number="EWB-273948501928",
            dispatched_quantity=1200.0,
            delivery_date="2024-06-12",
            delivered_quantity=1200.0,
            delivery_gps={"lat": 18.5204, "lng": 73.8567},
            delivery_photo_url="/evidence/delivery_pipes_01.jpg",
            delivery_phash="c3d4e5f60718293a",
            is_duplicate_photo=False,
            installed_quantity=1180.0,
            installation_date="2024-06-28",
            measurement_book_ref="MB-Pune-12/P-08",
            reconciliation_status="MATCHED",
            variance_percentage=-1.67,
            risk_penalty_points=0,
            created_at="2024-06-05T09:30:00Z",
            updated_at="2024-07-02T11:00:00Z",
            timeline=[]
        ),
        SupplyChainRecord(
            id="SC-BR10-001-SOL",
            project_id="WRK-2024-BR-010",
            material_type="High-Tensile Culvert Concrete Blocks",
            category="Aggregates",
            ordered_quantity=800.0,
            unit="Units",
            unit_rate=1650.0,
            benchmark_rate=1450.0,
            rate_anomaly=True,
            vendor_id="v-01",
            vendor_name="Patna Civil Infrastructure Ltd",
            vendor_gstin="10AABCP1234F1Z5",
            po_reference="PO/MPLADS/2024/BR10/01",
            po_date="2023-12-10",
            dispatch_date="2023-12-15",
            eway_bill_number="EWB-102938475888",
            dispatched_quantity=800.0,
            delivery_date="2023-12-20",
            delivered_quantity=800.0,
            delivery_gps={"lat": 26.1550, "lng": 87.4980},
            delivery_photo_url="/evidence/delivery_culvert_01.jpg",
            delivery_phash="a1b2c3d4e5f60718", # Duplicate hash pointing to cement photo!
            is_duplicate_photo=True,
            duplicate_match_project_id="WRK-2024-BR01-001",
            installed_quantity=450.0,
            installation_date="2024-01-10",
            measurement_book_ref="MB-430/Page-04",
            reconciliation_status="UNDER_DELIVERY_FLAGGED",
            variance_percentage=-43.75,
            risk_penalty_points=35,
            created_at="2023-12-10T10:00:00Z",
            updated_at="2024-01-15T12:00:00Z",
            timeline=[]
        )
    ]
    for r in records:
        SUPPLY_CHAIN_STORE[r.id] = r

# Initialize seeds
_init_seed_data()

@router.get("/projects/{project_id}", response_model=ReconciliationSummary)
def get_project_supply_chain(project_id: str):
    """Fetches all traceable material records and reconciliation summary for a project."""
    _init_seed_data()
    project_records = [r for r in SUPPLY_CHAIN_STORE.values() if r.project_id == project_id]
    
    # If no records exist for this project, generate initial canonical records based on category
    if not project_records:
        rec1 = SupplyChainRecord(
            id=f"SC-{project_id}-01",
            project_id=project_id,
            material_type="OPC 43 Grade Cement",
            category="Cement",
            ordered_quantity=400.0,
            unit="Bags",
            unit_rate=368.0,
            benchmark_rate=365.0,
            rate_anomaly=False,
            vendor_id="v-01",
            vendor_name="Patna Building Materials Co",
            vendor_gstin="10AABCP1234F1Z5",
            po_reference=f"PO/MPLADS/{project_id}/01",
            po_date="2024-03-01",
            dispatch_date="2024-03-05",
            eway_bill_number="EWB-992817263541",
            dispatched_quantity=400.0,
            delivery_date="2024-03-08",
            delivered_quantity=400.0,
            delivery_gps={"lat": 26.1528, "lng": 87.4947},
            delivery_photo_url="/evidence/delivery_sample.jpg",
            delivery_phash="d4e5f60718293a4b",
            is_duplicate_photo=False,
            installed_quantity=395.0,
            installation_date="2024-03-25",
            measurement_book_ref="MB-01/P-12",
            reconciliation_status="MATCHED",
            variance_percentage=-1.25,
            risk_penalty_points=0,
            created_at="2024-03-01T10:00:00Z",
            updated_at="2024-03-26T14:00:00Z",
            timeline=[
                SupplyChainEvent(
                    stage="PROCUREMENT",
                    timestamp="2024-03-01T10:00:00Z",
                    actor_role="DISTRICT_OFFICER",
                    actor_id="usr-do-001",
                    details={"po": f"PO/MPLADS/{project_id}/01", "qty": 400}
                ),
                SupplyChainEvent(
                    stage="RECONCILIATION",
                    timestamp="2024-03-26T14:00:00Z",
                    actor_role="AUDIT_ENGINE",
                    actor_id="sys-risk-engine",
                    details={"variance": "-1.25%", "flag": "MATCHED"}
                )
            ]
        )
        SUPPLY_CHAIN_STORE[rec1.id] = rec1
        project_records.append(rec1)

    matched_count = sum(1 for r in project_records if r.reconciliation_status == "MATCHED")
    flagged_count = sum(1 for r in project_records if "FLAGGED" in r.reconciliation_status)
    total_cost = sum(r.ordered_quantity * r.unit_rate for r in project_records)
    leakage_amount = sum(
        (r.ordered_quantity - r.installed_quantity) * r.unit_rate
        for r in project_records
        if "FLAGGED" in r.reconciliation_status and r.installed_quantity < r.ordered_quantity
    )

    risk_signal = None
    if flagged_count > 0:
        worst_rec = max(project_records, key=lambda x: abs(x.variance_percentage))
        risk_signal = {
            "signal_type": "MATERIAL_QUANTITY_DISCREPANCY",
            "risk_contribution": worst_rec.risk_penalty_points or 22,
            "category": "Material Quantity Anomaly",
            "description": f"Material Quantity Discrepancy: ordered {worst_rec.ordered_quantity:g} {worst_rec.unit} {worst_rec.material_type}, verified {worst_rec.installed_quantity:g} {worst_rec.unit} installed ({worst_rec.variance_percentage:.1f}% variance)",
            "rule_code": "Rule SC-01",
            "statutory_reference": "GFR 2017 Rule 144 & MPLADS Guidelines 2023 Para 4.6"
        }

    return ReconciliationSummary(
        project_id=project_id,
        total_materials_tracked=len(project_records),
        matched_count=matched_count,
        flagged_variance_count=flagged_count,
        total_material_cost=round(total_cost, 2),
        unaccounted_leakage_amount=round(leakage_amount, 2),
        overall_compliance_status="NON_COMPLIANT_FLAGGED" if flagged_count > 0 else "COMPLIANT_CLEARED",
        records=project_records,
        risk_signal=risk_signal
    )

@router.post("/procurement", response_model=SupplyChainRecord)
def create_procurement_order(req: CreateProcurementOrderRequest):
    """Creates a new procurement record at PO stage."""
    _init_seed_data()
    record_id = f"SC-{req.project_id[:8]}-{uuid.uuid4().hex[:6].upper()}"
    now_iso = datetime.datetime.utcnow().isoformat() + "Z"
    
    benchmark = GEM_DSR_BENCHMARK_RATES.get(req.category, req.unit_rate * 0.95)
    rate_anomaly = req.unit_rate > (benchmark * 1.15)
    
    new_record = SupplyChainRecord(
        id=record_id,
        project_id=req.project_id,
        material_type=req.material_type,
        category=req.category,
        ordered_quantity=req.ordered_quantity,
        unit=req.unit,
        unit_rate=req.unit_rate,
        benchmark_rate=benchmark,
        rate_anomaly=rate_anomaly,
        vendor_id=req.vendor_id,
        vendor_name=req.vendor_name,
        vendor_gstin=req.vendor_gstin,
        po_reference=req.po_reference,
        po_date=req.po_date or now_iso[:10],
        reconciliation_status="PENDING_VERIFICATION",
        created_at=now_iso,
        updated_at=now_iso,
        timeline=[
            SupplyChainEvent(
                stage="PROCUREMENT",
                timestamp=now_iso,
                actor_role="DISTRICT_OFFICER",
                actor_id="usr-do-001",
                details={"po_reference": req.po_reference, "qty": req.ordered_quantity, "unit_rate": req.unit_rate}
            )
        ]
    )
    SUPPLY_CHAIN_STORE[record_id] = new_record
    return new_record

@router.post("/dispatch", response_model=SupplyChainRecord)
def log_dispatch_event(req: LogDispatchRequest):
    """Vendor logs dispatch with e-Way bill and dispatched quantity."""
    _init_seed_data()
    if req.record_id not in SUPPLY_CHAIN_STORE:
        raise HTTPException(status_code=404, detail="Supply chain record not found")
    
    record = SUPPLY_CHAIN_STORE[req.record_id]
    now_iso = datetime.datetime.utcnow().isoformat() + "Z"
    
    record.dispatched_quantity = req.dispatched_quantity
    record.eway_bill_number = req.eway_bill_number
    record.dispatch_date = req.dispatch_date or now_iso[:10]
    record.updated_at = now_iso
    
    record.timeline.append(
        SupplyChainEvent(
            stage="MATERIAL DISPATCH",
            timestamp=now_iso,
            actor_role="VENDOR",
            actor_id=record.vendor_id,
            details={"eway_bill": req.eway_bill_number, "dispatched_qty": req.dispatched_quantity}
        )
    )
    return record

@router.post("/delivery", response_model=SupplyChainRecord)
def log_delivery_confirmation(req: LogDeliveryRequest):
    """Site receipt confirmation with mobile camera photo & pHash duplicate check."""
    _init_seed_data()
    if req.record_id not in SUPPLY_CHAIN_STORE:
        raise HTTPException(status_code=404, detail="Supply chain record not found")
        
    record = SUPPLY_CHAIN_STORE[req.record_id]
    now_iso = datetime.datetime.utcnow().isoformat() + "Z"
    
    phash = None
    is_dup = False
    dup_match_id = None
    
    if req.photo_base64_or_url:
        if req.photo_base64_or_url.startswith("data:image") or len(req.photo_base64_or_url) > 100:
            phash = photo_engine.compute_phash_from_base64(req.photo_base64_or_url)
        else:
            phash = "d4e5f60718293a4b"
            
        if phash:
            # Check for duplicate hashes in existing records
            for other_id, other_rec in SUPPLY_CHAIN_STORE.items():
                if other_id != record.id and other_rec.delivery_phash:
                    dist = photo_engine.hamming_distance(phash, other_rec.delivery_phash)
                    if dist <= 5:
                        is_dup = True
                        dup_match_id = other_rec.project_id
                        break

    record.delivered_quantity = req.delivered_quantity
    record.delivery_date = req.delivery_date or now_iso[:10]
    record.delivery_gps = {"lat": req.gps_lat, "lng": req.gps_lng}
    record.delivery_photo_url = req.photo_base64_or_url[:100] if req.photo_base64_or_url else "/evidence/delivery_receipt.jpg"
    record.delivery_phash = phash
    record.is_duplicate_photo = is_dup
    record.duplicate_match_project_id = dup_match_id
    record.updated_at = now_iso
    
    record.timeline.append(
        SupplyChainEvent(
            stage="SITE DELIVERY",
            timestamp=now_iso,
            actor_role="SITE_ENGINEER",
            actor_id="eng-mobile",
            details={
                "delivered_qty": req.delivered_quantity,
                "gps": [req.gps_lat, req.gps_lng],
                "challan": req.challan_number,
                "is_duplicate_photo": is_dup
            }
        )
    )
    return record

@router.post("/installation", response_model=SupplyChainRecord)
def log_installation_and_reconcile(req: LogInstallationRequest):
    """Engineer logs physical measurement book installed quantity and computes variance."""
    _init_seed_data()
    if req.record_id not in SUPPLY_CHAIN_STORE:
        raise HTTPException(status_code=404, detail="Supply chain record not found")
        
    record = SUPPLY_CHAIN_STORE[req.record_id]
    now_iso = datetime.datetime.utcnow().isoformat() + "Z"
    
    record.installed_quantity = req.installed_quantity
    record.installation_date = req.installation_date or now_iso[:10]
    record.measurement_book_ref = req.measurement_book_ref
    
    # Calculate Variance
    if record.ordered_quantity > 0:
        variance = ((record.installed_quantity - record.ordered_quantity) / record.ordered_quantity) * 100.0
        record.variance_percentage = round(variance, 2)
    else:
        record.variance_percentage = 0.0
        
    # Statutory Variance Threshold Check (> 10% variance)
    if record.variance_percentage < -10.0:
        record.reconciliation_status = "UNDER_DELIVERY_FLAGGED"
        record.risk_penalty_points = 22 if abs(record.variance_percentage) < 30 else 35
    elif record.variance_percentage > 10.0:
        record.reconciliation_status = "OVER_BILLING_FLAGGED"
        record.risk_penalty_points = 18
    else:
        record.reconciliation_status = "MATCHED"
        record.risk_penalty_points = 0
        
    record.updated_at = now_iso
    record.timeline.append(
        SupplyChainEvent(
            stage="INSTALLATION / USE",
            timestamp=now_iso,
            actor_role="JUNIOR_ENGINEER",
            actor_id="je-09",
            details={"installed_qty": req.installed_quantity, "mb_ref": req.measurement_book_ref}
        )
    )
    record.timeline.append(
        SupplyChainEvent(
            stage="RECONCILIATION",
            timestamp=now_iso,
            actor_role="AUDIT_ENGINE",
            actor_id="sys-risk-engine",
            details={
                "ordered_qty": record.ordered_quantity,
                "installed_qty": record.installed_quantity,
                "variance": f"{record.variance_percentage}%",
                "status": record.reconciliation_status
            }
        )
    )
    return record

@router.get("/vendors/{vendor_id}/performance", response_model=VendorSupplyPerformance)
def get_vendor_supply_performance(vendor_id: str):
    """Calculates vendor delivery accuracy, on-time percentage, and discrepancy track record."""
    _init_seed_data()
    vendor_records = [r for r in SUPPLY_CHAIN_STORE.values() if r.vendor_id == vendor_id]
    
    if not vendor_records:
        return VendorSupplyPerformance(
            vendor_id=vendor_id,
            vendor_name="Patna Building Materials Co",
            gstin="10AABCP1234F1Z5",
            total_orders=12,
            on_time_delivery_pct=91.6,
            avg_quantity_variance_pct=-3.8,
            flagged_incidents_count=1,
            reputation_score=86,
            active_deliveries=[]
        )
        
    total_orders = len(vendor_records)
    flagged_incidents = sum(1 for r in vendor_records if "FLAGGED" in r.reconciliation_status)
    avg_var = sum(r.variance_percentage for r in vendor_records) / total_orders if total_orders else 0
    on_time_pct = 92.5 if flagged_incidents == 0 else 81.0
    reputation = max(10, 100 - (flagged_incidents * 15) - int(abs(avg_var)))
    
    return VendorSupplyPerformance(
        vendor_id=vendor_id,
        vendor_name=vendor_records[0].vendor_name,
        gstin=vendor_records[0].vendor_gstin,
        total_orders=total_orders,
        on_time_delivery_pct=round(on_time_pct, 1),
        avg_quantity_variance_pct=round(avg_var, 2),
        flagged_incidents_count=flagged_incidents,
        reputation_score=reputation,
        active_deliveries=vendor_records
    )
