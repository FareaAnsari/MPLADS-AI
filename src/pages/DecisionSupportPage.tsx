import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  Award, 
  Building2, 
  MapPin, 
  Landmark, 
  AlertTriangle, 
  Clock, 
  Percent, 
  ShieldAlert, 
  ShieldCheck, 
  TrendingUp, 
  TrendingDown, 
  CheckCircle2, 
  XCircle, 
  Filter, 
  ChevronRight, 
  Download, 
  Printer, 
  ExternalLink, 
  Scale, 
  Split, 
  Layers, 
  Search,
  FileText,
  AlertCircle
} from 'lucide-react';
import { MOCK_PROJECTS, MOCK_STATES_DATA, ESAKSHI_OFFICIAL_METRICS, SHOWCASE_PROJECT_ID } from '../data/mockData';
import { InvestigationModal } from '../components/InvestigationModal';

type AdministrativeRole = 'MP' | 'STATE' | 'DISTRICT' | 'MINISTRY';
type GovernanceTab = 'overview' | 'overruns' | 'quotas' | 'delays' | 'splitting';

export const DecisionSupportPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Parse URL query parameters
  const roleParam = searchParams.get('role')?.toUpperCase() as AdministrativeRole | undefined;
  const tabParam = searchParams.get('tab')?.toLowerCase() as GovernanceTab | undefined;

  const [activeRole, setActiveRole] = useState<AdministrativeRole>(
    roleParam && ['MP', 'STATE', 'DISTRICT', 'MINISTRY'].includes(roleParam) ? roleParam : 'MP'
  );

  const [activeTab, setActiveTab] = useState<GovernanceTab>(
    tabParam && ['overview', 'overruns', 'quotas', 'delays', 'splitting'].includes(tabParam)
      ? tabParam
      : (tabParam ? 'overview' : 'overview')
  );

  const [investigatingProjectId, setInvestigatingProjectId] = useState<string | null>(null);
  const [selectedState, setSelectedState] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Keep state synchronized with URL query params when they change
  useEffect(() => {
    if (roleParam && ['MP', 'STATE', 'DISTRICT', 'MINISTRY'].includes(roleParam)) {
      setActiveRole(roleParam);
    }
    if (tabParam && ['overview', 'overruns', 'quotas', 'delays', 'splitting'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [roleParam, tabParam]);

  const handleRoleChange = (role: AdministrativeRole) => {
    setActiveRole(role);
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.set('role', role);
      return next;
    });
  };

  const handleTabChange = (tab: GovernanceTab) => {
    setActiveTab(tab);
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.set('tab', tab);
      return next;
    });
  };

  // Sample computed project data for the verification engines
  const costOverrunProjects = MOCK_PROJECTS.slice(0, 15).map((p, idx) => {
    const overrunPct = idx % 3 === 0 ? 18.4 : idx % 2 === 0 ? 12.1 : 4.5;
    const isEscalated = overrunPct > 10;
    return {
      ...p,
      originalEstimate: p.sanctionedAmount,
      revisedEstimate: Math.round(p.sanctionedAmount * (1 + overrunPct / 100)),
      overrunPct,
      isEscalated,
      cause: idx % 2 === 0 ? 'CPWD DSR Material Rate Inflation' : 'Scope Extension / Foundation Revision',
      status: isEscalated ? 'Escalation Scrutiny Required' : 'Within ±10% Statutory Tolerance'
    };
  });

  const overdue75DayProjects = MOCK_PROJECTS.slice(5, 20).map((p, idx) => {
    const elapsedDays = 60 + (idx * 5);
    const isOverdue = elapsedDays > 75;
    return {
      ...p,
      recommendationDate: '12-May-2026',
      targetSanctionDate: '26-Jul-2026',
      elapsedDays,
      isOverdue,
      stage: idx % 2 === 0 ? 'Technical Estimate Vetting (IDA)' : 'Joint Site Feasibility Inspection',
      authority: p.district || 'District Magistrate Office'
    };
  });

  const splittingClusters = [
    {
      clusterId: 'SPL-GZB-01',
      district: 'Ghaziabad',
      state: 'Uttar Pradesh',
      radiusMeters: 280,
      subWorkCount: 3,
      totalAmount: 2129535,
      contractor: 'DARSH BUILDCON',
      sanctionDates: '04-Aug-2026 to 21-Aug-2026',
      rationale: 'Three separate link road sanctions under ₹10 Lakhs within 280m radius to bypass e-tendering threshold.',
      riskLevel: 'HIGH'
    },
    {
      clusterId: 'SPL-PUN-04',
      district: 'Pune',
      state: 'Maharashtra',
      radiusMeters: 340,
      subWorkCount: 4,
      totalAmount: 4850000,
      contractor: 'KRIDL / LOCAL JV',
      sanctionDates: '15-Jul-2026 to 28-Jul-2026',
      rationale: 'Contiguous community hall and paver block packages executed concurrently without composite tender.',
      riskLevel: 'HIGH'
    },
    {
      clusterId: 'SPL-SAM-02',
      district: 'Sambalpur',
      state: 'Odisha',
      radiusMeters: 410,
      subWorkCount: 2,
      totalAmount: 1400000,
      contractor: 'MEMBER SECY OB AND OC WWB BBSR',
      sanctionDates: '21-Aug-2026 to 25-Aug-2026',
      rationale: 'Irrigation pond civil components segmented into twin milestone vouchers.',
      riskLevel: 'MEDIUM'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 space-y-6">
      
      {/* 1. TOP HEADER BANNER */}
      <div className="bg-gradient-to-r from-[#0b2e59] via-[#14437a] to-[#1b4d89] text-white p-5 rounded-gov shadow-gov border-b-4 border-amber-500">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <span className="text-[11px] font-mono tracking-widest text-amber-300 uppercase font-bold">
                MoSPI Statutory Intelligence Layer
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              Administrative Decision Support & Governance Command
            </h1>
            <p className="text-xs text-blue-100 max-w-3xl mt-1 leading-relaxed">
              Role-specific statutory portals for MPs, State Authorities, District Collectors, and the Ministry — incorporating automated compliance checks for 75-day sanction SLAs, SC/ST quotas, and artificial contract splitting.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded border border-white/20 flex items-center space-x-1.5 transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Compliance Docket</span>
            </button>
            <button
              onClick={() => navigate('/sandbox')}
              className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold text-xs rounded shadow-xs flex items-center space-x-1.5 transition"
            >
              <Scale className="w-3.5 h-3.5" />
              <span>Pre-Sanction Sandbox</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. ROLE SWITCHER BAR */}
      <div className="bg-white p-2.5 rounded-gov border border-gov-border shadow-gov">
        <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider px-2 mb-2">
          <span>Select Administrative Authority Level (RBAC Mode)</span>
          <span className="normal-case inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-300">
            <ShieldCheck className="w-3 h-3 text-emerald-600" />
            <span>GFR-2017 RBAC Security Layer Active</span>
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <button
            onClick={() => handleRoleChange('MP')}
            className={`p-3 rounded-lg border text-left transition flex items-start space-x-3 ${
              activeRole === 'MP'
                ? 'bg-blue-50/80 border-gov-blue text-gov-navy shadow-xs ring-1 ring-gov-blue'
                : 'border-slate-200 hover:bg-slate-50 text-slate-700'
            }`}
          >
            <Award className={`w-5 h-5 shrink-0 mt-0.5 ${activeRole === 'MP' ? 'text-gov-blue' : 'text-slate-400'}`} />
            <div>
              <span className="font-bold text-xs block">Hon'ble MP Portal</span>
              <span className="text-[10px] text-slate-500 block">Constituency budget & recommendation velocity</span>
            </div>
          </button>

          <button
            onClick={() => handleRoleChange('STATE')}
            className={`p-3 rounded-lg border text-left transition flex items-start space-x-3 ${
              activeRole === 'STATE'
                ? 'bg-blue-50/80 border-gov-blue text-gov-navy shadow-xs ring-1 ring-gov-blue'
                : 'border-slate-200 hover:bg-slate-50 text-slate-700'
            }`}
          >
            <Building2 className={`w-5 h-5 shrink-0 mt-0.5 ${activeRole === 'STATE' ? 'text-gov-blue' : 'text-slate-400'}`} />
            <div>
              <span className="font-bold text-xs block">State Nodal Authority (SNA)</span>
              <span className="text-[10px] text-slate-500 block">Inter-district allocations & state quota audit</span>
            </div>
          </button>

          <button
            onClick={() => handleRoleChange('DISTRICT')}
            className={`p-3 rounded-lg border text-left transition flex items-start space-x-3 ${
              activeRole === 'DISTRICT'
                ? 'bg-blue-50/80 border-gov-blue text-gov-navy shadow-xs ring-1 ring-gov-blue'
                : 'border-slate-200 hover:bg-slate-50 text-slate-700'
            }`}
          >
            <MapPin className={`w-5 h-5 shrink-0 mt-0.5 ${activeRole === 'DISTRICT' ? 'text-gov-blue' : 'text-slate-400'}`} />
            <div>
              <span className="font-bold text-xs block">District Authority (IDA)</span>
              <span className="text-[10px] text-slate-500 block">75-day sanction SLA & technical approvals</span>
            </div>
          </button>

          <button
            onClick={() => handleRoleChange('MINISTRY')}
            className={`p-3 rounded-lg border text-left transition flex items-start space-x-3 ${
              activeRole === 'MINISTRY'
                ? 'bg-blue-50/80 border-gov-blue text-gov-navy shadow-xs ring-1 ring-gov-blue'
                : 'border-slate-200 hover:bg-slate-50 text-slate-700'
            }`}
          >
            <Landmark className={`w-5 h-5 shrink-0 mt-0.5 ${activeRole === 'MINISTRY' ? 'text-gov-blue' : 'text-slate-400'}`} />
            <div>
              <span className="font-bold text-xs block">The Ministry (MoSPI Central)</span>
              <span className="text-[10px] text-slate-500 block">National treasury & statutory compliance</span>
            </div>
          </button>
        </div>
      </div>

      {/* 3. GOVERNANCE ENGINES TABS */}
      <div className="flex border-b border-gov-border overflow-x-auto gap-1 text-xs font-semibold text-slate-600 bg-white px-3 pt-2 rounded-t-gov border border-b-0">
        <button
          onClick={() => handleTabChange('overview')}
          className={`px-4 py-2 border-b-2 transition whitespace-nowrap flex items-center space-x-1.5 ${
            activeTab === 'overview'
              ? 'border-gov-navy text-gov-navy font-bold'
              : 'border-transparent hover:text-slate-900 hover:border-slate-300'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>{activeRole} Executive Dashboard</span>
        </button>

        <button
          onClick={() => handleTabChange('delays')}
          className={`px-4 py-2 border-b-2 transition whitespace-nowrap flex items-center space-x-1.5 ${
            activeTab === 'delays'
              ? 'border-gov-navy text-gov-navy font-bold'
              : 'border-transparent hover:text-slate-900 hover:border-slate-300'
          }`}
        >
          <Clock className="w-3.5 h-3.5 text-amber-500" />
          <span>75-Day Sanction SLA Tracker</span>
          <span className="px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded-full text-[10px] font-bold">15 Overdue</span>
        </button>

        <button
          onClick={() => handleTabChange('quotas')}
          className={`px-4 py-2 border-b-2 transition whitespace-nowrap flex items-center space-x-1.5 ${
            activeTab === 'quotas'
              ? 'border-gov-navy text-gov-navy font-bold'
              : 'border-transparent hover:text-slate-900 hover:border-slate-300'
          }`}
        >
          <Percent className="w-3.5 h-3.5 text-blue-600" />
          <span>Statutory SC/ST Quotas (15%/7.5%)</span>
        </button>

        <button
          onClick={() => handleTabChange('overruns')}
          className={`px-4 py-2 border-b-2 transition whitespace-nowrap flex items-center space-x-1.5 ${
            activeTab === 'overruns'
              ? 'border-gov-navy text-gov-navy font-bold'
              : 'border-transparent hover:text-slate-900 hover:border-slate-300'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5 text-rose-600" />
          <span>Cost Overruns & Escalations</span>
          <span className="px-1.5 py-0.2 bg-rose-100 text-rose-800 rounded-full text-[10px] font-bold">8 Flagged</span>
        </button>

        <button
          onClick={() => handleTabChange('splitting')}
          className={`px-4 py-2 border-b-2 transition whitespace-nowrap flex items-center space-x-1.5 ${
            activeTab === 'splitting'
              ? 'border-gov-navy text-gov-navy font-bold'
              : 'border-transparent hover:text-slate-900 hover:border-slate-300'
          }`}
        >
          <Split className="w-3.5 h-3.5 text-purple-600" />
          <span>Project Splitting & Negative List</span>
          <span className="px-1.5 py-0.2 bg-purple-100 text-purple-800 rounded-full text-[10px] font-bold">3 Clusters</span>
        </button>
      </div>

      {/* 4. MAIN TAB CONTENT AREA */}
      <div className="bg-white p-5 rounded-b-gov border border-gov-border shadow-gov space-y-6">
        
        {/* === TAB 1: ROLE OVERVIEW === */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Role Persona Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-slate-50 border border-slate-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gov-navy text-white flex items-center justify-center font-bold text-sm shadow">
                  {activeRole === 'MP' && 'MP'}
                  {activeRole === 'STATE' && 'SNA'}
                  {activeRole === 'DISTRICT' && 'IDA'}
                  {activeRole === 'MINISTRY' && 'GOI'}
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">
                    {activeRole === 'MP' && "Hon'ble Member of Parliament Command Workspace"}
                    {activeRole === 'STATE' && 'State Nodal Authority (SNA) — State Oversight Dashboard'}
                    {activeRole === 'DISTRICT' && 'District Authority (District Collectorate / IDA Work Orders)'}
                    {activeRole === 'MINISTRY' && 'Ministry of Statistics & Programme Implementation (MoSPI HQ)'}
                  </h2>
                  <p className="text-xs text-slate-500">
                    {activeRole === 'MP' && 'Constituency recommendation register, annual ₹5.00 Cr allocation cap, and priority village gaps.'}
                    {activeRole === 'STATE' && 'Inter-district fund reallocation, non-lapsable treasury drawdown, and UC pendency.'}
                    {activeRole === 'DISTRICT' && 'Technical vetting queue, measurement book verification, and tender award tracking.'}
                    {activeRole === 'MINISTRY' && 'National parliamentary session reports, CAG compliance audit, and anti-fraud alarms.'}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2 text-xs">
                <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Authenticated Statutory Session</span>
                </span>
              </div>
            </div>

            {/* Quick Metrics for the active role */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <span className="text-[11px] font-semibold text-slate-500 block uppercase">Annual Allocated Cap</span>
                <span className="text-xl font-bold text-slate-900 block mt-1">₹ 5.00 Cr / Year</span>
                <span className="text-[10px] text-slate-400 mt-1 block">MoSPI Guidelines 2023 Revision</span>
              </div>

              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <span className="text-[11px] font-semibold text-slate-500 block uppercase">Works Recommended</span>
                <span className="text-xl font-bold text-gov-navy block mt-1">{ESAKSHI_OFFICIAL_METRICS.worksRecommendedCount.toLocaleString()}</span>
                <span className="text-[10px] text-emerald-600 font-medium mt-1 block">₹ {ESAKSHI_OFFICIAL_METRICS.worksRecommendedCr} Cr Total Value</span>
              </div>

              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <span className="text-[11px] font-semibold text-slate-500 block uppercase">Works Sanctioned</span>
                <span className="text-xl font-bold text-gov-navy block mt-1">{ESAKSHI_OFFICIAL_METRICS.worksSanctionedCount.toLocaleString()}</span>
                <span className="text-[10px] text-blue-600 font-medium mt-1 block">55.4% Conversion Rate</span>
              </div>

              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <span className="text-[11px] font-semibold text-slate-500 block uppercase">Completed Assets</span>
                <span className="text-xl font-bold text-emerald-700 block mt-1">{ESAKSHI_OFFICIAL_METRICS.worksCompletedCount.toLocaleString()}</span>
                <span className="text-[10px] text-slate-500 mt-1 block">₹ {ESAKSHI_OFFICIAL_METRICS.worksCompletedCr} Cr Physically Verified</span>
              </div>
            </div>

            {/* Specific Guidance by Role */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-slate-200 rounded-lg p-4 space-y-3">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Statutory Responsibilities for {activeRole}</span>
                </h3>
                <ul className="text-xs text-slate-600 space-y-2 list-disc list-inside leading-relaxed">
                  {activeRole === 'MP' && (
                    <>
                      <li>Recommend projects strictly within the annual ₹5.00 Crore entitlement limit.</li>
                      <li>Allocate minimum 15% funds to Scheduled Caste areas and 7.5% to Scheduled Tribe areas.</li>
                      <li>Prioritize underserved revenue villages identified in the Rural Intelligence GIS register.</li>
                      <li>Ensure recommended works comply with the MoSPI Negative List (no movable/commercial assets).</li>
                    </>
                  )}
                  {activeRole === 'STATE' && (
                    <>
                      <li>Monitor state-wide SNA treasury tranches and ensure timely submission of Utilization Certificates.</li>
                      <li>Audit inter-district equity to prevent regional fund skewness across Lok Sabha constituencies.</li>
                      <li>Facilitate administrative approvals between state line departments (PWD, Jal Shakti, Education).</li>
                      <li>Supervise State Quality Monitors (SQM) during biannual physical inspection drives.</li>
                    </>
                  )}
                  {activeRole === 'DISTRICT' && (
                    <>
                      <li>Adhere strictly to the statutory <strong>75-day turnaround SLA</strong> from MP recommendation to sanction.</li>
                      <li>Conduct technical scrutiny of Detailed Project Reports (DPR) against CPWD/State PWD schedules of rates.</li>
                      <li>Verify contractor Measurement Books (MB) on-site before releasing treasury payment tranches.</li>
                      <li>Submit quarterly expenditure and asset handover reports to the State Nodal Authority.</li>
                    </>
                  )}
                  {activeRole === 'MINISTRY' && (
                    <>
                      <li>Maintain national transparency registry across all 543 Parliamentary constituencies.</li>
                      <li>Enforce CAG compliance standards and release annual installments to accredited SNA accounts.</li>
                      <li>Investigate automated AI risk flags (duplicate works, artificial splitting, contractor cartels).</li>
                      <li>Publish official scheme performance compendiums for parliamentary session scrutiny.</li>
                    </>
                  )}
                </ul>
              </div>

              <div className="border border-slate-200 rounded-lg p-4 space-y-3 bg-amber-50/40 border-amber-200">
                <h3 className="text-xs font-bold text-amber-900 uppercase tracking-wide flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Immediate Action Directives</span>
                </h3>
                <div className="space-y-2 text-xs text-slate-700">
                  <div className="p-2.5 bg-white rounded border border-amber-200 flex items-start gap-2">
                    <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-900 block">15 Recommendations Exceeding 75 Days</span>
                      <span className="text-[11px] text-slate-600">Pending administrative sanction at IDA level. Expedite technical scrutiny immediately.</span>
                    </div>
                  </div>

                  <div className="p-2.5 bg-white rounded border border-rose-200 flex items-start gap-2">
                    <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-900 block">3 Suspected Project Splitting Clusters</span>
                      <span className="text-[11px] text-slate-600">Geographic co-location within 350m radius flagged for potential procurement bypass.</span>
                    </div>
                  </div>

                  <div className="p-2.5 bg-white rounded border border-blue-200 flex items-start gap-2">
                    <Percent className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-900 block">SC/ST Quota Tracking Review</span>
                      <span className="text-[11px] text-slate-600">Current national average: 14.2% SC / 6.8% ST. Target compliance shortfall of 0.8% and 0.7%.</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* === TAB 2: 75-DAY SANCTION OVERDUE TRACKER === */}
        {activeTab === 'delays' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
              <div>
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span>Statutory 75-Day Sanction Turnaround SLA Monitoring Engine</span>
                </h2>
                <p className="text-xs text-slate-500">
                  MoSPI Guidelines Paragraph 4.1: The District Authority must examine the eligibility, formulate the DPR, and accord administrative sanction or convey rejection with reasons within 75 days.
                </p>
              </div>

              <span className="px-2.5 py-1 bg-amber-100 text-amber-800 rounded font-mono text-xs font-bold shrink-0">
                SLA Cap: 75 Days
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left gov-table">
                <thead>
                  <tr>
                    <th>Project ID & Scope</th>
                    <th>MP & Constituency</th>
                    <th>Implementing Authority</th>
                    <th>Recommendation Date</th>
                    <th>Days Elapsed</th>
                    <th>SLA Status</th>
                    <th className="text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {overdue75DayProjects.map((p) => (
                    <tr key={p.id} className={p.isOverdue ? 'bg-amber-50/40 hover:bg-amber-50' : 'hover:bg-slate-50'}>
                      <td>
                        <span className="font-bold text-slate-900 block text-xs">{p.id}</span>
                        <span className="text-[11px] text-slate-600 line-clamp-1">{p.name}</span>
                      </td>
                      <td className="text-xs">
                        <span className="font-semibold text-slate-800 block">{p.mpName}</span>
                        <span className="text-[10px] text-slate-500">{p.mpConstituency}</span>
                      </td>
                      <td className="text-xs text-slate-700">{p.authority}</td>
                      <td className="text-xs font-mono text-slate-600">{p.recommendationDate}</td>
                      <td className="text-xs font-mono font-bold">
                        <span className={p.elapsedDays > 75 ? 'text-rose-600' : 'text-amber-600'}>
                          {p.elapsedDays} Days
                        </span>
                      </td>
                      <td>
                        {p.isOverdue ? (
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-rose-100 text-rose-800 border border-rose-200">
                            Overdue ({p.elapsedDays - 75}d Breach)
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-amber-100 text-amber-800 border border-amber-200">
                            Warning (Within SLA)
                          </span>
                        )}
                      </td>
                      <td className="text-right">
                        <button
                          onClick={() => setInvestigatingProjectId(p.id)}
                          className="text-gov-blue hover:text-gov-navy text-xs font-semibold px-2 py-1 rounded hover:bg-blue-50"
                        >
                          Send Notice
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* === TAB 3: STATUTORY SC/ST QUOTAS === */}
        {activeTab === 'quotas' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
              <div>
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Percent className="w-4 h-4 text-blue-600" />
                  <span>Mandatory Statutory SC/ST Earmarked Allocation Tracker</span>
                </h2>
                <p className="text-xs text-slate-500">
                  MoSPI Statutory Requirement: MPs must recommend at least 15% of MPLADS funds for areas inhabited by Scheduled Caste (SC) population and 7.5% for areas inhabited by Scheduled Tribe (ST) population.
                </p>
              </div>

              <div className="flex items-center space-x-2 text-xs">
                <span className="px-2.5 py-1 bg-blue-50 text-blue-800 border border-blue-200 rounded font-bold font-mono">
                  SC Mandate: 15.0%
                </span>
                <span className="px-2.5 py-1 bg-purple-50 text-purple-800 border border-purple-200 rounded font-bold font-mono">
                  ST Mandate: 7.5%
                </span>
              </div>
            </div>

            {/* Quota Progress Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-blue-200 bg-blue-50/30 p-4 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-900 uppercase">Scheduled Caste (SC) Quota Progress</span>
                  <span className="text-sm font-bold text-blue-900 font-mono">14.2% / 15.0% Target</span>
                </div>
                <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-full rounded-full" style={{ width: `${(14.2 / 15.0) * 100}%` }}></div>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-600">
                  <span>Sanctioned: ₹ 634.2 Cr</span>
                  <span className="text-amber-700 font-semibold">Shortfall: -0.8% (₹ 35.8 Cr Required)</span>
                </div>
              </div>

              <div className="border border-purple-200 bg-purple-50/30 p-4 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-900 uppercase">Scheduled Tribe (ST) Quota Progress</span>
                  <span className="text-sm font-bold text-purple-900 font-mono">6.8% / 7.5% Target</span>
                </div>
                <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden">
                  <div className="bg-purple-600 h-full rounded-full" style={{ width: `${(6.8 / 7.5) * 100}%` }}></div>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-600">
                  <span>Sanctioned: ₹ 303.7 Cr</span>
                  <span className="text-amber-700 font-semibold">Shortfall: -0.7% (₹ 31.3 Cr Required)</span>
                </div>
              </div>
            </div>

            {/* State Quota Compliance Table */}
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 font-bold text-xs text-slate-800">
                State-wise SC/ST Mandated Allocation Compliance Ledger
              </div>
              <table className="w-full text-left gov-table">
                <thead>
                  <tr>
                    <th>State / UT</th>
                    <th>Total Recommended</th>
                    <th>SC Earmarked (%)</th>
                    <th>SC Compliance</th>
                    <th>ST Earmarked (%)</th>
                    <th>ST Compliance</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(MOCK_STATES_DATA).slice(0, 6).map(([state, data]) => {
                    const scPct = state === 'Bihar' ? 16.2 : state === 'Punjab' ? 17.5 : 13.8;
                    const stPct = state === 'Kerala' ? 8.1 : state === 'Maharashtra' ? 8.4 : 6.2;
                    return (
                      <tr key={state} className="hover:bg-slate-50">
                        <td className="font-bold text-xs text-slate-900">{state}</td>
                        <td className="text-xs font-mono">₹ {data.sanctionedAmount.toFixed(1)} Cr</td>
                        <td className="text-xs font-mono font-semibold">{scPct}%</td>
                        <td>
                          {scPct >= 15.0 ? (
                            <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-100 text-emerald-800">Compliant</span>
                          ) : (
                            <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-amber-100 text-amber-800">Deficit (-{(15.0 - scPct).toFixed(1)}%)</span>
                          )}
                        </td>
                        <td className="text-xs font-mono font-semibold">{stPct}%</td>
                        <td>
                          {stPct >= 7.5 ? (
                            <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-100 text-emerald-800">Compliant</span>
                          ) : (
                            <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-amber-100 text-amber-800">Deficit (-{(7.5 - stPct).toFixed(1)}%)</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* === TAB 4: COST OVERRUNS & ESCALATIONS === */}
        {activeTab === 'overruns' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
              <div>
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-rose-600" />
                  <span>Cost Overruns & Escalation Variance Scrutiny Engine</span>
                </h2>
                <p className="text-xs text-slate-500">
                  MoSPI Guidelines: No cost escalation over sanctioned estimate can be permitted without prior written justification and statutory revised administrative sanction.
                </p>
              </div>

              <span className="px-2.5 py-1 bg-rose-100 text-rose-800 rounded font-mono text-xs font-bold shrink-0">
                Statutory Tolerance: ±10%
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left gov-table">
                <thead>
                  <tr>
                    <th>Project ID & Scope</th>
                    <th>Implementing Authority</th>
                    <th>Sanctioned Estimate</th>
                    <th>Revised Claimed</th>
                    <th>Variance %</th>
                    <th>Escalation Factor</th>
                    <th>Audit Status</th>
                    <th className="text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {costOverrunProjects.map((p) => (
                    <tr key={p.id} className={p.isEscalated ? 'bg-rose-50/40 hover:bg-rose-50' : 'hover:bg-slate-50'}>
                      <td>
                        <span className="font-bold text-slate-900 block text-xs">{p.id}</span>
                        <span className="text-[11px] text-slate-600 line-clamp-1">{p.name}</span>
                      </td>
                      <td className="text-xs text-slate-700">{p.district}</td>
                      <td className="text-xs font-mono">₹ {(p.originalEstimate / 100000).toFixed(2)} L</td>
                      <td className="text-xs font-mono font-bold text-slate-900">₹ {(p.revisedEstimate / 100000).toFixed(2)} L</td>
                      <td className="text-xs font-mono font-bold">
                        <span className={p.overrunPct > 10 ? 'text-rose-600' : 'text-slate-600'}>
                          +{p.overrunPct}%
                        </span>
                      </td>
                      <td className="text-xs text-slate-600 max-w-xs">{p.cause}</td>
                      <td>
                        {p.isEscalated ? (
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-rose-100 text-rose-800 border border-rose-200">
                            Rate Deviation Alert
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                            Normal Buffer
                          </span>
                        )}
                      </td>
                      <td className="text-right">
                        <button
                          onClick={() => setInvestigatingProjectId(p.id)}
                          className="text-gov-blue hover:text-gov-navy text-xs font-semibold px-2 py-1 rounded hover:bg-blue-50"
                        >
                          Audit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* === TAB 5: PROJECT SPLITTING & NEGATIVE LIST === */}
        {activeTab === 'splitting' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
              <div>
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Split className="w-4 h-4 text-purple-600" />
                  <span>Artificial Project Splitting & MoSPI Negative List Detection</span>
                </h2>
                <p className="text-xs text-slate-500">
                  Anti-fraud spatial radar detecting fragmentation of major works into sub-packages to bypass e-tendering limits, plus automated enforcement of MoSPI Negative List prohibitions.
                </p>
              </div>

              <span className="px-2.5 py-1 bg-purple-100 text-purple-800 rounded font-mono text-xs font-bold shrink-0">
                Spatial Radius: 500m
              </span>
            </div>

            {/* Negative List Advisory Box */}
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-lg text-xs space-y-1.5">
              <span className="font-bold text-rose-900 flex items-center gap-1.5 uppercase tracking-wide">
                <AlertCircle className="w-4 h-4 text-rose-600" />
                <span>MoSPI Statutory Negative List Prohibitions (Paragraph 5.2)</span>
              </span>
              <p className="text-rose-800 leading-relaxed">
                MPLADS funds strictly cannot be recommended or sanctioned for: (1) Office buildings or residential accommodations for government agencies, (2) Religious structures, places of worship or memorials, (3) Movable assets or vehicles, (4) Commercial structures or private aided institutions, (5) Works on private lands.
              </p>
            </div>

            {/* Splitting Clusters */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                Algorithmic Spatial Clusters Flagged for Artificial Splitting
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {splittingClusters.map((c) => (
                  <div key={c.clusterId} className="border border-slate-200 rounded-lg p-4 bg-slate-50/50 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-gov-navy">{c.clusterId}</span>
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-rose-100 text-rose-800">
                        {c.riskLevel} Risk
                      </span>
                    </div>

                    <div>
                      <span className="text-xs font-bold text-slate-900 block">{c.district}, {c.state}</span>
                      <span className="text-[11px] text-slate-500 block">Radius: {c.radiusMeters}m • {c.subWorkCount} Linked Packages</span>
                    </div>

                    <div className="text-xs space-y-1 bg-white p-2.5 rounded border border-slate-200">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Aggregate Value:</span>
                        <span className="font-bold font-mono">₹ {(c.totalAmount / 100000).toFixed(2)} Lakhs</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Contractor:</span>
                        <span className="font-semibold text-slate-800">{c.contractor}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Sanction Window:</span>
                        <span className="text-[10px] text-slate-600 font-mono">{c.sanctionDates}</span>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-600 leading-snug">
                      {c.rationale}
                    </p>

                    <button
                      onClick={() => setInvestigatingProjectId(SHOWCASE_PROJECT_ID)}
                      className="w-full py-1.5 bg-gov-blue hover:bg-[#14437a] text-white text-xs font-bold rounded transition text-center"
                    >
                      Investigate Cluster
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Investigation Modal */}
      {investigatingProjectId && (
        <InvestigationModal
          projectId={investigatingProjectId}
          isOpen={Boolean(investigatingProjectId)}
          onClose={() => setInvestigatingProjectId(null)}
        />
      )}
    </div>
  );
};
