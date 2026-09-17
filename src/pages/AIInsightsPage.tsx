import React, { useState } from 'react';
import { MOCK_ALERTS, MOCK_PROJECTS, SHOWCASE_PROJECT_ID } from '../data/mockData';
import { InvestigationModal } from '../components/InvestigationModal';
import { 
  ShieldAlert, 
  Sparkles, 
  AlertTriangle, 
  Copy, 
  TrendingDown, 
  Percent, 
  Share2, 
  SearchCode, 
  CheckCircle2, 
  ArrowRight,
  GitFork,
  ExternalLink
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const AIInsightsPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [investigateId, setInvestigateId] = useState<string | null>(null);
  const [duplicateCompareOpen, setDuplicateCompareOpen] = useState<boolean>(false);
  const [selectedNetworkNode, setSelectedNetworkNode] = useState<string>('DARSH BUILDCON');

  const filteredAlerts = MOCK_ALERTS.filter(a => {
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'mismatch' && a.type === 'PAYMENT_PROGRESS_MISMATCH') return true;
    if (selectedCategory === 'material' && a.type === 'HIGH_MATERIAL_COST') return true;
    if (selectedCategory === 'duplicate' && a.type === 'DUPLICATE_WORK') return true;
    if (selectedCategory === 'contractor' && a.type === 'CONTRACTOR_DELAY_PATTERN') return true;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 space-y-4">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gov-border">
        <div>
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <h1 className="text-lg sm:text-xl font-bold text-gov-navy">
              AI Insights & Forensic Intelligence Command Centre
            </h1>
          </div>
          <p className="text-xs text-slate-500">
            Automated multi-record anomaly detection, duplicate project cross-referencing, and contractor-vendor procurement network graph.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setInvestigateId(SHOWCASE_PROJECT_ID)}
            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded shadow-xs flex items-center space-x-1"
          >
            <SearchCode className="w-3.5 h-3.5" />
            <span>Investigate Flagged Case (Pune)</span>
          </button>
        </div>
      </div>

      {/* Forensic Intelligence KPI Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3 rounded-gov border border-gov-border shadow-xs border-l-4 border-l-rose-500">
          <span className="text-[11px] font-semibold text-slate-500 block">High Risk Projects</span>
          <span className="text-xl font-bold text-rose-600">327</span>
          <span className="text-[10px] text-slate-400 block mt-0.5">Confidence &gt; 85%</span>
        </div>
        <div className="bg-white p-3 rounded-gov border border-gov-border shadow-xs border-l-4 border-l-orange-500">
          <span className="text-[11px] font-semibold text-slate-500 block">Payment-Progress Mismatch</span>
          <span className="text-xl font-bold text-orange-600">89 Cases</span>
          <span className="text-[10px] text-slate-400 block mt-0.5">&gt; 25% Disparity</span>
        </div>
        <div className="bg-white p-3 rounded-gov border border-gov-border shadow-xs border-l-4 border-l-amber-500">
          <span className="text-[11px] font-semibold text-slate-500 block">Material Price Outliers</span>
          <span className="text-xl font-bold text-amber-600">142 Items</span>
          <span className="text-[10px] text-slate-400 block mt-0.5">&gt; 20% CSR Deviation</span>
        </div>
        <div className="bg-white p-3 rounded-gov border border-gov-border shadow-xs border-l-4 border-l-purple-500">
          <span className="text-[11px] font-semibold text-slate-500 block">Suspected Duplicates</span>
          <span className="text-xl font-bold text-purple-600">18 Pairs</span>
          <span className="text-[10px] text-slate-400 block mt-0.5">Semantic & GIS Match</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white p-2 rounded-gov border border-gov-border flex flex-wrap gap-1 text-xs">
        {[
          { id: 'all', label: 'All Active Forensic Alerts' },
          { id: 'mismatch', label: 'Payment-Progress Disparities' },
          { id: 'material', label: 'Material Price Anomalies' },
          { id: 'duplicate', label: 'Duplicate Proposals' },
          { id: 'contractor', label: 'Contractor Risk Trajectory' },
        ].map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3 py-1.5 rounded font-medium transition ${
              selectedCategory === cat.id
                ? 'bg-gov-navy text-white font-bold'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Main Alert List Grid */}
      <div className="space-y-3">
        {filteredAlerts.map(alert => (
          <div
            key={alert.id}
            className="bg-white rounded-gov border border-gov-border p-4 shadow-gov hover:shadow-gov-hover transition flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div className="space-y-1 max-w-3xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase tracking-wider ${
                  alert.severity === 'CRITICAL' 
                    ? 'bg-rose-100 text-rose-800 border border-rose-200' 
                    : alert.severity === 'HIGH'
                    ? 'bg-amber-100 text-amber-800 border border-amber-200'
                    : 'bg-blue-100 text-blue-800 border border-blue-200'
                }`}>
                  {alert.severity} SEVERITY
                </span>
                <span className="font-mono text-xs font-bold text-slate-600">
                  {alert.projectId}
                </span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs font-bold text-gov-navy">
                  {alert.projectName} ({alert.district}, {alert.state})
                </span>
                <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                  Confidence: {(alert.confidence * 100).toFixed(0)}%
                </span>
              </div>

              <h3 className="text-sm font-bold text-slate-900 leading-snug pt-0.5">
                {alert.title}
              </h3>

              <p className="text-xs text-slate-600 leading-relaxed">
                {alert.description}
              </p>

              <div className="pt-1 text-[11px] text-slate-500">
                <strong>Primary Evidence:</strong> {alert.evidenceSummary}
              </div>
            </div>

            {/* Actions */}
            <div className="flex sm:flex-col items-end justify-between gap-2 flex-shrink-0">
              <button
                onClick={() => {
                  if (alert.type === 'DUPLICATE_WORK') {
                    setDuplicateCompareOpen(true);
                  } else {
                    setInvestigateId(alert.projectId);
                  }
                }}
                className="px-3 py-1.5 bg-gov-navy hover:bg-[#071f3d] text-white text-xs font-bold rounded flex items-center space-x-1 shadow-xs whitespace-nowrap"
              >
                <SearchCode className="w-3.5 h-3.5" />
                <span>{alert.type === 'DUPLICATE_WORK' ? 'Compare Projects' : 'Investigate Case'}</span>
              </button>
              <button
                onClick={() => navigate(`/projects/${alert.projectId}`)}
                className="text-gov-blue hover:text-gov-navy text-xs font-semibold px-2 py-1 hover:bg-blue-50 rounded"
              >
                View Workspace →
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* CONTRACTOR - VENDOR PROCUREMENT NETWORK GRAPH */}
      <div className="bg-white p-5 rounded-gov border border-gov-border shadow-gov space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <Share2 className="w-4 h-4 text-gov-blue" />
            <h3 className="text-sm font-bold text-slate-800">
              Contractor – Vendor Procurement Network Graph
            </h3>
          </div>
          <span className="text-xs text-slate-500">
            Interactive multi-project cross-link graph
          </span>
        </div>

        <p className="text-xs text-slate-600">
          Uncovers hidden repeat supply arrangements, vendor concentration risks, and interlocking contract awards across adjacent taluks. Click on nodes below to explore connected entities:
        </p>

        {/* Visual Network Nodes Representation */}
        <div className="p-6 bg-slate-50 rounded border border-slate-200 flex flex-col md:flex-row items-center justify-around gap-6">
          
          {/* MP Node */}
          <div 
            onClick={() => setSelectedNetworkNode('Murlidhar Mohol (MP)')}
            className={`cursor-pointer p-3 rounded-lg border text-center shadow-xs transition ${
              selectedNetworkNode.includes('MP') ? 'bg-blue-100 border-blue-400 ring-2 ring-blue-300' : 'bg-white border-slate-300 hover:bg-blue-50'
            }`}
          >
            <span className="text-[10px] font-bold text-blue-800 uppercase block">Elected MP</span>
            <span className="font-bold text-xs text-slate-900 block">Murlidhar Mohol</span>
            <span className="text-[10px] text-slate-500">Pune Constituency</span>
          </div>

          <span className="text-slate-400 font-bold">⟶</span>

          {/* Project Node */}
          <div 
            onClick={() => setSelectedNetworkNode('WS/MP418/2024-2025/133409')}
            className={`cursor-pointer p-3 rounded-lg border text-center shadow-xs transition ${
              selectedNetworkNode.includes('133409') ? 'bg-amber-100 border-amber-400 ring-2 ring-amber-300' : 'bg-white border-slate-300 hover:bg-amber-50'
            }`}
          >
            <span className="text-[10px] font-bold text-amber-800 uppercase block">Work Project</span>
            <span className="font-bold text-xs text-slate-900 block">WS/MP418/2024-2025/133409</span>
            <span className="text-[10px] text-slate-500">Araria PCC Road (₹4.48 L)</span>
          </div>

          <span className="text-slate-400 font-bold">⟶</span>

          {/* Executing Vendor Node */}
          <div 
            onClick={() => setSelectedNetworkNode('DARSH BUILDCON')}
            className={`cursor-pointer p-3 rounded-lg border text-center shadow-xs transition ${
              selectedNetworkNode.includes('DARSH') ? 'bg-rose-100 border-rose-400 ring-2 ring-rose-300' : 'bg-white border-slate-300 hover:bg-rose-50'
            }`}
          >
            <span className="text-[10px] font-bold text-rose-800 uppercase block">Disbursement Entity</span>
            <span className="font-bold text-xs text-slate-900 block">DARSH BUILDCON</span>
            <span className="text-[10px] text-slate-500">Official Payment Vendor</span>
          </div>

          <span className="text-slate-400 font-bold">⟶</span>

          {/* Vendor Node */}
          <div 
            onClick={() => setSelectedNetworkNode('BHARGAV SUMANTRAI PATEL')}
            className={`cursor-pointer p-3 rounded-lg border text-center shadow-xs transition ${
              selectedNetworkNode.includes('BHARGAV') ? 'bg-purple-100 border-purple-400 ring-2 ring-purple-300' : 'bg-white border-slate-300 hover:bg-purple-50'
            }`}
          >
            <span className="text-[10px] font-bold text-purple-800 uppercase block">Verified Public Vendor</span>
            <span className="font-bold text-xs text-slate-900 block">BHARGAV SUMANTRAI PATEL</span>
            <span className="text-[10px] text-slate-500">Expenditure Ledger Record</span>
          </div>

        </div>

        {/* Node Detail Explanatory Box */}
        <div className="p-3 bg-blue-50/70 border border-blue-200 rounded text-xs space-y-1">
          <span className="font-bold text-gov-navy block">Network Graph Traversal Detail: {selectedNetworkNode}</span>
          <p className="text-slate-700 leading-relaxed">
            {selectedNetworkNode.includes('DARSH') && 
              'Payment Entity DARSH BUILDCON has verified public expenditure disbursements indexed from the official e-SAKSHI expenditure dataset.'}
            {selectedNetworkNode.includes('BHARGAV') && 
              'Vendor BHARGAV SUMANTRAI PATEL is cross-referenced with public treasury disbursements in the e-SAKSHI dataset.'}
            {!selectedNetworkNode.includes('DARSH') && !selectedNetworkNode.includes('BHARGAV') &&
              'Entities connected to this project node form a verified public administration chain parsed directly from official e-SAKSHI and data.gov.in records.'}
          </p>
        </div>
      </div>

      {/* DUPLICATE PROJECT COMPARISON MODAL */}
      {duplicateCompareOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-gov border border-slate-300 shadow-xl w-full max-w-3xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <div className="flex items-center space-x-2">
                <Copy className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-sm text-slate-900">
                  AI Duplicate Proposal & Geospatial Overlap Audit (91% Match)
                </h3>
              </div>
              <button onClick={() => setDuplicateCompareOpen(false)} className="text-slate-400 hover:text-slate-700">
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600">
              The AI semantic and geospatial matching engine detected a 91% structural, financial, and spatial overlap between two sanctioned projects in the same Gram Panchayat.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded border border-slate-200 space-y-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Proposal A (Sanctioned)</span>
                <h4 className="font-bold text-slate-900 text-sm">Rural Water Supply & Community Scheme</h4>
                <p className="text-slate-600"><strong>Code:</strong> MPL-MH-2026-1104</p>
                <p className="text-slate-600"><strong>Location:</strong> Dindori, Nashik (20.2012° N, 73.8344° E)</p>
                <p className="text-slate-600"><strong>Sanctioned:</strong> ₹ 35.0 Lakh</p>
                <p className="text-slate-600"><strong>Status:</strong> Completed & Verified</p>
              </div>

              <div className="p-3 bg-amber-50/50 rounded border border-amber-300 space-y-2">
                <span className="text-[10px] font-bold text-amber-800 uppercase block">Proposal B (Under Scrutiny)</span>
                <h4 className="font-bold text-slate-900 text-sm">Village Community Centre</h4>
                <p className="text-slate-600"><strong>Code:</strong> MPL-MH-2026-0891</p>
                <p className="text-slate-600"><strong>Location:</strong> Dindori North, Nashik (20.2030° N, 73.8360° E)</p>
                <p className="text-slate-600"><strong>Estimated:</strong> ₹ 21.0 Lakh</p>
                <p className="text-slate-600 font-bold text-rose-700">Distance: Only 240m away from Proposal A</p>
              </div>
            </div>

            <div className="p-3 bg-slate-100 rounded text-xs space-y-1">
              <span className="font-bold text-slate-800 block">AI Matching Metrics:</span>
              <div className="grid grid-cols-3 gap-2 text-center pt-1 font-semibold">
                <div className="bg-white p-1 rounded border border-slate-200">Text: 94% Overlap</div>
                <div className="bg-white p-1 rounded border border-slate-200">Geo: 240m Radius</div>
                <div className="bg-white p-1 rounded border border-slate-200">Scope: 95% Match</div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 flex justify-end space-x-2">
              <button
                onClick={() => setDuplicateCompareOpen(false)}
                className="px-3 py-1.5 bg-slate-200 text-slate-700 rounded text-xs font-semibold"
              >
                Close Comparison
              </button>
              <button
                onClick={() => {
                  setDuplicateCompareOpen(false);
                  setInvestigateId('MPL-MH-2026-0891');
                }}
                className="px-3 py-1.5 bg-gov-navy text-white rounded text-xs font-bold"
              >
                Launch Forensic Inquiry
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Investigation Modal */}
      {investigateId && (
        <InvestigationModal
          projectId={investigateId}
          isOpen={!!investigateId}
          onClose={() => setInvestigateId(null)}
        />
      )}
    </div>
  );
};
