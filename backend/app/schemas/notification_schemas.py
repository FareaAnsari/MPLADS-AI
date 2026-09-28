from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field

class DeviceRegistrationRequest(BaseModel):
    push_token: str = Field(..., description="Expo Push Token or FCM Device Token")
    device_id: str = Field(..., description="Unique Device UUID")
    platform: str = Field(..., description="ios | android | web")
    app_version: Optional[str] = None

class DeviceRegistrationResponse(BaseModel):
    status: str
    device_id: str
    registered_at: datetime = Field(default_factory=datetime.now)

class NotificationResponse(BaseModel):
    id: str
    user_id: str
    role: str
    type: str = Field(..., description="EVIDENCE_SUBMITTED | EVIDENCE_REVIEW_UPDATE | HIGH_RISK_ALERT | SLA_BOTTLENECK_ALERT | INSPECTION_ASSIGNED | PROJECT_STAGE_UPDATE | SYSTEM_NOTICE")
    category: str = Field(..., description="EVIDENCE | RISK | SLA | INSPECTION | PROJECT | SYSTEM")
    title: str
    body: str
    entity_type: Optional[str] = None
    entity_id: Optional[str] = None
    deep_link: Optional[str] = None
    read_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.now)

class UnreadCountResponse(BaseModel):
    unread_count: int

class NotificationPreferencesRequest(BaseModel):
    push_enabled: bool = True
    evidence_updates: bool = True
    risk_alerts: bool = True
    sla_alerts: bool = True
    inspection_updates: bool = True
    project_milestones: bool = True

class NotificationPreferencesResponse(NotificationPreferencesRequest):
    updated_at: datetime = Field(default_factory=datetime.now)
