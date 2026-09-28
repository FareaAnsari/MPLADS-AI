import React, { useState } from 'react';
import { 
  Truck, 
  PackageCheck, 
  FileText, 
  Wrench, 
  Scale, 
  AlertTriangle, 
  ShieldCheck, 
  Layers, 
  Filter, 
  Building2, 
  ArrowRight,
  TrendingDown,
  Info
} from 'lucide-react';
import { SupplyChainTracker, SAMPLE_SUPPLY_CHAIN_DATA } from '../components/SupplyChainTracker';
import { MOCK_PROJECTS } from '../data/mockData';

export const SupplyChainPage: React.FC = () => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>('WRK-2024-BR01-001');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');

  const selectedProject = MOCK_PROJECTS.find(p => p.id === selectedProjectId) || MOCK_PROJECTS[0];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 font-sans">
      {/* Official Government Header Banner */}
      <div className="bg-white rounded-gov border border-slate-300 p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-bold px-2.5 py-0.5 rounded tracking-wide uppercase">
                Procurement & Vendor Governance
              </span>
              <span className="text-slate-500 text-xs font-medium">GFR 2017 & MPLADS 2023 Guidelines Compliant</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#0b2e59] flex items-center gap-3">
              <Truck className="w-8 h-8 text-[#0b2e59]" />
              Supply Chain & Material Reconciliation Tracker
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-2 max-w-3xl leading-relaxed">
              Traceable, tamper-evident chain of custody monitoring raw materials (Cement, Steel, Pipes, PV Modules) 
              from statutory purchase order issuance, vendor dispatch, GPS-geofenced site delivery, to engineer measurement book (MB) installation.
            </p>
          </div>

          {/* KPI Stat Box */}
          <div className="flex sm:flex-col gap-3 shrink-0">
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-center sm:text-right min-w-[150px]">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Statutory Tolerance</span>
              <span className="text-lg font-bold font-mono text-emerald-700">±10.0% Max</span>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-center sm:text-right min-w-[150px]">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Audit Risk Penalty</span>
              <span className="text-lg font-bold font-mono text-rose-700">+22 to +35 Pts</span>
            </div>
          </div>
        </div>
      </div>

      {/* Project Selector Bar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Building2 className="w-5 h-5 text-slate-600" />
          <div>
            <div className="text-xs text-slate-500 font-medium">Select MPLADS Work Site to Inspect:</div>
            <div className="text-sm font-bold text-slate-900">{selectedProject?.name}</div>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="w-full md:w-80 text-xs font-semibold bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:ring-2 focus:ring-emerald-500"
          >
            {MOCK_PROJECTS.slice(0, 10).map((proj) => (
              <option key={proj.id} value={proj.id}>
                {proj.code} - {proj.name.slice(0, 45)}...
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Embedded Main Supply Chain Tracker Component */}
      <SupplyChainTracker 
        projectId={selectedProjectId}
        projectName={selectedProject?.name}
        isOfficer={true}
      />

      {/* Institutional Explanatory Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 flex items-start gap-4">
        <Info className="w-6 h-6 text-blue-700 shrink-0 mt-0.5" />
        <div className="text-xs text-blue-900 space-y-1.5 leading-relaxed">
          <div className="font-bold text-sm text-blue-950">How Anti-Fraud Material Reconciliation Works</div>
          <p>
            1. <strong>Procurement Stage</strong> establishes the sanctioned baseline from the Bill of Quantities (BOQ) with GeM / CPWD rate checks.
          </p>
          <p>
            2. <strong>Delivery Confirmation</strong> verifies that trucks arrived at the registered latitude/longitude with perceptual hash (pHash) analysis to detect reused delivery stock photos.
          </p>
          <p>
            3. <strong>Installation Measurement</strong> reconciles physical measurement book entries against billed quantities. Any deficit exceeding 10% automatically injects an audit anomaly flag into the central AI Risk Engine.
          </p>
        </div>
      </div>
    </div>
  );
};
