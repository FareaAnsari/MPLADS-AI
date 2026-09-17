"use client";

import React, { useState } from "react";
import { useRiskLensStore } from "@/lib/store";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { DataSourceBadge } from "@/components/cards/DataSourceBadge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { formatINR } from "@/lib/utils";
import { PEER_BENCHMARKS } from "@/lib/engine/peer-cost";
import { Coins, TrendingUp, AlertTriangle, Download, ArrowUpRight, CheckCircle2 } from "lucide-react";

export default function MoneyMonitoringPage() {
  const { projects } = useRiskLensStore();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const totalSanctioned = projects.reduce((acc, p) => acc + p.sanctionedAmountINR, 0);
  const totalDisbursed = projects.reduce((acc, p) => acc + p.expenditureAmountINR, 0);

  // Value at Risk = Sanctioned amount of high-risk flagged projects
  const highRiskProjects = projects.filter((p) => p.riskScore.compositeScore >= 60);
  const totalValueAtRisk = highRiskProjects.reduce((acc, p) => acc + p.sanctionedAmountINR, 0);

  const filtered = selectedCategory === "all"
    ? projects
    : projects.filter((p) => p.workCategory === selectedCategory);

  return (
    <DashboardShell>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Financial Compliance & Money Monitoring
              </h1>
              <DataSourceBadge type="synthetic" />
            </div>
            <p className="text-sm text-slate-500">
              Disbursement milestones, statutory utilization certificates (UC), and peer cohort cost benchmark tracking.
            </p>
          </div>

          <button
            onClick={() => alert("Simulated CSV Export: Downloaded compliance ledger.")}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 text-xs font-semibold rounded-xl shadow-2xs transition-colors shrink-0"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            Export Compliance Ledger (CSV)
          </button>
        </div>

        {/* Financial Rollup Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="border-slate-200/80">
            <CardContent className="p-5">
              <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
                <span>Total Statutory Allocation</span>
                <DataSourceBadge type="synthetic" />
              </div>
              <div className="text-2xl font-extrabold text-slate-900">
                {formatINR(totalSanctioned)}
              </div>
              <p className="text-[11px] text-slate-500 mt-2">
                Across {projects.length} works in 24 constituencies
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-200/80">
            <CardContent className="p-5">
              <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
                <span>Cumulative Disbursed</span>
                <span className="text-emerald-700 font-semibold text-xs">
                  {((totalDisbursed / totalSanctioned) * 100).toFixed(1)}% Disbursed
                </span>
              </div>
              <div className="text-2xl font-extrabold text-slate-900">
                {formatINR(totalDisbursed)}
              </div>
              <p className="text-[11px] text-slate-500 mt-2">
                Released through milestone-verified tranches
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-200/80 bg-red-50/30">
            <CardContent className="p-5">
              <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
                <span>Flagged Value-at-Risk</span>
                <span className="text-xs font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded">
                  {highRiskProjects.length} Cases
                </span>
              </div>
              <div className="text-2xl font-extrabold text-red-600">
                {formatINR(totalValueAtRisk)}
              </div>
              <p className="text-[11px] text-red-700/80 mt-2">
                Works flagged with composite risk score &ge; 60/100
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Cohort Cost Benchmark Reference Visualizer */}
        <Card>
          <CardHeader className="border-b border-slate-100 pb-3">
            <CardTitle className="text-base flex items-center justify-between">
              <span>Statutory Peer-Cohort Cost Ranges by Work Sector</span>
              <span className="text-xs font-normal text-slate-500">
                Outliers deviate &gt;1.5× peer maximum
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(PEER_BENCHMARKS).map(([category, bm]) => (
                <div
                  key={category}
                  className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/60 space-y-2 text-xs"
                >
                  <div className="font-semibold text-slate-900">{category}</div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-slate-400">Cohort Median:</span>
                    <span className="font-bold text-slate-800">{formatINR(bm.medianCostINR)}</span>
                  </div>
                  <div className="flex items-baseline justify-between text-[11px]">
                    <span className="text-slate-400">Standard Band:</span>
                    <span className="text-slate-600 font-medium">
                      {formatINR(bm.minRangeINR)} - {formatINR(bm.maxRangeINR)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Detailed Financial Ledger Table */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Project Expenditure & Compliance Ledger</h2>
            <div className="flex gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 font-medium"
              >
                <option value="all">All Sectors</option>
                {Object.keys(PEER_BENCHMARKS).map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Work ID</TableHead>
                <TableHead>Project Title</TableHead>
                <TableHead>Sanctioned</TableHead>
                <TableHead>Disbursed</TableHead>
                <TableHead>Peer Range</TableHead>
                <TableHead>Tranches & UC</TableHead>
                <TableHead className="text-right">Risk Score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.slice(0, 20).map((p) => {
                const isCostOutlier = p.sanctionedAmountINR > p.peerGroupRangeMaxINR * 1.5;

                return (
                  <TableRow key={p.id}>
                    <TableCell className="font-mono text-xs font-bold text-slate-900">
                      {p.id}
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold text-slate-900 text-xs">{p.title}</div>
                      <div className="text-[11px] text-slate-400">{p.workCategory}</div>
                    </TableCell>
                    <TableCell className="text-xs font-semibold text-slate-900">
                      {formatINR(p.sanctionedAmountINR)}
                    </TableCell>
                    <TableCell className="text-xs text-slate-700">
                      {formatINR(p.expenditureAmountINR)}
                    </TableCell>
                    <TableCell className="text-xs">
                      <span className={isCostOutlier ? "text-red-600 font-bold" : "text-slate-600"}>
                        {formatINR(p.peerGroupRangeMinINR)} - {formatINR(p.peerGroupRangeMaxINR)}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs">
                      <span className="font-medium text-slate-700">
                        {p.paymentTranches.length} Tranches (
                        {p.paymentTranches.filter((t) => t.utilizationCertificateSubmitted).length} UC)
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded ${
                          p.riskScore.compositeScore >= 60
                            ? "bg-red-100 text-red-700"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {p.riskScore.compositeScore}/100
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </DashboardShell>
  );
}
