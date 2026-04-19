# Manual Testing Guide - Hostel Pro

**Last Updated:** 2026-04-19
**Purpose:** Production readiness verification for all workflows, roles, and features.

---

## Table of Contents

1. [Environment Setup](#1-environment-setup)
2. [Test Credentials](#2-test-credentials)
3. [Application Flow Testing](#3-application-flow-testing)
4. [Authentication Testing](#4-authentication-testing)
5. [Student Dashboard Testing](#5-student-dashboard-testing)
6. [Superintendent Dashboard Testing](#6-superintendent-dashboard-testing)
7. [Trustee Dashboard Testing](#7-trustee-dashboard-testing)
8. [Accounts Dashboard Testing](#8-accounts-dashboard-testing)
9. [Parent Portal Testing](#9-parent-portal-testing)
10. [Room Allocation Testing](#10-room-allocation-testing)
11. [Leave Management Testing](#11-leave-management-testing)
12. [Interview Workflow Testing](#12-interview-workflow-testing)
13. [Exit & Clearance Testing](#13-exit--clearance-testing)
14. [Fee & Payment Testing](#14-fee--payment-testing)
15. [Renewal Cycle Testing](#15-renewal-cycle-testing)
16. [Document Management Testing](#16-document-management-testing)
17. [Authorization & Security Testing](#17-authorization--security-testing)
18. [API Endpoint Reference](#18-api-endpoint-reference)
19. [Known Limitations](#19-known-limitations)

---

## 1. Environment Setup

### Prerequisites

```bash
# Start the development server
npm run dev    # Runs on http://localhost:3000
```

### Database Seeding (First-Time Only)

Run these SQL scripts in order:

```bash
psql -h <DB_HOST> -U <DB_USER> -d hostel_pro -f sql/001_create_schema.sql
psql -h <DB_HOST> -U <DB_USER> -d hostel_pro -f sql/002_seed_test_users.sql
psql -h <DB_HOST> -U <DB_USER> -d hostel_pro -f sql/003_seed_rooms_and_fees.sql
psql -h <DB_HOST> -U <DB_USER> -d hostel_pro -f sql/004_add_missing_columns.sql
```

### Environment Variables

Ensure `.env` is configured (see `.env.example`):

| Variable | Required | Notes |
|----------|----------|-------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `JWT_SECRET` | Yes | Min 48 chars |
| `JWT_EXPIRES_IN` | Yes | Default: `86400` (1 day) |
| `JWT_REFRESH_EXPIRES_IN` | Yes | Default: `604800` (7 days) |
| `ADMIN_SEED_SECRET` | Yes | For `/api/admin/*` endpoints |
| `NODE_ENV` | Yes | `development` or `production` |
| `MSG91_AUTH_KEY` | Prod only | SMS OTP provider |
| `MSG91_TEMPLATE_ID` | Prod only | DLT-approved template |

### Development Mode OTP

In `NODE_ENV=development`, all OTPs use the fixed code: **`123456`**

---

## 2. Test Credentials

**Password for all seeded users:** `Password123`

### Staff & Admin Accounts

| Role | Email | Mobile | Vertical | Login URL |
|------|-------|--------|----------|-----------|
| Superintendent (Boys) | `supt.boys@hostelpro.in` | +919999900002 | BOYS_HOSTEL | `/login` |
| Superintendent (Girls) | `supt.girls@hostelpro.in` | +919999900003 | GIRLS_ASHRAM | `/login` |
| Superintendent (Dharamshala) | `supt.dharamshala@hostelpro.in` | +919999900004 | DHARAMSHALA | `/login` |
| Trustee 1 | `trustee1@hostelpro.in` | +919999900005 | All verticals | `/login` |
| Trustee 2 | `trustee2@hostelpro.in` | +919999900006 | All verticals | `/login` |
| Accounts | `accounts@hostelpro.in` | +919999900007 | All verticals | `/login` |

### Student Accounts

| Name | Email | Mobile | Vertical | Login URL |
|------|-------|--------|----------|-----------|
| Amit Kumar Jain | `amit.jain@student.in` | +919999900010 | BOYS_HOSTEL | `/login` |
| Sneha Shah | `sneha.shah@student.in` | +919999900011 | GIRLS_ASHRAM | `/login` |

### Parent Accounts (OTP Login)

| Name | Email | Mobile | Child | Login URL |
|------|-------|--------|-------|-----------|
| Suresh Jain | `parent.jain@parent.in` | +919999900020 | Amit Kumar Jain | `/login/parent` |
| Ramesh Shah | `parent.shah@parent.in` | +919999900021 | Sneha Shah | `/login/parent` |

> **Note:** Parents primarily use OTP-based login at `/login/parent`. In dev mode, use OTP `123456`.

### Seeded Fee Data

**Amit Kumar Jain (Boys Hostel):**
| Fee Head | Amount | Status |
|----------|--------|--------|
| Hostel Fees Semester 1 | Rs 30,000 | PENDING |
| Security Deposit | Rs 5,000 | PENDING |
| Processing Fee | Rs 500 | PAID |
| Mess Advance Semester 1 | Rs 10,000 | PENDING |

**Sneha Shah (Girls Ashram):**
| Fee Head | Amount | Status |
|----------|--------|--------|
| Hostel Fees Semester 1 | Rs 25,000 | PENDING |
| Processing Fee | Rs 500 | PAID |

### Seeded Rooms (29 Total)

| Vertical | Count | Floor Range | Types |
|----------|-------|-------------|-------|
| Boys Hostel | 15 | 1-3 | Single, Double, Triple |
| Girls Ashram | 8 | 1-2 | Double, Triple |
| Dharamshala | 6 | 1-2 | Double, Quad |

---

## 3. Application Flow Testing

The application flow is the primary guest-facing workflow. Test for **all three verticals**: Boys Hostel, Girls Ashram, and Dharamshala.

### TC-APP-01: Vertical Selection

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/apply` | Page shows 3 hostel cards (Boys, Girls, Dharamshala) |
| 2 | Verify DPDP compliance banner | Privacy notice is displayed |
| 3 | Verify document checklist | Required documents list is shown |
| 4 | Click "Boys Hostel" card | Redirects to `/apply/boys-hostel/contact` |
| 5 | Repeat for Girls Ashram | Redirects to `/apply/girls-ashram/contact` |
| 6 | Repeat for Dharamshala | Redirects to `/apply/dharamshala/contact` |

### TC-APP-02: Contact Details & OTP Sending

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Select "Mobile Number" tab | Mobile input field appears |
| 2 | Enter invalid number (e.g., `12345`) | Validation error: must be 10 digits starting with 6-9 |
| 3 | Enter valid number (e.g., `9876543210`) | No validation error |
| 4 | Click "Send OTP" | API `POST /api/otp/send` is called, OTP token returned |
| 5 | Verify 60-second resend timer starts | Resend button disabled with countdown |
| 6 | Switch to "Email" tab | Email input appears |
| 7 | Enter invalid email | Validation error |
| 8 | Enter valid email and send OTP | OTP sent successfully |

### TC-APP-03: OTP Verification

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Enter wrong OTP (e.g., `000000`) | Error: "Invalid OTP" |
| 2 | Enter correct OTP (`123456` in dev) | Success, redirects to form page |
| 3 | Test 10-minute expiry | OTP expires after 10 minutes, shows expiry message |
| 4 | Test 3 attempt limit | After 3 wrong attempts, user is locked out with fallback options |
| 5 | Test paste functionality | Pasting 6-digit code fills all fields |
| 6 | Test resend OTP | `POST /api/otp/resend` sends new OTP |

### TC-APP-04: Multi-Step Application Form

**Step 1 - Personal Details:**
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Leave all fields empty, click Next | Validation errors on required fields |
| 2 | Enter DOB making applicant <18 years | Age validation warning |
| 3 | Fill all required fields correctly | Can proceed to next step |
| 4 | Verify father/mother info fields | All guardian fields validated |
| 5 | Verify emergency contact section | Required fields enforced |

**Step 2 - Academic Information:**
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Fill institution, course, year | All required fields validated |
| 2 | Enter CGPA/percentage | Accepts valid values |
| 3 | Fill previous qualification details | Required fields enforced |

**Step 3 - Hostel Preferences:**
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Verify vertical is pre-selected & disabled | Cannot change vertical |
| 2 | Select room type (2/3/4 sharing) | Selection stored |
| 3 | Select duration (6 months - 4 years) | Duration stored |
| 4 | Set intended joining date | Date validated |
| 5 | Add special requirements (optional) | Text saved |

**Step 4 - References:**
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Leave Reference 1 empty | Validation error: at least 1 required |
| 2 | Fill Reference 1 with valid data | Validation passes |
| 3 | Reference 2 is optional | Can skip without error |

**Step 5 - Document Upload:**
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Skip required documents | Cannot proceed |
| 2 | Upload file >5MB | Error: file too large |
| 3 | Upload non-PDF/JPG file | Error: invalid format |
| 4 | Upload valid passport photo (JPG, <5MB) | Upload succeeds via `POST /api/applications/documents/upload` |
| 5 | Upload birth certificate (PDF) | Upload succeeds |
| 6 | Upload educational marksheet | Upload succeeds |
| 7 | Community letter (optional) | Can skip |

**Step 6 - Review & Submit:**
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Review all entered data | All sections displayed correctly |
| 2 | Verify uploaded documents shown | Document names/thumbnails visible |
| 3 | Submit without declaration checkbox | Cannot submit |
| 4 | Check declaration and submit | `POST /api/applications` called, application created |
| 5 | Verify tracking number generated | Unique tracking number shown |
| 6 | Verify redirect to success page | `/apply/[vertical]/success` shown |

### TC-APP-05: Draft Recovery

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Start filling form, close browser | Draft auto-saved to localStorage |
| 2 | Reopen same URL | Draft restored with previously entered data |
| 3 | Complete and submit | Draft cleared from localStorage |

### TC-APP-06: Application Tracking

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to track page with tracking number | Application status displayed |
| 2 | Use invalid tracking number | Error: application not found |

---

## 4. Authentication Testing

### TC-AUTH-01: Staff Login

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Go to `/login` | Login form with email/password fields |
| 2 | Enter invalid credentials | Error message shown |
| 3 | Enter valid Superintendent credentials | Redirects to `/dashboard/superintendent` |
| 4 | Enter valid Trustee credentials | Redirects to `/dashboard/trustee` |
| 5 | Enter valid Accounts credentials | Redirects to `/dashboard/accounts` |
| 6 | Enter valid Student credentials | Redirects to `/dashboard/student` |

### TC-AUTH-02: Parent OTP Login

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Go to `/login/parent` | Mobile number input shown |
| 2 | Enter registered parent mobile | OTP sent via `POST /api/otp/send` |
| 3 | Enter OTP `123456` (dev) | Session created, redirects to `/dashboard/parent` |
| 4 | Enter unregistered mobile | Error: no parent account found |

### TC-AUTH-03: First-Time Password Setup

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Login with a newly seeded user | Redirects to `/login/first-time-setup` |
| 2 | Enter weak password (e.g., `abc`) | Fails: needs 8+ chars, uppercase, lowercase, number, special char |
| 3 | Enter mismatched passwords | Error: passwords don't match |
| 4 | Skip DPDP consent checkbox | Cannot submit |
| 5 | Enter strong password + check consent | Password set, redirects to dashboard |

**Password Requirements:**
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number
- At least 1 special character (`@#$%^&*`)

### TC-AUTH-04: Forgot Password

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Go to `/login/forgot-password` | Email/mobile input shown |
| 2 | Enter registered email/mobile | OTP sent |
| 3 | Verify OTP | Identity confirmed |
| 4 | Set new password | Password updated, can login with new password |

### TC-AUTH-05: Session Management

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Verify `GET /api/auth/session` returns user info | Session data returned |
| 2 | Click Logout (`POST /api/auth/logout`) | Token cleared, redirected to login |
| 3 | Access dashboard URL after logout | Redirected to login page |
| 4 | Verify JWT token expiry (24h) | Token expires, user must re-login |

---

## 5. Student Dashboard Testing

**Login as:** `amit.jain@student.in` / `Password123`

### TC-STU-01: Dashboard Overview

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Login as student | `/dashboard/student` loads |
| 2 | Verify overview stats | Vertical, room status, joining date, renewal days, pending fees shown |
| 3 | Verify sidebar navigation | Links to Room, Leave, Documents, Fees, Mess, Visitor, Biometric, Exit, Renewal |

### TC-STU-02: Room Information

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/dashboard/student/room` | Current room details displayed |
| 2 | Verify room number, type, sharing | Matches allocated room |
| 3 | Verify roommate information | Other occupants shown (if any) |

### TC-STU-03: Room Check-In

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/dashboard/student/room/check-in` | Check-in form shown |
| 2 | Confirm check-in | Status updates to CHECKED_IN |
| 3 | Verify check-in timestamp recorded | Date/time stored |

### TC-STU-04: Leave Requests (Student Side)

See [Section 11: Leave Management Testing](#11-leave-management-testing) for full details.

### TC-STU-05: Document Management

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/dashboard/student/documents` | Document list shown |
| 2 | Click "Upload" | Upload form with document type selector |
| 3 | Select "Aadhar Card" and upload JPG | Document uploaded via `POST /api/student/documents/upload` |
| 4 | Verify document appears in list | New document shown with date |
| 5 | Click download on uploaded document | File downloads correctly |

### TC-STU-06: Fee & Payment View

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/dashboard/student/fees` | Fee breakdown shown |
| 2 | Verify amounts match seeded data | Hostel: 30K, Security: 5K, Processing: 500 (PAID), Mess: 10K |
| 3 | Verify outstanding balance calculation | Rs 45,000 pending |
| 4 | Check payment history | Processing fee shows as PAID |

### TC-STU-07: Exit Request

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/dashboard/student/exit` | Exit request form shown |
| 2 | Fill reason and intended exit date | Form validated |
| 3 | Submit exit request | `POST /api/student/exit-request` called, status: PENDING |
| 4 | Verify request appears in dashboard | Exit request status visible |
| 5 | Test withdraw request | `POST /api/student/exit-request/withdraw` cancels request |

### TC-STU-08: Renewal

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/dashboard/student/renewal` | Renewal status/form shown |
| 2 | Check renewal timeline | Days remaining displayed |
| 3 | Submit renewal application | `POST /api/renewals` called |

---

## 6. Superintendent Dashboard Testing

**Login as:** `supt.boys@hostelpro.in` / `Password123`

### TC-SUPT-01: Dashboard Overview

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Login as superintendent | `/dashboard/superintendent` loads |
| 2 | Verify overview stats | Total residents, occupancy rate, pending tasks, recent activities |
| 3 | Verify data is filtered to BOYS_HOSTEL only | No Girls Ashram or Dharamshala data shown |

### TC-SUPT-02: Room Management

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/dashboard/superintendent/rooms` | Room list for BOYS_HOSTEL shown |
| 2 | Verify 15 boys hostel rooms displayed | Rooms across 3 floors visible |
| 3 | Check room capacity and occupancy | Current occupants shown per room |
| 4 | Add a new room | `POST /api/rooms` creates room |
| 5 | Update room details | `PUT /api/rooms/{id}` updates |

### TC-SUPT-03: Leave Approval

See [Section 11: Leave Management Testing](#11-leave-management-testing).

### TC-SUPT-04: Room Allocation

See [Section 10: Room Allocation Testing](#10-room-allocation-testing).

### TC-SUPT-05: Exit Clearance

See [Section 13: Exit & Clearance Testing](#13-exit--clearance-testing).

### TC-SUPT-06: Configuration

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/dashboard/superintendent/config` | Config page loads |
| 2 | View leave type rules | Leave types with limits shown |
| 3 | Modify leave limits | Limits updated via `POST /api/config/leave-types` |
| 4 | Set blackout dates | Dates saved via `POST /api/config/blackout-dates` |
| 5 | Configure notification rules | Rules saved via `POST /api/config/notification-rules` |

### TC-SUPT-07: Audit Log

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/dashboard/superintendent/audit` | Audit log entries displayed |
| 2 | Filter by entity type | Filtered results shown |
| 3 | View entity history | `GET /api/audit/entity/{type}/{id}` returns change history |

### TC-SUPT-08: Vertical Isolation

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Login as `supt.boys@hostelpro.in` | Only BOYS_HOSTEL data visible |
| 2 | Login as `supt.girls@hostelpro.in` | Only GIRLS_ASHRAM data visible |
| 3 | Login as `supt.dharamshala@hostelpro.in` | Only DHARAMSHALA data visible |
| 4 | Try accessing another vertical's room via API | 403 Forbidden |

---

## 7. Trustee Dashboard Testing

**Login as:** `trustee1@hostelpro.in` / `Password123`

### TC-TRUST-01: Dashboard Overview

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Login as trustee | `/dashboard/trustee` loads |
| 2 | Verify stats | Pending applications, scheduled interviews, pending allocations, approval counts |
| 3 | Verify all verticals visible | Data from Boys, Girls, and Dharamshala shown |

### TC-TRUST-02: Application Review

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/dashboard/trustee/applications` | Application list shown |
| 2 | Filter by vertical | Only selected vertical's applications shown |
| 3 | Filter by status (SUBMITTED, REVIEW, etc.) | Filtered correctly |
| 4 | Click an application | Full details page with all form data |
| 5 | View uploaded documents | Documents accessible |
| 6 | Change status to REVIEW | Status updated via `PUT /api/applications/{id}` |
| 7 | Forward to INTERVIEW | Status changed to FORWARDED |
| 8 | Export application as PDF | `GET /api/applications/{id}/pdf` generates PDF |

### TC-TRUST-03: Application Status Workflow

Test the complete status chain:

```
SUBMITTED → REVIEW → FORWARDED → INTERVIEW_SCHEDULED → INTERVIEW_COMPLETED → APPROVED
                                                                             → REJECTED
```

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Move application to REVIEW | Status updates, audit logged |
| 2 | Forward to interview | Status: FORWARDED |
| 3 | Schedule interview (see Section 12) | Status: INTERVIEW_SCHEDULED |
| 4 | Complete interview | Status: INTERVIEW_COMPLETED |
| 5a | Approve application | Status: APPROVED, user account created for student |
| 5b | Reject application | Status: REJECTED |

### TC-TRUST-04: Reports

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/dashboard/trustee/reports` | Reports page loads |
| 2 | View application statistics by vertical | Counts by status shown |
| 3 | View occupancy reports | Room utilization data shown |

---

## 8. Accounts Dashboard Testing

**Login as:** `accounts@hostelpro.in` / `Password123`

### TC-ACCT-01: Dashboard Overview

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Login as accounts | `/dashboard/accounts` loads |
| 2 | Verify stats | Total fees collected, outstanding amount, payment pending count |

### TC-ACCT-02: Fee Management

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | View fee structure | All fee heads listed (Hostel, Security, Processing, Mess, etc.) |
| 2 | Create new fee for a student | `POST /api/fees` creates fee record |
| 3 | Update fee status (PENDING → PAID) | Status updated |
| 4 | Waive a fee | Status changed to WAIVED |

### TC-ACCT-03: Payment Processing

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | View payment history | All payments listed |
| 2 | Record manual payment (CASH/UPI/CHEQUE) | `POST /api/payments` records payment |
| 3 | Verify receipt generation | Receipt number assigned |
| 4 | View receivables | Outstanding amounts per student shown |

### TC-ACCT-04: Financial Reports

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | View transaction history | `GET /api/transactions` returns all transactions |
| 2 | View receivables aging | Outstanding amounts with due dates |

---

## 9. Parent Portal Testing

**Login as:** Parent mobile `+919999900020` with OTP `123456` (dev mode)

### TC-PAR-01: OTP Login

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Go to `/login/parent` | Mobile input shown |
| 2 | Enter `9999900020` | OTP sent |
| 3 | Enter `123456` | Login successful, redirects to `/dashboard/parent` |

### TC-PAR-02: Student Information (Read-Only)

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | View dashboard | Child's (Amit) info displayed |
| 2 | Verify read-only access | No edit buttons available |
| 3 | View student status | Room, vertical, joining date shown |

### TC-PAR-03: Fee View & Payment

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | View fees section | `GET /api/parent/fees` returns child's fees |
| 2 | Verify outstanding amount | Matches student's pending fees |
| 3 | View payment history | Past payments shown |
| 4 | Initiate payment | `POST /api/payments` with parent token |

### TC-PAR-04: Leave Tracking

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | View leave section | `GET /api/parent/leave` returns child's leaves |
| 2 | See approved/pending leaves | Status visible for each leave |

### TC-PAR-05: Notifications

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | View notifications | `GET /api/parent/notifications` returns alerts |
| 2 | Check notification types | Leave approvals, fee reminders visible |

---

## 10. Room Allocation Testing

**Login as:** Superintendent or Trustee

### TC-ROOM-01: View Rooms

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to rooms page | `GET /api/rooms` returns room list |
| 2 | Verify room count per vertical | Boys: 15, Girls: 8, Dharamshala: 6 |
| 3 | Check capacity & occupancy | Each room shows current/max occupants |

### TC-ROOM-02: Allocate Student to Room

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Select an approved student | Student with APPROVED status shown |
| 2 | Select available room | Room with available capacity shown |
| 3 | Create allocation | `POST /api/allocations` assigns student |
| 4 | Verify room occupancy incremented | occupied_count increases by 1 |
| 5 | Verify student sees allocation | Student dashboard shows room number |

### TC-ROOM-03: Capacity Enforcement

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Find a room at full capacity | Room with occupied_count = capacity |
| 2 | Try allocating another student | Error: room at full capacity |

### TC-ROOM-04: Room Transfer

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Select an allocated student | Student with active allocation |
| 2 | Update allocation to new room | `PUT /api/allocations/{id}` updates room |
| 3 | Verify old room occupancy decremented | Old room count decreases |
| 4 | Verify new room occupancy incremented | New room count increases |

### TC-ROOM-05: Vacate Room

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Select allocated student | Student currently in a room |
| 2 | Vacate allocation | `POST /api/allocations/vacate/{id}` |
| 3 | Verify room occupancy decremented | Room count decreases |
| 4 | Verify allocation status = CHECKED_OUT | Student no longer allocated |

---

## 11. Leave Management Testing

### TC-LEAVE-01: Create Leave Request (Student)

**Login as:** `amit.jain@student.in` / `Password123`

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/dashboard/student/leave` | Leave page loads |
| 2 | View leave types | Available types shown via `GET /api/config/leave-types` |
| 3 | Select "Casual Leave" | Leave type selected |
| 4 | Set from/to dates | Dates validated |
| 5 | Enter reason, destination, contact | All fields filled |
| 6 | Submit leave request | `POST /api/leaves` creates request with status PENDING |
| 7 | Verify request appears in list | New leave visible with PENDING status |

### TC-LEAVE-02: Approve Leave (Superintendent)

**Login as:** `supt.boys@hostelpro.in` / `Password123`

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to leaves page | Pending leave requests shown |
| 2 | View Amit's leave request | Request details displayed |
| 3 | Approve leave | `POST /api/leaves/{id}/approve` → status: APPROVED |
| 4 | Verify student sees APPROVED status | Student dashboard updated |

### TC-LEAVE-03: Reject Leave

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | View a pending leave request | Request shown |
| 2 | Reject with reason | `POST /api/leaves/{id}/reject` → status: REJECTED |
| 3 | Verify student sees REJECTED status | Student dashboard updated |

### TC-LEAVE-04: Leave Type Rules

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Check Casual Leave limits | 2 days/month, 8 days/semester (BOYS/GIRLS only) |
| 2 | Check Emergency Leave limits | 5 days/month, 15 days/semester |
| 3 | Check Home Visit limits | 4 days/month, 12 days/semester (BOYS/GIRLS only) |
| 4 | Check Sick Leave | No approval required |
| 5 | Verify Dharamshala restrictions | No CASUAL leave type available |

### TC-LEAVE-05: Leave Quota Enforcement

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Submit leaves until monthly quota reached | Leaves approved up to limit |
| 2 | Submit one more leave over quota | Warning/error: quota exceeded |

---

## 12. Interview Workflow Testing

**Login as:** `trustee1@hostelpro.in` / `Password123`

### TC-INT-01: Schedule Interview

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/dashboard/trustee/interviews` | Interview list shown |
| 2 | Click "Schedule Interview" | Scheduling modal opens |
| 3 | Select candidate (forwarded application) | Candidate selected |
| 4 | View available time slots | `GET /api/interviews/slots` returns slots |
| 5 | Select date/time | Slot picked |
| 6 | Confirm scheduling | `POST /api/interviews` creates interview |
| 7 | Verify application status → INTERVIEW_SCHEDULED | Status updated |

### TC-INT-02: Complete Interview

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | View scheduled interview | Interview details shown |
| 2 | Click "Complete Interview" | Completion modal opens |
| 3 | Enter interviewer notes and score | Notes saved |
| 4 | Mark as complete | `POST /api/interviews/{id}/complete` |
| 5 | Verify status → INTERVIEW_COMPLETED | Application status updated |

### TC-INT-03: Post-Interview Decision

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | View completed interview | Interview details with notes/score |
| 2 | Approve application | Status → APPROVED, student user account created |
| 3 | OR Reject application | Status → REJECTED |

---

## 13. Exit & Clearance Testing

### TC-EXIT-01: Student Exit Request

**Login as:** `amit.jain@student.in` / `Password123`

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/dashboard/student/exit` | Exit form shown |
| 2 | Submit exit request with reason and date | `POST /api/student/exit-request` |
| 3 | Status shows PENDING | Request visible in dashboard |
| 4 | Test withdraw before clearance | `POST /api/student/exit-request/withdraw` cancels |

### TC-EXIT-02: Superintendent Clearance

**Login as:** `supt.boys@hostelpro.in` / `Password123`

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/dashboard/superintendent/clearance` | Pending clearances shown |
| 2 | View student's exit clearance items | Checklist displayed (room, fees, library, etc.) |
| 3 | Mark individual items as cleared | `PUT /api/clearance-items/{id}` updates item |
| 4 | Use bulk clearance | `POST /api/clearance-items/bulk` clears multiple |
| 5 | All items cleared → approve exit | Final clearance granted |
| 6 | Verify room vacated | Room occupancy decremented |
| 7 | Export clearance report | `GET /api/superintendent/exit-clearance/export` |

### TC-EXIT-03: Incomplete Clearance Block

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Leave some clearance items unchecked | Some items pending |
| 2 | Try to finalize exit | Blocked: all items must be cleared first |

---

## 14. Fee & Payment Testing

### TC-FEE-01: View Fee Structure

**Login as:** Any role

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | View fees page | `GET /api/fees` returns fee data |
| 2 | Verify fee heads | HOSTEL_FEE, SECURITY_DEPOSIT, PROCESSING_FEE, MESS_FEE, etc. |
| 3 | Verify per-student amounts | Matches seeded data |

### TC-FEE-02: Record Payment (Accounts)

**Login as:** `accounts@hostelpro.in` / `Password123`

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Select student with pending fees | Student fee details shown |
| 2 | Record CASH payment | `POST /api/payments` with method: CASH |
| 3 | Verify fee status → PAID | Fee record updated |
| 4 | Verify receipt number generated | Unique receipt assigned |
| 5 | Record UPI payment | Method: UPI with transaction ID |
| 6 | Record CHEQUE payment | Method: CHEQUE with cheque number |

### TC-FEE-03: Payment Methods

Test each payment method:
- [ ] CASH
- [ ] UPI
- [ ] BANK_TRANSFER
- [ ] CHEQUE
- [ ] DEMAND_DRAFT
- [ ] CARD

### TC-FEE-04: Fee Status Transitions

| From | To | Action |
|------|----|--------|
| PENDING | PAID | Record payment |
| PENDING | WAIVED | Accounts waives fee |
| PENDING | OVERDUE | Past due date (automatic) |
| PAID | REFUNDED | Process refund |
| PENDING | CANCELLED | Cancel fee |

---

## 15. Renewal Cycle Testing

### TC-REN-01: Renewal Timeline

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Check student allocation date | Renewal due 6 months from allocation |
| 2 | Verify renewal status calculation | NOT_DUE (>60 days), UPCOMING (30-60), DUE_SOON (<=30), OVERDUE |
| 3 | Verify dashboard shows renewal countdown | Days remaining displayed |

### TC-REN-02: Submit Renewal (Student)

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/dashboard/student/renewal` | Renewal form available |
| 2 | Submit renewal application | `POST /api/renewals` creates renewal |
| 3 | Verify DPDP consent captured | consent_given_at timestamp stored |

### TC-REN-03: Renewal Review

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Login as superintendent | View renewal applications |
| 2 | Review renewal request | Application details shown |
| 3 | Approve renewal | Allocation extended by 6 months |
| 4 | Reject renewal | Triggers exit clearance process |

---

## 16. Document Management Testing

### TC-DOC-01: Application Documents

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | During application form Step 5 | Upload interface shown |
| 2 | Upload passport photo (JPG, <5MB) | `POST /api/applications/documents/upload` succeeds |
| 3 | Upload birth certificate (PDF) | Upload succeeds |
| 4 | Try uploading >5MB file | Error: file too large |
| 5 | Try uploading .exe file | Error: invalid format |

### TC-DOC-02: Student Document Upload (Post-Admission)

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Login as student → Documents page | Document list shown |
| 2 | Upload Aadhar Card | `POST /api/student/documents/upload` |
| 3 | Upload Medical Certificate | Upload succeeds |
| 4 | View all uploaded documents | List with types and dates |
| 5 | Download a document | File downloaded correctly |

### TC-DOC-03: Document Types

Test upload for each supported type:
- [ ] Passport Photo (PHOTOGRAPH)
- [ ] Aadhar Card (AADHAAR_CARD)
- [ ] Birth Certificate (BIRTH_CERTIFICATE)
- [ ] Educational Certificate (EDUCATION_CERTIFICATE)
- [ ] Income Certificate (INCOME_CERTIFICATE)
- [ ] Medical Certificate (MEDICAL_CERTIFICATE)
- [ ] Police Verification (POLICE_VERIFICATION)
- [ ] Undertaking (UNDERTAKING)
- [ ] Fee Receipt (RECEIPT)
- [ ] Renewal Form (RENEWAL_FORM)

---

## 17. Authorization & Security Testing

### TC-SEC-01: Role-Based Access Control

| Test | Login As | Try Accessing | Expected |
|------|----------|---------------|----------|
| Student can't access superintendent dashboard | Student | `/dashboard/superintendent` | Redirect to own dashboard or 403 |
| Student can't see other students' data | Student (Amit) | Sneha's API data | 403 Forbidden |
| Superintendent can't see other vertical's data | Supt Boys | Girls Ashram rooms API | Empty result or 403 |
| Parent can't modify data | Parent | `PUT /api/applications/{id}` | 403 Forbidden |
| Unauthenticated user can't access dashboards | None | `/dashboard/*` | Redirect to login |

### TC-SEC-02: API Authorization

| Test | Method | Endpoint | Without Auth | Expected |
|------|--------|----------|--------------|----------|
| Protected endpoint without token | GET | `/api/dashboard/student` | No token | 401 Unauthorized |
| Wrong role accessing endpoint | GET | `/api/fees` (as Student) | Student token | Filtered to own data only |
| Admin-only endpoint | POST | `/api/admin/seed-auth-users` | Non-trustee token | 403 Forbidden |

### TC-SEC-03: Input Validation

| Test | Action | Expected |
|------|--------|----------|
| SQL injection in search | Enter `'; DROP TABLE users;--` in search | Sanitized, no SQL execution |
| XSS in form fields | Enter `<script>alert('xss')</script>` | HTML escaped in output |
| Oversized file upload | Upload 100MB file | Rejected at upload |
| Invalid OTP format | Submit non-numeric OTP | Validation error |

### TC-SEC-04: DPDP Compliance

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Check DPDP banner on `/apply` | Privacy notice displayed |
| 2 | Check consent checkbox on first-time-setup | DPDP consent required |
| 3 | Verify consent_logs table | Consent stored with timestamp |
| 4 | Verify renewal consent | New consent captured at each renewal |

---

## 18. API Endpoint Reference

### Authentication
| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | `/api/auth/login` | No | Staff login |
| POST | `/api/auth/logout` | Yes | End session |
| GET | `/api/auth/session` | Yes | Current session info |
| POST | `/api/auth/forgot-password` | No | Request password reset |
| POST | `/api/auth/reset-password` | No | Complete reset |
| POST | `/api/auth/first-time-setup` | Token | Set initial password |

### OTP
| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | `/api/otp/send` | No | Send OTP |
| POST | `/api/otp/verify` | No | Verify OTP |
| POST | `/api/otp/resend` | No | Resend OTP |

### Applications
| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | `/api/applications` | Staff | List applications |
| POST | `/api/applications` | No | Create application |
| GET | `/api/applications/{id}` | Staff/Applicant | Get details |
| PUT | `/api/applications/{id}` | Trustee/Supt | Update status |
| POST | `/api/applications/documents/upload` | No | Upload doc |

### Rooms & Allocations
| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | `/api/rooms` | Supt/Trustee | List rooms |
| POST | `/api/rooms` | Supt/Trustee | Create room |
| GET | `/api/allocations` | Student/Staff | List allocations |
| POST | `/api/allocations` | Supt/Trustee | Create allocation |
| PUT | `/api/allocations/{id}` | Supt/Trustee | Update allocation |

### Leaves
| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | `/api/leaves` | Student/Supt | List leaves |
| POST | `/api/leaves` | Student | Create request |
| POST | `/api/leaves/{id}/approve` | Supt/Trustee | Approve |
| POST | `/api/leaves/{id}/reject` | Supt/Trustee | Reject |

### Interviews
| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | `/api/interviews` | Trustee/Supt | List interviews |
| POST | `/api/interviews` | Trustee | Schedule |
| PUT | `/api/interviews/{id}` | Trustee | Update |
| POST | `/api/interviews/{id}/complete` | Trustee | Complete |

### Fees & Payments
| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | `/api/fees` | Student/Accounts | View fees |
| POST | `/api/fees` | Accounts/Trustee | Create fee |
| GET | `/api/payments` | Student/Accounts | Payment history |
| POST | `/api/payments` | Student/Parent/Accounts | Record payment |

### System
| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | `/api/health` | No | Health check |
| GET | `/api/files/serve` | Yes | Serve files |
| GET | `/api/auditLogs` | Supt/Trustee | Audit trail |

---

## 19. Known Limitations

| Feature | Status | Notes |
|---------|--------|-------|
| Razorpay Integration | Partial | Tables exist, webhook not fully implemented |
| WhatsApp Notifications | Config Only | Rules stored, delivery not implemented |
| Email Notifications | Config Only | Rules stored, delivery not implemented |
| SMS Notifications | Partial | MSG91 OTP works, async queue not deployed |
| BullMQ/Redis Queue | Not Deployed | Architecture planned |
| PDF Generation | Partial | Backend service pending |

---

## End-to-End Workflow Checklist

Use this checklist to verify the complete production-ready flow:

### Application to Check-In (Happy Path)
- [ ] Student selects vertical on `/apply`
- [ ] Student enters contact, receives OTP
- [ ] Student verifies OTP
- [ ] Student fills all 6 form steps
- [ ] Student uploads required documents
- [ ] Student submits application, gets tracking number
- [ ] Trustee reviews application (SUBMITTED → REVIEW)
- [ ] Trustee forwards to interview (REVIEW → FORWARDED)
- [ ] Trustee schedules interview
- [ ] Trustee completes interview with notes
- [ ] Trustee approves application (→ APPROVED)
- [ ] Student user account is created
- [ ] Superintendent allocates room
- [ ] Student logs in and sees room
- [ ] Student completes check-in

### Leave Cycle
- [ ] Student creates leave request
- [ ] Superintendent sees pending request
- [ ] Superintendent approves/rejects
- [ ] Student sees updated status
- [ ] Parent sees leave in portal

### Fee Payment Cycle
- [ ] Accounts creates fees for student
- [ ] Student sees pending fees
- [ ] Parent sees pending fees
- [ ] Payment recorded (any method)
- [ ] Fee status updates to PAID
- [ ] Receipt generated

### Exit Flow
- [ ] Student submits exit request
- [ ] Superintendent sees clearance items
- [ ] Superintendent clears all items
- [ ] Room vacated, occupancy updated
- [ ] Student status updated

### Renewal Flow
- [ ] Student submits renewal before deadline
- [ ] DPDP consent captured
- [ ] Superintendent reviews
- [ ] Trustee approves/rejects
- [ ] Allocation extended (if approved)
