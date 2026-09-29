import React, { useState } from 'react';
import { Sparkles, ShieldCheck, Search, Database, FileCheck, Layers, ArrowRight } from 'lucide-react';
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
      badge: 'Tier 1'
    },
    {
      title: 'AI Anomaly & Risk Breakdown',
      query: 'Why is project WS/MP/18 flagged as a monitoring signal?',
      desc: 'Additive 5-factor risk score, Z-score cost variance, and milestone delays',
      icon: ShieldCheck,
      badge: 'ML Engine'
    },
    {
      title: 'MoSPI Statutory Guidelines 2023',
      query: 'What are the strictly prohibited works under MPLADS guidelines?',
      desc: 'Statutory rules on religious structures, maintenance, and emergency disaster limits',
      icon: FileCheck,
      badge: 'Policy RAG'
    },
    {
      title: 'Deep Research Investigation',
      query: 'Do a complete deep research investigation on project WS/MP/18',
      desc: '19-section dossier with cross-scheme checks, peer benchmarks, and field questions',
      icon: Sparkles,
      badge: 'Dossier'
    }
  ];

  const handleLaunch = (q: string) => {
    setSearchQuery(q);
    setIsDrawerOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white pt-6 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Hero Section */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-indigo-900/40 via-slate-900 to-slate-950 border border-slate-800 p-8 sm:p-12 shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Universal MPLADS Intelligence Agent</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Ask Anything About <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-400 via-indigo-300 to-emerald-400">MPLADS Works</span>
            </h1>
            <p className="text-base text-slate-300 leading-relaxed">
              Real-time conversational intelligence powered by <strong>30,002+ verified project records</strong>, <strong>18 statutory analytical engines</strong>, and official <strong>MoSPI Revised Guidelines 2023</strong> with 100% citable provenance.
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
                <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="e.g. 'Show delayed projects in Maharashtra above ₹50 lakh'..."
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-900/90 border border-slate-700 rounded-2xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-inner"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-3.5 bg-gradient-to-r from-indigo-600 to-amber-600 hover:from-indigo-500 hover:to-amber-500 text-white rounded-2xl font-semibold shadow-lg transition-all flex items-center justify-center gap-2 shrink-0"
              >
                <span>Launch Agent</span>
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
                className="group p-5 bg-slate-900/60 hover:bg-slate-900/90 border border-slate-800 hover:border-indigo-500/50 rounded-2xl cursor-pointer transition-all duration-200 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:scale-105 transition-transform">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                      {item.badge}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {item.desc}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-indigo-400 font-medium">
                  <span className="truncate pr-2 font-mono text-[11px] text-slate-300">"{item.query}"</span>
                  <ArrowRight className="w-4 h-4 shrink-0 group-hover:translate-x-1 transition-transform" />
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
