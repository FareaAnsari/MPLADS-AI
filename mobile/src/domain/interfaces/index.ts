import {
  ProjectEntity,
  MPEntity,
  RiskAssessmentEntity,
  SLABottleneckEntity,
  InspectorScheduleEntity,
  CitizenEvidenceEntity,
  EvidenceVerificationResultEntity,
  NationalDataSummaryEntity,
  OfficerDashboardEntity,
  EvidenceReviewDecisionEntity,
  InspectionUpdateEntity,
  RiskOverviewSummaryEntity,
  ProjectRiskIntelligenceDetailEntity,
  VerificationConfidenceEntity,
  AuditLedgerHistoryEntity,
  NotificationEntity,
  NotificationPreferencesEntity,
  DeviceRegistrationEntity,
  MPDashboardEntity,
  MPProjectDetailEntity,
  ContractorDashboardEntity,
  ContractorProjectDetailEntity,
  ContractorProgressUpdateEntity,
  ContractorIssueEntity,
} from '../entities';

export * from './authRepository';

export interface ProjectFilterParams {
  state?: string;
  workCategory?: string;
  mpName?: string;
  limit?: number;
  offset?: number;
}

export interface IProjectRepository {
  getProjectsList(params?: ProjectFilterParams): Promise<{ total: number; limit: number; offset: number; projects: ProjectEntity[] }>;
  getProjectById(workId: string): Promise<ProjectEntity>;
  getMPs(params?: { state?: string; house?: string; limit?: number }): Promise<{ count: number; total: number; mps: MPEntity[] }>;
  getDatasetSummary(): Promise<NationalDataSummaryEntity>;
}

export interface IIntelligenceRepository {
  getSystemRiskOverview(): Promise<RiskOverviewSummaryEntity>;
  getRiskProjects(params?: {
    state?: string;
    anomalyFlag?: string;
    minRiskScore?: number;
    sortBy?: string;
    sortOrder?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ totalRecords: number; projects: RiskAssessmentEntity[] }>;
  getProjectRisk(workId: string): Promise<RiskAssessmentEntity>;
  getProjectRiskIntelligenceDetail(workId: string): Promise<ProjectRiskIntelligenceDetailEntity>;
  getVerificationConfidence(workId: string): Promise<VerificationConfidenceEntity>;
  getProjectLedgerHistory(workId: string): Promise<AuditLedgerHistoryEntity>;
  getSLABottleneck(workId: string): Promise<SLABottleneckEntity>;
  getOptimizedInspections(): Promise<{ totalInspectors: number; totalPlannedInspections: number; routes: InspectorScheduleEntity[] }>;
}

export interface ICitizenRepository {
  submitEvidence(evidence: CitizenEvidenceEntity): Promise<EvidenceVerificationResultEntity>;
  getEvidenceHistory(projectId?: string): Promise<{ count: number; evidence: any[] }>;
}

export interface IOfficerRepository {
  getOfficerDashboard(): Promise<OfficerDashboardEntity>;
  getOfficerProjects(params?: { search?: string; workCategory?: string; limit?: number; offset?: number }): Promise<{ total: number; limit: number; offset: number; jurisdiction: string; projects: ProjectEntity[] }>;
  reviewEvidence(payload: EvidenceReviewDecisionEntity): Promise<{ status: string; evidenceId: string; reviewStatus: string }>;
  updateInspection(payload: InspectionUpdateEntity): Promise<{ status: string; record: any }>;
}

export interface INationalDataRepository {
  getSummary(): Promise<Record<string, any>>;
  getSources(): Promise<Record<string, any>[]>;
  getStates(): Promise<Record<string, any>[]>;
}

export interface INotificationRepository {
  getNotifications(category?: string): Promise<NotificationEntity[]>;
  getUnreadCount(): Promise<number>;
  markAsRead(notificationId: string): Promise<NotificationEntity>;
  registerDevice(device: DeviceRegistrationEntity): Promise<{ status: string; deviceId: string }>;
  unregisterDevice(deviceId: string): Promise<{ status: string; deviceId: string }>;
  getPreferences(): Promise<NotificationPreferencesEntity>;
  updatePreferences(preferences: Partial<NotificationPreferencesEntity>): Promise<NotificationPreferencesEntity>;
}

export interface IMPRepository {
  getDashboard(): Promise<MPDashboardEntity>;
  getProjects(params?: {
    search?: string;
    workCategory?: string;
    stage?: string;
    riskLevel?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ total: number; limit: number; offset: number; constituency: string; state: string; projects: ProjectEntity[] }>;
  getProjectDetail(workId: string): Promise<MPProjectDetailEntity>;
  getRiskOverview(): Promise<{ constituency: string; state: string; totalAssessedProjects: number; attentionCount: number; attentionProjects: any[] }>;
}

export interface IContractorRepository {
  getDashboard(): Promise<ContractorDashboardEntity>;
  getProjects(params?: {
    search?: string;
    workCategory?: string;
    stage?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ total: number; limit: number; offset: number; contractorId: string; projects: ProjectEntity[] }>;
  getProjectDetail(workId: string): Promise<ContractorProjectDetailEntity>;
  submitProgressUpdate(workId: string, payload: {
    progressPercentage: number;
    milestoneStage?: string;
    remarks: string;
    fieldObservations?: string;
    photos?: string[];
    latitude?: number;
    longitude?: number;
  }): Promise<ContractorProgressUpdateEntity>;
  getProgressHistory(workId: string): Promise<ContractorProgressUpdateEntity[]>;
  reportIssue(workId: string, payload: {
    category: string;
    title: string;
    description: string;
    severity?: string;
  }): Promise<ContractorIssueEntity>;
  getIssues(workId: string): Promise<ContractorIssueEntity[]>;
}



