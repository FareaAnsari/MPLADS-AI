import { IContractorRepository } from '../../domain/interfaces';
import {
  ContractorDashboardEntity,
  ContractorProjectDetailEntity,
  ContractorProgressUpdateEntity,
  ContractorIssueEntity,
  ProjectEntity,
} from '../../domain/entities';
import { apiClient } from '../remote/apiClient';
import { ApiEndpoints } from '../../config/api';
import {
  ContractorDashboardDTO,
  ContractorProjectDetailDTO,
  ContractorProjectListDTO,
  ContractorProgressUpdateDTO,
  ContractorIssueDTO,
} from '../remote/dto';
import { DataMappers } from '../remote/mappers';

export class RemoteContractorRepository implements IContractorRepository {
  async getDashboard(): Promise<ContractorDashboardEntity> {
    const data = await apiClient.get<ContractorDashboardDTO>(
      ApiEndpoints.contractor.dashboard
    );
    return DataMappers.mapContractorDashboardDTOToEntity(data);
  }

  async getProjects(params?: {
    search?: string;
    workCategory?: string;
    stage?: string;
    limit?: number;
    offset?: number;
  }): Promise<{
    total: number;
    limit: number;
    offset: number;
    contractorId: string;
    projects: ProjectEntity[];
  }> {
    const queryParams: Record<string, any> = {};
    if (params?.search) queryParams.search = params.search;
    if (params?.workCategory) queryParams.work_category = params.workCategory;
    if (params?.stage) queryParams.stage = params.stage;
    if (params?.limit) queryParams.limit = params.limit;
    if (params?.offset) queryParams.offset = params.offset;

    const data = await apiClient.get<ContractorProjectListDTO>(
      ApiEndpoints.contractor.projects,
      { params: queryParams }
    );

    return {
      total: data.total || 0,
      limit: data.limit || 50,
      offset: data.offset || 0,
      contractorId: data.contractor_id || '',
      projects: (data.projects || []).map(DataMappers.mapProjectDTOToEntity),
    };
  }

  async getProjectDetail(workId: string): Promise<ContractorProjectDetailEntity> {
    const data = await apiClient.get<ContractorProjectDetailDTO>(
      ApiEndpoints.contractor.projectDetail(workId)
    );
    return DataMappers.mapContractorProjectDetailDTOToEntity(data);
  }

  async submitProgressUpdate(
    workId: string,
    payload: {
      progressPercentage: number;
      milestoneStage?: string;
      remarks: string;
      fieldObservations?: string;
      photos?: string[];
      latitude?: number;
      longitude?: number;
    }
  ): Promise<ContractorProgressUpdateEntity> {
    const data = await apiClient.post<ContractorProgressUpdateDTO>(
      ApiEndpoints.contractor.progressUpdate(workId),
      {
        progress_percentage: payload.progressPercentage,
        milestone_stage: payload.milestoneStage,
        remarks: payload.remarks,
        field_observations: payload.fieldObservations,
        photos: payload.photos,
        latitude: payload.latitude,
        longitude: payload.longitude,
      }
    );
    return DataMappers.mapContractorProgressUpdateDTOToEntity(data);
  }

  async getProgressHistory(
    workId: string
  ): Promise<ContractorProgressUpdateEntity[]> {
    const data = await apiClient.get<ContractorProgressUpdateDTO[]>(
      ApiEndpoints.contractor.progressHistory(workId)
    );
    return (data || []).map(DataMappers.mapContractorProgressUpdateDTOToEntity);
  }

  async reportIssue(
    workId: string,
    payload: {
      category: string;
      title: string;
      description: string;
      severity?: string;
    }
  ): Promise<ContractorIssueEntity> {
    const data = await apiClient.post<ContractorIssueDTO>(
      ApiEndpoints.contractor.issues(workId),
      {
        category: payload.category,
        title: payload.title,
        description: payload.description,
        severity: payload.severity,
      }
    );
    return DataMappers.mapContractorIssueDTOToEntity(data);
  }

  async getIssues(workId: string): Promise<ContractorIssueEntity[]> {
    const data = await apiClient.get<ContractorIssueDTO[]>(
      ApiEndpoints.contractor.issues(workId)
    );
    return (data || []).map(DataMappers.mapContractorIssueDTOToEntity);
  }
}
