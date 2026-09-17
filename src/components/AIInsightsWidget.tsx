import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  AlertTriangle, 
  Copy, 
  TrendingDown, 
  Building2, 
  ArrowRight,
  Sparkles,
  ShieldAlert,
  SearchCode
} from 'lucide-react';
import { SHOWCASE_PROJECT_ID } from '../data/mockData';

interface AIInsightsWidgetProps {
  onInvestigate?: (projectId: string) => void;
}

export const AIInsightsWidget: React.FC<AIInsightsWidgetProps> = ({ onInvestigate }) => {
  const navigate = useNavigate();

  const alerts = [
    {
      id: 'alt-1',
      title: 'High Risk Project Detected',
      desc: 'Unusual cost deviation (32%) in Project MPL-MH-2026-1452',
      projectId: SHOWCASE_PROJECT_ID,
      time: '2 hours ago',
      severity: 'HIGH',
      badgeClass: 'text-rose-600 bg-rose-50 border-rose-200',
      icon: <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
    },
    {
      id: 'alt-2',
      title: 'Possible Duplicate Work',
      desc: 'Project similarity (91%) with existing project in Nashik district',
      projectId: 'MPL-MH-2026-0891',
      time: '5 hours ago',
      severity: 'HIGH',
      badgeClass: 'text-amber-600 bg-amber-50 border-amber-200',
      icon: <Copy className="w-3.5 h-3.5 text-amber-600" />
    },
    {
      id: 'alt-3',
      title: 'Payment-Progress Mismatch',
      desc: '78% funds utilized but only 35% physical progress in Project MPL-UP-2026-778',
      projectId: 'MPL-UP-2026-778',
      time: '1 day ago',
      severity: 'CRITICAL',
      badgeClass: 'text-orange-600 bg-orange-50 border-orange-200',
      icon: <TrendingDown className="w-3.5 h-3.5 text-orange-600" />
    },
    {
      id: 'alt-4',
      title: 'Unusually High Material Cost',
      desc: 'Cement price 27% above market average in Project MPL-RJ-2026-221',
      projectId: 'MPL-RJ-2026-221',
      time: '1 day ago',
      severity: 'HIGH',
      badgeClass: 'text-amber-600 bg-amber-50 border-amber-200',
      icon: <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
    },
    {
      id: 'alt-5',
      title: 'Contractor Risk Score Increased',
      desc: 'ABC Infrastructure Pvt. Ltd. flagged for multiple delays across works',
      projectId: SHOWCASE_PROJECT_ID,
      time: '2 days ago',
      severity: 'MEDIUM',
      badgeClass: 'text-blue-600 bg-blue-50 border-blue-200',
      icon: <Building2 className="w-3.5 h-3.5 text-blue-600" />
    }
  ];

  const handleAction = (projectId: string) => {
    if (onInvestigate) {
      onInvestigate(projectId);
    } else {
      navigate(`/investigate/${projectId}`);
    }
  };

  return (
    <div className="bg-white rounded-gov border border-gov-border p-4 shadow-gov flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-purple-600" />
          <h3 className="text-sm font-bold text-slate-800 flex items-center space-x-1.5">
            <span>AI Insights & Alerts</span>
            <span className="text-[10px] font-bold px-1.5 py-0.2 bg-rose-500 text-white rounded-full">
              5 New
            </span>
          </h3>
        </div>

        <button
          onClick={() => navigate('/ai-insights')}
          className="text-gov-blue hover:text-gov-navy text-xs font-semibold flex items-center"
        >
          <span>View All</span>
          <ArrowRight className="w-3 h-3 ml-0.5" />
        </button>
      </div>

      {/* Alert items list */}
      <div className="divide-y divide-slate-100 my-1">
        {alerts.map((alert) => (
          <div 
            key={alert.id}
            className="py-2.5 px-1 hover:bg-slate-50/80 rounded transition group"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start space-x-2">
                <div className="p-1 rounded bg-slate-100 mt-0.5 flex-shrink-0">
                  {alert.icon}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 group-hover:text-gov-blue transition leading-snug">
                    {alert.title}
                  </h4>
                  <p className="text-[11px] text-slate-600 leading-snug mt-0.5">
                    {alert.desc}
                  </p>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    {alert.time}
                  </span>
                </div>
              </div>

              {/* Direct Investigate Button */}
              <button
                onClick={() => handleAction(alert.projectId)}
                className="px-2 py-1 bg-gov-navy hover:bg-[#071f3d] text-white text-[10px] font-bold rounded flex items-center space-x-1 flex-shrink-0 shadow-xs"
                title="Open AI Forensic Investigation"
              >
                <SearchCode className="w-3 h-3" />
                <span className="hidden sm:inline">Investigate</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-400 flex items-center justify-between">
        <span>Decision-Support AI • Continuous Multi-Record Audit</span>
        <span className="text-gov-blue font-semibold cursor-pointer" onClick={() => navigate('/ai-insights')}>
          Rule Engine v2.4
        </span>
      </div>
    </div>
  );
};
