"use client";

import React, { useState } from "react";
import { Project } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Network, Building, FolderKanban, Briefcase, Filter } from "lucide-react";

interface NetworkGraphProps {
  projects: Project[];
}

export const NetworkGraph: React.FC<NetworkGraphProps> = ({ projects }) => {
  const [selectedNode, setSelectedNode] = useState<{
    id: string;
    label: string;
    type: "constituency" | "project" | "agency" | "contractor";
    riskLevel?: string;
    connectionsCount: number;
  } | null>(null);

  const [activeFilter, setActiveFilter] = useState<string>("all");

  // Sample primary entities for interactive network
  const sampledProjects = projects.slice(0, 15);

  return (
    <Card className="border-slate-200/80 shadow-2xs overflow-hidden">
      <CardHeader className="border-b border-slate-100 p-5 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <CardTitle className="text-base flex items-center gap-2 text-slate-900">
            <Network className="w-4 h-4 text-blue-600" />
            Entity Relationship & Procurement Syndicate Network
          </CardTitle>
          <p className="text-xs text-slate-500 mt-0.5">
            Interactive multi-relational graph linking Constituencies, Projects, Implementing Roles, and Contractors.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {["all", "high-risk", "agencies"].map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`text-xs px-3 py-1 rounded-lg font-medium transition-colors ${
                activeFilter === f
                  ? "bg-slate-900 text-white font-semibold"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {f === "all" ? "All Nodes" : f === "high-risk" ? "Flagged Clusters" : "Agencies Only"}
            </button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="relative w-full h-[450px] bg-slate-950 overflow-hidden flex items-center justify-center p-4">
          {/* Background Grid Pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:32px_32px] opacity-40" />

          {/* SVG Nodes and Edges */}
          <svg className="w-full h-full relative z-10">
            {/* Connecting Edges */}
            <g stroke="#334155" strokeWidth="1.5" strokeDasharray="3 3">
              <line x1="20%" y1="50%" x2="50%" y2="25%" />
              <line x1="20%" y1="50%" x2="50%" y2="75%" />
              <line x1="50%" y1="25%" x2="80%" y2="50%" />
              <line x1="50%" y1="75%" x2="80%" y2="50%" />
              <line x1="50%" y1="25%" x2="50%" y2="50%" />
              <line x1="50%" y1="50%" x2="80%" y2="50%" />
            </g>

            {/* High-risk flagged red cluster connection */}
            <g stroke="#dc2626" strokeWidth="2.5" opacity="0.8">
              <line x1="50%" y1="50%" x2="80%" y2="75%" />
              <line x1="50%" y1="75%" x2="80%" y2="75%" />
            </g>

            {/* Interactive Node 1: Constituency X-01 */}
            <g
              className="cursor-pointer group"
              onClick={() =>
                setSelectedNode({
                  id: "Constituency X-01",
                  label: "Constituency X-01 (State X)",
                  type: "constituency",
                  connectionsCount: 8,
                })
              }
            >
              <circle cx="20%" cy="50%" r="22" fill="#1e293b" stroke="#3b82f6" strokeWidth="2.5" />
              <text x="20%" y="50%" textAnchor="middle" dy="4" fill="#ffffff" fontSize="10" fontWeight="bold">
                X-01
              </text>
              <text x="20%" y="58%" textAnchor="middle" fill="#94a3b8" fontSize="9">
                Constituency
              </text>
            </g>

            {/* Interactive Node 2: HERO-MPLADS-001 (High Risk) */}
            <g
              className="cursor-pointer group"
              onClick={() =>
                setSelectedNode({
                  id: "HERO-MPLADS-001",
                  label: "Solar High-Mast Grid (HERO-001)",
                  type: "project",
                  riskLevel: "High Risk (74/100)",
                  connectionsCount: 4,
                })
              }
            >
              <circle cx="50%" cy="50%" r="24" fill="#450a0a" stroke="#dc2626" strokeWidth="3" />
              <text x="50%" y="50%" textAnchor="middle" dy="4" fill="#fecaca" fontSize="10" fontWeight="bold">
                HERO
              </text>
              <text x="50%" y="58%" textAnchor="middle" fill="#ef4444" fontSize="9" fontWeight="bold">
                74 / 100
              </text>
            </g>

            {/* Interactive Node 3: Agency: District Planning Officer IDA */}
            <g
              className="cursor-pointer group"
              onClick={() =>
                setSelectedNode({
                  id: "AGENCY-IDA",
                  label: "District Planning Officer IDA",
                  type: "agency",
                  connectionsCount: 6,
                })
              }
            >
              <circle cx="50%" cy="25%" r="20" fill="#0f172a" stroke="#a855f7" strokeWidth="2" />
              <text x="50%" y="25%" textAnchor="middle" dy="4" fill="#e9d5ff" fontSize="9" fontWeight="bold">
                IDA
              </text>
              <text x="50%" y="33%" textAnchor="middle" fill="#c084fc" fontSize="9">
                Agency Role
              </text>
            </g>

            {/* Interactive Node 4: Clean Project PRJ-2023-088 */}
            <g
              className="cursor-pointer group"
              onClick={() =>
                setSelectedNode({
                  id: "PRJ-2023-088",
                  label: "Rural High-Mast Unit (PRJ-088)",
                  type: "project",
                  riskLevel: "Low Risk (12/100)",
                  connectionsCount: 3,
                })
              }
            >
              <circle cx="50%" cy="75%" r="20" fill="#064e3b" stroke="#10b981" strokeWidth="2" />
              <text x="50%" y="75%" textAnchor="middle" dy="4" fill="#a7f3d0" fontSize="9" fontWeight="bold">
                PRJ-088
              </text>
              <text x="50%" y="83%" textAnchor="middle" fill="#34d399" fontSize="9">
                Baseline
              </text>
            </g>

            {/* Interactive Node 5: Contractor ENT-SOLAR-CORP-09 */}
            <g
              className="cursor-pointer group"
              onClick={() =>
                setSelectedNode({
                  id: "ENT-SOLAR-CORP-09",
                  label: "Vendor Entity ENT-SOLAR-CORP-09",
                  type: "contractor",
                  riskLevel: "Flagged Repeat Vendor (3 delayed works)",
                  connectionsCount: 5,
                })
              }
            >
              <circle cx="80%" cy="50%" r="20" fill="#1e293b" stroke="#f59e0b" strokeWidth="2" />
              <text x="80%" y="50%" textAnchor="middle" dy="4" fill="#fde68a" fontSize="9" fontWeight="bold">
                V-09
              </text>
              <text x="80%" y="58%" textAnchor="middle" fill="#fbbf24" fontSize="9">
                Vendor
              </text>
            </g>
          </svg>

          {/* Node Inspector Overlay Box */}
          {selectedNode && (
            <div className="absolute top-4 left-4 z-20 bg-slate-900/90 backdrop-blur-md text-white p-4 rounded-xl border border-slate-700 shadow-xl max-w-xs space-y-2 text-xs animate-in fade-in-0 duration-150">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-blue-300">{selectedNode.label}</span>
                <button
                  onClick={() => setSelectedNode(null)}
                  className="text-slate-400 hover:text-white text-xs"
                >
                  ✕
                </button>
              </div>
              <div className="text-slate-300">
                Entity Type: <strong className="capitalize text-white">{selectedNode.type}</strong>
              </div>
              {selectedNode.riskLevel && (
                <div className="text-red-400 font-semibold">{selectedNode.riskLevel}</div>
              )}
              <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800">
                Connected to {selectedNode.connectionsCount} adjacent project & disbursement nodes.
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
