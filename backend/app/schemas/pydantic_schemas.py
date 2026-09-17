from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

# -----------------------------------------------------------------------------
# Provenance Schema
# -----------------------------------------------------------------------------
class ProvenanceMetadata(BaseModel):
    source: str = Field(..., example="data.gov.in / eSAKSHI")
    source_type: str = Field(..., example="OFFICIAL_PUBLIC")
    source_url: Optional[str] = None
    retrieved_at: datetime = Field(default_factory=datetime.now)
    is_synthetic: bool = False
    data_quality_score: float = 1.0

# -----------------------------------------------------------------------------
# MP & Project Schemas
# -----------------------------------------------------------------------------
class MPSchema(BaseModel):
    id: Optional[str] = None
    mp_name: str
    house: str
    category: str
    state: str
    constituency: Optional[str] = None
    allocated_limit_inr: float
    provenance: Optional[ProvenanceMetadata] = None

class ProjectSchema(BaseModel):
    id: Optional[str] = None
    work_id: str
    work_category: str
    work_title: str
    work_description: Optional[str] = None
    mp_name: Optional[str] = None
    ida_office: Optional[str] = None
    state: str
    constituency: Optional[str] = None
    sanctioned_amount_inr: float
    disbursed_amount_inr: float
    current_stage: str = "PROPOSAL_SUBMITTED"
    has_official_images: bool = False
    provenance: Optional[ProvenanceMetadata] = None

# -----------------------------------------------------------------------------
# Feature 1 & 2: Risk Assessment & Peer Comparison Schemas
# STRICT SEPARATION: Risk Score vs Verification Confidence
# -----------------------------------------------------------------------------
class RiskScoreBreakdown(BaseModel):
    cost_anomaly_score: float = Field(..., ge=0, le=100, description="Z-Score / IQR vs peer benchmark")
    time_delay_score: float = Field(..., ge=0, le=100, description="SLA workflow delay score")
    duplicate_risk_score: float = Field(..., ge=0, le=100, description="Perceptual photo hash overlap risk")
    cluster_density_score: float = Field(..., ge=0, le=100, description="Geographic clustering score")

class RiskAssessmentResult(BaseModel):
    project_id: str
    work_id: str
    risk_score: float = Field(..., ge=0, le=100, description="Composite Risk Score 0-100")
    anomaly_flag: str = Field(..., example="POTENTIAL_ANOMALY")
    explanation: Dict[str, Any]
    score_breakdown: RiskScoreBreakdown
    peer_group_id: str
    evaluated_at: datetime = Field(default_factory=datetime.now)

# -----------------------------------------------------------------------------
# Feature 3 & 4: Evidence & Citizen Verification Schemas
# -----------------------------------------------------------------------------
class CitizenEvidenceSubmission(BaseModel):
    project_id: str
    latitude: float
    longitude: float
    timestamp_captured: datetime
    is_live_camera_capture: bool
    image_base64: Optional[str] = None

class EvidenceVerificationResult(BaseModel):
    evidence_id: str
    project_id: str
    distance_to_project_meters: float
    location_verified: bool
    phash_value: Optional[str] = None
    duplicate_detected: bool = False
    verification_status: str

# -----------------------------------------------------------------------------
# Feature 5 & 9: Verification Confidence & Fairness Schemas
# -----------------------------------------------------------------------------
class VerificationEvaluationResult(BaseModel):
    project_id: str
    verification_confidence: float = Field(..., ge=0, le=100, description="Triangulated Verification Confidence 0-100")
    independent_evidence_status: str = Field(..., example="INDEPENDENT_EVIDENCE_UNAVAILABLE")
    is_low_connectivity_region: bool = False
    triangulation_summary: Dict[str, float]
    evaluated_at: datetime = Field(default_factory=datetime.now)

# -----------------------------------------------------------------------------
# Feature 6: SLA Workflow Bottleneck Schema
# -----------------------------------------------------------------------------
class SLABottleneckResult(BaseModel):
    project_id: str
    current_stage: str
    days_in_current_stage: float
    expected_benchmark_days: float
    delay_ratio: float
    responsible_role: str
    is_bottleneck: bool

# -----------------------------------------------------------------------------
# Feature 7: Inspection Optimizer Schema
# -----------------------------------------------------------------------------
class InspectorScheduleItem(BaseModel):
    inspection_priority_rank: int
    project_id: str
    work_id: str
    priority_score: float
    risk_score: float
    disbursed_amount_inr: float
    distance_from_base_km: float
    recommended_action: str

# -----------------------------------------------------------------------------
# Feature 8: Ledger Snapshot Schema
# -----------------------------------------------------------------------------
class AuditLedgerEntry(BaseModel):
    ledger_id: str
    project_id: str
    action_type: str
    data_source: str
    model_version: str
    rules_version: str
    risk_score: float
    verification_confidence: float
    human_decision: Optional[str] = None
    human_notes: Optional[str] = None
    snapshot_payload: Dict[str, Any]
    timestamp: datetime
