import { ICitizenRepository } from '../../domain/interfaces';
import { CitizenEvidenceEntity, EvidenceVerificationResultEntity } from '../../domain/entities';
import { apiClient } from '../remote/apiClient';
import { ApiEndpoints } from '../../config/api';
import { CitizenEvidenceSubmissionDTO, EvidenceVerificationResultDTO } from '../remote/dto';
import { DataMappers } from '../remote/mappers';
import { OutboxService } from '../../services/outboxService';
import { useAuthStore } from '../../store/authStore';
import { logger } from '../../utils/logger';

export class RemoteCitizenRepository implements ICitizenRepository {
  async submitEvidence(evidence: CitizenEvidenceEntity): Promise<EvidenceVerificationResultEntity> {
    const { user } = useAuthStore.getState();
    const userId = user?.id || 'citizen-local';
    const role = user?.role || 'CITIZEN';

    const payload: CitizenEvidenceSubmissionDTO = {
      project_id: evidence.projectId,
      latitude: evidence.latitude,
      longitude: evidence.longitude,
      timestamp_captured: evidence.timestampCaptured,
      is_live_camera_capture: evidence.isLiveCameraCapture,
      image_base64: evidence.imageBase64,
    };

    try {
      const data = await apiClient.post<EvidenceVerificationResultDTO>(
        ApiEndpoints.citizen.submitEvidence,
        payload
      );

      return DataMappers.mapEvidenceVerificationDTOToEntity(data);
    } catch (error) {
      logger.warn('RemoteCitizenRepository', 'Online evidence submission failed. Queueing into durable Outbox.', error);

      // Queue into durable local outbox
      const outboxItem = await OutboxService.queueEvidenceSubmission(userId, role, evidence);

      return {
        evidenceId: outboxItem.id,
        projectId: evidence.projectId,
        distanceToProjectMeters: 0,
        locationVerified: true,
        duplicateDetected: false,
        verificationStatus: 'QUEUED_OFFLINE',
      };
    }
  }

  async getEvidenceHistory(projectId?: string): Promise<{ count: number; evidence: any[] }> {
    try {
      const data = await apiClient.get<{ count: number; evidence: any[] }>(
        ApiEndpoints.citizen.submitEvidence,
        { params: projectId ? { project_id: projectId } : undefined }
      );

      return {
        count: data.count || 0,
        evidence: data.evidence || [],
      };
    } catch (error) {
      logger.warn('RemoteCitizenRepository', 'Network failed while fetching evidence history.');
      return { count: 0, evidence: [] };
    }
  }
}
