# Phase 4.5: Backend Authentication & Authorization Report
**Project**: Pratyaksh — AI-Powered MPLADS Monitoring & Verification Intelligence Layer  
**Framework**: FastAPI (Python 3) + Pydantic v2 + HMAC-SHA256 JWT  
**Date**: September 19, 2026  
**Status**: Completed — Production-Capable Backend Auth & Authorization Active  

---

## 1. Backend Authentication Architecture

A lightweight, cryptographically secure authentication and RBAC layer has been introduced into the FastAPI backend, bridging the Mobile Client to an authoritative server-side identity provider.

```text
       MOBILE CLIENT (React Native / Axios)
                        │
                        ▼
               POST /api/v1/auth/login
                        │
                        ▼
       FastAPI Backend: routers/auth.py
                        │
                        ├─► PBKDF2-HMAC-SHA256 Password Verification (100k rounds)
                        ├─► Server-Authoritative Role & Permission Attachment
                        └─► Issues Signed HS256 JWT Access & Refresh Tokens
                        │
                        ▼
       Mobile SecureStore (KeyChain / Keystore)
                        │
                        ▼  (Subsequent Requests: Authorization: Bearer <token>)
       FastAPI Protected Endpoints:
       ├─► get_current_user (Validates signature & revocation)
       ├─► require_role([DISTRICT_OFFICER, MP_OFFICE, etc.])
       └─► require_permission("ledger:decision" | "evidence:submit")
```

---

## 2. Implemented Endpoints & Contracts

| Endpoint | Method | Security Level | Purpose |
|---|---|---|---|
| `/api/v1/auth/login` | `POST` | Public | Authenticates credentials and returns JWT access + refresh tokens |
| `/api/v1/auth/refresh` | `POST` | Public / Token | Exchanges valid refresh token for a fresh access token |
| `/api/v1/auth/logout` | `POST` | Authenticated | Revokes active bearer token on server |
| `/api/v1/auth/me` | `GET` | Authenticated | Returns profile, jurisdiction, and canonical permissions of caller |
| `/api/v1/ledger/entry/{entry_id}/decision` | `POST` | **Role/Permission Protected** | Enforces `ledger:decision` permission (District Officer only) |
| `/api/v1/citizen/evidence` | `POST` | **Permission Protected** | Enforces `evidence:submit` permission (Citizen, Contractor, Officer) |

---

## 3. Server-Authoritative Roles & Permissions

- **Canonical Roles (`schemas/auth_schemas.py`)**:
  - `CITIZEN`: `["projects:read", "evidence:submit", "risk:read"]`
  - `DISTRICT_OFFICER`: `["projects:read", "projects:write", "risk:read", "risk:audit", "evidence:review", "inspections:read", "inspections:update", "sla:read", "ledger:decision"]`
  - `MP_OFFICE`: `["projects:read", "risk:read", "risk:audit", "sla:read"]`
  - `CONTRACTOR`: `["projects:read", "projects:write", "evidence:submit"]`
  - `OVERVIEW`: `["projects:read", "risk:read"]`

- **Authoritative Rule**: Client-submitted role strings are strictly ignored; role claims are parsed exclusively from server-verified JWT payloads.

---

## 4. Cryptographic Security Standards

1. **Password Hashing**: PBKDF2 with HMAC-SHA256 and 100,000 iterations using cryptographic 16-byte random salts.
2. **JWT Signing**: HS256 with key from `Config.JWT_SECRET_KEY` (environment-driven).
3. **Short-Lived Tokens**: Access tokens configured for 24h default (configurable via `ACCESS_TOKEN_EXPIRE_MINUTES`).
4. **Token Revocation**: `user_db.revoke_token()` invalidates tokens immediately upon logout.
5. **Disabled Account Protection**: Inactive users (`is_active: False`) are rejected with HTTP 403 Forbidden.

---

## 5. Test Suite Verification

- **Backend Test Suite (`backend/tests/auth_test.py`)**: **PASS (7/7 tests)**
  - ✅ PBKDF2 Password hashing & verification
  - ✅ User lookup and active/disabled status validation
  - ✅ HS256 JWT creation, payload decoding & signature verification
  - ✅ Expired token rejection
  - ✅ Tampered token rejection
  - ✅ Role-permission enforcement
  - ✅ Token revocation on logout
- **Mobile Test Suite (`npx jest`)**: **PASS (7/7 tests)**
- **Mobile TypeScript (`npx tsc --noEmit`)**: **PASS (0 errors)**

---

## 6. Environment Variables Required in Production

- `JWT_SECRET_KEY`: High-entropy secret string for signing server JWTs.
- `ACCESS_TOKEN_EXPIRE_MINUTES`: Access token validity duration in minutes.
- `REFRESH_TOKEN_EXPIRE_DAYS`: Refresh token validity duration in days.
