import React from 'react';
import { MOCK_STATES_DATA, MONTHLY_UTILIZATION_DATA } from '../data/mockData';
import { IndianRupee, TrendingUp, ShieldAlert, CheckCircle } from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend 
} from 'recharts';

export const FundsPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 space-y-4">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gov-border">
        <div>
          <div className="flex items-center space-x-2">
            <IndianRupee className="w-5 h-5 text-gov-green" />
            <h1 className="text-lg sm:text-xl font-bold text-gov-navy">
              Public Financial Management (PFMS) & Fund Utilization
            </h1>
          </div>
          <p className="text-xs text-slate-500">
            Centrally integrated treasury monitoring, state allocations, project drawdowns, and Utilization Certificate (UC) audit.
          </p>
        </div>
      </div>

      {/* Top 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-gov border border-gov-border shadow-gov">
          <span className="text-xs font-semibold text-slate-500 uppercase block">Total Sanctioned (FY 25-26)</span>
          <span className="text-2xl font-bold text-gov-navy mt-1 block">₹ 8,420 Cr</span>
          <span className="text-[11px] text-slate-400">100% of parliamentary budgetary provision</span>
        </div>
        <div className="bg-white p-4 rounded-gov border border-gov-border shadow-gov">
          <span className="text-xs font-semibold text-emerald-800 uppercase block">Total Disbursed to Implementing Agencies</span>
          <span className="text-2xl font-bold text-emerald-700 mt-1 block">₹ 6,710 Cr</span>
          <span className="text-[11px] text-emerald-600 font-semibold">79.7% utilization rate</span>
        </div>
        <div className="bg-white p-4 rounded-gov border border-gov-border shadow-gov">
          <span className="text-xs font-semibold text-amber-800 uppercase block">Unutilized Balance in District SNA Accounts</span>
          <span className="text-2xl font-bold text-amber-700 mt-1 block">₹ 1,710 Cr</span>
          <span className="text-[11px] text-amber-600 font-semibold">20.3% pending milestone certification</span>
        </div>
      </div>

      {/* Monthly Chart */}
      <div className="bg-white p-5 rounded-gov border border-gov-border shadow-gov">
        <h3 className="text-sm font-bold text-slate-800 mb-3">
          Monthly Disbursal vs Utilization Trend (FY 2025-26)
        </h3>
        <div className="w-full h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={MONTHLY_UTILIZATION_DATA}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(val: any) => [`₹ ${val} Cr`]} />
              <Legend verticalAlign="top" align="right" />
              <Bar dataKey="sanctioned" name="Sanctioned" fill="#3b82f6" />
              <Bar dataKey="utilized" name="Utilized" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* State-wise Financial Breakdown */}
      <div className="bg-white rounded-gov border border-gov-border shadow-gov overflow-hidden">
        <div className="p-3 bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-700">
          State-Wise Allocation & Disbursal Audit
        </div>
        <table className="w-full text-left gov-table">
          <thead>
            <tr>
              <th>State / UT</th>
              <th>Sanctioned Allocation</th>
              <th>Funds Utilized</th>
              <th>Utilization %</th>
              <th>Active Works</th>
              <th>High Risk Flagged</th>
            </tr>
          </thead>
          <tbody>
            {Object.values(MOCK_STATES_DATA).map(s => {
              const utilRate = ((s.fundsUtilized / s.sanctionedAmount) * 100).toFixed(1);
              return (
                <tr key={s.state}>
                  <td className="font-bold text-slate-900 text-xs">{s.state}</td>
                  <td className="font-bold text-slate-800 text-xs">₹ {s.sanctionedAmount} Cr</td>
                  <td className="font-bold text-emerald-700 text-xs">₹ {s.fundsUtilized} Cr</td>
                  <td>
                    <span className="font-bold text-slate-800 text-xs">{utilRate}%</span>
                  </td>
                  <td className="text-xs text-slate-600">{s.totalProjects.toLocaleString()}</td>
                  <td>
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                      s.highRiskProjects > 25 ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {s.highRiskProjects} High Risk
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
