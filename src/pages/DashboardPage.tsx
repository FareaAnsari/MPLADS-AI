import React, { useState } from 'react';
import { HeroBanner } from '../components/HeroBanner';
import { KPIStatCards } from '../components/KPIStatCards';
import { IndiaProjectMap } from '../components/IndiaProjectMap';
import { FundUtilization } from '../components/FundUtilization';
import { ProjectLifecycleTimeline } from '../components/ProjectLifecycleTimeline';
import { AIInsightsWidget } from '../components/AIInsightsWidget';
import { RecentProjectsTable } from '../components/RecentProjectsTable';
import { ContractsTable } from '../components/ContractsTable';
import { VendorMarketplaceTable } from '../components/VendorMarketplaceTable';
import { InvestigationModal } from '../components/InvestigationModal';
import { VendorRegistrationModal } from '../components/VendorRegistrationModal';
import { SHOWCASE_PROJECT_ID } from '../data/mockData';
import { ShieldCheck, Info, CheckCircle2, AlertTriangle, ArrowRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DataTrustPanel } from '../components/national/DataTrustPanel';
import { getDataTrustMetadata } from '../services/nationalDataPipelineService';

export const DashboardPage: React.FC = () => {
  const [investigatingProjectId, setInvestigatingProjectId] = useState<string | null>(null);
  const [vendorModalOpen, setVendorModalOpen] = useState<boolean>(false);
  const navigate = useNavigate();

  const trustMetadata = getDataTrustMetadata('REAL_DATA_MODE');

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
      />

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

        {/* 4. BOTTOM SECTION: 3 EQUAL DATA TABLES */}
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
    </div>
  );
};
