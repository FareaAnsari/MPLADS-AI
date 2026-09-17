"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Navbar } from "./Navbar";
import { useRiskLensStore } from "@/lib/store";
import { DataSourceBadge } from "@/components/cards/DataSourceBadge";
import {
  ChevronRight,
  ShieldCheck,
  Building2,
  Lock,
  FileCheck2,
  Info,
} from "lucide-react";

export const DashboardShell: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const pathname = usePathname();
  const { currentRole } = useRiskLensStore();

  // Simple breadcrumb generator
  const getBreadcrumb = () => {
    if (pathname === "/") return "Overview Dashboard";
    if (pathname.startsWith("/track-area")) return "Track My Area";
    if (pathname.startsWith("/states")) return "States & UTs Performance";
    if (pathname.startsWith("/compare")) return "Constituency Comparison";
    if (pathname.startsWith("/queue")) return "Explainable Risk Queue";
    if (pathname.startsWith("/investigation")) return "Hero Case Investigation";
    if (pathname.startsWith("/graph")) return "Entity Relationship Network";
    if (pathname.startsWith("/inspections")) return "10% Inspection Optimizer";
    if (pathname.startsWith("/equity")) return "Equity Radar";
    if (pathname.startsWith("/district")) return "District Administration";
    if (pathname.startsWith("/projects")) return "Project Directory";
    if (pathname.startsWith("/how-it-works")) return "Methodology & Scoring";
    if (pathname.startsWith("/offline")) return "Offline Sync Mode";
    return pathname.replace("/", "").replace(/-/g, " ");
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-primary text-slate-900 antialiased">
      {/* Empowered Indian Navbar */}
      <Navbar />

      {/* Civic Breadcrumbs & Sub-header */}
      <div className="bg-white border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 py-2.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-1.5 text-slate-500 font-medium">
            <Link href="/" className="hover:text-slate-900 transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-900 font-semibold capitalize">
              {getBreadcrumb()}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 rounded-lg text-[11px] font-semibold text-slate-700">
              <Building2 className="w-3 h-3 text-blue-600" />
              <span className="capitalize">{currentRole} Jurisdiction Scope</span>
            </div>
            <div className="hidden sm:flex items-center gap-1 text-[11px] text-slate-500">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>eSAKSHI Verified Sync</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Page Canvas */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {children}
      </main>

      {/* Empowered Indian Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12 py-8 text-xs text-slate-500 font-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <div className="font-bold text-slate-900 flex items-center justify-center sm:justify-start gap-2">
              <span>Empowered Indian</span>
              <span className="text-slate-300">|</span>
              <span className="font-normal text-slate-600">MPLADS Risk Intelligence Layer</span>
            </div>
            <p className="text-[11px] text-slate-500 max-w-md">
              Making government data accessible, understandable, and accountable for every citizen and oversight official.
            </p>
          </div>

          <div className="flex flex-col sm:items-end gap-1.5 text-center sm:text-right">
            <div className="flex items-center justify-center sm:justify-end gap-3">
              <DataSourceBadge type="synthetic" />
              <span className="text-[11px] font-mono text-slate-400">MoSPI MPLADS Guidelines 2023</span>
            </div>
            <p className="text-[11px] text-slate-400">
              AI provides explainable decision support; statutory authority rests with human officials.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
