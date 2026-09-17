import React, { useState } from 'react';
import { HeroBanner } from '../components/HeroBanner';
import { KPIStatCards } from '../components/KPIStatCards';
import { IndiaProjectMap } from '../components/IndiaProjectMap';
import { FundUtilization } from '../components/FundUtilization';
import { ProjectLifecycleTimeline } from '../components/ProjectLifecycleTimeline';
import { AIInsightsWidget } from '../components/AIInsightsWidget';
import { MPGeographicalClustering } from '../components/MPGeographicalClustering';
import { RecentProjectsTable } from '../components/RecentProjectsTable';
import { ContractsTable } from '../components/ContractsTable';
import { VendorMarketplaceTable } from '../components/VendorMarketplaceTable';
import { InvestigationModal } from '../components/InvestigationModal';
import { VendorRegistrationModal } from '../components/VendorRegistrationModal';
import { SHOWCASE_PROJECT_ID } from '../data/mockData';
import { ShieldCheck, Info, CheckCircle2, AlertTriangle, ArrowRight, Sparkles, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DataTrustPanel } from '../components/national/DataTrustPanel';
import { getDataTrustMetadata } from '../services/nationalDataPipelineService';
import { MasterWorkflowDemoModal } from '../components/demo/MasterWorkflowDemoModal';

export const DashboardPage: React.FC = () => {
  const [investigatingProjectId, setInvestigatingProjectId] = useState<string | null>(null);
  const [vendorModalOpen, setVendorModalOpen] = useState<boolean>(false);
  const [dataMode, setDataMode] = useState<'REAL_DATA_MODE' | 'DEMO_MODE_SYNTHETIC'>('REAL_DATA_MODE');
  const [demoModalOpen, setDemoModalOpen] = useState<boolean>(false);
  const navigate = useNavigate();

  const trustMetadata = getDataTrustMetadata(dataMode);

  const handleOpenInvestigation = (projectId: string) => {
    setInvestigatingProjectId(projectId);
  };

  const handleCloseInvestigation = () => {
    setInvestigatingProjectId(null);
  };

  return (
    <div className="space-y-4">
      {/* JUDICIAL DATA TRUST PANEL */}
      <DataTrustPanel 
        metadata={trustMetadata} 
        compact={true} 
        onToggleMode={() => setDataMode(prev => prev === 'REAL_DATA_MODE' ? 'DEMO_MODE_SYNTHETIC' : 'REAL_DATA_MODE')} 
      />

      {/* PROMINENT CORE JOURNEY DEMO CALLOUT BANNER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-2">
        <div className="bg-gradient-to-r from-gov-navy via-[#102a4e] to-gov-navy text-white p-3.5 rounded-gov border border-gov-border shadow-md flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gov-gold/20 rounded-md border border-gov-gold/40 text-gov-gold shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] px-2 py-0.5 rounded bg-gov-gold text-gov-navy font-bold uppercase tracking-wider">
                  OFFICIAL EVALUATOR DEMO
                </span>
                <h3 className="font-bold text-sm text-white">
                  12-Step Integrated Core User Journey
                </h3>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Experience end-to-end integration: State &rarr; District &rarr; Village &rarr; Project History &rarr; Delayed Work &rarr; Contractor Intelligence &rarr; Tender Opportunity &rarr; AI Risk.
              </p>
            </div>
          </div>

          <button
            onClick={() => setDemoModalOpen(true)}
            className="px-4 py-2.5 bg-gov-gold hover:bg-amber-400 text-gov-navy font-black text-xs uppercase tracking-wider rounded shadow-md flex items-center space-x-2 transition-all hover:scale-105 shrink-0"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>LAUNCH RURAL DEVELOPMENT & CONTRACTOR OPPORTUNITY DEMO</span>
          </button>
        </div>
      </div>

      {/* 1. HERO BANNER */}
      <HeroBanner />

      {/* Main Container Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
        
        {/* 2. TOP KPI STAT CARDS (7 CARDS ROW) - Exactly matching screenshot */}
        <KPIStatCards />

        {/* 3. MIDDLE SECTION: INDIA MAP | FUND UTILIZATION | LIFECYCLE & AI ALERTS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          
          {/* Left Column: Project Map - India (4 Cols) */}
          <div className="lg:col-span-4 h-full">
            <IndiaProjectMap />
          </div>

          {/* Center Column: Fund Utilization (FY 2025-26) (4 Cols) */}
          <div className="lg:col-span-4 h-full">
            <FundUtilization />
          </div>

          {/* Right Column: Project Lifecycle (Top) & AI Insights (Bottom) (4 Cols) */}
          <div className="lg:col-span-4 flex flex-col space-y-4">
            <div className="flex-1">
              <ProjectLifecycleTimeline />
            </div>
            <div className="flex-1">
              <AIInsightsWidget onInvestigate={handleOpenInvestigation} />
            </div>
          </div>

        </div>

        {/* 4. DEDICATED SECTION: MP GEOGRAPHICAL CLUSTERING & FUND UTILIZATION TRACKER */}
        <MPGeographicalClustering />

        {/* 5. BOTTOM SECTION: 3 EQUAL DATA TABLES */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 pb-6">
          {/* Table 1: Recent Projects */}
          <div>
            <RecentProjectsTable onInvestigate={handleOpenInvestigation} />
          </div>

          {/* Table 2: Contracts & Contractors */}
          <div>
            <ContractsTable />
          </div>

          {/* Table 3: Vendor Marketplace */}
          <div>
            <VendorMarketplaceTable onRegisterClick={() => setVendorModalOpen(true)} />
          </div>
        </div>

      </div>

      {/* MODALS */}
      {investigatingProjectId && (
        <InvestigationModal
          projectId={investigatingProjectId}
          isOpen={!!investigatingProjectId}
          onClose={handleCloseInvestigation}
        />
      )}

      <VendorRegistrationModal
        isOpen={vendorModalOpen}
        onClose={() => setVendorModalOpen(false)}
      />

      {/* 12-Step Integrated Core User Journey Guided Demo Modal */}
      <MasterWorkflowDemoModal
        isOpen={demoModalOpen}
        onClose={() => setDemoModalOpen(false)}
      />
    </div>
  );
};
