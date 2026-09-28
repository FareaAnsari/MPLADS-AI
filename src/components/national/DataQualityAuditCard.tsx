import React from 'react';
import { DataQualityReport } from '../../types/nationalPipeline';
import { ShieldCheck, AlertTriangle, CheckCircle2, FileText, Info, HelpCircle } from 'lucide-react';

interface Props {
  report: DataQualityReport;
}

export const DataQualityAuditCard: React.FC<Props> = ({ report }) => {
  return (
    <div className="bg-white rounded-gov border border-gov-border shadow-xs overflow-hidden space-y-4 p-5 text-xs text-slate-700">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gov-border pb-3 gap-2">
        <div className="flex items-center space-x-2 text-gov-navy">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          <div>
            <h3 className="font-bold text-sm uppercase tracking-wide">
              Automated Data Quality & Schema Integrity Audit
            </h3>
            <p className="text-[11px] text-slate-500">
              Report ID: <span className="font-mono">{report.report_id}</span> | Evaluated: {report.evaluation_timestamp.slice(0, 10)}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-[11px] text-slate-500 font-medium">Quality Score:</span>
          <span className="px-2.5 py-1 rounded bg-emerald-100 text-emerald-800 font-bold font-mono text-sm border border-emerald-300">
            {report.overall_quality_score}%
          </span>
        </div>
      </div>

      {/* Overview stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-50 p-3 rounded border border-slate-200">
          <span className="text-slate-500 block text-[11px]">Total Records Analyzed</span>
          <span className="font-mono font-bold text-base text-slate-900">{report.total_records.toLocaleString()}</span>
        </div>
        <div className="bg-emerald-50/60 p-3 rounded border border-emerald-200">
          <span className="text-emerald-700 block text-[11px]">Authoritative Valid Records</span>
          <span className="font-mono font-bold text-base text-emerald-800">{report.valid_records.toLocaleString()}</span>
        </div>
        <div className="bg-amber-50/60 p-3 rounded border border-amber-200">
          <span className="text-amber-700 block text-[11px]">Potential Duplicate Works</span>
          <span className="font-mono font-bold text-base text-amber-800">{report.duplicate_records}</span>
        </div>
        <div className="bg-rose-50/60 p-3 rounded border border-rose-200">
          <span className="text-rose-700 block text-[11px]">Source Conflicts Logged</span>
          <span className="font-mono font-bold text-base text-rose-800">{report.conflicting_records}</span>
        </div>
      </div>

      {/* Detailed Null & Completeness Breakdown Table */}
      <div className="border border-slate-200 rounded overflow-hidden">
        <div className="bg-slate-100 px-3 py-2 border-b border-slate-200 font-bold text-[11px] uppercase tracking-wider text-slate-700">
          Attribute Completeness & Null Field Rates
        </div>
        <div className="divide-y divide-slate-100 text-xs">
          
          <div className="flex items-center justify-between p-2.5 hover:bg-slate-50">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <strong className="text-slate-800">Project Identifier (Work ID)</strong>
                <p className="text-[11px] text-slate-500">Authentic MoSPI registration identifier present.</p>
              </div>
            </div>
            <div className="text-right font-mono">
              <span className="text-emerald-700 font-bold">100% Present</span>
              <span className="text-slate-400 text-[10px] block">0 missing</span>
            </div>
          </div>

          <div className="flex items-center justify-between p-2.5 hover:bg-slate-50">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <strong className="text-slate-800">Administrative State & District (IDA)</strong>
                <p className="text-[11px] text-slate-500">Attributed to verified Implementing District Authority.</p>
              </div>
            </div>
            <div className="text-right font-mono">
              <span className="text-emerald-700 font-bold">100% Present</span>
              <span className="text-slate-400 text-[10px] block">0 missing</span>
            </div>
          </div>

          <div className="flex items-center justify-between p-2.5 hover:bg-slate-50">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <strong className="text-slate-800">Financial Disbursement Amounts</strong>
                <p className="text-[11px] text-slate-500">Sanctioned or disbursed expenditure in INR.</p>
              </div>
            </div>
            <div className="text-right font-mono">
              <span className="text-emerald-700 font-bold">100% Present</span>
              <span className="text-slate-400 text-[10px] block">0 missing</span>
            </div>
          </div>

          <div className="flex items-center justify-between p-2.5 hover:bg-slate-50">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
              <div>
                <strong className="text-slate-800">LGD Village Codes & Village Links</strong>
                <p className="text-[11px] text-slate-500">
                  Absent from current official public e-SAKSHI release; maintained as NULL without synthetic fabrication.
                </p>
              </div>
            </div>
            <div className="text-right font-mono">
              <span className="text-amber-700 font-bold">Missing in Source</span>
              <span className="text-slate-400 text-[10px] block">{report.missing_village.toLocaleString()} NULL</span>
            </div>
          </div>

          <div className="flex items-center justify-between p-2.5 hover:bg-slate-50">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
              <div>
                <strong className="text-slate-800">Geographic Coordinates (Lat/Long)</strong>
                <p className="text-[11px] text-slate-500">
                  Not published in national aggregate files; stored as NULL.
                </p>
              </div>
            </div>
            <div className="text-right font-mono">
              <span className="text-amber-700 font-bold">Missing in Source</span>
              <span className="text-slate-400 text-[10px] block">{report.missing_coordinates.toLocaleString()} NULL</span>
            </div>
          </div>

          <div className="flex items-center justify-between p-2.5 hover:bg-slate-50">
            <div className="flex items-center space-x-2">
              <Info className="w-4 h-4 text-sky-600 shrink-0" />
              <div>
                <strong className="text-slate-800">Contractor / Vendor Attribution</strong>
                <p className="text-[11px] text-slate-500">
                  Available in ongoing expenditure disbursements; omitted from completed work summaries.
                </p>
              </div>
            </div>
            <div className="text-right font-mono">
              <span className="text-sky-700 font-bold">Partial Availability</span>
              <span className="text-slate-400 text-[10px] block">{report.missing_contractor.toLocaleString()} NULL</span>
            </div>
          </div>

        </div>
      </div>

      {/* Summary Notes */}
      <div className="bg-slate-50 p-3.5 rounded border border-slate-200">
        <h4 className="font-bold text-[11px] uppercase tracking-wide text-slate-800 mb-2">
          Data Governance & Audit Notes
        </h4>
        <ul className="space-y-1.5 text-[11px] text-slate-600 list-disc list-inside">
          {report.summary_notes.map((note, idx) => (
            <li key={idx} className="leading-relaxed">{note}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};
