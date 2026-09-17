# RiskLens Synthetic Dataset & Provenance Disclosure

## 1. Compliance with Ethical & Anonymization Mandates
In compliance with the Golden Rules:
1. **Zero Personal Identifiers**: No real Member of Parliament (MP) names, real administrative officials, or private citizen identities are utilized. Roles and designated offices are referenced strictly by official administrative title (e.g., *"District Planning Officer IDA"*, *"Executive Engineer PWD"*).
2. **Anonymized Geographies**: Constituencies are anonymized using standardized administrative codes (e.g., `Constituency A-01` through `Constituency X-24`).
3. **No Real Human Faces**: No personal photographs or facial images are used. Evidence photographs depict physical infrastructure (solar high-masts, road pavements, culverts, overhead water tanks) sourced from royalty-free public domain engineering datasets.
4. **Transparent Badging**: Every data presentation in RiskLens displays `<DataSourceBadge type="synthetic" />`.

---

## 2. Injected Anomalies (Benchmark Test Cases)

To validate the Explainable Risk Fusion Engine, the dataset contains a deliberately controlled set of edge cases:

| Project ID | Work Category | Injected Signal | Signal Metrics | Expected Score |
| :--- | :--- | :--- | :--- | :--- |
| **`HERO-MPLADS-001`** | Solar & Street Lighting | Multi-Signal Hero Spotlight | Cost ₹92L vs ₹7.5L peer median (+25), 4.1× SLA bottleneck (+18), duplicate pHash match (+20), missing UC (+12) | **84 (High Risk)** |
| **`PRJ-2024-010`–`016`** | Roads, Water, Halls | Cost Outliers | Sanctioned amount 2.6× peer median (z-score > +3.0) | **58–72 (High Risk)** |
| **`PRJ-2024-020`–`026`** | School Infra, Health | Stage SLA Bottlenecks | Technical Sanction stage delayed 3.8× to 4.6× statutory limit | **45–62 (Moderate/High)** |
| **`PRJ-2024-030`–`034`** | Community Halls | Disbursement Non-Compliance | Tranches released without prerequisite Utilization Certificates | **38–50 (Moderate)** |
| **`PRJ-2023-088`** | Solar & Street Lighting | Baseline Clean Project | Clean timelines, normal cost, verified photos | **12 (Low Risk / Clean)** |

---

## 3. Public Benchmark Numbers (Landing Page Credibility)
- Official MPLADS scheme statutory parameters (e.g. ₹5.00 Crore annual non-lapsable entitlement per MP, statutory 45-day administrative sanction SLA) mirror official MoSPI Guidelines.
- Public aggregate figures are badged as `<DataSourceBadge type="public" />`.
