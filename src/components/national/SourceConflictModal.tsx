import React from 'react';
import { SourceConflictRecord } from '../../types/nationalPipeline';
import { AlertCircle, X, ShieldAlert, CheckCircle2, Calendar, FileText } from 'lucide-react';

interface Props {
  conflict: SourceConflictRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onResolve?: (conflictId: string, choice: 'A' | 'B') => void;
}

export const SourceConflictModal: React.FC<Props> = ({
  conflict,
  isOpen,
  onClose,
  onResolve
}) => {
  if (!isOpen || !conflict) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-gov border border-gov-border shadow-2xl max-w-xl w-full p-5 space-y-4 text-xs text-slate-700">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gov-border pb-3">
          <div className="flex items-center space-x-2 text-rose-700">
            <AlertCircle className="w-5 h-5" />
            <div>
              <h3 className="font-bold text-sm uppercase tracking-wide text-slate-900">
                Source Conflict Detected
              </h3>
              <p className="text-[11px] text-slate-500 font-mono">
                Project ID: {conflict.project_id}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Project Context */}
        <div className="bg-slate-50 border border-slate-200 p-3 rounded space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-500">Project Context</span>
          <p className="font-bold text-slate-900 text-xs">{conflict.project_name}</p>
          <div className="text-[11px] text-rose-700 font-mono font-semibold">
            Conflicting Field: <span className="underline">{conflict.conflicting_field}</span>
          </div>
        </div>

        {/* Side-by-Side Comparison */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          
          {/* Source A */}
          <div className="border border-blue-200 bg-blue-50/40 rounded p-3 space-y-2 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-blue-200 pb-1.5 mb-1.5">
                <span className="font-bold text-xs text-blue-900 uppercase">Source A</span>
                <span className="text-[10px] px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded font-mono">PRIMARY</span>
              </div>
              <p className="font-semibold text-slate-800 text-xs">
                {conflict.source_a.source_name}
              </p>
              <div className="mt-2 p-2 bg-white rounded border border-blue-200 text-xs font-mono font-bold text-slate-900">
                {conflict.source_a.value}
              </div>
              <div className="flex items-center space-x-1 text-[10px] text-slate-500 mt-2">
                <Calendar className="w-3 h-3 text-slate-400" />
                <span>Published: {conflict.source_a.date}</span>
              </div>
            </div>

            {onResolve && (
              <button
                onClick={() => onResolve(conflict.conflict_id, 'A')}
                className="w-full mt-3 px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded font-bold text-xs shadow-2xs"
              >
                Accept Source A
              </button>
            )}
          </div>

          {/* Source B */}
          <div className="border border-amber-200 bg-amber-50/40 rounded p-3 space-y-2 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-amber-200 pb-1.5 mb-1.5">
                <span className="font-bold text-xs text-amber-900 uppercase">Source B</span>
                <span className="text-[10px] px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded font-mono">SECONDARY</span>
              </div>
              <p className="font-semibold text-slate-800 text-xs">
                {conflict.source_b.source_name}
              </p>
              <div className="mt-2 p-2 bg-white rounded border border-amber-200 text-xs font-mono font-bold text-slate-900">
                {conflict.source_b.value}
              </div>
              <div className="flex items-center space-x-1 text-[10px] text-slate-500 mt-2">
                <Calendar className="w-3 h-3 text-slate-400" />
                <span>Published: {conflict.source_b.date}</span>
              </div>
            </div>

            {onResolve && (
              <button
                onClick={() => onResolve(conflict.conflict_id, 'B')}
                className="w-full mt-3 px-3 py-1.5 bg-amber-700 hover:bg-amber-800 text-white rounded font-bold text-xs shadow-2xs"
              >
                Accept Source B
              </button>
            )}
          </div>

        </div>

        {/* Statutory Neutrality Warning */}
        <div className="bg-slate-100 border border-slate-200 p-2.5 rounded text-[11px] text-slate-600 flex items-start space-x-2">
          <ShieldAlert className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Provenance Neutrality Policy:</strong> When two official government publications present differing figures, the system preserves both data streams until formally reconciled by the District Planning Authority. No automatic selection is permitted.
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded font-bold text-xs"
          >
            Close Inspector
          </button>
        </div>

      </div>
    </div>
  );
};
