# Hostel Management Application - Manual Testing Guide

This guide provides step-by-step instructions to manually validate the functionality of the Hostel Management System. It covers all user roles and key workflows.

## 📋 Prerequisites

- **URL:** Access the application (e.g., `http://localhost:3000` or your deployment URL).
- **Database:** Ensure `db.json` is populated with initial mock data.
- **API Server:** Run `npm run dev:api` to start json-server on port 3001.

### Test Credentials

| Role                   | Email                           | Password      |
| ---------------------- | ------------------------------- | ------------- |
| Student                | `student@example.com`           | `password123` |
| Superintendent (Boys)  | `superintendent@jain.org`       | `password123` |
| Superintendent (Girls) | `superintendent-girls@jain.org` | `password123` |
| Trustee                | `trustee@jain.org`              | `password123` |
| Accounts               | `accounts@jain.org`             | `password123` |
| Parent                 | Mobile: `9876543210`            | OTP: `123456` |

### Test Application Tracking Numbers

| Tracking Number | Mobile Number | Status              | Vertical     |
| --------------- | ------------- | ------------------- | ------------ |
| `BH-2025-00001` | `9988776655`  | SUBMITTED           | Boys Hostel  |
| `BH-2025-00002` | `9988776660`  | SUBMITTED           | Boys Hostel  |
| `BH-2025-00003` | `9988776670`  | REVIEW              | Boys Hostel  |
| `BH-2025-00004` | `9988776680`  | APPROVED            | Boys Hostel  |
| `BH-2025-00005` | `9988776685`  | REJECTED            | Boys Hostel  |
| `GA-2025-00001` | `9988776665`  | SUBMITTED           | Girls Ashram |
| `GA-2025-00002` | `9988776675`  | INTERVIEW_SCHEDULED | Girls Ashram |
| `DH-2025-00001` | `9988776690`  | DRAFT               | Dharamshala  |

### Additional Test Students

| Name            | Email                    | Vertical     | Room  |
| --------------- | ------------------------ | ------------ | ----- |
| Amit Kumar Jain | `amit.kumar@email.com`   | Boys Hostel  | A-101 |
| Priya Sharma    | `priya.sharma@email.com` | Girls Ashram | B-101 |
| Rahul Verma     | `rahul.verma@email.com`  | Boys Hostel  | A-102 |
| Neha Gupta      | `neha.gupta@email.com`   | Girls Ashram | B-102 |

---

## 1. Public & Guest Workflows

### 1.1 Landing Page

- [ ] `TC-PUB-001` Open the home page.
- [ ] `TC-PUB-002` Verify the "Hirachand Gumanji Family Charitable Trust" branding is visible.
- [ ] `TC-PUB-003` Check that "Boys Hostel", "Girls Ashram", and "Dharamshala" cards are displayed.
- [ ] `TC-PUB-004` Click "Apply Now" on any vertical.

### 1.2 Application Process (New Admission)

- [ ] `TC-PUB-005` **Step 1:** Select "Boys Hostel" > "Apply Now".
- [ ] `TC-PUB-006` **Step 2 (OTP):** Enter a mobile number (e.g., `9988776655`). Click "Send OTP".
- [ ] `TC-PUB-007` **Step 3:** Enter mock OTP `123456`. Verify redirection to the application form.
- [ ] `TC-PUB-008` **Step 4 (Form):** Fill in Personal Details, Guardian Info, and Academic details.
- [ ] `TC-PUB-009` **Step 5 (Uploads):** Upload dummy files for Aadhar/Photo.
- [ ] `TC-PUB-010` **Step 6:** Submit the application.
- [ ] `TC-PUB-011` **Result:** You should see a "Success" screen with a **Tracking Number** (e.g., `BH-2025-00001`). Note this number.

### 1.3 Track Application

- [ ] `TC-PUB-012` Go to `/track`.
- [ ] `TC-PUB-013` Enter the Tracking Number from the previous step.
- [ ] `TC-PUB-014` Click "Track".
- [ ] `TC-PUB-015` **Result:** You should see the application status (e.g., "SUBMITTED").

---

## 2. End-to-End Application Workflow (Admissions)

This section validates the complete admission cycle from application to approval.

### 2.1 Applicant - Submission

- [ ] `TC-APP-001` Go to Landing Page (`/`).
- [ ] `TC-APP-002` Submit a new application for "Boys Hostel".
- [ ] `TC-APP-003` Note down the **Tracking Number**.
- [ ] `TC-APP-004` **State:** Application is now in `SUBMITTED` state.

### 2.2 Superintendent - Review & Forward

- [ ] `TC-APP-005` Login as **Superintendent** (`superintendent@jain.org`).
- [ ] `TC-APP-006` Go to **Applications**.
- [ ] `TC-APP-007` Find the new application (filter by 'Submitted').
- [ ] `TC-APP-008` Open details. Verify information.
- [ ] `TC-APP-009` **Action:** Change status to **Approved** (this effectively forwards to Trustee).
- [ ] `TC-APP-010` Add remark: "Documents verified. Recommended for interview."
- [ ] `TC-APP-011` **State:** Application moves to `APPROVED` (or `FORWARDED_TO_TRUSTEE`).

### 2.3 Trustee - Final Approval

- [ ] `TC-APP-012` Login as **Trustee** (`trustee@jain.org`).
- [ ] `TC-APP-013` Go to **Dashboard** (Applications tab).
- [ ] `TC-APP-014` Find the forwarded application.
- [ ] `TC-APP-015` **Action:** Click "Schedule Interview" (Optional test).
- [ ] `TC-APP-016` **Action:** Click "Approve" (Final Admission).
- [ ] `TC-APP-017` Confirm room allocation preference if asked.
- [ ] `TC-APP-018` **State:** Application moves to `ADMITTED` (or `FINAL_APPROVED`).

### 2.4 System - User Creation

- [ ] `TC-APP-019` Upon final approval, the system should generate a **Student User Account**.
- [ ] `TC-APP-020` (Manual Verification): Check `db.json` -> `users` for a new entry with the applicant's email/mobile.

### 2.5 Student - First Login

- [ ] `TC-APP-021` Login as the new **Student** using their email/mobile.
- [ ] `TC-APP-022` Use default password (or OTP flow if implemented).
- [ ] `TC-APP-023` **Action:** Complete "First Time Setup" (Password Change).
- [ ] `TC-APP-024` Verify access to **Student Dashboard**.

---

## 3. Student Dashboard

**Login:** Use `student@example.com` / `password123`.

### 3.1 Overview

- [ ] `TC-STU-001` Verify "Student Dashboard" title and "Boys Hostel" badge.
- [ ] `TC-STU-002` Check Quick Stats (Fee Status, Attendance, Room Number).
- [ ] `TC-STU-003` Verify "Quick Actions" buttons work (Pay Fees, Apply Leave, etc.).

### 3.2 Room Details

- [ ] `TC-STU-004` Navigate to **Room**.
- [ ] `TC-STU-005` Verify Room Number (e.g., "101") and details are loaded.
- [ ] `TC-STU-006` Check Roommate list (should show roommate names).
- [ ] `TC-STU-007` **Action:** Click "Check In" (if not checked in). Confirm inventory items.

### 3.3 Fee Payments

- [ ] `TC-STU-008` Navigate to **Fees**.
- [ ] `TC-STU-009` View list of pending and paid fees.
- [ ] `TC-STU-010` **Action:** Click "Pay Now" on a pending fee.
- [ ] `TC-STU-011` **Flow:** Select Payment Mode -> Click Pay -> Verify "Payment Successful" receipt.
- [ ] `TC-STU-012` Check that the fee status changes to "PAID".

### 3.4 Leave Management

- [ ] `TC-STU-013` Navigate to **Leave**.
- [ ] `TC-STU-014` **Action:** Click "Apply Leave".
- [ ] `TC-STU-015` Select "Short Leave". Enter dates/reason. Submit.
- [ ] `TC-STU-016` **Result:** New leave request appears in "Leave History" with status "PENDING".
- [ ] `TC-STU-017` Repeat for "Night Out" and "Multi-Day" (Multi-day should ask for destination).

### 3.5 Documents

- [ ] `TC-STU-018` Navigate to **Documents**.
- [ ] `TC-STU-019` Verify categories: Identity, Admission, Receipts.
- [ ] `TC-STU-020` Check that list is populated.

### 3.6 Renewal

- [ ] `TC-STU-021` Navigate to **Renewal**.
- [ ] `TC-STU-022` **Action:** Start Renewal process.
- [ ] `TC-STU-023` Steps: Review Info -> Documents -> Pay Fee -> Consent.
- [ ] `TC-STU-024` **Result:** Renewal status updates to "Submitted".

### 3.7 Exit

- [ ] `TC-STU-025` Navigate to **Exit**.
- [ ] `TC-STU-026` **Action:** Click "Request Exit".
- [ ] `TC-STU-027` Enter reason (e.g., "Course Completion"). Submit.
- [ ] `TC-STU-028` **Result:** Status changes to "Clearance Pending".

---

## 4. Superintendent Dashboard

**Login:** Use `superintendent@jain.org` / `password123`.

### 4.1 Dashboard Overview

- [ ] `TC-SUP-001` Verify stats: Total Occupancy, Pending Applications, Leave Requests.

### 4.2 Applications Management

- [ ] `TC-SUP-002` Navigate to **Applications**.
- [ ] `TC-SUP-003` Find the application submitted in Step 1.2.
- [ ] `TC-SUP-004` **Action:** Click "Review".
- [ ] `TC-SUP-005` **Action:** Change status to "Approved" (Forward to Trustee) or "Rejected".
- [ ] `TC-SUP-006` Add remarks and confirm.

### 4.3 Leave Approvals

- [ ] `TC-SUP-007` Navigate to **Leaves**.
- [ ] `TC-SUP-008` Find the leave request from Step 3.4.
- [ ] `TC-SUP-009` **Action:** Click "Approve" or "Reject".
- [ ] `TC-SUP-010` Verify the status change is reflected.

### 4.4 Exit Clearance

- [ ] `TC-SUP-011` Navigate to **Clearance**.
- [ ] `TC-SUP-012` Find the exit request from Step 3.7.
- [ ] `TC-SUP-013` **Action:** Review Clearance Checklist (Room Inventory, Keys).
- [ ] `TC-SUP-014` Mark items as "Verified".
- [ ] `TC-SUP-015` **Action:** Finalize Clearance.

### 4.5 Configuration

- [ ] `TC-SUP-016` Navigate to **Configuration**.
- [ ] `TC-SUP-017` Verify Leave Rules and Notification templates are visible.

---

## 5. Parent Dashboard

**Login:** Go to `/login/parent`.

### 5.1 Login

- [ ] `TC-PAR-001` Enter Mobile Number `9876543210`.
- [ ] `TC-PAR-002` Enter OTP `123456`.

### 5.2 Dashboard View

- [ ] `TC-PAR-003` Verify Student Name and Photo.
- [ ] `TC-PAR-004` **Fees:** Check that Fee Status matches the student's payment history.
- [ ] `TC-PAR-005` **Leaves:** Check that recent leave requests are visible.
- [ ] `TC-PAR-006` **Banner:** Confirm "View-Only Access" banner is displayed.

---

## 6. Trustee Dashboard

**Login:** Use `trustee@jain.org` / `password123`.

### 6.1 Approvals

- [ ] `TC-TRU-001` Check "Pending Approvals" list.
- [ ] `TC-TRU-002` Find applications forwarded by Superintendent.
- [ ] `TC-TRU-003` **Action:** Schedule Interview or Final Approve.

---

## 7. Edge Cases & Validation

- [ ] `TC-EDG-001` **Invalid Login:** Try incorrect password. Expect error message.
- [ ] `TC-EDG-002` **Session Expiry:** Clear cookies/storage and refresh. Expect redirection to login.
- [ ] `TC-EDG-003` **Permission Check:** Try accessing `/dashboard/superintendent` while logged in as Student. Expect "Access Denied" or redirect.
- [ ] `TC-EDG-004` **Mobile View:** Resize browser to mobile width. Verify Hamburger menu and responsive layout.

---

## Troubleshooting

### Common Issues

| Issue                            | Solution                                                                       |
| -------------------------------- | ------------------------------------------------------------------------------ |
| **Login Fails**                  | Ensure `db.json` has `password_hash: "password123"` for the user               |
| **Empty Data**                   | Verify json-server is running: `npm run dev:api`                               |
| **API Errors (404)**             | Check that API routes exist in `db.json` (collections should be at root level) |
| **API Errors (500)**             | Check browser console Network tab for details                                  |
| **Components show "Loading..."** | Ensure json-server is running on port 3001                                     |
| **Data not updating**            | Refresh the page or restart json-server                                        |

### Starting the Development Environment

```bash
# Terminal 1: Start Next.js frontend
cd frontend
npm run dev

# Terminal 2: Start json-server API
npm run dev:api

# Or run both concurrently
npm run dev:all
```

### Resetting Test Data

If test data becomes corrupted, you can reset by:

1. Stop the json-server
2. Replace `db.json` with a fresh copy from version control
3. Restart json-server
