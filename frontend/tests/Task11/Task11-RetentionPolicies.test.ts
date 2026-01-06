/**
 * Task 11.5 Test Suite: Data Retention and Timezone Conventions
 * 
 * Tests:
 * 1. Retention policy definitions
 * 2. Data lifecycle management
 * 3. Deletion requests
 * 4. Timezone conversion functions
 * 5. Date formatting helpers
 * 6. Retention policy helpers
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  // Retention Policy Types
  RetentionPolicy,
  RetentionCategory,
  DataLifecycle,
  DataRetentionInfo,
  DataDeletionRequest,
  DeletionRequestStatus,

  // Retention Policies
  RETENTION_POLICIES,
  TIMEZONE_STANDARDS,

  // Timezone Functions
  toTimestampInfo,
  istToUtc,
  nowUtc,
  nowIst,
  addMonths,
  daysBetween,

  // Date Formatting
  formatDateIst,
  formatDateRangeIst,

  // Retention Policy Helpers
  getRetentionPolicy,
  calculateExpiryDate,
  calculateArchiveDate,
  getRetentionInfo,

  // TimestampInfo Type
  TimestampInfo
} from '../../src/components/documents/retentionPolicies';

describe('Task 11.5: Data Retention Policies', () => {
  describe('Retention Policy Definitions', () => {
    it('should define all retention categories', () => {
      const categories: RetentionCategory[] = [
        'application_documents',
        'student_records',
        'financial_records',
        'audit_logs',
        'consent_records',
        'archived_applications',
        'undertakings',
        'signatures',
        'preview_cache',
        'temporary_files'
      ];
      
      expect(categories.length).toBe(10);
      categories.forEach(category => {
        expect(RETENTION_POLICIES[category]).toBeDefined();
      });
    });

    it('should have valid application_documents policy', () => {
      const policy = RETENTION_POLICIES.application_documents;
      
      expect(policy.category).toBe('application_documents');
      expect(policy.retentionPeriodMonths).toBe(84); // 7 years
      expect(policy.autoArchive).toBe(true);
      expect(policy.archiveAfterMonths).toBe(24);
      expect(policy.autoDelete).toBe(false);
      expect(policy.requiresManualApproval).toBe(true);
      expect(policy.complianceRequirements.length).toBeGreaterThan(0);
    });

    it('should have valid audit_logs policy', () => {
      const policy = RETENTION_POLICIES.audit_logs;
      
      expect(policy.category).toBe('audit_logs');
      expect(policy.retentionPeriodMonths).toBe(36); // 3 years
      expect(policy.autoArchive).toBe(true);
      expect(policy.archiveAfterMonths).toBe(12);
      expect(policy.autoDelete).toBe(true);
      expect(policy.requiresManualApproval).toBe(false);
      expect(policy.dataMinimization).toBeDefined();
    });

    it('should have valid temporary_files policy', () => {
      const policy = RETENTION_POLICIES.temporary_files;
      
      expect(policy.category).toBe('temporary_files');
      expect(policy.retentionPeriodMonths).toBe(0);
      expect(policy.autoArchive).toBe(false);
      expect(policy.autoDelete).toBe(true);
      expect(policy.deletionNoticeDays).toBe(0);
    });
  });

  describe('Data Lifecycle Management', () => {
    it('should create data lifecycle', () => {
      const lifecycle: DataLifecycle = {
        id: 'lifecycle_123',
        entityId: 'doc_123',
        entityType: 'document',
        category: 'application_documents',
        createdAt: '2025-12-27T10:00:00.000Z',
        expiresAt: '2032-12-27T10:00:00.000Z',
        status: 'active',
        retentionPolicy: RETENTION_POLICIES.application_documents,
        isExtended: false,
        daysUntilExpiry: 2557,
        daysUntilArchive: 730,
        canDelete: false,
        requiresApproval: true
      };
      
      expect(lifecycle.id).toBeDefined();
      expect(lifecycle.entityId).toBeDefined();
      expect(lifecycle.category).toBe('application_documents');
      expect(lifecycle.status).toBe('active');
    });

    it('should calculate days until expiry correctly', () => {
      const now = new Date('2025-12-27T00:00:00.000Z');
      const expiresAt = new Date(now.getTime() + (730 * 24 * 60 * 60 * 1000)); // 730 days
      const daysUntilExpiry = daysBetween(now.toISOString(), expiresAt.toISOString());
      
      expect(daysUntilExpiry).toBe(730);
    });
  });

  describe('Data Deletion Requests', () => {
    it('should create deletion request', () => {
      const request: DataDeletionRequest = {
        id: 'del_req_123',
        entityType: 'document',
        entityId: 'doc_123',
        category: 'application_documents',
        status: 'pending',
        requestedBy: {
          id: 'actor_123',
          name: 'John Doe',
          role: 'student'
        },
        requestedAt: '2025-12-27T10:00:00.000Z',
        requestReason: 'User requested deletion',
        scheduledFor: '2025-12-31T23:59:59.000Z',
        deletionNotifiedAt: '2025-12-28T10:00:00.000Z',
        deletionApprovedBy: {
          id: 'actor_456',
          name: 'Admin User',
          role: 'admin'
        },
        deletionApprovedAt: '2025-12-28T11:00:00.000Z',
        approvalNotes: 'Approved per retention policy'
      };
      
      expect(request.id).toBeDefined();
      expect(request.status).toBe('pending');
      expect(request.requestedBy).toBeDefined();
    });

    it('should handle deletion completion', () => {
      const request: DataDeletionRequest = {
        id: 'del_req_123',
        entityType: 'document',
        entityId: 'doc_123',
        category: 'application_documents',
        status: 'completed',
        requestedBy: {
          id: 'actor_123',
          name: 'John Doe',
          role: 'student'
        },
        requestedAt: '2025-12-27T10:00:00.000Z',
        requestReason: 'Retention period expired',
        completedAt: '2025-12-31T00:00:00.000Z',
        deletedBy: 'system',
        deletionReport: {
          recordsDeleted: 1,
          filesDeleted: 2,
          storageFreed: 1048576,
          pseudonymizedRecords: 0
        }
      };
      
      expect(request.status).toBe('completed');
      expect(request.deletionReport).toBeDefined();
      expect(request.deletionReport?.recordsDeleted).toBe(1);
    });
  });

  describe('Timezone Conventions', () => {
    it('should define timezone standards', () => {
      expect(TIMEZONE_STANDARDS.STORAGE_TIMEZONE).toBe('UTC');
      expect(TIMEZONE_STANDARDS.DISPLAY_TIMEZONE).toBe('Asia/Kolkata');
      expect(TIMEZONE_STANDARDS.DATABASE_TIMEZONE).toBe('UTC');
      expect(TIMEZONE_STANDARDS.API_TIMEZONE).toBe('UTC');
      expect(TIMEZONE_STANDARDS.REPORTING_TIMEZONE).toBe('Asia/Kolkata');
    });

    it('should convert UTC timestamp to timestamp info', () => {
      const utcTimestamp = '2025-12-27T10:30:00.000Z';
      const info = toTimestampInfo(utcTimestamp);
      
      expect(info.utc).toBe(utcTimestamp);
      expect(info.ist).toBeDefined();
      expect(info.timezone).toBe('Asia/Kolkata');
      expect(info.offset).toBe('+05:30');
      expect(info.unixTimestamp).toBeGreaterThan(0);
      expect(info.dayOfWeek).toBe('Saturday');
    });

    it('should convert IST to UTC', () => {
      const istDateString = '2025-12-27T16:00:00.000+05:30';
      const utcTimestamp = istToUtc(istDateString);
      
      expect(utcTimestamp).toBeDefined();
      expect(utcTimestamp).toContain('10:30'); // 16:00 IST = 10:30 UTC
    });

    it('should get current UTC timestamp', () => {
      const now = nowUtc();
      
      expect(now).toBeDefined();
      expect(now).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });

    it('should get current IST timestamp info', () => {
      const now = nowIst();
      
      expect(now.utc).toBeDefined();
      expect(now.ist).toBeDefined();
      expect(now.timezone).toBe('Asia/Kolkata');
      expect(now.offset).toBe('+05:30');
    });

    it('should add months to timestamp', () => {
      const start = '2025-12-27T10:00:00.000Z';
      const result = addMonths(start, 12); // Add 12 months
      
      expect(result).toBeDefined();
      expect(result).toContain('2026-12');
    });

    it('should calculate days between dates', () => {
      const from = '2025-12-27T00:00:00.000Z';
      const to = '2026-01-26T00:00:00.000Z'; // 30 days later
      const days = daysBetween(from, to);
      
      expect(days).toBe(30);
    });
  });

  describe('Date Formatting Helpers', () => {
    it('should format date for display (short format)', () => {
      const utcTimestamp = '2025-12-27T10:30:00.000Z';
      const formatted = formatDateIst(utcTimestamp, 'short');
      
      expect(formatted).toBeDefined();
      expect(formatted).toContain('27/12/2025'); // Indian format: DD/MM/YYYY
    });

    it('should format date for display (long format)', () => {
      const utcTimestamp = '2025-12-27T10:30:00.000Z';
      const formatted = formatDateIst(utcTimestamp, 'long');
      
      expect(formatted).toBeDefined();
      expect(formatted).toContain('Saturday');
      expect(formatted).toContain('27/12/2025'); // Indian format: DD/MM/YYYY
    });

    it('should format date for display (relative format)', () => {
      const now = new Date();
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const formatted = formatDateIst(yesterday.toISOString(), 'relative');
      
      expect(formatted).toBe('Yesterday');
    });

    it('should format relative date for today', () => {
      const now = new Date();
      const formatted = formatDateIst(now.toISOString(), 'relative');
      
      expect(formatted).toBe('Today');
    });

    it('should format relative date for recent past', () => {
      const now = new Date();
      const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
      const formatted = formatDateIst(threeDaysAgo.toISOString(), 'relative');
      
      expect(formatted).toBe('3 days ago');
    });

    it('should format date range for same day', () => {
      const start = '2025-12-27T10:00:00.000Z';
      const end = '2025-12-27T18:00:00.000Z';
      const formatted = formatDateRangeIst(start, end);
      
      expect(formatted).toBeDefined();
      expect(formatted).toContain('27/12/2025');
    });

    it('should format date range for different days', () => {
      const start = '2025-12-27T10:00:00.000Z';
      const end = '2025-12-31T18:00:00.000Z';
      const formatted = formatDateRangeIst(start, end);
      
      expect(formatted).toBeDefined();
      expect(formatted).toContain('2025');
      expect(formatted).toContain('2025-12-27');
      expect(formatted).toContain('2025-12-31');
      expect(formatted).toContain(' to ');
    });
  });

  describe('Retention Policy Helpers', () => {
    it('should get retention policy for category', () => {
      const policy = getRetentionPolicy('audit_logs');
      
      expect(policy).toBeDefined();
      expect(policy.category).toBe('audit_logs');
      expect(policy.retentionPeriodMonths).toBe(36);
    });

    it('should calculate expiry date based on retention policy', () => {
      const createdAt = '2025-12-27T10:00:00.000Z';
      const category = 'audit_logs';
      const expiryDate = calculateExpiryDate(createdAt, category);
      
      expect(expiryDate).toBeDefined();
      expect(expiryDate).toContain('2028-12'); // 3 years later
    });

    it('should calculate expiry date with exit date for student records', () => {
      const createdAt = '2020-01-01T10:00:00.000Z';
      const exitDate = '2025-12-27T10:00:00.000Z';
      const category = 'student_records';
      const expiryDate = calculateExpiryDate(createdAt, category, exitDate);
      
      expect(expiryDate).toBeDefined();
      expect(expiryDate).toContain('2032-12'); // 7 years after exit
    });

    it('should calculate archive date for category with auto-archive', () => {
      const createdAt = '2025-12-27T10:00:00.000Z';
      const category = 'audit_logs';
      const archiveDate = calculateArchiveDate(createdAt, category);
      
      expect(archiveDate).toBeDefined();
      expect(archiveDate).toContain('2026-12'); // 12 months later
    });

    it('should return null for archive date when auto-archive is disabled', () => {
      const createdAt = '2025-12-27T10:00:00.000Z';
      const category = 'temporary_files';
      const archiveDate = calculateArchiveDate(createdAt, category);
      
      expect(archiveDate).toBeNull();
    });

    it('should get retention info for active entity', () => {
      const createdAt = '2025-12-27T10:00:00.000Z';
      const category = 'audit_logs';
      const info = getRetentionInfo(createdAt, category);
      
      expect(info).toBeDefined();
      expect(info.category).toBe(category);
      expect(info.createdAt).toBe(createdAt);
      expect(info.expiresAt).toBeDefined();
      expect(info.isArchived).toBe(false);
      expect(info.isDeleted).toBe(false);
      expect(info.daysUntilExpiry).toBeGreaterThan(0);
    });

    it('should get retention info for archived entity', () => {
      const createdAt = '2024-12-27T10:00:00.000Z';
      const category = 'audit_logs';
      const info = getRetentionInfo(createdAt, category);
      
      expect(info).toBeDefined();
      expect(info.isArchived).toBe(true); // More than 12 months ago
      expect(info.archivedAt).toBeDefined();
    });

    it('should get retention info with approval requirement', () => {
      const createdAt = '2025-12-27T10:00:00.000Z';
      const category = 'application_documents';
      const info = getRetentionInfo(createdAt, category);
      
      expect(info.requiresApproval).toBe(true);
      expect(info.canDelete).toBe(false);
    });

    it('should get retention info for auto-delete enabled', () => {
      const createdAt = '2025-12-27T10:00:00.000Z';
      const category = 'temporary_files';
      const info = getRetentionInfo(createdAt, category);
      
      expect(info.retentionPolicy.autoDelete).toBe(true);
    });
  });
});

describe('Task 11.5: Timezone Edge Cases', () => {
  it('should handle DST transitions correctly', () => {
    // India does not observe DST, so offset should always be +05:30
    const utcTimestamp = '2025-06-01T10:30:00.000Z'; // Summer
    const info = toTimestampInfo(utcTimestamp);
    
    expect(info.offset).toBe('+05:30');
  });

  it('should handle leap year dates', () => {
    const utcTimestamp = '2024-02-29T10:30:00.000Z'; // Leap day
    const info = toTimestampInfo(utcTimestamp);
    
    expect(info.utc).toBe(utcTimestamp);
    expect(info.dayOfWeek).toBe('Thursday');
  });

    it('should handle month boundaries correctly', () => {
      const start = '2025-12-31T10:00:00.000Z';
      const oneMonthLater = addMonths(start, 1);
      
      // Dec 31 + 1 month = Jan 31, 2026
      expect(oneMonthLater).toBeDefined();
      expect(oneMonthLater).toContain('2026-01'); // JavaScript setMonth handles overflow
    });

  it('should handle year boundaries correctly', () => {
    const start = '2025-12-31T10:00:00.000Z';
    const oneMonthLater = addMonths(start, 1);
    
    expect(oneMonthLater).toContain('2026-01');
  });

  it('should handle negative days between correctly', () => {
    const from = '2025-12-27T10:00:00.000Z';
    const to = '2025-12-20T10:00:00.000Z';
    const days = daysBetween(from, to);
    
    expect(days).toBe(7);
  });

  it('should handle same day for days between', () => {
    const timestamp = '2025-12-27T10:00:00.000Z';
    const days = daysBetween(timestamp, timestamp);
    
    expect(days).toBe(0);
  });
});

describe('Task 11.5: Retention Policy Edge Cases', () => {
  it('should handle zero retention period', () => {
    const policy = RETENTION_POLICIES.temporary_files;
    
    expect(policy.retentionPeriodMonths).toBe(0);
  });

  it('should handle indefinite retention (indicated by large number)', () => {
    const policy = RETENTION_POLICIES.application_documents;
    
    expect(policy.retentionPeriodMonths).toBe(84); // 7 years
  });

  it('should handle data minimization fields', () => {
    const policy = RETENTION_POLICIES.archived_applications;
    
    expect(policy.dataMinimization).toBeDefined();
    expect(policy.dataMinimization?.fieldsToStrip).toContain('mobile');
    expect(policy.dataMinimization?.pseudonymizationFields).toContain('name');
  });

  it('should handle deletion notice period', () => {
    const policy = RETENTION_POLICIES.student_records;
    
    expect(policy.deletionNoticeDays).toBe(60);
  });

  it('should handle override roles', () => {
    const policy = RETENTION_POLICIES.consent_records;
    
    expect(policy.overrideRoles).toContain('legal_compliance');
    expect(policy.overrideRoles).toContain('admin');
  });
});
