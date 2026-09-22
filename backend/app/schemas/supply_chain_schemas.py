from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class SupplyChainEvent(BaseModel):
    stage: str
    timestamp: str
    actor_role: str
    actor_id: str
    details: Dict[str, Any]

class SupplyChainRecord(BaseModel):
    id: str
    project_id: str
    material_type: str
    category: str
    ordered_quantity: float
    unit: str
    unit_rate: float
    benchmark_rate: float
    rate_anomaly: bool = False
    vendor_id: str
    vendor_name: str
    vendor_gstin: str
    po_reference: str
    po_date: str
    dispatch_date: Optional[str] = None
    eway_bill_number: Optional[str] = None
    dispatched_quantity: float = 0.0
    delivery_date: Optional[str] = None
    delivered_quantity: float = 0.0
    delivery_gps: Optional[Dict[str, float]] = None
    delivery_photo_url: Optional[str] = None
    delivery_phash: Optional[str] = None
    is_duplicate_photo: bool = False
    duplicate_match_project_id: Optional[str] = None
    installed_quantity: float = 0.0
    installation_date: Optional[str] = None
    measurement_book_ref: Optional[str] = None
    reconciliation_status: str = "PENDING_VERIFICATION"  # MATCHED | UNDER_DELIVERY_FLAGGED | OVER_BILLING_FLAGGED | PENDING_VERIFICATION
    variance_percentage: float = 0.0
    risk_penalty_points: int = 0
    created_at: str
    updated_at: str
    timeline: List[SupplyChainEvent] = []

class CreateProcurementOrderRequest(BaseModel):
    project_id: str
    material_type: str
    category: str
    ordered_quantity: float
    unit: str
    unit_rate: float
    vendor_id: str
    vendor_name: str
    vendor_gstin: str
    po_reference: str
    po_date: Optional[str] = None

class LogDispatchRequest(BaseModel):
    record_id: str
    dispatched_quantity: float
    eway_bill_number: str
    dispatch_date: Optional[str] = None

class LogDeliveryRequest(BaseModel):
    record_id: str
    delivered_quantity: float
    delivery_date: Optional[str] = None
    gps_lat: float
    gps_lng: float
    photo_base64_or_url: Optional[str] = None
    challan_number: Optional[str] = None

class LogInstallationRequest(BaseModel):
    record_id: str
    installed_quantity: float
    measurement_book_ref: str
    installation_date: Optional[str] = None
    engineer_notes: Optional[str] = None

class ReconciliationSummary(BaseModel):
    project_id: str
    total_materials_tracked: int
    matched_count: int
    flagged_variance_count: int
    total_material_cost: float
    unaccounted_leakage_amount: float
    overall_compliance_status: str
    records: List[SupplyChainRecord]
    risk_signal: Optional[Dict[str, Any]] = None

class VendorSupplyPerformance(BaseModel):
    vendor_id: str
    vendor_name: str
    gstin: str
    total_orders: int
    on_time_delivery_pct: float
    avg_quantity_variance_pct: float
    flagged_incidents_count: int
    reputation_score: int
    active_deliveries: List[SupplyChainRecord] = []
