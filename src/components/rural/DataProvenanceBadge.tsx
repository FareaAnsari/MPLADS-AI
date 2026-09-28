import React, { useState } from 'react';
import { DataProvenance } from '../../types/rural';
import { Database, Info, X, ExternalLink, ShieldCheck } from 'lucide-react';

interface Props {
  provenance: DataProvenance;
  showDetailsButton?: boolean;
}

export const DataProvenanceBadge: React.FC<Props> = ({ provenance, showDetailsButton = true }) => {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <div className="inline-flex items-center space-x-2 text-[11px] font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded px-2.5 py-1 transition">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
        <span className="text-slate-500">Source:</span>
        <span className="font-semibold text-slate-800">{provenance.source}</span>
        {showDetailsButton && (
          <button
            onClick={() => setModalOpen(true)}
            className="text-gov-navy hover:text-blue-700 underline flex items-center space-x-0.5 ml-1"
            title="Inspect Data Provenance & Metadata"
          >
            <span>Audit Metadata</span>
            <Info className="w-3 h-3" />
          </button>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-gov border border-gov-border shadow-xl max-w-lg w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-gov-border pb-3">
              <div className="flex items-center space-x-2">
                <Database className="w-5 h-5 text-gov-navy" />
                <h3 className="text-sm font-bold text-gov-navy uppercase tracking-wide">
                  Official Data Provenance & Schema Audit
                </h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-700">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Source Organization</span>
                <span className="font-semibold text-slate-900">{provenance.source}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Dataset Title</span>
                <span className="font-semibold text-slate-900 text-right">{provenance.datasetName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Dataset Release / Tenure</span>
                <span className="font-semibold text-slate-900">{provenance.datasetDate}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Last System Update</span>
                <span className="font-semibold text-slate-900">{provenance.lastUpdated}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Record Count</span>
                <span className="font-semibold text-slate-900">{provenance.recordCount.toLocaleString()} verified records</span>
              </div>

              <div>
                <span className="font-semibold text-slate-800 block mb-1">Standard Fields Mapped:</span>
                <div className="flex flex-wrap gap-1">
                  {provenance.fieldsUsed.map((f, i) => (
                    <span key={i} className="bg-blue-50 text-blue-800 border border-blue-200 px-2 py-0.5 rounded text-[10px]">
                      {f}
                    </span>
                  ))}
                </div>
              </div>

              {provenance.missingFields.length > 0 && (
                <div>
                  <span className="font-semibold text-amber-800 block mb-1">Missing / Unlinked Fields in Source:</span>
                  <div className="flex flex-wrap gap-1">
                    {provenance.missingFields.map((f, i) => (
                      <span key={i} className="bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded text-[10px]">
                        ⚠️ {f}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-gov-border flex justify-between items-center text-[11px] text-slate-500">
              <span className="flex items-center space-x-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Verified against MoSPI / LGD Open Standards</span>
              </span>
              <button
                onClick={() => setModalOpen(false)}
                className="px-3 py-1.5 bg-gov-navy text-white text-xs font-semibold rounded hover:bg-gov-navy-light transition"
              >
                Close Audit
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
