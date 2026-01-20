import {
  Injectable,
  Inject,
  Logger,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SUPABASE_CLIENT } from '../supabase/supabase.provider';
import { SupabaseClient } from '@supabase/supabase-js';
import { ConfigService } from '@nestjs/config';
import { AuditService } from './audit.service';

export interface ArchivedApplication {
  id: string;
  original_id: string;
  tracking_number: string;
  type: string;
  vertical: string;
  status: string;
  applied_at: string;
  archived_at: string;
  archive_reason: string;
  summary_data: Record<string, unknown>;
}

export interface RetentionStats {
  applicationsArchived: number;
  documentsDeleted: number;
  auditLogsRetained: number;
  errors: string[];
}

@Injectable()
export class DataRetentionService {
  private readonly logger = new Logger(DataRetentionService.name);
  private readonly isEnabled: boolean;
  private readonly retentionDays: number;

  constructor(
    @Inject(SUPABASE_CLIENT) private supabase: SupabaseClient,
    private configService: ConfigService,
    private auditService: AuditService,
  ) {
    this.isEnabled = this.configService.get<string>('ENABLE_DATA_RETENTION') === 'true';
    this.retentionDays = parseInt(
      this.configService.get<string>('DATA_RETENTION_DAYS') || '365',
      10,
    );
  }

  /**
   * Weekly job to archive old rejected applications
   * Runs every Sunday at 3 AM
   */
  @Cron(CronExpression.EVERY_WEEK)
  async runWeeklyArchival(): Promise<void> {
    if (!this.isEnabled) {
      this.logger.log('Data retention is disabled');
      return;
    }

    this.logger.log('Starting weekly data archival job');

    try {
      const stats = await this.archiveOldData();
      this.logger.log(
        `Archival complete: ${stats.applicationsArchived} applications archived`,
      );

      // Log the archival operation
      await this.auditService.log({
        entityType: 'AUDIT_REPORT',
        entityId: `archival-${new Date().toISOString().split('T')[0]}`,
        action: 'CREATE',
        metadata: {
          applicationsArchived: stats.applicationsArchived,
          documentsDeleted: stats.documentsDeleted,
          auditLogsRetained: stats.auditLogsRetained,
          errors: stats.errors,
        },
      });
    } catch (error) {
      this.logger.error(`Archival job failed: ${error.message}`);
    }
  }

  /**
   * Archive old data based on retention policy
   */
  async archiveOldData(): Promise<RetentionStats> {
    const stats: RetentionStats = {
      applicationsArchived: 0,
      documentsDeleted: 0,
      auditLogsRetained: 0,
      errors: [],
    };

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.retentionDays);

    // Archive rejected applications older than retention period
    try {
      const archived = await this.archiveRejectedApplications(cutoffDate);
      stats.applicationsArchived = archived;
    } catch (error) {
      stats.errors.push(`Application archival: ${error.message}`);
    }

    // Clean up orphaned documents
    try {
      const deleted = await this.cleanupOrphanedDocuments();
      stats.documentsDeleted = deleted;
    } catch (error) {
      stats.errors.push(`Document cleanup: ${error.message}`);
    }

    return stats;
  }

  /**
   * Archive rejected applications older than cutoff date
   */
  private async archiveRejectedApplications(cutoffDate: Date): Promise<number> {
    // Find applications to archive
    const { data: applications, error: fetchError } = await this.supabase
      .from('applications')
      .select('*')
      .eq('current_status', 'REJECTED')
      .lt('updated_at', cutoffDate.toISOString());

    if (fetchError) {
      throw new Error(`Failed to fetch applications: ${fetchError.message}`);
    }

    if (!applications || applications.length === 0) {
      return 0;
    }

    let archivedCount = 0;

    for (const app of applications) {
      try {
        // Create archived record with PII stripped
        const archivedRecord: Partial<ArchivedApplication> = {
          original_id: app.id,
          tracking_number: app.tracking_number,
          type: app.type,
          vertical: app.vertical,
          status: app.current_status,
          applied_at: app.created_at,
          archived_at: new Date().toISOString(),
          archive_reason: 'RETENTION_POLICY',
          summary_data: this.stripPII(app.data),
        };

        // Insert into archive
        const { error: insertError } = await this.supabase
          .from('applications_archive')
          .insert(archivedRecord);

        if (insertError) {
          this.logger.error(`Failed to archive application ${app.id}: ${insertError.message}`);
          continue;
        }

        // Delete related documents from storage
        await this.deleteApplicationDocuments(app.id);

        // Delete original application
        const { error: deleteError } = await this.supabase
          .from('applications')
          .delete()
          .eq('id', app.id);

        if (deleteError) {
          this.logger.error(`Failed to delete application ${app.id}: ${deleteError.message}`);
          continue;
        }

        // Log the archival
        await this.auditService.log({
          entityType: 'APPLICATION',
          entityId: app.id,
          action: 'DELETE',
          metadata: {
            reason: 'RETENTION_POLICY',
            archived_to: archivedRecord.id,
          },
        });

        archivedCount++;
      } catch (error) {
        this.logger.error(`Error archiving application ${app.id}: ${error.message}`);
      }
    }

    return archivedCount;
  }

  /**
   * Strip PII from application data
   */
  private stripPII(data: Record<string, unknown>): Record<string, unknown> {
    if (!data) return {};

    // Fields to remove completely
    const piiFields = [
      'mobile',
      'phone',
      'email',
      'address',
      'parent_mobile',
      'guardian_mobile',
      'emergency_contact',
      'aadhaar',
      'pan',
      'passport',
      'bank_account',
    ];

    const stripped = { ...data };

    // Remove known PII fields
    for (const field of piiFields) {
      if (field in stripped) {
        delete stripped[field];
      }
    }

    // Mask name to initials
    if (typeof stripped.name === 'string') {
      stripped.name = this.maskName(stripped.name);
    }

    // Keep non-sensitive summary data
    return {
      has_data: true,
      field_count: Object.keys(stripped).length,
      ...stripped,
    };
  }

  /**
   * Mask name to initials
   */
  private maskName(name: string): string {
    const parts = name.split(' ');
    return parts.map((p) => p.charAt(0).toUpperCase() + '.').join(' ');
  }

  /**
   * Delete documents associated with an application
   */
  private async deleteApplicationDocuments(applicationId: string): Promise<void> {
    // Get document records
    const { data: documents, error } = await this.supabase
      .from('documents')
      .select('id, storage_url')
      .eq('application_id', applicationId);

    if (error || !documents) return;

    for (const doc of documents) {
      try {
        // Delete from storage
        if (doc.storage_url) {
          const path = this.extractStoragePath(doc.storage_url);
          if (path) {
            await this.supabase.storage.from('documents').remove([path]);
          }
        }

        // Delete document record
        await this.supabase.from('documents').delete().eq('id', doc.id);
      } catch (error) {
        this.logger.error(`Failed to delete document ${doc.id}: ${error.message}`);
      }
    }
  }

  /**
   * Extract storage path from URL
   */
  private extractStoragePath(url: string): string | null {
    try {
      const match = url.match(/\/documents\/(.+)$/);
      return match ? match[1] : null;
    } catch {
      return null;
    }
  }

  /**
   * Cleanup orphaned documents (no related application/user)
   */
  private async cleanupOrphanedDocuments(): Promise<number> {
    // Find documents without valid references
    const { data: orphans, error } = await this.supabase
      .from('documents')
      .select('id, storage_url')
      .is('user_id', null)
      .is('application_id', null);

    if (error || !orphans) return 0;

    let deletedCount = 0;
    for (const doc of orphans) {
      try {
        if (doc.storage_url) {
          const path = this.extractStoragePath(doc.storage_url);
          if (path) {
            await this.supabase.storage.from('documents').remove([path]);
          }
        }
        await this.supabase.from('documents').delete().eq('id', doc.id);
        deletedCount++;
      } catch (error) {
        this.logger.error(`Failed to delete orphaned document ${doc.id}: ${error.message}`);
      }
    }

    return deletedCount;
  }

  /**
   * Get retention statistics
   */
  async getRetentionStats(): Promise<{
    totalArchived: number;
    archivedByMonth: Record<string, number>;
    pendingArchival: number;
  }> {
    // Count archived applications
    const { count: totalArchived } = await this.supabase
      .from('applications_archive')
      .select('*', { count: 'exact', head: true });

    // Count by month
    const { data: monthlyData } = await this.supabase
      .from('applications_archive')
      .select('archived_at');

    const archivedByMonth: Record<string, number> = {};
    (monthlyData || []).forEach((record) => {
      const month = record.archived_at.substring(0, 7); // YYYY-MM
      archivedByMonth[month] = (archivedByMonth[month] || 0) + 1;
    });

    // Count pending archival
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.retentionDays);

    const { count: pendingArchival } = await this.supabase
      .from('applications')
      .select('*', { count: 'exact', head: true })
      .eq('current_status', 'REJECTED')
      .lt('updated_at', cutoffDate.toISOString());

    return {
      totalArchived: totalArchived || 0,
      archivedByMonth,
      pendingArchival: pendingArchival || 0,
    };
  }

  /**
   * Handle data subject deletion request (DPDP compliance)
   */
  async handleDeletionRequest(userId: string, requestedBy: string): Promise<{
    success: boolean;
    deletedRecords: Record<string, number>;
    errors: string[];
  }> {
    const deletedRecords: Record<string, number> = {};
    const errors: string[] = [];

    // Log the deletion request
    await this.auditService.log({
      entityType: 'USER',
      entityId: userId,
      action: 'DATA_DELETE',
      actorId: requestedBy,
      metadata: { type: 'DPDP_DELETION_REQUEST' },
    });

    // Delete user's documents from storage
    try {
      const { data: docs } = await this.supabase
        .from('documents')
        .select('id, storage_url')
        .eq('user_id', userId);

      if (docs) {
        for (const doc of docs) {
          if (doc.storage_url) {
            const path = this.extractStoragePath(doc.storage_url);
            if (path) {
              await this.supabase.storage.from('documents').remove([path]);
            }
          }
        }
        const { count } = await this.supabase
          .from('documents')
          .delete()
          .eq('user_id', userId);
        deletedRecords['documents'] = count || 0;
      }
    } catch (error) {
      errors.push(`Documents: ${error.message}`);
    }

    // Anonymize user record (keep for audit trail but remove PII)
    try {
      await this.supabase
        .from('users')
        .update({
          name: 'DELETED USER',
          email: `deleted-${userId.substring(0, 8)}@deleted.local`,
          mobile: null,
          address: null,
          emergency_contact: null,
          deleted_at: new Date().toISOString(),
        })
        .eq('id', userId);
      deletedRecords['users'] = 1;
    } catch (error) {
      errors.push(`User anonymization: ${error.message}`);
    }

    return {
      success: errors.length === 0,
      deletedRecords,
      errors,
    };
  }

  /**
   * Export user data (DPDP compliance - data portability)
   */
  async exportUserData(userId: string): Promise<Record<string, unknown>> {
    const exportData: Record<string, unknown> = {};

    // User profile
    const { data: user } = await this.supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    exportData.user = user;

    // Applications
    const { data: applications } = await this.supabase
      .from('applications')
      .select('*')
      .eq('student_user_id', userId);
    exportData.applications = applications;

    // Documents metadata (not actual files)
    const { data: documents } = await this.supabase
      .from('documents')
      .select('id, document_type, file_name, created_at')
      .eq('user_id', userId);
    exportData.documents = documents;

    // Payments
    const { data: payments } = await this.supabase
      .from('gateway_payments')
      .select('*')
      .eq('student_user_id', userId);
    exportData.payments = payments;

    // Leave requests
    const { data: leaves } = await this.supabase
      .from('leave_requests')
      .select('*')
      .eq('student_user_id', userId);
    exportData.leaves = leaves;

    // Consents
    const { data: consents } = await this.supabase
      .from('consent_logs')
      .select('*')
      .eq('user_id', userId);
    exportData.consents = consents;

    // Log the export
    await this.auditService.log({
      entityType: 'USER',
      entityId: userId,
      action: 'DATA_EXPORT',
      actorId: userId,
      metadata: { tables: Object.keys(exportData) },
    });

    return exportData;
  }
}
