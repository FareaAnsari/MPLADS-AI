"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useRiskLensStore } from "@/lib/store";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { DataSourceBadge } from "@/components/cards/DataSourceBadge";
import { RiskGauge } from "@/components/charts/RiskGauge";
import { InvestigationCopilot } from "@/components/investigation/InvestigationCopilot";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatINR } from "@/lib/utils";
import {
  ArrowLeft,
  ShieldAlert,
  Clock,
  Coins,
  MapPin,
  Image as ImageIcon,
  CheckCircle2,
  AlertOctagon,
  FileCheck2,
  ChevronRight,
  TrendingUp,
  Activity,
  Layers,
  Satellite,
  Lock,
  GitFork,
} from "lucide-react";

export default function InvestigationDetailPage() {
  const params = useParams();
  const projectId = (params?.projectId as string) || "HERO-MPLADS-001";
  const { projects, takeOfficerAction } = useRiskLensStore();

  const [officerNotes, setOfficerNotes] = useState("");
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  const project =
    projects.find((p) => p.id.toLowerCase() === projectId.toLowerCase()) ||
    (projectId.toLowerCase().includes("prj-2024-003") || projectId.toLowerCase().includes("hero")
      ? projects.find((p) => p.id === "HERO-MPLADS-001")
      : undefined);
  const refDuplicateProject = projects.find((p) => p.id === "PRJ-2023-088");

  if (!project) {
    return (
      <DashboardShell>
        <div className="text-center py-16 space-y-4">
          <h2 className="text-xl font-bold text-slate-800">Project Not Found</h2>
          <p className="text-sm text-slate-500">
            Work record with ID &apos;{projectId}&apos; does not exist in registry.
          </p>
          <Link href="/queue" className="text-blue-600 font-semibold text-sm hover:underline">
            Back to Investigation Queue
          </Link>
        </div>
      </DashboardShell>
    );
  }

  const investigationCase = project.investigationCase;
  const isHero = project.id === "HERO-MPLADS-001";
  const duplicatePhoto = project.photos.find((p) => p.isDuplicateFlagged);

  const handleAction = (action: "Mark False Alarm" | "Needs More Evidence" | "Confirm Issue") => {
    takeOfficerAction(project.id, action, officerNotes);
    setActionSuccessMsg(
      `Officer Action Recorded: '${action}'. Human verification ledger updated.`
    );
    setTimeout(() => setActionSuccessMsg(null), 5000);
  };

  const disbursedPct =
    project.sanctionedAmountINR > 0
      ? Math.min(100, Math.round((project.expenditureAmountINR / project.sanctionedAmountINR) * 100))
      : 0;

  const isProgressMismatch = disbursedPct - project.physicalProgressPct > 30;

  return (
    <DashboardShell>
      <div className="space-y-6 max-w-6xl mx-auto pb-12">
        {/* Breadcrumb & Navigation */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Link href="/queue" className="hover:text-slate-900 inline-flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              Investigation Queue
            </Link>
            <span>/</span>
            <span className="font-semibold text-slate-800">{project.id}</span>
          </div>

          <div className="flex items-center gap-2">
            <DataSourceBadge type={project.dataSource} />
            {isHero && (
              <span className="bg-amber-500 text-white text-xs font-bold px-2 py-0.5 rounded-md">
                30s Hero Pitch Case
              </span>
            )}
          </div>
        </div>

        {/* Action feedback toast */}
        {actionSuccessMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-medium flex items-center gap-2 animate-in fade-in-0 duration-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionSuccessMsg}</span>
          </div>
        )}

        {/* Header Summary Banner */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-md bg-slate-900 text-white">
                  {project.id}
                </span>
                <Badge variant={project.status === "Delayed" ? "alert" : "secondary"}>
                  {project.status}
                </Badge>
                {project.delayPrediction && (
                  <span
                    className={`text-xs font-bold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 ${
                      project.delayPrediction.likelihood === "High"
                        ? "bg-red-50 text-red-700 border border-red-200"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    <Activity className="w-3 h-3" />
                    Predicted Trajectory: {project.delayPrediction.likelihood} Delay Risk (
                    {project.delayPrediction.probabilityScore}%)
                  </span>
                )}
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-slate-900 leading-tight">
                {project.title}
              </h1>

              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-500 pt-1">
                <div>
                  <span className="text-slate-400 block text-[11px]">Work Category</span>
                  <span className="font-semibold text-slate-800">{project.workCategory}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Constituency Scope</span>
                  <span className="font-semibold text-slate-800">
                    {project.constituencyId} ({project.stateCode})
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Sanction Date</span>
                  <span className="font-semibold text-slate-800">{project.sanctionDate}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Sanctioned Amount</span>
                  <span className="font-bold text-slate-900 text-sm">
                    {formatINR(project.sanctionedAmountINR)}
                  </span>
                </div>
              </div>
            </div>

            {/* Risk Gauge Header Widget */}
            <div className="shrink-0 bg-slate-50/80 p-4 rounded-xl border border-slate-200/60 flex flex-col items-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Composite Risk Score
              </span>
              <RiskGauge riskScore={project.riskScore} size="md" />
            </div>
          </div>

          {/* Neutral Why-Flagged Explanation Pill */}
          <div className="mt-5 p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80 flex items-start gap-3 text-xs">
            <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-amber-900 block mb-0.5">
                Audit Intelligence Explanation:
              </span>
              <p className="text-amber-800 leading-relaxed">
                {project.riskScore.whyFlaggedSummary}
              </p>
            </div>
          </div>
        </div>

        {/* Phase 2 Extension 2.3: Dual Progress Visualizer (Physical vs Financial Burn Mismatch) */}
        <Card className="border-slate-200/80">
          <CardHeader className="border-b border-slate-100 p-4 bg-slate-50/40">
            <CardTitle className="text-sm flex items-center justify-between">
              <span className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                Physical Progress vs. Financial Disbursement Mismatch
              </span>
              {isProgressMismatch && (
                <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                  {disbursedPct - project.physicalProgressPct}% Gap Anomaly
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-600">Financial Disbursed</span>
                  <span className="text-slate-900 font-bold">{disbursedPct}% ({formatINR(project.expenditureAmountINR)})</span>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full" style={{ width: `${disbursedPct}%` }} />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-600">Physical Asset Completion</span>
                  <span className={project.physicalProgressPct < 50 ? "text-amber-600 font-bold" : "text-emerald-600 font-bold"}>
                    {project.physicalProgressPct}% Verified
                  </span>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      isProgressMismatch ? "bg-amber-500" : "bg-emerald-500"
                    }`}
                    style={{ width: `${project.physicalProgressPct}%` }}
                  />
                </div>
              </div>
            </div>

            {isProgressMismatch && (
              <div className="p-3 bg-amber-50 rounded-xl text-xs text-amber-800 leading-relaxed">
                <strong>Disbursement Velocity Alert:</strong> 100% of sanctioned funds have been disbursed while independent site measurements confirm only {project.physicalProgressPct}% physical foundation completion.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Phase 2 Extension 2.4: Historical Risk Score Timeline */}
        {project.riskScore.history && project.riskScore.history.length > 0 && (
          <Card className="border-slate-200/80">
            <CardHeader className="border-b border-slate-100 p-4 bg-slate-50/40">
              <CardTitle className="text-sm flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-700" />
                Historical Risk Score Progression & Event Triggers
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                {project.riskScore.history.map((pt, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 space-y-1 text-xs"
                  >
                    <div className="flex items-center justify-between font-bold">
                      <span className="text-slate-400 font-mono text-[10px]">{pt.date}</span>
                      <span
                        className={`font-extrabold ${
                          pt.score >= 60
                            ? "text-red-600"
                            : pt.score >= 35
                            ? "text-amber-600"
                            : "text-emerald-600"
                        }`}
                      >
                        {pt.score}/100
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-snug">
                      {pt.triggerEvent}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Multi-Signal Deep-Dive Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Signal 1: Cost Cohort Anomaly */}
          <Card>
            <CardHeader className="border-b border-slate-100 pb-3">
              <CardTitle className="text-base flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Coins className="w-4 h-4 text-blue-600" />
                  Peer-Group Cost Cohort Analysis
                </span>
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
                  +25 pts
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[11px] text-slate-400 block">Sanctioned</span>
                  <span className="text-sm font-bold text-slate-900">
                    {formatINR(project.sanctionedAmountINR)}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[11px] text-slate-400 block">Peer Median</span>
                  <span className="text-sm font-bold text-slate-700">
                    {formatINR(project.peerGroupMedianINR)}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[11px] text-slate-400 block">Peer Band</span>
                  <span className="text-xs font-bold text-slate-700">
                    {formatINR(project.peerGroupRangeMinINR)} - {formatINR(project.peerGroupRangeMaxINR)}
                  </span>
                </div>
              </div>

              <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed">
                Cost benchmark evaluated against works in sector &apos;{project.workCategory}&apos;.
                Sanctioned budget exceeds peer median by <strong>+{( (project.sanctionedAmountINR / project.peerGroupMedianINR) * 100 - 100).toFixed(0)}%</strong>.
              </div>
            </CardContent>
          </Card>

          {/* Signal 2: pHash Duplicate Photographic Evidence Detection */}
          <Card>
            <CardHeader className="border-b border-slate-100 pb-3">
              <CardTitle className="text-base flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-purple-600" />
                  Perceptual Hash (pHash) Duplicate Detection
                </span>
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
                  +20 pts
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-3">
              {duplicatePhoto ? (
                <div className="space-y-3">
                  <div className="p-3 bg-red-50/70 border border-red-200 rounded-xl text-xs text-red-800 flex items-start gap-2">
                    <AlertOctagon className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block">Cross-Project Photographic Re-use Flagged</span>
                      Evidence image matches historical project <strong>{duplicatePhoto.matchedProjectId}</strong> with <strong>97% visual fingerprint similarity</strong> (Hamming distance {duplicatePhoto.hammingDistance}).
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div className="space-y-1 text-center">
                      <div className="text-[11px] font-semibold text-slate-700 truncate">
                        Current: {project.id}
                      </div>
                      <div className="h-32 rounded-lg overflow-hidden border border-slate-200 relative bg-slate-100">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={duplicatePhoto.url}
                          alt="Current site evidence"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        Hash: {duplicatePhoto.pHash}
                      </span>
                    </div>

                    <div className="space-y-1 text-center">
                      <div className="text-[11px] font-semibold text-slate-700 truncate">
                        Prior Match: {duplicatePhoto.matchedProjectId}
                      </div>
                      <div className="h-32 rounded-lg overflow-hidden border border-red-300 relative bg-slate-100 ring-2 ring-red-500/20">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={refDuplicateProject?.photos[0]?.url || duplicatePhoto.url}
                          alt="Historical site evidence"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="text-[10px] text-red-600 font-mono font-semibold">
                        Match Distance: {duplicatePhoto.hammingDistance} (pHash)
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-slate-500 py-6 text-center">
                  All submitted completion photos verified unique against historical repository.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Phase 4 Extension 4.2: Satellite Change Detection & Cross-Scheme Double Dipping */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="border-b border-slate-100 pb-3">
              <CardTitle className="text-base flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Satellite className="w-4 h-4 text-cyan-600" />
                  Independent Satellite Change-Detection (Sentinel-2 / Bhuvan)
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-cyan-50 text-cyan-800 border border-cyan-200">
                  Supporting Signal
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-3">
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-500 font-semibold block">T0 Pre-Sanction (Aug 2023)</span>
                  <div className="h-28 rounded-lg bg-slate-900 border border-slate-300 flex items-center justify-center text-slate-400 text-xs font-mono">
                    [Base Surface Tile]
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-500 font-semibold block">T1 Current Tile (Jun 2024)</span>
                  <div className="h-28 rounded-lg bg-slate-800 border border-cyan-400 flex items-center justify-center text-cyan-300 text-xs font-mono">
                    [Pixel Diff Conf: 68%]
                  </div>
                </div>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Optical surface reflectance indicates physical structure erection with 68% confidence. Labeled as an independent supporting signal, not definitive proof.
              </p>
            </CardContent>
          </Card>

          {/* Phase 4 Extension 4.4: Cross-Scheme Double-Dipping Match */}
          <Card>
            <CardHeader className="border-b border-slate-100 pb-3">
              <CardTitle className="text-base flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <GitFork className="w-4 h-4 text-amber-600" />
                  Cross-Scheme Double-Dipping Collision
                </span>
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                  Overlap Flag
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-3">
              {project.crossSchemeMatch ? (
                <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2 text-xs">
                  <div className="font-bold text-amber-900 flex items-center justify-between">
                    <span>Matched Scheme: {project.crossSchemeMatch.matchedScheme}</span>
                    <span className="font-mono text-[11px]">{project.crossSchemeMatch.externalProjectId}</span>
                  </div>
                  <p className="text-amber-800 leading-relaxed">
                    Identical asset described as <em>&quot;{project.crossSchemeMatch.assetDescription}&quot;</em> sanctioned on overlapping coordinates ({project.crossSchemeMatch.spatialDistanceMeters}m separation, {project.crossSchemeMatch.textOverlapScore}% text similarity).
                  </p>
                  <div className="text-[11px] text-amber-700 font-medium">
                    Sanctioned under Grant: {formatINR(project.crossSchemeMatch.sanctionedAmountINR)}
                  </div>
                </div>
              ) : (
                <div className="text-xs text-slate-500 py-6 text-center">
                  No cross-scheme claims registered on these geographic coordinates.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Signal 3: Stage-Wise SLA Bottleneck & Role Attribution */}
        <Card>
          <CardHeader className="border-b border-slate-100 pb-3">
            <CardTitle className="text-base flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-600" />
                Stage-Wise SLA Bottleneck Timeline & Role Attribution
              </span>
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                +17 pts
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            <div className="relative space-y-3">
              {project.stageEvents.map((stage, idx) => {
                const isOverdue = stage.isDelayed && stage.delayRatio >= 2.0;

                return (
                  <div
                    key={idx}
                    className={`p-4 rounded-xl border transition-all text-xs flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                      isOverdue
                        ? "border-red-200 bg-red-50/50"
                        : "border-slate-200/80 bg-white"
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 font-semibold text-slate-900 text-sm">
                        <span>{stage.stageName}</span>
                        {isOverdue && (
                          <Badge variant="alert" className="text-[10px] px-1.5 py-0">
                            {stage.delayRatio}× Overdue
                          </Badge>
                        )}
                      </div>
                      <div className="text-slate-500 text-[11px]">
                        Assigned Role / Designation:{" "}
                        <strong className="text-slate-800">{stage.responsibleRole}</strong>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 text-right shrink-0">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Normative SLA</span>
                        <span className="font-semibold text-slate-700">{stage.expectedDays} days</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Actual Days Taken</span>
                        <span
                          className={`font-bold ${
                            isOverdue ? "text-red-600 font-extrabold" : "text-slate-800"
                          }`}
                        >
                          {stage.actualDays} days
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* HUMAN-IN-THE-LOOP OFFICER ACTION PANEL */}
        <Card className="border-slate-900/20 shadow-md">
          <CardHeader className="bg-slate-900 text-white rounded-t-2xl p-5">
            <CardTitle className="text-base text-white flex items-center justify-between">
              <span className="flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-blue-400" />
                Human-in-the-Loop Officer Action & Authority Routing
              </span>
              <span className="text-xs font-normal text-slate-400">
                AI explains; Officer decides.
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {/* Authority Routing Visualizer */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-700">Authority Escalation Path:</span>
                <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-semibold">
                  District Authority
                </span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
                <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                  State Nodal
                </span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
                <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                  Ministry / CVC
                </span>
              </div>
              <div className="text-right font-medium text-slate-600">
                Current Level: <strong>{investigationCase?.escalationLevel || "District"}</strong>
              </div>
            </div>

            {/* Officer Notes Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                Official Case Remarks / Inspection Notes:
              </label>
              <textarea
                value={officerNotes}
                onChange={(e) => setOfficerNotes(e.target.value)}
                placeholder="Enter field observation findings, physical site inspection verification notes, or agency justification..."
                rows={3}
                className="w-full p-3 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-900/20 text-slate-900"
              />
            </div>

            {/* Three Action Triggers */}
            <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
              <Button
                variant="outline"
                size="default"
                onClick={() => handleAction("Mark False Alarm")}
                className="w-full sm:w-auto text-xs"
              >
                Mark False Alarm (Valid Justification)
              </Button>

              <Button
                variant="secondary"
                size="default"
                onClick={() => handleAction("Needs More Evidence")}
                className="w-full sm:w-auto text-xs"
              >
                Needs More Evidence (Field Visit)
              </Button>

              <Button
                variant="alert"
                size="default"
                onClick={() => handleAction("Confirm Issue")}
                className="w-full sm:w-auto text-xs font-bold"
              >
                Confirm Issue & Escalate Upward
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Docked Domain-Scoped Investigation Copilot */}
        <InvestigationCopilot project={project} />
      </div>
    </DashboardShell>
  );
}
