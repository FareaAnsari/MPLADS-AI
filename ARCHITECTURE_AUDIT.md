# ARCHITECTURE AUDIT & SYSTEM SPECIFICATION
## Universal MPLADS Intelligence Agent (Audit-First Build)
**Role:** Senior Staff / Principal AI/ML Systems Architect  
**Project:** MPLADS AI / Pratyaksh ([Live Deployment](https://mplads-ai-pratyaksh.vercel.app/))  
**Target Repository:** `/Users/themonishnawaz/Downloads/MPLADS/mplads-fix`  
**Date:** September 2026  
**Status:** Approved Architectural Blueprint (Phase 1 Deliverable)

---

## 1. Executive Summary & Core Architectural Principle

The objective is to build a **Universal MPLADS Intelligence Agent** capable of answering any domain question across 30,002+ project records, 543 Lok Sabha and 245 Rajya Sabha constituencies, statutory guidelines, ML anomaly signals, contractor entity graphs, and cross-scheme geospatial intersections.

### The Non-Negotiable Core Principle
$$\text{LLM} = \text{Reasoning and Orchestration Layer ONLY}$$
- **Never trust the LLM to invent**: Numbers, financial totals, project IDs, MP names, dates, risk scores, progress percentages, or guideline clauses.
- **Database (`mplads.db` / `DatasetAdapter`)**: Absolute source of structured truth (counts, sums, aggregations, filter lookups).
- **Existing Analytical & ML Engines**: Absolute source of analytical truth (risk scores, peer distributions, cross-scheme overlaps, DPR similarity).
- **Official Policy Documents (MoSPI Guidelines 2023)**: Absolute source of regulatory knowledge via structured RAG.
- **Validation Layer**: Deterministic fact-checking gate that matches every draft claim against tool JSON outputs before rendering.

```
                                  ┌─────────────────────────────────────────┐
                                  │           USER / CLIENT UI              │
                                  │   (React + Vite Web & Expo Mobile)      │
                                  └────────────────────┬────────────────────┘
                                                       │ Natural Language Query
                                                       ▼
                                  ┌─────────────────────────────────────────┐
                                  │        HARDENED SECURITY & RBAC         │
                                  │ (Citizen / MP / Officer / Admin Scoping)│
                                  └────────────────────┬────────────────────┘
                                                       │
                                                       ▼
                                  ┌─────────────────────────────────────────┐
                                  │        AI AGENT ORCHESTRATOR            │
                                  ├─────────────────────────────────────────┤
                                  │ 1. Intent Router (Compound Taxonomy)   │
                                  │ 2. Entity Resolver (Exact→Alias→Fuzzy)  │
                                  │ 3. Conversation State Session Store     │
                                  │ 4. Structured Query Planner             │
                                  └────────────────────┬────────────────────┘
                                                       │ Typed Tool Invocations
                         ┌─────────────────────────────┼─────────────────────────────┐
                         ▼                             ▼                             ▼
        ┌────────────────────────────────┐ ┌──────────────────────┐ ┌────────────────────────────────┐
        │     STRUCTURED DATA LAYER      │ │  ANALYTICAL ENGINES  │ │        POLICY RAG LAYER        │
        │  (Parameterized SQL / Adapter) │ │ (Pre-existing Python)│ │   (MoSPI 2023 + Circulars)     │
        ├────────────────────────────────┤ ├──────────────────────┤ ├────────────────────────────────┤
        │ • 30,002 eSAKSHI Works Records │ │ • risk_engine        │ │ • MoSPI 2023 Guidelines Ch 1-12│
        │ • MP Allocation Limits (LS/RS) │ │ • peer_comparison    │ │ • Permissible/Prohibited Works │
        │ • State & District Aggregates  │ │ • cross_scheme_engine│ │ • CPGRAMS Grievance Taxonomies │
        │ • Officer Decisions SQLite DB  │ │ • dpr_similarity     │ │ • Statutory SLA Benchmarks     │
        │ • SNA Ledger & Tender Registry │ │ • election_velocity  │ │ • Emergency Fund Allocation    │
        └────────────────┬───────────────┘ └──────────┬───────────┘ └────────────────┬───────────────┘
                         │ Structured JSON            │ Analyzed Signals             │ Grounded Chunks
                         └─────────────────────────────┼─────────────────────────────┘
                                                       │
                                                       ▼
                                  ┌─────────────────────────────────────────┐
                                  │      EVIDENCE & FACT SYNTHESIZER        │
                                  │  (Compiles Data Dossier + Citations)    │
                                  └────────────────────┬────────────────────┘
                                                       │
                                                       ▼
                                  ┌─────────────────────────────────────────┐
                                  │   DETERMINISTIC VALIDATION GUARDRAIL    │
                                  ├─────────────────────────────────────────┤
                                  │ • Numeric Reconciler (Tool JSON vs Text)│
                                  │ • Citation & Provenance Tier Verifier   │
                                  │ • Neutral Vocabulary Enforcer           │
                                  └────────────────────┬────────────────────┘
                                                       │ Verified Stream / JSON
                                                       ▼
                                  ┌─────────────────────────────────────────┐
                                  │   RICH INTELLIGENCE UI PRESENTATION     │
                                  │ (Text + KPI Cards + Tables + Map + Tiers│
                                  └─────────────────────────────────────────┘
```

---

## 2. Complete Inventory of Existing Assets & Codebase Audit

### 2.1 Existing Analytical & ML Engines (`backend/app/engines/`)

| Engine File | Primary Class / Function | Analytical Responsibility | Data Inputs | Output Signature & Provenance |
|---|---|---|---|---|
| `risk_engine.py` | `AIRiskEngine.evaluate_project_risk()` | 5-Component Additive Risk Score (0–100): Cost (25%), Delay (25%), Payment (25%), Spatial (15%), Evidence (10%) + IsolationForest outlier score | Project record, peer cohort stats | Composite score, severity (`LOW`/`MEDIUM`/`HIGH`/`CRITICAL`), component breakdown, explainable bullet points (**Tier 1**) |
| `peer_comparison.py` | `PeerComparisonEngine.compute_peer_benchmarks()` | Cohort grouping by `Category::State::BudgetTier::FY`. Computes mean, median, std, IQR, Q25, Q75, Z-score, fallback to macro cohort | 30,002 project records | Micro/macro benchmark distribution stats, deviation %, sample size flags (**Tier 1**) |
| `cross_scheme_engine.py` | `CrossSchemeEngine.scan_cross_scheme_overlap()` | Geospatial 500m proximity matching of MPLADS works against PMGSY and MGNREGA asset registries | Coordinates (lat/lon), radius, scheme assets | Matched scheme IDs, distance (m), asset title, potential duplicate claim flag (**Tier 2**) |
| `dpr_similarity_engine.py` | `DPRSimilarityEngine.scan_dpr_similarity()` | TF-IDF tokenization + Cosine similarity cross-district boilerplate copy-paste detection | Project description / DPR text, project corpus | Similarity score (0–1.0), shared key terms, cross-district boilerplate flag (**Tier 1 / Tier 2**) |
| `election_velocity_engine.py` | `ElectionVelocityEngine.calculate_velocity()` | Pre-election spending surge detection against ECI Gazette schedules | MP sanction dates, election dates | Pre-election acceleration ratio, surge classification (**Tier 1**) |
| `entity_resolution.py` | `EntityResolutionEngine.detect_fuzzy_duplicates()` | 15-char GSTIN regex validation, state code extraction, PAN matching, and difflib contractor cluster discovery | Vendor list, GSTIN, PAN | Shell cluster groupings, shared PAN flags, name similarity scores (**Tier 1 / Tier 2**) |
| `rate_benchmark_engine.py` | `RateBenchmarkEngine.evaluate_rates()` | Line-item material rate evaluation against CPWD Delhi Schedule of Rates (DSR 2026) | Item name, unit price, district | DSR benchmark price, deviation %, cost inflation indicator (**Tier 1**) |
| `grievance_nlp_engine.py` | `GrievanceNLPEngine.match_grievances()` | Semantic & keyword matching of citizen CPGRAMS grievances against active works | Project category, district, grievance text | Grievance count, average unresolved days, sentiment, recurring complaints (**Tier 2**) |
| `satellite_engine.py` | `SatelliteDecayEngine.analyze_change()` | ISRO Bhuvan / Sentinel-2 spectral difference & NDVI change score | Coordinates, before/after timestamps | Change index, visual persistence rating, ground-truthing requirement (**Tier 1**) |
| `decay_monitor_cron.py` | `DecayMonitorEngine.run_decay_audit()` | 6/12/24-month post-completion physical asset degradation tracking | Completed works records, satellite index | Infrastructure durability rating, physical decay risk flag (**Tier 1**) |
| `evidence_triangulation.py`| `EvidenceTriangulator.triangulate()` | Multi-source confidence score (Citizen photos + Satellite + Official milestone) | Image hashes, GPS exif, official stages | Confidence index (0–100%), evidence contradiction flag (**Tier 1 / Tier 2**) |
| `fairness_engine.py` | `FairnessSafeguardEngine.audit_bias()` | Prevents algorithmic penalization of missing remote data; ensures demographic equity | Project features, state indices | Fairness validation audit pass/fail (**Tier 1**) |
| `inspection_optimizer.py` | `InspectionOptimizer.optimize_route()` | Travelling Salesperson Problem (TSP) inspection clustering for District Collectors | High-risk project coordinates | Optimized travel route, risk-weighted priority queue (**Tier 1**) |
| `ledger_engine.py` | `ImmutableLedger.record_transaction()` | Cryptographically chained transaction audit trail for funds and decisions | Transaction payload, actor ID | SHA-256 block hash, tamper-evident audit record (**Tier 1**) |
| `photo_duplication.py` | `PhotoDuplicationEngine.compute_phash()`| 64-bit Perceptual Hashing (pHash) for cross-project duplicate inspection photos | Image byte buffers / file paths | Hamming distance, duplicate photo match pair (**Tier 3 Demo / Tier 1 Live**) |
| `sla_analyzer.py` | `SLAAnalyzer.evaluate_project_sla()` | 5-Stage Statutory SLA duration tracking against MoSPI 2023 benchmarks | Stage timestamps (Sanction → Disbursal → Completion) | Stage-wise delay days, bottleneck stage identification (**Tier 1 / Tier 2**) |

---

### 2.2 Existing Backend Routers & Endpoints (`backend/app/routers/`)

| Router Module | Route Prefix | Key Endpoints | Underlying Engine / Data Source |
|---|---|---|---|
| `projects.py` | `/api/v1/projects` | `GET /dataset-summary`, `GET /mps`, `GET /list`, `GET /{work_id}/risk-assessment`, `GET /{work_id}/peer-comparison`, `POST /{work_id}/decision` | `DatasetAdapter`, `AIRiskEngine`, `PeerComparisonEngine`, `mplads.db` |
| `intelligence.py` | `/api/v1/intelligence` | `GET /risk`, `GET /risk/{work_id}`, `GET /cross-scheme/{work_id}`, `GET /dpr-similarity/{work_id}`, `GET /election-velocity/{mp_id}`, `GET /satellite/imagery/{work_id}`, `GET /intelligence/rates/benchmarks`, `GET /entity-resolution/vendor-registry`, `GET /grievances/{work_id}`, `GET /decay-monitor/{work_id}` | All 18 specialized analytical engines |
| `national_data.py` | `/api` | `GET /national-data`, `GET /states`, `GET /summary`, `GET /clusters` | National dataset aggregates across all 543 constituencies |
| `mp.py` | `/api/v1/mp` | `GET /profile/{mp_id}`, `GET /utilization/{mp_id}`, `GET /recommendations/{mp_id}` | Lok Sabha & Rajya Sabha allocation registries |
| `contractor.py` | `/api/v1/contractor` | `GET /portal/my-works`, `GET /portal/financials`, `POST /portal/evidence` | Contractor-scoped works registry |
| `supply_chain.py` | `/api/v1/supply-chain` | `GET /custody/{work_id}`, `POST /dispatch`, `POST /receive`, `GET /reconciliation` | 5-stage material custody tracker |
| `tenders.py` | `/api/v1/tenders` | `GET /tenders`, `POST /tenders`, `POST /bids`, `POST /award`, `GET /contracts/all` | Statutory e-procurement registry |
| `auth.py` | `/api/v1/auth` | `POST /login`, `GET /me`, `POST /refresh` | JWT issuance with RBAC roles (`CITIZEN`, `MP`, `OFFICER`, `ADMIN`) |
| `notifications.py` | `/api/v1/notifications`| `GET /`, `POST /devices`, `POST /{id}/read` | In-app and push notification queues |

---

### 2.3 Existing Frontend AI & Intelligence Services (`src/services/`)

| Service File | Responsibility | Current Implementation |
|---|---|---|
| `aiService.ts` | Frontend bridge for project risk, peer comparison, counterfactual simulations, and officer decisions | Direct REST calls to backend `/api/v1/projects/...` and `/api/v1/intelligence/...` with typed TypeScript interfaces |
| `unifiedIntelligenceService.ts`| Aggregated client intelligence layer orchestrating cross-scheme, satellite, and rate benchmarks | High-level client-side caching and multi-engine coordination |
| `geminiAIService.ts` | Gemini 1.5 Pro / Flash client for unstructured document extraction and officer summary generation | Raw Gemini API calls (Needs formal backend orchestration) |
| `groqAIService.ts` | Ultra-low latency Llama-3 70B inference for rapid text transformations | Direct Groq API client (Needs backend proxy & guardrails) |
| `nationalDataPipelineService.ts` | Frontend national data aggregation, state summaries, and geo-mesh linkage | Manages client-side aggregations for the 543-constituency interactive SVG map |

---

### 2.4 Existing Data Provenance Tiers (`DATA_STRATEGY.md`)

The platform already enforces a 3-Tier Data Provenance System that **must be inherited without modification**:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        DATA PROVENANCE TIERS                           │
├───────────────┬────────────────────────────────────────────────────────┤
│ TIER 1        │ REAL, SOURCED, CITABLE                                 │
│ (Green Badge) │ Directly pulled from official government portals:      │
│               │ - eSAKSHI / data.gov.in MPLADS base dataset (30,002)   │
│               │ - CPWD DSR 2026 statutory rates & ECI Gazette schedules│
├───────────────┼────────────────────────────────────────────────────────┤
│ TIER 2        │ REAL SCHEMA / CURATED REFERENCE DATASET                │
│ (Amber Badge) │ Uses authentic statutory schema structure where bulk   │
│               │ API access is restricted:                              │
│               │ - PMGSY / MGNREGA indexed local reference registry     │
│               │ - CPGRAMS citizen grievance incident structures        │
│               │ - Bank tranche SLA delay breakdown timelines           │
│               │ - State MLA-LAD scheme geographic records              │
├───────────────┼────────────────────────────────────────────────────────┤
│ TIER 3        │ FULLY SYNTHETIC DEMO DATA                              │
│ (Purple Badge)│ Used strictly to demonstrate extreme forensic mechanics│
│               │ during hackathon evaluations:                          │
│               │ - Duplicate-photo pHash pair (HERO-001 vs DUP-002)     │
│               │ - Deliberately cost-inflated pre-sanction test proposal │
│               │ - Simulated contractor shell cluster test fixtures     │
└───────────────┴────────────────────────────────────────────────────────┘
```

---

## 3. What Must Be Reused vs. What Must Be Built Net-New

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                             REUSE VS. BUILD MATRIX                               │
├────────────────────────────────────────┬─────────────────────────────────────────┤
│ REUSE AS-IS (Zero Reimplementation)    │ BUILD NET-NEW (Conversational Layer)    │
├────────────────────────────────────────┼─────────────────────────────────────────┤
│ 1. All 18 backend analytics/ML engines │ 1. Intent Classification Engine         │
│ 2. Existing database schema & adapters │ 2. Canonical Entity Resolution Engine   │
│ 3. 30,002 eSAKSHI canonical records    │ 3. Multi-Turn Session State Manager     │
│ 4. Provenance Tier 1/2/3 tagging logic │ 4. Structured NL→QueryPlan Generator    │
│ 5. Security & RBAC Auth middleware     │ 5. Safe Read-Only SQL Query Executor    │
│ 6. Officer decision persistence logic  │ 6. MoSPI 2023 Guidelines Hybrid RAG     │
│ 7. Existing frontend UI theme & tokens │ 7. Deterministic Claim/Numeric Validator│
│ 8. Map SVG mesh & GeoJSON definitions  │ 8. Conversational Chat UI & Dossier View│
│ 9. Neutral vocabulary audit rules      │ 9. 50-100 Question Golden Evaluation Set│
└────────────────────────────────────────┴─────────────────────────────────────────┘
```

### 3.1 Strict Reuse Directives
1. **Never build a second risk calculation inside the LLM prompt**: When asked *"Why is project X high risk?"*, the agent calls `AIRiskEngine.evaluate_project_risk()`.
2. **Never calculate cohort averages in the LLM**: When asked *"How does this compare to peers?"*, the agent calls `PeerComparisonEngine.compute_peer_benchmarks()`.
3. **Never perform distance calculations in the LLM**: When asked *"Are there nearby duplicate projects?"*, the agent calls `CrossSchemeEngine.scan_cross_scheme_overlap()`.
4. **Never calculate financial sums in the LLM**: When asked *"How much was spent in Maharashtra in 2024?"*, the agent generates a structured query plan executed via parameterized SQL / `DatasetAdapter`.

---

## 4. Layer Ownership & Question Routing Matrix

Every conceivable user query is strictly mapped to its authoritative owning layer:

| Question Archetype | Example Query | Primary Owning Layer | Tool / Mechanism | Data Provenance Tier |
|---|---|---|---|---|
| **MP Lookup & Profile** | *"Who is the MP for Varanasi and what is their allocated budget?"* | **Database / Structured Store** | `get_mp_profile(mp_id="...")` | **Tier 1** (eSAKSHI Official Registry) |
| **National / State Aggregation** | *"How much money has been sanctioned across Maharashtra in FY 2024-25?"* | **Database / SQL Engine** | `run_sql_analytics(plan={entity: 'project', metric: 'sanctioned_amount_inr', agg: 'sum', filters: {state: 'Maharashtra', fy: '2024-2025'}})` | **Tier 1** (eSAKSHI Official 30,002 Dataset) |
| **Filtered Multi-Condition Search** | *"Show me delayed drinking water projects over ₹50L in Bihar."* | **Database / SQL Engine** | `search_projects(filters={state: 'Bihar', category: 'Drinking Water', min_amount: 5000000, status: 'DELAYED'})` | **Tier 1** (eSAKSHI Official Export) |
| **Individual Project Fact Sheet** | *"Tell me everything about project MPLADS-2024-0001."* | **Database / Structured Store** | `get_project(work_id="MPLADS-2024-0001")` | **Tier 1** (Official Work Record) |
| **Risk & Anomaly Explanation** | *"Why was project MPLADS-2024-0001 flagged as high risk?"* | **ML / Analytical Engine** | `get_risk_assessment(work_id="...")` calling `AIRiskEngine` | **Tier 1 / Tier 2** (Algorithmic Risk Signal) |
| **Peer Cohort Benchmarking** | *"Is the cost of this community hall higher than average?"* | **Statistical / Peer Engine** | `get_peer_comparison(work_id="...")` calling `PeerComparisonEngine` | **Tier 1** (Cohort Distribution Model) |
| **Cross-Scheme Double Dipping** | *"Are there overlapping PMGSY roads near this project site?"* | **Geospatial Engine** | `get_cross_scheme_overlap(work_id="...")` calling `CrossSchemeEngine` | **Tier 2** (Curated PMGSY OMMAS Reference Registry) |
| **DPR Text Plagiarism / Boilerplate**| *"Was this project proposal copy-pasted from another district?"* | **NLP Engine** | `get_dpr_similarity(work_id="...")` calling `DPRSimilarityEngine` | **Tier 1 / Tier 2** (TF-IDF Cosine Matcher) |
| **Contractor & Shell Entity Audit** | *"Does contractor Bharat Infra share a PAN with other companies?"* | **Entity Resolution Engine** | `get_vendor_resolution(gstin="...")` calling `EntityResolutionEngine` | **Tier 1 / Tier 2** (GSTN Algorithm & Registry) |
| **Official Policy / Guideline Rule** | *"Can MPLADS funds be used to construct a private temple or church?"* | **Policy RAG Subsystem** | `search_guidelines(query="prohibited religious structures")` over MoSPI 2023 Guidelines | **Tier 1** (MoSPI Statutory Guidelines Ch 3 Sec 3.2) |
| **Ceiling Limits & Financial Caps** | *"What is the maximum limit for natural calamity emergency works?"* | **Policy RAG Subsystem** | `search_guidelines(query="natural calamity emergency ceiling limit")` | **Tier 1** (MoSPI Revised Guidelines 2023) |
| **Multi-Hop Deep Investigation** | *"Perform a deep analysis of project X: financials, risk, peers, and relevant guidelines."* | **AI Agent Orchestrator (Multi-Tool)** | Calls `get_project` + `get_risk_assessment` + `get_peer_comparison` + `search_guidelines` in parallel | **Composite Tier 1 & Tier 2 Dossier** |
| **Pre-Election Velocity Check** | *"Did MP X exhibit an unusual sanction surge before the election?"* | **Analytical Engine** | `get_election_velocity(mp_id="...")` calling `ElectionVelocityEngine` | **Tier 1** (ECI Gazette Alignment) |
| **Unanswerable / Unsupported Claim** | *"Will MP X win the upcoming election?"* | **Safety Guardrail / Fallback** | Refusal rule: *"I cannot answer political predictions. I provide evidence-based MPLADS project monitoring."* | **N/A** (Grounded Safety Boundary) |

---

## 5. Detailed Technical Blueprint for Net-New Components

```
backend/app/agent/
├── __init__.py
├── orchestrator.py          # Central Agent loop: Intent -> Resolve -> Plan -> Execute -> Validate
├── router.py                # 20+ Intent classification taxonomy & compound query parser
├── entity_resolver.py       # Canonical DB matcher (MP, constituency, district, project, vendor)
├── session_manager.py       # Structured multi-turn conversation state persistence
├── query_planner.py         # NL -> Structured JSON query plan generator
├── sql_executor.py          # Read-only, parameterized, row-limited SQL execution engine
├── validator.py             # Deterministic numeric reconciler & neutral vocabulary enforcer
├── tools/
│   ├── __init__.py
│   ├── base.py              # TypedTool base class (schema, auth_policy, timeout, metadata)
│   ├── project_tools.py     # get_project, search_projects, get_project_timeline
│   ├── analytics_tools.py   # get_risk_assessment, get_peer_comparison, get_dpr_similarity
│   ├── geospatial_tools.py  # get_cross_scheme_overlap, get_satellite_imagery
│   ├── entity_tools.py      # get_mp_profile, get_vendor_resolution, get_gstin_details
│   ├── guideline_tools.py   # search_guidelines, get_guideline_clause (RAG)
│   └── sql_tools.py         # run_sql_analytics
└── rag/
    ├── __init__.py
    ├── document_indexer.py  # MoSPI 2023 Guidelines chunker & metadata tagger
    ├── vector_store.py      # In-memory / Chroma vector index with cosine distance
    └── hybrid_retriever.py  # Keyword (BM25) + Vector + Metadata filter + Reranker
```

### 5.1 Typed Tool Registry Specification
Every tool wraps existing backend Python code and defines:
1. **Input Schema**: Validated via Pydantic v2.
2. **Auth Policy**: Minimum role required (`CITIZEN`, `MP`, `OFFICER`, `ADMIN`).
3. **Execution Timeout**: Hard limit (default 2.5s).
4. **Structured JSON Output**: Normalized response including mandatory provenance metadata (`source`, `provenance_tier`, `citable_anchor`).

```python
# Conceptual Tool Interface
class TypedTool(ABC):
    name: str
    description: str
    min_role: UserRole = UserRole.CITIZEN
    timeout_seconds: float = 3.0
    
    @abstractmethod
    async def execute(self, params: Dict[str, Any], context: RequestContext) -> ToolResult:
        """Executes the tool, returning structured JSON with provenance tier."""
        pass
```

### 5.2 Structured Query Plan (NL→SQL Safety)
To prevent SQL injection or hallucinations, the LLM generates a structured JSON AST, never raw SQL strings:

```json
{
  "operation": "aggregate",
  "target_entity": "works",
  "filters": {
    "state": "Maharashtra",
    "work_category": "Roads & Pathways",
    "fiscal_year": "2024-2025",
    "disbursed_amount_inr": { "gte": 5000000 },
    "is_delayed": true
  },
  "metrics": ["disbursed_amount_inr", "sanctioned_amount_inr"],
  "aggregations": ["count", "sum"],
  "group_by": ["district"],
  "sort_by": "sum_disbursed",
  "order": "desc",
  "limit": 10
}
```
The backend `SQLExecutor` converts this AST into a parameterized SQL statement executed with `READ_ONLY` transaction isolation, a 3000ms query timeout, and a hard cap of 100 returned rows.

### 5.3 Deterministic Validation Layer (The Fact Guardrail)
Before any response is dispatched to the user, the `Validator` performs four automated safety checks:
1. **Numeric Reconciler**: Extracts all monetary amounts (`₹...`), percentages (`...%`), counts, and project IDs from the LLM narrative and verifies that each figure exists in the structured JSON returned by the executed tools. If a discrepancy is detected (e.g., tool returned ₹31,00,000 but LLM drafted ₹13,00,000), the response is automatically rejected and regenerated.
2. **Provenance & Citation Verifier**: Ensures every factual claim attaches a visible Tier badge (`[Tier 1]`, `[Tier 2]`, or `[Tier 3]`) and an exact source citation.
3. **Neutral Vocabulary Enforcer**: Scans draft text for prohibited judgmental words (*"fraud"*, *"scam"*, *"corrupt"*, *"guilty"*). If found, rewrites them to statutory neutrality (*"Monitoring Signal"*, *"Requires Verification"*, *"Potential Anomaly"*).
4. **Role-Based Redaction**: If the authenticated user is a `CITIZEN`, internal officer notes, contractor margin estimates, and granular shell cluster risk indices are stripped from the response payload at the tool level.

---

## 6. Phased Implementation Roadmap

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                           PHASED EXECUTION ROADMAP                               │
├─────────┬──────────────────────────────────────────┬─────────────────────────────┤
│ Phase   │ Focus Area                               │ Key Deliverables            │
├─────────┼──────────────────────────────────────────┼─────────────────────────────┤
│ Phase 1 │ Architecture Audit & Blueprint           │ ARCHITECTURE_AUDIT.md       │
│ Phase 2 │ Typed Tool Layer                         │ backend/app/agent/tools/    │
│ Phase 3 │ Intent Router, Entity Resolver & State   │ router.py, resolver.py      │
│ Phase 4 │ Safe NL->QueryPlan & SQL Engine          │ query_planner.py, sql.py    │
│ Phase 5 │ Policy Guidelines Hybrid RAG             │ backend/app/agent/rag/      │
│ Phase 6 │ Deterministic Validation & Fact Guardrail│ validator.py                │
│ Phase 7 │ Chat API & Streaming SSE Endpoint        │ chat.py (/api/v1/ai/chat)   │
│ Phase 8 │ Chat UI & Investigative Dossier View     │ src/components/chat/        │
│ Phase 9 │ Golden Evaluation Suite (50-100 Tests)   │ tests/ai_evaluation/        │
└─────────┴──────────────────────────────────────────┴─────────────────────────────┘
```

---

## 7. Definition of Done (DoD)

The Universal MPLADS Intelligence Agent is complete only when:
1. **Zero Hallucinated Numbers**: 100% of numerical figures in responses match underlying tool JSON data under automated golden testing.
2. **Full Tool Coverage**: All 18 existing backend engines are wrapped and invoked by the orchestrator without duplicated logic.
3. **Complete Citation Discipline**: Every response displays its Data Provenance Tier (Tier 1/2/3) and specific source citations (eSAKSHI record ID, CPWD DSR table, or MoSPI 2023 Guideline section).
4. **Backend-Enforced RBAC**: Citizens cannot access internal officer risk scores or confidential contractor PAN clusters regardless of prompt injection techniques.
5. **Neutral Vocabulary Compliance**: System maintains statutory neutrality under adversarial prompting.
6. **Golden Test Pass Rate**: $\ge 95\%$ on the 50-100 question benchmark test suite covering lookups, multi-hop queries, risk explanations, and injection attempts.
