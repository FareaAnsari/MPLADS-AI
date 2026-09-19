export * from './auth';
export * from './permissions';

// Re-export other domain models
export interface ProjectEntity {
  id: string;
  workId: string;
  workTitle: string;
  workCategory: string;
  workDescription: string | null;
  mpName: string | null;
  idaOffice: string | null;
  state: string;
  constituency: string | null;
  sanctionedAmountInr: number;
  disbursedAmountInr: number;
  currentStage: string;
  hasOfficialImages: boolean;
  source: string;
  sourceType: string;
}

export interface MPEntity {
  id: string;
  mpName: string;
  house: 'LOK_SABHA' | 'RAJYA_SABHA' | string;
  category: string;
  state: string;
  constituency: string | null;
  allocatedLimitInr: number;
}

export interface RiskBreakdownEntity {
  costAnomalyScore: number;
  timeDelayScore: number;
  duplicateRiskScore: number;
  clusterDensityScore: number;
  paymentPatternScore?: number;
  isolationForestAuxiliaryScore?: number;
}

export interface RiskAssessmentEntity {
  projectId: string;
  workId: string;
  riskScore: number;
  anomalyFlag: 'NORMAL' | 'POTENTIAL_ANOMALY' | 'REQUIRES_VERIFICATION' | 'EVIDENCE_CONFLICT' | 'HIGH_RISK_COST_DEVIATION' | string;
  scoreBreakdown: RiskBreakdownEntity;
  evaluatedAt: string;
  primaryRiskReason?: string;
  topContributingFactor?: string;
  missingEvidenceFields?: string[];
}

export interface SLABottleneckEntity {
  projectId: string;
  currentStage: string;
  daysInCurrentStage: number;
  expectedBenchmarkDays: number;
  delayRatio: number;
  responsibleRole: string;
  isBottleneck: boolean;
}

export interface InspectorScheduleEntity {
  inspectionPriorityRank: number;
  projectId: string;
  workId: string;
  priorityScore: number;
  riskScore: number;
  disbursedAmountInr: number;
  distanceFromBaseKm: number;
  recommendedAction: string;
}

export type CaptureStep =
  | 'IDLE'
  | 'CAMERA_PERMISSION'
  | 'CAMERA_CAPTURE'
  | 'IMAGE_PREVIEW'
  | 'LOCATION_PERMISSION'
  | 'GETTING_LOCATION'
  | 'LOCATION_READY'
  | 'REVIEW'
  | 'UPLOADING'
  | 'SUBMITTED'
  | 'ERROR';

export interface EvidenceCaptureStateEntity {
  imageUri: string | null;
  imageBase64?: string | null;
  latitude: number | null;
  longitude: number | null;
  accuracyMeters: number | null;
  capturedAt: string | null;
  isLiveCamera: boolean;
  step: CaptureStep;
  error?: string | null;
}

export interface CitizenEvidenceEntity {
  projectId: string;
  latitude: number;
  longitude: number;
  accuracyMeters?: number | null;
  timestampCaptured: string;
  isLiveCameraCapture: boolean;
  imageBase64?: string | null;
  imageUri?: string | null;
  evidenceNotes?: string | null;
}

export interface EvidenceVerificationResultEntity {
  evidenceId: string;
  projectId: string;
  distanceToProjectMeters: number;
  locationVerified: boolean;
  duplicateDetected: boolean;
  verificationStatus: string;
}

export interface NationalDataSummaryEntity {
  totalMpsIndexed: number;
  totalWorksIndexed: number;
  totalExpendituresIndexed: number;
  totalSanctionedInr: number;
  totalDisbursedInr: number;
  dataSource: string;
}

export interface OfficerDashboardEntity {
  officer: {
    id: string;
    fullName: string;
    role: string;
    jurisdictionState?: string | null;
    jurisdictionDistrict?: string | null;
    inspectorId?: string | null;
  };
  metrics: {
    totalDistrictProjects: number;
    inProgressCount: number;
    completedCount: number;
    highRiskCount: number;
    pendingEvidenceCount: number;
    slaBottlenecksCount: number;
  };
  assignedRoute?: {
    capacity_summary?: { assigned_inspections: number; total_capacity: number };
    scheduled_stops?: any[];
  } | null;
  pendingEvidenceQueue: any[];
}

export interface EvidenceReviewDecisionEntity {
  evidenceId: string;
  decision: 'ACCEPTED' | 'REJECTED' | 'NEEDS_INFO';
  reviewNotes?: string | null;
}

export interface InspectionUpdateEntity {
  workId: string;
  inspectionStatus: string;
  observations: string;
  physicalProgressPercent?: number | null;
}

export interface RiskOverviewSummaryEntity {
  totalProjectsMonitored: number;
  riskDistribution: {
    highRiskCount: number;
    reviewRequiredCount: number;
    normalCount: number;
  };
  heroProjectId: string;
  provenanceSummary: {
    dataSources: string[];
    totalRecordsIndexed: number;
    retrievedAt?: string;
  };
}

export interface PeerCohortStatsEntity {
  peerGroupId: string;
  peerStatus: string;
  count: number;
  mean: number;
  median: number;
  std: number;
  iqr: number;
  q25: number;
  q75: number;
  note?: string;
}

export interface PeerComparisonSummaryEntity {
  projectId: string;
  amountInr: number;
  peerStats: PeerCohortStatsEntity;
  deviation: {
    zScore: number;
    deviationFromMeanPct: number;
    deviationFromMedianPct: number;
  };
}

export interface ProjectRiskIntelligenceDetailEntity {
  project: ProjectEntity;
  riskAssessment: RiskAssessmentEntity;
  peerGroupSummary: PeerComparisonSummaryEntity;
  latestLedgerEntryId?: string | null;
}

export interface VerificationConfidenceEntity {
  projectId: string;
  verificationConfidence: number;
  independentEvidenceStatus: string;
  triangulationSummary: Record<string, number>;
  evaluatedAt: string;
}

export interface AuditLedgerHistoryEntity {
  projectId: string;
  totalLedgerEntries: number;
  ledgerHistory: any[];
}

export type OutboxStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'SUCCEEDED'
  | 'FAILED_RETRYABLE'
  | 'FAILED_PERMANENT'
  | 'CANCELLED'
  | 'CONFLICT';

export interface OutboxItemEntity<T = any> {
  id: string;
  userId: string;
  role: string;
  entityType: 'EVIDENCE' | 'INSPECTION' | 'PROJECT_NOTE' | string;
  entityId: string;
  operation: 'CREATE' | 'UPDATE' | 'DELETE';
  payload: T;
  status: OutboxStatus;
  attemptCount: number;
  lastAttemptAt?: string | null;
  nextRetryAt?: string | null;
  idempotencyKey: string;
  errorCode?: string | null;
  errorMessage?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SyncMetadataEntity {
  key: string;
  userId: string;
  lastSyncedAt: string;
  entityType: string;
}

export type SyncState = 'ONLINE' | 'OFFLINE' | 'SYNCING' | 'SYNC_COMPLETE' | 'SYNC_FAILED';

// Notification Domain Entities
export type NotificationType =
  | 'EVIDENCE_SUBMITTED'
  | 'EVIDENCE_REVIEW_UPDATE'
  | 'HIGH_RISK_ALERT'
  | 'SLA_BOTTLENECK_ALERT'
  | 'INSPECTION_ASSIGNED'
  | 'PROJECT_STAGE_UPDATE'
  | 'SYSTEM_NOTICE';

export type NotificationCategory =
  | 'EVIDENCE'
  | 'RISK'
  | 'SLA'
  | 'INSPECTION'
  | 'PROJECT'
  | 'SYSTEM';

export interface NotificationEntity {
  id: string;
  userId: string;
  role: string;
  type: NotificationType;
  category: NotificationCategory;
  title: string;
  body: string;
  entityType?: string;
  entityId?: string;
  deepLink?: string;
  readAt?: string | null;
  createdAt: string;
}

export interface NotificationPreferencesEntity {
  pushEnabled: boolean;
  evidenceUpdates: boolean;
  riskAlerts: boolean;
  slaAlerts: boolean;
  inspectionUpdates: boolean;
  projectMilestones: boolean;
  updatedAt: string;
}

export interface DeviceRegistrationEntity {
  pushToken: string;
  deviceId: string;
  platform: 'ios' | 'android' | 'web';
  appVersion?: string;
}

// MP Office Oversight Domain Entities
export interface MPProfileSummaryEntity {
  id: string;
  fullName: string;
  role: string;
  constituency: string;
  state: string;
}

export interface MPMetricsEntity {
  totalConstituencyProjects: number;
  activeCount: number;
  completedCount: number;
  delayedCount: number;
  totalSanctionedInr: number;
  totalDisbursedInr: number;
  highRiskAttentionCount: number;
  publicEvidenceCount: number;
  utilizationPercentage: number;
}

export interface MPRiskDistributionEntity {
  low: number;
  medium: number;
  high: number;
  critical: number;
}

export interface MPDashboardEntity {
  mp: MPProfileSummaryEntity;
  metrics: MPMetricsEntity;
  riskDistribution: MPRiskDistributionEntity;
  recentProjects: ProjectEntity[];
}

export interface MPFinancialSummaryEntity {
  sanctionedAmountInr: number;
  disbursedAmountInr: number;
  expenditureInr: number;
  remainingBalanceInr: number;
  utilizationPercentage: number;
}

export interface MPMilestoneEntity {
  stageId: string;
  stageName: string;
  isCompleted: boolean;
  isCurrent: boolean;
  benchmarkDays: number;
  daysInStage?: number | null;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'PENDING' | string;
}

export interface MPOversightRiskEntity {
  riskScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | string;
  attentionRequired: boolean;
  primaryRiskSignal?: string | null;
  topContributingFactor?: string | null;
}

export interface MPProjectDetailEntity {
  project: ProjectEntity;
  financials: MPFinancialSummaryEntity;
  milestones: MPMilestoneEntity[];
  riskOversight: MPOversightRiskEntity;
  publicEvidence: any[];
  expenditures: any[];
}

// Contractor Operations Domain Entities
export interface ContractorProfileEntity {
  id: string;
  fullName: string;
  companyName: string;
  role: string;
  jurisdictionState?: string;
  contractorId: string;
}

export interface ContractorMetricsEntity {
  assignedProjectsCount: number;
  activeWorksCount: number;
  completedWorksCount: number;
  pendingSubmissionsCount: number;
  reportedIssuesCount: number;
  totalContractValueInr: number;
}

export interface ContractorProgressUpdateEntity {
  submissionId: string;
  workId: string;
  contractorId: string;
  reportedProgressPercent: number;
  milestoneStage: string;
  remarks: string;
  fieldObservations?: string | null;
  status: string;
  submittedAt: string;
  auditRef: string;
}

export interface ContractorIssueEntity {
  issueId: string;
  workId: string;
  contractorId: string;
  category: 'MATERIAL_DELAY' | 'SITE_ACCESS' | 'APPROVAL_DEPENDENCY' | 'WEATHER_BLOCKER' | 'TECHNICAL_ISSUE' | 'OTHER' | string;
  title: string;
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | string;
  status: 'REPORTED' | 'ACKNOWLEDGED' | 'RESOLVED' | string;
  reportedAt: string;
  acknowledgedAt?: string | null;
}

export interface ContractorMilestoneEntity {
  stageId: string;
  stageName: string;
  targetPercent: number;
  isCompleted: boolean;
}

export interface ContractorDashboardEntity {
  contractor: ContractorProfileEntity;
  metrics: ContractorMetricsEntity;
  assignedProjects: ProjectEntity[];
  recentSubmissions: ContractorProgressUpdateEntity[];
}

export interface ContractorProjectDetailEntity {
  project: ProjectEntity;
  contractValueInr: number;
  reportedProgressPercent: number;
  verifiedProgressPercent: number;
  milestones: ContractorMilestoneEntity[];
  progressHistory: ContractorProgressUpdateEntity[];
  issues: ContractorIssueEntity[];
}


