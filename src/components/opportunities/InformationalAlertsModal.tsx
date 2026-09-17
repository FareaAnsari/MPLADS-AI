import React, { useState } from 'react';
import { Bell, X, CheckCircle2, Info, ShieldCheck } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const InformationalAlertsModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [state, setState] = useState('Maharashtra');
  const [district, setDistrict] = useState('Pune');
  const [sector, setSector] = useState('Roads & Pathways');
  const [projectType, setProjectType] = useState('Civil & Structural');
  const [email, setEmail] = useState('');
  const [frequency, setFrequency] = useState('Immediate / Daily Digest');
  const [subscribed, setSubscribed] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribed(true);
  };

  const handleClose = () => {
    setSubscribed(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-gov border border-gov-border shadow-2xl max-w-md w-full p-5 space-y-4 text-xs text-slate-700">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gov-border pb-3">
          <div className="flex items-center space-x-2 text-gov-navy">
            <Bell className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-sm uppercase tracking-wide">
              Procurement Opportunity Alerts Simulator
            </h3>
          </div>
          <button onClick={handleClose} className="p-1 text-slate-400 hover:text-slate-700 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>

        {subscribed ? (
          <div className="text-center py-6 space-y-3 animate-fadeIn">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-900">
                Informational Alert Preference Saved
              </h4>
              <p className="text-slate-500 text-[11px] mt-1 max-w-xs mx-auto">
                Preferences for <strong>{sector}</strong> works in <strong>{district}, {state}</strong> have been recorded in the prototype simulation.
              </p>
            </div>
            <button
              onClick={handleClose}
              className="px-4 py-2 bg-gov-navy text-white text-xs font-bold rounded shadow-xs"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            
            <div className="p-2.5 bg-blue-50 border border-blue-200 rounded text-[11px] text-blue-900 space-y-1">
              <div className="font-bold flex items-center space-x-1">
                <Info className="w-3.5 h-3.5 text-blue-700 shrink-0" />
                <span>Local Alert Simulation Notice</span>
              </div>
              <p>
                "Notify me when an official procurement opportunity matching my selected criteria is added."
                This subscription is simulated locally in this prototype. Live government email integration requires an authorized institutional gateway.
              </p>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Target State</label>
              <select
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-gov-navy focus:outline-none"
              >
                <option value="Maharashtra">Maharashtra</option>
                <option value="Bihar">Bihar</option>
                <option value="Punjab">Punjab</option>
                <option value="Uttar Pradesh">Uttar Pradesh</option>
                <option value="Rajasthan">Rajasthan</option>
                <option value="Kerala">Kerala</option>
                <option value="Tamil Nadu">Tamil Nadu</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Target District</label>
              <input
                type="text"
                required
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                placeholder="e.g. Pune, Araria, Varanasi..."
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-gov-navy focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Target Sector</label>
              <select
                value={sector}
                onChange={(e) => setSector(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-gov-navy focus:outline-none"
              >
                <option value="Roads & Pathways">Roads & Pathways</option>
                <option value="Drinking Water">Drinking Water</option>
                <option value="Health & Sanitation">Health & Sanitation</option>
                <option value="Education">Education</option>
                <option value="Community Infrastructure">Community Infrastructure</option>
                <option value="Renewable Energy">Renewable Energy</option>
                <option value="Sports">Sports</option>
                <option value="Irrigation">Irrigation</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Project Type Specialization</label>
              <select
                value={projectType}
                onChange={(e) => setProjectType(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-gov-navy focus:outline-none"
              >
                <option value="Civil & Structural">Civil & Structural Works</option>
                <option value="Piped Water / Drainage">Piped Water & Drainage Pipelines</option>
                <option value="Electrical & Solar">Electrical & Solar Installations</option>
                <option value="Equipment & Supplies">Equipment & Material Supply</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Your Notification Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contractor@infra.com"
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-gov-navy focus:outline-none"
              />
            </div>

            <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
              <button
                type="button"
                onClick={handleClose}
                className="text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-gov-navy hover:bg-gov-navy-light text-white text-xs font-bold rounded shadow-xs"
              >
                Activate Prototype Alert
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
