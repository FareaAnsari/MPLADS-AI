"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { WifiOff, RefreshCw, ArrowRight, ShieldCheck, Database } from "lucide-react";
import { DataSourceBadge } from "@/components/cards/DataSourceBadge";
import { useRiskLensStore } from "@/lib/store";

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [checking, setChecking] = useState<boolean>(false);
  const { projects } = useRiskLensStore();

  useEffect(() => {
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const handleRetry = () => {
    setChecking(true);
    setTimeout(() => {
      setIsOnline(navigator.onLine);
      setChecking(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center font-sans">
      <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200 text-slate-600 flex items-center justify-center mb-6 shadow-2xs">
        <WifiOff className="w-8 h-8 text-slate-500" />
      </div>

      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Network Status: {isOnline ? "Online" : "Disconnected"}
        </span>
        <DataSourceBadge type="synthetic" />
      </div>

      <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight max-w-md">
        Local Offline Presentation Mode Active
      </h1>

      <p className="text-xs text-slate-600 max-w-md mt-3 leading-relaxed">
        RiskLens is fully operational in 100% offline environments. In-memory synthetic fixtures and client-side pHash verification are cached and ready for presentation even with zero venue connectivity.
      </p>

      {/* Cached Offline Stats */}
      <div className="mt-6 p-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs max-w-sm w-full text-xs text-left space-y-2">
        <div className="flex items-center justify-between font-semibold text-slate-800">
          <span className="flex items-center gap-1.5">
            <Database className="w-4 h-4 text-blue-600" />
            Cached Offline Registry
          </span>
          <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold">
            100% Ready
          </span>
        </div>
        <div className="text-slate-500 text-[11px] pt-1">
          • {projects.length} Works indexed with pre-computed risk scores
        </div>
        <div className="text-slate-500 text-[11px]">
          • Hero Demo Case (HERO-MPLADS-001) fully operational
        </div>
      </div>

      <div className="mt-8 flex items-center gap-3">
        <button
          onClick={handleRetry}
          disabled={checking}
          className="px-5 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold rounded-xl shadow-2xs transition-colors flex items-center gap-2"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${checking ? "animate-spin" : ""}`} />
          {checking ? "Checking..." : "Check Internet Connection"}
        </button>

        <Link
          href="/district"
          className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-2"
        >
          <span>Continue Offline Demo</span>
          <ArrowRight className="w-4 h-4 text-blue-400" />
        </Link>
      </div>
    </div>
  );
}
