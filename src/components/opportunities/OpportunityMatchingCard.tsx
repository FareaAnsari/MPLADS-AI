import React, { useState, useMemo } from 'react';
import { OpportunityRecord } from '../../types/contractorOpportunity';
import { Sparkles, Info, ArrowRight, Building, CheckCircle2, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Props {
  records: OpportunityRecord[];
  onSelectOpportunity?: (opp: OpportunityRecord) => void;
}

export const OpportunityMatchingCard: React.FC<Props> = ({ records, onSelectOpportunity }) => {
  const navigate = useNavigate();
  const [matchSector, setMatchSector] = useState<string>('Roads & Pathways');
  const [matchState, setMatchState] = useState<string>('Maharashtra');
  const [matchDistrict, setMatchDistrict] = useState<string>('Pune');
  const [matchExperience, setMatchExperience] = useState<number>(5);

  const sectors = useMemo(() => Array.from(new Set(records.map(r => r.sector))).sort(), [records]);
  const states = useMemo(() => Array.from(new Set(records.map(r => r.state))).sort(), [records]);
  const districts = useMemo(() => {
    const subset = records.filter(r => r.state === matchState);
    return Array.from(new Set(subset.map(r => r.district))).sort();
  }, [records, matchState]);

  // Identify matching opportunities based strictly on declared criteria
  const matchedOpportunities = useMemo(() => {
    return records.filter(r => {
      const matchS = matchSector === 'All' || r.sector === matchSector;
      const matchSt = matchState === 'All' || r.state === matchState;
      const matchDt = matchDistrict === 'All' || r.district === matchDistrict;
      return matchS && matchSt && matchDt;
    });
  }, [records, matchSector, matchState, matchDistrict]);

  return (
    <div className="bg-white rounded-gov border border-gov-border shadow-gov p-4 sm:p-5 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gov-border pb-3">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-blue-100 rounded text-gov-navy">
            <Sparkles className="w-4 h-4 text-blue-700" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gov-navy">
              AI-Assisted Opportunity Discovery & Capability Matcher
            </h3>
            <p className="text-[11px] text-slate-500">
              Identify publicly available MPLADS works based on your firm's domain, geography, and execution experience.
            </p>
          </div>
        </div>
      </div>

      {/* Mandatory Disclaimer Box */}
      <div className="p-3 bg-blue-50/70 border border-blue-200 rounded text-[11px] text-blue-950 leading-relaxed flex items-start space-x-2">
        <Info className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
        <div>
          <strong>Informational Prototype Notice:</strong> "This matching feature is an informational prototype and does not evaluate legal eligibility or award contracts. Results represent potentially relevant opportunities based on selected criteria."
        </div>
      </div>

      {/* Contractor Input Selectors */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs bg-slate-50 p-3 rounded border border-slate-200">
        <div>
          <label className="block text-[11px] font-semibold text-slate-700 mb-1">Your Sector Specialization</label>
          <select
            value={matchSector}
            onChange={(e) => setMatchSector(e.target.value)}
            className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-gov-navy focus:outline-none bg-white text-slate-800"
          >
            {sectors.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-700 mb-1">Target Operating State</label>
          <select
            value={matchState}
            onChange={(e) => {
              setMatchState(e.target.value);
              setMatchDistrict('All');
            }}
            className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-gov-navy focus:outline-none bg-white text-slate-800"
          >
            {states.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-700 mb-1">Target District</label>
          <select
            value={matchDistrict}
            onChange={(e) => setMatchDistrict(e.target.value)}
            className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-gov-navy focus:outline-none bg-white text-slate-800"
          >
            <option value="All">All Districts in State</option>
            {districts.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-700 mb-1">Execution Experience</label>
          <select
            value={matchExperience}
            onChange={(e) => setMatchExperience(parseInt(e.target.value) || 0)}
            className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-gov-navy focus:outline-none bg-white text-slate-800"
          >
            <option value={2}>1–3 Years (Junior / Emerging)</option>
            <option value={5}>3–7 Years (Established)</option>
            <option value={10}>7+ Years (Class-I / Veteran)</option>
          </select>
        </div>
      </div>

      {/* Matched Results */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-gov-navy">
          <span>Potentially relevant opportunities based on selected criteria:</span>
          <span className="text-[11px] font-semibold text-slate-500">
            {matchedOpportunities.length} Opportunities Identified
          </span>
        </div>

        {matchedOpportunities.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {matchedOpportunities.slice(0, 4).map(opp => (
              <div
                key={opp.id}
                onClick={() => navigate(`/opportunities/${opp.id}`)}
                className="p-3 bg-white hover:bg-blue-50/50 border border-slate-200 hover:border-blue-300 rounded-gov shadow-xs cursor-pointer transition flex flex-col justify-between space-y-2"
              >
                <div>
                  <div className="flex items-start justify-between gap-1">
                    <span className="text-[10px] font-mono font-bold text-gov-navy">{opp.projectId}</span>
                    <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                      opp.currentStatus === 'Tender Open' 
                        ? 'bg-amber-100 text-amber-900' 
                        : 'bg-blue-100 text-blue-900'
                    }`}>
                      {opp.currentStatus}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 leading-snug mt-1 line-clamp-2">
                    {opp.workName}
                  </h4>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {opp.district}, {opp.state} • Sector: {opp.sector}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="font-mono font-bold text-emerald-800">
                    {opp.estimatedCost ? `₹${(opp.estimatedCost / 100000).toFixed(1)} Lakh` : 'Cost not available'}
                  </span>
                  <span className="text-blue-700 font-semibold flex items-center space-x-0.5">
                    <span>Inspect Opportunity</span>
                    <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 bg-slate-50 rounded text-center text-slate-500 text-xs italic">
            No opportunities currently match the exact criteria combination. Try expanding the district to 'All'.
          </div>
        )}
      </div>
    </div>
  );
};
