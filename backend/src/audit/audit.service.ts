import { Injectable } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { SUPABASE_CLIENT } from '../supabase/supabase.provider';
import { SupabaseClient } from '@supabase/supabase-js';
import { CreateAuditLogDto, AuditLog } from './audit.types';

@Injectable()
export class AuditService {
  constructor(
    @Inject(SUPABASE_CLIENT) private supabase: SupabaseClient,
  ) {}

  /**
   * Create an audit log entry
   */
  async createAuditLog(dto: CreateAuditLogDto): Promise<AuditLog | null> {
    try {
      const auditLogData = {
        ...dto,
        created_at: new Date().toISOString(),
      };

      const { data, error } = await this.supabase
        .from('audit_logs')
        .insert(auditLogData)
        .select()
        .single();

      if (error) {
        // If table doesn't exist (PGRST205), log to console for development
        if (error.code === 'PGRST205') {
          console.log('[AUDIT LOG]', JSON.stringify(auditLogData, null, 2));
          return null;
        }
        throw error;
      }

      return data;
    } catch (error) {
      // If table doesn't exist, log to console
      if (error.code === 'PGRST205') {
        console.log('[AUDIT LOG]', JSON.stringify(dto, null, 2));
        return null;
      }
      throw error;
    }
  }

  /**
   * Log OTP send
   */
  async logOtpSend(
    phone: string,
    ip: string,
    userAgent: string,
    success: boolean,
    errorMessage?: string,
  ): Promise<void> {
    await this.createAuditLog({
      entity_type: 'AUTH',
      action: 'OTP_SEND',
      ip_address: ip,
      user_agent: userAgent,
      success,
      error_message: errorMessage,
      metadata: {
        phone,
        timestamp: new Date().toISOString(),
      },
    });
  }

  /**
   * Log OTP verify
   */
  async logOtpVerify(
    phone: string,
    ip: string,
    userAgent: string,
    success: boolean,
    actorId?: string,
    errorMessage?: string,
  ): Promise<void> {
    await this.createAuditLog({
      entity_type: 'AUTH',
      action: 'OTP_VERIFY',
      actor_id: actorId,
      ip_address: ip,
      user_agent: userAgent,
      success,
      error_message: errorMessage,
      metadata: {
        phone,
        timestamp: new Date().toISOString(),
      },
    });
  }

  /**
   * Login log
   */
  async logLogin(
    actorId: string,
    actorType: string,
    ip: string,
    userAgent: string,
    success: boolean,
    loginMethod: string, // OTP or PASSWORD
    errorMessage?: string,
  ): Promise<void> {
    await this.createAuditLog({
      entity_type: 'AUTH',
      action: 'LOGIN',
      actor_id: actorId,
      actor_type: actorType,
      ip_address: ip,
      user_agent: userAgent,
      success,
      error_message: errorMessage,
      metadata: {
        login_method: loginMethod,
        timestamp: new Date().toISOString(),
      },
    });
  }

  /**
   * Logout log
   */
  async logLogout(
    actorId: string,
    actorType: string,
    ip: string,
    userAgent: string,
    success: boolean = true,
  ): Promise<void> {
    await this.createAuditLog({
      entity_type: 'AUTH',
      action: 'LOGOUT',
      actor_id: actorId,
      actor_type: actorType,
      ip_address: ip,
      user_agent: userAgent,
      success,
      metadata: {
        timestamp: new Date().toISOString(),
      },
    });
  }

  /**
   * Session refresh log
   */
  async logSessionRefresh(
    actorId: string,
    actorType: string,
    ip: string,
    userAgent: string,
    success: boolean,
    errorMessage?: string,
  ): Promise<void> {
    await this.createAuditLog({
      entity_type: 'AUTH',
      action: 'SESSION_REFRESH',
      actor_id: actorId,
      actor_type: actorType,
      ip_address: ip,
      user_agent: userAgent,
      success,
      error_message: errorMessage,
      metadata: {
        timestamp: new Date().toISOString(),
      },
    });
  }

  /**
   * Failed login attempt log
   */
  async logFailedLogin(
    identifier: string,
    ip: string,
    userAgent: string,
    errorMessage: string,
  ): Promise<void> {
    await this.createAuditLog({
      entity_type: 'AUTH',
      action: 'LOGIN_FAILED',
      ip_address: ip,
      user_agent: userAgent,
      success: false,
      error_message: errorMessage,
      metadata: {
        identifier,
        timestamp: new Date().toISOString(),
      },
    });
  }

  /**
   * MFA verify log
   */
  async logMfaVerify(
    actorId: string,
    actorType: string,
    ip: string,
    userAgent: string,
    success: boolean,
    errorMessage?: string,
  ): Promise<void> {
    await this.createAuditLog({
      entity_type: 'AUTH',
      action: 'MFA_VERIFY',
      actor_id: actorId,
      actor_type: actorType,
      ip_address: ip,
      user_agent: userAgent,
      success,
      error_message: errorMessage,
      metadata: {
        timestamp: new Date().toISOString(),
      },
    });
  }

  /**
   * Get audit logs for an actor
   */
  async getAuditLogsByActor(actorId: string, limit = 100): Promise<AuditLog[]> {
    try {
      const { data, error } = await this.supabase
        .from('audit_logs')
        .select('*')
        .eq('actor_id', actorId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        // If table doesn't exist, return empty array
        if (error.code === 'PGRST205') {
          return [];
        }
        throw error;
      }

      return data || [];
    } catch (error) {
      if (error.code === 'PGRST205') {
        return [];
      }
      throw error;
    }
  }
}
