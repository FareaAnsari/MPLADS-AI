import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  X, 
  MapPin, 
  Building2, 
  FileText, 
  Clock, 
  AlertTriangle, 
  ShieldCheck, 
  Briefcase, 
  ExternalLink, 
  ChevronRight,
  TrendingUp,
  FolderKanban
} from 'lucide-react';
import { UnifiedVillageIntelligence } from '../../services/unifiedIntelligenceService';

interface Props {
  villageData: UnifiedVillageIntelligence | null;
  isOpen: boolean;
  onClose: () => void;
}

export const VillageIntelligenceDrawer: React.FC<Props> = ({
  villageData,
  isOpen,
  onClose
}) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'delayed' | 'contractors' | 'upcoming'>('overview');

  if (!isOpen || !villageData) return null;

  const delayedProjects = villageData.projects.filter(p => p.isDelayed);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-end animate-fadeIn">
      <div className="bg-white h-full w-full max-w-xl shadow-2xl flex flex-col overflow-hidden text-xs text-slate-700 animate-slideLeft">
        
        {/* Header */}
        <div className="bg-gov-navy text-white p-4 border-b border-gov-border shrink-0 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 bg-gov-blue/30 rounded border border-gov-blue/50 text-gov-gold">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-sm uppercase tracking-wide">
                  VILLAGE INTELLIGENCE
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-gov-gold font-mono font-bold">
                  LGD: {villageData.villageLgdCode}
                </span>
              </div>
              <p className="text-[11px] text-slate-300">
                {villageData.villageName} Gram Panchayat | {villageData.blockName} Block | {villageData.districtName}, {villageData.stateName}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Strip */}
        <div className="flex border-b border-slate-200 bg-slate-50 text-[11px] font-semibold overflow-x-auto shrink-0">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3.5 py-2.5 whitespace-nowrap border-b-2 transition ${
              activeTab === 'overview' ? 'border-gov-blue text-gov-blue bg-white font-bold' : 'border-transparent text-slate-600'
            }`}
          >
            Village Overview
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3.5 py-2.5 whitespace-nowrap border-b-2 transition ${
              activeTab === 'history' ? 'border-gov-blue text-gov-blue bg-white font-bold' : 'border-transparent text-slate-600'
            }`}
          >
            Project History ({villageData.projects.length})
          </button>
          <button
            onClick={() => setActiveTab('delayed')}
            className={`px-3.5 py-2.5 whitespace-nowrap border-b-2 transition ${
              activeTab === 'delayed' ? 'border-gov-blue text-gov-blue bg-white font-bold' : 'border-transparent text-slate-600'
            }`}
          >
            Delayed Projects ({delayedProjects.length})
          </button>
          <button
            onClick={() => setActiveTab('contractors')}
            className={`px-3.5 py-2.5 whitespace-nowrap border-b-2 transition ${
              activeTab === 'contractors' ? 'border-gov-blue text-gov-blue bg-white font-bold' : 'border-transparent text-slate-600'
            }`}
          >
            Contractors ({villageData.associatedContractors.length})
          </button>
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`px-3.5 py-2.5 whitespace-nowrap border-b-2 transition ${
              activeTab === 'upcoming' ? 'border-gov-blue text-gov-blue bg-white font-bold' : 'border-transparent text-slate-600'
            }`}
          >
            Upcoming Tenders ({villageData.upcomingOpportunities.length})
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-4 overflow-y-auto flex-1 space-y-4">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-4 animate-fadeIn">
              
              {/* Statutory Metric Tiles */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono text-center">
                <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
                  <span className="text-slate-400 block text-[10px] font-sans">Project Count</span>
                  <strong className="text-slate-900 text-sm">{villageData.projectCount} Works</strong>
                </div>
                <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
                  <span className="text-slate-400 block text-[10px] font-sans">Completed</span>
                  <strong className="text-emerald-700 text-sm">{villageData.completedCount}</strong>
                </div>
                <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
                  <span className="text-slate-400 block text-[10px] font-sans">Ongoing / Delayed</span>
                  <strong className="text-amber-700 text-sm">{villageData.ongoingCount} / {villageData.delayedCount}</strong>
                </div>
                <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
                  <span className="text-slate-400 block text-[10px] font-sans">Expenditure</span>
                  <strong className="text-gov-navy text-sm">₹{(villageData.totalExpenditureInr / 100000).toFixed(1)} L</strong>
                </div>
              </div>

              {/* Administrative Hierarchy Card */}
              <div className="bg-slate-50 p-3 rounded border border-slate-200 space-y-1.5">
                <span className="font-bold text-[10px] uppercase tracking-wider text-slate-500 block">
                  Administrative Hierarchy
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div><span className="text-slate-400">State:</span> <strong>{villageData.stateName}</strong></div>
                  <div><span className="text-slate-400">District:</span> <strong>{villageData.districtName}</strong></div>
                  <div><span className="text-slate-400">Block/Sub-District:</span> <strong>{villageData.blockName}</strong></div>
                  <div><span className="text-slate-400">Village:</span> <strong>{villageData.villageName}</strong></div>
                  <div><span className="text-slate-400">LGD Census Code:</span> <strong className="font-mono">{villageData.villageLgdCode}</strong></div>
                </div>
              </div>

              {/* Sectors Covered */}
              <div className="border border-slate-200 rounded p-3 space-y-1.5 bg-white">
                <span className="font-bold text-[10px] uppercase tracking-wider text-slate-500 block">
                  Sectors Covered
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {villageData.sectorsCovered.map((sec, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded bg-blue-50 text-blue-800 text-[10px] font-medium border border-blue-200">
                      {sec}
                    </span>
                  ))}
                </div>
              </div>

              {/* Risk Indicators */}
              <div className="border border-amber-200 bg-amber-50/50 rounded p-3 space-y-2">
                <div className="flex items-center space-x-1.5 text-amber-900 font-bold text-xs">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>AI Risk Indicators</span>
                </div>
                <ul className="space-y-1 text-[11px] text-amber-800 list-disc list-inside">
                  {villageData.riskIndicators.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>

              {/* Data Trust Card */}
              <div className="bg-blue-50/70 border border-blue-200 p-3 rounded text-[11px] text-blue-900 space-y-1">
                <div className="font-bold flex items-center space-x-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-700" />
                  <span>Data Trust & Provenance</span>
                </div>
                <div><strong>Source:</strong> {villageData.dataTrust.source}</div>
                <div><strong>Last Updated:</strong> {villageData.dataTrust.lastUpdated} | <strong>Coverage:</strong> {villageData.dataTrust.coverage}</div>
              </div>

              <button
                onClick={() => {
                  onClose();
                  navigate(`/village/LGD-${villageData.villageLgdCode}`);
                }}
                className="w-full py-2 bg-gov-navy hover:bg-slate-800 text-white font-bold rounded text-xs flex items-center justify-center space-x-1.5 transition"
              >
                <span>Open Dedicated Village Explorer Page</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>

            </div>
          )}

          {/* TAB 2: PROJECT HISTORY */}
          {activeTab === 'history' && (
            <div className="space-y-3 animate-fadeIn">
              {villageData.projects.map(p => (
                <div key={p.projectId} className="border border-slate-200 rounded p-3 bg-white space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-gov-navy">{p.projectId}</span>
                    <span className="font-mono font-bold text-slate-900">
                      ₹{(p.sanctionedAmountInr / 100000).toFixed(1)} L
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-800 text-xs">{p.workName}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">{p.description}</p>
                  </div>

                  {/* Dual Statuses */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div className="p-1.5 bg-slate-50 rounded border border-slate-200 text-[10px]">
                      <span className="text-slate-400 block uppercase font-bold">MPLADS Status</span>
                      <strong className="text-slate-800">{p.mpladsStatus}</strong>
                    </div>
                    <div className="p-1.5 bg-indigo-50/70 rounded border border-indigo-200 text-[10px]">
                      <span className="text-indigo-700 block uppercase font-bold">Procurement Status</span>
                      <span className={`font-semibold ${p.hasOfficialProcurement ? 'text-indigo-900' : 'text-slate-400 italic'}`}>
                        {p.procurementStatus}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
                    <span className="text-slate-500">
                      Contractor: <strong className="text-slate-800">{p.contractorName || 'Not available in source data.'}</strong>
                    </span>
                    <button
                      onClick={() => {
                        onClose();
                        navigate(`/projects/${p.projectId}`);
                      }}
                      className="text-gov-blue hover:underline font-bold flex items-center space-x-0.5"
                    >
                      <span>Full Audit</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: DELAYED PROJECTS */}
          {activeTab === 'delayed' && (
            <div className="space-y-3 animate-fadeIn">
              {delayedProjects.length === 0 ? (
                <div className="p-6 text-center text-slate-400 bg-slate-50 rounded border border-slate-200">
                  No delayed works recorded in this village.
                </div>
              ) : (
                delayedProjects.map(p => (
                  <div key={p.projectId} className="border border-rose-200 bg-rose-50/40 rounded p-3.5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-rose-700">{p.projectId}</span>
                      <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-bold text-[10px]">
                        DELAYED: {p.delayMonths} MONTHS
                      </span>
                    </div>

                    <h4 className="font-bold text-slate-900 text-xs">{p.workName}</h4>
                    <p className="text-[11px] text-slate-600">{p.description}</p>

                    <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1">
                      <div className="bg-white p-2 rounded border border-rose-200">
                        <span className="text-slate-400 block text-[10px] font-sans">Target Date</span>
                        <strong className="text-rose-700">{p.targetCompletionDate || 'Not available'}</strong>
                      </div>
                      <div className="bg-white p-2 rounded border border-rose-200">
                        <span className="text-slate-400 block text-[10px] font-sans">Sanction Cost</span>
                        <strong className="text-slate-900">₹{(p.sanctionedAmountInr / 100000).toFixed(1)} L</strong>
                      </div>
                    </div>

                    {p.satelliteDelta && (
                      <div className="p-2 bg-slate-900 text-white rounded text-[10.5px]">
                        <span className="text-amber-300 font-bold block">Satellite SAR Delta:</span>
                        <p className="text-slate-300 mt-0.5">{p.satelliteDelta}</p>
                      </div>
                    )}

                    <button
                      onClick={() => {
                        onClose();
                        navigate(`/investigate/${p.projectId}`);
                      }}
                      className="w-full py-1.5 bg-rose-700 hover:bg-rose-800 text-white font-bold rounded text-xs flex items-center justify-center space-x-1"
                    >
                      <span>Investigate Stalled Milestone</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 4: CONTRACTORS */}
          {activeTab === 'contractors' && (
            <div className="space-y-3 animate-fadeIn">
              {villageData.associatedContractors.map(c => (
                <div key={c.contractorId} className="border border-slate-200 rounded p-3 bg-white space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs">{c.contractorName}</h4>
                      <span className="text-[10px] font-mono text-slate-400">{c.contractorId}</span>
                    </div>
                    <span className="font-mono font-bold text-emerald-700 text-xs">
                      ₹{(c.totalDisbursedInr / 100000).toFixed(1)} L Disbursed
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px]">
                    <span className="text-slate-500">{c.projectCount} Works in this village</span>
                    <button
                      onClick={() => {
                        onClose();
                        navigate('/contractors');
                      }}
                      className="text-gov-blue hover:underline font-bold flex items-center space-x-0.5"
                    >
                      <span>Contractor Intelligence & Other Works</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 5: UPCOMING TENDERS */}
          {activeTab === 'upcoming' && (
            <div className="space-y-3 animate-fadeIn">
              {villageData.upcomingOpportunities.length === 0 ? (
                <div className="p-6 text-center text-slate-400 bg-slate-50 rounded border border-slate-200">
                  No upcoming procurement notices published for this village in the current dataset.
                </div>
              ) : (
                villageData.upcomingOpportunities.map(o => (
                  <div key={o.projectId} className="border border-sky-200 bg-sky-50/40 rounded p-3.5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-gov-navy">{o.projectId}</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                        Tender Status: {o.tenderStatus || 'Procurement Published'}
                      </span>
                    </div>

                    <h4 className="font-bold text-slate-900 text-xs">{o.workName}</h4>
                    <p className="text-[11px] text-slate-600">{o.sector} | Cost: ₹{(o.estimatedCost ? (o.estimatedCost/100000).toFixed(1) + ' Lakhs' : 'Not available')}</p>

                    <div className="pt-2 flex gap-2">
                      <a
                        href={o.officialSource?.source_url || 'https://mahatenders.gov.in'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-1.5 bg-slate-900 hover:bg-black text-white rounded text-center text-[10.5px] font-bold flex items-center justify-center space-x-1"
                      >
                        <span>VIEW OFFICIAL SOURCE</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                      <button
                        onClick={() => {
                          onClose();
                          navigate('/contractor-interest');
                        }}
                        className="flex-1 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-[10.5px] font-bold"
                      >
                        Express Interest
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
