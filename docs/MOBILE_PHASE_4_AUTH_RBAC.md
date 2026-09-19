# Phase 4: Authentication + RBAC + Secure Session Architecture Report
**Project**: Pratyaksh — AI-Powered MPLADS Monitoring & Verification Intelligence Layer  
**Target Mobile Platforms**: Cross-Platform Android + iOS (React Native, Expo SDK 52+, TypeScript, Expo Router v4)  
**Date**: September 19, 2026  
**Status**: Completed — Secure Session & RBAC Architecture Implemented  

---

## 1. Backend Authentication State & Reality Matrix

| Capability | Exists in Backend? | Location | Status / Architecture Contract |
|---|---|---|---|
| **Login Endpoint** | ❌ No | None | Handled via `RemoteAuthRepository` Dev Mode; Production requires backend endpoint |
| **JWT Creation & Verification** | ❌ No | None | Client-side SecureStore token boundary established |
| **Token Expiry & Inactivity** | ✅ Yes | Mobile `useAuthStore` | 15-minute privileged inactivity timeout enforced on mobile |
| **User Identity & Roles** | ✅ Yes | `src/domain/entities/auth.ts` | 5 canonical roles mapped: `CITIZEN`, `DISTRICT_OFFICER`, `MP_OFFICE`, `CONTRACTOR`, `OVERVIEW` |
| **Permission Model** | ✅ Yes | `src/domain/entities/permissions.ts` | Fine-grained permission strings mapped to administrative workflows |
| **Protected Route Guards** | ✅ Yes | `mobile/src/ui/components/AuthGuard.tsx` | Expo Router segment-aware navigation barrier |
| **Biometric Local Re-Entry** | ✅ Yes | `src/infrastructure/auth/biometricService.ts` | `expo-local-authentication` prompt for session re-unlock |
| **Query Cache Purging** | ✅ Yes | `src/store/authStore.ts` | `queryClient.clear()` executed on logout to prevent cross-role data leaks |

---

## 2. Implemented Authentication & RBAC Architecture

```text
                                  USER INTERACTION
                                         │
                                         ▼
                                  AuthScreen.tsx
                     (Select Role / Input Credential in Dev Mode)
                                         │
                                         ▼
                               RemoteAuthRepository
                                         │
                 ┌───────────────────────┴───────────────────────┐
                 ▼                                               ▼
         expo-secure-store                                 useAuthStore
  (Tokens, Session, Encrypted)                     (UI Status, User, Role)
                 │                                               │
                 ▼                                               ▼
          apiClient.ts                                     AuthGuard.tsx
   (Bearer Token Attached to                        (Expo Router Route Barrier:
   Authorized Backend Domain)                       (officer), (mp), (contractor))
```

---

## 3. Core Security Enforcements

1. **Zero Secret Storage in State/AsyncStorage**:
   - Access tokens and raw session metadata are saved exclusively via `expo-secure-store` (Keychain on iOS / EncryptedSharedPreferences on Android).
   - Zustand store contains **only** non-sensitive UI fields (`status`, `user`, `lastActiveTimestamp`).

2. **Domain-Restricted API Interceptor** (`mobile/src/data/remote/apiClient.ts`):
   - Outgoing Axios requests only attach `Authorization: Bearer <token>` if targeting the configured government backend domain.
   - Prevents token leakage to external third-party tile providers or public APIs.

3. **Inactivity Timeout for Privileged Administrative Roles**:
   - 15-minute inactivity threshold monitored in `useAuthStore.ts` for `DISTRICT_OFFICER` and `MP_OFFICE` accounts.
   - Automatically shifts status to `LOCKED` until biometric re-entry or re-login.

4. **Biometric Session Re-entry** (`mobile/src/infrastructure/auth/biometricService.ts`):
   - Face ID / Fingerprint prompt integrated via `expo-local-authentication`.
   - Distinct from server authentication: Biometrics solely un-locks an already authenticated local session.

5. **Cross-Role Cache Purge on Logout**:
   - Calling `logout()` invokes `queryClient.clear()` immediately before wiping SecureStore to eliminate private district/MP records from memory.

---

## 4. Test Verification Results

- **TypeScript Compilation (`npx tsc --noEmit`)**: **PASS** (0 errors).
- **Unit & Security Tests (`npx jest`)**: **PASS** (7 tests passed across `authRBAC.test.ts` and `domainMappers.test.ts`):
  - ✅ SecureStore credential storage validation
  - ✅ Fine-grained RBAC permission evaluation
  - ✅ Valid session restoration
  - ✅ Complete credential wiping on logout
  - ✅ DTO and risk score formatting

---

## 5. Phase 5 Prerequisites
- Connect localization dictionaries (`hi` / `en`) with shared UI components.
- Wire accessibility hints and high-contrast statutory color tokens across shared UI modules.
