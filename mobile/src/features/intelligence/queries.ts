import { useQuery } from '@tanstack/react-query';
import { RemoteIntelligenceRepository } from '../../data/repositories/RemoteIntelligenceRepository';
import { QueryKeys } from '../../data/remote/queryKeys';

const intelligenceRepository = new RemoteIntelligenceRepository();

export const useSystemRiskOverviewQuery = () => {
  return useQuery({
    queryKey: QueryKeys.risk.overview(),
    queryFn: () => intelligenceRepository.getSystemRiskOverview(),
  });
};

export const useRiskProjectsQuery = (params?: {
  state?: string;
  anomalyFlag?: string;
  minRiskScore?: number;
  sortBy?: string;
  sortOrder?: string;
  limit?: number;
  offset?: number;
}) => {
  return useQuery({
    queryKey: QueryKeys.risk.list(params),
    queryFn: () => intelligenceRepository.getRiskProjects(params),
  });
};

export const useProjectRiskQuery = (workId: string) => {
  return useQuery({
    queryKey: QueryKeys.risk.detail(workId),
    queryFn: () => intelligenceRepository.getProjectRisk(workId),
    enabled: Boolean(workId),
  });
};

export const useProjectRiskIntelligenceDetailQuery = (workId: string) => {
  return useQuery({
    queryKey: QueryKeys.risk.intelligenceDetail(workId),
    queryFn: () => intelligenceRepository.getProjectRiskIntelligenceDetail(workId),
    enabled: Boolean(workId),
  });
};

export const useVerificationConfidenceQuery = (workId: string) => {
  return useQuery({
    queryKey: QueryKeys.risk.verificationConfidence(workId),
    queryFn: () => intelligenceRepository.getVerificationConfidence(workId),
    enabled: Boolean(workId),
  });
};

export const useProjectLedgerHistoryQuery = (workId: string) => {
  return useQuery({
    queryKey: QueryKeys.risk.ledger(workId),
    queryFn: () => intelligenceRepository.getProjectLedgerHistory(workId),
    enabled: Boolean(workId),
  });
};

export const useSLABottleneckQuery = (workId: string) => {
  return useQuery({
    queryKey: QueryKeys.risk.slaBottleneck(workId),
    queryFn: () => intelligenceRepository.getSLABottleneck(workId),
    enabled: Boolean(workId),
  });
};

export const useOptimizedInspectionsQuery = () => {
  return useQuery({
    queryKey: QueryKeys.risk.inspections(),
    queryFn: () => intelligenceRepository.getOptimizedInspections(),
  });
};
