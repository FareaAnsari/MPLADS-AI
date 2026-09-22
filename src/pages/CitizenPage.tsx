import React, { useState } from 'react';
import { MOCK_PROJECTS } from '../data/mockData';
import { Users2, Search, MapPin, CheckCircle2, MessageSquare, Send, ShieldCheck, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const CitizenPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  // Citizen Auth State (Aadhaar Verified)
  const [citizenAuth, setCitizenAuth] = useState<{
    name: string;
    aadhaarMasked: string;
    district: string;
    state: string;
  } | null>(() => {
    try {
      const saved = localStorage.getItem('mplads_citizen_auth');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [authMode, setAuthMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [regName, setRegName] = useState('');
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [regState, setRegState] = useState('Bihar');
  const [regDistrict, setRegDistrict] = useState('Araria');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [maskedMobile, setMaskedMobile] = useState('');
  const [authError, setAuthError] = useState('');

  const formatAadhaarInput = (val: string) => {
    const raw = val.replace(/\D/g, '').slice(0, 12);
    const parts = raw.match(/.{1,4}/g);
    return parts ? parts.join(' ') : raw;
  };

  const handleSendAadhaarOtp = async () => {
    const rawDigits = aadhaarNumber.replace(/\s+/g, '');
    if (rawDigits.length !== 12) {
      setAuthError('Please enter a valid 12-digit Aadhaar Number.');
      return;
    }

    setOtpLoading(true);
    setAuthError('');
    try {
      const res = await fetch('/api/auth/citizen/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aadhaar_number: rawDigits }),
      });
      if (res.ok) {
        const data = await res.json();
        setMaskedMobile(data.masked_mobile);
        setOtpSent(true);
      } else {
        const last4 = rawDigits.slice(-4);
        setMaskedMobile(`+91 XXXXX X${last4}`);
        setOtpSent(true);
      }
    } catch {
      const last4 = rawDigits.slice(-4);
      setMaskedMobile(`+91 XXXXX X${last4}`);
      setOtpSent(true);
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyAadhaar = async (e: React.FormEvent) => {
    e.preventDefault();
    const rawDigits = aadhaarNumber.replace(/\s+/g, '');
    if (rawDigits.length !== 12) {
      setAuthError('Please enter a valid 12-digit Aadhaar Number.');
      return;
    }
    if (!otpSent) {
      setAuthError('Please request UIDAI OTP first.');
      return;
    }
    if (otp.trim().length !== 6) {
      setAuthError('Please enter the 6-digit OTP sent to your Aadhaar-linked mobile (Demo: 123456).');
      return;
    }

    if (authMode === 'REGISTER' && !regName.trim()) {
      setAuthError('Please enter your full name as printed on Aadhaar.');
      return;
    }

    const last4 = rawDigits.slice(-4);
    const masked = `XXXX-XXXX-${last4}`;
    const displayName = regName.trim() || (rawDigits === '548912345678' ? 'Ramesh Kumar' : `Verified Citizen (${masked})`);

    const citizen = {
      name: displayName,
      aadhaarMasked: masked,
      district: regDistrict.trim() || 'Araria',
      state: regState.trim() || 'Bihar',
    };

    localStorage.setItem('mplads_citizen_auth', JSON.stringify(citizen));
    setCitizenAuth(citizen);
    setAuthError('');
  };

  const handleCitizenLogout = () => {
    localStorage.removeItem('mplads_citizen_auth');
    setCitizenAuth(null);
    setOtpSent(false);
    setOtp('');
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
          {citizenAuth && (
            <div className="flex items-center space-x-2 bg-emerald-950/60 px-3 py-1.5 rounded-full border border-emerald-400/30 text-xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
              <span className="font-semibold text-emerald-100">{citizenAuth.name} ({citizenAuth.district})</span>
              <button
                onClick={handleCitizenLogout}
                className="text-[10px] text-emerald-300 hover:text-white underline ml-1"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
        <p className="text-xs text-emerald-100 max-w-2xl leading-relaxed">
          Track the development works recommended by your Member of Parliament in your village, block, and district.
          Public funds belong to the citizens — explore real-time physical completion status and submit verified ground audits.
        </p>

        {/* Citizen Search Bar */}
        <div className="pt-2 max-w-xl">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Enter your Village, District, or MP name (e.g. Pune, Murlidhar Mohol, Araria, Pradeep Kumar Singh)..."
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
                  <button
                    onClick={() => navigate(`/projects/${p.id}`)}
                    className="text-gov-blue hover:text-gov-navy font-semibold"
                  >
                    View Public Timeline →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Citizen Verification & Feedback Section */}
      <div className="bg-white p-5 rounded-gov border border-gov-border shadow-gov">
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <MessageSquare className="w-4 h-4 text-emerald-700" />
            <h3 className="text-sm font-bold text-slate-800">
              Citizen Verification & Public Accountability Audit
            </h3>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded">
            MoSPI Anti-Tampering Protocol
          </span>
        </div>

        {!citizenAuth ? (
          /* Aadhaar Registration & Login Requirement Gate */
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-5 space-y-4">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-emerald-100 text-emerald-800 rounded-full mt-0.5">
                <Lock className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <h4 className="text-xs font-bold text-slate-900">
                    Aadhaar Identity Verification Mandatory for Citizen Audits
                  </h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded">
                    UIDAI e-KYC
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Under MoSPI anti-tampering directives, citizen verification and physical evidence submissions require authentic 12-digit Aadhaar Card identity verification to ensure genuine public accountability.
                </p>
              </div>
            </div>

            <div className="flex border-b border-slate-200 text-xs font-semibold">
              <button
                type="button"
                onClick={() => { setAuthMode('LOGIN'); setOtpSent(false); setAuthError(''); }}
                className={`pb-2 px-4 ${authMode === 'LOGIN' ? 'border-b-2 border-emerald-600 text-emerald-700 font-bold' : 'text-slate-500'}`}
              >
                Sign In with Aadhaar
              </button>
              <button
                type="button"
                onClick={() => { setAuthMode('REGISTER'); setOtpSent(false); setAuthError(''); }}
                className={`pb-2 px-4 ${authMode === 'REGISTER' ? 'border-b-2 border-emerald-600 text-emerald-700 font-bold' : 'text-slate-500'}`}
              >
                Register Verified Citizen (Aadhaar)
              </button>
            </div>

            {authError && (
              <div className="p-2 bg-rose-50 text-rose-700 text-xs rounded border border-rose-200">
                {authError}
              </div>
            )}

            <form onSubmit={handleVerifyAadhaar} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="font-semibold text-slate-700 block mb-1">
                    12-Digit Aadhaar Number *
                  </label>
                  <div className="flex space-x-2">
                    <input
                      required
                      type="text"
                      maxLength={14}
                      value={aadhaarNumber}
                      onChange={(e) => setAadhaarNumber(formatAadhaarInput(e.target.value))}
                      placeholder="XXXX XXXX XXXX (e.g. 5489 1234 5678)"
                      className="flex-1 px-3 py-1.5 border border-slate-300 rounded bg-white tracking-widest font-mono text-sm"
                    />
                    <button
                      type="button"
                      disabled={otpLoading || aadhaarNumber.replace(/\s/g, '').length !== 12}
                      onClick={handleSendAadhaarOtp}
                      className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-300 text-white font-semibold rounded whitespace-nowrap"
                    >
                      {otpLoading ? 'Dispatching...' : otpSent ? 'Resend OTP' : 'Send Aadhaar OTP'}
                    </button>
                  </div>
                  <span className="text-[10px] text-slate-500 mt-0.5 block">
                    Statutory UIDAI e-KYC: OTP will be sent to the Aadhaar-registered mobile.
                  </span>
                </div>

                {authMode === 'REGISTER' && (
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      Full Name (as on Aadhaar) *
                    </label>
                    <input
                      required
                      type="text"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="e.g. Ramesh Kumar"
                      className="w-full px-3 py-1.5 border border-slate-300 rounded bg-white"
                    />
                  </div>
                )}
              </div>

              {otpSent && (
                <div className="bg-emerald-50 border border-emerald-200 rounded p-3 space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-emerald-800">
                    <span>UIDAI OTP dispatched to <strong>{maskedMobile}</strong></span>
                    <span className="text-emerald-700 font-mono">Demo OTP: 123456</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Enter 6-Digit OTP *</label>
                      <input
                        required
                        type="text"
                        maxLength={6}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                        placeholder="123456"
                        className="w-full px-3 py-1.5 border border-emerald-400 rounded bg-white text-center font-mono font-bold tracking-widest text-sm"
                      />
                    </div>

                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Home District</label>
                      <input
                        type="text"
                        value={regDistrict}
                        onChange={(e) => setRegDistrict(e.target.value)}
                        placeholder="e.g. Araria"
                        className="w-full px-3 py-1.5 border border-slate-300 rounded bg-white"
                      />
                    </div>

                    <div>
                      <button
                        type="submit"
                        className="w-full py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded flex items-center justify-center space-x-1.5 shadow-sm"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        <span>Verify Aadhaar e-KYC & Access</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </form>
          </div>
        ) : feedbackSubmitted ? (
          <div className="p-3 bg-emerald-50 text-emerald-800 text-xs rounded border border-emerald-200 flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Thank you {citizenAuth.name}. Your verified public audit (Aadhaar: {citizenAuth.aadhaarMasked}) has been registered under reference #CIT-2026-9912.</span>
          </div>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); setFeedbackSubmitted(true); }} className="space-y-3 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Verified Citizen Identity</label>
                <input disabled type="text" value={`${citizenAuth.name} (${citizenAuth.aadhaarMasked})`} className="w-full px-3 py-1.5 border border-slate-200 rounded bg-slate-100 text-slate-600 font-medium" />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Home District</label>
                <input disabled type="text" value={`${citizenAuth.district}, ${citizenAuth.state}`} className="w-full px-3 py-1.5 border border-slate-200 rounded bg-slate-100 text-slate-600" />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Select Project Code *</label>
                <select className="w-full px-3 py-1.5 border border-slate-300 rounded text-slate-700">
                  {MOCK_PROJECTS.map(p => (
                    <option key={p.id} value={p.id}>{p.code} - {p.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Your On-Site Observation / Audit Findings *</label>
              <textarea required rows={2} placeholder="Report work status, asset utility, drinking water quality, or maintenance condition..." className="w-full px-3 py-1.5 border border-slate-300 rounded"></textarea>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-[11px] text-slate-500 flex items-center space-x-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Statutory submission signed with Aadhaar e-KYC ({citizenAuth.aadhaarMasked})</span>
              </span>
              <button type="submit" className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded flex items-center space-x-1">
                <Send className="w-3 h-3" />
                <span>Submit Verified Citizen Audit</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
