"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRiskLensStore } from "@/lib/store";
import { formatINR } from "@/lib/utils";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { DataSourceBadge } from "@/components/cards/DataSourceBadge";
import {
  GitCompare,
  Building2,
  TrendingUp,
  FileCheck,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ShieldAlert,
} from "lucide-react";

export default function CompareConstituenciesPage() {
  const { constituencies, projects } = useRiskLensStore();
  const [constAId, setConstAId] = useState<string>(constituencies[0]?.id || "");
  const [constBId, setConstBId] = useState<string>(constituencies[1]?.id || constituencies[0]?.id || "");

  const constA = constituencies.find((c) => c.id === constAId) || constituencies[0];
  const constB = constituencies.find((c) => c.id === constBId) || constituencies[1] || constituencies[0];

  const getUtil = (c: typeof constA) =>
    c.totalSanctionedINR > 0
      ? Math.min(100, Math.round((c.totalDisbursedINR / c.totalSanctionedINR) * 100))
      : 75;

  const utilA = getUtil(constA);
  const utilB = getUtil(constB);

  return (
    <DashboardShell>
      <div className="space-y-8 font-primary">
        {/* Header */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-xs">
          <span className="civic-eyebrow">CITIZEN COMPARISON & BENCHMARKING</span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-display tracking-tight mt-1">
            Compare Constituencies Side-by-Side
          </h1>
          <p className="text-slate-600 text-xs sm:text-sm mt-2 max-w-2xl leading-relaxed">
            Directly benchmark two parliamentary constituencies on fund utilization, work completion rates, spending efficiency, and explainable AI risk intelligence notices.
          </p>

          <div className="mt-4 flex items-center gap-3 text-xs text-slate-500">
            <DataSourceBadge type="synthetic" />
            <span>• Direct Peer-to-Peer Accountability</span>
          </div>
        </div>

        {/* Selection Bar */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Constituency A:
            </label>
            <select
              value={constAId}
              onChange={(e) => setConstAId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none"
            >
              {constituencies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.id} ({c.stateCode})
                </option>
              ))}
            </select>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Constituency B:
            </label>
            <select
              value={constBId}
              onChange={(e) => setConstBId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none"
            >
              {constituencies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.id} ({c.stateCode})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Side-by-Side Comparison Matrix */}
        <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-lg text-slate-900 font-display">
              Comparative Performance Metrics
            </h3>
            <span className="text-xs text-slate-400 font-mono">18th Lok Sabha (2024–29)</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/60 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-6 w-1/3">Metric Indicator</th>
                  <th className="py-3 px-6 w-1/3 font-bold text-slate-900 text-base font-display">
                    {constA.id}
                  </th>
                  <th className="py-3 px-6 w-1/3 font-bold text-slate-900 text-base font-display">
                    {constB.id}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-primary">
                {/* State */}
                <tr className="hover:bg-slate-50/50">
                  <td className="py-3 px-6 text-slate-500 font-medium">State / UT Jurisdiction</td>
                  <td className="py-3 px-6 font-bold text-slate-900">{constA.stateCode}</td>
                  <td className="py-3 px-6 font-bold text-slate-900">{constB.stateCode}</td>
                </tr>

                {/* Total Sanctioned */}
                <tr className="hover:bg-slate-50/50">
                  <td className="py-3 px-6 text-slate-500 font-medium">Total Sanctioned Capital</td>
                  <td className="py-3 px-6 font-bold font-mono text-slate-900">
                    {formatINR(constA.totalSanctionedINR)}
                  </td>
                  <td className="py-3 px-6 font-bold font-mono text-slate-900">
                    {formatINR(constB.totalSanctionedINR)}
                  </td>
                </tr>

                {/* Total Disbursed */}
                <tr className="hover:bg-slate-50/50">
                  <td className="py-3 px-6 text-slate-500 font-medium">Total Expenditure Released</td>
                  <td className="py-3 px-6 font-bold font-mono text-slate-900">
                    {formatINR(constA.totalDisbursedINR)}
                  </td>
                  <td className="py-3 px-6 font-bold font-mono text-slate-900">
                    {formatINR(constB.totalDisbursedINR)}
                  </td>
                </tr>

                {/* Fund Utilization Rate */}
                <tr className="hover:bg-slate-50/50 bg-blue-50/20">
                  <td className="py-3.5 px-6 font-bold text-slate-700">Fund Utilization Rate</td>
                  <td className="py-3.5 px-6">
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            utilA >= 85 ? "bg-emerald-500" : utilA >= 70 ? "bg-amber-500" : "bg-rose-500"
                          }`}
                          style={{ width: `${utilA}%` }}
                        />
                      </div>
                      <span className="font-bold font-mono text-slate-900">{utilA}%</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-6">
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            utilB >= 85 ? "bg-emerald-500" : utilB >= 70 ? "bg-amber-500" : "bg-rose-500"
                          }`}
                          style={{ width: `${utilB}%` }}
                        />
                      </div>
                      <span className="font-bold font-mono text-slate-900">{utilB}%</span>
                    </div>
                  </td>
                </tr>

                {/* Total Works */}
                <tr className="hover:bg-slate-50/50">
                  <td className="py-3 px-6 text-slate-500 font-medium">Total Recommended Works</td>
                  <td className="py-3 px-6 font-bold font-mono text-slate-900">
                    {constA.totalProjects} Works
                  </td>
                  <td className="py-3 px-6 font-bold font-mono text-slate-900">
                    {constB.totalProjects} Works
                  </td>
                </tr>

                {/* AI Risk Score */}
                <tr className="hover:bg-slate-50/50">
                  <td className="py-3.5 px-6 font-bold text-slate-700">AI Risk Intelligence Score</td>
                  <td className="py-3.5 px-6">
                    <span
                      className={`font-mono font-bold text-xs px-2.5 py-1 rounded-full ${
                        constA.averageRiskScore >= 50
                          ? "bg-rose-100 text-rose-700"
                          : "bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      {constA.averageRiskScore} / 100
                    </span>
                  </td>
                  <td className="py-3.5 px-6">
                    <span
                      className={`font-mono font-bold text-xs px-2.5 py-1 rounded-full ${
                        constB.averageRiskScore >= 50
                          ? "bg-rose-100 text-rose-700"
                          : "bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      {constB.averageRiskScore} / 100
                    </span>
                  </td>
                </tr>

                {/* Active Flags */}
                <tr className="hover:bg-slate-50/50">
                  <td className="py-3 px-6 text-slate-500 font-medium">Active Review Flags</td>
                  <td className="py-3 px-6">
                    {constA.openFlaggedCasesCount > 0 ? (
                      <span className="inline-flex items-center gap-1 font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                        <AlertTriangle className="w-3 h-3 text-amber-600" />
                        {constA.openFlaggedCasesCount} Cases Flagged
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Zero open flags
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-6">
                    {constB.openFlaggedCasesCount > 0 ? (
                      <span className="inline-flex items-center gap-1 font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                        <AlertTriangle className="w-3 h-3 text-amber-600" />
                        {constB.openFlaggedCasesCount} Cases Flagged
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Zero open flags
                      </span>
                    )}
                  </td>
                </tr>

                {/* Drilldown Actions */}
                <tr className="bg-slate-50/70">
                  <td className="py-4 px-6 font-bold text-slate-700">Detailed Work Inspection</td>
                  <td className="py-4 px-6">
                    <Link
                      href={`/projects?constituency=${encodeURIComponent(constA.id)}`}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs inline-flex items-center gap-1.5 shadow-2xs"
                    >
                      <span>Inspect {constA.id} Works</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </td>
                  <td className="py-4 px-6">
                    <Link
                      href={`/projects?constituency=${encodeURIComponent(constB.id)}`}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs inline-flex items-center gap-1.5 shadow-2xs"
                    >
                      <span>Inspect {constB.id} Works</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
