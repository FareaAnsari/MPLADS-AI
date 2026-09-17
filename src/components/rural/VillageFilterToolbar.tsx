import React, { useState, useMemo } from 'react';
import { LGDVillage, VillageFilterState } from '../../types/rural';
import { Filter, RotateCcw, ChevronDown, ChevronUp, SlidersHorizontal } from 'lucide-react';

interface Props {
  villages: LGDVillage[];
  filters: VillageFilterState;
  onFilterChange: (newFilters: VillageFilterState) => void;
  onReset: () => void;
}

export const VillageFilterToolbar: React.FC<Props> = ({
  villages,
  filters,
  onFilterChange,
  onReset
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Derive unique options dynamically from loaded dataset
  const states = useMemo(() => Array.from(new Set(villages.map(v => v.state))).sort(), [villages]);
  
  const districts = useMemo(() => {
    const subset = filters.state !== 'All States' ? villages.filter(v => v.state === filters.state) : villages;
    return Array.from(new Set(subset.map(v => v.district))).sort();
  }, [villages, filters.state]);

  const subDistricts = useMemo(() => {
    let subset = villages;
    if (filters.state !== 'All States') subset = subset.filter(v => v.state === filters.state);
    if (filters.district !== 'All Districts') subset = subset.filter(v => v.district === filters.district);
    return Array.from(new Set(subset.map(v => v.subDistrict))).sort();
  }, [villages, filters.state, filters.district]);

  const villageOptions = useMemo(() => {
    let subset = villages;
    if (filters.state !== 'All States') subset = subset.filter(v => v.state === filters.state);
    if (filters.district !== 'All Districts') subset = subset.filter(v => v.district === filters.district);
    if (filters.subDistrict !== 'All Blocks') subset = subset.filter(v => v.subDistrict === filters.subDistrict);
    return Array.from(new Set(subset.map(v => v.villageName))).sort();
  }, [villages, filters.state, filters.district, filters.subDistrict]);

  const mps = useMemo(() => Array.from(new Set(villages.map(v => v.mpName))).filter(Boolean).sort(), [villages]);
  const constituencies = useMemo(() => Array.from(new Set(villages.map(v => v.constituency))).filter(Boolean).sort(), [villages]);

  const sectors = useMemo(() => {
    const set = new Set<string>();
    villages.forEach(v => v.sectorsPresent.forEach(s => set.add(s)));
    return Array.from(set).sort();
  }, [villages]);

  const update = (key: keyof VillageFilterState, value: any) => {
    const updated = { ...filters, [key]: value };
    // Cascading resets
    if (key === 'state') {
      updated.district = 'All Districts';
      updated.subDistrict = 'All Blocks';
      updated.village = 'All Villages';
    } else if (key === 'district') {
      updated.subDistrict = 'All Blocks';
      updated.village = 'All Villages';
    } else if (key === 'subDistrict') {
      updated.village = 'All Villages';
    }
    onFilterChange(updated);
  };

  const hasActiveFilters = 
    filters.state !== 'All States' ||
    filters.district !== 'All Districts' ||
    filters.subDistrict !== 'All Blocks' ||
    filters.village !== 'All Villages' ||
    filters.mp !== 'All MPs' ||
    filters.constituency !== 'All Constituencies' ||
    filters.sector !== 'All Sectors' ||
    filters.status !== 'All Statuses' ||
    filters.year !== 'All Years' ||
    filters.riskLevel !== 'All Risks' ||
    filters.minProjects > 0 ||
    filters.maxProjects < 100 ||
    filters.minExpenditure > 0 ||
    filters.maxExpenditure < 100000000;

  return (
    <div className="bg-white rounded-gov border border-gov-border shadow-gov p-3.5 space-y-3">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="flex items-center space-x-2 text-xs font-bold text-gov-navy uppercase tracking-wider">
          <Filter className="w-3.5 h-3.5" />
          <span>Multi-Tier Administrative & Analytic Filters</span>
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
            <span>{showAdvanced ? 'Hide Extended Filters' : 'More Filters'}</span>
            {showAdvanced ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* Primary 4-Tier Administrative Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-xs">
        
        {/* State */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 mb-1">State</label>
          <select
            value={filters.state}
            onChange={(e) => update('state', e.target.value)}
            className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-gov-navy focus:outline-none bg-white text-slate-800"
          >
            <option value="All States">All States</option>
            {states.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* District */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 mb-1">District</label>
          <select
            value={filters.district}
            onChange={(e) => update('district', e.target.value)}
            className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-gov-navy focus:outline-none bg-white text-slate-800"
          >
            <option value="All Districts">All Districts</option>
            {districts.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        {/* Sub-District / Block */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 mb-1">Block / Taluka / Tehsil</label>
          <select
            value={filters.subDistrict}
            onChange={(e) => update('subDistrict', e.target.value)}
            className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-gov-navy focus:outline-none bg-white text-slate-800"
          >
            <option value="All Blocks">All Blocks / Sub-Districts</option>
            {subDistricts.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>

        {/* Village Selection */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 mb-1">Village</label>
          <select
            value={filters.village}
            onChange={(e) => update('village', e.target.value)}
            className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-gov-navy focus:outline-none bg-white text-slate-800"
          >
            <option value="All Villages">All Villages ({villageOptions.length})</option>
            {villageOptions.map((v) => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        </div>

      </div>

      {/* Extended Filters (collapsible or toggleable) */}
      {showAdvanced && (
        <div className="pt-2 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-xs animate-fadeIn">
          
          {/* MP */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Hon'ble MP</label>
            <select
              value={filters.mp}
              onChange={(e) => update('mp', e.target.value)}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-gov-navy focus:outline-none bg-white text-slate-800"
            >
              <option value="All MPs">All MPs</option>
              {mps.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          {/* Constituency */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Constituency</label>
            <select
              value={filters.constituency}
              onChange={(e) => update('constituency', e.target.value)}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-gov-navy focus:outline-none bg-white text-slate-800"
            >
              <option value="All Constituencies">All Constituencies</option>
              {constituencies.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Sector */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Sector (MoSPI Guidelines)</label>
            <select
              value={filters.sector}
              onChange={(e) => update('sector', e.target.value)}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-gov-navy focus:outline-none bg-white text-slate-800"
            >
              <option value="All Sectors">All Sectors</option>
              {sectors.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Project Status */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Project Status Indicator</label>
            <select
              value={filters.status}
              onChange={(e) => update('status', e.target.value)}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-gov-navy focus:outline-none bg-white text-slate-800"
            >
              <option value="All Statuses">All Work Statuses</option>
              <option value="COMPLETED">Completed Works</option>
              <option value="IN PROGRESS">In Progress</option>
              <option value="DELAYED">Delayed Works</option>
              <option value="ZERO_PROJECTS">0 Recorded Projects</option>
            </select>
          </div>

          {/* Project Year */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Project Year</label>
            <select
              value={filters.year}
              onChange={(e) => update('year', e.target.value)}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-gov-navy focus:outline-none bg-white text-slate-800"
            >
              <option value="All Years">All Recorded Years</option>
              <option value="2025">2025</option>
              <option value="2024">2024</option>
              <option value="2023">2023</option>
            </select>
          </div>

          {/* Risk Level */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Risk Level</label>
            <select
              value={filters.riskLevel}
              onChange={(e) => update('riskLevel', e.target.value)}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-gov-navy focus:outline-none bg-white text-slate-800"
            >
              <option value="All Risks">All Risk Profiles</option>
              <option value="HIGH">High Risk Only (Score ≥ 70)</option>
              <option value="MEDIUM">Medium Risk</option>
              <option value="LOW">Low Risk</option>
            </select>
          </div>

          {/* Min / Max Project Count */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Min / Max Works Count</label>
            <div className="flex items-center space-x-1.5">
              <input
                type="number"
                min={0}
                max={50}
                value={filters.minProjects}
                onChange={(e) => update('minProjects', parseInt(e.target.value) || 0)}
                placeholder="Min"
                className="w-1/2 px-2 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-gov-navy focus:outline-none text-xs"
              />
              <span className="text-slate-400">–</span>
              <input
                type="number"
                min={0}
                max={50}
                value={filters.maxProjects}
                onChange={(e) => update('maxProjects', parseInt(e.target.value) || 100)}
                placeholder="Max"
                className="w-1/2 px-2 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-gov-navy focus:outline-none text-xs"
              />
            </div>
          </div>

          {/* Min / Max Expenditure in Lakhs */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Max Expenditure (₹ Lakh)</label>
            <input
              type="number"
              min={0}
              step={5}
              value={filters.maxExpenditure ? Math.round(filters.maxExpenditure / 100000) : 1000}
              onChange={(e) => update('maxExpenditure', (parseInt(e.target.value) || 1000) * 100000)}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-gov-navy focus:outline-none text-xs"
            />
          </div>

        </div>
      )}
    </div>
  );
};
