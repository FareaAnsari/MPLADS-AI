# MPLADS-AI: Whole-Project Production Deployment & Technical SEO Report

**Project Name:** MPLADS-AI  
**AI Intelligence Assistant:** Ask MPLAD  
**SIH Problem Statement:** SIH26102 — Development of an AI-powered system to detect anomalies, fraud, and inefficiencies in MPLAD Scheme implementation  
**Nodal Ministry:** Ministry of Statistics & Programme Implementation (MoSPI), Government of India  
**Production Platform:** Vercel Edge Network  
**Target Canonical URL:** `https://mplads-ai.vercel.app`  
**GitHub Repository:** `https://github.com/FareaAnsari/MPLADS-AI` (Branch: `main`)  
**Build Engine:** Vite 8.3 + TypeScript 6.0 + React 19.2 + TailwindCSS 3.4  

---

## 1. Previous Deployment Root Cause Analysis

### A. Previous Deployment Problem
* The live URL `mplads-ai-pratyaksh.vercel.app` intermittently failed to propagate fresh commits or displayed stale assets (`index-BGg8Z1bI.js`) despite local code changes.
* Development URLs (`http://localhost:8000`) were hardcoded in select services (`aiService.ts`, `tenderService.ts`, `ProjectKanbanBoard.tsx`), resulting in browser network errors when backend ports were not locally bound.
* Obsolete naming ("Pratyaksh") was present in legacy documentation, causing brand inconsistency with the official SIH problem statement.
* Lack of route-level dynamic SEO meta tags, canonical URL declarations, XML sitemaps, and robots exclusion rules on client-side routing.

### B. Exact Root Cause
1. **Hardcoded Fallbacks:** `requestApi` in `aiService.ts` and `API_BASE` in `tenderService.ts` had hardcoded `localhost:8000` fallbacks without checking runtime origin or `VITE_API_URL`.
2. **Missing Technical SEO Infrastructure:** Public routes lacked dynamic document title updates, meta descriptions, OpenGraph tags, JSON-LD structured data, and custom 404 handling.
3. **Vercel Cache-Control & CSP Headers:** `vercel.json` lacked explicit security headers (CSP, X-Frame-Options, X-Content-Type-Options) and immutable cache headers for hashed assets.
4. **Local NPX Cache Lock:** Interrupted CLI installations in `~/.npm/_npx/` threw `ENOTEMPTY` during CLI deploys.

---

## 2. Architecture Summary

```
                      ┌────────────────────────────────────────────────────────┐
                      │              MPLADS-AI CLIENT RUNTIME                  │
                      │     React 19 + React Router DOM v7 + TailwindCSS       │
                      └──────────────────────────┬─────────────────────────────┘
                                                 │
                     ┌───────────────────────────┴────────────────────────────┐
                     ▼                                                        ▼
┌──────────────────────────────────────────┐    ┌──────────────────────────────────────────┐
│      PUBLIC SEO & PRESENTATION LAYER     │    │      GOVERNANCE INTELLIGENCE ENGINES     │
│  - SEOHead Dynamic Head Injector         │    │  - 5-Factor Additive Risk Engine         │
│  - Schema.org JSON-LD Structured Data    │    │  - Isolation Forest Outlier Scoring      │
│  - National Dashboard & GIS Maps         │    │  - Counterfactual "What-If" Simulator    │
│  - Projects Registry & MP Directories    │    │  - Contractor-Vendor Network Graph       │
│  - Statutory Reports & Citizen Portal    │    │  - 75-Day Sanction SLA Overdue Tracker   │
│  - XML Sitemap & Robots Protocol         │    │  - SC/ST Statutory 15%/7.5% Allocation  │
└──────────────────────────────────────────┘    └─────────────────────┬────────────────────┘
                                                                      │
                                                ┌─────────────────────┴────────────────────┐
                                                ▼                                          ▼
                                ┌──────────────────────────────┐ ┌─────────────────────────────────┐
                                │   ASK MPLAD AI CONVERSATION  │ │    DATA TRUST & PROVENANCE      │
                                │ - Multi-Turn Reasoning       │ │ - Tier-1 e-SAKSHI Verified Data │
                                │ - Entity & MP Alias Match    │ │ - SHA-256 Tamper Verification   │
                                │ - Instant CSV Data Export    │ │ - GFR-2017 Audit Lineage        │
                                └──────────────────────────────┘ └─────────────────────────────────┘
```

---

## 3. Production Configuration & Environment Variable Checklist

| Variable Name | Scope | Required / Optional | Purpose | Production Default |
|---|---|---|---|---|
| `VITE_SITE_URL` | Public Client | **Required** | Canonical URL domain for SEO & Social Cards | `https://mplads-ai.vercel.app` |
| `VITE_API_URL` | Public Client | Optional | Backend FastAPI Gateway Endpoint | `/api/v1` (or empty for embedded fallback) |
| `GROQ_API_KEY` | Server / Edge | Optional | Fast LLM inference for deep research | Encrypted Server-side Secret |
| `ELEVENLABS_API_KEY` | Server / Edge | Optional | Audio briefings for inspection reports | Encrypted Server-side Secret |

---

## 4. Whole-Site Technical SEO Implementation

### A. Route Inventory & Indexation Strategy

| Route | Classification | Document Title | Meta Description | Canonical URL | Structured Data (JSON-LD) |
|---|---|---|---|---|---|
| `/` | **INDEXABLE** | `MPLADS-AI \| National Project Lifecycle Intelligence & Governance Platform` | Official national monitoring and explainable AI anomaly detection platform for the MPLAD Scheme. Monitoring 38,416+ works across 543 constituencies. | `https://mplads-ai.vercel.app/` | `WebSite`, `Organization` |
| `/about` | **INDEXABLE** | `About Scheme & Platform \| MPLADS-AI` | Learn about the Members of Parliament Local Area Development Scheme (MPLADS), statutory guidelines, administrative sanction workflows, and AI-driven monitoring. | `https://mplads-ai.vercel.app/about` | `BreadcrumbList`, `WebPage` |
| `/projects` | **INDEXABLE** | `National Works Registry & Projects Database \| MPLADS-AI` | Search, filter, and inspect thousands of MPLADS public infrastructure works across states, districts, implementing agencies, and progress stages. | `https://mplads-ai.vercel.app/projects` | `BreadcrumbList`, `WebPage` |
| `/projects/:id` | **INDEXABLE** | `[Project Name] \| [Code] \| MPLADS-AI` | Dynamic summary containing project name, district, state, MP recommendation, sanctioned funds, and real-time execution status. | `https://mplads-ai.vercel.app/projects/[id]` | `GovernmentService`, `BreadcrumbList` |
| `/mps` | **INDEXABLE** | `Members of Parliament (MPs) Official Directory \| MPLADS-AI` | National parliamentary directory of Hon'ble Lok Sabha and Rajya Sabha Members of Parliament with MPLADS entitlement, recommended works, and fund utilization tracking. | `https://mplads-ai.vercel.app/mps` | `BreadcrumbList`, `WebPage` |
| `/mps/:id` | **INDEXABLE** | `[MP Name] ([Constituency], [State]) \| MPLADS-AI` | Official parliamentary profile and MPLADS fund utilization record for Hon'ble Member of Parliament with allocated funds and utilization percentage. | `https://mplads-ai.vercel.app/mps/[id]` | `Person`, `BreadcrumbList` |
| `/national-data`| **INDEXABLE** | `National Data Pipeline & Quality Verification \| MPLADS-AI` | Authoritative public dataset registry consolidating real MPLADS works, expenditure ledgers, LGD administrative linkages, and data provenance quality reports. | `https://mplads-ai.vercel.app/national-data` | `Dataset`, `BreadcrumbList` |
| `/reports` | **INDEXABLE** | `Statutory Reports & Audit Intelligence Repository \| MPLADS-AI` | Public audit repository of national project risk compendiums, district scrutiny performance metrics, contractor workload analyses, and PFMS fund reconciliations. | `https://mplads-ai.vercel.app/reports` | `BreadcrumbList`, `WebPage` |
| `/citizen` | **INDEXABLE** | `Citizen Transparency & Public Accountability Portal \| MPLADS-AI` | Public tracking and citizen feedback portal for developmental projects recommended under the MPLADS Scheme in your village, block, and district. | `https://mplads-ai.vercel.app/citizen` | `BreadcrumbList`, `WebPage` |
| `/rural-intelligence` | **INDEXABLE** | `Rural Village Development Intelligence \| MPLADS-AI` | Data-driven exploration of MPLADS developmental infrastructure works across rural villages, Local Government Directory (LGD) units, and gram panchayats. | `https://mplads-ai.vercel.app/rural-intelligence` | `BreadcrumbList`, `WebPage` |
| `/tenders` | **INDEXABLE** | `E-Procurement, Tenders & Contract Registry \| MPLADS-AI` | Public tendering oversight, bidder scrutiny anomaly detection, and contract execution registers for MPLADS infrastructure packages under GFR 2017 standards. | `https://mplads-ai.vercel.app/tenders` | `BreadcrumbList`, `WebPage` |
| `/ai-insights` | **INDEXABLE** | `AI Insights & Forensic Anomaly Command Centre \| MPLADS-AI` | Automated multi-record anomaly detection, payment-progress mismatch analysis, material price outlier tracking, and duplicate proposal clustering for MPLADS works. | `https://mplads-ai.vercel.app/ai-insights` | `BreadcrumbList`, `WebPage` |
| `/decision-support` | **NOINDEX** | `Statutory Decision Support & Governance Command \| MPLADS-AI` | Internal administrative role portals (MP, State, District, Ministry) protected from search crawler indexation. | `https://mplads-ai.vercel.app/decision-support` | `noindex, nofollow` |
| `/sandbox` | **NOINDEX** | `Pre-Sanction Simulation Sandbox \| MPLADS-AI` | Internal testing sandbox excluded from search results. | `https://mplads-ai.vercel.app/sandbox` | `noindex, nofollow` |
| `/404` | **NOINDEX** | `404 — Page Not Found \| MPLADS-AI` | Custom branded error page with structured return navigation. | `https://mplads-ai.vercel.app/404` | `noindex, nofollow` |

---

## 5. Security & Cyber-Safety Hardening

* **Content-Security-Policy (CSP):** Configured in `vercel.json` allowing OpenStreetMap GIS tiles, Google Fonts, and verified secure data sources while blocking unauthorized third-party scripts.
* **X-Content-Type-Options:** `nosniff` enforced.
* **X-Frame-Options:** `SAMEORIGIN` enforced to protect against clickjacking.
* **Referrer-Policy:** `strict-origin-when-cross-origin` enforced.
* **Permissions-Policy:** Microphones and cameras disabled by default (`geolocation=(self)`).

---

## 6. Whole-Product Smoke Test Results

| Test ID | Test Scenario | Verification Action | Status |
|---|---|---|---|
| **SMOKE-01** | **Homepage & Hero Banner** | Loaded `/`. Verified Ashoka Lion Emblem, Data Trust panel, 7 KPI stat cards. | **PASS** |
| **SMOKE-02** | **National GIS Project Map** | Verified India mesh map rendering with district-level hover states and constituency filtering. | **PASS** |
| **SMOKE-03** | **Fund Utilization Velocity** | Verified FY 2025-26 utilization gauge, allocation vs. expenditure calculations. | **PASS** |
| **SMOKE-04** | **Projects Registry & Search** | Verified `/projects` filtering across states, categories, and keyword queries. | **PASS** |
| **SMOKE-05** | **Dynamic Project Details** | Verified `/projects/WS/MP418/2024-2025/133409` with dynamic title, breadcrumbs, and milestone history. | **PASS** |
| **SMOKE-06** | **AI Forensic Anomaly Engine** | Verified `/ai-insights` payment disparities, material price outliers, and duplicate proposals. | **PASS** |
| **SMOKE-07** | **Contractor-Vendor Network Graph** | Verified interactive node graph linking MPs, works, disbursement entities, and public vendors. | **PASS** |
| **SMOKE-08** | **Deep Project Investigation Modal** | Verified multi-factor additive risk breakdown, counterfactual What-If simulator, and officer action logging. | **PASS** |
| **SMOKE-09** | **Statutory Decision Support** | Verified `/decision-support` 75-day sanction overdue tracker, SC/ST quota enforcement, and negative list filters. | **PASS** |
| **SMOKE-10** | **Ask MPLAD Assistant** | Verified natural-language query *"Show delayed projects in Maharashtra"*, structured KPIs, project table, and instant CSV export. | **PASS** |
| **SMOKE-11** | **Statutory Reports Repository** | Verified `/reports` with National Risk Audit, District Compendium, and print/download actions. | **PASS** |
| **SMOKE-12** | **National Data Pipeline** | Verified `/national-data` data provenance audits, source conflict inspections, and LGD linkages. | **PASS** |
| **SMOKE-13** | **Robots.txt & Sitemap.xml** | Verified `/robots.txt` and `/sitemap.xml` format, headers, and accessibility. | **PASS** |
| **SMOKE-14** | **Custom 404 Handling** | Verified `/random-invalid-route` renders custom branded `NotFoundPage` with return links. | **PASS** |
| **SMOKE-15** | **Responsive Mobile Layout** | Verified collapsible mobile drawer, touch-friendly navigation, and zero horizontal table clipping. | **PASS** |

---

## 7. Google Search Console & Production Domain Setup Guide

When pointing your custom domain (e.g. `mplads-ai.gov.in` or `mplads-ai.org`):

1. **Vercel Project Setup:**
   * In Vercel Dashboard $\rightarrow$ **Add New Project** $\rightarrow$ Import `FareaAnsari/MPLADS-AI`.
   * **Framework Preset:** `Vite`
   * **Root Directory:** `./`
   * **Build Command:** `npm run build`
   * **Output Directory:** `dist`
2. **Domain Mapping:**
   * Go to **Settings $\rightarrow$ Domains** $\rightarrow$ Add your domain (e.g., `mplads-ai.vercel.app`).
   * Configure DNS CNAME record pointing to `cname.vercel-dns.com`.
3. **Google Search Console Verification:**
   * Open [search.google.com/search-console](https://search.google.com/search-console).
   * Choose **URL Prefix** $\rightarrow$ Enter your production domain.
   * Verify via **HTML Tag** (add to `index.html`) or **DNS TXT Record**.
   * Under **Sitemaps** $\rightarrow$ Submit `https://YOUR_DOMAIN/sitemap.xml`.
   * Request indexing on core hubs (`/`, `/projects`, `/mps`, `/national-data`, `/reports`).

---

## 8. Rollback & Fail-Safe Plan

* **Instant Git Rollback:** In the event of a breaking change, run:
  ```bash
  git revert HEAD
  git push origin main
  ```
* **Vercel Deployment Rollback:** In the Vercel Dashboard under **Deployments**, any previous production deployment can be promoted to Instant Live with one click in `< 2 seconds`.
* **Zero-Latency Offline Mode:** The client-side application includes built-in offline dataset fallbacks (`realDataset.json`, `mpsData.ts`, `nationalDataPipelineService.ts`), ensuring complete operational continuity even during server outages.
