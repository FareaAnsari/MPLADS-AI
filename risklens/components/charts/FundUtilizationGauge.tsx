"use client";

import React, { useState } from "react";

interface FundUtilizationGaugeProps {
  utilization: number; // 0 to 100
  title?: string;
  subtitle?: string;
  size?: number; // default 240
}

export const FundUtilizationGauge: React.FC<FundUtilizationGaugeProps> = ({
  utilization = 76.9,
  title = "National Fund Utilization",
  subtitle = "Cumulative MPLADS Entitlement vs Released",
  size = 260,
}) => {
  const [hovered, setHovered] = useState(false);
  const clamped = Math.max(0, Math.min(100, utilization));

  // Gauge calculations for semi-circle
  // Radius R = 90, Center = (130, 125)
  const cx = 130;
  const cy = 120;
  const r = 85;
  const strokeWidth = 16;

  // Color determination matching Empowered Indian
  // < 70% = Red (#ef4444), 70-85% = Amber (#f59e0b), >= 85% = Emerald (#10b981)
  const getStatus = (val: number) => {
    if (val >= 85) return { color: "#10b981", label: "High Utilization", badgeBg: "bg-emerald-50 text-emerald-700 border-emerald-200" };
    if (val >= 70) return { color: "#f59e0b", label: "Moderate Utilization", badgeBg: "bg-amber-50 text-amber-700 border-amber-200" };
    return { color: "#ef4444", label: "Under-Utilized", badgeBg: "bg-rose-50 text-rose-700 border-rose-200" };
  };

  const status = getStatus(clamped);

  // Convert percentage (0 - 100) to radians for needle
  // 0% -> Math.PI (180 deg, left)
  // 100% -> 0 (0 deg, right)
  const angleRad = Math.PI * (1 - clamped / 100);
  const needleLength = r - 10;
  const nx = cx + needleLength * Math.cos(angleRad);
  const ny = cy - needleLength * Math.sin(angleRad);

  return (
    <div
      className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all group"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="w-full flex items-center justify-between mb-2">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 font-primary">
          {title}
        </span>
        <span
          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${status.badgeBg}`}
        >
          {status.label}
        </span>
      </div>

      {/* SVG Semi-Circle Gauge */}
      <div className="relative flex items-center justify-center">
        <svg
          width={size}
          height={size * 0.62}
          viewBox="0 0 260 155"
          className="overflow-visible"
        >
          {/* Outer track background */}
          <path
            d="M 45 120 A 85 85 0 0 1 215 120"
            fill="none"
            stroke="#f1f5f9"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* Segment 1: Low (0 - 70%) */}
          <path
            d="M 45 120 A 85 85 0 0 1 187 63"
            fill="none"
            stroke="#fee2e2"
            strokeWidth={strokeWidth}
            strokeDasharray="200"
            strokeDashoffset="0"
          />

          {/* Segment 2: Moderate (70 - 85%) */}
          <path
            d="M 187 63 A 85 85 0 0 1 206 91"
            fill="none"
            stroke="#fef3c7"
            strokeWidth={strokeWidth}
          />

          {/* Segment 3: High (85 - 100%) */}
          <path
            d="M 206 91 A 85 85 0 0 1 215 120"
            fill="none"
            stroke="#d1fae5"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* Active Fill Arc up to current percentage */}
          {clamped > 0 && (
            <path
              d={`M 45 120 A 85 85 0 0 1 ${nx} ${ny}`}
              fill="none"
              stroke={status.color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              className="transition-all duration-700 ease-out"
            />
          )}

          {/* Needle Center Pin */}
          <circle cx={cx} cy={cy} r="6" fill="#0f172a" />
          <circle cx={cx} cy={cy} r="2.5" fill="#ffffff" />

          {/* Needle Pointer */}
          <line
            x1={cx}
            y1={cy}
            x2={nx}
            y2={ny}
            stroke="#0f172a"
            strokeWidth="3"
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />

          {/* Scale Labels */}
          <text x="36" y="140" fontSize="10" fontWeight="600" fill="#94a3b8" textAnchor="middle" className="font-mono">
            0%
          </text>
          <text x="130" y="32" fontSize="10" fontWeight="600" fill="#94a3b8" textAnchor="middle" className="font-mono">
            50%
          </text>
          <text x="224" y="140" fontSize="10" fontWeight="600" fill="#94a3b8" textAnchor="middle" className="font-mono">
            100%
          </text>
        </svg>

        {/* Center Percentage Display */}
        <div className="absolute bottom-1 flex flex-col items-center pointer-events-none">
          <div className="text-3xl font-extrabold tracking-tight text-slate-900 font-mono">
            {clamped.toFixed(1)}%
          </div>
          <span className="text-[10px] text-slate-400 font-medium">Statutory Target ≥80%</span>
        </div>
      </div>

      <p className="text-[11px] text-slate-500 text-center mt-2 max-w-[220px] font-primary">
        {subtitle}
      </p>
    </div>
  );
};
