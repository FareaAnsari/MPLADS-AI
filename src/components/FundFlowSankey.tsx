import React, { useState } from 'react';
import { 
  IndianRupee, 
  ArrowRight, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Building, 
  Landmark, 
  ShieldCheck, 
  FileText, 
  ExternalLink,
  ChevronRight,
  Info,
  Layers,
  X
} from 'lucide-react';

export interface FundFlowHop {
  source: string;
  target: string;
  amount_inr: number;
  statutory_sla_days: number;
  days_elapsed: number;
  status: 'NORMAL' | 'DELAYED' | 'FLAGGED';
  transferred_at: string;
  pfms_ref?: string;
  sanction_order?: string;
}

export interface FundFlowNode {
  id: string;
  name: string;
  category: 'MINISTRY' | 'STATE' | 'DISTRICT' | 'AGENCY' | 'CONTRACTOR';
  level: number;
  account_code: string;
  nodal_officer: string;
  allocated_inr: number;
  disbursed_inr: number;
  pending_inr: number;
}

export interface FundFlowData {
  work_id: string;
  work_title: string;
  state: string;
  district: string;
  sanctioned_amount_inr: number;
  disbursed_amount_inr: number;
  unutilized_sna_balance_inr: number;
  utilization_percentage: number;
  nodes: FundFlowNode[];
  hops: FundFlowHop[];
}

interface FundFlowSankeyProps {
  data?: FundFlowData;
  onNodeClick?: (nodeId: string) => void;
}

const DEFAULT_FLOW_DATA: FundFlowData = {
  work_id: 'MPLADS-2024-BR01-001',
  work_title: 'Construction of High School Science Block & Lab, Araria',
  state: 'Bihar',
  district: 'Araria',
  sanctioned_amount_inr: 5000000,
  disbursed_amount_inr: 3800000,
  unutilized_sna_balance_inr: 1200000,
  utilization_percentage: 76.0,
  nodes: [
    { 
      id: 'mospi', 
      name: 'MoSPI Central Parliamentary Treasury', 
      category: 'MINISTRY', 
      level: 0,
      account_code: 'PFMS-HEAD-4552-01',
      nodal_officer: 'Joint Secretary (MPLADS Div), New Delhi',
      allocated_inr: 5000000,
      disbursed_inr: 5000000,
      pending_inr: 0
    },
    { 
      id: 'state', 
      name: 'State Nodal Treasury (Bihar)', 
      category: 'STATE', 
      level: 1,
      account_code: 'SNA-BR-PAT-009',
      nodal_officer: 'Principal Secretary (Planning & Dev), Patna',
      allocated_inr: 5000000,
      disbursed_inr: 5000000,
      pending_inr: 0
    },
    { 
      id: 'district', 
      name: 'District SNA Account (Araria DM/DC)', 
      category: 'DISTRICT', 
      level: 2,
      account_code: 'SNA-4491-ARARIA-DM',
      nodal_officer: 'District Magistrate & Planning Officer, Araria',
      allocated_inr: 5000000,
      disbursed_inr: 4750000,
      pending_inr: 250000
    },
    { 
      id: 'agency', 
      name: 'Implementing Agency (Rural Works Dept)', 
      category: 'AGENCY', 
      level: 3,
      account_code: 'EE-RWD-DIV-ARARIA',
      nodal_officer: 'Executive Engineer (RWD Work Div 2), Forbesganj',
      allocated_inr: 4750000,
      disbursed_inr: 3800000,
      pending_inr: 950000
    },
    { 
      id: 'contractor', 
      name: 'Executing Contractor (Patna Infra Corp)', 
      category: 'CONTRACTOR', 
      level: 4,
      account_code: 'GSTIN: 10AAACB1234F1Z5 / SBI Acct #3398210',
      nodal_officer: 'Project In-charge (Authorized Signatory)',
      allocated_inr: 3800000,
      disbursed_inr: 3800000,
      pending_inr: 950000
    },
  ],
  hops: [
    {
      source: 'MoSPI Central Parliamentary Treasury',
      target: 'State Nodal Treasury (Bihar)',
      amount_inr: 5000000,
      statutory_sla_days: 15,
      days_elapsed: 11,
      status: 'NORMAL',
      transferred_at: '12 Apr 2024',
      pfms_ref: 'PFMS-TR-2024-884102',
      sanction_order: 'MOSPI/MPLADS/2024/BR/LS-01'
    },
    {
      source: 'State Nodal Treasury (Bihar)',
      target: 'District SNA Account (Araria DM/DC)',
      amount_inr: 5000000,
      statutory_sla_days: 30,
      days_elapsed: 22,
      status: 'NORMAL',
      transferred_at: '04 May 2024',
      pfms_ref: 'SNA-BR-2024-11920',
      sanction_order: 'GOP-PLN-2024/AR/04'
    },
    {
      source: 'District SNA Account (Araria DM/DC)',
      target: 'Implementing Agency (Rural Works Dept)',
      amount_inr: 4750000,
      statutory_sla_days: 45,
      days_elapsed: 52,
      status: 'DELAYED',
      transferred_at: '25 Jun 2024',
      pfms_ref: 'PFMS-DIST-2024-7718',
      sanction_order: 'DM/ARA/MPLADS/TS-91'
    },
    {
      source: 'Implementing Agency (Rural Works Dept)',
      target: 'Executing Contractor (Patna Infra Corp)',
      amount_inr: 3800000,
      statutory_sla_days: 30,
      days_elapsed: 20,
      status: 'NORMAL',
      transferred_at: '18 Sep 2024',
      pfms_ref: 'RWD-MB-BILL-2024/02',
      sanction_order: 'EE/RWD/CONT-AGR-401'
    },
  ],
};

const formatINR = (amt: number) => {
  if (amt >= 10000000) return `₹ ${(amt / 10000000).toFixed(2)} Cr`;
  if (amt >= 100000) return `₹ ${(amt / 100000).toFixed(2)} Lakh`;
  return `₹ ${amt.toLocaleString('en-IN')}`;
};

export const FundFlowSankey: React.FC<FundFlowSankeyProps> = ({
  data = DEFAULT_FLOW_DATA,
  onNodeClick,
}) => {
  const [selectedHop, setSelectedHop] = useState<number | null>(null);
  const [selectedNode, setSelectedNode] = useState<FundFlowNode | null>(null);

  const getStatusColor = (status: 'NORMAL' | 'DELAYED' | 'FLAGGED') => {
    switch (status) {
      case 'NORMAL':
        return {
          stroke: '#002B49',
          fill: 'rgba(0, 43, 73, 0.15)',
          badge: 'bg-emerald-50 text-emerald-800 border-emerald-300',
        };
      case 'DELAYED':
        return {
          stroke: '#D97706',
          fill: 'rgba(217, 119, 6, 0.20)',
          badge: 'bg-amber-50 text-amber-900 border-amber-300',
        };
      case 'FLAGGED':
        return {
          stroke: '#E11D48',
          fill: 'rgba(225, 29, 72, 0.22)',
          badge: 'bg-rose-50 text-rose-900 border-rose-300',
        };
    }
  };

  const activeHopData = selectedHop !== null ? data.hops[selectedHop] : null;

  return (
    <div className="bg-white rounded-gov border border-gov-border shadow-gov p-5 space-y-5">
      {/* Header Summary */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-gov-border">
        <div>
          <div className="flex items-center space-x-2">
            <Landmark className="w-5 h-5 text-gov-navy" />
            <h3 className="text-base font-bold text-gov-navy">
              Statutory Fund Flow Sankey & Drawdown Pipeline
            </h3>
            <span className="px-2.5 py-0.5 text-[10px] font-bold bg-gov-navy text-white rounded-full">
              PFMS Verified
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Hop-by-hop rupee liquidity transfer tracing from MoSPI Central Treasury to Contractor. Click any stage or link to inspect audit records.
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="text-right">
            <span className="text-slate-500 text-[11px] block font-semibold">Total Sanctioned</span>
            <span className="font-bold text-gov-navy text-sm">{formatINR(data.sanctioned_amount_inr)}</span>
          </div>
          <div className="text-right">
            <span className="text-emerald-700 text-[11px] block font-semibold">Disbursed via SNA</span>
            <span className="font-bold text-emerald-700 text-sm">{formatINR(data.disbursed_amount_inr)}</span>
          </div>
          <div className="text-right">
            <span className="text-amber-800 text-[11px] block font-semibold">Unutilized SNA Balance</span>
            <span className="font-bold text-amber-700 text-sm">{formatINR(data.unutilized_sna_balance_inr)}</span>
          </div>
        </div>
      </div>

      {/* Interactive Node Cards */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Click Stage for Statutory Account & Nodal Officer Details:
          </span>
          <span className="text-[11px] text-slate-400 font-medium">5-Tier Treasury Architecture</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
          {data.nodes.map((node, i) => {
            const isSelected = selectedNode?.id === node.id;

            return (
              <button
                key={node.id}
                onClick={() => {
                  setSelectedNode(isSelected ? null : node);
                  setSelectedHop(null);
                  onNodeClick?.(node.id);
                }}
                className={`text-left p-3 rounded-gov border transition-all relative ${
                  isSelected
                    ? 'border-gov-navy bg-gov-navy text-white shadow-md ring-2 ring-gov-navy/20'
                    : 'border-gov-border bg-slate-50/80 hover:bg-slate-100 text-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${
                    isSelected ? 'text-blue-200' : 'text-slate-500'
                  }`}>
                    Stage {i + 1}
                  </span>
                  <span className="text-xs">
                    {node.category === 'MINISTRY' && '🏛'}
                    {node.category === 'STATE' && '🏢'}
                    {node.category === 'DISTRICT' && '📍'}
                    {node.category === 'AGENCY' && '🏗'}
                    {node.category === 'CONTRACTOR' && '👷'}
                  </span>
                </div>
                <div className="text-xs font-bold leading-tight line-clamp-2">
                  {node.name.split('(')[0]}
                </div>
                <div className={`text-[10px] mt-1 truncate ${
                  isSelected ? 'text-slate-300' : 'text-slate-500 font-mono'
                }`}>
                  {node.account_code.slice(0, 20)}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Sankey Flow Visualizer (Responsive SVG) */}
      <div className="relative overflow-x-auto py-2 bg-slate-50/60 rounded-gov border border-slate-200 p-3">
        <div className="min-w-[760px]">
          <div className="flex items-center justify-between text-xs text-slate-600 font-semibold mb-1 px-2">
            <span>Central Treasury</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            <span>State Nodal</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            <span>District SNA</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            <span>Implementing Agency</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            <span>Contractor</span>
          </div>

          <div className="relative h-24 my-2">
            <svg className="w-full h-full" viewBox="0 0 800 90" preserveAspectRatio="none">
              <defs>
                <linearGradient id="flowGradientNormal" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#002B49" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#007A3D" stopOpacity="0.8" />
                </linearGradient>
                <linearGradient id="flowGradientDelayed" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#002B49" stopOpacity="0.75" />
                  <stop offset="100%" stopColor="#D97706" stopOpacity="0.9" />
                </linearGradient>
              </defs>

              {data.hops.map((hop, idx) => {
                const totalHops = data.hops.length;
                const x1 = (idx / totalHops) * 800 + 75;
                const x2 = ((idx + 1) / totalHops) * 800 + 5;
                const y1 = 45;
                const y2 = 45;
                const cp1x = x1 + 45;
                const cp2x = x2 - 45;

                const thickness = Math.max(14, (hop.amount_inr / data.sanctioned_amount_inr) * 36);
                const isDelayed = hop.status === 'DELAYED';
                const isSelected = selectedHop === idx;

                return (
                  <g 
                    key={idx} 
                    className="cursor-pointer transition-transform" 
                    onClick={() => {
                      setSelectedHop(selectedHop === idx ? null : idx);
                      setSelectedNode(null);
                    }}
                  >
                    <path
                      d={`M ${x1} ${y1} C ${cp1x} ${y1}, ${cp2x} ${y2}, ${x2} ${y2}`}
                      fill="none"
                      stroke={isDelayed ? 'url(#flowGradientDelayed)' : 'url(#flowGradientNormal)'}
                      strokeWidth={thickness}
                      strokeLinecap="round"
                      opacity={isSelected ? 1 : 0.85}
                    />
                    {/* Circle badge in middle of hop */}
                    <circle
                      cx={(x1 + x2) / 2}
                      cy={(y1 + y2) / 2}
                      r={13}
                      fill={isDelayed ? '#D97706' : '#002B49'}
                      stroke="#FFFFFF"
                      strokeWidth={2}
                    />
                    <text
                      x={(x1 + x2) / 2}
                      y={(y1 + y2) / 2 + 3.5}
                      fill="#FFFFFF"
                      fontSize="9"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      {idx + 1}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Hop Detail Cards */}
          <div className="grid grid-cols-4 gap-3">
            {data.hops.map((hop, idx) => {
              const colors = getStatusColor(hop.status);
              const isSelected = selectedHop === idx;

              return (
                <div
                  key={idx}
                  onClick={() => {
                    setSelectedHop(selectedHop === idx ? null : idx);
                    setSelectedNode(null);
                  }}
                  className={`p-3 rounded-gov border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-gov-navy bg-blue-50/90 ring-2 ring-gov-navy/20'
                      : 'border-gov-border bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-bold text-gov-navy">
                      Hop {idx + 1} Transfer
                    </span>
                    <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full border ${colors.badge}`}>
                      {hop.status === 'DELAYED' ? 'SLA Alert' : 'Normal'}
                    </span>
                  </div>

                  <div className="text-sm font-bold text-slate-900 mb-1">
                    {formatINR(hop.amount_inr)}
                  </div>

                  <div className="space-y-0.5 text-[11px] text-slate-500">
                    <div className="flex items-center justify-between">
                      <span>Date:</span>
                      <span className="font-semibold text-slate-700">{hop.transferred_at}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Elapsed / SLA:</span>
                      <span className={`font-bold ${hop.days_elapsed > hop.statutory_sla_days ? 'text-amber-700' : 'text-emerald-700'}`}>
                        {hop.days_elapsed}d / {hop.statutory_sla_days}d
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* POP-OUT / DRILLDOWN MODAL DRAWER ON CLICK */}
      {selectedNode && (
        <div className="p-4 bg-slate-50 rounded-gov border border-gov-navy/40 shadow-sm space-y-3 animate-fadeIn">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2">
              <Building className="w-5 h-5 text-gov-navy" />
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-gov-navy text-white rounded">
                  {selectedNode.category} STATUTORY AUDIT PROFILE
                </span>
                <h4 className="text-sm font-bold text-gov-navy mt-1">{selectedNode.name}</h4>
              </div>
            </div>
            <button
              onClick={() => setSelectedNode(null)}
              className="p-1 text-slate-400 hover:text-slate-700 rounded"
              title="Close Profile"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs pt-1">
            <div className="p-2.5 bg-white rounded border border-slate-200">
              <span className="text-slate-500 text-[10px] block font-semibold">Account / PFMS Code</span>
              <span className="font-bold text-slate-900 font-mono text-[11px]">{selectedNode.account_code}</span>
            </div>
            <div className="p-2.5 bg-white rounded border border-slate-200">
              <span className="text-slate-500 text-[10px] block font-semibold">Designated Nodal Officer</span>
              <span className="font-bold text-slate-800">{selectedNode.nodal_officer}</span>
            </div>
            <div className="p-2.5 bg-white rounded border border-slate-200">
              <span className="text-slate-500 text-[10px] block font-semibold">Allocated Tranche</span>
              <span className="font-bold text-gov-navy">{formatINR(selectedNode.allocated_inr)}</span>
            </div>
            <div className="p-2.5 bg-white rounded border border-slate-200">
              <span className="text-slate-500 text-[10px] block font-semibold">Current SNA Balance</span>
              <span className="font-bold text-amber-700">{formatINR(selectedNode.pending_inr)}</span>
            </div>
          </div>
        </div>
      )}

      {activeHopData && (
        <div className="p-4 bg-blue-50/70 rounded-gov border border-gov-navy/30 shadow-sm space-y-3 animate-fadeIn">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-gov-navy" />
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-gov-navy text-white rounded">
                  HOP {selectedHop! + 1} TRANSACTION CERTIFICATE
                </span>
                <h4 className="text-sm font-bold text-gov-navy mt-1">
                  {activeHopData.source} ➔ {activeHopData.target}
                </h4>
              </div>
            </div>
            <button
              onClick={() => setSelectedHop(null)}
              className="p-1 text-slate-400 hover:text-slate-700 rounded"
              title="Close Hop Profile"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs pt-1">
            <div className="p-2.5 bg-white rounded border border-slate-200">
              <span className="text-slate-500 text-[10px] block font-semibold">Transferred Rupee Volume</span>
              <span className="font-bold text-gov-navy text-sm">{formatINR(activeHopData.amount_inr)}</span>
            </div>
            <div className="p-2.5 bg-white rounded border border-slate-200">
              <span className="text-slate-500 text-[10px] block font-semibold">PFMS Reference Number</span>
              <span className="font-bold text-slate-800 font-mono text-[11px]">{activeHopData.pfms_ref}</span>
            </div>
            <div className="p-2.5 bg-white rounded border border-slate-200">
              <span className="text-slate-500 text-[10px] block font-semibold">Statutory Sanction Order</span>
              <span className="font-bold text-slate-800 font-mono text-[11px]">{activeHopData.sanction_order}</span>
            </div>
            <div className="p-2.5 bg-white rounded border border-slate-200">
              <span className="text-slate-500 text-[10px] block font-semibold">SLA Performance</span>
              <span className={`font-bold ${activeHopData.days_elapsed > activeHopData.statutory_sla_days ? 'text-amber-700' : 'text-emerald-700'}`}>
                {activeHopData.days_elapsed} days ({activeHopData.days_elapsed > activeHopData.statutory_sla_days ? 'Delayed' : 'On-Time'})
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
