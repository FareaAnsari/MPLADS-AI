# MPLADS AI — Project Lifecycle Intelligence & Transparency Platform
### Government of India | Ministry of Statistics & Programme Implementation (MoSPI)
*AI-Powered Monitoring, Rural Village Intelligence, and National Data Pipeline Layer ON TOP of e-SAKSHI*

---

## 🏛️ STRICT DATASET-ONLY RULE & CORE GOVERNANCE

> ### ⚠️ STATUTORY DATASET POLICY
> **All details displayed in this application come ONLY from the provided official dataset.**
>
> The dataset is the **SINGLE SOURCE OF TRUTH**.
>
> Under this statutory directive:
> - **Zero Fabrication Policy**: No information is created, invented, assumed, estimated, fabricated, or hardcoded if it is not present in the official dataset.
> - **Scope of Data**: Applies to MP names, MLA names, Corporator names, project/work names, work purposes, work locations, constituencies, districts, work statuses, dates, estimated costs, sanctioned amounts, expenditures, funds, implementing agencies, contractors, vendors, tender details, contract details, payment details, material/product prices, and project progress.
> - **Handling Missing Data**: If a particular detail is **NOT** available in the dataset, the platform strictly displays:
>   ```
>   "Data Not Available"
>   ```
>   Missing information is **never** filled using assumptions, internet guesses, generated/sample data, or AI-generated facts.
> - **Constitutional & Representative Scope**: Because the dataset contains only Member of Parliament (MP/MPLADS) public records, the platform does **NOT** add MLA, Corporator, Contractor, Vendor, Tender, or other information unless those records are actually present in the dataset.
> - **Role of Artificial Intelligence (AI)**:
>   - AI may **ONLY** analyze the existing dataset to generate derived analytical insights (e.g. anomaly detection, risk indicators, trends, comparisons, execution delays, geographic patterns, and predictions).
>   - All AI-generated outputs must be explicitly labeled as:
>     `"AI Analysis"` / `"AI Prediction"` / `"AI Risk Indicator"`
>   - AI **never** presents generated information as an actual dataset record.
>
> ```
> ┌────────────────────────────────────────────────────────────────────────┐
> │                          DATA ARCHITECTURE                             │
> ├────────────────────────────────────────────────────────────────────────┤
> │                                                                        │
> │  [OFFICIAL DATASET] ───────────────► [APPLICATION DATA LAYER]          │
> │  (Single Source of Truth)                     │                        │
> │         │                                     ▼                        │
> │         │                             Factual Display                  │
> │         │                             ("Data Not Available" if absent) │
> │         ▼                                                              │
> │  [AI AUDIT & ML ENGINES] ──────────► [DERIVED INSIGHTS]                │
> │                                       - "AI Analysis"                  │
> │                                       - "AI Prediction"                │
> │                                       - "AI Risk Indicator"            │
> │                                                                        │
> └────────────────────────────────────────────────────────────────────────┘
> ```
>
> **NO FAKE DATA. NO ASSUMPTIONS. NO HARDCODED RECORDS. NO EXTERNAL DATA.**

---

## 1. Executive Summary

**MPLADS AI (MPLADS AI)** is a public-sector-grade intelligence and monitoring platform designed to enhance the transparency, speed, and equity of project execution under the **Member of Parliament Local Area Development Scheme (MPLADS)**.

The platform functions as an independent verification, geospatial analysis, and civic discovery layer that interfaces directly with official public government datasets from **e-SAKSHI (MoSPI)** and **Open Government Data Platform India (data.gov.in)**.

---

## 2. Ingested Official Datasets

The platform ingests and indexes the following public dataset files located in `Dataset/`:

| Dataset Filename | House / Type | Records Indexed | Attributes Present in Dataset |
| :--- | :--- | :--- | :--- |
| **`Allocated Limit for Honble MPs.csv`** | Lok Sabha | 544 MPs | State, MP Name, Constituency, Allocated Amount (₹) |
| **`Allocated Limit for Honble MPs RajyaSabha (1).csv`** | Rajya Sabha | 232 MPs | State, MP Name, Elected/Nominated, Allocated Amount (₹) |
| **`Works Completed.csv` & `Works Completed (1).csv`** | All Houses | 30,002 Works | Work ID & Title, Work Category, State, IDA (Implementing District Authority), Work Description, MP Name, Constituency, Image, Completion Date, Amount Disbursed (₹) |
| **`Expenditure on Completed and On-going Works as on Date.csv` & `(1).csv`** | All Houses | 39,002 Milestone Payments | Work ID, State, Work Name, IDA, MP Name, Elected/Nominated, Expenditure Date, Vendor Name, Payment Status, Fund Disbursed Amount (₹) |
| **`Amount consented for Calamity.csv` & `(1) RJ.csv`** | Consents | 34 Records | Calamity Type, Calamity Name, MP Name, Date of Consent, Consent Amount (₹) |

*All data displayed in the application is parsed directly from these files.* If any field (such as village code, tender date, or physical progress) is absent in a dataset row, the application renders `"Data Not Available"`.

---

## 3. Core System Architecture

```
                        ┌────────────────────────────────────────────────────────┐
                        │      MPLADS AI Central Platform (Frontend & UI)        │
                        │      React 19 + TypeScript + Vite + Tailwind CSS       │
                        └───────────────────────────┬────────────────────────────┘
                                                    │
            ┌───────────────────────────────────────┼────────────────────────────────────────┐
            ▼                                       ▼                                        ▼
┌───────────────────────┐               ┌───────────────────────┐                ┌───────────────────────┐
│  Rural Village        │               │ Upcoming Works &      │                │ National Data         │
│  Intelligence &       │               │ Procurement Status    │                │ Ingestion &           │
│  Village Explorer     │               │ Explorer              │                │ Verification Pipeline │
└───────────┬───────────┘               └───────────┬───────────┘                └───────────┬───────────┘
            │                                       │                                        │
            └───────────────────────────────────────┼────────────────────────────────────────┘
                                                    ▼
                        ┌────────────────────────────────────────────────────────┐
                        │  Dataset Adapter & Single Source of Truth              │
                        │  - Zero synthetic data                                 │
                        │  - "Data Not Available" fallback for missing fields     │
                        └───────────────────────────┬────────────────────────────┘
                                                    │
            ┌───────────────────────────────────────┼────────────────────────────────────────┐
            ▼                                       ▼                                        ▼
┌───────────────────────┐               ┌───────────────────────┐                ┌───────────────────────┐
│ Groq LLaMA-3.3-70B    │               │ ElevenLabs Voice      │                │ FastAPI Backend       │
│ Forensic Audit Engine │               │ Administrative Audio  │                │ Python 3.13 + Uvicorn │
│ Labeled: AI Analysis  │               │ Briefing Engine       │                │ In-Memory DataAdapter │
└───────────────────────┘               └───────────────────────┘                └───────────┬───────────┘
                                                                                             │
                                                                                             ▼
                                                                                 ┌───────────────────────┐
                                                                                 │ Dataset/ CSV Files    │
                                                                                 │ & PostgreSQL PostGIS  │
                                                                                 └───────────────────────┘
```

---

## 4. Key Functional Modules

### A. National MPLADS Data Pipeline (`/national-data`)
- **Direct Source Parsing**: Indexes 776 MPs, 30,002 works, and 39,002 expenditures totaling ₹47,719 Cr sanctioned and ₹67,618 Cr disbursed.
- **State Coverage Tiers**: Computes state-by-state record counts, sanctioned limits, and verified expenditure totals.
- **Data Quality & Provenance**: Reports data completeness scores and identifies missing attributes per statutory MoSPI standards.

### B. Member of Parliament Directory (`/mps`)
- **Coverage**: Complete directory of 776 Members of Parliament (Lok Sabha & Rajya Sabha).
- **Attributes**: Official state, constituency (Lok Sabha), house, category (Elected/Nominated), and allocated MPLADS funds in Crores.
- **Clustering**: Geospatial and house-wise distribution analysis.

### C. Works & Project History (`/projects`, `/project/:id`)
- **Official Records**: 30,000+ completed and on-going works with actual work IDs (e.g. `WS/MP418/2024-2025/133409`), categories, IDAs, and completion dates.
- **Strict Dual Status**:
  - **MPLADS Status**: Derived strictly from dataset (`Completed`, `Payment In-Progress`, or `Recommended`).
  - **Procurement Status**: If tender/contract details are not in the dataset, displays `"Data Not Available"` or `"No official tender information found in current dataset"`.

### D. AI Risk & Forensic Analysis (`/ai-insights`, `/investigation`)
- **Labeled Outputs**: Every derived assessment is explicitly marked as `"AI Analysis"`, `"AI Prediction"`, or `"AI Risk Indicator"`.
- **Statutory Rules**: Evaluates disbursement vs completion timeline anomalies, vendor payment concentrations, and multi-year execution gaps without inventing fake vouchers.
- **Groq LPU Engine**: High-speed inference via `llama-3.3-70b-versatile` delivering structured administrative findings in under 400ms.

### E. Rural Village Intelligence (`/rural-intelligence`, `/village-explorer`)
- **Focus**: Evaluates rural development distribution across gram panchayats and blocks.
- **Provenance Box**: Explicitly warns when raw central datasets lack 6-digit LGD Census Village Codes, preventing spatial hallucination.

### F. Contractor & Vendor Transparency (`/contractors`, `/vendors`)
- **Source of Truth**: All listed vendors come directly from the `Vendor Name` column of official expenditure records.
- **No Fictional Entities**: Fictitious contractors or private phone numbers are strictly prohibited.

---

## 5. Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend Framework** | React 19, TypeScript, Vite 8, React Router v7 |
| **Styling & UI** | Vanilla Tailwind CSS v4, Lucide Icons, Glassmorphic UI |
| **Geospatial Mapping** | Leaflet, OpenStreetMap Tiles, Custom SVG Map |
| **High-Speed AI Inference** | Groq LPU API (`llama-3.3-70b-versatile`) |
| **Voiceover Engine** | ElevenLabs Text-to-Speech API (`eleven_turbo_v2`) |
| **Backend Framework** | FastAPI, Uvicorn, Python 3.13, Pydantic v2 |
| **Data Engine** | Pandas, NumPy, Scikit-learn, Scipy, OpenCV |
| **Database Schema** | PostgreSQL / PostGIS DDL (with in-memory DatasetAdapter) |

---

## 6. Directory Structure

```
MPLADS/
├── Dataset/                                 # Authoritative MoSPI & data.gov.in CSV exports
│   ├── Allocated Limit for Honble MPs.csv
│   ├── Allocated Limit for Honble MPs RajyaSabha (1).csv
│   ├── Amount consented for Calamity.csv
│   ├── Amount consented for Calamity (1) RJ.csv
│   ├── Works Completed.csv
│   ├── Works Completed (1).csv
│   ├── Expenditure on Completed and On-going Works as on Date.csv
│   └── Expenditure on Completed and On-going Works as on Date (1).csv
├── backend/                                 # FastAPI Python Backend
│   ├── adapters/                            # DatasetAdapter (Single Source of Truth Transformer)
│   ├── app/
│   │   ├── main.py                          # FastAPI application entrypoint
│   │   ├── config.py                        # CORS & environment setup
│   │   ├── engines/                         # RiskLens & statutory audit analytics
│   │   └── routers/                         # projects.py, national_data.py, intelligence.py
│   ├── database/                            # PostgreSQL / PostGIS DDL schemas
│   │   ├── schema.sql
│   │   └── national_pipeline_schema.sql
│   └── requirements.txt                     # Backend dependencies
├── src/                                     # React + TypeScript Frontend
│   ├── components/                          # GovernmentHeader, IndiaProjectMap, InvestigationModal, etc.
│   │   ├── demo/                            # MasterWorkflowDemoModal (12-step evaluator flow)
│   │   ├── national/                        # National pipeline coverage and quality tables
│   │   ├── opportunities/                   # Procurement and tender explorer
│   │   └── rural/                           # VillageIntelligenceDrawer and Village explorer
│   ├── data/                                # Parsed datasets & canonical models
│   │   ├── mpsData.ts                       # 776 MPs from official allocation CSVs
│   │   ├── mockData.ts                      # Project models with "Data Not Available" compliance
│   │   └── ruralVillageData.ts              # Village models with MoSPI provenance disclaimers
│   ├── pages/                               # Application pages & route components
│   └── services/                            # Groq AI, ElevenLabs, & backend API services
├── .env                                     # Root environment variables
├── package.json                             # Node dependencies & npm scripts
├── vite.config.ts                           # Vite build & /api reverse proxy configuration
└── README.md                                # Platform Documentation & Dataset Policy
```

---

## 7. Quickstart Guide

### Prerequisites
- **Node.js**: v18+ (v20+ recommended)
- **Python**: v3.11+ (v3.13 tested)
- **npm** or **pnpm**
- **uv** (recommended for rapid package resolution)

---

### Step 1: Environment Variables Setup
In the project root, create or verify `.env`:
```env
VITE_GROQ_API_KEY=your_groq_api_key_here
VITE_ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
GROQ_API_KEY=your_groq_api_key_here
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
```

In `backend/.env`:
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/mplads_db
HOST=0.0.0.0
PORT=8000
ENVIRONMENT=development
CORS_ORIGINS=http://localhost:3000,http://localhost:5173,http://localhost:5174
GROQ_API_KEY=your_groq_api_key_here
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
```

---

### Step 2: Install Backend Dependencies
Using `uv` inside the repository:
```bash
# Create and activate virtual environment
python -m venv .venv
.venv\Scripts\activate

# Install dependencies
.venv\Scripts\uv.exe pip install -r backend/requirements.txt
```

---

### Step 3: Install Frontend Dependencies
```bash
npm install
```

---

### Step 4: Run the Application

#### Option A: Start Both Frontend and Backend

**Terminal 1 — FastAPI Backend**:
```bash
.venv\Scripts\python.exe -m uvicorn main:app --app-dir backend/app --host 127.0.0.1 --port 8000 --reload
```
*Backend runs on:* `http://127.0.0.1:8000` (`/docs` for Swagger UI, `/health` for healthcheck).

**Terminal 2 — Vite Frontend**:
```bash
npm run dev
```
*Frontend runs on:* `http://localhost:5173` (with automated `/api` reverse proxy to the FastAPI backend).

---

### Step 5: Build for Production
```bash
npm run build
```
Executes TypeScript type-checks (`tsc -b`) and bundles production assets into `dist/`.

---

## 8. 12-Step Evaluator Master Workflow

The platform provides a guided 12-stage interactive walkthrough for evaluation:
1. **Executive Dashboard**: Review total national allocation, sanctioned amounts, and expenditure milestones.
2. **Digital Interactive Map**: Visual state-level distribution and concentration of funds.
3. **State Selection**: Filter records by state (e.g. Maharashtra, Uttar Pradesh, Bihar).
4. **District Authority**: Inspect Implementing District Authority (IDA) offices.
5. **Block/Constituency**: Filter works by parliamentary constituency.
6. **Village Explorer**: Inspect rural asset distribution and check for missing Census LGD codes.
7. **Complete Project History**: View actual work descriptions and disbursements.
8. **Delay & Low-Count Flagging**: Highlight works with multi-year milestone gaps.
9. **AI Risk Indicators**: View AI-derived risk scores clearly labeled as `"AI Risk Indicator"`.
10. **Vendor & Implementing Entity**: Inspect official vendor records from the expenditure ledger.
11. **Procurement Status Check**: Observe the strict `"Data Not Available"` label when tender details are unrecorded.
12. **Statutory AI Audit**: Trigger Groq LLaMA-3.3-70B forensic audit with optional ElevenLabs voice readout.

---

## 9. Statutory Compliance & Attribution

- **Authority**: Ministry of Statistics and Programme Implementation (MoSPI), Government of India.
- **Dataset License**: Government Open Data License - India (GODL-India).
- **Core Directive**:
  $$\text{DATASET} \longrightarrow \text{APPLICATION}$$
  $$\text{DATASET} \longrightarrow \text{AI ANALYSIS} \longrightarrow \text{INSIGHTS}$$
- **Data Guarantee**: Any attribute not recorded in the official dataset renders `"Data Not Available"`. No synthetic or assumed data is ever substituted.