import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { RemoteContractorRepository } from '../../data/repositories/RemoteContractorRepository';
import { QueryKeys } from '../../data/remote/queryKeys';

const contractorRepository = new RemoteContractorRepository();

export const useContractorDashboardQuery = () => {
  return useQuery({
    queryKey: QueryKeys.contractor.dashboard(),
    queryFn: () => contractorRepository.getDashboard(),
  });
};

export const useContractorProjectsQuery = (params?: {
  search?: string;
  workCategory?: string;
  stage?: string;
  limit?: number;
  offset?: number;
}) => {
  return useQuery({
    queryKey: QueryKeys.contractor.projects(params),
    queryFn: () => contractorRepository.getProjects(params),
  });
};

export const useContractorProjectDetailQuery = (workId: string) => {
  return useQuery({
    queryKey: QueryKeys.contractor.detail(workId),
    queryFn: () => contractorRepository.getProjectDetail(workId),
    enabled: !!workId,
  });
};

export const useContractorProgressHistoryQuery = (workId: string) => {
  return useQuery({
    queryKey: QueryKeys.contractor.progressHistory(workId),
    queryFn: () => contractorRepository.getProgressHistory(workId),
    enabled: !!workId,
  });
};

export const useContractorIssuesQuery = (workId: string) => {
  return useQuery({
    queryKey: QueryKeys.contractor.issues(workId),
    queryFn: () => contractorRepository.getIssues(workId),
    enabled: !!workId,
  });
};

export const useSubmitProgressUpdateMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      workId,
      payload,
    }: {
      workId: string;
      payload: {
        progressPercentage: number;
        milestoneStage?: string;
        remarks: string;
        fieldObservations?: string;
        photos?: string[];
        latitude?: number;
        longitude?: number;
      };
    }) => contractorRepository.submitProgressUpdate(workId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: QueryKeys.contractor.detail(variables.workId),
      });
      queryClient.invalidateQueries({
        queryKey: QueryKeys.contractor.progressHistory(variables.workId),
      });
      queryClient.invalidateQueries({
        queryKey: QueryKeys.contractor.dashboard(),
      });
      queryClient.invalidateQueries({
        queryKey: QueryKeys.contractor.projects(),
      });
    },
  });
};

export const useReportIssueMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      workId,
      payload,
    }: {
      workId: string;
      payload: {
        category: string;
        title: string;
        description: string;
        severity?: string;
      };
    }) => contractorRepository.reportIssue(workId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: QueryKeys.contractor.issues(variables.workId),
      });
      queryClient.invalidateQueries({
        queryKey: QueryKeys.contractor.detail(variables.workId),
      });
      queryClient.invalidateQueries({
        queryKey: QueryKeys.contractor.dashboard(),
      });
    },
  });
};
