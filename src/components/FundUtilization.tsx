import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { IndianRupee, ArrowUpRight, TrendingUp } from 'lucide-react';

interface FYData {
  sanctionedTotal: number;
  utilizedTotal: number;
  remainingTotal: number;
  utilizedPercent: number;
  remainingPercent: number;
  monthlyData: Array<{ month: string; sanctioned: number; utilized: number }>;
}

const FY_DATA_MAP: Record<string, FYData> = {
  'FY 2025-26': {
    sanctionedTotal: 8420,
    utilizedTotal: 6710,
    remainingTotal: 1710,
    utilizedPercent: 79.7,
    remainingPercent: 20.3,
    monthlyData: [
      { month: 'Apr', sanctioned: 720, utilized: 410 },
      { month: 'May', sanctioned: 680, utilized: 460 },
      { month: 'Jun', sanctioned: 710, utilized: 510 },
      { month: 'Jul', sanctioned: 740, utilized: 580 },
      { month: 'Aug', sanctioned: 690, utilized: 600 },
      { month: 'Sep', sanctioned: 715, utilized: 630 },
      { month: 'Oct', sanctioned: 705, utilized: 590 },
      { month: 'Nov', sanctioned: 730, utilized: 620 },
      { month: 'Dec', sanctioned: 720, utilized: 640 },
      { month: 'Jan', sanctioned: 745, utilized: 670 },
      { month: 'Feb', sanctioned: 725, utilized: 690 },
      { month: 'Mar', sanctioned: 740, utilized: 710 }
    ]
  },
  'FY 2024-25': {
    sanctionedTotal: 7850,
    utilizedTotal: 6940,
    remainingTotal: 910,
    utilizedPercent: 88.4,
    remainingPercent: 11.6,
    monthlyData: [
      { month: 'Apr', sanctioned: 650, utilized: 520 },
      { month: 'May', sanctioned: 640, utilized: 540 },
      { month: 'Jun', sanctioned: 660, utilized: 570 },
      { month: 'Jul', sanctioned: 680, utilized: 600 },
      { month: 'Aug', sanctioned: 630, utilized: 580 },
      { month: 'Sep', sanctioned: 650, utilized: 590 },
      { month: 'Oct', sanctioned: 640, utilized: 570 },
      { month: 'Nov', sanctioned: 670, utilized: 610 },
      { month: 'Dec', sanctioned: 660, utilized: 600 },
      { month: 'Jan', sanctioned: 680, utilized: 630 },
      { month: 'Feb', sanctioned: 650, utilized: 610 },
      { month: 'Mar', sanctioned: 640, utilized: 620 }
    ]
  },
  'FY 2023-24': {
    sanctionedTotal: 7210,
    utilizedTotal: 6780,
    remainingTotal: 430,
    utilizedPercent: 94.0,
    remainingPercent: 6.0,
    monthlyData: [
      { month: 'Apr', sanctioned: 600, utilized: 560 },
      { month: 'May', sanctioned: 590, utilized: 550 },
      { month: 'Jun', sanctioned: 610, utilized: 580 },
      { month: 'Jul', sanctioned: 620, utilized: 590 },
      { month: 'Aug', sanctioned: 580, utilized: 550 },
      { month: 'Sep', sanctioned: 600, utilized: 570 },
      { month: 'Oct', sanctioned: 590, utilized: 560 },
      { month: 'Nov', sanctioned: 610, utilized: 580 },
      { month: 'Dec', sanctioned: 600, utilized: 570 },
      { month: 'Jan', sanctioned: 610, utilized: 580 },
      { month: 'Feb', sanctioned: 600, utilized: 590 },
      { month: 'Mar', sanctioned: 600, utilized: 600 }
    ]
  },
  'All Years Cumulative': {
    sanctionedTotal: 33123,
    utilizedTotal: 28450,
    remainingTotal: 4673,
    utilizedPercent: 85.9,
    remainingPercent: 14.1,
    monthlyData: [
      { month: '2021-22', sanctioned: 4800, utilized: 4520 },
      { month: '2022-23', sanctioned: 5943, utilized: 5500 },
      { month: '2023-24', sanctioned: 7210, utilized: 6780 },
      { month: '2024-25', sanctioned: 7850, utilized: 6940 },
      { month: '2025-26', sanctioned: 8420, utilized: 6710 }
    ]
  }
};

export const FundUtilization: React.FC = () => {
  const navigate = useNavigate();
  const [selectedFY, setSelectedFY] = useState('FY 2025-26');

  const currentData = FY_DATA_MAP[selectedFY] || FY_DATA_MAP['FY 2025-26'];

  return (
    <div className="bg-white rounded-gov border border-gov-border p-4 shadow-gov flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center space-x-2">
          <IndianRupee className="w-4 h-4 text-gov-green" />
          <h3 className="text-sm font-bold text-slate-800">
            Fund Utilization ({selectedFY})
          </h3>
        </div>

        <select
          value={selectedFY}
          onChange={(e) => setSelectedFY(e.target.value)}
          className="text-xs bg-slate-50 border border-slate-300 text-slate-700 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-gov-navy font-medium cursor-pointer hover:bg-slate-100 transition"
        >
          <option value="FY 2025-26">FY 2025-26</option>
          <option value="FY 2024-25">FY 2024-25</option>
          <option value="FY 2023-24">FY 2023-24</option>
          <option value="All Years Cumulative">All Years Cumulative</option>
        </select>
      </div>

      {/* KPI Triple Figures dynamically updating */}
      <div className="grid grid-cols-3 gap-2 my-3 text-center transition-all duration-300">
        <div className="bg-slate-50 p-2 rounded border border-slate-100">
          <span className="text-[10px] text-slate-500 font-medium block">Sanctioned</span>
          <span className="text-sm sm:text-base font-bold text-gov-navy block">
            ₹{currentData.sanctionedTotal.toLocaleString()} Cr
          </span>
          <span className="text-[10px] text-slate-400 font-semibold">100%</span>
        </div>

        <div className="bg-emerald-50/70 p-2 rounded border border-emerald-100">
          <span className="text-[10px] text-emerald-800 font-medium block">Utilized</span>
          <span className="text-sm sm:text-base font-bold text-emerald-700 block">
            ₹{currentData.utilizedTotal.toLocaleString()} Cr
          </span>
          <span className="text-[10px] text-emerald-600 font-bold">{currentData.utilizedPercent}%</span>
        </div>

        <div className="bg-amber-50/70 p-2 rounded border border-amber-100">
          <span className="text-[10px] text-amber-800 font-medium block">Remaining</span>
          <span className="text-sm sm:text-base font-bold text-amber-700 block">
            ₹{currentData.remainingTotal.toLocaleString()} Cr
          </span>
          <span className="text-[10px] text-amber-600 font-bold">{currentData.remainingPercent}%</span>
        </div>
      </div>

      {/* Horizontal Progress Bar */}
      <div className="mb-3">
        <div className="flex justify-between text-[11px] text-slate-500 mb-1">
          <span>Utilization Rate</span>
          <span className="font-semibold text-emerald-700">{currentData.utilizedPercent}% of Allocation Disbursed</span>
        </div>
        <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden flex">
          <div 
            className="bg-emerald-600 h-full transition-all duration-500" 
            style={{ width: `${currentData.utilizedPercent}%` }}
            title={`Utilized: ${currentData.utilizedPercent}%`}
          ></div>
          <div 
            className="bg-amber-400 h-full transition-all duration-500" 
            style={{ width: `${currentData.remainingPercent}%` }}
            title={`Remaining: ${currentData.remainingPercent}%`}
          ></div>
        </div>
      </div>

      {/* Dynamic Bar Chart */}
      <div className="flex-1 min-h-[190px]">
        <div className="flex items-center justify-between mb-1.5 text-[11px] font-semibold text-slate-700">
          <span>{selectedFY === 'All Years Cumulative' ? 'Annual Multi-Year Trend' : 'Monthly Fund Utilization Trend'}</span>
          <span className="text-[10px] text-slate-400 font-normal">Amount in ₹ Crores</span>
        </div>

        <div className="w-full h-[180px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              key={selectedFY}
              data={currentData.monthlyData}
              margin={{ top: 10, right: 5, left: -20, bottom: 0 }}
              barGap={selectedFY === 'All Years Cumulative' ? 6 : 2}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 10, fill: '#64748b' }} 
                axisLine={{ stroke: '#cbd5e1' }}
                tickLine={false}
              />
              <YAxis 
                tick={{ fontSize: 10, fill: '#64748b' }} 
                axisLine={false}
                tickLine={false}
              />
              <Tooltip 
                formatter={(value: any) => [`₹${Number(value).toLocaleString()} Cr`]}
                contentStyle={{ 
                  backgroundColor: '#ffffff', 
                  borderColor: '#cbd5e1', 
                  fontSize: '11px',
                  borderRadius: '4px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
              />
              <Legend 
                verticalAlign="top" 
                align="right"
                wrapperStyle={{ fontSize: '10px', paddingBottom: '4px' }}
                iconSize={8}
              />
              <Bar 
                dataKey="sanctioned" 
                name="Sanctioned" 
                fill="#3b82f6" 
                radius={[2, 2, 0, 0]} 
                maxBarSize={selectedFY === 'All Years Cumulative' ? 24 : 14}
              />
              <Bar 
                dataKey="utilized" 
                name="Utilized" 
                fill="#10b981" 
                radius={[2, 2, 0, 0]} 
                maxBarSize={selectedFY === 'All Years Cumulative' ? 24 : 14}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Footer Navigation link */}
      <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
        <span className="text-slate-500 text-[11px]">Official MoSPI e-SAKSHI Audited</span>
        <button
          onClick={() => navigate('/funds')}
          className="text-gov-blue hover:text-gov-navy font-semibold text-[11px] flex items-center"
        >
          <span>View Financial Dashboard</span>
          <ArrowUpRight className="w-3 h-3 ml-0.5" />
        </button>
      </div>
    </div>
  );
};
