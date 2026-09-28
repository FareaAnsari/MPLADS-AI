import {
  FetchProjectsUseCase,
  FetchProjectDetailsUseCase,
  SubmitCitizenEvidenceUseCase,
  FetchCitizenEvidenceHistoryUseCase,
} from '../src/domain/usecases';
import { IProjectRepository, ICitizenRepository } from '../src/domain/interfaces';
import {
  ProjectEntity,
  CitizenEvidenceEntity,
  EvidenceVerificationResultEntity,
  NationalDataSummaryEntity,
} from '../src/domain/entities';
import { RolePermissions, hasPermission } from '../src/domain/entities/permissions';
import { t, DICTIONARIES } from '../src/i18n';
import { useAppStore } from '../src/store/appStore';
import { DataMappers } from '../src/data/remote/mappers';
import { EvidenceVerificationResultDTO } from '../src/data/remote/dto';

describe('Phase 6 — Citizen Application Domain & Feature Tests', () => {
  let mockProjectRepo: jest.Mocked<IProjectRepository>;
  let mockCitizenRepo: jest.Mocked<ICitizenRepository>;

  const sampleProject: ProjectEntity = {
    id: 'WRK-2024-001',
    workId: 'WRK-2024-001',
    workTitle: 'Solar Drinking Water Installation in Araria Gram Panchayat',
    workCategory: 'Drinking Water Infrastructure',
    workDescription: 'Installation of 5 HP solar deep submersible pumps.',
    mpName: 'Shri Pradeep Kumar Singh',
    idaOffice: 'District Planning Cell Araria',
    state: 'Bihar',
    constituency: 'Araria (Lok Sabha)',
    sanctionedAmountInr: 2500000,
    disbursedAmountInr: 1800000,
    currentStage: 'IMPLEMENTATION_IN_PROGRESS',
    hasOfficialImages: true,
    source: 'data.gov.in / eSAKSHI',
    sourceType: 'OFFICIAL_PUBLIC',
  };

  const sampleEvidenceResult: EvidenceVerificationResultEntity = {
    evidenceId: 'ev-1',
    projectId: 'WRK-2024-001',
    distanceToProjectMeters: 42.5,
    locationVerified: true,
    duplicateDetected: false,
    verificationStatus: 'LOCATION_VERIFIED',
  };

  beforeEach(() => {
    mockProjectRepo = {
      getProjectsList: jest.fn().mockResolvedValue({
        total: 1,
        limit: 50,
        offset: 0,
        projects: [sampleProject],
      }),
      getProjectById: jest.fn().mockResolvedValue(sampleProject),
      getMPs: jest.fn().mockResolvedValue({ count: 1, total: 1, mps: [] }),
      getDatasetSummary: jest.fn().mockResolvedValue({
        totalMpsIndexed: 543,
        totalWorksIndexed: 12000,
        totalExpendituresIndexed: 8500,
        totalSanctionedInr: 500000000,
        totalDisbursedInr: 350000000,
        dataSource: 'data.gov.in / eSAKSHI',
      } as NationalDataSummaryEntity),
    };

    mockCitizenRepo = {
      submitEvidence: jest.fn().mockResolvedValue(sampleEvidenceResult),
      getEvidenceHistory: jest.fn().mockResolvedValue({
        count: 1,
        evidence: [
          {
            evidence_id: 'ev-1',
            project_id: 'WRK-2024-001',
            verification_result: {
              verified: true,
              distance_to_project_meters: 42.5,
              signal_code: 'LOCATION_VERIFIED',
            },
          },
        ],
      }),
    };

    useAppStore.setState({ language: 'en' });
  });

  describe('Citizen Project Browsing Use Cases', () => {
    it('fetches list of projects with state filters', async () => {
      const useCase = new FetchProjectsUseCase(mockProjectRepo);
      const result = await useCase.execute({ state: 'Bihar', limit: 50 });

      expect(mockProjectRepo.getProjectsList).toHaveBeenCalledWith({ state: 'Bihar', limit: 50 });
      expect(result.projects.length).toBe(1);
      expect(result.projects[0].workId).toBe('WRK-2024-001');
      expect(result.projects[0].state).toBe('Bihar');
    });

    it('fetches detailed project record by workId', async () => {
      const useCase = new FetchProjectDetailsUseCase(mockProjectRepo);
      const result = await useCase.execute('WRK-2024-001');

      expect(mockProjectRepo.getProjectById).toHaveBeenCalledWith('WRK-2024-001');
      expect(result.workId).toBe('WRK-2024-001');
      expect(result.sanctionedAmountInr).toBe(2500000);
    });

    it('throws error when fetching project details with empty workId', async () => {
      const useCase = new FetchProjectDetailsUseCase(mockProjectRepo);
      await expect(useCase.execute('')).rejects.toThrow('Project Work ID is required.');
    });
  });

  describe('Citizen Evidence Submission & History Use Cases', () => {
    it('validates and submits citizen ground evidence', async () => {
      const useCase = new SubmitCitizenEvidenceUseCase(mockCitizenRepo);
      const evidencePayload: CitizenEvidenceEntity = {
        projectId: 'WRK-2024-001',
        latitude: 26.15,
        longitude: 87.52,
        isLiveCameraCapture: true,
        timestampCaptured: new Date().toISOString(),
      };

      const result = await useCase.execute(evidencePayload);

      expect(mockCitizenRepo.submitEvidence).toHaveBeenCalledWith(evidencePayload);
      expect(result.evidenceId).toBe('ev-1');
      expect(result.locationVerified).toBe(true);
      expect(result.distanceToProjectMeters).toBe(42.5);
    });

    it('rejects evidence submission with missing project ID', async () => {
      const useCase = new SubmitCitizenEvidenceUseCase(mockCitizenRepo);
      await expect(
        useCase.execute({
          projectId: '',
          latitude: 26.15,
          longitude: 87.52,
          isLiveCameraCapture: true,
          timestampCaptured: new Date().toISOString(),
        })
      ).rejects.toThrow('Project ID is required');
    });

    it('fetches submitted evidence history for citizen', async () => {
      const useCase = new FetchCitizenEvidenceHistoryUseCase(mockCitizenRepo);
      const result = await useCase.execute('WRK-2024-001');

      expect(mockCitizenRepo.getEvidenceHistory).toHaveBeenCalledWith('WRK-2024-001');
      expect(result.count).toBe(1);
      expect(result.evidence[0].evidence_id).toBe('ev-1');
    });
  });

  describe('Data Mapper Verification', () => {
    it('maps EvidenceVerificationResultDTO to Domain Entity accurately', () => {
      const dto: EvidenceVerificationResultDTO = {
        evidence_id: 'ev-99',
        project_id: 'WRK-2024-002',
        distance_to_project_meters: 65.4,
        location_verified: true,
        duplicate_detected: false,
        verification_status: 'LOCATION_VERIFIED',
      };

      const entity = DataMappers.mapEvidenceVerificationDTOToEntity(dto);

      expect(entity.evidenceId).toBe('ev-99');
      expect(entity.projectId).toBe('WRK-2024-002');
      expect(entity.distanceToProjectMeters).toBe(65.4);
      expect(entity.locationVerified).toBe(true);
      expect(entity.verificationStatus).toBe('LOCATION_VERIFIED');
    });
  });

  describe('Citizen Localization Parity', () => {
    it('contains all citizen keys in both English and Hindi dictionaries', () => {
      const enKeys = Object.keys(DICTIONARIES['en-IN'].citizen);
      const hiKeys = Object.keys(DICTIONARIES['hi-IN'].citizen);

      expect(enKeys).toEqual(hiKeys);
      expect(enKeys.length).toBeGreaterThan(15);
    });

    it('translates citizen strings dynamically according to selected language', () => {
      useAppStore.setState({ language: 'en' });
      expect(t('citizen.welcome')).toBe('Welcome, Citizen');
      expect(t('citizen.exploreProjects')).toBe('Explore Development Works');

      useAppStore.setState({ language: 'hi' });
      expect(t('citizen.welcome')).toBe('नागरिक पोर्टल में स्वागत है');
      expect(t('citizen.exploreProjects')).toBe('विकास कार्य अन्वेषण करें');
    });
  });

  describe('Role-Based Security & Permissions', () => {
    it('grants citizen appropriate permissions without granting officer privileges', () => {
      const citizenPerms = RolePermissions.CITIZEN;

      expect(hasPermission(citizenPerms, 'projects:read')).toBe(true);
      expect(hasPermission(citizenPerms, 'evidence:submit')).toBe(true);

      // Verify Citizen cannot execute administrative or officer actions
      expect(hasPermission(citizenPerms, 'inspections:update')).toBe(false);
      expect(hasPermission(citizenPerms, 'ledger:decision')).toBe(false);
      expect(hasPermission(citizenPerms, 'risk:audit')).toBe(false);
    });
  });
});
