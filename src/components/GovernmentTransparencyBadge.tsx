import React from 'react';
import { Lock, Info } from 'lucide-react';

interface TransparencyBadgeProps {
  type: 'gstin' | 'pan' | 'catalogue' | 'village' | 'bom' | 'general';
  customText?: string;
  tooltip?: string;
  className?: string;
}

export const GovernmentTransparencyBadge: React.FC<TransparencyBadgeProps> = ({
  type,
  customText,
  tooltip,
  className = ''
}) => {
  if (type === 'gstin' || type === 'pan') {
    return (
      <span
        className={`inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-300 shadow-2xs cursor-help hover:bg-slate-200 transition ${className}`}
        title={tooltip || "Statutory e-SAKSHI Norm: Private corporate tax identifiers (GSTIN/PAN) are protected under government public expenditure data privacy rules."}
      >
        <Lock className="w-3 h-3 text-slate-500 shrink-0" />
        <span>{customText || 'Not Disclosed in Public Ledger'}</span>
      </span>
    );
  }

  if (type === 'catalogue') {
    return (
      <span
        className={`inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-gov-blue border border-blue-200 shadow-2xs cursor-help hover:bg-blue-100/70 transition ${className}`}
        title={tooltip || "Statutory Scope: Executing public civil infrastructure agencies deliver composite works packages rather than retail commercial catalogues."}
      >
        <span>🏛️ {customText || 'Public Civil Works / Infrastructure Package'}</span>
      </span>
    );
  }

  if (type === 'village') {
    return (
      <span
        className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200 cursor-help ${className}`}
        title={tooltip || "Gram Panchayat breakdown not indexed in central milestone sanction order; aggregated at Constituency / Block Division."}
      >
        <span>🏛️ {customText || 'Constituency / Rural Cluster'}</span>
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200 cursor-help ${className}`}
      title={tooltip || "Recorded at milestone administrative level in e-SAKSHI."}
    >
      <Info className="w-3 h-3 text-slate-400" />
      <span>{customText || 'Not Disclosed in Central Public Ledger'}</span>
    </span>
  );
};
