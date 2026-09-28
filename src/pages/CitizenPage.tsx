import React, { useState, useEffect } from 'react';
import { MOCK_PROJECTS } from '../data/mockData';
import { 
  Users2, 
  Search, 
  MapPin, 
  CheckCircle2, 
  MessageSquare, 
  Send, 
  ShieldCheck, 
  FileText, 
  Clock, 
  AlertCircle,
  PlusCircle,
  Check,
  Lock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { sanitizeText, secureStorage, maskPII } from '../security';


interface CitizenSubmission {
  id: string;
  citizenName: string;
  contactInfo: string;
  district: string;
  state: string;
  projectId: string;
  projectCode: string;
  projectName: string;
  category: string;
  statusAssessment: string;
  findings: string;
  submittedAt: string;
}

export const CitizenPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  // Form State
  const [citizenName, setCitizenName] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [district, setDistrict] = useState('Araria');
  const [state, setState] = useState('Bihar');
  const [selectedProjectId, setSelectedProjectId] = useState(MOCK_PROJECTS[0]?.id || '');
  const [category, setCategory] = useState('On-Site Physical Progress Verification');
  const [statusAssessment, setStatusAssessment] = useState('Work in Progress as Scheduled');
  const [findings, setFindings] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSubmissionRef, setLastSubmissionRef] = useState<string | null>(null);

  // Submissions stored in tamper-evident secureStorage
  const [pastSubmissions, setPastSubmissions] = useState<CitizenSubmission[]>(() => {
    return secureStorage.getItem<CitizenSubmission[]>('mplads_citizen_submissions', []);
  });

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = sanitizeText(citizenName.trim());
    const cleanFindings = sanitizeText(findings.trim());
    const cleanContact = sanitizeText(contactInfo.trim());
    const cleanDistrict = sanitizeText(district.trim());
    const cleanState = sanitizeText(state.trim());

    if (!cleanName || !cleanFindings) return;

    setIsSubmitting(true);
    const selectedProject = MOCK_PROJECTS.find(p => p.id === selectedProjectId) || MOCK_PROJECTS[0];
    const refNumber = `CIT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newSubmission: CitizenSubmission = {
      id: refNumber,
      citizenName: cleanName,
      contactInfo: cleanContact || 'Not Provided',
      district: cleanDistrict || selectedProject.district,
      state: cleanState || selectedProject.state,
      projectId: selectedProject.id,
      projectCode: selectedProject.code,
      projectName: selectedProject.name,
      category,
      statusAssessment,
      findings: cleanFindings,
      submittedAt: new Date().toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    };

    setTimeout(() => {
      const updated = [newSubmission, ...pastSubmissions];
      setPastSubmissions(updated);
      secureStorage.setItem('mplads_citizen_submissions', updated);
      setLastSubmissionRef(refNumber);
      setIsSubmitting(false);
      setFindings('');
    }, 400);
  };

  const filtered = MOCK_PROJECTS.filter(p => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return p.name.toLowerCase().includes(q) || 
           p.district.toLowerCase().includes(q) || 
           p.mpName.toLowerCase().includes(q) || 
           (p.village && p.village.toLowerCase().includes(q));
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 space-y-5">
      {/* Citizen Banner */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white p-6 rounded-gov shadow-sm space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Users2 className="w-6 h-6 text-emerald-300" />
            <h1 className="text-xl font-bold tracking-wide">
              Citizen Transparency & Public Accountability Portal
            </h1>
          </div>
          <div className="hidden sm:flex items-center space-x-1 text-xs text-emerald-200 bg-emerald-950/40 px-3 py-1 rounded-full border border-emerald-400/20">
            <ShieldCheck className="w-4 h-4 text-emerald-300" />
            <span>Direct Public Oversight</span>
          </div>
        </div>
        <p className="text-xs text-emerald-100 max-w-2xl leading-relaxed">
          Track the development works recommended by your Member of Parliament in your village, block, and district.
          Public funds belong to the citizens — explore real-time physical completion status and submit ground observations directly to District Authorities.
        </p>

        {/* Citizen Search Bar */}
        <div className="pt-2 max-w-xl">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Enter your Village, District, or MP name (e.g. Pune, Araria, Varanasi, Mumbai)..."
              className="w-full pl-9 pr-4 py-2 bg-white text-slate-800 text-xs rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>
        </div>
      </div>

      {/* Projects List for Citizens */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-slate-700">
          <span>Public Works in Your Area ({filtered.length})</span>
          <span className="text-[11px] text-slate-400 font-normal">Updated through Geotagged Site Reports</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(p => (
            <div key={p.id} className="bg-white rounded-gov border border-gov-border p-4 shadow-gov space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                    {p.category}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border capitalize ${
                    p.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>
                    {p.status}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 leading-snug">{p.name}</h3>
                <p className="text-xs text-slate-500 mt-1 flex items-center space-x-1">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  <span>{p.village ? `${p.village}, ` : ''}{p.district}, {p.state}</span>
                </p>

                <p className="text-xs text-slate-600 mt-2 bg-slate-50 p-2 rounded border border-slate-100 line-clamp-2">
                  {p.purpose}
                </p>
              </div>

              <div>
                {/* Simplified Public Progress Bar */}
                <div className="space-y-1 pt-2 border-t border-slate-100">
                  <div className="flex justify-between text-[11px] text-slate-600 font-medium">
                    <span>Physical Execution</span>
                    <span className="font-bold text-emerald-700">{p.physicalProgress}%</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-600 h-full" style={{ width: `${p.physicalProgress}%` }}></div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-3">
                  <span>MP: <strong>{p.mpName}</strong></span>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedProjectId(p.id);
                        const formElement = document.getElementById('citizen-feedback-section');
                        formElement?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="text-emerald-700 hover:text-emerald-800 font-semibold"
                    >
                      Report on this Work
                    </button>
                    <span>•</span>
                    <button
                      onClick={() => navigate(`/projects/${p.id}`)}
                      className="text-gov-blue hover:text-gov-navy font-semibold"
                    >
                      View Timeline →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Citizen Feedback & Ground Audit Section */}
      <div id="citizen-feedback-section" className="bg-white p-5 rounded-gov border border-gov-border shadow-gov space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <MessageSquare className="w-4 h-4 text-emerald-700" />
            <h3 className="text-sm font-bold text-slate-800">
              Citizen Ground Observation & Public Audit Submission
            </h3>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded">
            Public Oversight Desk
          </span>
        </div>

        {lastSubmissionRef ? (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg space-y-3">
            <div className="flex items-center space-x-2 text-emerald-800">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <h4 className="text-xs font-bold">Ground Observation Registered Successfully!</h4>
                <p className="text-[11px] text-emerald-700 mt-0.5">
                  Thank you, <strong>{citizenName}</strong>. Your on-site audit report has been assigned reference ID <strong>#{lastSubmissionRef}</strong> and forwarded to the District Planning Authority for review.
                </p>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setLastSubmissionRef(null)}
                className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded flex items-center space-x-1.5 shadow-xs transition"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Submit Another Observation</span>
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Citizen Full Name *
                </label>
                <input
                  required
                  type="text"
                  value={citizenName}
                  onChange={(e) => setCitizenName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Mobile Number / Email <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={contactInfo}
                  onChange={(e) => setContactInfo(e.target.value)}
                  placeholder="e.g. 98765 43210 or email"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  District *
                </label>
                <input
                  required
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  placeholder="e.g. Araria, Pune, Varanasi"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  State *
                </label>
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="Bihar">Bihar</option>
                  <option value="Maharashtra">Maharashtra</option>
                  <option value="Uttar Pradesh">Uttar Pradesh</option>
                  <option value="Punjab">Punjab</option>
                  <option value="Rajasthan">Rajasthan</option>
                  <option value="Kerala">Kerala</option>
                  <option value="Tamil Nadu">Tamil Nadu</option>
                  <option value="West Bengal">West Bengal</option>
                  <option value="Karnataka">Karnataka</option>
                  <option value="Delhi">Delhi</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Select Project Work *
                </label>
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  {MOCK_PROJECTS.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.code} — {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Observation Nature *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="On-Site Physical Progress Verification">On-Site Physical Progress Verification</option>
                  <option value="Asset Quality & Durability">Asset Quality & Durability</option>
                  <option value="Drinking Water / Utility Operational Status">Drinking Water / Utility Operational Status</option>
                  <option value="Delay or Abandoned Work Report">Delay or Abandoned Work Report</option>
                  <option value="General Citizen Feedback">General Citizen Feedback</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Current Status on Ground *
                </label>
                <select
                  value={statusAssessment}
                  onChange={(e) => setStatusAssessment(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="Work in Progress as Scheduled">Work in Progress as Scheduled</option>
                  <option value="Completed & Functional">Completed & Fully Functional</option>
                  <option value="Delayed / Work Stalled">Delayed / Work Stalled</option>
                  <option value="Quality / Maintenance Defect">Quality / Maintenance Defect</option>
                </select>
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                On-Site Observation & Audit Findings *
              </label>
              <textarea
                required
                rows={3}
                value={findings}
                onChange={(e) => setFindings(e.target.value)}
                placeholder="Describe actual ground condition, functional utility to the village, quality of road/water/building, or any bottleneck observed on ground..."
                className="w-full px-3 py-2 border border-slate-300 rounded bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 leading-relaxed"
              ></textarea>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pt-1 border-t border-slate-100">
              <span className="text-[11px] text-slate-500 flex items-center space-x-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Protected by MoSPI Anti-Tampering & PII Masking Shield</span>
              </span>
              <button
                type="submit"
                disabled={isSubmitting || !citizenName.trim() || !findings.trim()}
                className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-300 text-white font-bold rounded flex items-center space-x-1.5 shadow-xs transition"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Registering Report...' : 'Submit Citizen Ground Observation'}</span>
              </button>
            </div>
          </form>
        )}

        {/* Recent Citizen Submissions Log */}
        {pastSubmissions.length > 0 && (
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <h4 className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              <span>Your Recent Submitted Observations ({pastSubmissions.length})</span>
            </h4>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {pastSubmissions.map((sub) => (
                <div key={sub.id} className="p-3 bg-slate-50 border border-slate-200 rounded text-xs space-y-1">
                  <div className="flex flex-wrap items-center justify-between gap-1">
                    <span className="font-bold text-slate-900 flex items-center space-x-1.5">
                      <span className="font-mono text-emerald-700">#{sub.id}</span>
                      <span>—</span>
                      <span>{sub.projectCode}</span>
                    </span>
                    <span className="text-[10px] text-slate-400 flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{sub.submittedAt}</span>
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 font-medium">
                    {sub.projectName} ({sub.district}, {sub.state})
                  </p>
                  <p className="text-[11px] text-slate-700 bg-white p-2 rounded border border-slate-100 mt-1">
                    "{sub.findings}"
                  </p>
                  <div className="flex items-center space-x-2 pt-1 text-[10px] text-slate-500">
                    <span className="px-1.5 py-0.5 bg-slate-200 text-slate-700 rounded font-semibold">{sub.category}</span>
                    <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded font-semibold">{sub.statusAssessment}</span>
                    <span>By: {sub.citizenName}</span>
                    {sub.contactInfo && sub.contactInfo !== 'Not Provided' && (
                      <span className="text-slate-400 text-[9px] font-mono">({maskPII(sub.contactInfo)})</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CitizenPage;
