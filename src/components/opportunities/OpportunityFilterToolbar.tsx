import React, { useState, useMemo } from 'react';
import { OpportunityRecord, OpportunityFilterState } from '../../types/contractorOpportunity';
import { Filter, RotateCcw, ChevronDown, ChevronUp, SlidersHorizontal } from 'lucide-react';

interface Props {
  records: OpportunityRecord[];
  filters: OpportunityFilterState;
  onFilterChange: (newFilters: OpportunityFilterState) => void;
  onReset: () => void;
}

export const OpportunityFilterToolbar: React.FC<Props> = ({
  records,
  filters,
  onFilterChange,
  onReset
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Dynamic distinct filter values
  const states = useMemo(() => Array.from(new Set(records.map(r => r.state))).sort(), [records]);
  
  const districts = useMemo(() => {
    const subset = filters.state !== 'All States' ? records.filter(r => r.state === filters.state) : records;
    return Array.from(new Set(subset.map(r => r.district))).sort();
  }, [records, filters.state]);

  const constituencies = useMemo(() => {
    const subset = filters.state !== 'All States' ? records.filter(r => r.state === filters.state) : records;
    return Array.from(new Set(subset.map(r => r.constituency))).sort();
  }, [records, filters.state]);

  const sectors = useMemo(() => Array.from(new Set(records.map(r => r.sector))).sort(), [records]);

  const sources = useMemo(() => {
    const set = new Set<string>();
    records.forEach(r => {
      if (r.officialSource) set.add(r.officialSource.source_type);
    });
    return Array.from(set).sort();
  }, [records]);

  const update = (key: keyof OpportunityFilterState, value: string) => {
    const updated = { ...filters, [key]: value };
    if (key === 'state') {
      updated.district = 'All Districts';
      updated.constituency = 'All Constituencies';
    }
    onFilterChange(updated);
  };

  const hasActiveFilters = 
    filters.state !== 'All States' ||
    filters.district !== 'All Districts' ||
    filters.constituency !== 'All Constituencies' ||
    filters.sector !== 'All Sectors' ||
    filters.projectStatus !== 'All Statuses' ||
    filters.procurementStatus !== 'All Procurement' ||
    filters.valueRange !== 'All Values' ||
    filters.officialSource !== 'All Sources' ||
    filters.recommendationDate !== '' ||
    filters.sanctionDate !== '' ||
    filters.tenderPublicationDate !== '' ||
    filters.tenderClosingDate !== '';

  return (
    <div className="bg-white rounded-gov border border-gov-border shadow-gov p-3.5 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="flex items-center space-x-2 text-xs font-bold text-gov-navy uppercase tracking-wider">
          <Filter className="w-3.5 h-3.5" />
          <span>Opportunity & Procurement Scrutiny Filters</span>
        </div>
        <div className="flex items-center space-x-2">
          {hasActiveFilters && (
            <button
              onClick={onReset}
              className="text-[11px] text-red-600 hover:text-red-800 font-semibold flex items-center space-x-1 px-2 py-0.5 rounded hover:bg-red-50 transition"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Filters</span>
            </button>
          )}
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-[11px] text-gov-navy font-semibold flex items-center space-x-1 px-2 py-0.5 rounded hover:bg-slate-100 transition"
          >
            <SlidersHorizontal className="w-3 h-3" />
            <span>{showAdvanced ? 'Hide Advanced Date Filters' : 'Advanced Filters'}</span>
            {showAdvanced ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* Primary Filters (State, District, Sector, Project Status, Procurement Status, Source) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-2 text-xs">
        
        {/* State */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 mb-1">State</label>
          <select
            value={filters.state}
            onChange={(e) => update('state', e.target.value)}
            className="w-full px-2 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-gov-navy focus:outline-none bg-white text-slate-800"
          >
            <option value="All States">All States</option>
            {states.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {/* District */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 mb-1">District</label>
          <select
            value={filters.district}
            onChange={(e) => update('district', e.target.value)}
            className="w-full px-2 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-gov-navy focus:outline-none bg-white text-slate-800"
          >
            <option value="All Districts">All Districts</option>
            {districts.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        {/* Sector */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 mb-1">Sector</label>
          <select
            value={filters.sector}
            onChange={(e) => update('sector', e.target.value)}
            className="w-full px-2 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-gov-navy focus:outline-none bg-white text-slate-800"
          >
            <option value="All Sectors">All Sectors</option>
            {sectors.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {/* Project Status (Strict 7-level system) */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 mb-1">Project Status</label>
          <select
            value={filters.projectStatus}
            onChange={(e) => update('projectStatus', e.target.value)}
            className="w-full px-2 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-gov-navy focus:outline-none bg-white text-slate-800 font-medium"
          >
            <option value="All Statuses">All Lifecycle Statuses</option>
            <option value="Tender Open">1. Tender Open (Active Bids)</option>
            <option value="Procurement/Tender Published">2. Procurement / Tender Published</option>
            <option value="Sanctioned">3. Sanctioned (Pre-tender)</option>
            <option value="Under Administrative Processing">4. Under Administrative Processing</option>
            <option value="Recommended">5. Recommended (Proposal)</option>
            <option value="Work in Progress">6. Work in Progress</option>
            <option value="Completed">7. Completed</option>
          </select>
        </div>

        {/* Value Range */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 mb-1">Project Value</label>
          <select
            value={filters.valueRange}
            onChange={(e) => update('valueRange', e.target.value)}
            className="w-full px-2 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-gov-navy focus:outline-none bg-white text-slate-800"
          >
            <option value="All Values">All Cost Ranges</option>
            <option value="under_10L">Under ₹10 Lakhs</option>
            <option value="10L_25L">₹10 Lakhs – ₹25 Lakhs</option>
            <option value="25L_50L">₹25 Lakhs – ₹50 Lakhs</option>
            <option value="above_50L">Above ₹50 Lakhs</option>
          </select>
        </div>

        {/* Official Source */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 mb-1">Official Portal Source</label>
          <select
            value={filters.officialSource}
            onChange={(e) => update('officialSource', e.target.value)}
            className="w-full px-2 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-gov-navy focus:outline-none bg-white text-slate-800"
          >
            <option value="All Sources">All Official Sources</option>
            <option value="CPPP">CPPP (eprocure.gov.in)</option>
            <option value="GeM">GeM (gem.gov.in)</option>
            <option value="State e-Procurement">State e-Procurement</option>
            <option value="MoSPI e-SAKSHI">MoSPI e-SAKSHI Release</option>
          </select>
        </div>

      </div>

      {/* Advanced Date Filters (Collapsible) */}
      {showAdvanced && (
        <div className="pt-2 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-xs animate-fadeIn">
          
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Constituency</label>
            <select
              value={filters.constituency}
              onChange={(e) => update('constituency', e.target.value)}
              className="w-full px-2 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-gov-navy focus:outline-none bg-white text-slate-800"
            >
              <option value="All Constituencies">All Constituencies</option>
              {constituencies.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Recommended After</label>
            <input
              type="date"
              value={filters.recommendationDate}
              onChange={(e) => update('recommendationDate', e.target.value)}
              className="w-full px-2 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-gov-navy focus:outline-none text-xs bg-white text-slate-800"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Tender Published After</label>
            <input
              type="date"
              value={filters.tenderPublicationDate}
              onChange={(e) => update('tenderPublicationDate', e.target.value)}
              className="w-full px-2 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-gov-navy focus:outline-none text-xs bg-white text-slate-800"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Bid Closing Before</label>
            <input
              type="date"
              value={filters.tenderClosingDate}
              onChange={(e) => update('tenderClosingDate', e.target.value)}
              className="w-full px-2 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-gov-navy focus:outline-none text-xs bg-white text-slate-800"
            />
          </div>

        </div>
      )}
    </div>
  );
};
