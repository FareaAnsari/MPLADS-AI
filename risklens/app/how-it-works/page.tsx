import React from "react";
import Link from "next/link";
import { DataSourceBadge } from "@/components/cards/DataSourceBadge";
import { ArrowLeft, ShieldAlert, Coins, Clock, ImageIcon, FileCheck2, MapPin, CheckCircle2 } from "lucide-react";

export default function HowItWorksPage() {
  const SIGNALS = [
    {
      name: "Peer-Cohort Cost Anomaly",
      maxPoints: 25,
      icon: Coins,
      color: "text-rose-600 bg-rose-50 border-rose-200",
      description:
        "Evaluates project sanctioned cost against works within the same Work Sector, Geographic Terrain, and Cost Tier (<₹5L, ₹5L–₹20L, >₹20L).",
      formula: "Points = min(25, 18 + (Ratio - 1.5) * 5) for cost > 1.5× peer band maximum",
      safeguard: "Never compares against a single national average. Projects in remote hill districts are benchmarked solely against hill-district baselines.",
    },
    {
      name: "Perceptual Hash Duplicate Detection",
      maxPoints: 20,
      icon: ImageIcon,
      color: "text-purple-600 bg-purple-50 border-purple-200",
      description:
        "Transforms site completion photos into 64-bit discrete cosine transform (DCT) hash fingerprints and computes bitwise Hamming distance across all historical projects.",
      formula: "Points = 20 if Hamming Distance ≤ 10 (exhibiting >84% visual feature overlap)",
      safeguard: "Prevents reused contractor photos from being resubmitted across distinct financial years or adjacent constituencies.",
    },
    {
      name: "Stage-Wise SLA Bottleneck Analyzer",
      maxPoints: 20,
      icon: Clock,
      color: "text-amber-600 bg-amber-50 border-amber-200",
      description:
        "Measures actual time spent in each administrative stage against MoSPI statutory norms (Administrative Sanction: 45 days, Technical Sanction: 60 days, Execution: 365 days).",
      formula: "Points = min(20, 14 + (DelayRatio - 3.0) * 3) for delay ≥ 3.0× statutory SLA",
      safeguard: "Attributed exclusively to official designation / agency roles (e.g. 'District Planning Cell IDA'). Zero naming of individuals.",
    },
    {
      name: "Disbursement & UC Compliance",
      maxPoints: 15,
      icon: FileCheck2,
      color: "text-blue-600 bg-blue-50 border-blue-200",
      description:
        "Deterministic audit checks verifying whether payment tranches predate administrative sanction orders, or if subsequent tranches were released without prior Utilization Certificates (UC).",
      formula: "Points = +15 if disbursement predates sanction; +12 if multiple tranches lack UC",
      safeguard: "Provides explicit documentary reference numbers and voucher dates.",
    },
    {
      name: "GIS Spatial Proximity Overlap",
      maxPoints: 16,
      icon: MapPin,
      color: "text-emerald-600 bg-emerald-50 border-emerald-200",
      description:
        "Calculates Haversine geodesic distance between works of identical category within close geographic radius (under 150 meters).",
      formula: "Points = min(16, 12 + NearbyCount * 2) if distance ≤ 150m and category matches",
      safeguard: "Flags potential duplicate asset creation on the exact same physical coordinates.",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      <header className="h-16 bg-white border-b border-slate-200/80 px-6 lg:px-12 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <Link href="/district" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </div>
        <DataSourceBadge type="synthetic" />
      </header>

      <main className="max-w-4xl mx-auto py-12 px-6 space-y-10">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200">
            Algorithmic Transparency & Regulatory Neutrality
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            How RiskLens Scoring Works
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            Unlike &quot;black box&quot; deep learning models that cannot be defended in an administrative or judicial review, RiskLens is an **additive, explainable composite intelligence engine**. Every point added to the 0–100 score corresponds to a documented mathematical rule and statutory benchmark.
          </p>
        </div>

        {/* Scoring Scale Guide */}
        <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Risk Score Severity Tiers
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 space-y-1">
              <span className="font-bold text-emerald-800 text-sm block">0 to 34: Standard</span>
              <p className="text-emerald-700">
                Within cohort cost ranges, normal statutory timelines, and verified photographic evidence. No officer action needed.
              </p>
            </div>
            <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 space-y-1">
              <span className="font-bold text-amber-800 text-sm block">35 to 59: Under Review</span>
              <p className="text-amber-700">
                Mild statistical divergence or moderate stage delay. Flagged for routine desk audit or verification.
              </p>
            </div>
            <div className="p-4 rounded-xl border border-red-200 bg-red-50/50 space-y-1">
              <span className="font-bold text-red-800 text-sm block">60 to 100: Action Required</span>
              <p className="text-red-700">
                Multiple compounding anomalies (e.g. duplicate photos + massive cost spike). Requires physical field inspection.
              </p>
            </div>
          </div>
        </div>

        {/* Detailed Breakdown of 5 Signals */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-slate-900">
            The 5 Explainable Verification Signals
          </h2>

          <div className="space-y-4">
            {SIGNALS.map((sig) => {
              const Icon = sig.icon;
              return (
                <div
                  key={sig.name}
                  className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-2xs space-y-3 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className={`p-2 rounded-lg border ${sig.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <h3 className="font-bold text-slate-900 text-sm">{sig.name}</h3>
                    </div>
                    <span className="font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md">
                      Weight: Up to +{sig.maxPoints} pts
                    </span>
                  </div>

                  <p className="text-slate-600 leading-relaxed text-xs">
                    {sig.description}
                  </p>

                  <div className="p-3 bg-slate-50 rounded-xl font-mono text-[11px] text-slate-800 border border-slate-200/60">
                    <strong>Logic:</strong> {sig.formula}
                  </div>

                  <div className="flex items-start gap-2 text-[11px] text-slate-500 pt-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Safeguard:</strong> {sig.safeguard}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Golden Rules Governance Section */}
        <div className="p-6 bg-slate-900 text-white rounded-2xl space-y-4">
          <h3 className="text-sm font-bold text-blue-400 uppercase tracking-wider">
            Administrative Neutrality Guarantees
          </h3>
          <ul className="space-y-2 text-xs text-slate-300">
            <li>• <strong>No Pre-Judged Guilt:</strong> System strictly uses terms like &quot;flagged for review&quot; or &quot;requires verification&quot;, never &quot;fraud&quot; or &quot;corrupt&quot;.</li>
            <li>• <strong>Missing Evidence Rule:</strong> Unconnected/missing sensors never penalize scores as if they were a positive contradiction.</li>
            <li>• <strong>Human-in-the-Loop Supremacy:</strong> An AI score cannot freeze funds or cancel projects automatically. All workflows culminate in human officer action buttons.</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
