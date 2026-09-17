"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRiskLensStore } from "@/lib/store";
import { formatINR } from "@/lib/utils";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { FundUtilizationGauge } from "@/components/charts/FundUtilizationGauge";
import { SectorBreakdown } from "@/components/charts/SectorBreakdown";
import { ConstituencyCard } from "@/components/cards/ConstituencyCard";
import { DataSourceBadge } from "@/components/cards/DataSourceBadge";
import {
  ShieldAlert,
  ArrowRight,
  Sparkles,
  TrendingUp,
  FileCheck,
  AlertTriangle,
  MapPin,
  Building,
  Users,
  Search,
  ExternalLink,
  ChevronRight,
  GitCompare,
  CheckCircle2,
  PieChart,
} from "lucide-react";

// State-wise data matching Empowered Indian's national dataset
interface StatePerformance {
  code: string;
  name: string;
  mps: number;
  sanctionedCr: number;
  expenditureCr: number;
  utilization: number;
  completedWorks: number;
  flaggedWorks: number;
}

const STATES_DATA: StatePerformance[] = [
  {
    code: "MH",
    name: "Maharashtra",
    mps: 48,
    sanctionedCr: 2140.0,
    expenditureCr: 1887.4,
    utilization: 88.2,
    completedWorks: 492,
    flaggedWorks: 1,
  },
  {
    code: "GJ",
    name: "Gujarat",
    mps: 26,
    sanctionedCr: 1280.0,
    expenditureCr: 1105.9,
    utilization: 86.4,
    completedWorks: 318,
    flaggedWorks: 0,
  },
  {
    code: "KA",
    name: "Karnataka",
    mps: 28,
    sanctionedCr: 1360.0,
    expenditureCr: 1116.5,
    utilization: 82.1,
    completedWorks: 342,
    flaggedWorks: 2,
  },
  {
    code: "TN",
    name: "Tamil Nadu",
    mps: 39,
    sanctionedCr: 1820.0,
    expenditureCr: 1465.1,
    utilization: 80.5,
    completedWorks: 430,
    flaggedWorks: 1,
  },
  {
    code: "RJ",
    name: "Rajasthan",
    mps: 25,
    sanctionedCr: 1210.0,
    expenditureCr: 941.3,
    utilization: 77.8,
    completedWorks: 285,
    flaggedWorks: 2,
  },
  {
    code: "UP",
    name: "Uttar Pradesh",
    mps: 80,
    sanctionedCr: 3890.0,
    expenditureCr: 2886.3,
    utilization: 74.2,
    completedWorks: 840,
    flaggedWorks: 6,
  },
  {
    code: "WB",
    name: "West Bengal",
    mps: 42,
    sanctionedCr: 2010.0,
    expenditureCr: 1433.1,
    utilization: 71.3,
    completedWorks: 410,
    flaggedWorks: 3,
  },
  {
    code: "BR",
    name: "Bihar",
    mps: 40,
    sanctionedCr: 1950.0,
    expenditureCr: 1333.8,
    utilization: 68.4,
    completedWorks: 380,
    flaggedWorks: 5,
  },
];

export default function EmpoweredIndianMPLADSPage() {
  const { constituencies, projects } = useRiskLensStore();
  const [selectedTerm, setSelectedTerm] = useState<"18th" | "17th" | "rajya_sabha">("18th");
  const [searchFilter, setSearchFilter] = useState("");
  const [stateSortKey, setStateSortKey] = useState<"utilization" | "sanctionedCr" | "flaggedWorks">("utilization");
  const [selectedSector, setSelectedSector] = useState<string | null>(null);

  // Term data adjustments
  const termStats = {
    "18th": {
      sanctioned: 19820,
      expenditure: 15240,
      utilization: 76.9,
      completed: 3240,
      totalWorks: 4120,
      flagged: 18,
      termTitle: "18th Lok Sabha (2024–2029)",
    },
    "17th": {
      sanctioned: 24750,
      expenditure: 21890,
      utilization: 88.4,
      completed: 7920,
      totalWorks: 8450,
      flagged: 8,
      termTitle: "17th Lok Sabha (2019–2024)",
    },
    rajya_sabha: {
      sanctioned: 11400,
      expenditure: 8780,
      utilization: 77.0,
      completed: 1890,
      totalWorks: 2340,
      flagged: 6,
      termTitle: "Rajya Sabha (Nominated & State Representatives)",
    },
  }[selectedTerm];

  // Sort states
  const sortedStates = [...STATES_DATA].sort((a, b) => {
    if (stateSortKey === "utilization") return b.utilization - a.utilization;
    if (stateSortKey === "sanctionedCr") return b.sanctionedCr - a.sanctionedCr;
    return b.flaggedWorks - a.flaggedWorks;
  });

  // Filter constituencies
  const filteredConstituencies = constituencies.filter((c) =>
    c.id.toLowerCase().includes(searchFilter.toLowerCase()) ||
    c.stateCode.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <DashboardShell>
      <div className="space-y-10">
        {/* Hero Section with Cormorant Garamond Display Font & Civic Eyebrow */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-10 shadow-xs relative overflow-hidden">
          <div className="max-w-3xl space-y-4">
            <span className="civic-eyebrow">
              GOVERNMENT TRANSPARENCY PLATFORM • MPLADS DASHBOARD
            </span>

            <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight font-display leading-[1.08]">
              Empowered Indian: Member of Parliament Local Area Development Scheme
            </h1>

            <p className="text-slate-600 text-sm sm:text-base leading-relaxed font-primary">
              Public audit, tracking, and explainable AI risk intelligence across all 543 Lok Sabha constituencies. Track real-time fund allocations, completed civic assets, and AI-flagged accountability notices.
            </p>

            {/* Interactive Term Toggle */}
            <div className="pt-2 flex flex-wrap items-center gap-2 font-primary">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-2">
                Parliament Term:
              </span>
              <button
                onClick={() => setSelectedTerm("18th")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedTerm === "18th"
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                18th Lok Sabha (2024–29)
              </button>
              <button
                onClick={() => setSelectedTerm("17th")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedTerm === "17th"
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                17th Lok Sabha (2019–24)
              </button>
              <button
                onClick={() => setSelectedTerm("rajya_sabha")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedTerm === "rajya_sabha"
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                Rajya Sabha
              </button>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 text-xs font-primary">
            <div className="flex items-center gap-4 text-slate-500">
              <DataSourceBadge type="synthetic" />
              <span>• Synthetic Demonstration Layer</span>
              <span>• MoSPI Compliant (2023 Guidelines)</span>
            </div>
            <Link
              href="/how-it-works"
              className="text-blue-600 hover:text-blue-800 font-bold inline-flex items-center gap-1"
            >
              <span>Learn how RiskLens calculates risk scores</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* National Metrics & Interactive Utilization Gauge */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="civic-eyebrow">National Performance Summary</span>
              <h2 className="text-2xl font-bold text-slate-900 font-display">
                {termStats.termTitle}
              </h2>
            </div>
            <Link
              href="/states"
              className="text-xs font-bold text-blue-600 hover:text-blue-800 inline-flex items-center gap-1 font-primary"
            >
              <span>View all 28 States & UTs</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Metric 1: Total Sanctioned */}
            <div className="civic-card p-5">
              <div className="flex items-center justify-between text-slate-400 mb-2 font-primary">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Total Sanctioned
                </span>
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-extrabold text-slate-900 font-mono tracking-tight">
                ₹{termStats.sanctioned.toLocaleString()} Cr
              </div>
              <p className="text-[11px] text-slate-500 mt-1 font-primary">
                {termStats.totalWorks.toLocaleString()} developmental works approved
              </p>
            </div>

            {/* Metric 2: Expenditure Released */}
            <div className="civic-card p-5">
              <div className="flex items-center justify-between text-slate-400 mb-2 font-primary">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Expenditure Released
                </span>
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <FileCheck className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-extrabold text-slate-900 font-mono tracking-tight">
                ₹{termStats.expenditure.toLocaleString()} Cr
              </div>
              <p className="text-[11px] text-emerald-600 font-semibold mt-1 font-primary flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>{termStats.utilization}% overall disbursement rate</span>
              </p>
            </div>

            {/* Metric 3: Works Completed */}
            <div className="civic-card p-5">
              <div className="flex items-center justify-between text-slate-400 mb-2 font-primary">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Works Completed
                </span>
                <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Building className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-extrabold text-slate-900 font-mono tracking-tight">
                {termStats.completed.toLocaleString()}
              </div>
              <p className="text-[11px] text-slate-500 mt-1 font-primary">
                {Math.round((termStats.completed / termStats.totalWorks) * 100)}% completion efficacy ratio
              </p>
            </div>

            {/* Metric 4: Explainable AI Risk Flags */}
            <div className="civic-card p-5 border-amber-200/80 bg-gradient-to-br from-white to-amber-50/30">
              <div className="flex items-center justify-between text-slate-400 mb-2 font-primary">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
                  Active Risk Flags
                </span>
                <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-extrabold text-amber-800 font-mono tracking-tight">
                {termStats.flagged} Works
              </div>
              <Link
                href="/queue"
                className="text-[11px] font-bold text-amber-700 hover:text-amber-900 mt-1 inline-flex items-center gap-1 font-primary"
              >
                <span>Inspect in Explainable Queue</span>
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>

        {/* Visual Analytics Grid: Utilization Gauge & Sector Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Fund Utilization Gauge Component (Matching Empowered Indian) */}
          <div className="lg:col-span-1">
            <FundUtilizationGauge
              utilization={termStats.utilization}
              title="Fund Utilization Gauge"
              subtitle="National average expenditure vs cumulative statutory entitlement"
            />
          </div>

          {/* Sector-wise Breakdown */}
          <div className="lg:col-span-2">
            <SectorBreakdown
              selectedSector={selectedSector}
              onSelectSector={(s) => setSelectedSector(s)}
            />
          </div>
        </div>

        {/* Interactive State Leaderboard & Performance Comparison */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <span className="civic-eyebrow">Federated Oversight</span>
              <h3 className="text-2xl font-bold text-slate-900 font-display">
                State-wise Performance & Utilization Leaderboard
              </h3>
              <p className="text-xs text-slate-500 font-primary">
                Compare MPLADS fund utilization, total sanctioned capital, and AI risk alerts across Indian states.
              </p>
            </div>

            {/* Sort Buttons */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold font-primary">
              <span className="text-[11px] text-slate-400 px-2 font-medium">Sort:</span>
              <button
                onClick={() => setStateSortKey("utilization")}
                className={`px-3 py-1 rounded-lg transition-all ${
                  stateSortKey === "utilization"
                    ? "bg-white text-slate-900 shadow-2xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Utilization %
              </button>
              <button
                onClick={() => setStateSortKey("sanctionedCr")}
                className={`px-3 py-1 rounded-lg transition-all ${
                  stateSortKey === "sanctionedCr"
                    ? "bg-white text-slate-900 shadow-2xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Sanctioned ₹
              </button>
              <button
                onClick={() => setStateSortKey("flaggedWorks")}
                className={`px-3 py-1 rounded-lg transition-all ${
                  stateSortKey === "flaggedWorks"
                    ? "bg-white text-slate-900 shadow-2xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Risk Flags
              </button>
            </div>
          </div>

          {/* States Table & Comparison Bars */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-primary">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                  <th className="pb-3 font-semibold">State / UT</th>
                  <th className="pb-3 font-semibold text-center">MPs</th>
                  <th className="pb-3 font-semibold text-right">Sanctioned (₹ Cr)</th>
                  <th className="pb-3 font-semibold text-right">Expenditure (₹ Cr)</th>
                  <th className="pb-3 font-semibold px-4">Fund Utilization</th>
                  <th className="pb-3 font-semibold text-center">Flags</th>
                  <th className="pb-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sortedStates.map((st) => (
                  <tr key={st.code} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 font-bold text-slate-900 flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md bg-blue-50 text-blue-700 font-mono font-bold text-[10px] flex items-center justify-center">
                        {st.code}
                      </div>
                      <span>{st.name}</span>
                    </td>
                    <td className="py-3.5 text-center text-slate-600 font-mono font-medium">
                      {st.mps}
                    </td>
                    <td className="py-3.5 text-right font-mono font-bold text-slate-900">
                      ₹{st.sanctionedCr.toLocaleString()} Cr
                    </td>
                    <td className="py-3.5 text-right font-mono text-slate-600">
                      ₹{st.expenditureCr.toLocaleString()} Cr
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              st.utilization >= 85
                                ? "bg-emerald-500"
                                : st.utilization >= 70
                                ? "bg-amber-500"
                                : "bg-rose-500"
                            }`}
                            style={{ width: `${st.utilization}%` }}
                          />
                        </div>
                        <span className="font-mono font-bold text-slate-900 w-12 text-right">
                          {st.utilization}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 text-center">
                      {st.flaggedWorks > 0 ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 font-mono">
                          {st.flaggedWorks}
                        </span>
                      ) : (
                        <span className="text-slate-300 text-xs">—</span>
                      )}
                    </td>
                    <td className="py-3.5 text-right">
                      <Link
                        href={`/track-area?state=${st.code}`}
                        className="text-blue-600 hover:text-blue-800 font-bold inline-flex items-center gap-1"
                      >
                        <span>Drilldown</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Track My Area: Constituency Explorer */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <span className="civic-eyebrow">Citizen Transparency Tool</span>
              <h3 className="text-2xl font-bold text-slate-900 font-display">
                Track My Area: Parliamentary Constituencies
              </h3>
              <p className="text-xs text-slate-500 font-primary">
                Search developmental works, fund utilization, and AI audit score in your constituency.
              </p>
            </div>

            {/* Quick Search */}
            <div className="relative max-w-xs w-full">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Search constituency or state..."
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-primary focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-2xs"
              />
            </div>
          </div>

          {/* Constituency Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredConstituencies.slice(0, 8).map((c) => (
              <ConstituencyCard key={c.id} constituency={c} />
            ))}
          </div>

          <div className="mt-4 text-center">
            <Link
              href="/track-area"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors font-primary"
            >
              <span>Explore All 543 Constituencies</span>
              <ArrowRight className="w-3.5 h-3.5 text-blue-400" />
            </Link>
          </div>
        </div>

        {/* SIH / Authority Hero Spotlight Box: PRJ-2024-003 */}
        <div className="bg-gradient-to-br from-slate-900 to-blue-950 text-white rounded-3xl p-6 sm:p-10 shadow-xl relative overflow-hidden">
          <div className="relative z-10 max-w-2xl space-y-4 font-primary">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-amber-400/20 text-amber-300 border border-amber-400/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>SIH 2026 Golden Demo Case • 30-Second Hero Audit</span>
            </div>

            <h3 className="text-2xl sm:text-4xl font-extrabold text-white font-display tracking-tight leading-tight">
              Community Health Center Wing: PRJ-2024-003
            </h3>

            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Explore the explainable AI multi-signal fusion: 97% perceptual duplicate photo match (pHash), 1127% peer cost outlier, and 4.1× normative SLA stage delay. Experience the full human-in-the-loop audit workflow.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Link
                href="/investigation/PRJ-2024-003"
                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs shadow-md transition-all inline-flex items-center gap-2"
              >
                <span>Open Hero Investigation</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/graph"
                className="px-5 py-3 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl font-semibold text-xs transition-all inline-flex items-center gap-2"
              >
                <span>View Entity Network</span>
              </Link>
              <Link
                href="/compare"
                className="px-5 py-3 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl font-semibold text-xs transition-all inline-flex items-center gap-2"
              >
                <GitCompare className="w-4 h-4 text-blue-300" />
                <span>Compare Constituencies</span>
              </Link>
            </div>
          </div>

          {/* Decorative Background Accent */}
          <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none translate-x-12 translate-y-12">
            <ShieldAlert className="w-96 h-96 text-white" />
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
