import { useAuthStore } from '../src/store/authStore';
import { RemoteAuthRepository } from '../src/data/repositories/RemoteAuthRepository';
import { secureStorage } from '../src/data/local/interfaces/secureStorage';
import { NotificationService } from '../src/services/notificationService';
import { router } from 'expo-router';
import { Config } from '../src/config/environment';
import { CREATE_SCHEMA_V1_SQL } from '../src/data/local/database/schema';

jest.mock('../src/data/remote/apiClient');
jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  },
}));

describe('Phase 14 — Mobile Security Hardening & Isolation Suite', () => {
  let authRepo: RemoteAuthRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    authRepo = new RemoteAuthRepository(secureStorage);
    useAuthStore.setState({
      status: 'UNAUTHENTICATED',
      user: null,
      session: null,
      lastActiveTimestamp: Date.now(),
    });
  });

  describe('1. Secure Storage vs Local Database Security', () => {
    it('should store JWT tokens exclusively in SecureStore and never in plain text', async () => {
      const result = await authRepo.login({
        identifier: 'test-citizen',
        credential: 'dev_mock_credential',
        roleHint: 'CITIZEN',
      });

      expect(result.token).toBeDefined();
      const storedToken = await secureStorage.getItem('mplads_auth_token');
      expect(storedToken).toBe(result.token);
    });

    it('should verify SQLite schema contains zero token or password columns', () => {
      const schemaSql = CREATE_SCHEMA_V1_SQL.toLowerCase();

      expect(schemaSql).not.toContain('access_token');
      expect(schemaSql).not.toContain('refresh_token');
      expect(schemaSql).not.toContain('password_hash');
      expect(schemaSql).not.toContain('jwt_secret');
      expect(schemaSql).not.toContain('signing_key');
    });
  });

  describe('2. Account Switching & Cache Purge on Logout', () => {
    it('should purge SecureStore and reset auth state on logout', async () => {
      // 1. Login as Citizen
      await authRepo.login({
        identifier: 'test-citizen',
        credential: 'dev_mock_credential',
        roleHint: 'CITIZEN',
      });

      expect(await secureStorage.getItem('mplads_auth_token')).toBeTruthy();

      // 2. Logout
      await useAuthStore.getState().logout();

      // 3. Verify SecureStore is purged
      expect(await secureStorage.getItem('mplads_auth_token')).toBeNull();
      expect(await secureStorage.getItem('mplads_session_meta')).toBeNull();
      expect(await secureStorage.getItem('mplads_user_meta')).toBeNull();

      // 4. Verify auth store state reset
      expect(useAuthStore.getState().status).toBe('UNAUTHENTICATED');
      expect(useAuthStore.getState().user).toBeNull();
    });
  });

  describe('3. Deep-Link RBAC & Privilege Escalation Guards', () => {
    it('should reject unauthenticated deep link attempts and route to login', () => {
      useAuthStore.setState({
        status: 'UNAUTHENTICATED',
        user: null,
      });

      const handled = NotificationService.handleNotificationNavigation({
        entityType: 'PROJECT',
        entityId: 'PRJ-1',
      });
      expect(handled).toBe(false);
      expect(router.push).toHaveBeenCalledWith('/(auth)');
    });

    it('should BLOCK Citizen from opening privileged District Officer deep links', () => {
      useAuthStore.setState({
        status: 'AUTHENTICATED',
        user: {
          id: 'usr-cit-001',
          name: 'Citizen Ramesh',
          role: 'CITIZEN',
          permissions: [],
        },
      });

      const handled = NotificationService.handleNotificationNavigation({
        deepLink: 'mplads://officer/risk/WRK-2024-001',
      });

      expect(handled).toBe(false);
      expect(router.push).toHaveBeenCalledWith('/notifications');
      expect(router.push).not.toHaveBeenCalledWith('/(officer)/risk/WRK-2024-001');
    });

    it('should BLOCK Contractor from opening MP Office deep links', () => {
      useAuthStore.setState({
        status: 'AUTHENTICATED',
        user: {
          id: 'usr-con-001',
          name: 'Contractor Anil',
          role: 'CONTRACTOR',
          permissions: [],
        },
      });

      const handled = NotificationService.handleNotificationNavigation({
        deepLink: 'mplads://mp/projects/WRK-2024-001',
      });

      expect(handled).toBe(false);
      expect(router.push).toHaveBeenCalledWith('/notifications');
      expect(router.push).not.toHaveBeenCalledWith('/(mp)/projects/WRK-2024-001');
    });
  });

  describe('4. Privileged Inactivity Session Timeout', () => {
    it('should lock session after 15 minutes of inactivity for District Officer', () => {
      const sixteenMinutesAgo = Date.now() - 16 * 60 * 1000;

      useAuthStore.setState({
        status: 'AUTHENTICATED',
        user: {
          id: 'usr-off-001',
          name: 'District Planning Officer',
          role: 'DISTRICT_OFFICER',
          permissions: [],
        },
        lastActiveTimestamp: sixteenMinutesAgo,
      });

      const isTimedOut = useAuthStore.getState().checkInactivityTimeout();

      expect(isTimedOut).toBe(true);
      expect(useAuthStore.getState().status).toBe('LOCKED');
    });

    it('should NOT lock active citizen sessions on 15 minute timer', () => {
      const sixteenMinutesAgo = Date.now() - 16 * 60 * 1000;

      useAuthStore.setState({
        status: 'AUTHENTICATED',
        user: {
          id: 'usr-cit-001',
          name: 'Citizen User',
          role: 'CITIZEN',
          permissions: [],
        },
        lastActiveTimestamp: sixteenMinutesAgo,
      });

      const isTimedOut = useAuthStore.getState().checkInactivityTimeout();

      expect(isTimedOut).toBe(false);
      expect(useAuthStore.getState().status).toBe('AUTHENTICATED');
    });
  });

  describe('5. Production Environment Fail-Closed Verification', () => {
    it('should throw an error and fail closed if synthetic dev login is attempted in production', async () => {
      const originalEnv = Config.environment;
      try {
        (Config as any).environment = 'production';

        await expect(
          authRepo.login({
            identifier: 'test-officer',
            credential: 'dev_mock_credential',
            roleHint: 'DISTRICT_OFFICER',
          })
        ).rejects.toThrow('Production authentication backend endpoint is not yet configured.');
      } finally {
        (Config as any).environment = originalEnv;
      }
    });
  });
});
