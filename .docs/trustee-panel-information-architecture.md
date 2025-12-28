# Trustee Panel Information Architecture and User Flows

**Task:** 13.1 - Define Trustee panel information architecture and key user flows
**Status:** Design Document
**Version:** 1.0
**Date:** 2025-12-28

---

## Executive Summary

This document defines the information architecture (IA) and user flows for the Trustee Panel in the Jain Hostel Management Application. The Trustee Panel is a senior-level interface for Trustees to review forwarded applications, conduct interviews, make provisional decisions, and issue final approvals.

**Key Characteristics:**
- Cross-vertical access (can view and act on applications from Boys Hostel, Girls Ashram, and Dharamshala)
- Interview management with scheduling and evaluation capabilities
- Final approval authority with institutional governance
- Internal remarks separation (never visible to students)
- Audit-ready decision logging

---

## 1. Trustee Panel Structure Overview

### 1.1 High-Level Navigation Hierarchy

```
Trustee Dashboard (/trustee)
│
├── Applications (/trustee/applications)
│   ├── Forwarded for Review (Default View)
│   ├── Interview Queue
│   ├── Pending Final Decision
│   └── Application Details [id]
│       ├── Superintendent Review Summary
│       ├── Interview Scheduling / Evaluation
│       └── Final Decision Actions
│
├── Interview Management (/trustee/interviews)
│   ├── Interview Calendar (Default View)
│   ├── Scheduled Interviews
│   ├── Evaluation Forms
│   └── Interview History
│
├── Approvals (/trustee/approvals)
│   ├── Provisional Approvals
│   ├── Final Approvals
│   ├── Rejections
│   └── Bulk Actions
│
└── Audit & Reports (/trustee/audit)
    ├── Approval History
    ├── Decision Logs
    ├── Authority Reports
    └── Compliance Tracking
```

### 1.2 Trustee Dashboard Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  Header                                                          │
│  [Logo] Trustee Dashboard    [Vertical Selector: All Verticals ▼]  │
│                               [🔔 Notifications] [Profile ▼]     │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  [Applications] [Interviews] [Approvals] [Audit & Reports]       │
│  ───────────────────────────────────────────────────────────────  │
│                                                                   │
│  Main Content Area (Dynamic based on selection)                  │
│                                                                   │
│  [Filters & Controls]                                             │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │  Vertical: [All ▼] | Status: [Forwarded ▼] | Search... │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                   │
│  [Application List Table / Calendar / Forms]                      │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

### 1.3 Navigation Pattern

- **Primary Navigation:** Top tab bar (Applications, Interviews, Approvals, Audit & Reports)
- **Secondary Navigation:** Filters and sub-views within each section
- **Vertical Context:** Selector in header (Trustee can switch between All, Boys, Girls, Dharamshala)
- **Breadcrumb:** Shows navigation path for deep links (e.g., Applications → APP-2024-001 → Interview Scheduling)

---

## 2. Screen-by-Screen Information Architecture

### 2.1 Applications Tab (Default Landing)

#### 2.1.1 Forwarded for Review View (Default Sub-View)

**Purpose:** View all applications forwarded by Superintendents requiring Trustee review.

**Layout:**
```
Filters:
  ├─ Vertical: [All Verticals ▼] OR [Boys] OR [Girls] OR [Dharamshala]
  ├─ Status: [All ▼] OR [Pending Provisional] OR [Interview Scheduled] OR [Awaiting Final Decision]
  ├─ Priority: [All ▼] OR [High] OR [Normal]
  └─ Search: [By applicant name or tracking #]

Application Table:
  Columns:
  ├─ Tracking Number (sortable)
  ├─ Applicant Name (sortable)
  ├─ Vertical (Badge)
  ├─ Superintendent (who forwarded)
  ├─ Recommendation (Badge: Recommended/Not Recommended)
  ├─ Flags (Chips: Documents Pending, High Priority, etc.)
  ├─ Interview Status (Badge: Not Scheduled, Scheduled, Completed)
  ├─ Current Status (Badge: Forwarded, Interview Scheduled, Provisionally Approved)
  └─ Actions [Review] [Schedule Interview] [View Details]

Row Actions:
  ├─ Click row → Open Application Detail Modal
  ├─ Review Button → Navigate to Application Details page
  └─ Schedule Interview → Jump to Interview Scheduling section
```

**Data Displayed:**
- Application metadata (tracking number, date, applicant info)
- Superintendent's recommendation and remarks
- Flags/warnings raised by Superintendent
- Interview status (if any)
- Current workflow status

**Sorting Options:**
- Application Date (Newest/Oldest)
- Priority (High to Low)
- Interview Date (if scheduled)

---

#### 2.1.2 Interview Queue View

**Purpose:** View applications with scheduled interviews requiring evaluation.

**Layout:**
```
Filters:
  ├─ Date Range: [From ▼] [To ▼]
  ├─ Vertical: [All Verticals ▼]
  └─ Status: [Upcoming] OR [Today] OR [Completed Today]

Interview Cards (Grouped by Date):
  ┌─────────────────────────────────────────────────────────────┐
  │  Today: December 28, 2025                                  │
  ├─────────────────────────────────────────────────────────────┤
  │  [10:00 AM] APP-2024-001 - Rahul Sharma (Boys)           │
  │  Mode: Online (Google Meet) | Status: Upcoming             │
  │  [Join Interview] [View Application] [Reschedule]          │
  ├─────────────────────────────────────────────────────────────┤
  │  [2:00 PM]  APP-2024-005 - Priya Patel (Girls)            │
  │  Mode: Physical (Room 201) | Status: Upcoming             │
  │  [View Application] [Reschedule]                            │
  └─────────────────────────────────────────────────────────────┘
```

**Data Displayed:**
- Interview date, time, and mode
- Applicant details and vertical
- Meeting link or location
- Interview status (Upcoming, In Progress, Completed, Missed)
- Join/Reschedule actions (based on status)

---

#### 2.1.3 Pending Final Decision View

**Purpose:** View applications awaiting final approval/rejection after interview evaluation.

**Layout:**
```
Filters:
  ├─ Vertical: [All Verticals ▼]
  ├─ Provisional Status: [Provisionally Approved] OR [Interview Completed]
  └─ Decision Status: [All ▼] OR [Awaiting Decision]

Application Table:
  Columns:
  ├─ Tracking Number
  ├─ Applicant Name
  ├─ Vertical
  ├─ Provisional Status (Badge)
  ├─ Interview Score (if completed)
  ├─ Interview Date
  └─ Actions [Final Approve] [Reject] [Review Interview Remarks]

Quick Actions Bar:
  ├─ [Approve Selected] (Bulk action)
  └─ [Reject Selected] (Bulk action)
```

**Data Displayed:**
- Interview evaluation summary (score, key observations)
- Provisional decision status
- Time since interview completion
- Urgency indicators

---

### 2.2 Application Detail Screen

**Purpose:** Comprehensive view of a single forwarded application with all actions.

**Layout:**
```
┌─────────────────────────────────────────────────────────────────┐
│  Back to Applications    APP-2024-001 - Rahul Sharma            │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  Section Tabs: [Summary] [Interview] [Decision] [Audit]  │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  [Content Area - Dynamic based on selected tab]                 │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

#### 2.2.1 Summary Tab (Default)

**Layout:**
```
┌─────────────────────────────────────────────────────────────────┐
│  Applicant Information                                         │
│  ─────────────────────────────────────────────────────────────  │
│  Name: Rahul Sharma                            Age: 22         │
│  Tracking #: APP-2024-001                     Mobile: +91...  │
│  Email: rahul.sharma@email.com                                │
│  Vertical: [Badge: Boys Hostel]                               │
│  Application Date: December 20, 2024                           │
│                                                                  │
│  Superintendent Review                                         │
│  ─────────────────────────────────────────────────────────────  │
│  Forwarded By: [Name] (Boys Hostel Superintendent)             │
│  Forwarded On: December 22, 2024                               │
│  Recommendation: [Badge: Recommend Approval]                    │
│  Remarks:                                                      │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  Candidate has strong academic background and meets all   │  │
│  │  eligibility criteria. Documents verified. Interview       │  │
│  │  recommended for final assessment.                       │  │
│  └────────────────────────────────────────────────────────────┘  │
│  Flags: [Chip: Documents Verified] [Chip: High Priority]      │
│                                                                  │
│  Key Documents (Preview)                                        │
│  ─────────────────────────────────────────────────────────────  │
│  [📄 Student Declaration] [📄 Parent Consent] [📄 Aadhar Card]│
│  [📄 Academic Marksheets] [📄 Reference Letters]             │
│  [View All Documents →]                                        │
│                                                                  │
│  Payment Status                                                 │
│  ─────────────────────────────────────────────────────────────  │
│  Status: [Badge: Paid]                                         │
│  Receipt: #REC-2024-0892                                       │
│  [Download Receipt]                                             │
│                                                                  │
│  Current Workflow Status                                         │
│  ─────────────────────────────────────────────────────────────  │
│  Visual Timeline:                                               │
│  ✓ Submitted → ✓ Under Review → ✓ Forwarded → ⏳ Interview    │
│                                                                  │
│  Trustee Actions                                               │
│  ─────────────────────────────────────────────────────────────  │
│  [Issue Provisional Approval] [Reject Provisionally]           │
│  [Schedule Interview] [View Full Application]                   │
│  [Send Message to Applicant]                                    │
└─────────────────────────────────────────────────────────────────┘
```

**Sections:**
1. **Applicant Information:** Key profile data
2. **Superintendent Review:** Recommendation, remarks, flags
3. **Key Documents:** Quick preview with download links
4. **Payment Status:** Transaction details and receipts
5. **Current Workflow Status:** Visual timeline
6. **Trustee Actions:** CTAs for next steps

---

#### 2.2.2 Interview Tab

**Purpose:** Schedule, reschedule, or evaluate interviews.

**Layout (If Interview Not Scheduled):**
```
┌─────────────────────────────────────────────────────────────────┐
│  Schedule Interview                                             │
│  ─────────────────────────────────────────────────────────────  │
│                                                                  │
│  Mode: ○ Online (Zoom/Google Meet)  ● Physical                 │
│                                                                  │
│  [Online Selected]                                               │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  Meeting Platform: [Google Meet ▼]                       │  │
│  │  Meeting Link: [https://meet.google.com/...]             │  │
│  │  [Generate New Link]                                     │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  [Physical Selected]                                             │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  Location: [Room 201, Boys Hostel Building]             │  │
│  │  [Select Room]                                          │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  Date & Time:                                                   │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  Date: [December 30, 2025 ▼]                             │  │
│  │  Time: [10:00 AM ▼]                                     │  │
│  │  Duration: [30 minutes ▼]                                │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  Notifications:                                                   │
│  ├─ ☑ Send interview invitation to applicant                    │
│  └─ ☑ Send auto-reminder 24 hours before                       │
│                                                                  │
│  Internal Notes:                                                │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  [Optional: Notes for trustees, not visible to applicant]│  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  [Schedule Interview] [Cancel]                                   │
└─────────────────────────────────────────────────────────────────┘
```

**Layout (If Interview Scheduled, Not Yet Conducted):**
```
┌─────────────────────────────────────────────────────────────────┐
│  Interview Scheduled                                            │
│  ─────────────────────────────────────────────────────────────  │
│                                                                  │
│  Scheduled For: December 30, 2025 at 10:00 AM                 │
│  Mode: Online (Google Meet)                                     │
│  Meeting Link: https://meet.google.com/abc-xyz-def              │
│                                                                  │
│  Applicant: Rahul Sharma (+91 98765 43210)                     │
│                                                                  │
│  Actions:                                                       │
│  ├─ [Join Interview] (Active when time arrives)                 │
│  ├─ [Reschedule Interview]                                      │
│  └─ [Cancel Interview]                                          │
│                                                                  │
│  Notification Status:                                            │
│  ├─ ✓ Invitation sent to applicant on December 28, 2025          │
│  └─ ⏳ Auto-reminder scheduled for December 29, 2025 at 10:00 AM│
│                                                                  │
│  Internal Notes: [Schedule by Trustee John Doe]                  │
└─────────────────────────────────────────────────────────────────┘
```

**Layout (If Interview Completed):**
```
┌─────────────────────────────────────────────────────────────────┐
│  Interview Evaluation                                           │
│  ─────────────────────────────────────────────────────────────  │
│                                                                  │
│  Conducted On: December 30, 2025 at 10:00 AM                   │
│  Mode: Online (Google Meet)                                     │
│  Conducted By: [Trustee Name]                                  │
│                                                                  │
│  Evaluation Criteria                                            │
│  ─────────────────────────────────────────────────────────────  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  Academic Background:  ⭑⭑⭑⭑⭒ (4/5)                   │  │
│  │  Communication Skills: ⭑⭑⭑⭑⭑ (5/5)                  │  │
│  │  Discipline & Conduct:  ⭑⭑⭑⭑⭒ (4/5)                │  │
│  │  Motivation & Fit:      ⭑⭑⭑⭑⭑ (5/5)                  │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  Overall Score: 18/20 (Excellent)                                │
│                                                                  │
│  Interview Remarks (INTERNAL - NOT VISIBLE TO APPLICANT)         │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  Candidate demonstrated strong academic foundation and   │  │
│  │  excellent communication skills. Showed genuine interest  │  │
│  │  in joining the hostel and understanding of rules.       │  │
│  │  Recommended for final approval.                          │  │
│  │                                                           │  │
│  │  Areas of Strength:                                       │  │
│  │  • Academic performance (85% in graduation)             │  │
│  │  • Clear communication, respectful demeanor              │  │
│  │  • Well-prepared with all documents                     │  │
│  │                                                           │  │
│  │  Observations:                                            │  │
│  │  • Parent support is strong (confirmed during call)       │  │
│  │  • Financial stability verified                           │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  Final Decision Recommendation                                   │
│  ─────────────────────────────────────────────────────────────  │
│  ● Approve     ○ Reject     ○ Deferred                         │
│                                                                  │
│  [Proceed to Final Decision] [Save Evaluation Only]              │
└─────────────────────────────────────────────────────────────────┘
```

---

#### 2.2.3 Decision Tab

**Purpose:** Issue provisional or final approval/rejection decisions.

**Layout (Provisional Decision - Before Interview):**
```
┌─────────────────────────────────────────────────────────────────┐
│  Issue Provisional Decision                                     │
│  ─────────────────────────────────────────────────────────────  │
│                                                                  │
│  Application Summary:                                           │
│  APP-2024-001 - Rahul Sharma (Boys Hostel)                     │
│  Superintendent Recommendation: Approve                          │
│                                                                  │
│  Decision Type:                                                 │
│  ○ Provisionally Approve (Schedule Interview Required)           │
│  ○ Provisionally Approve (No Interview Required)                  │
│  ○ Reject Provisionally                                          │
│                                                                  │
│  [Provisionally Approve Selected]                                │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  Implications:                                          │  │
│  │  • Applicant will be notified of provisional approval   │  │
│  │  • If interview required, schedule via Interview tab     │  │
│  │  • Final decision pending interview evaluation          │  │
│  │  • No student account created yet                       │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  Decision Remarks (Internal):                                    │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  Explain rationale for decision (will be logged in audit) │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  Notifications:                                                   │
│  ├─ ☑ Notify applicant of provisional approval                  │
│  ├─ ☑ Notify superintendent                                     │
│  └─ ☑ Send SMS/Email confirmation                              │
│                                                                  │
│  [Issue Provisional Decision] [Cancel]                           │
└─────────────────────────────────────────────────────────────────┘
```

**Layout (Reject Provisionally):**
```
┌─────────────────────────────────────────────────────────────────┐
│  Reject Application (Provisional)                                │
│  ─────────────────────────────────────────────────────────────  │
│                                                                  │
│  ⚠️  WARNING: This action will reject the application without   │
│              scheduling an interview.                             │
│                                                                  │
│  Application Summary:                                            │
│  APP-2024-001 - Rahul Sharma (Boys Hostel)                      │
│                                                                  │
│  Rejection Reason (Required):                                    │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  ○ Incomplete Documents                                  │  │
│  │  ○ Does Not Meet Eligibility Criteria                  │  │
│  │  ○ Insufficient Academic Performance                    │  │
│  │  ○ Disciplinary Concerns                               │  │
│  │  ○ Capacity Constraints                               │  │
│  │  ○ Other (specify below)                               │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  Additional Remarks (Internal):                                   │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  Provide detailed explanation for rejection decision...   │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  Applicant Communication:                                        │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  Message to Applicant (will be sent via SMS/Email):       │  │
│  │  [Editable template with rejection reason]               │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  Implications:                                                   │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  • Applicant will be notified of rejection               │  │
│  │  • Application will be archived after 1 year              │  │
│  │  • No student account created                            │  │
│  │  • Payment will be refunded (if applicable)              │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  [Confirm Rejection] [Cancel]                                    │
└─────────────────────────────────────────────────────────────────┘
```

**Layout (Final Decision - After Interview):**
```
┌─────────────────────────────────────────────────────────────────┐
│  Final Decision                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                  │
│  Application Summary:                                            │
│  APP-2024-001 - Rahul Sharma (Boys Hostel)                      │
│  Provisional Status: [Badge: Provisionally Approved]             │
│  Interview Status: [Badge: Completed - Score: 18/20]            │
│                                                                  │
│  Decision Type:                                                 │
│  ● Final Approve    ○ Final Reject                              │
│                                                                  │
│  [Final Approve Selected]                                       │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  Implications of Final Approval:                        │  │
│  │  ✓ Student account will be created automatically         │  │
│  │  ✓ Login credentials sent via Email/SMS to student      │  │
│  │  ✓ Room allocation can proceed (assign to Accounts)     │  │
│  │  ✓ Admission packet PDF generated and stored            │  │
│  │  ✓ Applicant notified of approval                       │  │
│  │  ✓ Superintendent notified                              │  │
│  │                                                           │  │
│  │  Workflow:                                              │  │
│  │  Final Approval → Student Login → Room Allocation →     │  │
│  │  Check-in → Active Resident                              │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  Decision Remarks (Internal):                                    │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  Final approval based on positive interview evaluation.  │  │
│  │  Candidate meets all criteria and recommended for         │  │
│  │  admission.                                              │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  Applicant Communication:                                        │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  Approval message (editable template):                   │  │
│  │  "Congratulations! Your application has been approved.   │  │
│  │   Login credentials will be sent to your registered email."│  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  [Issue Final Approval] [Cancel]                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Layout (Final Reject - After Interview):**
```
┌─────────────────────────────────────────────────────────────────┐
│  Final Rejection                                                │
│  ─────────────────────────────────────────────────────────────  │
│                                                                  │
│  Application Summary:                                            │
│  APP-2024-001 - Rahul Sharma (Boys Hostel)                      │
│  Provisional Status: [Badge: Provisionally Approved]             │
│  Interview Status: [Badge: Completed - Score: 12/20]            │
│                                                                  │
│  ⚠️  WARNING: This will permanently reject the application.       │
│              This action is irreversible.                         │
│                                                                  │
│  Rejection Reason (Required):                                    │
│  ○ Interview Performance Below Threshold                          │
│  ○ Behavioral Concerns Observed                                  │
│  ○ Inconsistent with Superintendent Recommendation               │
│  ○ Capacity/Resource Constraints                                │
│  ○ Other (specify)                                              │
│                                                                  │
│  Decision Remarks (Internal):                                    │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  Despite provisional approval, interview revealed concerns  │  │
│  │  about candidate's fit for hostel environment. Score of   │  │
│  │  12/20 below required threshold of 15/20.                │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  Applicant Communication:                                        │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  Rejection message (editable template):                   │  │
│  │  "Thank you for participating in the interview. After      │  │
│  │   careful consideration, we regret to inform you that...  │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  Implications:                                                   │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  • Applicant will be notified of final rejection         │  │
│  │  • Application moved to REJECTED status                   │  │
│  │  • No student account created                            │  │
│  │  • Payment refunded (if applicable)                     │  │
│  │  • Application archived after 1 year (DPDP compliance)  │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  [Confirm Final Rejection] [Cancel]                               │
└─────────────────────────────────────────────────────────────────┘
```

---

#### 2.2.4 Audit Tab

**Purpose:** View complete audit trail for the application.

**Layout:**
```
┌─────────────────────────────────────────────────────────────────┐
│  Audit Trail                                                    │
│  ─────────────────────────────────────────────────────────────  │
│                                                                  │
│  Application ID: APP-2024-001                                   │
│  Current Status: Provisionally Approved                         │
│                                                                  │
│  Timeline (Chronological):                                       │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  Dec 20, 2024 - 10:30 AM                                │  │
│  │  Event: Application Submitted                             │  │
│  │  By: Applicant (Rahul Sharma)                             │  │
│  │  Details: Initial application with all documents          │  │
│  │  Audit ID: AUD-001                                       │  │
│  ├────────────────────────────────────────────────────────────┤  │
│  │  Dec 21, 2024 - 2:15 PM                                 │  │
│  │  Event: Payment Verified                                  │  │
│  │  By: System (Automatic)                                  │  │
│  │  Details: Processing fee of ₹5,000 received              │  │
│  │  Receipt: #REC-2024-0892                                 │  │
│  │  Audit ID: AUD-002                                       │  │
│  ├────────────────────────────────────────────────────────────┤  │
│  │  Dec 22, 2024 - 4:00 PM                                 │  │
│  │  Event: Application Under Review                           │  │
│  │  By: Superintendent (Boys Hostel)                          │  │
│  │  Details: Documents verified, eligibility confirmed        │  │
│  │  Audit ID: AUD-003                                       │  │
│  ├────────────────────────────────────────────────────────────┤  │
│  │  Dec 22, 2024 - 4:30 PM                                 │  │
│  │  Event: Forwarded to Trustees                            │  │
│  │  By: Superintendent (Boys Hostel)                          │  │
│  │  Details: Recommendation: Approve. Flags: High Priority   │  │
│  │  Remarks: Candidate meets all criteria                   │  │
│  │  Audit ID: AUD-004                                       │  │
│  ├────────────────────────────────────────────────────────────┤  │
│  │  Dec 28, 2024 - 10:00 AM                                │  │
│  │  Event: Provisional Approval Issued                        │  │
│  │  By: Trustee (John Doe)                                  │  │
│  │  Details: Interview scheduled for Dec 30, 2025           │  │
│  │  Remarks: Interview recommended for final assessment      │  │
│  │  Audit ID: AUD-005                                       │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  Export Options:                                                │
│  [Export to PDF] [Export to CSV] [Print Audit Trail]             │
└─────────────────────────────────────────────────────────────────┘
```

---

### 2.3 Interview Management Tab

**Purpose:** Central hub for managing all interviews across all verticals.

#### 2.3.1 Interview Calendar View (Default)

**Layout:**
```
┌─────────────────────────────────────────────────────────────────┐
│  Interview Calendar                                            │
│  ─────────────────────────────────────────────────────────────  │
│                                                                  │
│  Controls: [◀ Previous] [December 2025] [Next ▶]                 │
│  [Today] [Week] [Month] [Agenda]                                │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  Calendar View (Month grid with interview indicators)   │  │
│  │                                                           │  │
│  │  Dec 2025                                                 │  │
│  │  ┌─────┬─────┬─────┬─────┬─────┬─────┬─────┐            │  │
│  │  │  S  │  M  │  T  │  W  │  T  │  F  │  S  │            │  │
│  │  ├─────┼─────┼─────┼─────┼─────┼─────┼─────┤            │  │
│  │  │  1  │  2  │  3  │  4  │  5  │  6  │  7  │            │  │
│  │  │     │  1  │     │     │     │     │     │            │  │
│  │  ├─────┼─────┼─────┼─────┼─────┼─────┼─────┤            │  │
│  │  │  8  │  9  │ 10  │ 11  │ 12  │ 13  │ 14  │            │  │
│  │  │     │     │  2  │     │     │     │     │            │  │
│  │  ├─────┼─────┼─────┼─────┼─────┼─────┼─────┤            │  │
│  │  │ 15  │ 16  │ 17  │ 18  │ 19  │ 20  │ 21  │            │  │
│  │  │     │     │     │  1  │     │     │     │            │  │
│  │  ├─────┼─────┼─────┼─────┼─────┼─────┼─────┤            │  │
│  │  │ 22  │ 23  │ 24  │ 25  │ 26  │ 27  │ 28  │            │  │
│  │  │     │     │     │     │     │     │  1  │            │  │
│  │  └─────┴─────┴─────┴─────┴─────┴─────┴─────┘            │  │
│  │                                                           │  │
│  │  Legend: 🟡 Online | 🔵 Physical | ⏳ Pending           │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  Upcoming Interviews (Next 7 days):                              │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  Dec 28, 2025 - 10:00 AM                                 │  │
│  │  APP-2024-001 - Rahul Sharma (Boys)                       │  │
│  │  [View Details]                                            │  │
│  ├────────────────────────────────────────────────────────────┤  │
│  │  Dec 30, 2025 - 2:00 PM                                  │  │
│  │  APP-2024-005 - Priya Patel (Girls)                       │  │
│  │  [View Details]                                            │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Features:**
- Calendar view with interview indicators
- Filter by vertical
- Quick view of upcoming interviews
- Click to view/edit interview details

---

#### 2.3.2 Scheduled Interviews View

**Layout:**
```
Filters:
  ├─ Status: [All ▼] OR [Upcoming] OR [In Progress] OR [Completed Today]
  ├─ Mode: [All ▼] OR [Online] OR [Physical]
  └─ Vertical: [All Verticals ▼]

Interview List:
  ┌─────────────────────────────────────────────────────────────────┐
  │  🟡 Dec 28, 2025 - 10:00 AM                                  │
  │  APP-2024-001 - Rahul Sharma                                  │
  │  Vertical: Boys Hostel | Mode: Online (Google Meet)            │
  │  Status: ⏳ Upcoming                                          │
  │  [Join Interview] [Reschedule] [View Application]              │
  ├─────────────────────────────────────────────────────────────────┤
  │  🔵 Dec 30, 2025 - 2:00 PM                                   │
  │  APP-2024-005 - Priya Patel                                   │
  │  Vertical: Girls Ashram | Mode: Physical (Room 201)            │
  │  Status: ⏳ Upcoming                                          │
  │  [View Application] [Reschedule]                               │
  └─────────────────────────────────────────────────────────────────┘
```

---

#### 2.3.3 Evaluation Forms View

**Purpose:** Complete interview evaluations for scheduled interviews.

**Layout:**
```
Filters:
  ├─ Status: [Pending Evaluation] OR [Completed]
  └─ Vertical: [All Verticals ▼]

Interviews Requiring Evaluation:
  ┌─────────────────────────────────────────────────────────────────┐
  │  Dec 28, 2025 - 10:00 AM (COMPLETED)                        │
  │  APP-2024-001 - Rahul Sharma (Boys Hostel)                   │
  │  Interview conducted by: [Your Name]                          │
  │  Evaluation Status: [Badge: Pending]                          │
  │  [Complete Evaluation Now]                                    │
  ├─────────────────────────────────────────────────────────────────┤
  │  Dec 27, 2025 - 3:00 PM (COMPLETED)                          │
  │  APP-2024-003 - Amit Kumar (Dharamshala)                     │
  │  Interview conducted by: [Other Trustee Name]                  │
  │  Evaluation Status: [Badge: Completed]                        │
  │  [View Evaluation]                                           │
  └─────────────────────────────────────────────────────────────────┘
```

**Evaluation Form:**
```
┌─────────────────────────────────────────────────────────────────┐
│  Interview Evaluation Form                                      │
│  ─────────────────────────────────────────────────────────────  │
│                                                                  │
│  Application: APP-2024-001 - Rahul Sharma                       │
│  Interview Date: December 28, 2025 at 10:00 AM                  │
│  Interviewer: [Your Name]                                       │
│                                                                  │
│  Evaluation Criteria (Required):                                 │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  1. Academic Background & Performance                   │  │
│  │     [⭑⭑⭑⭑⭑] Slider (1-5)                             │  │
│  │     Comments: [Textarea - Optional]                       │  │
│  ├────────────────────────────────────────────────────────────┤  │
│  │  2. Communication Skills                                 │  │
│  │     [⭑⭑⭑⭑⭑] Slider (1-5)                             │  │
│  │     Comments: [Textarea - Optional]                       │  │
│  ├────────────────────────────────────────────────────────────┤  │
│  │  3. Discipline & Conduct                                 │  │
│  │     [⭑⭑⭑⭑⭑] Slider (1-5)                             │  │
│  │     Comments: [Textarea - Optional]                       │  │
│  ├────────────────────────────────────────────────────────────┤  │
│  │  4. Motivation & Fit for Hostel                          │  │
│  │     [⭑⭑⭑⭑⭑] Slider (1-5)                             │  │
│  │     Comments: [Textarea - Optional]                       │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  Overall Score: [Auto-calculated] / 20                            │
│                                                                  │
│  Overall Observations (Internal - NOT VISIBLE TO APPLICANT):      │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  [Detailed notes on candidate performance, observations,    │  │
│  │   concerns, and recommendations for decision]             │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  Recommendation:                                                 │
│  ● Final Approve    ○ Final Reject    ○ Deferred               │
│                                                                  │
│  [Save & Proceed to Final Decision] [Save Draft] [Cancel]         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

### 2.4 Approvals Tab

**Purpose:** Central hub for approval workflows across all applications.

#### 2.4.1 Provisional Approvals View

**Layout:**
```
Filters:
  ├─ Vertical: [All Verticals ▼]
  └─ Date Range: [From ▼] [To ▼]

Provisionally Approved Applications:
  ┌─────────────────────────────────────────────────────────────────┐
  │  APP-2024-001 - Rahul Sharma (Boys Hostel)                   │
  │  Provisional Approval: Dec 28, 2025 by Trustee John Doe      │
  │  Interview: Scheduled for Dec 30, 2025                        │
  │  [View Application] [Reschedule Interview]                      │
├─────────────────────────────────────────────────────────────────┤
│  APP-2024-003 - Amit Kumar (Dharamshala)                       │
│  Provisional Approval: Dec 27, 2025 by Trustee Jane Smith        │
│  Interview: Not Required                                         │
│  [View Application] [Issue Final Decision]                       │
└─────────────────────────────────────────────────────────────────┘
```

---

#### 2.4.2 Final Approvals View

**Layout:**
```
Filters:
  ├─ Vertical: [All Verticals ▼]
  ├─ Date Range: [From ▼] [To ▼]
  └─ Status: [All ▼] OR [Account Created] OR [Pending Account Creation]

Final Approvals:
  ┌─────────────────────────────────────────────────────────────────┐
  │  ✓ APP-2024-003 - Amit Kumar (Dharamshala)                  │
  │  Final Approval: Dec 28, 2025 by Trustee Jane Smith          │
  │  Student Account: [Badge: Created] | Login Sent via Email    │
  │  [View Application] [View Audit Trail]                        │
├─────────────────────────────────────────────────────────────────┤
│  ✓ APP-2024-007 - Suresh Verma (Boys Hostel)                   │
  │  Final Approval: Dec 27, 2025 by Trustee John Doe           │
  │  Student Account: [Badge: Pending]                          │
  │  [View Application] [Trigger Account Creation]                 │
└─────────────────────────────────────────────────────────────────┘
```

---

#### 2.4.3 Rejections View

**Layout:**
```
Filters:
  ├─ Vertical: [All Verticals ▼]
  ├─ Rejection Type: [All ▼] OR [Provisional] OR [Final]
  └─ Date Range: [From ▼] [To ▼]

Rejected Applications:
  ┌─────────────────────────────────────────────────────────────────┐
  │  ✗ APP-2024-004 - Sneha Reddy (Girls Ashram)                │
  │  Rejected: Dec 28, 2025 (Final)                             │
  │  Reason: Interview Performance Below Threshold               │
  │  Interview Score: 12/20 (Required: 15/20)                    │
  │  [View Application] [View Audit Trail]                        │
├─────────────────────────────────────────────────────────────────┤
│  ✗ APP-2024-006 - Vijay Singh (Boys Hostel)                   │
  │  Rejected: Dec 27, 2025 (Provisional)                       │
  │  Reason: Incomplete Documents                                 │
  │  [View Application] [View Audit Trail]                        │
└─────────────────────────────────────────────────────────────────┘
```

---

### 2.5 Audit & Reports Tab

**Purpose:** Comprehensive audit logs, decision history, and compliance reports.

#### 2.5.1 Approval History View

**Layout:**
```
Filters:
  ├─ Vertical: [All Verticals ▼]
  ├─ Date Range: [From ▼] [To ▼]
  ├─ Decision Type: [All ▼] OR [Provisional Approve] OR [Final Approve] OR [Reject]
  └─ Trustee: [All Trustees ▼]

Approval History Table:
  ┌─────────────────────────────────────────────────────────────────┐
  │  Date/Time     | Application      | Decision     | Trustee      │
  ├─────────────────────────────────────────────────────────────────┤
  │  Dec 28, 2025 | APP-2024-001     | Provisional  | John Doe     │
  │  10:00 AM      | Rahul Sharma     | Approve      |              │
  ├─────────────────────────────────────────────────────────────────┤
  │  Dec 27, 2025 | APP-2024-003     | Final        | Jane Smith   │
  │  2:30 PM      | Amit Kumar       | Approve      |              │
  └─────────────────────────────────────────────────────────────────┘
```

---

#### 2.5.2 Decision Logs View

**Layout:**
```
Filters:
  ├─ Vertical: [All Verticals ▼]
  ├─ Date Range: [From ▼] [To ▼]
  └─ Status: [All ▼] OR [Pending] OR [Completed]

Decision Log:
  ┌─────────────────────────────────────────────────────────────────┐
  │  Dec 28, 2025 - 10:00 AM                                    │
  │  Application: APP-2024-001 (Rahul Sharma - Boys Hostel)       │
  │  Decision: Provisional Approval                               │
  │  Trustee: John Doe                                           │
  │  Remarks: Interview recommended for final assessment          │
  │  Audit ID: AUD-005                                           │
│  ─────────────────────────────────────────────────────────────  │
│  Dec 27, 2025 - 2:30 PM                                       │
│  Application: APP-2024-003 (Amit Kumar - Dharamshala)         │
│  Decision: Final Approval                                       │
│  Trustee: Jane Smith                                           │
│  Remarks: Candidate meets all criteria                           │
│  Audit ID: AUD-004                                              │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. User Flow Diagrams

### 3.1 Review Forwarded Applications Flow

```
[Login as Trustee]
    ↓
[Dashboard] → Click [Applications Tab]
    ↓
[Applications View] → Default: Forwarded for Review
    ↓
[Filter/Search Applications]
    ├─ By Vertical (All/Boys/Girls/Dharamshala)
    ├─ By Status (Pending Provisional/Interview Scheduled/Awaiting Final)
    ├─ By Priority (High/Normal)
    └─ By Name or Tracking #
    ↓
[View Application List] → Click on Application Row
    ↓
[Application Detail Modal/Page]
    ├─ [Summary Tab] → View applicant info, superintendent review
    ├─ [Interview Tab] → Schedule or evaluate interview
    ├─ [Decision Tab] → Issue provisional or final decision
    └─ [Audit Tab] → View complete audit trail
    ↓
[Take Action]
    ├─ Issue Provisional Approval → [Notifications sent]
    ├─ Reject Provisionally → [Refund process triggered]
    ├─ Schedule Interview → [Calendar updated, notification sent]
    └─ View Documents → [Preview/download]
```

---

### 3.2 Schedule Interview Flow

```
[Applications] → Select Application
    ↓
[Application Detail] → Click [Interview Tab]
    ↓
[Check Interview Status]
    ├─ [Not Scheduled] → Proceed to Schedule
    └─ [Already Scheduled] → View/Reschedule/Cancel
    ↓
[Schedule Interview Form]
    ├─ Select Mode: [Online] OR [Physical]
    │   ├─ [Online] → Enter meeting platform, generate/link meeting URL
    │   └─ [Physical] → Select room/location
    ├─ Select Date & Time
    ├─ Set Duration
    ├─ Configure Notifications
    │   ├─ ☑ Send invitation now
    │   └─ ☑ Auto-reminder 24 hours before
    └─ Add Internal Notes (optional)
    ↓
[Confirm Schedule]
    ├─ [Schedule Interview] → Interview created, notifications sent
    └─ [Cancel] → Return to application detail
    ↓
[Interview Listed in]
    ├─ Applications → Interview Queue View
    ├─ Interview Management → Calendar View
    └─ Application Detail → Interview Tab
```

---

### 3.3 Conduct Interview Flow

```
[Interview Management] → Click [Scheduled Interviews]
    ↓
[Filter] → Select [Upcoming] → Find Interview
    ↓
[Click Interview] → View Interview Details
    ↓
[At Scheduled Time]
    ├─ [Online Interview] → Click [Join Interview]
    │   └─ Opens Google Meet/Zoom in new tab
    └─ [Physical Interview] → Proceed to room
    ↓
[After Interview]
    ├─ Return to Application Detail → [Interview Tab]
    └─ OR Go to [Interview Management] → [Evaluation Forms]
    ↓
[Complete Evaluation Form]
    ├─ Rate criteria (4 criteria, 1-5 scale each)
    ├─ Add comments for each criterion (optional)
    ├─ Calculate overall score
    ├─ Write overall observations (internal - NOT VISIBLE TO APPLICANT)
    ├─ Select recommendation: [Approve] OR [Reject] OR [Deferred]
    └─ Click [Save & Proceed to Final Decision]
    ↓
[Decision Tab Opens] → Issue Final Decision
```

---

### 3.4 Issue Provisional Decision Flow

```
[Applications] → Select Forwarded Application
    ↓
[Application Detail] → [Decision Tab]
    ↓
[Select Decision Type]
    ├─ ○ Provisionally Approve (Interview Required)
    ├─ ○ Provisionally Approve (No Interview Required)
    └─ ○ Reject Provisionally
    ↓
[Option A: Provisionally Approve (Interview Required)]
    ├─ Review implications
    ├─ Add decision remarks (internal)
    ├─ Configure notifications
    └─ Click [Issue Provisional Decision]
        └─ Application status → PROVISIONALLY_APPROVED
        └─ Interview tab becomes active
        └─ Notifications sent to applicant & superintendent
        └─ Audit log entry created

[Option B: Provisionally Approve (No Interview Required)]
    ├─ Review implications
    ├─ Add decision remarks (internal)
    ├─ Configure notifications
    └─ Click [Issue Provisional Decision]
        └─ Application status → PROVISIONALLY_APPROVED
        └─ Interview NOT required
        └─ Can proceed directly to final decision

[Option C: Reject Provisionally]
    ├─ Select rejection reason (required)
    ├─ Add detailed remarks (internal)
    ├─ Edit applicant message (optional)
    ├─ Review implications
    └─ Click [Confirm Rejection]
        └─ Application status → REJECTED
        └─ Refund process triggered
        └─ Notifications sent to applicant & superintendent
        └─ Application archived after 1 year (DPDP compliance)
```

---

### 3.5 Issue Final Decision Flow

```
[Prerequisite: Application has PROVISIONALLY_APPROVED status]
    ↓
[Applications] → Go to [Pending Final Decision View]
    OR [Application Detail] → [Decision Tab]
    ↓
[Review Application Summary]
    ├─ Applicant details
    ├─ Superintendent recommendation
    ├─ Provisional approval details
    └─ Interview evaluation (if conducted)
    ↓
[Select Final Decision]
    ├─ ● Final Approve
    └─ ○ Final Reject
    ↓
[Option A: Final Approve]
    ├─ Review implications
    │   ├─ ✓ Student account will be created
    │   ├─ ✓ Login credentials sent via Email/SMS
    │   ├─ ✓ Room allocation can proceed
    │   ├─ ✓ Admission packet PDF generated
    │   └─ ✓ Notifications sent to applicant & superintendent
    ├─ Add decision remarks (internal)
    ├─ Edit approval message (optional)
    └─ Click [Issue Final Approval]
        ├─ Application status → APPROVED
        ├─ Student user account created (Promotion Service)
        ├─ Credentials sent to applicant via Email/SMS
        ├─ Room allocation triggered (notify Accounts)
        ├─ Admission packet PDF generated & stored
        ├─ Notifications sent (applicant, superintendent, accounts)
        └─ Audit log entry created

[Option B: Final Reject]
    ├─ Review implications (WARNING: Irreversible)
    │   ├─ • Applicant notified of rejection
    │   ├─ • Application status → REJECTED
    │   ├─ • No student account created
    │   ├─ • Payment refunded
    │   └─ • Application archived after 1 year
    ├─ Select rejection reason (required)
    ├─ Add detailed remarks (internal)
    ├─ Edit rejection message (optional)
    └─ Click [Confirm Final Rejection]
        └─ Application status → REJECTED
        └─ Refund process triggered
        └─ Notifications sent
        └─ Application archived after 1 year
```

---

### 3.6 View Audit Trail Flow

```
[Applications] → Select Application
    ↓
[Application Detail] → Click [Audit Tab]
    ↓
[View Chronological Audit Trail]
    ├─ Application submission
    ├─ Payment verification
    ├─ Superintendent review & forwarding
    ├─ Trustee provisional decision
    ├─ Interview scheduling (if applicable)
    ├─ Interview evaluation (if applicable)
    ├─ Final decision
    └─ All status changes with timestamps and user identities
    ↓
[Export Options]
    ├─ [Export to PDF] → Downloadable audit report
    ├─ [Export to CSV] → Spreadsheet format for analysis
    └─ [Print Audit Trail] → Print-optimized view
```

---

### 3.7 Bulk Approvals Flow

```
[Approvals] → [Final Approvals View]
    ↓
[Filter Applications] → Select Multiple Applications
    ├─ ☑ Check boxes for applications to approve
    └─ OR ☑ Select All (with filters)
    ↓
[Quick Actions Bar] → Click [Approve Selected]
    ↓
[Bulk Approval Modal]
    ├─ Shows list of selected applications
    ├─ Apply common remarks (optional)
    ├─ Configure notifications
    └─ Review implications
    ↓
[Confirm Bulk Approval]
    └─ All selected applications → APPROVED status
    └─ Student accounts created for all
    └─ Notifications sent in batch
    └─ Audit log entries created for each
```

---

## 4. Dependencies and Workflows

### 4.1 Superintendent → Trustee Workflow

```
[Superintendent Dashboard]
    ↓
[Review Application]
    ├─ Verify documents
    ├─ Check eligibility
    └─ Add flags (if any)
    ↓
[Forward to Trustees]
    ├─ Provide recommendation (Recommend/Not Recommend)
    ├─ Add remarks for trustees
    └─ Set priority (if applicable)
    ↓
[Application Status] → FORWARDED
    ↓
[Visible in Trustee Dashboard]
    └─ Appears in [Applications] → [Forwarded for Review] view
```

---

### 4.2 Trustee → Accounts Workflow (Final Approval)

```
[Trustee Issues Final Approval]
    ↓
[Application Status] → APPROVED
    ↓
[Promotion Service Triggered]
    ├─ Create student user account
    ├─ Generate login credentials
    └─ Send credentials via Email/SMS to student
    ↓
[Notify Accounts Team]
    ├─ Application ready for room allocation
    ├─ Payment received
    └─ Proceed to check-in workflow
    ↓
[Accounts Dashboard]
    └─ Application appears in [Room Allocation] queue
```

---

### 4.3 Communication Workflow

```
[Trigger Event: Trustee Action]
    ├─ Provisional Approval → Notify applicant & superintendent
    ├─ Interview Scheduled → Notify applicant (invitation + reminder)
    ├─ Interview Completed → Notify superintendent
    ├─ Final Approval → Notify applicant, superintendent, accounts
    └─ Final Rejection → Notify applicant & superintendent
    ↓
[Message Template Selection]
    ├─ Use predefined template based on action type
    ├─ Editable by trustee (if required)
    └─ Supports variables: {{applicant_name}}, {{tracking_number}}, etc.
    ↓
[Notification Delivery]
    ├─ SMS (via BullMQ queue)
    ├─ WhatsApp (via BullMQ queue)
    └─ Email (via BullMQ queue)
    ↓
[Communication Log]
    ├─ Logged in audit trail
    ├─ Visible in [Audit Tab]
    └─ Exportable for compliance
```

---

## 5. State Management

### 5.1 Application States (Trustee Perspective)

| State | Description | Trustee Actions Available |
|-------|-------------|--------------------------|
| `FORWARDED` | Application sent by superintendent | Review, Issue Provisional Decision |
| `PROVISIONALLY_APPROVED` | Interview required | Schedule Interview, Reschedule, Cancel Interview |
| `INTERVIEW_SCHEDULED` | Interview set up | Join/Reschedule/Cancel, View Application |
| `INTERVIEW_COMPLETED` | Evaluation completed | Issue Final Decision |
| `APPROVED` | Final approval issued | View Only (read access) |
| `REJECTED` | Rejected (provisional or final) | View Only (read access) |

---

### 5.2 Interview States

| State | Description | Trustee Actions Available |
|-------|-------------|--------------------------|
| `NOT_SCHEDULED` | No interview set | Schedule Interview |
| `SCHEDULED` | Interview set up | Reschedule, Cancel, View Details |
| `IN_PROGRESS` | Interview in progress | Complete Evaluation |
| `COMPLETED` | Interview finished | View Evaluation, Issue Final Decision |
| `MISSED` | Applicant didn't attend | Reschedule or Cancel |

---

## 6. Data Requirements

### 6.1 Application Data (Trustee View)

```typescript
interface TrusteeApplication {
  id: string;
  trackingNumber: string;
  applicantName: string;
  vertical: 'BOYS' | 'GIRLS' | 'DHARAMSHALA';
  status: 'FORWARDED' | 'PROVISIONALLY_APPROVED' | 'INTERVIEW_SCHEDULED' |
          'INTERVIEW_COMPLETED' | 'APPROVED' | 'REJECTED';
  applicationDate: string;
  paymentStatus: 'PAID' | 'PENDING' | 'REFUNDED';

  // Superintendent Review
  forwardedBy: {
    superintendentId: string;
    superintendentName: string;
    forwardedOn: string;
    recommendation: 'RECOMMEND' | 'NOT_RECOMMEND' | 'NEUTRAL';
    remarks: string;
  };

  // Flags
  flags: string[];

  // Interview
  interview?: {
    scheduledBy: string;
    scheduledOn: string;
    interviewDate: string;
    interviewTime: string;
    mode: 'ONLINE' | 'PHYSICAL';
    meetingPlatform?: string;
    meetingLink?: string;
    location?: string;
    autoReminder: boolean;
    status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'MISSED';
    evaluation?: {
      conductedBy: string;
      conductedOn: string;
      scores: {
        academicBackground: number;
        communicationSkills: number;
        discipline: number;
        motivation: number;
      };
      overallScore: number;
      observations: string;
      recommendation: 'APPROVE' | 'REJECT' | 'DEFERRED';
    };
  };

  // Documents
  documents: Array<{
    type: string;
    fileName: string;
    uploadDate: string;
    verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
    downloadUrl: string;
  }>;

  // Audit Trail
  auditLogs: Array<{
    id: string;
    timestamp: string;
    event: string;
    userId: string;
    userName: string;
    details: string;
  }>;
}
```

---

### 6.2 Interview Data

```typescript
interface Interview {
  id: string;
  applicationId: string;
  applicantName: string;
  vertical: 'BOYS' | 'GIRLS' | 'DHARAMSHALA';

  // Scheduling
  scheduledBy: string;
  scheduledOn: string;
  interviewDate: string;
  interviewTime: string;
  duration: number; // minutes
  mode: 'ONLINE' | 'PHYSICAL';
  meetingPlatform?: 'ZOOM' | 'GOOGLE_MEET';
  meetingLink?: string;
  location?: string;

  // Notifications
  invitationSent: boolean;
  reminderScheduled: boolean;
  reminderSent: boolean;

  // Status
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'MISSED' | 'CANCELLED';

  // Evaluation
  evaluation?: {
    conductedBy: string;
    conductedOn: string;
    criteria: {
      academicBackground: {
        score: number; // 1-5
        comments: string;
      };
      communicationSkills: {
        score: number;
        comments: string;
      };
      discipline: {
        score: number;
        comments: string;
      };
      motivation: {
        score: number;
        comments: string;
      };
    };
    overallScore: number;
    overallObservations: string;
    recommendation: 'APPROVE' | 'REJECT' | 'DEFERRED';
  };

  // Internal Notes
  internalNotes: string;
}
```

---

## 7. User Interface Components

### 7.1 Trustee-Specific Components

#### Vertical Selector
```typescript
interface VerticalSelectorProps {
  value: 'ALL' | 'BOYS' | 'GIRLS' | 'DHARAMSHALA';
  onChange: (vertical: 'ALL' | 'BOYS' | 'GIRLS' | 'DHARAMSHALA') => void;
}

<VerticalSelector value="ALL" onChange={handleVerticalChange} />
```

#### Interview Scheduler Modal
```typescript
interface InterviewSchedulerProps {
  applicationId: string;
  applicantName: string;
  onSchedule: (interviewData: InterviewScheduleData) => void;
  onCancel: () => void;
}

<InterviewScheduler
  applicationId="APP-2024-001"
  applicantName="Rahul Sharma"
  onSchedule={handleSchedule}
  onCancel={handleCancel}
/>
```

#### Evaluation Form
```typescript
interface EvaluationFormProps {
  interviewId: string;
  applicantName: string;
  onSubmit: (evaluation: InterviewEvaluation) => void;
  onCancel: () => void;
}

<EvaluationForm
  interviewId="INT-001"
  applicantName="Rahul Sharma"
  onSubmit={handleSubmit}
  onCancel={handleCancel}
/>
```

#### Decision Modal (Provisional/Final)
```typescript
interface DecisionModalProps {
  applicationId: string;
  decisionType: 'PROVISIONAL' | 'FINAL';
  onConfirm: (decision: DecisionData) => void;
  onCancel: () => void;
}

<DecisionModal
  applicationId="APP-2024-001"
  decisionType="FINAL"
  onConfirm={handleConfirm}
  onCancel={handleCancel}
/>
```

#### Audit Trail Timeline
```typescript
interface AuditTrailProps {
  applicationId: string;
  logs: AuditLog[];
  onExport: (format: 'PDF' | 'CSV') => void;
}

<AuditTrail
  applicationId="APP-2024-001"
  logs={auditLogs}
  onExport={handleExport}
/>
```

---

## 8. Testing Requirements for IA Validation

### 8.1 Information Architecture Tests

1. **Navigation Tests**
   - [ ] Trustee can navigate between all main tabs (Applications, Interviews, Approvals, Audit)
   - [ ] Breadcrumbs correctly display navigation path
   - [ ] Back buttons return to previous view
   - [ ] Vertical selector updates content across all views

2. **Screen Display Tests**
   - [ ] Application detail screen shows all required sections (Summary, Interview, Decision, Audit)
   - [ ] Forwarded applications view displays correct filters and columns
   - [ ] Interview queue view groups interviews by date
   - [ ] Evaluation form displays all 4 criteria with sliders and comment fields

3. **State Transition Tests**
   - [ ] Application status changes correctly from FORWARDED → PROVISIONALLY_APPROVED
   - [ ] Interview status transitions: NOT_SCHEDULED → SCHEDULED → IN_PROGRESS → COMPLETED
   - [ ] Provisional approval enables Interview tab
   - [ ] Interview completion enables Final Decision tab

4. **Data Visibility Tests**
   - [ ] Internal remarks are NOT visible in student view
   - [ ] Audit trail is visible to trustees but not students
   - [ ] Superintendent remarks are visible to trustees
   - [ ] Evaluation scores and observations are trustee-only

---

### 8.2 User Flow Tests

1. **Review Forwarded Applications**
   - [ ] Can view list of forwarded applications
   - [ ] Filters work correctly (vertical, status, priority)
   - [ ] Search by name/tracking number works
   - [ ] Can open application detail
   - [ ] Can view superintendent remarks and recommendations

2. **Schedule Interview**
   - [ ] Can access interview scheduling form
   - [ ] Can select online mode and enter meeting link
   - [ ] Can select physical mode and select room
   - [ ] Can set date and time
   - [ ] Can configure auto-reminder
   - [ ] Schedule saves and notifications are sent
   - [ ] Interview appears in calendar view

3. **Conduct Interview**
   - [ ] Can join online interview (opens meeting link)
   - [ ] Can access evaluation form after interview
   - [ ] Can rate each criterion (1-5 scale)
   - [ ] Can add comments for each criterion
   - [ ] Overall score calculates correctly
   - [ ] Can write overall observations
   - [ ] Can select recommendation (Approve/Reject/Defer)
   - [ ] Evaluation saves and Final Decision tab becomes active

4. **Issue Provisional Decision**
   - [ ] Can select provisional approval options
   - [ ] Can view implications before confirming
   - [ ] Can add decision remarks
   - [ ] Can configure notifications
   - [ ] Provisional approval updates application status
   - [ ] Notifications are sent to applicant and superintendent

5. **Issue Final Decision**
   - [ ] Can select final approve/reject
   - [ ] Can view implications (warning for rejection)
   - [ ] Can add decision remarks
   - [ ] Final approve creates student account
   - [ ] Login credentials are sent via Email/SMS
   - [ ] Final reject triggers refund process
   - [ ] Both options update application status and create audit entries

6. **View Audit Trail**
   - [ ] Can access audit tab
   - [ ] All events display chronologically
   - [ ] Each event shows timestamp, user, and details
   - [ ] Can export to PDF
   - [ ] Can export to CSV
   - [ ] Can print audit trail

---

## 9. Design Considerations

### 9.1 Internal Remarks Separation

**Critical Requirement:** Internal remarks (Superintendent remarks, Trustee interview observations, decision remarks) must NEVER be visible to students or applicants.

**Implementation:**
- Visual distinction: Internal sections labeled "INTERNAL - NOT VISIBLE TO APPLICANT"
- Data structure: Separate field from public communication
- API filtering: Ensure internal remarks not sent to student-facing endpoints
- Audit logging: All internal remarks logged for governance

---

### 9.2 Outcome Summary Card

**Purpose:** Student-facing summary that excludes internal remarks.

**Data Displayed:**
- Application status (Approved/Rejected)
- Decision date
- Next steps (login credentials, room allocation, etc.)
- Visible to: Student and Parents

**Data NOT Displayed:**
- Superintendent remarks
- Interview scores and observations
- Trustee decision rationale
- Internal notes

---

### 9.3 Cross-Vertical Access

**Trustee Privilege:** Can view and act on applications from all three verticals (Boys, Girls, Dharamshala).

**Implementation:**
- Vertical selector in header allows switching
- Default view: All Verticals
- Filters apply across all verticals unless specific vertical selected
- Audit trail shows vertical context for all actions

---

### 9.4 Audit-Ready Design

**Requirement:** Every state change must be logged with immutable audit trail.

**Audit Log Structure:**
```typescript
interface AuditLog {
  id: string;
  applicationId: string;
  timestamp: string;
  userId: string;
  userRole: 'SUPERINTENDENT' | 'TRUSTEE' | 'ACCOUNTS' | 'SYSTEM';
  userName: string;
  event: string;
  previousStatus?: string;
  newStatus?: string;
  remarks?: string;
  ipAddress: string;
  userAgent: string;
}
```

---

## 10. Integration Points

### 10.1 Superintendent Dashboard Integration

- **Event:** Superintendent forwards application
  - **Data:** Application ID, recommendation, remarks, flags
  - **Trustee Panel:** Application appears in "Forwarded for Review" view

- **Event:** Superintendent updates application status
  - **Data:** Application ID, new status, remarks
  - **Trustee Panel:** Application status updates in real-time

---

### 10.2 Notification System Integration

- **Event:** Provisional approval issued
  - **Channels:** SMS, WhatsApp, Email
  - **Recipients:** Applicant, Superintendent
  - **Template:** Provisional approval notification

- **Event:** Interview scheduled
  - **Channels:** SMS, WhatsApp, Email
  - **Recipients:** Applicant
  - **Template:** Interview invitation
  - **Reminder:** Auto-reminder 24 hours before

- **Event:** Interview completed
  - **Channels:** SMS, WhatsApp, Email
  - **Recipients:** Superintendent
  - **Template:** Interview completion notification

- **Event:** Final approval issued
  - **Channels:** SMS, WhatsApp, Email
  - **Recipients:** Applicant, Superintendent, Accounts
  - **Template:** Final approval notification

- **Event:** Final rejection issued
  - **Channels:** SMS, WhatsApp, Email
  - **Recipients:** Applicant, Superintendent
  - **Template:** Rejection notification

---

### 10.3 Accounts Dashboard Integration

- **Event:** Final approval issued
  - **Data:** Application ID, student details, approval date
  - **Accounts Panel:** Application appears in "Room Allocation" queue
  - **Promotion Service:** Create student user account, generate credentials

---

### 10.4 Student Dashboard Integration

- **Event:** Final approval issued
  - **Data:** Student account created, credentials sent
  - **Student Panel:** Student can login, view dashboard

- **Event:** Outcome summary generated
  - **Data:** Status, decision date, next steps (NO internal remarks)
  - **Student Panel:** Display outcome summary card

---

## 11. Success Criteria

### 11.1 Information Architecture

- [ ] All trustee workflows mapped and documented
- [ ] Screen-by-screen IA defined with layouts and data requirements
- [ ] User flows cover all trustee actions
- [ ] Dependencies on superintendent workflows explicit
- [ ] Internal remarks separation clearly defined
- [ ] Audit logging requirements specified

---

### 11.2 User Experience

- [ ] Trustees can review forwarded applications efficiently
- [ ] Interview scheduling is clear and mobile-friendly
- [ ] Evaluation forms are intuitive with clear criteria
- [ ] Decision workflows have clear implications displayed
- [ ] Audit trail is comprehensive and easily accessible

---

### 11.3 Governance & Compliance

- [ ] Internal remarks are visually and structurally separated from student-facing content
- [ ] All state changes create immutable audit log entries
- [ ] Cross-vertical access is properly controlled
- [ ] Outcome summaries exclude internal remarks
- [ ] DPDP Act compliance for data retention (1-year archival for rejected applications)

---

## 12. Appendix: Terminology

| Term | Definition |
|------|------------|
| **Forwarded Application** | Application sent by superintendent requiring trustee review |
| **Provisional Approval** | Preliminary approval by trustee, may require interview |
| **Final Approval** | Permanent approval that triggers student account creation |
| **Provisional Rejection** | Rejection without interview (early in workflow) |
| **Final Rejection** | Rejection after interview or evaluation |
| **Internal Remarks** | Notes and observations visible ONLY to staff (not students/parents) |
| **Outcome Summary** | Student-facing summary of decision (excludes internal remarks) |
| **Interview Evaluation** | Scoring and observations from trustee-conducted interview |
| **Audit Trail** | Chronological log of all application events and state changes |
| **Cross-Vertical Access** | Ability to view and act on applications from Boys, Girls, and Dharamshala |

---

## Conclusion

This Information Architecture document provides a comprehensive blueprint for the Trustee Panel in the Jain Hostel Management Application. The IA covers all required screens, user flows, data structures, and integration points necessary for trustees to efficiently manage the approval workflow while maintaining institutional governance and DPDP Act compliance.

Key design principles incorporated:
1. **Cross-vertical access** for trustees
2. **Internal remarks separation** from student-facing content
3. **Audit-ready design** with immutable logging
4. **Clear workflow** with explicit dependencies on superintendent processes
5. **User-friendly interview management** with scheduling and evaluation capabilities
6. **Comprehensive decision workflows** with clear implications displayed

This IA will guide the UI/UX design and technical implementation of the Trustee Panel (Task 13.2) and interview management components (Task 13.3).
