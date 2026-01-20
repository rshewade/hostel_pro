import {
  Injectable,
  Inject,
  Logger,
} from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { SUPABASE_CLIENT } from '../supabase/supabase.provider';
import { SupabaseClient } from '@supabase/supabase-js';
import { ConfigService } from '@nestjs/config';
import { AuditService } from './audit.service';
import * as PDFDocument from 'pdfkit';

export interface MonthlyReportData {
  reportMonth: string;
  generatedAt: string;
  summary: {
    totalApplications: number;
    newApplications: number;
    approvedApplications: number;
    rejectedApplications: number;
    totalPayments: number;
    totalPaymentAmount: number;
    totalDocuments: number;
    verifiedDocuments: number;
    totalLeaveRequests: number;
    consentRenewals: number;
    failedLogins: number;
  };
  auditStats: {
    totalActions: number;
    byEntityType: Record<string, number>;
    byAction: Record<string, number>;
    uniqueActors: number;
  };
  suspiciousActivity: {
    multipleFailedLogins: { userId: string; count: number }[];
    unusualAccess: { userId: string; action: string; count: number }[];
  };
  complianceStatus: {
    expiringConsents: number;
    pendingArchival: number;
    encryptionEnabled: boolean;
  };
}

@Injectable()
export class AuditReportService {
  private readonly logger = new Logger(AuditReportService.name);
  private readonly isEnabled: boolean;

  constructor(
    @Inject(SUPABASE_CLIENT) private supabase: SupabaseClient,
    private configService: ConfigService,
    private auditService: AuditService,
  ) {
    this.isEnabled = this.configService.get<string>('ENABLE_AUDIT_REPORTS') === 'true';
  }

  /**
   * Monthly report generation job - runs on 1st of each month at 6 AM
   */
  @Cron('0 6 1 * *')
  async generateMonthlyReport(): Promise<void> {
    if (!this.isEnabled) {
      this.logger.log('Audit reports are disabled');
      return;
    }

    this.logger.log('Starting monthly audit report generation');

    try {
      // Get previous month
      const now = new Date();
      const reportMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const monthStr = reportMonth.toISOString().substring(0, 7);

      // Generate report data
      const reportData = await this.collectReportData(monthStr);

      // Generate PDF
      const pdfBuffer = await this.generatePDF(reportData);

      // Upload to storage
      const reportUrl = await this.uploadReport(pdfBuffer, monthStr);

      // Log report generation
      await this.auditService.log({
        entityType: 'AUDIT_REPORT',
        entityId: `monthly-${monthStr}`,
        action: 'CREATE',
        metadata: {
          reportMonth: monthStr,
          reportUrl,
          summary: reportData.summary,
        },
      });

      // Store report metadata
      await this.storeReportMetadata(monthStr, reportUrl, reportData);

      this.logger.log(`Monthly report generated: ${reportUrl}`);

      // TODO: Send notification to Trustees
    } catch (error) {
      this.logger.error(`Report generation failed: ${error.message}`);
    }
  }

  /**
   * Collect all data for the monthly report
   */
  async collectReportData(monthStr: string): Promise<MonthlyReportData> {
    const startDate = `${monthStr}-01T00:00:00Z`;
    const endDate = new Date(
      parseInt(monthStr.split('-')[0]),
      parseInt(monthStr.split('-')[1]),
      0, // Last day of month
      23, 59, 59,
    ).toISOString();

    // Get application stats
    const applicationStats = await this.getApplicationStats(startDate, endDate);

    // Get payment stats
    const paymentStats = await this.getPaymentStats(startDate, endDate);

    // Get document stats
    const documentStats = await this.getDocumentStats(startDate, endDate);

    // Get leave stats
    const leaveStats = await this.getLeaveStats(startDate, endDate);

    // Get consent stats
    const consentStats = await this.getConsentStats(startDate, endDate);

    // Get audit stats
    const auditStats = await this.auditService.getAuditStats(startDate, endDate);

    // Get suspicious activity
    const suspicious = await this.auditService.detectSuspiciousActivity(24 * 30); // Last 30 days

    // Get compliance status
    const complianceStatus = await this.getComplianceStatus();

    return {
      reportMonth: monthStr,
      generatedAt: new Date().toISOString(),
      summary: {
        totalApplications: applicationStats.total,
        newApplications: applicationStats.new,
        approvedApplications: applicationStats.approved,
        rejectedApplications: applicationStats.rejected,
        totalPayments: paymentStats.count,
        totalPaymentAmount: paymentStats.amount,
        totalDocuments: documentStats.total,
        verifiedDocuments: documentStats.verified,
        totalLeaveRequests: leaveStats.total,
        consentRenewals: consentStats.renewals,
        failedLogins: auditStats.failedLogins,
      },
      auditStats: {
        totalActions: auditStats.totalActions,
        byEntityType: auditStats.byEntityType,
        byAction: auditStats.byAction,
        uniqueActors: auditStats.uniqueActors,
      },
      suspiciousActivity: {
        multipleFailedLogins: suspicious.multipleFailedLogins,
        unusualAccess: suspicious.unusualAccessPatterns,
      },
      complianceStatus,
    };
  }

  /**
   * Get application statistics for the period
   */
  private async getApplicationStats(
    startDate: string,
    endDate: string,
  ): Promise<{ total: number; new: number; approved: number; rejected: number }> {
    const { data } = await this.supabase
      .from('applications')
      .select('current_status, created_at')
      .gte('created_at', startDate)
      .lte('created_at', endDate);

    const stats = { total: 0, new: 0, approved: 0, rejected: 0 };
    (data || []).forEach((app) => {
      stats.total++;
      if (app.current_status === 'APPROVED') stats.approved++;
      if (app.current_status === 'REJECTED') stats.rejected++;
      if (['DRAFT', 'SUBMITTED'].includes(app.current_status)) stats.new++;
    });

    return stats;
  }

  /**
   * Get payment statistics for the period
   */
  private async getPaymentStats(
    startDate: string,
    endDate: string,
  ): Promise<{ count: number; amount: number }> {
    const { data } = await this.supabase
      .from('gateway_payments')
      .select('amount')
      .eq('status', 'SUCCESS')
      .gte('paid_at', startDate)
      .lte('paid_at', endDate);

    let amount = 0;
    (data || []).forEach((p) => {
      amount += p.amount || 0;
    });

    return { count: data?.length || 0, amount };
  }

  /**
   * Get document statistics for the period
   */
  private async getDocumentStats(
    startDate: string,
    endDate: string,
  ): Promise<{ total: number; verified: number }> {
    const { data } = await this.supabase
      .from('documents')
      .select('verification_status')
      .gte('created_at', startDate)
      .lte('created_at', endDate);

    let verified = 0;
    (data || []).forEach((d) => {
      if (d.verification_status === 'VERIFIED') verified++;
    });

    return { total: data?.length || 0, verified };
  }

  /**
   * Get leave request statistics for the period
   */
  private async getLeaveStats(
    startDate: string,
    endDate: string,
  ): Promise<{ total: number }> {
    const { count } = await this.supabase
      .from('leave_requests')
      .select('*', { count: 'exact', head: true })
      .gte('applied_at', startDate)
      .lte('applied_at', endDate);

    return { total: count || 0 };
  }

  /**
   * Get consent statistics for the period
   */
  private async getConsentStats(
    startDate: string,
    endDate: string,
  ): Promise<{ renewals: number }> {
    const { count } = await this.supabase
      .from('consent_logs')
      .select('*', { count: 'exact', head: true })
      .gte('granted_at', startDate)
      .lte('granted_at', endDate);

    return { renewals: count || 0 };
  }

  /**
   * Get current compliance status
   */
  private async getComplianceStatus(): Promise<{
    expiringConsents: number;
    pendingArchival: number;
    encryptionEnabled: boolean;
  }> {
    // Consents expiring in next 30 days
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);

    const { count: expiringConsents } = await this.supabase
      .from('consent_logs')
      .select('*', { count: 'exact', head: true })
      .is('revoked_at', null)
      .lte('expires_at', futureDate.toISOString())
      .gte('expires_at', new Date().toISOString());

    // Applications pending archival
    const retentionDays = parseInt(
      this.configService.get<string>('DATA_RETENTION_DAYS') || '365',
      10,
    );
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    const { count: pendingArchival } = await this.supabase
      .from('applications')
      .select('*', { count: 'exact', head: true })
      .eq('current_status', 'REJECTED')
      .lt('updated_at', cutoffDate.toISOString());

    return {
      expiringConsents: expiringConsents || 0,
      pendingArchival: pendingArchival || 0,
      encryptionEnabled: !!this.configService.get<string>('ENCRYPTION_KEY'),
    };
  }

  /**
   * Generate PDF report
   */
  private async generatePDF(data: MonthlyReportData): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ size: 'A4', margin: 50 });
        const chunks: Buffer[] = [];

        doc.on('data', (chunk: Buffer) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        // Title
        doc.fontSize(20).text('Monthly Audit Report', { align: 'center' });
        doc.fontSize(12).text(`Report Period: ${data.reportMonth}`, { align: 'center' });
        doc.moveDown(2);

        // Summary Section
        doc.fontSize(16).text('Executive Summary', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(10);
        doc.text(`Generated: ${new Date(data.generatedAt).toLocaleString()}`);
        doc.moveDown();

        // Application Stats
        doc.fontSize(14).text('Application Statistics');
        doc.fontSize(10);
        doc.text(`  Total Applications: ${data.summary.totalApplications}`);
        doc.text(`  New Applications: ${data.summary.newApplications}`);
        doc.text(`  Approved: ${data.summary.approvedApplications}`);
        doc.text(`  Rejected: ${data.summary.rejectedApplications}`);
        doc.moveDown();

        // Payment Stats
        doc.fontSize(14).text('Payment Statistics');
        doc.fontSize(10);
        doc.text(`  Total Payments: ${data.summary.totalPayments}`);
        doc.text(`  Total Amount: ₹${data.summary.totalPaymentAmount.toLocaleString()}`);
        doc.moveDown();

        // Document Stats
        doc.fontSize(14).text('Document Statistics');
        doc.fontSize(10);
        doc.text(`  Total Documents: ${data.summary.totalDocuments}`);
        doc.text(`  Verified: ${data.summary.verifiedDocuments}`);
        doc.moveDown();

        // Audit Activity
        doc.fontSize(14).text('Audit Activity');
        doc.fontSize(10);
        doc.text(`  Total Actions: ${data.auditStats.totalActions}`);
        doc.text(`  Unique Users: ${data.auditStats.uniqueActors}`);
        doc.text(`  Failed Logins: ${data.summary.failedLogins}`);
        doc.moveDown();

        // Suspicious Activity
        if (
          data.suspiciousActivity.multipleFailedLogins.length > 0 ||
          data.suspiciousActivity.unusualAccess.length > 0
        ) {
          doc.fontSize(14).fillColor('red').text('⚠️ Suspicious Activity Detected');
          doc.fillColor('black').fontSize(10);

          if (data.suspiciousActivity.multipleFailedLogins.length > 0) {
            doc.text('  Multiple Failed Logins:');
            data.suspiciousActivity.multipleFailedLogins.forEach((item) => {
              doc.text(`    - User ${item.userId.substring(0, 8)}...: ${item.count} attempts`);
            });
          }

          if (data.suspiciousActivity.unusualAccess.length > 0) {
            doc.text('  Unusual Access Patterns:');
            data.suspiciousActivity.unusualAccess.forEach((item) => {
              doc.text(`    - User ${item.userId.substring(0, 8)}...: ${item.count} ${item.action} actions`);
            });
          }
          doc.moveDown();
        }

        // Compliance Status
        doc.fontSize(14).text('Compliance Status');
        doc.fontSize(10);
        doc.text(`  Encryption: ${data.complianceStatus.encryptionEnabled ? '✓ Enabled' : '✗ Disabled'}`);
        doc.text(`  Consents Expiring (30 days): ${data.complianceStatus.expiringConsents}`);
        doc.text(`  Pending Data Archival: ${data.complianceStatus.pendingArchival}`);
        doc.moveDown();

        // Footer
        doc.moveDown(2);
        doc.fontSize(8).fillColor('gray');
        doc.text('This report is auto-generated for compliance purposes.', { align: 'center' });
        doc.text('Jain Hostel Management System - Confidential', { align: 'center' });

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Upload report to Supabase Storage
   */
  private async uploadReport(
    pdfBuffer: Buffer,
    monthStr: string,
  ): Promise<string> {
    const fileName = `audit-reports/monthly-${monthStr}.pdf`;

    const { error } = await this.supabase.storage
      .from('documents')
      .upload(fileName, pdfBuffer, {
        contentType: 'application/pdf',
        upsert: true,
      });

    if (error) {
      throw new Error(`Failed to upload report: ${error.message}`);
    }

    const { data } = this.supabase.storage
      .from('documents')
      .getPublicUrl(fileName);

    return data.publicUrl;
  }

  /**
   * Store report metadata in database
   */
  private async storeReportMetadata(
    monthStr: string,
    reportUrl: string,
    data: MonthlyReportData,
  ): Promise<void> {
    await this.supabase.from('audit_reports').insert({
      report_month: monthStr,
      report_url: reportUrl,
      summary: data.summary,
      generated_at: data.generatedAt,
    });
  }

  /**
   * Get list of generated reports
   */
  async getReports(limit: number = 12): Promise<{
    reportMonth: string;
    reportUrl: string;
    generatedAt: string;
  }[]> {
    const { data, error } = await this.supabase
      .from('audit_reports')
      .select('report_month, report_url, generated_at')
      .order('report_month', { ascending: false })
      .limit(limit);

    if (error) {
      this.logger.error(`Failed to get reports: ${error.message}`);
      return [];
    }

    return (data || []).map((r) => ({
      reportMonth: r.report_month,
      reportUrl: r.report_url,
      generatedAt: r.generated_at,
    }));
  }

  /**
   * Generate report on demand
   */
  async generateOnDemandReport(monthStr: string): Promise<string> {
    const reportData = await this.collectReportData(monthStr);
    const pdfBuffer = await this.generatePDF(reportData);
    const reportUrl = await this.uploadReport(pdfBuffer, monthStr);
    await this.storeReportMetadata(monthStr, reportUrl, reportData);
    return reportUrl;
  }
}
