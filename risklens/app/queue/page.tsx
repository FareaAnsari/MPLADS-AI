"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRiskLensStore } from "@/lib/store";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { DataSourceBadge } from "@/components/cards/DataSourceBadge";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { formatINR } from "@/lib/utils";
import { ArrowRight, Filter, AlertTriangle, ShieldCheck, Clock, ExternalLink } from "lucide-react";

export default function InvestigationQueuePage() {
  const { projects, currentRole } = useRiskLensStore();
  const [filterSignal, setFilterSignal] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Flagged projects with score >= 35 or active investigation case
  const flaggedProjects = projects.filter(
    (p) => p.riskScore.compositeScore >= 35 || p.investigationCase
  );

  const filtered = flaggedProjects.filter((p) => {
    if (filterSignal !== "all") {
      const hasSignal = p.riskScore.breakdown.some(
        (b) => b.isTriggered && b.signal === filterSignal
      );
      if (!hasSignal) return false;
    }
    if (filterStatus !== "all") {
      const status = p.investigationCase?.status || "Open";
      if (status !== filterStatus) return false;
    }
    return true;
  });

  return (
    <DashboardShell>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="civic-eyebrow">EXPLAINABLE RISK INTELLIGENCE & AUDIT DISPATCH</span>
            <div className="flex items-center gap-2 mt-1">
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 font-display">
                Investigation & Verification Queue
              </h1>
              <DataSourceBadge type="synthetic" />
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1.5 font-primary">
              Active projects flagged by the Multi-Signal Fusion Engine awaiting field physical inspection or officer verification.
            </p>
          </div>

          <Link
            href="/investigation/HERO-MPLADS-001"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors shrink-0 font-primary"
          >
            <span>Launch Hero Spotlight</span>
            <ArrowRight className="w-3.5 h-3.5 text-blue-400" />
          </Link>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-b border-slate-200/80 pb-4">
          <span className="text-xs font-semibold text-slate-500 flex items-center gap-1 mr-2">
            <Filter className="w-3.5 h-3.5" /> Signal:
          </span>
          {[
            { id: "all", label: "All Flagged Signals" },
            { id: "cost_anomaly", label: "Cost Outlier" },
            { id: "sla_delay", label: "SLA Delay" },
            { id: "photo_similarity", label: "Duplicate Photo (pHash)" },
            { id: "payment_anomaly", label: "Disbursement & UC" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterSignal(tab.id)}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                filterSignal === tab.id
                  ? "bg-slate-900 text-white shadow-2xs font-semibold"
                  : "bg-white border border-slate-200/80 text-slate-700 hover:bg-slate-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Queue Table */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[110px]">Work ID</TableHead>
              <TableHead>Project Title & Sector</TableHead>
              <TableHead>Constituency</TableHead>
              <TableHead>Sanctioned</TableHead>
              <TableHead className="w-[100px]">Risk Score</TableHead>
              <TableHead>Why Flagged? (Signals)</TableHead>
              <TableHead>Case Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((proj) => {
              const score = proj.riskScore.compositeScore;
              const isHero = proj.id === "HERO-MPLADS-001";
              const caseStatus = proj.investigationCase?.status || "Open";

              return (
                <TableRow
                  key={proj.id}
                  className={isHero ? "bg-amber-50/30 hover:bg-amber-50/60" : ""}
                >
                  <TableCell className="font-mono text-xs font-bold text-slate-900">
                    <div className="flex items-center gap-1.5">
                      {proj.id}
                      {isHero && (
                        <span className="text-[10px] bg-amber-500 text-white font-bold px-1.5 py-0.2 rounded">
                          HERO
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-semibold text-slate-900 text-sm">{proj.title}</div>
                    <div className="text-xs text-slate-500">{proj.workCategory}</div>
                  </TableCell>
                  <TableCell className="text-xs font-medium text-slate-600">
                    {proj.constituencyId}
                  </TableCell>
                  <TableCell className="text-xs font-semibold text-slate-900">
                    {formatINR(proj.sanctionedAmountINR)}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center font-bold px-2 py-0.5 rounded-full text-xs ${
                        score >= 60
                          ? "bg-red-50 text-red-700 border border-red-200"
                          : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}
                    >
                      {score} / 100
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {proj.riskScore.breakdown
                        .filter((b) => b.isTriggered)
                        .map((b) => (
                          <span
                            key={b.signal}
                            className="text-[10px] font-medium bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200/60"
                          >
                            {b.label}
                          </span>
                        ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        caseStatus === "Escalated"
                          ? "alert"
                          : caseStatus.startsWith("Resolved")
                          ? "success"
                          : "warning"
                      }
                    >
                      {caseStatus}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Link
                      href={`/investigation/${proj.id}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 p-1 hover:bg-blue-50 rounded transition-colors"
                    >
                      Review
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </DashboardShell>
  );
}
