import { IAuthRepository, LoginCredentials, AuthResult } from '../../domain/interfaces';
import { UserEntity, SessionEntity, UserRole, RolePermissions } from '../../domain/entities';
import { ISecureStorage, secureStorage } from '../local/interfaces/secureStorage';
import { Config } from '../../config/environment';
import { logger } from '../../utils/logger';

const SECURE_TOKEN_KEY = 'pratyaksh_auth_token';
const SECURE_REFRESH_KEY = 'pratyaksh_refresh_token';
const SECURE_SESSION_KEY = 'pratyaksh_session_meta';
const SECURE_USER_KEY = 'pratyaksh_user_meta';

// Pre-defined synthetic identities strictly for Development Mode
const DEV_SYNTHETIC_IDENTITIES: Record<UserRole, UserEntity> = {
  CITIZEN: {
    id: 'usr-cit-001',
    name: 'Dev Test Citizen',
    role: 'CITIZEN',
    permissions: RolePermissions.CITIZEN,
    jurisdictionState: 'Bihar',
    jurisdictionDistrict: 'Araria',
  },
  DISTRICT_OFFICER: {
    id: 'usr-off-001',
    name: 'District Planning Officer (Araria)',
    role: 'DISTRICT_OFFICER',
    permissions: RolePermissions.DISTRICT_OFFICER,
    jurisdictionState: 'Bihar',
    jurisdictionDistrict: 'Araria',
    inspectorId: 'insp-01',
  },
  MP_OFFICE: {
    id: 'usr-mp-001',
    name: 'Hon. Member of Parliament Office',
    role: 'MP_OFFICE',
    permissions: RolePermissions.MP_OFFICE,
    jurisdictionState: 'Bihar',
    constituency: 'Araria',
  },
  CONTRACTOR: {
    id: 'usr-ctr-001',
    name: 'Dev Test Registered Contractor',
    role: 'CONTRACTOR',
    permissions: RolePermissions.CONTRACTOR,
    jurisdictionState: 'Maharashtra',
  },
  OVERVIEW: {
    id: 'usr-ovw-001',
    name: 'Public Transparency Observer',
    role: 'OVERVIEW',
    permissions: RolePermissions.OVERVIEW,
  },
};

export class RemoteAuthRepository implements IAuthRepository {
  constructor(private storage: ISecureStorage = secureStorage) {}

  async login(credentials: LoginCredentials): Promise<AuthResult> {
    logger.info('RemoteAuthRepository', `Login initiated for role: ${credentials.roleHint || 'CITIZEN'}`);

    if (Config.environment === 'production') {
      // Production fail-closed rule: Real backend authentication endpoint required
      throw new Error('Production authentication backend endpoint is not yet configured.');
    }

    // Development Authentication Mode
    const targetRole: UserRole = credentials.roleHint || 'CITIZEN';
    const user = DEV_SYNTHETIC_IDENTITIES[targetRole] || DEV_SYNTHETIC_IDENTITIES.CITIZEN;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 1000 * 60 * 60 * 24).toISOString(); // 24 hours

    const session: SessionEntity = {
      sessionId: `sess-${Date.now()}`,
      userId: user.id,
      role: user.role,
      issuedAt: now.toISOString(),
      expiresAt,
    };

    const token = `dev_jwt_token_${user.id}_${Date.now()}`;

    // Store in SecureStore (never plain AsyncStorage)
    await this.storage.setItem(SECURE_TOKEN_KEY, token);
    await this.storage.setItem(SECURE_SESSION_KEY, JSON.stringify(session));
    await this.storage.setItem(SECURE_USER_KEY, JSON.stringify(user));

    return {
      user,
      session,
      token,
    };
  }

  async logout(): Promise<void> {
    logger.info('RemoteAuthRepository', 'Clearing secure credentials on logout');
    const user = await this.getCurrentUser();
    if (user?.id) {
      try {
        const { SQLiteDatabaseManager } = await import('../local/database/sqliteDatabase');
        const { sqliteLocalDataSource } = await import('../local/sqliteLocalDataSource');
        await SQLiteDatabaseManager.clearUserCache(user.id);
        await sqliteLocalDataSource.clearUserQueue(user.id);
      } catch (err) {
        logger.error('RemoteAuthRepository', 'Failed to clear local SQLite database on logout', err);
      }
    }

    await this.storage.removeItem(SECURE_TOKEN_KEY);
    await this.storage.removeItem(SECURE_REFRESH_KEY);
    await this.storage.removeItem(SECURE_SESSION_KEY);
    await this.storage.removeItem(SECURE_USER_KEY);
  }

  async getCurrentSession(): Promise<SessionEntity | null> {
    const raw = await this.storage.getItem(SECURE_SESSION_KEY);
    if (!raw) return null;
    try {
      const session: SessionEntity = JSON.parse(raw);
      // Validate expiration
      if (new Date(session.expiresAt).getTime() < Date.now()) {
        logger.warn('RemoteAuthRepository', 'Session expired in secure storage');
        await this.logout();
        return null;
      }
      return session;
    } catch {
      return null;
    }
  }

  async getCurrentUser(): Promise<UserEntity | null> {
    const raw = await this.storage.getItem(SECURE_USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  async restoreSession(): Promise<AuthResult | null> {
    const token = await this.storage.getItem(SECURE_TOKEN_KEY);
    const session = await this.getCurrentSession();
    const user = await this.getCurrentUser();

    if (!token || !session || !user) {
      return null;
    }

    return {
      user,
      session,
      token,
    };
  }
}
