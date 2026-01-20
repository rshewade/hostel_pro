import {
  Injectable,
  Inject,
  Logger,
} from '@nestjs/common';
import { SUPABASE_CLIENT } from '../supabase/supabase.provider';
import { SupabaseClient } from '@supabase/supabase-js';

export type AuditAction =
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'VIEW'
  | 'DOWNLOAD'
  | 'VERIFY'
  | 'APPROVE'
  | 'REJECT'
  | 'STATUS_CHANGE'
  | 'LOGIN'
  | 'LOGOUT'
  | 'LOGIN_FAILED'
  | 'PASSWORD_CHANGE'
  | 'CONSENT_GRANTED'
  | 'CONSENT_REVOKED'
  | 'DATA_EXPORT'
  | 'DATA_DELETE';

export type EntityType =
  | 'USER'
  | 'APPLICATION'
  | 'DOCUMENT'
  | 'PAYMENT'
  | 'GATEWAY_PAYMENT'
  | 'ROOM'
  | 'ROOM_ALLOCATION'
  | 'LEAVE_REQUEST'
  | 'FEE'
  | 'CONSENT'
  | 'AUDIT_REPORT';

export interface AuditLogEntry {
  id: string;
  entity_type: EntityType;
  entity_id: string;
  action: AuditAction;
  actor_id?: string;
  actor_role?: string;
  old_values?: Record<string, unknown>;
  new_values?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export interface LogAuditParams {
  entityType: EntityType;
  entityId: string;
  action: AuditAction;
  actorId?: string;
  actorRole?: string;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

export interface AuditQueryParams {
  entityType?: EntityType;
  entityId?: string;
  action?: AuditAction;
  actorId?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(
    @Inject(SUPABASE_CLIENT) private supabase: SupabaseClient,
  ) {}

  /**
   * Log an audit entry
   */
  async log(params: LogAuditParams): Promise<void> {
    try {
      const auditEntry = {
        entity_type: params.entityType,
        entity_id: params.entityId,
        action: params.action,
        actor_id: params.actorId || null,
        actor_role: params.actorRole || null,
        old_values: params.oldValues || null,
        new_values: params.newValues || null,
        metadata: params.metadata || null,
        ip_address: params.ipAddress || null,
        user_agent: params.userAgent || null,
      };

      const { error } = await this.supabase
        .from('audit_logs')
        .insert(auditEntry);

      if (error) {
        this.logger.error(`Failed to log audit entry: ${error.message}`);
      } else {
        this.logger.debug(
          `Audit logged: ${params.action} on ${params.entityType}:${params.entityId}`,
        );
      }
    } catch (error) {
      // Don't throw on audit failures - log and continue
      this.logger.error(`Audit logging error: ${error.message}`);
    }
  }

  /**
   * Log entity creation
   */
  async logCreate(
    entityType: EntityType,
    entityId: string,
    newValues: Record<string, unknown>,
    actorId?: string,
    actorRole?: string,
  ): Promise<void> {
    await this.log({
      entityType,
      entityId,
      action: 'CREATE',
      actorId,
      actorRole,
      newValues,
    });
  }

  /**
   * Log entity update with old and new values
   */
  async logUpdate(
    entityType: EntityType,
    entityId: string,
    oldValues: Record<string, unknown>,
    newValues: Record<string, unknown>,
    actorId?: string,
    actorRole?: string,
  ): Promise<void> {
    // Only log fields that actually changed
    const changes: Record<string, unknown> = {};
    for (const key of Object.keys(newValues)) {
      if (JSON.stringify(oldValues[key]) !== JSON.stringify(newValues[key])) {
        changes[key] = newValues[key];
      }
    }

    if (Object.keys(changes).length > 0) {
      await this.log({
        entityType,
        entityId,
        action: 'UPDATE',
        actorId,
        actorRole,
        oldValues,
        newValues: changes,
      });
    }
  }

  /**
   * Log entity deletion
   */
  async logDelete(
    entityType: EntityType,
    entityId: string,
    oldValues: Record<string, unknown>,
    actorId?: string,
    actorRole?: string,
  ): Promise<void> {
    await this.log({
      entityType,
      entityId,
      action: 'DELETE',
      actorId,
      actorRole,
      oldValues,
    });
  }

  /**
   * Log document/sensitive data view
   */
  async logView(
    entityType: EntityType,
    entityId: string,
    actorId: string,
    actorRole: string,
    metadata?: Record<string, unknown>,
  ): Promise<void> {
    await this.log({
      entityType,
      entityId,
      action: 'VIEW',
      actorId,
      actorRole,
      metadata,
    });
  }

  /**
   * Log status change (applications, payments, etc.)
   */
  async logStatusChange(
    entityType: EntityType,
    entityId: string,
    oldStatus: string,
    newStatus: string,
    actorId: string,
    actorRole: string,
    metadata?: Record<string, unknown>,
  ): Promise<void> {
    await this.log({
      entityType,
      entityId,
      action: 'STATUS_CHANGE',
      actorId,
      actorRole,
      oldValues: { status: oldStatus },
      newValues: { status: newStatus },
      metadata,
    });
  }

  /**
   * Log authentication events
   */
  async logAuth(
    action: 'LOGIN' | 'LOGOUT' | 'LOGIN_FAILED' | 'PASSWORD_CHANGE',
    userId: string,
    ipAddress?: string,
    userAgent?: string,
    metadata?: Record<string, unknown>,
  ): Promise<void> {
    await this.log({
      entityType: 'USER',
      entityId: userId,
      action,
      actorId: userId,
      ipAddress,
      userAgent,
      metadata,
    });
  }

  /**
   * Query audit logs
   */
  async query(params: AuditQueryParams): Promise<{
    logs: AuditLogEntry[];
    total: number;
  }> {
    let query = this.supabase
      .from('audit_logs')
      .select('*', { count: 'exact' });

    if (params.entityType) {
      query = query.eq('entity_type', params.entityType);
    }
    if (params.entityId) {
      query = query.eq('entity_id', params.entityId);
    }
    if (params.action) {
      query = query.eq('action', params.action);
    }
    if (params.actorId) {
      query = query.eq('actor_id', params.actorId);
    }
    if (params.startDate) {
      query = query.gte('created_at', params.startDate);
    }
    if (params.endDate) {
      query = query.lte('created_at', params.endDate);
    }

    const limit = params.limit || 50;
    const offset = params.offset || 0;

    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      this.logger.error(`Failed to query audit logs: ${error.message}`);
      return { logs: [], total: 0 };
    }

    return {
      logs: data || [],
      total: count || 0,
    };
  }

  /**
   * Get audit trail for a specific entity
   */
  async getEntityAuditTrail(
    entityType: EntityType,
    entityId: string,
  ): Promise<AuditLogEntry[]> {
    const { data, error } = await this.supabase
      .from('audit_logs')
      .select('*')
      .eq('entity_type', entityType)
      .eq('entity_id', entityId)
      .order('created_at', { ascending: false });

    if (error) {
      this.logger.error(`Failed to get audit trail: ${error.message}`);
      return [];
    }

    return data || [];
  }

  /**
   * Get user activity log
   */
  async getUserActivityLog(
    userId: string,
    startDate?: string,
    endDate?: string,
  ): Promise<AuditLogEntry[]> {
    let query = this.supabase
      .from('audit_logs')
      .select('*')
      .eq('actor_id', userId)
      .order('created_at', { ascending: false });

    if (startDate) {
      query = query.gte('created_at', startDate);
    }
    if (endDate) {
      query = query.lte('created_at', endDate);
    }

    const { data, error } = await query.limit(100);

    if (error) {
      this.logger.error(`Failed to get user activity: ${error.message}`);
      return [];
    }

    return data || [];
  }

  /**
   * Get audit statistics for a date range
   */
  async getAuditStats(
    startDate: string,
    endDate: string,
  ): Promise<{
    totalActions: number;
    byEntityType: Record<string, number>;
    byAction: Record<string, number>;
    uniqueActors: number;
    failedLogins: number;
  }> {
    const { data, error } = await this.supabase
      .from('audit_logs')
      .select('entity_type, action, actor_id')
      .gte('created_at', startDate)
      .lte('created_at', endDate);

    if (error) {
      this.logger.error(`Failed to get audit stats: ${error.message}`);
      return {
        totalActions: 0,
        byEntityType: {},
        byAction: {},
        uniqueActors: 0,
        failedLogins: 0,
      };
    }

    const logs = data || [];
    const byEntityType: Record<string, number> = {};
    const byAction: Record<string, number> = {};
    const actors = new Set<string>();
    let failedLogins = 0;

    logs.forEach((log) => {
      byEntityType[log.entity_type] = (byEntityType[log.entity_type] || 0) + 1;
      byAction[log.action] = (byAction[log.action] || 0) + 1;
      if (log.actor_id) actors.add(log.actor_id);
      if (log.action === 'LOGIN_FAILED') failedLogins++;
    });

    return {
      totalActions: logs.length,
      byEntityType,
      byAction,
      uniqueActors: actors.size,
      failedLogins,
    };
  }

  /**
   * Detect suspicious activity patterns
   */
  async detectSuspiciousActivity(
    hoursBack: number = 24,
  ): Promise<{
    multipleFailedLogins: { userId: string; count: number }[];
    unusualAccessPatterns: { userId: string; action: string; count: number }[];
  }> {
    const startDate = new Date();
    startDate.setHours(startDate.getHours() - hoursBack);

    const { data, error } = await this.supabase
      .from('audit_logs')
      .select('actor_id, action')
      .gte('created_at', startDate.toISOString());

    if (error) {
      this.logger.error(`Failed to detect suspicious activity: ${error.message}`);
      return { multipleFailedLogins: [], unusualAccessPatterns: [] };
    }

    const logs = data || [];

    // Count failed logins per user
    const failedLoginCounts: Record<string, number> = {};
    const actionCounts: Record<string, Record<string, number>> = {};

    logs.forEach((log) => {
      if (!log.actor_id) return;

      if (log.action === 'LOGIN_FAILED') {
        failedLoginCounts[log.actor_id] = (failedLoginCounts[log.actor_id] || 0) + 1;
      }

      if (!actionCounts[log.actor_id]) {
        actionCounts[log.actor_id] = {};
      }
      actionCounts[log.actor_id][log.action] =
        (actionCounts[log.actor_id][log.action] || 0) + 1;
    });

    // Flag users with > 5 failed logins
    const multipleFailedLogins = Object.entries(failedLoginCounts)
      .filter(([, count]) => count > 5)
      .map(([userId, count]) => ({ userId, count }));

    // Flag unusual access patterns (> 100 of same action)
    const unusualAccessPatterns: { userId: string; action: string; count: number }[] = [];
    Object.entries(actionCounts).forEach(([userId, actions]) => {
      Object.entries(actions).forEach(([action, count]) => {
        if (count > 100) {
          unusualAccessPatterns.push({ userId, action, count });
        }
      });
    });

    return { multipleFailedLogins, unusualAccessPatterns };
  }
}
