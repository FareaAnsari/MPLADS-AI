# Phase 1: Mobile Architecture Audit & Integration Blueprint
**Project**: Pratyaksh — AI-Powered MPLADS Monitoring Intelligence Layer  
**Target Mobile Platforms**: Cross-Platform Android + iOS (React Native, Expo SDK 52+, TypeScript, Expo Router)  
**Date**: September 2026  
**Status**: Analysis Complete — Zero Code Modification Phase  

---

## 1. Current Technology Stack

| Layer | Technologies Used | Version / Notes |
|---|---|---|
| **Frontend Web** | React 19, TypeScript, Vite 8, Tailwind CSS 3.4, React Router DOM 7 | Responsive web portal |
| **Data Visualization & UI** | Recharts 3.10, Leaflet 1.9, Lucide React Icons | Charts, spatial map, government icons |
| **Backend Framework** | Python 3, FastAPI, Uvicorn (ASGI), Pydantic v2 | High-performance async REST API |
| **Data Science & ML** | Scikit-Learn 1.2+, Pandas 2.0+, NumPy 1.24+, Pillow 9.5+, ImageHash 4.3+, OpenCV Headless 4.7+, GeoPy 2.3+ | Statistical analysis, isolation forests, perceptual hashing, geodesics |
| **Database & ORM** | PostgreSQL 15+ with PostGIS extensions, SQLAlchemy 2.0+, Psycopg2-binary | Canonical DDL schemas; currently accessed via DatasetAdapter in-memory cache |
| **AI / Cloud Services** | Groq Cloud LPU API (LLaMA-3.3-70B-Versatile), ElevenLabs Speech API | Forensic audits, executive audio briefings |
| **Authentication** | Client-side role switcher state; no backend token authorization active | Open REST endpoints |
| **Deployment / Config** | Dockerfile, Render / Vercel targets, `.env` file | Containerized backend |

---

## 2. Existing Application Structure

### Directory Tree & Entry Points
- **Web Frontend Root**:
  - Entry point: `index.html` -> `src/main.tsx` -> `src/App.tsx`
  - Styling: `src/index.css`, `src/App.css`, `tailwind.config.js`
  - Pages (`src/pages/`): 24 views (Dashboard, Citizen, Projects, MPs, AIInsights, VillageExplorer, ContractorDashboard, etc.)
  - Services (`src/services/`):
    - `nationalDataPipelineService.ts` (National dataset cache & aggregations)
    - `unifiedIntelligenceService.ts` (API client for backend intelligence endpoints)
    - `groqAIService.ts` (LLaMA-3.3-70B API caller)
    - `elevenLabsAudioService.ts` (TTS voice generator)
    - `aiService.ts` (Local risk heuristics & anomaly explanation builder)
  - Contexts & State: `src/contexts/LanguageContext.tsx` (Hindi/English localization dictionary)
  - Data / Mocks: `src/data/` (`mockData.ts`, `mpsData.ts`, `realDataset.json`, `ruralVillageData.ts`, `contractorOpportunitiesData.ts`)
  - Types: `src/types/index.ts`, `contractorOpportunity.ts`, `nationalPipeline.ts`, `rural.ts`

- **Backend Root**:
  - Entry point: `backend/app/main.py`
  - Configuration: `backend/app/config.py`
  - Routers: `backend/app/routers/` (`projects.py`, `intelligence.py`, `national_data.py`)
  - Engines: `backend/app/engines/` (9 analytical AI/heuristic engines)
  - Schemas: `backend/app/schemas/pydantic_schemas.py`
  - Adapters: `backend/adapters/dataset_adapter.py`
  - Database DDL: `backend/database/schema.sql`, `national_pipeline_schema.sql`

---

## 3. Backend & API Analysis

| Group | Method & Route | Purpose & Parameters | Mobile Usability |
|---|---|---|---|
| **System & Health** | `GET /` | API service status & positioning | Ready |
| | `GET /health`, `GET /api/v1/ping` | Cold start prevention & health check | Ready |
| **Projects & Works** | `GET /api/v1/projects/dataset-summary` | High-level statistics (total sanctioned, disbursed) | Ready |
| | `GET /api/v1/projects/mps` | List MPs with allocated limits (`state`, `house`, `limit`) | Ready |
| | `GET /api/v1/projects/list` | Filtered paginated works list (`state`, `work_category`, `mp_name`, `limit`, `offset`) | Ready |
| | `GET /api/v1/projects/{work_id}` | Detailed project record with linked vendor expenditures | Ready |
| **Risk & Intelligence** | `GET /api/v1/risk` | List risk-scored works (`state`, `anomaly_flag`, `min_risk_score`, `sort_by`, `sort_order`, `limit`, `offset`) | Ready |
| | `GET /api/v1/risk/{work_id}` | Detailed composite risk score, peer group breakdown, and ledger ID | Ready |
| | `GET /api/v1/intelligence/peer-benchmarks` | Peer cohort statistical benchmarks (cost mean, std dev, delay) | Ready |
| | `GET /api/v1/verification/confidence/{work_id}` | Multi-signal verification confidence (0-100) | Ready |
| | `GET /api/v1/sla/bottleneck/{work_id}` | Stage-by-stage delay ratio and responsible office identification | Ready |
| | `GET /api/v1/inspections/optimized-schedule` | Nearest-neighbor route optimizer for district technical cells (`inspector_id`, `jurisdiction_district`) | Ready |
| | `GET /api/v1/ledger/entries` | Immutable audit log of all automated AI decisions | Ready |
| | `POST /api/v1/ledger/entry/{entry_id}/decision` | Officer human decision logging (`human_decision`, `outcome_notes`) | Ready |
| | `GET /api/v1/fairness/test-summary` | Algorithmic fairness audit metrics | Ready |
| **Evidence & Citizen** | `POST /api/v1/citizen/evidence` | Submit citizen photo (Base64), GPS lat/long, timestamp, and live camera flag | Ready (Mobile camera/GPS) |
| **National Data** | `GET /api/national-data/summary` | Official data pipeline provenance overview | Ready |
| | `GET /api/national-data/sources` | Registry of government sources (e-SAKSHI, data.gov.in) | Ready |
| | `GET /api/national-data/states` | State-level allocation vs. disbursement rollups | Ready |
| | `GET /api/national-data/works` | National works catalog | Ready |
| | `GET /api/national-data/expenditures` | National vendor payments & disbursement records | Ready |
| | `GET /api/national-data/mps` | Complete nationwide MP registry | Ready |

*Note on Missing Endpoints*: There are currently **no dedicated user authentication endpoints** (e.g. `/api/v1/auth/login`, `/api/v1/auth/refresh`) or dedicated binary file upload endpoints (evidence currently accepts Base64 in JSON body).

---

## 4. AI / ML Analysis

The project implements 9 specialized analytical engines plus external LLM & Audio synthesis:

```
                                  AI / Intelligence Architecture
                                  
  ┌────────────────────────────────────────────────────────────────────────────────────────┐
  │                                    FastAPI Backend                                     │
  │                                                                                        │
  │  1. AIRiskEngine              4. CitizenVerificationEngine   7. InspectionOptimizer    │
  │     (Composite 0-100 Score,      (100m Geodesic Proximity,      (Greedy Nearest-Neighbor │
  │      Isolation Forest)            Live-Camera check)             Routing)              │
  │                                                                                        │
  │  2. PeerComparisonEngine      5. EvidenceTriangulation       8. AuditLedgerEngine      │
  │     (IQR / Z-score stats         (Multi-Signal Confidence,      (Immutable Decision    │
  │      cohorts)                     Fairness Safeguard)            Ledger)               │
  │                                                                                        │
  │  3. PhotoDuplicationEngine    6. SLABottleneckAnalyzer       9. FairnessSafeguard      │
  │     (Perceptual pHash,           (Stage-wise Delay Ratios,      (Bias Mitigation &     │
  │      Hamming Distance)            Institutional Language)        Data Absence Balance) │
  └────────────────────────────────────────────────────────────────────────────────────────┘
                                              ▲
                                              │ (Direct API calls via Proxy)
                                              ▼
  ┌────────────────────────────────────────────────────────────────────────────────────────┐
  │                                External Cloud Inference                                │
  │                                                                                        │
  │  10. Groq LLaMA-3.3-70B Service            11. ElevenLabs Speech Synthesis             │
  │      (Statutory Audit & Risk Reports)          (Official Audio Briefing Generator)     │
  └────────────────────────────────────────────────────────────────────────────────────────┘
```

### Engine Details
1. **`AIRiskEngine`** (`backend/app/engines/risk_engine.py`):
   - **Purpose**: Computes an additive composite risk score (0-100) using 5 weighted components (Cost 25%, Delay 25%, Payment Pattern 25%, Spatial 15%, Evidence Issue 10%) plus unsupervised Isolation Forest anomaly scoring.
   - **Input**: Project record dictionary & peer cohort statistical dictionary.
   - **Output**: Composite `risk_score`, `anomaly_flag`, `score_breakdown`, `explanation`.
   - **API Access**: Yes, via `GET /api/v1/risk` and `GET /api/v1/risk/{work_id}`.

2. **`PeerComparisonEngine`** (`backend/app/engines/peer_comparison.py`):
   - **Purpose**: Groups projects by state and category to calculate cohort statistics (mean, std dev, median, IQR) for objective outlier detection.
   - **Input**: List of work records.
   - **Output**: Benchmark dictionary grouped by `(state, category)`.
   - **API Access**: Yes, via `GET /api/v1/intelligence/peer-benchmarks`.

3. **`PhotoDuplicationEngine`** (`backend/app/engines/photo_duplication.py`):
   - **Purpose**: Detects recycled or duplicate completion photographs across distinct works using 64-bit perceptual hashing (`pHash`) and Hamming distance analysis.
   - **Input**: Base64 image strings or PIL image objects.
   - **Output**: `phash_value`, `duplicate_detected` (bool), Hamming distance score.
   - **API Access**: Yes, invoked during citizen evidence submission and verification confidence calculation.

4. **`CitizenVerificationEngine`** (`backend/app/engines/citizen_verification.py`):
   - **Purpose**: Enforces geodesic Haversine distance validation (100m threshold) and live camera verification against designated project site coordinates.
   - **Input**: Citizen lat/lon, project site lat/lon, `is_live_camera_capture`.
   - **Output**: `verified` (bool), `distance_to_project_meters`, `signal_code`.
   - **API Access**: Yes, via `POST /api/v1/citizen/evidence`.

5. **`EvidenceTriangulationEngine`** (`backend/app/engines/evidence_triangulation.py`):
   - **Purpose**: Calculates multi-signal Verification Confidence (0-100) combining Agency claim (25%), Citizen evidence (35%), Photo uniqueness (25%), and Satellite InSAR (15%).
   - **Input**: Signal status payload for each dimension.
   - **Output**: `verification_confidence` score and detailed breakdown.
   - **API Access**: Yes, via `GET /api/v1/verification/confidence/{work_id}`.

6. **`SLABottleneckAnalyzer`** (`backend/app/engines/sla_analyzer.py`):
   - **Purpose**: Evaluates workflow durations against standard MoSPI guidelines benchmarks to identify institutional bottlenecks.
   - **Input**: Project stage history.
   - **Output**: Primary bottleneck stage, delay ratio, responsible administrative role.
   - **API Access**: Yes, via `GET /api/v1/sla/bottleneck/{work_id}`.

7. **`InspectionOptimizerEngine`** (`backend/app/engines/inspection_optimizer.py`):
   - **Purpose**: Solves a multi-objective inspection prioritization and geographic nearest-neighbor routing problem for district nodal inspection officers.
   - **Input**: Inspector base location, weekly inspection capacity, candidate project list.
   - **Output**: Ordered itinerary, composite priority score, travel distance.
   - **API Access**: Yes, via `GET /api/v1/inspections/optimized-schedule`.

8. **`AuditLedgerEngine`** (`backend/app/engines/ledger_engine.py`):
   - **Purpose**: Maintains an immutable log of every AI decision, model version, input provenance, and human review decision.
   - **Input**: Decision snapshot payload, human approval status.
   - **Output**: Immutable ledger record with UUID.
   - **API Access**: Yes, via `GET /api/v1/ledger/entries` and `POST /api/v1/ledger/entry/{entry_id}/decision`.

9. **`FairnessSafeguardEngine`** (`backend/app/engines/fairness_engine.py`):
   - **Purpose**: Ensures missing telemetry in low-connectivity rural areas does not artificially penalize a project's risk score.
   - **API Access**: Yes, via `GET /api/v1/fairness/test-summary`.

10. **`GroqAIService`** (`src/services/groqAIService.ts`):
    - **Purpose**: Natural language generation of statutory audit reports and forensic explanations using LLaMA-3.3-70B on Groq LPUs.
    - **Input**: Structured project financial, physical, and satellite telemetry context.
    - **Output**: Narrative audit text, key findings list, and recommended actions.
    - **API Access**: Currently called directly from the frontend web client.

11. **`ElevenLabsAudioService`** (`src/services/elevenLabsAudioService.ts`):
    - **Purpose**: Text-to-speech audio synthesis for executive briefings.
    - **Input**: Clean text string.
    - **Output**: MP3 audio stream.
    - **API Access**: Currently called directly from the frontend web client.

---

## 5. Database Analysis

- **DBMS**: PostgreSQL 15+ with PostGIS spatial extension.
- **Data Models (from `backend/database/schema.sql` & `national_pipeline_schema.sql`)**:
  - `mps`: MP bio, house, category, allocation limits, state/constituency.
  - `projects` / `works`: Core MPLADS work entity with geographic point geometry, stage, financial amounts, and provenance.
  - `project_stages`: Workflow lifecycle timestamps, SLA benchmarks, and officer sign-offs.
  - `project_expenditures`: Vendor payment vouchers, disbursal dates, and sanction numbers.
  - `contractors`: Registered executing entities, GSTIN, PAN, and performance ratings.
  - `citizen_evidence`: Geotagged submissions, perceptual image hash, capture timestamp, and verification flag.
  - `audit_ledger`: Immutable snapshots of AI scoring runs, model versions, and human officer notes.
  - `satellite_observations`: SAR/optical reflectance change metrics and observation windows.
- **Current Runtime Status**: The backend server initializes in-memory cached structures via `backend/adapters/dataset_adapter.py` reading from CSVs in `Dataset/`. The SQL schemas represent the target production schema.

---

## 6. Authentication & Authorization Analysis

- **Current State**:
  - The web application uses a mock role selector (`src/components/RoleSelector.tsx`) that saves the active role in local React state.
  - Roles defined: `overview`, `mp`, `district`, `contractor`, `vendor`, `ministry`, `citizen`.
  - The FastAPI backend has **no authentication guards or JWT token verification** configured on endpoints; all endpoints are currently open.
- **Mobile Compatibility**:
  - The mobile app **cannot** rely on the backend for role validation in its current state.
  - A token-based authentication mechanism (or a local secure-session model with mock JWT support initially) is required to govern mobile user access and enforce screen permissions.

---

## 7. Frontend Code Reuse Potential

```
                        Code Portability Breakdown
                        
   Reusable Directly (~90%)                   Requires Mobile Adaptation
  ┌─────────────────────────────────┐       ┌─────────────────────────────────┐
  │ • TypeScript Interfaces         │       │ • Leaflet / HTML Maps           │
  │   (src/types/*.ts)              │       │   → react-native-maps           │
  │                                 │       │                                 │
  │ • Core Business Logic & Math    │       │ • DOM / HTML Tailwind Elements  │
  │   (Haversine, IQR, Formats)     │       │   → React Native <View>, <Text> │
  │                                 │       │                                 │
  │ • Localization Dictionaries     │       │ • Browser Audio / File APIs     │
  │   (LanguageContext.tsx JSON)    │       │   → expo-av, expo-camera        │
  │                                 │       │                                 │
  │ • Data Aggregation Helpers      │       │ • React Router DOM v7           │
  │   (nationalDataPipelineService) │       │   → Expo Router v4 (file-based) │
  └─────────────────────────────────┘       └─────────────────────────────────┘
```

1. **Directly Reusable**:
   - TypeScript models (`src/types/`): `index.ts`, `nationalPipeline.ts`, `rural.ts`, `contractorOpportunity.ts`.
   - Localization dictionaries in `src/contexts/LanguageContext.tsx`.
   - Formatting and validation utilities (INR currency formatting, date parsing, statistical calculations).

2. **Adaptable with Minor Changes**:
   - API service calls in `src/services/unifiedIntelligenceService.ts` and `nationalDataPipelineService.ts` (swap web `fetch` with standard Axios client configured with mobile base URLs).

3. **Cannot Be Directly Reused (Must Be Rebuilt for Mobile)**:
   - Web DOM components (`div`, `span`, `table`, `input`) must be implemented as React Native primitives (`View`, `Text`, `FlatList`, `TextInput`, `Pressable`).
   - Web Leaflet map (`src/components/IndiaProjectMap.tsx`) must be implemented using `react-native-maps` with native map renderers.
   - HTML5 `<audio>` elements in `elevenLabsAudioService.ts` must be ported to `expo-av`.
   - Web navigation (`react-router-dom`) must use Expo Router file-based routing (`app/(tabs)/...`).

---

## 8. Mobile Readiness Scorecard

| Capability | Readiness | Current Support | Required Mobile Implementation |
|---|---|---|---|
| **REST / HTTP APIs** | ✅ 90% | FastAPI endpoints return clean JSON | Configure mobile base URL & network timeouts |
| **Project Data Models** | ✅ 95% | Pydantic & TS interfaces match | Copy TS types to mobile repository |
| **Risk Intelligence** | ✅ 90% | All engines run server-side | Direct API consumption |
| **Evidence Upload** | ⚠️ 70% | Accepts Base64 JSON payloads | Use `expo-camera` & `expo-image-manipulator` |
| **GPS / Location** | ⚠️ 75% | Server calculates Haversine | Use `expo-location` for device coordinates |
| **Authentication** | ❌ 20% | Mock state only; no backend tokens | Implement mobile session store + future JWT |
| **Audio / Media** | ⚠️ 50% | Direct client-side ElevenLabs call | Use `expo-av` and route via backend proxy |
| **Push Notifications** | ❌ 0% | No notification backend | Implement FCM / APNs via `expo-notifications` |
| **Offline Storage** | ⚠️ 30% | In-memory web caches | Implement SQLite / WatermelonDB / MMKV |

---

## 9. Security Audit

> [!WARNING]
> The following security vulnerabilities exist in the current repository and must be addressed before deploying the mobile application:

1. **Hardcoded API Keys in Source Code**:
   - `src/services/groqAIService.ts`: Contains a hardcoded fallback Groq API key string.
   - `src/services/elevenLabsAudioService.ts`: Contains a hardcoded fallback ElevenLabs API key string.
   - *Risk for Mobile*: Native application binaries (`.apk` / `.ipa`) can be easily decompiled, exposing hardcoded keys.
   - *Mitigation*: These AI requests must be proxied through the FastAPI backend; keys must reside exclusively in backend environment variables.

2. **Plaintext Secrets in Local `.env`**:
   - `backend/.env`: Contains live credentials for external AI services and database passwords. Ensure this file is never committed or bundled in mobile builds.

3. **Unauthenticated Public Endpoints**:
   - Sensitive endpoints such as `POST /api/v1/ledger/entry/{entry_id}/decision` (officer audit overrides) and `POST /api/v1/citizen/evidence` have no rate limiting or authentication guards.

---

## 10. Architecture Gaps for Mobile

To support a production-ready mobile application on Android and iOS, the following components must be built:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            MOBILE CLIENT GAPS                               │
│                                                                             │
│  1. Mobile App Shell           2. Hardware Integration    3. Offline Engine │
│     • Expo SDK 52 + Router v4     • expo-camera              • MMKV / SQLite│
│     • Native Design System        • expo-location            • Sync Queue   │
│     • Role-based Tab Navigators   • expo-local-auth (Bio)    • Outbox Queue │
│                                                                             │
│  4. Native Maps                5. Secure Storage          6. Networking     │
│     • react-native-maps           • expo-secure-store        • Axios Client │
│     • Clustered Markers           • Token encryption         • Auto-retry   │
└─────────────────────────────────────────────────────────────────────────────┘
```

1. **Expo Router Navigation Structure**: Role-scoped tabs for `Citizen`, `Officer`, `MP`, and `Contractor`.
2. **Native Mobile Hardware Hooks**:
   - `expo-camera` with live-feed enforcement (preventing gallery uploads as mandated by `citizen_verification.py`).
   - `expo-location` with high-accuracy GPS telemetry and mock-location detection.
   - `expo-local-authentication` for fingerprint / Face ID biometric unlocking.
3. **Offline Sync & Caching**: SQLite / MMKV local persistence for project catalogs and an outbox queue for offline evidence capture in zero-connectivity rural sites.
4. **Native Mapping**: `react-native-maps` with clustered map markers for constituency-wide project visualization.

---

## 11. Recommended Mobile Integration Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        MOBILE CLIENT (React Native)                         │
│                                                                             │
│   Expo Router (app/) ──► Zustand Stores ──► TanStack Query (Server State)  │
│                                                     │                       │
│                                                     ▼                       │
│                                            Axios API Client                 │
│                                            (JWT + Base URL)                 │
└─────────────────────────────────────────────────────┬───────────────────────┘
                                                      │ HTTPS
                                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           BACKEND API (FastAPI)                             │
│                                                                             │
│   /api/v1/projects/* ──► /api/v1/risk/* ──► /api/v1/citizen/evidence        │
│          │                      │                        │                  │
│          ▼                      ▼                        ▼                  │
│   DatasetAdapter         9 AI Engines           Perceptual pHash            │
│   (CSV / Database)    (Risk, Triangulation)    & Geodesic Validator         │
└─────────────────────────────────────────────────────────────────────────────┘
```

- **Communication Protocol**: Standard RESTful JSON over HTTPS.
- **Image Submissions**: Base64 JSON payloads (compatible with existing `CitizenEvidenceSubmission` schema) or multipart form-data.
- **Base URL Resolution**:
  - Development (Android Emulator): `http://10.0.2.2:8000`
  - Development (iOS Simulator): `http://localhost:8000`
  - Development (Physical Device): `http://<LAN-IP>:8000`
  - Production: `https://pratyaksh-mplads.vercel.app` (or custom domain)

---

## 12. Offline-First & Synchronization Strategy

| Dataset / Action | Offline Strategy | Storage Mechanism | Sync Trigger |
|---|---|---|---|
| **MP & District Metadata** | Cache for 7 days | Local Storage (MMKV / SQLite) | App startup / background pull |
| **Project & Works Catalog** | Cache by selected district (24 hours) | Local Storage (SQLite) | Manual pull-to-refresh or daily |
| **Risk Scores & Benchmarks** | Cache for 6 hours | TanStack Query cache | On screen focus |
| **Citizen Evidence Capture** | Optimistic local save | Outbox Queue (SQLite) | Automatic retry on network reconnection |
| **Inspector Itinerary** | Full offline availability | Local SQLite table | Downloaded before field visit |
| **Officer Decision Sign-off** | Queued with timestamp & device ID | Outbox Queue | Replays on reconnect |

---

## 13. Final Recommendations

### What to REUSE
- **All Backend Routers & Engines**: 100% of existing FastAPI routes and 9 analytical engines in `backend/app/engines/`.
- **All Data Schemas & Types**: TypeScript types in `src/types/` and Pydantic schemas in `backend/app/schemas/`.
- **Localization Assets**: Complete Hindi / English dictionary from `LanguageContext.tsx`.
- **Core Business Logic**: Haversine distance, peer IQR statistics, and SLA calculations.

### What to ADAPT
- **API Services**: Port `unifiedIntelligenceService.ts` to use mobile-compatible Axios with environment-aware baseURL.
- **AI Audio & Report Calls**: Move direct Groq and ElevenLabs calls to backend proxy endpoints to protect API keys.
- **Evidence Submission**: Wrap device camera output with `expo-image-manipulator` to generate Base64 payloads matching backend expectations.

### What to NEWLY BUILD
- **Mobile Project Shell**: A dedicated Expo project (e.g. `mobile/` or separate repository) configured with Expo SDK 52, TypeScript, and Expo Router v4.
- **Native UI Design System**: Government-themed mobile components (StatCards, RiskBadges, Timeline, Itinerary Cards).
- **Hardware Integrations**: Modules for `expo-camera`, `expo-location`, `expo-local-authentication`, and `react-native-maps`.
- **Offline Storage & Outbox Queue**: SQLite / MMKV storage layer with network status listener (`@react-native-community/netinfo`).

### What NOT to Change
- **Existing Web Application**: Do not rewrite or modify web source files in `src/`.
- **Existing Backend Structure**: Do not modify existing route signatures, engine mathematical logic, or database DDL schemas.
- **Existing Dataset Files**: Preserve all files in `Dataset/` and `src/data/`.
