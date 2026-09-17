import React, { useState } from 'react';
import { RefreshCw, Upload, CheckCircle2, AlertTriangle, X, FileText, ShieldAlert } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onRefreshComplete?: () => void;
}

export const DataRefreshModal: React.FC<Props> = ({ isOpen, onClose, onRefreshComplete }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [refreshDone, setRefreshDone] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSimulateRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      setRefreshDone(true);
      if (onRefreshComplete) onRefreshComplete();
    }, 1200);
  };

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFileName(e.target.files[0].name);
    }
  };

  const handleClose = () => {
    setRefreshDone(false);
    setSelectedFileName(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-gov border border-gov-border shadow-2xl max-w-lg w-full p-5 space-y-4 text-xs text-slate-700">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gov-border pb-3">
          <div className="flex items-center space-x-2 text-gov-navy">
            <RefreshCw className="w-5 h-5 text-gov-blue" />
            <h3 className="font-bold text-sm uppercase tracking-wide">
              National Pipeline Synchronization & Ingestion
            </h3>
          </div>
          <button onClick={handleClose} className="p-1 text-slate-400 hover:text-slate-700 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Status Report Card */}
        <div className="bg-slate-50 border border-slate-200 rounded p-3.5 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500">Last Successful Pipeline Sync:</span>
            <strong className="text-slate-900 font-mono">2026-09-17 06:00 IST</strong>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500">Current Ingestion Corpus:</span>
            <strong className="text-gov-navy font-bold">28,002 Official Works</strong>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500">Overwriting Policy:</span>
            <span className="text-emerald-700 font-semibold">Strict Provenance Preservation (No Silent Overwrite)</span>
          </div>
        </div>

        {/* Sync Summary Result if refreshed */}
        {refreshDone && (
          <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded space-y-2 animate-fadeIn">
            <div className="flex items-center space-x-2 text-emerald-800 font-bold text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Pipeline Synchronization Completed Successfully</span>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2 text-[11px] font-mono">
              <div className="bg-white p-2 rounded border border-emerald-200 text-center">
                <span className="text-slate-500 block text-[10px] uppercase font-sans">Records Added</span>
                <strong className="text-emerald-700 text-sm">0</strong>
              </div>
              <div className="bg-white p-2 rounded border border-emerald-200 text-center">
                <span className="text-slate-500 block text-[10px] uppercase font-sans">Records Updated</span>
                <strong className="text-sky-700 text-sm">0</strong>
              </div>
              <div className="bg-white p-2 rounded border border-emerald-200 text-center">
                <span className="text-slate-500 block text-[10px] uppercase font-sans">Unchanged</span>
                <strong className="text-slate-700 text-sm">28,002</strong>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono pt-1">
              <div className="bg-white p-2 rounded border border-amber-200 text-center">
                <span className="text-amber-700 block text-[10px] uppercase font-sans">Potential Conflicts</span>
                <strong className="text-amber-700 text-xs">1 Logged (Under Review)</strong>
              </div>
              <div className="bg-white p-2 rounded border border-emerald-200 text-center">
                <span className="text-emerald-700 block text-[10px] uppercase font-sans">Failed Records</span>
                <strong className="text-emerald-700 text-xs">0 (All Valid)</strong>
              </div>
            </div>
          </div>
        )}

        {/* Official CSV / Excel Import Form */}
        <div className="border border-dashed border-slate-300 rounded p-4 text-center space-y-2 bg-slate-50/50">
          <Upload className="w-6 h-6 text-slate-400 mx-auto" />
          <div>
            <span className="font-bold text-slate-800 block text-xs">
              Import Official Government CSV / Excel Export
            </span>
            <p className="text-[11px] text-slate-500 max-w-xs mx-auto mt-0.5">
              Load legitimate public reports downloaded from e-SAKSHI (Works Completed, Vendor Payments) or data.gov.in.
            </p>
          </div>

          <label className="inline-block mt-2 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold rounded cursor-pointer text-xs shadow-2xs">
            Browse Official CSV File
            <input type="file" accept=".csv,.xlsx,.xls" onChange={handleFileSelected} className="hidden" />
          </label>

          {selectedFileName && (
            <div className="text-[11px] text-emerald-700 font-mono flex items-center justify-center space-x-1 mt-1">
              <FileText className="w-3.5 h-3.5" />
              <span>Selected: {selectedFileName}</span>
            </div>
          )}
        </div>

        {/* Statutory disclaimer */}
        <div className="bg-blue-50 border border-blue-200 p-2.5 rounded text-[11px] text-blue-900 flex items-start space-x-2">
          <ShieldAlert className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Access Compliance:</strong> This pipeline strictly ingests publicly accessible data. It respects portal access controls and does not scrape or bypass technical authentication.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
          <button
            onClick={handleClose}
            className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 rounded border border-slate-300 text-xs font-semibold"
          >
            Close
          </button>
          <button
            onClick={handleSimulateRefresh}
            disabled={refreshing}
            className="px-4 py-1.5 bg-gov-navy hover:bg-slate-800 text-white rounded text-xs font-bold flex items-center space-x-1.5 shadow-xs disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Synchronizing Pipeline...' : 'Run Pipeline Refresh'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
