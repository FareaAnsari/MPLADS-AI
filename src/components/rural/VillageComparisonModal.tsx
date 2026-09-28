import React from 'react';
import { LGDVillage } from '../../types/rural';
import { 
  X, 
  Scale, 
  Building, 
  IndianRupee, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ShieldAlert,
  Trash2
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  villages: LGDVillage[];
  onRemoveVillage: (villageId: string) => void;
}

export const VillageComparisonModal: React.FC<Props> = ({
  isOpen,
  onClose,
  villages,
  onRemoveVillage
}) => {
  if (!isOpen || villages.length === 0) return null;

  // Prepare chart data for Works Breakdown
  const worksChartData = villages.map(v => ({
    name: v.villageName.length > 14 ? v.villageName.slice(0, 12) + '…' : v.villageName,
    fullName: v.villageName,
    Completed: v.completedCount,
    Ongoing: v.ongoingCount,
    Delayed: v.delayedCount,
    total: v.projectCount
  }));

  // Prepare chart data for Expenditure (in ₹ Lakhs)
  const expenditureChartData = villages.map(v => ({
    name: v.villageName.length > 14 ? v.villageName.slice(0, 12) + '…' : v.villageName,
    fullName: v.villageName,
    ExpenditureLakhs: parseFloat((v.totalExpenditure / 100000).toFixed(2))
  }));

  // Aggregate all unique sectors across these villages
  const allSectors = Array.from(new Set(villages.flatMap(v => v.sectorsPresent))).sort();

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fadeIn overflow-y-auto">
      <div className="bg-white rounded-gov border border-gov-border shadow-2xl max-w-6xl w-full max-h-[92vh] flex flex-col overflow-hidden my-auto">
        
        {/* Modal Header */}
        <div className="bg-[#0b2e59] text-white px-5 py-3.5 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2">
            <Scale className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="text-base font-bold tracking-tight">
                Village Development Intelligence Comparison
              </h2>
              <p className="text-[11px] text-slate-300">
                Comparing {villages.length} of max 5 selected rural administrative units
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-300 hover:text-white rounded transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 space-y-6 overflow-y-auto text-xs text-slate-800">
          
          {/* 1. Side-by-Side Metric Matrix Table */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-gov-navy uppercase tracking-wider">
              1. Key Metrics & Administrative Matrix
            </h3>
            <div className="overflow-x-auto border border-gov-border rounded-gov">
              <table className="w-full text-left border-collapse gov-table text-xs">
                <thead>
                  <tr>
                    <th className="bg-slate-100 text-slate-700 font-bold w-36">Attribute</th>
                    {villages.map(v => (
                      <th key={v.id} className="min-w-[180px] bg-slate-50">
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="font-bold text-gov-navy block">{v.villageName}</span>
                            <span className="text-[10px] text-slate-500 font-mono">LGD: {v.villageCode}</span>
                          </div>
                          <button
                            onClick={() => onRemoveVillage(v.id)}
                            className="text-slate-400 hover:text-red-600 p-0.5 rounded"
                            title="Remove from comparison"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="font-semibold text-slate-600 bg-slate-50/50">Hierarchy</td>
                    {villages.map(v => (
                      <td key={v.id}>
                        {v.subDistrict} Block, {v.district}, {v.state}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="font-semibold text-slate-600 bg-slate-50/50">Constituency & MP</td>
                    {villages.map(v => (
                      <td key={v.id}>
                        <div className="font-medium">{v.constituency}</div>
                        <div className="text-[11px] text-slate-500">{v.mpName}</div>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="font-semibold text-slate-600 bg-slate-50/50">Recorded Works</td>
                    {villages.map(v => (
                      <td key={v.id}>
                        <span className="font-bold text-sm text-gov-navy">{v.projectCount}</span>
                        <span className="text-slate-500 text-[11px] ml-1">total</span>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="font-semibold text-slate-600 bg-slate-50/50">Execution Status</td>
                    {villages.map(v => (
                      <td key={v.id}>
                        <div className="space-y-0.5 text-[11px]">
                          <span className="text-emerald-700 font-medium block">✓ {v.completedCount} Completed</span>
                          <span className="text-blue-700 font-medium block">⚡ {v.ongoingCount} Ongoing</span>
                          <span className="text-amber-700 font-medium block">⏳ {v.delayedCount} Delayed</span>
                        </div>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="font-semibold text-slate-600 bg-slate-50/50">Total Expenditure</td>
                    {villages.map(v => (
                      <td key={v.id} className="font-mono font-bold text-emerald-700">
                        ₹{(v.totalExpenditure / 100000).toFixed(2)} Lakhs
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="font-semibold text-slate-600 bg-slate-50/50">Risk Indicators</td>
                    {villages.map(v => (
                      <td key={v.id}>
                        {v.highRiskCount > 0 ? (
                          <span className="px-2 py-0.5 bg-red-100 text-red-800 rounded font-bold text-[10px]">
                            ⚠️ {v.highRiskCount} High Risk Works
                          </span>
                        ) : (
                          <span className="text-emerald-700 font-medium text-[11px]">No high-risk flags</span>
                        )}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="font-semibold text-slate-600 bg-slate-50/50">Coordinate Source</td>
                    {villages.map(v => (
                      <td key={v.id} className="text-[11px]">
                        {v.coordinates ? (
                          <span className="text-emerald-700 font-medium">✓ {v.coordinatesSource}</span>
                        ) : (
                          <span className="text-slate-400 italic">Not available in source</span>
                        )}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* 2. Visual Charts Comparison (Recharts) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            
            {/* Chart A: Works Status Breakdown */}
            <div className="bg-slate-50 p-3.5 rounded-gov border border-gov-border space-y-2">
              <h4 className="text-xs font-bold text-gov-navy">
                MPLADS Works Execution Breakdown (Completed vs Ongoing vs Delayed)
              </h4>
              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={worksChartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                    <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '4px' }} />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                    <Bar dataKey="Completed" fill="#10b981" radius={[2, 2, 0, 0]} />
                    <Bar dataKey="Ongoing" fill="#3b82f6" radius={[2, 2, 0, 0]} />
                    <Bar dataKey="Delayed" fill="#f59e0b" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart B: Total Expenditure */}
            <div className="bg-slate-50 p-3.5 rounded-gov border border-gov-border space-y-2">
              <h4 className="text-xs font-bold text-gov-navy">
                Total Disbursed Scheme Expenditure (₹ Lakhs)
              </h4>
              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={expenditureChartData} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} unit="L" />
                    <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '4px' }} />
                    <Bar dataKey="ExpenditureLakhs" name="Disbursed (₹ Lakhs)" fill="#0b2e59" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

          {/* 3. Sector Distribution Comparison */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-gov-navy uppercase tracking-wider">
              3. Sector Coverage Comparison (Works by Sector)
            </h3>
            <p className="text-[11px] text-slate-500">
              Shows recorded works under each MoSPI category. Note: The absence of an MPLADS project in a sector does not imply the village lacks that infrastructure.
            </p>
            <div className="overflow-x-auto border border-gov-border rounded-gov">
              <table className="w-full text-left border-collapse gov-table text-xs">
                <thead>
                  <tr>
                    <th className="bg-slate-100 text-slate-700 font-bold w-48">Sector</th>
                    {villages.map(v => (
                      <th key={v.id} className="text-center bg-slate-50 font-bold text-gov-navy">
                        {v.villageName}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {allSectors.map(sec => (
                    <tr key={sec}>
                      <td className="font-semibold text-slate-700">{sec}</td>
                      {villages.map(v => {
                        const worksInSec = v.projects.filter(p => p.sector === sec);
                        return (
                          <td key={v.id} className="text-center">
                            {worksInSec.length > 0 ? (
                              <span className="inline-block px-2 py-0.5 rounded bg-blue-100 text-gov-navy font-bold text-xs">
                                {worksInSec.length} {worksInSec.length === 1 ? 'work' : 'works'}
                              </span>
                            ) : (
                              <span className="text-slate-300">–</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-gov-border flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gov-navy hover:bg-gov-navy-light text-white text-xs font-bold rounded shadow-xs transition"
          >
            Close Comparison
          </button>
        </div>

      </div>
    </div>
  );
};
