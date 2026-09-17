"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export const Dialog: React.FC<DialogProps> = ({
  open,
  onOpenChange,
  children,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={() => onOpenChange(false)}
      />
      <div className="relative z-50 w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl border border-slate-200/80 animate-in fade-in-0 zoom-in-95 duration-200">
        {children}
      </div>
    </div>
  );
};

export const DialogHeader: React.FC<{
  title: string;
  description?: string;
  onClose?: () => void;
  children?: React.ReactNode;
}> = ({ title, description, onClose, children }) => (
  <div className="flex items-start justify-between border-b border-slate-100 p-6 bg-slate-50/50">
    <div className="space-y-1">
      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      {description && (
        <p className="text-sm text-slate-500">{description}</p>
      )}
      {children}
    </div>
    {onClose && (
      <button
        onClick={onClose}
        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    )}
  </div>
);

export const DialogContent: React.FC<{
  className?: string;
  children: React.ReactNode;
}> = ({ className, children }) => (
  <div className={cn("p-6 max-h-[75vh] overflow-y-auto", className)}>
    {children}
  </div>
);

export const DialogFooter: React.FC<{
  className?: string;
  children: React.ReactNode;
}> = ({ className, children }) => (
  <div
    className={cn(
      "flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50/50 p-4 px-6",
      className
    )}
  >
    {children}
  </div>
);
