# Full-Stack Architecture: Hostel Management Application (V2)

## 1. System Overview & Goals

The Hostel Management Application follows a **Three-Tier Architecture** optimized for strict institutional governance and DPDP compliance.

### Key Architectural Goals
1.  **Guest-First Admissions:** Support mobile-verified applicants without requiring persistent user accounts until final admission approval.
2.  **Strict Multi-Tenancy/Role Separation:** Enforce RBAC at the API and Database (RLS) levels.
3.  **Audit-Ready Event Logging:** Every state change triggers an immutable audit log entry.
4.  **Immutable Document Integrity:** PDF generation for all legal undertakings and financial receipts stored in secure S3 buckets.

## 2. Technical Stack Selection

| Layer | Technology | Rationale |
| :--- | :--- | :--- |
| **Frontend** | **Next.js** | Unified handling of SEO Landing Pages and Role-Based Dashboards. |
| **Backend** | **NestJS** | Structured framework for complex business rules and PDF generation services. |
| **Database** | **PostgreSQL (Supabase)** | Relational integrity with **Row Level Security (RLS)** for data governance. |
| **Storage** | **Supabase Storage** | Integrated with RLS for secure, student-specific document access. |
| **Auth** | **Supabase Auth** | OTP handling for Applicants/Parents and JWT claims for Residents/Staff. |
| **Notifications** | **BullMQ / Redis** | Asynchronous delivery for SMS/WhatsApp/Email triggers. |
| **PDF Service** | **Puppeteer / pdf-lib** | Backend service to generate non-repudiable legal documents. |

## 3. Core Data Schema (High-Level)

### 3.1 Identity & Access
*   **Users:** `id, email, password_hash, role (STUDENT, SUPERINTENDENT, TRUSTEE, ACCOUNTS, PARENT), mobile_no, status (ACTIVE, INACTIVE, ALUMNI)`.
*   **Profiles:** `user_id, full_name, profile_type, details (jsonb)`.

### 3.2 Admissions Lifecycle (Refactored for Guest-First)
*   **Applications:**
    *   `id`: UUID
    *   `tracking_number`: Human-readable ID
    *   `type`: (NEW, RENEWAL)
    *   `parent_application_id`: Nullable (links to previous record for history)
    *   `applicant_mobile`: Verified via OTP (used before User creation)
    *   `student_user_id`: Nullable (populated ONLY after Final Approval/Promotion)
    *   `current_status`: (DRAFT, SUBMITTED, REVIEW, INTERVIEW, APPROVED, REJECTED, ARCHIVED)
    *   `data`: (jsonb) Stores all form responses.
*   **Documents:** `id, application_id, document_type, s3_key, verification_status`.
*   **Interviews:** `application_id, trustee_id, schedule_time, mode, internal_remarks, final_score`.

### 3.3 Stay & Operations
*   **Rooms & Allocations:** Tracking occupancy and historical room changes.
*   **Leaves:** `id, student_id, type, start_time, end_time, reason, status, parent_notified_at`.

### 3.4 Finance & Audit
*   **Fees & Transactions:** Multi-head accounting (Processing, Hostel, Security).
*   **AuditLogs:** Immutable history of all application status changes and financial updates.

## 4. API & Integration Strategy

### 4.1 Specialized Endpoints
*   **Guest APIs:** `/api/v1/public/apply` and `/api/v1/public/track` (OTP restricted).
*   **Promotion Service:** Internal trigger to create `Auth.User` and `Profiles` once `Application.status == 'APPROVED'`.
*   **Document Engine:** `/api/v1/admin/documents/generate-pdf` for undertakings and receipts.

### 4.2 Integration Points
*   **WhatsApp/SMS:** Triggered via BullMQ for both automated (reminders) and manual (Superintendent messages) events.
*   **Tally Export:** XML generation logic for institutional accounting sync.

## 5. Security & DPDP Compliance

*   **Encryption:** AES-256 for PII; signed URLs for all student documents.
*   **Data Minimization:** Applications move to `ARCHIVED` status (PII stripped) after 1 year of rejection/exit unless renewal is active.
*   **Consent Tracking:** `ConsentLogs` capture digital fingerprints of rules acceptance at every 6-month renewal.

## 6. Strategic Decision Records (SDR)

### SDR-002: Guest-First Application Strategy
**Status:** APPROVED
**Context:** To lower friction and comply with DPDP, we avoid creating a full "User Account" for rejected or abandoned applications.
**Decision:** Applicants use OTP-verified sessions to track applications. A permanent `User` record is only created upon successful admission.

### SDR-003: PDF vs. Web-Only Undertakings
**Status:** APPROVED
**Context:** Institutional audits require signed, printable proof of rules acceptance.
**Decision:** All approvals will trigger a background job to generate a "Final Admission Packet" PDF containing student data and accepted terms, stored in S3.