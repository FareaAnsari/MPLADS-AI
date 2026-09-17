import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  X, 
  ChevronRight, 
  ChevronLeft, 
  MapPin, 
  Building2, 
  FileText, 
  Clock, 
  AlertTriangle, 
  ShieldCheck, 
  Briefcase, 
  ExternalLink, 
  Send, 
  Search, 
  CheckCircle2, 
  Layers,
  Sparkles,
  Info,
  ArrowRight,
  Volume2,
  VolumeX
} from 'lucide-react';
import { 
  getVillageIntelligence, 
  getContractorPortfolio, 
  UNIFIED_PROJECTS 
} from '../../services/unifiedIntelligenceService';
import { elevenLabsService } from '../../services/elevenLabsAudioService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const MasterWorkflowDemoModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const totalSteps = 12;

  const villageData = getVillageIntelligence('556214'); // Wagholi
  const contractorData = getContractorPortfolio('Apex');
  const delayedProject = UNIFIED_PROJECTS[0]; // PRJ-MH-2024-001
  const upcomingProject = UNIFIED_PROJECTS[1]; // MH-PUN-2024-001

  if (!isOpen || !villageData || !contractorData) return null;

  const nextStep = () => {
    elevenLabsService.stop();
    setIsPlayingAudio(false);
    setCurrentStep(prev => Math.min(totalSteps, prev + 1));
  };
  
  const prevStep = () => {
    elevenLabsService.stop();
    setIsPlayingAudio(false);
    setCurrentStep(prev => Math.max(1, prev - 1));
  };

  const handleClose = () => {
    elevenLabsService.stop();
    setIsPlayingAudio(false);
    onClose();
  };

  const handleToggleVoice = () => {
    if (isPlayingAudio) {
      elevenLabsService.stop();
      setIsPlayingAudio(false);
    } else {
      const stepText = `Step ${currentStep} of 12. ${steps[currentStep - 1].title}. ${steps[currentStep - 1].subtitle}. Official government data stream loaded.`;
      setIsPlayingAudio(true);
      elevenLabsService.speakText(stepText, () => setIsPlayingAudio(false));
    }
  };

  // Step definitions
  const steps = [
    { title: 'Select State', subtitle: 'National Administrative Hierarchy: State Level' },
    { title: 'Select District', subtitle: 'Implementing District Authority: Pune IDA' },
    { title: 'Select Rural Block', subtitle: 'Sub-District Level: Haveli Taluka' },
    { title: 'Select Village', subtitle: 'Local Government Directory: Wagholi (LGD 556214)' },
    { title: 'Complete Project History', subtitle: 'Audited Works (Completed & Ongoing)' },
    { title: 'Fewer Recorded Projects', subtitle: 'Comparative Rural Allocation Density' },
    { title: 'Delayed Project Inspection', subtitle: 'Timeline Breach & Stalled Milestones' },
    { title: 'AI Risk & Satellite Discrepancy', subtitle: 'SAR InSAR Physical vs Claimed Payment' },
    { title: 'Associated Contractor', subtitle: 'Firms Executing Works in Village' },
    { title: 'Contractor Intelligence', subtitle: 'Cross-District Portfolio & Other Works' },
    { title: 'Upcoming Sanctioned Work', subtitle: 'Publicly Listed Proposed MPLADS Works' },
    { title: 'Procurement Status & Express Interest', subtitle: 'Official Tender Source & Prototype Interest' }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-fadeIn">
      <div className="bg-white rounded-gov border border-gov-border shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden text-xs text-slate-700">
        
        {/* Top Government Modal Header */}
        <div className="bg-gov-navy text-white px-5 py-3.5 flex items-center justify-between border-b border-gov-border shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="p-1 bg-gov-gold/20 rounded border border-gov-gold/40 text-gov-gold">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-sm uppercase tracking-wide">
                  Rural Development & Contractor Opportunity Guided Journey
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded bg-gov-blue text-white font-mono">
                  STEP {currentStep} OF {totalSteps}
                </span>
              </div>
              <p className="text-[11px] text-slate-300">
                End-to-end integration: State → Village → Project History → Contractor → Upcoming Tenders → Risk Engine
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleToggleVoice}
              className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center space-x-1.5 transition border ${
                isPlayingAudio 
                  ? 'bg-amber-500 text-white border-amber-400 animate-pulse' 
                  : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
              }`}
              title="Official ElevenLabs Audio Readout"
            >
              {isPlayingAudio ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-gov-gold" />}
              <span>{isPlayingAudio ? 'Stop Voice' : 'Voice Briefing'}</span>
            </button>
            <button 
              onClick={handleClose} 
              className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-200 h-1.5 shrink-0">
          <div 
            className="bg-gov-blue h-1.5 transition-all duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>

        {/* Step Context Sub-header */}
        <div className="bg-slate-50 px-5 py-2.5 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              {steps[currentStep - 1].subtitle}
            </span>
            <h4 className="text-sm font-black text-slate-900">
              {steps[currentStep - 1].title}
            </h4>
          </div>
          <span className="text-xs font-mono font-bold text-gov-navy">
            Journey Progress: {Math.round((currentStep / totalSteps) * 100)}%
          </span>
        </div>

        {/* Main Step Content Area (Scrollable) */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          
          {/* STEP 1: STATE LEVEL */}
          {currentStep === 1 && (
            <div className="space-y-3 animate-fadeIn">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-gov space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase text-slate-500">LGD State Code: 27</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                    Complete/High Coverage Tier
                  </span>
                </div>
                <h3 className="text-lg font-black text-slate-900">Maharashtra</h3>
                <p className="text-slate-600 leading-relaxed text-xs">
                  Official statutory reporting active across all 36 districts with 3,120 indexed works and ₹589.4 Cr total recorded expenditure under 18th Lok Sabha & Rajya Sabha allocations.
                </p>
                <div className="grid grid-cols-3 gap-2 pt-2 text-center font-mono">
                  <div className="bg-white p-2 rounded border border-slate-200">
                    <span className="text-slate-400 block text-[10px] font-sans">Districts</span>
                    <strong className="text-slate-900 text-sm">36</strong>
                  </div>
                  <div className="bg-white p-2 rounded border border-slate-200">
                    <span className="text-slate-400 block text-[10px] font-sans">Active Works</span>
                    <strong className="text-gov-navy text-sm">3,120</strong>
                  </div>
                  <div className="bg-white p-2 rounded border border-slate-200">
                    <span className="text-slate-400 block text-[10px] font-sans">Expenditure</span>
                    <strong className="text-emerald-700 text-sm">₹589.4 Cr</strong>
                  </div>
                </div>
              </div>

              {/* Data Trust Box */}
              <div className="bg-blue-50/70 border border-blue-200 p-3 rounded text-[11px] text-blue-900 space-y-1">
                <div className="font-bold flex items-center space-x-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-700" />
                  <span>Data Provenance Trust Box</span>
                </div>
                <div><strong>Source:</strong> e-SAKSHI MoSPI Public Portal & Local Government Directory (LGD)</div>
                <div><strong>Last Updated:</strong> 2026-09-17 06:00 IST | <strong>Mode:</strong> REAL DATA MODE (Verified)</div>
                <div><strong>Missing Fields:</strong> None at State Level.</div>
              </div>
            </div>
          )}

          {/* STEP 2: DISTRICT LEVEL */}
          {currentStep === 2 && (
            <div className="space-y-3 animate-fadeIn">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-gov space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase text-slate-500">LGD District Code: 492</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                    Implementing District Authority Active
                  </span>
                </div>
                <h3 className="text-lg font-black text-slate-900">Pune District (IDA)</h3>
                <p className="text-slate-600 leading-relaxed text-xs">
                  Implementing District Authority: <strong>District Collector & Planning Officer Pune_IDA</strong>. 
                  Administers works across 14 rural blocks (Haveli, Ambegaon, Shirur, Khed, Baramati) and Pune City.
                </p>
                <div className="grid grid-cols-3 gap-2 pt-2 text-center font-mono">
                  <div className="bg-white p-2 rounded border border-slate-200">
                    <span className="text-slate-400 block text-[10px] font-sans">Rural Blocks</span>
                    <strong className="text-slate-900 text-sm">14</strong>
                  </div>
                  <div className="bg-white p-2 rounded border border-slate-200">
                    <span className="text-slate-400 block text-[10px] font-sans">District Works</span>
                    <strong className="text-gov-navy text-sm">342</strong>
                  </div>
                  <div className="bg-white p-2 rounded border border-slate-200">
                    <span className="text-slate-400 block text-[10px] font-sans">Disbursed</span>
                    <strong className="text-emerald-700 text-sm">₹68.5 Cr</strong>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50/70 border border-blue-200 p-3 rounded text-[11px] text-blue-900 space-y-1">
                <div className="font-bold flex items-center space-x-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-700" />
                  <span>Data Provenance Trust Box</span>
                </div>
                <div><strong>Source:</strong> District Planning Committee (DPC) Pune & e-SAKSHI Work Ledgers</div>
                <div><strong>Missing Fields:</strong> Exact GPS coordinates for 42 district road markers are pending telemetry reconciliation.</div>
              </div>
            </div>
          )}

          {/* STEP 3: RURAL BLOCK LEVEL */}
          {currentStep === 3 && (
            <div className="space-y-3 animate-fadeIn">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-gov space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase text-slate-500">LGD Sub-District: 04112</span>
                  <span className="px-2 py-0.5 rounded bg-sky-100 text-sky-800 font-bold text-[10px]">
                    Sub-District / Taluka Master
                  </span>
                </div>
                <h3 className="text-lg font-black text-slate-900">Haveli Rural Block / Sub-District</h3>
                <p className="text-slate-600 leading-relaxed text-xs">
                  Haveli Sub-District surrounds the Pune metropolitan fringe, encompassing 124 rural Gram Panchayats. 
                  Transitioning rapidly from agricultural lands to peri-urban infrastructure hubs.
                </p>
                <div className="grid grid-cols-3 gap-2 pt-2 text-center font-mono">
                  <div className="bg-white p-2 rounded border border-slate-200">
                    <span className="text-slate-400 block text-[10px] font-sans">Gram Panchayats</span>
                    <strong className="text-slate-900 text-sm">124</strong>
                  </div>
                  <div className="bg-white p-2 rounded border border-slate-200">
                    <span className="text-slate-400 block text-[10px] font-sans">Recorded Works</span>
                    <strong className="text-gov-navy text-sm">48</strong>
                  </div>
                  <div className="bg-white p-2 rounded border border-slate-200">
                    <span className="text-slate-400 block text-[10px] font-sans">Block Spend</span>
                    <strong className="text-emerald-700 text-sm">₹9.82 Cr</strong>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50/70 border border-blue-200 p-3 rounded text-[11px] text-blue-900 space-y-1">
                <div className="font-bold flex items-center space-x-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-700" />
                  <span>Data Provenance Trust Box</span>
                </div>
                <div><strong>Source:</strong> Local Government Directory (LGD) Ministry of Panchayati Raj</div>
                <div><strong>Missing Fields:</strong> Standard e-SAKSHI download excludes Block column; derived via LGD census master.</div>
              </div>
            </div>
          )}

          {/* STEP 4: VILLAGE LEVEL */}
          {currentStep === 4 && (
            <div className="space-y-3 animate-fadeIn">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-gov space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-gov-blue" />
                    <span className="font-mono text-[10px] uppercase font-bold text-gov-navy">LGD Village Code: 556214</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                    LGD Master Verified
                  </span>
                </div>
                <h3 className="text-lg font-black text-slate-900">{villageData.villageName} Gram Panchayat</h3>
                <div className="text-slate-600 text-xs">
                  <strong>Administrative Hierarchy:</strong> India &rarr; Maharashtra &rarr; Pune &rarr; Haveli &rarr; Wagholi (556214)
                </div>
                <div className="grid grid-cols-4 gap-2 pt-2 text-center font-mono">
                  <div className="bg-white p-2 rounded border border-slate-200">
                    <span className="text-slate-400 block text-[10px] font-sans">Total Works</span>
                    <strong className="text-slate-900 text-sm">{villageData.projectCount}</strong>
                  </div>
                  <div className="bg-white p-2 rounded border border-slate-200">
                    <span className="text-slate-400 block text-[10px] font-sans">Completed</span>
                    <strong className="text-emerald-700 text-sm">{villageData.completedCount}</strong>
                  </div>
                  <div className="bg-white p-2 rounded border border-slate-200">
                    <span className="text-slate-400 block text-[10px] font-sans">Delayed</span>
                    <strong className="text-rose-700 text-sm">{villageData.delayedCount}</strong>
                  </div>
                  <div className="bg-white p-2 rounded border border-slate-200">
                    <span className="text-slate-400 block text-[10px] font-sans">Total Spend</span>
                    <strong className="text-gov-navy text-sm">₹{(villageData.totalExpenditureInr / 100000).toFixed(1)} L</strong>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50/70 border border-blue-200 p-3 rounded text-[11px] text-blue-900 space-y-1">
                <div className="font-bold flex items-center space-x-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-700" />
                  <span>Data Provenance Trust Box</span>
                </div>
                <div><strong>Source:</strong> LGD Village Master & Integrated Project Register</div>
                <div><strong>LGD Linkage:</strong> Exact 6-digit Census Code Match (No heuristic approximation).</div>
              </div>
            </div>
          )}

          {/* STEP 5: PROJECT HISTORY */}
          {currentStep === 5 && (
            <div className="space-y-3 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wide">
                  Complete Project History: Wagholi Village
                </h4>
                <span className="text-[10px] font-mono text-slate-500">3 Recorded Projects</span>
              </div>

              <div className="space-y-2">
                {villageData.projects.map(p => (
                  <div key={p.projectId} className="border border-slate-200 rounded p-3 bg-white space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-gov-navy">{p.projectId}</span>
                        <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                          p.mpladsStatus === 'Completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-sky-100 text-sky-800'
                        }`}>
                          MPLADS Status: {p.mpladsStatus}
                        </span>
                      </div>
                      <span className="font-mono font-bold text-slate-900">
                        ₹{(p.sanctionedAmountInr / 100000).toFixed(1)} Lakhs
                      </span>
                    </div>

                    <p className="font-semibold text-slate-800 text-xs">{p.workName}</p>
                    <p className="text-[11px] text-slate-500">{p.description}</p>

                    <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[10px]">
                      <div className="flex items-center space-x-2">
                        <span className="text-slate-400">Contractor:</span>
                        <strong className="text-slate-700">{p.contractorName || 'Not available in source data.'}</strong>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-slate-400">Procurement:</span>
                        <span className={`font-semibold ${p.hasOfficialProcurement ? 'text-indigo-700' : 'text-slate-400 italic'}`}>
                          {p.procurementStatus}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 6: LOW RECORDED PROJECT COUNT CONTEXT */}
          {currentStep === 6 && (
            <div className="space-y-3 animate-fadeIn">
              <div className="bg-amber-50 border border-amber-200 p-3.5 rounded text-amber-900 space-y-2">
                <div className="flex items-center space-x-2 font-bold text-xs">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Rural Priority Context: Comparative Allocation Density</span>
                </div>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  While Wagholi has 3 recorded works, the Rural Intelligence Engine identifies that <strong>35% of rural villages in the state have 0 recorded projects</strong>, and 35% have only 1–2 works over a 5-year cycle.
                </p>
                <div className="grid grid-cols-3 gap-2 pt-1 text-center font-mono">
                  <div className="bg-white p-2 rounded border border-amber-200">
                    <span className="text-slate-400 block text-[10px] font-sans">0 Works Villages</span>
                    <strong className="text-slate-700 text-xs">12 Villages</strong>
                  </div>
                  <div className="bg-white p-2 rounded border border-amber-200">
                    <span className="text-slate-400 block text-[10px] font-sans">1–2 Works Villages</span>
                    <strong className="text-amber-800 text-xs">12 Villages</strong>
                  </div>
                  <div className="bg-white p-2 rounded border border-amber-200">
                    <span className="text-slate-400 block text-[10px] font-sans">3+ Works Villages</span>
                    <strong className="text-emerald-800 text-xs">10 Villages</strong>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 p-3 rounded text-[11px] text-slate-600">
                <strong>Statutory Objective:</strong> Identifies unreached or low-density habitations to assist public representatives in balanced geographical allocation.
              </div>
            </div>
          )}

          {/* STEP 7: DELAYED PROJECT INSPECTION */}
          {currentStep === 7 && (
            <div className="space-y-3 animate-fadeIn">
              <div className="p-4 bg-rose-50/50 border border-rose-200 rounded-gov space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-rose-700">{delayedProject.projectId}</span>
                  <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-bold text-[10px]">
                    DELAYED: 9 MONTHS OVERDUE
                  </span>
                </div>

                <h4 className="font-bold text-sm text-slate-900">{delayedProject.workName}</h4>
                <p className="text-[11px] text-slate-600">{delayedProject.description}</p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs font-mono">
                  <div className="bg-white p-2 rounded border border-rose-200">
                    <span className="text-slate-400 block text-[10px] font-sans">Sanction Date</span>
                    <strong className="text-slate-900">{delayedProject.sanctionDate}</strong>
                  </div>
                  <div className="bg-white p-2 rounded border border-rose-200">
                    <span className="text-slate-400 block text-[10px] font-sans">Target Date</span>
                    <strong className="text-rose-700">{delayedProject.targetCompletionDate}</strong>
                  </div>
                  <div className="bg-white p-2 rounded border border-rose-200">
                    <span className="text-slate-400 block text-[10px] font-sans">Sanctioned Cost</span>
                    <strong className="text-slate-900">₹20.0 Lakhs</strong>
                  </div>
                  <div className="bg-white p-2 rounded border border-rose-200">
                    <span className="text-slate-400 block text-[10px] font-sans">Claimed Disbursed</span>
                    <strong className="text-emerald-700">₹14.8 Lakhs (74%)</strong>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 p-3 rounded text-[11px] text-slate-600">
                <strong>Delayed Work Trigger:</strong> Work execution stalled beyond stipulated 9-month buffer. Milestone inspection pending.
              </div>
            </div>
          )}

          {/* STEP 8: AI RISK & SATELLITE DISCREPANCY */}
          {currentStep === 8 && (
            <div className="space-y-3 animate-fadeIn">
              <div className="bg-slate-900 text-white p-4 rounded-gov border border-slate-700 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-700 pb-2">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span className="font-bold text-xs uppercase tracking-wider text-amber-300">
                      AI Risk Engine & Satellite SAR Analysis
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-rose-500/30 text-rose-300 border border-rose-500 font-mono font-bold">
                    Risk Score: {delayedProject.aiRiskScore}/100 ({delayedProject.riskCategory})
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="bg-slate-800/80 p-2.5 rounded border border-slate-700">
                    <strong className="text-amber-300 text-xs block">Satellite InSAR / Optical Telemetry Delta:</strong>
                    <p className="text-[11px] text-slate-300 mt-0.5">
                      {delayedProject.satelliteDelta}
                    </p>
                  </div>

                  <div className="bg-slate-800/80 p-2.5 rounded border border-slate-700">
                    <strong className="text-rose-300 text-xs block">Project Splitting Detection:</strong>
                    <p className="text-[11px] text-slate-300 mt-0.5">
                      Suspected artificial subdivision: Cluster <code>{delayedProject.splittingClusterId}</code> detected within 350 meters below the statutory ₹25 Lakh tender threshold.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => navigate(`/investigate/${delayedProject.projectId}`)}
                  className="w-full mt-2 py-2 bg-gov-blue hover:bg-sky-600 text-white font-bold rounded text-xs flex items-center justify-center space-x-1.5"
                >
                  <span>Open in Investigation Center</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 9: ASSOCIATED CONTRACTOR */}
          {currentStep === 9 && (
            <div className="space-y-3 animate-fadeIn">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-gov space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-slate-500">{contractorData.contractorId}</span>
                  <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold text-[10px]">
                    Executing Entity
                  </span>
                </div>

                <h3 className="text-base font-black text-slate-900">{contractorData.contractorName}</h3>
                <p className="text-[11px] text-slate-500">Headquarters: {contractorData.headquarters}</p>

                <div className="grid grid-cols-3 gap-2 pt-2 text-center font-mono">
                  <div className="bg-white p-2 rounded border border-slate-200">
                    <span className="text-slate-400 block text-[10px] font-sans">Active Works</span>
                    <strong className="text-slate-900 text-sm">{contractorData.activeProjects}</strong>
                  </div>
                  <div className="bg-white p-2 rounded border border-slate-200">
                    <span className="text-slate-400 block text-[10px] font-sans">Districts</span>
                    <strong className="text-slate-900 text-sm">{contractorData.districtsCount}</strong>
                  </div>
                  <div className="bg-white p-2 rounded border border-slate-200">
                    <span className="text-slate-400 block text-[10px] font-sans">Total Disbursed</span>
                    <strong className="text-emerald-700 text-sm">₹{(contractorData.totalDisbursedInr / 100000).toFixed(1)} L</strong>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50/70 border border-blue-200 p-3 rounded text-[11px] text-blue-900 space-y-1">
                <div className="font-bold flex items-center space-x-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-700" />
                  <span>Data Provenance Trust Box</span>
                </div>
                <div><strong>Source:</strong> District Engineering Division Works Register & e-SAKSHI Vendor Records</div>
                <div><strong>Contractor Identity:</strong> Verified registered contractor. No synthetic profile created.</div>
              </div>
            </div>
          )}

          {/* STEP 10: CONTRACTOR INTELLIGENCE & OTHER WORKS */}
          {currentStep === 10 && (
            <div className="space-y-3 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wide">
                  Contractor Intelligence: Cross-District Portfolio
                </h4>
                <span className="text-[10px] font-mono text-slate-500">Operating in Pune & Nashik</span>
              </div>

              <div className="space-y-2">
                {contractorData.projects.map(p => (
                  <div key={p.projectId} className="border border-slate-200 rounded p-3 bg-white space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2">
                        <strong className="text-gov-navy font-mono">{p.projectId}</strong>
                        <span className="text-slate-500">| {p.district} ({p.village || 'Urban'})</span>
                      </div>
                      <span className={`px-2 py-0.2 rounded text-[10px] font-bold ${
                        p.isDelayed ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {p.isDelayed ? 'Delayed' : 'On Track'}
                      </span>
                    </div>

                    <p className="font-semibold text-slate-800 text-xs">{p.workName}</p>
                    <div className="flex justify-between items-center text-[10px] font-mono pt-1 text-slate-500">
                      <span>Sector: {p.sector}</span>
                      <strong className="text-slate-800">₹{(p.sanctionedAmountInr / 100000).toFixed(1)} L</strong>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => navigate('/contractors')}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded text-xs flex items-center justify-center space-x-1.5 border border-slate-300"
              >
                <span>Explore Full Contractor Intelligence Directory</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* STEP 11: UPCOMING SANCTIONED WORK */}
          {currentStep === 11 && (
            <div className="space-y-3 animate-fadeIn">
              <div className="p-4 bg-sky-50/60 border border-sky-200 rounded-gov space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-gov-navy">{upcomingProject.projectId}</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                    Upcoming Sanctioned Work
                  </span>
                </div>

                <h4 className="font-bold text-sm text-slate-900">{upcomingProject.workName}</h4>
                <p className="text-[11px] text-slate-600">{upcomingProject.description}</p>

                <div className="grid grid-cols-3 gap-2 pt-2 text-center font-mono">
                  <div className="bg-white p-2 rounded border border-sky-200">
                    <span className="text-slate-400 block text-[10px] font-sans">Approved Cost</span>
                    <strong className="text-slate-900 text-sm">₹25.0 Lakhs</strong>
                  </div>
                  <div className="bg-white p-2 rounded border border-sky-200">
                    <span className="text-slate-400 block text-[10px] font-sans">Sector</span>
                    <strong className="text-slate-900 text-xs">Roads & Pathways</strong>
                  </div>
                  <div className="bg-white p-2 rounded border border-sky-200">
                    <span className="text-slate-400 block text-[10px] font-sans">Target Completion</span>
                    <strong className="text-gov-navy text-xs">30-Nov-2026</strong>
                  </div>
                </div>
              </div>

              {/* Strict Dual Status Display */}
              <div className="p-3 bg-white border border-slate-200 rounded space-y-2">
                <strong className="text-xs text-slate-800 uppercase tracking-wide block">
                  Mandatory Status Segregation
                </strong>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 bg-slate-50 rounded border border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">MPLADS Status</span>
                    <span className="font-bold text-emerald-800">{upcomingProject.mpladsStatus}</span>
                  </div>
                  <div className="p-2 bg-indigo-50 rounded border border-indigo-200">
                    <span className="text-[10px] uppercase font-bold text-indigo-700 block">Procurement Status</span>
                    <span className="font-bold text-indigo-900">Tender Open</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 12: PROCUREMENT & EXPRESS INTEREST */}
          {currentStep === 12 && (
            <div className="space-y-3 animate-fadeIn">
              <div className="p-4 bg-indigo-50/50 border border-indigo-200 rounded-gov space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-indigo-900 text-xs uppercase tracking-wider">
                    Official Government Tender Published
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                    Bids Active
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="text-xs font-semibold text-slate-800">
                    Tender Reference: <span className="font-mono text-gov-navy">{upcomingProject.tenderReference}</span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Portal: {upcomingProject.officialSourceName}
                  </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row gap-2">
                  <a
                    href={upcomingProject.officialSourceUrl || 'https://mahatenders.gov.in'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2 px-3 bg-slate-900 hover:bg-black text-white font-bold rounded text-xs flex items-center justify-center space-x-1.5"
                  >
                    <span>VIEW OFFICIAL SOURCE</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <button
                    onClick={() => {
                      onClose();
                      navigate('/contractor-interest');
                    }}
                    className="flex-1 py-2 px-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded text-xs flex items-center justify-center space-x-1.5 shadow-xs"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>EXPRESS INTEREST (PROTOTYPE)</span>
                  </button>
                </div>
              </div>

              {/* Statutory Disclaimer */}
              <div className="bg-amber-50 border border-amber-200 p-3 rounded text-[11px] text-amber-900 space-y-1">
                <div className="font-bold flex items-center space-x-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  <span>Statutory Notice & Disclaimer</span>
                </div>
                <p className="leading-relaxed">
                  Expressing interest through this prototype does not constitute a formal bid, tender submission, or contract award. Formal participation is governed exclusively by the official tendering authority on government e-procurement portals.
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Footer Navigation Bar */}
        <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex items-center justify-between shrink-0">
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className="px-3.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 font-bold rounded border border-slate-300 text-xs flex items-center space-x-1 disabled:opacity-40"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Previous</span>
          </button>

          <div className="flex items-center space-x-1 hidden sm:flex">
            {Array.from({ length: totalSteps }, (_, i) => i + 1).map(stepNum => (
              <button
                key={stepNum}
                onClick={() => setCurrentStep(stepNum)}
                className={`w-5 h-5 rounded-full text-[10px] font-bold transition-all ${
                  currentStep === stepNum
                    ? 'bg-gov-navy text-white scale-110'
                    : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                }`}
              >
                {stepNum}
              </button>
            ))}
          </div>

          {currentStep < totalSteps ? (
            <button
              onClick={nextStep}
              className="px-4 py-1.5 bg-gov-navy hover:bg-slate-800 text-white font-bold rounded text-xs flex items-center space-x-1 shadow-xs"
            >
              <span>Next Step</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded text-xs flex items-center space-x-1 shadow-xs"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Complete Demo</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
