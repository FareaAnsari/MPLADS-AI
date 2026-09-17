import React, { useState, useEffect } from 'react';
import { OpportunityRecord, ContractorInterestRecord } from '../../types/contractorOpportunity';
import { saveContractorInterest } from '../../data/contractorOpportunitiesData';
import { 
  X, 
  Send, 
  ShieldAlert, 
  CheckCircle2, 
  Building2, 
  FileText, 
  AlertCircle 
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  opportunity: OpportunityRecord | null;
  onSuccess?: () => void;
}

export const ContractorInterestModal: React.FC<Props> = ({
  isOpen,
  onClose,
  opportunity,
  onSuccess
}) => {
  const [contractorName, setContractorName] = useState('');
  const [authorizedPerson, setAuthorizedPerson] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [state, setState] = useState(opportunity?.state || 'Maharashtra');
  const [district, setDistrict] = useState(opportunity?.district || 'Pune');
  const [relevantSector, setRelevantSector] = useState(opportunity?.sector || 'Roads & Pathways');
  const [experienceYears, setExperienceYears] = useState(5);
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [gstin, setGstin] = useState('');
  const [companyProfile, setCompanyProfile] = useState('');
  const [reasonForInterest, setReasonForInterest] = useState('');
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);

  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (opportunity) {
      setState(opportunity.state || 'Maharashtra');
      setDistrict(opportunity.district || 'Pune');
      setRelevantSector(opportunity.sector || 'Roads & Pathways');
    }
  }, [opportunity]);

  if (!isOpen || !opportunity) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!contractorName.trim() || !authorizedPerson.trim() || !email.trim() || !phone.trim() || !reasonForInterest.trim()) {
      setErrorMsg('Please fill in all mandatory fields.');
      return;
    }

    if (!disclaimerAccepted) {
      setErrorMsg('You must accept the prototype declaration checkbox to continue.');
      return;
    }

    saveContractorInterest({
      projectId: opportunity.projectId,
      projectName: opportunity.workName,
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
      officialSourceUrl: opportunity.officialSource?.source_url,
      tenderStatus: opportunity.tenderStatus || undefined
    });

    setSubmitted(true);
    if (onSuccess) onSuccess();
  };

  const handleResetAndClose = () => {
    setSubmitted(false);
    setErrorMsg('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fadeIn overflow-y-auto">
      <div className="bg-white rounded-gov border border-gov-border shadow-2xl max-w-2xl w-full my-auto overflow-hidden">
        
        {/* Header */}
        <div className="bg-[#0b2e59] text-white px-5 py-3.5 flex items-center justify-between shrink-0">
          <div>
            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-400 text-slate-900 mb-0.5">
              Prototype Contractor Interest Registration
            </span>
            <h3 className="text-base font-bold">
              Express Interest in Publicly Listed Work
            </h3>
          </div>
          <button
            onClick={handleResetAndClose}
            className="p-1 text-slate-300 hover:text-white rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        {submitted ? (
          <div className="p-6 text-center space-y-4 animate-fadeIn">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-gov-navy">
                Interest recorded in the MPLADS AI prototype.
              </h4>
              <p className="text-xs text-slate-600 mt-1 max-w-md mx-auto leading-relaxed">
                Your interest has been saved to your local <strong>Contractor Dashboard</strong> for tracking. As a reminder, this prototype does not submit bids or award government contracts. For formal participation, please visit the official e-procurement portal.
              </p>
            </div>
            <div className="pt-3 border-t border-slate-200 flex justify-center space-x-3">
              <button
                onClick={handleResetAndClose}
                className="px-4 py-2 bg-gov-navy text-white text-xs font-bold rounded shadow-xs hover:bg-gov-navy-light transition"
              >
                Close Window
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs text-slate-700">
            
            {/* Legal / Ethical Notice */}
            <div className="p-3 bg-amber-50 border border-amber-200 rounded text-[11px] text-amber-900 leading-relaxed space-y-1">
              <div className="flex items-center space-x-1.5 font-bold text-amber-950">
                <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0" />
                <span>Notice on Prototype Expression of Interest</span>
              </div>
              <p>
                This form is an informational planning mechanism within the MPLADS AI prototype. 
                <strong> Expressing interest here does NOT award contracts, secure tenders, or submit official bids.</strong> 
                Official procurement participation is governed strictly by the Central/State e-Procurement authority.
              </p>
            </div>

            {/* Target Project Summary */}
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded space-y-1 text-xs">
              <span className="text-slate-500 block text-[11px]">Selected Project:</span>
              <div className="font-bold text-slate-900">{opportunity.workName}</div>
              <div className="text-[11px] text-slate-600 flex flex-wrap gap-x-3">
                <span><strong>ID:</strong> {opportunity.projectId}</span>
                <span><strong>District:</strong> {opportunity.district}, {opportunity.state}</span>
                <span><strong>Status:</strong> {opportunity.currentStatus}</span>
              </div>
            </div>

            {errorMsg && (
              <div className="p-2 bg-red-50 border border-red-200 rounded text-red-800 text-xs flex items-center space-x-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Fields Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              
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
                <label className="block font-semibold text-slate-700 mb-1">Authorized Person *</label>
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
                <label className="block font-semibold text-slate-700 mb-1">Official Email *</label>
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
                <label className="block font-semibold text-slate-700 mb-1">Contact Phone *</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98XXX XXXXX"
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-gov-navy focus:outline-none"
                />
              </div>

              {/* State & District */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Base State *</label>
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-gov-navy focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Base District *</label>
                <input
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-gov-navy focus:outline-none"
                />
              </div>

              {/* Relevant Sector */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Relevant Sector *</label>
                <input
                  type="text"
                  value={relevantSector}
                  onChange={(e) => setRelevantSector(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-gov-navy focus:outline-none"
                />
              </div>

              {/* Experience Years */}
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
                <label className="block font-semibold text-slate-700 mb-1">Registration/License No. (Voluntary)</label>
                <input
                  type="text"
                  value={registrationNumber}
                  onChange={(e) => setRegistrationNumber(e.target.value)}
                  placeholder="e.g. PWD/MH/CLASS-I"
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

            {/* Reason for Interest */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Reason for Interest & Capability Summary *</label>
              <textarea
                rows={2}
                required
                value={reasonForInterest}
                onChange={(e) => setReasonForInterest(e.target.value)}
                placeholder="Briefly state your relevant past works in this sector or district..."
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-gov-navy focus:outline-none text-xs"
              />
            </div>

            {/* Mandatory Checkbox */}
            <div className="p-3 bg-slate-50 border border-slate-300 rounded flex items-start space-x-2.5">
              <input
                type="checkbox"
                id="disclaimer-checkbox"
                checked={disclaimerAccepted}
                onChange={(e) => setDisclaimerAccepted(e.target.checked)}
                className="mt-0.5 rounded border-slate-300 text-gov-navy focus:ring-gov-navy cursor-pointer"
                required
              />
              <label htmlFor="disclaimer-checkbox" className="text-[11px] text-slate-800 font-semibold cursor-pointer leading-tight">
                "I understand that expressing interest through this prototype does not constitute a bid, tender submission, contract award, or government registration."
              </label>
            </div>

            {/* Footer Buttons */}
            <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
              <button
                type="button"
                onClick={handleResetAndClose}
                className="px-3 py-1.5 text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-gov-navy hover:bg-gov-navy-light text-white text-xs font-bold rounded shadow-gov flex items-center space-x-1.5 transition"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Record Interest in Prototype</span>
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
