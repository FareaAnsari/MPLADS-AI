"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useRiskLensStore } from "@/lib/store";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { DataSourceBadge } from "@/components/cards/DataSourceBadge";
import { ProjectCard } from "@/components/cards/ProjectCard";
import { WorkCategory } from "@/lib/types";
import { Search } from "lucide-react";

const WORK_CATEGORIES: WorkCategory[] = [
  "Roads & Bridges",
  "Drinking Water",
  "Community Halls",
  "School Infrastructure",
  "Sanitation & Public Health",
  "Solar & Street Lighting",
];

function ProjectsContent() {
  const searchParams = useSearchParams();
  const initialConstituency = searchParams.get("constituency") || "all";

  const { projects, constituencies } = useRiskLensStore();
  const [selectedConstituency, setSelectedConstituency] = useState<string>(initialConstituency);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");

  const filtered = projects.filter((p) => {
    if (selectedConstituency !== "all" && p.constituencyId !== selectedConstituency) {
      return false;
    }
    if (selectedCategory !== "all" && p.workCategory !== selectedCategory) {
      return false;
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        p.id.toLowerCase().includes(term) ||
        p.title.toLowerCase().includes(term) ||
        p.constituencyId.toLowerCase().includes(term)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              MPLADS Works Directory
            </h1>
            <DataSourceBadge type="synthetic" />
          </div>
          <p className="text-sm text-slate-500">
            Complete index of {projects.length} works across 24 anonymized constituencies with real-time explainable risk scores.
          </p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center gap-3 p-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by ID or project name..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedConstituency}
            onChange={(e) => setSelectedConstituency(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 font-medium text-slate-700"
          >
            <option value="all">All Constituencies</option>
            {constituencies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.id}
              </option>
            ))}
          </select>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 font-medium text-slate-700"
          >
            <option value="all">All Work Categories</option>
            {WORK_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((proj) => (
          <ProjectCard key={proj.id} project={proj} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-slate-500 text-xs">
          No projects matched the selected filters.
        </div>
      )}
    </div>
  );
}

export default function ProjectsDirectoryPage() {
  return (
    <DashboardShell>
      <Suspense fallback={<div className="p-8 text-xs text-slate-400">Loading works catalog...</div>}>
        <ProjectsContent />
      </Suspense>
    </DashboardShell>
  );
}
