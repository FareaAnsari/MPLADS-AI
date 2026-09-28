import { ProjectFilterParams } from '../../domain/interfaces';

export const QueryKeys = {
  projects: {
    all: ['projects'] as const,
    lists: () => [...QueryKeys.projects.all, 'list'] as const,
    list: (params?: ProjectFilterParams) => [...QueryKeys.projects.lists(), params] as const,
    details: () => [...QueryKeys.projects.all, 'detail'] as const,
    detail: (id: string) => [...QueryKeys.projects.details(), id] as const,
    summary: () => [...QueryKeys.projects.all, 'summary'] as const,
    mps: (params?: Record<string, any>) => [...QueryKeys.projects.all, 'mps', params] as const,
  },
  risk: {
    all: ['risk'] as const,
    overview: () => [...QueryKeys.risk.all, 'overview'] as const,
    lists: () => [...QueryKeys.risk.all, 'list'] as const,
    list: (params?: Record<string, any>) => [...QueryKeys.risk.lists(), params] as const,
    detail: (workId: string) => [...QueryKeys.risk.all, 'detail', workId] as const,
    intelligenceDetail: (workId: string) => [...QueryKeys.risk.all, 'intelligence', workId] as const,
    verificationConfidence: (workId: string) => [...QueryKeys.risk.all, 'verification', workId] as const,
    ledger: (workId: string) => [...QueryKeys.risk.all, 'ledger', workId] as const,
    slaBottleneck: (workId: string) => [...QueryKeys.risk.all, 'sla', workId] as const,
    inspections: () => [...QueryKeys.risk.all, 'inspections'] as const,
  },
  citizen: {
    all: ['citizen'] as const,
    summary: () => [...QueryKeys.citizen.all, 'summary'] as const,
    evidence: (projectId?: string) => [...QueryKeys.citizen.all, 'evidence', projectId || 'all'] as const,
  },
  officer: {
    all: ['officer'] as const,
    dashboard: () => [...QueryKeys.officer.all, 'dashboard'] as const,
    projects: (params?: Record<string, any>) => [...QueryKeys.officer.all, 'projects', params] as const,
    evidencePending: () => [...QueryKeys.officer.all, 'evidence', 'pending'] as const,
  },
  notifications: {
    all: ['notifications'] as const,
    list: (category?: string) => [...QueryKeys.notifications.all, 'list', category || 'all'] as const,
    unreadCount: () => [...QueryKeys.notifications.all, 'unreadCount'] as const,
    preferences: () => [...QueryKeys.notifications.all, 'preferences'] as const,
  },
  mp: {
    all: ['mp'] as const,
    dashboard: () => [...QueryKeys.mp.all, 'dashboard'] as const,
    projects: (params?: Record<string, any>) => [...QueryKeys.mp.all, 'projects', params] as const,
    detail: (workId: string) => [...QueryKeys.mp.all, 'detail', workId] as const,
    riskOverview: () => [...QueryKeys.mp.all, 'riskOverview'] as const,
  },
  contractor: {
    all: ['contractor'] as const,
    dashboard: () => [...QueryKeys.contractor.all, 'dashboard'] as const,
    projects: (params?: Record<string, any>) => [...QueryKeys.contractor.all, 'projects', params] as const,
    detail: (workId: string) => [...QueryKeys.contractor.all, 'detail', workId] as const,
    progressHistory: (workId: string) => [...QueryKeys.contractor.all, 'progress', workId] as const,
    issues: (workId: string) => [...QueryKeys.contractor.all, 'issues', workId] as const,
  },
};


