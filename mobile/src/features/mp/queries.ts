import { useQuery } from '@tanstack/react-query';
import { RemoteMPRepository } from '../../data/repositories/RemoteMPRepository';
import { QueryKeys } from '../../data/remote/queryKeys';

const mpRepository = new RemoteMPRepository();

export const useMPDashboardQuery = () => {
  return useQuery({
    queryKey: QueryKeys.mp.dashboard(),
    queryFn: () => mpRepository.getDashboard(),
  });
};

export const useMPProjectsQuery = (params?: {
  search?: string;
  workCategory?: string;
  stage?: string;
  riskLevel?: string;
  limit?: number;
  offset?: number;
}) => {
  return useQuery({
    queryKey: QueryKeys.mp.projects(params),
    queryFn: () => mpRepository.getProjects(params),
  });
};

export const useMPProjectDetailQuery = (workId: string) => {
  return useQuery({
    queryKey: QueryKeys.mp.detail(workId),
    queryFn: () => mpRepository.getProjectDetail(workId),
    enabled: !!workId,
  });
};

export const useMPRiskOverviewQuery = () => {
  return useQuery({
    queryKey: QueryKeys.mp.riskOverview(),
    queryFn: () => mpRepository.getRiskOverview(),
  });
};
