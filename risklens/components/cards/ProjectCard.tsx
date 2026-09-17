import React from "react";
import Link from "next/link";
import { Project } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataSourceBadge } from "./DataSourceBadge";
import { RiskGauge } from "@/components/charts/RiskGauge";
import { formatINR } from "@/lib/utils";
import { ArrowRight, MapPin, Tag } from "lucide-react";

interface ProjectCardProps {
  project: Project;
  className?: string;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, className }) => {
  const isCostAnomaly =
    project.riskScore.breakdown.find((b) => b.signal === "cost_anomaly")?.isTriggered || false;

  return (
    <Card className="hover:border-slate-300 hover:shadow-md transition-all group overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                {project.id}
              </span>
              <DataSourceBadge type={project.dataSource} />
              <Badge
                variant={
                  project.status === "Delayed"
                    ? "alert"
                    : project.status === "Completed"
                    ? "success"
                    : "secondary"
                }
              >
                {project.status}
              </Badge>
            </div>

            <h3 className="font-semibold text-slate-900 text-base leading-snug group-hover:text-blue-600 transition-colors truncate">
              {project.title}
            </h3>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 pt-0.5">
              <span className="inline-flex items-center gap-1">
                <Tag className="w-3 h-3 text-slate-400" />
                {project.workCategory}
              </span>
              <span className="inline-flex items-center gap-1">
                <MapPin className="w-3 h-3 text-slate-400" />
                {project.constituencyId}
              </span>
            </div>
          </div>

          <div className="shrink-0 flex flex-col items-center">
            <RiskGauge riskScore={project.riskScore} size="sm" showBreakdownTrigger={false} />
          </div>
        </div>

        {/* Cost vs Peer Range Mini-Indicator */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <div>
            <span className="text-slate-500 block text-[11px]">Sanctioned Cost</span>
            <span className="font-semibold text-slate-900 text-sm">
              {formatINR(project.sanctionedAmountINR)}
            </span>
          </div>

          <div className="text-right">
            <span className="text-slate-500 block text-[11px]">Peer Range</span>
            <span
              className={`font-medium ${
                isCostAnomaly ? "text-red-600 font-semibold" : "text-slate-600"
              }`}
            >
              {formatINR(project.peerGroupRangeMinINR)} - {formatINR(project.peerGroupRangeMaxINR)}
              {isCostAnomaly && " (Outlier)"}
            </span>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between pt-1">
          <span className="text-[11px] text-slate-500 truncate max-w-[200px]">
            {project.riskScore.whyFlaggedSummary}
          </span>
          <Link
            href={`/investigation/${project.id}`}
            className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
          >
            Investigate
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};
