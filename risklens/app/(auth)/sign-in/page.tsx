"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRiskLensStore } from "@/lib/store";
import { UserRole } from "@/lib/types";
import { ShieldAlert, ArrowRight, Sparkles, UserCheck } from "lucide-react";

export default function SignInPage() {
  const router = useRouter();
  const { setRole } = useRiskLensStore();
  const [selectedRole, setSelectedRole] = useState<UserRole>("district");

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setRole(selectedRole);
    router.push("/district");
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 font-sans">
      {/* Left Form Panel */}
      <div className="flex-1 flex flex-col justify-center p-8 md:p-16 max-w-lg mx-auto w-full">
        <div className="space-y-6">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <span className="font-bold text-lg text-slate-900">RiskLens</span>
              <span className="text-xs text-slate-500 font-medium block">
                Official SIH 2026 Prototype Login
              </span>
            </div>
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Authority Sign In
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Select a designated authority level to begin the live presentation.
            </p>
          </div>

          {/* Quick Demo Pre-fill Notice */}
          <div className="p-3.5 bg-blue-50/80 border border-blue-200/80 rounded-xl text-xs text-blue-900 space-y-1">
            <div className="font-bold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              Demo Credentials Pre-filled
            </div>
            <p className="text-[11px] text-blue-800/80">
              No password required for jury evaluation. Choose an official jurisdiction scope below.
            </p>
          </div>

          <form onSubmit={handleSignIn} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                Designated Authority Role
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "district", label: "District Authority", sub: "District 04" },
                  { id: "state", label: "State Nodal", sub: "State X" },
                  { id: "ministry", label: "Ministry / CVC", sub: "National" },
                  { id: "mp", label: "Member of Parliament", sub: "Constituency X-01" },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedRole(item.id as UserRole)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      selectedRole === item.id
                        ? "border-slate-900 bg-slate-900 text-white shadow-xs"
                        : "border-slate-200 bg-white text-slate-800 hover:bg-slate-50"
                    }`}
                  >
                    <div className="font-semibold text-xs">{item.label}</div>
                    <div
                      className={`text-[10px] ${
                        selectedRole === item.id ? "text-slate-300" : "text-slate-400"
                      }`}
                    >
                      {item.sub}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 pt-3"
            >
              <span>Authenticate Session & Enter Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5 text-blue-400" />
            </button>
          </form>

          <div className="pt-2 text-center text-xs text-slate-500">
            <span>Need an observer account? </span>
            <Link href="/sign-up" className="text-blue-600 font-semibold hover:underline">
              Create demo profile
            </Link>
          </div>
        </div>
      </div>

      {/* Right Brand / Illustration Panel */}
      <div className="hidden md:flex flex-1 bg-slate-900 text-white p-12 lg:p-16 flex-col justify-between relative overflow-hidden">
        <div className="space-y-4 max-w-md relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-blue-300 border border-white/10">
            SIH 2026 Grand Finale Architecture
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight leading-tight">
            Transparent Governance Built on Mathematical Explainability
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Eliminates arbitrary suspicion by grounding every flag in peer cost distributions, statutory SLA timelines, and perceptual image hashing.
          </p>
        </div>

        <div className="p-4 bg-white/5 rounded-2xl border border-white/10 text-xs text-slate-400 space-y-1 relative z-10 max-w-sm">
          <div className="text-white font-semibold flex items-center gap-1.5">
            <UserCheck className="w-4 h-4 text-emerald-400" />
            Active Role Enforced:
          </div>
          <p>Each view scopes works strictly to the authorized jurisdiction level.</p>
        </div>
      </div>
    </div>
  );
}
