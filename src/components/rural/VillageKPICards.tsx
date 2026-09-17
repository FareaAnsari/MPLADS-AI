import React from 'react';
import { RuralKPISummary } from '../../types/rural';
import { 
  Building2, 
  CheckCircle2, 
  AlertOctagon, 
  TrendingDown, 
  Layers, 
  FolderGit2, 
  IndianRupee, 
  Clock, 
  ShieldAlert 
} from 'lucide-react';

interface Props {
  kpis: RuralKPISummary;
}

export const VillageKPICards: React.FC<Props> = ({ kpis }) => {
  // Format expenditure to Lakhs or Crores nicely
  const formatMoney = (amount: number) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)} Cr`;
    }
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(2)} L`;
    }
    return `₹${amount.toLocaleString()}`;
  };

  const cards = [
    {
      label: 'Total Villages in Dataset',
      value: kpis.totalVillages.toLocaleString(),
      subtext: 'Local administrative units',
      icon: <Building2 className="w-5 h-5 text-blue-700" />,
      bg: 'bg-blue-50/70',
      border: 'border-blue-200'
    },
    {
      label: 'Villages with MPLADS Projects',
      value: kpis.villagesWithProjects.toLocaleString(),
      subtext: `${kpis.totalVillages > 0 ? Math.round((kpis.villagesWithProjects / kpis.totalVillages) * 100) : 0}% coverage in sample`,
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" />,
      bg: 'bg-emerald-50/70',
      border: 'border-emerald-200'
    },
    {
      label: 'Villages with 0 Recorded Projects',
      value: kpis.villagesZeroProjects.toLocaleString(),
      subtext: 'No recorded works in dataset',
      icon: <AlertOctagon className="w-5 h-5 text-slate-500" />,
      bg: 'bg-slate-50',
      border: 'border-slate-300'
    },
    {
      label: 'Villages with 1–2 Recorded Projects',
      value: kpis.villages1to2Projects.toLocaleString(),
      subtext: 'Low recorded project count',
      icon: <TrendingDown className="w-5 h-5 text-amber-600" />,
      bg: 'bg-amber-50/70',
      border: 'border-amber-200'
    },
    {
      label: 'Villages with 3–5 Recorded Projects',
      value: kpis.villages3to5Projects.toLocaleString(),
      subtext: 'Moderate project count',
      icon: <Layers className="w-5 h-5 text-indigo-600" />,
      bg: 'bg-indigo-50/70',
      border: 'border-indigo-200'
    },
    {
      label: 'Total MPLADS Projects',
      value: kpis.totalProjects.toLocaleString(),
      subtext: 'Linked development works',
      icon: <FolderGit2 className="w-5 h-5 text-gov-navy" />,
      bg: 'bg-blue-50/70',
      border: 'border-blue-200'
    },
    {
      label: 'Total Expenditure',
      value: formatMoney(kpis.totalExpenditure),
      subtext: 'Disbursed scheme funds',
      icon: <IndianRupee className="w-5 h-5 text-emerald-700" />,
      bg: 'bg-emerald-50/70',
      border: 'border-emerald-200'
    },
    {
      label: 'Villages with Delayed Projects',
      value: kpis.villagesWithDelayed.toLocaleString(),
      subtext: 'Schedule overrun flagged',
      icon: <Clock className="w-5 h-5 text-amber-700" />,
      bg: 'bg-amber-50/80',
      border: 'border-amber-300'
    },
    {
      label: 'Villages with High-Risk Projects',
      value: kpis.villagesWithHighRisk.toLocaleString(),
      subtext: 'Risk score ≥ 70 / anomaly',
      icon: <ShieldAlert className="w-5 h-5 text-red-600" />,
      bg: 'bg-red-50/70',
      border: 'border-red-200'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-3">
      {cards.map((card, idx) => (
        <div
          key={idx}
          className={`p-3.5 rounded-gov border ${card.border} ${card.bg} shadow-xs hover:shadow-gov transition duration-150 flex flex-col justify-between`}
        >
          <div className="flex items-start justify-between">
            <span className="text-xs font-semibold text-slate-700 leading-tight">
              {card.label}
            </span>
            <div className="p-1.5 rounded-full bg-white shadow-xs ml-2 shrink-0">
              {card.icon}
            </div>
          </div>
          <div className="mt-2.5">
            <div className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {card.value}
            </div>
            <div className="text-[11px] text-slate-500 font-medium mt-0.5">
              {card.subtext}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
