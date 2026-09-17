"use client";

import React from "react";
import { useRiskLensStore } from "@/lib/store";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { DataSourceBadge } from "@/components/cards/DataSourceBadge";
import { NetworkGraph } from "@/components/charts/NetworkGraph";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Network, Share2, ShieldAlert, AlertTriangle, Building2 } from "lucide-react";

export default function NetworkGraphPage() {
  const { projects } = useRiskLensStore();

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="civic-eyebrow">GRAPH INTELLIGENCE & SYNDICATE DETECTION</span>
            <div className="flex items-center gap-2 mt-1">
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 font-display">
                Multi-Entity Risk & Procurement Syndicate Network
              </h1>
              <DataSourceBadge type="synthetic" />
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1.5 font-primary">
              Graph intelligence mapping cross-project relationships between MPs, constituencies, implementing agencies, and contractors to surface multi-project patterns invisible in single-case views.
            </p>
          </div>
        </div>

        {/* Network Graph Visualizer Component */}
        <NetworkGraph projects={projects} />

        {/* Graph Insights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <Card className="p-4 border-slate-200/80 space-y-2">
            <div className="font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-purple-600" />
              Agency Clustering Insight
            </div>
            <p className="text-slate-600 leading-relaxed">
              District Planning Officer IDA is associated with 4 of the highest-delayed works in Constituency X-01, representing a localized stage bottleneck.
            </p>
          </Card>

          <Card className="p-4 border-slate-200/80 space-y-2">
            <div className="font-bold text-slate-900 flex items-center gap-2">
              <Share2 className="w-4 h-4 text-amber-600" />
              Cross-Constituency Vendor Reuse
            </div>
            <p className="text-slate-600 leading-relaxed">
              Vendor entity ENT-SOLAR-CORP-09 has been awarded simultaneous execution packages across 3 adjacent constituencies, exceeding normative physical handling capacity.
            </p>
          </Card>

          <Card className="p-4 border-slate-200/80 space-y-2">
            <div className="font-bold text-slate-900 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-blue-600" />
              Multi-Project Pattern Discovery
            </div>
            <p className="text-slate-600 leading-relaxed">
              pHash photographic fingerprint links project HERO-MPLADS-001 directly to historical work PRJ-2023-088 across state boundaries.
            </p>
          </Card>
        </div>
      </div>
    </DashboardShell>
  );
}
