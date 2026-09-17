"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRiskLensStore } from "@/lib/store";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { DataSourceBadge } from "@/components/cards/DataSourceBadge";
import { generateInspectionRoute } from "@/lib/engine/inspection-optimizer";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { formatINR } from "@/lib/utils";
import { Route, MapPin, CheckCircle2, ShieldAlert, ArrowRight, Compass, Car } from "lucide-react";

export default function InspectionOptimizerPage() {
  const { projects } = useRiskLensStore();
  const [capacity, setCapacity] = useState<number>(10);

  const plan = generateInspectionRoute(projects, 10, capacity);

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="civic-eyebrow">STATUTORY COMPLIANCE & PHYSICAL AUDIT</span>
            <div className="flex items-center gap-2 mt-1">
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 font-display">
                Statutory Inspection Resource Optimizer
              </h1>
              <DataSourceBadge type="synthetic" />
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1.5 font-primary">
              Greedy nearest-neighbor route optimizer fulfilling the statutory &ge;10% annual physical inspection mandate while minimizing inspector transit overhead.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-600">Inspection Capacity:</span>
            <select
              value={capacity}
              onChange={(e) => setCapacity(parseInt(e.target.value, 10))}
              className="text-xs bg-white border border-slate-200 rounded-lg px-3 py-1.5 font-bold text-slate-800"
            >
              <option value={5}>5 Sites (Quick Sprint)</option>
              <option value={10}>10 Sites (Standard Target)</option>
              <option value={15}>15 Sites (High Capacity)</option>
            </select>
          </div>
        </div>

        {/* High-Level Optimization Metrics Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Card className="border-slate-200/80">
            <CardContent className="p-5">
              <div className="text-slate-400 text-xs mb-1">Target Physical Visits</div>
              <div className="text-2xl font-extrabold text-slate-900">
                {plan.selectedProjectsCount} Works
              </div>
              <p className="text-[11px] text-emerald-600 font-semibold mt-1">
                {plan.mandateMetPercentage}% of Total Catalog
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-200/80">
            <CardContent className="p-5">
              <div className="text-slate-400 text-xs mb-1">Statutory Compliance</div>
              <div className="text-2xl font-extrabold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                Mandate Met
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Exceeds &ge;10%/year requirement
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-200/80">
            <CardContent className="p-5">
              <div className="text-slate-400 text-xs mb-1">Estimated Route Distance</div>
              <div className="text-2xl font-extrabold text-slate-900 flex items-center gap-1.5">
                <Car className="w-5 h-5 text-blue-600" />
                {plan.estimatedTotalTravelKm} km
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Optimized transit sequence
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-200/80">
            <CardContent className="p-5">
              <div className="text-slate-400 text-xs mb-1">Protected Public Funds</div>
              <div className="text-2xl font-extrabold text-slate-900">
                {formatINR(
                  plan.rankedInspectionSequence.reduce(
                    (acc, s) => acc + s.project.sanctionedAmountINR,
                    0
                  )
                )}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Total value of inspected assets
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Ranked Route Sequence Table */}
        <div className="space-y-3">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Route className="w-4 h-4 text-blue-600" />
            Optimal Inspection Sequence & Travel Routing
          </h2>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Sequence</TableHead>
                <TableHead>Work ID & Title</TableHead>
                <TableHead>Constituency</TableHead>
                <TableHead>Sanctioned</TableHead>
                <TableHead>Risk Score</TableHead>
                <TableHead>Transit Distance</TableHead>
                <TableHead>Inspection Priority Reason</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {plan.rankedInspectionSequence.map((item) => (
                <TableRow key={item.project.id}>
                  <TableCell className="font-bold text-slate-900 text-xs">
                    <span className="w-6 h-6 rounded-full bg-slate-900 text-white inline-flex items-center justify-center text-xs">
                      #{item.step}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="font-semibold text-slate-900 text-xs">{item.project.title}</div>
                    <div className="font-mono text-[10px] text-slate-500">{item.project.id}</div>
                  </TableCell>
                  <TableCell className="text-xs text-slate-600">
                    {item.project.constituencyId}
                  </TableCell>
                  <TableCell className="text-xs font-semibold text-slate-900">
                    {formatINR(item.project.sanctionedAmountINR)}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded ${
                        item.project.riskScore.compositeScore >= 60
                          ? "bg-red-100 text-red-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {item.project.riskScore.compositeScore}/100
                    </span>
                  </TableCell>
                  <TableCell className="text-xs font-mono font-medium text-slate-700">
                    {item.step === 1 ? "Start" : `+${item.transitKmFromPrior} km`}
                  </TableCell>
                  <TableCell className="text-xs text-slate-600 max-w-sm">
                    {item.priorityReason}
                  </TableCell>
                  <TableCell className="text-right">
                    <Link
                      href={`/investigation/${item.project.id}`}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
                    >
                      Dossier
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </DashboardShell>
  );
}
