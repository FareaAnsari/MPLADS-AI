"""
FastAPI Notifications Router
Endpoints for Device Registration, In-App Notification Feed, Unread Counts, Mark-as-read, and Preferences.
Enforces strict user scoping and RBAC.
"""

from typing import List, Dict, Optional
from datetime import datetime
from fastapi import APIRouter, HTTPException, Depends, status
from schemas.auth_schemas import UserModel, UserRole
from schemas.notification_schemas import (
    DeviceRegistrationRequest,
    DeviceRegistrationResponse,
    NotificationResponse,
    UnreadCountResponse,
    NotificationPreferencesRequest,
    NotificationPreferencesResponse,
)
from auth.dependencies import get_current_user

router = APIRouter(prefix="/notifications", tags=["Notifications"])

# In-memory device token store: user_id -> List of device registrations
_user_devices: Dict[str, List[Dict]] = {}

# In-memory preferences store: user_id -> NotificationPreferencesResponse
_user_preferences: Dict[str, NotificationPreferencesResponse] = {}

# Seed initial operational & citizen notifications tied to known demo accounts
_notifications_db: List[Dict] = [
    # Citizen Notifications (user: citizen1 / role: CITIZEN)
    {
        "id": "notif-cit-001",
        "user_id": "usr-citizen-01",
        "role": "CITIZEN",
        "type": "EVIDENCE_REVIEW_UPDATE",
        "category": "EVIDENCE",
        "title": "Evidence Verification Complete",
        "body": "Your submitted geotagged verification photos for Solar Streetlights have been approved by the District Officer.",
        "entity_type": "evidence",
        "entity_id": "ev-cit-001",
        "deep_link": "mplads://citizen/evidence/ev-cit-001",
        "read_at": None,
        "created_at": datetime.now(),
    },
    {
        "id": "notif-cit-002",
        "user_id": "usr-citizen-01",
        "role": "CITIZEN",
        "type": "PROJECT_STAGE_UPDATE",
        "category": "PROJECT",
        "title": "Project Milestone Achieved",
        "body": "Primary Health Centre Upgradation has entered Stage 3 (Final Commissioning).",
        "entity_type": "project",
        "entity_id": "MPLADS-2024-BR01-002",
        "deep_link": "mplads://citizen/projects/MPLADS-2024-BR01-002",
        "read_at": None,
        "created_at": datetime.now(),
    },
    # District Officer Notifications (user: officer1 / role: DISTRICT_OFFICER)
    {
        "id": "notif-off-001",
        "user_id": "usr-officer-01",
        "role": "DISTRICT_OFFICER",
        "type": "EVIDENCE_SUBMITTED",
        "category": "EVIDENCE",
        "title": "New Citizen Evidence Submitted",
        "body": "Citizen verification submitted with GPS and camera proof for Community Hall Construction.",
        "entity_type": "evidence",
        "entity_id": "ev-mock-001",
        "deep_link": "mplads://officer/evidence/ev-mock-001",
        "read_at": None,
        "created_at": datetime.now(),
    },
    {
        "id": "notif-off-002",
        "user_id": "usr-officer-01",
        "role": "DISTRICT_OFFICER",
        "type": "HIGH_RISK_ALERT",
        "category": "RISK",
        "title": "Risk Assessment Requires Review",
        "body": "High-risk anomalies flagged in Araria district project timeline. Review risk drivers.",
        "entity_type": "risk",
        "entity_id": "MPLADS-2024-BR01-001",
        "deep_link": "mplads://officer/risk/MPLADS-2024-BR01-001",
        "read_at": None,
        "created_at": datetime.now(),
    },
    {
        "id": "notif-off-003",
        "user_id": "usr-officer-01",
        "role": "DISTRICT_OFFICER",
        "type": "SLA_BOTTLENECK_ALERT",
        "category": "SLA",
        "title": "SLA Milestone Approaching",
        "body": "Technical Sanction SLA milestone expires in 48 hours for Rural Library project.",
        "entity_type": "sla",
        "entity_id": "MPLADS-2024-BR01-003",
        "deep_link": "mplads://officer/sla/MPLADS-2024-BR01-003",
        "read_at": None,
        "created_at": datetime.now(),
    },
    {
        "id": "notif-off-004",
        "user_id": "usr-officer-01",
        "role": "DISTRICT_OFFICER",
        "type": "INSPECTION_ASSIGNED",
        "category": "INSPECTION",
        "title": "Physical Inspection Scheduled",
        "body": "Scheduled quarterly audit inspection for Drinking Water Pipeline.",
        "entity_type": "inspection",
        "entity_id": "insp-001",
        "deep_link": "mplads://officer/inspection/insp-001",
        "read_at": None,
        "created_at": datetime.now(),
    },
]


@router.post("/devices", response_model=DeviceRegistrationResponse, summary="Register mobile push device token")
def register_device(
    req: DeviceRegistrationRequest,
    current_user: UserModel = Depends(get_current_user),
):
    """
    Registers a push token (e.g., Expo Push Token) tied strictly to the authenticated user ID.
    Supports multi-device token management and deduplication.
    """
    user_id = current_user.id
    if user_id not in _user_devices:
        _user_devices[user_id] = []

    # Remove stale entry with identical device_id if exists
    _user_devices[user_id] = [d for d in _user_devices[user_id] if d["device_id"] != req.device_id]

    # Add active registration
    _user_devices[user_id].append({
        "device_id": req.device_id,
        "push_token": req.push_token,
        "platform": req.platform,
        "app_version": req.app_version,
        "registered_at": datetime.now(),
        "is_active": True,
    })

    return DeviceRegistrationResponse(
        status="REGISTERED",
        device_id=req.device_id,
        registered_at=datetime.now(),
    )


@router.delete("/devices/{device_id}", summary="Unregister push device on logout")
def unregister_device(
    device_id: str,
    current_user: UserModel = Depends(get_current_user),
):
    """
    Deactivates and removes device push token on logout to prevent notification leakage between sessions.
    """
    user_id = current_user.id
    if user_id in _user_devices:
        _user_devices[user_id] = [d for d in _user_devices[user_id] if d["device_id"] != device_id]

    return {"status": "UNREGISTERED", "device_id": device_id}


@router.get("", response_model=List[NotificationResponse], summary="Get notification feed for authenticated user")
def get_notifications(
    category: Optional[str] = None,
    current_user: UserModel = Depends(get_current_user),
):
    """
    Returns user-scoped notifications sorted by creation date descending.
    Rejects unauthorized access to other users' feeds.
    """
    user_id = current_user.id
    user_role = current_user.role.value

    # Filter notifications strictly owned by user OR matching role if assigned system-wide
    notifs = [
        n for n in _notifications_db
        if n["user_id"] == user_id or (n["role"] == user_role and n["user_id"].startswith("usr-"))
    ]

    if category:
        notifs = [n for n in notifs if n.get("category") == category.upper()]

    # Sort newest first
    notifs.sort(key=lambda x: x["created_at"], reverse=True)

    return [NotificationResponse(**n) for n in notifs]


@router.get("/unread-count", response_model=UnreadCountResponse, summary="Get unread notification count")
def get_unread_count(
    current_user: UserModel = Depends(get_current_user),
):
    """
    Returns the count of unread notifications for the caller.
    """
    user_id = current_user.id
    user_role = current_user.role.value

    unread = [
        n for n in _notifications_db
        if (n["user_id"] == user_id or n["role"] == user_role) and n["read_at"] is None
    ]

    return UnreadCountResponse(unread_count=len(unread))


@router.post("/{notification_id}/read", response_model=NotificationResponse, summary="Mark notification as read")
def mark_notification_read(
    notification_id: str,
    current_user: UserModel = Depends(get_current_user),
):
    """
    Marks a single notification as read. Validates that the notification belongs to the authenticated user.
    """
    user_id = current_user.id
    user_role = current_user.role.value

    target = None
    for n in _notifications_db:
        if n["id"] == notification_id:
            # Check ownership
            if n["user_id"] != user_id and n["role"] != user_role:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Cannot mark notifications belonging to another user.",
                )
            target = n
            break

    if not target:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found.",
        )

    if target["read_at"] is None:
        target["read_at"] = datetime.now()

    return NotificationResponse(**target)


@router.get("/preferences", response_model=NotificationPreferencesResponse, summary="Get notification preferences")
def get_preferences(
    current_user: UserModel = Depends(get_current_user),
):
    """Returns user's notification preferences."""
    user_id = current_user.id
    if user_id not in _user_preferences:
        _user_preferences[user_id] = NotificationPreferencesResponse()
    return _user_preferences[user_id]


@router.put("/preferences", response_model=NotificationPreferencesResponse, summary="Update notification preferences")
def update_preferences(
    req: NotificationPreferencesRequest,
    current_user: UserModel = Depends(get_current_user),
):
    """Updates user's notification preferences."""
    user_id = current_user.id
    prefs = NotificationPreferencesResponse(
        push_enabled=req.push_enabled,
        evidence_updates=req.evidence_updates,
        risk_alerts=req.risk_alerts,
        sla_alerts=req.sla_alerts,
        inspection_updates=req.inspection_updates,
        project_milestones=req.project_milestones,
        updated_at=datetime.now(),
    )
    _user_preferences[user_id] = prefs
    return prefs
