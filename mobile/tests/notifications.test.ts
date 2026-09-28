import { DataMappers } from '../src/data/remote/mappers';
import { RemoteNotificationRepository } from '../src/data/repositories/RemoteNotificationRepository';
import { apiClient } from '../src/data/remote/apiClient';
import { NotificationService } from '../src/services/notificationService';
import { useAuthStore } from '../src/store/authStore';
import { router } from 'expo-router';
import { enIN, hiIN } from '../src/i18n';

jest.mock('../src/data/remote/apiClient');
jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  },
}));

describe('Phase 11 — Notifications & Deep-Link Security', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAuthStore.setState({
      status: 'UNAUTHENTICATED',
      user: null,
      session: null,
      lastActiveTimestamp: Date.now(),
    });
  });

  describe('1. Data Mappers', () => {
    it('should map NotificationDTO to NotificationEntity correctly', () => {
      const dto = {
        id: 'notif-101',
        user_id: 'usr-cit-1',
        role: 'CITIZEN',
        type: 'EVIDENCE_REVIEW_UPDATE',
        category: 'EVIDENCE',
        title: 'Evidence Approved',
        body: 'Your solar lights evidence was verified.',
        entity_type: 'evidence',
        entity_id: 'ev-001',
        deep_link: 'mplads://citizen/evidence/ev-001',
        read_at: null,
        created_at: '2026-09-19T10:00:00Z',
      };

      const entity = DataMappers.mapNotificationDTOToEntity(dto);

      expect(entity.id).toBe('notif-101');
      expect(entity.userId).toBe('usr-cit-1');
      expect(entity.role).toBe('CITIZEN');
      expect(entity.type).toBe('EVIDENCE_REVIEW_UPDATE');
      expect(entity.category).toBe('EVIDENCE');
      expect(entity.title).toBe('Evidence Approved');
      expect(entity.entityType).toBe('evidence');
      expect(entity.entityId).toBe('ev-001');
      expect(entity.deepLink).toBe('mplads://citizen/evidence/ev-001');
      expect(entity.readAt).toBeNull();
      expect(entity.createdAt).toBe('2026-09-19T10:00:00Z');
    });

    it('should map NotificationPreferencesDTO to NotificationPreferencesEntity', () => {
      const dto = {
        push_enabled: true,
        evidence_updates: true,
        risk_alerts: false,
        sla_alerts: true,
        inspection_updates: false,
        project_milestones: true,
        updated_at: '2026-09-19T11:00:00Z',
      };

      const entity = DataMappers.mapNotificationPreferencesDTOToEntity(dto);

      expect(entity.pushEnabled).toBe(true);
      expect(entity.evidenceUpdates).toBe(true);
      expect(entity.riskAlerts).toBe(false);
      expect(entity.slaAlerts).toBe(true);
      expect(entity.inspectionUpdates).toBe(false);
      expect(entity.projectMilestones).toBe(true);
      expect(entity.updatedAt).toBe('2026-09-19T11:00:00Z');
    });
  });

  describe('2. RemoteNotificationRepository', () => {
    const repo = new RemoteNotificationRepository();

    it('should fetch notifications list and filter by category if provided', async () => {
      const mockRawNotifications = [
        {
          id: 'n-1',
          user_id: 'usr-1',
          role: 'DISTRICT_OFFICER',
          type: 'HIGH_RISK_ALERT',
          category: 'RISK',
          title: 'High Risk Alert',
          body: 'Anomaly detected.',
          created_at: '2026-09-19T12:00:00Z',
        },
      ];

      (apiClient.get as jest.Mock).mockResolvedValueOnce(mockRawNotifications);

      const result = await repo.getNotifications('RISK');

      expect(apiClient.get).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/notifications'),
        { params: { category: 'RISK' } }
      );
      expect(result).toHaveLength(1);
      expect(result[0].category).toBe('RISK');
    });

    it('should fetch unread count', async () => {
      (apiClient.get as jest.Mock).mockResolvedValueOnce({ unread_count: 5 });

      const count = await repo.getUnreadCount();

      expect(apiClient.get).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/notifications/unread-count')
      );
      expect(count).toBe(5);
    });

    it('should mark notification as read', async () => {
      const mockUpdated = {
        id: 'n-1',
        user_id: 'usr-1',
        role: 'CITIZEN',
        type: 'PROJECT_STAGE_UPDATE',
        category: 'PROJECT',
        title: 'Stage Update',
        body: 'Stage 3 reached.',
        read_at: '2026-09-19T12:30:00Z',
        created_at: '2026-09-19T12:00:00Z',
      };

      (apiClient.post as jest.Mock).mockResolvedValueOnce(mockUpdated);

      const result = await repo.markAsRead('n-1');

      expect(apiClient.post).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/notifications/n-1/read')
      );
      expect(result.readAt).toBe('2026-09-19T12:30:00Z');
    });

    it('should register device push token', async () => {
      (apiClient.post as jest.Mock).mockResolvedValueOnce({
        status: 'REGISTERED',
        device_id: 'dev-123',
      });

      const res = await repo.registerDevice({
        pushToken: 'ExponentPushToken[abc]',
        deviceId: 'dev-123',
        platform: 'ios',
        appVersion: '1.0.0',
      });

      expect(apiClient.post).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/notifications/devices'),
        {
          push_token: 'ExponentPushToken[abc]',
          device_id: 'dev-123',
          platform: 'ios',
          app_version: '1.0.0',
        }
      );
      expect(res.status).toBe('REGISTERED');
    });

    it('should unregister device on logout', async () => {
      (apiClient.delete as jest.Mock).mockResolvedValueOnce({
        status: 'UNREGISTERED',
        device_id: 'dev-123',
      });

      const res = await repo.unregisterDevice('dev-123');

      expect(apiClient.delete).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/notifications/devices/dev-123')
      );
      expect(res.status).toBe('UNREGISTERED');
    });
  });

  describe('3. Notification Router & RBAC Security Guard', () => {
    it('should redirect unauthenticated users to login when notification is tapped', () => {
      useAuthStore.setState({ status: 'UNAUTHENTICATED', user: null });

      const handled = NotificationService.handleNotificationNavigation({
        deepLink: 'mplads://citizen/projects/MPLADS-001',
      });

      expect(handled).toBe(false);
      expect(router.push).toHaveBeenCalledWith('/(auth)');
    });

    it('should allow Citizen to navigate to citizen project deep links', () => {
      useAuthStore.setState({
        status: 'AUTHENTICATED',
        user: {
          id: 'cit-1',
          name: 'Citizen Ramesh',
          role: 'CITIZEN',
          permissions: [],
        },
      });

      const handled = NotificationService.handleNotificationNavigation({
        deepLink: 'mplads://citizen/projects/MPLADS-001',
      });

      expect(handled).toBe(true);
      expect(router.push).toHaveBeenCalledWith('/(citizen)/projects/MPLADS-001');
    });

    it('should STRICTLY BLOCK Citizen from accessing privileged Officer Risk deep link', () => {
      useAuthStore.setState({
        status: 'AUTHENTICATED',
        user: {
          id: 'cit-1',
          name: 'Citizen Ramesh',
          role: 'CITIZEN',
          permissions: [],
        },
      });

      // Citizen receives or clicks privileged officer route
      const handled = NotificationService.handleNotificationNavigation({
        deepLink: 'mplads://officer/risk/MPLADS-001',
      });

      // Security block: redirect safely away from privileged officer route to notifications
      expect(handled).toBe(false);
      expect(router.push).toHaveBeenCalledWith('/notifications');
      expect(router.push).not.toHaveBeenCalledWith('/(officer)/risk/MPLADS-001');
    });

    it('should allow District Officer to navigate to Officer Risk screen', () => {
      useAuthStore.setState({
        status: 'AUTHENTICATED',
        user: {
          id: 'off-1',
          name: 'Officer Sharma',
          role: 'DISTRICT_OFFICER',
          permissions: [],
        },
      });

      const handled = NotificationService.handleNotificationNavigation({
        deepLink: 'mplads://officer/risk/MPLADS-001',
      });

      expect(handled).toBe(true);
      expect(router.push).toHaveBeenCalledWith('/(officer)/risk/MPLADS-001');
    });

    it('should dispatch entity-based routing safely for Evidence', () => {
      useAuthStore.setState({
        status: 'AUTHENTICATED',
        user: {
          id: 'off-1',
          name: 'Officer Sharma',
          role: 'DISTRICT_OFFICER',
          permissions: [],
        },
      });

      const handled = NotificationService.handleNotificationNavigation({
        entityType: 'evidence',
        entityId: 'ev-001',
      });

      expect(handled).toBe(true);
      expect(router.push).toHaveBeenCalledWith('/(officer)/evidence-review');
    });
  });

  describe('4. Localization & Accessibility Coverage', () => {
    it('should have all notifications keys defined in en-IN and hi-IN', () => {
      expect(enIN.notifications.title).toBe('Notifications');
      expect(hiIN.notifications.title).toBe('सूचनाएं (Notifications)');
      expect(enIN.notifications.categoryEvidence).toBe('Evidence');
      expect(hiIN.notifications.categoryEvidence).toBe('साक्ष्य (Evidence)');
      expect(enIN.notificationPreferences.title).toBe('Notification Preferences');
      expect(hiIN.notificationPreferences.title).toBe('सूचना प्राथमिकताएं');
      expect(enIN.notificationPermissions.bannerExplanation).toBeTruthy();
      expect(hiIN.notificationPermissions.bannerExplanation).toBeTruthy();
    });
  });
});
