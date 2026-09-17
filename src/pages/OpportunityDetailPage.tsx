import React, { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { OPPORTUNITIES_DATA } from '../data/contractorOpportunitiesData';
import { SourceVerificationBadge } from '../components/opportunities/SourceVerificationBadge';
import { OpportunityLifecycleTimeline } from '../components/opportunities/OpportunityLifecycleTimeline';
import { ContractorInterestModal } from '../components/opportunities/ContractorInterestModal';
import { 
  ArrowLeft, 
  ExternalLink, 
  Send, 
  Building2, 
  Calendar, 
  Award, 
  Flame, 
  Clock, 
  ShieldCheck, 
  FileText, 
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const OpportunityDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [interestModalOpen, setInterestModalOpen] = useState(false);

  const opportunity = useMemo(() => {
    return OPPORTUNITIES_DATA.find(r => r.id === id || r.projectId === id);
  }, [id]);

  if (!opportunity) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center space-y-4">
        <div className="p-4 bg-amber-100 rounded-full w-16 h-16 mx-auto flex items-center justify-center text-amber-800">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-gov-navy">Opportunity Record Not Found</h2>
        <p className="text-xs text-slate-600 max-w-md mx-auto">
          The requested opportunity identifier "{id}" does not exist in the active public works registry.
        </p>
        <button
          onClick={() => navigate('/opportunities')}
          className="px-4 py-2 bg-gov-navy text-white text-xs font-bold rounded shadow-xs"
        >
          Return to Opportunities Index
        </button>
      </div>
    );
  }

  const formatMoney = (amt: number | null) => {
    if (amt === null || amt === undefined) return <span className="text-slate-400 italic">Not available in source data</span>;
    if (amt >= 10000000) return `₹${(amt / 10000000).toFixed(2)} Crore`;
    if (amt >= 100000) return `₹${(amt / 100000).toFixed(2)} Lakhs`;
    return `₹${amt.toLocaleString()}`;
  };

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-5 space-y-5">
      
      {/* Back Breadcrumb */}
      <div className="flex items-center justify-between text-xs">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-1 text-gov-navy hover:text-blue-700 font-semibold"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Opportunities</span>
        </button>
        <div className="text-slate-500 hidden sm:block">
          Opportunities &gt; {opportunity.state} &gt; {opportunity.district} &gt; <span className="font-semibold text-slate-800">{opportunity.projectId}</span>
        </div>
      </div>

      {/* Main Header Card */}
      <div className="bg-white rounded-gov border border-gov-border shadow-gov p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-gov-border pb-4">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2 flex-wrap gap-y-1">
              <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-gov-navy text-white">
                {opportunity.projectId}
              </span>
              <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                opportunity.currentStatus === 'Tender Open'
                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                  : opportunity.currentStatus === 'Procurement/Tender Published'
                  ? 'bg-blue-100 text-blue-900 border border-blue-300'
                  : opportunity.currentStatus === 'Sanctioned'
                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                  : 'bg-slate-100 text-slate-700'
              }`}>
                Current Status: {opportunity.currentStatus}
              </span>
              <SourceVerificationBadge status={opportunity.verificationStatus} note={opportunity.verificationNote} />
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-gov-navy tracking-tight leading-snug">
              {opportunity.workName}
            </h1>
            <p className="text-xs text-slate-600">
              Sector: <strong>{opportunity.sector}</strong> • Location: <strong>{opportunity.location}</strong> ({opportunity.district}, {opportunity.state})
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {opportunity.officialSource && (
              <a
                href={opportunity.officialSource.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 text-xs font-bold rounded shadow-xs flex items-center space-x-1.5 transition"
              >
                <span>VIEW OFFICIAL SOURCE</span>
                <ExternalLink className="w-3.5 h-3.5 text-blue-700" />
              </a>
            )}

            <button
              onClick={() => setInterestModalOpen(true)}
              className="px-4 py-2 bg-gov-navy hover:bg-gov-navy-light text-white text-xs font-bold rounded shadow-gov flex items-center space-x-1.5 transition"
            >
              <Send className="w-3.5 h-3.5" />
              <span>EXPRESS INTEREST</span>
            </button>
          </div>
        </div>

        {/* Legal Disclaimer Box */}
        <div className="p-3 bg-blue-50/70 border border-blue-200 rounded text-[11px] text-blue-950 leading-relaxed">
          ℹ️ <strong>Governance Protocol Notice:</strong> Project recommendation or administrative sanction does not itself constitute an open tender. Participation in public procurement is conducted strictly through the designated official tendering portal under statutory procurement guidelines.
        </div>
      </div>

      {/* 2-Column Deep Detail View: Project Overview & Procurement Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* Box A: PROJECT OVERVIEW */}
        <div className="bg-white rounded-gov border border-gov-border shadow-gov p-5 space-y-4">
          <div className="border-b border-gov-border pb-2 flex items-center space-x-2">
            <Building2 className="w-4 h-4 text-gov-navy" />
            <h2 className="text-xs font-bold text-gov-navy uppercase tracking-wider">
              PROJECT OVERVIEW
            </h2>
          </div>

          <div className="space-y-2.5 text-xs text-slate-700">
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Project Identifier</span>
              <span className="font-mono font-bold text-slate-900">{opportunity.projectId}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Work Category & Sector</span>
              <span className="font-medium text-slate-900">{opportunity.sector}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">State & District</span>
              <span className="font-medium text-slate-900">{opportunity.district}, {opportunity.state}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Village / Local Site</span>
              <span className="font-medium text-slate-900">{opportunity.location || 'Not available in source data'}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Parliamentary Constituency</span>
              <span className="font-medium text-slate-900">{opportunity.constituency}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Hon'ble Member of Parliament</span>
              <span className="font-medium text-slate-900">{opportunity.mpName}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Current MPLADS Status</span>
              <span className="font-bold text-gov-navy">{opportunity.currentStatus}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Estimated / Approved Cost</span>
              <span className="font-mono font-bold text-emerald-800">{formatMoney(opportunity.estimatedCost)}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">MP Recommendation Date</span>
              <span className="font-medium text-slate-900">{opportunity.recommendationDate || 'Not available in source data'}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">District Sanction Date</span>
              <span className="font-medium text-slate-900">{opportunity.sanctionDate || 'Not available in source data'}</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-500">Implementation Authority</span>
              <span className="font-medium text-slate-900 text-right">{opportunity.tenderingAuthority || 'Not available in source data'}</span>
            </div>
          </div>
        </div>

        {/* Box B: PROCUREMENT INFORMATION */}
        <div className="bg-white rounded-gov border border-gov-border shadow-gov p-5 space-y-4 flex flex-col justify-between">
          <div>
            <div className="border-b border-gov-border pb-2 flex items-center space-x-2">
              <FileText className="w-4 h-4 text-gov-navy" />
              <h2 className="text-xs font-bold text-gov-navy uppercase tracking-wider">
                PROCUREMENT INFORMATION
              </h2>
            </div>

            <div className="space-y-2.5 text-xs text-slate-700 mt-3">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Procurement / Tender Status</span>
                <span className="font-bold text-slate-900">{opportunity.tenderStatus || 'Not available in source data'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Tender / NIT Reference Number</span>
                <span className="font-mono font-bold text-slate-900">{opportunity.tenderReference || 'Not available in source data'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Tendering Authority</span>
                <span className="font-medium text-slate-900 text-right">{opportunity.tenderingAuthority || 'Not available in source data'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Tender Publication Date</span>
                <span className="font-medium text-slate-900">{opportunity.tenderPublicationDate || 'Not available in source data'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Bid Closing Date & Time</span>
                <span className="font-bold text-amber-800 font-mono">{opportunity.tenderClosingDate || 'Not available in source data'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Official Portal Name</span>
                <span className="font-medium text-slate-900">{opportunity.officialSource?.source_name || 'Not available in source data'}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">Portal Verification Date</span>
                <span className="font-medium text-slate-900">{opportunity.officialSource?.last_verified || 'Not available in source data'}</span>
              </div>
            </div>
          </div>

          {/* Official Source Callout Card */}
          {opportunity.officialSource ? (
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-gov space-y-2 mt-4">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold text-slate-800">Direct Government Portal Access:</span>
                <span className="font-mono text-slate-500">{opportunity.officialSource.source_type}</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-tight">
                To download official bidding documents, schedule of rates, technical specifications, and submit bids, access the custodial portal directly:
              </p>
              <a
                href={opportunity.officialSource.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2 bg-gov-navy hover:bg-gov-navy-light text-white text-xs font-bold rounded shadow-xs flex items-center justify-center space-x-2 transition"
              >
                <span>VIEW OFFICIAL SOURCE</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          ) : (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded text-center text-slate-500 text-xs italic mt-4">
              No procurement source is officially linked to this preliminary record.
            </div>
          )}
        </div>

      </div>

      {/* 7-Stage Lifecycle Timeline */}
      <OpportunityLifecycleTimeline stages={opportunity.timelineStages} />

      {/* Express Interest Modal */}
      <ContractorInterestModal
        isOpen={interestModalOpen}
        onClose={() => setInterestModalOpen(false)}
        opportunity={opportunity}
      />

    </div>
  );
};
