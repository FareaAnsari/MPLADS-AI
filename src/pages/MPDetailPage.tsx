import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ALL_MPS_DATA, getMPById } from '../data/mpsData';
import { 
  ArrowLeft, 
  Copy, 
  BarChart2, 
  Download, 
  MapPin, 
  TrendingUp, 
  Clock, 
  Target, 
  AlertTriangle, 
  Info, 
  CheckCircle2, 
  Briefcase, 
  Users, 
  Check, 
  Search
} from 'lucide-react';
import { SEOHead } from '../components/SEOHead';

// Semicircular Speedometer Gauge Component calibrated precisely to actual Utilization %
const SpeedometerGauge: React.FC<{ value: number }> = ({ value }) => {
  const clampedVal = Math.min(100, Math.max(0, value));
  // 0% -> 180 deg (left), 100% -> 0 deg (right)
  const angle = 180 - (clampedVal / 100) * 180;
  
  const rad = (angle * Math.PI) / 180;
  const cx = 160;
  const cy = 145;
  const needleLength = 80;
  const nx = cx + needleLength * Math.cos(rad);
  const ny = cy - needleLength * Math.sin(rad);

  return (
    <div className="flex flex-col items-center justify-center pt-2 select-none">
      <svg width="320" height="175" viewBox="0 0 320 175" className="overflow-visible">
        {/* Background track */}
        <path
          d="M 50 145 A 110 110 0 0 1 270 145"
          fill="none"
          stroke="#f1f5f9"
          strokeWidth="22"
          strokeLinecap="round"
        />

        {/* 1. Red Sector (0% to 40%) */}
        <path
          d="M 50 145 A 110 110 0 0 1 126 40.4"
          fill="none"
          stroke="#ef4444"
          strokeWidth="20"
          strokeLinecap="round"
        />

        {/* 2. Amber Sector (40% to 75%) */}
        <path
          d="M 126 40.4 A 110 110 0 0 1 237.8 67.2"
          fill="none"
          stroke="#f59e0b"
          strokeWidth="20"
        />

        {/* 3. Green Sector (75% to 100%) */}
        <path
          d="M 237.8 67.2 A 110 110 0 0 1 270 145"
          fill="none"
          stroke="#10b981"
          strokeWidth="20"
          strokeLinecap="round"
        />

        {/* Tick labels */}
        <text x="30" y="152" textAnchor="middle" className="text-[11px] font-sans fill-slate-500 font-bold">0%</text>
        <text x="54" y="68" textAnchor="middle" className="text-[11px] font-sans fill-slate-500 font-bold">20%</text>
        <text x="118" y="22" textAnchor="middle" className="text-[11px] font-sans fill-slate-500 font-bold">40%</text>
        <text x="202" y="22" textAnchor="middle" className="text-[11px] font-sans fill-slate-500 font-bold">60%</text>
        <text x="266" y="68" textAnchor="middle" className="text-[11px] font-sans fill-slate-500 font-bold">80%</text>
        <text x="290" y="152" textAnchor="middle" className="text-[11px] font-sans fill-slate-500 font-bold">100%</text>

        {/* Needle Line */}
        <line
          x1={cx}
          y1={cy}
          x2={nx}
          y2={ny}
          stroke="#0f172a"
          strokeWidth="4.5"
          strokeLinecap="round"
        />

        {/* Center Pivot Hub */}
        <circle cx={cx} cy={cy} r="8.5" fill="#0f172a" />
        <circle cx={cx} cy={cy} r="3.5" fill="#ffffff" />
      </svg>

      {/* Dynamic Center Percentage Label */}
      <div className="text-3xl font-black font-sans text-slate-900 tracking-tight -mt-1">
        {clampedVal.toFixed(1)}%
      </div>
    </div>
  );
};

export const MPDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'projects' | 'financials'>('overview');
  const [copied, setCopied] = useState(false);
  const [projectSearch, setProjectSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Find MP from dataset
  const mp = useMemo(() => {
    if (id) {
      const found = getMPById(id);
      if (found) return found;
    }
    const waikar = ALL_MPS_DATA.find(m => m.name.toLowerCase().includes('waikar'));
    return waikar || ALL_MPS_DATA[0];
  }, [id]);

  // Dynamically extract distinct status values from this MP's project dataset
  const availableStatuses = useMemo(() => {
    const statuses = new Set<string>();
    (mp?.projects || []).forEach(p => {
      if (p.status) statuses.add(p.status);
    });
    return Array.from(statuses).sort();
  }, [mp]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadReport = () => {
    window.print();
  };

  const filteredProjects = useMemo(() => {
    if (!mp?.projects) return [];
    return mp.projects.filter(p => {
      const matchSearch = !projectSearch || 
        p.work_id.toLowerCase().includes(projectSearch.toLowerCase()) ||
        p.work_title.toLowerCase().includes(projectSearch.toLowerCase()) ||
        p.work_category.toLowerCase().includes(projectSearch.toLowerCase());
      const matchStatus = statusFilter === 'ALL' || p.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [mp, projectSearch, statusFilter]);

  if (!mp) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <h2 className="text-xl font-bold text-slate-800">MP Record Not Found</h2>
        <p className="text-sm text-slate-500 mt-1">The requested Member of Parliament record was not found in the official dataset.</p>
        <button onClick={() => navigate('/mps')} className="mt-4 px-4 py-2 bg-gov-blue text-white rounded text-xs font-semibold">
          ← Back to All MPs
        </button>
      </div>
    );
  }

  const expRate = ((mp.recordedExpenditureRaw / mp.allocatedAmountRaw) * 100).toFixed(1);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 space-y-5 font-sans">
      <SEOHead
        title={`${mp.name} (${mp.constituency}, ${mp.state}) | MPLADS-AI`}
        description={`Official parliamentary profile and MPLADS fund utilization record for ${mp.name}, Member of Parliament representing ${mp.constituency}, ${mp.state}. Total allocation: ₹${mp.allocatedAmountCr} Cr, Total expenditure: ₹${mp.recordedExpenditureCr} Cr (${expRate}% utilization).`}
        canonicalPath={`/mps/${encodeURIComponent(mp.id)}`}
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'MPs Directory', url: '/mps' },
          { name: mp.name, url: `/mps/${encodeURIComponent(mp.id)}` }
        ]}
        schema={{
          '@context': 'https://schema.org',
          '@type': 'Person',
          name: mp.name,
          jobTitle: `Member of Parliament (${mp.house})`,
          affiliation: {
            '@type': 'GovernmentOrganization',
            name: 'Parliament of India'
          },
          workLocation: {
            '@type': 'AdministrativeArea',
            name: `${mp.constituency}, ${mp.state}`
          }
        }}
      />
      {/* 1. Back Navigation Button */}
      <div>
        <button 
          onClick={() => navigate('/mps')}
          className="text-gov-blue hover:text-gov-navy text-xs font-semibold inline-flex items-center gap-1.5 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to All MPs</span>
        </button>
      </div>

      {/* 2. MP Profile Header Card */}
      <div className="bg-white rounded-gov border border-gov-border shadow-sm p-5 sm:p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Avatar & MP Identity */}
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-xs shrink-0">
              <Users className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-serif font-bold text-[#0b2e59] tracking-tight">
                {mp.name}
              </h1>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <span className="text-xs text-slate-600 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <strong>{mp.constituency}</strong>, {mp.state}
                </span>
                <span className={`px-2 py-0.5 rounded text-[10.5px] font-bold border ${
                  mp.house === 'Lok Sabha' 
                    ? 'bg-blue-50 text-blue-800 border-blue-200' 
                    : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                }`}>
                  {mp.house}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <button
              onClick={handleCopyLink}
              className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold rounded shadow-2xs flex items-center gap-1.5 transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
              <span>{copied ? 'Copied!' : 'Copy Link'}</span>
            </button>
            <button
              onClick={() => navigate('/mps')}
              className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold rounded shadow-2xs flex items-center gap-1.5 transition"
            >
              <BarChart2 className="w-3.5 h-3.5 text-slate-500" />
              <span>Compare</span>
            </button>
            <button
              onClick={handleDownloadReport}
              className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold rounded shadow-2xs flex items-center gap-1.5 transition"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Download Report</span>
            </button>
          </div>
        </div>

        {/* 3. Four Key Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mt-5">
          
          {/* 1. Total Allocated */}
          <div className="bg-white rounded-lg border-l-4 border-l-blue-600 border border-slate-200 p-4 shadow-2xs flex items-start space-x-3.5">
            <div className="w-10 h-10 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 font-bold text-base">
              ₹
            </div>
            <div>
              <div className="text-xl font-black text-slate-900 leading-tight font-mono">
                ₹{mp.allocatedAmountCr} CR
              </div>
              <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mt-0.5">
                TOTAL ALLOCATED
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                Budget assigned to MP
              </div>
            </div>
          </div>

          {/* 2. Fund Utilization */}
          <div className="bg-white rounded-lg border-l-4 border-l-emerald-600 border border-slate-200 p-4 shadow-2xs flex items-start space-x-3.5">
            <div className="w-10 h-10 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl font-black text-slate-900 leading-tight font-mono">
                {mp.fundUtilizationPercent.toFixed(1)}%
              </div>
              <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mt-0.5 flex items-center gap-1">
                <span>FUND UTILIZATION</span>
                <Info className="w-3 h-3 text-slate-400" />
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5 font-mono">
                ₹{mp.recordedExpenditureRaw.toLocaleString('en-IN')} disbursed
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5 font-sans">
                • {expRate}% recorded expenditure rate
              </div>
            </div>
          </div>

          {/* 3. Works Completed */}
          <div className="bg-white rounded-lg border-l-4 border-l-amber-500 border border-slate-200 p-4 shadow-2xs flex items-start space-x-3.5">
            <div className="w-10 h-10 rounded-md bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl font-black text-slate-900 leading-tight font-mono">
                {mp.worksCompleted}
              </div>
              <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mt-0.5">
                WORKS COMPLETED
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                out of {mp.worksRecommended} recommended
              </div>
            </div>
          </div>

          {/* 4. Completion Rate */}
          <div className="bg-white rounded-lg border-l-4 border-l-purple-600 border border-slate-200 p-4 shadow-2xs flex items-start space-x-3.5">
            <div className="w-10 h-10 rounded-md bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl font-black text-slate-900 leading-tight font-mono">
                {mp.completionRate.toFixed(1)}%
              </div>
              <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mt-0.5">
                COMPLETION RATE
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                Project completion ratio
              </div>
            </div>
          </div>

        </div>

        {/* 4. Yellow Warning Alert Banner */}
        <div className="mt-4 bg-amber-50/80 border border-amber-300 rounded-md p-3 text-xs text-amber-900 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <div>
              <strong className="font-bold">₹{mp.uncompletedSpendCr} CR</strong> PAID ON WORKS NOT YET MARKED COMPLETE
            </div>
          </div>
          <span title="Vendor expenditure released on active or ongoing works">
            <Info className="w-3.5 h-3.5 text-amber-500 cursor-pointer" />
          </span>
        </div>

      </div>

      {/* 5. Tab Navigation */}
      <div className="flex border-b border-slate-200 gap-6 text-sm font-semibold">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-2.5 transition-colors border-b-2 flex items-center gap-1.5 ${
            activeTab === 'overview'
              ? 'border-gov-blue text-gov-blue font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <span>Overview</span>
        </button>
        <button
          onClick={() => setActiveTab('projects')}
          className={`pb-2.5 transition-colors border-b-2 flex items-center gap-1.5 ${
            activeTab === 'projects'
              ? 'border-gov-blue text-gov-blue font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <span>Projects ({mp.projects?.length || 0})</span>
        </button>
        <button
          onClick={() => setActiveTab('financials')}
          className={`pb-2.5 transition-colors border-b-2 flex items-center gap-1.5 ${
            activeTab === 'financials'
              ? 'border-gov-blue text-gov-blue font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <span>Financial Details ({mp.expenditures?.length || 0})</span>
        </button>
      </div>

      {/* 6. TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-5">
          
          {/* Middle Row: Speedometer Gauge + Projects Overview Box */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            
            {/* Left: Speedometer Gauge */}
            <div className="lg:col-span-6 bg-white rounded-gov border border-gov-border shadow-sm p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center space-x-1.5 text-xs text-slate-500 font-semibold">
                  <span>Fund Utilization</span>
                  <Info className="w-3 h-3 text-slate-400" />
                </div>
                <h3 className="text-sm font-serif font-bold text-[#0b2e59] mt-0.5">
                  {mp.name} Fund Utilization
                </h3>
              </div>

              <div className="py-2">
                <SpeedometerGauge value={mp.fundUtilizationPercent} />
              </div>

              <div className="text-[11px] text-slate-400 text-center border-t border-slate-100 pt-2 font-mono">
                Official MoSPI e-SAKSHI Verified Allocation & Recommendation Metric
              </div>
            </div>

            {/* Right: Projects Overview 2x2 Grid */}
            <div className="lg:col-span-6 bg-white rounded-gov border border-gov-border shadow-sm p-5 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-serif font-bold text-slate-800">
                  Projects Overview
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-3.5 my-auto py-2">
                
                {/* 1. Completed Projects */}
                <div className="bg-emerald-50 rounded-lg border border-emerald-200 p-4 flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xl font-bold font-mono text-slate-900">{mp.worksCompleted}</div>
                    <div className="text-[11px] font-semibold text-slate-600">Completed Projects</div>
                  </div>
                </div>

                {/* 2. Ongoing Projects */}
                <div className="bg-amber-50 rounded-lg border border-amber-200 p-4 flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xl font-bold font-mono text-slate-900">{mp.worksOngoing}</div>
                    <div className="text-[11px] font-semibold text-slate-600">Ongoing Projects</div>
                  </div>
                </div>

                {/* 3. Recommended Projects */}
                <div className="bg-blue-50 rounded-lg border border-blue-200 p-4 flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xl font-bold font-mono text-slate-900">{mp.worksRecommended}</div>
                    <div className="text-[11px] font-semibold text-slate-600">Recommended Projects</div>
                  </div>
                </div>

                {/* 4. Total Projects */}
                <div className="bg-slate-100 rounded-lg border border-slate-200 p-4 flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-full bg-slate-700 text-white flex items-center justify-center shrink-0">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xl font-bold font-mono text-slate-900">{mp.totalProjects}</div>
                    <div className="text-[11px] font-semibold text-slate-600">Total Projects</div>
                  </div>
                </div>

              </div>

              <div className="text-[11px] text-slate-400 text-center border-t border-slate-100 pt-2">
                Audited Work Recommendations across Parliament Tenure
              </div>
            </div>

          </div>

          {/* Performance Summary (Financial Performance & Project Delivery) */}
          <div className="bg-white rounded-gov border border-gov-border shadow-sm p-5 sm:p-6 space-y-4">
            <h3 className="text-sm font-serif font-bold text-[#0b2e59]">
              Performance Summary
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              
              {/* Financial Performance Table Card */}
              <div className="bg-slate-50/50 rounded-lg border border-slate-200 p-4 space-y-3 text-xs">
                <h4 className="font-bold text-slate-900 text-sm border-b border-slate-200 pb-2">
                  Financial Performance
                </h4>

                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Allocated Amount:</span>
                    <strong className="font-mono text-slate-900">₹{mp.allocatedAmountRaw.toLocaleString('en-IN')}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Recorded Expenditure:</span>
                    <strong className="font-mono text-slate-900">₹{mp.recordedExpenditureRaw.toLocaleString('en-IN')}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Remaining Balance:</span>
                    <strong className="font-mono text-slate-900">₹{mp.remainingBalanceRaw.toLocaleString('en-IN')}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 flex items-center gap-1">
                      <span>Fund Utilization</span>
                      <Info className="w-3 h-3 text-slate-400" />
                    </span>
                    <strong className="font-mono text-emerald-700 font-bold">{mp.fundUtilizationPercent.toFixed(1)}%</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Works Completed:</span>
                    <strong className="font-mono text-slate-900">{mp.worksCompleted}</strong>
                  </div>
                </div>
              </div>

              {/* Project Delivery Table Card */}
              <div className="bg-slate-50/50 rounded-lg border border-slate-200 p-4 space-y-3 text-xs">
                <h4 className="font-bold text-slate-900 text-sm border-b border-slate-200 pb-2">
                  Project Delivery
                </h4>

                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Total Projects:</span>
                    <strong className="font-mono text-slate-900">{mp.totalProjects}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Completed:</span>
                    <strong className="font-mono text-slate-900">{mp.worksCompleted}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">In Progress:</span>
                    <strong className="font-mono text-slate-900">{mp.worksOngoing}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Completion Rate:</span>
                    <strong className="font-mono text-slate-900">{mp.completionRate.toFixed(1)}%</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 flex items-center gap-1">
                      <span>Fund Utilization</span>
                      <Info className="w-3 h-3 text-slate-400" />
                    </span>
                    <strong className="font-mono text-emerald-700 font-bold">{mp.fundUtilizationPercent.toFixed(1)}%</strong>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      )}

      {/* 7. TAB 2: PROJECTS LIST */}
      {activeTab === 'projects' && (
        <div className="bg-white rounded-gov border border-gov-border shadow-sm p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-serif font-bold text-[#0b2e59]">
                Work Recommendations & Sanctioned Works ({mp.projects?.length || 0})
              </h3>
              <p className="text-xs text-slate-500">Official development works recommended under MPLADS e-SAKSHI</p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search works..."
                  value={projectSearch}
                  onChange={(e) => setProjectSearch(e.target.value)}
                  className="pl-8 pr-3 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-gov-blue focus:outline-hidden"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-slate-300 rounded px-2.5 py-1.5 text-xs bg-white text-slate-700 font-medium"
              >
                <option value="ALL">All Statuses</option>
                {availableStatuses.map(st => (
                  <option key={st} value={st}>
                    {st === 'COMPLETED' ? 'Completed' : st === 'IN PROGRESS' ? 'In Progress' : st}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {filteredProjects.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-xs">
              No works matching the search filter found for this MP.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left gov-table text-xs">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Work ID / Code</th>
                    <th>Work Description</th>
                    <th>Category</th>
                    <th>Sanction Authority</th>
                    <th>Disbursed</th>
                    <th>Status</th>
                    <th className="text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProjects.map((proj, idx) => (
                    <tr 
                      key={proj.work_id} 
                      onClick={() => navigate(`/projects/${encodeURIComponent(proj.work_id)}`)}
                      className="hover:bg-blue-50/40 cursor-pointer transition"
                    >
                      <td className="font-semibold text-slate-400">{idx + 1}</td>
                      <td className="font-mono font-bold text-gov-navy whitespace-nowrap hover:underline">
                        {proj.work_id}
                      </td>
                      <td className="max-w-xs">
                        <div className="font-bold text-slate-900 line-clamp-1 hover:text-gov-blue">{proj.work_title}</div>
                        <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{proj.description}</div>
                      </td>
                      <td className="text-slate-700">{proj.work_category}</td>
                      <td className="text-slate-600">{proj.ida}</td>
                      <td className="font-mono font-bold text-slate-900 whitespace-nowrap">
                        {proj.amount_disbursed > 0 ? `₹ ${(proj.amount_disbursed / 100000).toFixed(1)} L` : 'Data Not Available'}
                      </td>
                      <td>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          proj.status === 'COMPLETED' 
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}>
                          {proj.status}
                        </span>
                      </td>
                      <td className="text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/projects/${encodeURIComponent(proj.work_id)}`);
                          }}
                          className="text-gov-blue hover:text-gov-navy bg-blue-50/80 hover:bg-blue-100/80 text-xs font-semibold px-3 py-1 rounded border border-blue-200 transition shadow-2xs"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 8. TAB 3: FINANCIAL DETAILS */}
      {activeTab === 'financials' && (
        <div className="bg-white rounded-gov border border-gov-border shadow-sm p-5 space-y-4">
          <div>
            <h3 className="text-sm font-serif font-bold text-[#0b2e59]">
              Expenditure Ledger & Milestone Disbursements ({mp.expenditures?.length || 0})
            </h3>
            <p className="text-xs text-slate-500">Official public payment vouchers released against works</p>
          </div>

          {(!mp.expenditures || mp.expenditures.length === 0) ? (
            <div className="text-center py-10 text-slate-400 text-xs">
              No individual expenditure disbursement records available for this MP in the current dataset.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left gov-table text-xs">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Work ID</th>
                    <th>Work Name</th>
                    <th>Expenditure Date</th>
                    <th>Vendor / Executing Agency</th>
                    <th>Disbursed Amount</th>
                    <th>Payment Status</th>
                    <th className="text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {(mp.expenditures || []).map((exp, idx) => (
                    <tr 
                      key={idx} 
                      onClick={() => navigate(`/projects/${encodeURIComponent(exp.work_id)}`)}
                      className="hover:bg-blue-50/40 cursor-pointer transition"
                    >
                      <td className="font-semibold text-slate-400">{idx + 1}</td>
                      <td className="font-mono font-bold text-gov-navy whitespace-nowrap hover:underline">{exp.work_id}</td>
                      <td className="max-w-xs line-clamp-1 text-slate-800 font-medium hover:text-gov-blue">{exp.work_title}</td>
                      <td className="text-slate-600 whitespace-nowrap">{exp.exp_date}</td>
                      <td className="font-medium text-slate-900">{exp.vendor_name}</td>
                      <td className="font-mono font-bold text-emerald-800 whitespace-nowrap">
                        ₹ {exp.disbursed_amount.toLocaleString('en-IN')}
                      </td>
                      <td>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {exp.payment_status}
                        </span>
                      </td>
                      <td className="text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/projects/${encodeURIComponent(exp.work_id)}`);
                          }}
                          className="text-gov-blue hover:text-gov-navy bg-blue-50/80 hover:bg-blue-100/80 text-xs font-semibold px-3 py-1 rounded border border-blue-200 transition shadow-2xs"
                        >
                          View Work
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

    </div>
  );
};

export default MPDetailPage;
