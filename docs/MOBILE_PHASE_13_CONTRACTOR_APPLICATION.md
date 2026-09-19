# Phase 13 — Contractor Application Architecture & Implementation

## 1. Executive Summary

Phase 13 establishes the authenticated **Contractor Mobile Experience** for the MPLADS-AI (`Pratyaksh`) platform. Authorized vendors and contracting agencies execute, track, and report on assigned MPLADS work packages while enforcing authoritative server-side security boundaries, role-based access control (RBAC), offline-capable draft storage, and strict separation between contractor-reported progress and official district officer-verified progress.

---

## 2. Contractor Role & Security Model

```
       Authenticated JWT Session (UserRole.CONTRACTOR)
                            ↓
               Backend Project Assignment Model
           (contractor_id == project.contractor_id)
                            ↓
 ┌─────────────────────────────────────────────────────────┐
 │               Contractor Mobile Operations              │
 ├────────────────────────────┬────────────────────────────┤
 │  Authorized Capabilities   │    Forbidden Boundaries    │
 ├────────────────────────────┼────────────────────────────┤
 │ • Assigned Projects Feed   │ ✗ Cross-contractor Access  │
 │ • Work Package Details     │ ✗ Officer Risk Intelligence│
 │ • Progress Updates (0-100%)│ ✗ Citizen Evidence Decision│
 │ • Site Blocker Reporting   │ ✗ Sanction/Fund Tampering  │
 │ • Milestone Stage Tracking │ ✗ Audit Ledger Mutation    │
 └────────────────────────────┴────────────────────────────┘
```

### Authorization Boundaries:
1. **Server-Side Project Assignment**: A contractor user can only query, view, or submit mutations for projects explicitly assigned to their `contractor_id`. Direct URL/parameter tampering returns `403 Forbidden`.
2. **Progress Authority Separation**: Contractor progress submissions are logged as `reported_progress_percent` with status `SUBMITTED`. They do not modify official `verified_progress_percent` or alter official project status to `COMPLETED` without District Officer inspection.
3. **Privilege Isolation**: Contractors are barred from District Officer risk intelligence screens, citizen evidence moderation, and statutory MP oversight dashboards.

---

## 3. Backend Endpoints & Architecture

The FastAPI backend exposes contractor operations under `/api/v1/contractor`:

| Method | Endpoint | Description | Scope / Permission |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/contractor/dashboard` | Aggregated contractor profile, metrics & assigned works | `UserRole.CONTRACTOR` |
| `GET` | `/api/v1/contractor/projects` | Filtered list of contractor-assigned projects | `UserRole.CONTRACTOR` |
| `GET` | `/api/v1/contractor/projects/{work_id}` | Detailed work package, contract value, milestones & issues | `contractor_id` assignment |
| `POST`| `/api/v1/contractor/projects/{work_id}/progress` | Submit operational progress update (0-100%) | `contractor_id` assignment |
| `GET` | `/api/v1/contractor/projects/{work_id}/progress-history` | Historical audit trail of submitted updates | `contractor_id` assignment |
| `POST`| `/api/v1/contractor/projects/{work_id}/issues` | Report site blocker/issue (`MATERIAL_DELAY`, `SITE_ACCESS`, etc.) | `contractor_id` assignment |
| `GET` | `/api/v1/contractor/projects/{work_id}/issues` | List reported site blockers and their resolution status | `contractor_id` assignment |

---

## 4. Mobile Architecture & Component Implementation

### 4.1 Navigation Hierarchy (`mobile/app/(contractor)/`)
- `_layout.tsx`: Native stack layout with bilingual header, `NotificationBell` badge counter, and `LanguageSelector`.
- `index.tsx`: Contractor Dashboard featuring vendor profile, metrics grid (assigned works, active works, pending submissions, open issues, total contract value), and recent works feed.
- `projects/index.tsx`: Searchable and category-filterable assigned project list.
- `projects/[id].tsx`: Work package detail screen with contract scope, reported vs verified progress indicators, milestone timeline, progress submission modal, and site issue reporting modal.

### 4.2 TanStack Query State Layer (`mobile/src/features/contractor/`)
- `useContractorDashboardQuery()`: Centralized contractor overview with background refetch.
- `useContractorProjectsQuery(params)`: Parameterized assigned project query with client/server search.
- `useContractorProjectDetailQuery(workId)`: Project detail query enabled conditionally per work ID.
- `useSubmitProgressUpdateMutation()`: Optimistically updates progress and invalidates detail, history, dashboard, and project list queries.
- `useReportIssueMutation()`: Dispatches site blocker reports and refreshes project issues.

---

## 5. Offline Capabilities & Outbox Synchronization

| Feature | Execution Mode | Offline Behavior |
| :--- | :--- | :--- |
| **Dashboard & Project List** | Read-Only | Cached via TanStack Query and local SQLite replica |
| **Progress Updates** | Write (Mutating) | Cached locally as draft or queued to Phase 10 Outbox |
| **Site Issue Reporting** | Write (Mutating) | Stored as local issue draft with retry on reconnection |
| **Official Stage Transitions** | Server-Authoritative | **Online-only**; contractor cannot force state changes offline |

---

## 6. Localization & Accessibility Standards

- **Semantic Namespaces**: Centralized under `contractor.*` across `en-IN` (English) and `hi-IN` (Formal Hindi).
- **Zero Hardcoded Strings**: All labels, placeholders, errors, and modal forms dynamically localized via `useTranslation()`.
- **WCAG 2.1 AA Compliance**:
  - Minimum 48x48 dp touch targets on all interactive controls.
  - Textual accessible state announcements for reported vs verified progress (not relying on color alone).
  - Explicit `accessibilityRole`, `accessibilityLabel`, and `accessibilityState` attributes on cards, buttons, and form inputs.

---

## 7. Test Verification & Results

- **Mobile Jest Test Suite**: 11 suites, 115 tests passing cleanly (`mobile/tests/contractorFeatures.test.ts`).
  - Data mapping tests for contractor dashboard, project detail, progress updates, and issues.
  - Remote repository integration tests for all contractor API endpoints.
  - Deep link RBAC tests verifying safe navigation and blocking citizen/officer privilege escalation.
  - Localization dictionary completeness tests for `en-IN` and `hi-IN`.
- **TypeScript Static Verification**: `npx tsc --noEmit` passed with 0 errors.
- **Backend Test Suite**: `backend/tests/contractor_test.py` covering JWT auth, project assignment scoping, 0-100% bounds validation, and cross-role access rejection.

---

## 8. Capability Matrix

- **Read-Only**: Project details, sanctioned financial values, verified progress, audit ledger history.
- **Online-Only**: Direct progress submission to backend, issue dispatch to district authority, real-time assignment verification.
- **Offline-Capable**: Local progress draft creation, local issue draft creation, assigned project cached browsing.
- **Server-Verified**: Milestone completion verification, physical progress percentage, work completion declaration.
