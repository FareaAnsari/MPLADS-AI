import { IOfficerRepository } from '../interfaces';
import {
  OfficerDashboardEntity,
  ProjectEntity,
  EvidenceReviewDecisionEntity,
  InspectionUpdateEntity,
} from '../entities';

export class FetchOfficerDashboardUseCase {
  constructor(private officerRepo: IOfficerRepository) {}

  async execute(): Promise<OfficerDashboardEntity> {
    return this.officerRepo.getOfficerDashboard();
  }
}

export class FetchOfficerProjectsUseCase {
  constructor(private officerRepo: IOfficerRepository) {}

  async execute(params?: {
    search?: string;
    workCategory?: string;
    limit?: number;
    offset?: number;
  }): Promise<{
    total: number;
    limit: number;
    offset: number;
    jurisdiction: string;
    projects: ProjectEntity[];
  }> {
    return this.officerRepo.getOfficerProjects(params);
  }
}

export class ReviewCitizenEvidenceUseCase {
  constructor(private officerRepo: IOfficerRepository) {}

  async execute(
    payload: EvidenceReviewDecisionEntity
  ): Promise<{ status: string; evidenceId: string; reviewStatus: string }> {
    if (!payload.evidenceId || !payload.evidenceId.trim()) {
      throw new Error('Evidence ID is required for review action.');
    }
    if (!payload.decision) {
      throw new Error('Review decision (ACCEPTED, REJECTED, or NEEDS_INFO) is required.');
    }
    return this.officerRepo.reviewEvidence(payload);
  }
}

export class UpdateOfficerInspectionUseCase {
  constructor(private officerRepo: IOfficerRepository) {}

  async execute(
    payload: InspectionUpdateEntity
  ): Promise<{ status: string; record: any }> {
    if (!payload.workId || !payload.workId.trim()) {
      throw new Error('Work ID is required for inspection update.');
    }
    if (!payload.observations || !payload.observations.trim()) {
      throw new Error('Inspection physical observations are required.');
    }
    return this.officerRepo.updateInspection(payload);
  }
}
