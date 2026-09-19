import * as SQLite from 'expo-sqlite';
import { SQLiteDatabaseManager } from '../src/data/local/database/sqliteDatabase';
import { SQLiteLocalDataSource } from '../src/data/local/sqliteLocalDataSource';
import { OutboxService } from '../src/services/outboxService';
import { SyncEngine } from '../src/services/syncEngine';
import { apiClient } from '../src/data/remote/apiClient';
import { useAuthStore } from '../src/store/authStore';
import { useAppStore } from '../src/store/appStore';
import {
  ProjectEntity,
  RiskAssessmentEntity,
  CitizenEvidenceEntity,
  OutboxItemEntity,
} from '../src/domain/entities';
import { t, DICTIONARIES } from '../src/i18n';
import NetInfo from '@react-native-community/netinfo';

jest.mock('../src/data/remote/apiClient', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('Phase 10 — Offline Database, Outbox & Synchronization Tests', () => {
  let localDataSource: SQLiteLocalDataSource;
  let mockDb: any;

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

  const sampleEvidence: CitizenEvidenceEntity = {
    projectId: 'WRK-2024-001',
    latitude: 25.0961,
    longitude: 85.3131,
    accuracyMeters: 12.0,
    timestampCaptured: '2026-09-19T14:00:00Z',
    isLiveCameraCapture: true,
    imageUri: 'file:///var/data/photo_1.jpg',
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    SQLiteDatabaseManager.resetInstance();
    mockDb = await SQLite.openDatabaseAsync('test.db');
    localDataSource = new SQLiteLocalDataSource();

    useAuthStore.setState({
      status: 'AUTHENTICATED',
      user: {
        id: 'usr-cit-001',
        name: 'Test Citizen',
        role: 'CITIZEN',
        permissions: ['projects:read', 'evidence:submit'],
      },
    });

    useAppStore.setState({ language: 'en' });
  });

  describe('SQLite Database & Local Project Caching', () => {
    it('initializes database and runs schema v1 migrations', async () => {
      mockDb.getFirstAsync.mockResolvedValueOnce(null); // First time migration
      const db = await SQLiteDatabaseManager.getDatabase();

      expect(db).toBeDefined();
      expect(mockDb.execAsync).toHaveBeenCalled();
      expect(mockDb.runAsync).toHaveBeenCalledWith(
        'INSERT INTO schema_version (version, applied_at) VALUES (?, ?)',
        expect.any(Array)
      );
    });

    it('saves and reads cached projects scoped by userId and role', async () => {
      mockDb.getAllAsync.mockResolvedValueOnce([
        {
          id: 'WRK-2024-001',
          work_id: 'WRK-2024-001',
          work_title: 'Solar Drinking Water Installation',
          work_category: 'Drinking Water Infrastructure',
          state: 'Bihar',
          sanctioned_amount_inr: 2500000,
          disbursed_amount_inr: 1800000,
          current_stage: 'IMPLEMENTATION_IN_PROGRESS',
          has_official_images: 1,
          source: 'data.gov.in / eSAKSHI',
          source_type: 'OFFICIAL_PUBLIC',
        },
      ]);

      await localDataSource.saveProjects('usr-cit-001', 'CITIZEN', [sampleProject]);
      expect(mockDb.runAsync).toHaveBeenCalled();

      const cached = await localDataSource.getCachedProjects('usr-cit-001', 'CITIZEN', 50, 0);
      expect(cached.length).toBe(1);
      expect(cached[0].workId).toBe('WRK-2024-001');
    });

    it('clears all user-scoped cached data on logout', async () => {
      await SQLiteDatabaseManager.clearUserCache('usr-cit-001');

      expect(mockDb.runAsync).toHaveBeenCalledWith(
        'DELETE FROM projects WHERE user_id = ?',
        ['usr-cit-001']
      );
      expect(mockDb.runAsync).toHaveBeenCalledWith(
        'DELETE FROM risk_assessments WHERE user_id = ?',
        ['usr-cit-001']
      );
      expect(mockDb.runAsync).toHaveBeenCalledWith(
        'DELETE FROM evidence_records WHERE user_id = ?',
        ['usr-cit-001']
      );
    });
  });

  describe('Outbox Service & Idempotency Queue', () => {
    it('generates a stable unique idempotency key with entity and user context', () => {
      const key1 = OutboxService.generateIdempotencyKey('evidence', 'usr-1', 'WRK-001');
      const key2 = OutboxService.generateIdempotencyKey('evidence', 'usr-1', 'WRK-001');

      expect(key1).toContain('evidence-usr-1-WRK-001');
      expect(key1.length).toBeGreaterThan(20);
      expect(key1).not.toBe(key2); // Random suffix ensures distinct attempts have unique seeds if re-created
    });

    it('calculates bounded exponential backoff delays', () => {
      expect(OutboxService.getBackoffDelayMs(0)).toBe(1000);
      expect(OutboxService.getBackoffDelayMs(1)).toBe(2000);
      expect(OutboxService.getBackoffDelayMs(2)).toBe(4000);
      expect(OutboxService.getBackoffDelayMs(6)).toBe(60000); // Capped at max 60s
      expect(OutboxService.getBackoffDelayMs(10)).toBe(60000);
    });

    it('enqueues offline evidence mutation with PENDING status', async () => {
      mockDb.runAsync.mockResolvedValueOnce({ changes: 1 });

      const item = await OutboxService.queueEvidenceSubmission('usr-cit-001', 'CITIZEN', sampleEvidence);

      expect(item.status).toBe('PENDING');
      expect(item.entityType).toBe('EVIDENCE');
      expect(item.payload.projectId).toBe('WRK-2024-001');
      expect(item.idempotencyKey).toBeDefined();
    });
  });

  describe('Synchronization Engine & Error Handling', () => {
    it('processes pending outbox items sequentially when online', async () => {
      const mockOutboxItem: OutboxItemEntity = {
        id: 'outbox-1',
        userId: 'usr-cit-001',
        role: 'CITIZEN',
        entityType: 'EVIDENCE',
        entityId: 'WRK-2024-001',
        operation: 'CREATE',
        payload: sampleEvidence,
        status: 'PENDING',
        attemptCount: 0,
        idempotencyKey: 'idemp-1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      mockDb.getAllAsync.mockResolvedValueOnce([
        {
          id: mockOutboxItem.id,
          user_id: mockOutboxItem.userId,
          role: mockOutboxItem.role,
          entity_type: mockOutboxItem.entityType,
          entity_id: mockOutboxItem.entityId,
          operation: mockOutboxItem.operation,
          payload_json: JSON.stringify(mockOutboxItem.payload),
          status: 'PENDING',
          attempt_count: 0,
          idempotency_key: 'idemp-1',
          created_at: mockOutboxItem.createdAt,
          updated_at: mockOutboxItem.updatedAt,
        },
      ]);

      (apiClient.post as jest.Mock).mockResolvedValueOnce({
        data: {
          status: 'RECORDED',
          evidence_id: 'ev-101',
          project_id: 'WRK-2024-001',
          distance_to_project_meters: 25.0,
          location_verified: true,
          verification_status: 'VERIFIED_COGNIZANT',
        },
      });

      const result = await SyncEngine.sync();

      expect(result.processed).toBe(1);
      expect(result.succeeded).toBe(1);
      expect(result.failed).toBe(0);
      expect(apiClient.post).toHaveBeenCalled();
    });

    it('marks permanent failure without infinite retry on 403 Forbidden', async () => {
      mockDb.getAllAsync.mockResolvedValueOnce([
        {
          id: 'outbox-forbidden',
          user_id: 'usr-cit-001',
          role: 'CITIZEN',
          entity_type: 'EVIDENCE',
          entity_id: 'WRK-2024-001',
          operation: 'CREATE',
          payload_json: JSON.stringify(sampleEvidence),
          status: 'PENDING',
          attempt_count: 0,
          idempotency_key: 'idemp-forbidden',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]);

      const error403 = new Error('Forbidden');
      (error403 as any).response = { status: 403 };
      (apiClient.post as jest.Mock).mockRejectedValueOnce(error403);

      const result = await SyncEngine.sync();

      expect(result.processed).toBe(1);
      expect(result.succeeded).toBe(0);
      expect(result.failed).toBe(1);
    });

    it('aborts sync when device is offline', async () => {
      (NetInfo.fetch as jest.Mock).mockResolvedValueOnce({ isConnected: false });

      const result = await SyncEngine.sync();
      expect(result.processed).toBe(0);
      expect(apiClient.post).not.toHaveBeenCalled();
    });
  });

  describe('Localization Parity for Offline & Synchronization', () => {
    it('provides all offline dictionary keys in English and Hindi', () => {
      const enOffline = DICTIONARIES['en-IN'].offline;
      const hiOffline = DICTIONARIES['hi-IN'].offline;

      expect(enOffline).toBeDefined();
      expect(hiOffline).toBeDefined();

      const keys = Object.keys(enOffline) as (keyof typeof enOffline)[];
      keys.forEach((key) => {
        expect(hiOffline[key]).toBeDefined();
        expect(typeof hiOffline[key]).toBe('string');
        expect((hiOffline[key] as string).trim().length).toBeGreaterThan(0);
      });
    });

    it('translates offline and sync notices accurately in Hindi', () => {
      useAppStore.setState({ language: 'hi' });
      expect(t('offline.offlineMode')).toBe('ऑफ़लाइन मोड');
      expect(t('offline.syncNow')).toBe('अभी सिंक करें');
      expect(t('offline.savedLocallyNotice')).toContain('डिवाइस पर सुरक्षित सहेजा गया');
      expect(t('offline.staleDataNotice')).toContain('सहेजा गया ऑफ़लाइन डेटा');
    });
  });
});
