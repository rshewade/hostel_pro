/**
 * Task 11.5 Test Suite: API Integration Types
 * 
 * Tests:
 * 1. Document API endpoint definitions
 * 2. Undertaking API endpoint definitions
 * 3. Consent API endpoint definitions
 * 4. Audit API endpoint definitions
 * 5. WebSocket message types
 * 6. Error codes
 * 7. HTTP status codes
 * 8. File size limitations
 * 9. Allowed file types
 * 10. Pagination defaults
 */

import { describe, it, expect } from 'vitest';
import {
  // Document API
  DOCUMENT_API,
  DocumentUploadRequest,
  DocumentUploadResponse,
  DocumentVerifyRequest,
  DocumentVerifyResponse,
  DocumentListQuery,
  DocumentListResponse,

  // Undertaking API
  UNDERTAKING_API,
  UndertakingAcknowledgeRequest,
  UndertakingAcknowledgeResponse,
  UndertakingListQuery,
  UndertakingListResponse,

  // Consent API
  CONSENT_API,
  ConsentGrantRequest,
  ConsentGrantResponse,

  // Audit API
  AUDIT_API,
  AuditLogQuery,
  AuditLogResponse,

  // WebSocket Types
  WebSocketMessageType,
  WebSocketSubscribeMessage,
  WebSocketUnsubscribeMessage,
  WebSocketHeartbeatMessage,
  DocumentStatusUpdateEvent,
  DocumentUploadProgressEvent,
  UndertakingStatusUpdateEvent,
  ConsentUpdateEvent,
  AuditLogEntryEvent,
  WebSocketErrorEvent,

  // Error Codes
  ERROR_CODES,

  // HTTP Status Codes
  HTTP_STATUS,

  // Constants
  FILE_SIZE_LIMITS,
  ALLOWED_FILE_TYPES,
  PAGINATION,

  // Utility Functions
  createHeaders,
  handleApiError
} from '../src/components/documents/apiIntegration';

describe('Task 11.5: Document API Endpoints', () => {
  it('should define document API endpoints', () => {
    expect(DOCUMENT_API.UPLOAD).toBe('/api/v1/documents/upload');
    expect(DOCUMENT_API.GET).toBe('/api/v1/documents/:id');
    expect(DOCUMENT_API.LIST).toBe('/api/v1/documents');
    expect(DOCUMENT_API.VERIFY).toBe('/api/v1/documents/:id/verify');
    expect(DOCUMENT_API.DELETE).toBe('/api/v1/documents/:id');
    expect(DOCUMENT_API.DOWNLOAD).toBe('/api/v1/documents/:id/download');
    expect(DOCUMENT_API.PREVIEW).toBe('/api/v1/documents/:id/preview');
    expect(DOCUMENT_API.AUDIT).toBe('/api/v1/documents/:id/audit');
    expect(DOCUMENT_API.VERSIONS).toBe('/api/v1/documents/:id/versions');
    expect(DOCUMENT_API.ROLLBACK).toBe('/api/v1/documents/:id/rollback');
  });

  it('should create document upload request', () => {
    const request: DocumentUploadRequest = {
      applicationId: 'app_123',
      documentType: 'student_declaration',
      file: new File(['content'], 'test.pdf', { type: 'application/pdf' }),
      metadata: {
        fileName: 'declaration.pdf',
        uploadedBy: 'user_123',
        deviceContext: {
          userAgent: 'Mozilla/5.0...',
          deviceType: 'desktop',
          ip: '192.168.1.1'
        }
      }
    };
    
    expect(request.applicationId).toBeDefined();
    expect(request.documentType).toBe('student_declaration');
    expect(request.file).toBeInstanceOf(File);
  });

  it('should create document upload response', () => {
    const response: DocumentUploadResponse = {
      id: 'doc_123',
      applicationId: 'app_123',
      documentType: 'student_declaration',
      status: 'uploaded',
      metadata: {
        uploadedAt: '2025-12-27T10:00:00.000Z',
        uploadedBy: 'user_123',
        fileName: 'declaration.pdf',
        fileSize: 524288,
        fileHash: 'hash_abc123',
        uploadDeviceContext: {
          userAgent: 'Mozilla/5.0...'
        }
      },
      fileUrl: 'https://example.com/doc.pdf',
      previewUrl: 'https://example.com/preview.png'
    };
    
    expect(response.id).toBeDefined();
    expect(response.status).toBe('uploaded');
    expect(response.metadata.uploadedAt).toBeDefined();
  });

  it('should create document verify request', () => {
    const request: DocumentVerifyRequest = {
      documentId: 'doc_123',
      verified: true,
      notes: 'Document verified successfully'
    };
    
    expect(request.documentId).toBeDefined();
    expect(request.verified).toBe(true);
  });

  it('should create document verify response', () => {
    const response: DocumentVerifyResponse = {
      id: 'doc_123',
      status: 'verified',
      verifiedAt: '2025-12-27T10:00:00.000Z',
      verifiedBy: 'admin_123'
    };
    
    expect(response.status).toBe('verified');
    expect(response.verifiedAt).toBeDefined();
  });

  it('should create document list query', () => {
    const query: DocumentListQuery = {
      applicationId: 'app_123',
      status: 'uploaded',
      type: 'student_declaration',
      page: 1,
      pageSize: 20,
      sortBy: 'uploadedAt',
      sortOrder: 'desc'
    };
    
    expect(query.applicationId).toBeDefined();
    expect(query.page).toBe(1);
    expect(query.pageSize).toBe(20);
  });

  it('should create document list response', () => {
    const response: DocumentListResponse = {
      documents: [],
      total: 100,
      page: 1,
      pageSize: 20,
      totalPages: 5
    };
    
    expect(response.documents).toBeDefined();
    expect(response.total).toBe(100);
    expect(response.totalPages).toBe(5);
  });
});

describe('Task 11.5: Undertaking API Endpoints', () => {
  it('should define undertaking API endpoints', () => {
    expect(UNDERTAKING_API.GET).toBe('/api/v1/undertakings/:id');
    expect(UNDERTAKING_API.LIST).toBe('/api/v1/undertakings');
    expect(UNDERTAKING_API.ACKNOWLEDGE).toBe('/api/v1/undertakings/:id/acknowledge');
    expect(UNDERTAKING_API.AUDIT).toBe('/api/v1/undertakings/:id/audit');
    expect(UNDERTAKING_API.VERSIONS).toBe('/api/v1/undertakings/:id/versions');
    expect(UNDERTAKING_API.CONSENTS).toBe('/api/v1/undertakings/:id/consents');
    expect(UNDERTAKING_API.WITHDRAW_CONSENT).toBe('/api/v1/undertakings/:id/withdraw-consent');
  });

  it('should create undertaking acknowledge request', () => {
    const request: UndertakingAcknowledgeRequest = {
      undertakingId: 'und_123',
      acknowledged: true,
      digitalSignature: {
        type: 'typed',
        value: 'John Doe'
      },
      consentItems: [
        { id: 'consent_1', consent: true },
        { id: 'consent_2', consent: true }
      ],
      deviceContext: {
        userAgent: 'Mozilla/5.0...',
        deviceType: 'desktop',
        ip: '192.168.1.1'
      }
    };
    
    expect(request.undertakingId).toBeDefined();
    expect(request.acknowledged).toBe(true);
    expect(request.digitalSignature).toBeDefined();
  });

  it('should create undertaking acknowledge response', () => {
    const response: UndertakingAcknowledgeResponse = {
      id: 'und_123',
      status: 'completed',
      acknowledgedAt: '2025-12-27T10:00:00.000Z',
      acknowledgedBy: 'user_123',
      digitalSignature: {
        type: 'typed',
        value: 'John Doe',
        signedAt: '2025-12-27T10:00:00.000Z',
        ipAddress: '192.168.1.1',
        deviceFingerprint: 'fp_abc123'
      },
      dpdpConsent: {
        id: 'consent_123',
        consentType: 'undertaking_acknowledgement',
        grantedAt: '2025-12-27T10:00:00.000Z',
        version: '1.0.0'
      }
    };
    
    expect(response.status).toBe('completed');
    expect(response.acknowledgedAt).toBeDefined();
    expect(response.digitalSignature).toBeDefined();
  });

  it('should create undertaking list query', () => {
    const query: UndertakingListQuery = {
      applicationId: 'app_123',
      status: 'pending',
      type: 'dpdp_consent_renewal',
      category: 'Compliance',
      showCompleted: false,
      showBlocking: true,
      page: 1,
      pageSize: 20,
      sortBy: 'dueDate',
      sortOrder: 'asc'
    };
    
    expect(query.applicationId).toBeDefined();
    expect(query.showCompleted).toBe(false);
    expect(query.showBlocking).toBe(true);
  });

  it('should create undertaking list response', () => {
    const response: UndertakingListResponse = {
      undertakings: [],
      total: 50,
      page: 1,
      pageSize: 20,
      totalPages: 3
    };
    
    expect(response.undertakings).toBeDefined();
    expect(response.total).toBe(50);
    expect(response.totalPages).toBe(3);
  });
});

describe('Task 11.5: Consent API Endpoints', () => {
  it('should define consent API endpoints', () => {
    expect(CONSENT_API.GRANT).toBe('/api/v1/consents/grant');
    expect(CONSENT_API.WITHDRAW).toBe('/api/v1/consents/:id/withdraw');
    expect(CONSENT_API.GET).toBe('/api/v1/consents/:id');
    expect(CONSENT_API.LIST).toBe('/api/v1/consents');
    expect(CONSENT_API.HISTORY).toBe('/api/v1/consents/history');
  });

  it('should create consent grant request', () => {
    const request: ConsentGrantRequest = {
      consentType: 'document_upload',
      purpose: 'admission_processing',
      dataCategories: ['PII', 'documents'],
      consentText: 'I consent to document upload...',
      legalBasis: 'DPDP Act Section 5'
    };
    
    expect(request.consentType).toBe('document_upload');
    expect(request.dataCategories).toContain('PII');
  });

  it('should create consent grant response', () => {
    const response: ConsentGrantResponse = {
      id: 'consent_123',
      consentType: 'document_upload',
      purpose: 'admission_processing',
      dataCategories: ['PII', 'documents'],
      version: '1.0.0',
      grantedAt: '2025-12-27T10:00:00.000Z',
      grantedBy: {
        id: 'user_123',
        name: 'John Doe',
        role: 'student'
      },
      deviceContext: {
        ip: '192.168.1.1',
        userAgent: 'Mozilla/5.0...',
        deviceType: 'desktop'
      },
      sessionInfo: {
        sessionId: 'sess_123',
        startedAt: '2025-12-27T10:00:00.000Z'
      }
    };
    
    expect(response.id).toBeDefined();
    expect(response.grantedBy).toBeDefined();
    expect(response.deviceContext).toBeDefined();
  });
});

describe('Task 11.5: Audit API Endpoints', () => {
  it('should define audit API endpoints', () => {
    expect(AUDIT_API.LOGS).toBe('/api/v1/audit/logs');
    expect(AUDIT_API.EXPORT).toBe('/api/v1/audit/export');
  });

  it('should create audit log query', () => {
    const query: AuditLogQuery = {
      entityType: 'document',
      entityId: 'doc_123',
      action: 'document_upload',
      actorId: 'user_123',
      startDate: '2025-12-01T00:00:00.000Z',
      endDate: '2025-12-31T23:59:59.000Z',
      page: 1,
      pageSize: 50,
      sortBy: 'timestamp',
      sortOrder: 'desc'
    };
    
    expect(query.entityType).toBe('document');
    expect(query.action).toBe('document_upload');
  });

  it('should create audit log response', () => {
    const response: AuditLogResponse = {
      entries: [],
      total: 1000,
      page: 1,
      pageSize: 50,
      totalPages: 20
    };
    
    expect(response.entries).toBeDefined();
    expect(response.total).toBe(1000);
    expect(response.totalPages).toBe(20);
  });
});

describe('Task 11.5: WebSocket Message Types', () => {
  it('should define WebSocket message types', () => {
    const types: WebSocketMessageType[] = [
      'subscribe',
      'unsubscribe',
      'heartbeat',
      'document_status_update',
      'document_upload_progress',
      'undertaking_status_update',
      'consent_update',
      'audit_log_entry',
      'system_notification',
      'session_expiry',
      'error'
    ];
    
    expect(types.length).toBe(11);
    expect(types).toContain('subscribe');
    expect(types).toContain('document_status_update');
  });

  it('should create subscribe message', () => {
    const message: WebSocketSubscribeMessage = {
      type: WebSocketMessageType.SUBSCRIBE,
      payload: {
        subscriptionId: 'sub_123',
        entityType: 'document',
        entityId: 'doc_123',
        eventTypes: ['document_status_update', 'document_upload_progress'],
        filters: { applicationId: 'app_123' }
      }
    };
    
    expect(message.type).toBe(WebSocketMessageType.SUBSCRIBE);
    expect(message.payload.subscriptionId).toBeDefined();
  });

  it('should create unsubscribe message', () => {
    const message: WebSocketUnsubscribeMessage = {
      type: WebSocketMessageType.UNSUBSCRIBE,
      payload: {
        subscriptionId: 'sub_123'
      }
    };
    
    expect(message.type).toBe(WebSocketMessageType.UNSUBSCRIBE);
    expect(message.payload.subscriptionId).toBeDefined();
  });

  it('should create heartbeat message', () => {
    const message: WebSocketHeartbeatMessage = {
      type: WebSocketMessageType.HEARTBEAT,
      payload: {
        timestamp: '2025-12-27T10:30:00.000Z'
      }
    };
    
    expect(message.type).toBe(WebSocketMessageType.HEARTBEAT);
  });

  it('should create document status update event', () => {
    const event: DocumentStatusUpdateEvent = {
      type: WebSocketMessageType.DOCUMENT_STATUS_UPDATE,
      eventId: 'evt_abc123',
      timestamp: '2025-12-27T10:30:00.000Z',
      payload: {
        documentId: 'doc_xyz789',
        applicationId: 'app_12345',
        status: 'verified',
        previousStatus: 'uploaded',
        actor: {
          id: 'user_123',
          name: 'John Doe',
          role: 'superintendent'
        },
        reason: null
      }
    };
    
    expect(event.type).toBe(WebSocketMessageType.DOCUMENT_STATUS_UPDATE);
    expect(event.payload.documentId).toBeDefined();
    expect(event.payload.status).toBe('verified');
  });

  it('should create document upload progress event', () => {
    const event: DocumentUploadProgressEvent = {
      type: WebSocketMessageType.DOCUMENT_UPLOAD_PROGRESS,
      eventId: 'evt_def456',
      timestamp: '2025-12-27T10:31:00.000Z',
      payload: {
        documentId: 'doc_xyz789',
        applicationId: 'app_12345',
        progress: 75,
        uploadedBytes: 3750000,
        totalBytes: 5000000,
        speed: 250000,
        eta: 5
      }
    };
    
    expect(event.type).toBe(WebSocketMessageType.DOCUMENT_UPLOAD_PROGRESS);
    expect(event.payload.progress).toBe(75);
    expect(event.payload.eta).toBe(5);
  });

  it('should create undertaking status update event', () => {
    const event: UndertakingStatusUpdateEvent = {
      type: WebSocketMessageType.UNDERTAKING_STATUS_UPDATE,
      eventId: 'evt_ghi789',
      timestamp: '2025-12-27T10:32:00.000Z',
      payload: {
        undertakingId: 'und_jkl012',
        applicationId: 'app_12345',
        status: 'completed',
        previousStatus: 'pending',
        actor: {
          id: 'user_456',
          name: 'Jane Smith',
          role: 'student'
        }
      }
    };
    
    expect(event.type).toBe(WebSocketMessageType.UNDERTAKING_STATUS_UPDATE);
    expect(event.payload.status).toBe('completed');
  });

  it('should create consent update event', () => {
    const event: ConsentUpdateEvent = {
      type: WebSocketMessageType.CONSENT_UPDATE,
      eventId: 'evt_mno345',
      timestamp: '2025-12-27T10:33:00.000Z',
      payload: {
        consentId: 'consent_pqr678',
        consentType: 'document_upload',
        status: 'granted',
        actor: {
          id: 'user_789',
          name: 'Bob Johnson',
          role: 'student'
        },
        reason: undefined
      }
    };
    
    expect(event.type).toBe(WebSocketMessageType.CONSENT_UPDATE);
    expect(event.payload.status).toBe('granted');
  });

  it('should create audit log entry event', () => {
    const event: AuditLogEntryEvent = {
      type: WebSocketMessageType.AUDIT_LOG_ENTRY,
      eventId: 'evt_stu901',
      timestamp: '2025-12-27T10:34:00.000Z',
      payload: {
        entityType: 'document',
        entityId: 'doc_vwx234',
        action: 'document_verify',
        actor: {
          id: 'user_345',
          name: 'Admin User',
          role: 'admin'
        },
        timestamp: '2025-12-27T10:34:00.000Z',
        changes: {
          status: { from: 'uploaded', to: 'verified' }
        }
      }
    };
    
    expect(event.type).toBe(WebSocketMessageType.AUDIT_LOG_ENTRY);
    expect(event.payload.action).toBe('document_verify');
  });

  it('should create WebSocket error event', () => {
    const event: WebSocketErrorEvent = {
      type: WebSocketMessageType.ERROR,
      eventId: 'evt_err123',
      timestamp: '2025-12-27T10:35:00.000Z',
      payload: {
        code: 'UNAUTHORIZED',
        message: 'Invalid or expired token',
        details: { errorCode: 'TOKEN_EXPIRED' }
      }
    };
    
    expect(event.type).toBe(WebSocketMessageType.ERROR);
    expect(event.payload.code).toBe('UNAUTHORIZED');
  });
});

describe('Task 11.5: Error Codes', () => {
  it('should define document error codes', () => {
    expect(ERROR_CODES.INVALID_DOCUMENT_TYPE).toBeDefined();
    expect(ERROR_CODES.FILE_SIZE_EXCEEDED).toBeDefined();
    expect(ERROR_CODES.FILE_TYPE_NOT_ALLOWED).toBeDefined();
    expect(ERROR_CODES.VIRUS_DETECTED).toBeDefined();
    expect(ERROR_CODES.DOCUMENT_NOT_FOUND).toBeDefined();
    expect(ERROR_CODES.DUPLICATE_UPLOAD).toBeDefined();
    expect(ERROR_CODES.DOCUMENT_ALREADY_VERIFIED).toBeDefined();
  });

  it('should define undertaking error codes', () => {
    expect(ERROR_CODES.UNDERTAKING_NOT_FOUND).toBeDefined();
    expect(ERROR_CODES.UNDERTAKING_ALREADY_ACKNOWLEDGED).toBeDefined();
    expect(ERROR_CODES.BLOCKING_UNDERTAKING).toBeDefined();
    expect(ERROR_CODES.SIGNATURE_REQUIRED).toBeDefined();
    expect(ERROR_CODES.CONSENT_REQUIRED).toBeDefined();
  });

  it('should define consent error codes', () => {
    expect(ERROR_CODES.CONSENT_NOT_FOUND).toBeDefined();
    expect(ERROR_CODES.CONSENT_ALREADY_GRANTED).toBeDefined();
    expect(ERROR_CODES.CONSENT_CANNOT_BE_WITHDRAWN).toBeDefined();
  });

  it('should define validation error codes', () => {
    expect(ERROR_CODES.VALIDATION_ERROR).toBeDefined();
    expect(ERROR_CODES.VERSION_MISMATCH).toBeDefined();
    expect(ERROR_CODES.EXPIRED_DOCUMENT).toBeDefined();
  });

  it('should define authorization error codes', () => {
    expect(ERROR_CODES.UNAUTHORIZED).toBeDefined();
    expect(ERROR_CODES.FORBIDDEN).toBeDefined();
    expect(ERROR_CODES.PERMISSION_DENIED).toBeDefined();
  });

  it('should define system error codes', () => {
    expect(ERROR_CODES.INTERNAL_SERVER_ERROR).toBeDefined();
    expect(ERROR_CODES.SERVICE_UNAVAILABLE).toBeDefined();
    expect(ERROR_CODES.RATE_LIMIT_EXCEEDED).toBeDefined();
  });
});

describe('Task 11.5: HTTP Status Codes', () => {
  it('should define success status codes', () => {
    expect(HTTP_STATUS.OK).toBe(200);
    expect(HTTP_STATUS.CREATED).toBe(201);
    expect(HTTP_STATUS.NO_CONTENT).toBe(204);
  });

  it('should define client error status codes', () => {
    expect(HTTP_STATUS.BAD_REQUEST).toBe(400);
    expect(HTTP_STATUS.UNAUTHORIZED).toBe(401);
    expect(HTTP_STATUS.FORBIDDEN).toBe(403);
    expect(HTTP_STATUS.NOT_FOUND).toBe(404);
    expect(HTTP_STATUS.CONFLICT).toBe(409);
    expect(HTTP_STATUS.PAYLOAD_TOO_LARGE).toBe(413);
    expect(HTTP_STATUS.UNSUPPORTED_MEDIA_TYPE).toBe(415);
    expect(HTTP_STATUS.TOO_MANY_REQUESTS).toBe(429);
  });

  it('should define server error status codes', () => {
    expect(HTTP_STATUS.INTERNAL_SERVER_ERROR).toBe(500);
    expect(HTTP_STATUS.SERVICE_UNAVAILABLE).toBe(503);
  });
});

describe('Task 11.5: File Size Limitations', () => {
  it('should define document max size', () => {
    expect(FILE_SIZE_LIMITS.DOCUMENT_MAX_SIZE).toBe(5 * 1024 * 1024); // 5 MB
  });

  it('should define image max size', () => {
    expect(FILE_SIZE_LIMITS.IMAGE_MAX_SIZE).toBe(2 * 1024 * 1024); // 2 MB
  });

  it('should define PDF max size', () => {
    expect(FILE_SIZE_LIMITS.PDF_MAX_SIZE).toBe(5 * 1024 * 1024); // 5 MB
  });

  it('should define batch upload max size', () => {
    expect(FILE_SIZE_LIMITS.BATCH_UPLOAD_MAX_SIZE).toBe(20 * 1024 * 1024); // 20 MB
  });
});

describe('Task 11.5: Allowed File Types', () => {
  it('should define allowed image types', () => {
    expect(ALLOWED_FILE_TYPES.IMAGES).toContain('image/jpeg');
    expect(ALLOWED_FILE_TYPES.IMAGES).toContain('image/png');
    expect(ALLOWED_FILE_TYPES.IMAGES).toContain('image/gif');
  });

  it('should define allowed document types', () => {
    expect(ALLOWED_FILE_TYPES.DOCUMENTS).toContain('application/pdf');
    expect(ALLOWED_FILE_TYPES.DOCUMENTS).toContain('application/msword');
  });

  it('should define all allowed types', () => {
    expect(ALLOWED_FILE_TYPES.ALL.length).toBeGreaterThan(0);
    expect(ALLOWED_FILE_TYPES.ALL).toContain('image/jpeg');
    expect(ALLOWED_FILE_TYPES.ALL).toContain('application/pdf');
  });
});

describe('Task 11.5: Pagination Defaults', () => {
  it('should define default page', () => {
    expect(PAGINATION.DEFAULT_PAGE).toBe(1);
  });

  it('should define default page size', () => {
    expect(PAGINATION.DEFAULT_PAGE_SIZE).toBe(20);
  });

  it('should define max page size', () => {
    expect(PAGINATION.MAX_PAGE_SIZE).toBe(100);
  });
});

describe('Task 11.5: Utility Functions', () => {
  it('should create headers without auth token', () => {
    const headers = createHeaders();
    
    expect(headers['Content-Type']).toBe('application/json');
    expect(headers['Accept']).toBe('application/json');
    expect(headers['Authorization']).toBeUndefined();
  });

  it('should create headers with auth token', () => {
    const headers = createHeaders('token_abc123');
    
    expect(headers['Authorization']).toBe('Bearer token_abc123');
  });

  it('should create headers with additional headers', () => {
    const headers = createHeaders('token_abc123', { 'X-Custom-Header': 'value' });
    
    expect(headers['X-Custom-Header']).toBe('value');
  });

  it('should handle API errors', () => {
    const error = {
      response: {
        data: {
          error: {
            code: 'FILE_SIZE_EXCEEDED',
            message: 'File size exceeds limit',
            details: { fileSize: 6291456 },
            timestamp: '2025-12-27T10:30:00.000Z',
            requestId: 'req_123'
          }
        }
      }
    };
    
    const errorResponse = handleApiError(error);
    
    expect(errorResponse.success).toBe(false);
    expect(errorResponse.error?.code).toBe('FILE_SIZE_EXCEEDED');
    expect(errorResponse.error?.message).toBeDefined();
  });

  it('should handle network errors', () => {
    const error = {
      message: 'Network error occurred'
    };
    
    const errorResponse = handleApiError(error);
    
    expect(errorResponse.success).toBe(false);
    expect(errorResponse.error?.code).toBe('NETWORK_ERROR');
  });
});
