"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRiskLensStore } from "@/lib/store";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { DataSourceBadge } from "@/components/cards/DataSourceBadge";
import { evaluateConstituencyEquity } from "@/lib/engine/equity-radar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { formatINR } from "@/lib/utils";
import { Compass, ShieldCheck, HeartHandshake, ArrowRight, Building2, TrendingDown } from "lucide-react";

export default function EquityRadarPage() {
  const { constituencies, projects } = useRiskLensStore();
  const [filterMode, setFilterMode] = useState<"all" | "underserved">("underserved");

  const equityMetrics = constituencies.map((c) => {
    const cProjects = projects.filter((p) => p.constituencyId === c.id);
    return evaluateConstituencyEquity(c, cProjects);
  });

  const filtered = filterMode === "all"
    ? equityMetrics
    : equityMetrics.filter((m) => m.isUnderServed);

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="civic-eyebrow">EQUITY & GEOGRAPHIC FAIRNESS RADAR</span>
            <div className="flex items-center gap-2 mt-1">
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 font-display">
                Civic Equity & Neglected Constituency Radar
              </h1>
              <DataSourceBadge type="synthetic" />
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1.5 font-primary">
              The pro-fairness counterpart to risk detection: Identifies chronic fund under-utilization, delayed sanctioning velocity, and physical inspection deficits across parliamentary constituencies.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilterMode("underserved")}
              className={`text-xs px-3.5 py-2 rounded-xl font-bold transition-colors ${
                filterMode === "underserved"
                  ? "bg-cyan-700 text-white shadow-xs"
                  : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}
            >
              Underserved Constituencies ({equityMetrics.filter((m) => m.isUnderServed).length})
            </button>
            <button
              onClick={() => setFilterMode("all")}
              className={`text-xs px-3.5 py-2 rounded-xl font-bold transition-colors ${
                filterMode === "all"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}
            >
              All 24 Constituencies
            </button>
          </div>
        </div>

        {/* Narrative Box: The Ethical Answer to MP Surveillance Concerns */}
        <div className="p-5 bg-gradient-to-r from-cyan-900 via-slate-900 to-slate-900 text-white rounded-2xl shadow-sm border border-cyan-800/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
              <HeartHandshake className="w-3.5 h-3.5 text-cyan-300" />
              Pro-Fairness Governance Guarantee
            </div>
            <h2 className="text-lg font-bold text-white">
              Solving Chronic Civic Neglect Alongside Waste Detection
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              RiskLens is not merely a surveillance mechanism. It actively champions marginalized and remote constituencies by highlighting where statutory ₹5.00 Cr annual entitlements remain unspent, languishing without administrative sanction.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white/10 border border-white/10 text-center shrink-0 min-w-[160px]">
            <span className="text-[10px] text-cyan-200 uppercase font-semibold block">
              Flagged for Support
            </span>
            <span className="text-2xl font-extrabold text-white">
              {equityMetrics.filter((m) => m.isUnderServed).length}
            </span>
            <span className="text-[11px] text-slate-400 block">Constituencies</span>
          </div>
        </div>

        {/* Equity Radar Table (Strictly Non-Alert Styling) */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Constituency ID</TableHead>
              <TableHead>Jurisdiction</TableHead>
              <TableHead>Sanctioned Works</TableHead>
              <TableHead>Committed Budget</TableHead>
              <TableHead>Utilization Rate</TableHead>
              <TableHead>Inspection Coverage</TableHead>
              <TableHead>Equity Status</TableHead>
              <TableHead>Equity Findings</TableHead>
              <TableHead className="text-right">Explore</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((metric) => (
              <TableRow key={metric.constituencyId}>
                <TableCell className="font-mono text-xs font-bold text-slate-900">
                  {metric.constituencyId}
                </TableCell>
                <TableCell className="text-xs text-slate-600">
                  {metric.stateCode}
                </TableCell>
                <TableCell className="text-xs font-semibold text-slate-800">
                  {metric.totalWorksCount} works
                </TableCell>
                <TableCell className="text-xs font-bold text-slate-900">
                  {formatINR(metric.entitlementSanctionedINR)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full bg-cyan-600 rounded-full"
                        style={{ width: `${Math.min(100, metric.utilizationRatePct)}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold text-slate-800">
                      {metric.utilizationRatePct}%
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-xs font-medium text-slate-700">
                  {metric.inspectionCoveragePct}% verified
                </TableCell>
                <TableCell>
                  <span
                    className={`text-xs font-semibold px-2.5 py-0.5 rounded-full inline-block ${
                      metric.neglectSeverityTier === "Critically Underserved"
                        ? "bg-cyan-100 text-cyan-900 border border-cyan-300"
                        : metric.neglectSeverityTier === "Attention Required"
                        ? "bg-slate-100 text-slate-800 border border-slate-200"
                        : "bg-emerald-50 text-emerald-800"
                    }`}
                  >
                    {metric.neglectSeverityTier}
                  </span>
                </TableCell>
                <TableCell className="text-xs text-slate-600 max-w-xs leading-relaxed">
                  {metric.equityRationale}
                </TableCell>
                <TableCell className="text-right">
                  <Link
                    href={`/projects?constituency=${encodeURIComponent(metric.constituencyId)}`}
                    className="text-xs font-semibold text-cyan-700 hover:text-cyan-800 inline-flex items-center gap-1"
                  >
                    Catalog
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </DashboardShell>
  );
}
