import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MOCK_PROJECTS } from '../data/mockData';
import { InvestigationModal } from '../components/InvestigationModal';
import { 
  Search, 
  Filter, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  FileText, 
  Download,
  ArrowRight,
  SlidersHorizontal
} from 'lucide-react';

export const ProjectsListPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedState, setSelectedState] = useState(searchParams.get('state') || 'All States');
  const [selectedStatus, setSelectedStatus] = useState(searchParams.get('status') || 'All Statuses');
  const [selectedRisk, setSelectedRisk] = useState(searchParams.get('risk') || 'All Risks');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [investigatingId, setInvestigatingId] = useState<string | null>(null);

  const filteredProjects = MOCK_PROJECTS.filter(p => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match = p.name.toLowerCase().includes(q) || 
                    p.code.toLowerCase().includes(q) || 
                    p.district.toLowerCase().includes(q) || 
                    p.mpName.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (selectedState !== 'All States' && p.state !== selectedState) return false;
    if (selectedStatus !== 'All Statuses' && p.status !== selectedStatus) return false;
    if (selectedRisk !== 'All Risks' && p.riskLevel !== selectedRisk) return false;
    if (selectedCategory !== 'All Categories' && p.category !== selectedCategory) return false;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 space-y-4">
      {/* Page Title & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gov-border">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-gov-navy">
            MPLADS Project Registry & Execution Index
          </h1>
          <p className="text-xs text-slate-500">
            Comprehensive national database of recommended, sanctioned, and completed development works.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button 
            onClick={() => alert('Exporting all filtered records in official CSV / Excel format.')}
            className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded shadow-xs flex items-center space-x-1"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-3.5 rounded-gov border border-gov-border shadow-gov space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 text-xs">
          {/* Search Box */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search code, name, MP, district..."
              className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-gov-navy focus:outline-none"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          </div>

          {/* State Filter */}
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="px-2.5 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-gov-navy focus:outline-none text-slate-700"
          >
            <option value="All States">All States</option>
            <option value="Maharashtra">Maharashtra</option>
            <option value="Uttar Pradesh">Uttar Pradesh</option>
            <option value="Rajasthan">Rajasthan</option>
          </select>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-2.5 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-gov-navy focus:outline-none text-slate-700"
          >
            <option value="All Categories">All Categories</option>
            <option value="Community Infrastructure">Community Infrastructure</option>
            <option value="Drinking Water">Drinking Water</option>
            <option value="Education">Education</option>
            <option value="Health & Sanitation">Health & Sanitation</option>
            <option value="Roads & Pathways">Roads & Pathways</option>
            <option value="Irrigation">Irrigation</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-2.5 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-gov-navy focus:outline-none text-slate-700"
          >
            <option value="All Statuses">All Statuses</option>
            <option value="IN PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="DELAYED">Delayed</option>
            <option value="UNDER REVIEW">Under Review</option>
          </select>

          {/* Risk Filter */}
          <select
            value={selectedRisk}
            onChange={(e) => setSelectedRisk(e.target.value)}
            className="px-2.5 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-gov-navy focus:outline-none text-slate-700"
          >
            <option value="All Risks">All AI Risk Levels</option>
            <option value="HIGH">High Risk (80+)</option>
            <option value="LOW">Low Risk</option>
          </select>
        </div>

        <div className="flex justify-between items-center text-[11px] text-slate-500 pt-1 border-t border-slate-100">
          <span>Found <strong>{filteredProjects.length}</strong> matching projects in database</span>
          {(searchQuery || selectedState !== 'All States' || selectedStatus !== 'All Statuses' || selectedRisk !== 'All Risks') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedState('All States');
                setSelectedStatus('All Statuses');
                setSelectedRisk('All Risks');
              }}
              className="text-gov-blue hover:underline font-semibold"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-gov border border-gov-border shadow-gov overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left gov-table">
            <thead>
              <tr>
                <th>Project Code & Name</th>
                <th>Hon'ble MP & Constituency</th>
                <th>District / State</th>
                <th>Category</th>
                <th>Sanctioned</th>
                <th>Contract Value</th>
                <th>Progress (Phy/Fin)</th>
                <th>Status</th>
                <th>AI Risk</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.map((p) => {
                const isHighRisk = p.riskLevel === 'HIGH' || p.riskLevel === 'CRITICAL';
                return (
                  <tr key={p.id} className="hover:bg-slate-50 transition cursor-pointer" onClick={() => navigate(`/projects/${p.id}`)}>
                    <td>
                      <span className="font-mono text-[10px] font-bold text-slate-500 block">
                        {p.code}
                      </span>
                      <span className="font-bold text-slate-900 text-xs hover:text-gov-blue transition line-clamp-1">
                        {p.name}
                      </span>
                    </td>
                    <td className="text-xs text-slate-700">
                      <span className="font-semibold block">{p.mpName}</span>
                      <span className="text-[10px] text-slate-400">{p.mpConstituency} ({p.mpHouse})</span>
                    </td>
                    <td className="text-xs text-slate-700">
                      <span className="block">{p.district}</span>
                      <span className="text-[10px] text-slate-400">{p.state}</span>
                    </td>
                    <td className="text-xs text-slate-600 font-medium">
                      {p.category}
                    </td>
                    <td className="font-bold text-slate-800 text-xs whitespace-nowrap">
                      ₹ {(p.sanctionedAmount / 100000).toFixed(1)} L
                    </td>
                    <td className="font-bold text-gov-navy text-xs whitespace-nowrap">
                      ₹ {(p.contractValue / 100000).toFixed(1)} L
                    </td>
                    <td className="text-xs whitespace-nowrap">
                      <div className="flex items-center space-x-1.5">
                        <span className="font-bold text-amber-700">{p.physicalProgress}% Phy</span>
                        <span className="text-slate-300">/</span>
                        <span className="font-bold text-rose-700">{p.financialProgress}% Fin</span>
                      </div>
                    </td>
                    <td>
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded border capitalize ${
                        p.status === 'COMPLETED' 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                          : p.status === 'DELAYED'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td>
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded border ${
                        isHighRisk 
                          ? 'bg-rose-100 text-rose-800 border-rose-300' 
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}>
                        {p.riskScore}/100 {p.riskLevel}
                      </span>
                    </td>
                    <td className="text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end space-x-1">
                        <button
                          onClick={() => navigate(`/projects/${p.id}`)}
                          className="px-2 py-0.5 text-xs font-semibold text-gov-blue hover:bg-blue-50 rounded"
                        >
                          View
                        </button>
                        {isHighRisk && (
                          <button
                            onClick={() => setInvestigatingId(p.id)}
                            className="px-2 py-0.5 bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-bold rounded shadow-xs"
                          >
                            Investigate
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {investigatingId && (
        <InvestigationModal
          projectId={investigatingId}
          isOpen={!!investigatingId}
          onClose={() => setInvestigatingId(null)}
        />
      )}
    </div>
  );
};
