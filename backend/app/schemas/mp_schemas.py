"""
Pydantic Schemas for MP Office Constituency Oversight API
Strictly scoped to Member of Parliament and Constituency Cell authorization.
"""

from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class MPProfileSummary(BaseModel):
    id: str
    full_name: str
    role: str
    constituency: Optional[str] = None
    state: Optional[str] = None


class MPMetrics(BaseModel):
    total_constituency_projects: int
    active_count: int
    completed_count: int
    delayed_count: int
    total_sanctioned_inr: float
    total_disbursed_inr: float
    high_risk_attention_count: int
    public_evidence_count: int
    utilization_percentage: float


class MPRiskDistribution(BaseModel):
    low: int
    medium: int
    high: int
    critical: int


class MPDashboardResponse(BaseModel):
    mp: MPProfileSummary
    metrics: MPMetrics
    risk_distribution: MPRiskDistribution
    recent_projects: List[Dict[str, Any]] = []


class MPProjectListResponse(BaseModel):
    total: int
    limit: int
    offset: int
    constituency: str
    state: str
    projects: List[Dict[str, Any]]


class MPFinancialSummary(BaseModel):
    sanctioned_amount_inr: float
    disbursed_amount_inr: float
    expenditure_inr: float
    remaining_balance_inr: float
    utilization_percentage: float


class MPMilestone(BaseModel):
    stage_id: str
    stage_name: str
    is_completed: bool
    is_current: bool
    benchmark_days: int
    days_in_stage: Optional[int] = None
    status: str


class MPOversightRisk(BaseModel):
    risk_score: float
    risk_level: str
    attention_required: bool
    primary_risk_signal: Optional[str] = None
    top_contributing_factor: Optional[str] = None


class MPProjectDetailResponse(BaseModel):
    project: Dict[str, Any]
    financials: MPFinancialSummary
    milestones: List[MPMilestone]
    risk_oversight: MPOversightRisk
    public_evidence: List[Dict[str, Any]] = []
    expenditures: List[Dict[str, Any]] = []
