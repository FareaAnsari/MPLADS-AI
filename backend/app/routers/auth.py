"""
FastAPI Authentication Router
Endpoints: POST /auth/login, POST /auth/refresh, POST /auth/logout, GET /auth/me
"""

from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from schemas.auth_schemas import (
    LoginRequest,
    TokenResponse,
    RefreshTokenRequest,
    UserProfileResponse,
    UserModel,
)
from auth.security import (
    verify_password,
    generate_access_token,
    generate_refresh_token,
    verify_jwt_token,
)
from auth.user_store import user_db
from auth.dependencies import get_current_user
from config import config

router = APIRouter(prefix="/auth", tags=["Authentication & Access Control"])
bearer_scheme = HTTPBearer(auto_error=False)


@router.post("/login", response_model=TokenResponse, summary="Authenticate user & issue JWT tokens")
def login(req: LoginRequest):
    """
    Authenticates user against backend store using PBKDF2-HMAC-SHA256 password hashing.
    Issues signed short-lived JWT Access Token & Refresh Token.
    """
    user = user_db.get_by_username(req.username.strip())
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deactivated. Please contact the district administrator.",
        )

    if not verify_password(req.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = generate_access_token(user.id, user.role.value)
    refresh_token = generate_refresh_token(user.id)

    profile = UserProfileResponse(
        id=user.id,
        username=user.username,
        email=user.email,
        full_name=user.full_name,
        role=user.role,
        permissions=user.permissions,
        is_active=user.is_active,
        jurisdiction_state=user.jurisdiction_state,
        jurisdiction_district=user.jurisdiction_district,
        constituency=user.constituency,
        inspector_id=user.inspector_id,
    )

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        expires_in_seconds=config.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user=profile,
    )


@router.post("/refresh", summary="Exchange refresh token for new access token")
def refresh_token(req: RefreshTokenRequest):
    """Validates refresh token and issues fresh access token without re-entering credentials."""
    if user_db.is_token_revoked(req.refresh_token):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token has been revoked.",
        )

    payload = verify_jwt_token(req.refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token.",
        )

    user_id = payload.get("sub")
    user = user_db.get_by_id(user_id) if user_id else None
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User identity no longer active.",
        )

    new_access_token = generate_access_token(user.id, user.role.value)

    return {
        "access_token": new_access_token,
        "token_type": "bearer",
        "expires_in_seconds": config.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    }


@router.post("/logout", summary="Revoke session tokens")
def logout(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    current_user: UserModel = Depends(get_current_user),
):
    """Revokes the current JWT bearer token on the server."""
    if credentials and credentials.credentials:
        user_db.revoke_token(credentials.credentials)
    return {"status": "SUCCESS", "message": "Successfully logged out and revoked active token."}


@router.get("/me", response_model=UserProfileResponse, summary="Get current authenticated user profile")
def get_my_profile(current_user: UserModel = Depends(get_current_user)):
    """Returns profile and canonical permissions of the authenticated caller."""
    return UserProfileResponse(
        id=current_user.id,
        username=current_user.username,
        email=current_user.email,
        full_name=current_user.full_name,
        role=current_user.role,
        permissions=current_user.permissions,
        is_active=current_user.is_active,
        jurisdiction_state=current_user.jurisdiction_state,
        jurisdiction_district=current_user.jurisdiction_district,
        constituency=current_user.constituency,
        inspector_id=current_user.inspector_id,
    )
