import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MOCK_CONTRACTORS } from '../data/mockData';
import { ArrowRight, AlertTriangle } from 'lucide-react';

export const ContractsTable: React.FC = () => {
  const navigate = useNavigate();
  const displayContractors = MOCK_CONTRACTORS.slice(0, 5);

  const formatValue = (val: number) => {
    if (!val || val === 0) return 'Data Not Available';
    if (val >= 10000000) return `₹ ${(val / 10000000).toFixed(2)} Cr`;
    if (val >= 100000) return `₹ ${(val / 100000).toFixed(1)} L`;
    return `₹ ${val.toLocaleString('en-IN')}`;
  };

  return (
    <div className="bg-white rounded-gov border border-gov-border shadow-gov p-4 flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
        <h3 className="text-sm font-bold text-slate-800">
          Contracts & Contractors
        </h3>
        <button
          onClick={() => navigate('/contractors')}
          className="text-gov-blue hover:text-gov-navy text-xs font-semibold flex items-center"
        >
          <span>View All</span>
          <ArrowRight className="w-3 h-3 ml-0.5" />
        </button>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto my-2">
        <table className="w-full text-left gov-table">
          <thead>
            <tr>
              <th className="w-8">#</th>
              <th>Contractor Name</th>
              <th>Active Works</th>
              <th>Total Value</th>
              <th>Performance</th>
              <th className="text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {displayContractors.map((c, idx) => {
              const isHighRisk = c.riskLevel === 'HIGH';
              const activeCount = c.activeContracts ?? 1;
              return (
                <tr 
                  key={c.id} 
                  className="hover:bg-slate-50 transition cursor-pointer"
                  onClick={() => navigate(`/contractors/${c.id}`)}
                >
                  <td className="font-semibold text-slate-400">{idx + 1}</td>
                  <td>
                    <div className="flex items-center space-x-1.5">
                      <span className="font-bold text-slate-900 line-clamp-1 hover:text-gov-blue transition">
                        {c.name}
                      </span>
                      {isHighRisk && (
                        <span title="Multiple delays detected across ongoing contracts">
                          <AlertTriangle className="w-3 h-3 text-amber-500" />
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {c.registrationNumber}
                    </span>
                  </td>
                  <td className="text-center font-bold text-slate-800">{activeCount}</td>
                  <td className="font-bold text-slate-900 whitespace-nowrap text-xs">
                    {formatValue(c.totalContractValue)}
                  </td>
                  <td>
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded border ${
                      c.performanceScore >= 80 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                        : c.performanceScore >= 70 
                        ? 'bg-blue-50 text-blue-700 border-blue-200' 
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                      {c.performanceScore}/100
                    </span>
                  </td>
                  <td className="text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => navigate(`/contractors/${c.id}`)}
                      className="text-gov-blue hover:text-gov-navy text-xs font-semibold px-2 py-0.5 rounded hover:bg-blue-50"
                    >
                      View
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-400 flex items-center justify-between">
        <span>Public Works Enlistment & Capacity Tracking</span>
        <span className="text-gov-blue cursor-pointer font-medium" onClick={() => navigate('/contractors')}>
          Contractor Performance Registry →
        </span>
      </div>
    </div>
  );
};
