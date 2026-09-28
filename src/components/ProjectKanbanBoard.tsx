import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Layers, 
  Building2, 
  MapPin, 
  ArrowRight, 
  Filter, 
  ShieldCheck, 
  MoveRight, 
  ShieldAlert, 
  Lock,
  Plus
} from 'lucide-react';
import { Project, ProjectStatus, RiskLevel } from '../types';

export type KanbanColumnId = 'TODO' | 'IN_PROGRESS' | 'DONE' | 'BLOCKED';

interface KanbanColumn {
  id: KanbanColumnId;
  title: string;
  badgeClass: string;
  dotColor: string;
  icon: React.ReactNode;
}

const COLUMNS: KanbanColumn[] = [
  {
    id: 'TODO',
    title: 'To Do / Sanctioned',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
    dotColor: 'bg-blue-500',
    icon: <Clock className="w-4 h-4 text-blue-600" />,
  },
  {
    id: 'IN_PROGRESS',
    title: 'In Progress (Execution)',
    badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
    dotColor: 'bg-amber-500',
    icon: <Layers className="w-4 h-4 text-amber-600" />,
  },
  {
    id: 'DONE',
    title: 'Completed & Certified',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dotColor: 'bg-emerald-500',
    icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" />,
  },
  {
    id: 'BLOCKED',
    title: 'Blocked / SLA Stalled',
    badgeClass: 'bg-rose-50 text-rose-800 border-rose-200',
    dotColor: 'bg-rose-500',
    icon: <AlertCircle className="w-4 h-4 text-rose-600" />,
  },
];

const createKanbanItem = (base: {
  id: string;
  code: string;
  name: string;
  category: Project['category'];
  state: string;
  district: string;
  mpName: string;
  mpConstituency: string;
  sanctionedAmount: number;
  expenditure: number;
  status: ProjectStatus;
  riskScore: number;
  riskLevel: RiskLevel;
  confidence?: number;
  physicalProgress: number;
  financialProgress: number;
  sanctionDate: string;
  contractorId: string;
  contractorName: string;
}): Project => ({
  mpHouse: 'Lok Sabha',
  estimatedCost: base.sanctionedAmount,
  contractValue: base.sanctionedAmount,
  confidence: base.confidence ?? 0.94,
  predictedDelayDays: base.status === 'BLOCKED' ? 45 : 0,
  purpose: 'Community asset creation and public infrastructure under MPLADS',
  beneficiaries: 'General Public & Ward Residents (~12,500 beneficiaries)',
  coordinates: { lat: 25.5941, lng: 85.1376 },
  recommendationDate: '2024-01-10',
  tenderDate: '2024-02-15',
  contractAwardDate: '2024-03-01',
  expectedCompletionDate: '2024-12-31',
  predictedCompletionDate: '2024-12-31',
  vendorIds: ['v-01'],
  vendorNames: ['National Civil & Steel Suppliers'],
  lifecycleStages: [],
  aiAlerts: base.riskScore >= 70 ? ['Statutory SLA breach detected: Execution delayed beyond milestone timeline'] : [],
  ...base,
});

export const SAMPLE_KANBAN_PROJECTS: Project[] = [
  // 1. TO DO / SANCTIONED
  createKanbanItem({
    id: 'WRK-2024-BR-001',
    code: 'MPLADS/2024/BR/001',
    name: 'Construction of Community Health Sub-Centre Building, Raniganj',
    category: 'Health & Sanitation',
    state: 'Bihar',
    district: 'Araria',
    mpName: 'Pradeep Kumar Singh',
    mpConstituency: 'Araria (Lok Sabha)',
    sanctionedAmount: 4200000,
    expenditure: 0,
    status: 'TO DO',
    riskScore: 18,
    riskLevel: 'LOW',
    confidence: 0.92,
    physicalProgress: 0,
    financialProgress: 0,
    sanctionDate: '2024-05-12',
    contractorId: 'c-01',
    contractorName: 'Patna Civil Infrastructure Ltd'
  }),
  createKanbanItem({
    id: 'WRK-2024-MH-002',
    code: 'MPLADS/2024/MH/002',
    name: 'Installation of Solar Powered Deep Tubewells & RO Filter Plants (8 Units)',
    category: 'Drinking Water',
    state: 'Maharashtra',
    district: 'Pune',
    mpName: 'Girish Bapat',
    mpConstituency: 'Pune (Lok Sabha)',
    sanctionedAmount: 2800000,
    expenditure: 0,
    status: 'TO DO',
    riskLevel: 'LOW',
    confidence: 0.95,
    riskScore: 12,
    physicalProgress: 0,
    financialProgress: 0,
    sanctionDate: '2024-06-01',
    contractorId: 'c-02',
    contractorName: 'Pune Solar & Water Grid Corp'
  }),
  createKanbanItem({
    id: 'WRK-2024-PB-003',
    code: 'MPLADS/2024/PB/003',
    name: 'PCC Road Linkage from Village Main Chowk to Senior Secondary School',
    category: 'Roads & Pathways',
    state: 'Punjab',
    district: 'Faridkot',
    mpName: 'Mohammad Sadique',
    mpConstituency: 'Faridkot (Lok Sabha)',
    sanctionedAmount: 3500000,
    expenditure: 0,
    status: 'TO DO',
    riskScore: 22,
    riskLevel: 'LOW',
    confidence: 0.89,
    physicalProgress: 0,
    financialProgress: 0,
    sanctionDate: '2024-06-18',
    contractorId: 'c-03',
    contractorName: 'Faridkot Builders & Paving Ltd'
  }),

  // 2. IN PROGRESS (EXECUTION)
  createKanbanItem({
    id: 'WRK-2024-BR-004',
    code: 'MPLADS/2024/BR/004',
    name: 'Modern Science Laboratory Block & Computer Center at Model High School',
    category: 'Education',
    state: 'Bihar',
    district: 'Araria',
    mpName: 'Pradeep Kumar Singh',
    mpConstituency: 'Araria (Lok Sabha)',
    sanctionedAmount: 5000000,
    expenditure: 3500000,
    status: 'IN PROGRESS',
    riskScore: 24,
    riskLevel: 'LOW',
    confidence: 0.94,
    physicalProgress: 68,
    financialProgress: 70,
    sanctionDate: '2024-01-15',
    contractorId: 'c-01',
    contractorName: 'Bharat Infrastructure & Paving Pvt Ltd'
  }),
  createKanbanItem({
    id: 'WRK-2024-MH-005',
    code: 'MPLADS/2024/MH/005',
    name: 'All-Weather Concrete Pavement with Covered Side Drains, Haveli Tehsil',
    category: 'Roads & Pathways',
    state: 'Maharashtra',
    district: 'Pune',
    mpName: 'Girish Bapat',
    mpConstituency: 'Pune (Lok Sabha)',
    sanctionedAmount: 4850000,
    expenditure: 3200000,
    status: 'IN PROGRESS',
    riskScore: 32,
    riskLevel: 'LOW',
    confidence: 0.91,
    physicalProgress: 62,
    financialProgress: 66,
    sanctionDate: '2024-02-10',
    contractorId: 'c-02',
    contractorName: 'Darsh Buildcon Pvt Ltd'
  }),
  createKanbanItem({
    id: 'WRK-2024-RJ-006',
    code: 'MPLADS/2024/RJ/006',
    name: 'Community Center & Women Skill Development Training Hall',
    category: 'Community Infrastructure',
    state: 'Rajasthan',
    district: 'Jaipur',
    mpName: 'Ramcharan Bohra',
    mpConstituency: 'Jaipur (Lok Sabha)',
    sanctionedAmount: 3800000,
    expenditure: 2200000,
    status: 'IN PROGRESS',
    riskScore: 28,
    riskLevel: 'LOW',
    confidence: 0.93,
    physicalProgress: 55,
    financialProgress: 58,
    sanctionDate: '2024-03-05',
    contractorId: 'c-04',
    contractorName: 'Jaipur Civil Infrastructure'
  }),

  // 3. COMPLETED & CERTIFIED
  createKanbanItem({
    id: 'WRK-2024-BR-007',
    code: 'MPLADS/2024/BR/007',
    name: 'Community Drinking Water RO Purification Kiosk & Overhead Tank',
    category: 'Drinking Water',
    state: 'Bihar',
    district: 'Araria',
    mpName: 'Pradeep Kumar Singh',
    mpConstituency: 'Araria (Lok Sabha)',
    sanctionedAmount: 1800000,
    expenditure: 1800000,
    status: 'COMPLETED',
    riskScore: 8,
    riskLevel: 'LOW',
    confidence: 0.98,
    physicalProgress: 100,
    financialProgress: 100,
    sanctionDate: '2023-11-20',
    contractorId: 'c-01',
    contractorName: 'Patna Civil Infrastructure Ltd'
  }),
  createKanbanItem({
    id: 'WRK-2024-MH-008',
    code: 'MPLADS/2024/MH/008',
    name: 'Solar High-Mast Street Lighting Installation, Forbesganj Ward 4-8',
    category: 'Renewable Energy',
    state: 'Maharashtra',
    district: 'Pune',
    mpName: 'Girish Bapat',
    mpConstituency: 'Pune (Lok Sabha)',
    sanctionedAmount: 2200000,
    expenditure: 2200000,
    status: 'COMPLETED',
    riskScore: 14,
    riskLevel: 'LOW',
    confidence: 0.96,
    physicalProgress: 100,
    financialProgress: 100,
    sanctionDate: '2023-10-15',
    contractorId: 'c-02',
    contractorName: 'Pune Solar & Water Grid Corp'
  }),
  createKanbanItem({
    id: 'WRK-2024-PB-009',
    code: 'MPLADS/2024/PB/009',
    name: 'Senior Citizens Recreation Shed & Community Paving',
    category: 'Community Infrastructure',
    state: 'Punjab',
    district: 'Faridkot',
    mpName: 'Mohammad Sadique',
    mpConstituency: 'Faridkot (Lok Sabha)',
    sanctionedAmount: 2500000,
    expenditure: 2500000,
    status: 'COMPLETED',
    riskScore: 11,
    riskLevel: 'LOW',
    confidence: 0.97,
    physicalProgress: 100,
    financialProgress: 100,
    sanctionDate: '2023-09-10',
    contractorId: 'c-03',
    contractorName: 'Faridkot Builders & Paving Ltd'
  }),

  // 4. BLOCKED / SLA STALLED
  createKanbanItem({
    id: 'WRK-2024-BR-010',
    code: 'MPLADS/2024/BR/010',
    name: 'Drainage Culvert & Retaining Wall Paving near River Basin',
    category: 'Roads & Pathways',
    state: 'Bihar',
    district: 'Araria',
    mpName: 'Pradeep Kumar Singh',
    mpConstituency: 'Araria (Lok Sabha)',
    sanctionedAmount: 3200000,
    expenditure: 1100000,
    status: 'BLOCKED',
    riskScore: 82,
    riskLevel: 'HIGH',
    confidence: 0.88,
    physicalProgress: 35,
    financialProgress: 34,
    sanctionDate: '2023-12-05',
    contractorId: 'c-01',
    contractorName: 'Patna Civil Infrastructure Ltd'
  }),
  createKanbanItem({
    id: 'WRK-2024-MH-011',
    code: 'MPLADS/2024/MH/011',
    name: 'Panchayat Bhavan Solar Electrification & Grid Linkage',
    category: 'Renewable Energy',
    state: 'Maharashtra',
    district: 'Pune',
    mpName: 'Girish Bapat',
    mpConstituency: 'Pune (Lok Sabha)',
    sanctionedAmount: 2600000,
    expenditure: 800000,
    status: 'BLOCKED',
    riskScore: 78,
    riskLevel: 'HIGH',
    confidence: 0.85,
    physicalProgress: 28,
    financialProgress: 30,
    sanctionDate: '2023-11-01',
    contractorId: 'c-02',
    contractorName: 'Darsh Buildcon Pvt Ltd'
  })
];

interface ProjectKanbanBoardProps {
  initialProjects?: Project[];
  isOfficer?: boolean;
}

const mapStageToColumn = (status: ProjectStatus, riskScore: number = 0): KanbanColumnId => {
  if (status === 'BLOCKED' || riskScore >= 75) {
    return 'BLOCKED';
  }
  if (status === 'COMPLETED') {
    return 'DONE';
  }
  if (status === 'IN PROGRESS' || status === 'UNDER REVIEW') {
    return 'IN_PROGRESS';
  }
  return 'TODO';
};

const formatINR = (amt: number) => {
  if (amt >= 10000000) return `₹ ${(amt / 10000000).toFixed(2)} Cr`;
  if (amt >= 100000) return `₹ ${(amt / 100000).toFixed(2)} Lakh`;
  return `₹ ${amt.toLocaleString('en-IN')}`;
};

export const ProjectKanbanBoard: React.FC<ProjectKanbanBoardProps> = ({
  initialProjects = SAMPLE_KANBAN_PROJECTS,
  isOfficer = true,
}) => {
  const [projects, setProjects] = useState<Project[]>(() => 
    initialProjects && initialProjects.length > 0 ? initialProjects : SAMPLE_KANBAN_PROJECTS
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedState, setSelectedState] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Filter projects
  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      !searchQuery ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.mpName && p.mpName.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesState = selectedState === 'All' || p.state === selectedState;
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;

    return matchesSearch && matchesState && matchesCategory;
  });

  const handleMoveStage = async (id: string, targetCol: KanbanColumnId) => {
    if (!isOfficer) return;

    setUpdatingId(id);
    try {
      // Local optimistic update
      setProjects((prev) =>
        prev.map((p) => {
          if (p.id === id) {
            let targetStatus: ProjectStatus = 'TO DO';
            let newRisk = p.riskScore || 20;
            if (targetCol === 'IN_PROGRESS') targetStatus = 'IN PROGRESS';
            if (targetCol === 'DONE') {
              targetStatus = 'COMPLETED';
              newRisk = 8;
            }
            if (targetCol === 'BLOCKED') {
              targetStatus = 'BLOCKED';
              newRisk = 80;
            }
            return { ...p, status: targetStatus, riskScore: newRisk };
          }
          return p;
        })
      );

      // Backend API sync
      await fetch(`http://localhost:8000/api/v1/projects/${encodeURIComponent(id)}/stage?new_stage=${targetCol}`, {
        method: 'PATCH',
      });
    } catch {
      // Offline fallback
    } finally {
      setUpdatingId(null);
    }
  };

  const getProjectsForCol = (colId: KanbanColumnId) => {
    return filteredProjects.filter((p) => mapStageToColumn(p.status, p.riskScore || 0) === colId);
  };

  const uniqueStates = ['All', ...Array.from(new Set(projects.map((p) => p.state).filter(Boolean)))];
  const uniqueCategories = ['All', ...Array.from(new Set(projects.map((p) => p.category).filter(Boolean)))];

  return (
    <div className="space-y-4">
      {/* Control Bar */}
      <div className="bg-white p-4 rounded-gov border border-gov-border shadow-gov flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative">
            <input
              type="text"
              placeholder="Search work name, code, or MP..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-3 pr-8 py-1.5 text-xs bg-slate-50 border border-gov-border rounded-gov focus:bg-white focus:outline-none focus:ring-1 focus:ring-gov-navy w-56 sm:w-64"
            />
          </div>

          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="text-xs py-1.5 px-2.5 bg-slate-50 border border-gov-border rounded-gov text-slate-700 font-medium"
          >
            {uniqueStates.map((st) => (
              <option key={st} value={st}>
                {st === 'All' ? 'All States' : st}
              </option>
            ))}
          </select>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs py-1.5 px-2.5 bg-slate-50 border border-gov-border rounded-gov text-slate-700 font-medium"
          >
            {uniqueCategories.map((c) => (
              <option key={c} value={c}>
                {c === 'All' ? 'All Sectors' : c}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          {isOfficer ? (
            <span className="px-2.5 py-1 text-[11px] font-bold bg-emerald-50 text-emerald-800 rounded-full border border-emerald-200 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Officer Execution Mode (Drag & Stage Updates Active)
            </span>
          ) : (
            <span className="px-2.5 py-1 text-[11px] font-bold bg-slate-100 text-slate-600 rounded-full border border-slate-200 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-slate-500" />
              Public Transparency Mode (Read-Only)
            </span>
          )}
        </div>
      </div>

      {/* 4-Column Board Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
        {COLUMNS.map((col) => {
          const colProjects = getProjectsForCol(col.id);

          return (
            <div
              key={col.id}
              className="bg-slate-50/80 rounded-gov border border-gov-border p-3 flex flex-col min-h-[520px]"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-gov-border/70">
                <div className="flex items-center space-x-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${col.dotColor}`} />
                  <h3 className="text-xs font-bold text-slate-800">{col.title}</h3>
                </div>
                <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${col.badgeClass}`}>
                  {colProjects.length}
                </span>
              </div>

              {/* Cards Stream */}
              <div className="space-y-3 flex-1 overflow-y-auto max-h-[640px] pr-0.5">
                {colProjects.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 text-xs border border-dashed border-slate-200 rounded-gov bg-white/50">
                    No projects in this stage
                  </div>
                ) : (
                  colProjects.map((p) => {
                    const isHighRisk = (p.riskScore || 0) >= 70;
                    const isUpdating = updatingId === p.id;

                    return (
                      <div
                        key={p.id}
                        className={`bg-white rounded-gov border p-3.5 shadow-sm hover:shadow-md transition-all space-y-2 ${
                          isHighRisk
                            ? 'border-rose-200 border-l-4 border-l-rose-500'
                            : 'border-gov-border'
                        } ${isUpdating ? 'opacity-50 pointer-events-none' : ''}`}
                      >
                        {/* Card Top Row */}
                        <div className="flex items-start justify-between gap-1.5">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                            {p.category || 'Infrastructure'}
                          </span>
                          <span
                            className={`px-1.5 py-0.5 text-[9px] font-bold rounded ${
                              isHighRisk
                                ? 'bg-rose-100 text-rose-700'
                                : (p.riskScore || 0) > 40
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-emerald-100 text-emerald-700'
                            }`}
                          >
                            Risk: {p.riskScore || 12}/100
                          </span>
                        </div>

                        {/* Title */}
                        <h4 className="text-xs font-bold text-slate-900 leading-snug line-clamp-2">
                          {p.name}
                        </h4>

                        {/* Meta Tags */}
                        <div className="text-[11px] text-slate-500 space-y-1">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate">{p.state} {p.mpConstituency ? `(${p.mpConstituency})` : ''}</span>
                          </div>
                          <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                            <span className="font-semibold text-slate-700">Sanctioned:</span>
                            <span className="font-bold text-gov-navy">{formatINR(p.sanctionedAmount)}</span>
                          </div>
                        </div>

                        {/* Officer Fast Transition Buttons */}
                        {isOfficer && (
                          <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1">
                            <span className="text-[9px] text-slate-400 font-bold uppercase">Move to:</span>
                            <div className="flex items-center gap-1">
                              {col.id !== 'TODO' && (
                                <button
                                  onClick={() => handleMoveStage(p.id, 'TODO')}
                                  className="px-1.5 py-0.5 text-[9px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded"
                                  title="Move to To Do"
                                >
                                  To Do
                                </button>
                              )}
                              {col.id !== 'IN_PROGRESS' && (
                                <button
                                  onClick={() => handleMoveStage(p.id, 'IN_PROGRESS')}
                                  className="px-1.5 py-0.5 text-[9px] font-bold bg-amber-50 hover:bg-amber-100 text-amber-800 rounded border border-amber-200"
                                  title="Move to In Progress"
                                >
                                  Progress
                                </button>
                              )}
                              {col.id !== 'DONE' && (
                                <button
                                  onClick={() => handleMoveStage(p.id, 'DONE')}
                                  className="px-1.5 py-0.5 text-[9px] font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded border border-emerald-200"
                                  title="Move to Done"
                                >
                                  Done
                                </button>
                              )}
                              {col.id !== 'BLOCKED' && (
                                <button
                                  onClick={() => handleMoveStage(p.id, 'BLOCKED')}
                                  className="px-1.5 py-0.5 text-[9px] font-bold bg-rose-50 hover:bg-rose-100 text-rose-800 rounded border border-rose-200"
                                  title="Move to Blocked"
                                >
                                  Block
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
