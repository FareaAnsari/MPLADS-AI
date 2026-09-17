import React from 'react';
import { FileText, Download, Printer, BarChart2, ShieldCheck } from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const reports = [
    {
      id: 'REP-01',
      title: 'National MPLADS Project Risk & Anomaly Audit Report',
      category: 'AI Forensic Intelligence',
      frequency: 'Weekly Automated',
      date: '14 Sep 2026',
      size: '4.2 MB',
      description: 'Comprehensive risk scoring across 28,416 active projects, detailing payment-progress mismatches and contractor clusters.'
    },
    {
      id: 'REP-02',
      title: 'District Scrutiny & Sanction Performance Compendium',
      category: 'Administrative Compliance',
      frequency: 'Monthly',
      date: '01 Sep 2026',
      size: '8.1 MB',
      description: 'District-wise breakdown of sanction delays, technical vetting turnaround, and tender completion timelines.'
    },
    {
      id: 'REP-03',
      title: 'Public Works Contractor & Vendor Capacity Analysis',
      category: 'Contractor Oversight',
      frequency: 'Quarterly',
      date: '15 Aug 2026',
      size: '3.6 MB',
      description: 'Multi-contract workload concentration, delayed project frequencies, and rate variance indices.'
    },
    {
      id: 'REP-04',
      title: 'PFMS State Treasury Fund Drawdown & UC Reconciliation',
      category: 'Financial Accountability',
      frequency: 'Bi-Annual',
      date: '01 Jul 2026',
      size: '12.4 MB',
      description: 'Reconciliation of ₹56,820 Cr sanctioned funds against certified Utilization Certificates (GFR-12C).'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 space-y-4">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gov-border">
        <div>
          <div className="flex items-center space-x-2">
            <BarChart2 className="w-5 h-5 text-gov-navy" />
            <h1 className="text-lg sm:text-xl font-bold text-gov-navy">
              Statutory Reports & Audit Intelligence Repository
            </h1>
          </div>
          <p className="text-xs text-slate-500">
            Official government reports, parliamentary committee summaries, and AI anomaly compendiums.
          </p>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reports.map(r => (
          <div key={r.id} className="bg-white rounded-gov border border-gov-border p-5 shadow-gov space-y-3 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-50 text-blue-700 rounded border border-blue-200">
                  {r.category}
                </span>
                <span className="text-xs text-slate-400">{r.date}</span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 leading-snug">{r.title}</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">{r.description}</p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-400 font-mono text-[11px]">PDF ({r.size})</span>
              <div className="flex space-x-2">
                <button
                  onClick={() => alert(`Generating printable document for ${r.title}`)}
                  className="px-2.5 py-1 bg-white border border-slate-300 text-slate-700 rounded hover:bg-slate-50 font-medium flex items-center space-x-1"
                >
                  <Printer className="w-3 h-3 text-slate-500" />
                  <span>Preview</span>
                </button>
                <button
                  onClick={() => alert(`Downloading official authenticated copy of ${r.title}`)}
                  className="px-3 py-1 bg-gov-navy hover:bg-[#071f3d] text-white font-bold rounded flex items-center space-x-1"
                >
                  <Download className="w-3 h-3" />
                  <span>Download</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
