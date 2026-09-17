"use client";

import React, { useState } from "react";
import {
  Droplets,
  GraduationCap,
  HeartPulse,
  Truck,
  Building,
  Sparkles,
} from "lucide-react";

export interface SectorItem {
  id: string;
  name: string;
  percentage: number;
  amountCr: number;
  completedWorks: number;
  color: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const DEFAULT_SECTORS: SectorItem[] = [
  {
    id: "roads",
    name: "Roads, Pathways & Bridges",
    percentage: 38.5,
    amountCr: 7630.7,
    completedWorks: 1240,
    color: "#2563eb", // primary blue
    icon: Truck,
  },
  {
    id: "water",
    name: "Drinking Water & Irrigation",
    percentage: 22.1,
    amountCr: 4380.2,
    completedWorks: 710,
    color: "#059669", // civic green
    icon: Droplets,
  },
  {
    id: "education",
    name: "Education, Schools & Libraries",
    percentage: 18.4,
    amountCr: 3647.0,
    completedWorks: 590,
    color: "#f59e0b", // civic amber
    icon: GraduationCap,
  },
  {
    id: "health",
    name: "Public Health & Dispensaries",
    percentage: 12.0,
    amountCr: 2378.4,
    completedWorks: 390,
    color: "#0ea5e9", // sky blue
    icon: HeartPulse,
  },
  {
    id: "community",
    name: "Community Halls & Sanitation",
    percentage: 9.0,
    amountCr: 1783.7,
    completedWorks: 310,
    color: "#8b5cf6", // purple
    icon: Building,
  },
];

interface SectorBreakdownProps {
  onSelectSector?: (sectorId: string | null) => void;
  selectedSector?: string | null;
}

export const SectorBreakdown: React.FC<SectorBreakdownProps> = ({
  onSelectSector,
  selectedSector = null,
}) => {
  const [internalSelected, setInternalSelected] = useState<string | null>(selectedSector);

  const handleToggle = (id: string) => {
    const next = internalSelected === id ? null : id;
    setInternalSelected(next);
    if (onSelectSector) onSelectSector(next);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="civic-eyebrow">Public Asset Allocation</span>
          <h3 className="text-xl font-bold text-slate-900 font-display">
            Sector-wise Expenditure Breakdown
          </h3>
        </div>
        {internalSelected && (
          <button
            onClick={() => handleToggle(internalSelected)}
            className="text-xs text-blue-600 hover:text-blue-800 font-semibold"
          >
            Clear Filter
          </button>
        )}
      </div>

      {/* Multi-segment stacked progress bar */}
      <div className="h-3.5 w-full bg-slate-100 rounded-full overflow-hidden flex mb-5 shadow-inner">
        {DEFAULT_SECTORS.map((sec) => (
          <div
            key={sec.id}
            style={{
              width: `${sec.percentage}%`,
              backgroundColor: sec.color,
            }}
            className={`h-full transition-all duration-300 ${
              internalSelected && internalSelected !== sec.id ? "opacity-30" : "opacity-100"
            }`}
            title={`${sec.name}: ${sec.percentage}% (₹${sec.amountCr} Cr)`}
          />
        ))}
      </div>

      {/* Interactive Sector Rows */}
      <div className="space-y-2.5">
        {DEFAULT_SECTORS.map((sec) => {
          const Icon = sec.icon;
          const isSelected = internalSelected === sec.id;

          return (
            <div
              key={sec.id}
              onClick={() => handleToggle(sec.id)}
              className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                isSelected
                  ? "bg-blue-50/60 border-blue-300 ring-2 ring-blue-500/20"
                  : "bg-slate-50/70 hover:bg-slate-100/80 border-slate-200/70"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
                  style={{ backgroundColor: sec.color }}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">{sec.name}</div>
                  <div className="text-[11px] text-slate-500">
                    {sec.completedWorks.toLocaleString()} verified works completed
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-xs font-bold font-mono text-slate-900">
                  ₹{sec.amountCr.toLocaleString()} Cr
                </div>
                <div className="text-[11px] font-semibold text-slate-500 font-mono">
                  {sec.percentage}% share
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
