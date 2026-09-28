import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { LGDVillage } from '../../types/rural';
import { 
  Search, 
  ArrowUpDown, 
  ChevronRight, 
  SlidersHorizontal, 
  Scale, 
  MapPin, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  ShieldAlert,
  Download
} from 'lucide-react';

export type VillageSortOption = 
  | 'lowest_projects' 
  | 'highest_projects' 
  | 'highest_expenditure' 
  | 'most_delayed' 
  | 'highest_risk';

interface Props {
  villages: LGDVillage[];
  selectedVillagesForComparison: LGDVillage[];
  onToggleCompare: (village: LGDVillage) => void;
  onOpenComparisonModal: () => void;
  onSelectVillageForMap?: (village: LGDVillage) => void;
}

export const VillageTable: React.FC<Props> = ({
  villages,
  selectedVillagesForComparison,
  onToggleCompare,
  onOpenComparisonModal,
  onSelectVillageForMap
}) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<VillageSortOption>('lowest_projects');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Filter by local search query
  const searchedVillages = useMemo(() => {
    if (!searchQuery.trim()) return villages;
    const q = searchQuery.toLowerCase().trim();
    return villages.filter(v => 
      v.villageName.toLowerCase().includes(q) ||
      v.villageCode.includes(q) ||
      v.district.toLowerCase().includes(q) ||
      v.subDistrict.toLowerCase().includes(q) ||
      v.state.toLowerCase().includes(q) ||
      v.mpName.toLowerCase().includes(q)
    );
  }, [villages, searchQuery]);

  // Sort
  const sortedVillages = useMemo(() => {
    const list = [...searchedVillages];
    switch (sortBy) {
      case 'lowest_projects':
        return list.sort((a, b) => a.projectCount - b.projectCount || a.villageName.localeCompare(b.villageName));
      case 'highest_projects':
        return list.sort((a, b) => b.projectCount - a.projectCount || b.totalExpenditure - a.totalExpenditure);
      case 'highest_expenditure':
        return list.sort((a, b) => b.totalExpenditure - a.totalExpenditure);
      case 'most_delayed':
        return list.sort((a, b) => b.delayedCount - a.delayedCount || b.projectCount - a.projectCount);
      case 'highest_risk':
        return list.sort((a, b) => b.highRiskCount - a.highRiskCount || b.delayedCount - a.delayedCount);
      default:
        return list;
    }
  }, [searchedVillages, sortBy]);

  // Pagination
  const totalPages = Math.ceil(sortedVillages.length / pageSize) || 1;
  const paginatedVillages = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedVillages.slice(start, start + pageSize);
  }, [sortedVillages, currentPage, pageSize]);

  // Export CSV helper
  const handleExportCSV = () => {
    const headers = ['Village Name', 'LGD Code', 'State', 'District', 'Block', 'MPLADS Projects', 'Completed', 'Ongoing', 'Delayed', 'High-Risk', 'Expenditure (₹)', 'Last Date'];
    const rows = sortedVillages.map(v => [
      `"${v.villageName}"`,
      `"${v.villageCode}"`,
      `"${v.state}"`,
      `"${v.district}"`,
      `"${v.subDistrict}"`,
      v.projectCount,
      v.completedCount,
      v.ongoingCount,
      v.delayedCount,
      v.highRiskCount,
      v.totalExpenditure,
      v.lastProjectDate || 'N/A'
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `MPLADS_Village_Intelligence_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isSelected = (v: LGDVillage) => selectedVillagesForComparison.some(item => item.id === v.id);

  return (
    <div className="bg-white rounded-gov border border-gov-border shadow-gov overflow-hidden space-y-3">
      
      {/* Table Header Controls */}
      <div className="p-3.5 border-b border-gov-border flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[#fafbfc]">
        
        <div>
          <h3 className="text-sm font-bold text-gov-navy flex items-center space-x-2">
            <span>Village Development Intelligence Index</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-gov-navy font-semibold">
              {sortedVillages.length} Records
            </span>
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Descriptive register of verified Local Government Directory (LGD) units and linked MPLADS works.
          </p>
        </div>

        {/* Controls: Search, Sort, Export */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Search Box */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search village, LGD, block, MP..."
              className="pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded focus:ring-1 focus:ring-gov-navy focus:outline-none w-56 bg-white"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center space-x-1.5 text-xs text-slate-600">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value as VillageSortOption);
                setCurrentPage(1);
              }}
              className="px-2 py-1.5 border border-slate-300 rounded text-xs bg-white text-slate-800 focus:ring-1 focus:ring-gov-navy focus:outline-none"
            >
              <option value="lowest_projects">Sort: Lowest Project Count</option>
              <option value="highest_projects">Sort: Highest Project Count</option>
              <option value="highest_expenditure">Sort: Highest Expenditure</option>
              <option value="most_delayed">Sort: Most Delayed Works</option>
              <option value="highest_risk">Sort: Highest Risk Indicators</option>
            </select>
          </div>

          {/* Export CSV */}
          <button
            onClick={handleExportCSV}
            className="px-2.5 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 text-xs font-semibold rounded shadow-xs flex items-center space-x-1 transition"
            title="Download CSV report"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export</span>
          </button>

        </div>
      </div>

      {/* Floating Comparison Action Banner if 1+ villages selected */}
      {selectedVillagesForComparison.length > 0 && (
        <div className="mx-3.5 p-2.5 bg-blue-50 border border-blue-200 rounded flex items-center justify-between text-xs animate-fadeIn">
          <div className="flex items-center space-x-2">
            <Scale className="w-4 h-4 text-blue-700 shrink-0" />
            <span className="font-semibold text-blue-900">
              {selectedVillagesForComparison.length} of 5 Villages Selected for Side-by-Side Comparison
            </span>
            <span className="text-[11px] text-blue-700 hidden sm:inline">
              ({selectedVillagesForComparison.map(v => v.villageName).join(', ')})
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={onOpenComparisonModal}
              className="px-3 py-1 bg-gov-navy hover:bg-gov-navy-light text-white text-xs font-bold rounded shadow-xs transition"
            >
              Compare Now
            </button>
          </div>
        </div>
      )}

      {/* Dense Government Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse gov-table">
          <thead>
            <tr>
              <th className="w-8 text-center">Compare</th>
              <th>Village & LGD Code</th>
              <th>State</th>
              <th>District</th>
              <th>Block / Sub-District</th>
              <th className="text-center">MPLADS Projects</th>
              <th className="text-center">Completed</th>
              <th className="text-center">Ongoing</th>
              <th className="text-center">Delayed</th>
              <th className="text-center">High-Risk</th>
              <th className="text-right">Total Expenditure</th>
              <th>Last Project Date</th>
              <th className="text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginatedVillages.length > 0 ? (
              paginatedVillages.map((v) => {
                const selected = isSelected(v);
                return (
                  <tr key={v.id} className="hover:bg-blue-50/40 transition duration-75">
                    
                    {/* Compare Checkbox */}
                    <td className="text-center py-2">
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() => onToggleCompare(v)}
                        disabled={!selected && selectedVillagesForComparison.length >= 5}
                        className="rounded border-slate-300 text-gov-navy focus:ring-gov-navy cursor-pointer"
                        title={!selected && selectedVillagesForComparison.length >= 5 ? 'Max 5 villages can be compared' : 'Select for comparison'}
                      />
                    </td>

                    {/* Village Name & LGD Code */}
                    <td className="font-semibold text-slate-900">
                      <div className="flex items-center space-x-1.5">
                        <button
                          onClick={() => navigate(`/village/${v.id}`)}
                          className="hover:text-blue-700 hover:underline text-left text-xs font-bold text-gov-navy"
                        >
                          {v.villageName}
                        </button>
                        {v.coordinates ? (
                          <span title={`Geocoded: ${v.coordinatesSource}`}>
                            <MapPin className="w-3 h-3 text-emerald-600" />
                          </span>
                        ) : (
                          <span title="Coordinates not available in source (administrative view only)">
                            <MapPin className="w-3 h-3 text-slate-300" />
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] font-mono text-slate-500 font-normal">
                        LGD: {v.villageCode}
                      </span>
                    </td>

                    {/* State */}
                    <td className="text-slate-700 text-xs">{v.state}</td>

                    {/* District */}
                    <td className="text-slate-700 text-xs">{v.district}</td>

                    {/* Block */}
                    <td className="text-slate-700 text-xs">{v.subDistrict}</td>

                    {/* Projects Count */}
                    <td className="text-center">
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${
                        v.projectCount === 0 
                          ? 'bg-slate-100 text-slate-600' 
                          : v.projectCount <= 2 
                          ? 'bg-amber-100 text-amber-900' 
                          : v.projectCount <= 5 
                          ? 'bg-blue-100 text-blue-900' 
                          : 'bg-emerald-100 text-emerald-900'
                      }`}>
                        {v.projectCount}
                      </span>
                    </td>

                    {/* Completed */}
                    <td className="text-center text-xs font-medium text-emerald-700">
                      {v.completedCount}
                    </td>

                    {/* Ongoing */}
                    <td className="text-center text-xs font-medium text-blue-700">
                      {v.ongoingCount}
                    </td>

                    {/* Delayed */}
                    <td className="text-center text-xs font-medium">
                      {v.delayedCount > 0 ? (
                        <span className="text-amber-700 font-bold bg-amber-50 px-1.5 py-0.5 rounded">
                          {v.delayedCount}
                        </span>
                      ) : (
                        <span className="text-slate-400">0</span>
                      )}
                    </td>

                    {/* High-Risk */}
                    <td className="text-center text-xs font-medium">
                      {v.highRiskCount > 0 ? (
                        <span className="text-red-700 font-bold bg-red-50 px-1.5 py-0.5 rounded">
                          {v.highRiskCount}
                        </span>
                      ) : (
                        <span className="text-slate-400">0</span>
                      )}
                    </td>

                    {/* Total Expenditure */}
                    <td className="text-right text-xs font-semibold text-slate-900 font-mono">
                      {v.totalExpenditure > 0 ? (
                        `₹${(v.totalExpenditure / 100000).toFixed(2)} L`
                      ) : (
                        <span className="text-slate-400 font-normal">₹0.00</span>
                      )}
                    </td>

                    {/* Last Project Date */}
                    <td className="text-xs text-slate-600">
                      {v.lastProjectDate || <span className="text-slate-400 italic">No works</span>}
                    </td>

                    {/* Action */}
                    <td className="text-center">
                      <button
                        onClick={() => navigate(`/village/${v.id}`)}
                        className="px-2 py-1 bg-slate-100 hover:bg-gov-navy hover:text-white text-slate-700 text-[11px] font-semibold rounded transition inline-flex items-center space-x-0.5"
                        title="Open Village Project History"
                      >
                        <span>History</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </td>

                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={13} className="text-center py-8 text-slate-500 text-xs">
                  No villages match the active filters or search criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination & Footer */}
      <div className="p-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-600 bg-[#fafbfc]">
        <div>
          Showing {sortedVillages.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to{' '}
          {Math.min(currentPage * pageSize, sortedVillages.length)} of {sortedVillages.length} villages
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-2.5 py-1 border border-slate-300 rounded bg-white hover:bg-slate-50 disabled:opacity-50 text-xs"
          >
            Previous
          </button>
          <span className="px-2 py-1 font-semibold text-slate-700">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-2.5 py-1 border border-slate-300 rounded bg-white hover:bg-slate-50 disabled:opacity-50 text-xs"
          >
            Next
          </button>
        </div>
      </div>

    </div>
  );
};
