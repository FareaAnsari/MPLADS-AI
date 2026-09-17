import React from "react";
import { DataSourceBadgeProps } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Database, Sparkles } from "lucide-react";

export const DataSourceBadge: React.FC<DataSourceBadgeProps> = ({
  type,
  className,
}) => {
  if (type === "public") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200/80 shadow-2xs",
          className
        )}
      >
        <Database className="w-3 h-3 text-blue-600" />
        Public dashboard data
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50/90 text-amber-800 border border-amber-200/80 shadow-2xs",
        className
      )}
    >
      <Sparkles className="w-3 h-3 text-amber-600" />
      Synthetic demo data
    </span>
  );
};
