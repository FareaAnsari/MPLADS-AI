import React, { useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  MOCK_PROJECTS, 
  MOCK_MATERIALS, 
  MOCK_TASKS, 
  MOCK_CONTRACTORS, 
  MOCK_VENDORS, 
  MOCK_DOCUMENTS, 
  SHOWCASE_PROJECT_ID 
} from '../data/mockData';
import { InvestigationModal } from '../components/InvestigationModal';
import { 
  AlertTriangle, 
  Building2, 
  Calendar, 
  CheckCircle, 
  FileText, 
  IndianRupee, 
  MapPin, 
  Clock, 
  User, 
  SearchCode, 
  ArrowLeft, 
  Sparkles, 
  Layers, 
  Kanban, 
  Store, 
  Percent, 
  TrendingUp,
  Download,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';

export const ProjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const projectId = id || SHOWCASE_PROJECT_ID;
  const project = MOCK_PROJECTS.find(p => p.id === projectId || p.code === projectId) || MOCK_PROJECTS[0];

  const defaultTab = searchParams.get('tab') || 'overview';
  const [activeTab, setActiveTab] = useState<string>(defaultTab);
  const [isInvestigateOpen, setIsInvestigateOpen] = useState<boolean>(false);

  const materials = MOCK_MATERIALS.filter(m => m.projectId === project.id);
  const tasks = MOCK_TASKS.filter(t => t.projectId === project.id);
  const documents = MOCK_DOCUMENTS.filter(d => d.projectId === project.id);
  const contractor = MOCK_CONTRACTORS.find(c => c.id === project.contractorId);
  const vendors = MOCK_VENDORS.filter(v => project.vendorIds.includes(v.id));

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'timeline', label: 'AI Timeline' },
    { id: 'tender', label: 'Tender & Bids' },
    { id: 'contract', label: 'Contract' },
    { id: 'team', label: 'Team & Tasks' },
    { id: 'vendors', label: 'Vendors' },
    { id: 'materials', label: 'Material & Price' },
    { id: 'funds', label: 'Fund Traceability' },
    { id: 'documents', label: 'Documents' },
    { id: 'progress', label: 'Physical Progress' },
    { id: 'ai-analysis', label: 'AI Forensic Analysis' },
  ];

  const isHighRisk = project.riskLevel === 'HIGH' || project.riskLevel === 'CRITICAL';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 space-y-4">
      {/* Back button and quick breadcrumb */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="text-xs font-semibold text-slate-600 hover:text-gov-navy flex items-center space-x-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Projects List</span>
        </button>

        {isHighRisk && (
          <button
            onClick={() => setIsInvestigateOpen(true)}
            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded flex items-center space-x-1.5 shadow-sm animate-pulse"
          >
            <SearchCode className="w-4 h-4" />
            <span>Investigate Project (AI Risk: {project.riskScore}/100)</span>
          </button>
        )}
      </div>

      {/* 1. PROJECT HEADER HERO */}
      <div className="bg-white rounded-gov border border-gov-border p-4 sm:p-5 shadow-gov">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="font-mono text-xs font-bold px-2 py-0.5 bg-slate-100 text-slate-700 rounded border border-slate-200">
                {project.code}
              </span>
              <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-800 font-semibold rounded border border-blue-200">
                {project.category}
              </span>
              {/* Mandatory Status Segregation */}
              <span className="text-xs px-2.5 py-0.5 font-bold rounded border bg-blue-50 text-gov-navy border-blue-200">
                MPLADS Status: {project.status === 'COMPLETED' ? 'Completed' : project.status === 'DELAYED' ? 'Work in Progress (Delayed)' : 'Work in Progress'}
              </span>
              <span className={`text-xs px-2.5 py-0.5 font-semibold rounded border ${
                (project as any).tenderRef ? 'bg-indigo-50 text-indigo-900 border-indigo-200 font-bold' : 'bg-slate-100 text-slate-600 border-slate-200 italic'
              }`}>
                Procurement Status: {(project as any).tenderRef ? `Tender Published (${(project as any).tenderRef})` : 'No official tender information found in current dataset'}
              </span>
              {isHighRisk && (
                <span className="text-xs px-2 py-0.5 bg-rose-100 text-rose-800 font-bold rounded border border-rose-300 flex items-center space-x-1">
                  <AlertTriangle className="w-3 h-3 text-rose-600" />
                  <span>HIGH RISK ({project.riskScore}/100)</span>
                </span>
              )}
            </div>

            <h1 className="text-lg sm:text-xl font-bold text-gov-navy leading-tight">
              {project.name}
            </h1>
            <p className="text-xs text-slate-500 mt-1 flex items-center space-x-3">
              <span className="flex items-center space-x-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{project.village ? `${project.village}, ` : ''}{project.district}, {project.state}</span>
              </span>
              <span>•</span>
              <span className="flex items-center space-x-1">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>Hon'ble MP: <strong>{project.mpName}</strong> ({project.mpConstituency})</span>
              </span>
            </p>
          </div>

          {/* Quick Financial Snapshot */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs bg-slate-50 p-2.5 rounded border border-slate-200">
            <div>
              <span className="text-[10px] text-slate-400 block">Sanctioned</span>
              <span className="font-bold text-slate-800">₹ {(project.sanctionedAmount / 100000).toFixed(1)} L</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">Contract Value</span>
              <span className="font-bold text-gov-navy">₹ {(project.contractValue / 100000).toFixed(1)} L</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">Disbursed (74%)</span>
              <span className="font-bold text-rose-600">₹ {(project.expenditure / 100000).toFixed(2)} L</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">Physical Progress</span>
              <span className="font-bold text-amber-600">{project.physicalProgress}%</span>
            </div>
          </div>
        </div>

        {/* 2. CONNECTED PROJECT LIFECYCLE TRACKER */}
        <div className="mt-4 pt-2">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
            Standard Statutory Scrutiny & Handover Workflow
          </div>
          <div className="flex items-center justify-between overflow-x-auto pb-1 scrollbar-none text-[11px]">
            {project.lifecycleStages.map((stage, idx, arr) => (
              <React.Fragment key={stage.id}>
                <div className="flex flex-col items-center text-center min-w-[85px]">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] shadow-xs mb-1 ${
                    stage.status === 'COMPLETED'
                      ? 'bg-emerald-600 text-white'
                      : stage.status === 'IN PROGRESS'
                      ? 'bg-amber-500 text-white ring-2 ring-amber-200'
                      : 'bg-slate-200 text-slate-500'
                  }`}>
                    {stage.status === 'COMPLETED' ? '✓' : stage.stageNumber}
                  </div>
                  <span className="font-bold text-slate-800 text-[10px] leading-tight">{stage.name}</span>
                  <span className="text-[9px] text-slate-400">{stage.date || 'Pending'}</span>
                </div>
                {idx < arr.length - 1 && (
                  <div className={`h-0.5 flex-1 min-w-[15px] mx-1 ${
                    idx < 4 ? 'bg-emerald-500' : 'bg-slate-200'
                  }`}></div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* 3. TABS NAVIGATION */}
      <div className="bg-white border-b border-gov-border rounded-t-gov px-2 flex items-center space-x-1 overflow-x-auto scrollbar-none shadow-xs text-xs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-2.5 font-semibold whitespace-nowrap border-b-2 transition ${
              activeTab === tab.id
                ? 'border-gov-blue text-gov-navy font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 4. TAB CONTENTS */}
      <div className="bg-white rounded-b-gov border border-gov-border border-t-0 p-4 sm:p-6 shadow-gov">
        
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Purpose & Description */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Project Purpose & Scope
                  </h3>
                  <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded border border-slate-200">
                    {project.purpose}
                  </p>
                </div>

                <div>
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Target Beneficiaries
                  </h3>
                  <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded border border-slate-200">
                    {project.beneficiaries}
                  </p>
                </div>

                <div>
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Administrative & Geographic Location
                  </h3>
                  <div className="bg-slate-50 p-3 rounded border border-slate-200 text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-500">State:</span>
                      <span className="font-semibold text-slate-800">{project.state}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">District:</span>
                      <span className="font-semibold text-slate-800">{project.district}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Taluk / Block:</span>
                      <span className="font-semibold text-slate-800">{project.block && project.block !== 'Data Not Available' ? project.block : 'Data Not Available'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Gram Panchayat / Ward:</span>
                      <span className="font-semibold text-slate-800">{project.village && project.village !== 'Data Not Available' ? project.village : 'Data Not Available'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">GIS Coordinates:</span>
                      <span className="font-mono text-slate-700">{project.coordinates ? `${project.coordinates.lat}° N, ${project.coordinates.lng}° E` : 'Data Not Available'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Financial & Execution Summary */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Financial Summary
                  </h3>
                  <div className="bg-slate-50 p-3 rounded border border-slate-200 text-xs space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Estimated Cost:</span>
                      <span className="font-semibold text-slate-800">{project.estimatedCost ? `₹ ${(project.estimatedCost / 100000).toFixed(2)} Lakh` : 'Data Not Available'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Sanctioned Amount:</span>
                      <span className="font-semibold text-slate-800">{project.sanctionedAmount ? `₹ ${(project.sanctionedAmount / 100000).toFixed(2)} Lakh` : 'Data Not Available'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Awarded Contract Value:</span>
                      <span className="font-bold text-gov-navy">{project.contractValue && project.contractValue !== project.sanctionedAmount ? `₹ ${(project.contractValue / 100000).toFixed(2)} Lakh` : 'Data Not Available'}</span>
                    </div>
                    <div className="flex justify-between text-rose-700 font-semibold border-t border-slate-200 pt-1">
                      <span>Total Cumulative Disbursed:</span>
                      <span>{project.expenditure ? `₹ ${(project.expenditure / 100000).toFixed(2)} Lakh (${project.financialProgress}%)` : 'Data Not Available'}</span>
                    </div>
                  </div>
                </div>

                {/* Assigned Contractor Card */}
                <div>
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Assigned Contractor / Vendor
                  </h3>
                  <div className="bg-slate-50 p-3 rounded border border-slate-200 text-xs flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900 block">{project.contractorName || 'Data Not Available'}</span>
                      <span className="text-[10px] text-slate-400 font-mono">Status: {project.contractorName && project.contractorName !== 'Data Not Available' ? 'Official Vendor' : 'Data Not Available'}</span>
                    </div>
                    {project.contractorId && project.contractorId !== 'Data Not Available' && (
                      <button
                        onClick={() => navigate(`/contractors/${project.contractorId}`)}
                        className="px-2 py-1 bg-white border border-slate-300 rounded hover:bg-slate-100 font-semibold text-gov-blue"
                      >
                        View Profile
                      </button>
                    )}
                  </div>
                </div>

                {/* Key AI Forensic Alerts */}
                {project.aiAlerts.length > 0 && (
                  <div className="bg-rose-50 border border-rose-200 p-3 rounded text-xs space-y-1.5">
                    <div className="flex items-center space-x-1.5 text-rose-800 font-bold">
                      <AlertTriangle className="w-4 h-4 text-rose-600" />
                      <span>Active AI Forensic Alerts ({project.aiAlerts.length})</span>
                    </div>
                    <ul className="list-disc list-inside space-y-1 text-slate-700 text-[11px]">
                      {project.aiAlerts.map((alert, i) => (
                        <li key={i}>{alert}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: AI TIMELINE */}
        {activeTab === 'timeline' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <h3 className="text-sm font-bold text-slate-800">
                  AI Project Timeline & Delay Predictive Engine
                </h3>
              </div>
              <span className="px-2 py-0.5 bg-rose-50 border border-rose-200 text-rose-700 font-bold text-xs rounded">
                High Delay Probability
              </span>
            </div>

            {/* Delay Prediction Summary Banner */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded border border-slate-200 text-xs">
              <div>
                <span className="text-slate-500 block text-[11px]">Scheduled Completion:</span>
                <span className="font-bold text-slate-800 text-sm">30 Nov 2026</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">AI Predicted Completion:</span>
                <span className="font-bold text-rose-600 text-sm">27 Dec 2026</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Predicted Delay:</span>
                <span className="font-bold text-rose-700 text-sm">+27 Days Overrun</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Prediction Confidence:</span>
                <span className="font-bold text-emerald-700 text-sm">91% High</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded border border-slate-200">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Predictive Risk Drivers Identified by AI:
              </h4>
              <ul className="space-y-2 text-xs text-slate-700">
                <li className="flex items-start space-x-2">
                  <span className="w-4 h-4 rounded-full bg-rose-100 text-rose-700 font-bold flex items-center justify-center text-[10px] mt-0.5">!</span>
                  <span><strong>Pending Procurement Bottleneck:</strong> Cement & brick masonry procurement blocked pending invoice scrutiny on 33% rate anomaly.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="w-4 h-4 rounded-full bg-rose-100 text-rose-700 font-bold flex items-center justify-center text-[10px] mt-0.5">!</span>
                  <span><strong>Contractor Multi-Assignment Load:</strong> Executing firm has 8 concurrent active contracts across Haveli and Satara, with historical median delay of 32 days.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="w-4 h-4 rounded-full bg-amber-100 text-amber-700 font-bold flex items-center justify-center text-[10px] mt-0.5">!</span>
                  <span><strong>Lagging Task Dependencies:</strong> Superstructure column casting completed only to plinth; subsequent slab shuttering cannot proceed without cured cubes.</span>
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* TAB 5: TEAM & TASKS (KANBAN BOARD) */}
        {activeTab === 'team' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <Kanban className="w-4 h-4 text-gov-navy" />
                <h3 className="text-sm font-bold text-slate-800">
                  Execution Team & Task Board
                </h3>
              </div>
              <span className="text-xs text-slate-500">
                Executing Entity: <strong>{project.contractorName || 'Data Not Available'}</strong>
              </span>
            </div>

            {tasks.length === 0 ? (
              <div className="bg-slate-50 border border-slate-200 rounded p-6 text-center space-y-2">
                <h4 className="text-xs font-bold text-slate-700">Internal Task Breakdown: Data Not Available</h4>
                <p className="text-[11px] text-slate-500 max-w-xl mx-auto">
                  Under the statutory dataset policy, internal contractor task boards and micro-assignments are not present in the central MPLADS public dataset and are strictly displayed as "Data Not Available".
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                {/* TO DO */}
                <div className="bg-slate-50 p-3 rounded border border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-xs text-slate-700">TO DO</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.2 bg-slate-200 text-slate-700 rounded-full">
                      {tasks.filter(t => t.status === 'TO DO').length}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {tasks.filter(t => t.status === 'TO DO').map(t => (
                      <div key={t.id} className="bg-white p-2.5 rounded border border-slate-200 shadow-xs text-xs space-y-1">
                        <span className="font-bold text-slate-800 block">{t.title}</span>
                        <span className="text-[10px] text-slate-500 block">Assigned: {t.assignedTo} ({t.department})</span>
                        <div className="flex justify-between items-center text-[10px] pt-1 border-t border-slate-100">
                          <span className="text-slate-400">Due: {t.deadline}</span>
                          <span className="font-bold text-slate-600 bg-slate-100 px-1 py-0.2 rounded">{t.priority}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* IN PROGRESS */}
                <div className="bg-amber-50/50 p-3 rounded border border-amber-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-xs text-amber-800">IN PROGRESS</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.2 bg-amber-200 text-amber-800 rounded-full">
                      {tasks.filter(t => t.status === 'IN PROGRESS').length}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {tasks.filter(t => t.status === 'IN PROGRESS').map(t => (
                      <div key={t.id} className="bg-white p-2.5 rounded border border-amber-200 shadow-xs text-xs space-y-1">
                        <span className="font-bold text-slate-800 block">{t.title}</span>
                        <span className="text-[10px] text-slate-500 block">Lead: {t.assignedTo}</span>
                        <span className="text-[10px] text-amber-700 font-semibold block">{t.priority}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* BLOCKED */}
                <div className="bg-rose-50/50 p-3 rounded border border-rose-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-xs text-rose-800">BLOCKED</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.2 bg-rose-200 text-rose-800 rounded-full">
                      {tasks.filter(t => t.status === 'BLOCKED').length}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {tasks.filter(t => t.status === 'BLOCKED').map(t => (
                      <div key={t.id} className="bg-white p-2.5 rounded border border-rose-200 shadow-xs text-xs space-y-1">
                        <span className="font-bold text-slate-800 block">{t.title}</span>
                        <span className="text-[10px] text-rose-600 block">Lead: {t.assignedTo}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* DONE */}
                <div className="bg-emerald-50/50 p-3 rounded border border-emerald-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-xs text-emerald-800">DONE</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.2 bg-emerald-200 text-emerald-800 rounded-full">
                      {tasks.filter(t => t.status === 'DONE').length}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {tasks.filter(t => t.status === 'DONE').map(t => (
                      <div key={t.id} className="bg-white p-2.5 rounded border border-emerald-200 shadow-xs text-xs space-y-1">
                        <span className="font-bold text-slate-800 block">{t.title}</span>
                        <span className="text-[10px] text-slate-500 block">Lead: {t.assignedTo}</span>
                        <span className="text-[10px] text-emerald-600 block">✓ Verified</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 7: MATERIALS & PRICE INTELLIGENCE */}
        {activeTab === 'materials' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <Percent className="w-4 h-4 text-gov-blue" />
                <h3 className="text-sm font-bold text-slate-800">
                  Material & Product Price Intelligence
                </h3>
              </div>
              <span className="text-xs text-slate-500">
                Official Schedule of Rates
              </span>
            </div>

            {materials.length === 0 ? (
              <div className="bg-slate-50 border border-slate-200 rounded p-6 text-center space-y-2">
                <h4 className="text-xs font-bold text-slate-700">Material & Price Breakdown: Data Not Available</h4>
                <p className="text-[11px] text-slate-500 max-w-xl mx-auto">
                  In accordance with the Strict Dataset-Only Rule, material quantities and procurement bills are marked as "Data Not Available" because central MPLADS public records report milestone project sanctions and disbursements rather than itemized bills of materials.
                </p>
              </div>
            ) : (
              <table className="w-full text-left gov-table">
                <thead>
                  <tr>
                    <th>Material</th>
                    <th>Quantity</th>
                    <th>Unit</th>
                    <th>Reported Price</th>
                    <th>Benchmark Price</th>
                    <th>Deviation</th>
                    <th>Vendor</th>
                    <th>Invoice Ref</th>
                    <th>AI Risk Status</th>
                  </tr>
                </thead>
                <tbody>
                  {materials.map(m => (
                    <tr key={m.id} className={m.deviationPercent > 20 ? 'bg-rose-50/50' : ''}>
                      <td className="font-bold text-slate-900">{m.materialName}</td>
                      <td>{m.quantity.toLocaleString()}</td>
                      <td>{m.unit}</td>
                      <td className="font-bold text-slate-900">₹ {m.reportedPrice.toLocaleString()}</td>
                      <td className="font-medium text-emerald-700">₹ {m.benchmarkPrice.toLocaleString()}</td>
                      <td className={`font-black ${m.deviationPercent > 20 ? 'text-rose-600' : 'text-slate-700'}`}>
                        +{m.deviationPercent.toFixed(1)}%
                      </td>
                      <td className="text-xs">{m.vendorName}</td>
                      <td className="font-mono text-xs text-slate-500">{m.invoiceId}</td>
                      <td>
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded border ${
                          m.riskLevel === 'HIGH' 
                            ? 'bg-rose-100 text-rose-800 border-rose-300' 
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}>
                          {m.riskLevel === 'HIGH' ? 'AI Risk Indicator' : 'AI Analysis'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* TAB 8: FUND TRACEABILITY */}
        {activeTab === 'funds' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <IndianRupee className="w-4 h-4 text-gov-green" />
                <h3 className="text-sm font-bold text-slate-800">
                  End-to-End Fund Flow Traceability
                </h3>
              </div>
              <span className="text-xs font-semibold text-gov-navy">
                e-SAKSHI Verified Disbursement
              </span>
            </div>

            {/* Visual Fund Flow Stepper */}
            <div className="bg-slate-50 p-4 rounded border border-slate-200">
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                Verified Financial Value Chain
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="p-2 bg-white rounded border border-slate-200 text-center min-w-[110px]">
                  <span className="text-[10px] text-slate-400 block">MPLADS Sanction</span>
                  <span className="font-bold text-slate-900">{project.sanctionedAmount ? `₹ ${(project.sanctionedAmount / 100000).toFixed(2)} Lakh` : 'Data Not Available'}</span>
                </div>
                <div className="text-slate-400 font-bold">→</div>
                <div className="p-2 bg-white rounded border border-slate-200 text-center min-w-[110px]">
                  <span className="text-[10px] text-slate-400 block">Contract Value</span>
                  <span className="font-bold text-slate-900">{project.contractValue && project.contractValue !== project.sanctionedAmount ? `₹ ${(project.contractValue / 100000).toFixed(2)} Lakh` : 'Data Not Available'}</span>
                </div>
                <div className="text-slate-400 font-bold">→</div>
                <div className="p-2 bg-white rounded border border-slate-200 text-center min-w-[110px]">
                  <span className="text-[10px] text-slate-400 block">Disbursed to Cont.</span>
                  <span className="font-bold text-gov-navy">{project.expenditure ? `₹ ${(project.expenditure / 100000).toFixed(2)} Lakh` : 'Data Not Available'}</span>
                </div>
                <div className="text-slate-400 font-bold">→</div>
                <div className="p-2 bg-white rounded border border-slate-200 text-center min-w-[110px]">
                  <span className="text-[10px] text-slate-400 block">Vendor Invoiced</span>
                  <span className="font-bold text-slate-900">{project.expenditure ? `₹ ${(project.expenditure / 100000).toFixed(2)} Lakh` : 'Data Not Available'}</span>
                </div>
                <div className="text-slate-400 font-bold">→</div>
                <div className="p-2 bg-white rounded border border-slate-200 text-center min-w-[110px]">
                  <span className="text-[10px] text-slate-400 block">Physical Progress</span>
                  <span className="font-bold text-amber-600">43% Certified</span>
                </div>
              </div>
            </div>

            {/* Disparity Analysis */}
            <div className="p-4 bg-rose-50 border border-rose-200 rounded text-xs space-y-2">
              <span className="font-bold text-rose-900 block text-sm">
                Payment-Progress Mismatch Alert (Variance: 31%)
              </span>
              <p className="text-slate-700 leading-relaxed">
                74% of the contracted allocation has been drawn from the treasury, whereas the latest joint measurement book certifies only 43% physical asset execution on site.
                Under GFR Rule 211, payment certificates must correspond to completed measurable milestones.
              </p>
            </div>
          </div>
        )}

        {/* TAB 9: DOCUMENTS */}
        {activeTab === 'documents' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-800">
                Official Document Vault & Verification Records
              </h3>
              <span className="text-xs text-slate-500">{documents.length} Archival Records</span>
            </div>

            <table className="w-full text-left gov-table">
              <thead>
                <tr>
                  <th>Document Title</th>
                  <th>Category</th>
                  <th>Uploaded By</th>
                  <th>Date</th>
                  <th>Ref Number</th>
                  <th>Verification</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {documents.map(d => (
                  <tr key={d.id}>
                    <td className="font-bold text-slate-900 flex items-center space-x-1.5">
                      <FileText className="w-3.5 h-3.5 text-slate-400" />
                      <span>{d.title}</span>
                    </td>
                    <td>{d.type}</td>
                    <td className="text-xs text-slate-600">{d.uploadedBy}</td>
                    <td className="text-xs text-slate-600">{d.uploadDate}</td>
                    <td className="font-mono text-xs text-slate-500">{d.documentRefNo}</td>
                    <td>
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded border ${
                        d.verificationStatus === 'VERIFIED'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}>
                        {d.verificationStatus}
                      </span>
                    </td>
                    <td className="text-right">
                      <button 
                        onClick={() => alert(`Downloading verified copy of ${d.title} (${d.fileSize})`)}
                        className="text-gov-blue hover:text-gov-navy text-xs font-semibold px-2 py-0.5 rounded hover:bg-blue-50"
                      >
                        Download ({d.fileSize})
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 10: CITIZEN PLAIN-LANGUAGE PROGRESS REPORT */}
        {activeTab === 'progress' && (
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-gov-navy flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>Citizen Progress Report & Milestone Narrative</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Plain-language public progress summary derived from verified ground measurement books and milestone records.
                </p>
              </div>
              <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                <Calendar className="w-3.5 h-3.5 text-primary" />
                <span>Last Updated: 20 Sep 2024</span>
              </div>
            </div>

            {/* Plain-Language Narrative Summary Card */}
            <div className="p-5 bg-gradient-to-r from-blue-50/70 to-slate-50 border border-blue-200/80 rounded-xl space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-gov-navy block">
                Executive Status Narrative
              </span>
              <p className="text-sm text-slate-800 leading-relaxed">
                This project was sanctioned on <strong>15 Jan 2024</strong>. As of <strong>20 Sep 2024</strong>, it is <strong>68% physically complete</strong>. The most recent verified milestone was <strong>"Sub-base Concrete Layer Laid"</strong> recorded on <strong>12 Aug 2024</strong>. This work is currently proceeding under routine execution standards in accordance with statutory district guidelines.
              </p>
            </div>

            {/* Visual Progress Bar */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Overall Physical Progress</span>
                <span className="text-sm font-extrabold text-gov-navy">68% Complete</span>
              </div>
              <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
                <div 
                  className="h-full bg-gradient-to-r from-blue-600 to-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: '68%' }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 pt-1 font-semibold">
                <span>Sanction (0%)</span>
                <span>Sub-base (50%)</span>
                <span>Final Certification (100%)</span>
              </div>
            </div>

            {/* Verified Milestone Timeline */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Chronological Milestone Verification Timeline
              </h4>

              <div className="space-y-4 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-200">
                {[
                  { title: "Administrative Sanction Issued", date: "15 Jan 2024", status: "COMPLETED", note: "Formal sanction approved by District Authority." },
                  { title: "Site Mobilization & Excavation", date: "28 Feb 2024", status: "COMPLETED", note: "Ground clearing and foundation boundary marked." },
                  { title: "Sub-base Concrete Layer Laid", date: "12 Aug 2024", status: "COMPLETED", note: "Civil pavement sub-base completed and verified by technical cell." },
                  { title: "Top Surface Paving & Drainage Curing", date: "Target: 15 Oct 2024", status: "IN_PROGRESS", note: "Bituminous wearing course application in progress." },
                  { title: "Final Public Commissioning & Joint Inspection", date: "Target: 30 Nov 2024", status: "UPCOMING", note: "Formal handover to Gram Panchayat." }
                ].map((item, idx) => (
                  <div key={idx} className="relative flex items-start gap-4 pl-8">
                    <div className={`absolute left-2 top-0.5 w-3.5 h-3.5 rounded-full border-2 bg-white ${
                      item.status === 'COMPLETED' ? 'border-emerald-500 bg-emerald-500' :
                      item.status === 'IN_PROGRESS' ? 'border-blue-600 bg-blue-600' : 'border-slate-300'
                    }`} />
                    <div className="flex-1 bg-slate-50 p-3.5 rounded-lg border border-slate-200 text-xs">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                        <span className="font-bold text-slate-900">{item.title}</span>
                        <span className="text-[11px] font-mono text-slate-500 font-semibold">{item.date}</span>
                      </div>
                      <p className="text-slate-600">{item.note}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* OTHER TABS FALLBACK CONTENT */}
        {(activeTab === 'tender' || activeTab === 'contract' || activeTab === 'vendors' || activeTab === 'ai-analysis') && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-800 capitalize">
                {activeTab.replace('-', ' ')} Summary
              </h3>
              <button
                onClick={() => setIsInvestigateOpen(true)}
                className="px-3 py-1 bg-gov-navy text-white text-xs font-bold rounded flex items-center space-x-1"
              >
                <SearchCode className="w-3.5 h-3.5" />
                <span>Open Forensic Dossier</span>
              </button>
            </div>

            <div className="p-4 bg-slate-50 rounded border border-slate-200 text-xs space-y-2">
              <p className="text-slate-700">
                Detailed statutory data for <strong>{project.name}</strong> ({project.code}) under tab <strong>{activeTab}</strong>.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="bg-white p-2.5 rounded border border-slate-200">
                  <span className="text-[10px] text-slate-400 block">Executing Agency</span>
                  <span className="font-bold text-slate-800">{project.contractorName}</span>
                </div>
                <div className="bg-white p-2.5 rounded border border-slate-200">
                  <span className="text-[10px] text-slate-400 block">Superintending Division</span>
                  <span className="font-bold text-slate-800">ZP Works Division, Haveli</span>
                </div>
                <div className="bg-white p-2.5 rounded border border-slate-200">
                  <span className="text-[10px] text-slate-400 block">AI Risk Status</span>
                  <span className="font-bold text-rose-600">{project.riskScore}/100 High Risk</span>
                </div>
                <div className="bg-white p-2.5 rounded border border-slate-200">
                  <span className="text-[10px] text-slate-400 block">Audit Status</span>
                  <span className="font-bold text-amber-600">Verification Pending</span>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Investigation Modal */}
      <InvestigationModal
        projectId={project.id}
        isOpen={isInvestigateOpen}
        onClose={() => setIsInvestigateOpen(false)}
      />
    </div>
  );
};
