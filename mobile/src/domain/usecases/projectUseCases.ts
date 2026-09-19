import { IProjectRepository, ProjectFilterParams } from '../interfaces';
import { ProjectEntity, MPEntity, NationalDataSummaryEntity } from '../entities';

export class FetchProjectsUseCase {
  constructor(private projectRepo: IProjectRepository) {}

  async execute(params?: ProjectFilterParams): Promise<{ total: number; limit: number; offset: number; projects: ProjectEntity[] }> {
    return this.projectRepo.getProjectsList(params);
  }
}

export class FetchProjectDetailsUseCase {
  constructor(private projectRepo: IProjectRepository) {}

  async execute(workId: string): Promise<ProjectEntity> {
    if (!workId || !workId.trim()) {
      throw new Error('Project Work ID is required.');
    }
    return this.projectRepo.getProjectById(workId.trim());
  }
}

export class FetchMPsUseCase {
  constructor(private projectRepo: IProjectRepository) {}

  async execute(params?: { state?: string; house?: string; limit?: number }): Promise<{ count: number; total: number; mps: MPEntity[] }> {
    return this.projectRepo.getMPs(params);
  }
}

export class FetchDatasetSummaryUseCase {
  constructor(private projectRepo: IProjectRepository) {}

  async execute(): Promise<NationalDataSummaryEntity> {
    return this.projectRepo.getDatasetSummary();
  }
}
