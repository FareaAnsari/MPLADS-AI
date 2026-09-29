import React, { useState, useEffect } from 'react';
import {
  FileCheck,
  Search,
  CheckCircle,
  Clock,
  ExternalLink,
  ShieldAlert,
  Building2,
  Calendar,
  Layers,
  Sparkles,
  ArrowRight,
  Info,
  X,
  Truck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { tenderService, Tender, Contract } from '../services/tenderService';
import { BidderScrutinyPanel } from '../components/BidderScrutinyPanel';
import { SEOHead } from '../components/SEOHead';

export const TendersPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'tenders' | 'contracts'>('tenders');
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  
  // Selected Tender for Detail Modal
  const [selectedTender, setSelectedTender] = useState<Tender | null>(null);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [tList, cList] = await Promise.all([
        tenderService.getTenders(),
        tenderService.getContracts()
      ]);
      setTenders(tList);
      setContracts(cList);
    } catch (e) {
      console.error('Error fetching tenders data:', e);
    } finally {
      setLoading(false);
    }
  };

  const filteredTenders = tenders.filter(t => {
    const matchesSearch =
      t.tender_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.work_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || t.status.toUpperCase() === statusFilter.toUpperCase();
    const matchesType = typeFilter === 'ALL' || t.tender_type.toUpperCase() === typeFilter.toUpperCase();
    return matchesSearch && matchesStatus && matchesType;
  });

  const filteredContracts = contracts.filter(c => {
    return (
      c.contract_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.work_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.vendor_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.district.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const formatLakhs = (amt: number) => {
    return `₹ ${(amt / 100000).toFixed(2)} Lakh`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 space-y-4">
      <SEOHead
        title="E-Procurement, Tenders & Contract Registry | MPLADS-AI"
        description="Public tendering oversight, bidder scrutiny anomaly detection, and contract execution registers for MPLADS infrastructure packages under GFR 2017 standards."
        canonicalPath="/tenders"
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Tenders & Contracts', url: '/tenders' }
        ]}
      />
      {/* Statutory Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gov-border">
        <div>
          <div className="flex items-center space-x-2">
            <FileCheck className="w-5 h-5 text-gov-navy" />
            <h1 className="text-lg sm:text-xl font-bold text-gov-navy">
              E-Procurement, Tenders & Contract Registry
            </h1>
          </div>
          <p className="text-xs text-slate-500">
            GFR 2017 public tendering oversight, bidder scrutiny anomalies, and contract execution records.
          </p>
        </div>

        {/* Provenance Tier Badge */}
        <div className="flex items-center space-x-2 self-start sm:self-auto">
          <span className="px-2.5 py-1 bg-amber-50 border border-amber-200 text-amber-900 text-[11px] font-bold rounded flex items-center space-x-1.5 shadow-2xs">
            <Info className="w-3.5 h-3.5 text-amber-600" />
            <span>Tier 3: Illustrative Tender & Bid Logs (Connected to Real Works)</span>
          </span>
        </div>
      </div>

      {/* Provenance Transparency Alert */}
      <div className="bg-slate-50 border border-slate-200 rounded-gov p-3 text-xs text-slate-700 flex items-start space-x-2">
        <Info className="w-4 h-4 text-gov-navy flex-shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong>Strict Dataset Integrity Protocol:</strong> The official central MPLADS CSV dataset records MP allocations, sanctions, and expenditure. Tender evaluation bid logs and bilateral agreements are modeled as structured Tier-3 demo datasets linked to real project works, providing end-to-end bidder scrutiny and supply chain custody tracking.
        </div>
      </div>

      {/* Tabs & Controls Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="bg-white border border-gov-border rounded-gov p-1 flex space-x-1 text-xs">
          <button
            onClick={() => setActiveTab('tenders')}
            className={`px-4 py-1.5 rounded font-bold transition ${
              activeTab === 'tenders' ? 'bg-gov-navy text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Active & Concluded Tenders ({tenders.length})
          </button>
          <button
            onClick={() => setActiveTab('contracts')}
            className={`px-4 py-1.5 rounded font-bold transition ${
              activeTab === 'contracts' ? 'bg-gov-navy text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Awarded Contracts ({contracts.length})
          </button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search tender ID, work, district..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded text-xs focus:ring-1 focus:ring-gov-navy outline-none"
            />
          </div>

          {activeTab === 'tenders' && (
            <>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs text-slate-700 outline-none"
              >
                <option value="ALL">All Statuses</option>
                <option value="PUBLISHED">Published</option>
                <option value="BIDDING_OPEN">Bidding Open</option>
                <option value="UNDER_EVALUATION">Under Evaluation</option>
                <option value="AWARDED">Awarded</option>
              </select>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs text-slate-700 outline-none"
              >
                <option value="ALL">All Tender Types</option>
                <option value="OPEN_TENDER">Open Tender (GFR)</option>
                <option value="LIMITED_TENDER">Limited Tender</option>
                <option value="GEM_DIRECT">GeM Portal</option>
              </select>
            </>
          )}
        </div>
      </div>

      {/* Main Tab Content */}
      {activeTab === 'tenders' ? (
        <div className="bg-white rounded-gov border border-gov-border shadow-gov overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left gov-table">
              <thead>
                <tr>
                  <th>Tender ID & GFR Type</th>
                  <th>Work Title & Category</th>
                  <th>District / State</th>
                  <th className="text-right">Estimated Cost</th>
                  <th>Deadline / Open Date</th>
                  <th>Status</th>
                  <th className="text-center">Bids Recv.</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredTenders.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-slate-500 text-xs">
                      No tenders match the specified filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredTenders.map((t) => {
                    const hasScrutinyRisk = t.scrutiny_signals && t.scrutiny_signals.length > 0;
                    return (
                      <tr key={t.tender_id} className="hover:bg-slate-50/70 transition">
                        <td>
                          <span className="font-mono text-xs font-bold text-gov-navy block">
                            {t.tender_id}
                          </span>
                          <span className="text-[10px] text-slate-500 font-semibold uppercase">
                            {t.tender_type.replace('_', ' ')}
                          </span>
                        </td>
                        <td>
                          <span className="font-bold text-slate-900 block line-clamp-1">
                            {t.work_title}
                          </span>
                          <span className="text-[11px] text-slate-500">{t.category}</span>
                        </td>
                        <td>
                          <span className="text-xs font-semibold text-slate-800 block">
                            {t.district}
                          </span>
                          <span className="text-[10px] text-slate-500">{t.state}</span>
                        </td>
                        <td className="text-right font-mono font-bold text-slate-900">
                          {formatLakhs(t.estimated_cost)}
                        </td>
                        <td>
                          <div className="text-[11px] text-slate-700">
                            <span>Close: {t.submission_deadline}</span>
                            <span className="block text-[10px] text-slate-400">Open: {t.opening_date}</span>
                          </div>
                        </td>
                        <td>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                              t.status === 'AWARDED'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : t.status === 'BIDDING_OPEN'
                                ? 'bg-blue-50 text-blue-800 border-blue-200'
                                : t.status === 'UNDER_EVALUATION'
                                ? 'bg-amber-50 text-amber-800 border-amber-200'
                                : 'bg-slate-100 text-slate-700 border-slate-200'
                            }`}
                          >
                            {t.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="text-center">
                          <span className="font-bold text-xs text-slate-800">
                            {t.bid_count}
                          </span>
                          {hasScrutinyRisk && (
                            <span className="block text-[9px] text-amber-700 font-bold">
                              ⚠️ Anomaly
                            </span>
                          )}
                        </td>
                        <td className="text-right">
                          <button
                            onClick={() => setSelectedTender(t)}
                            className="px-3 py-1 bg-gov-navy text-white text-[11px] font-bold rounded hover:bg-slate-800 transition"
                          >
                            View Bids & Scrutiny
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Awarded Contracts Tab */
        <div className="bg-white rounded-gov border border-gov-border shadow-gov overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left gov-table">
              <thead>
                <tr>
                  <th>Contract ID & Work</th>
                  <th>Contractor / Vendor</th>
                  <th>District</th>
                  <th className="text-right">Contract Value</th>
                  <th>Award & Completion</th>
                  <th>Measurement Book</th>
                  <th>Status</th>
                  <th className="text-right">Supply Chain Link</th>
                </tr>
              </thead>
              <tbody>
                {filteredContracts.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-slate-500 text-xs">
                      No awarded contracts found.
                    </td>
                  </tr>
                ) : (
                  filteredContracts.map((c) => (
                    <tr key={c.contract_id} className="hover:bg-slate-50/70 transition">
                      <td>
                        <span className="font-mono text-xs font-bold text-gov-navy block">
                          {c.contract_id}
                        </span>
                        <span className="text-xs font-medium text-slate-800 line-clamp-1">
                          {c.work_title}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center space-x-1.5">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          <span className="text-xs font-bold text-slate-900">{c.vendor_name}</span>
                        </div>
                        <span className="text-[10px] text-slate-500">ID: {c.vendor_id}</span>
                      </td>
                      <td>
                        <span className="text-xs font-semibold text-slate-800">{c.district}</span>
                        <span className="text-[10px] text-slate-500 block">{c.state}</span>
                      </td>
                      <td className="text-right font-mono font-bold text-emerald-800">
                        {formatLakhs(c.contract_value)}
                      </td>
                      <td>
                        <div className="text-[11px] text-slate-700">
                          <span>Award: {c.award_date}</span>
                          <span className="text-[10px] text-slate-400 block">Due: {c.scheduled_completion_date}</span>
                        </div>
                      </td>
                      <td>
                        <span className="font-mono text-[11px] font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                          {c.measurement_book_ref || 'MB Pending'}
                        </span>
                      </td>
                      <td>
                        <span className="px-2 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-bold rounded">
                          {c.status}
                        </span>
                      </td>
                      <td className="text-right">
                        <button
                          onClick={() => navigate('/supply-chain')}
                          className="px-2.5 py-1 bg-emerald-700 text-white text-[11px] font-bold rounded hover:bg-emerald-800 transition flex items-center space-x-1 ml-auto"
                        >
                          <Truck className="w-3 h-3" />
                          <span>Track Custody</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tender Detail & Bidder Scrutiny Modal */}
      {selectedTender && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-gov border border-gov-border shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-4 bg-gov-navy text-white flex items-start justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 bg-white/20 rounded">
                    {selectedTender.tender_id}
                  </span>
                  <span className="text-xs text-slate-300 uppercase">
                    {selectedTender.tender_type.replace('_', ' ')}
                  </span>
                </div>
                <h2 className="text-sm sm:text-base font-bold text-white mt-1">
                  {selectedTender.work_title}
                </h2>
                <span className="text-xs text-slate-300">
                  {selectedTender.district}, {selectedTender.state} • Estimated: {formatLakhs(selectedTender.estimated_cost)}
                </span>
              </div>
              <button
                onClick={() => setSelectedTender(null)}
                className="p-1 text-white/80 hover:text-white rounded hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Content */}
            <div className="p-4 overflow-y-auto space-y-4 flex-1">
              {/* Provenance alert */}
              <div className="px-3 py-1.5 bg-amber-50 border border-amber-200 rounded text-xs text-amber-900 flex items-center justify-between">
                <span>Data Provenance: <strong>Tier 3 (Demonstration Bidder Matrix)</strong></span>
                <span className="text-[10px] text-amber-700">Linked to Work: {selectedTender.work_id}</span>
              </div>

              {/* Bidder Scrutiny Panel */}
              <BidderScrutinyPanel signals={selectedTender.scrutiny_signals} />

              {/* Comparative Bids Matrix */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Comparative Bid Evaluation Matrix ({selectedTender.bids.length} Bids Received)
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Confidential Estimate: <strong>{formatLakhs(selectedTender.estimated_cost)}</strong>
                  </span>
                </div>

                <div className="overflow-x-auto border border-gov-border rounded-gov">
                  <table className="w-full text-left gov-table text-xs">
                    <thead>
                      <tr>
                        <th>Rank</th>
                        <th>Bidder Name</th>
                        <th>Quoted Amount</th>
                        <th>Variance vs Estimate</th>
                        <th>Tech Score</th>
                        <th>Evaluation Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedTender.bids.map((b) => {
                        const isUnder = b.variance_from_estimate_pct < 0;
                        return (
                          <tr key={b.bid_id} className={b.status === 'SELECTED' ? 'bg-emerald-50/60' : ''}>
                            <td className="font-bold text-slate-900">{b.financial_rank || '-'}</td>
                            <td>
                              <span className="font-bold text-slate-900 block">{b.vendor_name}</span>
                              <span className="text-[10px] text-slate-500">{b.vendor_id}</span>
                            </td>
                            <td className="font-mono font-bold text-slate-900">
                              {formatLakhs(b.bid_amount)}
                            </td>
                            <td>
                              <span
                                className={`font-mono text-xs font-bold ${
                                  b.is_suspiciously_low
                                    ? 'text-rose-600'
                                    : isUnder
                                    ? 'text-emerald-700'
                                    : 'text-slate-600'
                                }`}
                              >
                                {b.variance_from_estimate_pct > 0 ? '+' : ''}
                                {b.variance_from_estimate_pct}%
                                {b.is_suspiciously_low && ' ⚠️ Low'}
                              </span>
                            </td>
                            <td>
                              <span className="font-semibold text-slate-700">{b.technical_score} / 100</span>
                            </td>
                            <td>
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  b.status === 'SELECTED'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : b.technical_status === 'QUALIFIED'
                                    ? 'bg-slate-100 text-slate-700'
                                    : 'bg-rose-100 text-rose-800'
                                }`}
                              >
                                {b.status === 'SELECTED' ? 'AWARDED (L1)' : b.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Procuring Entity: <strong>{selectedTender.procuring_entity}</strong>
              </span>
              <div className="flex space-x-2">
                <button
                  onClick={() => setSelectedTender(null)}
                  className="px-4 py-1.5 border border-slate-300 text-slate-700 text-xs font-bold rounded hover:bg-slate-100"
                >
                  Close
                </button>
                {selectedTender.status === 'AWARDED' && (
                  <button
                    onClick={() => {
                      setSelectedTender(null);
                      navigate('/supply-chain');
                    }}
                    className="px-4 py-1.5 bg-emerald-700 text-white text-xs font-bold rounded hover:bg-emerald-800 flex items-center space-x-1"
                  >
                    <Truck className="w-3.5 h-3.5" />
                    <span>Track Material Supply Chain →</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
