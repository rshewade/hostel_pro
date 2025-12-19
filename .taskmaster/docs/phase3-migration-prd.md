# Phase 3: Supabase Production Migration PRD

## Document Overview

**Purpose:** Define requirements for migrating the Hostel Management Application from Phase 1/2 (db.json + partial Supabase) to Phase 3 (Full Supabase PostgreSQL production).

**Target Audience:** Backend developers, DevOps engineers, Database administrators

**Dependencies:** Completion of Tasks 1-30 (Phase 1 UI/UX implementation)

**Tech Stack:**
- **Database:** Supabase PostgreSQL (replacing json-server)
- **Backend:** NestJS with Supabase client integration
- **Auth:** Supabase Auth (JWT-based, replacing mock OTP)
- **Storage:** Supabase Storage with signed URLs
- **Security:** Row Level Security (RLS) policies
- **Monitoring:** Supabase Dashboard + custom logging

---

## Migration Task 1: Migrate Authentication to Supabase Auth

### Overview
Replace all mock authentication flows (OTP, student login, parent login) with production Supabase Auth implementation.

### Requirements

**OTP Verification Migration** (from Task 5):
- Implement Supabase Auth phone authentication for applicant OTP flows
- Configure OTP delivery via Twilio/MSG91 integration with Supabase Edge Functions
- Replace mock OTP session storage with Supabase Auth sessions
- Implement JWT token generation and validation
- Add token refresh mechanism for long sessions

**Student Login Migration** (from Task 7):
- Migrate student credential login to Supabase Auth
- Implement role-based JWT claims (role: STUDENT, vertical: Boys/Girls/Dharamshala)
- Add first-time setup flow with password creation
- Implement password reset and account recovery flows
- Configure session duration and idle timeout policies

**Parent/Guardian Login Migration** (from Task 8):
- Migrate parent OTP-based login to Supabase Auth
- Implement view-only role claims in JWT
- Link parent accounts to student records via metadata
- Add multi-child support for parents with multiple residents

**Security Requirements:**
- Implement rate limiting for OTP requests (max 3 per 5 minutes)
- Add device fingerprinting for suspicious login detection
- Configure IP allowlisting for admin roles
- Implement MFA options for Trustee and Accounts roles
- Add audit logging for all authentication events

**Testing Requirements:**
- Test OTP delivery and verification flows
- Verify JWT claims are correctly set for all roles
- Test token refresh and expiration scenarios
- Validate role-based access control (RBAC) enforcement
- Test cross-device session management

**Acceptance Criteria:**
- All users authenticate via Supabase Auth with zero mock code remaining
- JWT tokens contain accurate role and vertical claims
- Authentication events are logged in audit tables
- Session management is secure and compliant with DPDP Act

---

## Migration Task 2: Implement Supabase Storage for Documents

### Overview
Migrate all document upload, storage, and retrieval from local/mock systems to Supabase Storage with RLS policies.

### Requirements

**Document Upload Migration** (from Task 11):
- Create Supabase Storage buckets for each document category:
  - `applications-documents` - Application-time documents
  - `student-documents` - Post-admission documents
  - `undertakings` - Digital undertakings and consents
  - `system-generated` - Receipts, letters, certificates
- Implement upload API endpoints in NestJS with Supabase Storage client
- Add file validation (type, size, virus scanning)
- Implement progress tracking for large uploads
- Replace local file paths with Supabase Storage URLs in database

**Signed URLs and Access Control:**
- Generate signed URLs with expiration (default 1 hour)
- Implement RLS policies for buckets based on user roles:
  - Students can only access their own documents
  - Superintendents can access documents for their vertical
  - Trustees can access all applicant documents
  - Accounts can access payment receipts
  - Parents can access their child's documents (read-only)
- Add document access logging for compliance

**Document Preview and Download:**
- Implement server-side thumbnail generation for PDFs
- Add watermarking for sensitive documents (e.g., "CONFIDENTIAL - Hostel Records")
- Implement bulk download API for admin exports
- Add PDF merging capability for final admission packets

**Migration Script Requirements:**
- Create migration script to upload existing mock documents to Supabase Storage
- Update all database records with new storage URLs
- Implement rollback mechanism in case of migration failure
- Add verification step to ensure all documents migrated successfully

**Testing Requirements:**
- Test upload flows for all supported file types (PDF, JPG, PNG)
- Verify RLS policies prevent unauthorized access
- Test signed URL expiration and regeneration
- Validate document access logging
- Test migration script with sample data

**Acceptance Criteria:**
- All documents stored in Supabase Storage with RLS policies
- Signed URLs expire correctly and can be regenerated
- Document access is logged for audit compliance
- Migration script successfully moves all prototype documents

---

## Migration Task 3: Design and Implement PostgreSQL Schema

### Overview
Create production PostgreSQL schema with proper relations, constraints, and indexes, replacing json-server's flat structure.

### Requirements

**Core Schema Design:**

**Users Table:**
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE,
  phone TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('STUDENT', 'SUPERINTENDENT', 'TRUSTEE', 'ACCOUNTS', 'PARENT')),
  vertical TEXT CHECK (vertical IN ('BOYS', 'GIRLS', 'DHARAMSHALA')),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Applications Table:**
```sql
CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tracking_number TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('NEW', 'RENEWAL')),
  vertical TEXT NOT NULL CHECK (vertical IN ('BOYS', 'GIRLS', 'DHARAMSHALA')),
  applicant_mobile TEXT NOT NULL,
  student_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  parent_application_id UUID REFERENCES applications(id),
  current_status TEXT NOT NULL DEFAULT 'DRAFT',
  status_history JSONB NOT NULL DEFAULT '[]',
  data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Documents Table:**
```sql
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
  student_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL,
  storage_url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'UPLOADED', 'VERIFIED', 'REJECTED')),
  uploaded_by UUID REFERENCES users(id),
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  verified_by UUID REFERENCES users(id),
  verified_at TIMESTAMPTZ,
  metadata JSONB
);
```

**Payments Table:**
```sql
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID REFERENCES applications(id),
  student_user_id UUID REFERENCES users(id),
  amount DECIMAL(10, 2) NOT NULL,
  fee_breakdown JSONB NOT NULL,
  payment_method TEXT CHECK (payment_method IN ('UPI', 'QR', 'CASH', 'CHEQUE')),
  transaction_id TEXT UNIQUE,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'SUCCESS', 'FAILED', 'REFUNDED')),
  gateway_response JSONB,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Rooms Table:**
```sql
CREATE TABLE rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vertical TEXT NOT NULL CHECK (vertical IN ('BOYS', 'GIRLS', 'DHARAMSHALA')),
  room_number TEXT NOT NULL,
  floor INTEGER,
  capacity INTEGER NOT NULL DEFAULT 1,
  occupied_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'AVAILABLE' CHECK (status IN ('AVAILABLE', 'OCCUPIED', 'MAINTENANCE')),
  metadata JSONB,
  UNIQUE(vertical, room_number)
);
```

**Room Allocations Table:**
```sql
CREATE TABLE room_allocations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  bed_number TEXT,
  check_in_date DATE NOT NULL,
  check_out_date DATE,
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'CHECKED_OUT', 'TRANSFERRED')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Leave Requests Table:**
```sql
CREATE TABLE leave_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  leave_type TEXT NOT NULL CHECK (leave_type IN ('HOME', 'MEDICAL', 'EMERGENCY', 'OTHER')),
  from_date DATE NOT NULL,
  to_date DATE NOT NULL,
  reason TEXT NOT NULL,
  parent_consent_given BOOLEAN DEFAULT FALSE,
  superintendent_status TEXT DEFAULT 'PENDING' CHECK (superintendent_status IN ('PENDING', 'APPROVED', 'REJECTED')),
  superintendent_id UUID REFERENCES users(id),
  superintendent_remarks TEXT,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Audit Logs Table:**
```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  action TEXT NOT NULL,
  actor_id UUID REFERENCES users(id),
  actor_role TEXT,
  changes JSONB,
  metadata JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Indexes:**
```sql
-- Performance indexes
CREATE INDEX idx_applications_tracking ON applications(tracking_number);
CREATE INDEX idx_applications_status ON applications(current_status);
CREATE INDEX idx_applications_student ON applications(student_user_id);
CREATE INDEX idx_documents_application ON documents(application_id);
CREATE INDEX idx_payments_student ON payments(student_user_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_room_allocations_student ON room_allocations(student_user_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at DESC);
```

**Triggers:**
- Auto-update `updated_at` timestamps
- Validate status transitions (e.g., cannot go from APPROVED to DRAFT)
- Update room occupied_count on allocation changes
- Create audit log entries on all data changes

**Testing Requirements:**
- Test all foreign key constraints
- Verify cascade delete behavior
- Test CHECK constraints with invalid data
- Validate index performance with sample data (100k+ records)
- Test concurrent updates and locking

**Acceptance Criteria:**
- All tables created with proper constraints and indexes
- Foreign keys enforce referential integrity
- Triggers maintain data consistency
- Schema supports all Phase 1 UI flows without data loss

---

## Migration Task 4: Implement Row Level Security (RLS) Policies

### Overview
Implement comprehensive RLS policies for all database tables to enforce role-based and vertical-based data access control.

### Requirements

**RLS Policy Design Principles:**
- Default deny: No access unless explicitly granted
- Role-based: Policies based on JWT claims (auth.jwt()->>'role')
- Vertical-based: Data isolation for Boys/Girls/Dharamshala
- Immutable audit: Audit logs are insert-only for all users

**Users Table Policies:**
```sql
-- Students can view and update only their own record
CREATE POLICY student_own_record ON users
  FOR SELECT USING (auth.uid() = id AND auth.jwt()->>'role' = 'STUDENT');

CREATE POLICY student_update_own ON users
  FOR UPDATE USING (auth.uid() = id AND auth.jwt()->>'role' = 'STUDENT');

-- Superintendents can view users in their vertical
CREATE POLICY superintendent_vertical_users ON users
  FOR SELECT USING (
    auth.jwt()->>'role' = 'SUPERINTENDENT' AND
    vertical = auth.jwt()->>'vertical'
  );

-- Trustees can view all users
CREATE POLICY trustee_all_users ON users
  FOR SELECT USING (auth.jwt()->>'role' = 'TRUSTEE');
```

**Applications Table Policies:**
```sql
-- Applicants can view and update their own application via tracking_number
CREATE POLICY applicant_own_application ON applications
  FOR ALL USING (applicant_mobile = auth.jwt()->>'phone');

-- Students can view applications linked to their user_id
CREATE POLICY student_own_application ON applications
  FOR SELECT USING (student_user_id = auth.uid());

-- Superintendents can view applications for their vertical
CREATE POLICY superintendent_vertical_apps ON applications
  FOR SELECT USING (
    auth.jwt()->>'role' = 'SUPERINTENDENT' AND
    vertical = auth.jwt()->>'vertical'
  );

-- Superintendents can update applications for their vertical
CREATE POLICY superintendent_update_apps ON applications
  FOR UPDATE USING (
    auth.jwt()->>'role' = 'SUPERINTENDENT' AND
    vertical = auth.jwt()->>'vertical'
  );

-- Trustees can view and update all applications
CREATE POLICY trustee_all_apps ON applications
  FOR ALL USING (auth.jwt()->>'role' = 'TRUSTEE');
```

**Documents Table Policies:**
```sql
-- Students can view and upload their own documents
CREATE POLICY student_own_documents ON documents
  FOR SELECT USING (student_user_id = auth.uid());

CREATE POLICY student_upload_documents ON documents
  FOR INSERT WITH CHECK (uploaded_by = auth.uid());

-- Superintendents can view documents for their vertical
CREATE POLICY superintendent_vertical_docs ON documents
  FOR SELECT USING (
    auth.jwt()->>'role' = 'SUPERINTENDENT' AND
    EXISTS (
      SELECT 1 FROM users WHERE users.id = documents.student_user_id
      AND users.vertical = auth.jwt()->>'vertical'
    )
  );

-- Trustees can view all documents
CREATE POLICY trustee_all_docs ON documents
  FOR SELECT USING (auth.jwt()->>'role' = 'TRUSTEE');
```

**Payments Table Policies:**
```sql
-- Students can view their own payments
CREATE POLICY student_own_payments ON payments
  FOR SELECT USING (student_user_id = auth.uid());

-- Accounts can view all payments
CREATE POLICY accounts_all_payments ON payments
  FOR ALL USING (auth.jwt()->>'role' = 'ACCOUNTS');

-- Superintendents can view payments for their vertical
CREATE POLICY superintendent_vertical_payments ON payments
  FOR SELECT USING (
    auth.jwt()->>'role' = 'SUPERINTENDENT' AND
    EXISTS (
      SELECT 1 FROM users WHERE users.id = payments.student_user_id
      AND users.vertical = auth.jwt()->>'vertical'
    )
  );
```

**Audit Logs Policies:**
```sql
-- Insert-only for all authenticated users
CREATE POLICY all_can_insert_audit ON audit_logs
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Only Trustees and Accounts can view audit logs
CREATE POLICY admin_view_audit ON audit_logs
  FOR SELECT USING (
    auth.jwt()->>'role' IN ('TRUSTEE', 'ACCOUNTS', 'SUPERINTENDENT')
  );
```

**Testing Requirements:**
- Test access with JWT tokens for each role
- Verify vertical-based isolation (Boys data not visible to Girls superintendent)
- Test that students cannot see other students' data
- Verify parents can only access their child's records
- Test RLS performance with large datasets
- Attempt unauthorized access and verify denials

**Acceptance Criteria:**
- All tables have RLS policies enabled
- No data leakage across roles or verticals
- Performance impact of RLS < 10ms per query
- Audit logs are immutable from client perspective

---

## Migration Task 5: Migrate API Endpoints from json-server to NestJS

### Overview
Replace all frontend API calls from json-server endpoints to production NestJS backend with Supabase integration.

### Requirements

**API Endpoint Migration:**

**Authentication Endpoints:**
```typescript
// POST /api/auth/otp/send
// POST /api/auth/otp/verify
// POST /api/auth/login
// POST /api/auth/refresh
// POST /api/auth/logout
```

**Application Endpoints:**
```typescript
// POST /api/applications - Create application
// GET /api/applications/:id - Get application by ID
// GET /api/applications/track/:trackingNumber - Track by tracking number
// PATCH /api/applications/:id - Update application
// GET /api/applications - List applications (role-based filtering)
```

**Student Endpoints:**
```typescript
// GET /api/students/dashboard - Student dashboard data
// GET /api/students/profile - Student profile
// PATCH /api/students/profile - Update profile
```

**Document Endpoints:**
```typescript
// POST /api/documents/upload - Upload document
// GET /api/documents/:id/url - Get signed URL
// PATCH /api/documents/:id/verify - Verify document (admin)
// GET /api/documents - List documents
```

**Payment Endpoints:**
```typescript
// POST /api/payments/initiate - Initiate payment
// GET /api/payments/:id/status - Check payment status
// POST /api/payments/webhook - Payment gateway webhook
// GET /api/payments - List payments
```

**Room Endpoints:**
```typescript
// GET /api/rooms/available - Get available rooms
// POST /api/rooms/allocate - Allocate room to student
// PATCH /api/rooms/:id/checkout - Check out from room
// GET /api/rooms - List all rooms (admin)
```

**Leave Endpoints:**
```typescript
// POST /api/leaves - Create leave request
// GET /api/leaves/:id - Get leave details
// PATCH /api/leaves/:id/approve - Approve leave (superintendent)
// GET /api/leaves - List leave requests
```

**Implementation Requirements:**
- Use NestJS decorators for route definitions
- Implement DTO validation using class-validator
- Add Swagger/OpenAPI documentation
- Use Supabase client for all database operations
- Implement error handling middleware
- Add request logging middleware
- Implement rate limiting (100 req/min per IP)

**Frontend Migration:**
- Create API client abstraction layer in frontend
- Replace all fetch calls to localhost:3001 with /api/*
- Add error handling for API failures
- Implement retry logic for failed requests
- Add loading states for all API calls

**Testing Requirements:**
- Write integration tests for all endpoints
- Test role-based access control on each endpoint
- Verify input validation catches invalid data
- Test error responses and status codes
- Load test critical endpoints (100+ concurrent requests)

**Acceptance Criteria:**
- All json-server endpoints replaced with NestJS equivalents
- Frontend successfully calls NestJS API for all operations
- API documentation complete and accurate
- All tests passing with >90% coverage

---

## Migration Task 6: Implement Production Payment Gateway Integration

### Overview
Replace mock payment flows with real payment gateway integration (Razorpay/Paytm/PhonePe) for production transactions.

### Requirements

**Payment Gateway Selection:**
- Primary: Razorpay (UPI, QR, Cards, NetBanking)
- Fallback: PhonePe (UPI, QR)
- Compliance: PCI-DSS compliant integration

**Payment Flow Implementation:**

**Initiate Payment:**
```typescript
// POST /api/payments/initiate
// Request: { applicationId, amount, feeBreakdown }
// Response: { orderId, paymentUrl, qrCodeUrl, expiresAt }

// Backend creates Razorpay order
const order = await razorpay.orders.create({
  amount: amount * 100, // Convert to paise
  currency: 'INR',
  receipt: `receipt_${applicationId}`,
  notes: {
    applicationId,
    vertical,
    studentId
  }
});
```

**Payment Verification:**
```typescript
// POST /api/payments/verify
// Request: { orderId, paymentId, signature }
// Response: { verified: boolean, receipt: { ... } }

// Verify signature
const generatedSignature = crypto
  .createHmac('sha256', razorpaySecret)
  .update(`${orderId}|${paymentId}`)
  .digest('hex');

const isValid = generatedSignature === signature;
```

**Webhook Handler:**
```typescript
// POST /api/payments/webhook
// Razorpay webhook for async payment status updates
// Events: payment.captured, payment.failed, refund.created

@Post('webhook')
async handleWebhook(@Body() payload, @Headers('x-razorpay-signature') signature) {
  // Verify webhook signature
  const isValid = this.verifyWebhookSignature(payload, signature);

  if (payload.event === 'payment.captured') {
    await this.updatePaymentStatus(payload.payload.payment.entity.id, 'SUCCESS');
  }
}
```

**Refund Implementation:**
```typescript
// POST /api/payments/:id/refund
// Request: { reason, amount? }
// Response: { refundId, status, processedAt }

const refund = await razorpay.payments.refund(paymentId, {
  amount: refundAmount * 100,
  notes: { reason, processedBy: adminUserId }
});
```

**Receipt Generation:**
- Generate PDF receipt with InstituteLetterhead
- Include: Transaction ID, Amount, Fee breakdown, Payment method, Date/time
- Store in Supabase Storage
- Send via Email and SMS

**Reconciliation:**
- Daily reconciliation job comparing Razorpay settlements with internal payment records
- Flag discrepancies for manual review
- Generate reconciliation reports for Accounts team

**Testing Requirements:**
- Use Razorpay Test Mode for development
- Test successful payment flow end-to-end
- Test payment failures (insufficient funds, timeout)
- Test refund flow with various amounts
- Test webhook delivery and retry mechanism
- Test duplicate payment prevention

**Acceptance Criteria:**
- Real payment gateway integration complete and tested
- Payments create receipts automatically
- Webhooks update payment status correctly
- Refunds process successfully
- Reconciliation identifies all discrepancies

---

## Migration Task 7: Implement Production-Grade Audit and Compliance

### Overview
Implement immutable audit logging, DPDP compliance tracking, and data retention policies for production.

### Requirements

**Audit Logging Implementation:**

**Trigger-Based Logging:**
```sql
-- Function to log all changes
CREATE OR REPLACE FUNCTION log_audit_entry()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_logs (
    entity_type,
    entity_id,
    action,
    actor_id,
    actor_role,
    changes,
    metadata,
    created_at
  ) VALUES (
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    TG_OP,
    NULLIF(current_setting('app.current_user_id', true), '')::UUID,
    NULLIF(current_setting('app.current_user_role', true), ''),
    jsonb_build_object(
      'old', CASE WHEN TG_OP != 'INSERT' THEN row_to_json(OLD) END,
      'new', CASE WHEN TG_OP != 'DELETE' THEN row_to_json(NEW) END
    ),
    CURRENT_TIMESTAMP
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables
CREATE TRIGGER applications_audit AFTER INSERT OR UPDATE OR DELETE ON applications
  FOR EACH ROW EXECUTE FUNCTION log_audit_entry();

CREATE TRIGGER documents_audit AFTER INSERT OR UPDATE OR DELETE ON documents
  FOR EACH ROW EXECUTE FUNCTION log_audit_entry();

-- Repeat for all critical tables
```

**DPDP Compliance Tracking:**

**Consent Management:**
```typescript
// Consent tracking table
CREATE TABLE consent_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  consent_type TEXT NOT NULL,
  consent_version TEXT NOT NULL,
  consent_text TEXT NOT NULL,
  consented_at TIMESTAMPTZ NOT NULL,
  ip_address INET,
  device_info JSONB,
  expires_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ
);

// Implement consent renewal checks
async checkConsentRenewal(userId: UUID): Promise<boolean> {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const recentConsent = await this.supabase
    .from('consent_logs')
    .select('*')
    .eq('user_id', userId)
    .eq('consent_type', 'HOSTEL_TERMS')
    .gte('consented_at', sixMonthsAgo.toISOString())
    .single();

  return !!recentConsent;
}
```

**Data Encryption:**
```typescript
// Encrypt PII fields before storage
import { createCipheriv, createDecipheriv } from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY; // 32-byte key
const ALGORITHM = 'aes-256-gcm';

function encryptPII(text: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);

  const encrypted = Buffer.concat([
    cipher.update(text, 'utf8'),
    cipher.final()
  ]);

  const authTag = cipher.getAuthTag();

  return JSON.stringify({
    iv: iv.toString('hex'),
    data: encrypted.toString('hex'),
    tag: authTag.toString('hex')
  });
}
```

**Data Retention Policy:**
```typescript
// Scheduled job to archive old data
@Cron('0 0 * * 0') // Weekly on Sunday midnight
async archiveOldData() {
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  // Archive rejected applications older than 1 year
  const rejectedApps = await this.supabase
    .from('applications')
    .select('*')
    .eq('current_status', 'REJECTED')
    .lt('updated_at', oneYearAgo.toISOString());

  // Strip PII and move to archive table
  for (const app of rejectedApps.data) {
    const stripped = this.stripPII(app);
    await this.supabase.from('applications_archive').insert(stripped);
  }

  // Delete original records
  await this.supabase
    .from('applications')
    .delete()
    .in('id', rejectedApps.data.map(a => a.id));
}
```

**Audit Reports:**
- Generate monthly audit reports for Trustees
- Include: Total applications, payments, document verifications, consent renewals
- Flag: Unusual activity, failed login attempts, data access anomalies
- Export to PDF and store in Supabase Storage

**Testing Requirements:**
- Verify all database changes create audit log entries
- Test consent renewal prompts at 6-month intervals
- Validate PII encryption/decryption round-trip
- Test data archival script with sample data
- Generate sample audit reports and validate completeness

**Acceptance Criteria:**
- All critical operations logged in audit_logs
- PII encrypted at rest in database
- Consent renewals tracked and enforced
- Data retention policy runs automatically
- Monthly audit reports generated successfully

---

## Migration Task 8: Data Migration and Production Cutover

### Overview
Safely migrate all prototype data from db.json to Supabase and execute production cutover with zero downtime.

### Requirements

**Pre-Migration Steps:**

**Data Validation:**
```typescript
// Validate db.json data before migration
interface ValidationReport {
  totalRecords: number;
  validRecords: number;
  invalidRecords: number;
  errors: Array<{ record: any; error: string }>;
}

async function validateData(dbJson: any): Promise<ValidationReport> {
  const report: ValidationReport = {
    totalRecords: 0,
    validRecords: 0,
    invalidRecords: 0,
    errors: []
  };

  // Validate applications
  for (const app of dbJson.applications || []) {
    report.totalRecords++;
    try {
      // Check required fields
      if (!app.tracking_number || !app.vertical || !app.current_status) {
        throw new Error('Missing required fields');
      }

      // Validate enum values
      if (!['BOYS', 'GIRLS', 'DHARAMSHALA'].includes(app.vertical)) {
        throw new Error(`Invalid vertical: ${app.vertical}`);
      }

      report.validRecords++;
    } catch (error) {
      report.invalidRecords++;
      report.errors.push({ record: app, error: error.message });
    }
  }

  return report;
}
```

**Migration Script:**
```typescript
// Main migration script
async function migrateData() {
  console.log('Starting migration...');

  // Step 1: Validate source data
  const dbJson = JSON.parse(fs.readFileSync('db.json', 'utf8'));
  const validationReport = await validateData(dbJson);

  if (validationReport.invalidRecords > 0) {
    console.error('Validation failed:', validationReport.errors);
    process.exit(1);
  }

  // Step 2: Begin transaction
  const { data: migrationId } = await supabase.rpc('begin_migration');

  try {
    // Step 3: Migrate users
    console.log('Migrating users...');
    for (const user of dbJson.users || []) {
      await supabase.from('users').insert({
        id: user.id,
        email: user.email,
        phone: user.phone,
        role: user.role,
        vertical: user.vertical,
        metadata: user.metadata,
        created_at: user.created_at
      });
    }

    // Step 4: Migrate applications
    console.log('Migrating applications...');
    for (const app of dbJson.applications || []) {
      await supabase.from('applications').insert({
        id: app.id,
        tracking_number: app.tracking_number,
        type: app.type,
        vertical: app.vertical,
        applicant_mobile: app.applicant_mobile,
        student_user_id: app.student_user_id,
        current_status: app.current_status,
        data: app.data,
        created_at: app.created_at
      });
    }

    // Step 5: Migrate documents (upload to Storage)
    console.log('Migrating documents...');
    for (const doc of dbJson.documents || []) {
      // Upload file to Supabase Storage
      const { data: storageData } = await supabase.storage
        .from('applications-documents')
        .upload(`${doc.application_id}/${doc.id}`, doc.file);

      // Insert document record
      await supabase.from('documents').insert({
        id: doc.id,
        application_id: doc.application_id,
        document_type: doc.document_type,
        storage_url: storageData.path,
        status: doc.status,
        uploaded_at: doc.uploaded_at
      });
    }

    // Step 6: Migrate remaining tables
    // (payments, rooms, room_allocations, leave_requests)

    // Step 7: Commit transaction
    await supabase.rpc('commit_migration', { migration_id: migrationId });

    console.log('Migration complete!');
  } catch (error) {
    // Rollback on error
    console.error('Migration failed:', error);
    await supabase.rpc('rollback_migration', { migration_id: migrationId });
    process.exit(1);
  }
}
```

**Verification Script:**
```typescript
// Verify migration success
async function verifyMigration(dbJson: any) {
  const report = {
    users: { expected: 0, actual: 0, match: false },
    applications: { expected: 0, actual: 0, match: false },
    documents: { expected: 0, actual: 0, match: false },
    payments: { expected: 0, actual: 0, match: false }
  };

  // Count records in db.json
  report.users.expected = (dbJson.users || []).length;
  report.applications.expected = (dbJson.applications || []).length;
  report.documents.expected = (dbJson.documents || []).length;
  report.payments.expected = (dbJson.payments || []).length;

  // Count records in Supabase
  const { count: usersCount } = await supabase.from('users').select('*', { count: 'exact', head: true });
  const { count: appsCount } = await supabase.from('applications').select('*', { count: 'exact', head: true });
  const { count: docsCount } = await supabase.from('documents').select('*', { count: 'exact', head: true });
  const { count: paymentsCount } = await supabase.from('payments').select('*', { count: 'exact', head: true });

  report.users.actual = usersCount;
  report.applications.actual = appsCount;
  report.documents.actual = docsCount;
  report.payments.actual = paymentsCount;

  report.users.match = report.users.expected === report.users.actual;
  report.applications.match = report.applications.expected === report.applications.actual;
  report.documents.match = report.documents.expected === report.documents.actual;
  report.payments.match = report.payments.expected === report.payments.actual;

  return report;
}
```

**Cutover Plan:**

**Pre-Cutover (T-24 hours):**
1. Freeze db.json writes (announce maintenance window)
2. Take final backup of db.json
3. Run migration script in staging environment
4. Verify migration with verification script
5. Run smoke tests on staging

**Cutover (T-0):**
1. Put application in maintenance mode
2. Run migration script in production
3. Verify migration success
4. Update frontend API URLs to NestJS endpoints
5. Deploy frontend changes
6. Remove maintenance mode
7. Monitor for errors

**Post-Cutover (T+24 hours):**
1. Monitor application logs for errors
2. Monitor database performance
3. Monitor payment gateway integration
4. Collect user feedback
5. Keep db.json backup for 7 days (rollback option)

**Rollback Plan:**
```bash
# If critical issues detected within 24 hours
1. Put application in maintenance mode
2. Revert frontend to use db.json endpoints
3. Restart json-server
4. Remove maintenance mode
5. Investigate issues in staging
```

**Testing Requirements:**
- Test migration script with sample data (100+ records per table)
- Verify data integrity after migration
- Test rollback procedure
- Run load tests on production before cutover
- Test all critical user flows post-migration

**Acceptance Criteria:**
- All prototype data migrated successfully
- Zero data loss verified via verification script
- Application functional with Supabase backend
- Rollback plan tested and ready
- Monitoring dashboards show healthy metrics

---

## Success Metrics

**Migration Success Criteria:**
- Zero data loss during migration
- < 1 hour of total downtime
- All Phase 1 UI flows functional with Supabase backend
- RLS policies prevent data leakage (verified via penetration testing)
- Application performance meets SLAs (< 500ms API response time p95)
- Payment success rate > 95%
- Audit logs capture 100% of critical operations

**Post-Migration Monitoring:**
- Daily active users (DAU) returns to pre-migration levels within 3 days
- Error rate < 0.1% (1 error per 1000 requests)
- Zero critical security vulnerabilities
- Data backup runs successfully every 24 hours
- DPDP compliance verified by legal team

---

## Timeline Estimate

**Task 31-32 (Auth + Storage):** 2-3 weeks
**Task 33-34 (Schema + RLS):** 2-3 weeks
**Task 35-36 (API + Payments):** 3-4 weeks
**Task 37-38 (Audit + Migration):** 2-3 weeks

**Total Phase 3 Duration:** 10-14 weeks (2.5-3.5 months)

---

## Dependencies on Phase 1/2 Tasks

**Must Complete Before Phase 3:**
- Tasks 1-30: All Phase 1 UI/UX implementation
- db.json fully populated with realistic test data
- Frontend flows tested end-to-end with db.json

**Parallel Work During Phase 3:**
- Task 26 (Developer handoff) can be updated with Phase 3 specs
- Task 27 (Versioning strategy) applies to both Phase 1 and Phase 3 code
