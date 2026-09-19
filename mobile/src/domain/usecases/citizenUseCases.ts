import { ICitizenRepository } from '../interfaces';
import { CitizenEvidenceEntity, EvidenceVerificationResultEntity } from '../entities';

export class SubmitCitizenEvidenceUseCase {
  constructor(private citizenRepo: ICitizenRepository) {}

  async execute(evidence: CitizenEvidenceEntity): Promise<EvidenceVerificationResultEntity> {
    if (!evidence.projectId || !evidence.projectId.trim()) {
      throw new Error('Project ID is required for evidence submission.');
    }
    if (
      evidence.latitude === undefined ||
      evidence.longitude === undefined ||
      isNaN(evidence.latitude) ||
      isNaN(evidence.longitude)
    ) {
      throw new Error('Valid GPS latitude and longitude coordinates are required.');
    }
    return this.citizenRepo.submitEvidence(evidence);
  }
}

export class FetchCitizenEvidenceHistoryUseCase {
  constructor(private citizenRepo: ICitizenRepository) {}

  async execute(projectId?: string): Promise<{ count: number; evidence: any[] }> {
    return this.citizenRepo.getEvidenceHistory(projectId);
  }
}
