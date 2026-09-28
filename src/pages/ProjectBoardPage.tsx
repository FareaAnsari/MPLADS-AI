import React, { useState } from 'react';
import { ProjectKanbanBoard } from '../components/ProjectKanbanBoard';
import { MOCK_PROJECTS } from '../data/mockData';
import { LayoutGrid, Layers, ShieldCheck } from 'lucide-react';

export const ProjectBoardPage: React.FC = () => {
  const [isOfficer, setIsOfficer] = useState(true);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 space-y-4">
      {/* Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gov-border">
        <div>
          <div className="flex items-center space-x-2">
            <LayoutGrid className="w-5 h-5 text-gov-navy" />
            <h1 className="text-lg sm:text-xl font-bold text-gov-navy">
              Project Execution & Milestone Kanban Board
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time stage-wise tracking across To Do, In Progress, Completed, and SLA Stalled works with instant database synchronization.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 text-xs font-bold bg-slate-100 text-slate-700 rounded-gov border border-slate-200">
            Total Indexed Works: {MOCK_PROJECTS.length}
          </span>
        </div>
      </div>

      {/* Kanban Board Component */}
      <ProjectKanbanBoard initialProjects={MOCK_PROJECTS} isOfficer={isOfficer} />
    </div>
  );
};
