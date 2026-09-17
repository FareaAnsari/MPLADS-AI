import React from 'react';
import { OpportunityKPISummary } from '../../types/contractorOpportunity';
import { 
  FileText, 
  CheckCircle2, 
  FileCheck2, 
  Flame, 
  CalendarClock, 
  FileQuestion,
  TrendingUp,
  ShieldCheck
} from 'lucide-react';

interface Props {
  kpis: OpportunityKPISummary;
}

export const OpportunityKPICards: React.FC<Props> = ({ kpis }) => {
  const cards = [
    {
      label: 'Recommended Works',
      value: kpis.recommendedWorks.toLocaleString(),
      subtext: 'MP proposal logged in registry',
      icon: <FileText className="w-5 h-5 text-indigo-700" />,
      bg: 'bg-indigo-50/70',
      border: 'border-indigo-200'
    },
    {
      label: 'Sanctioned Works',
      value: kpis.sanctionedWorks.toLocaleString(),
      subtext: 'District approval accorded',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" />,
      bg: 'bg-emerald-50/70',
      border: 'border-emerald-200'
    },
    {
      label: 'Works with Procurement Info',
      value: kpis.worksWithProcurementInfo.toLocaleString(),
      subtext: 'Tender formulated or published',
      icon: <FileCheck2 className="w-5 h-5 text-blue-700" />,
      bg: 'bg-blue-50/70',
      border: 'border-blue-200'
    },
    {
      label: 'Open Tender Opportunities',
      value: kpis.openTenderOpportunities.toLocaleString(),
      subtext: 'Active bidding window on portal',
      icon: <Flame className="w-5 h-5 text-amber-600" />,
      bg: 'bg-amber-50/80',
      border: 'border-amber-300'
    },
    {
      label: 'Upcoming / Planned Works',
      value: kpis.upcomingPlannedWorks.toLocaleString(),
      subtext: 'Pre-execution pipeline',
      icon: <CalendarClock className="w-5 h-5 text-gov-navy" />,
      bg: 'bg-slate-100',
      border: 'border-slate-300'
    },
    {
      label: 'Projects Without Tender Info',
      value: kpis.projectsWithoutTenderInfo.toLocaleString(),
      subtext: 'Pre-procurement / internal scrutiny',
      icon: <FileQuestion className="w-5 h-5 text-slate-500" />,
      bg: 'bg-slate-50',
      border: 'border-slate-200'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
      {cards.map((card, idx) => (
        <div
          key={idx}
          className={`p-3.5 rounded-gov border ${card.border} ${card.bg} shadow-xs hover:shadow-gov transition duration-150 flex flex-col justify-between`}
        >
          <div className="flex items-start justify-between">
            <span className="text-xs font-semibold text-slate-700 leading-tight">
              {card.label}
            </span>
            <div className="p-1.5 rounded-full bg-white shadow-xs ml-1.5 shrink-0">
              {card.icon}
            </div>
          </div>
          <div className="mt-2.5">
            <div className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {card.value}
            </div>
            <div className="text-[10px] text-slate-500 font-medium mt-0.5">
              {card.subtext}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
