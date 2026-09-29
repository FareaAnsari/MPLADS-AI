# MPLADS-AI: Smart India Hackathon 2026 Live Demo Guide & Master Presenter Script

**Problem Statement:** SIH26102 — Development of an AI-powered system to detect anomalies, fraud, and inefficiencies in MPLAD Scheme implementation  
**Nodal Ministry:** Ministry of Statistics and Programme Implementation (MoSPI)  
**Target Pitch / Video Duration:** 5 Minutes 30 Seconds (Max 6:00)  
**Live Production URL:** `https://mplads-ai-eight.vercel.app/`  
**Local Development URL:** `http://localhost:5174/`

---

## 1. Executive Verification Matrix (Live Route & Capability Audit)

| Component / Feature | Implementation Status | Live Route & Verified Control | What It Does |
| :--- | :--- | :--- | :--- |
| **National Executive Command Dashboard** | ✅ Fully Working | Route: `/` (`DashboardPage.tsx`) | 7 KPI stat cards, Interactive 543 Parliamentary Constituency GIS Map, Fund Utilization velocity gauge, Project Lifecycle stages. |
| **Data Trust & Cryptographic Provenance** | ✅ Fully Working | Component: `DataTrustPanel.tsx` | Real-time e-SAKSHI data ingestion status, SHA-256 integrity hash verification, Tier-1 judicial data lineage. |
| **AI Forensic & Anomaly Command Centre** | ✅ Fully Working | Route: `/ai-insights` (`AIInsightsPage.tsx`) | 4 anomaly filters: Payment-Progress Disparities, Material Rate Outliers vs DSR, Suspected Duplicates, Contractor Saturation. |
| **Interactive Procurement Network Graph** | ✅ Fully Working | Route: `/ai-insights` | Relational graph linking Elected MPs $\rightarrow$ Recommended Works $\rightarrow$ Disbursing Authority $\rightarrow$ Contractors $\rightarrow$ Verified Vendors. |
| **5-Factor Additive Explainable Risk Engine** | ✅ Fully Working | Backend & Client Engine | Decomposes risk score (0-100) into: Cost Z-Score (25%), Delay (25%), Payment Pattern (25%), Spatial Density (15%), Evidence (10%). |
| **Deep Investigation Workspace** | ✅ Fully Working | Component: `InvestigationModal.tsx` | 4 tabs: Overview (Risk Deconstruction), Evidence Provenance (Vouchers/Milestones), What-If Simulator, Officer Action. |
| **Counterfactual What-If Simulator** | ✅ Fully Working | Component: `InvestigationModal.tsx` | Dynamic live recalculation: toggling geo-tagged photo or invoice submission instantly drops simulated risk score from 78.5 to 39.0. |
| **Statutory Decision Support Portal** | ✅ Fully Working | Route: `/decision-support` | Role-based portal for MP, District Collector (IDA), State Authority (SNA), MoSPI Central Command with 4 compliance tabs. |
| **75-Day Sanction Overdue Tracker** | ✅ Fully Working | Route: `/decision-support?tab=delays` | Tracks statutory 75-day administrative sanction limit following MP recommendation, highlighting district bottlenecks. |
| **SC / ST Statutory Quota Engine** | ✅ Fully Working | Route: `/decision-support?tab=quotas` | Audits mandatory 15% SC (₹75 L/yr) and 7.5% ST (₹37.5 L/yr) spatial allocations, alerting authorities to quota deficits. |
| **Project Splitting & Negative List Engine** | ✅ Fully Working | Route: `/decision-support?tab=splitting` | Spatial DBSCAN clustering detects artificial work fragmentation; flags Annexure-II prohibited works (religious/commercial). |
| **Ask MPLAD AI Conversational Assistant** | ✅ Fully Working | Global Floating Launcher (<kbd>⌘I</kbd>) / `/ask-mplad` | Natural language intelligence across 30,002+ records with structured KPIs, verified tables, Tier-1 citations, and CSV export. |
| **Official Multilingual Support** | ✅ Fully Working | Top Header Language Selector | Seamless real-time toggle across English, हिन्दी (Hindi), and Hinglish with responsive font-scaling (A-, A, A+). |
| **Automated Audit & Compendium Reports** | ✅ Fully Working | Route: `/reports` | Generates Weekly Anomaly Audits, District Scrutiny Compendiums, and downloadable executive vigilance dossiers. |

---

## 2. High-Level Presentation Flow (5:30 Total)

```
00:00 ─── 00:30 (30s) │ Scene 1: The Core Governance Challenge
00:30 ─── 01:05 (35s) │ Scene 2: Solution Overview & National Data Trust
01:05 ─── 01:45 (40s) │ Scene 3: National Executive Command Dashboard
01:45 ─── 02:45 (60s) │ Scene 4: AI Forensic Intelligence & Anomaly Engine
02:45 ─── 03:45 (60s) │ Scene 5: Deep Project Investigation & What-If Simulator
03:45 ─── 04:30 (45s) │ Scene 6: Statutory Decision Support & 75-Day Tracker
04:30 ─── 05:05 (35s) │ Scene 7: Ask MPLAD Natural Language Intelligence & Export
05:05 ─── 05:30 (25s) │ Scene 8: Impact, SIH26102 Mapping & Final Closing
```

---

## 3. Screen-by-Screen Operator Action & Spoken Presenter Script

### Scene 1 — The Core Governance Challenge (00:00 – 00:30)
* **Screen:** Home Page (`/`)
* **Visual Focus:** Government Header with Ashoka Lion Emblem, e-SAKSHI Data Trust badge, Official Initiative Logos.
* **Operator Action:** Do not click yet. Move the mouse cursor smoothly across the national banner.

> **Presenter Narration (Spoken Words):**  
> "Every year, the Members of Parliament Local Area Development Scheme generates thousands of project recommendations, sanction approvals, and financial disbursements across 543 parliamentary constituencies.  
> The core challenge for MoSPI and District Authorities is not simply storing this data. The challenge is identifying which works actually deserve administrative attention.  
> Manual auditing cannot continuously spot payment-progress mismatches, material price escalations, or artificial project splitting across thousands of active works.  
> Our solution, **MPLADS-AI**, introduces an explainable AI and analytical intelligence layer that converts raw government data into prioritized, evidence-backed risk indicators."

---

### Scene 2 — Solution Overview & Data Trust (00:30 – 01:05)
* **Screen:** Top of Dashboard (`/`)
* **Visual Focus:** Data Trust & Provenance Banner (`DataTrustPanel.tsx`) showing Tier-1 Official MoSPI Data, SHA-256 integrity hash, and 38,416 works monitored.
* **Operator Action:** Hover the cursor over the blue **"Tier 1 Verified"** badge on the Data Trust banner.

> **Presenter Narration (Spoken Words):**  
> "Instead of treating every project identically, MPLADS-AI continuously monitors the entire portfolio from the moment an MP recommends a work to its final asset handover.  
> Right at the top, our Data Trust framework establishes complete provenance. Every single record is ingested directly from the official e-SAKSHI data structure and public expenditure registries.  
> We do not guess or fabricate numbers. Every analytical finding links back to a verifiable source record."

---

### Scene 3 — National Executive Command Dashboard (01:05 – 01:45)
* **Screen:** Dashboard Middle (`/`)
* **Visual Focus:** 7 Top KPI Cards (Total Works: 38,416, Works Sanctioned: ₹4,466 Cr, High-Risk Indicators: 327), India GIS Map, and Fund Utilization gauge.
* **Operator Action:** Scroll down smoothly to reveal the 7 KPI cards, then hover over **"High-Risk Projects (327)"** and hover over Maharashtra on the India Project Map.

> **Presenter Narration (Spoken Words):**  
> "On the main executive command dashboard, senior authorities receive an instant macroeconomic overview.  
> Out of over 38,000 monitored works, our engine automatically surfaces 327 cases exhibiting potential risk indicators requiring verification.  
> The geospatial map visualizes district-level execution density, while the fund utilization widget tracks expenditure velocity against parliamentary sanctions.  
> But our platform does not stop at high-level charts. Let us examine how the AI identifies anomalies."

---

### Scene 4 — AI Forensic Intelligence & Anomaly Engine (01:45 – 02:45)
* **Screen:** Navigate to `/ai-insights`
* **Visual Focus:** Forensic Summary Cards, Anomaly Filter Tabs, Severity Badges, and Contractor-Vendor Procurement Network Graph.
* **Operator Action:**
  1. Click on the **"Reports & Analytics"** dropdown in the top navbar $\rightarrow$ Click **"AI Anomaly Engine"** (or open `/ai-insights`).
  2. Click the filter tab: **"Payment-Progress Disparities"**.
  3. Scroll down to the **Contractor – Vendor Procurement Network Graph** and click on node **"WS/MP418/2024-2025/133409"**.

> **Presenter Narration (Spoken Words):**  
> "Here in the AI Insights and Forensic Command Centre, our multi-layered detection engine analyzes projects across four core vectors: payment-progress mismatches, material price outliers compared against CPWD Schedule of Rates, duplicate proposal clustering, and contractor workload saturation.  
> Below the active alerts, our interactive procurement network graph exposes multi-project relationship clusters—tracing links between elected MPs, executing agencies, payment accounts, and verified public vendors.  
> Notice that the system never makes black-box assertions of fraud. Instead, it assigns a confidence-weighted risk score and highlights the exact primary evidence.  
> Let us click 'Investigate Case' on this flagged project in Araria, Bihar."

---

### Scene 5 — Deep Project Investigation & What-If Simulator (02:45 – 03:45)
* **Screen:** Modal popup `InvestigationModal` (triggered by clicking **"Investigate Case"** on `WS/MP418/2024-2025/133409`)
* **Visual Focus:** 5-Factor Risk Breakdown (Cost, Delay, Payment Pattern, Spatial Signal, Evidence Issue), Tabs: Overview, Evidence Provenance, What-If Simulation, Officer Action.
* **Operator Action:**
  1. Click **"Investigate Case"** on `WS/MP418/2024-2025/133409`.
  2. Point cursor to the **Component Breakdown** bar chart.
  3. Click the **"What-If Simulation"** tab.
  4. Toggle the checkbox: **"Supply Geo-tagged Physical Progress Milestone Photo"** $\rightarrow$ Watch the simulated risk score drop from **78.5 down to 39.0**.
  5. Click the **"Officer Action"** tab $\rightarrow$ Click **"Request Explanatory Memo from Implementing Agency"**.
  6. Click the **"X"** button to close the modal.

> **Presenter Narration (Spoken Words):**  
> "When an investigating officer opens a case, the platform presents full explainability.  
> The overall risk score of 78.5 is decomposed into five additive components: budget variance, execution delay against peer cohorts, fiscal rush payment patterns, spatial risk density, and missing evidentiary milestones.  
> Next, under the 'What-If Simulation' tab, we empower the officer to run counterfactual analysis. If the executing agency submits a verified geo-tagged milestone photograph and reconciles the invoice, the risk indicator dynamically drops from high to low.  
> Under 'Officer Action', the authority can log an official inspection directive, attach notes, and generate a formal Vigilance Inquiry Notice directly within the system."

---

### Scene 6 — Statutory Decision Support & 75-Day Tracker (03:45 – 04:30)
* **Screen:** Navigate to `/decision-support`
* **Visual Focus:** Administrative Role switcher (Hon'ble MP, District Authority / Collector, State Nodal Authority, MoSPI Central Command), 75-Day Sanction Overdue Tracker tab, and SC/ST Statutory Quota Tracker.
* **Operator Action:**
  1. Click **"Decision Support"** in the main navigation bar.
  2. Click the tab: **"75-Day Sanction Overdue Tracker"** (`/decision-support?tab=delays`).
  3. Click the tab: **"Statutory SC/ST Quotas (15%/7.5%)"** (`/decision-support?tab=quotas`).

> **Presenter Narration (Spoken Words):**  
> "Under the Revised MPLADS 2023 Guidelines, statutory compliance is mandatory. Our Decision Support portal tailors intelligence to each administrative tier.  
> In the District Collector view, the 75-Day Sanction Overdue Tracker automatically flags works where administrative approval has stalled past the statutory deadline following an MP's recommendation.  
> Similarly, the SC/ST Quota Tracker monitors the statutory mandate requiring at least 15% of MPLADS expenditure in Scheduled Caste areas and 7.5% in Scheduled Tribe areas, instantly alerting nodal authorities to allocation deficits."

---

### Scene 7 — Ask MPLAD Natural Language Intelligence & Export (04:30 – 05:05)
* **Screen:** Universal Chat Drawer (`UniversalChatDrawer.tsx`)
* **Visual Focus:** Floating Ask MPLAD (<kbd>⌘I</kbd>) launcher, structured AI answer, verified KPIs, interactive project results table, provenance citations, and CSV export.
* **Operator Action:**
  1. Click the floating **"Ask MPLAD"** button at the bottom-right (or press <kbd>⌘I</kbd>).
  2. In the input box, type: `Show delayed projects in Maharashtra` (or `What is the 75-day sanction rule?`).
  3. Press <kbd>Enter</kbd>.
  4. Once the response loads, point cursor to the generated KPI cards and the project table.
  5. Click the **"Export CSV"** button inside the chat response to trigger the file download.
  6. Click the **"X"** button on the drawer header to close.

> **Presenter Narration (Spoken Words):**  
> "To ensure that monitoring is accessible without digging through complex databases, we built Ask MPLAD—our natural language intelligence assistant.  
> Let us ask: 'Show delayed projects in Maharashtra'.  
> Rather than performing simple keyword matching, Ask MPLAD interprets the statutory intent, filters records across state and progress stages, calculates delay metrics, and returns structured KPIs alongside the complete project table.  
> Every response includes official data provenance, and the investigating officer can export the verified dataset with a single click."

---

### Scene 8 — Impact, SIH26102 Alignment & Final Closing (05:05 – 05:30)
* **Screen:** Return to the Main Dashboard (`/`) or show Reports Repository (`/reports`)
* **Visual Focus:** Clean view of the Dashboard / Statutory Reports table.
* **Operator Action:** Click the amber **"Home"** button on the top left navigation bar. Rest cursor smoothly at center screen.

> **Presenter Narration (Spoken Words):**  
> "MPLADS-AI does not replace human verification; it empowers officers to know exactly where to look first.  
> From automated anomaly detection and multi-factor explainability to field evidence verification and natural language analytics, we provide an end-to-end governance intelligence platform built directly for MoSPI's mandate.  
> That is how MPLADS-AI delivers transparency, accountability, and speed to national public infrastructure. Thank you."

---

## 4. Technical vs Non-Technical Explanations (For Judges)

### For Technical Judges (AI/ML & Architecture)
* **Multi-Factor Explainable Risk Engine:** Instead of opaque deep learning, we implement an **additive 5-factor model** calibrated with domain weights:
  $$\text{Risk Score} = 0.25 \cdot Z_{\text{Cost}} + 0.25 \cdot D_{\text{Delay}} + 0.25 \cdot P_{\text{Payment}} + 0.15 \cdot S_{\text{Spatial}} + 0.10 \cdot E_{\text{Evidence}}$$
* **Unsupervised Anomaly Detection:** An auxiliary **Isolation Forest** ($n_{\text{estimators}}=100$) detects multi-dimensional outliers across disbursement velocity, contractor concurrency, and geographic density.
* **NLP & Semantic RAG Engine:** Ask MPLAD utilizes typed schema parsing, entity extraction (MP aliases, constituency codes, work IDs), and cosine similarity matching over the MoSPI 2023 Guidelines corpus to enforce zero-hallucination, Tier-1 grounded answers.
* **Spatial DBSCAN Clustering:** Automatically detects project splitting by grouping works recommended within a 500-meter radius and 14-day temporal window awarded to co-occurring entities.

### For Non-Technical & Administrative Judges (Policy & Impact)
* **Prevents Waste & Corruption:** Stops payments from racing ahead of actual physical construction on the ground.
* **Protects Government Rates:** Flags contractors overcharging for basic materials (like cement and steel) above the official District Schedule of Rates (DSR).
* **Guarantees Statutory Compliance:** Ensures every MP fulfills the mandatory 15% SC and 7.5% ST quotas, and ensures District Collectors sanction works within the statutory 75 days.
* **Instant Citizen & Officer Empowerment:** Anyone can ask plain-language questions and get instant, citable data without submitting RTIs or browsing complex spreadsheets.

---

## 5. SIH26102 Problem Statement to Feature Mapping Matrix

| SIH26102 Requirement | Implemented Feature in MPLADS-AI | Verified Screen & Control | Why It Matters for MoSPI |
| :--- | :--- | :--- | :--- |
| **1. Unusual Expenditure & Fund Utilization Issues** | Statistical Z-score cost variance & March fiscal rush velocity tracking | Dashboard (`/`) Fund Utilization Gauge & AI Insights (`/ai-insights`) | Prevents unspent fund parking and unnatural end-of-fiscal-year payment bursts. |
| **2. Cost Overruns & Material Rate Deviations** | Rate Benchmark Engine matching reported invoice unit rates against CPWD / State DSR | Decision Support (`/decision-support?tab=overruns`) & Investigation Modal | Eliminates inflated billing on essential infrastructure materials (cement, TMT steel, gravel). |
| **3. Duplicate Works & Geographic Overlap** | DPR Semantic Similarity & GIS Proximity Triangulation | AI Insights (`/ai-insights`) Suspected Duplicates Filter | Prevents funding duplicate roads or community halls on identical physical plots across adjacent tenures. |
| **4. Delayed Projects & Sanction Bottlenecks** | 75-Day Statutory Sanction Overdue Tracker & Duration Milestone Estimator | Decision Support (`/decision-support?tab=delays`) | Holds District Authorities accountable to the statutory 75-day approval deadline under Section 3.11. |
| **5. Potential Fraud Indicators & Vendor Collusion** | Contractor-Vendor Relational Network Graph & Entity Resolution Engine | AI Insights (`/ai-insights`) Procurement Network Graph | Exposes shell companies, contractor monopolies, and circular sub-contracting cartels. |
| **6. Non-Compliance with Scheme Norms** | Statutory SC/ST Quota Tracker (15% SC / 7.5% ST) & Prohibited Works Filter | Decision Support (`/decision-support?tab=quotas` & `tab=splitting`) | Enforces inclusive development mandates and stops illegal funding for commercial or religious structures. |
| **7. Decision Support & Early Warning** | Multi-Tier Role Governance (MP, Collector, State, MoSPI) & Formal Vigilance Notice Generator | Decision Support (`/decision-support`) & Investigation Modal (`Officer Action`) | Transforms passive auditing into active administrative intervention with automated legal notices. |
| **8. Natural Language Analytical Intelligence** | Ask MPLAD Multi-Agent Conversational Intelligence with Tier-1 Citations | Universal Chat Drawer (`UniversalChatDrawer.tsx`) | Allows Parliamentarians, Collectors, and Citizens to query 38,000+ works in natural language with instant CSV exports. |
