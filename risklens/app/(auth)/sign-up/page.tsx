"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRiskLensStore } from "@/lib/store";
import { UserRole } from "@/lib/types";
import { ShieldAlert, ArrowRight, Sparkles } from "lucide-react";

export default function SignUpPage() {
  const router = useRouter();
  const { setRole } = useRiskLensStore();
  const [selectedRole, setSelectedRole] = useState<UserRole>("district");

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setRole(selectedRole);
    router.push("/district");
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 font-sans">
      <div className="flex-1 flex flex-col justify-center p-8 md:p-16 max-w-lg mx-auto w-full">
        <div className="space-y-6">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <span className="font-bold text-lg text-slate-900">RiskLens</span>
              <span className="text-xs text-slate-500 font-medium block">
                Official SIH 2026 Prototype
              </span>
            </div>
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Create Demo Officer Session
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Select your authority role to initialize sandbox data.
            </p>
          </div>

          <form onSubmit={handleSignUp} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Official Designation</label>
              <input
                type="text"
                defaultValue="District Planning Officer IDA"
                className="w-full p-2.5 text-xs border border-slate-200 rounded-xl bg-white text-slate-800"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Jurisdiction Tier</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "district", label: "District Authority" },
                  { id: "state", label: "State Nodal" },
                  { id: "ministry", label: "Ministry / CVC" },
                  { id: "mp", label: "Member of Parliament" },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedRole(item.id as UserRole)}
                    className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                      selectedRole === item.id
                        ? "border-slate-900 bg-slate-900 text-white font-bold"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 pt-3"
            >
              <span>Initialize Session & Enter</span>
              <ArrowRight className="w-3.5 h-3.5 text-blue-400" />
            </button>
          </form>

          <div className="pt-2 text-center text-xs text-slate-500">
            <span>Already have credentials? </span>
            <Link href="/sign-in" className="text-blue-600 font-semibold hover:underline">
              Sign in directly
            </Link>
          </div>
        </div>
      </div>

      <div className="hidden md:flex flex-1 bg-slate-900 text-white p-12 lg:p-16 flex-col justify-center">
        <div className="space-y-4 max-w-md">
          <h2 className="text-2xl font-bold tracking-tight">
            Independent Verification Layer for MPLADS
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Every screen and calculation is badged with synthetic demo labels for absolute provenance transparency.
          </p>
        </div>
      </div>
    </div>
  );
}
