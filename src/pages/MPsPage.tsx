import React, { useState, useMemo } from 'react';
import { ALL_MPS_DATA, MPDetail } from '../data/mpsData';
import { 
  Award, 
  Search, 
  MapPin, 
  ChevronLeft, 
  ChevronRight,
  IndianRupee,
  ShieldCheck,
  Building2,
  ExternalLink
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SEOHead } from '../components/SEOHead';

export const MPsPage: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [houseFilter, setHouseFilter] = useState<'All' | 'Lok Sabha' | 'Rajya Sabha'>('All');
  const [selectedState, setSelectedState] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'amount-desc' | 'amount-asc' | 'name-asc' | 'state-asc'>('amount-desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 18;

  // Extract unique states for filter dropdown
  const allStates = useMemo(() => {
    const statesSet = new Set<string>();
    ALL_MPS_DATA.forEach(mp => {
      if (mp.state) statesSet.add(mp.state);
    });
    return Array.from(statesSet).sort();
  }, []);

  // Filtered and sorted MPs
  const filteredMPs = useMemo(() => {
    const q = search.toLowerCase().trim();
    let result = ALL_MPS_DATA.filter(mp => {
      const matchSearch = !q ||
        mp.name.toLowerCase().includes(q) ||
        mp.constituency.toLowerCase().includes(q) ||
        mp.state.toLowerCase().includes(q);
      
      const matchHouse = houseFilter === 'All' || mp.house === houseFilter;
      const matchState = selectedState === 'All' || mp.state === selectedState;

      return matchSearch && matchHouse && matchState;
    });

    result.sort((a, b) => {
      if (sortBy === 'amount-desc') {
        return b.allocatedAmountRaw - a.allocatedAmountRaw;
      }
      if (sortBy === 'amount-asc') {
        return a.allocatedAmountRaw - b.allocatedAmountRaw;
      }
      if (sortBy === 'name-asc') {
        return a.name.localeCompare(b.name);
      }
      if (sortBy === 'state-asc') {
        return a.state.localeCompare(b.state);
      }
      return 0;
    });

    return result;
  }, [search, houseFilter, selectedState, sortBy]);

  // Pagination slicing
  const totalPages = Math.ceil(filteredMPs.length / itemsPerPage) || 1;
  const paginatedMPs = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredMPs.slice(start, start + itemsPerPage);
  }, [filteredMPs, currentPage, itemsPerPage]);

  const lokSabhaCount = useMemo(() => ALL_MPS_DATA.filter(m => m.house === 'Lok Sabha').length, []);
  const rajyaSabhaCount = useMemo(() => ALL_MPS_DATA.filter(m => m.house === 'Rajya Sabha').length, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 space-y-5">
      <SEOHead
        title="Members of Parliament (MPs) Official Directory | MPLADS-AI"
        description="National parliamentary directory of Hon'ble Lok Sabha and Rajya Sabha Members of Parliament with MPLADS entitlement, recommended works, and fund utilization tracking."
        canonicalPath="/mps"
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'MPs Directory', url: '/mps' }
        ]}
      />
      {/* Title & Stats Ribbon */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gov-border">
        <div>
          <div className="flex items-center space-x-2">
            <Award className="w-6 h-6 text-gov-navy" />
            <h1 className="text-xl sm:text-2xl font-bold text-gov-navy tracking-tight">
              Hon'ble Members of Parliament (MPs) Official Directory
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Single Source of Truth: Ministry of Statistics & Programme Implementation (MoSPI) e-SAKSHI Allocation Registers.
          </p>
        </div>

        {/* Official Dataset Counts */}
        <div className="flex items-center gap-2">
          <div className="bg-white px-3 py-1.5 rounded-gov border border-gov-border shadow-xs text-center">
            <span className="text-[10px] text-slate-500 font-medium block">Total Hon'ble MPs</span>
            <span className="text-sm font-bold text-gov-navy">{ALL_MPS_DATA.length}</span>
          </div>
          <div className="bg-white px-3 py-1.5 rounded-gov border border-gov-border shadow-xs text-center">
            <span className="text-[10px] text-slate-500 font-medium block">Lok Sabha</span>
            <span className="text-sm font-bold text-blue-700">{lokSabhaCount}</span>
          </div>
          <div className="bg-white px-3 py-1.5 rounded-gov border border-gov-border shadow-xs text-center">
            <span className="text-[10px] text-slate-500 font-medium block">Rajya Sabha</span>
            <span className="text-sm font-bold text-emerald-700">{rajyaSabhaCount}</span>
          </div>
        </div>
      </div>

      {/* Control Bar: Search & Filter Tabs */}
      <div className="bg-white p-3.5 rounded-gov border border-gov-border shadow-gov space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          
          {/* Search Box */}
          <div className="md:col-span-4 relative">
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search MP Name, Constituency, or State..."
              className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-gov-navy focus:outline-none bg-slate-50/50"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
          </div>

          {/* House Filter Tabs */}
          <div className="md:col-span-3 flex items-center bg-slate-100 p-1 rounded-md">
            <button
              onClick={() => { setHouseFilter('All'); setCurrentPage(1); }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded transition ${houseFilter === 'All' ? 'bg-white text-gov-navy shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
            >
              All ({ALL_MPS_DATA.length})
            </button>
            <button
              onClick={() => { setHouseFilter('Lok Sabha'); setCurrentPage(1); }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded transition ${houseFilter === 'Lok Sabha' ? 'bg-white text-gov-navy shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Lok Sabha ({lokSabhaCount})
            </button>
            <button
              onClick={() => { setHouseFilter('Rajya Sabha'); setCurrentPage(1); }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded transition ${houseFilter === 'Rajya Sabha' ? 'bg-white text-gov-navy shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Rajya Sabha ({rajyaSabhaCount})
            </button>
          </div>

          {/* State Dropdown */}
          <div className="md:col-span-3">
            <select
              value={selectedState}
              onChange={(e) => {
                setSelectedState(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full border border-slate-300 rounded px-2.5 py-2 text-xs focus:ring-1 focus:ring-gov-navy focus:outline-none bg-slate-50/50 text-slate-700 font-medium"
            >
              <option value="All">All States / UTs ({allStates.length})</option>
              {allStates.map(st => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>

          {/* Sort Dropdown */}
          <div className="md:col-span-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full border border-slate-300 rounded px-2 py-2 text-xs focus:ring-1 focus:ring-gov-navy focus:outline-none bg-slate-50/50 text-slate-700 font-medium"
            >
              <option value="amount-desc">Allocation (High to Low)</option>
              <option value="amount-asc">Allocation (Low to High)</option>
              <option value="name-asc">MP Name (A to Z)</option>
              <option value="state-asc">State (A to Z)</option>
            </select>
          </div>

        </div>

        {/* Filter Summary */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
          <span>Showing <strong>{filteredMPs.length}</strong> matching MPs from official dataset</span>
          <span>Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong></span>
        </div>
      </div>

      {/* MP Grid (776 MPs across all 36 States & UTs) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {paginatedMPs.map((mp) => (
          <div 
            key={mp.id} 
            onClick={() => navigate(`/mps/${mp.id}`)}
            className="bg-white rounded-gov border border-gov-border p-4 shadow-gov hover:shadow-md hover:border-gov-blue/50 transition cursor-pointer flex flex-col justify-between space-y-3 group"
          >
            <div>
              {/* Top Row: User Avatar, Name, Constituency and House Tag */}
              <div className="flex items-start justify-between gap-2.5">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 leading-snug group-hover:text-gov-blue transition line-clamp-1">
                      {mp.name}
                    </h3>
                    <div className="flex items-center space-x-1 text-xs text-slate-500 mt-0.5">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="font-medium line-clamp-1">{mp.constituency}, {mp.state}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                    mp.house === 'Lok Sabha' 
                      ? 'bg-blue-50 text-blue-800 border-blue-200' 
                      : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  }`}>
                    {mp.house}
                  </span>
                </div>
              </div>

              {/* Allocation & Expenditure Key Metrics */}
              <div className="mt-3.5 bg-slate-50/90 p-3 rounded-md border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Official Allocated Limit:</span>
                  <span className="font-bold text-slate-900 font-mono text-sm">₹ {mp.allocatedAmountCr} Cr</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Recorded Expenditure:</span>
                  <span className="font-bold text-emerald-800 font-mono text-xs">₹ {mp.recordedExpenditureCr} Cr</span>
                </div>
                <div className="text-[10.5px] text-slate-500 pt-1 border-t border-slate-200/60 flex items-center justify-between">
                  <span>Category / Election Status:</span>
                  <span className="font-medium text-slate-800">{mp.category}</span>
                </div>
              </div>

              {/* Uncompleted Works Warning Banner */}
              <div className="mt-2.5 bg-amber-50/80 p-2 rounded border border-amber-200 text-[10.5px] text-amber-900 flex items-center justify-between">
                <span className="line-clamp-1">
                  <strong>₹{mp.uncompletedSpendCr} CR</strong> on ongoing works
                </span>
                <span className={`font-bold ml-1 shrink-0 ${
                  mp.fundUtilizationPercent >= 75 
                    ? 'text-emerald-700' 
                    : mp.fundUtilizationPercent >= 40 
                    ? 'text-amber-700' 
                    : 'text-red-600'
                }`}>
                  {mp.fundUtilizationPercent.toFixed(1)}% Utilized
                </span>
              </div>
            </div>

            {/* Card Footer Actions */}
            <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-[11px] text-slate-400 font-mono">ID: {mp.id}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/mps/${mp.id}`);
                }}
                className="text-gov-blue hover:text-gov-navy font-bold text-xs flex items-center space-x-1 group/btn"
              >
                <span>View MP Dashboard</span>
                <ChevronRight className="w-3.5 h-3.5 transition group-hover/btn:translate-x-0.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Bar */}
      {totalPages > 1 && (
        <div className="bg-white p-3 rounded-gov border border-gov-border shadow-xs flex items-center justify-between">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="flex items-center space-x-1 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <span className="text-xs text-slate-600 font-medium">
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="flex items-center space-x-1 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
