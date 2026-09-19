# Mobile Phase 12 — MP Office Application & Constituency Oversight

## 1. Executive Summary

Phase 12 delivers the authenticated **MP Office / Constituency Oversight Application** for the MPLADS-AI (`Pratyaksh`) mobile ecosystem.

The MP Office experience is designed specifically as a high-level **Constituency Oversight Interface** empowering Members of Parliament and constituency cell staff to monitor parliamentary works, financial allocations, progress milestones, public verified evidence, and risk indicators without exposing internal District Officer operational consoles or sensitive audit routing.

### Key Capabilities Delivered:
* **Constituency Oversight Dashboard (`mobile/app/(mp)/index.tsx`)**: Displays constituency scope banner (`Constituency`, `State`), high-level metrics (`Total Works`, `Active Works`, `Completed Works`, `Attention Required`), financial utilization progress bar (`Sanctioned` vs `Disbursed`), and risk severity distribution breakdown (`Low`, `Medium`, `High`, `Critical`).
* **Constituency Projects Explorer (`mobile/app/(mp)/projects/index.tsx`)**: High-performance filtered project list supporting text search, category filtering, stage filtering, and risk indicators.
* **Oversight Project Detail (`mobile/app/(mp)/projects/[id].tsx`)**: Detailed oversight view featuring project metadata, financial breakdown (`Sanctioned`, `Disbursed`, `Expenditure`, `Balance`, `Utilization %`), 5-stage standardized workflow milestone timeline (`Proposal Submitted`, `Feasibility Verified`, `Administrative Sanction`, `Implementation In Progress`, `Physical Completion`), high-level authorized risk indicator (in neutral statutory phrasing), and public verified citizen evidence records.
* **Authoritative FastAPI Backend Router (`backend/app/routers/mp.py`)**: Endpoints for dashboard (`GET /api/v1/mp/dashboard`), projects listing (`GET /api/v1/mp/projects`), project detail (`GET /api/v1/mp/projects/{work_id}`), and risk overview (`GET /api/v1/mp/risk-overview`).
* **Strict Constituency Scoping & RBAC Guards**: Backend strictly isolates dataset queries to the authenticated MP's `constituency` and `jurisdiction_state` from the JWT token. Cross-constituency tampering is rejected with `403 Forbidden`. Unauthorized roles (`CITIZEN`, `CONTRACTOR`) attempting to access MP endpoints or deep links are blocked.
* **Notifications & Deep Linking (`NotificationRouter`)**: Integrated with Phase 11 notification center, header notification bell widget with live unread badge count, and secure deep-link routing.

---

## 2. Security & Jurisdiction Architecture

```text
Authenticated JWT
      ↓
UserRole: MP_OFFICE
      ↓
Constituency / State Scope (from backend user store)
      ↓
Authorized Data Access
      ├── Constituency Dashboard: Total, Active, Completed, Delayed, Financials
      ├── Constituency Projects List: Filtered & Scoped
      ├── Oversight Project Detail: Authorized Financials + Milestones + Public Evidence
      └── High-level Risk Signal: Non-confidential oversight indicators
```

### Security Principles Enforced:
1. **No Client-Side Scope Spoofing**: The client never supplies `user_id` or `constituency` as an authoritative query parameter; the backend derives the caller's identity and constituency jurisdiction strictly from the verified JWT.
2. **Cross-Role Isolation**:
   * `CITIZEN` → `(mp)` routes: ❌ Blocked by route guards and `NotificationRouter`.
   * `CONTRACTOR` → `(mp)` routes: ❌ Blocked by route guards.
   * `MP_OFFICE` → Officer-confidential inspection execution / audit decisions: ❌ Blocked by backend `require_permission` guards.
3. **Neutral Risk Phraseology**: Statutory signals are presented factually (e.g. *"This project is flagged for elevated milestone delay or cost variance"*), avoiding sensationalized or accusatory language.

---

## 3. Backend API Endpoints

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/mp/dashboard` | Returns constituency oversight summary, metrics, risk distribution, and recent projects. | `MP_OFFICE` |
| `GET` | `/api/v1/mp/projects` | Lists projects scoped strictly to the caller's constituency and state with search and category filters. | `MP_OFFICE` |
| `GET` | `/api/v1/mp/projects/{work_id}` | Returns project oversight detail. Rejects `403 Forbidden` if project is located outside jurisdiction. | `MP_OFFICE` |
| `GET` | `/api/v1/mp/risk-overview` | Returns constituency-level risk distribution and attention projects list. | `MP_OFFICE` |

---

## 4. Mobile Architecture & Layering

### 4.1 Domain Layer
* **Entities (`mobile/src/domain/entities/index.ts`)**:
  * `MPProfileSummaryEntity`
  * `MPMetricsEntity`
  * `MPRiskDistributionEntity`
  * `MPDashboardEntity`
  * `MPFinancialSummaryEntity`
  * `MPMilestoneEntity`
  * `MPOversightRiskEntity`
  * `MPProjectDetailEntity`
* **Repository Interface (`mobile/src/domain/interfaces/index.ts`)**: `IMPRepository`

### 4.2 Data & Remote Layer
* **DTOs (`mobile/src/data/remote/dto/index.ts`)**: `MPDashboardDTO`, `MPProjectListDTO`, `MPProjectDetailDTO`, `MPFinancialSummaryDTO`, `MPMilestoneDTO`, `MPOversightRiskDTO`.
* **Mappers (`mobile/src/data/remote/mappers/index.ts`)**: `DataMappers.mapMPDashboardDTOToEntity`, `DataMappers.mapMPProjectDetailDTOToEntity`.
* **Repository (`mobile/src/data/repositories/RemoteMPRepository.ts`)**: API client implementation.

### 4.3 Feature & State Management
* **Queries (`mobile/src/features/mp/queries.ts`)**:
  * `useMPDashboardQuery()`
  * `useMPProjectsQuery(params)`
  * `useMPProjectDetailQuery(workId)`
  * `useMPRiskOverviewQuery()`

### 4.4 UI Components & Screens
* **Layout (`mobile/app/(mp)/_layout.tsx`)**: Navigation stack with header `NotificationBell` and `LanguageSelector`.
* **Dashboard (`mobile/app/(mp)/index.tsx`)**: MP overview with constituency identity badge, metrics cards, financial utilization progress bar, risk breakdown chart, and recent works list.
* **Projects List (`mobile/app/(mp)/projects/index.tsx`)**: Filterable project feed with search bar, category pills, and financial statistics.
* **Project Detail (`mobile/app/(mp)/projects/[id].tsx`)**: Complete oversight screen with metadata, financial grid, milestone timeline, risk status, and public verified evidence.

---

## 5. Localization & Accessibility

### 5.1 Localization
Translations are defined in `mobile/src/i18n/locales/en-IN.ts` and `mobile/src/i18n/locales/hi-IN.ts` across the following `mp.*` sub-namespaces:
* `mp.dashboard.*`
* `mp.projects.*`
* `mp.project.*`
* `mp.financial.*`
* `mp.progress.*`
* `mp.risk.*`
* `mp.errors.*`

### 5.2 Accessibility (WCAG 2.1 AA)
* Visual metrics and progress bars are accompanied by explicit text representations (e.g. `"Utilization Rate: 72%"`).
* Interactive cards and list items provide complete accessibility labels combining title, category, financial amount, and stage.
* Risk badges use both semantic color and textual labels (`Low`, `Medium`, `High`, `Critical`).

---

## 6. Verification & Test Suite

### 6.1 Automated Test Results
* **TypeScript Validation**: `npx tsc --noEmit` passed with 0 errors.
* **Mobile Unit & Integration Tests**: `npx jest` executed with 10 passing test suites (104 total tests passing).
  * `tests/mpFeatures.test.ts` covers DataMappers, RemoteMPRepository, constituency scoping, RBAC deep-link guards, financial formatting, and bilingual localization dictionaries.
* **Backend Test Suite**: `backend/tests/mp_test.py` covers MP authentication, constituency dashboard retrieval, project listing, valid project detail retrieval, 403 unauthorized role rejection for citizens/contractors, and blocking MP users from officer-confidential operations.

---

## 7. Next Phase

**PHASE 13 — CONTRACTOR APPLICATION**
