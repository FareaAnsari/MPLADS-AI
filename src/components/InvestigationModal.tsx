import React, { useState } from 'react';
import { aiService, InvestigationSummary } from '../services/aiService';
import { SHOWCASE_PROJECT_ID } from '../data/mockData';
import { 
  X, 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle, 
  FileText, 
  Sliders, 
  Download, 
  Send, 
  Printer, 
  ArrowRight,
  Sparkles,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  UserCheck,
  CheckSquare,
  Bot,
  Volume2,
  VolumeX,
  Loader2
} from 'lucide-react';
import { groqAIService, GroqAuditResponse } from '../services/groqAIService';
import { elevenLabsService } from '../services/elevenLabsAudioService';

interface InvestigationModalProps {
  projectId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const InvestigationModal: React.FC<InvestigationModalProps> = ({ projectId, isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'evidence' | 'whatif' | 'report'>('overview');
  const [expandedFactor, setExpandedFactor] = useState<string | null>('Financial');
  const [officerFeedback, setOfficerFeedback] = useState<string | null>(null);
  const [officerNotes, setOfficerNotes] = useState<string>('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState<boolean>(false);
  
  // Interactive what-if simulation states
  const [simulateMaterial, setSimulateMaterial] = useState<boolean>(false);
  const [simulateProgress, setSimulateProgress] = useState<boolean>(false);
  const [simulateDocs, setSimulateDocs] = useState<boolean>(false);

  // Groq AI & ElevenLabs audio states
  const [groqAudit, setGroqAudit] = useState<GroqAuditResponse | null>(null);
  const [isAuditing, setIsAuditing] = useState<boolean>(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);

  if (!isOpen) return null;

  const summary = aiService.generateInvestigationSummary(projectId || SHOWCASE_PROJECT_ID);
  const project = aiService.getProjectById(projectId || SHOWCASE_PROJECT_ID);

  // Dynamic simulated score calculation based on toggles
  let currentSimScore = summary.overallRiskScore;
  if (simulateMaterial) currentSimScore -= 15;
  if (simulateProgress) currentSimScore -= 28;
  if (simulateDocs) currentSimScore -= 11;
  currentSimScore = Math.max(currentSimScore, 28);

  const handleFeedbackSubmit = () => {
    setFeedbackSubmitted(true);
  };

  const handlePrintMemo = () => {
    window.print();
  };

  const handleRunGroqAudit = async () => {
    setIsAuditing(true);
    try {
      const result = await groqAIService.generateRiskAudit({
        projectId: project?.id || projectId || 'PRJ-MH-2024-001',
        workName: project?.name || 'Solar Microgrid System & Battery Bank Installation',
        financialProgress: 74,
        physicalProgress: 43,
        satelliteDelta: 'InSAR indicates -31% discrepancy from claimed earthwork',
        contractorName: 'Apex Infrastructure Solutions Ltd',
        delayMonths: 9,
        sector: project?.category || 'Energy'
      });
      setGroqAudit(result);
    } finally {
      setIsAuditing(false);
    }
  };

  const handleToggleVoice = async () => {
    if (isPlayingAudio) {
      elevenLabsService.stop();
      setIsPlayingAudio(false);
    } else {
      const textToSpeak = groqAudit?.analysis || summary.explainableReasons.join('. ');
      setIsPlayingAudio(true);
      await elevenLabsService.speakText(textToSpeak, () => setIsPlayingAudio(false));
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-gov-lg shadow-2xl border border-slate-300 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Top Government Header Bar */}
        <div className="bg-[#0b2e59] text-white px-4 py-3 flex items-center justify-between border-b border-[#071f3d]">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 bg-rose-500 text-white rounded">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold tracking-tight">
                  AI Forensic Investigation Dossier
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-rose-600 text-white rounded uppercase tracking-wider">
                  HIGH RISK (82/100)
                </span>
                <span className="text-[10px] font-medium bg-blue-900 text-blue-200 px-2 py-0.5 rounded border border-blue-700">
                  Confidence: 91%
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Project Code: <span className="font-mono text-amber-300 font-bold">{summary.projectId}</span> • {summary.projectName} ({project?.district}, {project?.state})
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="text-slate-300 hover:text-white p-1 rounded hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Secondary Navigation Tabs */}
        <div className="bg-slate-100 border-b border-slate-200 px-4 py-1.5 flex items-center justify-between text-xs">
          <div className="flex space-x-1">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-1.5 rounded font-semibold transition ${
                activeTab === 'overview' 
                  ? 'bg-white text-gov-navy shadow-xs border border-slate-200' 
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              1. Lifecycle & Anomaly Diagnosis
            </button>
            <button
              onClick={() => setActiveTab('evidence')}
              className={`px-3 py-1.5 rounded font-semibold transition flex items-center space-x-1 ${
                activeTab === 'evidence' 
                  ? 'bg-white text-gov-navy shadow-xs border border-slate-200' 
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span>2. Evidentiary Audit Trail</span>
              <span className="w-4 h-4 rounded-full bg-rose-100 text-rose-700 text-[10px] font-bold flex items-center justify-center">
                {summary.evidentiaryRecords.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('whatif')}
              className={`px-3 py-1.5 rounded font-semibold transition flex items-center space-x-1 ${
                activeTab === 'whatif' 
                  ? 'bg-white text-gov-navy shadow-xs border border-slate-200' 
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Sliders className="w-3.5 h-3.5 text-purple-600" />
              <span>3. Risk What-If Simulation</span>
            </button>
            <button
              onClick={() => setActiveTab('report')}
              className={`px-3 py-1.5 rounded font-semibold transition flex items-center space-x-1 ${
                activeTab === 'report' 
                  ? 'bg-white text-gov-navy shadow-xs border border-slate-200' 
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-gov-blue" />
              <span>4. Official Investigation Report Memo</span>
            </button>
          </div>

          <div className="hidden sm:flex items-center text-[11px] text-slate-500">
            <span>Authorised Official Review Only</span>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#f8fafc]">
          
          {/* TAB 1: OVERVIEW & ANOMALY DIAGNOSIS */}
          {activeTab === 'overview' && (
            <div className="space-y-5">
              
              {/* Connected Lifecycle Graph Reconstruction */}
              <div className="bg-white p-4 rounded-gov border border-slate-200 shadow-xs">
                <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>Reconstructed Project Lifecycle Graph Chain</span>
                  <span className="text-slate-400 font-normal">Connected Multi-Entity Event Sequence</span>
                </div>

                <div className="flex items-center justify-between overflow-x-auto pb-2 scrollbar-none text-[11px]">
                  {[
                    { title: 'MP Rec', subtitle: '12 Aug 2025', state: 'done' },
                    { title: 'District Sanction', subtitle: '18 Oct 2025', state: 'done' },
                    { title: 'Tender Process', subtitle: '05 Nov 2025', state: 'done' },
                    { title: 'Contract Award', subtitle: '10 Dec 2025', state: 'done' },
                    { title: 'Work Execution', subtitle: '43% Verified', state: 'warning' },
                    { title: 'Invoices & Pay', subtitle: '74% Disbursed', state: 'alert' },
                    { title: 'Inspection & UC', subtitle: 'Pending', state: 'pending' },
                    { title: 'Asset Handover', subtitle: 'Pending', state: 'pending' },
                  ].map((step, idx, arr) => (
                    <React.Fragment key={step.title}>
                      <div className="flex flex-col items-center text-center min-w-[90px]">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-xs mb-1 ${
                          step.state === 'done' 
                            ? 'bg-emerald-600 text-white' 
                            : step.state === 'warning'
                            ? 'bg-amber-500 text-white ring-2 ring-amber-200'
                            : step.state === 'alert'
                            ? 'bg-rose-600 text-white ring-2 ring-rose-200 animate-pulse'
                            : 'bg-slate-200 text-slate-500'
                        }`}>
                          {step.state === 'done' ? '✓' : idx + 1}
                        </div>
                        <span className="font-bold text-slate-800 text-[10.5px] leading-tight">{step.title}</span>
                        <span className="text-[9.5px] text-slate-500">{step.subtitle}</span>
                      </div>
                      {idx < arr.length - 1 && (
                        <div className={`h-0.5 flex-1 min-w-[20px] mx-1 ${
                          idx < 4 ? 'bg-emerald-500' : idx === 4 ? 'bg-rose-400' : 'bg-slate-200'
                        }`}></div>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              {/* Core Score & High-Level Anomaly Alert Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Risk Score Summary */}
                <div className="bg-white p-4 rounded-gov border border-slate-200 shadow-xs flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                      Forensic Risk Score
                    </span>
                    <div className="flex items-baseline space-x-2 mt-1">
                      <span className="text-3xl font-black text-rose-600">82</span>
                      <span className="text-slate-400 font-semibold">/ 100</span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-1">
                      High composite risk based on financial mismatch, material price escalation, and contractor history.
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-100 flex justify-between text-xs">
                    <span className="text-slate-500">Confidence:</span>
                    <span className="font-bold text-emerald-700">91% High Confidence</span>
                  </div>
                </div>

                {/* Financial vs Physical Execution Mismatch */}
                <div className="bg-white p-4 rounded-gov border border-rose-200 shadow-xs bg-rose-50/20">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-rose-800 uppercase tracking-wider">
                      Progress Mismatch
                    </span>
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                  </div>
                  <div className="mt-2 space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Financial Disbursement:</span>
                      <span className="font-bold text-rose-700">74% (₹14.36 L)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Certified Physical Execution:</span>
                      <span className="font-bold text-slate-800">43% (MB Vol. 3)</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mt-1">
                      <div className="bg-rose-500 h-full" style={{ width: '74%' }}></div>
                    </div>
                    <p className="text-[10px] text-rose-600 font-medium mt-1">
                      Critical Variance: Funds drawn exceed certified site works by 31%.
                    </p>
                  </div>
                </div>

                {/* Material Price Variance */}
                <div className="bg-white p-4 rounded-gov border border-amber-200 shadow-xs bg-amber-50/20">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">
                      Material Price Deviation
                    </span>
                    <span className="text-xs font-black text-amber-700">+33.3%</span>
                  </div>
                  <div className="mt-2 space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Reported Rate (Cement):</span>
                      <span className="font-bold text-slate-900">₹520 / bag</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">District Benchmark (CSR):</span>
                      <span className="font-semibold text-emerald-700">₹390 / bag</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Vendor:</span>
                      <span className="font-medium text-slate-800">Shree Cement Suppliers</span>
                    </div>
                    <p className="text-[10px] text-amber-700 font-medium mt-1">
                      Deviation exceeds allowable 10% contingency window.
                    </p>
                  </div>
                </div>
              </div>

              {/* GROQ LLaMA-3.3-70B FORENSIC AUDIT & ELEVENLABS AUDIO SECTION */}
              <div className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-gov border border-indigo-500/30 p-4 text-white shadow-md">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
                  <div className="flex items-center space-x-2">
                    <div className="p-1.5 bg-indigo-500/20 text-indigo-300 rounded border border-indigo-400/30">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white tracking-wide uppercase flex items-center space-x-1.5">
                        <span>Statutory AI Audit Engine</span>
                        <span className="text-[10px] px-1.5 py-0.2 bg-indigo-500/30 text-indigo-200 rounded font-mono font-medium">
                          Groq LLaMA-3.3-70B
                        </span>
                      </h4>
                      <p className="text-[11px] text-slate-300">
                        Objective MoSPI forensic scrutiny, evidence reconciliation, and official audio readout.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={handleRunGroqAudit}
                      disabled={isAuditing}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded text-xs font-bold transition flex items-center space-x-1.5 shadow"
                    >
                      {isAuditing ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Auditing via Groq...</span>
                        </>
                      ) : (
                        <>
                          <Bot className="w-3.5 h-3.5" />
                          <span>Run Live Audit</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={handleToggleVoice}
                      className={`px-3 py-1.5 rounded text-xs font-bold transition flex items-center space-x-1.5 border ${
                        isPlayingAudio
                          ? 'bg-emerald-600 border-emerald-400 text-white animate-pulse'
                          : 'bg-white/10 hover:bg-white/20 border-white/20 text-white'
                      }`}
                    >
                      {isPlayingAudio ? (
                        <>
                          <VolumeX className="w-3.5 h-3.5" />
                          <span>Stop Briefing</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3.5 h-3.5" />
                          <span>ElevenLabs Voice</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {groqAudit && (
                  <div className="mt-3 pt-2 space-y-2.5 text-xs">
                    <div className="flex items-center justify-between text-[11px] text-indigo-300 border-b border-white/10 pb-1.5">
                      <span className="font-mono">Inference Time: {groqAudit.latencyMs} ms (High-Speed LPU)</span>
                      <span className="text-emerald-400 font-semibold">Statutory MoSPI Audit Formatted</span>
                    </div>

                    <div className="bg-black/30 rounded p-3 text-slate-200 leading-relaxed font-sans text-xs whitespace-pre-line border border-white/5">
                      {groqAudit.analysis}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px]">
                      <div className="bg-white/5 p-2 rounded border border-white/10">
                        <span className="font-bold text-amber-300 block mb-1">Key Forensic Evidence</span>
                        <ul className="list-disc list-inside space-y-0.5 text-slate-300">
                          {groqAudit.keyFindings.map((f, i) => (
                            <li key={i}>{f}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="bg-white/5 p-2 rounded border border-white/10">
                        <span className="font-bold text-emerald-300 block mb-1">Recommended Statutory Actions</span>
                        <ul className="list-disc list-inside space-y-0.5 text-slate-300">
                          {groqAudit.recommendedReviewActions.map((a, i) => (
                            <li key={i}>{a}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* WHY FLAGGED? Section (Explainable AI Evidentiary Breakdown) */}
              <div className="bg-white p-4 rounded-gov border border-slate-200 shadow-xs">
                <div className="flex items-center space-x-2 mb-3 pb-2 border-b border-slate-100">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  <h3 className="text-sm font-bold text-slate-800">
                    Explainable AI — Why Was This Project Flagged?
                  </h3>
                </div>

                <div className="space-y-2">
                  {summary.explainableReasons.map((reason, index) => (
                    <div 
                      key={index}
                      className="p-2.5 rounded bg-slate-50 border border-slate-200 flex items-start space-x-2.5 text-xs text-slate-800 hover:bg-blue-50/40 transition"
                    >
                      <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 font-bold text-[11px] flex items-center justify-center flex-shrink-0 mt-0.5">
                        {index + 1}
                      </span>
                      <div className="flex-1">
                        <span className="font-medium leading-relaxed">{reason}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Multi-Factor Risk Breakdown */}
              <div className="bg-white p-4 rounded-gov border border-slate-200 shadow-xs">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                  Analytical Risk Factor Decomposition
                </h4>
                <div className="space-y-3">
                  {summary.primaryRiskFactors.map((factor) => (
                    <div key={factor.category} className="border border-slate-200 rounded p-2.5 bg-slate-50/50 text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-slate-900">{factor.category} Risk</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] text-slate-500">Weight: {(factor.weight * 100)}%</span>
                          <span className="font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                            Score: {factor.score}/100
                          </span>
                        </div>
                      </div>
                      <p className="text-slate-600 text-[11px]">{factor.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommended Verification Steps */}
              <div className="bg-blue-50/60 p-4 rounded-gov border border-blue-200">
                <h4 className="text-xs font-bold text-gov-navy uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                  <CheckSquare className="w-4 h-4 text-gov-blue" />
                  <span>Recommended Administrative Verification Steps</span>
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-700 list-disc list-inside">
                  {summary.recommendedActions.map((action, idx) => (
                    <li key={idx} className="leading-snug">{action}</li>
                  ))}
                </ul>
              </div>

            </div>
          )}

          {/* TAB 2: EVIDENTIARY AUDIT TRAIL */}
          {activeTab === 'evidence' && (
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-gov border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">
                      Primary Documentary Records & Audit Trail
                    </h3>
                    <p className="text-xs text-slate-500">
                      Every AI alert is mapped directly to government database entries, measurement books, and vouchers.
                    </p>
                  </div>
                  <span className="text-xs font-semibold px-2 py-1 bg-slate-100 rounded text-slate-600">
                    5 Flagged Documents
                  </span>
                </div>

                <div className="divide-y divide-slate-100">
                  {summary.evidentiaryRecords.map((rec, i) => (
                    <div key={i} className="py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-slate-50 p-2 rounded transition">
                      <div className="flex items-start space-x-3">
                        <div className="p-2 rounded bg-slate-100 text-slate-700 mt-1">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-slate-900 text-xs">{rec.title}</span>
                            <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                              rec.status === 'FLAGGED' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                            }`}>
                              {rec.status}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 mt-0.5">
                            <span className="font-semibold text-slate-700">Audit Finding:</span> {rec.finding}
                          </p>
                          <span className="text-[10px] font-mono text-slate-400 block mt-0.5">
                            Reference Ref: {rec.refNo} • {rec.type}
                          </span>
                        </div>
                      </div>

                      <button 
                        onClick={() => alert(`Opening official archival copy of ${rec.title} [Ref: ${rec.refNo}] for scrutiny.`)}
                        className="px-2.5 py-1 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-medium rounded flex items-center space-x-1 shadow-xs whitespace-nowrap"
                      >
                        <ExternalLink className="w-3 h-3 text-slate-500" />
                        <span>Inspect Record</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Material Benchmark Comparative Table */}
              <div className="bg-white p-4 rounded-gov border border-slate-200 shadow-xs">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Material Price Schedule vs. Invoiced Rates
                </h4>
                <table className="w-full text-left gov-table">
                  <thead>
                    <tr>
                      <th>Material Item</th>
                      <th>Quantity</th>
                      <th>Reported Invoice Unit Price</th>
                      <th>District SOR Benchmark</th>
                      <th>Deviation %</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="font-bold text-slate-900">Portland Cement (50kg Bag)</td>
                      <td>1,000 Bags</td>
                      <td className="font-bold text-rose-700">₹ 520.00</td>
                      <td className="font-semibold text-emerald-700">₹ 390.00</td>
                      <td className="font-black text-rose-700">+33.3%</td>
                      <td><span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">High Variance</span></td>
                    </tr>
                    <tr>
                      <td className="font-bold text-slate-900">TMT Fe550D Steel Bars</td>
                      <td>12 MT</td>
                      <td>₹ 68,500 / MT</td>
                      <td>₹ 64,200 / MT</td>
                      <td className="text-emerald-700">+6.7%</td>
                      <td><span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">Normal Range</span></td>
                    </tr>
                    <tr>
                      <td className="font-bold text-slate-900">River / M-Sand</td>
                      <td>180 Brass</td>
                      <td>₹ 4,800 / Brass</td>
                      <td>₹ 4,200 / Brass</td>
                      <td className="text-amber-700">+14.3%</td>
                      <td><span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">Marginal</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: COUNTERFACTUAL WHAT-IF SIMULATION */}
          {activeTab === 'whatif' && (
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-gov border border-slate-200 shadow-xs">
                <div className="flex items-center space-x-2 mb-2 pb-2 border-b border-slate-100">
                  <Sliders className="w-4 h-4 text-purple-600" />
                  <h3 className="text-sm font-bold text-slate-800">
                    Decision-Support Counterfactual Risk Simulator
                  </h3>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Evaluate which corrective administrative interventions will most effectively reduce project risk and restore accountability.
                  Toggle simulations below to observe dynamic risk score projection:
                </p>

                {/* Score Projection Card */}
                <div className="my-4 p-4 rounded-lg bg-gradient-to-r from-slate-900 via-[#0b2e59] to-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <span className="text-xs text-slate-300 font-medium">Original Baseline Risk:</span>
                    <div className="text-2xl font-bold text-rose-400">82 / 100 (HIGH RISK)</div>
                  </div>

                  <div className="text-center">
                    <span className="text-xs text-slate-300 font-medium">Dynamic Simulated Projection:</span>
                    <div className={`text-3xl font-black ${
                      currentSimScore <= 50 ? 'text-emerald-400' : currentSimScore <= 70 ? 'text-amber-400' : 'text-rose-400'
                    }`}>
                      {currentSimScore} / 100
                    </div>
                  </div>

                  <div className="text-right text-xs">
                    <span className="text-slate-300">Reduction:</span>
                    <div className="text-lg font-bold text-emerald-300">
                      -{82 - currentSimScore} Points
                    </div>
                  </div>
                </div>

                {/* Interactive Toggles */}
                <div className="space-y-3">
                  <div className="p-3 rounded border border-slate-200 bg-slate-50 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">
                        Intervention 1: Resolve Material Price Anomaly
                      </span>
                      <span className="text-[11px] text-slate-600">
                        Contractor provides manufacturer purchase vouchers or adjusts price back to Schedule of Rates (SOR ₹390).
                      </span>
                    </div>
                    <button
                      onClick={() => setSimulateMaterial(!simulateMaterial)}
                      className={`px-3 py-1.5 rounded text-xs font-bold transition ${
                        simulateMaterial 
                          ? 'bg-emerald-600 text-white' 
                          : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {simulateMaterial ? 'Simulated ✓ (Risk → -15)' : 'Simulate Fix'}
                    </button>
                  </div>

                  <div className="p-3 rounded border border-slate-200 bg-slate-50 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">
                        Intervention 2: Verified Physical Execution Reaches 60% Parity
                      </span>
                      <span className="text-[11px] text-slate-600">
                        Site inspection certifies column superstructure and masonry, closing the 31% disbursement gap.
                      </span>
                    </div>
                    <button
                      onClick={() => setSimulateProgress(!simulateProgress)}
                      className={`px-3 py-1.5 rounded text-xs font-bold transition ${
                        simulateProgress 
                          ? 'bg-emerald-600 text-white' 
                          : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {simulateProgress ? 'Simulated ✓ (Risk → -28)' : 'Simulate Progress'}
                    </button>
                  </div>

                  <div className="p-3 rounded border border-slate-200 bg-slate-50 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">
                        Intervention 3: Reconciliation of Measurement Book & Vouchers
                      </span>
                      <span className="text-[11px] text-slate-600">
                        Quality Control Wing reconciles intermediate bills with treasury records.
                      </span>
                    </div>
                    <button
                      onClick={() => setSimulateDocs(!simulateDocs)}
                      className={`px-3 py-1.5 rounded text-xs font-bold transition ${
                        simulateDocs 
                          ? 'bg-emerald-600 text-white' 
                          : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {simulateDocs ? 'Simulated ✓ (Risk → -11)' : 'Simulate Audit'}
                    </button>
                  </div>
                </div>

                <div className="mt-4 p-2 bg-amber-50 rounded border border-amber-200 text-[10px] text-amber-800">
                  <strong>Notice:</strong> Decision-support simulation model — provides investigative triage priority, not an automatic administrative determination.
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: OFFICIAL INVESTIGATION REPORT MEMO */}
          {activeTab === 'report' && (
            <div className="space-y-4">
              {/* Printable Official Government of India Memorandum */}
              <div id="investigation-memo" className="bg-white p-6 sm:p-8 rounded border border-slate-300 shadow-md font-serif text-slate-900 text-xs leading-relaxed">
                
                {/* Official Letterhead */}
                <div className="text-center border-b-2 border-slate-800 pb-4 mb-4">
                  <p className="font-bold text-xs uppercase tracking-wider text-slate-800">भारत सरकार / Government of India</p>
                  <p className="font-bold text-sm uppercase text-[#0b2e59]">सांख्यिकी एवं कार्यक्रम कार्यान्वयन मंत्रालय</p>
                  <p className="font-semibold text-xs text-slate-700">Ministry of Statistics & Programme Implementation</p>
                  <p className="text-[11px] text-slate-600">Members of Parliament Local Area Development Scheme (MPLADS) Division</p>
                  <p className="text-[10px] text-slate-500 mt-1">Sardar Patel Bhavan, Sansad Marg, New Delhi - 110001</p>
                </div>

                {/* Memo Metadata */}
                <div className="flex justify-between items-start text-[11px] font-sans mb-4 border-b border-slate-200 pb-2">
                  <div>
                    <p><strong>Memo No.:</strong> MoSPI/MPLADS/2026/INV-1452</p>
                    <p><strong>District:</strong> Pune, Maharashtra</p>
                    <p><strong>Hon'ble MP:</strong> Shri A. Khan (Pune Lok Sabha)</p>
                  </div>
                  <div className="text-right">
                    <p><strong>Date:</strong> 14 September 2026</p>
                    <p><strong>Classification:</strong> OFFICIAL / CONFIDENTIAL</p>
                    <p><strong>AI Risk Engine Assessment:</strong> HIGH RISK (82/100)</p>
                  </div>
                </div>

                {/* Memo Body */}
                <div className="space-y-3 font-sans text-xs">
                  <div className="font-bold text-sm text-gov-navy border-b border-slate-200 pb-1">
                    SUBJECT: PRELIMINARY FORENSIC SCRUTINY & INSPECTION DIRECTIVE — WORK CODE {summary.projectId}
                  </div>

                  <p>
                    1. <strong>Project Particulars:</strong> Construction of Community Hall at Wagholi, Haveli Block, District Pune. Sanctioned Amount: ₹20,00,000/-; Contract Value: ₹19,40,000/- awarded to M/s ABC Infrastructure Pvt. Ltd. (Registration No. PWD/CLASS1/2018/1442).
                  </p>

                  <p>
                    2. <strong>AI Forensic Intelligence Findings:</strong>
                    Automated multi-record consistency audits across Public Financial Management, E-Tendering, and Measurement Book databases flagged significant anomalies:
                  </p>
                  <ul className="list-disc list-inside pl-3 space-y-1 text-slate-800">
                    <li><strong>Disbursement-Progress Disparity:</strong> 74% cumulative expenditure disbursed against verified physical progress of only 43%.</li>
                    <li><strong>Material Rate Deviation:</strong> Cement procurements invoiced at ₹520/bag against district SOR of ₹390/bag (+33.3%).</li>
                    <li><strong>Contractor Delay History:</strong> Executing firm has 5 concurrent delayed assignments across regional divisions.</li>
                    <li><strong>Timeline Overrun:</strong> Predictive milestone engine projects a 27-day delay in structural completion.</li>
                  </ul>

                  <p>
                    3. <strong>Immediate Directive:</strong>
                    The District Authority, Pune is requested to initiate joint on-site physical measurement through the Superintending Engineer (QC) and keep further interim contractor payments in abeyance until reconciliation.
                  </p>

                  <div className="pt-6 mt-6 border-t border-slate-300 flex justify-between items-end font-sans">
                    <div>
                      <p className="text-[10px] text-slate-500">Electronically generated via MPLADS AI Portal</p>
                      <p className="text-[9px] text-slate-400">Digital Hash: 8F2A90C1-B733-4D90-E561</p>
                    </div>
                    <div className="text-right">
                      <div className="w-32 border-b border-slate-700 mb-1"></div>
                      <p className="font-bold text-xs text-slate-800">Farea Ansari</p>
                      <p className="text-[10px] text-slate-600">District Authority / Investigating Officer</p>
                      <p className="text-[10px] text-slate-500">Government of Maharashtra</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-200 flex justify-end space-x-2">
                  <button
                    onClick={handlePrintMemo}
                    className="px-3 py-1.5 bg-gov-navy text-white text-xs font-bold rounded flex items-center space-x-1 hover:bg-[#071f3d]"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print / Save as PDF</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Human-in-the-Loop Feedback Section */}
          <div className="mt-6 p-4 bg-white rounded-gov border border-slate-200 shadow-xs">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
              <UserCheck className="w-4 h-4 text-gov-blue" />
              <span>Human-in-the-Loop Officer Determination & Feedback</span>
            </h4>

            {feedbackSubmitted ? (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded text-emerald-800 text-xs flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>Officer determination recorded successfully. Case status updated in central MoSPI audit registry.</span>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="text-xs text-slate-600">
                  Please classify this AI-detected anomaly based on preliminary documentary scrutiny:
                </div>
                <div className="flex flex-wrap gap-2 text-xs font-medium">
                  {[
                    { id: 'CONFIRMED', label: 'Confirmed Irregularity (Initiate Formal Inquiry)', color: 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100' },
                    { id: 'REQUIRES_FIELD', label: 'Requires Field Physical Verification', color: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100' },
                    { id: 'FALSE_POSITIVE', label: 'Justified Variance / False Positive', color: 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200' },
                    { id: 'INSUFFICIENT_DATA', label: 'Insufficient Records (Call for Explanation)', color: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100' },
                  ].map(btn => (
                    <button
                      key={btn.id}
                      onClick={() => setOfficerFeedback(btn.id)}
                      className={`px-3 py-1.5 rounded border transition ${btn.color} ${
                        officerFeedback === btn.id ? 'ring-2 ring-gov-navy font-bold shadow-xs' : ''
                      }`}
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>

                <div className="pt-2">
                  <textarea
                    rows={2}
                    value={officerNotes}
                    onChange={(e) => setOfficerNotes(e.target.value)}
                    placeholder="Enter official remarks, directives issued to implementing agency, or reference inspection file number..."
                    className="w-full text-xs p-2 rounded border border-slate-300 focus:outline-none focus:ring-1 focus:ring-gov-navy"
                  ></textarea>
                </div>

                <div className="flex justify-end">
                  <button
                    disabled={!officerFeedback}
                    onClick={handleFeedbackSubmit}
                    className="px-4 py-1.5 bg-gov-navy hover:bg-[#071f3d] disabled:opacity-50 text-white text-xs font-bold rounded flex items-center space-x-1.5 transition"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Official Decision</span>
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Modal Bottom Footer Actions */}
        <div className="bg-slate-100 px-4 py-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="text-slate-500 text-[11px]">
            AI Forensic Evidence System • Statutory Compliance with MPLADS 2023 Guidelines
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveTab('report')}
              className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold rounded shadow-xs"
            >
              Generate Investigation Report
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded"
            >
              Close Dossier
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
