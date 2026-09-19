# Mobile Phase 8 — Risk Intelligence Implementation & Audit Documentation

## 1. Executive Summary

Phase 8 implements the production-oriented mobile **Risk Intelligence** client for the MPLADS-AI (`Pratyaksh`) application. 

Risk Intelligence delivers explainable, multi-dimensional analytical signals computed by the server-side intelligence engines to authorized officers (primarily District Officers in this phase). It strictly enforces Clean Architecture and government accountability principles:
* **The backend is the authoritative intelligence engine**: The mobile client consumes server-calculated scores and never performs independent heuristic recalculations, client-side ML, or normalization changes.
* **Neutral, explainable assessment**: System outputs are presented as analytical signals for officer verification and operational decision-making, never as legal assertions of fraud or corruption.
* **Safeguard preservation**: Data quality flags, small-cohort protections, and low-connectivity safeguards are rendered explicitly without penalizing disadvantaged jurisdictions.

---

## 2. Server-Side Intelligence Engines Audit

The backend analytical framework provides the following authoritative engines:

| Engine | Server Component | Methodology | Mobile Representation |
|---|---|---|---|
| **Composite Risk Scoring** | `AIRiskEngine_v2` (`backend/app/analytics/risk_engine.py`) | Additive weighting: Cost Outlier (25%), Milestone Delay (25%), Fiscal Rush Pattern (25%), Spatial Clustering (15%), Evidence Duplication (10%). | Server-provided score (0–100) and severity classification (`Low`, `Medium`, `High`, `Critical`). |
| **Statistical Outlier Detection** | `AIRiskEngine_v2` / `scikit-learn` Isolation Forest | Unsupervised multidimensional anomaly detection producing contamination decision boundaries. | Potential statistical outlier badge with disclaimer and officer review recommendation. |
| **Peer Cohort Benchmarking** | `PeerComparisonEngine` (`backend/app/analytics/peer_comparison.py`) | Interquartile Range (IQR) & Z-score distribution across state/category cohorts (Mean, Median, IQR, Q25, Q75). | Contextual deviation bar with cohort metadata (N count) and small-cohort fairness safeguards. |
| **Evidence Triangulation** | `EvidenceTriangulationEngine` (`backend/app/analytics/evidence_triangulation.py`) | Triangulated confidence score synthesizing agency progress claims, citizen on-site GPS proximity, and perceptual image similarity. | Multi-source confidence breakdown (0–100%) and verification status badge. |
| **SLA Bottleneck Analysis** | `SLABottleneckAnalyzer` (`backend/app/analytics/sla_analyzer.py`) | Workflow stage aging vs statutory benchmarks (e.g. Technical Sanction to Tender) and responsible role identification. | Milestone delay ratio and bottleneck alerts. |
| **Inspection Scheduling** | Nearest-Neighbor Optimizer (`backend/app/analytics/inspection_optimizer.py`) | Multi-criteria priority ranking weighting risk score, disbursed capital, and nodal base distance. | Priority rank and inspection scheduling recommendations. |
| **Statutory Audit Ledger** | Immutable Audit Ledger (`backend/app/analytics/audit_ledger.py`) | Cryptographically hashed chain linking AI model evaluations, rule triggers, and officer decisions. | Read-only chronological audit timeline. |
| **Fairness & Data Quality Safeguards** | Bias Mitigation Module (`backend/app/analytics/fairness_guard.py`) | Non-punitive fallback for low-connectivity regions or small cohorts (<5 peer projects). | Explicit fairness banners and data provenance notices. |

---

## 3. Endpoints & API Integration Contracts

All endpoints require JWT Bearer authentication and role-based authorization:

### 3.1 System Risk Overview
* **Endpoint**: `GET /api/v1/intelligence/overview` (or fallback aggregation)
* **Response**: `RiskOverviewSummaryEntity` containing monitored counts, risk distribution (`highRiskCount`, `reviewRequiredCount`, `normalCount`), and data provenance metadata.

### 3.2 Risk Projects Queue
* **Endpoint**: `GET /api/v1/intelligence/risk-projects?state={state}&min_risk_score={min}&limit={limit}&offset={offset}`
* **Response**: List of `RiskAssessmentEntity` objects matching filter criteria.

### 3.3 Project Risk Intelligence Detail
* **Endpoint**: `GET /api/v1/intelligence/risk/{work_id}` & `GET /api/v1/intelligence/peer-comparison/{work_id}`
* **Response**: `ProjectRiskIntelligenceDetailEntity` combining composite score, weighted risk drivers, Isolation Forest outlier signals, and Peer IQR statistics.

### 3.4 Multi-Source Verification Confidence
* **Endpoint**: `GET /api/v1/intelligence/verification-confidence/{work_id}`
* **Response**: `VerificationConfidenceEntity` providing overall confidence percentage, independent evidence status, and triangulation weights.

### 3.5 Statutory Audit Ledger
* **Endpoint**: `GET /api/v1/intelligence/ledger/{work_id}`
* **Response**: `AuditLedgerHistoryEntity` returning immutable ledger entries, block indices, and actor roles (`SYSTEM_AI_ENGINE`, `DISTRICT_OFFICER`, etc.).

---

## 4. Mobile Architecture & Data Flow

```text
[ FastAPI Intelligence Endpoints ]
              ▲
              │ HTTP / JWT Auth (Bearer)
              ▼
[ RemoteIntelligenceRepository ]
              ▲
              │ Domain Interfaces (IIntelligenceRepository)
              ▼
[ Domain Use Cases ]
  ├── FetchSystemRiskOverviewUseCase
  ├── FetchRiskProjectsUseCase
  ├── FetchProjectRiskIntelligenceDetailUseCase
  ├── FetchVerificationConfidenceUseCase
  └── FetchProjectLedgerHistoryUseCase
              ▲
              │ Centralized Cache Keys
              ▼
[ TanStack Query Hooks ]
  ├── useRiskOverviewQuery
  ├── useRiskProjectsQuery
  ├── useProjectRiskIntelligenceDetailQuery
  ├── useVerificationConfidenceQuery
  └── useProjectLedgerHistoryQuery
              ▲
              │ State & i18n
              ▼
[ UI Presentation Screens ]
  ├── Risk Intelligence Overview Screen (/app/(officer)/risk/index.tsx)
  └── Deep Project Risk Intelligence Screen (/app/(officer)/risk/[id].tsx)
```

---

## 5. Explainability & Fairness Safeguards

1. **Analytical Disclaimers**: Every screen and card explicitly notes: *"System-generated analytical signals for officer review. Officer decision remains authoritative."*
2. **Never Conflate Anomaly with Fraud**: The UI explicitly utilizes neutral, objective terminology:
   * *Correct*: "Potential Cost Anomaly", "Statistical Outlier", "Review Required", "Location-Inconsistent Match".
   * *Prohibited*: "Fraud", "Corruption", "Fake Project", "Malicious Activity".
3. **Data Quality Integrity**: Missing data is rendered as *"Data unavailable"* rather than coerced to ₹0 or treated as an evidence penalty.
4. **Cohort Sparsity Protection**: When peer sample size is small (<5), the UI renders a fairness badge indicating that macro-level regional benchmarks are used to prevent statistical bias.

---

## 6. Access Control & Authorization (RBAC)

| Role | `risk:read` | `risk:audit` | `inspections:update` | Scope |
|---|:---:|:---:|:---:|---|
| **DISTRICT_OFFICER** | ✅ | ✅ | ✅ | Full explainable intelligence, drivers, peer benchmarks, audit ledger, and inspection updating. |
| **MP_OFFICE** | ✅ | ✅ | ❌ | Constituency-level risk summaries and peer comparisons. |
| **CITIZEN** | ✅ (Public-Safe) | ❌ | ❌ | High-level risk score with public explanation; no confidential inspection routing or raw ledger hashes. |
| **CONTRACTOR** | ❌ | ❌ | ❌ | Restricted from risk audit intelligence. |

---

## 7. Bilingual Localization & Accessibility (WCAG 2.1 AA)

* **Parity**: Complete bilingual coverage across English (`en-IN`) and formal Hindi (`hi-IN`) without missing translation keys or hardcoded user-facing strings.
* **Non-Color Reliance**: Risk states pair standard MoSPI colors (`#0B4D3C`, `#D97706`, `#DC2626`) with explicit text labels, semantic badges, and accessible ARIA attributes.
* **Screen Reader Optimization**: Dynamic accessibility labels provide complete context (e.g., `accessibilityLabel="Composite Risk Score 78.5 out of 100, High Risk. Cost anomaly factor 82%"`).

---

## 8. Verification & Quality Assurance

* **TypeScript Compilation**: `npx tsc --noEmit` passes with **0 errors**.
* **Jest Test Suite**: All 6 test suites pass with **54 tests passing**:
  * `tests/riskIntelligence.test.ts` (Risk overview, deep detail, peer benchmarks, verification confidence, audit ledger, RBAC, i18n, safeguards)
  * `tests/officerFeatures.test.ts`
  * `tests/citizenFeatures.test.ts`
  * `tests/localizationAccessibility.test.ts`
  * `tests/authRBAC.test.ts`
  * `tests/domainMappers.test.ts`
