import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MOCK_CONTRACTORS, MOCK_PROJECTS } from '../data/mockData';
import { Briefcase, AlertTriangle, ShieldCheck, CheckCircle2, Clock, ArrowRight, ExternalLink } from 'lucide-react';

export const ContractorsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const selectedContractor = id ? MOCK_CONTRACTORS.find(c => c.id === id) : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 space-y-4">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gov-border">
        <div>
          <div className="flex items-center space-x-2">
            <Briefcase className="w-5 h-5 text-gov-navy" />
            <h1 className="text-lg sm:text-xl font-bold text-gov-navy">
              Public Works Contractor Enlistment & Performance Registry
            </h1>
          </div>
          <p className="text-xs text-slate-500">
            Multi-project performance scoring, capacity limits, active workload monitoring, and AI delay risk indicators.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => navigate('/opportunities')}
            className="px-3 py-1.5 bg-gov-navy text-white text-xs font-semibold rounded hover:bg-slate-800 transition flex items-center space-x-1"
          >
            <span>Upcoming Opportunities & Tenders</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {selectedContractor ? (
        /* CONTRACTOR DETAIL VIEW */
        <div className="space-y-4">
          <button
            onClick={() => navigate('/contractors')}
            className="text-xs text-gov-blue hover:underline font-semibold"
          >
            ← Back to Contractor Directory
          </button>

          <div className="bg-white p-5 rounded-gov border border-gov-border shadow-gov space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 bg-slate-100 text-slate-700 rounded border border-slate-200">
                    {selectedContractor.registrationNumber}
                  </span>
                  <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 font-bold rounded border border-blue-200">
                    {selectedContractor.classCategory}
                  </span>
                  {selectedContractor.riskLevel === 'HIGH' && (
                    <span className="text-xs px-2 py-0.5 bg-rose-100 text-rose-800 font-bold rounded border border-rose-300 flex items-center space-x-1">
                      <AlertTriangle className="w-3 h-3 text-rose-600" />
                      <span>HIGH RISK (Delay Pattern Detected)</span>
                    </span>
                  )}
                </div>
                <h2 className="text-xl font-bold text-gov-navy">{selectedContractor.name}</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  CIN / PAN: <span className="font-mono font-medium">{selectedContractor.cinOrPan && selectedContractor.cinOrPan !== 'Data Not Available' ? selectedContractor.cinOrPan : 'Data Not Available'}</span> • Registered Region: {selectedContractor.address || 'Data Not Available'}
                </p>
              </div>

              <div className="text-right text-xs">
                <span className="text-slate-400 block">Performance Rating</span>
                <span className={`text-2xl font-black ${
                  selectedContractor.performanceScore >= 80 ? 'text-emerald-600' : 'text-amber-600'
                }`}>
                  {selectedContractor.performanceScore} / 100
                </span>
              </div>
            </div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-slate-50 p-3 rounded border border-slate-200">
                <span className="text-slate-500 block">Active Works</span>
                <span className="text-lg font-bold text-slate-900">{selectedContractor.activeContracts}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded border border-slate-200">
                <span className="text-slate-500 block">Completed Projects</span>
                <span className="text-lg font-bold text-emerald-700">{selectedContractor.completedProjects}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded border border-slate-200">
                <span className="text-slate-500 block">Delayed Projects</span>
                <span className="text-lg font-bold text-rose-600">{selectedContractor.delayedProjects}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded border border-slate-200">
                <span className="text-slate-500 block">Total Portfolio Value</span>
                <span className="text-lg font-bold text-gov-navy">₹ {selectedContractor.totalContractValue} Cr</span>
              </div>
            </div>

            {/* Associated Projects */}
            <div>
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Associated MPLADS Projects
              </h3>
              <div className="space-y-2">
                {MOCK_PROJECTS.filter(p => p.contractorId === selectedContractor.id).map(p => (
                  <div key={p.id} className="p-3 bg-slate-50 rounded border border-slate-200 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-900 block">{p.name} ({p.code})</span>
                      <span className="text-[11px] text-slate-500">{p.district}, {p.state} • Contract Value: ₹{(p.contractValue / 100000).toFixed(1)} Lakh</span>
                    </div>
                    <button
                      onClick={() => navigate(`/projects/${p.id}`)}
                      className="px-2.5 py-1 bg-white border border-slate-300 rounded text-gov-blue hover:bg-slate-100 font-semibold"
                    >
                      Open Project
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Opportunities for Contractor */}
            <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-xs font-bold text-slate-800 block">Explore Upcoming Works & Open Tenders</span>
                <p className="text-[11px] text-slate-500">Discover officially published tenders, check procurement sources, and express contractor interest.</p>
              </div>
              <button
                onClick={() => navigate('/opportunities')}
                className="px-3 py-1.5 bg-gov-blue text-white rounded text-xs font-bold hover:bg-blue-700 flex items-center space-x-1 self-start sm:self-auto"
              >
                <span>Browse Opportunities</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* CONTRACTOR DIRECTORY TABLE */
        <div className="bg-white rounded-gov border border-gov-border shadow-gov overflow-hidden">
          <div className="p-3 bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-700">
            Registered Public Works Contractors ({MOCK_CONTRACTORS.length})
          </div>
          <table className="w-full text-left gov-table">
            <thead>
              <tr>
                <th>Contractor Name</th>
                <th>Class / Registration</th>
                <th>Active Contracts</th>
                <th>Completed</th>
                <th>Delayed</th>
                <th>Total Value</th>
                <th>Performance</th>
                <th>Risk Level</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_CONTRACTORS.map(c => (
                <tr key={c.id} className="hover:bg-slate-50 transition cursor-pointer" onClick={() => navigate(`/contractors/${c.id}`)}>
                  <td>
                    <span className="font-bold text-slate-900 block hover:text-gov-blue">{c.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{c.cinOrPan}</span>
                  </td>
                  <td className="text-xs">
                    <span className="font-medium text-slate-700 block">{c.classCategory}</span>
                    <span className="text-[10px] text-slate-400">{c.registrationNumber}</span>
                  </td>
                  <td className="font-bold text-slate-800 text-xs">{c.activeContracts}</td>
                  <td className="font-semibold text-emerald-700 text-xs">{c.completedProjects}</td>
                  <td className="font-bold text-rose-600 text-xs">{c.delayedProjects}</td>
                  <td className="font-bold text-slate-900 text-xs">₹ {c.totalContractValue} Cr</td>
                  <td>
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded border ${
                      c.performanceScore >= 80 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                      {c.performanceScore}/100
                    </span>
                  </td>
                  <td>
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded border ${
                      c.riskLevel === 'HIGH' ? 'bg-rose-100 text-rose-800 border-rose-300' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}>
                      {c.riskLevel}
                    </span>
                  </td>
                  <td className="text-right" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => navigate(`/contractors/${c.id}`)}
                      className="text-gov-blue hover:text-gov-navy text-xs font-semibold px-2 py-1 rounded hover:bg-blue-50"
                    >
                      View Profile
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
