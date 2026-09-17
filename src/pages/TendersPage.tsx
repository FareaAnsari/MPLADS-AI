import React, { useState } from 'react';
import { MOCK_TENDERS, MOCK_CONTRACTS } from '../data/mockData';
import { FileCheck, AlertTriangle, Search, CheckCircle, Clock, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const TendersPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'tenders' | 'contracts'>('tenders');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 space-y-4">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gov-border">
        <div>
          <div className="flex items-center space-x-2">
            <FileCheck className="w-5 h-5 text-gov-navy" />
            <h1 className="text-lg sm:text-xl font-bold text-gov-navy">
              E-Procurement, Tenders & Contract Registry
            </h1>
          </div>
          <p className="text-xs text-slate-500">
            Open tendering oversight, bidder scrutiny, contract execution agreements, and procurement red flag monitoring.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border border-gov-border rounded-gov p-1 flex space-x-2 text-xs">
        <button
          onClick={() => setActiveTab('tenders')}
          className={`px-4 py-1.5 rounded font-bold transition ${
            activeTab === 'tenders' ? 'bg-gov-navy text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Active & Concluded Tenders ({MOCK_TENDERS.length})
        </button>
        <button
          onClick={() => setActiveTab('contracts')}
          className={`px-4 py-1.5 rounded font-bold transition ${
            activeTab === 'contracts' ? 'bg-gov-navy text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Awarded Contracts ({MOCK_CONTRACTS.length})
        </button>
      </div>

      {/* Content */}
      {activeTab === 'tenders' ? (
        <div className="space-y-4">
          {MOCK_TENDERS.length === 0 ? (
            <div className="bg-white rounded-gov border border-gov-border p-8 text-center shadow-gov space-y-2">
              <h3 className="text-sm font-bold text-gov-navy">Tender Details: Data Not Available</h3>
              <p className="text-xs text-slate-600 max-w-xl mx-auto leading-relaxed">
                Under the <strong>Strict Dataset-Only Rule</strong>, all details displayed in this platform come exclusively from the provided dataset.
                The official central MPLADS CSV release contains Member of Parliament allocations, sanctioned works, and expenditure disbursements.
                Separate e-Tender evaluation sheets and comparative bid logs are not present in this dataset.
              </p>
            </div>
          ) : (
            MOCK_TENDERS.map(t => (
              <div key={t.id} className="bg-white rounded-gov border border-gov-border p-4 shadow-gov space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2">
                  <div>
                    <span className="font-mono text-xs font-bold text-gov-navy block">{t.tenderNo}</span>
                    <h3 className="text-sm font-bold text-slate-900">{t.projectName}</h3>
                    <span className="text-xs text-slate-500">District: {t.district} • Estimated: ₹{(t.estimatedValue / 100000).toFixed(1)} Lakh</span>
                  </div>
                  <div className="text-right text-xs">
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 font-bold rounded border border-emerald-200">
                      {t.status}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-1">
                      Awarded Value: ₹{(t.contractValue / 100000).toFixed(2)} Lakh
                    </span>
                  </div>
                </div>

                {/* Bidders Evaluation Table */}
                <div>
                  <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                    Bidders Scrutiny & Comparative Evaluation:
                  </span>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left gov-table">
                      <thead>
                        <tr>
                          <th>Bidder Name</th>
                          <th>Quoted Amount</th>
                          <th>Technical Score</th>
                          <th>Result</th>
                        </tr>
                      </thead>
                      <tbody>
                        {t.bidders.map((b, idx) => (
                          <tr key={idx}>
                            <td className="font-bold text-slate-800">{b.bidderName}</td>
                            <td>₹ {(b.bidAmount / 100000).toFixed(2)} Lakh</td>
                            <td>{b.technicalScore} / 100</td>
                            <td>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                b.status === 'Selected' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                              }`}>
                                {b.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Procurement Risk Indicators */}
                {t.riskIndicators.length > 0 && (
                  <div className="p-2.5 bg-amber-50 border border-amber-200 rounded text-xs space-y-1">
                    <span className="font-bold text-amber-900 flex items-center space-x-1">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                      <span>AI Procurement Anomaly Indicators:</span>
                    </span>
                    <ul className="list-disc list-inside text-[11px] text-slate-700 space-y-0.5">
                      {t.riskIndicators.map((ind, i) => (
                        <li key={i}>{ind}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      ) : (
        MOCK_CONTRACTS.length === 0 ? (
          <div className="bg-white rounded-gov border border-gov-border p-8 text-center shadow-gov space-y-2">
            <h3 className="text-sm font-bold text-gov-navy">Awarded Contract Agreements: Data Not Available</h3>
            <p className="text-xs text-slate-600 max-w-xl mx-auto leading-relaxed">
              Under the <strong>Strict Dataset-Only Rule</strong>, contractual legal deeds and agreement numbers are marked as "Data Not Available" because central government MPLADS releases report project sanction approvals and expenditure disbursements, not bilateral contract execution forms.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-gov border border-gov-border shadow-gov overflow-hidden">
            <table className="w-full text-left gov-table">
              <thead>
                <tr>
                  <th>Contract Ref & Work Name</th>
                  <th>Contractor</th>
                  <th>Contract Value</th>
                  <th>Start / Completion</th>
                  <th>Progress</th>
                  <th>Total Paid</th>
                  <th>Risk Level</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_CONTRACTS.map(c => (
                  <tr key={c.id}>
                    <td>
                      <span className="font-mono text-[10px] text-slate-500 font-bold block">{c.contractNo}</span>
                      <span className="font-bold text-slate-900 text-xs">{c.projectName}</span>
                    </td>
                    <td className="text-xs font-semibold text-slate-800">{c.contractorName}</td>
                    <td className="font-bold text-gov-navy text-xs">₹ {(c.contractValue / 100000).toFixed(2)} L</td>
                    <td className="text-xs text-slate-600">{c.startDate} to {c.expectedCompletion}</td>
                    <td className="text-xs font-bold text-amber-600">{c.currentProgress}%</td>
                    <td className="text-xs font-bold text-rose-600">₹ {(c.totalPaid / 100000).toFixed(2)} L</td>
                    <td>
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded border ${
                        c.riskLevel === 'HIGH' ? 'bg-rose-100 text-rose-800 border-rose-300' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}>
                        {c.riskLevel}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}
    </div>
  );
};
