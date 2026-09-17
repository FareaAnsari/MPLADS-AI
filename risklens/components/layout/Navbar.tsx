"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRiskLensStore } from "@/lib/store";
import { UserRole } from "@/lib/types";
import { DataSourceBadge } from "@/components/cards/DataSourceBadge";
import {
  Search,
  ChevronDown,
  Layers,
  ShieldAlert,
  Compass,
  MapPin,
  GitCompare,
  Network,
  Route,
  HeartHandshake,
  Sparkles,
  Wifi,
  Menu,
  X,
  Building2,
} from "lucide-react";

export type LokSabhaTerm = "18th" | "17th" | "rajya_sabha";

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { currentRole, setRole, projects } = useRiskLensStore();
  const [activeTerm, setActiveTerm] = useState<LokSabhaTerm>("18th");
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const flaggedCount = projects.filter((p) => p.riskScore.compositeScore >= 60).length;

  const navLinks = [
    { name: "Dashboard", href: "/" },
    { name: "Track My Area", href: "/track-area" },
    { name: "States & UTs", href: "/states" },
    { name: "Compare", href: "/compare" },
    { name: "Risk Queue", href: "/queue", badge: `${flaggedCount}` },
    { name: "Hero Case", href: "/investigation/PRJ-2024-003" },
    { name: "Entity Graph", href: "/graph" },
    { name: "Inspection Route", href: "/inspections/optimizer" },
    { name: "Equity Radar", href: "/equity" },
  ];

  const filteredProjects = searchQuery.trim()
    ? projects.filter(
        (p) =>
          p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.constituencyId.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.workCategory.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <>
      {/* Top Notification & Transparency Banner */}
      <div className="bg-slate-900 text-slate-300 text-xs px-4 py-1.5 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span className="font-semibold text-white font-primary">
            Empowered Indian
          </span>
          <span className="text-slate-400 hidden sm:inline">
            • MPLADS Government Transparency & AI Risk Layer
          </span>
        </div>

        <div className="flex items-center gap-3">
          <DataSourceBadge type="synthetic" />
          <Link
            href="/offline"
            className="text-slate-300 hover:text-white transition-colors inline-flex items-center gap-1 font-semibold"
          >
            <Wifi className="w-3 h-3 text-emerald-400" />
            <span>Offline Demo</span>
          </Link>
        </div>
      </div>

      {/* Main Civic Header Bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Logo & Platform Name */}
            <div className="flex items-center gap-3 shrink-0">
              <Link href="/" className="flex items-center gap-2.5 group">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white shadow-sm ring-1 ring-blue-500/20 group-hover:scale-105 transition-transform">
                  <ShieldAlert className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <div className="text-lg font-extrabold text-slate-900 tracking-tight font-display flex items-center gap-1.5 leading-none">
                    Empowered Indian
                    <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded font-primary">
                      MPLADS
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-primary font-medium tracking-normal mt-0.5">
                    Citizen Transparency & AI Risk Intelligence
                  </div>
                </div>
              </Link>
            </div>

            {/* Lok Sabha Term Switcher (matching empoweredindian.in) */}
            <div className="hidden lg:flex items-center bg-slate-100/90 p-1 rounded-xl border border-slate-200 text-xs font-semibold font-primary">
              <button
                onClick={() => setActiveTerm("18th")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeTerm === "18th"
                    ? "bg-white text-slate-900 shadow-2xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                18th Lok Sabha (2024–29)
              </button>
              <button
                onClick={() => setActiveTerm("17th")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeTerm === "17th"
                    ? "bg-white text-slate-900 shadow-2xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                17th Lok Sabha (2019–24)
              </button>
              <button
                onClick={() => setActiveTerm("rajya_sabha")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeTerm === "rajya_sabha"
                    ? "bg-white text-slate-900 shadow-2xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Rajya Sabha
              </button>
            </div>

            {/* Right Action: Global Search & Role Switcher */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Quick Search Button */}
              <button
                onClick={() => setSearchOpen(true)}
                className="flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200/70 border border-slate-200 rounded-xl text-xs text-slate-500 font-primary transition-colors"
                title="Search MP, Constituency, or Work"
              >
                <Search className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden md:inline">Search MPLADS...</span>
                <kbd className="hidden md:inline text-[9px] font-mono bg-white px-1.5 py-0.5 rounded border border-slate-300">
                  ⌘K
                </kbd>
              </button>

              {/* Fast Authority Role Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 transition-colors shadow-2xs"
                >
                  <Building2 className="w-3.5 h-3.5 text-blue-600" />
                  <span className="capitalize hidden sm:inline">{currentRole} Role</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {roleDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 p-1.5 z-50 animate-in fade-in-0 duration-100 font-primary">
                    <div className="px-2 py-1 text-[10px] uppercase font-bold tracking-wider text-slate-400">
                      Switch Authority Scope
                    </div>
                    {(["district", "state", "ministry", "mp"] as UserRole[]).map((r) => (
                      <button
                        key={r}
                        onClick={() => {
                          setRole(r);
                          setRoleDropdownOpen(false);
                        }}
                        className={`w-full text-left px-2.5 py-2 rounded-lg text-xs capitalize transition-colors flex items-center justify-between ${
                          currentRole === r
                            ? "bg-slate-900 text-white font-bold"
                            : "hover:bg-slate-100 text-slate-800 font-medium"
                        }`}
                      >
                        <span>{r} View</span>
                        {currentRole === r && (
                          <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded">
                            Active
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-slate-600 hover:text-slate-900 md:hidden rounded-lg hover:bg-slate-100"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Secondary Civic Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 border-t border-slate-100 py-1.5 overflow-x-auto no-scrollbar font-primary">
            {navLinks.map((link) => {
              const isActive =
                pathname === link.href ||
                (link.href !== "/" && pathname.startsWith(link.href));

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    isActive
                      ? "bg-blue-600 text-white shadow-2xs font-bold"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  <span>{link.name}</span>
                  {link.badge && (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-rose-100 text-rose-700 font-mono"
                      }`}
                    >
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-2 font-primary">
            <div className="pb-2 border-b border-slate-100 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Term:
              </span>
              <div className="flex gap-1 text-xs">
                <button
                  onClick={() => setActiveTerm("18th")}
                  className={`px-2 py-1 rounded ${
                    activeTerm === "18th" ? "bg-slate-900 text-white font-bold" : "text-slate-600"
                  }`}
                >
                  18th LS
                </button>
                <button
                  onClick={() => setActiveTerm("17th")}
                  className={`px-2 py-1 rounded ${
                    activeTerm === "17th" ? "bg-slate-900 text-white font-bold" : "text-slate-600"
                  }`}
                >
                  17th LS
                </button>
              </div>
            </div>

            <div className="space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100"
                >
                  <span>{link.name}</span>
                  {link.badge && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-700">
                      {link.badge}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Instant Global Search Modal */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-start justify-center pt-20 px-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full p-4 overflow-hidden font-primary">
            <div className="flex items-center gap-3 border-b border-slate-200 pb-3">
              <Search className="w-5 h-5 text-slate-400" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Type MP name, Constituency, Work ID, or sector (e.g. Roads, Hospital)..."
                className="w-full text-sm font-semibold text-slate-900 placeholder:text-slate-400 outline-none"
              />
              <button
                onClick={() => {
                  setSearchOpen(false);
                  setSearchQuery("");
                }}
                className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold px-2 py-1 rounded-lg"
              >
                ESC
              </button>
            </div>

            {/* Search Results */}
            <div className="mt-3 max-h-80 overflow-y-auto space-y-2">
              {searchQuery.trim() === "" ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  Search across 543 constituencies, works, contractors, and AI risk signals.
                </div>
              ) : filteredProjects.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  No MPLADS records found matching &ldquo;{searchQuery}&rdquo;.
                </div>
              ) : (
                filteredProjects.map((p) => (
                  <Link
                    key={p.id}
                    href={`/investigation/${p.id}`}
                    onClick={() => setSearchOpen(false)}
                    className="p-2.5 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/40 transition-colors flex items-center justify-between group"
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-900 group-hover:text-blue-600">
                        {p.title}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        {p.id} • {p.constituencyId} • {p.workCategory}
                      </div>
                    </div>
                    <div className="text-right">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          p.riskScore.compositeScore >= 60
                            ? "bg-rose-100 text-rose-700"
                            : p.riskScore.compositeScore >= 35
                            ? "bg-amber-100 text-amber-700"
                            : "bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        Score {p.riskScore.compositeScore}
                      </span>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
