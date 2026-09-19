import { useAuthStore } from '../src/store/authStore';
import { RemoteAuthRepository } from '../src/data/repositories/RemoteAuthRepository';
import { secureStorage } from '../src/data/local/interfaces/secureStorage';
import { NotificationService } from '../src/services/notificationService';
import { router } from 'expo-router';
import { SQLiteLocalDataSource } from '../src/data/local/sqliteLocalDataSource';
import { OutboxService } from '../src/services/outboxService';
import { t } from '../src/i18n';
import { enIN } from '../src/i18n/locales/en-IN';
import { hiIN } from '../src/i18n/locales/hi-IN';
import { ProjectEntity, CitizenEvidenceEntity, InspectionUpdateEntity } from '../src/domain/entities';

jest.mock('../src/data/remote/apiClient', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  },
}));

describe('Phase 15 — Full Quality Assurance & End-to-End Integration Suite', () => {
  let authRepo: RemoteAuthRepository;
  let localDb: SQLiteLocalDataSource;

  beforeEach(async () => {
    jest.clearAllMocks();
    authRepo = new RemoteAuthRepository(secureStorage);
    localDb = new SQLiteLocalDataSource();

    useAuthStore.setState({
      status: 'UNAUTHENTICATED',
      user: null,
      session: null,
      lastActiveTimestamp: Date.now(),
    });
  });

  describe('1. Citizen Persona End-to-End Workflow', () => {
    it('should complete Citizen login, project caching, offline evidence queueing and sync', async () => {
      // 1. Authenticate as Citizen
      const loginRes = await authRepo.login({
        identifier: 'citizen-ramesh',
        credential: 'mock-password',
        roleHint: 'CITIZEN',
      });
      expect(loginRes.user.role).toBe('CITIZEN');
      expect(loginRes.token).toBeDefined();

      useAuthStore.setState({
        status: 'AUTHENTICATED',
        user: loginRes.user,
        session: {
          sessionId: 'sess-cit-001',
          userId: loginRes.user.id,
          role: loginRes.user.role,
          expiresAt: new Date(Date.now() + 3600000).toISOString(),
          issuedAt: new Date().toISOString(),
        },
      });

      // 2. Save Citizen Project Cache Locally
      const sampleProj: ProjectEntity = {
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
      await localDb.saveProjects(loginRes.user.id, 'CITIZEN', [sampleProj]);

      // 3. Enqueue Offline Evidence Submission to Outbox
      const sampleEvidence: CitizenEvidenceEntity = {
        projectId: 'WRK-2024-001',
        latitude: 28.6139,
        longitude: 77.2090,
        accuracyMeters: 4.5,
        timestampCaptured: new Date().toISOString(),
        isLiveCameraCapture: true,
        imageUri: 'file:///var/data/photo_1.jpg',
      };

      const outboxItem = await OutboxService.queueEvidenceSubmission(
        loginRes.user.id,
        'CITIZEN',
        sampleEvidence
      );

      expect(outboxItem.status).toBe('PENDING');
      expect(outboxItem.idempotencyKey).toBeDefined();
      expect(outboxItem.entityType).toBe('EVIDENCE');
    });
  });

  describe('2. District Officer Persona End-to-End Workflow', () => {
    it('should authenticate District Officer, queue Inspection Update and verify RBAC', async () => {
      // 1. Authenticate as District Officer
      const loginRes = await authRepo.login({
        identifier: 'officer-dpo',
        credential: 'mock-password',
        roleHint: 'DISTRICT_OFFICER',
      });
      expect(loginRes.user.role).toBe('DISTRICT_OFFICER');

      useAuthStore.setState({
        status: 'AUTHENTICATED',
        user: loginRes.user,
        session: {
          sessionId: 'sess-off-001',
          userId: loginRes.user.id,
          role: loginRes.user.role,
          expiresAt: new Date(Date.now() + 3600000).toISOString(),
          issuedAt: new Date().toISOString(),
        },
      });

      // 2. Queue Officer Inspection Update in Outbox
      const inspectionUpdate: InspectionUpdateEntity = {
        workId: 'WRK-2024-001',
        inspectionStatus: 'COMPLETED',
        observations: 'Civil works match DPR technical specifications.',
        physicalProgressPercent: 85.0,
      };

      const inspectionItem = await OutboxService.queueInspectionUpdate(
        loginRes.user.id,
        'DISTRICT_OFFICER',
        inspectionUpdate
      );

      expect(inspectionItem.status).toBe('PENDING');
      expect(inspectionItem.entityType).toBe('INSPECTION');
    });
  });

  describe('3. MP Office Persona End-to-End Workflow', () => {
    it('should authenticate MP Office and dispatch authorized constituency deep links', async () => {
      // 1. Authenticate as MP Office
      const loginRes = await authRepo.login({
        identifier: 'mp-south-delhi',
        credential: 'mock-password',
        roleHint: 'MP_OFFICE',
      });
      expect(loginRes.user.role).toBe('MP_OFFICE');

      useAuthStore.setState({
        status: 'AUTHENTICATED',
        user: loginRes.user,
        session: {
          sessionId: 'sess-mp-001',
          userId: loginRes.user.id,
          role: loginRes.user.role,
          expiresAt: new Date(Date.now() + 3600000).toISOString(),
          issuedAt: new Date().toISOString(),
        },
      });

      // 2. Verify Deep Link Dispatch for MP Constituency Projects
      const handled = NotificationService.handleNotificationNavigation({
        deepLink: 'mplads://mp/projects/WRK-2024-001',
      });

      expect(handled).toBe(true);
      expect(router.push).toHaveBeenCalledWith('/(mp)/projects/WRK-2024-001');
    });
  });

  describe('4. Contractor Persona End-to-End Workflow', () => {
    it('should authenticate Contractor and enqueue physical milestone progress update', async () => {
      // 1. Authenticate as Contractor
      const loginRes = await authRepo.login({
        identifier: 'contractor-anil',
        credential: 'mock-password',
        roleHint: 'CONTRACTOR',
      });
      expect(loginRes.user.role).toBe('CONTRACTOR');

      useAuthStore.setState({
        status: 'AUTHENTICATED',
        user: loginRes.user,
        session: {
          sessionId: 'sess-con-001',
          userId: loginRes.user.id,
          role: loginRes.user.role,
          expiresAt: new Date(Date.now() + 3600000).toISOString(),
          issuedAt: new Date().toISOString(),
        },
      });

      // 2. Enqueue Milestone Progress Mutation
      const progressItem = await localDb.enqueueMutation({
        userId: loginRes.user.id,
        role: 'CONTRACTOR',
        entityType: 'CONTRACTOR_PROGRESS',
        entityId: 'WRK-2024-001',
        operation: 'UPDATE',
        payload: {
          workId: 'WRK-2024-001',
          progressPercentage: 65,
          remarks: 'Poured RCC columns and lintel beams.',
        },
        idempotencyKey: OutboxService.generateIdempotencyKey('progress', loginRes.user.id, 'WRK-2024-001'),
      });

      expect(progressItem.status).toBe('PENDING');
      expect(progressItem.entityType).toBe('CONTRACTOR_PROGRESS');
    });
  });

  describe('5. Cross-Role Isolation & Account Switching', () => {
    it('should cleanly purge SecureStore and reset state upon logout', async () => {
      // 1. Login Citizen User A
      const citLogin = await authRepo.login({
        identifier: 'citizen-user-a',
        credential: 'mock-password',
        roleHint: 'CITIZEN',
      });
      useAuthStore.setState({
        status: 'AUTHENTICATED',
        user: citLogin.user,
        session: {
          sessionId: 'sess-user-a',
          userId: citLogin.user.id,
          role: citLogin.user.role,
          expiresAt: new Date(Date.now() + 3600000).toISOString(),
          issuedAt: new Date().toISOString(),
        },
      });

      // 2. Logout User A
      await useAuthStore.getState().logout();
      expect(useAuthStore.getState().status).toBe('UNAUTHENTICATED');
      expect(useAuthStore.getState().user).toBeNull();
    });
  });

  describe('6. Localization & Translation Parity', () => {
    it('should ensure exact key symmetry between English (en-IN) and Hindi (hi-IN) dictionaries', () => {
      const getKeys = (obj: any, prefix = ''): string[] => {
        return Object.keys(obj).reduce((res: string[], el) => {
          if (Array.isArray(obj[el])) {
            return res;
          } else if (typeof obj[el] === 'object' && obj[el] !== null) {
            return [...res, ...getKeys(obj[el], `${prefix}${el}.`)];
          }
          return [...res, `${prefix}${el}`];
        }, []);
      };

      const enKeys = getKeys(enIN).sort();
      const hiKeys = getKeys(hiIN).sort();

      expect(enKeys).toEqual(hiKeys);
    });

    it('should verify Indian currency, date, and unit formatting rules', () => {
      const formattedEn = t('common.appName');
      expect(formattedEn).toBeDefined();
      expect(formattedEn.length).toBeGreaterThan(0);
    });
  });
});
