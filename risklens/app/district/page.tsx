"use client";

import React from "react";
import Link from "next/link";
import { useRiskLensStore } from "@/lib/store";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { DataSourceBadge } from "@/components/cards/DataSourceBadge";
import { ProjectCard } from "@/components/cards/ProjectCard";
import { ConstituencyCard } from "@/components/cards/ConstituencyCard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { formatINR } from "@/lib/utils";
import {
  ShieldAlert,
  FolderKanban,
  CheckCircle2,
  TrendingUp,
  ArrowRight,
  Sparkles,
  AlertTriangle,
  Building2,
} from "lucide-react";

export default function DistrictOverviewPage() {
  const { projects, constituencies, currentRole } = useRiskLensStore();

  const totalSanctioned = projects.reduce((acc, p) => acc + p.sanctionedAmountINR, 0);
  const totalDisbursed = projects.reduce((acc, p) => acc + p.expenditureAmountINR, 0);
  const highRiskProjects = projects.filter((p) => p.riskScore.compositeScore >= 60);
  const moderateRiskProjects = projects.filter(
    (p) => p.riskScore.compositeScore >= 35 && p.riskScore.compositeScore < 60
  );
  const cleanProjects = projects.filter((p) => p.riskScore.compositeScore < 35);

  const heroProject = projects.find((p) => p.id === "HERO-MPLADS-001");

  return (
    <DashboardShell>
      <div className="space-y-8">
        {/* Top Pitch Spotlight Callout Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-2xl p-6 shadow-md border border-slate-700/60 relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                <Sparkles className="w-3 h-3 text-blue-400" />
                SIH 2026 Judge Demo Flow
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-white">
                Explainable AI Risk-Intelligence Layer over eSAKSHI
              </h1>
              <p className="text-xs text-slate-300 leading-relaxed">
                Detects timeline bottlenecks, peer cost outliers, and duplicate completion evidence across MPLADS works. Every score includes a mathematical &quot;Why flagged?&quot; breakdown and routes to human authority action.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <Link
                href="/investigation/HERO-MPLADS-001"
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2"
              >
                <span>30-Second Hero Spotlight</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/how-it-works"
                className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-xl transition-colors flex items-center justify-center"
              >
                How Scoring Works
              </Link>
            </div>
          </div>
        </div>

        {/* Executive Metric Cards (Inspired by Financial UI Reference) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-slate-200/80">
            <CardContent className="p-5">
              <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
                <span>Sanctioned Entitlement</span>
                <DataSourceBadge type="synthetic" />
              </div>
              <div className="text-2xl font-extrabold tracking-tight text-slate-900">
                {formatINR(totalSanctioned)}
              </div>
              <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-medium mt-2">
                <TrendingUp className="w-3 h-3" />
                Across {projects.length} indexed works
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200/80">
            <CardContent className="p-5">
              <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
                <span>Total Disbursed</span>
                <span className="text-[11px] font-semibold text-slate-600">
                  {((totalDisbursed / totalSanctioned) * 100).toFixed(1)}% Ratio
                </span>
              </div>
              <div className="text-2xl font-extrabold tracking-tight text-slate-900">
                {formatINR(totalDisbursed)}
              </div>
              <div className="text-[11px] text-slate-500 mt-2">
                Verified via payment tranches
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200/80">
            <CardContent className="p-5">
              <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
                <span>Flagged for Review</span>
                <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-md">
                  Action Required
                </span>
              </div>
              <div className="text-2xl font-extrabold tracking-tight text-red-600">
                {highRiskProjects.length} Cases
              </div>
              <div className="text-[11px] text-slate-500 mt-2">
                Composite Score &gt;= 60/100
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200/80">
            <CardContent className="p-5">
              <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
                <span>Under Monitoring</span>
                <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
                  Inconclusive
                </span>
              </div>
              <div className="text-2xl font-extrabold tracking-tight text-amber-600">
                {moderateRiskProjects.length} Cases
              </div>
              <div className="text-[11px] text-slate-500 mt-2">
                Score 35 to 59 / 100
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Spotlight Anchor Project Section */}
        {heroProject && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                Anchor Demonstration Spotlight Project
              </h2>
              <span className="text-xs text-slate-500">
                Demonstrates all 5 explainable risk signals simultaneously
              </span>
            </div>
            <ProjectCard project={heroProject} />
          </div>
        )}

        {/* Flagged Cases Priority Queue Preview */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Priority Verification Queue
              </h2>
              <p className="text-xs text-slate-500">
                Highest risk-weighted works awaiting field inspection or authority disposition
              </p>
            </div>
            <Link
              href="/queue"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              View Full Queue ({highRiskProjects.length + moderateRiskProjects.length})
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {highRiskProjects.slice(0, 6).map((proj) => (
              <ProjectCard key={proj.id} project={proj} />
            ))}
          </div>
        </div>

        {/* Anonymized Constituencies Benchmarking Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Constituency Allocation & Risk Baselines
              </h2>
              <p className="text-xs text-slate-500">
                Deterministic anonymized constituencies (Constituency A-01 through X-24)
              </p>
            </div>
            <DataSourceBadge type="synthetic" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {constituencies.slice(0, 8).map((c) => (
              <ConstituencyCard key={c.id} constituency={c} />
            ))}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
