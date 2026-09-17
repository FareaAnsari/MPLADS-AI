import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  OFFICIAL_LIVE_PROVENANCE, 
  DEMO_BENCHMARK_PROVENANCE, 
  isRuralDemoModeActive, 
  setRuralDemoModeActive 
} from '../data/ruralVillageData';
import { DataProvenanceBadge } from '../components/rural/DataProvenanceBadge';
import { 
  Database, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  FileSpreadsheet, 
  ShieldCheck, 
  Layers, 
  ExternalLink,
  ArrowRight
} from 'lucide-react';

export const VillageDataQualityPage: React.FC = () => {
  const navigate = useNavigate();
  const [demoMode, setDemoMode] = useState<boolean>(isRuralDemoModeActive());

  useEffect(() => {
    const handleModeChange = () => setDemoMode(isRuralDemoModeActive());
    window.addEventListener('rural-demo-mode-changed', handleModeChange);
    return () => window.removeEventListener('rural-demo-mode-changed', handleModeChange);
  }, []);

  const handleToggleMode = (mode: boolean) => {
    setRuralDemoModeActive(mode);
    setDemoMode(mode);
  };

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-5 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-gov-border pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-gov-navy text-white">
              Data Governance & Audit Protocol
            </span>
            <DataProvenanceBadge provenance={demoMode ? DEMO_BENCHMARK_PROVENANCE : OFFICIAL_LIVE_PROVENANCE} />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-gov-navy tracking-tight mt-1">
            Rural Village Data Provenance & Quality Audit
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Technical assessment of public e-SAKSHI and data.gov.in releases against Local Government Directory (LGD) requirements.
          </p>
        </div>

        <button
          onClick={() => navigate('/rural-intelligence')}
          className="px-4 py-2 bg-gov-navy hover:bg-gov-navy-light text-white text-xs font-bold rounded shadow-xs transition"
        >
          Open Rural Dashboard
        </button>
      </div>

      {/* Mode Control Card */}
      <div className="bg-white rounded-gov border border-gov-border shadow-gov p-5 space-y-4">
        <h2 className="text-sm font-bold text-gov-navy uppercase tracking-wide flex items-center space-x-2">
          <Database className="w-4 h-4 text-gov-navy" />
          <span>Active Data Mode & Simulation Control</span>
        </h2>
        <p className="text-xs text-slate-600 leading-relaxed">
          Per Government of India public data guidelines, synthetic or fabricated village relationships are strictly prohibited in official mode. Select the active operating state for the platform:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          
          {/* Live Official Mode */}
          <div 
            onClick={() => handleToggleMode(false)}
            className={`p-4 rounded-gov border-2 cursor-pointer transition flex flex-col justify-between space-y-3 ${
              !demoMode 
                ? 'border-gov-navy bg-blue-50/40 shadow-xs' 
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-gov-navy">
                  1. Official Live Production Dataset
                </span>
                {!demoMode && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gov-navy text-white">
                    CURRENTLY ACTIVE
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-600 mt-1">
                Audits real government datasets from MoSPI e-SAKSHI (28,004 records). Shows standard schema gap notice when village-level columns are not populated.
              </p>
            </div>
            <div className="text-[10px] text-slate-500 font-mono">
              Source: e-SAKSHI / data.gov.in | Records: 28,004
            </div>
          </div>

          {/* Demo Benchmark Sample */}
          <div 
            onClick={() => handleToggleMode(true)}
            className={`p-4 rounded-gov border-2 cursor-pointer transition flex flex-col justify-between space-y-3 ${
              demoMode 
                ? 'border-amber-500 bg-amber-50/50 shadow-xs' 
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-amber-900">
                  2. Demo Mode (LGD Pilot Benchmark Sample)
                </span>
                {demoMode && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-600 text-white">
                    CURRENTLY ACTIVE
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-600 mt-1">
                Enables a verified pilot sample of authentic Local Government Directory (LGD) villages to demonstrate interactive Leaflet hierarchy maps, KPI rollups, fewer-project analysis, and village comparison.
              </p>
            </div>
            <div className="text-[10px] text-slate-500 font-mono">
              Source: LGD Master Pilot | Records: 32 Verified Villages
            </div>
          </div>

        </div>
      </div>

      {/* Detailed Provenance Audit Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* Source 1: Official e-SAKSHI */}
        <div className="bg-white rounded-gov border border-gov-border shadow-gov p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-gov-border pb-2.5">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
              <h3 className="text-xs font-bold text-gov-navy uppercase tracking-wide">
                Production e-SAKSHI Datasets (MoSPI)
              </h3>
            </div>
            <span className="text-[11px] font-mono font-semibold text-slate-600">28,004 Rows</span>
          </div>

          <div className="space-y-2 text-xs text-slate-700">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Repository Files</span>
              <span className="font-medium text-right">Works Completed.csv, Expenditure.csv</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Government Portal</span>
              <span className="font-medium">mplads.mospi.gov.in / data.gov.in</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Tenure Coverage</span>
              <span className="font-medium">18th Lok Sabha & Rajya Sabha</span>
            </div>
            
            <div className="pt-2">
              <span className="font-semibold text-slate-800 block mb-1.5">Standard Fields Present (100% Verified):</span>
              <div className="grid grid-cols-2 gap-1 text-[11px]">
                <div className="flex items-center space-x-1 text-emerald-800">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                  <span>State</span>
                </div>
                <div className="flex items-center space-x-1 text-emerald-800">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                  <span>IDA (District Authority)</span>
                </div>
                <div className="flex items-center space-x-1 text-emerald-800">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                  <span>Parliamentary Constituency</span>
                </div>
                <div className="flex items-center space-x-1 text-emerald-800">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                  <span>Hon'ble MP Name</span>
                </div>
                <div className="flex items-center space-x-1 text-emerald-800">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                  <span>Work Unique ID</span>
                </div>
                <div className="flex items-center space-x-1 text-emerald-800">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                  <span>Disbursed Expenditure</span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <span className="font-semibold text-amber-800 block mb-1.5">Missing Village Fields in Public Schema:</span>
              <div className="space-y-1 text-[11px] text-amber-900">
                <div className="flex items-center space-x-1">
                  <XCircle className="w-3 h-3 text-amber-600 shrink-0" />
                  <span>Standardized Village Name Column (Unmapped)</span>
                </div>
                <div className="flex items-center space-x-1">
                  <XCircle className="w-3 h-3 text-amber-600 shrink-0" />
                  <span>Official LGD 6-digit Village Code (Missing)</span>
                </div>
                <div className="flex items-center space-x-1">
                  <XCircle className="w-3 h-3 text-amber-600 shrink-0" />
                  <span>Block / Taluka Boundary Key (Missing)</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Source 2: Local Government Directory (LGD) Master */}
        <div className="bg-white rounded-gov border border-gov-border shadow-gov p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-gov-border pb-2.5">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
              <h3 className="text-xs font-bold text-gov-navy uppercase tracking-wide">
                Local Government Directory (LGD / MoPR)
              </h3>
            </div>
            <span className="text-[11px] font-mono font-semibold text-emerald-700">Verified Master</span>
          </div>

          <div className="space-y-2 text-xs text-slate-700">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Custodial Authority</span>
              <span className="font-medium">Ministry of Panchayati Raj, Govt of India</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Coding Standard</span>
              <span className="font-medium">6-Digit National Village Census Code</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Spatial Hierarchy</span>
              <span className="font-medium">India &gt; State &gt; District &gt; Block &gt; Village</span>
            </div>

            <div className="pt-2">
              <span className="font-semibold text-slate-800 block mb-1.5">Integration Recommendation:</span>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                To bridge the rural intelligence gap, District Planning Authorities (IDAs) should record the mandatory 6-digit LGD village code at the time of MP project recommendation or technical sanction. This enables automated spatial tracking on Bhuvan ISRO and National Panchayat portals.
              </p>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <span className="font-semibold text-slate-800 block mb-1.5">Geospatial Coordinates Policy:</span>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Coordinates are displayed only when verified from Survey of India or Bhuvan ISRO registries. If coordinates are unavailable, the platform strictly renders the administrative hierarchy without synthetic coordinates.
              </p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
