# MPLADS-AI: Smart India Hackathon 2026 Live Demo Plan & Presenter Script

**SIH Problem Statement:** SIH26102 — Development of an AI-powered system to detect anomalies, fraud, and inefficiencies in MPLAD Scheme implementation  
**Nodal Ministry:** Ministry of Statistics and Programme Implementation (MoSPI)  
**Target Video / Pitch Duration:** 5 Minutes 30 Seconds (Max 6:00)  
**Live Production URL:** [mplads-ai-pratyaksh.vercel.app](https://mplads-ai-pratyaksh.vercel.app)

---

## 1. Executive Summary & Verification Matrix

This demo script is grounded exclusively in verified capabilities present within the production build.

| Component / Feature | Implementation Status | Verified Live Route / UI Control |
|---|---|---|
| **Executive National Dashboard** | ✅ **Fully Working** | Route: `/` (`DashboardPage.tsx`, 7 KPI stat cards, India GIS mesh map, Fund utilization gauge, project lifecycle timeline) |
| **Data Trust & Provenance Banner** | ✅ **Fully Working** | Component: `DataTrustPanel.tsx` (MoSPI e-SAKSHI data sync, SHA-256 integrity hash, Tier-1 lineage) |
| **AI Risk & Forensic Command Centre** | ✅ **Fully Working** | Route: `/ai-insights` (`AIInsightsPage.tsx`, filter categories: Mismatches, Material rates, Duplicates, Contractor trajectory) |
| **Additive Risk Engine (5-Factor + IsoForest)** | ✅ **Fully Working** | Engine: `risk_engine.py` (Cost Z-Score 25%, Delay 25%, Payment Pattern 25%, Spatial Density 15%, Evidence Issue 10%) |
| **Deep Project Investigation Modal** | ✅ **Fully Working** | Component: `InvestigationModal.tsx` (`Overview`, `Evidence Provenance`, `What-If Simulation`, `Officer Action Report`) |
| **Counterfactual What-If Simulator** | ✅ **Fully Working** | Component: `InvestigationModal.tsx` (Dynamic recalculation when physical geo-photos or invoices are supplied) |
| **Contractor-Vendor Network Graph** | ✅ **Fully Working** | Component: `AIInsightsPage.tsx` (MP $\rightarrow$ Project $\rightarrow$ Disbursement Entity $\rightarrow$ Verified Public Vendor) |
| **Statutory Decision Support Portal** | ✅ **Fully Working** | Route: `/decision-support` (Role Switcher: MP / District / State / Ministry; Tabs: Overruns, 75-Day Delays, SC/ST Quotas, Negative List) |
| **Ask MPLAD AI Assistant (Drawer)** | ✅ **Fully Working** | Trigger: Floating `Ask MPLAD (⌘I)` button / Drawer (`UniversalChatDrawer.tsx`, structured KPI response, table, CSV export) |
| **Multilingual UI Support** | ✅ **Fully Working** | Header dropdown: English, हिन्दी (Hi), Hinglish (`LanguageContext.tsx`) |
| **Audit & Statutory Reports Export** | ✅ **Fully Working** | Route: `/reports` (`ReportsPage.tsx`, Weekly Automated Anomaly Audit, District Scrutiny Compendium, print/export) |

---

## 2. High-Level Time Allocation (Total: 05:30)

```
00:00 ─── 00:30 (30s) │ Scene 1: The Core Governance Challenge
00:30 ─── 01:05 (35s) │ Scene 2: Solution Overview & National Data Trust
01:05 ─── 01:45 (40s) │ Scene 3: National Executive Command Dashboard
01:45 ─── 02:45 (60s) │ Scene 4: AI Forensic Intelligence & Anomaly Engine
02:45 ─── 03:45 (60s) │ Scene 5: Deep Project Investigation & What-If Simulator
03:45 ─── 04:30 (45s) │ Scene 6: Statutory Decision Support & 75-Day Tracker
04:30 ─── 05:05 (35s) │ Scene 7: Ask MPLAD Natural Language Intelligence & Export
05:05 ─── 05:30 (25s) │ Scene 8: Impact, SIH26102 Mapping & 30s Closing
```

---

## 3. Screen-by-Screen Presenter Narration Script

### Scene 1 — The Core Governance Challenge (00:00 – 00:30)
* **Screen:** Browser on `http://localhost:5173/` or `https://mplads-ai-pratyaksh.vercel.app/`
* **Visual Focus:** Government Header with Ashoka Lion Emblem, e-SAKSHI Data Trust badge.
* **Click / Action:** No click yet. Move cursor smoothly over the banner.

> **Presenter Narration:**  
> "Every year, the Members of Parliament Local Area Development Scheme generates thousands of project recommendations, sanction approvals, and financial disbursements across 543 parliamentary constituencies.  
> The core challenge for MoSPI and District Authorities is not simply storing this data. The challenge is identifying which works actually deserve administrative attention.  
> Manual auditing cannot continuously spot payment-progress mismatches, material price escalations, or artificial project splitting across thousands of active works.  
> Our solution, **MPLADS-AI**, introduces an explainable AI and analytical intelligence layer that converts raw government data into prioritized, evidence-backed risk indicators."

---

### Scene 2 — Solution Overview & Data Trust (00:30 – 01:05)
* **Screen:** Dashboard Top — Data Trust Panel & Hero Banner
* **Visual Focus:** `Data Trust & Provenance Banner` showing `Tier-1 Official MoSPI Data`, cryptographic audit integrity, and 38,416 works monitored.
* **Click / Action:** Hover cursor over the blue `Tier 1 Verified` badge on the Data Trust banner.

> **Presenter Narration:**  
> "Instead of treating every project identically, MPLADS-AI continuously monitors the entire portfolio from the moment an MP recommends a work to its final asset handover.  
> Right at the top, our Data Trust framework establishes complete provenance. Every single record is ingested directly from the official e-SAKSHI data structure and public expenditure registries.  
> We do not guess or fabricate numbers. Every analytical finding links back to a verifiable source record."

---

### Scene 3 — National Executive Command Dashboard (01:05 – 01:45)
* **Screen:** Route `/` (Dashboard KPIs, India Map, and Fund Utilization)
* **Visual Focus:** 7 Top KPI Cards (`Total Works: 38,416`, `Works Sanctioned: ₹4,466 Cr`, `High-Risk Indicators: 327`), India GIS mesh map, and Fund Utilization gauge.
* **Click / Action:** Scroll gently down to reveal the 7 KPI cards, then hover over `High-Risk Projects (327)` and the `India Project Map`.

> **Presenter Narration:**  
> "On the main executive command dashboard, senior authorities receive an instant macroeconomic overview.  
> Out of over 38,000 monitored works, our engine automatically surfaces 327 cases exhibiting potential risk indicators requiring verification.  
> The geospatial map visualizes district-level execution density, while the fund utilization widget tracks expenditure velocity against parliamentary sanctions.  
> But our platform does not stop at high-level charts. Let us examine how the AI identifies anomalies."

---

### Scene 4 — AI Forensic Intelligence & Anomaly Engine (01:45 – 02:45)
* **Screen:** Navigate to `/ai-insights`
* **Visual Focus:** Forensic Summary Cards, Filter Tabs, Anomaly Cards with Severity Badges, and Contractor-Vendor Procurement Network Graph.
* **Click / Action:** 
  1. Click on **"Reports & Analytics"** dropdown in the top navbar $\rightarrow$ Click **"AI Anomaly Engine"** (or click `/ai-insights`).
  2. Click the filter tab **"Payment-Progress Disparities"**.
  3. Scroll to the **Contractor – Vendor Procurement Network Graph** and click on node **"WS/MP418/2024-2025/133409"**.

> **Presenter Narration:**  
> "Here in the AI Insights and Forensic Command Centre, our multi-layered detection engine analyzes projects across four core vectors: payment-progress mismatches, material price outliers compared against CPWD Schedule of Rates, duplicate proposal clustering, and contractor workload saturation.  
> Below the active alerts, our interactive procurement network graph exposes multi-project relationship clusters—tracing links between elected MPs, executing agencies, payment accounts, and verified public vendors.  
> Notice that the system never makes black-box assertions of fraud. Instead, it assigns a confidence-weighted risk score and highlights the exact primary evidence.  
> Let us click 'Investigate Case' on this flagged project in Araria, Bihar."

---

### Scene 5 — Deep Project Investigation & What-If Simulator (02:45 – 03:45)
* **Screen:** Modal popup `InvestigationModal` (Triggered via `Investigate Case` on `WS/MP418/2024-2025/133409`)
* **Visual Focus:** 
  - Risk breakdown (`Cost Anomaly`, `Delay Anomaly`, `Payment Pattern`, `Spatial Signal`, `Evidence Issue`)
  - Sub-tabs: `Overview`, `Evidence Provenance`, `What-If Simulation`, `Officer Action`
* **Click / Action:**
  1. Click **"Investigate Case"** on `WS/MP418/2024-2025/133409`.
  2. Point cursor to the **Component Breakdown** bar chart.
  3. Click the **"What-If Simulation"** tab.
  4. Toggle the checkbox: **"Supply Geo-tagged Physical Progress Milestone Photo"** $\rightarrow$ Watch the simulated risk score drop from 78.5 down to 39.0.
  5. Click the **"Officer Action"** tab $\rightarrow$ Click **"Request Explanatory Memo from Implementing Agency"**.

> **Presenter Narration:**  
> "When an investigating officer opens a case, the platform presents full explainability.  
> The overall risk score of 78.5 is decomposed into five additive components: budget variance, execution delay against peer cohorts, fiscal rush payment patterns, spatial risk density, and missing evidentiary milestones.  
> Next, under the 'What-If Simulation' tab, we empower the officer to run counterfactual analysis. If the executing agency submits a verified geo-tagged milestone photograph and reconciles the invoice, the risk indicator dynamically drops from high to low.  
> Under 'Officer Action', the authority can log an official inspection directive, attach notes, and generate a formal Vigilance Inquiry Notice directly within the system."

---

### Scene 6 — Statutory Decision Support & 75-Day Tracker (03:45 – 04:30)
* **Screen:** Navigate to `/decision-support`
* **Visual Focus:** Administrative Role switcher (Hon'ble MP, District Authority / Collector, State Nodal Authority, MoSPI Central Command), 75-Day Sanction Overdue Tracker tab, and SC/ST Statutory Quota Tracker.
* **Click / Action:**
  1. Click **"Decision Support"** in the top navigation bar.
  2. Click the tab **"75-Day Sanction Overdue Tracker"**.
  3. Click the tab **"Statutory SC/ST Quotas (15%/7.5%)"**.

> **Presenter Narration:**  
> "Under the Revised MPLADS 2023 Guidelines, statutory compliance is mandatory. Our Decision Support portal tailors intelligence to each administrative tier.  
> In the District Collector view, the 75-Day Sanction Overdue Tracker automatically flags works where administrative approval has stalled past the statutory deadline following an MP's recommendation.  
> Similarly, the SC/ST Quota Tracker monitors the statutory mandate requiring at least 15% of MPLADS expenditure in Scheduled Caste areas and 7.5% in Scheduled Tribe areas, instantly alerting nodal authorities to allocation deficits."

---

### Scene 7 — Ask MPLAD Natural Language Intelligence & Export (04:30 – 05:05)
* **Screen:** Universal Chat Drawer (`UniversalChatDrawer.tsx`)
* **Visual Focus:** Floating `Ask MPLAD (⌘I)` launcher, structured AI answer, verified KPIs, interactive project results table, provenance citation, and CSV export.
* **Click / Action:**
  1. Click the floating **"Ask MPLAD"** button in the bottom right corner (or press `⌘+I`).
  2. Type the tested query into the input box:  
     `Show delayed projects in Maharashtra`
  3. Click the **Send** button (or press `Enter`).
  4. Once results load, point cursor to the generated KPI cards and the project table.
  5. Click the **"Export CSV"** button inside the chat response.

> **Presenter Narration:**  
> "To ensure that monitoring is accessible without digging through complex databases, we built **Ask MPLAD**—our natural language intelligence assistant.  
> Let us ask: *'Show delayed projects in Maharashtra'*.  
> Rather than performing simple keyword matching, Ask MPLAD interprets the statutory intent, filters records across state and progress stages, calculates delay metrics, and returns structured KPIs alongside the complete project table.  
> Every response includes official data provenance, and the investigating officer can export the verified dataset with a single click."

---

### Scene 8 — Impact, SIH26102 Alignment & Final Closing (05:05 – 05:30)
* **Screen:** Return to the Main Dashboard (`/`) or show the Reports Repository (`/reports`)
* **Visual Focus:** Clean view of the Dashboard / Statutory Reports table.
* **Click / Action:** Click **"Home"** in the top header. Smoothly center the screen.

> **Presenter Narration:**  
> "MPLADS-AI does not replace human verification; it empowers officers to know exactly where to look first.  
> From automated anomaly detection and multi-factor explainability to field evidence verification and natural language analytics, we provide an end-to-end governance intelligence platform built directly for MoSPI's mandate.  
> That is how MPLADS-AI delivers transparency, accountability, and speed to national public infrastructure. Thank you."

---

## 4. Exact Click-by-Click Demo Guide (Operator Checklist)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       LIVE DEMO OPERATOR CHECKLIST                          │
└─────────────────────────────────────────────────────────────────────────────┘

[00:00] 1. Open Google Chrome in full-screen (Zoom 100%).
        2. Navigate to: https://mplads-ai-pratyaksh.vercel.app/ (or localhost:5173).
        3. Confirm Data Trust Panel reads: "Tier 1 Official MoSPI Data".

[00:30] 4. Hover cursor over the "Tier 1 Verified" badge on the Data Trust Panel.
        5. Scroll smoothly down past the Hero Banner to the KPI Cards row.

[01:05] 6. Pause cursor on "High-Risk Projects (327)" card.
        7. Pan down slightly to show "Project Map - India" & "Fund Utilization".

[01:45] 8. Move cursor to top navigation bar.
        9. Hover over "Reports & Analytics" -> Click "AI Anomaly Engine"
           (Direct URL: /ai-insights).
       10. Click the filter tab: "Payment-Progress Disparities".
       11. Scroll to the "Contractor – Vendor Procurement Network Graph".
       12. Click on the node: "WS/MP418/2024-2025/133409".

[02:45] 13. Click the button: "Investigate Flagged Case (Pune)" or "Investigate Case".
       14. The "AI Forensic Investigation Workspace" modal opens.
       15. Point cursor to "Component Breakdown" (Cost, Delay, Payment, Spatial).
       16. Click modal tab: "What-If Simulation".
       17. Check box: "Supply Geo-tagged Physical Progress Milestone Photo".
           Observe simulated score change.
       18. Click modal tab: "Officer Decision & Formal Notice".
       19. Select radio button: "Request Explanatory Memo".
       20. Click the "X" button on the top right to close modal.

[03:45] 21. Click "Decision Support" in the main top navigation bar
           (Direct URL: /decision-support).
       22. Click the submenu tab: "75-Day Sanction Overdue Tracker"
           (URL: /decision-support?tab=delays).
       23. Click the submenu tab: "Statutory SC/ST Quotas (15%/7.5%)"
           (URL: /decision-support?tab=quotas).

[04:30] 24. Click the floating bottom-right button: "Ask MPLAD (⌘I)".
       25. The Universal Chat Drawer slides in from the right.
       26. In the text input box, type:
           Show delayed projects in Maharashtra
       27. Press [ENTER] or click the Send arrow button.
       28. Wait 1.5 seconds for response to render.
       29. Click "Export CSV" inside the chat card to trigger instant file download.
       30. Click the "X" button on the drawer header to close.

[05:05] 31. Click the amber "Home" button on the top left navigation bar.
       32. Rest cursor cleanly at center screen for final 25-second closing.
```

---

## 5. SIH Problem Statement to Feature Mapping (SIH26102)

| SIH26102 Official Requirement | Implemented Feature in MPLADS-AI | Verified Demo Screen & Action |
|---|---|---|
| **1. Unusual Expenditure & Fund Utilization Issues** | Statistical Z-Score / IQR deviation and March Fiscal Rush detection | **Dashboard** (`/`) Fund Utilization Gauge & **AI Insights** (`/ai-insights`) Payment Disparities |
| **2. Cost Overruns & Material Rate Deviations** | Rate Benchmark Engine matching voucher rates against CPWD / State DSR benchmarks | **Decision Support** (`/decision-support?tab=overruns`) & **Investigation Modal** Peer Comparison |
| **3. Duplicate Works & Geographic Overlap** | DPR Semantic Similarity & GIS Proximity Triangulation | **AI Insights** (`/ai-insights`) Suspected Duplicates Filter & Comparison Tool |
| **4. Delayed Projects & Sanction Bottlenecks** | 75-Day Statutory Sanction Overdue Tracker & Duration Milestone Estimator | **Decision Support** (`/decision-support?tab=delays`) & Project Timeline |
| **5. Potential Fraud Indicators & Vendor Collusion** | Contractor-Vendor Procurement Network Graph & Entity Resolution Engine | **AI Insights** (`/ai-insights`) Interactive Procurement Network Graph |
| **6. Non-Compliance with Scheme Norms** | Statutory SC/ST Quota Tracking (15% SC / 7.5% ST) & Prohibited Works Filter | **Decision Support** (`/decision-support?tab=quotas` & `tab=splitting`) |
| **7. Decision Support & Early Warning** | Multi-Tier Role Governance (MP, Collector, State, MoSPI) & Formal Notice Generator | **Decision Support** (`/decision-support`) & **Investigation Modal** (`Officer Action`) |
| **8. Natural Language Analytical Intelligence** | Ask MPLAD Multi-Agent Conversational Intelligence with Provenance Citations | **Universal Chat Drawer** (`UniversalChatDrawer.tsx`) |
