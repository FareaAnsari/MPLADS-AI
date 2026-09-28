import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { OPPORTUNITIES_DATA, saveContractorInterest } from '../data/contractorOpportunitiesData';
import { 
  Send, 
  ShieldAlert, 
  CheckCircle2, 
  Building2, 
  AlertCircle, 
  ArrowLeft,
  FileCheck2
} from 'lucide-react';

export const ContractorInterestPage: React.FC = () => {
  const navigate = useNavigate();

  const [selectedProjectId, setSelectedProjectId] = useState<string>(OPPORTUNITIES_DATA[0]?.projectId || '');
  const [contractorName, setContractorName] = useState('');
  const [authorizedPerson, setAuthorizedPerson] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [state, setState] = useState('Maharashtra');
  const [district, setDistrict] = useState('Pune');
  const [relevantSector, setRelevantSector] = useState('Roads & Pathways');
  const [experienceYears, setExperienceYears] = useState(5);
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [gstin, setGstin] = useState('');
  const [companyProfile, setCompanyProfile] = useState('');
  const [reasonForInterest, setReasonForInterest] = useState('');
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);

  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const selectedOpp = useMemo(() => {
    return OPPORTUNITIES_DATA.find(o => o.projectId === selectedProjectId) || OPPORTUNITIES_DATA[0];
  }, [selectedProjectId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!contractorName.trim() || !authorizedPerson.trim() || !email.trim() || !phone.trim() || !reasonForInterest.trim()) {
      setErrorMsg('Please complete all mandatory fields.');
      return;
    }

    if (!disclaimerAccepted) {
      setErrorMsg('You must agree to the prototype declaration checkbox.');
      return;
    }

    saveContractorInterest({
      projectId: selectedOpp.projectId,
      projectName: selectedOpp.workName,
      contractorName: contractorName.trim(),
      authorizedPerson: authorizedPerson.trim(),
      email: email.trim(),
      phone: phone.trim(),
      state,
      district,
      relevantSector,
      experienceYears: Number(experienceYears) || 0,
      registrationNumber: registrationNumber.trim() || undefined,
      gstin: gstin.trim() || undefined,
      companyProfile: companyProfile.trim() || undefined,
      reasonForInterest: reasonForInterest.trim(),
      disclaimerAccepted: true,
      officialSourceUrl: selectedOpp.officialSource?.source_url,
      tenderStatus: selectedOpp.tenderStatus || undefined
    });

    setSubmitted(true);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-5 space-y-5">
      
      {/* Back Breadcrumb */}
      <div className="flex items-center justify-between text-xs">
        <button
          onClick={() => navigate('/opportunities')}
          className="flex items-center space-x-1 text-gov-navy hover:text-blue-700 font-semibold"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Opportunities Index</span>
        </button>
        <button
          onClick={() => navigate('/contractor-dashboard')}
          className="text-blue-700 hover:underline font-semibold"
        >
          View My Interested Projects
        </button>
      </div>

      {/* Page Header */}
      <div className="bg-white rounded-gov border border-gov-border shadow-gov p-5 space-y-2">
        <div className="flex items-center space-x-2">
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-gov-navy text-white">
            Prototype Registration Mechanism
          </span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-gov-navy tracking-tight">
          Express Interest in MPLADS Procurement Works
        </h1>
        <p className="text-xs text-slate-600">
          Record your firm's capability and interest for tracking and notifications within the prototype dashboard.
        </p>
      </div>

      {/* Legal & Governance Notice */}
      <div className="p-4 bg-amber-50/90 border border-amber-200 rounded-gov text-xs text-amber-950 space-y-1.5 leading-relaxed">
        <div className="flex items-center space-x-2 font-bold text-amber-900 text-sm">
          <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0" />
          <span>Strict Legal & Ethical Notice: Prototype Interest Registration</span>
        </div>
        <p>
          "Expressing interest through this prototype does NOT constitute a bid, tender submission, contract award, or government registration. All procurement opportunities must be formally pursued on official Central and State Government e-procurement portals (such as CPPP or GeM) in strict accordance with statutory tender conditions."
        </p>
      </div>

      {submitted ? (
        <div className="bg-white rounded-gov border border-gov-border shadow-gov p-8 text-center space-y-4 animate-fadeIn">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gov-navy">
              Interest recorded in the MPLADS AI prototype.
            </h2>
            <p className="text-xs text-slate-600 mt-1.5 max-w-lg mx-auto leading-relaxed">
              Your expression of interest for <strong>{selectedOpp.workName}</strong> ({selectedOpp.projectId}) has been saved to your local contractor dashboard.
            </p>
          </div>
          <div className="pt-4 border-t border-slate-200 flex justify-center space-x-3">
            <button
              onClick={() => navigate('/contractor-dashboard')}
              className="px-4 py-2 bg-gov-navy hover:bg-gov-navy-light text-white text-xs font-bold rounded shadow-gov transition"
            >
              Go to Contractor Dashboard
            </button>
            <button
              onClick={() => setSubmitted(false)}
              className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold rounded shadow-xs"
            >
              Express Interest in Another Work
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white rounded-gov border border-gov-border shadow-gov p-6 space-y-4 text-xs text-slate-700">
          
          {errorMsg && (
            <div className="p-2.5 bg-red-50 border border-red-200 rounded text-red-800 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Target Work Selection */}
          <div>
            <label className="block font-semibold text-slate-800 mb-1">Select Target MPLADS Project *</label>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-1 focus:ring-gov-navy focus:outline-none bg-white text-slate-900 font-medium text-xs"
            >
              {OPPORTUNITIES_DATA.map(opp => (
                <option key={opp.id} value={opp.projectId}>
                  [{opp.projectId}] {opp.workName} ({opp.district}, {opp.state}) - {opp.currentStatus}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Firm Name */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Contractor / Firm Name *</label>
              <input
                type="text"
                required
                value={contractorName}
                onChange={(e) => setContractorName(e.target.value)}
                placeholder="e.g. Apex Civil Infra LLP"
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-gov-navy focus:outline-none"
              />
            </div>

            {/* Authorized Person */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Authorized Representative Name *</label>
              <input
                type="text"
                required
                value={authorizedPerson}
                onChange={(e) => setAuthorizedPerson(e.target.value)}
                placeholder="e.g. Rajesh Deshmukh"
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-gov-navy focus:outline-none"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Official Email Address *</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contact@company.com"
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-gov-navy focus:outline-none"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Contact Phone Number *</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98XXX XXXXX"
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-gov-navy focus:outline-none"
              />
            </div>

            {/* State */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Operating State *</label>
              <input
                type="text"
                required
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-gov-navy focus:outline-none"
              />
            </div>

            {/* District */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Operating District *</label>
              <input
                type="text"
                required
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-gov-navy focus:outline-none"
              />
            </div>

            {/* Sector */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Primary Execution Sector *</label>
              <input
                type="text"
                required
                value={relevantSector}
                onChange={(e) => setRelevantSector(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-gov-navy focus:outline-none"
              />
            </div>

            {/* Experience */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Years of Execution Experience</label>
              <input
                type="number"
                min={0}
                max={50}
                value={experienceYears}
                onChange={(e) => setExperienceYears(parseInt(e.target.value) || 0)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-gov-navy focus:outline-none"
              />
            </div>

            {/* Registration Number (Voluntary) */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">PWD / CPWD Registration Class (Voluntary)</label>
              <input
                type="text"
                value={registrationNumber}
                onChange={(e) => setRegistrationNumber(e.target.value)}
                placeholder="e.g. PWD/MH/CLASS-I/2021"
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-gov-navy focus:outline-none"
              />
            </div>

            {/* GSTIN (Voluntary) */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">GSTIN (Voluntary)</label>
              <input
                type="text"
                value={gstin}
                onChange={(e) => setGstin(e.target.value)}
                placeholder="e.g. 27AABCA1234F1Z5"
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-gov-navy focus:outline-none"
              />
            </div>
          </div>

          {/* Company Profile (Optional) */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Company Profile / Machinery Summary (Optional)</label>
            <textarea
              rows={2}
              value={companyProfile}
              onChange={(e) => setCompanyProfile(e.target.value)}
              placeholder="List available machinery, batching plant, dumpers, technical manpower..."
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-gov-navy focus:outline-none text-xs"
            />
          </div>

          {/* Reason for Interest */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Reason for Interest & Past Relevant Works *</label>
            <textarea
              rows={3}
              required
              value={reasonForInterest}
              onChange={(e) => setReasonForInterest(e.target.value)}
              placeholder="State your technical readiness, past road/civil experience in this region, and reason for expressing interest..."
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-gov-navy focus:outline-none text-xs"
            />
          </div>

          {/* Mandatory Checkbox */}
          <div className="p-3.5 bg-slate-50 border border-slate-300 rounded flex items-start space-x-3">
            <input
              type="checkbox"
              id="page-disclaimer"
              checked={disclaimerAccepted}
              onChange={(e) => setDisclaimerAccepted(e.target.checked)}
              required
              className="mt-0.5 rounded border-slate-300 text-gov-navy focus:ring-gov-navy cursor-pointer"
            />
            <label htmlFor="page-disclaimer" className="text-xs text-slate-900 font-semibold cursor-pointer leading-tight">
              "I understand that expressing interest through this prototype does not constitute a bid, tender submission, contract award, or government registration."
            </label>
          </div>

          {/* Action */}
          <div className="pt-3 border-t border-slate-200 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 bg-gov-navy hover:bg-gov-navy-light text-white text-xs font-bold rounded shadow-gov flex items-center space-x-2 transition"
            >
              <Send className="w-4 h-4" />
              <span>Submit Prototype Expression of Interest</span>
            </button>
          </div>

        </form>
      )}

    </div>
  );
};
