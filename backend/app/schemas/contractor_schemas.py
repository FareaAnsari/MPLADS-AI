"""
Pydantic Schemas for Contractor Operations & Progress Tracking API
Strictly scoped to assigned contractor projects and operational workflows.
"""

from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field


class ContractorProfileSummary(BaseModel):
    id: str
    full_name: str
    company_name: str
    role: str
    jurisdiction_state: Optional[str] = None
    contractor_id: str


class ContractorMetrics(BaseModel):
    assigned_projects_count: int
    active_works_count: int
    completed_works_count: int
    pending_submissions_count: int
    reported_issues_count: int
    total_contract_value_inr: float


class ContractorDashboardResponse(BaseModel):
    contractor: ContractorProfileSummary
    metrics: ContractorMetrics
    assigned_projects: List[Dict[str, Any]] = []
    recent_submissions: List[Dict[str, Any]] = []


class ContractorProjectListResponse(BaseModel):
    total: int
    limit: int
    offset: int
    contractor_id: str
    projects: List[Dict[str, Any]]


class ProgressUpdateRequest(BaseModel):
    work_id: str
    progress_percentage: float = Field(..., ge=0.0, le=100.0, description="Reported physical progress between 0 and 100")
    milestone_stage: Optional[str] = Field(None, max_length=100, description="Stage code associated with update")
    remarks: str = Field(..., min_length=3, max_length=2000, description="Contractor operational remarks")
    field_observations: Optional[str] = Field(None, max_length=2000)
    latitude: Optional[float] = Field(None, ge=-90.0, le=90.0)
    longitude: Optional[float] = Field(None, ge=-180.0, le=180.0)
    photos: List[str] = []


class ProgressUpdateResponse(BaseModel):
    submission_id: str
    work_id: str
    contractor_id: str
    reported_progress_percent: float
    milestone_stage: str
    remarks: str
    field_observations: Optional[str] = None
    status: str = "SUBMITTED"
    submitted_at: datetime = Field(default_factory=datetime.utcnow)
    audit_ref: str


class ContractorIssueRequest(BaseModel):
    work_id: str
    category: str = Field(..., pattern="^(MATERIAL_DELAY|SITE_ACCESS|APPROVAL_DEPENDENCY|WEATHER_BLOCKER|TECHNICAL_ISSUE|OTHER)$")
    title: str = Field(..., min_length=3, max_length=200)
    description: str = Field(..., min_length=10, max_length=4000)
    severity: str = Field("MEDIUM", pattern="^(LOW|MEDIUM|HIGH|CRITICAL)$")


class ContractorIssueResponse(BaseModel):
    issue_id: str
    work_id: str
    contractor_id: str
    category: str
    title: str
    description: str
    severity: str
    status: str = "REPORTED"
    reported_at: datetime = Field(default_factory=datetime.utcnow)
    acknowledged_at: Optional[datetime] = None


class ContractorProjectDetailResponse(BaseModel):
    project: Dict[str, Any]
    contract_value_inr: float
    reported_progress_percent: float
    verified_progress_percent: float
    milestones: List[Dict[str, Any]] = []
    progress_history: List[Dict[str, Any]] = []
    issues: List[Dict[str, Any]] = []
