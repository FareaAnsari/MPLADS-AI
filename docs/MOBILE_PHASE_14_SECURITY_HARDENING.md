# Phase 14 — Security Hardening Report & Architecture

## 1. Security Audit Scope

The Phase 14 security review and hardening encompass the full MPLADS-AI (`Pratyaksh`) stack:
- **Backend**: FastAPI API architecture, JWT authentication engine, PBKDF2 password hashing, RBAC/permission dependencies, input validation schemas, database queries, and response headers.
- **Mobile Application**: React Native / Expo client, SecureStore token storage, SQLite local database, outbox queue, deep-link routing, logger redaction, and offline caching.
- **Web Frontend**: API services, credential references, and environment loading.

---

## 2. Threat Model

```
 ┌─────────────────────────────────────────────────────────────┐
 │                       THREAT ACTORS                         │
 ├──────────────────────────────┬──────────────────────────────┤
 │ • Unauthenticated Attacker   │ • Malicious Citizen          │
 │ • Rogue / Competitor Vendor  │ • Compromised Mobile Device  │
 │ • Cross-District Officer     │ • Network / Man-in-the-Middle│
 └──────────────────────────────┴──────────────────────────────┘
                               ↓
 ┌─────────────────────────────────────────────────────────────┐
 │                   AUTHORITATIVE DEFENSES                    │
 ├──────────────────────────────┬──────────────────────────────┤
 │ • Constant-time HMAC-SHA256  │ • Server Jurisdiction Checks │
 │ • Strict HS256 / Typ Headers │ • Server Contractor Scoping  │
 │ • Bounded Input Validation   │ • SecureStore Credential Ring│
 │ • Regex Log Redaction Filter │ • HTTP Security Headers      │
 └──────────────────────────────┴──────────────────────────────┘
```

---

## 3. Authentication Hardening

1. **Password Hashing**: Passwords stored using PBKDF2-HMAC-SHA256 with random 16-byte hex salts and 100,000 iterations. Verification uses constant-time `hmac.compare_digest`.
2. **JWT Signature & Header Verification**: `verify_jwt_token` enforces `header["alg"] == "HS256"` and `header["typ"] == "JWT"`. Tokens signed with an invalid key or malformed header are rejected with `401 Unauthorized`.
3. **Fail-Closed Secret Enforcement**: `Config` in `backend/app/config.py` verifies that if `ENVIRONMENT == "production"`, `JWT_SECRET_KEY` cannot be the default development fallback string; it raises a fatal `ValueError` on startup.

---

## 4. Authorization & RBAC

1. **Role-Based Guards**: Protected endpoints enforce `require_role([UserRole.DISTRICT_OFFICER])`, `require_role([UserRole.MP_OFFICE])`, or `require_role([UserRole.CONTRACTOR])`.
2. **Permission Token Enforcing**: Sensitive mutations (`evidence:review`, `inspections:update`, `ledger:decision`) enforce explicit permission tokens.
3. **Privilege Separation**: Citizen and contractor users cannot access District Officer risk intelligence, MP constituency oversight dashboards, or citizen evidence moderation consoles.

---

## 5. IDOR & BOLA Protections

1. **Evidence Review IDOR Guard**: In `review_citizen_evidence`, the project associated with the evidence is verified against the officer's `jurisdiction_district` and `jurisdiction_state`.
2. **Inspection Update IDOR Guard**: In `update_officer_inspection`, the target project is verified against the officer's designated jurisdiction.
3. **Contractor Assignment IDOR Guard**: In `contractor.py`, all project queries and mutations verify that `project.contractor_id == current_user.contractor_id`.
4. **Notification IDOR Guard**: In `notifications.py`, marking notifications as read verifies that `notification.user_id == current_user.id`.

---

## 6. Jurisdiction, Constituency & Assignment Security

- **District Officer Scoping**: Scoped strictly to `jurisdiction_district` and `jurisdiction_state`. Direct API requests for outside districts return `403 Forbidden` / `404 Not Found`.
- **MP Office Scoping**: Scoped strictly to the MP's authorized `constituency`.
- **Contractor Scoping**: Scoped strictly to assigned `contractor_id` work packages.

---

## 7. Deep-Link Security

- Centralized in `NotificationService.handleNotificationNavigation`.
- Unauthenticated deep links are blocked and redirected to `/(auth)/login`.
- Cross-role deep links (e.g. Citizen attempting `mplads://officer/*` or Contractor attempting `mplads://mp/*`) are intercepted by role guards and safely redirected to `/notifications`.

---

## 8. Upload Security

- **Base64 Payload Bounding**: Max 10MB limit enforced on `image_base64` in `CitizenEvidenceSubmission`.
- **Perceptual Hashing (pHash)**: Duplicate photo detection prevents replay attacks and identical photo submissions across disparate works.

---

## 9. Local Storage Security

- **SecureStore**: All JWT access tokens, refresh tokens, and session metadata are stored in hardware-backed `expo-secure-store`.
- **SQLite Local Database**: Contains zero tokens, passwords, or secrets. All SQLite queries use parameterized placeholders (`?`) preventing SQL injection.

---

## 10. Offline & Outbox Security

- **Idempotency Keys**: Every queued mutation in `outbox_mutations` contains a unique `idempotency_key` preventing duplicate submissions upon reconnection.
- **User Scoping & Logout Purge**: On logout, `RemoteAuthRepository.logout()` invokes `SQLiteDatabaseManager.clearUserCache(user.id)` and `sqliteLocalDataSource.clearUserQueue(user.id)`, completely purging cached records and outbox items.

---

## 11. Notification Security

- **Device Token Ownership**: `/notifications/devices` strictly derives user ownership from the authenticated JWT token.
- **Token De-registration on Logout**: Device push tokens are deactivated upon logout to prevent cross-account notification leakages.

---

## 12. Secrets Management & Remediation

- Hardcoded fallback API keys in `src/services/groqAIService.ts` and `src/services/elevenLabsAudioService.ts` have been removed.
- All secrets are now strictly loaded from environment variables (`VITE_GROQ_API_KEY`, `VITE_ELEVENLABS_API_KEY`, `JWT_SECRET_KEY`).

---

## 13. Dependency Audit

- Ran `npm audit` on mobile dependencies.
- 14 moderate advisories identified in deep transitive build-tooling dependencies (`xcode` / `decode-uri-component` within `@expo/config-plugins`). No direct exploitable remote code execution vectors exist in the application code.

---

## 14. Native Permissions

- Permissions declared in `mobile/app.json` are minimal:
  - `CAMERA`: Live physical verification capture.
  - `LOCATION`: Site GPS coordinate comparison.
  - `NOTIFICATIONS`: Operational alerts and milestone reminders.
- Zero background location, audio recording, contacts, or storage permissions requested.

---

## 15. Logging Security & Redaction

- `mobile/src/utils/logger.ts` implements automatic recursive redaction for:
  - `Authorization: Bearer [REDACTED]`
  - Passwords, secrets, credentials, tokens, and API keys.

---

## 16. Rate Limiting & Replay Protection

- Idempotency keys prevent duplicate submission replay.
- Short-lived JWT access tokens limit exposure window.

---

## 17. API Hardening & HTTP Security Headers

FastAPI HTTP middleware attaches:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Strict-Transport-Security: max-age=31536000; includeSubDomains` (production)
- CORS restricted to verified government domains in production.

---

## 18. Cryptography Standards

- **Password Hashing**: PBKDF2-HMAC-SHA256 (100,000 rounds).
- **Token Signing**: HMAC-SHA256 (HS256).
- **Photo Integrity**: Perceptual Hash (dHash / aHash 64-bit).

---

## 19. Security Test Results

```bash
# Mobile Jest Test Suite
npx jest
# Output: 12 passed, 12 total suites | 124 passed, 124 total tests

# TypeScript Verification
npx tsc --noEmit
# Output: Exit code 0 (0 errors)
```

Automated test matrix covers:
1. Token storage isolation in SecureStore ✅
2. Cache & outbox purge on logout ✅
3. Deep-link role guards & unauthenticated rejection ✅
4. Inactivity 15-minute lock for privileged roles ✅
5. Dev-auth fail-closed behavior in production ✅
6. Missing / malformed / expired token rejection ✅
7. Algorithm confusion (`alg: none`) rejection ✅
8. Cross-role and cross-jurisdiction mutation blocking ✅
9. Coordinate bounds (`[-90, 90]`, `[-180, 180]`) validation ✅
10. HTTP security headers verification ✅

---

## 20. Remaining Security Risks

- In-memory backend stores (`_user_devices`, `_notifications_db`, `EVIDENCE_STORE`) reset on server restart in development; production deployment requires connection to the PostgreSQL database cluster specified in `DATABASE_URL`.

---

## 21. Production Blockers & Readiness Gate

**SECURITY READINESS**: **SECURITY READY**
All critical and high security findings (hardcoded secrets, fail-closed JWT configuration, algorithm confusion, coordinate bounding, jurisdiction IDOR, and log sanitization) have been completely remediated and verified with automated test suites.
