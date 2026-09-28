import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  OPPORTUNITIES_DATA, 
  calculateOpportunityKPIs 
} from '../data/contractorOpportunitiesData';
import { OpportunityRecord, OpportunityFilterState } from '../types/contractorOpportunity';
import { OpportunityKPICards } from '../components/opportunities/OpportunityKPICards';
import { OpportunityFilterToolbar } from '../components/opportunities/OpportunityFilterToolbar';
import { OpportunityTable } from '../components/opportunities/OpportunityTable';
import { OpportunityMatchingCard } from '../components/opportunities/OpportunityMatchingCard';
import { ContractorInterestModal } from '../components/opportunities/ContractorInterestModal';
import { InformationalAlertsModal } from '../components/opportunities/InformationalAlertsModal';
import { 
  Briefcase, 
  AlertCircle, 
  Info, 
  Bell, 
  ExternalLink, 
  Sparkles, 
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

export const OpportunitiesPage: React.FC = () => {
  const navigate = useNavigate();

  // Selected opportunity for Express Interest modal
  const [selectedOpportunity, setSelectedOpportunity] = useState<OpportunityRecord | null>(null);
  const [interestModalOpen, setInterestModalOpen] = useState(false);
  const [alertsModalOpen, setAlertsModalOpen] = useState(false);

  // Filters
  const initialFilters: OpportunityFilterState = {
    state: 'All States',
    district: 'All Districts',
    constituency: 'All Constituencies',
    sector: 'All Sectors',
    projectStatus: 'All Statuses',
    procurementStatus: 'All Procurement',
    valueRange: 'All Values',
    recommendationDate: '',
    sanctionDate: '',
    tenderPublicationDate: '',
    tenderClosingDate: '',
    officialSource: 'All Sources'
  };

  const [filters, setFilters] = useState<OpportunityFilterState>(initialFilters);

  // Apply filters dynamically
  const filteredRecords = useMemo(() => {
    return OPPORTUNITIES_DATA.filter(r => {
      if (filters.state !== 'All States' && r.state !== filters.state) return false;
      if (filters.district !== 'All Districts' && r.district !== filters.district) return false;
      if (filters.constituency !== 'All Constituencies' && r.constituency !== filters.constituency) return false;
      if (filters.sector !== 'All Sectors' && r.sector !== filters.sector) return false;
      if (filters.projectStatus !== 'All Statuses' && r.currentStatus !== filters.projectStatus) return false;

      if (filters.officialSource !== 'All Sources') {
        if (!r.officialSource || r.officialSource.source_type !== filters.officialSource) return false;
      }

      if (filters.valueRange !== 'All Values') {
        const cost = r.estimatedCost || 0;
        if (filters.valueRange === 'under_10L' && cost >= 1000000) return false;
        if (filters.valueRange === '10L_25L' && (cost < 1000000 || cost > 2500000)) return false;
        if (filters.valueRange === '25L_50L' && (cost < 2500000 || cost > 5000000)) return false;
        if (filters.valueRange === 'above_50L' && cost <= 5000000) return false;
      }

      if (filters.recommendationDate && (!r.recommendationDate || r.recommendationDate < filters.recommendationDate)) return false;
      if (filters.tenderPublicationDate && (!r.tenderPublicationDate || r.tenderPublicationDate < filters.tenderPublicationDate)) return false;
      if (filters.tenderClosingDate && (!r.tenderClosingDate || r.tenderClosingDate > filters.tenderClosingDate)) return false;

      return true;
    });
  }, [filters]);

  const kpis = useMemo(() => calculateOpportunityKPIs(filteredRecords), [filteredRecords]);

  const handleOpenInterestModal = (opp: OpportunityRecord) => {
    setSelectedOpportunity(opp);
    setInterestModalOpen(true);
  };

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-4 space-y-5">
      
      {/* 1. Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-gov-border pb-3">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-gov-navy text-white">
              Public Procurement & Works Discovery
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center space-x-1">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              <span>Government Source Verified</span>
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-gov-navy tracking-tight mt-1">
            Upcoming Projects & Contractor Opportunities
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Explore publicly available MPLADS works and officially published procurement opportunities.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={() => setAlertsModalOpen(true)}
            className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold rounded shadow-xs flex items-center space-x-1.5"
          >
            <Bell className="w-3.5 h-3.5 text-amber-600" />
            <span>Set Procurement Alert</span>
          </button>
          <button
            onClick={() => navigate('/contractor-dashboard')}
            className="px-3 py-1.5 bg-gov-navy hover:bg-gov-navy-light text-white text-xs font-bold rounded shadow-xs transition"
          >
            My Interested Projects
          </button>
        </div>
      </div>

      {/* 2. Mandatory Prominent Banner (Strict Separation Rule) */}
      <div className="p-3.5 bg-blue-50/90 border-l-4 border-gov-navy rounded-r text-xs text-slate-800 space-y-1 shadow-xs">
        <div className="flex items-center space-x-2 font-bold text-gov-navy">
          <Info className="w-4 h-4 text-gov-navy shrink-0" />
          <span>Notice on Public Works & Procurement Status</span>
        </div>
        <p className="leading-relaxed text-slate-700 font-medium">
          "Important: Project recommendation or sanction does not itself constitute an open tender. Procurement participation is subject to the official procurement authority and applicable rules."
        </p>
      </div>

      {/* 3. KPI Cards */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-gov-navy uppercase tracking-wider">
            Verified Procurement & Pipeline Indicators
          </h2>
          <span className="text-[11px] text-slate-500">
            Calculated from {filteredRecords.length} active opportunities
          </span>
        </div>
        <OpportunityKPICards kpis={kpis} />
      </div>

      {/* 4. Filter Toolbar */}
      <OpportunityFilterToolbar
        records={OPPORTUNITIES_DATA}
        filters={filters}
        onFilterChange={setFilters}
        onReset={() => setFilters(initialFilters)}
      />

      {/* 5. AI-Assisted Opportunity Discovery & Capability Matcher */}
      <OpportunityMatchingCard records={OPPORTUNITIES_DATA} />

      {/* 6. Opportunity Table */}
      <OpportunityTable
        records={filteredRecords}
        onExpressInterest={handleOpenInterestModal}
      />

      {/* Contractor Interest Modal */}
      <ContractorInterestModal
        isOpen={interestModalOpen}
        onClose={() => setInterestModalOpen(false)}
        opportunity={selectedOpportunity}
        onSuccess={() => {
          // Keep open on confirmation screen
        }}
      />

      {/* Informational Alerts Modal */}
      <InformationalAlertsModal
        isOpen={alertsModalOpen}
        onClose={() => setAlertsModalOpen(false)}
      />

    </div>
  );
};
