import { Config } from './environment';

export const ApiEndpoints = {
  // Base URLs
  base: Config.apiBaseUrl,
  v1: `${Config.apiBaseUrl}/api/v1`,
  national: `${Config.apiBaseUrl}/api`,

  // Projects Domain
  projects: {
    list: `${Config.apiBaseUrl}/api/v1/projects/list`,
    detail: (id: string) => `${Config.apiBaseUrl}/api/v1/projects/${encodeURIComponent(id)}`,
    mps: `${Config.apiBaseUrl}/api/v1/projects/mps`,
    summary: `${Config.apiBaseUrl}/api/v1/projects/dataset-summary`,
  },

  // AI & Risk Domain
  risk: {
    overview: `${Config.apiBaseUrl}/api/v1/projects/summary`,
    list: `${Config.apiBaseUrl}/api/v1/risk`,
    detail: (id: string) => `${Config.apiBaseUrl}/api/v1/risk/${encodeURIComponent(id)}`,
    benchmarks: `${Config.apiBaseUrl}/api/v1/intelligence/peer-benchmarks`,
    slaBottleneck: (id: string) => `${Config.apiBaseUrl}/api/v1/sla/bottleneck/${encodeURIComponent(id)}`,
    verificationConfidence: (id: string) => `${Config.apiBaseUrl}/api/v1/verification/confidence/${encodeURIComponent(id)}`,
    inspections: `${Config.apiBaseUrl}/api/v1/optimizer/plan`,
    ledger: (id: string) => `${Config.apiBaseUrl}/api/v1/ledger/${encodeURIComponent(id)}`,
    fairnessSummary: `${Config.apiBaseUrl}/api/v1/fairness/test-summary`,
  },

  // Citizen Domain
  citizen: {
    submitEvidence: `${Config.apiBaseUrl}/api/v1/citizen/evidence`,
  },

  // District Officer Operational Domain
  officer: {
    dashboard: `${Config.apiBaseUrl}/api/v1/officer/dashboard`,
    projects: `${Config.apiBaseUrl}/api/v1/officer/projects`,
    reviewEvidence: (evidenceId: string) => `${Config.apiBaseUrl}/api/v1/officer/evidence/${encodeURIComponent(evidenceId)}/review`,
    updateInspection: (workId: string) => `${Config.apiBaseUrl}/api/v1/officer/inspections/${encodeURIComponent(workId)}/update`,
    inspectionsPlan: `${Config.apiBaseUrl}/api/v1/optimizer/plan`,
    bottleneckSummary: `${Config.apiBaseUrl}/api/v1/bottleneck/summary`,
    bottleneckDetail: (workId: string) => `${Config.apiBaseUrl}/api/v1/bottleneck/${encodeURIComponent(workId)}`,
  },

  // National Data Pipeline
  nationalData: {
    summary: `${Config.apiBaseUrl}/api/national-data/summary`,
    sources: `${Config.apiBaseUrl}/api/national-data/sources`,
    states: `${Config.apiBaseUrl}/api/national-data/states`,
  },

  // Notifications Domain
  notifications: {
    feed: `${Config.apiBaseUrl}/api/v1/notifications`,
    unreadCount: `${Config.apiBaseUrl}/api/v1/notifications/unread-count`,
    markRead: (id: string) => `${Config.apiBaseUrl}/api/v1/notifications/${encodeURIComponent(id)}/read`,
    devices: `${Config.apiBaseUrl}/api/v1/notifications/devices`,
    deviceDetail: (deviceId: string) => `${Config.apiBaseUrl}/api/v1/notifications/devices/${encodeURIComponent(deviceId)}`,
    preferences: `${Config.apiBaseUrl}/api/v1/notifications/preferences`,
  },

  // Member of Parliament (MP) Constituency Domain
  mp: {
    dashboard: `${Config.apiBaseUrl}/api/v1/mp/dashboard`,
    projects: `${Config.apiBaseUrl}/api/v1/mp/projects`,
    projectDetail: (workId: string) => `${Config.apiBaseUrl}/api/v1/mp/projects/${encodeURIComponent(workId)}`,
    riskOverview: `${Config.apiBaseUrl}/api/v1/mp/risk-overview`,
  },

  // Contractor Operations Domain
  contractor: {
    dashboard: `${Config.apiBaseUrl}/api/v1/contractor/dashboard`,
    projects: `${Config.apiBaseUrl}/api/v1/contractor/projects`,
    projectDetail: (workId: string) => `${Config.apiBaseUrl}/api/v1/contractor/projects/${encodeURIComponent(workId)}`,
    progressUpdate: (workId: string) => `${Config.apiBaseUrl}/api/v1/contractor/projects/${encodeURIComponent(workId)}/progress`,
    progressHistory: (workId: string) => `${Config.apiBaseUrl}/api/v1/contractor/projects/${encodeURIComponent(workId)}/progress-history`,
    issues: (workId: string) => `${Config.apiBaseUrl}/api/v1/contractor/projects/${encodeURIComponent(workId)}/issues`,
  },
};



