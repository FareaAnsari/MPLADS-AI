import React from 'react';
import { AlertCircle, FileSpreadsheet, CheckCircle2, XCircle, ArrowRight, ShieldAlert, Database } from 'lucide-react';
import { OFFICIAL_LIVE_PROVENANCE, setRuralDemoModeActive } from '../../data/ruralVillageData';

interface Props {
  onEnableDemoMode: () => void;
}

export const MissingDataNotice: React.FC<Props> = ({ onEnableDemoMode }) => {
  const handleEnableDemo = () => {
    setRuralDemoModeActive(true);
    onEnableDemoMode();
  };

  return (
    <div className="bg-white border-2 border-amber-300 rounded-gov shadow-sm p-6 sm:p-8 space-y-6 max-w-4xl mx-auto my-6 text-slate-800">
      {/* Top Banner Alert */}
      <div className="flex items-start space-x-4">
        <div className="p-3 bg-amber-100 rounded-full text-amber-700 shrink-0">
          <AlertCircle className="w-8 h-8" />
        </div>
        <div>
          <span className="inline-block px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-amber-200 text-amber-900 mb-1.5">
            Official Data Schema Finding
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-gov-navy tracking-tight">
            Village-level project linkage unavailable
          </h2>
          <p className="text-sm text-slate-600 mt-1 leading-relaxed">
            Current MPLADS source data does not contain sufficient village-level information for this analysis.
          </p>
        </div>
      </div>

      {/* Dataset Verification Summary */}
      <div className="bg-slate-50 border border-slate-200 rounded-gov p-4 text-xs space-y-3">
        <div className="flex items-center space-x-2 text-gov-navy font-semibold">
          <Database className="w-4 h-4" />
          <span>Active Dataset Source Audit ({OFFICIAL_LIVE_PROVENANCE.recordCount.toLocaleString()} Verified Records in Registry)</span>
        </div>
        <p className="text-slate-600">
          The official public release of <strong>e-SAKSHI</strong> and <strong>data.gov.in</strong> MPLADS registers project transactions at the 
          <strong> State</strong>, <strong> District Planning Authority (IDA)</strong>, <strong> Parliamentary Constituency</strong>, and 
          <strong> Hon'ble MP</strong> administrative tiers. While work descriptions frequently mention local hamlets, a standardized relational column linking projects directly to <strong>Local Government Directory (LGD) Village Codes</strong> is absent from the production release.
        </p>
      </div>

      {/* Required Fields vs Current Source Availability Matrix */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          Schema Specification & Gap Analysis
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          
          {/* Missing Required Fields */}
          <div className="border border-red-200 bg-red-50/50 rounded p-3.5 space-y-2.5">
            <div className="flex items-center space-x-2 font-bold text-red-800">
              <XCircle className="w-4 h-4 text-red-600" />
              <span>Missing Required Fields in Current Dataset</span>
            </div>
            <ul className="space-y-1.5 text-slate-700">
              <li className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                <span className="font-semibold text-slate-900">Village Name</span>
                <span className="text-[11px] text-slate-500">(Direct column unmapped)</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                <span className="font-semibold text-slate-900">Village Code</span>
                <span className="text-[11px] text-slate-500">(LGD 6-digit census identifier)</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                <span className="font-semibold text-slate-900">Block / Sub-District</span>
                <span className="text-[11px] text-slate-500">(Taluka/Tehsil boundary key)</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                <span className="font-semibold text-slate-900">Project-to-Village Link</span>
                <span className="text-[11px] text-slate-500">(Foreign key relationship)</span>
              </li>
            </ul>
          </div>

          {/* Available Source Fields */}
          <div className="border border-emerald-200 bg-emerald-50/50 rounded p-3.5 space-y-2.5">
            <div className="flex items-center space-x-2 font-bold text-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Verified Fields Present in Source Data</span>
            </div>
            <ul className="space-y-1.5 text-slate-700">
              <li className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span className="font-medium text-slate-900">State & District (IDA Unit)</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span className="font-medium text-slate-900">Project ID / Work Unique Code</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span className="font-medium text-slate-900">Parliamentary Constituency & MP</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span className="font-medium text-slate-900">Work Category & Description</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span className="font-medium text-slate-900">Sanctioned & Disbursed Expenditure</span>
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* Official Rule & Demo Mode Trigger */}
      <div className="border-t border-slate-200 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="text-xs text-slate-500 space-y-1">
          <p className="font-semibold text-slate-700 flex items-center space-x-1">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-600 inline" />
            <span>Strict Government Data Integrity Directive</span>
          </p>
          <p>
            Per governance protocol, the platform strictly avoids synthesizing unverified village linkages.
            To preview analytical dashboards, filters, Leaflet hierarchy map, and comparison tools, you can enable 
            <strong> Demo Mode (LGD Pilot Benchmark Sample)</strong>.
          </p>
        </div>

        <button
          onClick={handleEnableDemo}
          className="shrink-0 px-4 py-2.5 bg-gov-navy hover:bg-gov-navy-light text-white text-xs font-bold rounded shadow-gov flex items-center space-x-2 transition cursor-pointer"
        >
          <FileSpreadsheet className="w-4 h-4 text-amber-400" />
          <span>Enable Demo Mode (LGD Pilot Sample)</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
