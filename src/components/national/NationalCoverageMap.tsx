import React, { useState } from 'react';
import { AdminStateRecord, CoverageTier } from '../../types/nationalPipeline';
import { ADMIN_STATES } from '../../services/nationalDataPipelineService';
import { MapPin, Info, CheckCircle2, AlertCircle, HelpCircle, Layers } from 'lucide-react';

export const NationalCoverageMap: React.FC = () => {
  const [selectedTier, setSelectedTier] = useState<CoverageTier | 'ALL'>('ALL');
  const [activeState, setActiveState] = useState<AdminStateRecord | null>(ADMIN_STATES[0]);

  const filteredStates = selectedTier === 'ALL' 
    ? ADMIN_STATES 
    : ADMIN_STATES.filter(s => s.coverage_tier === selectedTier);

  const getTierBadge = (tier: CoverageTier) => {
    switch (tier) {
      case 'Complete/High Coverage':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Partial Coverage':
        return 'bg-sky-100 text-sky-800 border-sky-300';
      case 'Limited Coverage':
        return 'bg-amber-100 text-amber-800 border-amber-300';
    }
  };

  const getTierColorClass = (tier: CoverageTier) => {
    switch (tier) {
      case 'Complete/High Coverage':
        return 'bg-emerald-600 text-white hover:bg-emerald-700';
      case 'Partial Coverage':
        return 'bg-sky-600 text-white hover:bg-sky-700';
      case 'Limited Coverage':
        return 'bg-amber-500 text-white hover:bg-amber-600';
    }
  };

  return (
    <div className="bg-white rounded-gov border border-gov-border shadow-xs overflow-hidden">
      {/* Header */}
      <div className="bg-gov-navy text-white px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <Layers className="w-5 h-5 text-gov-gold" />
          <div>
            <h3 className="font-bold text-sm uppercase tracking-wide">
              National Data Coverage Map & Attribution Tiers
            </h3>
            <p className="text-[11px] text-slate-300">
              Coverage tier assessment based strictly on statutory district reporting completeness.
            </p>
          </div>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center space-x-1 text-xs">
          <button
            onClick={() => setSelectedTier('ALL')}
            className={`px-2.5 py-1 rounded font-medium transition-colors ${
              selectedTier === 'ALL' ? 'bg-white text-gov-navy font-bold' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            All States
          </button>
          <button
            onClick={() => setSelectedTier('Complete/High Coverage')}
            className={`px-2.5 py-1 rounded font-medium transition-colors ${
              selectedTier === 'Complete/High Coverage' ? 'bg-emerald-500 text-white font-bold' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Complete/High
          </button>
          <button
            onClick={() => setSelectedTier('Partial Coverage')}
            className={`px-2.5 py-1 rounded font-medium transition-colors ${
              selectedTier === 'Partial Coverage' ? 'bg-sky-500 text-white font-bold' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Partial
          </button>
          <button
            onClick={() => setSelectedTier('Limited Coverage')}
            className={`px-2.5 py-1 rounded font-medium transition-colors ${
              selectedTier === 'Limited Coverage' ? 'bg-amber-500 text-white font-bold' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Limited
          </button>
        </div>
      </div>

      {/* Mandatory Statutory Note */}
      <div className="bg-blue-50/70 border-b border-blue-200 px-4 py-2 text-[11px] text-blue-900 flex items-center space-x-2">
        <Info className="w-4 h-4 text-blue-700 shrink-0" />
        <span>
          <strong>Strict Statutory Verification Standard:</strong> A State is <em>never</em> categorized as "Complete" unless &gt;80% of its administrative districts have active digital reporting across both completed works and ongoing expenditure ledgers.
        </span>
      </div>

      {/* Grid view: State Cards + Detail Sidepanel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 p-4 gap-4">
        {/* State Tiles Grid */}
        <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[380px] overflow-y-auto pr-1">
          {filteredStates.map((st) => (
            <button
              key={st.state_code}
              onClick={() => setActiveState(st)}
              className={`text-left p-2.5 rounded border transition-all text-xs flex flex-col justify-between ${
                activeState?.state_code === st.state_code
                  ? 'border-gov-navy bg-slate-50 ring-2 ring-gov-navy/20 shadow-xs'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-1">
                  <span className="font-bold text-slate-900 truncate">{st.state_name}</span>
                  <span className="text-[10px] text-slate-400 font-mono">#{st.state_code}</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  {st.districts_count} Districts
                </div>
              </div>

              <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className={`text-[10px] px-1.5 py-0.5 rounded border font-semibold ${getTierBadge(st.coverage_tier)}`}>
                  {st.coverage_tier.split(' ')[0]}
                </span>
                <span className="text-[11px] font-mono font-bold text-slate-700">
                  {st.total_works.toLocaleString()} works
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* State Detail Inspection Panel */}
        <div className="bg-slate-50 rounded-gov border border-slate-200 p-4 flex flex-col justify-between text-xs text-slate-700">
          {activeState ? (
            <div className="space-y-3">
              <div className="border-b border-slate-200 pb-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase text-slate-500">LGD Code {activeState.state_code}</span>
                  <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${getTierBadge(activeState.coverage_tier)}`}>
                    {activeState.coverage_tier}
                  </span>
                </div>
                <h4 className="font-black text-base text-slate-900 mt-1">
                  {activeState.state_name}
                </h4>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between py-1 border-b border-slate-100 text-xs">
                  <span className="text-slate-500">Total Project Records:</span>
                  <strong className="font-mono text-slate-900">{activeState.total_works.toLocaleString()}</strong>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 text-xs">
                  <span className="text-slate-500">Districts Reporting:</span>
                  <strong className="font-mono text-slate-900">{activeState.districts_count} Districts</strong>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 text-xs">
                  <span className="text-slate-500">Recorded Disbursements:</span>
                  <strong className="font-mono text-emerald-700">
                    ₹{(activeState.total_expenditure_inr / 10000000).toFixed(2)} Cr
                  </strong>
                </div>
              </div>

              <div className="bg-white p-3 rounded border border-slate-200 mt-2">
                <span className="font-bold text-slate-900 text-[11px] uppercase tracking-wide block mb-1">
                  Coverage Audit Criteria
                </span>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  {activeState.criteria_notes}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400">
              Select a state to inspect official data coverage criteria.
            </div>
          )}

          <div className="pt-3 border-t border-slate-200 text-[10px] text-slate-500 flex items-center space-x-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Integrated with Ministry of Statistics (MoSPI) Public e-SAKSHI Repository</span>
          </div>
        </div>
      </div>
    </div>
  );
};
