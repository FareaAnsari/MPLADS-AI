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
        isReal ? 'bg-slate-900 text-slate-200 border-slate-800' : 'bg-amber-600 text-amber-50 border-amber-700'
      }`}>
        <div className="flex items-center space-x-2">
          {isReal ? (
            <span className="flex items-center space-x-1.5 px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold uppercase tracking-wider text-[10px] border border-emerald-500/30">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>REAL DATA MODE</span>
            </span>
          ) : (
            <span className="flex items-center space-x-1.5 px-2 py-0.5 rounded bg-black/40 text-amber-200 font-bold uppercase tracking-wider text-[10px] border border-amber-300">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>DEMO MODE — SYNTHETIC DATA</span>
            </span>
          )}
          <span className="text-slate-400 font-mono">|</span>
          <span className="text-slate-300 font-medium">Source:</span>
          <span className="font-semibold text-white">{metadata.dataSource}</span>
        </div>

        <div className="flex items-center space-x-4 text-[11px]">
          <div>
            <span className="text-slate-400">Records:</span> <strong className="text-white">{metadata.recordsAnalyzed.toLocaleString()}</strong>
          </div>
          <div>
            <span className="text-slate-400">Quality:</span> <strong className="text-emerald-400">{metadata.dataQuality}%</strong>
          </div>
          <div>
            <span className="text-slate-400">Updated:</span> <strong className="text-slate-300">{metadata.lastUpdated}</strong>
          </div>
          {onToggleMode && (
            <button
              onClick={onToggleMode}
              className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors ${
                isReal 
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700' 
                  : 'bg-white hover:bg-amber-100 text-amber-900 border-white'
              }`}
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
        <div className="bg-amber-600 border-2 border-amber-700 text-white p-4 rounded-gov shadow-md flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-8 h-8 text-amber-200 shrink-0" />
            <div>
              <h4 className="font-black text-sm uppercase tracking-wide">
                DEMO MODE — SYNTHETIC DATA ACTIVE
              </h4>
              <p className="text-xs text-amber-100 mt-0.5">
                Synthetic benchmark data is currently enabled for demonstration. Do NOT treat these records as official government records.
              </p>
            </div>
          </div>
          {onToggleMode && (
            <button
              onClick={onToggleMode}
              className="px-3 py-1.5 bg-white hover:bg-amber-50 text-amber-900 font-bold text-xs rounded shadow-xs uppercase tracking-wider"
            >
              Switch to Official Real Data
            </button>
          )}
        </div>
      )}

      {/* Main Judicial Data Trust Panel */}
      <div className="bg-gradient-to-r from-slate-900 via-gov-navy to-slate-900 text-white rounded-gov border border-slate-700 shadow-md p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-3 border-b border-slate-700/80 gap-3">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 bg-gov-blue/20 rounded-md border border-gov-blue/40 text-gov-gold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-200">
                  NATIONAL DATA TRUST & PROVENANCE PANEL
                </h3>
                <span className="text-[10px] px-1.5 py-0.2 bg-slate-800 text-slate-400 rounded font-mono">
                  STATUTORY AUDIT
                </span>
              </div>
              <p className="text-[11px] text-slate-300">
                Transparent data integrity metadata provided for evaluator & judicial verification.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className={`px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider border flex items-center space-x-1.5 ${
              isReal
                ? 'bg-emerald-950/80 text-emerald-400 border-emerald-600/50'
                : 'bg-amber-950/80 text-amber-300 border-amber-500/50'
            }`}>
              <span className={`w-2 h-2 rounded-full ${isReal ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <span>{isReal ? 'REAL DATA MODE (ACTIVE)' : 'DEMO MODE — SYNTHETIC'}</span>
            </span>
            {onToggleMode && (
              <button
                onClick={onToggleMode}
                className="text-[11px] px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-600"
              >
                {isReal ? 'Enable Demo Mode' : 'Return to Real Data'}
              </button>
            )}
          </div>
        </div>

        {/* 5 Evaluator Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-3 text-xs">
          <div className="bg-slate-800/60 rounded p-2.5 border border-slate-700/50">
            <div className="text-[10px] text-slate-400 uppercase font-semibold flex items-center space-x-1">
              <Database className="w-3 h-3 text-sky-400" />
              <span>DATA SOURCE</span>
            </div>
            <div className="font-bold text-white mt-1 text-[11px] line-clamp-2" title={metadata.dataSource}>
              {metadata.dataSource}
            </div>
          </div>

          <div className="bg-slate-800/60 rounded p-2.5 border border-slate-700/50">
            <div className="text-[10px] text-slate-400 uppercase font-semibold flex items-center space-x-1">
              <Calendar className="w-3 h-3 text-indigo-400" />
              <span>LAST UPDATED</span>
            </div>
            <div className="font-bold text-white mt-1 text-xs">
              {metadata.lastUpdated}
            </div>
          </div>

          <div className="bg-slate-800/60 rounded p-2.5 border border-slate-700/50">
            <div className="text-[10px] text-slate-400 uppercase font-semibold flex items-center space-x-1">
              <BarChart3 className="w-3 h-3 text-emerald-400" />
              <span>RECORDS ANALYZED</span>
            </div>
            <div className="font-bold text-emerald-400 mt-1 text-sm font-mono">
              {metadata.recordsAnalyzed.toLocaleString()} Works
            </div>
          </div>

          <div className="bg-slate-800/60 rounded p-2.5 border border-slate-700/50">
            <div className="text-[10px] text-slate-400 uppercase font-semibold flex items-center space-x-1">
              <Layers className="w-3 h-3 text-amber-400" />
              <span>COVERAGE</span>
            </div>
            <div className="font-bold text-slate-200 mt-1 text-[11px]">
              {metadata.coverage}
            </div>
          </div>

          <div className="bg-slate-800/60 rounded p-2.5 border border-slate-700/50">
            <div className="text-[10px] text-slate-400 uppercase font-semibold flex items-center space-x-1">
              <ShieldCheck className="w-3 h-3 text-teal-400" />
              <span>DATA QUALITY</span>
            </div>
            <div className="font-bold text-teal-400 mt-1 text-sm font-mono flex items-center space-x-1.5">
              <span>{metadata.dataQuality}%</span>
              <span className="text-[10px] px-1 py-0.5 rounded bg-teal-900/60 text-teal-300 font-sans font-normal">
                HIGH AUDIT
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
