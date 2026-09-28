import React, { useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { PILOT_LGD_VILLAGES, DEMO_BENCHMARK_PROVENANCE } from '../data/ruralVillageData';
import { SectorGapView } from '../components/rural/SectorGapView';
import { DataProvenanceBadge } from '../components/rural/DataProvenanceBadge';
import { 
  Building2, 
  MapPin, 
  ArrowLeft, 
  FolderGit2, 
  IndianRupee, 
  ShieldCheck, 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  ExternalLink,
  Award,
  Download,
  AlertCircle
} from 'lucide-react';

export const VillageDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Find village by id or code
  const village = useMemo(() => {
    return PILOT_LGD_VILLAGES.find(v => v.id === id || v.villageCode === id);
  }, [id]);

  if (!village) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center space-y-4">
        <div className="p-4 bg-amber-100 rounded-full w-16 h-16 mx-auto flex items-center justify-center text-amber-800">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-gov-navy">Village Record Not Found</h2>
        <p className="text-xs text-slate-600 max-w-md mx-auto">
          The requested village ID "{id}" is not present in the currently loaded dataset. In live official mode, village-level data requires standardized LGD linkages.
        </p>
        <button
          onClick={() => navigate('/rural-intelligence')}
          className="px-4 py-2 bg-gov-navy text-white text-xs font-bold rounded shadow-xs hover:bg-gov-navy-light transition"
        >
          Return to Rural Intelligence Dashboard
        </button>
      </div>
    );
  }

  // Format currency
  const formatMoney = (amt: number) => {
    if (amt >= 100000) {
      return `₹${(amt / 100000).toFixed(2)} Lakhs`;
    }
    return `₹${amt.toLocaleString()}`;
  };

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-5 space-y-5">
      
      {/* Back Navigation & Breadcrumb */}
      <div className="flex items-center justify-between text-xs">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-1 text-gov-navy hover:text-blue-700 font-semibold"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Explorer</span>
        </button>
        <div className="text-slate-500 hidden sm:block">
          Rural Intelligence &gt; {village.state} &gt; {village.district} &gt; {village.subDistrict} &gt; <span className="font-semibold text-slate-800">{village.villageName}</span>
        </div>
      </div>

      {/* Village Administrative Header Card */}
      <div className="bg-white rounded-gov border border-gov-border shadow-gov p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gov-border pb-4">
          <div>
            <div className="flex items-center space-x-2 flex-wrap gap-y-1">
              <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-gov-navy text-white">
                Official LGD Village Code: {village.villageCode}
              </span>
              <DataProvenanceBadge provenance={village.provenance} />
              {village.coordinates ? (
                <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  <span>Geocoded: {village.coordinatesSource}</span>
                </span>
              ) : (
                <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  <span>Administrative Hierarchy Only (Coordinates unmapped in source)</span>
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-gov-navy tracking-tight mt-2">
              {village.villageName}
            </h1>
            <p className="text-xs text-slate-600 mt-0.5">
              Local Administrative Unit in <strong>{village.subDistrict}</strong> Block, <strong>{village.district}</strong> District, <strong>{village.state}</strong>.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center space-x-3 shrink-0">
            <div className="p-3 bg-blue-50/70 border border-blue-200 rounded text-center min-w-[100px]">
              <span className="text-[10px] text-blue-800 font-semibold block uppercase">MPLADS Works</span>
              <span className="text-2xl font-bold text-gov-navy">{village.projectCount}</span>
            </div>
            <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded text-center min-w-[120px]">
              <span className="text-[10px] text-emerald-800 font-semibold block uppercase">Total Disbursed</span>
              <span className="text-xl font-bold text-emerald-800 font-mono">
                {village.totalExpenditure > 0 ? `₹${(village.totalExpenditure / 100000).toFixed(1)}L` : '₹0'}
              </span>
            </div>
          </div>
        </div>

        {/* Administrative Metadata Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
          <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
            <span className="text-slate-500 block text-[11px]">State</span>
            <span className="font-bold text-slate-900">{village.state}</span>
          </div>
          <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
            <span className="text-slate-500 block text-[11px]">District</span>
            <span className="font-bold text-slate-900">{village.district}</span>
          </div>
          <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
            <span className="text-slate-500 block text-[11px]">Block / Taluka</span>
            <span className="font-bold text-slate-900">{village.subDistrict}</span>
          </div>
          <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
            <span className="text-slate-500 block text-[11px]">Constituency</span>
            <span className="font-bold text-slate-900">{village.constituency}</span>
          </div>
          <div className="p-2.5 bg-slate-50 rounded border border-slate-200 col-span-2">
            <span className="text-slate-500 block text-[11px]">Hon'ble Member of Parliament</span>
            <span className="font-bold text-slate-900 flex items-center space-x-1">
              <Award className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>{village.mpName}</span>
            </span>
          </div>
        </div>

        {/* Official Governance Context Alert */}
        <div className="p-3 bg-amber-50/70 border border-amber-200 rounded text-[11px] text-amber-900 leading-relaxed">
          ℹ️ <strong>Analytical Transparency Notice:</strong> Project counts recorded here represent MPLADS works officially mapped to this Local Government Directory village. A lower project count does not imply lack of development; infrastructure may be funded through other Central or State Government schemes.
        </div>
      </div>

      {/* Sector Gap View */}
      <SectorGapView village={village} />

      {/* Complete Project History Section */}
      <div className="bg-white rounded-gov border border-gov-border shadow-gov overflow-hidden space-y-3">
        <div className="p-4 border-b border-gov-border flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-[#fafbfc]">
          <div>
            <h2 className="text-sm font-bold text-gov-navy uppercase tracking-wide flex items-center space-x-2">
              <FolderGit2 className="w-4 h-4 text-gov-navy" />
              <span>PROJECT HISTORY</span>
            </h2>
            <p className="text-[11px] text-slate-500">
              Showing every recorded MPLADS project associated with {village.villageName}. Missing source attributes are explicitly marked.
            </p>
          </div>
          <div className="text-xs font-semibold text-slate-600">
            {village.projects.length} Works in Record
          </div>
        </div>

        {/* Project History Dense Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse gov-table text-xs">
            <thead>
              <tr>
                <th>Project ID</th>
                <th className="min-w-[200px]">Work Name & Description</th>
                <th>Sector</th>
                <th>Sanctioned</th>
                <th>Actual Comp.</th>
                <th className="text-center">MPLADS Status</th>
                <th className="text-center">Procurement Status</th>
                <th className="text-right">Expenditure</th>
                <th className="text-center">Risk Score</th>
                <th>Contractor / Vendor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {village.projects.length > 0 ? (
                village.projects.map((proj) => (
                  <tr key={proj.projectId} className="hover:bg-slate-50/70 transition">
                    
                    {/* Project ID */}
                    <td className="font-mono text-[11px] font-bold text-gov-navy whitespace-nowrap">
                      {proj.projectId}
                    </td>

                    {/* Work Name */}
                    <td className="font-medium text-slate-900 leading-snug">
                      {proj.workName}
                    </td>

                    {/* Sector */}
                    <td>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-800 border border-blue-200 whitespace-nowrap">
                        {proj.sector}
                      </span>
                    </td>

                    {/* Sanction Date */}
                    <td className="text-slate-600 whitespace-nowrap">
                      {proj.sanctionDate || <span className="text-slate-400 italic">Not available in source data</span>}
                    </td>

                    {/* Actual Completion */}
                    <td className="text-slate-600 whitespace-nowrap">
                      {proj.actualCompletion || <span className="text-slate-400 italic">Not available in source data</span>}
                    </td>

                    {/* MPLADS Status */}
                    <td className="text-center whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        proj.status === 'COMPLETED'
                          ? 'bg-emerald-100 text-emerald-900'
                          : proj.status === 'DELAYED'
                          ? 'bg-amber-100 text-amber-900'
                          : 'bg-blue-100 text-blue-900'
                      }`}>
                        {proj.status === 'COMPLETED' ? 'Completed' : proj.status === 'DELAYED' ? 'Work in Progress (Delayed)' : 'Work in Progress'}
                      </span>
                    </td>

                    {/* Procurement Status */}
                    <td className="text-center text-[10.5px]">
                      <span className="text-slate-500 italic block">
                        No official tender information found in current dataset
                      </span>
                    </td>

                    {/* Expenditure */}
                    <td className="text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                      {formatMoney(proj.expenditure)}
                    </td>

                    {/* Risk Score */}
                    <td className="text-center whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        proj.riskScore >= 70
                          ? 'bg-red-100 text-red-800'
                          : proj.riskScore >= 40
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {proj.riskScore}/100
                      </span>
                    </td>

                    {/* Contractor / Vendor */}
                    <td className="text-slate-700 text-[11px]">
                      {proj.contractor ? (
                        <div>
                          <button
                            onClick={() => navigate(`/contractors`)}
                            className="font-bold text-gov-blue hover:underline text-left"
                            title="Click to view contractor intelligence and other projects across districts"
                          >
                            {proj.contractor}
                          </button>
                          <span className="text-[9.5px] text-slate-400 block">Click for intelligence & other projects</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic block">Not available in source data</span>
                      )}
                      {proj.vendor && (
                        <div className="text-slate-500 text-[10px]">Vendor: {proj.vendor}</div>
                      )}
                    </td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={12} className="text-center py-10 text-slate-500">
                    <div className="space-y-1">
                      <p className="font-semibold text-slate-700">0 Recorded MPLADS Works</p>
                      <p className="text-xs text-slate-500">
                        No MPLADS projects are officially linked to this village in the current dataset.
                      </p>
                    </div>
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
