import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MOCK_PROJECTS, SHOWCASE_PROJECT_ID } from '../data/mockData';
import { ArrowRight, AlertTriangle, Eye } from 'lucide-react';

interface RecentProjectsTableProps {
  onInvestigate?: (projectId: string) => void;
}

export const RecentProjectsTable: React.FC<RecentProjectsTableProps> = ({ onInvestigate }) => {
  const navigate = useNavigate();
  const displayProjects = MOCK_PROJECTS.slice(0, 5);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'IN PROGRESS':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'DELAYED':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'UNDER REVIEW':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  return (
    <div className="bg-white rounded-gov border border-gov-border shadow-gov p-4 flex flex-col justify-between h-full">
      {/* Table Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
        <h3 className="text-sm font-bold text-slate-800">
          Recent Projects
        </h3>
        <button
          onClick={() => navigate('/projects')}
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
              <th>Project Name</th>
              <th>MP</th>
              <th>District</th>
              <th>Amount</th>
              <th>Status</th>
              <th className="text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {displayProjects.map((proj, idx) => {
              const isFlagged = proj.riskLevel === 'HIGH' || proj.riskLevel === 'CRITICAL';
              return (
                <tr key={proj.id} className="hover:bg-slate-50 transition cursor-pointer" onClick={() => navigate(`/projects/${proj.id}`)}>
                  <td className="font-semibold text-slate-400">{idx + 1}</td>
                  <td>
                    <div className="flex items-center space-x-1.5">
                      <span className="font-bold text-slate-900 hover:text-gov-blue transition line-clamp-1">
                        {proj.name}
                      </span>
                      {isFlagged && (
                        <span title="High Risk Anomaly Detected">
                          <AlertTriangle className="w-3 h-3 text-rose-500 flex-shrink-0" />
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono block">
                      {proj.code}
                    </span>
                  </td>
                  <td className="text-slate-700 text-xs">{proj.mpName}</td>
                  <td className="text-slate-700 text-xs">{proj.district}</td>
                  <td className="font-bold text-slate-900 text-xs whitespace-nowrap">
                    ₹ {(proj.estimatedCost / 100000).toFixed(1)} L
                  </td>
                  <td>
                    <span className={`px-2 py-0.5 text-[10px] font-semibold rounded border capitalize ${getStatusBadge(proj.status)}`}>
                      {proj.status === 'IN PROGRESS' ? 'In Progress' : proj.status === 'COMPLETED' ? 'Completed' : 'Delayed'}
                    </span>
                  </td>
                  <td className="text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end space-x-1">
                      <button
                        onClick={() => navigate(`/projects/${proj.id}`)}
                        className="text-gov-blue hover:text-gov-navy text-xs font-semibold px-1.5 py-0.5 rounded hover:bg-blue-50"
                      >
                        View
                      </button>
                      {isFlagged && (
                        <button
                          onClick={() => {
                            if (onInvestigate) onInvestigate(proj.id);
                            else navigate(`/investigate/${proj.id}`);
                          }}
                          className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-[10px] font-bold px-1.5 py-0.5 rounded"
                          title="Open AI Investigation"
                        >
                          Investigate
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-400 flex items-center justify-between">
        <span>Showing 5 of 28,416 audited projects</span>
        <span className="text-gov-blue cursor-pointer font-medium" onClick={() => navigate('/projects')}>
          Filter by Category / District →
        </span>
      </div>
    </div>
  );
};
