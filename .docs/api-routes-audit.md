# API Routes Audit - Hostel Management System

**Date:** 2025-12-28
**Task:** 40.1 - Scan codebase and document existing Next.js API routes and db.json schema

## Executive Summary

This document provides a comprehensive audit of existing API routes and the db.json schema used in the hostel management application's prototyping phase. It identifies what exists, documents patterns and conventions, and highlights gaps that need to be filled.

---

## 1. Existing API Routes Inventory

### 1.1 OTP Management Routes

**Location:** `frontend/src/app/api/otp/`

#### `/api/otp/send` (POST)
- **Purpose:** Send OTP for guest applicant verification
- **Request Body:**
  - `phone?: string` - Mobile number (10 digits, 6-9 prefix)
  - `email?: string` - Email address
  - `vertical: string` - Application vertical (boys-hostel, girls-ashram, dharamshala)
- **Response:**
  - Success (200): `{ success: true, token: string, expiresIn: 600, message: string, devOTP?: string }`
  - Error (400/500): `{ message: string }`
- **Mock Behavior:** Returns static OTP '123456' in development
- **Validation:** Phone/email format, vertical requirement

#### `/api/otp/verify` (POST)
- **Purpose:** Verify OTP code and create session
- **Request Body:**
  - `code: string` - 6-digit OTP
  - `token: string` - Token from send endpoint
  - `attempts: number` - Verification attempt count
  - `userAgent?: string` - Browser user agent
- **Response:**
  - Success (200): `{ success: true, sessionToken: string, message: string, redirect: string }`
  - Error (400/401/429): `{ message: string }`
- **Security:**
  - 3 attempts limit
  - 10-minute expiration
  - Rate limiting on attempts

#### `/api/otp/resend` (POST)
- **Purpose:** Resend OTP with rate limiting
- **Request Body:**
  - `token: string` - Original token
  - `reason: string` - Resend reason
- **Response:**
  - Success (200): `{ success: true, token: string, expiresIn: 600, message: string, devOTP?: string }`
  - Error (400/429): `{ message: string }`
- **Rate Limiting:** 60-second minimum interval between resends

### 1.2 Application Management Routes

**Location:** `frontend/src/app/api/applications/`

#### `/api/applications` (GET)
- **Purpose:** Retrieve all applications
- **Response:** Array of application objects from db.json

#### `/api/applications` (POST)
- **Purpose:** Create new application
- **Request Body:** Application data object
- **Auto-Generated Fields:**
  - `id`: Timestamp-based
  - `trackingNumber`: Format `HG-{year}-{5-digit-seq}`
  - `status`: Defaults to 'DRAFT'
  - `createdAt`, `updatedAt`: ISO timestamps
- **Response:**
  - Success (201): Created application object
  - Error (500): `{ error: string }`

---

## 2. db.json Schema Documentation

### 2.1 Collections Overview

The db.json file contains 11 main collections:
1. `users` - User accounts (students, staff)
2. `profiles` - Extended user profile information
3. `applications` - Admission applications
4. `documents` - Document uploads and verification
5. `interviews` - Interview scheduling and scores
6. `rooms` - Room inventory and status
7. `allocations` - Student room assignments
8. `leaves` - Leave requests and approvals
9. `fees` - Fee records and dues
10. `transactions` - Payment transactions
11. `auditLogs` - Audit trail for all changes

### 2.2 Detailed Schema Breakdown

#### 2.2.1 Users Collection
```json
{
  "id": "string (u{n})",
  "email": "string",
  "password_hash": "string (bcrypt)",
  "role": "STUDENT | SUPERINTENDENT | TRUSTEE | ACCOUNTS | PARENT",
  "mobile_no": "string (+91...)",
  "status": "ACTIVE | INACTIVE | SUSPENDED",
  "created_at": "ISO timestamp"
}
```

#### 2.2.2 Profiles Collection
```json
{
  "id": "string (p{n})",
  "user_id": "string (FK to users)",
  "full_name": "string",
  "profile_type": "STUDENT | STAFF",
  "details": {
    "father_name": "string",
    "age": "number",
    "native_place": "string",
    "education": {
      "institution": "string",
      "course": "string",
      "year": "string"
    }
  }
}
```

#### 2.2.3 Applications Collection
```json
{
  "id": "string (app{n})",
  "tracking_number": "string (BH|GA|DH{year}{seq})",
  "type": "NEW | RENEWAL",
  "parent_application_id": "string | null",
  "applicant_mobile": "string",
  "student_user_id": "string | null",
  "current_status": "DRAFT | SUBMITTED | REVIEW | INTERVIEW | APPROVED | REJECTED | ARCHIVED",
  "vertical": "BOYS_HOSTEL | GIRLS_ASHRAM | DHARAMSHALA",
  "data": {
    "personal_info": { /* flexible schema */ },
    "guardian_info": { /* flexible schema */ },
    "education": { /* flexible schema */ },
    "stay_duration": { /* for dharamshala */ }
  },
  "submitted_at": "ISO timestamp | null",
  "created_at": "ISO timestamp"
}
```

#### 2.2.4 Documents Collection
```json
{
  "id": "string (doc{n})",
  "application_id": "string (FK to applications)",
  "document_type": "AADHAR_CARD | PHOTO | EDUCATION_CERT | ...",
  "s3_key": "string",
  "verification_status": "PENDING | VERIFIED | REJECTED",
  "uploaded_at": "ISO timestamp"
}
```

#### 2.2.5 Interviews Collection
```json
{
  "id": "string (int{n})",
  "application_id": "string (FK to applications)",
  "trustee_id": "string (FK to users)",
  "schedule_time": "ISO timestamp",
  "mode": "IN_PERSON | VIDEO_CALL",
  "internal_remarks": "string",
  "final_score": "number | null",
  "status": "SCHEDULED | COMPLETED | CANCELLED"
}
```

#### 2.2.6 Rooms Collection
```json
{
  "id": "string (r{n})",
  "room_number": "string",
  "vertical": "BOYS_HOSTEL | GIRLS_ASHRAM | DHARAMSHALA",
  "floor": "number",
  "capacity": "number",
  "current_occupancy": "number",
  "status": "AVAILABLE | FULL | MAINTENANCE"
}
```

#### 2.2.7 Allocations Collection
```json
{
  "id": "string (alloc{n})",
  "student_id": "string (FK to users)",
  "room_id": "string (FK to rooms)",
  "allocated_at": "ISO timestamp",
  "vacated_at": "ISO timestamp | null",
  "status": "ACTIVE | VACATED"
}
```

#### 2.2.8 Leaves Collection
```json
{
  "id": "string (leave{n})",
  "student_id": "string (FK to users)",
  "type": "HOME_VISIT | MEDICAL | EMERGENCY | OTHER",
  "start_time": "ISO timestamp",
  "end_time": "ISO timestamp",
  "reason": "string",
  "status": "PENDING | APPROVED | REJECTED",
  "parent_notified_at": "ISO timestamp | null",
  "created_at": "ISO timestamp"
}
```

#### 2.2.9 Fees Collection
```json
{
  "id": "string (fee{n})",
  "student_id": "string (FK to users)",
  "head": "HOSTEL_FEES | SECURITY_DEPOSIT | PROCESSING_FEE | ...",
  "amount": "number",
  "due_date": "date string",
  "status": "PENDING | PAID | OVERDUE",
  "paid_at": "ISO timestamp | null"
}
```

#### 2.2.10 Transactions Collection
```json
{
  "id": "string (txn{n})",
  "fee_id": "string (FK to fees)",
  "amount": "number",
  "payment_method": "UPI | BANK_TRANSFER | CASH | CARD",
  "transaction_id": "string",
  "status": "SUCCESS | FAILED | PENDING",
  "created_at": "ISO timestamp"
}
```

#### 2.2.11 AuditLogs Collection
```json
{
  "id": "string (audit{n})",
  "entity_type": "APPLICATION | USER | PAYMENT | ...",
  "entity_id": "string",
  "action": "STATUS_CHANGE | CREATE | UPDATE | DELETE",
  "old_value": "string | null",
  "new_value": "string",
  "performed_by": "string (FK to users) | null",
  "performed_at": "ISO timestamp",
  "metadata": {
    /* flexible schema for additional context */
  }
}
```

---

## 3. Routing Patterns and Conventions

### 3.1 Next.js App Router Structure
- API routes located in: `frontend/src/app/api/`
- Uses Next.js 13+ App Router (not Pages Router)
- Route handlers in `route.ts` files

### 3.2 Common Patterns Identified

#### File-Based Routing
- `/api/otp/send/route.ts` → POST `/api/otp/send`
- `/api/applications/route.ts` → GET/POST `/api/applications`

#### HTTP Method Handlers
```typescript
export async function GET(request: NextRequest) { }
export async function POST(request: NextRequest) { }
export async function PUT(request: NextRequest) { }
export async function DELETE(request: NextRequest) { }
```

#### Error Response Format
```typescript
NextResponse.json({ message: string }, { status: number })
```

#### Success Response Format
```typescript
NextResponse.json({ success: true, ...data }, { status: number })
```

#### Database Helper Pattern
```typescript
async function readDb() {
  const data = await fs.readFile(dbPath, 'utf-8');
  return JSON.parse(data);
}

async function writeDb(data: any) {
  await fs.writeFile(dbPath, JSON.stringify(data, null, 2), 'utf-8');
  return data;
}
```

### 3.3 Validation Patterns
- Input validation before processing
- Regex validation for phone/email
- Type checking for required fields
- Custom error messages for validation failures

### 3.4 Mock/Development Patterns
- Console logging for mock operations
- Static OTP in development ('123456')
- Base64-encoded tokens for session management
- `process.env.NODE_ENV === 'development'` checks for dev-only features

---

## 4. Gap Analysis - Missing API Routes

Based on the db.json schema and project requirements, the following API routes are **MISSING**:

### 4.1 Authentication Routes (CRITICAL)
- ❌ `/api/auth/login` - Student/staff credential login
- ❌ `/api/auth/first-time-setup` - First-time password change
- ❌ `/api/auth/forgot-password` - Password reset initiation
- ❌ `/api/auth/reset-password` - Password reset completion
- ❌ `/api/auth/logout` - Session termination
- ❌ `/api/auth/session` - Session validation

### 4.2 Application Management Routes (HIGH PRIORITY)
- ✅ `/api/applications` (GET, POST) - **EXISTS**
- ❌ `/api/applications/[id]` (GET, PUT, DELETE) - Single application operations
- ❌ `/api/applications/[id]/submit` - Submit application
- ❌ `/api/applications/[id]/withdraw` - Withdraw application
- ❌ `/api/applications/track/[trackingNumber]` - Track by tracking number
- ❌ `/api/applications/status` - Bulk status updates

### 4.3 Interview Routes (HIGH PRIORITY)
- ❌ `/api/interviews` (GET, POST) - List and create interviews
- ❌ `/api/interviews/[id]` (GET, PUT) - Get and update interview
- ❌ `/api/interviews/slots` - Get available slots
- ❌ `/api/interviews/[id]/reschedule` - Reschedule interview
- ❌ `/api/interviews/[id]/complete` - Complete interview with scores

### 4.4 Payment/Fee Routes (HIGH PRIORITY)
- ❌ `/api/fees` (GET) - List student fees
- ❌ `/api/fees/[studentId]` - Get fees for specific student
- ❌ `/api/payments` (POST) - Initiate payment
- ❌ `/api/payments/verify` - Verify payment status
- ❌ `/api/payments/receipt/[transactionId]` - Generate receipt

### 4.5 Room Allocation Routes (MEDIUM PRIORITY)
- ❌ `/api/rooms` (GET) - List available rooms
- ❌ `/api/rooms/[vertical]` - Rooms by vertical
- ❌ `/api/allocations` (GET, POST) - List and create allocations
- ❌ `/api/allocations/[id]` (GET, PUT) - Get and update allocation
- ❌ `/api/allocations/vacate/[id]` - Vacate room

### 4.6 Leave Management Routes (MEDIUM PRIORITY)
- ❌ `/api/leaves` (GET, POST) - List and apply for leave
- ❌ `/api/leaves/[id]` (GET, PUT) - Get and update leave
- ❌ `/api/leaves/[id]/approve` - Approve leave
- ❌ `/api/leaves/[id]/reject` - Reject leave
- ❌ `/api/leaves/notify-parent` - Notify parent about leave

### 4.7 Renewal Routes (MEDIUM PRIORITY)
- ❌ `/api/renewals` (GET, POST) - List and initiate renewals
- ❌ `/api/renewals/[id]` (GET, PUT) - Get and update renewal
- ❌ `/api/renewals/[id]/approve` - Approve renewal
- ❌ `/api/renewals/due` - Get students due for renewal

### 4.8 Dashboard Routes (MEDIUM PRIORITY)
- ❌ `/api/dashboard/student` - Student dashboard data
- ❌ `/api/dashboard/superintendent` - Superintendent dashboard
- ❌ `/api/dashboard/trustee` - Trustee dashboard
- ❌ `/api/dashboard/accounts` - Accounts dashboard
- ❌ `/api/dashboard/parent` - Parent dashboard
- ❌ `/api/dashboard/stats` - Overall statistics

### 4.9 Document Routes (LOW PRIORITY)
- ❌ `/api/documents/upload` - Upload document
- ❌ `/api/documents/[id]` - Get/delete document
- ❌ `/api/documents/verify/[id]` - Verify document
- ❌ `/api/documents/list/[applicationId]` - List application documents

### 4.10 User Profile Routes (LOW PRIORITY)
- ❌ `/api/users/profile` - Get current user profile
- ❌ `/api/users/profile/update` - Update profile
- ❌ `/api/users/change-password` - Change password

### 4.11 Audit Routes (LOW PRIORITY)
- ❌ `/api/audit/logs` - Get audit logs
- ❌ `/api/audit/entity/[type]/[id]` - Get logs for specific entity

---

## 5. Recommended Implementation Priority

### Phase 1: Critical Authentication (Week 1)
1. `/api/auth/login` - Blocks Task 7
2. `/api/auth/first-time-setup` - Blocks Task 7
3. `/api/auth/session` - Required for protected routes
4. `/api/auth/logout` - Security requirement

### Phase 2: Application Workflow (Week 2)
1. `/api/applications/[id]` - CRUD operations
2. `/api/applications/[id]/submit` - Application submission
3. `/api/applications/track/[trackingNumber]` - Status tracking
4. `/api/interviews/*` - Interview scheduling

### Phase 3: Financial & Room Management (Week 3)
1. `/api/fees/*` - Fee management
2. `/api/payments/*` - Payment processing
3. `/api/rooms/*` - Room inventory
4. `/api/allocations/*` - Room allocation

### Phase 4: Ongoing Operations (Week 4)
1. `/api/leaves/*` - Leave management
2. `/api/renewals/*` - Renewal workflow
3. `/api/dashboard/*` - Dashboard aggregations

### Phase 5: Supporting Features (Week 5)
1. `/api/documents/*` - Document management
2. `/api/users/*` - Profile management
3. `/api/audit/*` - Audit logging

---

## 6. Technical Recommendations

### 6.1 Code Organization
- Create shared utilities in `frontend/src/lib/api/`:
  - `db.ts` - Database helpers (readDb, writeDb)
  - `auth.ts` - Authentication utilities
  - `validation.ts` - Input validation helpers
  - `responses.ts` - Standard response formatters

### 6.2 Type Safety
- Define TypeScript interfaces for all entities in `frontend/src/types/`:
  - `User.ts`, `Application.ts`, `Fee.ts`, etc.
- Share types between API routes and frontend

### 6.3 Error Handling
- Standardize error responses across all routes
- Use consistent HTTP status codes
- Provide meaningful error messages

### 6.4 Security Considerations
- Implement session validation middleware
- Add rate limiting for sensitive endpoints
- Validate user permissions for role-based routes
- Sanitize all user inputs

### 6.5 Testing Strategy
- Create API test suite using Vitest
- Mock db.json operations for unit tests
- Integration tests for complete workflows

---

## 7. Next Steps

1. ✅ **Complete**: API routes audit (This document)
2. **Next**: Design unified API contract (Task 40.2)
3. **Then**: Implement authentication routes (Task 40.3)
4. **Finally**: Implement remaining CRUD routes (Task 40.4-40.5)

---

**Document Status:** Draft v1.0
**Last Updated:** 2025-12-28
**Prepared By:** Claude Code AI Assistant
**For:** Task 40.1 - API Routes Audit
