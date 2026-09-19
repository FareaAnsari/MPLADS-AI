# Phase 17 — Google Play + TestFlight + App Store Distribution Master Report
**Project:** MPLADS-AI (`Pratyaksh`)  
**Date:** September 20, 2026  
**Status:** Completed  
**Overall Distribution Status:**  
- **Android:** Release Candidate Configured / Staged Rollout Ready  
- **iOS:** TestFlight Internal Ready / App Store Review Submission Ready  

---

## 1. Executive Summary

This document serves as the authoritative distribution record, store listing specification, privacy disclosure reconciliation, reviewer access guide, and release deployment blueprint for the **MPLADS-AI (`Pratyaksh`)** mobile application across **Google Play** and the **Apple App Store / TestFlight**.

The distribution package is built upon the verified release candidate artifacts produced in Phase 16 (`version 1.0.0`, `android.versionCode: 1`, `ios.buildNumber: 1`, Git SHA `bcf6bddaed8ae105ef187632dd62260c9123ab45`). All functional, privacy, and regulatory disclosures have been reconciled against the live production codebase and backend services.

---

## 2. Release Source of Truth & Build Metadata

| Property | Specification / Value |
| :--- | :--- |
| **Application Name** | `Pratyaksh MPLADS` |
| **Semantic Version** | `1.0.0` |
| **Android Package Identifier** | `in.gov.mplads.pratyaksh` |
| **Android Version Code** | `1` |
| **iOS Bundle Identifier** | `in.gov.mplads.pratyaksh` |
| **iOS Build Number** | `1` |
| **Git Branch / Commit SHA** | `mobile-app` / `bcf6bddaed8ae105ef187632dd62260c9123ab45` |
| **Expo SDK / Runtime** | Expo SDK `~57.0.24` / React Native `0.86.3` / Hermes Bytecode |
| **Production API Endpoint** | `https://api.mplads.nic.in` |
| **Production Environment** | `EXPO_PUBLIC_ENVIRONMENT=production` |
| **Target SDKs** | Android 16 (API Level 36+) / iOS 18+ (Xcode 26/27 compliant) |
| **URL Schemes / Deep Links** | `mplads://` and `pratyaksh://` |

---

## 3. Store Listing Metadata & Factual Copy

### A. Google Play Store Listing
- **App Title (Max 30 chars):** `Pratyaksh MPLADS`
- **Short Description (Max 80 chars):** `Transparent monitoring, ground evidence verification, and tracking for MPLADS.`
- **Full Description (Max 4000 chars):**
```text
Pratyaksh MPLADS is a dedicated mobile intelligence and monitoring platform designed to provide transparent, multi-stakeholder oversight for Member of Parliament Local Area Development Scheme (MPLADS) civil works and community assets.

Operating on top of official public data sources (including data.gov.in and eSAKSHI), Pratyaksh empowers citizens, district administration, Members of Parliament, and executing contractors with real-time operational tools and verification intelligence.

KEY CAPABILITIES BY ROLE:

1. CITIZEN TRANSPARENCY & EVIDENCE
• Explore and search sanctioned, ongoing, and completed MPLADS projects across constituencies.
• Submit geo-tagged ground evidence photographs with live camera capture and GPS accuracy validation.
• Track evidence review status and community work progress in real time.
• Full bilingual support in English and Hindi (हिन्दी).

2. DISTRICT OFFICER OPERATIONS
• Access district-scoped project oversight dashboards and pending inspection itineraries.
• Review and verify citizen-submitted evidence with accept, reject, or info-request actions.
• Evaluate AI-assisted multi-factor risk signals (cost anomalies, progress timelines, geospatial clustering) for objective inspection prioritization.
• Manage on-site inspection logs and milestone progress records.

3. MP OFFICE CONSTITUENCY OVERSIGHT
• Monitor constituency-level fund utilization (Sanctioned vs. Disbursed vs. Expenditure).
• Track milestone completion benchmarks and identify potential administrative bottlenecks.
• Review high-level risk distribution summaries to ensure timely public delivery.

4. CONTRACTOR WORK REPORTING
• View assigned civil works packages and technical milestone specifications.
• Report physical progress percentages with strict boundary validation and on-site observations.
• Escalate material delays, statutory clearances, and site access issues directly to nodal authorities.

5. OFFLINE DURABILITY & RESILIENCE
• Seamlessly queue evidence drafts, inspections, and progress updates while working in remote low-connectivity areas.
• Automatic background synchronization upon restoring network connectivity.
• Zero data leakage across account switches and strict credential isolation.

DISCLAIMER & PROVENANCE:
Pratyaksh MPLADS utilizes published open government data and standardized monitoring protocols to facilitate transparent public infrastructure oversight. Risk indicators represent statistical analytical signals for authorized administrative review and do not constitute legal determinations.
```

- **Category:** `Government / Tools / Productivity`
- **Content Rating:** `Everyone (IARC / 3+)`
- **Developer Contact:** `support@mplads.gov.in` / `https://mplads.gov.in`

---

### B. Apple App Store Listing
- **App Name:** `Pratyaksh MPLADS`
- **Subtitle (Max 30 chars):** `Project Monitoring & Oversight`
- **Promotional Text:** `Transparent tracking, ground evidence verification, and operational monitoring for MPLADS community works.`
- **Keywords (Max 100 chars):** `MPLADS,eSAKSHI,Pratyaksh,India,Government,Public Works,Infrastructure,Constituency,District,Evidence`
- **Primary Category:** `Productivity`
- **Secondary Category:** `Utilities`
- **Age Rating:** `4+`
- **Support URL:** `https://mplads.gov.in/support`
- **Marketing URL:** `https://mplads.gov.in/pratyaksh`
- **Privacy Policy URL:** `https://mplads.gov.in/privacy-policy`

---

## 4. Privacy Policy & Legal Disclosures

The public Privacy Policy at `https://mplads.gov.in/privacy-policy` discloses the exact data flows:

1. **Account Information:** User identifier, role (`CITIZEN`, `DISTRICT_OFFICER`, `MP_OFFICE`, `CONTRACTOR`), state, and assigned district/constituency. Stored in encrypted server records; JWT access tokens stored exclusively in iOS Keychain / Android Keystore (`SecureStore`).
2. **Camera & Photographs:** Camera access is requested solely for user-initiated ground evidence capture. Captured images are transmitted securely to the backend and associated with project verification audits. No background camera access is performed.
3. **Location Services (GPS):** Location coordinates (latitude, longitude, accuracy) are collected only at the exact moment of evidence photo capture to compute distance to the designated project site. No persistent background location tracking is conducted.
4. **Push Notification Tokens:** Hardware device push tokens are registered to route operational alerts (evidence review outcomes, inspection assignments, high-risk flags). Tokens are unregistered upon account logout.
5. **Local SQLite Storage:** Project metadata and offline mutation queues are cached locally in app sandboxed SQLite storage. All user-scoped records are purged immediately upon logout.
6. **Data Deletion & Retention:** Users may request data deletion or account unlinking via `privacy@mplads.gov.in`.

---

## 5. Google Play Data Safety Declaration

| Data Category | Data Type | Collected | Shared | Purpose | Ephemeral / Stored | Security |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Location** | Precise & Approximate Location | Yes (With Consent) | No | App Functionality (Evidence verification against project coordinates) | Stored with evidence record | Encrypted in transit (TLS 1.3) |
| **Photos & Videos** | Photos | Yes (With Consent) | No | App Functionality (Ground inspection evidence submission) | Stored with evidence audit | Encrypted in transit (TLS 1.3) |
| **Personal Info** | Name, Email, Phone | Yes (Account Auth) | No | Account Management & Role-Based Access | Stored in User Database | Encrypted in transit (TLS 1.3) |
| **App Activity** | User interaction events | No | No | N/A | N/A | N/A |
| **Device / Other IDs** | Device Token / Push Token | Yes | No | Push Notifications & Security / Fraud Prevention | Stored in Notification Registry | Encrypted in transit (TLS 1.3) |
| **App Performance** | Crash logs / Diagnostics | Yes | No | Troubleshooting & Stability | Anonymized / Non-identifiable | Encrypted in transit (TLS 1.3) |

---

## 6. Apple App Privacy Nutrition Label

- **Data Used to Track You:** **None** (Zero third-party cross-app tracking).
- **Data Linked to You:**
  - **Contact Info:** Name, Email, Phone Number (Account functionality, Authentication).
  - **Location:** Precise Location (Ground evidence geo-verification).
  - **User Content:** Photos (Evidence documentation).
  - **Identifiers:** User ID, Device ID (Push notification delivery, Account session management).
  - **Diagnostics:** Crash Data (App stability and performance optimization).
- **Data Not Linked to You:** None.

---

## 7. App Store & Google Play Reviewer Access Package

### Controlled Synthetic Review Accounts (Safe Benchmark Data)

| Role | Username | Initial Password | Scope / Jurisdiction | Review Focus |
| :--- | :--- | :--- | :--- | :--- |
| **Citizen** | `citizen_ramesh` | `CitizenPass@2026` | Araria District, Bihar | Project discovery, search/filters, live camera/GPS evidence capture, offline draft saving, outbox sync |
| **District Officer** | `officer_araria` | `GovAdminPass@2026` | Araria District, Bihar | Scoped district dashboard, AI multi-factor risk breakdown, citizen evidence review (Accept/Reject), inspection itinerary updates |
| **MP Office** | `mp_araria` | `SansadPass@2026` | Araria Constituency, Bihar | Constituency dashboard, fund utilization financial oversight, milestone progress tracking, deep link routing |
| **Contractor** | `contractor_patel` | `ContractorPass@2026` | Maharashtra / Sample Portfolio | Assigned work packages, 0–100% milestone progress reporting, site blocker/issue submission |

### Reviewer Walkthrough Instructions
1. **Launch App:** Open `Pratyaksh MPLADS` on test device or TestFlight.
2. **Citizen Flow:**
   - Sign in with `citizen_ramesh` / `CitizenPass@2026`.
   - On Citizen Home, browse national and local works. Tap any project to open Project Detail.
   - Tap **"Submit Ground Evidence"** -> grant Camera & Location permissions -> snap a photograph -> inspect location coordinate accuracy -> tap **"Submit Evidence"**.
   - Open Profile/Settings and tap **"Log Out"** (verifies secure credential purge).
3. **District Officer Flow:**
   - Sign in with `officer_araria` / `GovAdminPass@2026`.
   - View District Dashboard metrics, pending evidence queue, and inspection itinerary.
   - Tap **"Risk Intelligence"** -> observe multi-factor composite risk scores, cost anomaly flags, and geospatial peer benchmarks.
   - Open pending evidence -> review photo and location verification signal -> tap **"Accept Evidence"**.
   - Open an assigned inspection -> update physical progress to `75%` -> tap **"Record Inspection Update"**.
   - Notice: After 15 minutes of inactivity, privileged session automatically locks for security.
4. **MP Office Flow:**
   - Sign in with `mp_araria` / `SansadPass@2026`.
   - Inspect constituency financial oversight graphs (Sanctioned ₹25L vs Disbursed ₹18L vs Expenditure ₹18L).
   - Review milestone timeline benchmarks.
5. **Contractor Flow:**
   - Sign in with `contractor_patel` / `ContractorPass@2026`.
   - View assigned works list -> submit physical milestone progress update (validated strictly within 0–100%).
   - Report a site delay issue under category `MATERIAL_DELAY`.

*Note for Reviewers:* Camera and GPS modules support live hardware execution as well as graceful fallback handling in simulator environments.

---

## 8. Distribution Tracks & Phased Rollout Plan

```text
Build Artifacts (Phase 16)
          ↓
[Google Play]                            [Apple App Store]
Internal Testing Track                   TestFlight Internal Testing
          ↓                                       ↓
Closed Testing Track (20 Testers)        TestFlight External Beta
          ↓                                       ↓
Production Review Track                  App Store Review Submission
          ↓                                       ↓
Staged Rollout (10% → 50% → 100%)        7-Day Phased Release (1% → 100%)
```

### Staged Rollout Timeline (Production)
- **Day 1:** 10% Android Rollout / 1% iOS Phased Release — Monitor crash-free sessions and API telemetry.
- **Day 2:** 20% Android Rollout / 2% iOS Phased Release — Verify notification delivery and backend server load.
- **Day 3:** 50% Android Rollout / 5% iOS Phased Release — Monitor SQLite sync and evidence upload queues.
- **Day 4–7:** 100% Full Global Production Availability.

---

## 9. Post-Release Operational Monitoring, Rollback & Hotfix Strategy

### Operational Health Thresholds
- **Crash-Free User Rate:** Minimum `99.5%` (Alert if < 99.0%).
- **API Error Rate (5xx):** Maximum `0.1%` across endpoints.
- **Outbox Sync Success Rate:** Minimum `99.0%` upon reconnection.
- **Push Notification Latency:** < 5 seconds for high-priority risk alerts.

### Rollback & Incident Response
1. **Google Play Rollback:**
   - Pause staged rollout in Play Console immediately upon detecting critical crashes or data anomalies.
   - If 100% rollout was completed, publish an expedited hotfix build.
2. **Apple App Store Rollback:**
   - Pause phased release in App Store Connect.
   - Request an Expedited App Review for a critical emergency patch.
3. **Hotfix Release Workflow (`1.0.1`):**
   ```bash
   git checkout -b hotfix/1.0.1
   # Apply minimal scoped fix
   # Run mobile test suite: cd mobile && npx jest && npx tsc --noEmit
   # Run backend test suite: pytest backend/tests
   # Increment versionCode to 2, buildNumber to 2, version to 1.0.1
   # Build & export production bundles
   # Upload to Play Console & App Store Connect
   ```

---

## 10. Store Distribution Checklist & Final Acceptance

- [x] Pre-distribution QA verified (`RELEASE CANDIDATE` in Phase 15).
- [x] Production builds compiled and validated (`RELEASE BUILDS READY` in Phase 16).
- [x] Package & Bundle Identifiers matched (`in.gov.mplads.pratyaksh`).
- [x] Target SDK requirements satisfied (Android 16 / API 36+ & iOS 18+ / Xcode 26/27).
- [x] Google Play store listing, short description, and full description prepared.
- [x] Apple App Store metadata, subtitle, keywords, and URLs configured.
- [x] Public Privacy Policy disclosures verified against live code data flow.
- [x] Google Data Safety and Apple App Privacy declarations completed.
- [x] Age Rating declarations completed (Everyone / 4+).
- [x] Reviewer credentials and step-by-step walkthrough instructions finalized.
- [x] Zero secrets, tokens, or private credentials committed to repository.
- [x] Staged rollout and rollback/hotfix procedures established.

---
*End of Phase 17 Store Distribution Master Report.*
