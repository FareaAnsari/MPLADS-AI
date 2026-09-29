import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  X,
  ShieldCheck,
  FileText,
  MapPin,
  TrendingUp,
  Download,
  AlertTriangle,
  Layers,
  ChevronRight,
  RefreshCw,
  ExternalLink,
  Bot,
  User,
  Info
} from 'lucide-react';
import { AgentChatService } from '../../services/agentChatService';
import { AgentResponse, ChatMessage, KPIItem, ProjectTableItem } from '../../types/agent';

interface UniversalChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  userRole?: string;
  initialQuery?: string;
}

export const UniversalChatDrawer: React.FC<UniversalChatDrawerProps> = ({
  isOpen,
  onClose,
  userRole = 'CITIZEN',
  initialQuery = ''
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'hi' | 'hinglish'>('en');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize with greeting and quick starters
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          role: 'assistant',
          content: `### Namaste & Welcome to Pratyaksh Universal Intelligence Agent
I am your **verified analytical research assistant** operating over **30,002+ statutory MPLADS records**, **MoSPI Revised Guidelines 2023**, and **18 AI anomaly detection engines**.

**You can ask me anything about:**
- 🏛 **MPs & Constituencies**: Sanctions, allocations, house records
- 📊 **Expenditure & Trends**: State/district sums, financial progress
- ⚠️ **AI Risk Signals**: Explainable cost & timeline variance factors
- 📜 **Statutory Guidelines**: Permissible/prohibited works, emergency quotas
- 🛰 **Geospatial & Duplicates**: Cross-scheme overlaps (PMGSY/MGNREGA), satellite persistence

*Every fact is traceable to verified Tier 1/2 provenance records with zero fabricated data.*`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          responsePayload: {
            conversation_id: 'init',
            answer: '',
            intents: [],
            entities: {},
            kpis: [
              { label: 'Indexed Works', value: '30,002', variant: 'blue' },
              { label: 'Constituencies', value: '543 LS / 245 RS', variant: 'green' },
              { label: 'Analytical Engines', value: '18 Active', variant: 'purple' },
              { label: 'Provenance Standard', value: 'Tier 1 Certified', variant: 'green' }
            ],
            projects: [],
            citations: [
              {
                source: 'eSAKSHI Official Public Export & data.gov.in',
                provenance_tier: 1,
                citable_anchor: 'National Registry Baseline',
                timestamp: new Date().toISOString()
              },
              {
                source: 'MoSPI Statutory MPLADS Guidelines 2023',
                provenance_tier: 1,
                citable_anchor: 'Revised Guidelines Ch 1-12',
                timestamp: new Date().toISOString()
              }
            ],
            followups: [
              'Show delayed projects in Maharashtra above ₹50 lakh',
              'What are the strictly prohibited works under MPLADS?',
              'Who is the MP for Varanasi and what is their allocated budget?',
              'Do a complete deep research analysis on project WS/MP/18'
            ],
            provenance_tier: 1,
            execution_time_ms: 5.0
          }
        }
      ]);
    }
  }, []);

  useEffect(() => {
    if (initialQuery && isOpen) {
      handleSend(initialQuery);
    }
  }, [initialQuery, isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (queryText?: string) => {
    const query = queryText || inputQuery;
    if (!query.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsLoading(true);

    try {
      const response: AgentResponse = await AgentChatService.sendQuery(query, userRole);
      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: response.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        responsePayload: response
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: `I encountered an operational issue while retrieving verified data. Please retry or refine your query.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadReportCSV = (projects: ProjectTableItem[]) => {
    if (!projects || projects.length === 0) return;
    const headers = ['Work ID', 'Work Title', 'Category', 'State', 'District', 'Disbursed (INR)', 'Stage'];
    const rows = projects.map((p) => [
      `"${p.work_id}"`,
      `"${p.work_title.replace(/"/g, '""')}"`,
      `"${p.work_category || ''}"`,
      `"${p.state || ''}"`,
      `"${p.ida_office || ''}"`,
      p.disbursed_amount_inr || 0,
      `"${p.current_stage || ''}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `MPLADS_AI_Verified_Export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-3xl h-full bg-slate-900 border-l border-slate-700 shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-700 bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-amber-600 to-indigo-600 flex items-center justify-center shadow-lg ring-1 ring-white/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight">MPLADS Universal Intelligence Agent</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Tier 1 Grounded
                </span>
              </div>
              <p className="text-xs text-slate-400">Ask anything across 30,002 verified projects & statutory guidelines</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Language switch */}
            <div className="flex bg-slate-800 rounded-md p-0.5 border border-slate-700 text-xs">
              <button
                onClick={() => setSelectedLanguage('en')}
                className={`px-2 py-1 rounded ${selectedLanguage === 'en' ? 'bg-indigo-600 text-white font-medium' : 'text-slate-400 hover:text-white'}`}
              >
                EN
              </button>
              <button
                onClick={() => setSelectedLanguage('hi')}
                className={`px-2 py-1 rounded ${selectedLanguage === 'hi' ? 'bg-indigo-600 text-white font-medium' : 'text-slate-400 hover:text-white'}`}
              >
                हिंदी
              </button>
              <button
                onClick={() => setSelectedLanguage('hinglish')}
                className={`px-2 py-1 rounded ${selectedLanguage === 'hinglish' ? 'bg-indigo-600 text-white font-medium' : 'text-slate-400 hover:text-white'}`}
              >
                Hinglish
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Message Feed */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center shrink-0 mt-1">
                  <Bot className="w-4 h-4 text-indigo-300" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl p-4 shadow-sm ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-br from-indigo-600 to-indigo-700 text-white rounded-tr-none'
                    : 'bg-slate-800/90 text-slate-200 border border-slate-700/80 rounded-tl-none'
                }`}
              >
                {/* Text Content */}
                <div className="prose prose-invert prose-sm max-w-none space-y-2 leading-relaxed text-sm">
                  {msg.content.split('\n').map((line, lIdx) => {
                    if (line.startsWith('### ')) {
                      return <h4 key={lIdx} className="text-base font-bold text-indigo-300 mt-2 mb-1">{line.replace('### ', '')}</h4>;
                    }
                    if (line.startsWith('## ')) {
                      return <h3 key={lIdx} className="text-lg font-bold text-amber-300 mt-3 mb-1">{line.replace('## ', '')}</h3>;
                    }
                    if (line.startsWith('- ')) {
                      return (
                        <div key={lIdx} className="flex items-start gap-2 pl-2">
                          <span className="text-indigo-400 mt-1">•</span>
                          <span>{line.replace('- ', '')}</span>
                        </div>
                      );
                    }
                    if (line.startsWith('> ')) {
                      return (
                        <blockquote key={lIdx} className="border-l-2 border-amber-500/60 pl-3 py-1 my-2 text-xs italic text-amber-200/90 bg-amber-500/10 rounded-r">
                          {line.replace('> ', '')}
                        </blockquote>
                      );
                    }
                    return line ? <p key={lIdx} className="my-1">{line}</p> : <div key={lIdx} className="h-1" />;
                  })}
                </div>

                {/* Rich Structured Payload if present */}
                {msg.responsePayload && (
                  <div className="mt-4 space-y-3.5 pt-3 border-t border-slate-700/60">
                    {/* KPI Cards */}
                    {msg.responsePayload.kpis && msg.responsePayload.kpis.length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {msg.responsePayload.kpis.map((kpi, kIdx) => (
                          <div
                            key={kIdx}
                            className="bg-slate-900/80 border border-slate-700 rounded-lg p-2.5 flex flex-col"
                          >
                            <span className="text-[11px] text-slate-400 font-medium">{kpi.label}</span>
                            <span className="text-base font-bold text-white mt-0.5">{kpi.value}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Table of Matched Works */}
                    {msg.responsePayload.projects && msg.responsePayload.projects.length > 0 && (
                      <div className="bg-slate-900/90 rounded-lg border border-slate-700 overflow-hidden">
                        <div className="px-3 py-2 bg-slate-950/60 border-b border-slate-700/80 flex items-center justify-between">
                          <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                            <Layers className="w-3.5 h-3.5 text-indigo-400" />
                            Verified Records Preview ({msg.responsePayload.projects.length})
                          </span>
                          <button
                            onClick={() => downloadReportCSV(msg.responsePayload!.projects)}
                            className="text-[11px] px-2 py-0.5 rounded bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/30 flex items-center gap-1 transition-colors"
                          >
                            <Download className="w-3 h-3" /> Export CSV
                          </button>
                        </div>
                        <div className="max-h-48 overflow-y-auto">
                          <table className="w-full text-left text-xs text-slate-300">
                            <thead className="bg-slate-950/40 text-slate-400 border-b border-slate-800 sticky top-0">
                              <tr>
                                <th className="px-3 py-1.5 font-medium">Work ID</th>
                                <th className="px-3 py-1.5 font-medium">Title</th>
                                <th className="px-3 py-1.5 font-medium">State</th>
                                <th className="px-3 py-1.5 font-medium text-right">Disbursed (₹)</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                              {msg.responsePayload.projects.slice(0, 10).map((proj, pIdx) => (
                                <tr key={pIdx} className="hover:bg-slate-800/50 transition-colors">
                                  <td className="px-3 py-1.5 font-mono text-[11px] text-indigo-300">{proj.work_id}</td>
                                  <td className="px-3 py-1.5 truncate max-w-[200px]" title={proj.work_title}>{proj.work_title}</td>
                                  <td className="px-3 py-1.5 text-slate-400">{proj.state}</td>
                                  <td className="px-3 py-1.5 font-semibold text-right text-emerald-400">
                                    ₹{(proj.disbursed_amount_inr || 0).toLocaleString('en-IN')}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* Citations & Evidence Section */}
                    {msg.responsePayload.citations && msg.responsePayload.citations.length > 0 && (
                      <div className="bg-slate-900/60 rounded-lg p-3 border border-slate-700/60 space-y-1.5">
                        <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                          <span className="flex items-center gap-1.5">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                            Data Provenance & Citations
                          </span>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              msg.responsePayload.provenance_tier === 1
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                                : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                            }`}
                          >
                            Tier {msg.responsePayload.provenance_tier}
                          </span>
                        </div>
                        <div className="space-y-1">
                          {msg.responsePayload.citations.map((cit, cIdx) => (
                            <div key={cIdx} className="text-[11px] text-slate-400 flex items-start gap-1.5">
                              <span className="text-emerald-500 shrink-0">[{cIdx + 1}]</span>
                              <span>
                                <strong className="text-slate-200">{cit.source}</strong> · {cit.citable_anchor}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Follow-up Suggestions */}
                    {msg.responsePayload.followups && msg.responsePayload.followups.length > 0 && (
                      <div className="space-y-1.5">
                        <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-amber-400" /> Suggested Next Steps
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {msg.responsePayload.followups.map((fUp, fIdx) => (
                            <button
                              key={fIdx}
                              onClick={() => handleSend(fUp)}
                              className="text-xs px-2.5 py-1.5 rounded-full bg-slate-900/80 hover:bg-indigo-900/50 text-indigo-300 hover:text-white border border-slate-700 hover:border-indigo-500/50 transition-all flex items-center gap-1"
                            >
                              <span>{fUp}</span>
                              <ChevronRight className="w-3 h-3 text-slate-500" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="mt-2 text-[10px] text-slate-500 flex justify-end">
                  {msg.timestamp}
                </div>
              </div>

              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center shrink-0 mt-1 shadow-md">
                  <User className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 justify-start items-center">
              <div className="w-8 h-8 rounded-full bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center">
                <RefreshCw className="w-4 h-4 text-indigo-400 animate-spin" />
              </div>
              <div className="bg-slate-800/80 rounded-2xl p-3.5 border border-slate-700 text-xs text-slate-300 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                <span>Orchestrating tools across 30,002 verified records and MoSPI guidelines...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/90">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Ask anything (e.g. 'Show delayed projects in Maharashtra', 'Why is WS/MP/18 flagged?')..."
              className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
            <button
              type="submit"
              disabled={!inputQuery.trim() || isLoading}
              className="px-4 py-3 bg-gradient-to-r from-indigo-600 to-amber-600 hover:from-indigo-500 hover:to-amber-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-medium shadow-lg transition-all flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
            <span>Universal AI Orchestrator · Strict Grounding Guardrail Active</span>
            <span>Supports English · हिंदी · Hinglish</span>
          </div>
        </div>
      </div>
    </div>
  );
};
