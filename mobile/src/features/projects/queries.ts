import { useQuery } from '@tanstack/react-query';
import { RemoteProjectRepository } from '../../data/repositories/RemoteProjectRepository';
import { ProjectFilterParams } from '../../domain/interfaces';
import { QueryKeys } from '../../data/remote/queryKeys';

const projectRepository = new RemoteProjectRepository();

export const useProjectsQuery = (params?: ProjectFilterParams) => {
  return useQuery({
    queryKey: QueryKeys.projects.list(params),
    queryFn: () => projectRepository.getProjectsList(params),
  });
};

export const useProjectDetailQuery = (workId: string) => {
  return useQuery({
    queryKey: QueryKeys.projects.detail(workId),
    queryFn: () => projectRepository.getProjectById(workId),
    enabled: Boolean(workId),
  });
};

export const useDatasetSummaryQuery = () => {
  return useQuery({
    queryKey: QueryKeys.projects.summary(),
    queryFn: () => projectRepository.getDatasetSummary(),
  });
};

export const useMPsQuery = (params?: { state?: string; house?: string; limit?: number }) => {
  return useQuery({
    queryKey: QueryKeys.projects.mps(params),
    queryFn: () => projectRepository.getMPs(params),
  });
};
