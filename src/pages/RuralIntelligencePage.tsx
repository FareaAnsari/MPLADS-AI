import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  getLGDVillages, 
  calculateRuralKPIs, 
  isRuralDemoModeActive, 
  setRuralDemoModeActive,
  OFFICIAL_LIVE_PROVENANCE,
  DEMO_BENCHMARK_PROVENANCE
} from '../data/ruralVillageData';
import { LGDVillage, VillageFilterState } from '../types/rural';
import { VillageKPICards } from '../components/rural/VillageKPICards';
import { VillageFilterToolbar } from '../components/rural/VillageFilterToolbar';
import { VillageLeafletMap } from '../components/rural/VillageLeafletMap';
import { VillageTable } from '../components/rural/VillageTable';
import { VillageComparisonModal } from '../components/rural/VillageComparisonModal';
import { SectorGapView } from '../components/rural/SectorGapView';
import { DataProvenanceBadge } from '../components/rural/DataProvenanceBadge';
import { MissingDataNotice } from '../components/rural/MissingDataNotice';
import { SEOHead } from '../components/SEOHead';
import { 
  Building2, 
  AlertCircle, 
  Info, 
  Sparkles, 
  Layers, 
  MapPin, 
  Scale, 
  CheckCircle2, 
  FileSpreadsheet, 
  RotateCcw,
  ExternalLink
} from 'lucide-react';

export const RuralIntelligencePage: React.FC = () => {
  const navigate = useNavigate();
  const [demoMode, setDemoMode] = useState<boolean>(isRuralDemoModeActive());

  // Listen for demo mode changes across components/tabs
  useEffect(() => {
    const handleModeChange = () => setDemoMode(isRuralDemoModeActive());
    window.addEventListener('rural-demo-mode-changed', handleModeChange);
    return () => window.removeEventListener('rural-demo-mode-changed', handleModeChange);
  }, []);

  // Filter State
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
  const [selectedVillagesForComparison, setSelectedVillagesForComparison] = useState<LGDVillage[]>([]);
  const [comparisonModalOpen, setComparisonModalOpen] = useState(false);

  // Raw dataset based on mode
  const rawVillages = useMemo(() => getLGDVillages(demoMode), [demoMode]);

  // Apply filters dynamically
  const filteredVillages = useMemo(() => {
    return rawVillages.filter(v => {
      if (filters.state !== 'All States' && v.state !== filters.state) return false;
      if (filters.district !== 'All Districts' && v.district !== filters.district) return false;
      if (filters.subDistrict !== 'All Blocks' && v.subDistrict !== filters.subDistrict) return false;
      if (filters.village !== 'All Villages' && v.villageName !== filters.village) return false;
      if (filters.mp !== 'All MPs' && v.mpName !== filters.mp) return false;
      if (filters.constituency !== 'All Constituencies' && v.constituency !== filters.constituency) return false;
      
      if (filters.sector !== 'All Sectors') {
        if (!v.sectorsPresent.includes(filters.sector)) return false;
      }

      if (filters.status !== 'All Statuses') {
        if (filters.status === 'ZERO_PROJECTS' && v.projectCount !== 0) return false;
        if (filters.status === 'COMPLETED' && v.completedCount === 0) return false;
        if (filters.status === 'IN PROGRESS' && v.ongoingCount === 0) return false;
        if (filters.status === 'DELAYED' && v.delayedCount === 0) return false;
      }

      if (filters.riskLevel !== 'All Risks') {
        if (filters.riskLevel === 'HIGH' && v.highRiskCount === 0) return false;
      }

      if (v.projectCount < filters.minProjects || v.projectCount > filters.maxProjects) return false;
      if (v.totalExpenditure < filters.minExpenditure || v.totalExpenditure > filters.maxExpenditure) return false;

      return true;
    });
  }, [rawVillages, filters]);

  // Dynamic KPIs calculated strictly from current filtered data
  const kpis = useMemo(() => calculateRuralKPIs(filteredVillages), [filteredVillages]);

  // Toggle village in comparison tray (max 5)
  const handleToggleCompare = (village: LGDVillage) => {
    if (selectedVillagesForComparison.some(v => v.id === village.id)) {
      setSelectedVillagesForComparison(prev => prev.filter(v => v.id !== village.id));
    } else {
      if (selectedVillagesForComparison.length >= 5) {
        alert('You can compare a maximum of 5 villages at a time.');
        return;
      }
      setSelectedVillagesForComparison(prev => [...prev, village]);
    }
  };

  const handleRemoveCompare = (villageId: string) => {
    setSelectedVillagesForComparison(prev => prev.filter(v => v.id !== villageId));
  };

  const toggleDemoMode = () => {
    const next = !demoMode;
    setRuralDemoModeActive(next);
    setDemoMode(next);
  };

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-4 space-y-5">
      <SEOHead
        title="Rural Village Development Intelligence | MPLADS-AI"
        description="Data-driven exploration of MPLADS developmental infrastructure works across rural villages, Local Government Directory (LGD) units, and gram panchayats."
        canonicalPath="/rural-intelligence"
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Rural Intelligence', url: '/rural-intelligence' }
        ]}
      />
      
      {/* 1. Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-gov-border pb-3">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-gov-navy text-white">
              Local Administrative Intelligence
            </span>
            <DataProvenanceBadge provenance={demoMode ? DEMO_BENCHMARK_PROVENANCE : OFFICIAL_LIVE_PROVENANCE} />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-gov-navy tracking-tight mt-1">
            Rural Village Development Intelligence
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Data-driven exploration of MPLADS works across rural villages and local administrative areas.
          </p>
        </div>

        {/* Mode Toggle Button */}
        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={toggleDemoMode}
            className={`px-3 py-1.5 rounded text-xs font-bold border transition flex items-center space-x-1.5 ${
              demoMode
                ? 'bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-gov-navy" />
            <span>{demoMode ? 'Mode: LGD Pilot Sample (Active)' : 'Mode: Official Live Dataset'}</span>
          </button>
          <button
            onClick={() => navigate('/village-data-quality')}
            className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold rounded shadow-xs"
          >
            Data Quality Audit
          </button>
        </div>
      </div>

      {/* 2. Prominent Information Banner (Strict Non-pejorative Directive) */}
      <div className="p-3.5 bg-blue-50/80 border-l-4 border-gov-navy rounded-r text-xs text-slate-800 space-y-1 shadow-xs">
        <div className="flex items-center space-x-2 font-bold text-gov-navy">
          <Info className="w-4 h-4 text-gov-navy shrink-0" />
          <span>Official Analytical Disclaimer & Governance Protocol</span>
        </div>
        <p className="leading-relaxed text-slate-700">
          "This module identifies villages with fewer recorded MPLADS works based on the currently available dataset. A low project count does not imply neglect, wrongdoing, or inadequate development. Results are analytical indicators and require contextual verification."
        </p>
      </div>

      {/* Demo Mode Alert Banner if Active */}
      {demoMode && (
        <div className="p-3 bg-amber-50 border border-amber-300 rounded text-xs text-amber-900 flex items-center justify-between gap-2 animate-fadeIn">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>DEMO / PILOT BENCHMARK MODE ACTIVE:</strong> Viewing a pilot sample of verified Local Government Directory (LGD) villages and linked works across Maharashtra, Bihar, Punjab, Uttar Pradesh, Rajasthan, Kerala, and Tamil Nadu for methodology demonstration.
            </span>
          </div>
          <button
            onClick={toggleDemoMode}
            className="text-[11px] underline font-bold hover:text-amber-950 shrink-0"
          >
            Switch to Live Dataset
          </button>
        </div>
      )}

      {/* If in Live Mode & raw data is empty, render the formal Missing Data notice */}
      {!demoMode && rawVillages.length === 0 ? (
        <MissingDataNotice onEnableDemoMode={() => setDemoMode(true)} />
      ) : (
        <>
          {/* 3. Village KPI Cards */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-gov-navy uppercase tracking-wider">
                Analytical Summary Indicators (Filtered View)
              </h2>
              <span className="text-[11px] text-slate-500">
                Calculated dynamically from {filteredVillages.length} administrative records
              </span>
            </div>
            <VillageKPICards kpis={kpis} />
          </div>

          {/* 4. Filter Toolbar */}
          <VillageFilterToolbar
            villages={rawVillages}
            filters={filters}
            onFilterChange={setFilters}
            onReset={() => setFilters(initialFilters)}
          />

          {/* 5. Village Interactive Leaflet Map */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-gov-navy" />
                <h2 className="text-xs font-bold text-gov-navy uppercase tracking-wider">
                  Interactive Geospatial Map (Leaflet + OpenStreetMap)
                </h2>
              </div>
              <span className="text-[11px] text-slate-500">
                Hierarchy: India → State → District → Village
              </span>
            </div>
            <VillageLeafletMap
              villages={filteredVillages}
              onSelectVillage={(v) => navigate(`/village/${v.id}`)}
            />
          </div>

          {/* 6. Sector Gap View Component */}
          <SectorGapView villages={filteredVillages} />

          {/* 7. Village Intelligence Table */}
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
        onRemoveVillage={handleRemoveCompare}
      />

    </div>
  );
};
