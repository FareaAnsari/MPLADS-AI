import React from 'react';
import { SourceVerificationStatus } from '../../types/contractorOpportunity';
import { ShieldCheck, AlertCircle, HelpCircle } from 'lucide-react';

interface Props {
  status: SourceVerificationStatus;
  note?: string;
}

export const SourceVerificationBadge: React.FC<Props> = ({ status, note }) => {
  if (status === 'Verified') {
    return (
      <span 
        className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200"
        title={note || 'Cross-referenced against official procurement portal or e-SAKSHI registry.'}
      >
        <ShieldCheck className="w-3 h-3 text-emerald-600" />
        <span>Verified</span>
      </span>
    );
  }

  if (status === 'Partially Verified') {
    return (
      <span 
        className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200"
        title={note || 'Recommendation/sanction verified; procurement notice pending official publication.'}
      >
        <AlertCircle className="w-3 h-3 text-amber-600" />
        <span>Partially Verified</span>
      </span>
    );
  }

  return (
    <span 
      className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200"
      title={note || 'Source information unavailable or unverified.'}
    >
      <HelpCircle className="w-3 h-3 text-slate-400" />
      <span>Source Information Missing</span>
    </span>
  );
};
