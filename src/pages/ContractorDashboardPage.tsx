import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  getContractorInterests, 
  withdrawContractorInterest,
  OPPORTUNITIES_DATA 
} from '../data/contractorOpportunitiesData';
import { ContractorInterestRecord } from '../types/contractorOpportunity';
import { 
  Building2, 
  ExternalLink, 
  Trash2, 
  Eye, 
  ArrowLeft, 
  CheckCircle2, 
  Info, 
  Plus, 
  ShieldCheck 
} from 'lucide-react';

export const ContractorDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [interests, setInterests] = useState<ContractorInterestRecord[]>(getContractorInterests());

  useEffect(() => {
    const handleUpdate = () => setInterests(getContractorInterests());
    window.addEventListener('contractor-interests-updated', handleUpdate);
    return () => window.removeEventListener('contractor-interests-updated', handleUpdate);
  }, []);

  const handleWithdraw = (interestId: string, projectName: string) => {
    if (confirm(`Are you sure you want to withdraw your expressed interest for: "${projectName}"?`)) {
      withdrawContractorInterest(interestId);
    }
  };

  const findOpportunityId = (projectId: string) => {
    const opp = OPPORTUNITIES_DATA.find(o => o.projectId === projectId);
    return opp ? opp.id : projectId;
  };

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-5 space-y-5">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gov-border pb-3">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-gov-navy text-white">
              Contractor Work Center
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
              {interests.length} Projects Tracked
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-gov-navy tracking-tight mt-1">
            Contractor Dashboard & Pipeline Tracker
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Monitor proposed, sanctioned, and active tender opportunities where your firm has recorded prototype interest.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => navigate('/opportunities')}
            className="px-3.5 py-2 bg-gov-navy hover:bg-gov-navy-light text-white text-xs font-bold rounded shadow-xs flex items-center space-x-1.5 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Discover More Opportunities</span>
          </button>
        </div>
      </div>

      {/* Mandatory Disclaimer */}
      <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded text-xs text-blue-950 flex items-start space-x-2 leading-relaxed">
        <Info className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
        <div>
          <strong>Informational Tracking Notice:</strong> Expressing interest through this prototype allows your firm to organize and monitor opportunities locally. It does not replace official bidding on government e-procurement portals.
        </div>
      </div>

      {/* "My Interested Projects" Table Section */}
      <div className="bg-white rounded-gov border border-gov-border shadow-gov overflow-hidden space-y-3">
        <div className="p-4 border-b border-gov-border flex items-center justify-between bg-[#fafbfc]">
          <h2 className="text-sm font-bold text-gov-navy uppercase tracking-wide flex items-center space-x-2">
            <Building2 className="w-4 h-4 text-gov-navy" />
            <span>My Interested Projects</span>
          </h2>
          <span className="text-xs text-slate-500 font-semibold">
            {interests.length} Expressions of Interest
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse gov-table text-xs">
            <thead>
              <tr>
                <th>Project Details</th>
                <th>Location</th>
                <th>Sector</th>
                <th>Official Tender Status</th>
                <th>Interest Date</th>
                <th>Official Source</th>
                <th className="text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {interests.length > 0 ? (
                interests.map((item) => {
                  const oppId = findOpportunityId(item.projectId);
                  return (
                    <tr key={item.id} className="hover:bg-slate-50 transition duration-75">
                      
                      {/* Project Name & ID */}
                      <td className="font-medium text-slate-900 min-w-[220px]">
                        <button
                          onClick={() => navigate(`/opportunities/${oppId}`)}
                          className="text-left font-bold text-gov-navy hover:text-blue-700 hover:underline block leading-snug"
                        >
                          {item.projectName}
                        </button>
                        <span className="text-[10px] font-mono text-slate-500 font-normal">
                          {item.projectId}
                        </span>
                      </td>

                      {/* Location */}
                      <td className="text-slate-700 whitespace-nowrap">
                        <div className="font-semibold">{item.district}</div>
                        <div className="text-[11px] text-slate-500">{item.state}</div>
                      </td>

                      {/* Sector */}
                      <td>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-800 border border-blue-200 whitespace-nowrap">
                          {item.relevantSector}
                        </span>
                      </td>

                      {/* Official Tender Status */}
                      <td className="min-w-[160px]">
                        <span className="text-xs font-semibold text-slate-800 block">
                          {item.tenderStatus || 'Procurement In Formulation'}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          Registered Firm: {item.contractorName}
                        </span>
                      </td>

                      {/* Interest Date */}
                      <td className="text-slate-600 whitespace-nowrap font-mono text-[11px]">
                        {new Date(item.submittedAt).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </td>

                      {/* Official Source */}
                      <td className="whitespace-nowrap">
                        {item.officialSourceUrl ? (
                          <a
                            href={item.officialSourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center space-x-1 text-blue-700 hover:underline font-bold text-[11px]"
                            title="Open Official Procurement Portal"
                          >
                            <span>Official Portal</span>
                            <ExternalLink className="w-3 h-3 text-blue-600" />
                          </a>
                        ) : (
                          <span className="text-slate-400 italic">Pre-procurement</span>
                        )}
                      </td>

                      {/* Actions: View Project, View Official Tender, Withdraw Interest */}
                      <td className="text-center whitespace-nowrap">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => navigate(`/opportunities/${oppId}`)}
                            className="p-1 text-gov-navy hover:bg-blue-50 rounded"
                            title="View Project Overview & Timeline"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {item.officialSourceUrl && (
                            <a
                              href={item.officialSourceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1 text-blue-700 hover:bg-blue-50 rounded"
                              title="View Official Tender Notice on Government Portal"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          )}

                          <button
                            onClick={() => handleWithdraw(item.id, item.projectName)}
                            className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                            title="Withdraw Interest"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-500">
                    <Building2 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-semibold text-slate-700">No Interested Projects Recorded</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Explore the opportunity index to express interest and track upcoming works.
                    </p>
                    <button
                      onClick={() => navigate('/opportunities')}
                      className="mt-3 px-3 py-1.5 bg-gov-navy text-white text-xs font-bold rounded shadow-xs"
                    >
                      Browse Opportunities
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
