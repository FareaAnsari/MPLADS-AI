# MPLADS AI Platform: Dataset Reality Check & Provenance Strategy Document

## 1. Executive Data Audit

This document defines the statutory data strategy, provenance taxonomy, and gap-mitigation methodology for the **MPLADS AI MPLADS AI Intelligence Platform (Web & Mobile)**.

### 1.1 SIH-Provided & Official Base Dataset Audit
- **Primary Source**: eSAKSHI Official Public Export & data.gov.in MPLADS Registry.
- **Indexed Record Count**: 30,002 project records spanning Lok Sabha and Rajya Sabha constituencies across India.
- **Attributes Included in Base Dataset**:
  - `work_id`: Unique statutory identifier (e.g. `MPLADS-2024-0001`, `HERO-MPLADS-2024-001`).
  - `work_title`: Project description and infrastructure scope.
  - `work_category`: Standardized category (Education, Roads & Pathways, Drinking Water, Health & Sanitation, Renewable Energy, Community Infrastructure).
  - `state` & `constituency` / `district`: Administrative territorial boundaries.
  - `sanctioned_amount_inr` & `disbursed_amount_inr`: Financial allocations.
  - `sanction_date` & `completion_date`: Statutory milestone timestamps.
  - `current_stage`: Workflow lifecycle stage (`RECOMMENDED`, `SANCTIONED`, `IN_PROGRESS`, `COMPLETION_REPORTED`, `UTILIZATION_CERTIFIED`).
  - `latitude` & `longitude`: Geocoded district and project centerlines.

### 1.2 Identified Dataset Gaps & Remediation Sources
| Gap Area | Official SIH Limitation | Remediation Source | Integration Status |
|---|---|---|---|
| **Rural Development Overlaps** | SIH export lacks cross-scheme identifiers for PMGSY / MGNREGA | **PMGSY OMMAS GIS MIS (omms.nic.in)** and **MGNREGA Public Asset Register (nrega.nic.in)** | **Tier 2 Curated Reference Dataset** (Geo-proximity matched within 500m) |
| **Material Rate Contracts** | No line-item contractor invoices in aggregate eSAKSHI data | **CPWD Delhi Schedule of Rates (DSR)** and **GeM Baseline Rate Contracts** | **Tier 1 Statutory Baseline** (Timestamped Sept 2026) |
| **Vendor Corporate Cross-Links** | MCA21 and GSTN do not provide open unauthenticated bulk APIs | **GSTN 15-character statutory algorithm** & internal fuzzy PAN/name resolution | **Tier 1 Verified Format + Tier 2 Internal Graph** |
| **Grievance Redressal** | CPGRAMS does not offer real-time streaming public APIs | **MoPGI CPGRAMS Official Schema** + periodic RTI batches | **Tier 2 Schema-Ready Ingestion** |
| **Election Calendars** | Election dates are published as Gazette press notes, not APIs | **Election Commission of India (ECI Gazette Archive)** | **Tier 1 Maintained Registry** |
| **Satellite Imagery** | High-cadence commercial optical satellite imagery is paid | **ISRO Bhuvan Open WMS** & **Copernicus Sentinel-2 Optical Bands** | **Tier 1 Open Tile Proxies + Spectral NDVI Engine** |

### 1.3 Known Geospatial Resolution & Coordinate Precision Limitation
- **Source Artifact in Official Dataset**: The raw eSAKSHI public export (`Works Completed.csv`) does **not** include granular physical plot GPS coordinates; it only provides administrative territorial fields: `State`, `Constituency`, and `IDA` (Implementing District Authority, e.g., *District Collector Nizamabad_IDA*).
- **Centroid Resolution Architecture**: The platform derives spatial coordinates via deterministic IDA-level centroid mapping (`DatasetAdapter.get_centroid`), resulting in **594 distinct coordinate clusters** representing district administrative headquarters across the 30,002 national records.
- **Impact on Geo-Proximity Matching**:
  - All projects belonging to the same IDA share the identical administrative centroid (e.g., all 442 works in Nizamabad, Telangana share `18.2124, 78.9993`; 297 works in Yadadri Bhuvanagiri share `18.1084, 79.1033`).
  - When a cross-scheme reference asset is positioned within 500m of an IDA centroid, it algorithmically matches all works administered by that IDA office.
  - **Statutory Interpretation**: These matches represent **administrative/jurisdictional co-location** under the same district authority, **not 442 individually verified physical plot overlaps**. As highlighted in the platform's `transparency_notice`, algorithmic proximity flags serve as a preliminary filter and require physical site ground-truthing by the District Collectorate before taking administrative action.

---

## 2. Three-Tier Data Provenance System

Every record and API response in the platform attaches a mandatory `provenance_tier` metadata attribute:

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
│               │ API access is restricted or unauthenticated open APIs  │
│               │ are unavailable:                                       │
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

## 3. Platform-Wide Tier Mapping Matrix

| Feature Module | Data Points Used | Provenance Tier | Transparency Citation Label in UI |
|---|---|---|---|
| **AI Risk Score Engine** | Project budget, timeline, location, category | **Tier 1** | *Source: eSAKSHI Official Public Export (30,002 Records)* |
| **Stage SLA Tracker** | 5-stage milestone duration vs statutory SLA | **Tier 1 / Tier 2** | *Statutory benchmark: MoSPI 2023 Guidelines* |
| **pHash Duplicate Photo** | Perceptual hash of site evidence photos | **Tier 3 (Demo Pairs)** | *Synthetic Demonstration Pairs for Forensic Verification* |
| **Cross-Scheme Double Dipping** | PMGSY road coordinates & MGNREGA assets | **Tier 2** | *Compared against: Curated reference registry of PMGSY & MGNREGA* |
| **DSR Rate Benchmarking** | CPWD standard cost per sq. metre & unit caps | **Tier 1** | *Source: CPWD Delhi Schedule of Rates (DSR 2026)* |
| **Entity Resolution** | 15-char GSTIN structure & PAN extraction | **Tier 1 / Tier 2** | *Verified format: GSTN Specification · Internal Registry Match* |
| **Citizen Grievance NLP** | Grievance topic, unresolved days, sentiment | **Tier 2** | *Schema: MoPGI CPGRAMS · Batched RTI & Citizen Submissions* |
| **Election Velocity** | ECI assembly/general election calendars | **Tier 1** | *Source: Election Commission of India Gazette Press Releases* |
| **Satellite Decay Monitor** | 6/12/24-month Sentinel-2 spectral persistence| **Tier 1** | *Source: Copernicus Sentinel-2 / ISRO Bhuvan Open Layers* |
| **Contractor Portal** | Sanctions, payment tranches, MP-grouped works | **Tier 1 / Tier 2** | *Filtered from Official Project Registry & SNA Ledger* |
| **Citizen Progress Reports**| Plain-language narrative & verified milestones| **Tier 1** | *Derived from Single-Source-of-Truth Project Milestones* |

---

## 4. Single-Source-of-Truth & Role Separation Rules

1. **Zero Data Discrepancy**: Citizen, Contractor, MP, and Officer portals consume the exact same underlying database records.
2. **Access Control Filtering**:
   - **Citizens**: Plain-language narrative progress report, milestone photo timeline, physical % completion. No internal risk score (0-100), no internal officer notes.
   - **Contractors**: Only projects contracted to their registered Vendor ID/GSTIN, grouped by sponsoring MP. Detailed funds received/pending, delay explanations from the SLA engine. No other contractors' data, no internal AI risk scores.
   - **MPs**: Sponsoring constituency projects, utilization certificates, pre-election velocity metrics.
   - **District & State Officers**: Full forensic intelligence command center (Risk scores, pHash evidence inspection, cross-scheme overlaps, shell-entity cluster graphs).
