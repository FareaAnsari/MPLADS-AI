import React from 'react';
import { OpportunityLifecycleStage } from '../../types/contractorOpportunity';
import { CheckCircle2, Clock, HelpCircle, ArrowRight } from 'lucide-react';

interface Props {
  stages: OpportunityLifecycleStage[];
}

export const OpportunityLifecycleTimeline: React.FC<Props> = ({ stages }) => {
  return (
    <div className="bg-white rounded-gov border border-gov-border shadow-gov p-4 sm:p-5 space-y-4">
      <div className="border-b border-gov-border pb-2.5">
        <h3 className="text-xs font-bold text-gov-navy uppercase tracking-wider">
          Sequential Project Lifecycle & Procurement Milestones
        </h3>
        <p className="text-[11px] text-slate-500 mt-0.5">
          Stages are mapped strictly from verified source records. Unreached or unrecorded milestones are marked as Information Unavailable.
        </p>
      </div>

      {/* Horizontal / Grid Timeline */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-2.5">
        {stages.map((stg, idx) => {
          let statusBadge = (
            <span className="text-[10px] font-semibold text-slate-400 flex items-center space-x-1">
              <HelpCircle className="w-3 h-3 text-slate-400" />
              <span>Information unavailable</span>
            </span>
          );

          let borderColor = 'border-slate-200 bg-slate-50/50';
          let circleColor = 'bg-slate-300 text-slate-700';

          if (stg.status === 'COMPLETED') {
            statusBadge = (
              <span className="text-[10px] font-bold text-emerald-700 flex items-center space-x-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>Recorded / Completed</span>
              </span>
            );
            borderColor = 'border-emerald-200 bg-emerald-50/40';
            circleColor = 'bg-emerald-600 text-white';
          } else if (stg.status === 'IN_PROGRESS') {
            statusBadge = (
              <span className="text-[10px] font-bold text-amber-700 flex items-center space-x-1">
                <Clock className="w-3 h-3 text-amber-600" />
                <span>Active Stage</span>
              </span>
            );
            borderColor = 'border-amber-300 bg-amber-50/60 ring-1 ring-amber-400';
            circleColor = 'bg-amber-600 text-white';
          } else if (stg.status === 'PENDING') {
            statusBadge = (
              <span className="text-[10px] font-semibold text-slate-500">
                Pending Execution
              </span>
            );
          }

          return (
            <div
              key={stg.stageId}
              className={`p-3 rounded-gov border ${borderColor} flex flex-col justify-between space-y-2 relative transition hover:shadow-xs`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className={`w-5 h-5 rounded-full ${circleColor} flex items-center justify-center font-bold text-[10px]`}>
                    {stg.stageNumber}
                  </div>
                  {idx < stages.length - 1 && (
                    <ArrowRight className="w-3 h-3 text-slate-300 hidden lg:block" />
                  )}
                </div>

                <h4 className="text-xs font-bold text-slate-800 leading-snug">
                  {stg.stageName}
                </h4>

                {stg.date ? (
                  <div className="text-[11px] font-semibold text-slate-900 mt-1 font-mono">
                    {stg.date}
                  </div>
                ) : (
                  <div className="text-[10px] text-slate-400 italic mt-1">
                    No date in record
                  </div>
                )}

                {stg.authority && (
                  <div className="text-[10px] text-slate-500 mt-0.5 line-clamp-2" title={stg.authority}>
                    {stg.authority}
                  </div>
                )}
              </div>

              <div className="pt-1.5 border-t border-slate-200/60">
                {statusBadge}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
