import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-slate-900/20",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-slate-900 text-white shadow-2xs hover:bg-slate-800",
        secondary:
          "border-transparent bg-slate-100 text-slate-900 hover:bg-slate-200/80",
        outline: "text-slate-800 border-slate-200 bg-white",
        success:
          "border-emerald-200 bg-emerald-50 text-emerald-800",
        warning:
          "border-amber-200 bg-amber-50 text-amber-800",
        // RESERVED ALERT BADGE FOR CRITICAL FLAGS ONLY
        alert:
          "border-red-200 bg-red-50 text-red-700 font-bold",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}
