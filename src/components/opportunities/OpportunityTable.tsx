import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { OpportunityRecord } from '../../types/contractorOpportunity';
import { SourceVerificationBadge } from './SourceVerificationBadge';
import { 
  ExternalLink, 
  Send, 
  Search, 
  Download, 
  ChevronRight, 
  Flame, 
  Clock, 
  Building2, 
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

interface Props {
  records: OpportunityRecord[];
  onExpressInterest: (record: OpportunityRecord) => void;
}

export const OpportunityTable: React.FC<Props> = ({ records, onExpressInterest }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Search filter
  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return records;
    const q = searchQuery.toLowerCase().trim();
    return records.filter(r => 
      r.workName.toLowerCase().includes(q) ||
      r.projectId.toLowerCase().includes(q) ||
      r.district.toLowerCase().includes(q) ||
      r.state.toLowerCase().includes(q) ||
      r.sector.toLowerCase().includes(q) ||
      (r.tenderReference && r.tenderReference.toLowerCase().includes(q))
    );
  }, [records, searchQuery]);

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);

  // Format currency
  const formatCost = (val: number | null) => {
    if (val === null || val === undefined) return <span className="text-slate-400 italic">Not available</span>;
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(2)} Lakh`;
    return `₹${val.toLocaleString()}`;
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      'Project ID', 'Work Name', 'State', 'District', 'Location', 'Sector', 
      'Current Status', 'Estimated Cost', 'Recommendation Date', 'Sanction Date', 
      'Tender Status', 'Tender Ref', 'Closing Date', 'Official Source'
    ];
    const rows = filtered.map(r => [
      `"${r.projectId}"`,
      `"${r.workName.replace(/"/g, '""')}"`,
      `"${r.state}"`,
      `"${r.district}"`,
      `"${r.location}"`,
      `"${r.sector}"`,
      `"${r.currentStatus}"`,
      r.estimatedCost ? r.estimatedCost : 'Not available',
      r.recommendationDate || 'Not available',
      r.sanctionDate || 'Not available',
      `"${r.tenderStatus || 'Not available'}"`,
      `"${r.tenderReference || 'Not available'}"`,
      r.tenderClosingDate || 'Not available',
      `"${r.officialSource ? r.officialSource.source_name : 'Not available'}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `MPLADS_Opportunities_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-gov border border-gov-border shadow-gov overflow-hidden space-y-3">
      
      {/* Top Header & Search */}
      <div className="p-3.5 border-b border-gov-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#fafbfc]">
        <div>
          <h3 className="text-sm font-bold text-gov-navy flex items-center space-x-2">
            <span>Publicly Listed Project Registry & Procurement Index</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-gov-navy font-semibold">
              {filtered.length} Opportunities Found
            </span>
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Strictly distinguishes proposed/sanctioned works from officially published open tenders.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search work, ID, district, tender ref..."
              className="pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded focus:ring-1 focus:ring-gov-navy focus:outline-none w-56 sm:w-64 bg-white"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          </div>

          <button
            onClick={handleExportCSV}
            className="px-2.5 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 text-xs font-semibold rounded shadow-xs flex items-center space-x-1"
            title="Download CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>

      {/* Dense Government Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse gov-table text-xs">
          <thead>
            <tr>
              <th>Project ID</th>
              <th className="min-w-[220px]">Work Name</th>
              <th>Location & State</th>
              <th>Sector</th>
              <th className="text-center">Current Status</th>
              <th className="text-right">Approved Cost</th>
              <th>Rec. Date</th>
              <th>Sanction Date</th>
              <th>Tender Status</th>
              <th>Tender Ref</th>
              <th>Closing Date</th>
              <th>Official Source</th>
              <th className="text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginated.length > 0 ? (
              paginated.map((opp) => (
                <tr key={opp.id} className="hover:bg-blue-50/30 transition duration-75">
                  
                  {/* Project ID */}
                  <td className="font-mono font-bold text-[11px] text-gov-navy whitespace-nowrap">
                    <button
                      onClick={() => navigate(`/opportunities/${opp.id}`)}
                      className="hover:underline text-left"
                      title="View Project Details"
                    >
                      {opp.projectId}
                    </button>
                  </td>

                  {/* Work Name */}
                  <td className="font-medium text-slate-900 leading-snug">
                    <button
                      onClick={() => navigate(`/opportunities/${opp.id}`)}
                      className="text-left hover:text-blue-700 hover:underline"
                    >
                      {opp.workName}
                    </button>
                    {opp.currentStatus === 'Tender Open' && (
                      <span className="inline-flex items-center space-x-0.5 ml-1.5 px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                        <Flame className="w-2.5 h-2.5 text-amber-600" />
                        <span>OPEN TENDER</span>
                      </span>
                    )}
                  </td>

                  {/* Location & State */}
                  <td className="text-slate-700 whitespace-nowrap">
                    <div className="font-semibold text-slate-900">{opp.district}, {opp.state}</div>
                    <div className="text-[11px] text-slate-500">{opp.location || 'Not available'}</div>
                  </td>

                  {/* Sector */}
                  <td>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-800 border border-blue-200 whitespace-nowrap">
                      {opp.sector}
                    </span>
                  </td>

                  {/* Current Status (7-level strictly separated) */}
                  <td className="text-center whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      opp.currentStatus === 'Tender Open'
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : opp.currentStatus === 'Procurement/Tender Published'
                        ? 'bg-blue-100 text-blue-900 border border-blue-300'
                        : opp.currentStatus === 'Sanctioned'
                        ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                        : opp.currentStatus === 'Under Administrative Processing'
                        ? 'bg-indigo-50 text-indigo-800 border border-indigo-200'
                        : opp.currentStatus === 'Recommended'
                        ? 'bg-slate-100 text-slate-700 border border-slate-300'
                        : opp.currentStatus === 'Work in Progress'
                        ? 'bg-purple-100 text-purple-900 border border-purple-300'
                        : 'bg-emerald-50 text-emerald-800'
                    }`}>
                      {opp.currentStatus}
                    </span>
                  </td>

                  {/* Estimated Cost */}
                  <td className="text-right font-mono font-semibold text-slate-900 whitespace-nowrap">
                    {formatCost(opp.estimatedCost)}
                  </td>

                  {/* Recommendation Date */}
                  <td className="text-slate-600 whitespace-nowrap">
                    {opp.recommendationDate || <span className="text-slate-400 italic">Not available</span>}
                  </td>

                  {/* Sanction Date */}
                  <td className="text-slate-600 whitespace-nowrap">
                    {opp.sanctionDate || <span className="text-slate-400 italic">Not available</span>}
                  </td>

                  {/* Tender Status */}
                  <td className="text-[11px] text-slate-700 min-w-[140px]">
                    {opp.tenderStatus || <span className="text-slate-400 italic">Not available</span>}
                  </td>

                  {/* Tender Ref */}
                  <td className="font-mono text-[11px] text-slate-700 whitespace-nowrap">
                    {opp.tenderReference || <span className="text-slate-400 italic font-sans">Not available</span>}
                  </td>

                  {/* Tender Closing Date */}
                  <td className="text-slate-700 whitespace-nowrap">
                    {opp.tenderClosingDate ? (
                      <span className="font-semibold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                        {opp.tenderClosingDate}
                      </span>
                    ) : (
                      <span className="text-slate-400 italic">Not available</span>
                    )}
                  </td>

                  {/* Official Source & Verification */}
                  <td className="min-w-[160px]">
                    {opp.officialSource ? (
                      <div className="space-y-0.5">
                        <a
                          href={opp.officialSource.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] font-bold text-gov-navy hover:text-blue-700 hover:underline flex items-center space-x-1"
                          title={`Open ${opp.officialSource.source_name}`}
                        >
                          <span>{opp.officialSource.source_type}</span>
                          <ExternalLink className="w-3 h-3 text-blue-600 shrink-0" />
                        </a>
                        <SourceVerificationBadge status={opp.verificationStatus} note={opp.verificationNote} />
                      </div>
                    ) : (
                      <span className="text-slate-400 italic">Not available</span>
                    )}
                  </td>

                  {/* Action Buttons */}
                  <td className="text-center whitespace-nowrap">
                    <div className="flex items-center justify-center space-x-1">
                      <button
                        onClick={() => onExpressInterest(opp)}
                        className="px-2 py-1 bg-gov-navy hover:bg-gov-navy-light text-white text-[10px] font-bold rounded shadow-xs flex items-center space-x-1 transition"
                        title="Express Contractor Interest (Prototype Registration)"
                      >
                        <Send className="w-2.5 h-2.5" />
                        <span>Interest</span>
                      </button>

                      <button
                        onClick={() => navigate(`/opportunities/${opp.id}`)}
                        className="p-1 text-slate-500 hover:text-slate-900 rounded hover:bg-slate-100"
                        title="View Details"
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>

                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={13} className="text-center py-10 text-slate-500 text-xs">
                  No opportunities match the selected criteria. Try adjusting the filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="p-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-600 bg-[#fafbfc]">
        <div>
          Showing {filtered.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to{' '}
          {Math.min(currentPage * pageSize, filtered.length)} of {filtered.length} opportunities
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
