import React, { useState } from 'react';
import { MOCK_PROJECTS } from '../data/mockData';
import { Users2, Search, MapPin, CheckCircle2, MessageSquare, Send, HeartHandshake } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const CitizenPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

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
        <div className="flex items-center space-x-2">
          <Users2 className="w-6 h-6 text-emerald-300" />
          <h1 className="text-xl font-bold tracking-wide">
            Citizen Transparency & Public Accountability Portal
          </h1>
        </div>
        <p className="text-xs text-emerald-100 max-w-2xl leading-relaxed">
          Track the development works recommended by your Member of Parliament in your village, block, and district.
          Public funds belong to the citizens — explore real-time physical completion status and submit civic feedback.
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

      {/* Citizen Feedback Section */}
      <div className="bg-white p-5 rounded-gov border border-gov-border shadow-gov">
        <div className="flex items-center space-x-2 mb-2 pb-2 border-b border-slate-100">
          <MessageSquare className="w-4 h-4 text-emerald-700" />
          <h3 className="text-sm font-bold text-slate-800">
            Citizen Grievance & Public Feedback Submission
          </h3>
        </div>

        {feedbackSubmitted ? (
          <div className="p-3 bg-emerald-50 text-emerald-800 text-xs rounded border border-emerald-200 flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Thank you. Your public observation has been logged for district authority review under reference #CIT-2026-9912.</span>
          </div>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); setFeedbackSubmitted(true); }} className="space-y-3 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Your Name</label>
                <input required type="text" placeholder="Citizen Name" className="w-full px-3 py-1.5 border border-slate-300 rounded" />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Mobile / Email</label>
                <input required type="text" placeholder="+91 / email" className="w-full px-3 py-1.5 border border-slate-300 rounded" />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Select Project Code</label>
                <select className="w-full px-3 py-1.5 border border-slate-300 rounded text-slate-700">
                  {MOCK_PROJECTS.map(p => (
                    <option key={p.id} value={p.id}>{p.code} - {p.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Your Feedback / On-Site Observation</label>
              <textarea required rows={2} placeholder="Report work status, asset utility, drinking water quality, or maintenance condition..." className="w-full px-3 py-1.5 border border-slate-300 rounded"></textarea>
            </div>

            <div className="flex justify-end">
              <button type="submit" className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded flex items-center space-x-1">
                <Send className="w-3 h-3" />
                <span>Submit Citizen Feedback</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
