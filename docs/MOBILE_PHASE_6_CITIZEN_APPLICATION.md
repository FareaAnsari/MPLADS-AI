# Phase 6 — Citizen Application Architecture & Implementation

## 1. Executive Summary

Phase 6 implements the complete, production-ready Citizen Transparency & Verification mobile application for MPLADS-AI (`Pratyaksh`). The citizen portal empowers citizens to browse official development works in their constituency, inspect public-safe risk indicators, and submit geotagged physical ground evidence to verify on-site execution against reported milestones.

The implementation strictly maintains Clean Architecture boundaries, utilizes TanStack Query for server state management with automatic cache invalidation, and provides full bilingual support (English `en-IN` and Hindi `hi-IN`) with comprehensive accessibility compliance.

---

## 2. Navigation Architecture (`app/(citizen)/`)

Route hierarchy under `mobile/app/(citizen)/`:
```text
mobile/app/(citizen)/
├── _layout.tsx              # Stack navigator with LanguageSelector, theme headers, and a11y labels
├── index.tsx                # Citizen Transparency Dashboard (welcome, overview stats, action cards)
├── projects/
│   ├── index.tsx            # Project Browser (search, state filter chips, paginated list, empty/error states)
│   └── [id].tsx             # Detailed Project View (statutory identity, financial ratio, public risk score, CTA)
└── evidence/
    ├── index.tsx            # Citizen Evidence Hub (submitted evidence list, verification tags, new submission CTA)
    └── submit.tsx           # Multi-step Geotagged Evidence Submission & Confirmation Form
```

---

## 3. Core Citizen Features

### 3.1 Citizen Transparency Dashboard (`index.tsx`)
- **Identity & Welcome**: Displays non-sensitive user greeting or localized public portal header.
- **National / Area Summary**: Fetches official dataset metrics from backend via `useDatasetSummaryQuery()` (`totalWorksIndexed`, `totalSanctionedInr`, `totalDisbursedInr` formatted with `formatINR`).
- **Action Gateways**: Direct routing to "Explore Development Works" and "Citizen Verification Hub".
- **Recent Monitored Projects**: Previews recent works with live stage badges and amounts.

### 3.2 Project Browsing, Search & Filtering (`projects/index.tsx`)
- **Server-Side Data**: Consumes `useProjectsQuery({ state, limit: 100 })`.
- **Search**: Real-time matching across Work ID, project title, category, and MP name.
- **State Filtering**: Horizontal filter pills (`All`, `Bihar`, `Maharashtra`, `Punjab`, `Delhi`, `Uttar Pradesh`).
- **Status Badging**: Stage indicators (`Proposal Submitted`, `Implementation in Progress`, `Completion Reported`).

### 3.3 Project Details & Public-Safe Risk (`projects/[id].tsx`)
- **Statutory Identity**: Displays Work ID, category, state, constituency, MP name, and implementing agency (IDA).
- **Financial Allocation**: Sanctioned amount vs disbursed amount with visual ratio progress bar.
- **Public-Safe AI Risk**: Exposes composite risk score (0-100) mapped to semantic classes (`Low Risk`, `Medium Risk`, `High Risk`, `Critical Risk`) and high-level risk explanations while keeping internal officer-only intelligence confidential.
- **Ground Verification CTA**: Deep link to evidence submission with prefilled project ID.

### 3.4 Geotagged Evidence Submission & Review (`evidence/submit.tsx`)
- **Step 1: Form**: Validates Work ID, GPS latitude, GPS longitude, and live camera flag (`isLiveCameraCapture`).
- **Step 2: Review**: Pre-submission confirmation summary warning that location coordinates >100m from project base are flagged as inconsistent.
- **Step 3: Execution**: Dispatches `useSubmitCitizenEvidenceMutation()`, prevents accidental duplicate submissions with button loading states.
- **Step 4: Confirmation**: Displays statutory record confirmation card with Evidence ID (`ev-1`), verification status (`LOCATION_VERIFIED` / `LOCATION_INCONSISTENT`), distance to project site, and return navigation.

### 3.5 Citizen Evidence History (`evidence/index.tsx`)
- Queries user's submitted ground verification records via `useCitizenEvidenceHistoryQuery()`.
- Renders verification result badges, distance from project site, and timestamp.

---

## 4. API Contract & Backend Integration

| Feature | Method & Endpoint | Auth Required | Citizen Permission |
| :--- | :--- | :--- | :--- |
| **Dataset Summary** | `GET /api/v1/projects/dataset-summary` | Public | None |
| **Projects List** | `GET /api/v1/projects/list` | Public | None |
| **Project Details** | `GET /api/v1/projects/{work_id}` | Public | None |
| **Public Risk** | `GET /api/v1/risk/{work_id}` | Public | None |
| **Evidence Submission**| `POST /api/v1/citizen/evidence` | Bearer JWT | `evidence:submit` |
| **Evidence History** | `GET /api/v1/citizen/evidence` | Bearer JWT | `evidence:submit` |

### Backend Enhancements:
- Added minimal, secure endpoint `GET /citizen/evidence` in `backend/app/routers/intelligence.py` with RBAC filtering so citizens strictly retrieve their own submissions.

---

## 5. Security & RBAC Enforcement

- **Permission Enforcement**: Citizen role possesses `projects:read` and `evidence:submit`. Citizen cannot access `inspections:update` or `ledger:decision`.
- **Credential Protection**: Auth Bearer token is automatically attached by `apiClient` interceptor from `SecureStore`. No tokens are stored in UI state or accessible via screen reader strings.
- **Role Isolation**: Citizen routes remain isolated within `app/(citizen)/` behind `AuthGuard`.

---

## 6. Bilingual Localization & Accessibility

- **English (`en-IN`) & Hindi (`hi-IN`)**: Every citizen-facing string is localized under the `citizen` namespace in `en-IN.ts` and `hi-IN.ts`. Zero hardcoded user-facing strings in presentation components.
- **Accessibility**:
  - `accessibilityRole`: `button`, `checkbox`, `text` assigned to all interactive elements.
  - `accessibilityLabel` & `accessibilityHint` provided on project cards, filter pills, search input, and action triggers.
  - Risk states never communicate information by color alone.
  - Minimum 44px touch targets enforced across all controls.

---

## 7. Verification & Test Coverage

### 7.1 Test Suites Executed
```bash
npx tsc --noEmit && npx jest
```

### 7.2 Results
```text
PASS tests/citizenFeatures.test.ts
PASS tests/localizationAccessibility.test.ts
PASS tests/authRBAC.test.ts
PASS tests/domainMappers.test.ts

Test Suites: 4 passed, 4 total
Tests:       29 passed, 29 total
Snapshots:   0 total
Time:        1.792 s
```

---

## 8. Known Limitations

- **Camera & Hardware GPS Hardware**: Native device camera capture and automated GPS sensor locking are simulated via structured coordinates and live camera flags in this phase; full native sensor integration belongs to Phase 9.
- **Offline Outbox**: Evidence submissions require active network connection in Phase 6; offline database queue and synchronization belong to Phase 10.
