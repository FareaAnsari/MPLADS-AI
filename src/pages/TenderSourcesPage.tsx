import React from 'react';
import { OFFICIAL_PROCUREMENT_PORTALS } from '../data/contractorOpportunitiesData';
import { 
  Database, 
  ExternalLink, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowLeft, 
  Globe, 
  Lock,
  Building 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const TenderSourcesPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-5 space-y-6">
      
      {/* Back Button */}
      <button
        onClick={() => navigate('/opportunities')}
        className="flex items-center space-x-1 text-xs text-gov-navy hover:text-blue-700 font-semibold"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Opportunities Index</span>
      </button>

      {/* Header */}
      <div className="bg-white rounded-gov border border-gov-border shadow-gov p-5 space-y-2">
        <div className="flex items-center space-x-2">
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-gov-navy text-white">
            Official Source Registry
          </span>
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center space-x-1">
            <ShieldCheck className="w-3 h-3 text-emerald-600" />
            <span>Government Verified</span>
          </span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-gov-navy tracking-tight">
          Official Government Procurement Sources & Portals
        </h1>
        <p className="text-xs text-slate-600">
          Directory of statutory e-procurement platforms, tender portals, and open repositories cross-referenced by the MPLADS AI platform.
        </p>
      </div>

      {/* Portal Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {OFFICIAL_PROCUREMENT_PORTALS.map((portal, idx) => (
          <div
            key={idx}
            className="bg-white rounded-gov border border-gov-border shadow-gov p-5 flex flex-col justify-between space-y-4 hover:shadow-md transition"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-50 text-blue-800 border border-blue-200">
                  {portal.source_type}
                </span>
                <span className="text-[11px] font-mono text-slate-500">
                  Verified: {portal.last_verified}
                </span>
              </div>

              <h3 className="text-sm font-bold text-gov-navy leading-snug">
                {portal.source_name}
              </h3>

              <div className="text-xs text-slate-600 space-y-1">
                <p>
                  Official URL: <span className="font-mono text-slate-800 font-medium">{portal.source_url}</span>
                </p>
                <p className="text-[11px] text-slate-500">
                  Release Cycle: {portal.source_date}
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-emerald-700 font-semibold flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Active Government Portal</span>
              </span>
              <a
                href={portal.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 bg-gov-navy hover:bg-gov-navy-light text-white text-xs font-bold rounded shadow-xs flex items-center space-x-1.5 transition"
              >
                <span>VISIT OFFICIAL PORTAL</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Security & Verification Principles */}
      <div className="bg-slate-50 border border-slate-200 rounded-gov p-5 text-xs text-slate-700 space-y-3">
        <h3 className="font-bold text-gov-navy text-sm flex items-center space-x-1.5">
          <Lock className="w-4 h-4 text-emerald-600" />
          <span>Statutory Procurement Verification Principles</span>
        </h3>
        <ul className="space-y-1.5 text-slate-600 list-disc list-inside leading-relaxed">
          <li><strong>Zero Fabrication Directive:</strong> All tender numbers, closing deadlines, and official links in this platform are sourced directly from statutory government portals.</li>
          <li><strong>No Brokerage or Intermediary Fees:</strong> Expressing prototype interest is entirely free. The government of India does not charge fees for browsing public MPLADS works.</li>
          <li><strong>Digital Signature Verification:</strong> Official bids on CPPP and State portals mandate Class-III Digital Signature Certificates (DSC). This prototype does not collect or transmit DSC credentials.</li>
        </ul>
      </div>

    </div>
  );
};
