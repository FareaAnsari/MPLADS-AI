import React, { useState } from 'react';
import { ShieldCheck, Search, Database, FileCheck, ArrowRight } from 'lucide-react';
import { UniversalChatDrawer } from '../components/chat/UniversalChatDrawer';

export const UniversalChatPage: React.FC = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const quickStarters = [
    {
      title: 'Financial & Utilization Analysis',
      query: 'How much money has been sanctioned and spent in Maharashtra in FY 2024-25?',
      desc: 'Aggregate expenditure, utilization percentages, and category distributions',
      icon: Database,
      badge: 'Verified Data'
    },
    {
      title: 'Anomaly & Risk Breakdown',
      query: 'Why is project WS/MP/18 flagged as a monitoring signal?',
      desc: 'Additive 5-factor risk score, Z-score cost variance, and milestone delays',
      icon: ShieldCheck,
      badge: 'Analytical Engine'
    },
    {
      title: 'MoSPI Statutory Guidelines 2023',
      query: 'What are the strictly prohibited works under MPLADS guidelines?',
      desc: 'Statutory rules on religious structures, maintenance, and emergency disaster limits',
      icon: FileCheck,
      badge: 'Policy Records'
    },
    {
      title: 'Deep Research Investigation',
      query: 'Do a complete deep research investigation on project WS/MP/18',
      desc: '19-section dossier with cross-scheme checks, peer benchmarks, and field audit questions',
      icon: Search,
      badge: 'Dossier'
    }
  ];

  const handleLaunch = (q: string) => {
    setSearchQuery(q);
    setIsDrawerOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 pt-6 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Institutional Hero Section */}
        <div className="relative rounded-2xl overflow-hidden bg-white border border-slate-200 p-8 sm:p-12 shadow-sm">
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold">
              <span className="text-xs font-bold leading-none">✦</span>
              <span>Ask MPLAD</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight leading-tight">
              MPLADS Intelligence & Research Workspace
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed">
              Search and analyze <strong>30,002+ verified project records</strong>, <strong>18 statutory analytical engines</strong>, and official <strong>MoSPI Revised Guidelines 2023</strong> with 100% citable provenance.
            </p>

            {/* Main Interactive Search Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (searchQuery.trim()) setIsDrawerOpen(true);
              }}
              className="pt-4 flex flex-col sm:flex-row gap-2 max-w-2xl"
            >
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search projects, MPs, expenditure, guidelines..."
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#002B5B] shadow-2xs"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-3 bg-[#002B5B] hover:bg-[#001f42] text-white rounded-xl font-medium shadow-xs transition-all flex items-center justify-center gap-2 shrink-0"
              >
                <span>Ask MPLAD</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Feature Capabilities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quickStarters.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                onClick={() => handleLaunch(item.query)}
                className="group p-5 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl cursor-pointer transition-all duration-200 flex flex-col justify-between space-y-4 shadow-2xs"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                      {item.badge}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#002B5B] transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {item.desc}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 font-medium">
                  <span className="truncate pr-2 font-mono text-[11px] text-slate-500">"{item.query}"</span>
                  <ArrowRight className="w-3.5 h-3.5 shrink-0 text-slate-400 group-hover:text-slate-700 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Embedded Universal Agent Drawer */}
      <UniversalChatDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        initialQuery={searchQuery}
      />
    </div>
  );
};

