import React, { useState, useEffect } from 'react';
import { aiService, InvestigationSummary, PeerComparisonData } from '../services/aiService';
import { SHOWCASE_PROJECT_ID } from '../data/mockData';
import { 
  X, 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle, 
  FileText, 
  Sliders, 
  Send, 
  Sparkles, 
  ExternalLink, 
  UserCheck, 
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
  const [loading, setLoading] = useState<boolean>(true);
  const [summary, setSummary] = useState<InvestigationSummary | null>(null);
  const [peerData, setPeerData] = useState<PeerComparisonData | null>(null);
  
  // Officer feedback & decision states
  const [officerFeedback, setOfficerFeedback] = useState<string | null>(null);
  const [officerNotes, setOfficerNotes] = useState<string>('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState<boolean>(false);
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState<boolean>(false);
  const [savedDecisionDetails, setSavedDecisionDetails] = useState<any>(null);

  // Interactive what-if simulation states
  const [simulateMaterial, setSimulateMaterial] = useState<boolean>(false);
  const [simulateProgress, setSimulateProgress] = useState<boolean>(false);
  const [simulateDocs, setSimulateDocs] = useState<boolean>(false);

  // Groq AI & ElevenLabs audio states
  const [groqAudit, setGroqAudit] = useState<GroqAuditResponse | null>(null);
  const [isAuditing, setIsAuditing] = useState<boolean>(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);

  const targetId = projectId || SHOWCASE_PROJECT_ID;
  const project = aiService.getProjectById(targetId);

  // Fetch live risk assessment, peer statistics, and officer decision on open
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setLoading(true);

    Promise.all([
      aiService.fetchInvestigationSummary(targetId).catch(err => {
        console.warn('Failed to load risk assessment:', err);
        return null;
      }),
      aiService.fetchPeerComparison(targetId).catch(err => {
        console.warn('Failed to load peer comparison:', err);
        return null;
      }),
      aiService.fetchOfficerDecisions(targetId).catch(err => {
        console.warn('Failed to load officer decisions:', err);
        return null;
      })
    ]).then(([sumData, pData, decData]) => {
      if (!isMounted) return;

      if (sumData) setSummary(sumData);
      if (pData) setPeerData(pData);

      if (decData && decData.latestDecision) {
        setFeedbackSubmitted(true);
        setOfficerFeedback(decData.latestDecision.decision);
        setOfficerNotes(decData.latestDecision.notes);
        setSavedDecisionDetails(decData.latestDecision);
      } else if (sumData?.latestOfficerDecision) {
        setFeedbackSubmitted(true);
        setOfficerFeedback(sumData.latestOfficerDecision.decision);
        setOfficerNotes(sumData.latestOfficerDecision.notes);
        setSavedDecisionDetails(sumData.latestOfficerDecision);
      } else {
        setFeedbackSubmitted(false);
        setOfficerFeedback(null);
        setOfficerNotes('');
        setSavedDecisionDetails(null);
      }

      setLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, [isOpen, targetId]);

  if (!isOpen) return null;

  // Dynamic simulated score calculation based on live base risk score
  const baseRisk = summary?.overallRiskScore ?? 20;
  let currentSimScore = baseRisk;
  if (simulateMaterial) currentSimScore -= Math.round(baseRisk * 0.20);
  if (simulateProgress) currentSimScore -= Math.round(baseRisk * 0.35);
  if (simulateDocs) currentSimScore -= Math.round(baseRisk * 0.15);
  currentSimScore = Math.max(Math.round(currentSimScore), 8);

  const handleFeedbackSubmit = async () => {
    if (!officerFeedback) return;
    setIsSubmittingFeedback(true);
    try {
      const res = await aiService.submitOfficerDecision(
        targetId,
        officerFeedback,
        officerNotes || 'Official decision confirmed by District Planning Officer',
        'OFFICER-001',
        'District Planning Officer'
      );
      setFeedbackSubmitted(true);
      setSavedDecisionDetails(res.decision);
    } catch (err) {
      console.error('Failed to submit decision:', err);
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  const handlePrintMemo = () => {
    window.print();
  };

  const handleRunGroqAudit = async () => {
    setIsAuditing(true);
    try {
      const result = await groqAIService.generateRiskAudit({
        projectId: summary?.projectId || project?.id || targetId,
        workName: summary?.projectName || project?.name || 'Developmental Civic Infrastructure',
        financialProgress: project?.financialProgress || 100,
        physicalProgress: project?.physicalProgress || 100,
        satelliteDelta: summary?.severity === 'HIGH' || summary?.severity === 'CRITICAL' ? 'Execution timeline variance flagged vs district peer band' : 'No discrepancy recorded',
        contractorName: project?.contractorName || 'District Implementing Agency',
        delayMonths: project?.predictedDelayDays ? Math.round(project.predictedDelayDays / 30) : 0,
        sector: project?.category || summary?.state || 'Civil Infrastructure'
      });
      setGroqAudit(result);
    } catch (err) {
      console.error('Groq audit failed:', err);
    } finally {
      setIsAuditing(false);
    }
  };

  const handleToggleVoice = async () => {
    if (isPlayingAudio) {
      elevenLabsService.stop();
      setIsPlayingAudio(false);
    } else {
      const textToSpeak = groqAudit?.analysis || summary?.explainableReasons.join('. ') || 'Risk assessment complete.';
      setIsPlayingAudio(true);
      await elevenLabsService.speakText(textToSpeak, () => setIsPlayingAudio(false));
    }
  };

  const riskScoreVal = summary?.overallRiskScore ?? 0;
  const severityTier = summary?.severity ?? 'LOW';
  const confidenceVal = Math.round((summary?.confidenceScore ?? 0.92) * 100);

  const costVariancePct = peerData?.deviation.costVariancePercentage ?? 0;
  const peerMedianAmt = peerData?.peerStats.median ?? 0;

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
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                  severityTier === 'CRITICAL' || severityTier === 'HIGH' ? 'bg-rose-600 text-white' :
                  severityTier === 'MEDIUM' ? 'bg-amber-600 text-white' : 'bg-emerald-600 text-white'
                }`}>
                  {severityTier} RISK ({riskScoreVal.toFixed(1)}/100)
                </span>
                <span className="text-[10px] font-medium bg-blue-900 text-blue-200 px-2 py-0.5 rounded border border-blue-700">
                  Confidence: {confidenceVal}%
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Project Code: <span className="font-mono text-amber-300 font-bold">{summary?.projectId || targetId}</span> • {summary?.projectName || project?.name} ({summary?.district || project?.district}, {summary?.state || project?.state})
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
              className={`px-3 py-1.5 rounded font-semibold transition ${
                activeTab === 'evidence' 
                  ? 'bg-white text-gov-navy shadow-xs border border-slate-200' 
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              2. Evidentiary Records & Price Schedule
            </button>
            <button
              onClick={() => setActiveTab('whatif')}
              className={`px-3 py-1.5 rounded font-semibold transition ${
                activeTab === 'whatif' 
                  ? 'bg-white text-gov-navy shadow-xs border border-slate-200' 
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              3. Counterfactual Risk Simulator
            </button>
            <button
              onClick={() => setActiveTab('report')}
              className={`px-3 py-1.5 rounded font-semibold transition ${
                activeTab === 'report' 
                  ? 'bg-white text-gov-navy shadow-xs border border-slate-200' 
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              4. Official Audit Memorandum
            </button>
          </div>

          {activeTab === 'report' && (
            <button
              onClick={handlePrintMemo}
              className="px-2.5 py-1 bg-gov-navy text-white rounded font-bold hover:bg-[#071f3d] flex items-center space-x-1 text-xs transition"
            >
              <span>Print Memo</span>
            </button>
          )}
        </div>

        {/* Modal Main Content Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-slate-50">

          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-3">
              <Loader2 className="w-8 h-8 text-gov-navy animate-spin" />
              <p className="text-xs font-bold text-slate-600">Connecting to AI Risk Engine & Computing Cohort Peer Benchmarks...</p>
            </div>
          ) : null}

          {/* TAB 1: OVERVIEW & ANOMALY DIAGNOSIS */}
          {!loading && activeTab === 'overview' && summary && (
            <div className="space-y-4">
              
              {/* Connected Lifecycle Graph Reconstruction */}
              <div className="bg-white p-4 rounded-gov border border-slate-200 shadow-xs">
                <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>Reconstructed Project Lifecycle Graph Chain</span>
                  <span className="text-slate-400 font-normal">Connected Multi-Entity Event Sequence</span>
                </div>

                <div className="flex items-center justify-between overflow-x-auto pb-2 scrollbar-none text-[11px]">
                  {[
                    { title: 'MP Rec', subtitle: summary.mpName.split(' ')[0], state: 'done' },
                    { title: 'District Sanction', subtitle: summary.district.split('(')[0], state: 'done' },
                    { title: 'Tender Process', subtitle: 'e-Tendered', state: 'done' },
                    { title: 'Contract Award', subtitle: 'Awarded', state: 'done' },
                    { title: 'Work Execution', subtitle: '100% Certified', state: 'done' },
                    { title: 'Disbursement', subtitle: `₹${(summary.disbursedAmountInr / 100000).toFixed(1)} Lakhs`, state: riskScoreVal > 50 ? 'alert' : 'done' },
                    { title: 'Field Inspection', subtitle: summary.explainableReasons.some(r => r.includes('pending')) ? 'Pending Upload' : 'Verified', state: summary.explainableReasons.some(r => r.includes('pending')) ? 'warning' : 'done' },
                    { title: 'Asset Handover', subtitle: 'Completed', state: 'done' },
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
                          step.state === 'done' ? 'bg-emerald-500' : 'bg-slate-200'
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
                      <span className={`text-3xl font-black ${
                        riskScoreVal >= 70 ? 'text-rose-600' : riskScoreVal >= 40 ? 'text-amber-600' : 'text-emerald-700'
                      }`}>{riskScoreVal.toFixed(1)}</span>
                      <span className="text-slate-400 font-semibold">/ 100</span>
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                        severityTier === 'CRITICAL' || severityTier === 'HIGH' ? 'bg-rose-100 text-rose-800' :
                        severityTier === 'MEDIUM' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {severityTier}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-1">
                      Additive composite risk calculated live from peer cost anomaly ({summary.componentBreakdown.cost_anomaly.toFixed(1)} pts), timeline delay ({summary.componentBreakdown.delay_anomaly.toFixed(1)} pts), and fiscal pattern ({summary.componentBreakdown.payment_pattern.toFixed(1)} pts).
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-100 flex justify-between text-xs">
                    <span className="text-slate-500">Confidence:</span>
                    <span className="font-bold text-emerald-700">{confidenceVal}% High Confidence</span>
                  </div>
                </div>

                {/* Peer Cohort Cost Variance */}
                <div className="bg-white p-4 rounded-gov border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gov-navy uppercase tracking-wider">
                      Peer Cohort Cost Variance
                    </span>
                    <AlertTriangle className={`w-4 h-4 ${costVariancePct > 20 ? 'text-rose-600' : 'text-emerald-600'}`} />
                  </div>
                  <div className="mt-2 space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Disbursed Amount:</span>
                      <span className="font-bold text-slate-900">₹ {(summary.disbursedAmountInr).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">{summary.state} Peer Median:</span>
                      <span className="font-bold text-slate-800">₹ {(peerMedianAmt).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Cohort Sample:</span>
                      <span className="font-semibold text-slate-700">{peerData?.peerStats.count || 0} Peer Works</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mt-1">
                      <div 
                        className={`h-full ${costVariancePct > 20 ? 'bg-rose-500' : 'bg-emerald-500'}`}
                        style={{ width: `${Math.min(100, Math.max(10, (summary.disbursedAmountInr / (peerMedianAmt || 1)) * 50))}%` }}
                      ></div>
                    </div>
                    <p className={`text-[10px] font-medium mt-1 ${costVariancePct > 20 ? 'text-rose-600' : 'text-emerald-700'}`}>
                      Variance: {costVariancePct > 0 ? '+' : ''}{costVariancePct.toFixed(1)}% vs State Peer Band (Z-Score: {peerData?.deviation.zScore.toFixed(2)}).
                    </p>
                  </div>
                </div>

                {/* Material Price Variance */}
                <div className="bg-white p-4 rounded-gov border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gov-navy uppercase tracking-wider">
                      Schedule of Rates Benchmark
                    </span>
                    <span className="text-xs font-black text-slate-700">{summary.state} CSR</span>
                  </div>
                  <div className="mt-2 space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Top Benchmark:</span>
                      <span className="font-bold text-slate-900">{peerData?.materialBenchmarks[0]?.materialName.split('(')[0] || 'Portland Cement'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">District SOR Baseline:</span>
                      <span className="font-semibold text-emerald-700">₹ {peerData?.materialBenchmarks[0]?.districtSorBenchmark || 390}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Reported Unit Rate:</span>
                      <span className="font-bold text-slate-800">₹ {peerData?.materialBenchmarks[0]?.reportedInvoiceUnitPrice || 420}</span>
                    </div>
                    <p className="text-[10px] text-slate-600 font-medium mt-1">
                      {summary.state} Public Works Department Schedule of Rates applied.
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
                          {groqAudit?.modelUsed || 'Groq / Gemini AI'}
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
                          <span>Auditing via AI...</span>
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
                      <span className="font-mono">Inference Time: {groqAudit.latencyMs} ms ({groqAudit.modelUsed || 'AI Engine'})</span>
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

              {/* STEP 2.2: EXPLAINABLE AI EVIDENTIARY BREAKDOWN (100% Dynamic from Backend API) */}
              <div className="bg-white p-4 rounded-gov border border-slate-200 shadow-xs">
                <div className="flex items-center space-x-2 mb-3 pb-2 border-b border-slate-100">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  <h3 className="text-sm font-bold text-slate-800">
                    Explainable AI — Live Factor Breakdown for Project {summary.projectId}
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
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-slate-900">{factor.category} Vector</span>
                          <span className="text-[10px] text-slate-500 font-mono">Weight: {Math.round(factor.weight * 100)}%</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`font-bold ${
                            factor.score >= 70 ? 'text-rose-700' : factor.score >= 40 ? 'text-amber-700' : 'text-emerald-700'
                          }`}>
                            Score: {factor.score} / 100
                          </span>
                        </div>
                      </div>
                      <p className="text-slate-600 text-[11px] leading-relaxed">
                        {factor.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* STEP 3.2: Human-in-the-Loop Officer Determination & Feedback (Persisted to Database) */}
              <div className="bg-white p-4 rounded-gov border border-slate-200 shadow-xs">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                  <UserCheck className="w-4 h-4 text-gov-blue" />
                  <span>District Nodal Officer Statutory Decision & Feedback</span>
                </h4>

                {feedbackSubmitted && savedDecisionDetails ? (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded text-emerald-800 text-xs space-y-1.5">
                    <div className="flex items-center space-x-2 font-bold text-emerald-900">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                      <span>Decision Persisted in Central Database: <span className="font-mono bg-emerald-200 px-1.5 py-0.5 rounded">{savedDecisionDetails.decision}</span></span>
                    </div>
                    <p className="text-[11px] text-emerald-800">
                      <strong>Remarks:</strong> {savedDecisionDetails.notes}
                    </p>
                    <p className="text-[10px] text-emerald-700">
                      Officer: {savedDecisionDetails.officer_name || savedDecisionDetails.officer_id} • Timestamp: {savedDecisionDetails.timestamp}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="text-xs text-slate-600">
                      Record statutory officer determination on this project dossier:
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs font-medium">
                      {[
                        { id: 'CONFIRM_ISSUE', label: 'Confirm Issue (Initiate Formal Inquiry)', color: 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100' },
                        { id: 'REQUIRES_FIELD', label: 'Requires Field Physical Verification', color: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100' },
                        { id: 'FALSE_ALARM', label: 'Justified Variance / False Alarm', color: 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200' },
                        { id: 'REQUEST_MORE_EVIDENCE', label: 'Request Additional Evidence (Issue Notice)', color: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100' },
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
                        disabled={!officerFeedback || isSubmittingFeedback}
                        onClick={handleFeedbackSubmit}
                        className="px-4 py-1.5 bg-gov-navy hover:bg-[#071f3d] disabled:opacity-50 text-white text-xs font-bold rounded flex items-center space-x-1.5 transition"
                      >
                        {isSubmittingFeedback ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Persisting to Database...</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-3.5 h-3.5" />
                            <span>Submit Official Decision</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 2: EVIDENTIARY RECORDS & MATERIAL COMPARATIVE TABLE */}
          {!loading && activeTab === 'evidence' && summary && (
            <div className="space-y-4">
              {/* Primary Evidentiary Dossier Records */}
              <div className="bg-white p-4 rounded-gov border border-slate-200 shadow-xs">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                  Canonical Evidence Registry for Project {summary.projectId}
                </h4>

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
                            Reference: {rec.refNo} • {rec.type}
                          </span>
                        </div>
                      </div>

                      <button 
                        onClick={() => alert(`Official Record Scrutiny: ${rec.title}\nRef: ${rec.refNo}\nFinding: ${rec.finding}`)}
                        className="px-2.5 py-1 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-medium rounded flex items-center space-x-1 shadow-xs whitespace-nowrap"
                      >
                        <ExternalLink className="w-3 h-3 text-slate-500" />
                        <span>Inspect Record</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* STEP 2.3: Dynamic Material Benchmark Comparative Table */}
              <div className="bg-white p-4 rounded-gov border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Material Price Schedule vs. {summary.state} CSR Rates
                  </h4>
                  <span className="text-[11px] font-semibold text-gov-navy">
                    Cohort Median: ₹ {(peerMedianAmt).toLocaleString('en-IN')}
                  </span>
                </div>
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
                    {(peerData?.materialBenchmarks || []).map((row, idx) => (
                      <tr key={idx}>
                        <td className="font-bold text-slate-900">{row.materialName}</td>
                        <td>{row.quantity}</td>
                        <td className="font-bold text-slate-900">₹ {row.reportedInvoiceUnitPrice.toLocaleString('en-IN')}</td>
                        <td className="font-semibold text-emerald-700">₹ {row.districtSorBenchmark.toLocaleString('en-IN')}</td>
                        <td className={`font-bold ${row.deviationPercent > 20 ? 'text-rose-700' : row.deviationPercent > 10 ? 'text-amber-700' : 'text-emerald-700'}`}>
                          +{row.deviationPercent}%
                        </td>
                        <td>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                            row.status === 'High Variance' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                            row.status === 'Marginal' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}>
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: COUNTERFACTUAL WHAT-IF SIMULATION */}
          {!loading && activeTab === 'whatif' && summary && (
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
                    <div className="text-2xl font-bold text-rose-400">{baseRisk.toFixed(1)} / 100 ({summary.severity} RISK)</div>
                  </div>

                  <div className="text-center">
                    <span className="text-xs text-slate-300 font-medium">Dynamic Simulated Projection:</span>
                    <div className={`text-3xl font-black ${
                      currentSimScore <= 40 ? 'text-emerald-400' : currentSimScore <= 70 ? 'text-amber-400' : 'text-rose-400'
                    }`}>
                      {currentSimScore} / 100
                    </div>
                  </div>

                  <div className="text-right text-xs">
                    <span className="text-slate-300">Reduction:</span>
                    <div className="text-lg font-bold text-emerald-300">
                      -{Math.max(0, Math.round(baseRisk - currentSimScore))} Points
                    </div>
                  </div>
                </div>

                {/* Interactive Toggles */}
                <div className="space-y-3">
                  {summary.counterfactualSimulations.map((sim, i) => (
                    <div key={sim.id || i} className="p-3 rounded border border-slate-200 bg-slate-50 flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-slate-900 block">
                          Intervention {i + 1}: {sim.factorName}
                        </span>
                        <span className="text-[11px] text-slate-600">
                          {sim.condition}
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          if (i === 0) setSimulateMaterial(!simulateMaterial);
                          if (i === 1) setSimulateProgress(!simulateProgress);
                          if (i === 2) setSimulateDocs(!simulateDocs);
                        }}
                        className={`px-3 py-1.5 rounded text-xs font-bold transition ${
                          (i === 0 && simulateMaterial) || (i === 1 && simulateProgress) || (i === 2 && simulateDocs)
                            ? 'bg-emerald-600 text-white' 
                            : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {((i === 0 && simulateMaterial) || (i === 1 && simulateProgress) || (i === 2 && simulateDocs))
                          ? `Simulated ✓ (Risk → ${sim.simulatedRisk})`
                          : 'Simulate Fix'}
                      </button>
                    </div>
                  ))}
                </div>

                <div className="mt-4 p-2 bg-amber-50 rounded border border-amber-200 text-[10px] text-amber-800">
                  <strong>Notice:</strong> Decision-support simulation model — provides investigative triage priority, not an automatic administrative determination.
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: OFFICIAL INVESTIGATION REPORT MEMO */}
          {!loading && activeTab === 'report' && summary && (
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
                    <p><strong>Memo No.:</strong> MoSPI/MPLADS/2026/INV-{summary.projectId.replace(/[^a-zA-Z0-9]/g, '').slice(-6)}</p>
                    <p><strong>District:</strong> {summary.district}, {summary.state}</p>
                    <p><strong>Hon'ble MP:</strong> {summary.mpName} ({summary.constituency} Constituency)</p>
                  </div>
                  <div className="text-right">
                    <p><strong>Date:</strong> 27 September 2026</p>
                    <p><strong>Classification:</strong> OFFICIAL / CONFIDENTIAL</p>
                    <p><strong>AI Risk Engine Assessment:</strong> {summary.severity} RISK ({riskScoreVal.toFixed(1)}/100)</p>
                  </div>
                </div>

                {/* Memo Body */}
                <div className="space-y-3 font-sans text-xs">
                  <div className="font-bold text-sm text-gov-navy border-b border-slate-200 pb-1">
                    SUBJECT: STATUTORY FORENSIC AUDIT MEMORANDUM — WORK CODE {summary.projectId}
                  </div>

                  <p>
                    1. <strong>Project Particulars:</strong> {summary.projectName}, {summary.district} District ({summary.state}). Disbursed Amount: ₹{summary.disbursedAmountInr.toLocaleString('en-IN')}/-; Sanctioned Amount: ₹{summary.sanctionedAmountInr.toLocaleString('en-IN')}/-.
                  </p>

                  <p>
                    2. <strong>AI Forensic Intelligence Findings:</strong>
                    Automated multi-record consistency audits and peer cohort benchmarks identified the following explainable factors:
                  </p>
                  <ul className="list-disc list-inside pl-3 space-y-1 text-slate-800">
                    {summary.explainableReasons.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>

                  <p>
                    3. <strong>District Officer Statutory Status:</strong>{' '}
                    {savedDecisionDetails ? (
                      <span>
                        Recorded Decision: <strong>{savedDecisionDetails.decision}</strong> by {savedDecisionDetails.officer_name || 'District Planning Officer'} on {savedDecisionDetails.timestamp}. Remarks: <em>"{savedDecisionDetails.notes}"</em>.
                      </span>
                    ) : (
                      <span>Pending formal officer determination.</span>
                    )}
                  </p>

                  <p>
                    4. <strong>Recommended Directives:</strong>
                  </p>
                  <ul className="list-disc list-inside pl-3 space-y-1 text-slate-800">
                    {summary.recommendedActions.map((a, i) => (
                      <li key={i}>{a}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

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
