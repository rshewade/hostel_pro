# Communication Touchpoints Mapping
**Task 14.1: Identify and Map Communication Touchpoints**
**Status:** In-Progress
**Last Updated:** December 28, 2024

## Executive Summary

This document maps all touchpoints in the Hostel Management Application where embedded communication UI (WhatsApp, SMS, Email) should be integrated. These touchpoints represent key moments in the user journey where staff need to send messages to applicants, students, parents, or other stakeholders.

---

## Touchpoint Categories

### 1. **Application Lifecycle Communications** (High Priority)
- Frequency: Daily
- Recipients: Applicants
- Urgency: High

#### Touchpoint 1.1: Interview Scheduling
**Location:** Superintendent Dashboard → Application Detail Modal → Schedule Interview Tab
**User:** Superintendent, Trustee
**Trigger:** When scheduling an interview for an applicant

**Context:**
- **Workflow:** Application Review → Interview Scheduling
- **Required Information:**
  - Applicant name, tracking number
  - Interview date and time
  - Interview mode (Online/Physical)
  - Meeting link or location
- **Message Preview Variables:** `{{name}}`, `{{date}}`, `{{time}}`, `{{mode}}`, `{{link}}`

**Communication Needs:**
- ✅ Send interview invitation via SMS/Email
- ✅ Send meeting link (if online)
- ✅ Auto-reminder 24 hours before interview
- ✅ Reschedule notification

**Templates:**
- SMS: "Your interview is scheduled on {{date}} at {{time}}. Mode: {{mode}}. {{link?}}"
- Email: Full invitation with calendar attachment

---

#### Touchpoint 1.2: Provisional Approval Notification
**Location:** Superintendent/Trustee Dashboard → Application Review → Provisional Approve Modal
**User:** Superintendent, Trustee
**Trigger:** When issuing provisional approval

**Context:**
- **Workflow:** Review → Provisional Decision → Notification
- **Required Information:**
  - Applicant name
  - Provisional approval status
  - Whether interview required
  - Next steps
- **Message Preview Variables:** `{{name}}`, `{{status}}`, `{{interview_required}}`, `{{next_steps}}`

**Communication Needs:**
- ✅ Notify applicant via SMS
- ✅ Send detailed email with provisional letter
- ✅ Notify superintendent (if trustee approved)

**Templates:**
- SMS: "Your application {{tracking_number}} has been provisionally approved. {{interview_required?}}"
- Email: Provisional approval letter PDF attached

---

#### Touchpoint 1.3: Selection/Final Approval Notification
**Location:** Trustee Dashboard → Application Detail → Final Approve Modal
**User:** Trustee
**Trigger:** Final approval of application

**Context:**
- **Workflow:** Interview Evaluation → Final Decision → Account Creation
- **Required Information:**
  - Applicant name
  - Approved vertical (Boys/Girls/Dharamshala)
  - Login credentials (or notification that they'll be sent)
  - Next steps for room allocation
- **Message Preview Variables:** `{{name}}`, `{{vertical}}`, `{{login_credentials?}}`, `{{next_steps}}`

**Communication Needs:**
- ✅ Send SMS with approval message
- ✅ Send email with login credentials
- ✅ Notify Accounts team for room allocation
- ✅ Notify Superintendent

**Templates:**
- SMS: "Congratulations! Your application is approved. Login credentials sent to your email."
- Email: Final approval letter + login credentials + welcome packet

---

#### Touchpoint 1.4: Rejection Notification
**Location:** Superintendent/Trustee Dashboard → Application Review → Reject Modal
**User:** Superintendent, Trustee
**Trigger:** Application rejection (provisional or final)

**Context:**
- **Workflow:** Review → Rejection Decision
- **Required Information:**
  - Applicant name
  - Rejection reason
  - Whether refund is pending
- **Message Preview Variables:** `{{name}}`, `{{reason}}`, `{{refund_status}}`

**Communication Needs:**
- ✅ Send rejection SMS
- ✅ Send detailed email with reason
- ✅ Refund confirmation

**Templates:**
- SMS: "Your application {{tracking_number}} has been rejected. Reason: {{reason}}. {{refund?}}"
- Email: Rejection letter with detailed explanation

---

### 2. **Payment & Fee Communications** (High Priority)
- Frequency: Multiple times per applicant
- Recipients: Applicants, Students, Parents
- Urgency: High

#### Touchpoint 2.1: Fee Reminder
**Location:** Student Dashboard → Fees Page (bulk reminder), Individual Fee Card
**User:** Accounts, Superintendent (if configured)
**Trigger:** Manual reminder send, or scheduled reminder before due date

**Context:**
- **Workflow:** Fee Management → Send Reminder
- **Required Information:**
  - Student/Applicant name
  - Fee item name (Processing Fee, Hostel Fees, etc.)
  - Outstanding amount
  - Due date
- **Message Preview Variables:** `{{name}}`, `{{fee_name}}`, `{{amount}}`, `{{due_date}}`

**Communication Needs:**
- ✅ Send SMS reminder
- ✅ Send email reminder
- ✅ Send to parent (if configured)
- ✅ Schedule reminder (3 days, 1 day before due date)

**Templates:**
- SMS: "Reminder: {{fee_name}} of ₹{{amount}} due on {{due_date}}. Pay now."
- Email: Detailed reminder with payment link

---

#### Touchpoint 2.2: Payment Confirmation
**Location:** Student Dashboard → Fees Page → After Payment
**User:** System (automated)
**Trigger:** Successful payment completion

**Context:**
- **Workflow:** Payment → Confirmation
- **Required Information:**
  - Student name
  - Fee item
  - Amount paid
  - Transaction ID
- **Message Preview Variables:** `{{name}}`, `{{fee_name}}`, `{{amount}}`, `{{transaction_id}}`

**Communication Needs:**
- ✅ Send SMS confirmation
- ✅ Send email with receipt
- ✅ Send to parent (if configured)

**Templates:**
- SMS: "Payment of ₹{{amount}} for {{fee_name}} successful. Receipt: {{transaction_id}}"
- Email: Receipt PDF attached

---

#### Touchpoint 2.3: Overdue Notification
**Location:** Student Dashboard → Fees Page (bulk action)
**User:** Accounts
**Trigger:** Fee becomes overdue (after due date)

**Context:**
- **Workflow:** Fee Overdue → Notification
- **Required Information:**
  - Student name
  - Fee item
  - Outstanding amount
  - Days overdue
- **Message Preview Variables:** `{{name}}`, `{{fee_name}}`, `{{amount}}`, `{{days_overdue}}`

**Communication Needs:**
- ✅ Send SMS urgent reminder
- ✅ Send email with overdue notice
- ✅ Send to parent
- ✅ Escalation to Superintendent if 7+ days overdue

**Templates:**
- SMS: "URGENT: {{fee_name}} payment is {{days_overdue}} days overdue. Amount: ₹{{amount}}"
- Email: Overdue notice with late fee information

---

### 3. **Leave Management Communications** (Medium Priority)
- Frequency: Daily (during semester)
- Recipients: Parents, Students
- Urgency: Medium

#### Touchpoint 3.1: Leave Application Notification
**Location:** Student Dashboard → Leave Page (Submit Leave)
**User:** System (automated) based on notification rules
**Trigger:** Student submits leave application

**Context:**
- **Workflow:** Leave Request → Parent Notification
- **Required Information:**
  - Student name
  - Leave type (Sick, Casual, etc.)
  - Start date, End date
  - Reason
- **Message Preview Variables:** `{{student_name}}`, `{{leave_type}}`, `{{start_date}}`, `{{end_date}}`, `{{reason}}`

**Communication Needs:**
- ✅ Notify parent via SMS/Email
- ✅ Notify via WhatsApp (if configured)
- ✅ Based on notification rules in Superintendent Dashboard

**Templates:**
- SMS: "Your child {{student_name}} has applied for {{leave_type}} from {{start_date}} to {{end_date}}."
- Email: Full leave request details

---

#### Touchpoint 3.2: Leave Approval/Rejection Notification
**Location:** Superintendent Dashboard → Leaves Tab → Review Leave
**User:** Superintendent
**Trigger:** Leave approval or rejection

**Context:**
- **Workflow:** Leave Review → Decision → Notification
- **Required Information:**
  - Student name
  - Leave dates
  - Decision (Approved/Rejected)
  - Remarks
- **Message Preview Variables:** `{{student_name}}`, `{{dates}}`, `{{decision}}`, `{{remarks}}`

**Communication Needs:**
- ✅ Notify parent of decision
- ✅ Notify student
- ✅ Send via multiple channels (SMS, WhatsApp, Email)

**Templates:**
- SMS: "Leave for {{student_name}} ({{dates}}) has been {{decision}}. {{remarks?}}"
- Email: Detailed approval/rejection letter

---

#### Touchpoint 3.3: Emergency Leave Notification
**Location:** Student Dashboard → Leave Page → Emergency Leave
**User:** Student (with verification), System
**Trigger:** Emergency leave submitted

**Context:**
- **Workflow:** Emergency Leave → Immediate Notification
- **Required Information:**
  - Student name
  - Emergency type
  - Departure details
- **Message Preview Variables:** `{{student_name}}`, `{{emergency_type}}`, `{{departure_details}}`

**Communication Needs:**
- ✅ IMMEDIATE notification to parent
- ✅ IMMEDIATE notification to Superintendent
- ✅ SMS and WhatsApp simultaneously
- ✅ High priority flag

**Templates:**
- SMS: "EMERGENCY: {{student_name}} - {{emergency_type}}. {{departure_details}}"
- WhatsApp: Full details with attachments

---

### 4. **Renewal Communications** (Medium Priority)
- Frequency: Every 6 months
- Recipients: Students, Parents
- Urgency: Medium

#### Touchpoint 4.1: Renewal Reminder
**Location:** Student Dashboard → Renewal Section
**User:** System (scheduled), Accounts (manual)
**Trigger:** 30 days, 15 days, 7 days before renewal deadline

**Context:**
- **Workflow:** Renewal Cycle → Reminder
- **Required Information:**
  - Student name
  - Renewal period
  - Due date
  - Outstanding fees
- **Message Preview Variables:** `{{name}}`, `{{renewal_period}}`, `{{due_date}}`, `{{outstanding_fees}}`

**Communication Needs:**
- ✅ Send reminder via SMS/Email
- ✅ Send to parent
- ✅ Multiple reminders (30, 15, 7 days before)
- ✅ Include payment link

**Templates:**
- SMS: "Renewal for {{renewal_period}} due on {{due_date}}. Outstanding: ₹{{outstanding_fees}}"
- Email: Renewal notice with payment instructions

---

#### Touchpoint 4.2: Renewal Confirmation
**Location:** Student Dashboard → Renewal Section → After Renewal
**User:** System (automated)
**Trigger:**
- Successful renewal payment
- Successful consent signing

**Context:**
- **Workflow:** Renewal → Confirmation
- **Required Information:**
  - Student name
  - New renewal period
  - Valid until date
- **Message Preview Variables:** `{{name}}`, `{{renewal_period}}`, `{{valid_until}}`

**Communication Needs:**
- ✅ Send SMS confirmation
- ✅ Send email with updated consent document
- ✅ Send to parent

**Templates:**
- SMS: "Renewal successful. Valid until: {{valid_until}}"
- Email: Confirmation with updated consent PDF

---

### 5. **Exit & Alumni Communications** (Low Priority)
- Frequency: Per student (at exit)
- Recipients: Students, Alumni
- Urgency: Low

#### Touchpoint 5.1: Exit Notification
**Location:** Student Dashboard → Exit Section → Initiate Exit
**User:** Student, Superintendent
**Trigger:** Exit process initiated

**Context:**
- **Workflow:** Exit Request → Final Clearance → Notification
- **Required Information:**
  - Student name
  - Exit date
  - Refund amount (if any)
  - Clearance status
- **Message Preview Variables:** `{{name}}`, `{{exit_date}}`, `{{refund_amount?}}`, `{{clearance_status}}`

**Communication Needs:**
- ✅ Notify parent
- ✅ Send exit confirmation
- ✅ Send refund details

**Templates:**
- SMS: "Exit process initiated for {{name}}. Refund: ₹{{refund_amount?}}"
- Email: Exit clearance letter

---

#### Touchpoint 5.2: Alumni Notifications (Future)
**Location:** Alumni Portal (not yet implemented)
**User:** System (scheduled)
**Trigger:** Events, reunions, opportunities

**Context:**
- **Workflow:** Alumni Management → Communications
- **Required Information:**
  - Alumni name
  - Event details
  - Registration link
- **Message Preview Variables:** `{{name}}`, `{{event_name}}`, `{{date}}`, `{{link}}`

**Communication Needs:**
- ✅ Send event invitations
- ✅ Send newsletter
- ✅ Send networking opportunities

**Templates:**
- SMS: "Alumni event: {{event_name}} on {{date}}. Register: {{link}}"
- Email: Full event details

---

## Communication UI Patterns

### Pattern A: Send Message Button (Inline)
**Where:** Application tables, individual record pages
**When:** Quick, one-off communication
**Components:**
- Button with message icon
- Opens side panel modal
- Channel toggles (SMS/Email/WhatsApp)
- Template dropdown
- Recipient auto-selected
- Message preview with placeholders

**Example Locations:**
- Superintendent Dashboard → Applications Table → Actions column (line 1164)
- Trustee Dashboard → Application Detail → Send Message button (line 10558)

---

### Pattern B: Communication Panel (Side Modal)
**Where:** Detailed review screens
**When:** Context-rich communication
**Components:**
- Recipient selection (auto-populated)
- Channel toggles (SMS/WhatsApp/Email)
- Template dropdown with editable message
- Message preview with dynamic variables
- Scheduling UI (date/time picker, preset options)
- Escalation button (notify supervisor)
- Logging indicator ("Message will be logged")

**Example Locations:**
- Application Detail Modal → Send Message button (side panel)
- Leave Review Modal → Notify Parent (side panel)

---

### Pattern C: Scheduled Communication
**Where:** Fee reminders, renewal reminders
**When:** Pre-configured or scheduled communications
**Components:**
- Schedule calendar
- Preset options (3 days before, 1 day before)
- Recipient list
- Template selection
- Preview of scheduled messages

**Example Locations:**
- Fees Page → Bulk Reminder → Schedule
- Student Dashboard → Renewal Section → Schedule Reminders

---

### Pattern D: Escalation Communication
**Where:** Urgent or high-priority situations
**When:** Immediate notification needed to supervisors
**Components:**
- Priority indicator (High/Medium/Low)
- Escalation recipient selection
- Context summary field
- Auto-include original message
- Confirm before send

**Example Locations:**
- Overdue fees → Escalate to Superintendent
- Emergency leave → Escalate to Superintendent + Accounts

---

## Context Summary Requirements

To prevent "wrong recipient" errors, the embedded communication UI MUST display context summary before sending:

### Mandatory Context Fields:
1. **Recipient Identity:**
   - Name
   - Role (Applicant/Student/Parent)
   - Vertical (Boys/Girls/Dharamshala)

2. **Application/Record Context:**
   - Tracking Number (for applicants)
   - Student ID (for residents)
   - Current Status

3. **Communication Purpose:**
   - Type (Interview/Approval/Rejection/Reminder)
   - Related action (e.g., "Interview Scheduled on Dec 30, 2024")

4. **Safety Check:**
   - Cross-vertical warning (if applicable)
   - Duplicate notification check
   - Preview of message with placeholders replaced

---

## Priority Matrix

| Touchpoint | Priority | Frequency | Urgency | Complexity |
|------------|----------|-----------|---------|------------|
| 1.1 Interview Scheduling | 🔴 High | Daily | High | Medium |
| 1.2 Provisional Approval | 🔴 High | Daily | High | Medium |
| 1.3 Final Approval | 🔴 High | Daily | High | Low |
| 1.4 Rejection | 🔴 High | Daily | High | Low |
| 2.1 Fee Reminder | 🔴 High | Weekly | High | Medium |
| 2.2 Payment Confirmation | 🔴 High | Multiple/day | High | Low |
| 2.3 Overdue Notification | 🔴 High | Weekly | High | High |
| 3.1 Leave Application | 🟡 Medium | Daily | Medium | Low |
| 3.2 Leave Approval/Rejection | 🟡 Medium | Daily | Medium | Low |
| 3.3 Emergency Leave | 🔴 High | Rare | High | High |
| 4.1 Renewal Reminder | 🟡 Medium | Every 6mo | Medium | Medium |
| 4.2 Renewal Confirmation | 🟡 Medium | Every 6mo | Medium | Low |
| 5.1 Exit Notification | 🟢 Low | Per student | Low | Medium |
| 5.2 Alumni Notifications | 🟢 Low | Monthly | Low | High |

---

## Integration Points Summary

### Current Implementation Status:
- ✅ Superintendent Dashboard: Has "Send Message" button (line 1164) - **NOT IMPLEMENTED YET**
- ✅ Trustee Dashboard: Has "Send Message" button (line 10558) - **NOT IMPLEMENTED YET**
- ✅ Notification Rules Configured: Superintendent Dashboard → Communication Tab (lines 820-950) - **CONFIGURED BUT NO SENDING UI**
- ✅ Student Fees Page: No communication UI - **MISSING**
- ✅ Leave Management: No communication UI - **MISSING**

### Next Steps for Task 14.2:
1. Implement core `SendMessagePanel` component
2. Implement `ScheduledMessagePanel` component
3. Implement `EscalationMessagePanel` component
4. Integrate into Superintendent Dashboard (Application Detail Modal)
5. Integrate into Trustee Dashboard (Application Detail Modal)
6. Add to Fees Page (reminder functionality)
7. Add to Leave Management (parent notifications)

---

## Appendix: Template Variable Reference

### Common Variables:
| Variable | Description | Example |
|----------|-------------|---------|
| `{{name}}` | Full name of recipient | "Rahul Sharma" |
| `{{tracking_number}}` | Application tracking number | "APP-2024-001" |
| `{{date}}` | Event/appointment date | "December 30, 2024" |
| `{{time}}` | Event/appointment time | "10:00 AM" |
| `{{amount}}` | Currency amount | "5000" |
| `{{due_date}}` | Payment due date | "January 15, 2025" |
| `{{student_name}}` | Student's full name | "Rahul Sharma" |
| `{{parent_name}}` | Parent's full name | "Mr. Sharma" |
| `{{vertical}}` | Hostel vertical | "Boys Hostel" |
| `{{link}}` | URL/Meeting link | "https://meet.google.com/..." |
| `{{transaction_id}}` | Payment transaction ID | "TXN-1735448000000" |

### Conditional Variables:
| Variable | Condition | Example |
|----------|-----------|---------|
| `{{link?}}` | Only if link exists | Include meeting link if online interview |
| `{{refund?}}` | Only if refund applicable | Include refund details |
| `{{remarks?}}` | Only if remarks provided | Include approval/rejection remarks |

---

**Document End**
