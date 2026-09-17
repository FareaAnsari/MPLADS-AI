"use client";

import React, { useState } from "react";
import Link from "next/link";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { DataSourceBadge } from "@/components/cards/DataSourceBadge";
import {
  Building2,
  TrendingUp,
  FileCheck,
  ChevronRight,
  ArrowRight,
  Sparkles,
  MapPin,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

interface StateData {
  code: string;
  name: string;
  mps: number;
  sanctionedCr: number;
  expenditureCr: number;
  utilization: number;
  completedWorks: number;
  flaggedWorks: number;
  topSector: string;
}

const ALL_STATES: StateData[] = [
  { code: "MH", name: "Maharashtra", mps: 48, sanctionedCr: 2140.0, expenditureCr: 1887.4, utilization: 88.2, completedWorks: 492, flaggedWorks: 1, topSector: "Roads & Bridges" },
  { code: "GJ", name: "Gujarat", mps: 26, sanctionedCr: 1280.0, expenditureCr: 1105.9, utilization: 86.4, completedWorks: 318, flaggedWorks: 0, topSector: "Drinking Water" },
  { code: "KA", name: "Karnataka", mps: 28, sanctionedCr: 1360.0, expenditureCr: 1116.5, utilization: 82.1, completedWorks: 342, flaggedWorks: 2, topSector: "Education & Schools" },
  { code: "TN", name: "Tamil Nadu", mps: 39, sanctionedCr: 1820.0, expenditureCr: 1465.1, utilization: 80.5, completedWorks: 430, flaggedWorks: 1, topSector: "Public Health" },
  { code: "RJ", name: "Rajasthan", mps: 25, sanctionedCr: 1210.0, expenditureCr: 941.3, utilization: 77.8, completedWorks: 285, flaggedWorks: 2, topSector: "Irrigation & Water" },
  { code: "AP", name: "Andhra Pradesh", mps: 25, sanctionedCr: 1190.0, expenditureCr: 916.3, utilization: 77.0, completedWorks: 270, flaggedWorks: 1, topSector: "Community Halls" },
  { code: "MP", name: "Madhya Pradesh", mps: 29, sanctionedCr: 1390.0, expenditureCr: 1042.5, utilization: 75.0, completedWorks: 310, flaggedWorks: 3, topSector: "Rural Roads" },
  { code: "UP", name: "Uttar Pradesh", mps: 80, sanctionedCr: 3890.0, expenditureCr: 2886.3, utilization: 74.2, completedWorks: 840, flaggedWorks: 6, topSector: "Roads & Pathways" },
  { code: "WB", name: "West Bengal", mps: 42, sanctionedCr: 2010.0, expenditureCr: 1433.1, utilization: 71.3, completedWorks: 410, flaggedWorks: 3, topSector: "Sanitation & Water" },
  { code: "BR", name: "Bihar", mps: 40, sanctionedCr: 1950.0, expenditureCr: 1333.8, utilization: 68.4, completedWorks: 380, flaggedWorks: 5, topSector: "Education" },
  { code: "OD", name: "Odisha", mps: 21, sanctionedCr: 980.0, expenditureCr: 656.6, utilization: 67.0, completedWorks: 215, flaggedWorks: 2, topSector: "Drinking Water" },
  { code: "KL", name: "Kerala", mps: 20, sanctionedCr: 940.0, expenditureCr: 799.0, utilization: 85.0, completedWorks: 260, flaggedWorks: 1, topSector: "Public Health" },
  { code: "PB", name: "Punjab", mps: 13, sanctionedCr: 620.0, expenditureCr: 508.4, utilization: 82.0, completedWorks: 160, flaggedWorks: 0, topSector: "Education & Sports" },
  { code: "HR", name: "Haryana", mps: 10, sanctionedCr: 480.0, expenditureCr: 379.2, utilization: 79.0, completedWorks: 125, flaggedWorks: 1, topSector: "Community Infra" },
];

export default function StatesOverviewPage() {
  const [sortKey, setSortKey] = useState<"utilization" | "sanctionedCr" | "flaggedWorks" | "mps">("utilization");
  const [search, setSearch] = useState("");

  const sorted = [...ALL_STATES]
    .filter((s) => s.name.toLowerCase().includes(search.toLowerCase()) || s.code.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortKey === "utilization") return b.utilization - a.utilization;
      if (sortKey === "sanctionedCr") return b.sanctionedCr - a.sanctionedCr;
      if (sortKey === "flaggedWorks") return b.flaggedWorks - a.flaggedWorks;
      return b.mps - a.mps;
    });

  return (
    <DashboardShell>
      <div className="space-y-8 font-primary">
        {/* Page Header */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-xs">
          <span className="civic-eyebrow">NATIONAL MPLADS GEOGRAPHY</span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-display tracking-tight mt-1">
            States & Union Territories Performance
          </h1>
          <p className="text-slate-600 text-xs sm:text-sm mt-2 max-w-2xl leading-relaxed">
            Federated comparison of MPLADS statutory fund utilization, developmental sanctions, and explainable AI risk intelligence across Indian states.
          </p>

          <div className="mt-4 flex items-center gap-3 text-xs text-slate-500">
            <DataSourceBadge type="synthetic" />
            <span>• Verified Against MoSPI Guidelines 2023</span>
          </div>
        </div>

        {/* Filter & Sort Bar */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search state name or code..."
            className="w-full sm:max-w-xs px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none"
          />

          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <span className="text-[11px] text-slate-400 px-2 font-medium">Rank by:</span>
            <button
              onClick={() => setSortKey("utilization")}
              className={`px-3 py-1 rounded-lg transition-all ${
                sortKey === "utilization" ? "bg-white text-slate-900 shadow-2xs font-bold" : "text-slate-600"
              }`}
            >
              Utilization %
            </button>
            <button
              onClick={() => setSortKey("sanctionedCr")}
              className={`px-3 py-1 rounded-lg transition-all ${
                sortKey === "sanctionedCr" ? "bg-white text-slate-900 shadow-2xs font-bold" : "text-slate-600"
              }`}
            >
              Funds (₹ Cr)
            </button>
            <button
              onClick={() => setSortKey("flaggedWorks")}
              className={`px-3 py-1 rounded-lg transition-all ${
                sortKey === "flaggedWorks" ? "bg-white text-slate-900 shadow-2xs font-bold" : "text-slate-600"
              }`}
            >
              Risk Flags
            </button>
          </div>
        </div>

        {/* State Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {sorted.map((st) => (
            <div key={st.code} className="civic-card p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 font-mono font-bold text-sm flex items-center justify-center border border-blue-100">
                      {st.code}
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-slate-900 font-display">
                        {st.name}
                      </h3>
                      <div className="text-[11px] text-slate-500 font-medium">
                        {st.mps} Parliamentary Seats
                      </div>
                    </div>
                  </div>

                  <span
                    className={`font-mono font-bold text-xs px-2.5 py-1 rounded-full ${
                      st.utilization >= 85
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : st.utilization >= 70
                        ? "bg-amber-50 text-amber-700 border border-amber-200"
                        : "bg-rose-50 text-rose-700 border border-rose-200"
                    }`}
                  >
                    {st.utilization}%
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-4">
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

                <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100">
                  <div>
                    <span className="text-slate-400 text-[11px] block">Sanctioned</span>
                    <span className="font-bold font-mono text-slate-800">
                      ₹{st.sanctionedCr.toLocaleString()} Cr
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px] block">Released</span>
                    <span className="font-bold font-mono text-slate-800">
                      ₹{st.expenditureCr.toLocaleString()} Cr
                    </span>
                  </div>
                </div>

                <div className="mt-3 text-[11px] text-slate-500">
                  <span className="text-slate-400">Primary Sector: </span>
                  <span className="font-semibold text-slate-700">{st.topSector}</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium text-[11px]">
                  {st.flaggedWorks > 0 ? (
                    <span className="text-amber-700 font-semibold flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 text-amber-500" />
                      {st.flaggedWorks} review notices
                    </span>
                  ) : (
                    <span className="text-emerald-700 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                      Zero active flags
                    </span>
                  )}
                </span>

                <Link
                  href={`/track-area?state=${st.code}`}
                  className="font-bold text-blue-600 hover:text-blue-800 inline-flex items-center gap-1"
                >
                  <span>Explore MPs</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardShell>
  );
}
