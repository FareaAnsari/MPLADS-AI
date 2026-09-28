import { RemoteAuthRepository } from '../src/data/repositories/RemoteAuthRepository';
import { ISecureStorage } from '../src/data/local/interfaces/secureStorage';
import { RolePermissions, hasPermission } from '../src/domain/entities/permissions';

class MockMemoryStorage implements ISecureStorage {
  private memory = new Map<string, string>();

  async getItem(key: string): Promise<string | null> {
    return this.memory.get(key) || null;
  }

  async setItem(key: string, value: string): Promise<void> {
    this.memory.set(key, value);
  }

  async removeItem(key: string): Promise<void> {
    this.memory.delete(key);
  }
}

describe('Authentication & RBAC Tests (Unit)', () => {
  let storage: MockMemoryStorage;
  let authRepo: RemoteAuthRepository;

  beforeEach(() => {
    storage = new MockMemoryStorage();
    authRepo = new RemoteAuthRepository(storage);
  });

  it('authenticates a citizen role and stores credentials securely', async () => {
    const result = await authRepo.login({
      identifier: 'test-citizen',
      credential: 'dummy',
      roleHint: 'CITIZEN',
    });

    expect(result.user.role).toBe('CITIZEN');
    expect(result.user.name).toBe('Dev Test Citizen');
    expect(result.token).toBeDefined();

    // Verify token was stored in secure store
    const storedToken = await storage.getItem('mplads_auth_token');
    expect(storedToken).toBe(result.token);
  });

  it('enforces RBAC permissions correctly across roles', () => {
    const officerPermissions = RolePermissions.DISTRICT_OFFICER;
    const citizenPermissions = RolePermissions.CITIZEN;

    expect(hasPermission(officerPermissions, 'inspections:update')).toBe(true);
    expect(hasPermission(officerPermissions, 'ledger:decision')).toBe(true);
    expect(hasPermission(citizenPermissions, 'inspections:update')).toBe(false);
    expect(hasPermission(citizenPermissions, 'evidence:submit')).toBe(true);
  });

  it('restores an existing valid session from secure storage', async () => {
    await authRepo.login({
      identifier: 'test-officer',
      credential: 'dummy',
      roleHint: 'DISTRICT_OFFICER',
    });

    const restored = await authRepo.restoreSession();
    expect(restored).not.toBeNull();
    expect(restored?.user.role).toBe('DISTRICT_OFFICER');
  });

  it('clears all credentials upon logout', async () => {
    await authRepo.login({
      identifier: 'test-mp',
      credential: 'dummy',
      roleHint: 'MP_OFFICE',
    });

    await authRepo.logout();

    const restored = await authRepo.restoreSession();
    expect(restored).toBeNull();

    const storedToken = await storage.getItem('mplads_auth_token');
    expect(storedToken).toBeNull();
  });
});
