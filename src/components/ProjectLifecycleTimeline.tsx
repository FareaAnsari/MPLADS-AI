import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Clock, Circle, ArrowRight } from 'lucide-react';
import { SHOWCASE_PROJECT_ID } from '../data/mockData';

export const ProjectLifecycleTimeline: React.FC = () => {
  const navigate = useNavigate();

  const stages = [
    {
      id: 1,
      name: 'MP Recommendation',
      date: '01 Jan 2026',
      status: 'Completed',
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      dotClass: 'bg-emerald-600 text-white',
    },
    {
      id: 2,
      name: 'Sanction by District',
      date: '15 Jan 2026',
      status: 'Completed',
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      dotClass: 'bg-emerald-600 text-white',
    },
    {
      id: 3,
      name: 'Tender Process',
      date: '01 Feb 2026',
      status: 'In Progress',
      badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
      dotClass: 'bg-amber-500 text-white ring-2 ring-amber-200',
    },
    {
      id: 4,
      name: 'Contract Award',
      date: 'Pending',
      status: 'Pending',
      badgeClass: 'bg-slate-100 text-slate-500 border-slate-200',
      dotClass: 'bg-slate-300 text-slate-600',
    },
    {
      id: 5,
      name: 'Work Execution',
      date: 'Pending',
      status: 'Pending',
      badgeClass: 'bg-slate-100 text-slate-500 border-slate-200',
      dotClass: 'bg-slate-300 text-slate-600',
    },
    {
      id: 6,
      name: 'Completion & UC',
      date: 'Pending',
      status: 'Pending',
      badgeClass: 'bg-slate-100 text-slate-500 border-slate-200',
      dotClass: 'bg-slate-300 text-slate-600',
    },
    {
      id: 7,
      name: 'Asset Handover',
      date: 'Pending',
      status: 'Pending',
      badgeClass: 'bg-slate-100 text-slate-500 border-slate-200',
      dotClass: 'bg-slate-300 text-slate-600',
    },
  ];

  return (
    <div className="bg-white rounded-gov border border-gov-border p-4 shadow-gov flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <h3 className="text-sm font-bold text-slate-800">
          Project Lifecycle
        </h3>
        <button
          onClick={() => navigate(`/projects/${SHOWCASE_PROJECT_ID}?tab=timeline`)}
          className="text-gov-blue hover:text-gov-navy text-xs font-semibold flex items-center"
        >
          <span>View Flow</span>
          <ArrowRight className="w-3 h-3 ml-0.5" />
        </button>
      </div>

      {/* Timeline Steps */}
      <div className="py-2 space-y-2 relative">
        {/* Connecting line */}
        <div className="absolute left-[13px] top-4 bottom-4 w-0.5 bg-slate-200 z-0"></div>

        {stages.map((stage) => (
          <div key={stage.id} className="flex items-center justify-between relative z-10 text-xs">
            <div className="flex items-center space-x-2.5">
              {/* Step number circle */}
              <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[11px] shadow-xs flex-shrink-0 ${stage.dotClass}`}>
                {stage.status === 'Completed' ? '✓' : stage.id}
              </div>

              <div>
                <span className="font-semibold text-slate-800 block text-[11.5px] leading-tight">
                  {stage.name}
                </span>
                <span className="text-[10px] text-slate-400">
                  {stage.date}
                </span>
              </div>
            </div>

            {/* Status Badge */}
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${stage.badgeClass}`}>
              {stage.status}
            </span>
          </div>
        ))}
      </div>

      <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-400 text-center">
        Standard 7-Tier Statutory Scrutiny & Handover Workflow
      </div>
    </div>
  );
};
