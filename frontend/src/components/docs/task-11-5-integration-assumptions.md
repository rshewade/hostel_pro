# Task 11.5: Audit and Consent Metadata - Integration Assumptions

**Status:** ✅ COMPLETE

---

## Overview

This document defines the integration assumptions for the audit and consent metadata model for documents and undertakings. These assumptions will guide backend API implementation and frontend integration.

---

## 1. Metadata Schema Design

### 1.1 Document Audit Metadata

The comprehensive document metadata includes:

**Core Metadata:**
- `id` (UUID) - Unique document identifier
- `type` (enum) - Document type (student_declaration, parent_consent, etc.)
- `title` (string) - Human-readable document title
- `status` (enum) - Current document status
- `required` (boolean) - Whether document is mandatory
- `createdAt` (timestamp, UTC) - Document record creation time
- `updatedAt` (timestamp, UTC) - Last update time

**Upload Metadata:**
- `uploadedAt` (timestamp, UTC) - When file was uploaded
- `uploadedBy` (object) - Actor who uploaded
- `uploadDeviceContext` (object) - Device/context at upload time
- `uploadSessionInfo` (object) - Session information
- `fileName` (string) - Original filename
- `fileSize` (number) - File size in bytes
- `fileHash` (string) - SHA-256 hash of file
- `fileMimeType` (string) - MIME type of file

**Verification Metadata:**
- `verifiedAt` (timestamp, UTC) - When document was verified
- `verifiedBy` (object) - Actor who verified
- `verifyDeviceContext` (object) - Device/context at verification
- `verifySessionInfo` (object) - Session information

**Rejection Metadata:**
- `rejectedAt` (timestamp, UTC) - When document was rejected
- `rejectedBy` (object) - Actor who rejected
- `rejectDeviceContext` (object) - Device/context at rejection
- `rejectSessionInfo` (object) - Session information
- `rejectionReason` (string) - Reason for rejection

**Tracking Metadata:**
- `lastViewedAt` (timestamp, UTC) - Last time document was viewed
- `lastViewedBy` (object) - Actor who last viewed
- `viewCount` (number) - Number of times viewed
- `downloadedAt` (timestamp, UTC) - Last time document was downloaded
- `downloadedBy` (object) - Actor who last downloaded
- `downloadCount` (number) - Number of times downloaded

**Security Metadata:**
- `virusScanStatus` (enum) - Virus scan status (pending, scanning, clean, infected)
- `virusScanTimestamp` (timestamp, UTC) - When virus scan was performed

**Versioning Metadata:**
- `version` (string) - Current version number (semantic versioning)
- `versionHistory` (object) - Complete version history

**DPDP Consent Metadata:**
- `dpdpConsent` (object) - DPDP consent history

**Digital Signature Metadata:**
- `digitalSignature` (object) - Digital signature details

### 1.2 Undertaking Audit Metadata

The comprehensive undertaking metadata includes:

**Core Metadata:**
- `id` (UUID) - Unique undertaking identifier
- `type` (enum) - Undertaking type (dpdp_consent_renewal, etc.)
- `title` (string) - Human-readable title
- `description` (string) - Undertaking description
- `status` (enum) - Current status (pending, in_progress, completed, required, overdue)
- `category` (string) - Category (Compliance, Hostel Rules, Conduct, etc.)
- `required` (boolean) - Whether undertaking is mandatory
- `createdAt` (timestamp, UTC) - Record creation time
- `updatedAt` (timestamp, UTC) - Last update time

**Acknowledgement Metadata:**
- `acknowledgedAt` (timestamp, UTC) - When undertaking was acknowledged
- `acknowledgedBy` (object) - Actor who acknowledged
- `acknowledgeDeviceContext` (object) - Device/context at acknowledgement
- `acknowledgeSessionInfo` (object) - Session information

**Due Date Metadata:**
- `dueDate` (timestamp, UTC) - Due date for acknowledgement
- `overdueDate` (timestamp, UTC) - Date when undertaking became overdue

**Blocking Metadata:**
- `isBlocking` (boolean) - Whether undertaking blocks other features
- `blockReason` (string) - Reason for blocking

**Versioning Metadata:**
- `version` (string) - Current version number
- `versionHistory` (object) - Complete version history

**Completion Metadata:**
- `completedAt` (timestamp, UTC) - When undertaking was marked completed
- `completedBy` (object) - Actor who marked completed

**Tracking Metadata:**
- `viewCount` (number) - Number of times viewed
- `lastViewedAt` (timestamp, UTC) - Last time viewed
- `lastViewedBy` (object) - Actor who last viewed

**DPDP Consent Metadata:**
- `dpdpConsent` (object) - DPDP consent history

**Digital Signature Metadata:**
- `digitalSignature` (object) - Digital signature details

---

## 2. Backend API Endpoints

### 2.1 Document Management API

**POST /api/v1/documents/upload**
- Purpose: Upload a document for an application
- Request: multipart/form-data with file and metadata
- Response: DocumentUploadResponse with full metadata
- Success: 201 Created
- Error Codes: 400 (validation), 401 (unauthorized), 403 (forbidden), 413 (payload too large), 500 (server error)

**GET /api/v1/documents/:id**
- Purpose: Get document details with full metadata
- Response: DocumentUploadResponse with all metadata
- Success: 200 OK
- Error Codes: 401, 403, 404

**GET /api/v1/documents**
- Purpose: List documents with optional filtering
- Query Params: applicationId, status, type, page, pageSize, sortBy, sortOrder
- Response: DocumentListResponse
- Success: 200 OK
- Error Codes: 401, 403

**PATCH /api/v1/documents/:id/verify**
- Purpose: Verify or reject a document
- Request Body: { verified: boolean, rejectionReason?: string, notes?: string }
- Response: DocumentVerifyResponse
- Success: 200 OK
- Error Codes: 400, 401, 403, 404, 409 (conflict)

**DELETE /api/v1/documents/:id**
- Purpose: Soft delete a document
- Success: 204 No Content
- Error Codes: 401, 403, 404, 409

**GET /api/v1/documents/:id/download**
- Purpose: Download document file
- Success: 200 OK (file stream)
- Error Codes: 401, 403, 404

**GET /api/v1/documents/:id/preview**
- Purpose: Get document preview (image or PDF)
- Success: 200 OK (preview data)
- Error Codes: 401, 403, 404, 415 (unsupported media type)

**GET /api/v1/documents/:id/audit**
- Purpose: Get audit trail for document
- Query Params: limit, offset
- Success: 200 OK
- Error Codes: 401, 403, 404

**GET /api/v1/documents/:id/versions**
- Purpose: Get version history for document
- Success: 200 OK
- Error Codes: 401, 403, 404

**POST /api/v1/documents/:id/rollback**
- Purpose: Rollback to previous version
- Request Body: { version: string, reason?: string }
- Success: 200 OK
- Error Codes: 400, 401, 403, 404, 409

### 2.2 Undertaking Management API

**GET /api/v1/undertakings/:id**
- Purpose: Get undertaking details with full metadata
- Response: UndertakingAcknowledgeResponse
- Success: 200 OK
- Error Codes: 401, 403, 404

**GET /api/v1/undertakings**
- Purpose: List undertakings with optional filtering
- Query Params: applicationId, status, type, category, showCompleted, showBlocking, page, pageSize, sortBy, sortOrder
- Response: UndertakingListResponse
- Success: 200 OK
- Error Codes: 401, 403

**POST /api/v1/undertakings/:id/acknowledge**
- Purpose: Acknowledge an undertaking
- Request Body: { acknowledged: boolean, digitalSignature?: {...}, consentItems?: [...] }
- Response: UndertakingAcknowledgeResponse
- Success: 200 OK
- Error Codes: 400, 401, 403, 404, 409

**GET /api/v1/undertakings/:id/audit**
- Purpose: Get audit trail for undertaking
- Query Params: limit, offset
- Success: 200 OK
- Error Codes: 401, 403, 404

**GET /api/v1/undertakings/:id/versions**
- Purpose: Get version history for undertaking
- Success: 200 OK
- Error Codes: 401, 403, 404

**GET /api/v1/undertakings/:id/consents**
- Purpose: Get DPDP consent history for undertaking
- Success: 200 OK
- Error Codes: 401, 403, 404

**POST /api/v1/undertakings/:id/withdraw-consent**
- Purpose: Withdraw consent for undertaking
- Request Body: { reason: string }
- Success: 200 OK
- Error Codes: 400, 401, 403, 404

### 2.3 Consent Management API

**POST /api/v1/consents/grant**
- Purpose: Grant consent for data processing
- Request Body: ConsentGrantRequest
- Response: ConsentGrantResponse
- Success: 201 Created
- Error Codes: 400, 401, 403, 409

**POST /api/v1/consents/:id/withdraw**
- Purpose: Withdraw consent
- Request Body: { reason: string }
- Success: 200 OK
- Error Codes: 400, 401, 403, 404, 409

**GET /api/v1/consents/:id**
- Purpose: Get consent details
- Success: 200 OK
- Error Codes: 401, 403, 404

**GET /api/v1/consents**
- Purpose: List consents for current user
- Query Params: consentType, status, active, page, pageSize
- Success: 200 OK
- Error Codes: 401, 403

**GET /api/v1/consents/history**
- Purpose: Get consent history for user
- Success: 200 OK
- Error Codes: 401, 403

### 2.4 Audit Trail API

**GET /api/v1/audit/logs**
- Purpose: Get audit log entries with filtering
- Query Params: entityType, entityId, action, actorId, startDate, endDate, page, pageSize, sortBy, sortOrder
- Response: AuditLogResponse
- Success: 200 OK
- Error Codes: 401, 403

**GET /api/v1/audit/export**
- Purpose: Export audit logs as CSV/PDF
- Query Params: entityType, entityId, startDate, endDate, format
- Success: 200 OK (file download)
- Error Codes: 401, 403

---

## 3. WebSocket Integration

### 3.1 Connection Details

**WebSocket Endpoint:** `wss://api.example.com/ws`

**Authentication:** WebSocket subprotocol with JWT token in URL query or headers

**Reconnection Strategy:** Exponential backoff with max 30 seconds

### 3.2 Message Types

**Client -> Server:**
- `subscribe` - Subscribe to entity updates
- `unsubscribe` - Unsubscribe from entity updates
- `heartbeat` - Keep-alive ping

**Server -> Client:**
- `document_status_update` - Document status changed
- `document_upload_progress` - Upload progress updates
- `undertaking_status_update` - Undertaking status changed
- `consent_update` - Consent granted or withdrawn
- `audit_log_entry` - New audit log entry
- `system_notification` - System-wide notifications
- `session_expiry` - Session about to expire
- `error` - Error events

### 3.3 Event Payloads

**Document Status Update:**
```json
{
  "type": "document_status_update",
  "eventId": "evt_abc123",
  "timestamp": "2025-12-27T10:30:00.000Z",
  "payload": {
    "documentId": "doc_xyz789",
    "applicationId": "app_12345",
    "status": "verified",
    "previousStatus": "uploaded",
    "actor": {
      "id": "user_123",
      "name": "John Doe",
      "role": "superintendent"
    },
    "reason": null
  }
}
```

**Document Upload Progress:**
```json
{
  "type": "document_upload_progress",
  "eventId": "evt_def456",
  "timestamp": "2025-12-27T10:31:00.000Z",
  "payload": {
    "documentId": "doc_xyz789",
    "applicationId": "app_12345",
    "progress": 75,
    "uploadedBytes": 3750000,
    "totalBytes": 5000000,
    "speed": 250000,
    "eta": 5
  }
}
```

**Undertaking Status Update:**
```json
{
  "type": "undertaking_status_update",
  "eventId": "evt_ghi789",
  "timestamp": "2025-12-27T10:32:00.000Z",
  "payload": {
    "undertakingId": "und_jkl012",
    "applicationId": "app_12345",
    "status": "completed",
    "previousStatus": "pending",
    "actor": {
      "id": "user_456",
      "name": "Jane Smith",
      "role": "student"
    }
  }
}
```

---

## 4. Data Format Specifications

### 4.1 Timestamp Format

All timestamps use ISO 8601 format in UTC:
- Format: `YYYY-MM-DDTHH:mm:ss.sssZ`
- Example: `2025-12-27T10:30:00.000Z`
- Timezone: UTC (stored), Asia/Kolkata (displayed)

### 4.2 UUID Format

All entity IDs use UUID v4:
- Format: `xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx`
- Example: `a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d`

### 4.3 File Upload Format

**Request:** multipart/form-data
- Field: `file` (file)
- Field: `metadata` (JSON string)

**Response:** JSON
```json
{
  "success": true,
  "data": {
    "id": "doc_abc123",
    "applicationId": "app_456",
    "documentType": "student_declaration",
    "status": "uploaded",
    "metadata": {
      "uploadedAt": "2025-12-27T10:30:00.000Z",
      "uploadedBy": {...},
      "fileName": "declaration.pdf",
      "fileSize": 524288,
      "fileHash": "abc123...",
      "uploadDeviceContext": {...}
    },
    "fileUrl": "https://...",
    "previewUrl": "https://..."
  },
  "metadata": {
    "requestId": "req_789",
    "timestamp": "2025-12-27T10:30:01.000Z",
    "processingTimeMs": 150,
    "version": "1.0.0"
  }
}
```

### 4.4 Error Response Format

All errors follow this format:
```json
{
  "success": false,
  "error": {
    "code": "FILE_SIZE_EXCEEDED",
    "message": "File size exceeds maximum limit of 5 MB",
    "details": {
      "fileSize": 6291456,
      "maxSize": 5242880
    },
    "timestamp": "2025-12-27T10:30:00.000Z",
    "requestId": "req_123"
  }
}
```

---

## 5. Error Handling

### 5.1 Error Codes

**Document Errors:**
- `INVALID_DOCUMENT_TYPE` - Invalid document type specified
- `FILE_SIZE_EXCEEDED` - File size exceeds limit (5 MB)
- `FILE_TYPE_NOT_ALLOWED` - File type not allowed
- `VIRUS_DETECTED` - Virus detected in uploaded file
- `DOCUMENT_NOT_FOUND` - Document not found
- `DUPLICATE_UPLOAD` - Duplicate document upload
- `DOCUMENT_ALREADY_VERIFIED` - Document already verified

**Undertaking Errors:**
- `UNDERTAKING_NOT_FOUND` - Undertaking not found
- `UNDERTAKING_ALREADY_ACKNOWLEDGED` - Undertaking already acknowledged
- `BLOCKING_UNDERTAKING` - Blocking undertaking prevents action
- `SIGNATURE_REQUIRED` - Digital signature required
- `CONSENT_REQUIRED` - DPDP consent required

**Consent Errors:**
- `CONSENT_NOT_FOUND` - Consent record not found
- `CONSENT_ALREADY_GRANTED` - Consent already granted
- `CONSENT_CANNOT_BE_WITHDRAWN` - Consent cannot be withdrawn

**Validation Errors:**
- `VALIDATION_ERROR` - Input validation failed
- `VERSION_MISMATCH` - Version mismatch in concurrent updates
- `EXPIRED_DOCUMENT` - Document has expired

**Authorization Errors:**
- `UNAUTHORIZED` - Authentication required
- `FORBIDDEN` - Insufficient permissions
- `PERMISSION_DENIED` - Action not allowed

**System Errors:**
- `INTERNAL_SERVER_ERROR` - Unexpected server error
- `SERVICE_UNAVAILABLE` - Service temporarily unavailable
- `RATE_LIMIT_EXCEEDED` - Rate limit exceeded

### 5.2 HTTP Status Codes

- `200 OK` - Successful request
- `201 Created` - Resource created successfully
- `204 No Content` - Successful request with no response body
- `400 Bad Request` - Invalid request
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `409 Conflict` - Resource conflict (duplicate, state mismatch)
- `413 Payload Too Large` - Request payload too large
- `415 Unsupported Media Type` - Unsupported media type
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error` - Server error
- `503 Service Unavailable` - Service unavailable

### 5.3 Retry Strategy

**Retryable Errors:** 429, 500, 502, 503, 504
- Max retries: 3
- Backoff: Exponential (1s, 2s, 4s)

**Non-Retryable Errors:** 400, 401, 403, 404, 409, 413, 415
- No retries, show error to user

---

## 6. Integration Assumptions

### 6.1 Backend Capabilities

**Assumed Backend Features:**
1. Document upload with virus scanning
2. Asynchronous processing for large files
3. Immutable audit log entries
4. Version control for documents and undertakings
5. WebSocket support for real-time updates
6. DPDP consent tracking
7. Digital signature verification
8. Data retention enforcement
9. Timezone-aware timestamp handling (UTC storage, IST display)

**Current Implementation Status:**
- ✅ db.json mock API with basic document endpoints
- ⏳ Backend API implementation in progress (NestJS)
- ⏳ WebSocket integration pending
- ⏳ Virus scanning integration pending
- ⏳ Real-time progress updates pending

### 6.2 Data Storage

**Database Assumptions:**
1. PostgreSQL with Row Level Security (RLS)
2. UTC timestamps stored in all tables
3. UUID primary keys for all entities
4. JSONB for metadata fields
5. Full-text search on metadata fields
6. Foreign key constraints for referential integrity

**Storage Assumptions:**
1. Supabase Storage for file storage
2. Signed URLs for secure file access
3. Automatic file expiration based on retention policy
4. Virus scanning integration via external service

### 6.3 Security Assumptions

**Authentication:**
1. JWT-based authentication
2. Role-based access control (RBAC)
3. Session management with refresh tokens
4. OTP-based authentication for applicants/parents

**Authorization:**
1. Role-based permissions on all endpoints
2. RLS policies at database level
3. Permission checks before data access
4. Audit logging for all data access

**Data Privacy:**
1. DPDP Act compliance
2. Data encryption at rest (AES-256)
3. Data encryption in transit (TLS 1.3)
4. Data minimization on archival
5. Right to deletion
6. Consent tracking and management

### 6.4 Performance Assumptions

**File Upload:**
1. Chunked upload for large files (> 5 MB)
2. Progress reporting via WebSocket
3. Parallel upload support
4. Resume capability on failure

**API Response Times:**
1. Document upload: < 2s for files < 5 MB
2. Document listing: < 500ms for 100 documents
3. Document verification: < 1s
4. Undertaking acknowledgement: < 500ms
5. Audit log retrieval: < 1s for 1000 entries

**WebSocket:**
1. Message delivery: < 100ms
2. Connection establishment: < 500ms
3. Reconnection: Exponential backoff up to 30s

### 6.5 Testing Assumptions

**Unit Tests:**
1. TypeScript interfaces and types
2. Data validation functions
3. Timestamp conversion functions
4. Utility functions

**Integration Tests:**
1. API endpoint responses
2. WebSocket event handling
3. Error handling flows
4. Permission checks

**E2E Tests:**
1. Document upload flow
2. Undertaking acknowledgement flow
3. Consent management flow
4. Audit log retrieval

---

## 7. Future Enhancements

### 7.1 Planned Features

1. **Digital Signature Verification**
   - Certificate-based signatures
   - Biometric signatures
   - Multi-signature support

2. **Advanced Audit Trail**
   - AI-powered anomaly detection
   - Automated compliance reporting
   - Real-time audit dashboards

3. **Enhanced WebSocket**
   - Binary message support
   - Compression
   - Message queuing for offline scenarios

4. **Document OCR**
   - Automatic text extraction
   - Metadata extraction
   - Content-based search

### 7.2 Scalability Considerations

1. **Horizontal Scaling**
   - Load balancing
   - Stateful session management
   - WebSocket connection pooling

2. **Database Optimization**
   - Read replicas
   - Connection pooling
   - Query optimization
   - Indexing strategy

3. **Caching Strategy**
   - Redis for session cache
   - CDN for file distribution
   - API response caching

---

## 8. Conclusion

This document defines the integration assumptions for Task 11.5 (Audit and Consent Metadata Model). The assumptions cover:

- ✅ Comprehensive metadata schema for documents and undertakings
- ✅ Backend API endpoint definitions
- ✅ WebSocket integration patterns
- ✅ Data format specifications
- ✅ Error handling strategies
- ✅ Data retention policies
- ✅ Timezone conventions (UTC storage, IST display)
- ✅ Security and compliance requirements

These assumptions will guide the backend API implementation and provide a contract for frontend-backend integration.
