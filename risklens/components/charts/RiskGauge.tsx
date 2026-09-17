"use client";

import React, { useState } from "react";
import { RiskScore, SignalBreakdownItem } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ShieldAlert, Info, AlertTriangle, CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";
import { Dialog, DialogHeader, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface RiskGaugeProps {
  riskScore: RiskScore;
  size?: "sm" | "md" | "lg";
  showBreakdownTrigger?: boolean;
  className?: string;
}

export const RiskGauge: React.FC<RiskGaugeProps> = ({
  riskScore,
  size = "md",
  showBreakdownTrigger = true,
  className,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [expandedInPlace, setExpandedInPlace] = useState(false);

  const score = riskScore.compositeScore;
  const isHigh = score >= 60;
  const isModerate = score >= 35 && score < 60;
  const isLow = score < 35;

  // Arc Gauge configuration
  const strokeColor = isHigh
    ? "#dc2626" // Reserved red-600
    : isModerate
    ? "#f59e0b" // amber-500
    : "#10b981"; // emerald-500

  const radius = size === "sm" ? 36 : size === "lg" ? 80 : 54;
  const strokeWidth = size === "sm" ? 7 : size === "lg" ? 14 : 10;
  const circumference = Math.PI * radius; // Half circle arc
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const width = radius * 2 + strokeWidth * 2;
  const height = radius + strokeWidth + (size === "lg" ? 30 : 15);

  return (
    <div className={cn("flex flex-col items-center", className)}>
      <div className="relative flex flex-col items-center">
        {/* SVG Arc Gauge */}
        <svg
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          className="overflow-visible"
        >
          {/* Background Track */}
          <path
            d={`M ${strokeWidth},${radius + strokeWidth} A ${radius},${radius} 0 0,1 ${
              width - strokeWidth
            },${radius + strokeWidth}`}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          {/* Progress Arc */}
          <path
            d={`M ${strokeWidth},${radius + strokeWidth} A ${radius},${radius} 0 0,1 ${
              width - strokeWidth
            },${radius + strokeWidth}`}
            fill="none"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Value and Label in Center */}
        <div
          className="absolute flex flex-col items-center justify-center text-center"
          style={{ bottom: size === "sm" ? 2 : size === "lg" ? 18 : 6 }}
        >
          <span
            className={cn(
              "font-bold tracking-tight",
              size === "sm" ? "text-base" : size === "lg" ? "text-3xl" : "text-xl"
            )}
            style={{ color: strokeColor }}
          >
            {score}
            <span className="text-xs font-medium text-slate-400">/100</span>
          </span>
          <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-500">
            {isHigh ? "Action Required" : isModerate ? "Under Review" : "Standard"}
          </span>
        </div>
      </div>

      {/* Threshold Ticks */}
      <div className="flex justify-between w-full max-w-[140px] text-[9px] font-medium text-slate-400 mt-1 px-2">
        <span>0</span>
        <span className="text-amber-600/80">35</span>
        <span className="text-red-600/80">60</span>
        <span>100</span>
      </div>

      {/* Breakdown trigger */}
      {showBreakdownTrigger && (
        <button
          onClick={() => setModalOpen(true)}
          className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors bg-slate-100/80 hover:bg-slate-200/80 px-2.5 py-1 rounded-full"
        >
          <Info className="w-3.5 h-3.5 text-blue-600" />
          Why flagged? ({riskScore.breakdown.filter((b) => b.isTriggered).length} signals)
        </button>
      )}

      {/* Detailed Modal Breakdown */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogHeader
          title="Explainable Risk Score Breakdown"
          description={`Composite Score: ${score}/100 — ${riskScore.whyFlaggedSummary}`}
          onClose={() => setModalOpen(false)}
        />
        <DialogContent className="space-y-4">
          <div className="rounded-xl border border-slate-200/80 p-4 bg-slate-50/60">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Signal Composition & Contribution
            </h4>
            <div className="w-full h-3 rounded-full bg-slate-200 overflow-hidden flex">
              {riskScore.breakdown.map((item, idx) => {
                if (item.points === 0) return null;
                const widthPercent = (item.points / Math.max(1, score)) * 100;
                const colors = [
                  "bg-rose-500",
                  "bg-amber-500",
                  "bg-blue-500",
                  "bg-purple-500",
                  "bg-emerald-500",
                ];
                return (
                  <div
                    key={item.signal}
                    style={{ width: `${widthPercent}%` }}
                    className={cn(colors[idx % colors.length], "h-full transition-all")}
                    title={`${item.label}: +${item.points} pts`}
                  />
                );
              })}
            </div>
            <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-slate-600">
              {riskScore.breakdown.map((item, idx) =>
                item.points > 0 ? (
                  <span key={item.signal} className="inline-flex items-center gap-1 font-medium">
                    <span className="w-2 h-2 rounded-full bg-slate-900/60 inline-block" />
                    {item.label}: +{item.points} pts
                  </span>
                ) : null
              )}
            </div>
          </div>

          <div className="space-y-2.5">
            {riskScore.breakdown.map((item) => (
              <div
                key={item.signal}
                className={cn(
                  "p-3 rounded-xl border transition-all text-sm",
                  item.isTriggered
                    ? "border-amber-200/90 bg-amber-50/40"
                    : "border-slate-100 bg-white opacity-80"
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-semibold text-slate-900">
                    {item.isTriggered ? (
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    )}
                    <span>{item.label}</span>
                  </div>
                  <span
                    className={cn(
                      "text-xs font-bold px-2 py-0.5 rounded-md",
                      item.isTriggered
                        ? "bg-amber-100 text-amber-800"
                        : "bg-slate-100 text-slate-500"
                    )}
                  >
                    +{item.points} / {item.maxPoints} pts
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  {item.reason}
                </p>
              </div>
            ))}
          </div>
        </DialogContent>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => setModalOpen(false)}>
            Close Inspection
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
};
