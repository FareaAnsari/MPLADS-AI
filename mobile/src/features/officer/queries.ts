import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { RemoteOfficerRepository } from '../../data/repositories/RemoteOfficerRepository';
import {
  EvidenceReviewDecisionEntity,
  InspectionUpdateEntity,
} from '../../domain/entities';
import { QueryKeys } from '../../data/remote/queryKeys';

const officerRepository = new RemoteOfficerRepository();

export const useOfficerDashboardQuery = () => {
  return useQuery({
    queryKey: QueryKeys.officer.dashboard(),
    queryFn: () => officerRepository.getOfficerDashboard(),
  });
};

export const useOfficerProjectsQuery = (params?: {
  search?: string;
  workCategory?: string;
  limit?: number;
  offset?: number;
}) => {
  return useQuery({
    queryKey: QueryKeys.officer.projects(params),
    queryFn: () => officerRepository.getOfficerProjects(params),
  });
};

export const useReviewEvidenceMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: EvidenceReviewDecisionEntity) =>
      officerRepository.reviewEvidence(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QueryKeys.officer.all });
      queryClient.invalidateQueries({ queryKey: QueryKeys.citizen.all });
    },
  });
};

export const useUpdateInspectionMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: InspectionUpdateEntity) =>
      officerRepository.updateInspection(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QueryKeys.officer.all });
      queryClient.invalidateQueries({ queryKey: QueryKeys.risk.all });
    },
  });
};
