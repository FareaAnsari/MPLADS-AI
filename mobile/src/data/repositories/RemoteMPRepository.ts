import { IMPRepository } from '../../domain/interfaces';
import {
  MPDashboardEntity,
  MPProjectDetailEntity,
  ProjectEntity,
} from '../../domain/entities';
import { apiClient } from '../remote/apiClient';
import { ApiEndpoints } from '../../config/api';
import {
  MPDashboardDTO,
  MPProjectDetailDTO,
  MPProjectListDTO,
} from '../remote/dto';
import { DataMappers } from '../remote/mappers';

export class RemoteMPRepository implements IMPRepository {
  async getDashboard(): Promise<MPDashboardEntity> {
    const data = await apiClient.get<MPDashboardDTO>(ApiEndpoints.mp.dashboard);
    return DataMappers.mapMPDashboardDTOToEntity(data);
  }

  async getProjects(params?: {
    search?: string;
    workCategory?: string;
    stage?: string;
    riskLevel?: string;
    limit?: number;
    offset?: number;
  }): Promise<{
    total: number;
    limit: number;
    offset: number;
    constituency: string;
    state: string;
    projects: ProjectEntity[];
  }> {
    const queryParams: Record<string, any> = {};
    if (params?.search) queryParams.search = params.search;
    if (params?.workCategory) queryParams.work_category = params.workCategory;
    if (params?.stage) queryParams.stage = params.stage;
    if (params?.riskLevel) queryParams.risk_level = params.riskLevel;
    if (params?.limit) queryParams.limit = params.limit;
    if (params?.offset) queryParams.offset = params.offset;

    const data = await apiClient.get<MPProjectListDTO>(ApiEndpoints.mp.projects, {
      params: queryParams,
    });

    return {
      total: data.total || 0,
      limit: data.limit || 50,
      offset: data.offset || 0,
      constituency: data.constituency || 'Constituency',
      state: data.state || 'State',
      projects: (data.projects || []).map(DataMappers.mapProjectDTOToEntity),
    };
  }

  async getProjectDetail(workId: string): Promise<MPProjectDetailEntity> {
    const data = await apiClient.get<MPProjectDetailDTO>(
      ApiEndpoints.mp.projectDetail(workId)
    );
    return DataMappers.mapMPProjectDetailDTOToEntity(data);
  }

  async getRiskOverview(): Promise<{
    constituency: string;
    state: string;
    totalAssessedProjects: number;
    attentionCount: number;
    attentionProjects: any[];
  }> {
    const data = await apiClient.get<{
      constituency: string;
      state: string;
      total_assessed_projects: number;
      attention_count: number;
      attention_projects: any[];
    }>(ApiEndpoints.mp.riskOverview);

    return {
      constituency: data.constituency,
      state: data.state,
      totalAssessedProjects: data.total_assessed_projects || 0,
      attentionCount: data.attention_count || 0,
      attentionProjects: data.attention_projects || [],
    };
  }
}
