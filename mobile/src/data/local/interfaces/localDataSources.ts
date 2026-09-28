import {
  ProjectEntity,
  RiskAssessmentEntity,
  OutboxItemEntity,
  OutboxStatus,
} from '../../../domain/entities';

export interface ILocalProjectDataSource {
  getCachedProjects(
    userId: string,
    role: string,
    limit: number,
    offset: number,
    jurisdiction?: string
  ): Promise<ProjectEntity[]>;
  getProjectById(userId: string, workId: string): Promise<ProjectEntity | null>;
  saveProjects(
    userId: string,
    role: string,
    projects: ProjectEntity[],
    jurisdiction?: string
  ): Promise<void>;
  clearUserCache(userId: string): Promise<void>;
}

export interface ILocalRiskDataSource {
  getCachedRiskScore(userId: string, workId: string): Promise<RiskAssessmentEntity | null>;
  saveRiskScore(userId: string, assessment: RiskAssessmentEntity): Promise<void>;
  clearUserCache(userId: string): Promise<void>;
}

export interface IOfflineMutationQueue {
  enqueueMutation<T = any>(
    item: Omit<
      OutboxItemEntity<T>,
      'id' | 'createdAt' | 'updatedAt' | 'status' | 'attemptCount'
    >
  ): Promise<OutboxItemEntity<T>>;
  getPendingMutations(userId: string): Promise<OutboxItemEntity[]>;
  getMutationById(id: string): Promise<OutboxItemEntity | null>;
  updateMutationStatus(
    id: string,
    status: OutboxStatus,
    updates?: {
      attemptCount?: number;
      lastAttemptAt?: string;
      nextRetryAt?: string | null;
      errorCode?: string | null;
      errorMessage?: string | null;
    }
  ): Promise<void>;
  deleteMutation(id: string): Promise<void>;
  clearUserQueue(userId: string): Promise<void>;
}
