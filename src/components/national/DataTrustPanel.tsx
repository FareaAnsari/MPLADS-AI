import React from 'react';
import { ShieldCheck, Database, Calendar, BarChart3, AlertTriangle, Layers } from 'lucide-react';
import { DataTrustMetadata } from '../../types/nationalPipeline';

interface Props {
  metadata: DataTrustMetadata;
  compact?: boolean;
  onToggleMode?: () => void;
}

export const DataTrustPanel: React.FC<Props> = ({ metadata, compact = false, onToggleMode }) => {
  const isReal = metadata.dataMode === 'REAL_DATA_MODE';

  if (compact) {
    return (
      <div className={`border-b px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-3 ${
        isReal ? 'bg-[#0b2e59] text-white border-[#082242]' : 'bg-amber-600 text-amber-50 border-amber-700'
      }`}>
        <div className="flex items-center space-x-2.5">
          {isReal ? (
            <span className="flex items-center space-x-1.5 px-2 py-0.5 rounded bg-emerald-700/80 text-white font-bold uppercase tracking-wider text-[10px] border border-emerald-500/50">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>REAL DATA MODE</span>
            </span>
          ) : (
            <span className="flex items-center space-x-1.5 px-2 py-0.5 rounded bg-amber-900/80 text-amber-100 font-bold uppercase tracking-wider text-[10px] border border-amber-300">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>DEMO MODE — SYNTHETIC DATA</span>
            </span>
          )}
          <span className="text-blue-200 font-mono">|</span>
          <span className="text-blue-100 font-medium">Source:</span>
          <span className="font-bold text-white">{metadata.dataSource}</span>
        </div>

        <div className="flex items-center space-x-4 text-[11px]">
          <div>
            <span className="text-blue-200">Records Analyzed:</span> <strong className="text-white ml-1">{metadata.recordsAnalyzed.toLocaleString()} Works</strong>
          </div>
          <div>
            <span className="text-blue-200">Data Quality:</span> <strong className="text-emerald-300 ml-1">{metadata.dataQuality}%</strong>
          </div>
          <div>
            <span className="text-blue-200">Last Synced:</span> <strong className="text-white ml-1">{metadata.lastUpdated}</strong>
          </div>
          {onToggleMode && (
            <button
              onClick={onToggleMode}
              className="px-2.5 py-0.5 rounded text-[10px] font-bold border transition-colors bg-white/10 hover:bg-white/20 text-white border-white/30"
            >
              Switch to {isReal ? 'Demo Mode' : 'Real Mode'}
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* High-visibility Warning Banner if in Demo Mode */}
      {!isReal && (
        <div className="bg-amber-50 border-2 border-amber-500 text-amber-950 p-4 rounded-gov shadow-xs flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-7 h-7 text-amber-600 shrink-0" />
            <div>
              <h4 className="font-bold text-sm uppercase tracking-wide text-amber-900">
                DEMO MODE — SYNTHETIC BENCHMARK ACTIVE
              </h4>
              <p className="text-xs text-amber-800 mt-0.5">
                Synthetic benchmark data is currently enabled for demonstration. Official statutory records are from e-SAKSHI.
              </p>
            </div>
          </div>
          {onToggleMode && (
            <button
              onClick={onToggleMode}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded shadow-xs uppercase tracking-wider"
            >
              Switch to Official Real Data
            </button>
          )}
        </div>
      )}

      {/* Main Judicial Data Trust Panel - Official Government GIGW Standard */}
      <div className="bg-white rounded-gov border border-slate-300 shadow-sm p-4 text-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-3 border-b border-slate-200 gap-3">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-50 rounded-md border border-blue-200 text-[#0b2e59]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-xs uppercase tracking-wider text-[#0b2e59]">
                  NATIONAL DATA TRUST & PROVENANCE REGISTRY
                </h3>
                <span className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-700 border border-slate-200 rounded font-semibold">
                  STATUTORY MoSPI AUDIT
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Official data provenance, indexing integrity, and statutory dataset verification parameters.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className={`px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider border flex items-center space-x-1.5 ${
              isReal
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : 'bg-amber-50 text-amber-800 border-amber-300'
            }`}>
              <span className={`w-2 h-2 rounded-full ${isReal ? 'bg-emerald-600' : 'bg-amber-600'}`} />
              <span>{isReal ? 'REAL DATA MODE (ACTIVE)' : 'DEMO MODE — SYNTHETIC'}</span>
            </span>
            {onToggleMode && (
              <button
                onClick={onToggleMode}
                className="text-[11px] px-2.5 py-1 rounded bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-semibold shadow-2xs transition"
              >
                {isReal ? 'Enable Demo Mode' : 'Return to Real Data'}
              </button>
            )}
          </div>
        </div>

        {/* 5 Evaluator Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-3 text-xs">
          <div className="bg-slate-50 rounded-md p-2.5 border border-slate-200">
            <div className="text-[10px] text-slate-500 uppercase font-bold flex items-center space-x-1">
              <Database className="w-3 h-3 text-blue-600" />
              <span>DATA SOURCE</span>
            </div>
            <div className="font-bold text-[#0b2e59] mt-1 text-[11px] line-clamp-2" title={metadata.dataSource}>
              {metadata.dataSource}
            </div>
          </div>

          <div className="bg-slate-50 rounded-md p-2.5 border border-slate-200">
            <div className="text-[10px] text-slate-500 uppercase font-bold flex items-center space-x-1">
              <Calendar className="w-3 h-3 text-blue-600" />
              <span>LAST UPDATED</span>
            </div>
            <div className="font-bold text-slate-900 mt-1 text-xs">
              {metadata.lastUpdated}
            </div>
          </div>

          <div className="bg-slate-50 rounded-md p-2.5 border border-slate-200">
            <div className="text-[10px] text-slate-500 uppercase font-bold flex items-center space-x-1">
              <BarChart3 className="w-3 h-3 text-emerald-600" />
              <span>RECORDS ANALYZED</span>
            </div>
            <div className="font-bold text-emerald-800 mt-1 text-sm font-mono">
              {metadata.recordsAnalyzed.toLocaleString()} Works
            </div>
          </div>

          <div className="bg-slate-50 rounded-md p-2.5 border border-slate-200">
            <div className="text-[10px] text-slate-500 uppercase font-bold flex items-center space-x-1">
              <Layers className="w-3 h-3 text-amber-600" />
              <span>COVERAGE</span>
            </div>
            <div className="font-bold text-slate-800 mt-1 text-[11px]">
              {metadata.coverage}
            </div>
          </div>

          <div className="bg-slate-50 rounded-md p-2.5 border border-slate-200">
            <div className="text-[10px] text-slate-500 uppercase font-bold flex items-center space-x-1">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              <span>DATA QUALITY</span>
            </div>
            <div className="font-bold text-emerald-800 mt-1 text-sm font-mono flex items-center space-x-1.5">
              <span>{metadata.dataQuality}%</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 border border-emerald-200 font-sans font-semibold">
                AUDITED
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
