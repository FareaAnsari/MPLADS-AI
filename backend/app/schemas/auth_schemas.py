"""
Backend Authentication Models, Roles, and Permission Schemas
Strictly aligned with the Canonical Mobile RBAC Architecture.
"""

from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List
from datetime import datetime
from enum import Enum


class UserRole(str, Enum):
    CITIZEN = "CITIZEN"
    DISTRICT_OFFICER = "DISTRICT_OFFICER"
    MP_OFFICE = "MP_OFFICE"
    CONTRACTOR = "CONTRACTOR"
    OVERVIEW = "OVERVIEW"


ROLE_PERMISSIONS: dict[str, list[str]] = {
    UserRole.CITIZEN.value: [
        "projects:read",
        "evidence:submit",
        "risk:read",
    ],
    UserRole.DISTRICT_OFFICER.value: [
        "projects:read",
        "projects:write",
        "risk:read",
        "risk:audit",
        "evidence:review",
        "inspections:read",
        "inspections:update",
        "sla:read",
        "ledger:decision",
    ],
    UserRole.MP_OFFICE.value: [
        "projects:read",
        "risk:read",
        "risk:audit",
        "sla:read",
    ],
    UserRole.CONTRACTOR.value: [
        "projects:read",
        "projects:write",
        "evidence:submit",
    ],
    UserRole.OVERVIEW.value: [
        "projects:read",
        "risk:read",
    ],
}


class UserModel(BaseModel):
    id: str
    username: str
    email: Optional[str] = None
    full_name: str
    password_hash: str
    role: UserRole
    permissions: List[str] = []
    is_active: bool = True
    jurisdiction_state: Optional[str] = None
    jurisdiction_district: Optional[str] = None
    constituency: Optional[str] = None
    inspector_id: Optional[str] = None
    aadhaar_masked: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class UserProfileResponse(BaseModel):
    id: str
    username: str
    email: Optional[str] = None
    full_name: str
    role: UserRole
    permissions: List[str]
    is_active: bool
    jurisdiction_state: Optional[str] = None
    jurisdiction_district: Optional[str] = None
    constituency: Optional[str] = None
    inspector_id: Optional[str] = None
    aadhaar_masked: Optional[str] = None


class LoginRequest(BaseModel):
    username: str = Field(..., description="Username, Email, Officer ID, or 12-digit Aadhaar Number")
    password: str = Field(..., description="User secret password or Aadhaar OTP")


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in_seconds: int
    user: UserProfileResponse


class RefreshTokenRequest(BaseModel):
    refresh_token: str


class AadhaarSendOtpRequest(BaseModel):
    aadhaar_number: str = Field(..., description="12-digit Aadhaar number")


class AadhaarSendOtpResponse(BaseModel):
    success: bool = True
    message: str
    masked_mobile: str
    session_id: str


class AadhaarVerifyOtpRequest(BaseModel):
    aadhaar_number: str = Field(..., description="12-digit Aadhaar number")
    otp: str = Field(..., description="6-digit UIDAI verification OTP")
    full_name: Optional[str] = None
    jurisdiction_state: Optional[str] = "Bihar"
    jurisdiction_district: Optional[str] = "Araria"

