import React from 'react';
import { AlertTriangle, ShieldAlert, Sparkles, AlertCircle } from 'lucide-react';
import { BidderScrutinySignal } from '../services/tenderService';

interface BidderScrutinyPanelProps {
  signals: BidderScrutinySignal[];
}

export const BidderScrutinyPanel: React.FC<BidderScrutinyPanelProps> = ({ signals }) => {
  if (!signals || signals.length === 0) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-gov p-3 text-xs text-emerald-800 flex items-center space-x-2">
        <Sparkles className="w-4 h-4 text-emerald-600 flex-shrink-0" />
        <div>
          <span className="font-bold">Algorithmic Scrutiny Passed:</span> No abnormal bid variances, rate leaks, or bidder concentration clusters detected across this comparative matrix.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-800 uppercase tracking-wider">
          <ShieldAlert className="w-4 h-4 text-amber-600" />
          <span>AI Bidder Scrutiny & Procurement Observations ({signals.length})</span>
        </div>
        <span className="px-2 py-0.5 bg-teal-50 border border-teal-200 text-teal-800 text-[10px] font-bold rounded">
          AI Audit Engine Live
        </span>
      </div>

      <div className="space-y-2">
        {signals.map((sig, idx) => {
          const isHigh = sig.severity === 'HIGH';
          return (
            <div
              key={idx}
              className={`p-3 rounded-gov border text-xs ${
                isHigh
                  ? 'bg-rose-50/80 border-rose-200 text-rose-950'
                  : 'bg-amber-50/80 border-amber-200 text-amber-950'
              }`}
            >
              <div className="flex items-start space-x-2">
                {isHigh ? (
                  <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold">{sig.title}</span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${
                        isHigh
                          ? 'bg-rose-100 border-rose-300 text-rose-800'
                          : 'bg-amber-100 border-amber-300 text-amber-800'
                      }`}
                    >
                      {sig.severity} SEVERITY • {Math.round(sig.confidence_score * 100)}% CONFIDENCE
                    </span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-slate-700">
                    {sig.observation}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
