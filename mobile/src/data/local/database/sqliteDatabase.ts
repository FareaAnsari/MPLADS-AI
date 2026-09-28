import * as SQLite from 'expo-sqlite';
import { CURRENT_SCHEMA_VERSION, CREATE_SCHEMA_V1_SQL } from './schema';
import { logger } from '../../../utils/logger';

export class SQLiteDatabaseManager {
  private static instance: SQLite.SQLiteDatabase | null = null;
  private static isInitialized = false;

  /**
   * Get or initialize the singleton SQLite database instance.
   */
  static async getDatabase(): Promise<SQLite.SQLiteDatabase> {
    if (!this.instance) {
      this.instance = await SQLite.openDatabaseAsync('mplads_mplads.db');
    }

    if (!this.isInitialized) {
      await this.runMigrations(this.instance);
      this.isInitialized = true;
    }

    return this.instance;
  }

  /**
   * Execute versioned schema migrations.
   */
  private static async runMigrations(db: SQLite.SQLiteDatabase): Promise<void> {
    try {
      // Execute base schema definition
      await db.execAsync(CREATE_SCHEMA_V1_SQL);

      // Check current applied schema version
      const row = await db.getFirstAsync<{ version: number }>(
        'SELECT version FROM schema_version ORDER BY version DESC LIMIT 1'
      );

      if (!row) {
        await db.runAsync(
          'INSERT INTO schema_version (version, applied_at) VALUES (?, ?)',
          [CURRENT_SCHEMA_VERSION, new Date().toISOString()]
        );
        logger.info('SQLiteDatabase', `Initialized schema v${CURRENT_SCHEMA_VERSION}`);
      } else {
        logger.info('SQLiteDatabase', `Existing database schema at v${row.version}`);
      }
    } catch (error) {
      logger.error('SQLiteDatabase', 'Failed to run database migrations', error);
      throw error;
    }
  }

  /**
   * Clear all user-scoped cached data on logout or account switch.
   */
  static async clearUserCache(userId: string): Promise<void> {
    try {
      const db = await this.getDatabase();
      await db.runAsync('DELETE FROM projects WHERE user_id = ?', [userId]);
      await db.runAsync('DELETE FROM risk_assessments WHERE user_id = ?', [userId]);
      await db.runAsync('DELETE FROM evidence_records WHERE user_id = ?', [userId]);
      await db.runAsync('DELETE FROM inspection_schedules WHERE user_id = ?', [userId]);
      await db.runAsync('DELETE FROM sync_metadata WHERE user_id = ?', [userId]);
      logger.info('SQLiteDatabase', `Cleared local cache for user ${userId}`);
    } catch (error) {
      logger.error('SQLiteDatabase', `Failed to clear cache for user ${userId}`, error);
    }
  }

  /**
   * Reset database instance (for testing).
   */
  static resetInstance(): void {
    this.instance = null;
    this.isInitialized = false;
  }
}
