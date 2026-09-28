import { logger } from '../../../utils/logger';

export interface ISecureStorage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

export class ExpoSecureStorage implements ISecureStorage {
  private secureStoreModule: any = null;

  private async getModule() {
    if (!this.secureStoreModule) {
      try {
        this.secureStoreModule = await import('expo-secure-store');
      } catch (err) {
        logger.warn('ExpoSecureStorage', 'expo-secure-store not available in current test environment', err);
      }
    }
    return this.secureStoreModule;
  }

  async getItem(key: string): Promise<string | null> {
    try {
      const mod = await this.getModule();
      if (mod && mod.getItemAsync) {
        return await mod.getItemAsync(key);
      }
      return null;
    } catch (error) {
      logger.error('ExpoSecureStorage', `Failed to read key: ${key}`, error);
      return null;
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    try {
      const mod = await this.getModule();
      if (mod && mod.setItemAsync) {
        await mod.setItemAsync(key, value, {
          keychainAccessible: mod.AFTER_FIRST_UNLOCK,
        });
      }
    } catch (error) {
      logger.error('ExpoSecureStorage', `Failed to persist key: ${key}`, error);
      throw new Error(`SecureStore write failed for key: ${key}`);
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      const mod = await this.getModule();
      if (mod && mod.deleteItemAsync) {
        await mod.deleteItemAsync(key);
      }
    } catch (error) {
      logger.error('ExpoSecureStorage', `Failed to delete key: ${key}`, error);
    }
  }
}

export const secureStorage: ISecureStorage = new ExpoSecureStorage();
