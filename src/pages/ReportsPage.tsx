import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  Printer, 
  BarChart2, 
  ShieldCheck, 
  Eye, 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp, 
  Clock, 
  Building2, 
  Users, 
  ChevronRight,
  SearchCode,
  Layers,
  FileSpreadsheet
} from 'lucide-react';
import { SEOHead } from '../components/SEOHead';

interface ReportItem {
  id: string;
  title: string;
  category: string;
  frequency: string;
  date: string;
  size: string;
  description: string;
  classification: string;
  coverage: string;
}

export const ReportsPage: React.FC = () => {
  const [selectedReport, setSelectedReport] = useState<ReportItem | null>(null);
  const [activeSection, setActiveSection] = useState<string>('exec');

  const reports: ReportItem[] = [
    {
      id: 'REP-01',
      title: 'National MPLADS Project Risk & Anomaly Audit Report',
      category: 'AI Forensic Intelligence',
      frequency: 'Weekly Automated',
      date: '14 Sep 2026',
      size: '4.2 MB',
      classification: 'Official Public Release / Audit Disclosed',
      coverage: '38,416 Works • 787 MPs • 766 Districts',
      description: 'Comprehensive risk scoring across 38,416 active projects, detailing payment-progress mismatches and contractor clusters.'
    },
    {
      id: 'REP-02',
      title: 'District Scrutiny & Sanction Performance Compendium',
      category: 'Administrative Compliance',
      frequency: 'Monthly',
      date: '01 Sep 2026',
      size: '8.1 MB',
      classification: 'Administrative Audit',
      coverage: '766 District Collectorates • 28 States & 8 UTs',
      description: 'District-wise breakdown of sanction delays, technical vetting turnaround, and tender completion timelines.'
    },
    {
      id: 'REP-03',
      title: 'Public Works Contractor & Vendor Capacity Analysis',
      category: 'Contractor Oversight',
      frequency: 'Quarterly',
      date: '15 Aug 2026',
      size: '3.6 MB',
      classification: 'Procurement Integrity',
      coverage: '4,850 Commercial & Institutional Agencies',
      description: 'Multi-contract workload concentration, delayed project frequencies, and rate variance indices.'
    },
    {
      id: 'REP-04',
      title: 'PFMS State Treasury Fund Drawdown & UC Reconciliation',
      category: 'Financial Accountability',
      frequency: 'Bi-Annual',
      date: '01 Jul 2026',
      size: '12.4 MB',
      classification: 'Statutory Financial Audit',
      coverage: '₹11,877.97 Cr Parliament Allocation Register',
      description: 'Reconciliation of ₹11,877.97 Cr sanctioned funds against certified Utilization Certificates (GFR-12C).'
    }
  ];

  const handlePrintOrDownload = () => {
    window.print();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 space-y-5 font-sans">
      <SEOHead
        title="Statutory Reports & Audit Intelligence Repository | MPLADS-AI"
        description="Public audit repository of national project risk compendiums, district scrutiny performance metrics, contractor workload analyses, and PFMS fund reconciliations."
        canonicalPath="/reports"
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Reports & Audits', url: '/reports' }
        ]}
      />
      
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gov-border">
        <div>
          <div className="flex items-center space-x-2">
            <BarChart2 className="w-6 h-6 text-gov-navy" />
            <h1 className="text-xl sm:text-2xl font-bold text-gov-navy tracking-tight">
              Statutory Reports & Audit Intelligence Repository
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Ministry of Statistics & Programme Implementation (MoSPI) Public Finance & Forensic Project Audit Compendiums
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-white px-3 py-1.5 rounded-gov border border-gov-border shadow-xs text-center">
            <span className="text-[10px] text-slate-500 font-medium block">Audited Reports</span>
            <span className="text-sm font-bold text-gov-navy">4 Publications</span>
          </div>
          <div className="bg-white px-3 py-1.5 rounded-gov border border-gov-border shadow-xs text-center">
            <span className="text-[10px] text-slate-500 font-medium block">Audit Standard</span>
            <span className="text-sm font-bold text-emerald-700">GFR-2017 & e-SAKSHI</span>
          </div>
        </div>
      </div>

      {/* 2. Main Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {reports.map(r => (
          <div 
            key={r.id} 
            className="bg-white rounded-gov border border-gov-border p-5 shadow-gov hover:shadow-md transition flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="text-[11px] font-bold px-2.5 py-0.5 bg-blue-50 text-blue-800 rounded border border-blue-200">
                  {r.category}
                </span>
                <span className="text-xs text-slate-400 font-mono">{r.date}</span>
              </div>

              <h3 className="text-base font-bold text-slate-900 leading-snug hover:text-gov-blue transition cursor-pointer"
                onClick={() => setSelectedReport(r)}
              >
                {r.title}
              </h3>

              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                {r.description}
              </p>

              <div className="mt-3 bg-slate-50 p-2 rounded border border-slate-200/80 text-[11px] text-slate-600 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Coverage:</span>
                  <span className="font-semibold text-slate-800">{r.coverage}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Classification:</span>
                  <span className="font-semibold text-emerald-700">{r.classification}</span>
                </div>
              </div>
            </div>

            <div className="pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-400 font-mono text-[11px]">Format: PDF ({r.size})</span>
              <div className="flex space-x-2">
                <button
                  onClick={() => setSelectedReport(r)}
                  className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 rounded hover:bg-slate-50 font-medium flex items-center space-x-1 shadow-2xs transition"
                >
                  <Eye className="w-3.5 h-3.5 text-slate-500" />
                  <span>Preview Full Report</span>
                </button>
                <button
                  onClick={() => {
                    setSelectedReport(r);
                    setTimeout(() => window.print(), 300);
                  }}
                  className="px-3 py-1.5 bg-gov-navy hover:bg-[#071f3d] text-white font-bold rounded flex items-center space-x-1 shadow-xs transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download / Print</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 3. FULL REPORT PREVIEW MODAL / DRAWER */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-5xl rounded-lg shadow-2xl border border-slate-300 flex flex-col max-h-[92vh] overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
            
            {/* Modal Header Bar */}
            <div className="bg-gov-navy text-white px-5 py-3.5 flex items-center justify-between border-b border-gov-navy shrink-0">
              <div className="flex items-center space-x-2.5">
                <ShieldCheck className="w-5 h-5 text-amber-400" />
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-white tracking-wide">
                    {selectedReport.title}
                  </h2>
                  <div className="text-[11px] text-slate-300">
                    Government of India • Ministry of Statistics & Programme Implementation • {selectedReport.date}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handlePrintOrDownload}
                  className="bg-white/10 hover:bg-white/20 text-white text-xs px-3 py-1.5 rounded flex items-center space-x-1.5 font-semibold transition border border-white/20"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print / Save as PDF</span>
                </button>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="text-slate-300 hover:text-white p-1 rounded hover:bg-white/10 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Navigation Tabs */}
            <div className="bg-slate-100 px-5 py-2 border-b border-slate-200 flex flex-wrap gap-2 text-xs font-semibold shrink-0">
              <button
                onClick={() => setActiveSection('exec')}
                className={`px-3 py-1 rounded transition ${activeSection === 'exec' ? 'bg-white text-gov-navy shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'}`}
              >
                1. Executive Summary & Controls
              </button>
              <button
                onClick={() => setActiveSection('financial')}
                className={`px-3 py-1 rounded transition ${activeSection === 'financial' ? 'bg-white text-gov-navy shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'}`}
              >
                2. Financial & Parliamentary Analysis
              </button>
              <button
                onClick={() => setActiveSection('findings')}
                className={`px-3 py-1 rounded transition ${activeSection === 'findings' ? 'bg-white text-gov-navy shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'}`}
              >
                3. Audit Findings & Risk Matrix
              </button>
              <button
                onClick={() => setActiveSection('districts')}
                className={`px-3 py-1 rounded transition ${activeSection === 'districts' ? 'bg-white text-gov-navy shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'}`}
              >
                4. District & Vendor Performance
              </button>
              <button
                onClick={() => setActiveSection('recommendations')}
                className={`px-3 py-1 rounded transition ${activeSection === 'recommendations' ? 'bg-white text-gov-navy shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'}`}
              >
                5. Corrective Action Plan & KPIs
              </button>
            </div>

            {/* Modal Body Content (Printable Full Audit Document) */}
            <div className="p-6 overflow-y-auto space-y-6 text-slate-800 text-xs sm:text-sm leading-relaxed font-sans print:p-0">
              
              {/* SECTION 1: EXECUTIVE SUMMARY & COVER */}
              {activeSection === 'exec' && (
                <div className="space-y-5">
                  <div className="bg-slate-50 p-4 rounded-md border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <div className="text-[11px] uppercase tracking-wider text-slate-500 font-bold">Document Metadata</div>
                      <div className="text-base font-bold text-gov-navy mt-0.5">{selectedReport.title}</div>
                      <div className="text-xs text-slate-600 mt-1">Classification: <strong className="text-emerald-700">{selectedReport.classification}</strong> • Reporting Cycle: <strong>FY 2023–24 to FY 2026–27</strong></div>
                    </div>
                    <div className="text-right text-xs text-slate-500 shrink-0">
                      <div>Document No: <span className="font-mono font-bold text-slate-800">MoSPI/MPLADS/AUDIT/2026/04</span></div>
                      <div>Release Date: <span className="font-semibold text-slate-800">{selectedReport.date}</span></div>
                    </div>
                  </div>

                  {/* Executive Key Figures Table */}
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm mb-2 uppercase tracking-wide flex items-center gap-1.5">
                      <BarChart2 className="w-4 h-4 text-gov-navy" />
                      <span>1. Executive Summary: Core Public Finance Metrics</span>
                    </h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left gov-table text-xs">
                        <thead>
                          <tr>
                            <th>Audited Metric</th>
                            <th>Quantum (₹ / Count)</th>
                            <th>Unit / Scale</th>
                            <th>Statutory Data Source</th>
                            <th>Audit Verification Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="font-semibold text-slate-900">Total Recommended Works</td>
                            <td className="font-mono font-bold text-gov-navy">₹ 33,123.00</td>
                            <td>Crore (38,416 Works)</td>
                            <td>MoSPI e-SAKSHI Portal</td>
                            <td><span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">100% Reconciled</span></td>
                          </tr>
                          <tr>
                            <td className="font-semibold text-slate-900">Administrative Sanctions Issued</td>
                            <td className="font-mono font-bold text-gov-navy">₹ 4,466.38</td>
                            <td>Crore (21,304 Works)</td>
                            <td>District Authority Orders</td>
                            <td><span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">Verified</span></td>
                          </tr>
                          <tr>
                            <td className="font-semibold text-slate-900">Expenditure on Completed Works</td>
                            <td className="font-mono font-bold text-emerald-800">₹ 859.40</td>
                            <td>Crore (19,402 Works)</td>
                            <td>Asset Handover Registers</td>
                            <td><span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">Certified GFR-12C</span></td>
                          </tr>
                          <tr>
                            <td className="font-semibold text-slate-900">Total Milestone Expenditure Disbursed</td>
                            <td className="font-mono font-bold text-blue-800">₹ 3,812.50</td>
                            <td>Crore (PFMS CNA)</td>
                            <td>State Bank CNA Direct Bank Transfer</td>
                            <td><span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">Bank Reconciled</span></td>
                          </tr>
                          <tr>
                            <td className="font-semibold text-slate-900">Disbursal on Ongoing/Uncompleted Works</td>
                            <td className="font-mono font-bold text-amber-700">₹ 2,953.10</td>
                            <td>Crore (4,218 Works)</td>
                            <td>Intermediate Milestone Claims</td>
                            <td><span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">Requires Verification</span></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Program Context */}
                  <div className="p-4 bg-blue-50/60 rounded-md border border-blue-200 text-xs text-blue-950 space-y-1.5">
                    <div className="font-bold flex items-center gap-1.5 text-gov-navy">
                      <ShieldCheck className="w-4 h-4" />
                      <span>Statutory Governance Framework & Standard Scope</span>
                    </div>
                    <p>
                      This forensic audit evaluates all active parliamentary allocations across <strong>543 Lok Sabha</strong> constituencies and <strong>244 Rajya Sabha</strong> members. Under the <em>Revised MPLADS Guidelines 2023</em>, all central fund drawdowns occur strictly through the Single Nodal Account (SNA) / Central Nodal Account (CNA) architecture in compliance with Rule 230(8) of GFR 2017, eliminating intermediary suspense accounts.
                    </p>
                  </div>
                </div>
              )}

              {/* SECTION 2: FINANCIAL & PARLIAMENTARY ANALYSIS */}
              {activeSection === 'financial' && (
                <div className="space-y-5">
                  <h4 className="font-bold text-slate-900 text-sm uppercase tracking-wide flex items-center gap-1.5">
                    <BarChart2 className="w-4 h-4 text-gov-navy" />
                    <span>2. Financial Analysis: Parliamentary House-Wise Entitlements</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3.5 bg-slate-50 rounded border border-slate-200">
                      <span className="text-xs text-slate-500 font-medium">Total Parliament Allocation</span>
                      <div className="text-xl font-bold font-mono text-slate-900 mt-1">₹ 11,877.97 Cr</div>
                      <span className="text-[11px] text-slate-500">787 Members of Parliament</span>
                    </div>
                    <div className="p-3.5 bg-emerald-50 rounded border border-emerald-200">
                      <span className="text-xs text-emerald-800 font-medium">Recorded Expenditure</span>
                      <div className="text-xl font-bold font-mono text-emerald-800 mt-1">₹ 4,466.38 Cr</div>
                      <span className="text-[11px] text-emerald-700">37.60% National Utilization</span>
                    </div>
                    <div className="p-3.5 bg-blue-50 rounded border border-blue-200">
                      <span className="text-xs text-blue-800 font-medium">Unutilized Entitlement Balance</span>
                      <div className="text-xl font-bold font-mono text-blue-900 mt-1">₹ 7,411.59 Cr</div>
                      <span className="text-[11px] text-blue-700">Parked in Central Escrow</span>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left gov-table text-xs">
                      <thead>
                        <tr>
                          <th>Parliamentary Body</th>
                          <th>Members</th>
                          <th>Allocated Limit (₹ Cr)</th>
                          <th>Recorded Expenditure (₹ Cr)</th>
                          <th>Remaining Balance (₹ Cr)</th>
                          <th>Utilization %</th>
                          <th>Average Spend / MP (₹ Cr)</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="font-bold text-slate-900">Lok Sabha (18th House)</td>
                          <td>543</td>
                          <td className="font-mono">₹ 8,318.06</td>
                          <td className="font-mono text-emerald-800 font-bold">₹ 3,144.25</td>
                          <td className="font-mono">₹ 5,173.81</td>
                          <td><span className="font-mono font-bold text-amber-700">37.80%</span></td>
                          <td className="font-mono">₹ 5.79 Cr</td>
                        </tr>
                        <tr>
                          <td className="font-bold text-slate-900">Rajya Sabha (Biennial Cycle)</td>
                          <td>244</td>
                          <td className="font-mono">₹ 3,559.91</td>
                          <td className="font-mono text-emerald-800 font-bold">₹ 1,322.13</td>
                          <td className="font-mono">₹ 2,237.78</td>
                          <td><span className="font-mono font-bold text-amber-700">37.14%</span></td>
                          <td className="font-mono">₹ 5.42 Cr</td>
                        </tr>
                        <tr className="bg-slate-100/80 font-bold">
                          <td>Grand Consolidated Total</td>
                          <td>787</td>
                          <td className="font-mono">₹ 11,877.97</td>
                          <td className="font-mono text-emerald-800">₹ 4,466.38</td>
                          <td className="font-mono">₹ 7,411.59</td>
                          <td><span className="font-mono text-gov-navy">37.60%</span></td>
                          <td className="font-mono">₹ 5.68 Cr</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="p-3 bg-slate-50 rounded border border-slate-200 text-xs text-slate-600">
                    <strong>Formula:</strong> Fund Utilization (%) = (Recorded Expenditure / Allocated Limit) × 100. Benchmarked against 100% MoSPI e-SAKSHI Verified Allocation Registers.
                  </div>
                </div>
              )}

              {/* SECTION 3: AUDIT FINDINGS & RISK MATRIX */}
              {activeSection === 'findings' && (
                <div className="space-y-5">
                  <h4 className="font-bold text-slate-900 text-sm uppercase tracking-wide flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>3. Forensic Findings & Statutory Risk Assessment Matrix</span>
                  </h4>

                  {/* Finding 1 */}
                  <div className="p-4 bg-white rounded border border-amber-300 shadow-2xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-amber-900 bg-amber-100 px-2 py-0.5 rounded">Finding AUD-MPLADS-2026-F01</span>
                      <span className="text-xs font-bold text-rose-700">Critical Risk</span>
                    </div>
                    <h5 className="font-bold text-slate-900 text-sm">Disproportionate Milestone Disbursements Prior to Joint Physical Inspection</h5>
                    <p className="text-xs text-slate-600">
                      Out of ₹3,812.50 Cr total recorded expenditure, <strong>₹2,953.10 Cr</strong> has been released across 4,218 works currently classified as <em>In Progress</em>. Under GFR Rule 232, payments exceeding 75% require formal submission of interim physical verification and measurement book validation.
                    </p>
                    <div className="text-xs text-slate-500 pt-1 border-t border-slate-100">
                      <strong>Corrective Action:</strong> Mandate hard-stop gate on PFMS CNA gateway restricting final 25% payment until geo-tagged completion certificate is signed by Executive Engineer.
                    </div>
                  </div>

                  {/* Finding 2 */}
                  <div className="p-4 bg-white rounded border border-slate-200 shadow-2xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-blue-900 bg-blue-100 px-2 py-0.5 rounded">Finding AUD-MPLADS-2026-F02</span>
                      <span className="text-xs font-bold text-amber-700">High Risk</span>
                    </div>
                    <h5 className="font-bold text-slate-900 text-sm">District Authority Sanction SLA Turnaround Latency</h5>
                    <p className="text-xs text-slate-600">
                      17,112 recommended works totaling ₹28,656.62 Cr have experienced an average sanction lag of <strong>114 calendar days</strong>, exceeding the statutory 45-day SLA prescribed in Para 3.3 of the Revised MPLADS Guidelines.
                    </p>
                    <div className="text-xs text-slate-500 pt-1 border-t border-slate-100">
                      <strong>Corrective Action:</strong> Automatic escalation to State Chief Secretaries for recommendations exceeding 60 days without Administrative Sanction.
                    </div>
                  </div>

                  {/* Risk Matrix Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left gov-table text-xs">
                      <thead>
                        <tr>
                          <th>Risk ID</th>
                          <th>Risk Description</th>
                          <th>Category</th>
                          <th>Likelihood</th>
                          <th>Impact</th>
                          <th>Risk Level</th>
                          <th>Mitigation Mechanism</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="font-mono font-bold">RSK-01</td>
                          <td>Disbursal exceeding physical milestones</td>
                          <td>Financial Control</td>
                          <td>High</td>
                          <td>High</td>
                          <td><span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-800 border border-rose-200">CRITICAL</span></td>
                          <td>Automated PFMS 75% payment gate</td>
                        </tr>
                        <tr>
                          <td className="font-mono font-bold">RSK-02</td>
                          <td>Sanction backlog at District Authority</td>
                          <td>Administrative</td>
                          <td>High</td>
                          <td>Medium</td>
                          <td><span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">HIGH</span></td>
                          <td>45-day statutory escalation dashboard</td>
                        </tr>
                        <tr>
                          <td className="font-mono font-bold">RSK-03</td>
                          <td>Multi-district contractor overloading</td>
                          <td>Procurement</td>
                          <td>Medium</td>
                          <td>High</td>
                          <td><span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">HIGH</span></td>
                          <td>National contractor capacity limit index</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* SECTION 4: DISTRICT & VENDOR PERFORMANCE */}
              {activeSection === 'districts' && (
                <div className="space-y-5">
                  <h4 className="font-bold text-slate-900 text-sm uppercase tracking-wide flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-gov-navy" />
                    <span>4. District Execution Velocity & Vendor Workload Concentrations</span>
                  </h4>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left gov-table text-xs">
                      <thead>
                        <tr>
                          <th>District & State</th>
                          <th>Total Works</th>
                          <th>Sanctioned (₹ L)</th>
                          <th>Expenditure (₹ L)</th>
                          <th>Completed</th>
                          <th>Ongoing</th>
                          <th>Completion Rate</th>
                          <th>Audit Observation</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="font-bold text-slate-900">Thane, Maharashtra</td>
                          <td>71</td>
                          <td className="font-mono">₹ 1,470.00</td>
                          <td className="font-mono font-bold text-emerald-800">₹ 718.26</td>
                          <td>5</td>
                          <td>66</td>
                          <td><span className="font-bold text-amber-700">7.0%</span></td>
                          <td>High ongoing works concentration; regular voucher settlement</td>
                        </tr>
                        <tr>
                          <td className="font-bold text-slate-900">Hingoli, Maharashtra</td>
                          <td>52</td>
                          <td className="font-mono">₹ 1,470.00</td>
                          <td className="font-mono font-bold text-emerald-800">₹ 741.71</td>
                          <td>18</td>
                          <td>34</td>
                          <td><span className="font-bold text-emerald-700">34.6%</span></td>
                          <td>Balanced rural connectivity and paver block delivery</td>
                        </tr>
                        <tr>
                          <td className="font-bold text-slate-900">Baramulla, J&K</td>
                          <td>51</td>
                          <td className="font-mono">₹ 1,470.00</td>
                          <td className="font-mono font-bold text-emerald-800">₹ 279.25</td>
                          <td>13</td>
                          <td>38</td>
                          <td><span className="font-bold text-blue-700">25.5%</span></td>
                          <td>Seasonal working window limitations observed</td>
                        </tr>
                        <tr>
                          <td className="font-bold text-slate-900">Mumbai North West, MH</td>
                          <td>36</td>
                          <td className="font-mono">₹ 1,470.00</td>
                          <td className="font-mono font-bold text-emerald-800">₹ 538.46</td>
                          <td>12</td>
                          <td>24</td>
                          <td><span className="font-bold text-emerald-700">33.3%</span></td>
                          <td>Urban civic amenities with municipal corporation clearance</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="p-4 bg-slate-50 rounded border border-slate-200 space-y-2">
                    <h5 className="font-bold text-xs text-slate-900 uppercase">Vendor & Executing Agency Workload Analysis</h5>
                    <p className="text-xs text-slate-600">
                      State executing authorities such as <strong>District PWD Divisions</strong> and <strong>District Rural Development Agencies (DRDA)</strong> account for 86.4% of all public project implementations, with commercial contractors engaged primarily through open competitive e-tendering.
                    </p>
                  </div>
                </div>
              )}

              {/* SECTION 5: RECOMMENDATIONS & MANAGEMENT ACTION PLAN */}
              {activeSection === 'recommendations' && (
                <div className="space-y-5">
                  <h4 className="font-bold text-slate-900 text-sm uppercase tracking-wide flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                    <span>5. Corrective Recommendations & Management Action Plan</span>
                  </h4>

                  <div className="space-y-3">
                    <div className="p-3.5 bg-emerald-50/70 rounded border border-emerald-200">
                      <span className="font-bold text-xs text-emerald-900 block mb-1">A. Immediate Remedial Actions (0–30 Days)</span>
                      <ul className="list-disc list-inside text-xs text-slate-700 space-y-1">
                        <li>Deploy automated SMS and email notifications to District Collectors for pending recommendations exceeding 30 days.</li>
                        <li>Integrate PFMS hard-stop rule to restrict intermediate disbursal above 75% on uncertified assets.</li>
                      </ul>
                    </div>

                    <div className="p-3.5 bg-blue-50/70 rounded border border-blue-200">
                      <span className="font-bold text-xs text-blue-900 block mb-1">B. Medium-Term Improvements (1–3 Months)</span>
                      <ul className="list-disc list-inside text-xs text-slate-700 space-y-1">
                        <li>Mandate ISRO Bhuvan / PM GatiShakti geo-tagged photography for Stage-1 (Foundation) and Stage-2 (Completion).</li>
                        <li>Standardize digital Schedule of Rates (DSR) across all 36 States/UTs on the e-SAKSHI portal.</li>
                      </ul>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left gov-table text-xs">
                      <thead>
                        <tr>
                          <th>Finding Ref</th>
                          <th>Mandated Action</th>
                          <th>Responsible Authority</th>
                          <th>Target Date</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="font-mono font-bold">F01</td>
                          <td>75% Disbursal Milestone Gate in PFMS</td>
                          <td>MoSPI / PFMS CNA Wing</td>
                          <td>31 Oct 2026</td>
                          <td><span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">In Progress</span></td>
                        </tr>
                        <tr>
                          <td className="font-mono font-bold">F02</td>
                          <td>45-Day SLA Escalation to Chief Secretaries</td>
                          <td>State Planning Depts.</td>
                          <td>15 Nov 2026</td>
                          <td><span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">Scheduled</span></td>
                        </tr>
                        <tr>
                          <td className="font-mono font-bold">F03</td>
                          <td>Reconcile Biennial Rajya Sabha MP Roster</td>
                          <td>MoSPI Rajya Sabha Desk</td>
                          <td>15 Oct 2026</td>
                          <td><span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">Completed</span></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

            </div>

            {/* Modal Footer Controls */}
            <div className="bg-slate-100 px-5 py-3 border-t border-slate-200 flex items-center justify-between shrink-0 text-xs">
              <span className="text-slate-500 font-medium">
                Official Digital Audit Publication • National Programme Monitoring Division
              </span>
              <div className="flex space-x-2">
                <button
                  onClick={handlePrintOrDownload}
                  className="px-4 py-1.5 bg-gov-navy hover:bg-[#071f3d] text-white font-bold rounded flex items-center space-x-1 shadow-xs transition"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Full Audit Document (PDF)</span>
                </button>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 rounded hover:bg-slate-50 font-medium transition"
                >
                  Close
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default ReportsPage;
