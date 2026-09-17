"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRiskLensStore } from "@/lib/store";
import { formatINR } from "@/lib/utils";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { ConstituencyCard } from "@/components/cards/ConstituencyCard";
import { DataSourceBadge } from "@/components/cards/DataSourceBadge";
import {
  Search,
  Filter,
  MapPin,
  Building,
  ArrowRight,
  ShieldAlert,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  LayoutGrid,
  List,
} from "lucide-react";

export default function TrackMyAreaPage() {
  const { constituencies, projects } = useRiskLensStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedState, setSelectedState] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [riskFilter, setRiskFilter] = useState<"all" | "flagged" | "optimal">("all");

  const states = Array.from(new Set(constituencies.map((c) => c.stateCode))).sort();

  const filteredConstituencies = constituencies.filter((c) => {
    const matchesSearch =
      c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.stateCode.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesState = selectedState === "all" || c.stateCode === selectedState;
    const matchesRisk =
      riskFilter === "all" ||
      (riskFilter === "flagged" && c.openFlaggedCasesCount > 0) ||
      (riskFilter === "optimal" && c.openFlaggedCasesCount === 0);

    return matchesSearch && matchesState && matchesRisk;
  });

  return (
    <DashboardShell>
      <div className="space-y-8 font-primary">
        {/* Page Header */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-xs">
          <span className="civic-eyebrow">CITIZEN TRANSPARENCY & FIELD TRACKING</span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-display tracking-tight mt-1">
            Track My Area: Parliamentary Constituencies
          </h1>
          <p className="text-slate-600 text-xs sm:text-sm mt-2 max-w-2xl leading-relaxed">
            Search your Member of Parliament (MP), inspect developmental projects sanctioned under MPLADS, track expenditure utilization, and review AI risk intelligence notices.
          </p>

          <div className="mt-4 flex items-center gap-3 text-xs text-slate-500">
            <DataSourceBadge type="synthetic" />
            <span>• Anonymized Synthetic Names (Constituency A-14, Hon. MP A-14)</span>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Search Input */}
            <div className="relative min-w-[240px] flex-1 md:flex-initial">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search constituency (e.g. Constituency X-01)..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            {/* State Filter Dropdown */}
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none"
            >
              <option value="all">All States & UTs</option>
              {states.map((st) => (
                <option key={st} value={st}>
                  State: {st}
                </option>
              ))}
            </select>

            {/* Risk Status Filter */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setRiskFilter("all")}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  riskFilter === "all" ? "bg-white text-slate-900 shadow-2xs font-bold" : "text-slate-600"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setRiskFilter("flagged")}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  riskFilter === "flagged"
                    ? "bg-amber-500 text-white shadow-2xs font-bold"
                    : "text-slate-600"
                }`}
              >
                Flagged
              </button>
              <button
                onClick={() => setRiskFilter("optimal")}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  riskFilter === "optimal"
                    ? "bg-emerald-600 text-white shadow-2xs font-bold"
                    : "text-slate-600"
                }`}
              >
                Optimal
              </button>
            </div>
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">
              Showing {filteredConstituencies.length} of {constituencies.length}
            </span>
            <div className="flex items-center bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-lg transition-all ${
                  viewMode === "grid" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-400"
                }`}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`p-1.5 rounded-lg transition-all ${
                  viewMode === "table" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-400"
                }`}
                title="Table View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Results Container */}
        {filteredConstituencies.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800">No constituencies matched</h3>
            <p className="text-xs text-slate-500">
              Try adjusting your search terms or clearing state filters.
            </p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {filteredConstituencies.map((c) => (
              <ConstituencyCard key={c.id} constituency={c} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-primary">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[11px] bg-slate-50/50">
                    <th className="py-3 px-4">Constituency & State</th>
                    <th className="py-3 px-4 text-right">Sanctioned</th>
                    <th className="py-3 px-4 text-right">Expenditure</th>
                    <th className="py-3 px-4 text-center">Utilization</th>
                    <th className="py-3 px-4 text-center">AI Risk</th>
                    <th className="py-3 px-4 text-center">Works</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredConstituencies.map((c) => {
                    const util =
                      c.totalSanctionedINR > 0
                        ? Math.min(100, Math.round((c.totalDisbursedINR / c.totalSanctionedINR) * 100))
                        : 72;

                    return (
                      <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900">{c.id}</div>
                          <div className="text-[11px] text-slate-500">State: {c.stateCode}</div>
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                          {formatINR(c.totalSanctionedINR)}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono text-slate-600">
                          {formatINR(c.totalDisbursedINR)}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`font-mono font-bold px-2 py-0.5 rounded-md text-[11px] ${
                              util >= 85
                                ? "bg-emerald-50 text-emerald-700"
                                : util >= 70
                                ? "bg-amber-50 text-amber-700"
                                : "bg-rose-50 text-rose-700"
                            }`}
                          >
                            {util}%
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`font-mono font-bold px-2 py-0.5 rounded-full text-[11px] ${
                              c.averageRiskScore >= 50
                                ? "bg-rose-100 text-rose-700"
                                : "bg-emerald-100 text-emerald-700"
                            }`}
                          >
                            Score {c.averageRiskScore}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center font-mono font-semibold text-slate-700">
                          {c.totalProjects}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <Link
                            href={`/projects?constituency=${encodeURIComponent(c.id)}`}
                            className="text-blue-600 hover:text-blue-800 font-bold inline-flex items-center gap-1"
                          >
                            <span>Inspect</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
