import { IProjectRepository, ProjectFilterParams } from '../../domain/interfaces';
import { ProjectEntity, MPEntity, NationalDataSummaryEntity } from '../../domain/entities';
import { apiClient } from '../remote/apiClient';
import { ApiEndpoints } from '../../config/api';
import { ProjectDTO, MPDTO } from '../remote/dto';
import { DataMappers } from '../remote/mappers';
import { sqliteLocalDataSource } from '../local/sqliteLocalDataSource';
import { useAuthStore } from '../../store/authStore';
import { logger } from '../../utils/logger';

export class RemoteProjectRepository implements IProjectRepository {
  async getProjectsList(
    params?: ProjectFilterParams
  ): Promise<{ total: number; limit: number; offset: number; projects: ProjectEntity[] }> {
    const { user } = useAuthStore.getState();
    const userId = user?.id || 'anonymous';
    const role = user?.role || 'CITIZEN';

    try {
      const data = await apiClient.get<{
        total: number;
        limit: number;
        offset: number;
        projects: ProjectDTO[];
      }>(ApiEndpoints.projects.list, { params });

      const mappedProjects = (data.projects || []).map(DataMappers.mapProjectDTOToEntity);

      // Cache locally in SQLite for offline usage
      if (mappedProjects.length > 0) {
        await sqliteLocalDataSource.saveProjects(userId, role, mappedProjects);
      }

      return {
        total: data.total || mappedProjects.length,
        limit: data.limit || 50,
        offset: data.offset || 0,
        projects: mappedProjects,
      };
    } catch (error) {
      logger.warn('RemoteProjectRepository', 'Network request failed. Reading from local SQLite cache.', error);

      // Offline fallback from local SQLite database
      const cachedProjects = await sqliteLocalDataSource.getCachedProjects(
        userId,
        role,
        params?.limit || 50,
        params?.offset || 0
      );

      return {
        total: cachedProjects.length,
        limit: params?.limit || 50,
        offset: params?.offset || 0,
        projects: cachedProjects,
      };
    }
  }

  async getProjectById(workId: string): Promise<ProjectEntity> {
    const { user } = useAuthStore.getState();
    const userId = user?.id || 'anonymous';

    try {
      const data = await apiClient.get<{ project: ProjectDTO }>(
        ApiEndpoints.projects.detail(workId)
      );
      const entity = DataMappers.mapProjectDTOToEntity(data.project);

      // Update cached project
      await sqliteLocalDataSource.saveProjects(userId, user?.role || 'CITIZEN', [entity]);
      return entity;
    } catch (error) {
      logger.warn('RemoteProjectRepository', `Network failed for ${workId}. Checking SQLite cache.`);

      const cached = await sqliteLocalDataSource.getProjectById(userId, workId);
      if (cached) {
        return cached;
      }
      throw error;
    }
  }

  async getMPs(
    params?: { state?: string; house?: string; limit?: number }
  ): Promise<{ count: number; total: number; mps: MPEntity[] }> {
    const data = await apiClient.get<{ count: number; total: number; mps: MPDTO[] }>(
      ApiEndpoints.projects.mps,
      { params }
    );

    return {
      count: data.count || 0,
      total: data.total || 0,
      mps: (data.mps || []).map(DataMappers.mapMPDTOToEntity),
    };
  }

  async getDatasetSummary(): Promise<NationalDataSummaryEntity> {
    const data = await apiClient.get<{
      total_mps_indexed: number;
      total_works_indexed: number;
      total_expenditures_indexed: number;
      total_sanctioned_inr: number;
      total_disbursed_inr: number;
      provenance?: { source: string };
    }>(ApiEndpoints.projects.summary);

    return {
      totalMpsIndexed: data.total_mps_indexed || 0,
      totalWorksIndexed: data.total_works_indexed || 0,
      totalExpendituresIndexed: data.total_expenditures_indexed || 0,
      totalSanctionedInr: data.total_sanctioned_inr || 0,
      totalDisbursedInr: data.total_disbursed_inr || 0,
      dataSource: data.provenance?.source || 'data.gov.in / eSAKSHI',
    };
  }
}
