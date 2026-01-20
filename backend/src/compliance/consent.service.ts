import {
  Injectable,
  Inject,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { SUPABASE_CLIENT } from '../supabase/supabase.provider';
import { SupabaseClient } from '@supabase/supabase-js';

export type ConsentType =
  | 'TERMS_AND_CONDITIONS'
  | 'PRIVACY_POLICY'
  | 'DATA_PROCESSING'
  | 'HOSTEL_RULES'
  | 'RENEWAL_TERMS'
  | 'PARENT_GUARDIAN';

export interface ConsentRecord {
  id: string;
  user_id: string;
  consent_type: ConsentType;
  consent_version: string;
  consent_text_hash?: string;
  ip_address?: string;
  device_info?: string;
  accepted_at?: string;
  granted_at?: string;
  expires_at?: string;
  revoked_at?: string;
  revoked_reason?: string;
  created_at: string;
}

export interface RecordConsentDto {
  userId: string;
  consentType: ConsentType;
  version: string;
  consentText: string;
  ipAddress?: string;
  deviceInfo?: string;
  expiresAt?: string;
}

@Injectable()
export class ConsentService {
  private readonly logger = new Logger(ConsentService.name);
  private readonly consentRenewalMonths = 6; // DPDP requires renewal every 6 months

  constructor(
    @Inject(SUPABASE_CLIENT) private supabase: SupabaseClient,
  ) {}

  /**
   * Record user consent
   */
  async recordConsent(dto: RecordConsentDto): Promise<ConsentRecord> {
    // Hash the consent text for verification
    const crypto = await import('crypto');
    const consentTextHash = crypto
      .createHash('sha256')
      .update(dto.consentText)
      .digest('hex');

    // Calculate expiry (6 months from now if not specified)
    const expiresAt = dto.expiresAt || this.calculateExpiryDate();

    const consentRecord = {
      user_id: dto.userId,
      consent_type: dto.consentType,
      consent_version: dto.version,
      consent_text_hash: consentTextHash,
      ip_address: dto.ipAddress || null,
      device_info: dto.deviceInfo || null,
      accepted_at: new Date().toISOString(),
      granted_at: new Date().toISOString(),
      expires_at: expiresAt,
    };

    const { data, error } = await this.supabase
      .from('consent_logs')
      .insert(consentRecord)
      .select()
      .single();

    if (error) {
      this.logger.error(`Failed to record consent: ${error.message}`);
      throw new BadRequestException('Failed to record consent');
    }

    this.logger.log(`Consent recorded: ${dto.consentType} for user ${dto.userId}`);
    return data;
  }

  /**
   * Revoke consent
   */
  async revokeConsent(
    consentId: string,
    reason?: string,
  ): Promise<ConsentRecord> {
    const { data, error } = await this.supabase
      .from('consent_logs')
      .update({
        revoked_at: new Date().toISOString(),
        revoked_reason: reason || 'User requested revocation',
      })
      .eq('id', consentId)
      .is('revoked_at', null)
      .select()
      .single();

    if (error) {
      this.logger.error(`Failed to revoke consent: ${error.message}`);
      throw new BadRequestException('Failed to revoke consent');
    }

    this.logger.log(`Consent revoked: ${consentId}`);
    return data;
  }

  /**
   * Check if user needs consent renewal
   * Returns true if consent is missing, expired, or needs renewal
   */
  async checkConsentRenewal(
    userId: string,
    consentType: ConsentType,
  ): Promise<{ needsRenewal: boolean; reason?: string; lastConsent?: ConsentRecord }> {
    const { data: consents, error } = await this.supabase
      .from('consent_logs')
      .select('*')
      .eq('user_id', userId)
      .eq('consent_type', consentType)
      .is('revoked_at', null)
      .order('accepted_at', { ascending: false })
      .limit(1);

    if (error) {
      this.logger.error(`Failed to check consent: ${error.message}`);
      return { needsRenewal: true, reason: 'Unable to verify consent' };
    }

    if (!consents || consents.length === 0) {
      return { needsRenewal: true, reason: 'No consent on record' };
    }

    const lastConsent = consents[0] as ConsentRecord;
    const now = new Date();

    // Check if expired
    if (lastConsent.expires_at && new Date(lastConsent.expires_at) < now) {
      return {
        needsRenewal: true,
        reason: 'Consent has expired',
        lastConsent,
      };
    }

    // Check if approaching expiry (within 30 days)
    if (lastConsent.expires_at) {
      const expiryDate = new Date(lastConsent.expires_at);
      const daysUntilExpiry = Math.floor(
        (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
      );

      if (daysUntilExpiry <= 30) {
        return {
          needsRenewal: true,
          reason: `Consent expires in ${daysUntilExpiry} days`,
          lastConsent,
        };
      }
    }

    return { needsRenewal: false, lastConsent };
  }

  /**
   * Get all active consents for a user
   */
  async getUserConsents(userId: string): Promise<ConsentRecord[]> {
    const { data, error } = await this.supabase
      .from('consent_logs')
      .select('*')
      .eq('user_id', userId)
      .is('revoked_at', null)
      .order('accepted_at', { ascending: false });

    if (error) {
      this.logger.error(`Failed to get user consents: ${error.message}`);
      return [];
    }

    return data || [];
  }

  /**
   * Get consent history for a user
   */
  async getConsentHistory(
    userId: string,
    consentType?: ConsentType,
  ): Promise<ConsentRecord[]> {
    let query = this.supabase
      .from('consent_logs')
      .select('*')
      .eq('user_id', userId)
      .order('accepted_at', { ascending: false });

    if (consentType) {
      query = query.eq('consent_type', consentType);
    }

    const { data, error } = await query;

    if (error) {
      this.logger.error(`Failed to get consent history: ${error.message}`);
      return [];
    }

    return data || [];
  }

  /**
   * Verify consent was given for specific text
   */
  async verifyConsent(
    consentId: string,
    consentText: string,
  ): Promise<boolean> {
    const crypto = await import('crypto');
    const textHash = crypto
      .createHash('sha256')
      .update(consentText)
      .digest('hex');

    const { data, error } = await this.supabase
      .from('consent_logs')
      .select('consent_text_hash')
      .eq('id', consentId)
      .single();

    if (error || !data) {
      return false;
    }

    return data.consent_text_hash === textHash;
  }

  /**
   * Get users with expiring consents (for notification purposes)
   */
  async getUsersWithExpiringConsents(
    daysUntilExpiry: number = 30,
  ): Promise<{ userId: string; consentType: ConsentType; expiresAt: string }[]> {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysUntilExpiry);

    const { data, error } = await this.supabase
      .from('consent_logs')
      .select('user_id, consent_type, expires_at')
      .is('revoked_at', null)
      .lte('expires_at', futureDate.toISOString())
      .gte('expires_at', new Date().toISOString());

    if (error) {
      this.logger.error(`Failed to get expiring consents: ${error.message}`);
      return [];
    }

    return (data || []).map((c) => ({
      userId: c.user_id,
      consentType: c.consent_type,
      expiresAt: c.expires_at,
    }));
  }

  /**
   * Bulk check consents for multiple types
   */
  async checkMultipleConsents(
    userId: string,
    consentTypes: ConsentType[],
  ): Promise<Record<ConsentType, { needsRenewal: boolean; reason?: string }>> {
    const results: Record<ConsentType, { needsRenewal: boolean; reason?: string }> = {} as Record<ConsentType, { needsRenewal: boolean; reason?: string }>;

    for (const consentType of consentTypes) {
      const check = await this.checkConsentRenewal(userId, consentType);
      results[consentType] = {
        needsRenewal: check.needsRenewal,
        reason: check.reason,
      };
    }

    return results;
  }

  /**
   * Calculate expiry date (6 months from now)
   */
  private calculateExpiryDate(): string {
    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + this.consentRenewalMonths);
    return expiryDate.toISOString();
  }
}

/**
 * Required consents for different operations
 */
export const REQUIRED_CONSENTS = {
  APPLICATION: ['TERMS_AND_CONDITIONS', 'PRIVACY_POLICY', 'DATA_PROCESSING'] as ConsentType[],
  ADMISSION: ['TERMS_AND_CONDITIONS', 'PRIVACY_POLICY', 'DATA_PROCESSING', 'HOSTEL_RULES'] as ConsentType[],
  RENEWAL: ['RENEWAL_TERMS', 'PRIVACY_POLICY'] as ConsentType[],
  PARENT_ACCESS: ['PARENT_GUARDIAN', 'PRIVACY_POLICY'] as ConsentType[],
};
