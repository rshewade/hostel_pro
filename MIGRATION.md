# Migration Plan: Supabase to Standalone PostgreSQL

**Target:** PostgreSQL 18.3 at `51.68.196.242:5432/hostel_pro`
**Storage:** Local `uploads/` directory on web server
**Auth:** Custom JWT + OTP via SMS provider (replacing Supabase Auth)

---

## Table of Contents

1. [Database Schema](#1-database-schema)
2. [Migration Activities Checklist](#2-migration-activities-checklist)
3. [Auth Replacement](#3-auth-replacement)
4. [Storage Replacement](#4-storage-replacement)
5. [Client Migration](#5-client-migration)
6. [SQL Migration Script](#6-sql-migration-script)

---

## 1. Database Schema

### 1.1 ENUM Types

```sql
-- User roles in the system
CREATE TYPE user_role AS ENUM ('STUDENT', 'SUPERINTENDENT', 'TRUSTEE', 'ACCOUNTS', 'PARENT', 'ADMIN');

-- Hostel verticals (routing for applications, rooms, staff)
CREATE TYPE vertical_type AS ENUM ('BOYS_HOSTEL', 'GIRLS_ASHRAM', 'DHARAMSHALA');

-- Application lifecycle states
CREATE TYPE application_status AS ENUM ('DRAFT', 'SUBMITTED', 'REVIEW', 'INTERVIEW', 'APPROVED', 'REJECTED', 'ARCHIVED');

-- Document verification states
CREATE TYPE document_status AS ENUM ('PENDING', 'UPLOADED', 'VERIFIED', 'REJECTED');

-- Interview modes
CREATE TYPE interview_mode AS ENUM ('IN_PERSON', 'ZOOM', 'GOOGLE_MEET', 'WHATSAPP_VIDEO', 'PHONE_CALL');

-- Interview outcomes
CREATE TYPE interview_status AS ENUM ('SCHEDULED', 'RESCHEDULED', 'COMPLETED', 'NO_SHOW', 'CANCELLED');

-- Room status
CREATE TYPE room_status AS ENUM ('AVAILABLE', 'PARTIAL', 'FULL', 'MAINTENANCE', 'CLOSED');

-- Allocation status
CREATE TYPE allocation_status AS ENUM ('ACTIVE', 'VACATED', 'TRANSFERRED');

-- Fee status
CREATE TYPE fee_status AS ENUM ('PENDING', 'PARTIAL', 'PAID', 'OVERDUE', 'CANCELLED', 'REFUNDED');

-- Payment methods
CREATE TYPE payment_method AS ENUM ('UPI', 'BANK_TRANSFER', 'CARD', 'CASH', 'CHEQUE', 'QR_CODE', 'ONLINE');

-- Transaction status
CREATE TYPE transaction_status AS ENUM ('PENDING', 'SUCCESS', 'FAILED', 'REFUNDED');

-- Leave types
CREATE TYPE leave_type_enum AS ENUM ('SHORT_LEAVE', 'NIGHT_OUT', 'MULTI_DAY', 'HOME_VISIT', 'MEDICAL', 'EMERGENCY', 'EXTENDED');

-- Leave status
CREATE TYPE leave_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');

-- Renewal status
CREATE TYPE renewal_status AS ENUM ('PENDING', 'RENEWED', 'EXPIRED', 'EXTENDED');

-- Exit reasons
CREATE TYPE exit_reason AS ENUM ('GRADUATION', 'DISCIPLINE', 'FINANCIAL', 'MEDICAL', 'PERSONAL', 'FAMILY_CIRCUMSTANCES', 'OTHER');

-- Clearance items
CREATE TYPE clearance_item_type AS ENUM ('ROOM_CLEARED', 'KEY_RETURNED', 'ID_CARD_RETURNED', 'BOOKS_RETURNED', 'FEES_SETTLED', 'PROPERTY_CHECKED', 'NO_DUE_CERTIFICATE');

-- Communication channels
CREATE TYPE comm_channel AS ENUM ('SMS', 'WHATSAPP', 'EMAIL', 'PUSH_NOTIFICATION');

-- Communication purpose
CREATE TYPE comm_purpose AS ENUM ('INTERVIEW_INVITE', 'APPROVAL_NOTIFICATION', 'REJECTION_NOTIFICATION', 'FEE_REMINDER', 'PAYMENT_CONFIRMATION', 'LEAVE_NOTIFICATION', 'RENEWAL_REMINDER', 'EXIT_NOTIFICATION', 'EMERGENCY_ALERT', 'OTHER');

-- Audit actions
CREATE TYPE audit_action AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'STATUS_CHANGE', 'APPROVAL', 'REJECTION', 'DOCUMENT_VERIFY', 'COMMUNICATION_SEND', 'FILE_UPLOAD', 'FILE_DELETE', 'LOGIN', 'LOGOUT');

-- Consent types
CREATE TYPE consent_type AS ENUM ('RULES_ACCEPTANCE', 'TERMS_CONDITIONS', 'PRIVACY_POLICY', 'DATA_PROCESSING', 'PARENT_AUTHORIZATION', 'DISCIPLINE_ACKNOWLEDGEMENT', 'RENEWAL_CONSENT');
```

---

### 1.2 Tables

#### `users` — Identity & access for all roles

| Column          | Type          | Constraints                   | Why                                                           |
| --------------- | ------------- | ----------------------------- | ------------------------------------------------------------- |
| `id`            | UUID          | PK, DEFAULT gen_random_uuid() | Unique identifier                                             |
| `email`         | VARCHAR(255)  | UNIQUE, nullable              | Login credential for staff/students                           |
| `mobile`        | VARCHAR(20)   | NOT NULL                      | OTP verification, required for all users (PRD: Guest-first)   |
| `password_hash` | VARCHAR(255)  | nullable                      | Null for OTP-only users (applicants, parents)                 |
| `full_name`     | VARCHAR(255)  | NOT NULL                      | Display name across all dashboards                            |
| `role`          | user_role     | NOT NULL                      | Determines dashboard access (template.tsx sidebar routing)    |
| `vertical`      | vertical_type | nullable                      | Which hostel — required for STUDENT, SUPERINTENDENT           |
| `date_of_birth` | DATE          | nullable                      | Student profile (apply form)                                  |
| `is_active`     | BOOLEAN       | DEFAULT true                  | Account status                                                |
| `profile_data`  | JSONB         | nullable                      | Flexible extra fields per role (occupation, department, etc.) |
| `last_login`    | TIMESTAMPTZ   | nullable                      | Security audit                                                |
| `created_at`    | TIMESTAMPTZ   | DEFAULT NOW()                 |                                                               |
| `updated_at`    | TIMESTAMPTZ   | DEFAULT NOW()                 |                                                               |

**Used by:** Login page, all dashboard headers, parent portal, apply flow (post-approval account creation)
**Index:** `email`, `mobile`, `role`, `vertical`

---

#### `sessions` — Active login sessions (replaces Supabase Auth sessions)

| Column       | Type         | Constraints          | Why                      |
| ------------ | ------------ | -------------------- | ------------------------ |
| `id`         | UUID         | PK                   |                          |
| `user_id`    | UUID         | FK → users, NOT NULL | Session owner            |
| `token_hash` | VARCHAR(255) | NOT NULL, UNIQUE     | Hashed JWT refresh token |
| `ip_address` | VARCHAR(45)  | nullable             | Security tracking        |
| `user_agent` | TEXT         | nullable             | Device identification    |
| `expires_at` | TIMESTAMPTZ  | NOT NULL             | Token expiry             |
| `created_at` | TIMESTAMPTZ  | DEFAULT NOW()        |                          |

**Used by:** Auth system — login, logout, session refresh
**Index:** `user_id`, `token_hash`, `expires_at`

---

#### `otp_verifications` — OTP codes for phone/email verification (replaces Supabase Auth OTP)

| Column       | Type         | Constraints   | Why                                                  |
| ------------ | ------------ | ------------- | ---------------------------------------------------- |
| `id`         | UUID         | PK            |                                                      |
| `identifier` | VARCHAR(255) | NOT NULL      | Phone number or email                                |
| `otp_code`   | VARCHAR(6)   | NOT NULL      | 6-digit OTP                                          |
| `purpose`    | VARCHAR(50)  | NOT NULL      | 'login', 'application', 'tracking', 'password_reset' |
| `attempts`   | INT          | DEFAULT 0     | Rate limiting (max 3 attempts)                       |
| `verified`   | BOOLEAN      | DEFAULT false | Whether OTP was successfully verified                |
| `expires_at` | TIMESTAMPTZ  | NOT NULL      | 5-minute window                                      |
| `created_at` | TIMESTAMPTZ  | DEFAULT NOW() |                                                      |

**Used by:** Apply flow contact step (OTP verify), track page, parent login, forgot password
**Index:** `identifier`, `purpose`, `expires_at`

---

#### `applications` — Core admission entity (Guest-first architecture)

| Column                  | Type               | Constraints                 | Why                                                                         |
| ----------------------- | ------------------ | --------------------------- | --------------------------------------------------------------------------- |
| `id`                    | UUID               | PK                          |                                                                             |
| `tracking_number`       | VARCHAR(20)        | UNIQUE, NOT NULL            | Human-readable ID (BH-2024-00001) for tracking page                         |
| `type`                  | VARCHAR(10)        | NOT NULL, DEFAULT 'NEW'     | NEW or RENEWAL                                                              |
| `vertical`              | vertical_type      | NOT NULL                    | Routes to correct superintendent                                            |
| `applicant_mobile`      | VARCHAR(20)        | NOT NULL                    | OTP-verified phone (used BEFORE account creation)                           |
| `applicant_email`       | VARCHAR(255)       | nullable                    | Optional email from contact step                                            |
| `applicant_name`        | VARCHAR(255)       | NOT NULL                    | From form personal info section                                             |
| `student_user_id`       | UUID               | FK → users, nullable        | **Populated ONLY after final approval** (PRD: Guest-first)                  |
| `parent_application_id` | UUID               | FK → applications, nullable | Links renewal to original application                                       |
| `current_status`        | application_status | NOT NULL, DEFAULT 'DRAFT'   | State machine: DRAFT→SUBMITTED→REVIEW→INTERVIEW→APPROVED/REJECTED→ARCHIVED  |
| `data`                  | JSONB              | NOT NULL                    | All form responses (personal, guardian, education, preferences, references) |
| `submitted_at`          | TIMESTAMPTZ        | nullable                    | When applicant clicked Submit                                               |
| `payment_status`        | VARCHAR(20)        | nullable                    | Processing fee status                                                       |
| `created_at`            | TIMESTAMPTZ        | DEFAULT NOW()               |                                                                             |
| `updated_at`            | TIMESTAMPTZ        | DEFAULT NOW()               |                                                                             |

**Used by:** Apply flow (all steps), track page, superintendent dashboard, trustee applications, parent portal
**Index:** `tracking_number`, `vertical`, `current_status`, `applicant_mobile`, `student_user_id`

---

#### `documents` — File metadata for all uploaded documents

| Column                | Type            | Constraints                 | Why                                                       |
| --------------------- | --------------- | --------------------------- | --------------------------------------------------------- |
| `id`                  | UUID            | PK                          |                                                           |
| `application_id`      | UUID            | FK → applications, nullable | For application documents                                 |
| `student_user_id`     | UUID            | FK → users, nullable        | For post-admission document uploads                       |
| `document_type`       | VARCHAR(50)     | NOT NULL                    | AADHAR_CARD, PHOTO, MARKSHEET, UNDERTAKING, RECEIPT, etc. |
| `category`            | VARCHAR(20)     | NOT NULL                    | IDENTITY, ADMISSION, UNDERTAKING, RECEIPT                 |
| `file_name`           | VARCHAR(255)    | NOT NULL                    | Original filename                                         |
| `file_path`           | VARCHAR(500)    | NOT NULL                    | Path in uploads/ directory                                |
| `file_size`           | INT             | nullable                    | Bytes                                                     |
| `mime_type`           | VARCHAR(100)    | nullable                    | application/pdf, image/jpeg, etc.                         |
| `verification_status` | document_status | DEFAULT 'PENDING'           | Superintendent verifies uploaded docs                     |
| `verified_by`         | UUID            | FK → users, nullable        |                                                           |
| `verified_at`         | TIMESTAMPTZ     | nullable                    |                                                           |
| `rejection_reason`    | TEXT            | nullable                    | Why document was rejected                                 |
| `uploaded_at`         | TIMESTAMPTZ     | DEFAULT NOW()               |                                                           |

**Used by:** Apply form (document upload), student documents page, superintendent application review
**Index:** `application_id`, `student_user_id`, `document_type`, `verification_status`

---

#### `interviews` — Interview scheduling and evaluation

| Column             | Type             | Constraints               | Why                                                              |
| ------------------ | ---------------- | ------------------------- | ---------------------------------------------------------------- |
| `id`               | UUID             | PK                        |                                                                  |
| `application_id`   | UUID             | FK → applications, UNIQUE | One interview per application                                    |
| `trustee_id`       | UUID             | FK → users, NOT NULL      | Assigned trustee                                                 |
| `scheduled_date`   | DATE             | NOT NULL                  | Interview date                                                   |
| `scheduled_time`   | TIME             | NOT NULL                  | Interview time                                                   |
| `mode`             | interview_mode   | NOT NULL                  | IN_PERSON, ZOOM, etc.                                            |
| `location_or_link` | VARCHAR(500)     | nullable                  | Physical address or meeting URL                                  |
| `duration_minutes` | INT              | DEFAULT 30                |                                                                  |
| `status`           | interview_status | DEFAULT 'SCHEDULED'       |                                                                  |
| `score`            | DECIMAL(3,2)     | nullable                  | Overall rating (0-5)                                             |
| `evaluation`       | JSONB            | nullable                  | Detailed scores: academic, communication, discipline, motivation |
| `recommendation`   | VARCHAR(20)      | nullable                  | APPROVE, REJECT, DEFERRED                                        |
| `internal_remarks` | TEXT             | nullable                  | Private trustee notes                                            |
| `reminder_sent_at` | TIMESTAMPTZ      | nullable                  | 24-hour reminder tracking                                        |
| `created_at`       | TIMESTAMPTZ      | DEFAULT NOW()             |                                                                  |
| `updated_at`       | TIMESTAMPTZ      | DEFAULT NOW()             |                                                                  |

**Used by:** Trustee interviews page (scheduling, evaluation modal), superintendent dashboard (interview count)
**Index:** `application_id`, `trustee_id`, `scheduled_date`, `status`

---

#### `rooms` — Hostel room inventory

| Column           | Type          | Constraints         | Why                                              |
| ---------------- | ------------- | ------------------- | ------------------------------------------------ |
| `id`             | UUID          | PK                  |                                                  |
| `room_number`    | VARCHAR(20)   | NOT NULL            | Display: "A-101", "B-201"                        |
| `vertical`       | vertical_type | NOT NULL            | Which hostel this room belongs to                |
| `floor`          | INT           | NOT NULL            | Floor number                                     |
| `building`       | VARCHAR(50)   | nullable            | Building name if multi-building                  |
| `capacity`       | INT           | NOT NULL            | Max occupants                                    |
| `occupied_count` | INT           | DEFAULT 0           | Current occupants (denormalized for performance) |
| `room_type`      | VARCHAR(20)   | nullable            | SINGLE, DOUBLE, TRIPLE, QUAD                     |
| `amenities`      | JSONB         | nullable            | {has_wifi, has_ac, bathroom_type}                |
| `status`         | room_status   | DEFAULT 'AVAILABLE' |                                                  |
| `rent_per_head`  | DECIMAL(10,2) | nullable            | Monthly cost                                     |
| `created_at`     | TIMESTAMPTZ   | DEFAULT NOW()       |                                                  |

**Used by:** Superintendent rooms page, trustee allocations, student room page
**Index:** `vertical`, `status`, `room_number`

---

#### `room_allocations` — Who lives where (historical tracking)

| Column                  | Type              | Constraints          | Why                               |
| ----------------------- | ----------------- | -------------------- | --------------------------------- |
| `id`                    | UUID              | PK                   |                                   |
| `student_id`            | UUID              | FK → users, NOT NULL |                                   |
| `room_id`               | UUID              | FK → rooms, NOT NULL |                                   |
| `status`                | allocation_status | DEFAULT 'ACTIVE'     | ACTIVE, VACATED, TRANSFERRED      |
| `allocated_at`          | TIMESTAMPTZ       | DEFAULT NOW()        | Move-in date                      |
| `vacated_at`            | TIMESTAMPTZ       | nullable             | Move-out date                     |
| `check_in_confirmed`    | BOOLEAN           | DEFAULT false        | Student confirmed room check-in   |
| `check_in_confirmed_at` | TIMESTAMPTZ       | nullable             |                                   |
| `check_in_inventory`    | JSONB             | nullable             | Room condition report at check-in |
| `allocation_reason`     | VARCHAR(100)      | nullable             | "Initial", "Transfer", etc.       |
| `created_at`            | TIMESTAMPTZ       | DEFAULT NOW()        |                                   |

**Used by:** Student room page, student check-in page, superintendent rooms, trustee allocations, parent dashboard
**Index:** `student_id`, `room_id`, `status`

---

#### `fees` — Fee structure and tracking (multi-head accounting)

| Column             | Type           | Constraints                 | Why                                                                                   |
| ------------------ | -------------- | --------------------------- | ------------------------------------------------------------------------------------- |
| `id`               | UUID           | PK                          |                                                                                       |
| `student_id`       | UUID           | FK → users, nullable        | Null for pre-approval processing fees                                                 |
| `application_id`   | UUID           | FK → applications, nullable | Links fee to application                                                              |
| `fee_head`         | VARCHAR(50)    | NOT NULL                    | PROCESSING_FEE, HOSTEL_FEES, SECURITY_DEPOSIT, KEY_DEPOSIT, MESS_ADVANCE, RENEWAL_FEE |
| `description`      | TEXT           | nullable                    | Human-readable description                                                            |
| `academic_session` | VARCHAR(20)    | nullable                    | "2024-2025"                                                                           |
| `amount`           | DECIMAL(10,2)  | NOT NULL                    | Total amount due                                                                      |
| `paid_amount`      | DECIMAL(10,2)  | DEFAULT 0                   | Amount paid so far                                                                    |
| `fine_applied`     | DECIMAL(10,2)  | DEFAULT 0                   | Late payment fine                                                                     |
| `status`           | fee_status     | DEFAULT 'PENDING'           |                                                                                       |
| `due_date`         | DATE           | nullable                    | Payment deadline                                                                      |
| `payment_method`   | payment_method | nullable                    | How it was paid                                                                       |
| `paid_at`          | TIMESTAMPTZ    | nullable                    |                                                                                       |
| `remarks`          | TEXT           | nullable                    |                                                                                       |
| `created_at`       | TIMESTAMPTZ    | DEFAULT NOW()               |                                                                                       |
| `updated_at`       | TIMESTAMPTZ    | DEFAULT NOW()               |                                                                                       |

**Used by:** Student fees page, accounts dashboard (receivables), parent dashboard (fee summary)
**Index:** `student_id`, `application_id`, `fee_head`, `status`, `due_date`

---

#### `transactions` — Payment records (audit trail)

| Column             | Type               | Constraints          | Why                                   |
| ------------------ | ------------------ | -------------------- | ------------------------------------- |
| `id`               | UUID               | PK                   |                                       |
| `fee_id`           | UUID               | FK → fees, NOT NULL  | Which fee this pays                   |
| `amount`           | DECIMAL(10,2)      | NOT NULL             |                                       |
| `payment_method`   | payment_method     | NOT NULL             |                                       |
| `transaction_ref`  | VARCHAR(100)       | UNIQUE, nullable     | External reference (UPI ID, bank ref) |
| `gateway_response` | JSONB              | nullable             | Full payment gateway response         |
| `status`           | transaction_status | DEFAULT 'PENDING'    |                                       |
| `payment_notes`    | TEXT               | nullable             |                                       |
| `processed_by`     | UUID               | FK → users, nullable | Staff who recorded this               |
| `receipt_number`   | VARCHAR(50)        | nullable             | Generated receipt number              |
| `receipt_path`     | VARCHAR(500)       | nullable             | Path to receipt PDF in uploads/       |
| `created_at`       | TIMESTAMPTZ        | DEFAULT NOW()        |                                       |

**Used by:** Student fees page (payment history), accounts dashboard (transaction log)
**Index:** `fee_id`, `transaction_ref`, `status`, `created_at`

---

#### `leave_requests` — Leave management with governance

| Column               | Type            | Constraints          | Why                               |
| -------------------- | --------------- | -------------------- | --------------------------------- |
| `id`                 | UUID            | PK                   |                                   |
| `student_id`         | UUID            | FK → users, NOT NULL |                                   |
| `leave_type`         | leave_type_enum | NOT NULL             | SHORT_LEAVE, NIGHT_OUT, etc.      |
| `start_time`         | TIMESTAMPTZ     | NOT NULL             |                                   |
| `end_time`           | TIMESTAMPTZ     | NOT NULL             |                                   |
| `reason`             | TEXT            | NOT NULL             |                                   |
| `destination`        | VARCHAR(255)    | nullable             | Where student is going            |
| `emergency_contact`  | VARCHAR(20)     | nullable             | Contact during leave              |
| `is_emergency`       | BOOLEAN         | DEFAULT false        | Fast-track processing             |
| `status`             | leave_status    | DEFAULT 'PENDING'    |                                   |
| `approved_by`        | UUID            | FK → users, nullable | Superintendent who approved       |
| `approval_remarks`   | TEXT            | nullable             |                                   |
| `parent_notified_at` | TIMESTAMPTZ     | nullable             | When parent SMS/WhatsApp was sent |
| `checkout_at`        | TIMESTAMPTZ     | nullable             | Actual departure time             |
| `return_at`          | TIMESTAMPTZ     | nullable             | Actual return time                |
| `created_at`         | TIMESTAMPTZ     | DEFAULT NOW()        |                                   |
| `updated_at`         | TIMESTAMPTZ     | DEFAULT NOW()        |                                   |

**Used by:** Student leave page, superintendent leaves page, parent leave page
**Index:** `student_id`, `status`, `start_time`, `is_emergency`

---

#### `leave_types` — Configurable leave rules per superintendent

| Column                | Type            | Constraints           | Why                                    |
| --------------------- | --------------- | --------------------- | -------------------------------------- |
| `id`                  | UUID            | PK                    |                                        |
| `name`                | VARCHAR(50)     | NOT NULL              | Display name                           |
| `code`                | leave_type_enum | NOT NULL              | Enum value                             |
| `requires_approval`   | BOOLEAN         | DEFAULT true          |                                        |
| `max_days`            | INT             | nullable              | Maximum duration                       |
| `parent_notification` | VARCHAR(20)     | DEFAULT 'ON_APPROVAL' | ON_REQUEST, ON_APPROVAL, ALWAYS, NEVER |
| `is_active`           | BOOLEAN         | DEFAULT true          |                                        |
| `vertical`            | vertical_type   | nullable              | Null = all verticals                   |
| `created_at`          | TIMESTAMPTZ     | DEFAULT NOW()         |                                        |

**Used by:** Student leave page (form options), superintendent config page
**Index:** `code`, `is_active`

---

#### `blackout_dates` — No-leave periods

| Column       | Type          | Constraints   | Why                             |
| ------------ | ------------- | ------------- | ------------------------------- |
| `id`         | UUID          | PK            |                                 |
| `start_date` | DATE          | NOT NULL      |                                 |
| `end_date`   | DATE          | NOT NULL      |                                 |
| `reason`     | VARCHAR(255)  | NOT NULL      | "Exam period", "Festival", etc. |
| `vertical`   | vertical_type | nullable      | Null = all verticals            |
| `created_by` | UUID          | FK → users    |                                 |
| `created_at` | TIMESTAMPTZ   | DEFAULT NOW() |                                 |

**Used by:** Superintendent config page (blackout dates tab)
**Index:** `start_date`, `end_date`, `vertical`

---

#### `renewals` — 6-month renewal cycle management

| Column              | Type           | Constraints                 | Why                            |
| ------------------- | -------------- | --------------------------- | ------------------------------ |
| `id`                | UUID           | PK                          |                                |
| `student_id`        | UUID           | FK → users, NOT NULL        |                                |
| `application_id`    | UUID           | FK → applications, nullable | Original application           |
| `renewal_period`    | VARCHAR(20)    | NOT NULL                    | "H1-2025", "H2-2025"           |
| `due_date`          | DATE           | NOT NULL                    | Renewal deadline               |
| `status`            | renewal_status | DEFAULT 'PENDING'           |                                |
| `documents_updated` | BOOLEAN        | DEFAULT false               | Student resubmitted docs       |
| `fees_paid`         | BOOLEAN        | DEFAULT false               | Renewal fee paid               |
| `consent_signed_at` | TIMESTAMPTZ    | nullable                    | DPDP consent renewal timestamp |
| `renewed_at`        | TIMESTAMPTZ    | nullable                    |                                |
| `created_at`        | TIMESTAMPTZ    | DEFAULT NOW()               |                                |
| `updated_at`        | TIMESTAMPTZ    | DEFAULT NOW()               |                                |

**Used by:** Student renewal page (4-step flow), superintendent renewal page
**Index:** `student_id`, `renewal_period`, `status`, `due_date`

---

#### `exit_requests` — Student departure tracking

| Column             | Type        | Constraints          | Why                                     |
| ------------------ | ----------- | -------------------- | --------------------------------------- |
| `id`               | UUID        | PK                   |                                         |
| `student_id`       | UUID        | FK → users, NOT NULL |                                         |
| `reason`           | exit_reason | NOT NULL             |                                         |
| `reason_details`   | TEXT        | nullable             |                                         |
| `requested_date`   | DATE        | NOT NULL             | When student wants to leave             |
| `actual_exit_date` | DATE        | nullable             | Actual departure                        |
| `status`           | VARCHAR(20) | DEFAULT 'PENDING'    | PENDING, APPROVED, COMPLETED, CANCELLED |
| `approved_by`      | UUID        | FK → users, nullable |                                         |
| `clearance_status` | VARCHAR(20) | DEFAULT 'PENDING'    | PENDING, COMPLETE, INCOMPLETE           |
| `created_at`       | TIMESTAMPTZ | DEFAULT NOW()        |                                         |
| `updated_at`       | TIMESTAMPTZ | DEFAULT NOW()        |                                         |

**Used by:** Student exit page, superintendent clearance page
**Index:** `student_id`, `status`

---

#### `exit_clearance_items` — Departure checklist items

| Column            | Type                | Constraints                  | Why                              |
| ----------------- | ------------------- | ---------------------------- | -------------------------------- |
| `id`              | UUID                | PK                           |                                  |
| `exit_request_id` | UUID                | FK → exit_requests, NOT NULL |                                  |
| `item_type`       | clearance_item_type | NOT NULL                     | ROOM_CLEARED, KEY_RETURNED, etc. |
| `status`          | VARCHAR(20)         | DEFAULT 'PENDING'            | PENDING, COMPLETED               |
| `verified_by`     | UUID                | FK → users, nullable         |                                  |
| `verified_at`     | TIMESTAMPTZ         | nullable                     |                                  |
| `remarks`         | TEXT                | nullable                     |                                  |

**Used by:** Superintendent clearance page (checklist)
**Index:** `exit_request_id`

---

#### `communications` — Immutable message log

| Column                | Type         | Constraints          | Why                                  |
| --------------------- | ------------ | -------------------- | ------------------------------------ |
| `id`                  | UUID         | PK                   |                                      |
| `recipient_id`        | UUID         | FK → users, nullable |                                      |
| `recipient_contact`   | VARCHAR(255) | NOT NULL             | Phone or email captured at send time |
| `channel`             | comm_channel | NOT NULL             | SMS, WHATSAPP, EMAIL                 |
| `purpose`             | comm_purpose | NOT NULL             |                                      |
| `subject`             | VARCHAR(255) | nullable             | For emails                           |
| `message_body`        | TEXT         | NOT NULL             |                                      |
| `related_entity_type` | VARCHAR(50)  | nullable             | APPLICATION, LEAVE, FEE, etc.        |
| `related_entity_id`   | UUID         | nullable             |                                      |
| `sent_by`             | UUID         | FK → users, nullable |                                      |
| `status`              | VARCHAR(20)  | DEFAULT 'PENDING'    | PENDING, SENT, FAILED, DELIVERED     |
| `external_message_id` | VARCHAR(100) | nullable             | SMS provider reference               |
| `sent_at`             | TIMESTAMPTZ  | nullable             |                                      |
| `created_at`          | TIMESTAMPTZ  | DEFAULT NOW()        |                                      |

**Used by:** Superintendent audit page (communication logs), compliance reports
**Index:** `recipient_id`, `purpose`, `related_entity_id`, `created_at`

---

#### `notification_rules` — Admin-configurable notification triggers

| Column           | Type          | Constraints   | Why                                                 |
| ---------------- | ------------- | ------------- | --------------------------------------------------- |
| `id`             | UUID          | PK            |                                                     |
| `event_type`     | VARCHAR(50)   | NOT NULL      | APPLICATION_SUBMITTED, FEE_DUE, LEAVE_REQUEST, etc. |
| `recipient_type` | VARCHAR(20)   | NOT NULL      | APPLICANT, STUDENT, PARENT, SUPERINTENDENT          |
| `channels`       | JSONB         | NOT NULL      | ["SMS", "WHATSAPP", "EMAIL"]                        |
| `enabled`        | BOOLEAN       | DEFAULT true  |                                                     |
| `vertical`       | vertical_type | nullable      |                                                     |
| `created_at`     | TIMESTAMPTZ   | DEFAULT NOW() |                                                     |
| `updated_at`     | TIMESTAMPTZ   | DEFAULT NOW() |                                                     |

**Used by:** Superintendent config page (notification rules tab)

---

#### `audit_logs` — Immutable event history (INSERT-ONLY)

| Column         | Type         | Constraints          | Why                                     |
| -------------- | ------------ | -------------------- | --------------------------------------- |
| `id`           | UUID         | PK                   |                                         |
| `entity_type`  | VARCHAR(50)  | NOT NULL             | APPLICATION, DOCUMENT, FEE, LEAVE, etc. |
| `entity_id`    | UUID         | NOT NULL             |                                         |
| `action`       | audit_action | NOT NULL             | CREATE, UPDATE, STATUS_CHANGE, etc.     |
| `old_value`    | JSONB        | nullable             | Previous state                          |
| `new_value`    | JSONB        | nullable             | New state                               |
| `performed_by` | UUID         | FK → users, nullable | Null for system actions                 |
| `ip_address`   | VARCHAR(45)  | nullable             |                                         |
| `user_agent`   | TEXT         | nullable             |                                         |
| `metadata`     | JSONB        | nullable             | Extra context                           |
| `performed_at` | TIMESTAMPTZ  | DEFAULT NOW()        |                                         |

**Used by:** Superintendent audit page, trustee reports, compliance reports
**Index:** `entity_type`, `entity_id`, `performed_at`, `performed_by`
**IMPORTANT:** This table must be INSERT-ONLY — no UPDATE or DELETE allowed.

---

#### `consent_logs` — DPDP Act compliance (digital fingerprints)

| Column                | Type         | Constraints                 | Why                            |
| --------------------- | ------------ | --------------------------- | ------------------------------ |
| `id`                  | UUID         | PK                          |                                |
| `user_id`             | UUID         | FK → users, nullable        |                                |
| `application_id`      | UUID         | FK → applications, nullable |                                |
| `consent_type`        | consent_type | NOT NULL                    |                                |
| `consent_version`     | VARCHAR(20)  | NOT NULL                    | Version identifier             |
| `accepted`            | BOOLEAN      | NOT NULL                    |                                |
| `digital_fingerprint` | VARCHAR(255) | nullable                    | Browser/device hash            |
| `ip_address`          | VARCHAR(45)  | nullable                    |                                |
| `valid_until`         | TIMESTAMPTZ  | nullable                    | For renewal consent (6 months) |
| `accepted_at`         | TIMESTAMPTZ  | DEFAULT NOW()               |                                |

**Used by:** Apply form (consent step), student renewal (consent step), DPDP policy page
**Index:** `user_id`, `application_id`, `consent_type`

---

#### `verticals` — Hostel division configuration

| Column              | Type          | Constraints          | Why                                    |
| ------------------- | ------------- | -------------------- | -------------------------------------- |
| `id`                | UUID          | PK                   |                                        |
| `code`              | vertical_type | UNIQUE, NOT NULL     | BOYS_HOSTEL, GIRLS_ASHRAM, DHARAMSHALA |
| `display_name`      | VARCHAR(100)  | NOT NULL             |                                        |
| `superintendent_id` | UUID          | FK → users, nullable | Assigned superintendent                |
| `max_capacity`      | INT           | nullable             |                                        |
| `description`       | TEXT          | nullable             |                                        |
| `is_active`         | BOOLEAN       | DEFAULT true         |                                        |

**Used by:** Apply page (vertical selection), institutions pages, admin configuration
**Index:** `code`

---

#### `fee_configuration` — Dynamic fee structure per vertical/session

| Column             | Type          | Constraints   | Why                        |
| ------------------ | ------------- | ------------- | -------------------------- |
| `id`               | UUID          | PK            |                            |
| `vertical`         | vertical_type | nullable      | Null = all verticals       |
| `academic_session` | VARCHAR(20)   | NOT NULL      | "2024-2025"                |
| `fee_head`         | VARCHAR(50)   | NOT NULL      |                            |
| `amount`           | DECIMAL(10,2) | NOT NULL      |                            |
| `frequency`        | VARCHAR(20)   | NOT NULL      | ONE_TIME, SEMESTER, ANNUAL |
| `is_refundable`    | BOOLEAN       | DEFAULT false |                            |
| `valid_from`       | DATE          | NOT NULL      |                            |
| `valid_until`      | DATE          | nullable      |                            |
| `created_at`       | TIMESTAMPTZ   | DEFAULT NOW() |                            |

**Used by:** Accounts dashboard (fee structure), fee generation logic

---

#### `system_settings` — Global key-value configuration

| Column        | Type         | Constraints          | Why |
| ------------- | ------------ | -------------------- | --- |
| `id`          | UUID         | PK                   |     |
| `key`         | VARCHAR(100) | UNIQUE, NOT NULL     |     |
| `value`       | TEXT         | NOT NULL             |     |
| `description` | TEXT         | nullable             |     |
| `updated_by`  | UUID         | FK → users, nullable |     |
| `updated_at`  | TIMESTAMPTZ  | DEFAULT NOW()        |     |

**Used by:** System-wide settings (renewal reminder days, fee due offset, etc.)

---

### 1.3 Table Count Summary

| Category           | Tables                                                               | Count  |
| ------------------ | -------------------------------------------------------------------- | ------ |
| Identity & Auth    | users, sessions, otp_verifications                                   | 3      |
| Applications       | applications, documents, interviews                                  | 3      |
| Stay & Operations  | rooms, room_allocations, leave_requests, leave_types, blackout_dates | 5      |
| Financial          | fees, transactions, fee_configuration                                | 3      |
| Renewals & Exit    | renewals, exit_requests, exit_clearance_items                        | 3      |
| Communication      | communications, notification_rules                                   | 2      |
| Audit & Compliance | audit_logs, consent_logs                                             | 2      |
| Configuration      | verticals, system_settings                                           | 2      |
| **Total**          |                                                                      | **23** |

---

## 2. Migration Activities Checklist

### Phase 1: Database Setup

- [x] Create fresh database on PG server (`hostel_pro` created on `51.68.196.242`)
- [x] Run SQL migration script (`sql/001_create_schema.sql`) — all 23 tables created
- [x] Verify all tables, indexes, constraints, and triggers (23 tables, 60+ indexes, 8 triggers, 2 immutability rules)
- [x] Seed initial data: verticals (3), leave_types (7), system_settings (8), fee_configuration (10)

### Phase 2: Auth Replacement

- [x] Install `jsonwebtoken`, `bcryptjs`, `pg` in frontend and backend (+ @types)
- [x] Create `frontend/src/lib/db.ts` — PG connection pool
- [x] Create `frontend/src/lib/auth.ts` — JWT sign/verify, bcrypt hash/compare, OTP create/verify, session management, audit logging
- [x] Rewrite 11 API routes removing all Supabase imports:
  - [x] `auth/login` — bcrypt password verify + custom JWT
  - [x] `auth/session` — JWT verify + PG user lookup
  - [x] `auth/logout` — invalidate sessions in PG
  - [x] `auth/first-time-setup` — bcrypt hash + PG update
  - [x] `auth/forgot-password` — PG user lookup + DB-backed OTP
  - [x] `auth/reset-password` — bcrypt hash + OTP verify from PG
  - [x] `otp/send`, `otp/verify`, `otp/resend` — DB-backed OTP system
  - [x] `admin/seed-auth-users` — direct PG insert with bcrypt
  - [x] `health` — PG connection test
- [ ] Integrate SMS provider (MSG91/Twilio) for OTP delivery (using dev mode OTP `123456` for now)
- [x] Update frontend `.env` — `DATABASE_URL`, `JWT_SECRET` replacing all `SUPABASE_*` vars
- [x] Seed 11 test users with hashed passwords (`sql/002_seed_test_users.sql`)
- [x] Build passes successfully

### Phase 3: Storage Replacement

- [x] Create `uploads/` directory structure: applications/, students/, undertakings/, receipts/, system/
- [x] Create `frontend/src/lib/storage.ts` — saveFile, deleteFile, readFile, generateSignedToken, verifySignedToken
- [x] Create file serve endpoint: `GET /api/files/serve?token=...` with HMAC-signed temporary URLs
- [x] Rewrite 4 document API routes removing all Supabase Storage:
  - [x] `applications/documents/upload` — saves to uploads/applications/
  - [x] `applications/documents/url` — generates signed URL token
  - [x] `student/documents/upload` — saves to uploads/students/ + creates DB record
  - [x] `student/documents/[id]/url` — looks up DB record + generates signed URL
- [x] Added `uploads/` to .gitignore
- [ ] Migrate existing files from Supabase Storage to `uploads/` (defer — no production data yet)
- [x] Build passes, zero Supabase storage references remain

### Phase 4: Client Migration (Frontend API Routes)

- [x] `pg` already installed in Phase 2; `src/lib/db.ts` already created
- [x] Replaced ALL 37 `createServerClient()` calls with direct PG queries:
  - [x] Auth routes (6 files) — done in Phase 2
  - [x] Application routes (4 files) — applications CRUD, submit, tracking
  - [x] Interview routes (4 files) — CRUD, complete, slots
  - [x] Room/allocation routes (4 files) — rooms, allocations, vacate
  - [x] Fee/payment routes (3 files) — fees, payments, verify
  - [x] Leave routes (3 files) — CRUD, approve, reject
  - [x] Dashboard routes (5 files) — student, parent, superintendent, trustee, accounts
  - [x] Parent routes (3 files) — student, fees, leave
  - [x] Document routes (4 files) — done in Phase 3
  - [x] Config routes (3 files) — leave-types, blackout-dates, notification-rules
  - [x] Audit routes (2 files) — auditLogs, entity audit
  - [x] Admin routes (2 files) — seed-auth-users, reset-password
  - [x] User routes (2 files) — list, profile (GET + PUT)
  - [x] Health check (1 file) — done in Phase 2
  - [x] Communications (1 file) — list, create
  - [x] Renewals (1 file) — list with JOINs
- [x] Removed `@supabase/supabase-js` from frontend `package.json`
- [x] Removed `src/lib/supabase/` directory
- [x] Zero Supabase references remain in frontend API routes
- [x] Build passes successfully

### Phase 5: ~~Client Migration (Backend NestJS)~~ → REMOVED

**Decision:** NestJS backend removed entirely. All API logic consolidated in Next.js API routes.
- [x] ~~Backend was migrated to PG~~ (work done but then removed)
- [x] Deleted `backend/` directory
- [x] Removed `dev:backend`, `dev:all`, `build:backend` scripts from root `package.json`
- [x] Added `backend/` to `.gitignore`
- [x] Updated `CLAUDE.md` to reflect single-tier architecture
- **Reason:** Frontend Next.js API routes already handle all auth, CRUD, storage, and business logic. Running two API layers was redundant.

### Phase 6: Authorization Middleware (replaces RLS)

- [x] Created `frontend/src/lib/authorize.ts` — `requireAuth(request, roles[])`, `optionalAuth()`, `canAccessStudent()`, `getVerticalFilter()`
- [x] Added `requireAuth()` to 35 API route files (61 handler functions):
  - [x] Unauthenticated requests → 401 "Authentication required"
  - [x] Wrong role → 403 "Insufficient permissions"
  - [x] Students forced to own data (fees, leaves, documents, renewals)
  - [x] Parents restricted to parent routes only
  - [x] Superintendents get vertical filtering
  - [x] Trustees see all approved applications
  - [x] Accounts see all financial data
  - [x] Public routes (login, OTP, tracking, health) remain unauthenticated
- [x] Verified: unauthenticated → 401, student → can't access staff routes, parent → can't access superintendent, public tracking → still works
- [x] Build passes

### Phase 7: Environment Variables

- [x] Frontend `.env` already configured with `DATABASE_URL`, `JWT_SECRET`
- [x] All `SUPABASE_*` env vars removed
- [ ] Generate production-strength JWT_SECRET before deployment
- [ ] Configure SMS provider API key when ready

### Phase 8: Testing & Verification

- [x] Build passes (`npm run build` — compiled successfully)
- [x] Login works for all 5 roles (SUPERINTENDENT, TRUSTEE, ACCOUNTS, STUDENT, PARENT)
- [x] OTP send + verify flow works (dev mode OTP 123456)
- [x] Student fees: 4 items, ₹45,000 pending, ₹500 paid
- [x] Rooms: 29 rooms loaded from PG
- [x] Leave types: 7 types loaded from PG
- [x] Document upload works (saved to disk + DB record)
- [x] Auth enforcement: 401 for no token, 403 for wrong role
- [x] PG data: 10 users, 29 rooms, 6 fees, 7 leave types, 33 audit logs, 26 sessions
- [x] Zero Supabase references in entire codebase
- [x] No backend process required (single Next.js process)

---

## 3. Auth Replacement

### Current (Supabase Auth)

- `supabase.auth.signInWithOtp({ phone })` → sends SMS OTP
- `supabase.auth.verifyOtp({ phone, token })` → verifies and returns JWT
- `supabase.auth.signInWithPassword({ email, password })` → returns JWT
- `supabase.auth.getUser(token)` → validates JWT
- `supabase.auth.admin.createUser()` → creates auth user
- `supabase.auth.admin.updateUserById()` → password reset

### Replacement

1. **OTP:** Generate 6-digit code → store in `otp_verifications` → send via SMS API → verify against table
2. **Password:** Hash with bcrypt → store in `users.password_hash` → compare on login
3. **JWT:** Issue with `jsonwebtoken` lib → payload: `{ userId, role, vertical, exp }` → verify in middleware
4. **Sessions:** Store refresh tokens in `sessions` table → rotate on refresh → expire after 7 days

---

## 4. Storage Replacement

### Current (Supabase Storage)

- 4 buckets: `applications-documents`, `student-documents`, `undertakings`, `system-generated`
- Signed URLs for secure access
- RLS on storage

### Replacement

- Save files to `uploads/<category>/<year>/<month>/<uuid>-<filename>`
- Serve via authenticated API endpoint: `GET /api/files/:id` (checks user authorization)
- For temporary public access: generate time-limited signed URLs using HMAC

---

## 5. Client Migration

### Database Driver Choice

**Recommended: `pg` (node-postgres)** for API routes + raw SQL

- Lightweight, no ORM overhead
- Direct control over queries
- Already familiar pattern from Supabase `.from().select()` → just becomes SQL

### Connection Pool Setup

```typescript
// frontend/src/lib/db.ts
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
});

export const query = (text: string, params?: any[]) => pool.query(text, params);
export default pool;
```

### Query Pattern Change

```typescript
// Before (Supabase)
const { data, error } = await supabase
  .from("applications")
  .select("*")
  .eq("vertical", "BOYS_HOSTEL");

// After (pg)
const { rows } = await query("SELECT * FROM applications WHERE vertical = $1", [
  "BOYS_HOSTEL",
]);
```

---

## 6. SQL Migration Script

See separate file: `sql/001_create_schema.sql` (to be generated from the table definitions above)
