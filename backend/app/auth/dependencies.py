"""
FastAPI Security & Authorization Dependencies
Enforces Bearer JWT token verification, role-based access control, and fine-grained permissions.
"""

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import List, Callable
from schemas.auth_schemas import UserModel, UserRole
from auth.security import verify_jwt_token
from auth.user_store import user_db

bearer_scheme = HTTPBearer(auto_error=False)


def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme)) -> UserModel:
    """Authenticates Bearer token; raises HTTP 401 if missing, invalid, or expired."""
    if not credentials or not credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authentication credentials. Bearer token required.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = credentials.credentials
    if user_db.is_token_revoked(token):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has been revoked upon logout.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    payload = verify_jwt_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload identity.",
        )

    user = user_db.get_by_id(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account associated with token not found.",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is deactivated. Access denied.",
        )

    return user


def require_role(allowed_roles: List[UserRole]) -> Callable[[UserModel], UserModel]:
    """Dependency factory requiring the authenticated user to hold one of the allowed roles."""
    def role_checker(current_user: UserModel = Depends(get_current_user)) -> UserModel:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access forbidden: Requires one of {[r.value for r in allowed_roles]} roles.",
            )
        return current_user
    return role_checker


def require_permission(required_permission: str) -> Callable[[UserModel], UserModel]:
    """Dependency factory requiring the authenticated user to possess a specific permission token."""
    def permission_checker(current_user: UserModel = Depends(get_current_user)) -> UserModel:
        if required_permission not in current_user.permissions:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access forbidden: Missing required permission '{required_permission}'.",
            )
        return current_user
    return permission_checker
