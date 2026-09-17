import React from "react";
import Link from "next/link";
import { ShieldAlert, ArrowLeft, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center font-sans">
      <div className="w-16 h-16 rounded-2xl bg-slate-900 text-white flex items-center justify-center mb-6 shadow-sm">
        <ShieldAlert className="w-8 h-8 text-blue-400" />
      </div>

      <span className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">
        Error 404 • Resource Not Found
      </span>

      <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight max-w-md">
        This MPLADS Registry Record Does Not Exist
      </h1>

      <p className="text-xs text-slate-500 max-w-sm mt-3 leading-relaxed">
        The requested work ID, investigation case, or administrative page could not be located in the active audit catalog.
      </p>

      <div className="mt-8 flex items-center gap-3">
        <Link
          href="/district"
          className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-2"
        >
          <Home className="w-4 h-4" />
          Back to Dashboard
        </Link>
        <Link
          href="/queue"
          className="px-5 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl shadow-2xs transition-colors"
        >
          View Investigation Queue
        </Link>
      </div>
    </div>
  );
}
