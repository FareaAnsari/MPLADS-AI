import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, 
  Layers, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  UploadCloud, 
  FileText, 
  Camera, 
  IndianRupee, 
  ShieldCheck, 
  ChevronRight,
  Info,
  Calendar,
  AlertCircle
} from 'lucide-react';

interface MPGroup {
  mp_name: string;
  constituency: string;
  total_projects: number;
  total_value_inr: number;
  projects: Array<{
    work_id: string;
    work_title: string;
    work_category: string;
    status: 'Ongoing' | 'Completed' | 'Not Started';
    sanctioned_amount_inr: number;
    disbursed_amount_inr: number;
    pending_amount_inr: number;
    physical_progress_percent: number;
  }>;
}

export const ContractorDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'projects' | 'funds' | 'upload'>('projects');

  // Contractor info
  const contractorName = "Bharat Infrastructure & Paving Pvt Ltd";
  const gstin = "10AAACB1234F1Z5";
  const vendorId = "CTR-BR-0042";

  // Data grouped by MP
  const [mpGroups, setMpGroups] = useState<MPGroup[]>([
    {
      mp_name: "Hon. Pradeep Kumar Singh",
      constituency: "Araria (Bihar)",
      total_projects: 3,
      total_value_inr: 9650000,
      projects: [
        {
          work_id: "WRK-2024-BR01-001",
          work_title: "Construction of 1.2km PCC Road with Side Drainage, Block Chowk to Raniganj",
          work_category: "Roads & Pathways",
          status: "Ongoing",
          sanctioned_amount_inr: 4850000,
          disbursed_amount_inr: 3200000,
          pending_amount_inr: 1650000,
          physical_progress_percent: 68
        },
        {
          work_id: "WRK-2024-BR01-004",
          work_title: "Community Drinking Water RO Purification & Distribution Kiosk",
          work_category: "Drinking Water",
          status: "Completed",
          sanctioned_amount_inr: 1800000,
          disbursed_amount_inr: 1800000,
          pending_amount_inr: 0,
          physical_progress_percent: 100
        },
        {
          work_id: "WRK-2024-BR01-009",
          work_title: "High-Mast Solar Street Light Cluster Installation (15 Units)",
          work_category: "Renewable Energy",
          status: "Not Started",
          sanctioned_amount_inr: 3000000,
          disbursed_amount_inr: 0,
          pending_amount_inr: 3000000,
          physical_progress_percent: 0
        }
      ]
    },
    {
      mp_name: "Hon. Girish Bapat",
      constituency: "Pune (Maharashtra)",
      total_projects: 2,
      total_value_inr: 8500000,
      projects: [
        {
          work_id: "WRK-2024-MH02-011",
          work_title: "High School Modern Science Laboratory & Computer Center Block",
          work_category: "Education",
          status: "Ongoing",
          sanctioned_amount_inr: 5000000,
          disbursed_amount_inr: 3500000,
          pending_amount_inr: 1500000,
          physical_progress_percent: 72
        },
        {
          work_id: "WRK-2024-MH02-018",
          work_title: "Senior Citizens Community Hall & Recreation Shed",
          work_category: "Community Infrastructure",
          status: "Completed",
          sanctioned_amount_inr: 3500000,
          disbursed_amount_inr: 3500000,
          pending_amount_inr: 0,
          physical_progress_percent: 100
        }
      ]
    }
  ]);

  // Upload Evidence State
  const [uploadWorkId, setUploadWorkId] = useState('WRK-2024-BR01-001');
  const [milestoneName, setMilestoneName] = useState('Sub-base Concrete Layer Laid');
  const [uploadPercent, setUploadPercent] = useState('70');
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setUploadSuccess(true);
    setTimeout(() => setUploadSuccess(false), 5000);
  };

  // Aggregated KPIs
  const allProjects = mpGroups.flatMap(g => g.projects);
  const countUnderExecution = allProjects.filter(p => p.status === 'Ongoing').length;
  const countCompleted = allProjects.filter(p => p.status === 'Completed').length;
  const countNotStarted = allProjects.filter(p => p.status === 'Not Started').length;
  const totalReceived = allProjects.reduce((acc, p) => acc + p.disbursed_amount_inr, 0);
  const totalPending = allProjects.reduce((acc, p) => acc + p.pending_amount_inr, 0);

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-6 space-y-6">
      
      {/* Contractor Header */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-gov-navy text-white">
              CONTRACTOR & IMPLEMENTING AGENCY WORKSPACE
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              GSTIN Verified Active
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {contractorName}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
            Vendor ID: {vendorId} • GSTIN: {gstin} • State: Bihar / Maharashtra Jurisdiction
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg text-xs font-semibold">
          <button
            onClick={() => setActiveTab('projects')}
            className={`px-4 py-2 rounded-md transition ${activeTab === 'projects' ? 'bg-white dark:bg-slate-900 text-gov-navy font-bold shadow-xs' : 'text-slate-600 dark:text-slate-400'}`}
          >
            My Projects (Grouped by MP)
          </button>
          <button
            onClick={() => setActiveTab('funds')}
            className={`px-4 py-2 rounded-md transition ${activeTab === 'funds' ? 'bg-white dark:bg-slate-900 text-gov-navy font-bold shadow-xs' : 'text-slate-600 dark:text-slate-400'}`}
          >
            Funds & SLA Delay Tracker
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`px-4 py-2 rounded-md transition ${activeTab === 'upload' ? 'bg-white dark:bg-slate-900 text-gov-navy font-bold shadow-xs' : 'text-slate-600 dark:text-slate-400'}`}
          >
            Submit Progress Evidence
          </button>
        </div>
      </div>

      {/* KPI Row (40px+ Bold Numbers) */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs border-l-4 border-l-blue-600">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Under Execution</span>
          <span className="text-3xl sm:text-4xl font-extrabold text-blue-600 tracking-tight block mt-1">
            {countUnderExecution}
          </span>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Works in progress</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs border-l-4 border-l-emerald-600">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Completed</span>
          <span className="text-3xl sm:text-4xl font-extrabold text-emerald-600 tracking-tight block mt-1">
            {countCompleted}
          </span>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Certified works</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs border-l-4 border-l-slate-400">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Not Yet Started</span>
          <span className="text-3xl sm:text-4xl font-extrabold text-slate-600 dark:text-slate-300 tracking-tight block mt-1">
            {countNotStarted}
          </span>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Awaiting mobilization</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs border-l-4 border-l-emerald-500">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Funds Received</span>
          <span className="text-2xl sm:text-3xl font-extrabold text-emerald-700 dark:text-emerald-400 tracking-tight block mt-1">
            ₹{(totalReceived / 100000).toFixed(1)}L
          </span>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Disbursed via SNA</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs border-l-4 border-l-amber-500">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Funds Pending</span>
          <span className="text-2xl sm:text-3xl font-extrabold text-amber-600 tracking-tight block mt-1">
            ₹{(totalPending / 100000).toFixed(1)}L
          </span>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Pending tranche release</span>
        </div>
      </div>

      {/* TAB 1: MY PROJECTS, GROUPED BY MP */}
      {activeTab === 'projects' && (
        <div className="space-y-6">
          {mpGroups.map((group, gIdx) => (
            <div key={gIdx} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
              {/* MP Group Header */}
              <div className="bg-slate-50 dark:bg-slate-800/60 p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gov-navy text-white flex items-center justify-center font-bold text-sm">
                    {group.mp_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-gov-navy dark:text-white">
                      {group.mp_name}
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Constituency: {group.constituency} • {group.total_projects} Works Assigned
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs text-slate-500 block">Total Sanctioned Value</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    ₹{(group.total_value_inr / 100000).toFixed(2)} Lakhs
                  </span>
                </div>
              </div>

              {/* Projects Table under this MP */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 dark:bg-slate-800/30 text-slate-600 dark:text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="p-3.5">Work Details</th>
                      <th className="p-3.5">Category</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5">Physical Progress</th>
                      <th className="p-3.5 text-right">Sanctioned</th>
                      <th className="p-3.5 text-right">Received</th>
                      <th className="p-3.5 text-right">Pending</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {group.projects.map((proj, pIdx) => (
                      <tr key={pIdx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                        <td className="p-3.5 font-medium text-slate-900 dark:text-white max-w-sm">
                          <span className="font-bold block">{proj.work_title}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{proj.work_id}</span>
                        </td>
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                            {proj.work_category}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            proj.status === 'Completed' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                            proj.status === 'Ongoing' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' :
                            'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                          }`}>
                            {proj.status}
                          </span>
                        </td>
                        <td className="p-3.5 min-w-[140px]">
                          <div className="flex items-center justify-between text-[11px] mb-1">
                            <span className="font-semibold">{proj.physical_progress_percent}%</span>
                          </div>
                          <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${proj.physical_progress_percent === 100 ? 'bg-emerald-500' : 'bg-primary'}`}
                              style={{ width: `${proj.physical_progress_percent}%` }}
                            />
                          </div>
                        </td>
                        <td className="p-3.5 text-right font-mono font-bold text-slate-900 dark:text-white">
                          ₹{(proj.sanctioned_amount_inr / 100000).toFixed(1)}L
                        </td>
                        <td className="p-3.5 text-right font-mono font-semibold text-emerald-600">
                          ₹{(proj.disbursed_amount_inr / 100000).toFixed(1)}L
                        </td>
                        <td className="p-3.5 text-right font-mono font-semibold text-amber-600">
                          ₹{(proj.pending_amount_inr / 100000).toFixed(1)}L
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: FUNDS MANAGEMENT & SLA DELAY TRACKER */}
      {activeTab === 'funds' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h2 className="text-sm font-bold text-gov-navy dark:text-white uppercase tracking-wider flex items-center gap-2">
                <IndianRupee className="w-4 h-4 text-gov-navy" />
                Project-Wise Fund Status & SLA Delay Explanations
              </h2>
              <span className="text-xs text-slate-500">Live SLA Bottleneck Feed</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 uppercase font-semibold text-[10px]">
                  <tr>
                    <th className="p-3.5">Project</th>
                    <th className="p-3.5 text-right">Sanctioned</th>
                    <th className="p-3.5 text-right">Received</th>
                    <th className="p-3.5 text-right">Pending</th>
                    <th className="p-3.5">SLA Delay Explanation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {allProjects.map((p, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="p-3.5">
                        <span className="font-bold text-slate-900 dark:text-white block">{p.work_title}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{p.work_id}</span>
                      </td>
                      <td className="p-3.5 text-right font-mono font-bold">₹{(p.sanctioned_amount_inr/100000).toFixed(1)}L</td>
                      <td className="p-3.5 text-right font-mono text-emerald-600 font-semibold">₹{(p.disbursed_amount_inr/100000).toFixed(1)}L</td>
                      <td className="p-3.5 text-right font-mono text-amber-600 font-semibold">₹{(p.pending_amount_inr/100000).toFixed(1)}L</td>
                      <td className="p-3.5">
                        {p.pending_amount_inr > 0 ? (
                          <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-300 font-medium">
                            <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                            <span>Payment pending: District Verification stage overdue by 32 days</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300 font-medium">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                            <span>All milestone tranches disbursed</span>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Past Disbursements Running Ledger */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs p-4">
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3">
              Running Ledger of Past Disbursements Received
            </h3>
            <div className="space-y-2">
              {[
                { ref: 'SNA-TR-8821', work: 'WRK-2024-BR01-001', tranche: 'Tranche 1 (Mobilization)', amount: 1500000, date: '2024-04-10' },
                { ref: 'SNA-TR-8822', work: 'WRK-2024-BR01-001', tranche: 'Tranche 2 (Sub-base Completion)', amount: 1700000, date: '2024-07-22' },
                { ref: 'SNA-TR-8823', work: 'WRK-2024-BR01-004', tranche: 'Final Tranche (Commissioning)', amount: 1800000, date: '2024-05-18' },
                { ref: 'SNA-TR-8824', work: 'WRK-2024-MH02-011', tranche: 'Tranche 1 (Foundation Structure)', amount: 3500000, date: '2024-06-05' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg text-xs">
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-200 block">{item.tranche}</span>
                    <span className="text-[10px] text-slate-400 font-mono">Ref: {item.ref} • {item.work}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-emerald-600 block">₹{(item.amount/100000).toFixed(1)} Lakhs</span>
                    <span className="text-[10px] text-slate-400">{item.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SUBMIT PROGRESS EVIDENCE (Feeding into pHash & verification) */}
      {activeTab === 'upload' && (
        <div className="max-w-2xl mx-auto bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs p-6 space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Camera className="w-5 h-5 text-primary" />
              Submit Milestone Physical Progress Evidence
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Upload geotagged photographic evidence and milestone completion claims. Submissions automatically undergo perceptual hash (pHash) analysis to ensure integrity.
            </p>
          </div>

          {uploadSuccess && (
            <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Evidence successfully recorded with perceptual hash index. Transmitted to District Technical Cell for milestone certification.</span>
            </div>
          )}

          <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Select Project</label>
              <select
                value={uploadWorkId}
                onChange={(e) => setUploadWorkId(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              >
                {allProjects.map((p, idx) => (
                  <option key={idx} value={p.work_id}>{p.work_id} - {p.work_title.slice(0, 50)}...</option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Milestone Name</label>
              <input
                type="text"
                value={milestoneName}
                onChange={(e) => setMilestoneName(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Reported Physical Progress (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={uploadPercent}
                onChange={(e) => setUploadPercent(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              />
            </div>

            <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-6 text-center">
              <UploadCloud className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="font-semibold text-slate-700 dark:text-slate-300">Upload Geotagged Site Photo</p>
              <p className="text-[10px] text-slate-400 mt-0.5">JPEG / PNG with EXIF GPS metadata</p>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-primary hover:bg-primary/90 text-white font-bold rounded-lg shadow-sm"
            >
              Submit Evidence for District Verification
            </button>
          </form>
        </div>
      )}

    </div>
  );
};
