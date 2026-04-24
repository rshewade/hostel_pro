# Testing Summary — Hostel Pro
**Source:** MANUAL_TESTING_GUIDE_v2.md | **Date:** 2026-04-22 | **Branch:** 31march

---

## Coverage Overview

| Total Steps | Working | Not Working | Untested | Coverage |
| :---------: | :-----: | :---------: | :------: | :------: |
|    ~462     |  ~293   |     ~17     |   ~152   | **~63%** |

---

## Section Breakdown

| #  | Section                  | Test Cases     | Steps | ✅ Working | ❌ Failing | ⬜ Untested | Coverage | Verdict         |
|----|--------------------------|----------------|------:|----------:|----------:|----------:|:--------:|-----------------|
| 3  | Application Flow         | TC-APP-01–06   |    37 |        32 |         1 |         4 |   86%    | Good            |
| 4  | Authentication           | TC-AUTH-01–07  |    30 |        24 |         1 |         5 |   80%    | Good            |
| 5  | Student Dashboard        | TC-STU-01–08   |    35 |        26 |         0 |         9 |   74%    | Partial         |
| 6  | Superintendent Dashboard | TC-SUPT-01–10  |    56 |        46 |         3 |         7 |   82%    | Good            |
| 7  | Trustee Dashboard        | TC-TRUST-01–07 |    42 |        33 |         0 |         9 |   79%    | Good            |
| 8  | Accounts Dashboard       | TC-ACCT-01–04  |    17 |         8 |         3 |         6 |   47%    | Low             |
| 9  | Parent Portal            | TC-PAR-01–05   |    18 |        14 |         1 |         3 |   78%    | Good            |
| 10 | Room Allocation          | TC-ROOM-01–05  |    47 |        24 |         0 |        23 |   51%    | Partial         |
| 11 | Leave Management         | TC-LEAVE-01–05 |    26 |        18 |         0 |         8 |   69%    | Partial         |
| 12 | Interview Workflow       | TC-INT-01–04   |    29 |        20 |         0 |         9 |   69%    | Partial         |
| 13 | Exit & Clearance         | TC-EXIT-01–03  |    21 |         0 |         0 |        21 |    0%    | **Not started** |
| 14 | Fee & Payment            | TC-FEE-01–04   |    26 |         2 |         8 |        16 |    8%    | Low             |
| 15 | Renewal Cycle            | TC-REN-01–03   |    18 |         0 |         0 |        18 |    0%    | **Not started** |
| 16 | Document Management      | TC-DOC-01–03   |    18 |        13 |         0 |         5 |   72%    | Partial         |
| 17 | Auth & Security          | TC-SEC-01–04   |    42 |        33 |         0 |         9 |   79%    | Good            |

---

## Known Failures

| ID   | Test Case  | Step | Failure                                                      | Severity |
|------|------------|:----:|--------------------------------------------------------------|:--------:|
| F-01 | TC-APP-02  |  2   | Mobile validation — `12345` accepted without error           |  Medium  |
| F-02 | TC-AUTH-02 |  4   | Unregistered parent mobile shows no error message            |  Medium  |
| F-03 | TC-SUPT-07 |  3   | Config: leave type add/edit does not save                    |   High   |
| F-04 | TC-SUPT-07 |  4   | Config: blackout dates do not save                           |   High   |
| F-05 | TC-SUPT-07 |  5   | Config: notification rules do not save                       |   High   |
| F-06 | TC-ACCT-03 |  3   | Record manual payment — no UI form on accounts dashboard     |   High   |
| F-07 | TC-ACCT-03 |  4   | Receipts tab is "coming soon" placeholder only               |  Medium  |
| F-08 | TC-PAR-03  |  4   | Parent cannot download fee receipts                          |  Medium  |
| F-09 | TC-FEE-02  | 1–6  | All payment recording steps blocked — no UI implemented      |   High   |

---

## Fully Verified (100% Green)

| Test Case   | Steps | What's Confirmed Working                                          |
|-------------|:-----:|-------------------------------------------------------------------|
| TC-APP-01   |  6/6  | Vertical selection, DPDP banner, document checklist               |
| TC-APP-04   | 29/29 | All 6 form steps — validation, uploads, review, submit            |
| TC-APP-06   |  2/2  | Application tracking — tracking number lookup                     |
| TC-AUTH-01  |  6/6  | Staff login for all 4 roles                                       |
| TC-AUTH-03  |  5/5  | First-time password setup — temp password flow (bug fixed)        |
| TC-AUTH-05  |  7/7  | Student change password — all validations + audit log             |
| TC-AUTH-06  |  4/4  | Session management, JWT logout, post-logout redirect              |
| TC-STU-01   |  3/3  | Student dashboard overview — stats, nav links                     |
| TC-STU-02   |  3/3  | Room information — number, type, sharing, roommates               |
| TC-STU-03   |  7/7  | Room check-in — all steps including form, confirmation            |
| TC-STU-05   |  5/5  | Student document upload — Aadhar, medical, list, download         |
| TC-STU-06   |  5/5  | Fee view — overview cards, items, balance, payment history        |
| TC-SUPT-03  |  4/4  | Superintendent Interviews page — list, filter, detail modal       |
| TC-SUPT-04  |  7/7  | Superintendent resident password reset — confirm + temp password  |
| TC-SUPT-05  |  8/8  | Room management — matrix, add, edit, filter, allocate             |
| TC-SUPT-08  |  3/3  | Audit log — entries, filter, change details                       |
| TC-SUPT-10  |  4/4  | Vertical isolation — Boys/Girls/Dharamshala data separated        |
| TC-TRUST-01 |  5/5  | Trustee dashboard overview — stats, pending list                  |
| TC-TRUST-02 | 10/10 | Trustee application review — all decision actions                 |
| TC-TRUST-03 |  6/6  | Trustee Residents page — all verticals, filter, vertical badge    |
| TC-TRUST-04 |  5/5  | Trustee Interviews page — list, filter, detail                    |
| TC-TRUST-05 |  5/5  | Application status workflow end-to-end (REVIEW → APPROVED)        |
| TC-ACCT-02  |  4/4  | Receivables tab — list, vertical filter, status filter, bulk      |
| TC-PAR-01   |  3/3  | Parent OTP login — send OTP, verify, redirect                     |
| TC-PAR-02   |  2/2  | Parent student info view — read-only student details              |
| TC-PAR-04   |  2/2  | Parent leave tracking — summary, leave details                    |
| TC-PAR-05   |  2/2  | Parent notifications — fee alerts, leave updates                  |
| TC-ROOM-01  |  4/4  | Room matrix — floor view, count, occupancy indicators, filter     |
| TC-ROOM-02  |  5/5  | Full room allocation — create, occupancy increment, student view  |
| TC-LEAVE-01 |  7/7  | Create leave request (student) — all form steps + validation      |
| TC-LEAVE-02 |  5/5  | Approve leave (superintendent) — list, approve, status update     |
| TC-INT-01   |  7/7  | Schedule interview (superintendent) — date, mode, notifications   |
| TC-INT-02   |  6/6  | Trustee interview scheduling — date, mode, notifications          |
| TC-INT-04   |  3/3  | Post-interview decision — approve/reject outcome recorded         |
| TC-DOC-01   |  5/5  | Application document upload (all 5 steps)                         |
| TC-DOC-02   |  5/5  | Student post-admission document upload (all 5 steps)              |
| TC-SEC-01   |  5/5  | Role-based dashboard access control (all 5 checks)                |
| TC-SEC-03   |  4/4  | SQL injection, XSS, oversized file, invalid OTP                   |

---

## Priority Testing Queue

### High Priority (untested or critical)

| Test Case    | Area                             | Reason                                 |
|--------------|----------------------------------|----------------------------------------|
| TC-EXIT-01–03| Exit & Clearance                 | Entire section 0%, core workflow       |
| TC-REN-01–03 | Renewal Cycle                    | Entire section 0%, core workflow       |
| TC-FEE-02    | Record manual payment (UI build) | No UI form exists — needs development  |
| TC-AUTH-07   | Role-based dashboard redirect    | RBAC enforcement, 5 steps untested     |
| TC-SUPT-09   | Exit Clearance (Superintendent)  | 0% tested, links to exit workflow      |

### Medium Priority

| Test Case      | Area                                          |
|----------------|-----------------------------------------------|
| TC-ROOM-03–05  | Room deallocation, vacate, transfer (23 steps untested) |
| TC-INT-03      | Interview completion steps (9 steps remain)   |
| TC-LEAVE-03–05 | Leave rejection + quota rules (8 steps remain)|
| TC-STU-04,07–08| Student fee payment, exit request, renewal wizard |
| TC-TRUST-06–07 | Trustee fee oversight, renewal approvals (9 steps) |

---

## New in v2 vs v1

| Feature                                                 | Test Case   |    Status    |
|---------------------------------------------------------|-------------|:------------:|
| Temp password formula — `{LastName}@{last4}#{DDMMYYYY}` | TC-AUTH-03 | ✅ Working   |
| `requires_password_change` DB column fix (bug)          | TC-AUTH-03  | ✅ Working   |
| Student self-service change password                    | TC-AUTH-05  | ✅ Working   |
| Superintendent interview scheduling                     | TC-SUPT-02  | ✅ Working   |
| Superintendent Interviews page                          | TC-SUPT-03  | ✅ Working   |
| Superintendent reset resident password                  | TC-SUPT-04  | ✅ Working   |
| Trustee Residents page (all verticals)                  | TC-TRUST-03 | ✅ Working   |
| Trustee interview scheduling                            | TC-INT-02   | ✅ Working   |
| Role-based dashboard redirect (RBAC enforcement)        | TC-AUTH-07  | ⬜ Untested  |
| Status: TRUSTEE_REVIEW / TRUSTEE_INTERVIEW / WITHDRAWN  | TC-TRUST-05 | ⬜ Partial   |

---

## E2E Workflow Readiness

| Workflow                                          | Ready? | Notes                                              |
|---------------------------------------------------|:------:|----------------------------------------------------|
| Application submission (guest → tracking number)  |   ✅   | Fully tested                                       |
| First-time login (temp password → setup)          |   ✅   | Bug fixed, verified                                |
| Student change password                           |   ✅   | All 7 steps verified                               |
| Room allocation                                   |   ✅   | Core steps verified                                |
| Leave request + approval                          |   ✅   | TC-LEAVE-01 and TC-LEAVE-02 both fully verified    |
| Trustee review path (TRUSTEE_REVIEW → APPROVED)   |   ✅   | TC-TRUST-01,02,04,05 all fully verified            |
| Superintendent application management             |   ✅   | 46/56 steps working (82%)                          |
| Parent portal (view)                              |  ⚠️   | Receipt download broken (F-08)                     |
| Interview scheduling (Supt + Trustee)             |  ⚠️   | Scheduling tested; TC-INT-03 completion partial    |
| Fee recording (Accounts)                          |   ❌   | No UI form — feature not built                     |
| Exit & Clearance                                  |   ❌   | Entire section untested                            |
| Renewal Cycle                                     |   ❌   | Entire section untested                            |

---

## Known Limitations (By Design)

| Feature                        | Status          | Notes                                 |
|--------------------------------|-----------------|---------------------------------------|
| PDF generation                 | ✅ Working      | `/api/applications/{id}/pdf`          |
| SMS OTP                        | ✅ Partial      | MSG91 works; async queue not deployed |
| Manual payment recording UI    | ❌ Not built    | API exists; no dashboard form         |
| Razorpay payments              | ⚠️ Partial      | Tables exist; webhook not implemented |
| WhatsApp / Email notifications | ⚠️ Config only  | Rules stored; delivery not wired      |
| BullMQ / Redis queue           | ❌ Not deployed | Architecture planned                  |

---

## Test Credentials

| Role                         | Email / Mobile                  | Password / OTP      |
|------------------------------|---------------------------------|---------------------|
| Superintendent (Boys)        | `supt.boys@hostelpro.in`        | `Password123`       |
| Superintendent (Girls)       | `supt.girls@hostelpro.in`       | `Password123`       |
| Superintendent (Dharamshala) | `supt.dharamshala@hostelpro.in` | `Password123`       |
| Trustee                      | `trustee1@hostelpro.in`         | `Password123`       |
| Accounts                     | `accounts@hostelpro.in`         | `Password123`       |
| Student (Boys)               | `amit.jain@student.in`          | `Password123`       |
| Student (Girls)              | `sneha.shah@student.in`         | `Password123`       |
| Parent (OTP)                 | `9999900020`                    | `123456` (dev mode) |
