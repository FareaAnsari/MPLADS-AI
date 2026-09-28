import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { RemoteCitizenRepository } from '../../data/repositories/RemoteCitizenRepository';
import { CitizenEvidenceEntity } from '../../domain/entities';
import { QueryKeys } from '../../data/remote/queryKeys';

const citizenRepository = new RemoteCitizenRepository();

export const useCitizenEvidenceHistoryQuery = (projectId?: string) => {
  return useQuery({
    queryKey: QueryKeys.citizen.evidence(projectId),
    queryFn: () => citizenRepository.getEvidenceHistory(projectId),
  });
};

export const useSubmitCitizenEvidenceMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (evidence: CitizenEvidenceEntity) => citizenRepository.submitEvidence(evidence),
    onSuccess: (_, variables) => {
      // Invalidate relevant evidence and project queries
      queryClient.invalidateQueries({ queryKey: QueryKeys.citizen.all });
      if (variables.projectId) {
        queryClient.invalidateQueries({ queryKey: QueryKeys.projects.detail(variables.projectId) });
      }
    },
  });
};
