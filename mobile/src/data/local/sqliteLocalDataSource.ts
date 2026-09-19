import {
  ILocalProjectDataSource,
  ILocalRiskDataSource,
  IOfflineMutationQueue,
} from './interfaces/localDataSources';
import {
  ProjectEntity,
  RiskAssessmentEntity,
  OutboxItemEntity,
  OutboxStatus,
} from '../../domain/entities';
import { SQLiteDatabaseManager } from './database/sqliteDatabase';
import { logger } from '../../utils/logger';

export class SQLiteLocalDataSource
  implements ILocalProjectDataSource, ILocalRiskDataSource, IOfflineMutationQueue
{
  // --------------------------------------------------------------------------
  // PROJECTS CACHE
  // --------------------------------------------------------------------------
  async getCachedProjects(
    userId: string,
    role: string,
    limit: number = 50,
    offset: number = 0,
    jurisdiction?: string
  ): Promise<ProjectEntity[]> {
    try {
      const db = await SQLiteDatabaseManager.getDatabase();
      let query = 'SELECT * FROM projects WHERE user_id = ? AND role = ?';
      const params: any[] = [userId, role];

      if (jurisdiction) {
        query += ' AND jurisdiction_district = ?';
        params.push(jurisdiction);
      }

      query += ' ORDER BY updated_at DESC LIMIT ? OFFSET ?';
      params.push(limit, offset);

      const rows = await db.getAllAsync<any>(query, params);

      return rows.map((r) => ({
        id: r.id,
        workId: r.work_id,
        workTitle: r.work_title,
        workCategory: r.work_category,
        workDescription: r.work_description,
        mpName: r.mp_name,
        idaOffice: r.ida_office,
        state: r.state,
        constituency: r.constituency,
        sanctionedAmountInr: r.sanctioned_amount_inr,
        disbursedAmountInr: r.disbursed_amount_inr,
        currentStage: r.current_stage,
        hasOfficialImages: r.has_official_images === 1,
        source: r.source,
        sourceType: r.source_type,
      }));
    } catch (error) {
      logger.error('SQLiteLocalDataSource', 'Error fetching cached projects', error);
      return [];
    }
  }

  async getProjectById(userId: string, workId: string): Promise<ProjectEntity | null> {
    try {
      const db = await SQLiteDatabaseManager.getDatabase();
      const r = await db.getFirstAsync<any>(
        'SELECT * FROM projects WHERE user_id = ? AND (id = ? OR work_id = ?)',
        [userId, workId, workId]
      );

      if (!r) return null;

      return {
        id: r.id,
        workId: r.work_id,
        workTitle: r.work_title,
        workCategory: r.work_category,
        workDescription: r.work_description,
        mpName: r.mp_name,
        idaOffice: r.ida_office,
        state: r.state,
        constituency: r.constituency,
        sanctionedAmountInr: r.sanctioned_amount_inr,
        disbursedAmountInr: r.disbursed_amount_inr,
        currentStage: r.current_stage,
        hasOfficialImages: r.has_official_images === 1,
        source: r.source,
        sourceType: r.source_type,
      };
    } catch (error) {
      logger.error('SQLiteLocalDataSource', `Error fetching cached project ${workId}`, error);
      return null;
    }
  }

  async saveProjects(
    userId: string,
    role: string,
    projects: ProjectEntity[],
    jurisdiction?: string
  ): Promise<void> {
    try {
      const db = await SQLiteDatabaseManager.getDatabase();
      const now = new Date().toISOString();

      for (const p of projects) {
        await db.runAsync(
          `INSERT OR REPLACE INTO projects (
            id, user_id, role, jurisdiction_district, work_id, work_title,
            work_category, work_description, mp_name, ida_office, state,
            constituency, sanctioned_amount_inr, disbursed_amount_inr,
            current_stage, has_official_images, source, sourceType, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            p.id || p.workId,
            userId,
            role,
            jurisdiction || null,
            p.workId,
            p.workTitle,
            p.workCategory,
            p.workDescription || null,
            p.mpName || null,
            p.idaOffice || null,
            p.state,
            p.constituency || null,
            p.sanctionedAmountInr,
            p.disbursedAmountInr,
            p.currentStage,
            p.hasOfficialImages ? 1 : 0,
            p.source,
            p.sourceType,
            now,
          ]
        );
      }
    } catch (error) {
      logger.error('SQLiteLocalDataSource', 'Error saving projects to local cache', error);
    }
  }

  async clearUserCache(userId: string): Promise<void> {
    await SQLiteDatabaseManager.clearUserCache(userId);
  }

  // --------------------------------------------------------------------------
  // RISK CACHE
  // --------------------------------------------------------------------------
  async getCachedRiskScore(
    userId: string,
    workId: string
  ): Promise<RiskAssessmentEntity | null> {
    try {
      const db = await SQLiteDatabaseManager.getDatabase();
      const r = await db.getFirstAsync<any>(
        'SELECT * FROM risk_assessments WHERE user_id = ? AND work_id = ?',
        [userId, workId]
      );

      if (!r) return null;

      return {
        projectId: r.work_id,
        workId: r.work_id,
        riskScore: r.risk_score,
        anomalyFlag: r.anomaly_flag,
        scoreBreakdown: JSON.parse(r.score_breakdown_json || '{}'),
        primaryRiskReason: r.primary_risk_reason,
        topContributingFactor: r.top_contributing_factor,
        evaluatedAt: r.evaluated_at,
      };
    } catch (error) {
      logger.error('SQLiteLocalDataSource', `Error fetching risk score for ${workId}`, error);
      return null;
    }
  }

  async saveRiskScore(userId: string, assessment: RiskAssessmentEntity): Promise<void> {
    try {
      const db = await SQLiteDatabaseManager.getDatabase();
      const now = new Date().toISOString();

      await db.runAsync(
        `INSERT OR REPLACE INTO risk_assessments (
          work_id, user_id, risk_score, anomaly_flag, score_breakdown_json,
          primary_risk_reason, top_contributing_factor, evaluated_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          assessment.workId,
          userId,
          assessment.riskScore,
          assessment.anomalyFlag,
          JSON.stringify(assessment.scoreBreakdown || {}),
          assessment.primaryRiskReason || null,
          assessment.topContributingFactor || null,
          assessment.evaluatedAt || now,
          now,
        ]
      );
    } catch (error) {
      logger.error('SQLiteLocalDataSource', `Error saving risk score for ${assessment.workId}`, error);
    }
  }

  // --------------------------------------------------------------------------
  // OUTBOX MUTATION QUEUE
  // --------------------------------------------------------------------------
  async enqueueMutation<T = any>(
    item: Omit<
      OutboxItemEntity<T>,
      'id' | 'createdAt' | 'updatedAt' | 'status' | 'attemptCount'
    >
  ): Promise<OutboxItemEntity<T>> {
    const db = await SQLiteDatabaseManager.getDatabase();
    const id = `outbox-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const now = new Date().toISOString();
    const status: OutboxStatus = 'PENDING';

    await db.runAsync(
      `INSERT INTO outbox_mutations (
        id, user_id, role, entity_type, entity_id, operation,
        payload_json, status, attempt_count, idempotency_key, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?)`,
      [
        id,
        item.userId,
        item.role,
        item.entityType,
        item.entityId,
        item.operation,
        JSON.stringify(item.payload),
        status,
        item.idempotencyKey,
        now,
        now,
      ]
    );

    return {
      ...item,
      id,
      status,
      attemptCount: 0,
      createdAt: now,
      updatedAt: now,
    };
  }

  async getPendingMutations(userId: string): Promise<OutboxItemEntity[]> {
    try {
      const db = await SQLiteDatabaseManager.getDatabase();
      const rows = await db.getAllAsync<any>(
        `SELECT * FROM outbox_mutations 
         WHERE user_id = ? AND status IN ('PENDING', 'FAILED_RETRYABLE')
         ORDER BY created_at ASC`,
        [userId]
      );

      return rows.map((r) => ({
        id: r.id,
        userId: r.user_id,
        role: r.role,
        entityType: r.entity_type,
        entityId: r.entity_id,
        operation: r.operation,
        payload: JSON.parse(r.payload_json || '{}'),
        status: r.status as OutboxStatus,
        attemptCount: r.attempt_count,
        lastAttemptAt: r.last_attempt_at,
        nextRetryAt: r.next_retry_at,
        idempotencyKey: r.idempotency_key,
        errorCode: r.error_code,
        errorMessage: r.error_message,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
      }));
    } catch (error) {
      logger.error('SQLiteLocalDataSource', 'Error fetching pending mutations', error);
      return [];
    }
  }

  async getMutationById(id: string): Promise<OutboxItemEntity | null> {
    try {
      const db = await SQLiteDatabaseManager.getDatabase();
      const r = await db.getFirstAsync<any>(
        'SELECT * FROM outbox_mutations WHERE id = ?',
        [id]
      );
      if (!r) return null;

      return {
        id: r.id,
        userId: r.user_id,
        role: r.role,
        entityType: r.entity_type,
        entityId: r.entity_id,
        operation: r.operation,
        payload: JSON.parse(r.payload_json || '{}'),
        status: r.status as OutboxStatus,
        attemptCount: r.attempt_count,
        lastAttemptAt: r.last_attempt_at,
        nextRetryAt: r.next_retry_at,
        idempotencyKey: r.idempotency_key,
        errorCode: r.error_code,
        errorMessage: r.error_message,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
      };
    } catch (error) {
      logger.error('SQLiteLocalDataSource', `Error fetching mutation ${id}`, error);
      return null;
    }
  }

  async updateMutationStatus(
    id: string,
    status: OutboxStatus,
    updates?: {
      attemptCount?: number;
      lastAttemptAt?: string;
      nextRetryAt?: string | null;
      errorCode?: string | null;
      errorMessage?: string | null;
    }
  ): Promise<void> {
    try {
      const db = await SQLiteDatabaseManager.getDatabase();
      const now = new Date().toISOString();

      let query = 'UPDATE outbox_mutations SET status = ?, updated_at = ?';
      const params: any[] = [status, now];

      if (updates?.attemptCount !== undefined) {
        query += ', attempt_count = ?';
        params.push(updates.attemptCount);
      }
      if (updates?.lastAttemptAt !== undefined) {
        query += ', last_attempt_at = ?';
        params.push(updates.lastAttemptAt);
      }
      if (updates?.nextRetryAt !== undefined) {
        query += ', next_retry_at = ?';
        params.push(updates.nextRetryAt);
      }
      if (updates?.errorCode !== undefined) {
        query += ', error_code = ?';
        params.push(updates.errorCode);
      }
      if (updates?.errorMessage !== undefined) {
        query += ', error_message = ?';
        params.push(updates.errorMessage);
      }

      query += ' WHERE id = ?';
      params.push(id);

      await db.runAsync(query, params);
    } catch (error) {
      logger.error('SQLiteLocalDataSource', `Error updating mutation ${id}`, error);
    }
  }

  async deleteMutation(id: string): Promise<void> {
    try {
      const db = await SQLiteDatabaseManager.getDatabase();
      await db.runAsync('DELETE FROM outbox_mutations WHERE id = ?', [id]);
    } catch (error) {
      logger.error('SQLiteLocalDataSource', `Error deleting mutation ${id}`, error);
    }
  }

  async clearUserQueue(userId: string): Promise<void> {
    try {
      const db = await SQLiteDatabaseManager.getDatabase();
      await db.runAsync('DELETE FROM outbox_mutations WHERE user_id = ?', [userId]);
    } catch (error) {
      logger.error('SQLiteLocalDataSource', `Error clearing outbox for user ${userId}`, error);
    }
  }
}

export const sqliteLocalDataSource = new SQLiteLocalDataSource();
