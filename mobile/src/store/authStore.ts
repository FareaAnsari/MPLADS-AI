import { create } from 'zustand';
import { UserEntity, SessionEntity, UserRole, AuthStateStatus } from '../domain/entities';
import { RemoteAuthRepository } from '../data/repositories/RemoteAuthRepository';
import { queryClient } from '../config/queryClient';
import { logger } from '../utils/logger';

interface AuthState {
  status: AuthStateStatus;
  user: UserEntity | null;
  session: SessionEntity | null;
  lastActiveTimestamp: number;
  loginAsRole: (role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  restoreSession: () => Promise<void>;
  recordUserActivity: () => void;
  checkInactivityTimeout: () => boolean;
}

const authRepository = new RemoteAuthRepository();
const PRIVILEGED_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes for District Officers and MPs

export const useAuthStore = create<AuthState>((set, get) => ({
  status: 'RESTORING_SESSION',
  user: null,
  session: null,
  lastActiveTimestamp: Date.now(),

  loginAsRole: async (role: UserRole) => {
    try {
      const result = await authRepository.login({
        identifier: `test-${role.toLowerCase()}`,
        credential: 'dev_mock_credential',
        roleHint: role,
      });

      set({
        status: 'AUTHENTICATED',
        user: result.user,
        session: result.session,
        lastActiveTimestamp: Date.now(),
      });
      logger.info('useAuthStore', `Authenticated as role: ${role}`);
    } catch (error) {
      logger.error('useAuthStore', 'Login failed', error);
      set({ status: 'UNAUTHENTICATED', user: null, session: null });
    }
  },

  logout: async () => {
    logger.info('useAuthStore', 'Logging out user & purging private cache');
    await authRepository.logout();
    
    // Purge TanStack Query cache to prevent cross-role data leaks
    queryClient.clear();

    set({
      status: 'UNAUTHENTICATED',
      user: null,
      session: null,
      lastActiveTimestamp: Date.now(),
    });
  },

  restoreSession: async () => {
    set({ status: 'RESTORING_SESSION' });
    try {
      const result = await authRepository.restoreSession();
      if (result) {
        set({
          status: 'AUTHENTICATED',
          user: result.user,
          session: result.session,
          lastActiveTimestamp: Date.now(),
        });
        logger.info('useAuthStore', `Restored active session for user: ${result.user.name}`);
      } else {
        set({ status: 'UNAUTHENTICATED', user: null, session: null });
      }
    } catch (error) {
      logger.error('useAuthStore', 'Failed to restore session', error);
      set({ status: 'UNAUTHENTICATED', user: null, session: null });
    }
  },

  recordUserActivity: () => {
    set({ lastActiveTimestamp: Date.now() });
  },

  checkInactivityTimeout: () => {
    const { user, lastActiveTimestamp, status } = get();
    if (status !== 'AUTHENTICATED' || !user) return false;

    // Timeout applies strictly to privileged administrative roles
    if (user.role === 'DISTRICT_OFFICER' || user.role === 'MP_OFFICE') {
      const elapsed = Date.now() - lastActiveTimestamp;
      if (elapsed > PRIVILEGED_TIMEOUT_MS) {
        logger.warn('useAuthStore', `Inactivity timeout reached (${Math.round(elapsed / 1000)}s) - locking session`);
        set({ status: 'LOCKED' });
        return true;
      }
    }
    return false;
  },
}));
