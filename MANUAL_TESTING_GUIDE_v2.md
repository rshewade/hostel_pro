# Manual Testing Guide v2 - Hostel Pro

**Last Updated:** 2026-04-21
**Purpose:** Production readiness verification for all workflows, roles, and features.
**Changes from v1:** Revised application status workflow (INTERVIEW, TRUSTEE_REVIEW, TRUSTEE_INTERVIEW, WITHDRAWN), interview scheduling on superintendent dashboard, trustee residents page, student change password, superintendent reset password, temp password format update.

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
npm run dev    # Runs on http://localhost:3000
```

### Environment Variables

| Variable                 | Required  | Notes                         |
| ------------------------ | --------- | ----------------------------- |
| `DATABASE_URL`           | Yes       | PostgreSQL connection string  |
| `JWT_SECRET`             | Yes       | Min 48 chars                  |
| `JWT_EXPIRES_IN`         | Yes       | Default: `86400` (1 day)      |
| `JWT_REFRESH_EXPIRES_IN` | Yes       | Default: `604800` (7 days)    |
| `ADMIN_SEED_SECRET`      | Yes       | For `/api/admin/*` endpoints  |
| `NODE_ENV`               | Yes       | `development` or `production` |
| `MSG91_AUTH_KEY`         | Prod only | SMS OTP provider              |
| `MSG91_TEMPLATE_ID`      | Prod only | DLT-approved template         |

### Development Mode OTP

In `NODE_ENV=development`, all OTPs use the fixed code: **`123456`**

---

## 2. Test Credentials

**Password for all seeded users:** `Password123`

### Staff & Admin Accounts

| Role                         | Email                           | Mobile        | Vertical     | Login URL |
| ---------------------------- | ------------------------------- | ------------- | ------------ | --------- |
| Superintendent (Boys)        | `supt.boys@hostelpro.in`        | +919999900002 | BOYS_HOSTEL  | `/login`  |
| Superintendent (Girls)       | `supt.girls@hostelpro.in`       | +919999900003 | GIRLS_ASHRAM | `/login`  |
| Superintendent (Dharamshala) | `supt.dharamshala@hostelpro.in` | +919999900004 | DHARAMSHALA  | `/login`  |
| Trustee 1                    | `trustee1@hostelpro.in`         | +919999900005 | All          | `/login`  |
| Trustee 2                    | `trustee2@hostelpro.in`         | +919999900006 | All          | `/login`  |
| Accounts                     | `accounts@hostelpro.in`         | +919999900007 | All          | `/login`  |

### Student Accounts

| Name            | Email                   | Mobile        | Vertical     | Login URL |
| --------------- | ----------------------- | ------------- | ------------ | --------- |
| Amit Kumar Jain | `amit.jain@student.in`  | +919999900010 | BOYS_HOSTEL  | `/login`  |
| Sneha Shah      | `sneha.shah@student.in` | +919999900011 | GIRLS_ASHRAM | `/login`  |

### Parent Accounts (OTP Login)

| Name        | Mobile        | Child           | Login URL       |
| ----------- | ------------- | --------------- | --------------- |
| Suresh Jain | +919999900020 | Amit Kumar Jain | `/login/parent` |
| Ramesh Shah | +919999900021 | Sneha Shah      | `/login/parent` |

### Seeded Rooms (29 Total)

| Vertical     | Count | Floor Range | Types                  |
| ------------ | ----- | ----------- | ---------------------- |
| Boys Hostel  | 15    | 1-3         | Single, Double, Triple |
| Girls Ashram | 8     | 1-2         | Double, Triple         |
| Dharamshala  | 6     | 1-2         | Double, Quad           |

---

## 3. Application Flow Testing

### Application Status Workflow

```
Superintendent Path:
  SUBMITTED --> REVIEW --> INTERVIEW --> APPROVED / REJECTED
                      \-> TRUSTEE_REVIEW (Forward to Trustees)

Trustee Path:
  TRUSTEE_REVIEW --> TRUSTEE_INTERVIEW --> APPROVED / REJECTED

Either role can also set: WITHDRAWN, ARCHIVED
```

### TC-APP-01: Vertical Selection

| Step | Action                        | Expected Result                                      | Status  |
| ---- | ----------------------------- | ---------------------------------------------------- | ------- |
| 1    | Navigate to `/apply`          | Page shows 3 hostel cards (Boys, Girls, Dharamshala) | Working |
| 2    | Verify DPDP compliance banner | Privacy notice is displayed                          | Working |
| 3    | Verify document checklist     | Required documents list is shown                     | Working |
| 4    | Click "Boys Hostel" card      | Redirects to `/apply/boys-hostel/contact`            | Working |
| 5    | Repeat for Girls Ashram       | Redirects to `/apply/girls-ashram/contact`           | Working |
| 6    | Repeat for Dharamshala        | Redirects to `/apply/dharamshala/contact`            | Working |

### TC-APP-02: Contact Details & OTP Sending

| Step | Action                                  | Expected Result                                       | Status      |
| ---- | --------------------------------------- | ----------------------------------------------------- | ----------- |
| 1    | Select "Mobile Number" tab              | Mobile input field appears                            | Working     |
| 2    | Enter invalid number (e.g., `12345`)    | Validation error: must be 10 digits starting with 6-9 | Not working |
| 3    | Enter valid number (e.g., `9876543210`) | No validation error                                   | Working     |
| 4    | Click "Send OTP"                        | API `POST /api/otp/send` called, OTP token returned   | Working     |
| 5    | Verify 60-second resend timer starts    | Resend button disabled with countdown                 | Working     |
| 6    | Switch to "Email" tab                   | Email input appears                                   | Working     |
| 7    | Enter invalid email                     | Validation error                                      | Working     |
| 8    | Enter valid email and send OTP          | OTP sent successfully                                 | Working     |

### TC-APP-03: OTP Verification

| Step | Action                              | Expected Result                                                  | Status  |
| ---- | ----------------------------------- | ---------------------------------------------------------------- | ------- |
| 1    | Enter wrong OTP (e.g., `000000`)    | Error: "Invalid OTP"                                             | Working |
| 2    | Enter correct OTP (`123456` in dev) | Success, redirects to form page                                  | Working |
| 3    | Test 10-minute expiry               | OTP expires after 10 minutes, shows expiry message               |         |
| 4    | Test 3 attempt limit                | After 3 wrong attempts, user is locked out with fallback options |         |
| 5    | Test paste functionality            | Pasting 6-digit code fills all fields                            | Working |
| 6    | Test resend OTP                     | `POST /api/otp/resend` sends new OTP                             | Working |

### TC-APP-04: Multi-Step Application Form

**Step 1 - Personal Details:**

| Step | Action                               | Expected Result                      | Status  |
| ---- | ------------------------------------ | ------------------------------------ | ------- |
| 1    | Leave all fields empty, click Next   | Validation errors on required fields | Working |
| 2    | Enter DOB making applicant <18 years | Age validation warning               | Working |
| 3    | Fill all required fields correctly   | Can proceed to next step             | Working |
| 4    | Verify father/mother info fields     | All guardian fields validated        | Working |
| 5    | Verify emergency contact section     | Required fields enforced             | Working |

**Step 2 - Academic Information:**

| Step | Action                              | Expected Result               | Status  |
| ---- | ----------------------------------- | ----------------------------- | ------- |
| 1    | Fill institution, course, year      | All required fields validated | Working |
| 2    | Enter CGPA/percentage               | Accepts valid values          | Working |
| 3    | Fill previous qualification details | Required fields enforced      | Working |

**Step 3 - Hostel Preferences:**

| Step | Action                                     | Expected Result        | Status  |
| ---- | ------------------------------------------ | ---------------------- | ------- |
| 1    | Verify vertical is pre-selected & disabled | Cannot change vertical | Working |
| 2    | Select room type (2/3/4 sharing)           | Selection stored       | Working |
| 3    | Select duration (6 months - 4 years)       | Duration stored        | Working |
| 4    | Set intended joining date                  | Date validated         | Working |
| 5    | Add special requirements (optional)        | Text saved             | Working |

**Step 4 - References:**

| Step | Action                           | Expected Result                       | Status  |
| ---- | -------------------------------- | ------------------------------------- | ------- |
| 1    | Leave Reference 1 empty          | Validation error: at least 1 required | Working |
| 2    | Fill Reference 1 with valid data | Validation passes                     | Working |
| 3    | Reference 2 is optional          | Can skip without error                | Working |

**Step 5 - Document Upload:**

| Step | Action                                       | Expected Result                                               | Status  |
| ---- | -------------------------------------------- | ------------------------------------------------------------- | ------- |
| 1    | Skip required documents                      | Cannot proceed                                                | Working |
| 2    | Upload file >5MB                             | Error: file too large                                         | Working |
| 3    | Upload non-PDF/JPG file                      | Error: invalid format                                         | Working |
| 4    | Upload valid passport photo (JPG, <5MB)      | Upload succeeds via `POST /api/applications/documents/upload` | Working |
| 5    | Upload birth certificate (PDF)               | Upload succeeds                                               | Working |
| 6    | Upload educational marksheet                 | Upload succeeds                                               | Working |
| 7    | Community letter / recommendation (optional) | Can skip                                                      | Working |

**Step 6 - Review & Submit:**

| Step | Action                              | Expected Result                                  | Status  |
| ---- | ----------------------------------- | ------------------------------------------------ | ------- |
| 1    | Review all entered data             | All sections displayed correctly                 | Working |
| 2    | Verify uploaded documents shown     | Document names visible                           | Working |
| 3    | Submit without declaration checkbox | Cannot submit (button disabled)                  | Working |
| 4    | Check declaration and submit        | `POST /api/applications` called, app created     | Working |
| 5    | Verify tracking number generated    | Unique tracking number shown (e.g., BH-2026-XXX) | Working |
| 6    | Verify redirect to success page     | `/apply/[vertical]/success` shown                | Working |

### TC-APP-05: Draft Recovery

| Step | Action                            | Expected Result                             | Status |
| ---- | --------------------------------- | ------------------------------------------- | ------ |
| 1    | Start filling form, close browser | Draft auto-saved to localStorage            |        |
| 2    | Reopen same URL                   | Draft restored with previously entered data |        |
| 3    | Complete and submit               | Draft cleared from localStorage             |        |

### TC-APP-06: Application Tracking

| Step | Action                                      | Expected Result              | Status  |
| ---- | ------------------------------------------- | ---------------------------- | ------- |
| 1    | Navigate to track page with tracking number | Application status displayed | Working |
| 2    | Use invalid tracking number                 | Error: application not found | Working |

---

## 4. Authentication Testing

### TC-AUTH-01: Staff Login

| Step | Action                                 | Expected Result                          | Status  |
| ---- | -------------------------------------- | ---------------------------------------- | ------- |
| 1    | Go to `/login`                         | Login form with email/password fields    | Working |
| 2    | Enter invalid credentials              | Error message shown                      | Working |
| 3    | Enter valid Superintendent credentials | Redirects to `/dashboard/superintendent` | Working |
| 4    | Enter valid Trustee credentials        | Redirects to `/dashboard/trustee`        | Working |
| 5    | Enter valid Accounts credentials       | Redirects to `/dashboard/accounts`       | Working |
| 6    | Enter valid Student credentials        | Redirects to `/dashboard/student`        | Working |

### TC-AUTH-02: Parent OTP Login

| Step | Action                         | Expected Result                                   | Status      |
| ---- | ------------------------------ | ------------------------------------------------- | ----------- |
| 1    | Go to `/login/parent`          | Mobile number input shown                         | Working     |
| 2    | Enter registered parent mobile | OTP sent via `POST /api/otp/send`                 | Working     |
| 3    | Enter OTP `123456` (dev)       | Session created, redirects to `/dashboard/parent` | Working     |
| 4    | Enter unregistered mobile      | Error: no parent account found                    | Not working |

### TC-AUTH-03: First-Time Password Setup

**Trigger:** When a student application is approved, a user account is created with `requires_password_change = true`. Temp password format: `{LastName}@{last4ofTracking}#{DDMMYYYY}`.

Example: Name "Vihaan Kothari", Tracking "BH-2026-00002", DOB "2004-09-12" => `Kothari@0002#12092004`

| Step | Action                                | Expected Result                                                   | Status  |
| ---- | ------------------------------------- | ----------------------------------------------------------------- | ------- |
| 1    | Login with newly approved student     | Redirects to `/login/first-time-setup`                            | Working |
| 2    | Enter weak password (e.g., `abc`)     | Fails: needs 8+ chars, uppercase, lowercase, number, special char | Working |
| 3    | Enter mismatched passwords            | Error: passwords don't match                                      | Working |
| 4    | Skip DPDP consent checkbox            | Cannot submit                                                     | Working |
| 5    | Enter strong password + check consent | Password set, redirects to role-specific dashboard                | Working |

**Password Requirements:** Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special character (`!@#$%^&*`)

### TC-AUTH-04: Forgot Password

| Step | Action                                  | Expected Result                               | Status |
| ---- | --------------------------------------- | --------------------------------------------- | ------ |
| 1    | Go to `/login/forgot-password`          | Email/mobile input shown                      |        |
| 2    | Enter registered email or mobile        | OTP sent, success message shown               |        |
| 3    | Verify OTP                              | Identity confirmed                            |        |
| 4    | Set new password (meets strength rules) | Password updated, can login with new password |        |

### TC-AUTH-05: Change Password (Student Self-Service)

**Login as:** Any student

| Step | Action                                           | Expected Result                           | Status  |
| ---- | ------------------------------------------------ | ----------------------------------------- | ------- |
| 1    | Navigate to `/dashboard/student/change-password` | Change password form shown                | Working |
| 2    | Enter wrong current password                     | Error: "Current password is incorrect"    | Working |
| 3    | Enter same password as current                   | Error: "New password must be different"   | Working |
| 4    | Enter weak new password                          | Error: password strength validation fails | Working |
| 5    | Enter mismatched confirm password                | Inline error: "Passwords do not match"    | Working |
| 6    | Enter valid current + strong new password        | Success message, form resets              | Working |
| 7    | Login with new password                          | Login succeeds with new credentials       | Working |

### TC-AUTH-06: Session Management

| Step | Action                                           | Expected Result                    | Status  |
| ---- | ------------------------------------------------ | ---------------------------------- | ------- |
| 1    | Verify `GET /api/auth/session` returns user info | Session data returned              | Working |
| 2    | Click Logout (`POST /api/auth/logout`)           | Token cleared, redirected to login | Working |
| 3    | Access dashboard URL after logout                | Redirected to login page           | Working |
| 4    | Verify JWT token expiry (24h)                    | Token expires, user must re-login  | Working |

### TC-AUTH-07: Role-Based Dashboard Access Control

| Step | Action                                              | Expected Result                           | Status |
| ---- | --------------------------------------------------- | ----------------------------------------- | ------ |
| 1    | Login as Student, navigate to `/dashboard/trustee`  | Redirected back to `/dashboard/student`   |        |
| 2    | Login as Superintendent, go to `/dashboard/student` | Redirected to `/dashboard/superintendent` |        |
| 3    | Login as Parent, go to `/dashboard/accounts`        | Redirected to `/dashboard/parent`         |        |

---

## 5. Student Dashboard Testing

**Login as:** `amit.jain@student.in` / `Password123`

### TC-STU-01: Dashboard Overview

| Step | Action                  | Expected Result                                                                | Status  |
| ---- | ----------------------- | ------------------------------------------------------------------------------ | ------- |
| 1    | Login as student        | `/dashboard/student` loads                                                     | Working |
| 2    | Verify overview stats   | Vertical, room status, joining date, renewal days, pending fees shown          | Working |
| 3    | Verify navigation links | Overview, Fees, Leave, Room, Documents, Renewal, Exit, Manual, Change Password | Working |

### TC-STU-02: Room Information

| Step | Action                                | Expected Result                | Status  |
| ---- | ------------------------------------- | ------------------------------ | ------- |
| 1    | Navigate to `/dashboard/student/room` | Current room details displayed | Working |
| 2    | Verify room number, type, sharing     | Matches allocated room         | Working |
| 3    | Verify roommate information           | Other occupants shown (if any) | Working |

### TC-STU-03: Room Check-In

| Step | Action                                         | Expected Result                                 | Status  |
| ---- | ---------------------------------------------- | ----------------------------------------------- | ------- |
| 1    | Navigate to `/dashboard/student/room/check-in` | Multi-step inventory verification form shown    | Working |
| 2    | Skip inventory checklist items                 | Cannot proceed without verifying all 8 items    |         |
| 3    | Verify all inventory items (bed, table, etc.)  | All items checked with quantity                 |         |
| 4    | Skip room condition checkbox                   | Cannot submit                                   |         |
| 5    | Skip rules & regulations checkbox              | Cannot submit                                   |         |
| 6    | Complete all checks and confirm                | Check-in succeeds, status updates to CHECKED_IN | Working |
| 7    | Verify check-in timestamp recorded             | Date/time stored, redirected to room page       | Working |

### TC-STU-04: Leave Requests

See [Section 11: Leave Management Testing](#11-leave-management-testing).

### TC-STU-05: Document Management

| Step | Action                                     | Expected Result                                          | Status  |
| ---- | ------------------------------------------ | -------------------------------------------------------- | ------- |
| 1    | Navigate to `/dashboard/student/documents` | Document list shown                                      | Working |
| 2    | Upload Aadhar Card (JPG/PDF)               | Upload succeeds via `POST /api/student/documents/upload` | Working |
| 3    | Upload Medical Certificate                 | Upload succeeds                                          | Working |
| 4    | Verify document appears in list            | New document shown with type, date, and size             | Working |
| 5    | Click view/download on uploaded document   | File opens/downloads correctly                           | Working |

### TC-STU-06: Fee & Payment View

| Step | Action                                 | Expected Result                                     | Status  |
| ---- | -------------------------------------- | --------------------------------------------------- | ------- |
| 1    | Navigate to `/dashboard/student/fees`  | Fee overview cards (Total, Paid, Outstanding, Due)  | Working |
| 2    | Verify fee items listed                | Fee heads with amounts, paid, outstanding columns   | Working |
| 3    | Verify outstanding balance calculation | Matches sum of pending fees                         | Working |
| 4    | Check payment history section          | Last 3 payments with transaction ID, method, status | Working |
| 5    | Click receipt download (PAID fee)      | Receipt downloads correctly                         | Working |

### TC-STU-07: Exit Request

| Step | Action                                | Expected Result                                           | Status |
| ---- | ------------------------------------- | --------------------------------------------------------- | ------ |
| 1    | Navigate to `/dashboard/student/exit` | Exit request form shown                                   | Parked |
| 2    | Fill reason and intended exit date    | Form validated                                            | Parked |
| 3    | Submit exit request                   | `POST /api/student/exit-request` called, status: PENDING  | Parked |
| 4    | Verify request appears in dashboard   | Exit request status visible                               | Parked |
| 5    | Test withdraw request                 | `POST /api/student/exit-request/withdraw` cancels request | Parked |

### TC-STU-08: Renewal

| Step | Action                                   | Expected Result                                | Status |
| ---- | ---------------------------------------- | ---------------------------------------------- | ------ |
| 1    | Navigate to `/dashboard/student/renewal` | Renewal status card with days remaining        | Parked |
| 2    | Start renewal (4-step wizard)            | Review Info -> Documents -> Payment -> Consent | Parked |
| 3    | Accept DPDP consent                      | Consent timestamp stored                       | Parked |
| 4    | Submit renewal application               | `POST /api/renewals` called                    | Parked |

---

## 6. Superintendent Dashboard Testing

**Login as:** `supt.boys@hostelpro.in` / `Password123`

### TC-SUPT-01: Dashboard Overview (Applications)

| Step | Action                                      | Expected Result                                          | Status  |
| ---- | ------------------------------------------- | -------------------------------------------------------- | ------- |
| 1    | Login as superintendent                     | `/dashboard/superintendent` loads with applications list | Working |
| 2    | Verify overview stats                       | Total, Pending Review, Approved, Interviews counts       | Working |
| 3    | Verify data is filtered to BOYS_HOSTEL only | No Girls Ashram or Dharamshala data shown                | Working |
| 4    | Test status filter chips                    | Pending Action, All, Approved, Rejected filter correctly | Working |
| 5    | Test search by name or tracking number      | Results filtered by search query                         | Working |

### TC-SUPT-02: Application Actions (Superintendent)

| Step | Action                                    | Expected Result                                  | Status  |
| ---- | ----------------------------------------- | ------------------------------------------------ | ------- |
| 1    | Click an application in Review            | Detail modal opens with full info + documents    | Working |
| 2    | Click "Approve"                           | Confirmation modal with remarks field            | Working |
| 3    | Confirm approval                          | Status -> APPROVED, student user account created | Working |
| 4    | Click "Reject" on another app             | Confirmation modal, remarks required             | Working |
| 5    | Confirm rejection                         | Status -> REJECTED, rejection reason stored      | Working |
| 6    | Click "Forward to Trustees"               | Status -> TRUSTEE_REVIEW                         | Working |
| 7    | Click "Schedule Interview"                | Interview scheduling modal opens                 | Working |
| 8    | Select date, time, mode (Online/Physical) | Interview created, status -> INTERVIEW           | Working |
| 9    | Download Application PDF                  | PDF opens in new tab with application data       | Working |

### TC-SUPT-03: Interviews Page

| Step | Action                                             | Expected Result                                        | Status  |
| ---- | -------------------------------------------------- | ------------------------------------------------------ | ------- |
| 1    | Navigate to `/dashboard/superintendent/interviews` | Interview list with stats (Scheduled, Completed, etc.) | Working |
| 2    | Filter by status (ALL, SCHEDULED, COMPLETED, etc.) | Filtered correctly                                     | Working |
| 3    | Click "View Details" on an interview               | Detail modal with applicant info, date, time, mode     | Working |
| 4    | Verify score and remarks shown (if completed)      | Evaluation data displayed                              | Working |

### TC-SUPT-04: Residents Page

| Step | Action                                             | Expected Result                             | Status  |
| ---- | -------------------------------------------------- | ------------------------------------------- | ------- |
| 1    | Navigate to `/dashboard/superintendent/residents`  | Resident list for current vertical          | Working |
| 2    | Verify stats (Total, Checked In, Pending Check-in) | Counts match active allocations             | Working |
| 3    | Search by name, mobile, email, or room             | Results filtered correctly                  | Working |
| 4    | Click "View Details" on a resident                 | Detail panel with resident info + documents | Working |
| 5    | Click "Reset Password" in detail panel             | Confirmation dialog appears                 | Working |
| 6    | Confirm reset                                      | Temp password displayed with copy button    | Working |
| 7    | Verify resident must change password on next login | `requires_password_change = true` set       | Working |

### TC-SUPT-05: Room Management

| Step | Action                                        | Expected Result                   | Status  |
| ---- | --------------------------------------------- | --------------------------------- | ------- |
| 1    | Navigate to `/dashboard/superintendent/rooms` | Room matrix by floor              | Working |
| 2    | Verify room count matches vertical            | Boys: 15 rooms displayed          | Working |
| 3    | Check occupancy color indicators              | Green/Yellow/Red/Gray by status   | Working |
| 4    | Filter by occupancy status                    | Available/Partial/Full/Blocked    | Working |
| 5    | Add a new room                                | `POST /api/rooms` creates room    | Working |
| 6    | Edit room capacity or status                  | `PUT /api/rooms/{id}` updates     | Working |
| 7    | Click a room to view occupants                | Detail panel with bed assignments | Working |
| 8    | Allocate student to room via modal            | `POST /api/allocations` succeeds  | Working |

### TC-SUPT-06: Leave Management

See [Section 11: Leave Management Testing](#11-leave-management-testing).

### TC-SUPT-07: Configuration

| Step | Action                                         | Expected Result                                       | Status  |
| ---- | ---------------------------------------------- | ----------------------------------------------------- | ------- |
| 1    | Navigate to `/dashboard/superintendent/config` | Config page loads                                     | Working |
| 2    | View leave type rules                          | Leave types with per-month/per-semester limits        | Working |
| 3    | Add / edit leave type                          | Form saves via `POST /api/config/leave-types`         | Working |
| 4    | Set blackout dates                             | Dates saved via `POST /api/config/blackout-dates`     | Working |
| 5    | Configure notification rules                   | Rules saved via `POST /api/config/notification-rules` | Working |

### TC-SUPT-08: Audit Log

| Step | Action                                        | Expected Result                   | Status  |
| ---- | --------------------------------------------- | --------------------------------- | ------- |
| 1    | Navigate to `/dashboard/superintendent/audit` | Audit log entries displayed       | Working |
| 2    | Filter by entity type                         | Filtered results shown            | Working |
| 3    | View change details                           | Old/new values and metadata shown | Working |

### TC-SUPT-09: Exit Clearance

| Step | Action                                            | Expected Result                                  | Status |
| ---- | ------------------------------------------------- | ------------------------------------------------ | ------ |
| 1    | Navigate to `/dashboard/superintendent/clearance` | Pending clearances shown                         | Parked |
| 2    | View student's clearance checklist                | Items: room inventory, keys, fees, library, etc. | Parked |
| 3    | Mark individual items as cleared                  | Item status updated with remarks                 | Parked |
| 4    | Use bulk clearance                                | Multiple items cleared at once                   | Parked |
| 5    | All items cleared -> approve exit                 | Final clearance granted, room vacated            | Parked |
| 6    | Export clearance report                           | CSV download                                     | Parked |

### TC-SUPT-10: Vertical Isolation

| Step | Action                                        | Expected Result                | Status  |
| ---- | --------------------------------------------- | ------------------------------ | ------- |
| 1    | Login as `supt.boys@hostelpro.in`             | Only BOYS_HOSTEL data visible  | Working |
| 2    | Login as `supt.girls@hostelpro.in`            | Only GIRLS_ASHRAM data visible | Working |
| 3    | Login as `supt.dharamshala@hostelpro.in`      | Only DHARAMSHALA data visible  | Working |
| 4    | Try accessing another vertical's room via API | 403 Forbidden or empty result  | Working |

---

## 7. Trustee Dashboard Testing

**Login as:** `trustee1@hostelpro.in` / `Password123`

### TC-TRUST-01: Dashboard Overview

| Step | Action                       | Expected Result                                                                  | Status  |
| ---- | ---------------------------- | -------------------------------------------------------------------------------- | ------- |
| 1    | Login as trustee             | `/dashboard/trustee` loads with stats overview                                   | Working |
| 2    | Verify stats cards           | Pending Applications, Scheduled Interviews, Pending Allocations, Approved counts | Working |
| 3    | Verify all verticals visible | Data from Boys, Girls, and Dharamshala shown                                     | Working |
| 4    | Quick action buttons work    | Review Applications, Manage Interviews, Allocate Rooms navigate correctly        |         |
| 5    | Recent activity list shown   | Latest 5 application activities displayed                                        | Working |

### TC-TRUST-02: Application Review

| Step | Action                                          | Expected Result                                | Status  |
| ---- | ----------------------------------------------- | ---------------------------------------------- | ------- |
| 1    | Navigate to `/dashboard/trustee/applications`   | Application list shown                         | Working |
| 2    | Filter by vertical (ALL/BOYS/GIRLS/DHARAMSHALA) | Only selected vertical's applications shown    | Working |
| 3    | Filter by status                                | FORWARDED, PROVISIONALLY_APPROVED, etc.        | Working |
| 4    | Click an application                            | Review modal with full details                 | Working |
| 5    | Provisional approve (with interview)            | Status updated, interview scheduling triggered |         |
| 6    | Provisional approve (without interview)         | Status updated directly                        |         |
| 7    | Final approve                                   | Status -> APPROVED, student account created    | Working |
| 8    | Final reject with remarks                       | Status -> REJECTED                             | Working |
| 9    | Schedule interview from review modal            | Interview scheduling modal opens               | Working |
| 10   | Download application PDF                        | PDF exports correctly                          | Working |

### TC-TRUST-03: Residents Page (All Verticals)

| Step | Action                                          | Expected Result                                    | Status  |
| ---- | ----------------------------------------------- | -------------------------------------------------- | ------- |
| 1    | Navigate to `/dashboard/trustee/residents`      | All residents across all verticals shown           | Working |
| 2    | Verify stats by vertical                        | Boys, Girls, Dharamshala counts + Pending Check-in | Working |
| 3    | Filter by vertical (ALL/BOYS/GIRLS/DHARAMSHALA) | Filtered correctly with counts in filter buttons   | Working |
| 4    | Search by name, mobile, email, or room          | Results filtered                                   | Working |
| 5    | Click "View Details"                            | Detail panel with info + documents                 | Working |
| 6    | Verify vertical column in table                 | Vertical badge shown for each resident             | Working |

### TC-TRUST-04: Interviews Page

| Step | Action                                      | Expected Result                                   | Status  |
| ---- | ------------------------------------------- | ------------------------------------------------- | ------- |
| 1    | Navigate to `/dashboard/trustee/interviews` | Interview list with stats                         | Working |
| 2    | Filter by status and vertical               | Filtered correctly                                | Working |
| 3    | View interview details                      | Applicant info, schedule, mode, trustee shown     | Working |
| 4    | Complete interview (evaluation modal)       | Score per criteria, overall score, recommendation |         |
| 5    | Verify status -> INTERVIEW_COMPLETED        | Status updates in list                            |         |

### TC-TRUST-05: Application Status Workflow (End-to-End)

```
SUBMITTED -> REVIEW -> TRUSTEE_REVIEW -> TRUSTEE_INTERVIEW -> APPROVED
                                                            -> REJECTED
```

| Step | Action                                         | Expected Result                                     | Status       |
| ---- | ---------------------------------------------- | --------------------------------------------------- | ------------ |
| 1    | Superintendent forwards app to trustees        | Status: TRUSTEE_REVIEW                              | Working      |
| 2    | Trustee reviews and schedules interview        | Status: TRUSTEE_INTERVIEW, interview record created | Working      |
| 3    | Trustee completes interview with score/remarks | Interview status: COMPLETED                         | Not required |
| 4a   | Trustee approves application                   | Status: APPROVED, student user account created      | Working      |
| 4b   | Trustee rejects application                    | Status: REJECTED, reason recorded                   | Working      |
| 5    | Verify student can login with temp password    | First-time setup page shown                         | Working      |

### TC-TRUST-06: Allocations Page

| Step | Action                                       | Expected Result                  | Status |
| ---- | -------------------------------------------- | -------------------------------- | ------ |
| 1    | Navigate to `/dashboard/trustee/allocations` | Allocation management page loads |        |
| 2    | View approved students awaiting allocation   | Students listed                  |        |
| 3    | Allocate student to room                     | `POST /api/allocations` succeeds |        |

### TC-TRUST-07: Reports

| Step | Action                                   | Expected Result                     | Status |
| ---- | ---------------------------------------- | ----------------------------------- | ------ |
| 1    | Navigate to `/dashboard/trustee/reports` | Reports page loads                  |        |
| 2    | View application statistics by vertical  | Counts by status per vertical shown |        |
| 3    | View occupancy reports                   | Room utilization data shown         |        |

---

## 8. Accounts Dashboard Testing

**Login as:** `accounts@hostelpro.in` / `Password123`

### TC-ACCT-01: Dashboard Overview

| Step | Action                | Expected Result                                                  | Status  |
| ---- | --------------------- | ---------------------------------------------------------------- | ------- |
| 1    | Login as accounts     | `/dashboard/accounts` loads with tabs                            | Working |
| 2    | Verify KPI cards      | Total Receivables, Collected, Overdue, Upcoming counts           | Working |
| 3    | Verify tabs available | Overview, Receivables, Payment Logs, Receipts, Clearance, Export |         |

### TC-ACCT-02: Receivables Tab

| Step | Action                                  | Expected Result                                    | Status  |
| ---- | --------------------------------------- | -------------------------------------------------- | ------- |
| 1    | Switch to Receivables tab               | Student-wise receivables listed                    | Working |
| 2    | Filter by vertical                      | Only selected vertical's data shown                | Working |
| 3    | Filter by status (PAID/PENDING/OVERDUE) | Filtered correctly                                 | Working |
| 4    | Select multiple students                | Bulk action buttons appear (Send Reminder, Export) | Working |

### TC-ACCT-03: Payment Logs

| Step | Action                                     | Expected Result                                                                                           | Status |
| ---- | ------------------------------------------ | --------------------------------------------------------------------------------------------------------- | ------ |
| 1    | Switch to Payment Logs tab                 | All transactions listed (from `GET /api/transactions`)                                                    |        |
| 2    | Verify columns                             | Transaction ID, Student Name, Amount, Method, Status, Fee Head, Vertical                                  |        |
| 3    | Click **Record Payment**                   | Modal opens with pending-fee dropdown, amount, method, transaction ref, receipt no., notes                |        |
| 4    | Select a pending fee                       | Amount auto-fills from the fee's outstanding amount                                                       |        |
| 5    | Pick method (CASH / UPI / CHEQUE / etc.)   | Dropdown shows all valid DB `payment_method` enum values                                                  |        |
| 6    | Submit with valid data                     | `POST /api/transactions` returns 201; toast/alert "Payment recorded successfully"                         |        |
| 7    | Verify transaction inserted                | New row appears in Payment Logs (status = SUCCESS, processed_by = current user)                           |        |
| 8    | Verify fee updated                         | `fees.status = 'PAID'` (or stays PENDING if partial); `paid_amount` accumulated; `paid_at` set            |        |
| 9    | Verify audit log                           | `audit_logs` entry `entity_type=FEE, action=STATUS_CHANGE, metadata.event=MANUAL_PAYMENT`                 |        |
| 10   | Try recording payment against a PAID fee   | API returns 400 "Fee has already been paid"                                                               |        |
| 11   | Receipt number / Transaction ref           | Auto-generated (`RCPT-<ts>`, `TXN-<ts>`) if left blank; honored when provided                             |        |

> **Note:** The **Receipts** tab is still a placeholder ("coming soon"). Receipts are currently stored on transactions (`receipt_number`, `receipt_path`) but no PDF/preview UI exists yet.

### TC-ACCT-04: Export Tab

| Step | Action                      | Expected Result                                           | Status  |
| ---- | --------------------------- | --------------------------------------------------------- | ------- |
| 1    | Switch to Export tab        | Tally-ready export layout with Download CSV / XLS buttons | Working |
| 2    | Export financial data (CSV) | CSV download with Tally field mappings                    |         |
| 3    | Export financial data (XLS) | XLS download with frozen headers                          |         |

---

## 9. Parent Portal Testing

**Login as:** Parent mobile `9999900020` with OTP `123456` (dev mode)

### TC-PAR-01: OTP Login

| Step | Action                    | Expected Result                                    | Status  |
| ---- | ------------------------- | -------------------------------------------------- | ------- |
| 1    | Go to `/login/parent`     | Mobile input shown                                 | Working |
| 2    | Enter `9999900020`        | OTP sent                                           | Working |
| 3    | Enter `123456`            | Login successful, redirects to `/dashboard/parent` | Working |
| 4    | Enter unregistered mobile | Error: no parent account found                     |         |

### TC-PAR-02: Student Information (Read-Only)

| Step | Action                  | Expected Result                                        | Status  |
| ---- | ----------------------- | ------------------------------------------------------ | ------- |
| 1    | View dashboard          | Child's info with photo, vertical, room, status shown  | Working |
| 2    | Verify read-only access | No edit buttons available                              | Working |
| 3    | Multi-child selector    | If parent has multiple wards, dropdown to switch shown |         |

### TC-PAR-03: Fee View

| Step | Action                  | Expected Result                             | Status      |
| ---- | ----------------------- | ------------------------------------------- | ----------- |
| 1    | View fees section       | Fee progress bar (Total, Paid, Outstanding) | Working     |
| 2    | Verify fee items table  | Fee heads with paid/pending status          | Working     |
| 3    | View payment history    | Past payments shown                         | Working     |
| 4    | Download receipt (PAID) | Receipt button visible for paid fees        | Not working |

### TC-PAR-04: Leave Tracking

| Step | Action                    | Expected Result                                     | Status  |
| ---- | ------------------------- | --------------------------------------------------- | ------- |
| 1    | View leave section        | Leave summary (upcoming, approved, rejected counts) | Working |
| 2    | See leave request details | Type, dates, reason, status visible for each leave  | Working |

### TC-PAR-05: Notifications

| Step | Action                   | Expected Result                                | Status  |
| ---- | ------------------------ | ---------------------------------------------- | ------- |
| 1    | View notifications       | `GET /api/parent/notifications` returns alerts | Working |
| 2    | Check notification types | Fee payment alerts, leave status updates       | Working |

---

## 10. Room Allocation Testing

**Login as:** Superintendent or Trustee

### TC-ROOM-01: View Rooms

| Step | Action                         | Expected Result                           | Status  |
| ---- | ------------------------------ | ----------------------------------------- | ------- |
| 1    | Navigate to rooms page         | Room matrix organized by floor            | Working |
| 2    | Verify room count per vertical | Boys: 15, Girls: 8, Dharamshala: 6        | Working |
| 3    | Check capacity & occupancy     | Color indicators: Green/Yellow/Red/Gray   | Working |
| 4    | Filter by occupancy status     | Available, Partial, Full, Blocked filters | Working |

### TC-ROOM-02: Allocate Student to Room

| Step | Action                            | Expected Result                         | Status  |
| ---- | --------------------------------- | --------------------------------------- | ------- |
| 1    | Select an approved student        | Student with APPROVED status shown      | Working |
| 2    | Select available room             | Room with available capacity shown      | Working |
| 3    | Create allocation                 | `POST /api/allocations` assigns student | Working |
| 4    | Verify room occupancy incremented | occupied_count increases by 1           | Working |
| 5    | Verify student sees allocation    | Student dashboard shows room number     | Working |

### TC-ROOM-03: Capacity Enforcement

| Step | Action                         | Expected Result              | Status  |
| ---- | ------------------------------ | ---------------------------- | ------- |
| 1    | Find a room at full capacity   | Room shows as "Full" (red)   | Working |
| 2    | Try allocating another student | Error: room at full capacity |         |

### TC-ROOM-04: Room Transfer (two-step via Allocate Room modal)

> **Flow change:** Transfers are now performed as two actions inside the **Allocate Room** modal — unallocate the student from the current room, then open the destination room's modal and allocate them. No dedicated "Transfer" button exists.

**Login as:** Superintendent for the vertical

| Step | Action                                                           | Expected Result                                                                                     | Status |
| ---- | ---------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- | ------ |
| 1    | Pick an allocated student (note current room A and bed count)    | Student has an `ACTIVE` allocation on Room A                                                        |        |
| 2    | Navigate to Rooms page → click Room A → **Allocate Room** modal  | Modal shows "Current Occupants (N)" list, student appears with **Unallocate** button                |        |
| 3    | Click **Unallocate** → confirm dialog                            | `PUT /api/allocations/vacate/{id}` succeeds; student disappears from list; counter updates to (N-1) |        |
| 4    | Verify Room A occupancy decremented                              | `occupied_count` -1; status becomes `PARTIAL` / `AVAILABLE` (not `FULL`)                            |        |
| 5    | Close the modal; open Room B (destination room)                  | Room B's Allocate Room modal loads; its current occupants listed                                    |        |
| 6    | In "Allocate New Student" section, search and select the student | Unallocated student appears in the list (no active allocation)                                      |        |
| 7    | Click **Confirm Allocation**                                     | `POST /api/allocations` succeeds; new `ACTIVE` allocation created on Room B                         |        |
| 8    | Verify Room B occupancy incremented                              | `occupied_count` +1; status updates correctly (`PARTIAL` / `FULL`)                                  |        |
| 9    | Check audit logs                                                 | Two entries: `UPDATE` (VACATE event on old allocation) and `CREATE` (new allocation on Room B)      |        |
| 10   | Verify superintendent vertical scope                             | Rooms and students shown in modal belong only to the superintendent's vertical                      |        |

**Edge cases**

| Case                                                         | Expected Result                                                                                          | Status |
| ------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------- | ------ |
| Room B is at full capacity                                   | "Allocate New Student" section shows "room is full — unallocate someone to add"; Confirm button disabled |        |
| Student already has an active allocation elsewhere           | Student does NOT appear in the searchable list                                                           |        |
| Superintendent tries to pick a student from another vertical | Student not in the list (vertical-filtered server-side at `/api/users`)                                  |        |

### TC-ROOM-05: Unallocate (Vacate) Room

> **Flow change:** The "Vacate Room" action is surfaced as **Unallocate** inside the Allocate Room modal, next to each current occupant.

**Login as:** Superintendent for the vertical

| Step | Action                                             | Expected Result                                                                                                                             | Status |
| ---- | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| 1    | Navigate to Rooms page → click an occupied room    | Room detail panel opens with **Allocate** button                                                                                            |        |
| 2    | Click **Allocate** to open Allocate Room modal     | Modal shows header "Allocate Room", room info, and "Current Occupants (N)" list                                                             |        |
| 3    | Verify each occupant row                           | Shows full name, email, mobile, and an **Unallocate** button                                                                                |        |
| 4    | Click **Unallocate** on a student → confirm prompt | Browser confirm dialog appears with student name and room number                                                                            |        |
| 5    | Approve the confirmation                           | `PUT /api/allocations/vacate/{allocationId}` returns 200                                                                                    |        |
| 6    | Verify allocation status in DB                     | `room_allocations.status = 'VACATED'` (not `CHECKED_OUT`); `vacated_at` is set                                                              |        |
| 7    | Verify room record                                 | `occupied_count` decremented by 1; `status` updated: `PARTIAL` if >0, else `AVAILABLE`                                                      |        |
| 8    | Verify occupant list in modal                      | Unallocated student is removed; counter updates; "Available Beds" display refreshes                                                         |        |
| 9    | Refresh page and re-open the modal                 | Occupant list remains consistent (change persisted to DB)                                                                                   |        |
| 10   | Check student dashboard                            | Student no longer sees the room in their profile                                                                                            |        |
| 11   | Check audit log entry                              | `audit_logs` has entry: `entity_type='ROOM_ALLOCATION'`, `action='UPDATE'`, metadata contains `event='VACATE'`, old/new status, room number |        |

**Edge cases**

| Case                                                               | Expected Result                                                    | Status |
| ------------------------------------------------------------------ | ------------------------------------------------------------------ | ------ |
| Cancel the browser confirm dialog                                  | No API call; no state change                                       |        |
| Click Unallocate when already vacated (stale UI)                   | API returns 400 "Only active allocations can be vacated"           |        |
| Superintendent tries to unallocate a student from another vertical | Room is not visible to them in the first place (vertical-filtered) |        |
| Unallocate the last occupant in the room                           | Room status becomes `AVAILABLE`; `occupied_count = 0`              |        |

---

## 11. Leave Management Testing

### TC-LEAVE-01: Create Leave Request (Student)

**Login as:** `amit.jain@student.in` / `Password123`

| Step | Action                                 | Expected Result                                      | Status  |
| ---- | -------------------------------------- | ---------------------------------------------------- | ------- |
| 1    | Navigate to `/dashboard/student/leave` | Leave page loads with types and history              | Working |
| 2    | View leave types                       | Types with icons (Short, Night Out, Multi-day, etc.) | Working |
| 3    | Select leave type                      | Form adapts (time-based vs date-based fields)        | Working |
| 4    | Set from/to dates (min: tomorrow)      | Dates validated                                      | Working |
| 5    | Enter reason (min 10 chars)            | Validated                                            | Working |
| 6    | Enter destination and contact          | Required for non-time-based leaves                   | Working |
| 7    | Submit leave request                   | `POST /api/leaves` creates request, status: PENDING  | Working |
| 8    | Verify request appears in history      | New leave visible with PENDING badge                 |         |

### TC-LEAVE-02: Approve Leave (Superintendent)

**Login as:** `supt.boys@hostelpro.in` / `Password123`

| Step | Action                              | Expected Result                                     | Status  |
| ---- | ----------------------------------- | --------------------------------------------------- | ------- |
| 1    | Navigate to leaves page             | Pending leave requests shown with filter chips      | Working |
| 2    | View leave request details          | Full info: student, room, type, dates, reason shown | Working |
| 3    | Enter approval remarks              | Remarks field available                             | Working |
| 4    | Approve leave                       | `PUT /api/leaves/{id}/approve` -> status: APPROVED  | Working |
| 5    | Verify student sees APPROVED status | Student dashboard updated                           | Working |
| 6    | Verify parent notified              | `parent_notified_at` timestamp set                  |         |

### TC-LEAVE-03: Reject Leave

| Step | Action                                | Expected Result                                   | Status  |
| ---- | ------------------------------------- | ------------------------------------------------- | ------- |
| 1    | View a pending leave request          | Request details shown                             | Working |
| 2    | Enter rejection reason (min 10 chars) | Reason validated                                  |         |
| 3    | Reject leave                          | `PUT /api/leaves/{id}/reject` -> status: REJECTED |         |
| 4    | Verify student sees REJECTED status   | Student dashboard updated with reason             |         |

### TC-LEAVE-04: Leave Type Rules

| Step | Action                          | Expected Result                                  | Status |
| ---- | ------------------------------- | ------------------------------------------------ | ------ |
| 1    | Check Casual Leave limits       | 2 days/month, 8 days/semester (BOYS/GIRLS only)  |        |
| 2    | Check Emergency Leave limits    | 5 days/month, 15 days/semester                   |        |
| 3    | Check Home Visit limits         | 4 days/month, 12 days/semester (BOYS/GIRLS only) |        |
| 4    | Check Sick Leave                | No approval required                             |        |
| 5    | Verify Dharamshala restrictions | No CASUAL leave type available                   |        |

### TC-LEAVE-05: Leave Quota Enforcement

| Step | Action                                    | Expected Result               | Status |
| ---- | ----------------------------------------- | ----------------------------- | ------ |
| 1    | Submit leaves until monthly quota reached | Leaves approved up to limit   |        |
| 2    | Submit one more leave over quota          | Warning/error: quota exceeded |        |

---

## 12. Interview Workflow Testing

### TC-INT-01: Schedule Interview (Superintendent)

**Login as:** `supt.boys@hostelpro.in` / `Password123`

| Step | Action                                      | Expected Result                                  | Status  |
| ---- | ------------------------------------------- | ------------------------------------------------ | ------- |
| 1    | Open a SUBMITTED/REVIEW application         | Detail modal with action buttons                 | Working |
| 2    | Click "Schedule Interview"                  | Scheduling modal with applicant summary          | Working |
| 3    | Select mode: Online or Physical             | Mode stored                                      | Working |
| 4    | Select date (future only) and time          | Date/time validated                              |         |
| 5    | Confirm scheduling                          | `POST /api/interviews` creates interview record  | Working |
| 6    | Verify application status -> INTERVIEW      | Status updated                                   | Working |
| 7    | Verify interview appears in Interviews page | Listed in `/dashboard/superintendent/interviews` | Working |

### TC-INT-02: Schedule Interview (Trustee)

**Login as:** `trustee1@hostelpro.in` / `Password123`

| Step | Action                                            | Expected Result                                | Status  |
| ---- | ------------------------------------------------- | ---------------------------------------------- | ------- |
| 1    | Open a TRUSTEE_REVIEW application                 | Review modal with action buttons               | Working |
| 2    | Click "Schedule Interview"                        | Interview scheduling modal                     | Working |
| 3    | Select date, time, mode                           | Fields validated                               | Working |
| 4    | Toggle notification options (invitation/reminder) | Options stored                                 | Working |
| 5    | Confirm scheduling                                | Interview created, status -> TRUSTEE_INTERVIEW | Working |
| 6    | Online mode shows auto-meeting-link info          | Blue info box displayed                        | Working |

### TC-INT-03: Complete Interview (Trustee)

| Step | Action                                                           | Expected Result                            | Status       |
| ---- | ---------------------------------------------------------------- | ------------------------------------------ | ------------ |
| 1    | Navigate to trustee interviews page                              | Scheduled interviews listed                | Working      |
| 2    | Click "Complete" on an interview                                 | Evaluation modal opens                     | Not Required |
| 3    | Score criteria (Academic, Communication, Discipline, Motivation) | Score 1-5 per criterion                    | Not Required |
| 4    | Enter overall score (1-20)                                       | Score validated                            | Not Required |
| 5    | Select recommendation (APPROVE/DEFER/REJECT)                     | Recommendation stored                      | Working      |
| 6    | Enter overall observations                                       | Notes saved                                | Working      |
| 7    | Submit evaluation                                                | `PUT /api/interviews/{id}/complete` called | Not Required |
| 8    | Verify status -> COMPLETED                                       | Interview status updated                   | Not Required |

### TC-INT-04: Post-Interview Decision

| Step | Action                   | Expected Result                                  | Status  |
| ---- | ------------------------ | ------------------------------------------------ | ------- |
| 1    | View completed interview | Interview details with score/remarks visible     |         |
| 2    | Approve application      | Status -> APPROVED, student user account created | Working |
| 3    | OR Reject application    | Status -> REJECTED                               | Working |

---

## 13. Exit & Clearance Testing

### TC-EXIT-01: Student Exit Request

**Login as:** `amit.jain@student.in` / `Password123`

| Step | Action                                   | Expected Result                                   | Status |
| ---- | ---------------------------------------- | ------------------------------------------------- | ------ |
| 1    | Navigate to `/dashboard/student/exit`    | Exit form shown                                   |        |
| 2    | Submit exit request with reason and date | `POST /api/student/exit-request`                  |        |
| 3    | Status shows PENDING                     | Request visible in dashboard                      |        |
| 4    | Test withdraw before clearance           | `POST /api/student/exit-request/withdraw` cancels |        |

### TC-EXIT-02: Superintendent Clearance

**Login as:** `supt.boys@hostelpro.in` / `Password123`

| Step | Action                                            | Expected Result                            | Status |
| ---- | ------------------------------------------------- | ------------------------------------------ | ------ |
| 1    | Navigate to `/dashboard/superintendent/clearance` | Pending clearances shown                   |        |
| 2    | View student's exit clearance items               | Checklist: room, fees, library, keys, etc. |        |
| 3    | Mark individual items as cleared                  | Item status updated with remarks           |        |
| 4    | Use bulk clearance                                | Multiple items cleared at once             |        |
| 5    | All items cleared -> approve exit                 | Final clearance granted                    |        |
| 6    | Verify room vacated                               | Room occupancy decremented                 |        |
| 7    | Export clearance report                           | CSV report downloads                       |        |

### TC-EXIT-03: Incomplete Clearance Block

| Step | Action                               | Expected Result                          | Status |
| ---- | ------------------------------------ | ---------------------------------------- | ------ |
| 1    | Leave some clearance items unchecked | Some items pending                       |        |
| 2    | Try to finalize exit                 | Blocked: all items must be cleared first |        |

---

## 14. Fee & Payment Testing

### TC-FEE-01: View Fee Structure

| Step | Action                     | Expected Result                                        | Status  |
| ---- | -------------------------- | ------------------------------------------------------ | ------- |
| 1    | View fees page (any role)  | `GET /api/fees` returns fee data                       | Working |
| 2    | Verify fee heads           | HOSTEL_FEE, SECURITY_DEPOSIT, PROCESSING_FEE, MESS_FEE | Working |
| 3    | Verify per-student amounts | Matches seeded data                                    |         |

### TC-FEE-02: Record Payment (Accounts)

**Login as:** `accounts@hostelpro.in` / `Password123`

> **Note:** **Not implemented** — The accounts dashboard has no UI form or modal to record manual payments. `POST /api/payments` API exists and accepts `fee_id`, `payment_method`, `amount` but there is no button or form to trigger it from the dashboard. All steps below are blocked by missing UI.

| Step | Action                           | Expected Result                        | Status      |
| ---- | -------------------------------- | -------------------------------------- | ----------- |
| 1    | Select student with pending fees | Student fee details shown              | Not working |
| 2    | Record CASH payment              | `POST /api/payments` with method: CASH | Not working |
| 3    | Verify fee status -> PAID        | Fee record updated                     | Not working |
| 4    | Verify receipt number generated  | Unique receipt assigned                | Not working |
| 5    | Record UPI payment               | Method: UPI with transaction ID        | Not working |
| 6    | Record CHEQUE payment            | Method: CHEQUE with cheque number      | Not working |

### TC-FEE-03: Payment Methods

Test each payment method:

- [ ] CASH
- [ ] UPI
- [ ] BANK_TRANSFER
- [ ] CHEQUE
- [ ] DEMAND_DRAFT
- [ ] CARD

### TC-FEE-04: Fee Status Transitions

| From    | To        | Action                    |
| ------- | --------- | ------------------------- |
| PENDING | PAID      | Record payment            |
| PENDING | WAIVED    | Accounts waives fee       |
| PENDING | OVERDUE   | Past due date (automatic) |
| PAID    | REFUNDED  | Process refund            |
| PENDING | CANCELLED | Cancel fee                |

---

## 15. Renewal Cycle Testing

### TC-REN-01: Renewal Timeline

| Step | Action                                   | Expected Result                                                | Status |
| ---- | ---------------------------------------- | -------------------------------------------------------------- | ------ |
| 1    | Check student allocation date            | Renewal due 6 months from allocation                           |        |
| 2    | Verify renewal status calculation        | NOT_DUE (>60 days), UPCOMING (30-60), DUE_SOON (<=30), OVERDUE |        |
| 3    | Verify dashboard shows renewal countdown | Days remaining displayed                                       |        |

### TC-REN-02: Submit Renewal (Student)

| Step | Action                                   | Expected Result                      | Status |
| ---- | ---------------------------------------- | ------------------------------------ | ------ |
| 1    | Navigate to `/dashboard/student/renewal` | Renewal wizard (4 steps)             |        |
| 2    | Step 1: Review current info              | Student/allocation info displayed    |        |
| 3    | Step 2: Upload/confirm documents         | Required documents verified          |        |
| 4    | Step 3: Payment status                   | Fee status shown                     |        |
| 5    | Step 4: DPDP consent                     | Consent checkbox, timestamp stored   |        |
| 6    | Submit renewal application               | `POST /api/renewals` creates renewal |        |

### TC-REN-03: Renewal Review (Superintendent)

| Step | Action                                          | Expected Result                       | Status |
| ---- | ----------------------------------------------- | ------------------------------------- | ------ |
| 1    | Navigate to `/dashboard/superintendent/renewal` | Renewal applications listed           |        |
| 2    | Filter by vertical                              | Only current vertical shown           |        |
| 3    | Review renewal request details                  | Documents, payment, consent displayed |        |
| 4    | Approve renewal                                 | Allocation extended by 6 months       |        |
| 5    | Reject renewal                                  | Triggers exit clearance process       |        |

---

## 16. Document Management Testing

### TC-DOC-01: Application Documents

| Step | Action                            | Expected Result                                    | Status  |
| ---- | --------------------------------- | -------------------------------------------------- | ------- |
| 1    | During application form Step 5    | Upload interface shown                             | Working |
| 2    | Upload passport photo (JPG, <5MB) | `POST /api/applications/documents/upload` succeeds | Working |
| 3    | Upload birth certificate (PDF)    | Upload succeeds                                    | Working |
| 4    | Try uploading >5MB file           | Error: file too large                              | Working |
| 5    | Try uploading .exe file           | Error: invalid format (restricted by file picker)  | Working |

### TC-DOC-02: Student Document Upload (Post-Admission)

| Step | Action                             | Expected Result                      | Status  |
| ---- | ---------------------------------- | ------------------------------------ | ------- |
| 1    | Login as student -> Documents page | Document list shown                  | Working |
| 2    | Upload Aadhar Card                 | `POST /api/student/documents/upload` | Working |
| 3    | Upload Medical Certificate         | Upload succeeds                      | Working |
| 4    | View all uploaded documents        | List with types, dates, size         | Working |
| 5    | Download/view a document           | File opens/downloads correctly       | Working |

### TC-DOC-03: Document Types

Test upload for each supported type:

- [x] Passport Photo (PHOTOGRAPH)
- [x] Aadhar Card (AADHAAR_CARD)
- [x] Birth Certificate (BIRTH_CERTIFICATE)
- [x] Educational Certificate (EDUCATION_CERTIFICATE)
- [x] Income Certificate (INCOME_CERTIFICATE)
- [x] Medical Certificate (MEDICAL_CERTIFICATE) - Not Found
- [ ] Police Verification (POLICE_VERIFICATION) - Not Required
- [x] Undertaking (UNDERTAKING)
- [ ] Fee Receipt (RECEIPT)
- [ ] Renewal Form (RENEWAL_FORM) - Not Required

---

## 17. Authorization & Security Testing

### TC-SEC-01: Role-Based Access Control

| Test                                           | Login As       | Try Accessing                | Expected                  | Status  |
| ---------------------------------------------- | -------------- | ---------------------------- | ------------------------- | ------- |
| Student can't access superintendent dashboard  | Student        | `/dashboard/superintendent`  | Redirect to own dashboard | Working |
| Student can't see other students' data         | Student (Amit) | Sneha's API data             | 403 Forbidden             | Working |
| Superintendent can't see other vertical's data | Supt Boys      | Girls Ashram rooms API       | Empty result or 403       | Working |
| Parent can't modify data                       | Parent         | `PUT /api/applications/{id}` | 403 Forbidden             | Working |
| Unauthenticated user can't access dashboards   | None           | `/dashboard/*`               | Redirect to login         | Working |

### TC-SEC-02: API Authorization

| Test                             | Method | Endpoint                             | Token         | Expected                   | Status  |
| -------------------------------- | ------ | ------------------------------------ | ------------- | -------------------------- | ------- |
| Protected endpoint without token | GET    | `/api/applications`                  | None          | 401 Unauthorized           | Working |
| Wrong role accessing endpoint    | GET    | `/api/fees` (as Student)             | Student token | Filtered to own data only  | Working |
| Admin-only endpoint              | POST   | `/api/admin/seed-auth-users`         | Student token | 403 Forbidden              | Working |
| Supt reset password for student  | POST   | `/api/superintendent/reset-password` | Supt token    | Success with temp password |         |
| Student can't reset passwords    | POST   | `/api/superintendent/reset-password` | Student token | 403 Forbidden              |         |

### TC-SEC-03: Input Validation

| Test                    | Action                                   | Expected                    | Status  |
| ----------------------- | ---------------------------------------- | --------------------------- | ------- |
| SQL injection in search | Enter `'; DROP TABLE users;--` in search | Sanitized, no SQL execution | Working |
| XSS in form fields      | Enter `<script>alert('xss')</script>`    | HTML escaped in output      | Working |
| Oversized file upload   | Upload 100MB file                        | Rejected at upload          | Working |
| Invalid OTP format      | Submit non-numeric OTP                   | Validation error            | Working |

### TC-SEC-04: DPDP Compliance

| Step | Action                                     | Expected Result                      | Status  |
| ---- | ------------------------------------------ | ------------------------------------ | ------- |
| 1    | Check DPDP banner on `/apply`              | Privacy notice displayed             | Working |
| 2    | Check consent checkbox on first-time-setup | DPDP consent required                | Working |
| 3    | Verify consent_logs table                  | Consent stored with timestamp        | Working |
| 4    | Verify renewal consent                     | New consent captured at each renewal |         |

---

## 18. API Endpoint Reference

### Authentication

| Method | Endpoint                             | Auth         | Purpose                    |
| ------ | ------------------------------------ | ------------ | -------------------------- |
| POST   | `/api/auth/login`                    | No           | Staff login                |
| POST   | `/api/auth/logout`                   | Yes          | End session                |
| GET    | `/api/auth/session`                  | Yes          | Current session info       |
| POST   | `/api/auth/forgot-password`          | No           | Request password reset     |
| POST   | `/api/auth/reset-password`           | No           | Complete reset (OTP-based) |
| POST   | `/api/auth/first-time-setup`         | Token        | Set initial password       |
| POST   | `/api/auth/change-password`          | Yes          | Change own password        |
| POST   | `/api/superintendent/reset-password` | Supt/Trustee | Reset student password     |

### OTP

| Method | Endpoint          | Auth | Purpose    |
| ------ | ----------------- | ---- | ---------- |
| POST   | `/api/otp/send`   | No   | Send OTP   |
| POST   | `/api/otp/verify` | No   | Verify OTP |
| POST   | `/api/otp/resend` | No   | Resend OTP |

### Applications

| Method | Endpoint                             | Auth            | Purpose            |
| ------ | ------------------------------------ | --------------- | ------------------ |
| GET    | `/api/applications`                  | Staff           | List applications  |
| POST   | `/api/applications`                  | No              | Create application |
| GET    | `/api/applications/{id}`             | Staff/Applicant | Get details        |
| PUT    | `/api/applications/{id}`             | Trustee/Supt    | Update status      |
| GET    | `/api/applications/{id}/pdf`         | Staff           | Download PDF       |
| POST   | `/api/applications/documents/upload` | No              | Upload document    |

### Rooms & Allocations

| Method | Endpoint                | Auth          | Purpose           |
| ------ | ----------------------- | ------------- | ----------------- |
| GET    | `/api/rooms`            | Supt/Trustee  | List rooms        |
| POST   | `/api/rooms`            | Supt/Trustee  | Create room       |
| GET    | `/api/allocations`      | Student/Staff | List allocations  |
| POST   | `/api/allocations`      | Supt/Trustee  | Create allocation |
| PUT    | `/api/allocations/{id}` | Supt/Trustee  | Update allocation |

### Leaves

| Method | Endpoint                   | Auth     | Purpose        |
| ------ | -------------------------- | -------- | -------------- |
| GET    | `/api/leaves`              | Any auth | List leaves    |
| POST   | `/api/leaves`              | Student  | Create request |
| PUT    | `/api/leaves/{id}/approve` | Supt     | Approve        |
| PUT    | `/api/leaves/{id}/reject`  | Supt     | Reject         |

### Interviews

| Method | Endpoint                        | Auth         | Purpose         |
| ------ | ------------------------------- | ------------ | --------------- |
| GET    | `/api/interviews`               | Trustee/Supt | List interviews |
| POST   | `/api/interviews`               | Trustee/Supt | Schedule        |
| PUT    | `/api/interviews/{id}`          | Trustee      | Update          |
| PUT    | `/api/interviews/{id}/complete` | Trustee      | Complete        |
| GET    | `/api/interviews/slots`         | Trustee/Supt | Available slots |

### Fees & Payments

| Method | Endpoint        | Auth                    | Purpose         |
| ------ | --------------- | ----------------------- | --------------- |
| GET    | `/api/fees`     | Student/Accounts        | View fees       |
| POST   | `/api/fees`     | Accounts/Trustee        | Create fee      |
| GET    | `/api/payments` | Student/Accounts        | Payment history |
| POST   | `/api/payments` | Student/Parent/Accounts | Record payment  |

### System

| Method | Endpoint           | Auth         | Purpose      |
| ------ | ------------------ | ------------ | ------------ |
| GET    | `/api/health`      | No           | Health check |
| GET    | `/api/files/serve` | Yes          | Serve files  |
| GET    | `/api/auditLogs`   | Supt/Trustee | Audit trail  |

---

## 19. Known Limitations

| Feature                | Status       | Notes                                            |
| ---------------------- | ------------ | ------------------------------------------------ |
| Razorpay Integration   | Partial      | Tables exist, webhook not fully implemented      |
| WhatsApp Notifications | Config Only  | Rules stored, delivery not implemented           |
| Email Notifications    | Config Only  | Rules stored, delivery not implemented           |
| SMS Notifications      | Partial      | MSG91 OTP works, async queue not deployed        |
| BullMQ/Redis Queue     | Not Deployed | Architecture planned                             |
| PDF Generation         | Working      | Application PDF via `/api/applications/{id}/pdf` |

---

## End-to-End Workflow Checklist

### Application to Check-In (Happy Path)

- [ ] Student selects vertical on `/apply`
- [ ] Student enters contact, receives OTP
- [ ] Student verifies OTP
- [ ] Student fills all 6 form steps
- [ ] Student uploads required documents
- [ ] Student submits application, gets tracking number
- [ ] Superintendent reviews application (SUBMITTED -> REVIEW)
- [ ] Superintendent schedules interview (REVIEW -> INTERVIEW) OR forwards to trustees (-> TRUSTEE_REVIEW)
- [ ] Interview completed with score/remarks
- [ ] Application approved (-> APPROVED)
- [ ] Student user account created with temp password
- [ ] Superintendent allocates room
- [ ] Student logs in with temp password -> first-time setup page
- [ ] Student sets new password + DPDP consent
- [ ] Student dashboard loads with room info
- [ ] Student completes room check-in (inventory verification)

### Leave Cycle

- [ ] Student creates leave request (type, dates, reason, destination)
- [ ] Superintendent sees pending request
- [ ] Superintendent approves/rejects with remarks (`PUT` method)
- [ ] Student sees updated status
- [ ] Parent sees leave in portal

### Fee Payment Cycle

- [ ] Accounts views receivables with filters
- [ ] Student sees pending fees with outstanding balance
- [ ] Parent sees pending fees with progress bar
- [ ] Payment recorded (any method: CASH/UPI/CHEQUE/etc.)
- [ ] Fee status updates to PAID
- [ ] Receipt generated and downloadable

### Exit Flow

- [ ] Student submits exit request with reason and date
- [ ] Superintendent sees clearance items checklist
- [ ] Superintendent clears all items (individual or bulk)
- [ ] Room vacated, occupancy updated
- [ ] Clearance report exported

### Renewal Flow

- [ ] Student submits renewal (4-step wizard) before deadline
- [ ] DPDP consent captured at Step 4
- [ ] Superintendent reviews renewal application
- [ ] Approved: allocation extended by 6 months
- [ ] Rejected: triggers exit clearance process

### Password Management

- [ ] First-time setup: temp password -> strong password + DPDP consent
- [ ] Student change password: current password verification + new password
- [ ] Superintendent reset: generates temp password, requires change on next login
- [ ] Forgot password: OTP verification + new password

---

## Navigation Reference

| Role           | Nav Items                                                                               |
| -------------- | --------------------------------------------------------------------------------------- |
| Student        | Overview, Fees, Leave, Room, Documents, Renewal, Exit, Manual, Change Password          |
| Superintendent | Applications, Interviews, Residents, Rooms, Leaves, Clearance, Renewal, Audit, Settings |
| Trustee        | Overview, Applications, Residents, Interviews, Allocations, Reports                     |
| Accounts       | Overview                                                                                |
| Parent         | Overview, Leave                                                                         |
