import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  getLGDVillages, 
  isRuralDemoModeActive,
  DEMO_BENCHMARK_PROVENANCE,
  OFFICIAL_LIVE_PROVENANCE 
} from '../data/ruralVillageData';
import { LGDVillage, VillageFilterState } from '../types/rural';
import { VillageLeafletMap } from '../components/rural/VillageLeafletMap';
import { VillageTable } from '../components/rural/VillageTable';
import { VillageFilterToolbar } from '../components/rural/VillageFilterToolbar';
import { VillageComparisonModal } from '../components/rural/VillageComparisonModal';
import { DataProvenanceBadge } from '../components/rural/DataProvenanceBadge';
import { MissingDataNotice } from '../components/rural/MissingDataNotice';
import { Map, List, Compass, Layers, Building } from 'lucide-react';

export const VillageExplorerPage: React.FC = () => {
  const navigate = useNavigate();
  const [demoMode, setDemoMode] = useState<boolean>(isRuralDemoModeActive());

  useEffect(() => {
    const handleModeChange = () => setDemoMode(isRuralDemoModeActive());
    window.addEventListener('rural-demo-mode-changed', handleModeChange);
    return () => window.removeEventListener('rural-demo-mode-changed', handleModeChange);
  }, []);

  const [activeTab, setActiveTab] = useState<'both' | 'map' | 'table'>('both');
  const [selectedVillagesForComparison, setSelectedVillagesForComparison] = useState<LGDVillage[]>([]);
  const [comparisonModalOpen, setComparisonModalOpen] = useState(false);

  const initialFilters: VillageFilterState = {
    state: 'All States',
    district: 'All Districts',
    subDistrict: 'All Blocks',
    village: 'All Villages',
    mp: 'All MPs',
    constituency: 'All Constituencies',
    sector: 'All Sectors',
    status: 'All Statuses',
    year: 'All Years',
    riskLevel: 'All Risks',
    minProjects: 0,
    maxProjects: 100,
    minExpenditure: 0,
    maxExpenditure: 100000000
  };

  const [filters, setFilters] = useState<VillageFilterState>(initialFilters);

  const rawVillages = useMemo(() => getLGDVillages(demoMode), [demoMode]);

  const filteredVillages = useMemo(() => {
    return rawVillages.filter(v => {
      if (filters.state !== 'All States' && v.state !== filters.state) return false;
      if (filters.district !== 'All Districts' && v.district !== filters.district) return false;
      if (filters.subDistrict !== 'All Blocks' && v.subDistrict !== filters.subDistrict) return false;
      if (filters.village !== 'All Villages' && v.villageName !== filters.village) return false;
      if (filters.mp !== 'All MPs' && v.mpName !== filters.mp) return false;
      if (filters.constituency !== 'All Constituencies' && v.constituency !== filters.constituency) return false;
      if (filters.sector !== 'All Sectors' && !v.sectorsPresent.includes(filters.sector)) return false;
      if (v.projectCount < filters.minProjects || v.projectCount > filters.maxProjects) return false;
      return true;
    });
  }, [rawVillages, filters]);

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
              Geospatial & Administrative Explorer
            </span>
            <DataProvenanceBadge provenance={demoMode ? DEMO_BENCHMARK_PROVENANCE : OFFICIAL_LIVE_PROVENANCE} />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-gov-navy tracking-tight mt-1">
            Village Explorer & Interactive Registry
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Geographic exploration of verified Local Government Directory (LGD) units and linked MPLADS assets.
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center space-x-1 bg-slate-200 p-0.5 rounded text-xs font-semibold text-slate-700">
          <button
            onClick={() => setActiveTab('both')}
            className={`px-3 py-1 rounded transition ${activeTab === 'both' ? 'bg-white text-gov-navy shadow-xs font-bold' : 'hover:text-slate-900'}`}
          >
            Split View
          </button>
          <button
            onClick={() => setActiveTab('map')}
            className={`px-3 py-1 rounded transition ${activeTab === 'map' ? 'bg-white text-gov-navy shadow-xs font-bold' : 'hover:text-slate-900'}`}
          >
            Map Only
          </button>
          <button
            onClick={() => setActiveTab('table')}
            className={`px-3 py-1 rounded transition ${activeTab === 'table' ? 'bg-white text-gov-navy shadow-xs font-bold' : 'hover:text-slate-900'}`}
          >
            Table Only
          </button>
        </div>
      </div>

      {!demoMode && rawVillages.length === 0 ? (
        <MissingDataNotice onEnableDemoMode={() => setDemoMode(true)} />
      ) : (
        <>
          {/* Filters */}
          <VillageFilterToolbar
            villages={rawVillages}
            filters={filters}
            onFilterChange={setFilters}
            onReset={() => setFilters(initialFilters)}
          />

          {/* Map View if active */}
          {(activeTab === 'both' || activeTab === 'map') && (
            <div className="space-y-1.5">
              <VillageLeafletMap
                villages={filteredVillages}
                onSelectVillage={(v) => navigate(`/village/${v.id}`)}
              />
            </div>
          )}

          {/* Table View if active */}
          {(activeTab === 'both' || activeTab === 'table') && (
            <div className="space-y-1.5">
              <VillageTable
                villages={filteredVillages}
                selectedVillagesForComparison={selectedVillagesForComparison}
                onToggleCompare={handleToggleCompare}
                onOpenComparisonModal={() => setComparisonModalOpen(true)}
              />
            </div>
          )}
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
