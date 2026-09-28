import {
  FetchOfficerDashboardUseCase,
  FetchOfficerProjectsUseCase,
  ReviewCitizenEvidenceUseCase,
  UpdateOfficerInspectionUseCase,
} from '../src/domain/usecases';
import { IOfficerRepository } from '../src/domain/interfaces';
import {
  OfficerDashboardEntity,
  ProjectEntity,
  EvidenceReviewDecisionEntity,
  InspectionUpdateEntity,
} from '../src/domain/entities';
import { RolePermissions, hasPermission } from '../src/domain/entities/permissions';
import { t, DICTIONARIES } from '../src/i18n';
import { useAppStore } from '../src/store/appStore';

describe('Phase 7 — District Officer Application Domain & Operational Tests', () => {
  let mockOfficerRepo: jest.Mocked<IOfficerRepository>;

  const sampleOfficerDashboard: OfficerDashboardEntity = {
    officer: {
      id: 'usr-officer-001',
      fullName: 'District Planning Officer (Araria)',
      role: 'DISTRICT_OFFICER',
      jurisdictionState: 'Bihar',
      jurisdictionDistrict: 'Araria',
      inspectorId: 'insp-01',
    },
    metrics: {
      totalDistrictProjects: 45,
      inProgressCount: 28,
      completedCount: 14,
      highRiskCount: 3,
      pendingEvidenceCount: 2,
      slaBottlenecksCount: 4,
    },
    assignedRoute: {
      capacity_summary: { assigned_inspections: 5, total_capacity: 8 },
      scheduled_stops: [],
    },
    pendingEvidenceQueue: [
      {
        evidence_id: 'ev-1',
        project_id: 'WRK-2024-001',
        verification_result: { verified: true, distance_to_project_meters: 35.0 },
      },
    ],
  };

  const sampleProject: ProjectEntity = {
    id: 'WRK-2024-001',
    workId: 'WRK-2024-001',
    workTitle: 'Solar Drinking Water Installation',
    workCategory: 'Drinking Water Infrastructure',
    workDescription: 'Installation of 5 HP solar pumps.',
    mpName: 'Shri Pradeep Kumar Singh',
    idaOffice: 'District Planning Cell Araria',
    state: 'Bihar',
    constituency: 'Araria',
    sanctionedAmountInr: 2500000,
    disbursedAmountInr: 1800000,
    currentStage: 'IMPLEMENTATION_IN_PROGRESS',
    hasOfficialImages: true,
    source: 'data.gov.in / eSAKSHI',
    sourceType: 'OFFICIAL_PUBLIC',
  };

  beforeEach(() => {
    mockOfficerRepo = {
      getOfficerDashboard: jest.fn().mockResolvedValue(sampleOfficerDashboard),
      getOfficerProjects: jest.fn().mockResolvedValue({
        total: 1,
        limit: 50,
        offset: 0,
        jurisdiction: 'Araria, Bihar',
        projects: [sampleProject],
      }),
      reviewEvidence: jest.fn().mockResolvedValue({
        status: 'SUCCESS',
        evidenceId: 'ev-1',
        reviewStatus: 'ACCEPTED',
      }),
      updateInspection: jest.fn().mockResolvedValue({
        status: 'RECORDED',
        record: {
          work_id: 'WRK-2024-001',
          inspection_status: 'COMPLETED',
          observations: 'Site verified physically.',
          physical_progress_percent: 85,
        },
      }),
    };

    useAppStore.setState({ language: 'en' });
  });

  describe('Officer Dashboard & Scoped Projects Use Cases', () => {
    it('retrieves district-scoped operational dashboard metrics', async () => {
      const useCase = new FetchOfficerDashboardUseCase(mockOfficerRepo);
      const result = await useCase.execute();

      expect(mockOfficerRepo.getOfficerDashboard).toHaveBeenCalledTimes(1);
      expect(result.officer.jurisdictionDistrict).toBe('Araria');
      expect(result.metrics.totalDistrictProjects).toBe(45);
      expect(result.metrics.highRiskCount).toBe(3);
      expect(result.pendingEvidenceQueue.length).toBe(1);
    });

    it('retrieves projects strictly scoped to officer jurisdiction', async () => {
      const useCase = new FetchOfficerProjectsUseCase(mockOfficerRepo);
      const result = await useCase.execute({ search: 'Solar', limit: 20 });

      expect(mockOfficerRepo.getOfficerProjects).toHaveBeenCalledWith({ search: 'Solar', limit: 20 });
      expect(result.jurisdiction).toBe('Araria, Bihar');
      expect(result.projects[0].workId).toBe('WRK-2024-001');
    });
  });

  describe('Operational Evidence Review Use Cases', () => {
    it('submits statutory evidence review decision with remarks', async () => {
      const useCase = new ReviewCitizenEvidenceUseCase(mockOfficerRepo);
      const payload: EvidenceReviewDecisionEntity = {
        evidenceId: 'ev-1',
        decision: 'ACCEPTED',
        reviewNotes: 'Verified against physical inspection log.',
      };

      const result = await useCase.execute(payload);

      expect(mockOfficerRepo.reviewEvidence).toHaveBeenCalledWith(payload);
      expect(result.status).toBe('SUCCESS');
      expect(result.reviewStatus).toBe('ACCEPTED');
    });

    it('rejects evidence review when evidenceId is missing', async () => {
      const useCase = new ReviewCitizenEvidenceUseCase(mockOfficerRepo);
      await expect(
        useCase.execute({
          evidenceId: '',
          decision: 'ACCEPTED',
        })
      ).rejects.toThrow('Evidence ID is required');
    });
  });

  describe('Operational Inspection Update Use Cases', () => {
    it('records site inspection report successfully', async () => {
      const useCase = new UpdateOfficerInspectionUseCase(mockOfficerRepo);
      const payload: InspectionUpdateEntity = {
        workId: 'WRK-2024-001',
        inspectionStatus: 'COMPLETED',
        observations: 'Submersible pump operational, water distribution active.',
        physicalProgressPercent: 90,
      };

      const result = await useCase.execute(payload);

      expect(mockOfficerRepo.updateInspection).toHaveBeenCalledWith(payload);
      expect(result.status).toBe('RECORDED');
      expect(result.record.physical_progress_percent).toBe(85);
    });

    it('rejects inspection update when observations are missing', async () => {
      const useCase = new UpdateOfficerInspectionUseCase(mockOfficerRepo);
      await expect(
        useCase.execute({
          workId: 'WRK-2024-001',
          inspectionStatus: 'COMPLETED',
          observations: '',
        })
      ).rejects.toThrow('Inspection physical observations are required');
    });
  });

  describe('Officer Role-Based Security & Permissions', () => {
    it('verifies district officer has privileged operational permissions', () => {
      const perms = RolePermissions.DISTRICT_OFFICER;

      expect(hasPermission(perms, 'projects:read')).toBe(true);
      expect(hasPermission(perms, 'projects:write')).toBe(true);
      expect(hasPermission(perms, 'risk:audit')).toBe(true);
      expect(hasPermission(perms, 'evidence:review')).toBe(true);
      expect(hasPermission(perms, 'inspections:update')).toBe(true);
      expect(hasPermission(perms, 'sla:read')).toBe(true);
      expect(hasPermission(perms, 'ledger:decision')).toBe(true);
    });

    it('ensures non-officer roles are blocked from officer operations', () => {
      const citizenPerms = RolePermissions.CITIZEN;
      const contractorPerms = RolePermissions.CONTRACTOR;

      expect(hasPermission(citizenPerms, 'evidence:review')).toBe(false);
      expect(hasPermission(citizenPerms, 'inspections:update')).toBe(false);
      expect(hasPermission(citizenPerms, 'ledger:decision')).toBe(false);

      expect(hasPermission(contractorPerms, 'evidence:review')).toBe(false);
      expect(hasPermission(contractorPerms, 'inspections:update')).toBe(false);
    });
  });

  describe('Officer Bilingual Localization Parity', () => {
    it('verifies completeness parity between English and Hindi officer keys', () => {
      const enOfficer = Object.keys(DICTIONARIES['en-IN'].officer);
      const hiOfficer = Object.keys(DICTIONARIES['hi-IN'].officer);

      expect(enOfficer).toEqual(hiOfficer);
      expect(enOfficer.length).toBeGreaterThan(15);
    });

    it('translates officer strings dynamically based on selected locale', () => {
      useAppStore.setState({ language: 'en' });
      expect(t('officer.consoleTitle')).toBe('District Officer Operations Console');
      expect(t('officer.reviewEvidenceAction')).toBe('Review Citizen Ground Evidence');

      useAppStore.setState({ language: 'hi' });
      expect(t('officer.consoleTitle')).toBe('जिला अधिकारी संचालन कंसोल');
      expect(t('officer.reviewEvidenceAction')).toBe('नागरिक जमीनी साक्ष्य समीक्षा करें');
    });
  });
});
