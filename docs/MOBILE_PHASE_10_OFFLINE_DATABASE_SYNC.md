# Mobile Phase 10 — Offline Database, Outbox & Synchronization

## 1. Executive Summary

Phase 10 delivers a durable, production-grade **Offline Data Layer** for the MPLADS-AI (`Pratyaksh`) mobile application.

The offline architecture empowers Citizens and District Officers to interact with the application during severe network degradation or complete disconnection while upholding statutory integrity:
* **Local Database Engine**: Built on `expo-sqlite` with a versioned, migration-controlled relational schema.
* **Durable Outbox Queue**: Captures offline mutations with an explicit state machine (`PENDING`, `PROCESSING`, `SUCCEEDED`, `FAILED_RETRYABLE`, `FAILED_PERMANENT`, `CONFLICT`), stable client-side idempotency keys, and bounded exponential backoff.
* **Strict User, Role & Jurisdiction Partitioning**: Every cached record and pending outbox item is indexed by `user_id`, `role`, and `jurisdiction_district`. Full cache quarantine and outbox isolation on logout.
* **Authoritative Server Rule**: The backend remains the authoritative source of truth. The mobile SQLite database acts as a read cache, draft store, and outbox queue—never as a second source of official risk or statutory approvals.

---

## 2. Local Database Schema & Migrations

The database is managed via `SQLiteDatabaseManager` (`mobile/src/data/local/database/sqliteDatabase.ts`) executing versioned DDL migrations from `schema.ts`:

```sql
-- Schema Version Tracking
CREATE TABLE IF NOT EXISTS schema_version (
  version INTEGER PRIMARY KEY,
  applied_at TEXT NOT NULL
);

-- Cached Projects
CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  role TEXT NOT NULL,
  jurisdiction_district TEXT,
  work_id TEXT NOT NULL,
  work_title TEXT NOT NULL,
  work_category TEXT NOT NULL,
  work_description TEXT,
  mp_name TEXT,
  ida_office TEXT,
  state TEXT NOT NULL,
  constituency TEXT,
  sanctioned_amount_inr REAL NOT NULL,
  disbursed_amount_inr REAL NOT NULL,
  current_stage TEXT NOT NULL,
  has_official_images INTEGER NOT NULL DEFAULT 0,
  source TEXT NOT NULL,
  source_type TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- Cached Statutory Risk Assessments
CREATE TABLE IF NOT EXISTS risk_assessments (
  work_id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  risk_score REAL NOT NULL,
  anomaly_flag TEXT NOT NULL,
  score_breakdown_json TEXT NOT NULL,
  primary_risk_reason TEXT,
  top_contributing_factor TEXT,
  evaluated_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- Durable Outbox Mutations
CREATE TABLE IF NOT EXISTS outbox_mutations (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  role TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  operation TEXT NOT NULL,
  payload_json TEXT NOT NULL,
  status TEXT NOT NULL,
  attempt_count INTEGER NOT NULL DEFAULT 0,
  last_attempt_at TEXT,
  next_retry_at TEXT,
  idempotency_key TEXT NOT NULL UNIQUE,
  error_code TEXT,
  error_message TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
```

---

## 3. Outbox Mutation State Machine & Idempotency

```text
       ┌──────────┐
       │ PENDING  │ ◄── Enqueued while Offline / Network Error
       └────┬─────┘
            │ Connectivity Restored / Sync Trigger
            ▼
       ┌────────────┐
       │ PROCESSING │ ◄── Mutex Lock Acquired & Dispatched to Backend
       └────┬───────┘
            │
      ┌─────┴───────────────────────┬────────────────────────┐
      ▼                             ▼                        ▼
┌───────────┐             ┌──────────────────┐     ┌──────────────────┐
│ SUCCEEDED │             │ FAILED_RETRYABLE │     │ FAILED_PERMANENT │
└─────┬─────┘             └─────────┬────────┘     └──────────────────┘
      │                             │                        ▲
      │ Server Confirmed            │ Backoff Retry          │ 403 Forbidden
      ▼                             ▼                        │
 [Clean DB & Outbox]          [Re-enqueue] ──────────────────┘
```

### Idempotency Key Strategy
Every mutation generated while offline receives a stable client-side idempotency key (`{entityType}-{userId}-{entityId}-{timestamp}-{random}`) that remains identical across subsequent retries, preventing duplicate submissions on server timeouts or reconnects.

### Bounded Exponential Backoff
$$\text{Delay}(n) = \min\left(1000 \times 2^n, 60000\right)\,\text{ms}$$
Failed retryable requests are paced progressively up to a maximum delay of 60 seconds.

---

## 4. Synchronization Engine (`SyncEngine`)

* **Connectivity Listener**: Leverages `@react-native-community/netinfo` to detect transitions from disconnected to connected state.
* **Sync Lock**: Enforces a mutex lock ensuring that concurrent UI actions or network events never trigger parallel synchronization passes for the same user.
* **Security & Auth Handling**:
  - `401 Unauthorized`: Aborts active sync pass and prompts session re-authentication.
  - `403 Forbidden`: Immediately marks mutation as `FAILED_PERMANENT` without wasteful retries.
  - `409 Conflict`: Marks mutation as `CONFLICT` for manual review.
* **Post-Sync Cleanup**: Deletes succeeded outbox records and prunes temporary local evidence files upon server confirmation.

---

## 5. Offline Workflow Behavior

| Feature | Offline Behavior | Online Behavior |
|---|---|---|
| **Project Browsing** | Reads cached projects from SQLite (`getCachedProjects`) with a stale data indicator. | Fetches live data from API and writes through to SQLite. |
| **Evidence Capture** | Stores local photo URI + GPS in Outbox as `PENDING`. Displays *"Saved on device — waiting for connection"*. | Submits live to `POST /api/v1/citizen/evidence` and receives official `evidenceId`. |
| **Inspection Updates** | Stores inspection draft observations and progress in Outbox as `PENDING`. | Submits immediately to officer inspection API. |
| **Officer Evidence Decisions** | **Online-Only**: To ensure statutory integrity, decisions (`ACCEPTED` / `REJECTED`) require live server authority. | Dispatches immediately with officer notes. |
| **Risk Intelligence** | Displays previously cached risk assessments with timestamp and stale data warning. | Computes fresh additive composite scores and peer IQR stats. |

---

## 6. User, Role & Jurisdiction Scoping

1. **User Partitioning**: All SQLite queries filter explicitly by `user_id`. User A's cached projects or outbox items can never be queried or dispatched by User B.
2. **Session Cleanup on Logout**: Calling `logout()` in `RemoteAuthRepository` purges SecureStore tokens, clears TanStack Query cache, and executes `clearUserCache(userId)` and `clearUserQueue(userId)` on SQLite.
3. **Jurisdiction Scoping**: District Officer queries enforce `jurisdiction_district` matching to prevent cross-district data leakage.

---

## 7. Bilingual Localization & Accessibility (WCAG 2.1 AA)

* **Parity**: Complete English (`en-IN`) and formal Hindi (`hi-IN`) dictionary coverage under the `offline.*` namespace.
* **Screen Reader Accessibility**: `OfflineBanner` uses `accessibilityRole="alert"` and clear verbal announcements (e.g. `2 items waiting to synchronize`).
* **Non-Color Reliance**: Amber/Blue background highlights are always paired with distinct icons (`📡`, `🔄`, `📤`) and descriptive text.

---

## 8. Quality Assurance & Verification

* **TypeScript Compilation**: `npx tsc --noEmit` passes with **0 errors**.
* **Jest Test Suite**: All 8 test suites pass with **82 tests passing**:
  * `tests/offlineSync.test.ts` (SQLite schema v1 migrations, user cache scoping, outbox queuing, idempotency key stability, exponential backoff, sync engine processing, 403 permanent failure handling, offline abort, i18n parity)
  * `tests/evidenceCameraGps.test.ts`
  * `tests/riskIntelligence.test.ts`
  * `tests/officerFeatures.test.ts`
  * `tests/citizenFeatures.test.ts`
  * `tests/localizationAccessibility.test.ts`
  * `tests/authRBAC.test.ts`
  * `tests/domainMappers.test.ts`
