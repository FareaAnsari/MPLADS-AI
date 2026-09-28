import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  getLGDVillages, 
  isRuralDemoModeActive, 
  DEMO_BENCHMARK_PROVENANCE, 
  OFFICIAL_LIVE_PROVENANCE 
} from '../data/ruralVillageData';
import { LGDVillage } from '../types/rural';
import { VillageTable } from '../components/rural/VillageTable';
import { VillageComparisonModal } from '../components/rural/VillageComparisonModal';
import { DataProvenanceBadge } from '../components/rural/DataProvenanceBadge';
import { MissingDataNotice } from '../components/rural/MissingDataNotice';
import { 
  Building2, 
  Info, 
  AlertTriangle, 
  Layers, 
  ChevronRight, 
  Scale, 
  CheckCircle2, 
  HelpCircle 
} from 'lucide-react';

type LowCountTier = 'all' | 'zero' | '1-2' | '3-5';

export const VillagePriorityPage: React.FC = () => {
  const navigate = useNavigate();
  const [demoMode, setDemoMode] = useState<boolean>(isRuralDemoModeActive());
  const [selectedTier, setSelectedTier] = useState<LowCountTier>('zero');
  const [selectedVillagesForComparison, setSelectedVillagesForComparison] = useState<LGDVillage[]>([]);
  const [comparisonModalOpen, setComparisonModalOpen] = useState(false);

  const rawVillages = useMemo(() => getLGDVillages(demoMode), [demoMode]);

  // Filter based strictly on project count tiers
  const filteredVillages = useMemo(() => {
    return rawVillages.filter(v => {
      if (selectedTier === 'zero') return v.projectCount === 0;
      if (selectedTier === '1-2') return v.projectCount >= 1 && v.projectCount <= 2;
      if (selectedTier === '3-5') return v.projectCount >= 3 && v.projectCount <= 5;
      return true;
    });
  }, [rawVillages, selectedTier]);

  // Counts for each tier
  const tierCounts = useMemo(() => {
    let zero = 0, oneToTwo = 0, threeToFive = 0;
    rawVillages.forEach(v => {
      if (v.projectCount === 0) zero++;
      else if (v.projectCount <= 2) oneToTwo++;
      else if (v.projectCount <= 5) threeToFive++;
    });
    return { zero, oneToTwo, threeToFive, all: rawVillages.length };
  }, [rawVillages]);

  const handleToggleCompare = (village: LGDVillage) => {
    if (selectedVillagesForComparison.some(v => v.id === village.id)) {
      setSelectedVillagesForComparison(prev => prev.filter(v => v.id !== village.id));
    } else {
      if (selectedVillagesForComparison.length >= 5) {
        alert('You can compare up to 5 villages.');
        return;
      }
      setSelectedVillagesForComparison(prev => [...prev, village]);
    }
  };

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-4 space-y-4">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gov-border pb-3">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-gov-navy text-white">
              Descriptive Work Distribution
            </span>
            <DataProvenanceBadge provenance={demoMode ? DEMO_BENCHMARK_PROVENANCE : OFFICIAL_LIVE_PROVENANCE} />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-gov-navy tracking-tight mt-1">
            Villages with Fewer Recorded MPLADS Works
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Transparent descriptive inquiry based strictly on recorded project counts in the available MPLADS dataset.
          </p>
        </div>

        <button
          onClick={() => navigate('/rural-intelligence')}
          className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded shadow-xs"
        >
          View Full Rural Dashboard
        </button>
      </div>

      {!demoMode && rawVillages.length === 0 ? (
        <MissingDataNotice onEnableDemoMode={() => setDemoMode(true)} />
      ) : (
        <>
          {/* Methodology & Non-Pejorative Directive Box */}
          <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-gov text-xs text-amber-950 space-y-2 leading-relaxed">
            <div className="flex items-center space-x-2 font-bold text-amber-900 text-sm">
              <Info className="w-4 h-4 text-amber-700 shrink-0" />
              <span>Transparent Methodology: Low Recorded Project Count</span>
            </div>
            <p>
              <strong>"This is a descriptive measure based only on recorded MPLADS works. It is not a measure of overall village development."</strong>
            </p>
            <p className="text-[11px] text-amber-900/90">
              In public financial governance, MPLADS constitutes only one among numerous central and state funding windows. A village with 0 or 1 recorded MPLADS project may have received substantial developmental investment under schemes such as the Pradhan Mantri Gram Sadak Yojana (PMGSY), Jal Jeevan Mission (JJM), Samagra Shiksha, National Rural Health Mission, or state infrastructure funds. These counts are analytical indicators for inquiry and do not imply neglect or administrative deficit.
            </p>
          </div>

          {/* Tier Selection Pills */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              onClick={() => setSelectedTier('zero')}
              className={`px-3.5 py-2 rounded text-xs font-bold transition flex items-center space-x-2 ${
                selectedTier === 'zero'
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
              }`}
            >
              <span>0 Recorded Projects</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] ${selectedTier === 'zero' ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-700'}`}>
                {tierCounts.zero}
              </span>
            </button>

            <button
              onClick={() => setSelectedTier('1-2')}
              className={`px-3.5 py-2 rounded text-xs font-bold transition flex items-center space-x-2 ${
                selectedTier === '1-2'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
              }`}
            >
              <span>1–2 Recorded Projects (Low Count)</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] ${selectedTier === '1-2' ? 'bg-amber-700 text-white' : 'bg-amber-100 text-amber-900'}`}>
                {tierCounts.oneToTwo}
              </span>
            </button>

            <button
              onClick={() => setSelectedTier('3-5')}
              className={`px-3.5 py-2 rounded text-xs font-bold transition flex items-center space-x-2 ${
                selectedTier === '3-5'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
              }`}
            >
              <span>3–5 Recorded Projects</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] ${selectedTier === '3-5' ? 'bg-blue-700 text-white' : 'bg-blue-100 text-blue-900'}`}>
                {tierCounts.threeToFive}
              </span>
            </button>

            <button
              onClick={() => setSelectedTier('all')}
              className={`px-3.5 py-2 rounded text-xs font-bold transition flex items-center space-x-2 ${
                selectedTier === 'all'
                  ? 'bg-gov-navy text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
              }`}
            >
              <span>All Recorded Villages</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] ${selectedTier === 'all' ? 'bg-blue-900 text-white' : 'bg-slate-100 text-slate-700'}`}>
                {tierCounts.all}
              </span>
            </button>
          </div>

          {/* Filtered Table */}
          <VillageTable
            villages={filteredVillages}
            selectedVillagesForComparison={selectedVillagesForComparison}
            onToggleCompare={handleToggleCompare}
            onOpenComparisonModal={() => setComparisonModalOpen(true)}
          />
        </>
      )}

      {/* Comparison Modal */}
      <VillageComparisonModal
        isOpen={comparisonModalOpen}
        onClose={() => setComparisonModalOpen(false)}
        villages={selectedVillagesForComparison}
        onRemoveVillage={(id) => setSelectedVillagesForComparison(prev => prev.filter(v => v.id !== id))}
      />

    </div>
  );
};
