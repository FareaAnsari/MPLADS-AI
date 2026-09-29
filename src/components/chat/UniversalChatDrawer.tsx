import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  X,
  ShieldCheck,
  Download,
  ChevronRight,
  RefreshCw,
  Search,
  Database,
  FileCheck,
  Layers,
  ArrowUpRight
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
  const inputRef = useRef<HTMLInputElement>(null);

  const quickStarters = [
    {
      query: 'Show delayed projects in Maharashtra',
      category: 'Expenditure & Progress'
    },
    {
      query: 'Why is this project flagged?',
      category: 'Analytical Verification'
    },
    {
      query: 'Compare expenditure across districts',
      category: 'Constituency Benchmarking'
    },
    {
      query: 'What do the MPLADS guidelines say?',
      category: 'MoSPI 2023 Policy'
    }
  ];

  // Auto focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  // Handle escape key to close drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

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
        content: `Unable to retrieve verified records at this moment. Please retry or adjust your search criteria.`,
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
    link.setAttribute('download', `MPLADS_Verified_Data_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex justify-end bg-slate-900/60 backdrop-blur-xs animate-fadeIn transition-opacity">
      <div 
        role="dialog"
        aria-modal="true"
        aria-labelledby="agent-title"
        className="w-full max-w-2xl sm:max-w-3xl h-full bg-white border-l border-slate-200 shadow-2xl flex flex-col transform transition-transform duration-200 ease-out"
      >
        {/* Institutional Government / Enterprise Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/95 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#002B5B] flex items-center justify-center text-white shadow-xs">
              <span className="text-sm font-bold leading-none">✦</span>
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 id="agent-title" className="text-base font-bold text-slate-900 tracking-tight">Ask MPLAD</h2>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                  <ShieldCheck className="w-3 h-3 text-slate-600" /> Grounded in verified records
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">Search and analyze MPLADS projects, expenditure, guidelines, records, and analytical signals.</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Standard Language Selector */}
            <div className="flex bg-slate-100 rounded-lg p-0.5 text-xs font-medium border border-slate-200">
              <button
                onClick={() => setSelectedLanguage('en')}
                className={`px-2.5 py-1 rounded-md transition-colors ${selectedLanguage === 'en' ? 'bg-white text-slate-900 shadow-xs border border-slate-200/60' : 'text-slate-600 hover:text-slate-900'}`}
              >
                English
              </button>
              <button
                onClick={() => setSelectedLanguage('hi')}
                className={`px-2.5 py-1 rounded-md transition-colors ${selectedLanguage === 'hi' ? 'bg-white text-slate-900 shadow-xs border border-slate-200/60' : 'text-slate-600 hover:text-slate-900'}`}
              >
                हिंदी
              </button>
              <button
                onClick={() => setSelectedLanguage('hinglish')}
                className={`px-2.5 py-1 rounded-md transition-colors ${selectedLanguage === 'hinglish' ? 'bg-white text-slate-900 shadow-xs border border-slate-200/60' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Hinglish
              </button>
            </div>

            <button
              onClick={onClose}
              aria-label="Close panel"
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Message Feed / Workspace */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#f8fafc]">
          {messages.length === 0 ? (
            /* Calm, Institutional Research Empty State */
            <div className="py-8 px-2 max-w-xl mx-auto space-y-6 text-center animate-fadeIn">
              <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto text-slate-700 shadow-xs">
                <Search className="w-5 h-5 text-slate-600" />
              </div>

              <div className="space-y-1.5">
                <h3 className="text-lg font-bold text-slate-900">Ask MPLAD</h3>
                <p className="text-xs text-slate-500 leading-relaxed max-w-md mx-auto">
                  Search and analyze MPLADS projects, expenditure, guidelines, records and analytical signals.
                </p>
              </div>

              <div className="space-y-2 pt-2 text-left">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-1">Try asking:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {quickStarters.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSend(item.query)}
                      className="p-3 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl transition-all shadow-xs flex flex-col justify-between group text-left cursor-pointer"
                    >
                      <div className="space-y-1">
                        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{item.category}</span>
                        <p className="text-xs font-medium text-slate-800 group-hover:text-[#002B5B] transition-colors leading-snug">
                          {item.query}
                        </p>
                      </div>
                      <div className="pt-2 flex items-center justify-end text-[11px] text-slate-400 group-hover:text-slate-600 font-medium">
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Message Thread */
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[90%] rounded-xl p-4.5 ${
                    msg.role === 'user'
                      ? 'bg-[#002B5B] text-white shadow-sm'
                      : 'bg-white text-slate-800 border border-slate-200 shadow-sm'
                  }`}
                >
                  {/* Text Content */}
                  <div className="prose prose-slate prose-sm max-w-none space-y-2 text-sm leading-relaxed">
                    {msg.content.split('\n').map((line, lIdx) => {
                      if (line.startsWith('### ')) {
                        return <h4 key={lIdx} className="text-sm font-bold text-slate-900 mt-2 mb-1">{line.replace('### ', '')}</h4>;
                      }
                      if (line.startsWith('## ')) {
                        return <h3 key={lIdx} className="text-base font-bold text-slate-900 mt-2.5 mb-1">{line.replace('## ', '')}</h3>;
                      }
                      if (line.startsWith('- ')) {
                        return (
                          <div key={lIdx} className="flex items-start gap-2 pl-2">
                            <span className="text-slate-400 font-bold">•</span>
                            <span className="text-slate-700">{line.replace('- ', '')}</span>
                          </div>
                        );
                      }
                      if (line.startsWith('> ')) {
                        return (
                          <blockquote key={lIdx} className="border-l-3 border-amber-500/80 pl-3 py-1.5 my-2 text-xs text-slate-600 bg-amber-50/60 rounded-r">
                            {line.replace('> ', '')}
                          </blockquote>
                        );
                      }
                      return line ? <p key={lIdx} className="my-1 text-slate-700">{line}</p> : <div key={lIdx} className="h-0.5" />;
                    })}
                  </div>

                  {/* Analytical Components */}
                  {msg.responsePayload && (
                    <div className="mt-4 space-y-3.5 pt-3.5 border-t border-slate-100">
                      {/* KPI Stat Cards */}
                      {msg.responsePayload.kpis && msg.responsePayload.kpis.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                          {msg.responsePayload.kpis.map((kpi, kIdx) => (
                            <div
                              key={kIdx}
                              className="bg-slate-50 border border-slate-200/80 rounded-lg p-2.5 flex flex-col"
                            >
                              <span className="text-[11px] text-slate-500 font-medium">{kpi.label}</span>
                              <span className="text-sm font-bold text-slate-900 mt-0.5 tracking-tight">{kpi.value}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Structured Data Table */}
                      {msg.responsePayload.projects && msg.responsePayload.projects.length > 0 && (
                        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-xs">
                          <div className="px-3.5 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                              <Layers className="w-3.5 h-3.5 text-slate-500" />
                              Matching Records ({msg.responsePayload.projects.length})
                            </span>
                            <button
                              onClick={() => downloadReportCSV(msg.responsePayload!.projects)}
                              className="text-[11px] px-2.5 py-1 rounded bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-medium flex items-center gap-1 transition-colors shadow-2xs"
                            >
                              <Download className="w-3 h-3 text-slate-500" /> Export CSV
                            </button>
                          </div>
                          <div className="max-h-48 overflow-y-auto">
                            <table className="w-full text-left text-xs text-slate-600">
                              <thead className="bg-slate-50/80 text-slate-500 border-b border-slate-200 sticky top-0 font-medium">
                                <tr>
                                  <th className="px-3 py-1.5 font-medium">Work ID</th>
                                  <th className="px-3 py-1.5 font-medium">Title</th>
                                  <th className="px-3 py-1.5 font-medium">State</th>
                                  <th className="px-3 py-1.5 font-medium text-right">Disbursed</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 font-normal">
                                {msg.responsePayload.projects.slice(0, 10).map((proj, pIdx) => (
                                  <tr key={pIdx} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-3 py-1.5 font-mono text-[11px] text-slate-800 font-semibold">{proj.work_id}</td>
                                    <td className="px-3 py-1.5 truncate max-w-[200px]" title={proj.work_title}>{proj.work_title}</td>
                                    <td className="px-3 py-1.5 text-slate-500">{proj.state}</td>
                                    <td className="px-3 py-1.5 font-medium text-right text-slate-900">
                                      ₹{(proj.disbursed_amount_inr || 0).toLocaleString('en-IN')}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      {/* Sources & Provenance */}
                      {msg.responsePayload.citations && msg.responsePayload.citations.length > 0 && (
                        <div className="bg-slate-50 rounded-lg p-3 border border-slate-200/80 space-y-1.5">
                          <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                            <span className="flex items-center gap-1.5">
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                              Data Sources & Provenance
                            </span>
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-white text-slate-600 border border-slate-200">
                              Tier {msg.responsePayload.provenance_tier}
                            </span>
                          </div>
                          <div className="space-y-1 text-[11px] text-slate-500">
                            {msg.responsePayload.citations.map((cit, cIdx) => (
                              <div key={cIdx} className="flex items-start gap-1.5">
                                <span className="text-slate-400 font-mono">[{cIdx + 1}]</span>
                                <span>
                                  <strong className="text-slate-700">{cit.source}</strong> · {cit.citable_anchor}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Follow-up Suggestions */}
                      {msg.responsePayload.followups && msg.responsePayload.followups.length > 0 && (
                        <div className="space-y-1.5 pt-1">
                          <span className="text-[11px] font-semibold text-slate-500">Suggested Next Queries:</span>
                          <div className="flex flex-wrap gap-1.5">
                            {msg.responsePayload.followups.map((fUp, fIdx) => (
                              <button
                                key={fIdx}
                                onClick={() => handleSend(fUp)}
                                className="text-xs px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border border-slate-200 hover:border-slate-300 transition-all flex items-center gap-1 shadow-2xs cursor-pointer"
                              >
                                <span>{fUp}</span>
                                <ChevronRight className="w-3 h-3 text-slate-400" />
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className={`mt-2 text-[10px] ${msg.role === 'user' ? 'text-indigo-200' : 'text-slate-400'} flex justify-end`}>
                    {msg.timestamp}
                  </div>
                </div>
              </div>
            ))
          )}

          {isLoading && (
            <div className="flex gap-2.5 items-center justify-start text-xs text-slate-500 bg-white p-3 rounded-xl border border-slate-200 max-w-sm">
              <RefreshCw className="w-3.5 h-3.5 text-slate-600 animate-spin" />
              <span>Retrieving verified records & evaluating signals...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Search & Query Input Bar */}
        <div className="p-4 border-t border-slate-200 bg-white shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Search projects, MPs, expenditure, guidelines..."
              className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#002B5B] focus:border-transparent transition-all"
            />
            <button
              type="submit"
              disabled={!inputQuery.trim() || isLoading}
              aria-label="Send query"
              className="px-4 py-2.5 bg-[#002B5B] hover:bg-[#0f284e] disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl font-medium shadow-sm transition-all flex items-center gap-1.5 shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
            <span>Press Enter to send · Grounded in official eSAKSHI dataset</span>
            <span>Supports EN · हिंदी · Hinglish</span>
          </div>
        </div>
      </div>
    </div>
  );
};
