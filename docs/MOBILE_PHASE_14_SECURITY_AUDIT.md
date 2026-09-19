# Phase 14 — Security Audit & Vulnerability Assessment

## 1. Executive Summary

This security audit assesses the full MPLADS-AI (`Pratyaksh`) codebase across the FastAPI backend (`backend/`), React Native / Expo mobile application (`mobile/`), web services (`src/`), and supporting infrastructure.

The audit encompasses:
- Authentication & JWT token security
- Authorization, RBAC, IDOR, and Jurisdiction Scoping
- API Input Validation & Numerical Bounds
- File & Media Upload Security
- Secrets Management & Plaintext Credentials
- SQLite Database & SecureStore Isolation
- Offline Outbox & Idempotency Security
- Notifications & Device Token Privacy
- Logging & Sensitive Data Redaction
- Production Build & Environment Hardening

---

## 2. Threat Model & Asset Valuation

### Primary Assets:
1. **Government Audit Records**: Official sanction allocations, disbursement ledgers, statutory inspection decisions, and hash chains.
2. **User Credentials & Tokens**: Passwords, JWT Bearer access tokens, refresh tokens, and device push tokens.
3. **AI Risk Intelligence**: Anomaly models, peer comparison benchmarks, and confidential officer risk evaluations.
4. **Physical Verification Evidence**: Geotagged site photographs, camera timestamps, and GPS cadastral coordinates.
5. **Local Device Data**: Encrypted SecureStore credentials, SQLite offline project caches, and mutation outboxes.

### Threat Actors:
- **Unauthenticated External Attacker**: Attempts API enumeration, token forgery, parameter tampering, and algorithm confusion.
- **Malicious / Low-Privilege Citizen**: Attempts to forge inspection decisions, view raw risk models, or tamper with coordinates.
- **Unauthorized Contractor**: Attempts to query or modify work packages belonging to competing contractors or inflate progress numbers.
- **Compromised Device / Local Snooper**: Attempts to extract plaintext credentials from device logs or shared caches upon account switching.

---

## 3. Detailed Security Findings

### Finding 1: Plaintext Third-Party API Keys Committed in Web Services
- **Severity**: `CRITICAL`
- **Affected Component**: `src/services/groqAIService.ts`, `src/services/elevenLabsAudioService.ts`
- **Evidence**:
  - `const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || 'gsk_wWtE0...';`
  - `const ELEVENLABS_API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY || 'sk_7102...';`
- **Impact**: Exposure of third-party API credentials allowing unauthorized inference requests and quota exhaustion.
- **Recommended Remediation**: Remove plaintext fallbacks; read strictly from environment variables; fallback gracefully to deterministic / browser synthesis; document immediate credential rotation requirement.
- **Status**: Remediation Planned (Phase 14)

---

### Finding 2: JWT Secret Key Default Fallback in Production Configuration
- **Severity**: `HIGH`
- **Affected Component**: `backend/app/config.py`
- **Evidence**:
  - `JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "pratyaksh_dev_jwt_secret_key_change_in_production_2026")`
- **Impact**: If deployed to production without setting `JWT_SECRET_KEY`, the server silently defaults to a known development secret, enabling trivial token forgery.
- **Recommended Remediation**: Implement fail-closed validation on startup: if `ENVIRONMENT == "production"` and `JWT_SECRET_KEY` is default or missing, raise a fatal configuration exception.
- **Status**: Remediation Planned (Phase 14)

---

### Finding 3: JWT Algorithm Substitution and Header Validation
- **Severity**: `HIGH`
- **Affected Component**: `backend/app/auth/security.py`
- **Evidence**:
  - `verify_jwt_token` decodes the token and checks the HMAC signature, but does not explicitly enforce `header["alg"] == "HS256"` and `header["typ"] == "JWT"`.
- **Impact**: Potential algorithm confusion or parsing anomalies with malformed headers.
- **Recommended Remediation**: Explicitly validate header `alg == "HS256"` and `typ == "JWT"` in `verify_jwt_token`.
- **Status**: Remediation Planned (Phase 14)

---

### Finding 4: Unbounded Coordinates and Progress Inputs in Pydantic Schemas
- **Severity**: `HIGH`
- **Affected Component**: `backend/app/schemas/pydantic_schemas.py`, `backend/app/schemas/contractor_schemas.py`
- **Evidence**:
  - `CitizenEvidenceSubmission` defined `latitude: float`, `longitude: float` without `ge=-90, le=90` or `ge=-180, le=180` bounds.
  - `ProgressUpdateRequest` defined `latitude` and `longitude` without bounds.
- **Impact**: Attackers could submit impossible coordinates (e.g. latitude `999.0`), corrupting geographic distance calculations and clustering models.
- **Recommended Remediation**: Apply Pydantic `Field(..., ge=-90.0, le=90.0)` and `Field(..., ge=-180.0, le=180.0)` validation.
- **Status**: Remediation Planned (Phase 14)

---

### Finding 5: Officer Evidence Review & Inspection Update Jurisdiction Scoping
- **Severity**: `MEDIUM`
- **Affected Component**: `backend/app/routers/intelligence.py`
- **Evidence**:
  - `review_citizen_evidence` and `update_officer_inspection` validated `evidence:review` and `inspections:update` permissions, but did not cross-verify whether the target project falls within the officer's designated `jurisdiction_district` / `jurisdiction_state`.
- **Impact**: An officer from District A could review evidence or log inspections for projects in District B.
- **Recommended Remediation**: Enforce server-side jurisdiction validation matching project location to the officer's `jurisdiction_district` and `jurisdiction_state`.
- **Status**: Remediation Planned (Phase 14)

---

### Finding 6: Missing HTTP Security Headers and Permissive CORS
- **Severity**: `MEDIUM`
- **Affected Component**: `backend/app/main.py`
- **Evidence**:
  - `allow_origins=["*"]` when `CORS_ORIGINS` was not set, and missing standard security response headers (`X-Content-Type-Options`, `X-Frame-Options`, `Strict-Transport-Security`, `Content-Security-Policy`).
- **Impact**: Vulnerability to clickjacking, MIME-sniffing, and cross-origin abuse in browser contexts.
- **Recommended Remediation**: Add security middleware attaching strict HTTP security headers; restrict CORS to explicit origins in production.
- **Status**: Remediation Planned (Phase 14)

---

### Finding 7: Unsanitized Logging of Error Objects
- **Severity**: `MEDIUM`
- **Affected Component**: `mobile/src/utils/logger.ts`
- **Evidence**:
  - `logger.error` logged raw `error` arguments without scrubbing potential authorization headers, tokens, or passwords.
- **Impact**: Accidental leakage of Bearer tokens or sensitive user data in system console logs or crash dumps.
- **Recommended Remediation**: Implement an automated regex-based redaction filter in `Logger` for `Authorization`, `token`, `password`, `secret`, `bearer`, and `apiKey`.
- **Status**: Remediation Planned (Phase 14)

---

### Finding 8: Development Authentication Lockdown in Production
- **Severity**: `LOW`
- **Affected Component**: `mobile/src/data/repositories/RemoteAuthRepository.ts`, `mobile/src/store/authStore.ts`
- **Evidence**:
  - Development mock synthetic identities exist for rapid testing in development mode.
- **Impact**: Inadvertent use of mock identities in production builds if environment checks are bypassed.
- **Recommended Remediation**: Ensure `login` and `devModeLogin` throw immediate fatal errors if `Config.environment === 'production'` and fail closed.
- **Status**: Remediation Planned (Phase 14)

---

## 4. Remediation Plan & Priority Matrix

| ID | Finding | Severity | Target Component | Phase 14 Action |
| :--- | :--- | :--- | :--- | :--- |
| **SEC-01** | Plaintext API Keys in Web Services | `CRITICAL` | `src/services/` | Remove fallbacks; rotate keys |
| **SEC-02** | JWT Secret Fail-Closed in Prod | `HIGH` | `backend/app/config.py` | Fail closed on default key |
| **SEC-03** | JWT Header & Alg Validation | `HIGH` | `backend/app/auth/security.py` | Enforce HS256 & JWT type |
| **SEC-04** | Coordinate & Value Bounds Validation | `HIGH` | `backend/app/schemas/` | Add [-90, 90] & [0, 100] bounds |
| **SEC-05** | Officer Jurisdiction Verification | `MEDIUM` | `backend/app/routers/` | Verify officer jurisdiction |
| **SEC-06** | Security Headers & CORS Lockdown | `MEDIUM` | `backend/app/main.py` | Add security headers middleware |
| **SEC-07** | Logger Redaction Filter | `MEDIUM` | `mobile/src/utils/logger.ts` | Scrub tokens and credentials |
| **SEC-08** | Dev Auth Production Lockdown | `LOW` | `mobile/src/data/repositories/` | Hard fail in production |
