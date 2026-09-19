import { IIntelligenceRepository } from '../interfaces';
import {
  RiskAssessmentEntity,
  SLABottleneckEntity,
  InspectorScheduleEntity,
  RiskOverviewSummaryEntity,
  ProjectRiskIntelligenceDetailEntity,
  VerificationConfidenceEntity,
  AuditLedgerHistoryEntity,
} from '../entities';

export class FetchSystemRiskOverviewUseCase {
  constructor(private intelligenceRepo: IIntelligenceRepository) {}

  async execute(): Promise<RiskOverviewSummaryEntity> {
    return this.intelligenceRepo.getSystemRiskOverview();
  }
}

export class FetchRiskProjectsUseCase {
  constructor(private intelligenceRepo: IIntelligenceRepository) {}

  async execute(params?: {
    state?: string;
    anomalyFlag?: string;
    minRiskScore?: number;
    sortBy?: string;
    sortOrder?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ totalRecords: number; projects: RiskAssessmentEntity[] }> {
    return this.intelligenceRepo.getRiskProjects(params);
  }
}

export class FetchRiskScoreUseCase {
  constructor(private intelligenceRepo: IIntelligenceRepository) {}

  async execute(workId: string): Promise<RiskAssessmentEntity> {
    if (!workId || !workId.trim()) {
      throw new Error('Work ID must be specified for risk assessment.');
    }
    return this.intelligenceRepo.getProjectRisk(workId.trim());
  }
}

export class FetchProjectRiskIntelligenceDetailUseCase {
  constructor(private intelligenceRepo: IIntelligenceRepository) {}

  async execute(workId: string): Promise<ProjectRiskIntelligenceDetailEntity> {
    if (!workId || !workId.trim()) {
      throw new Error('Work ID must be specified for risk intelligence detail.');
    }
    return this.intelligenceRepo.getProjectRiskIntelligenceDetail(workId.trim());
  }
}

export class FetchVerificationConfidenceUseCase {
  constructor(private intelligenceRepo: IIntelligenceRepository) {}

  async execute(workId: string): Promise<VerificationConfidenceEntity> {
    if (!workId || !workId.trim()) {
      throw new Error('Work ID must be specified for verification confidence.');
    }
    return this.intelligenceRepo.getVerificationConfidence(workId.trim());
  }
}

export class FetchProjectLedgerHistoryUseCase {
  constructor(private intelligenceRepo: IIntelligenceRepository) {}

  async execute(workId: string): Promise<AuditLedgerHistoryEntity> {
    if (!workId || !workId.trim()) {
      throw new Error('Work ID must be specified for ledger history.');
    }
    return this.intelligenceRepo.getProjectLedgerHistory(workId.trim());
  }
}

export class FetchSLABottleneckUseCase {
  constructor(private intelligenceRepo: IIntelligenceRepository) {}

  async execute(workId: string): Promise<SLABottleneckEntity> {
    if (!workId || !workId.trim()) {
      throw new Error('Work ID must be specified for SLA bottleneck evaluation.');
    }
    return this.intelligenceRepo.getSLABottleneck(workId.trim());
  }
}

export class FetchOptimizedInspectionsUseCase {
  constructor(private intelligenceRepo: IIntelligenceRepository) {}

  async execute(): Promise<{
    totalInspectors: number;
    totalPlannedInspections: number;
    routes: InspectorScheduleEntity[];
  }> {
    return this.intelligenceRepo.getOptimizedInspections();
  }
}
