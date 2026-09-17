import React from "react";
import Link from "next/link";
import { Constituency } from "@/lib/types";
import { formatINR } from "@/lib/utils";
import { ArrowRight, AlertTriangle, Building2, CheckCircle2 } from "lucide-react";

interface ConstituencyCardProps {
  constituency: Constituency;
}

export const ConstituencyCard: React.FC<ConstituencyCardProps> = ({ constituency }) => {
  const hash = constituency.id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const hue = (hash * 37) % 360;
  const isHighAverage = constituency.averageRiskScore >= 50;

  // Utilization calculation
  const utilization = constituency.totalSanctionedINR > 0
    ? Math.min(100, Math.round((constituency.totalDisbursedINR / constituency.totalSanctionedINR) * 100))
    : 72;

  const utilColor =
    utilization >= 85 ? "bg-emerald-500" : utilization >= 70 ? "bg-amber-500" : "bg-rose-500";

  return (
    <div className="civic-card p-5 flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-3.5">
          {/* Geometric Avatar */}
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border border-slate-200 shadow-2xs"
            style={{
              background: `linear-gradient(135deg, hsl(${hue}, 70%, 92%), hsl(${(hue + 40) % 360}, 70%, 82%))`,
            }}
          >
            <Building2
              className="w-5 h-5"
              style={{ color: `hsl(${hue}, 70%, 30%)` }}
            />
          </div>

          <div className="min-w-0 flex-1">
            <h4 className="font-bold text-slate-900 text-base truncate font-display">
              {constituency.id}
            </h4>
            <p className="text-xs text-slate-500 font-primary">
              {constituency.stateCode} • Lok Sabha
            </p>
          </div>

          <div className="text-right shrink-0">
            <span
              className={`text-sm font-bold block font-mono ${
                isHighAverage ? "text-amber-600" : "text-emerald-600"
              }`}
            >
              {constituency.averageRiskScore}
              <span className="text-[10px] text-slate-400 font-normal"> / 100</span>
            </span>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
              Avg Risk
            </span>
          </div>
        </div>

        {/* Utilization Bar */}
        <div className="mt-4">
          <div className="flex justify-between text-xs mb-1 font-primary">
            <span className="text-slate-500 font-medium">Fund Utilization</span>
            <span className="font-bold font-mono text-slate-800">{utilization}%</span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full ${utilColor} rounded-full transition-all duration-500`}
              style={{ width: `${utilization}%` }}
            />
          </div>
        </div>

        {/* Aggregate Financials */}
        <div className="mt-4 grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 text-xs font-primary">
          <div>
            <span className="text-slate-400 text-[11px] block font-medium">Sanctioned</span>
            <span className="font-bold text-slate-900 font-mono">
              {formatINR(constituency.totalSanctionedINR)}
            </span>
          </div>
          <div>
            <span className="text-slate-400 text-[11px] block font-medium">Expenditure</span>
            <span className="font-bold text-slate-900 font-mono">
              {formatINR(constituency.totalDisbursedINR)}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
        <span
          className={`inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded-full text-[11px] ${
            constituency.openFlaggedCasesCount > 0
              ? "text-amber-700 bg-amber-50 border border-amber-200"
              : "text-emerald-700 bg-emerald-50 border border-emerald-200"
          }`}
        >
          {constituency.openFlaggedCasesCount > 0 ? (
            <>
              <AlertTriangle className="w-3 h-3 text-amber-600" />
              {constituency.openFlaggedCasesCount} Flagged
            </>
          ) : (
            <>
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              Optimal
            </>
          )}
        </span>

        <Link
          href={`/projects?constituency=${encodeURIComponent(constituency.id)}`}
          className="font-bold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 text-xs transition-colors"
        >
          <span>{constituency.totalProjects} Works</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
};
