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
import { SEOHead } from '../components/SEOHead';

export const ProjectsListPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedState, setSelectedState] = useState(searchParams.get('state') || 'All States');
  const [selectedStatus, setSelectedStatus] = useState(searchParams.get('status') || 'All Statuses');
  const [selectedRisk, setSelectedRisk] = useState(searchParams.get('risk') || 'All Risks');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [investigatingId, setInvestigatingId] = useState<string | null>(null);

  const isFilteredSearch = !!(searchParams.get('search') || searchParams.get('state') || searchParams.get('status'));

  // Dynamically extract distinct values from actual dataset records
  const availableStatuses = React.useMemo(() => {
    const statuses = new Set<string>();
    MOCK_PROJECTS.forEach(p => {
      if (p.status) statuses.add(p.status);
    });
    return Array.from(statuses).sort();
  }, []);

  const availableStates = React.useMemo(() => {
    const states = new Set<string>();
    MOCK_PROJECTS.forEach(p => {
      if (p.state) states.add(p.state);
    });
    return Array.from(states).sort();
  }, []);

  const availableCategories = React.useMemo(() => {
    const categories = new Set<string>();
    MOCK_PROJECTS.forEach(p => {
      if (p.category) categories.add(p.category);
    });
    return Array.from(categories).sort();
  }, []);

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

  const handleExportCSV = () => {
    const headers = ['Project Code', 'Name', 'MP Name', 'State', 'District', 'Category', 'Sanctioned Amount (INR)', 'Expenditure (INR)', 'Physical Progress (%)', 'Status', 'Risk Level'];
    const rows = filteredProjects.map(p => [
      `"${p.code}"`,
      `"${p.name.replace(/"/g, '""')}"`,
      `"${p.mpName.replace(/"/g, '""')}"`,
      `"${p.state}"`,
      `"${p.district}"`,
      `"${p.category}"`,
      p.sanctionedAmount || 0,
      p.expenditure || 0,
      p.physicalProgress || 0,
      `"${p.status}"`,
      `"${p.riskLevel}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `MPLADS_Projects_Export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 space-y-4">
      <SEOHead
        title={searchQuery ? `Search: "${searchQuery}" | MPLADS Projects` : 'National Works Registry & Projects Database | MPLADS-AI'}
        description="Search, filter, and inspect thousands of MPLADS public infrastructure works across states, districts, implementing agencies, and progress stages."
        canonicalPath="/projects"
        noindex={isFilteredSearch}
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Projects Registry', url: '/projects' }
        ]}
      />
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
            onClick={handleExportCSV}
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
            <option value="All States">All States ({availableStates.length})</option>
            {availableStates.map(st => (
              <option key={st} value={st}>{st}</option>
            ))}
          </select>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-2.5 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-gov-navy focus:outline-none text-slate-700"
          >
            <option value="All Categories">All Categories ({availableCategories.length})</option>
            {availableCategories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          {/* Dynamic Status Filter (Strictly Derived from Actual Dataset) */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-2.5 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-gov-navy focus:outline-none text-slate-700 font-medium"
          >
            <option value="All Statuses">All Statuses</option>
            {availableStatuses.map(st => {
              const label = st === 'COMPLETED' ? 'Completed' : st === 'IN PROGRESS' ? 'In Progress' : st === 'DELAYED' ? 'Delayed' : st === 'UNDER REVIEW' ? 'Under Review' : st;
              return (
                <option key={st} value={st}>
                  {label}
                </option>
              );
            })}
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
