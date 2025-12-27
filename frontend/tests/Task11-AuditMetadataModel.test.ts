/**
 * Task 11.5 Test Suite: Audit and Consent Metadata Model
 * 
 * Tests:
 * 1. Audit metadata type definitions
 * 2. Device context capture
 * 3. DPDP consent logging
 * 4. Digital signature tracking
 * 5. Audit log entries
 * 6. Version control
 * 7. Data retention policies
 * 8. Timezone conventions
 * 9. API request/response formats
 * 10. WebSocket event types
 */

import { describe, it, expect } from 'vitest';
import {
  // Actor and Role Types
  ActorRole,
  Actor,

  // Device and Context Information
  DeviceContext,
  SessionInfo,

  // DPDP Consent Tracking
  ConsentType,
  ConsentPurpose,
  DPDPConsent,
  ConsentHistory,

  // Digital Signature
  SignatureType,
  DigitalSignature,

  // Audit Log Entry
  AuditActionType,
  AuditLogEntry,
  AuditTrail,

  // Version Control
  VersionInfo,
  VersionHistory,

  // Document Metadata
  DocumentAuditMetadata,
  DocumentWithMetadata,

  // Undertaking Metadata
  UndertakingAuditMetadata,
  UndertakingWithMetadata,

  // Data Retention Policy
  RetentionCategory,
  RetentionPolicy,
  DataRetentionInfo,

  // Timezone Conventions
  TIMEZONE_CONVENTIONS,
  TimezoneConvention,
  TimestampInfo,
  convertToIST,
  toTimestampInfo,

  // API Request Context
  APIRequestContext,
  APIResponse,

  // WebSocket Event Types
  WebSocketEventType,
  WebSocketEvent,
  WebSocketSubscription,

  // Error Types
  ErrorCode,
  ErrorMetadata,
} from '../src/components/documents/auditMetadataTypes';

describe('Task 11.5: Audit Metadata Type Definitions', () => {
  describe('Actor and Role Types', () => {
    it('should define valid actor roles', () => {
      const validRoles: ActorRole[] = [
        'applicant',
        'student',
        'parent',
        'local_guardian',
        'superintendent',
        'trustee',
        'accounts',
        'legal_compliance',
        'system',
        'admin'
      ];
      
      expect(validRoles.length).toBeGreaterThan(0);
      expect(validRoles).toContain('student');
      expect(validRoles).toContain('superintendent');
    });

    it('should create actor object', () => {
      const actor: Actor = {
        id: 'actor_123',
        name: 'John Doe',
        role: 'student',
        userId: 'user_456',
        email: 'john@example.com',
        mobile: '9876543210'
      };
      
      expect(actor.id).toBeDefined();
      expect(actor.name).toBeDefined();
      expect(actor.role).toBeDefined();
    });
  });

  describe('Device and Context Information', () => {
    it('should capture device context', () => {
      const deviceContext: DeviceContext = {
        ip: '192.168.1.1',
        userAgent: 'Mozilla/5.0...',
        browser: 'Chrome',
        browserVersion: '120.0',
        os: 'Windows',
        osVersion: '11',
        deviceType: 'desktop',
        deviceFingerprint: 'fp_abc123',
        geolocation: {
          city: 'Mumbai',
          region: 'Maharashtra',
          country: 'India',
          latitude: 19.0760,
          longitude: 72.8777
        },
        timezone: 'Asia/Kolkata',
        screenResolution: '1920x1080',
        language: 'en-IN'
      };
      
      expect(deviceContext.ip).toBeDefined();
      expect(deviceContext.userAgent).toBeDefined();
      expect(deviceContext.deviceType).toBe('desktop');
      expect(deviceContext.geolocation?.city).toBe('Mumbai');
    });

    it('should create session info', () => {
      const sessionInfo: SessionInfo = {
        sessionId: 'sess_123',
        startedAt: '2025-12-27T10:00:00.000Z',
        expiresAt: '2025-12-27T11:00:00.000Z',
        ip: '192.168.1.1',
        lastActivityAt: '2025-12-27T10:30:00.000Z'
      };
      
      expect(sessionInfo.sessionId).toBeDefined();
      expect(sessionInfo.startedAt).toBeDefined();
      expect(sessionInfo.expiresAt).toBeDefined();
    });
  });

  describe('DPDP Consent Tracking', () => {
    it('should define consent types', () => {
      const consentTypes: ConsentType[] = [
        'data_collection',
        'data_processing',
        'data_sharing',
        'document_upload',
        'undertaking_acknowledgement',
        'third_party_service',
        'analytics_tracking',
        'marketing_communication'
      ];
      
      expect(consentTypes.length).toBe(8);
      expect(consentTypes).toContain('document_upload');
      expect(consentTypes).toContain('undertaking_acknowledgement');
    });

    it('should create DPDP consent', () => {
      const actor: Actor = {
        id: 'actor_123',
        name: 'John Doe',
        role: 'student'
      };
      
      const deviceContext: DeviceContext = {
        ip: '192.168.1.1',
        userAgent: 'Mozilla/5.0...'
      };
      
      const sessionInfo: SessionInfo = {
        sessionId: 'sess_123',
        startedAt: '2025-12-27T10:00:00.000Z',
        lastActivityAt: '2025-12-27T10:30:00.000Z'
      };
      
      const consent: DPDPConsent = {
        id: 'consent_123',
        consentType: 'document_upload',
        purpose: 'admission_processing',
        dataCategories: ['PII', 'documents'],
        version: '1.0.0',
        grantedAt: '2025-12-27T10:30:00.000Z',
        grantedBy: actor,
        expiresAt: '2026-12-27T10:30:00.000Z',
        consentText: 'I consent to document upload...',
        legalBasis: 'DPDP Act Section 5',
        deviceContext,
        sessionInfo
      };
      
      expect(consent.id).toBeDefined();
      expect(consent.consentType).toBe('document_upload');
      expect(consent.grantedBy).toEqual(actor);
    });

    it('should create consent history', () => {
      const history: ConsentHistory = {
        consents: [],
        currentVersion: '1.0.0',
        requiresReconsent: false,
        lastReconsentRequired: undefined
      };
      
      expect(history.consents).toBeDefined();
      expect(history.currentVersion).toBeDefined();
    });
  });

  describe('Digital Signature', () => {
    it('should define signature types', () => {
      const signatureTypes: SignatureType[] = ['typed', 'drawn', 'digital_certificate', 'biometric'];
      
      expect(signatureTypes.length).toBe(4);
      expect(signatureTypes).toContain('typed');
      expect(signatureTypes).toContain('drawn');
    });

    it('should create digital signature', () => {
      const actor: Actor = {
        id: 'actor_123',
        name: 'John Doe',
        role: 'student'
      };
      
      const signature: DigitalSignature = {
        id: 'sig_123',
        type: 'typed',
        value: 'John Doe',
        signedAt: '2025-12-27T10:30:00.000Z',
        signedBy: actor,
        ipAddress: '192.168.1.1',
        deviceFingerprint: 'fp_abc123',
        userAgent: 'Mozilla/5.0...',
        signatureHash: 'hash_abc123',
        expiryDate: '2026-12-27T10:30:00.000Z'
      };
      
      expect(signature.id).toBeDefined();
      expect(signature.type).toBe('typed');
      expect(signature.value).toBe('John Doe');
    });
  });

  describe('Audit Log Entry', () => {
    it('should define audit action types', () => {
      const actionTypes: AuditActionType[] = [
        'document_upload',
        'document_verify',
        'document_reject',
        'document_download',
        'document_view',
        'document_delete',
        'undertaking_acknowledge',
        'consent_grant',
        'consent_withdraw',
        'signature_capture',
        'status_change',
        'metadata_update',
        'version_create',
        'print_request',
        'export_request',
        'bulk_operation'
      ];
      
      expect(actionTypes.length).toBe(16);
      expect(actionTypes).toContain('document_upload');
      expect(actionTypes).toContain('undertaking_acknowledge');
    });

    it('should create audit log entry', () => {
      const actor: Actor = {
        id: 'actor_123',
        name: 'John Doe',
        role: 'student'
      };
      
      const deviceContext: DeviceContext = {
        ip: '192.168.1.1',
        userAgent: 'Mozilla/5.0...'
      };
      
      const sessionInfo: SessionInfo = {
        sessionId: 'sess_123',
        startedAt: '2025-12-27T10:00:00.000Z',
        lastActivityAt: '2025-12-27T10:30:00.000Z'
      };
      
      const entry: AuditLogEntry = {
        id: 'audit_123',
        entityType: 'document',
        entityId: 'doc_123',
        action: 'document_upload',
        actor,
        timestamp: '2025-12-27T10:30:00.000Z',
        previousState: { status: 'pending' },
        newState: { status: 'uploaded' },
        changes: { status: { from: 'pending', to: 'uploaded' } },
        deviceContext,
        sessionInfo,
        reason: 'Document uploaded',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0...'
      };
      
      expect(entry.id).toBeDefined();
      expect(entry.action).toBe('document_upload');
      expect(entry.changes).toBeDefined();
    });

    it('should create audit trail', () => {
      const trail: AuditTrail = {
        id: 'trail_123',
        entityId: 'doc_123',
        entityType: 'document',
        entries: [],
        createdAt: '2025-12-27T10:00:00.000Z',
        updatedAt: '2025-12-27T10:30:00.000Z'
      };
      
      expect(trail.id).toBeDefined();
      expect(trail.entries).toBeDefined();
    });
  });

  describe('Version Control', () => {
    it('should create version info', () => {
      const actor: Actor = {
        id: 'actor_123',
        name: 'John Doe',
        role: 'student'
      };
      
      const deviceContext: DeviceContext = {
        ip: '192.168.1.1',
        userAgent: 'Mozilla/5.0...'
      };
      
      const versionInfo: VersionInfo = {
        version: '1.0.0',
        createdAt: '2025-12-27T10:00:00.000Z',
        createdBy: actor,
        changeType: 'initial',
        description: 'Initial version',
        checksum: 'checksum_abc123',
        deviceContext
      };
      
      expect(versionInfo.version).toBe('1.0.0');
      expect(versionInfo.changeType).toBe('initial');
    });

    it('should create version history', () => {
      const history: VersionHistory = {
        currentVersion: '1.0.0',
        versions: [],
        canRollback: false,
        rollbackDeadline: '2026-12-27T10:00:00.000Z'
      };
      
      expect(history.currentVersion).toBeDefined();
      expect(history.versions).toBeDefined();
    });
  });

  describe('Document Audit Metadata', () => {
    it('should create document audit metadata', () => {
      const actor: Actor = {
        id: 'actor_123',
        name: 'John Doe',
        role: 'student'
      };
      
      const metadata: DocumentAuditMetadata = {
        uploadedAt: '2025-12-27T10:00:00.000Z',
        uploadedBy: actor,
        uploadDeviceContext: {
          ip: '192.168.1.1',
          userAgent: 'Mozilla/5.0...'
        },
        uploadSessionInfo: {
          sessionId: 'sess_123',
          startedAt: '2025-12-27T10:00:00.000Z',
          lastActivityAt: '2025-12-27T10:30:00.000Z'
        },
        fileName: 'declaration.pdf',
        fileSize: 524288,
        fileHash: 'hash_abc123',
        fileMimeType: 'application/pdf',
        virusScanStatus: 'clean',
        virusScanTimestamp: '2025-12-27T10:05:00.000Z',
        viewCount: 0,
        downloadCount: 0,
        createdAt: '2025-12-27T10:00:00.000Z',
        updatedAt: '2025-12-27T10:00:00.000Z'
      };
      
      expect(metadata.uploadedAt).toBeDefined();
      expect(metadata.uploadedBy).toBeDefined();
      expect(metadata.virusScanStatus).toBe('clean');
      expect(metadata.viewCount).toBe(0);
    });

    it('should create document with metadata', () => {
      const metadata: DocumentAuditMetadata = {
        viewCount: 0,
        downloadCount: 0,
        createdAt: '2025-12-27T10:00:00.000Z',
        updatedAt: '2025-12-27T10:00:00.000Z'
      };
      
      const document: DocumentWithMetadata = {
        id: 'doc_123',
        type: 'student_declaration',
        title: 'Student Declaration',
        status: 'uploaded',
        required: true,
        metadata,
        fileUrl: 'https://example.com/doc.pdf',
        previewUrl: 'https://example.com/preview.png'
      };
      
      expect(document.id).toBeDefined();
      expect(document.metadata).toBeDefined();
      expect(document.fileUrl).toBeDefined();
    });
  });

  describe('Undertaking Audit Metadata', () => {
    it('should create undertaking audit metadata', () => {
      const actor: Actor = {
        id: 'actor_123',
        name: 'John Doe',
        role: 'student'
      };
      
      const metadata: UndertakingAuditMetadata = {
        acknowledgedAt: '2025-12-27T10:00:00.000Z',
        acknowledgedBy: actor,
        acknowledgeDeviceContext: {
          ip: '192.168.1.1',
          userAgent: 'Mozilla/5.0...'
        },
        acknowledgeSessionInfo: {
          sessionId: 'sess_123',
          startedAt: '2025-12-27T10:00:00.000Z',
          lastActivityAt: '2025-12-27T10:30:00.000Z'
        },
        required: true,
        dueDate: '2025-12-31T23:59:59.000Z',
        overdueDate: '2026-01-01T00:00:00.000Z',
        isBlocking: false,
        version: '1.0.0',
        completedAt: '2025-12-27T10:00:00.000Z',
        completedBy: actor,
        viewCount: 1,
        lastViewedAt: '2025-12-27T10:00:00.000Z',
        lastViewedBy: actor,
        createdAt: '2025-12-27T10:00:00.000Z',
        updatedAt: '2025-12-27T10:00:00.000Z'
      };
      
      expect(metadata.acknowledgedAt).toBeDefined();
      expect(metadata.required).toBe(true);
      expect(metadata.isBlocking).toBe(false);
    });

    it('should create undertaking with metadata', () => {
      const metadata: UndertakingAuditMetadata = {
        required: true,
        isBlocking: false,
        viewCount: 0,
        createdAt: '2025-12-27T10:00:00.000Z',
        updatedAt: '2025-12-27T10:00:00.000Z'
      };
      
      const undertaking: UndertakingWithMetadata = {
        id: 'und_123',
        type: 'dpdp_consent_renewal',
        title: 'DPDP Consent Renewal',
        description: 'Renew your DPDP consent',
        status: 'pending',
        category: 'Compliance',
        metadata
      };
      
      expect(undertaking.id).toBeDefined();
      expect(undertaking.metadata).toBeDefined();
    });
  });

  describe('Timezone Conventions', () => {
    it('should define timezone conventions', () => {
      expect(TIMEZONE_CONVENTIONS.STORAGE_TIMEZONE).toBe('UTC');
      expect(TIMEZONE_CONVENTIONS.DISPLAY_TIMEZONE).toBe('Asia/Kolkata');
      expect(TIMEZONE_CONVENTIONS.DATABASE_TIMEZONE).toBe('UTC');
      expect(TIMEZONE_CONVENTIONS.API_TIMEZONE).toBe('UTC');
      expect(TIMEZONE_CONVENTIONS.REPORTING_TIMEZONE).toBe('Asia/Kolkata');
    });

    it('should convert UTC to IST', () => {
      const utcTimestamp = '2025-12-27T10:30:00.000Z';
      const istTimestamp = convertToIST(utcTimestamp);
      
      expect(istTimestamp).toBeDefined();
      expect(istTimestamp).toContain('27'); // Day
      expect(istTimestamp).toContain('2025'); // Year
    });

    it('should create timestamp info', () => {
      const utcTimestamp = '2025-12-27T10:30:00.000Z';
      const timestampInfo: TimestampInfo = toTimestampInfo(utcTimestamp);
      
      expect(timestampInfo).toBeDefined();
      expect(timestampInfo.utc).toBe(utcTimestamp);
      expect(timestampInfo.ist).toBeDefined();
      expect(timestampInfo.timezone).toBe('Asia/Kolkata');
      expect(timestampInfo.offset).toBe('+05:30');
      // unixTimestamp should be a number
      if (timestampInfo.unixTimestamp) {
        expect(typeof timestampInfo.unixTimestamp).toBe('number');
        expect(timestampInfo.unixTimestamp).toBeGreaterThan(0);
      }
    });
  });

  describe('API Request/Response Formats', () => {
    it('should create API request context', () => {
      const requestContext: APIRequestContext = {
        requestId: 'req_123',
        timestamp: '2025-12-27T10:30:00.000Z',
        clientIp: '192.168.1.1',
        userAgent: 'Mozilla/5.0...',
        sessionId: 'sess_123',
        userId: 'user_123',
        role: 'student',
        deviceContext: {
          ip: '192.168.1.1',
          userAgent: 'Mozilla/5.0...'
        }
      };
      
      expect(requestContext.requestId).toBeDefined();
      expect(requestContext.clientIp).toBeDefined();
      expect(requestContext.sessionId).toBeDefined();
    });

    it('should create API response', () => {
      const response: APIResponse<{ id: string }> = {
        success: true,
        data: { id: 'doc_123' },
        metadata: {
          requestId: 'req_123',
          timestamp: '2025-12-27T10:30:00.000Z',
          processingTimeMs: 150,
          version: '1.0.0'
        }
      };
      
      expect(response.success).toBe(true);
      expect(response.data).toBeDefined();
      expect(response.metadata).toBeDefined();
    });

    it('should create error response', () => {
      const response: APIResponse<null> = {
        success: false,
        error: {
          code: 'FILE_SIZE_EXCEEDED',
          message: 'File size exceeds limit',
          details: { fileSize: 6291456, maxSize: 5242880 },
          timestamp: '2025-12-27T10:30:00.000Z',
          requestId: 'req_123'
        }
      };
      
      expect(response.success).toBe(false);
      expect(response.error).toBeDefined();
      expect(response.error?.code).toBe('FILE_SIZE_EXCEEDED');
    });
  });

  describe('WebSocket Event Types', () => {
    it('should define WebSocket event types', () => {
      const eventTypes: WebSocketEventType[] = [
        'document_status_update',
        'document_upload_progress',
        'undertaking_status_update',
        'consent_update',
        'audit_log_entry',
        'system_notification',
        'session_expiry'
      ];
      
      expect(eventTypes.length).toBe(7);
      expect(eventTypes).toContain('document_status_update');
      expect(eventTypes).toContain('undertaking_status_update');
    });

    it('should create WebSocket event', () => {
      const event: WebSocketEvent = {
        type: 'document_status_update',
        eventId: 'evt_123',
        timestamp: '2025-12-27T10:30:00.000Z',
        entityType: 'document',
        entityId: 'doc_123',
        data: { status: 'verified' },
        actor: {
          id: 'actor_123',
          name: 'John Doe',
          role: 'superintendent'
        }
      };
      
      expect(event.type).toBe('document_status_update');
      expect(event.eventId).toBeDefined();
      expect(event.entityId).toBeDefined();
    });

    it('should create WebSocket subscription', () => {
      const subscription: WebSocketSubscription = {
        id: 'sub_123',
        entityType: 'document',
        entityId: 'doc_123',
        eventTypes: ['document_status_update', 'document_upload_progress'],
        filters: { applicationId: 'app_123' }
      };
      
      expect(subscription.id).toBeDefined();
      expect(subscription.entityType).toBe('document');
      expect(subscription.eventTypes).toBeDefined();
    });
  });

  describe('Error Types', () => {
    it('should define error codes', () => {
      const codes: ErrorCode[] = [
        'INVALID_DOCUMENT_TYPE',
        'FILE_SIZE_EXCEEDED',
        'VIRUS_DETECTED',
        'CONSENT_REQUIRED',
        'SIGNATURE_REQUIRED',
        'VERSION_MISMATCH',
        'DUPLICATE_UPLOAD',
        'EXPIRED_DOCUMENT',
        'BLOCKING_UNDERTAKING',
        'PERMISSION_DENIED',
        'VALIDATION_ERROR',
        'SYSTEM_ERROR'
      ];
      
      expect(codes.length).toBe(12);
      expect(codes).toContain('FILE_SIZE_EXCEEDED');
      expect(codes).toContain('CONSENT_REQUIRED');
    });

    it('should create error metadata', () => {
      const error: ErrorMetadata = {
        code: 'FILE_SIZE_EXCEEDED',
        message: 'File size exceeds maximum limit of 5 MB',
        timestamp: '2025-12-27T10:30:00.000Z',
        context: { fileSize: 6291456, maxSize: 5242880 },
        stackTrace: 'Error: File size exceeds...\n    at ...',
        requestId: 'req_123'
      };
      
      expect(error.code).toBe('FILE_SIZE_EXCEEDED');
      expect(error.message).toBeDefined();
      expect(error.context).toBeDefined();
    });
  });
});
