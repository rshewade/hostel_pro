# Trustee Panel Information Architecture - Test Suite

**Task:** 13.1 - Define Trustee panel information architecture and key user flows
**Purpose:** Validate the information architecture through comprehensive test cases
**Status:** Test Design Document
**Version:** 1.0
**Date:** 2025-12-28

---

## Test Strategy Overview

### Testing Scope

This test suite validates the Trustee Panel Information Architecture by verifying:

1. **Navigation Structure:** All tabs, filters, and navigation flows work correctly
2. **Screen Rendering:** All screens render with correct layouts and data
3. **User Flows:** End-to-end workflows for trustee actions
4. **State Management:** Application and interview state transitions
5. **Data Separation:** Internal remarks are properly separated from student-facing content
6. **Audit Logging:** All actions create immutable audit entries
7. **Cross-Vertical Access:** Trustees can access all three verticals
8. **Integration Points:** Data flows correctly between Superintendent, Trustee, and Accounts panels

---

## Test Categories

### Category 1: Navigation Tests

| Test ID | Test Name | Priority | Status |
|----------|-----------|-----------|--------|
| NAV-001 | Trustee Dashboard Navigation | High | Pending |
| NAV-002 | Vertical Selector Functionality | High | Pending |
| NAV-003 | Breadcrumb Navigation | Medium | Pending |
| NAV-004 | Tab Navigation (Applications, Interviews, Approvals, Audit) | High | Pending |
| NAV-005 | Back Button Functionality | Medium | Pending |
| NAV-006 | Filter Persistence | Medium | Pending |

---

### Category 2: Screen Rendering Tests

| Test ID | Test Name | Priority | Status |
|----------|-----------|-----------|--------|
| SCR-001 | Forwarded for Review View | High | Pending |
| SCR-002 | Interview Queue View | High | Pending |
| SCR-003 | Pending Final Decision View | High | Pending |
| SCR-004 | Application Detail - Summary Tab | High | Pending |
| SCR-005 | Application Detail - Interview Tab (Not Scheduled) | High | Pending |
| SCR-006 | Application Detail - Interview Tab (Scheduled) | High | Pending |
| SCR-007 | Application Detail - Interview Tab (Completed) | High | Pending |
| SCR-008 | Application Detail - Decision Tab (Provisional) | High | Pending |
| SCR-009 | Application Detail - Decision Tab (Final) | High | Pending |
| SCR-010 | Application Detail - Audit Tab | Medium | Pending |
| SCR-011 | Interview Calendar View | High | Pending |
| SCR-012 | Scheduled Interviews View | High | Pending |
| SCR-013 | Evaluation Forms View | High | Pending |
| SCR-014 | Provisional Approvals View | Medium | Pending |
| SCR-015 | Final Approvals View | Medium | Pending |
| SCR-016 | Rejections View | Medium | Pending |
| SCR-017 | Approval History View | Medium | Pending |
| SCR-018 | Decision Logs View | Medium | Pending |

---

### Category 3: User Flow Tests

| Test ID | Test Name | Priority | Status |
|----------|-----------|-----------|--------|
| FLOW-001 | Review Forwarded Application | High | Pending |
| FLOW-002 | Schedule Online Interview | High | Pending |
| FLOW-003 | Schedule Physical Interview | High | Pending |
| FLOW-004 | Reschedule Interview | High | Pending |
| FLOW-005 | Cancel Interview | Medium | Pending |
| FLOW-006 | Conduct Online Interview | High | Pending |
| FLOW-007 | Conduct Physical Interview | High | Pending |
| FLOW-008 | Complete Interview Evaluation | High | Pending |
| FLOW-009 | Issue Provisional Approval (Interview Required) | High | Pending |
| FLOW-010 | Issue Provisional Approval (No Interview) | High | Pending |
| FLOW-011 | Reject Provisionally | High | Pending |
| FLOW-012 | Issue Final Approval | High | Pending |
| FLOW-013 | Issue Final Rejection | High | Pending |
| FLOW-014 | View Audit Trail | Medium | Pending |
| FLOW-015 | Bulk Approve Applications | Medium | Pending |

---

### Category 4: State Management Tests

| Test ID | Test Name | Priority | Status |
|----------|-----------|-----------|--------|
| STATE-001 | Application State: FORWARDED → PROVISIONALLY_APPROVED | High | Pending |
| STATE-002 | Application State: PROVISIONALLY_APPROVED → INTERVIEW_SCHEDULED | High | Pending |
| STATE-003 | Application State: INTERVIEW_SCHEDULED → INTERVIEW_COMPLETED | High | Pending |
| STATE-004 | Application State: PROVISIONALLY_APPROVED → APPROVED | High | Pending |
| STATE-005 | Application State: PROVISIONALLY_APPROVED → REJECTED | High | Pending |
| STATE-006 | Interview State: NOT_SCHEDULED → SCHEDULED | High | Pending |
| STATE-007 | Interview State: SCHEDULED → IN_PROGRESS | High | Pending |
| STATE-008 | Interview State: IN_PROGRESS → COMPLETED | High | Pending |
| STATE-009 | Interview State: SCHEDULED → CANCELLED | Medium | Pending |
| STATE-010 | Interview State: SCHEDULED → MISSED | Medium | Pending |

---

### Category 5: Data Separation Tests

| Test ID | Test Name | Priority | Status |
|----------|-----------|-----------|--------|
| DATA-001 | Internal Remarks Not Visible to Students | Critical | Pending |
| DATA-002 | Superintendent Remarks Visible to Trustees | High | Pending |
| DATA-003 | Interview Scores Not Visible to Students | Critical | Pending |
| DATA-004 | Interview Observations Internal-Only | Critical | Pending |
| DATA-005 | Decision Remarks Internal-Only | Critical | Pending |
| DATA-006 | Outcome Summary Excludes Internal Data | Critical | Pending |
| DATA-007 | Audit Trail Not Visible to Students | High | Pending |

---

### Category 6: Audit Logging Tests

| Test ID | Test Name | Priority | Status |
|----------|-----------|-----------|--------|
| AUDIT-001 | Provisional Approval Creates Audit Entry | High | Pending |
| AUDIT-002 | Interview Scheduling Creates Audit Entry | High | Pending |
| AUDIT-003 | Interview Evaluation Creates Audit Entry | High | Pending |
| AUDIT-004 | Final Approval Creates Audit Entry | High | Pending |
| AUDIT-005 | Final Rejection Creates Audit Entry | High | Pending |
| AUDIT-006 | Audit Trail is Immutable | Critical | Pending |
| AUDIT-007 | Audit Log Contains All Required Fields | High | Pending |
| AUDIT-008 | Audit Trail Exports to PDF | Medium | Pending |
| AUDIT-009 | Audit Trail Exports to CSV | Medium | Pending |

---

### Category 7: Cross-Vertical Access Tests

| Test ID | Test Name | Priority | Status |
|----------|-----------|-----------|--------|
| VERT-001 | View All Verticals Applications | High | Pending |
| VERT-002 | Filter by Boys Hostel | High | Pending |
| VERT-003 | Filter by Girls Ashram | High | Pending |
| VERT-004 | Filter by Dharamshala | High | Pending |
| VERT-005 | Switch Verticals Maintains Context | Medium | Pending |

---

### Category 8: Integration Tests

| Test ID | Test Name | Priority | Status |
|----------|-----------|-----------|--------|
| INT-001 | Superintendent Forward to Trustee | High | Pending |
| INT-002 | Trustee Final Approval Triggers Account Creation | High | Pending |
| INT-003 | Provisional Approval Notification to Applicant | High | Pending |
| INT-004 | Interview Invitation Sent to Applicant | High | Pending |
| INT-005 | Interview Auto-Reminder Sent | High | Pending |
| INT-006 | Final Approval Notification to Applicant | High | Pending |
| INT-007 | Final Approval Notification to Accounts | High | Pending |
| INT-008 | Rejection Notification Sent | High | Pending |

---

## Detailed Test Cases

### Category 1: Navigation Tests

#### NAV-001: Trustee Dashboard Navigation

**Test Type:** Functional
**Priority:** High
**Status:** Pending

**Objective:** Verify that Trustees can navigate to Trustee Dashboard and access all main tabs.

**Prerequisites:**
- User logged in as Trustee
- Trustee has access to all three verticals

**Test Steps:**
1. Login as Trustee
2. Verify redirect to `/trustee/applications` (default view)
3. Verify header displays "Trustee Dashboard"
4. Verify vertical selector shows "All Verticals" by default
5. Click on "Interviews" tab
6. Verify navigation to `/trustee/interviews`
7. Click on "Approvals" tab
8. Verify navigation to `/trustee/approvals`
9. Click on "Audit & Reports" tab
10. Verify navigation to `/trustee/audit`
11. Click on "Applications" tab
12. Verify return to `/trustee/applications`

**Expected Results:**
- All tabs navigate correctly
- Header displays appropriate title
- Vertical selector is visible and functional
- URL updates with each navigation

**Actual Results:** [To be filled during testing]

**Pass/Fail:** [To be determined]

---

#### NAV-002: Vertical Selector Functionality

**Test Type:** Functional
**Priority:** High
**Status:** Pending

**Objective:** Verify that Trustees can switch between verticals and content updates correctly.

**Prerequisites:**
- User logged in as Trustee
- Applications exist in all three verticals

**Test Steps:**
1. Navigate to `/trustee/applications`
2. Note the number of applications displayed (All Verticals)
3. Click vertical selector dropdown
4. Select "Boys Hostel"
5. Verify only Boys Hostel applications are displayed
6. Verify badge shows "Boys Hostel"
7. Select "Girls Ashram"
8. Verify only Girls Ashram applications are displayed
9. Verify badge shows "Girls Ashram"
10. Select "Dharamshala"
11. Verify only Dharamshala applications are displayed
12. Verify badge shows "Dharamshala"
13. Select "All Verticals"
14. Verify all applications are displayed again

**Expected Results:**
- Vertical selector switches between all options
- Content filters correctly based on selection
- Badge updates to reflect selected vertical
- All three verticals are accessible

**Actual Results:** [To be filled during testing]

**Pass/Fail:** [To be determined]

---

#### NAV-003: Breadcrumb Navigation

**Test Type:** Functional
**Priority:** Medium
**Status:** Pending

**Objective:** Verify that breadcrumbs correctly display navigation path and allow back navigation.

**Prerequisites:**
- User logged in as Trustee
- Application exists

**Test Steps:**
1. Navigate to `/trustee/applications`
2. Click on application "APP-2024-001"
3. Verify breadcrumbs show: Applications > APP-2024-001
4. Click "Interviews" tab on application detail
5. Verify breadcrumbs show: Applications > APP-2024-001 > Interview
6. Click "Applications" breadcrumb
7. Verify return to application list
8. Verify breadcrumbs show: Applications

**Expected Results:**
- Breadcrumbs display correct path
- Clicking breadcrumbs navigates to correct view
- Breadcrumbs update with navigation

**Actual Results:** [To be filled during testing]

**Pass/Fail:** [To be determined]

---

#### NAV-004: Tab Navigation (Applications, Interviews, Approvals, Audit)

**Test Type:** Functional
**Priority:** High
**Status:** Pending

**Objective:** Verify that all main tabs are accessible and display correct content.

**Prerequisites:**
- User logged in as Trustee

**Test Steps:**
1. Login as Trustee
2. Verify default view is `/trustee/applications`
3. Click "Interviews" tab
4. Verify view shows interview calendar
5. Click "Approvals" tab
6. Verify view shows approval history
7. Click "Audit & Reports" tab
8. Verify view shows audit trail
9. Click "Applications" tab
10. Verify return to application list

**Expected Results:**
- All tabs are clickable
- Each tab displays appropriate content
- URL updates correctly
- Active tab is visually highlighted

**Actual Results:** [To be filled during testing]

**Pass/Fail:** [To be determined]

---

#### NAV-005: Back Button Functionality

**Test Type:** Functional
**Priority:** Medium
**Status:** Pending

**Objective:** Verify that back buttons return to previous view and maintain context.

**Prerequisites:**
- User logged in as Trustee
- Application exists

**Test Steps:**
1. Navigate to `/trustee/applications`
2. Apply filter: Status = "Forwarded"
3. Click on application "APP-2024-001"
4. Click "Back to Applications" button
5. Verify return to application list
6. Verify filter (Status = "Forwarded") is still applied
7. Click on application "APP-2024-002"
8. Navigate to Interview tab
9. Click "Back to Applications" button
10. Verify return to application list

**Expected Results:**
- Back button returns to previous view
- Filters and context are maintained
- Back buttons are present where appropriate

**Actual Results:** [To be filled during testing]

**Pass/Fail:** [To be determined]

---

#### NAV-006: Filter Persistence

**Test Type:** Functional
**Priority:** Medium
**Status:** Pending

**Objective:** Verify that filters persist across navigation.

**Prerequisites:**
- User logged in as Trustee
- Applications exist

**Test Steps:**
1. Navigate to `/trustee/applications`
2. Apply filters:
   - Vertical: "Boys Hostel"
   - Status: "Forwarded"
   - Priority: "High"
3. Click on application "APP-2024-001"
4. Click "Back to Applications"
5. Verify all filters are still applied
6. Navigate to Interview tab and back
7. Verify filters are still applied
8. Clear filters
9. Verify all applications are displayed

**Expected Results:**
- Filters persist across navigation
- Clear filters resets view
- Filter state is maintained per tab

**Actual Results:** [To be filled during testing]

**Pass/Fail:** [To be determined]

---

### Category 2: Screen Rendering Tests

#### SCR-001: Forwarded for Review View

**Test Type:** Visual/Functional
**Priority:** High
**Status:** Pending

**Objective:** Verify that Forwarded for Review view displays correctly with all required elements.

**Prerequisites:**
- User logged in as Trustee
- Forwarded applications exist

**Test Steps:**
1. Navigate to `/trustee/applications`
2. Verify default view is "Forwarded for Review"
3. Verify filters are visible:
   - Vertical selector
   - Status dropdown
   - Priority dropdown
   - Search input
4. Verify table columns:
   - Tracking Number
   - Applicant Name
   - Vertical
   - Superintendent
   - Recommendation
   - Flags
   - Interview Status
   - Current Status
   - Actions
5. Verify table displays forwarded applications
6. Verify sorting options work (click column headers)
7. Verify row actions are clickable (Review, Schedule Interview, View Details)
8. Verify pagination is visible (if applicable)

**Expected Results:**
- All filters are present and functional
- Table columns match specification
- Data displays correctly
- Sorting works
- Row actions are accessible

**Actual Results:** [To be filled during testing]

**Pass/Fail:** [To be determined]

---

#### SCR-002: Interview Queue View

**Test Type:** Visual/Functional
**Priority:** High
**Status:** Pending

**Objective:** Verify that Interview Queue view displays interviews grouped by date with correct actions.

**Prerequisites:**
- User logged in as Trustee
- Scheduled interviews exist

**Test Steps:**
1. Navigate to `/trustee/applications`
2. Click "Interview Queue" sub-tab
3. Verify interviews are grouped by date
4. Verify date headers are visible (e.g., "Today: December 28, 2025")
5. Verify each interview card displays:
   - Time
   - Application tracking number
   - Applicant name
   - Vertical
   - Mode (Online/Physical)
   - Status badge
6. Verify actions based on status:
   - Upcoming: Join Interview, View Application, Reschedule
   - In Progress: Join Interview, View Application
   - Completed: View Application
7. Verify filters work (Date Range, Vertical, Status)
8. Verify empty state displays when no interviews scheduled

**Expected Results:**
- Interviews grouped correctly by date
- All required information displayed
- Actions appropriate for status
- Filters work correctly

**Actual Results:** [To be filled during testing]

**Pass/Fail:** [To be determined]

---

#### SCR-003: Pending Final Decision View

**Test Type:** Visual/Functional
**Priority:** High
**Status:** Pending

**Objective:** Verify that Pending Final Decision view displays applications awaiting final approval.

**Prerequisites:**
- User logged in as Trustee
- Applications with provisional approval exist

**Test Steps:**
1. Navigate to `/trustee/applications`
2. Click "Pending Final Decision" sub-tab
3. Verify table displays provisionally approved applications
4. Verify columns:
   - Tracking Number
   - Applicant Name
   - Vertical
   - Provisional Status
   - Interview Score (if completed)
   - Interview Date
   - Actions
5. Verify actions are visible:
   - Final Approve
   - Reject
   - Review Interview Remarks
6. Verify bulk action bar is visible:
   - Select All checkbox
   - Approve Selected button
   - Reject Selected button
7. Verify filters work (Vertical, Provisional Status, Decision Status)

**Expected Results:**
- Only provisionally approved applications displayed
- Interview scores shown for completed interviews
- Final decision actions available
- Bulk actions functional

**Actual Results:** [To be filled during testing]

**Pass/Fail:** [To be determined]

---

#### SCR-004: Application Detail - Summary Tab

**Test Type:** Visual/Functional
**Priority:** High
**Status:** Pending

**Objective:** Verify that Summary tab displays all applicant information correctly.

**Prerequisites:**
- User logged in as Trustee
- Application exists

**Test Steps:**
1. Navigate to `/trustee/applications`
2. Click on application "APP-2024-001"
3. Verify Summary tab is selected by default
4. Verify Applicant Information section:
   - Name
   - Age
   - Tracking Number
   - Mobile
   - Email
   - Vertical badge
   - Application Date
5. Verify Superintendent Review section:
   - Forwarded By (name and role)
   - Forwarded On date
   - Recommendation badge
   - Remarks textarea
   - Flags chips
6. Verify Key Documents section:
   - Document cards with icons
   - Document names
   - File sizes
   - "View All Documents" link
7. Verify Payment Status section:
   - Status badge
   - Receipt number
   - Download Receipt link
8. Verify Current Workflow Status section:
   - Visual timeline with steps
   - Current step highlighted
9. Verify Trustee Actions section:
   - Issue Provisional Approval button
   - Reject Provisionally button
   - Schedule Interview button
   - View Full Application button
   - Send Message to Applicant button

**Expected Results:**
- All sections display correctly
- Data matches application details
- All buttons are clickable
- Timeline shows current status

**Actual Results:** [To be filled during testing]

**Pass/Fail:** [To be determined]

---

#### SCR-005: Application Detail - Interview Tab (Not Scheduled)

**Test Type:** Visual/Functional
**Priority:** High
**Status:** Pending

**Objective:** Verify that Interview tab displays scheduling form when interview is not scheduled.

**Prerequisites:**
- User logged in as Trustee
- Application exists (no interview scheduled)

**Test Steps:**
1. Navigate to application detail
2. Click "Interview" tab
3. Verify "Schedule Interview" heading is displayed
4. Verify Mode selector:
   - Online radio button
   - Physical radio button
5. Select "Online"
6. Verify Online fields appear:
   - Meeting Platform dropdown (Zoom/Google Meet)
   - Meeting Link input
   - Generate New Link button
7. Select "Physical"
8. Verify Physical fields appear:
   - Location input
   - Select Room button
9. Verify Date & Time fields:
   - Date picker
   - Time dropdown
   - Duration dropdown
10. Verify Notifications section:
    - Send invitation checkbox
    - Auto-reminder checkbox (24 hours before)
11. Verify Internal Notes textarea
12. Verify Schedule Interview button is visible
13. Verify Cancel button is visible

**Expected Results:**
- Scheduling form displays correctly
- Mode selection shows/hides appropriate fields
- All required fields are present
- Buttons are functional

**Actual Results:** [To be filled during testing]

**Pass/Fail:** [To be determined]

---

#### SCR-006: Application Detail - Interview Tab (Scheduled)

**Test Type:** Visual/Functional
**Priority:** High
**Status:** Pending

**Objective:** Verify that Interview tab displays scheduled interview details correctly.

**Prerequisites:**
- User logged in as Trustee
- Application has scheduled interview

**Test Steps:**
1. Navigate to application detail with scheduled interview
2. Click "Interview" tab
3. Verify "Interview Scheduled" heading is displayed
4. Verify interview details:
   - Scheduled For: date and time
   - Mode: Online or Physical
   - Meeting Link (if online)
   - Location (if physical)
5. Verify Applicant section:
   - Applicant name
   - Applicant mobile number
6. Verify Actions section:
   - Join Interview button (enabled when time arrives)
   - Reschedule Interview button
   - Cancel Interview button
7. Verify Notification Status section:
   - Invitation sent confirmation with date
   - Auto-reminder scheduled confirmation
8. Verify Internal Notes display

**Expected Results:**
- Interview details display correctly
- Actions appropriate for interview status
- Notification status visible

**Actual Results:** [To be filled during testing]

**Pass/Fail:** [To be determined]

---

#### SCR-007: Application Detail - Interview Tab (Completed)

**Test Type:** Visual/Functional
**Priority:** High
**Status:** Pending

**Objective:** Verify that Interview tab displays evaluation form for completed interviews.

**Prerequisites:**
- User logged in as Trustee
- Interview has been conducted

**Test Steps:**
1. Navigate to application detail with completed interview
2. Click "Interview" tab
3. Verify "Interview Evaluation" heading is displayed
4. Verify interview metadata:
   - Conducted On: date and time
   - Mode: Online or Physical
   - Conducted By: Trustee name
5. Verify Evaluation Criteria section with 4 criteria:
   - Academic Background & Performance (slider 1-5)
   - Communication Skills (slider 1-5)
   - Discipline & Conduct (slider 1-5)
   - Motivation & Fit for Hostel (slider 1-5)
   - Each has comment textarea
6. Verify Overall Score display (auto-calculated)
7. Verify Interview Remarks section:
   - Heading: "INTERNAL - NOT VISIBLE TO APPLICANT"
   - Textarea for observations
8. Verify Final Decision Recommendation:
   - Approve radio button
   - Reject radio button
   - Deferred radio button
9. Verify buttons:
   - Proceed to Final Decision
   - Save Evaluation Only
   - Cancel

**Expected Results:**
- Evaluation form displays correctly
- All 4 criteria present with sliders and comments
- Internal remarks clearly labeled
- Score calculates correctly

**Actual Results:** [To be filled during testing]

**Pass/Fail:** [To be determined]

---

#### SCR-008: Application Detail - Decision Tab (Provisional)

**Test Type:** Visual/Functional
**Priority:** High
**Status:** Pending

**Objective:** Verify that Decision tab displays provisional decision options correctly.

**Prerequisites:**
- User logged in as Trustee
- Application is in FORWARDED status

**Test Steps:**
1. Navigate to application detail
2. Click "Decision" tab
3. Verify "Issue Provisional Decision" heading
4. Verify Application Summary displays:
   - Tracking Number
   - Applicant Name
   - Vertical
   - Superintendent Recommendation
5. Verify Decision Type radio buttons:
   - Provisionally Approve (Schedule Interview Required)
   - Provisionally Approve (No Interview Required)
   - Reject Provisionally
6. Select "Provisionally Approve (Schedule Interview Required)"
7. Verify Implications section appears:
   - List of implications
   - Interview will be required
8. Verify Decision Remarks textarea (labeled Internal)
9. Verify Notifications checkboxes:
   - Notify applicant
   - Notify superintendent
   - Send SMS/Email confirmation
10. Verify Issue Provisional Decision button
11. Verify Cancel button

**Expected Results:**
- Decision options display correctly
- Implications shown for each option
- Internal remarks field present
- Notification options available

**Actual Results:** [To be filled during testing]

**Pass/Fail:** [To be determined]

---

#### SCR-009: Application Detail - Decision Tab (Final)

**Test Type:** Visual/Functional
**Priority:** High
**Status:** Pending

**Objective:** Verify that Decision tab displays final decision options correctly.

**Prerequisites:**
- User logged in as Trustee
- Application has PROVISIONALLY_APPROVED or INTERVIEW_COMPLETED status

**Test Steps:**
1. Navigate to application detail with provisional approval
2. Click "Decision" tab
3. Verify "Final Decision" heading
4. Verify Application Summary displays:
   - Tracking Number
   - Applicant Name
   - Vertical
   - Provisional Status badge
   - Interview Status badge (if applicable)
   - Interview Score (if completed)
5. Verify Decision Type radio buttons:
   - Final Approve
   - Final Reject
6. Select "Final Approve"
7. Verify Implications section appears:
   - Student account will be created
   - Login credentials sent via Email/SMS
   - Room allocation can proceed
   - Admission packet PDF generated
   - Notifications sent
   - Workflow steps shown
8. Verify Decision Remarks textarea (labeled Internal)
9. Verify Applicant Communication section:
   - Editable template message
10. Verify Issue Final Approval button
11. Verify Cancel button
12. Select "Final Reject"
13. Verify WARNING banner appears
14. Verify Rejection Reason radio buttons
15. Verify Additional Remarks textarea
16. Verify Applicant Communication section
17. Verify Implications section (refusal details)
18. Verify Confirm Final Rejection button

**Expected Results:**
- Final decision options display correctly
- Approval implications shown
- Rejection warning displayed
- All required fields present

**Actual Results:** [To be filled during testing]

**Pass/Fail:** [To be determined]

---

#### SCR-010: Application Detail - Audit Tab

**Test Type:** Visual/Functional
**Priority:** Medium
**Status:** Pending

**Objective:** Verify that Audit tab displays complete audit trail chronologically.

**Prerequisites:**
- User logged in as Trustee
- Application has audit history

**Test Steps:**
1. Navigate to application detail
2. Click "Audit" tab
3. Verify "Audit Trail" heading
4. Verify Application ID and Current Status displayed
5. Verify Timeline section with chronological entries:
   - Each entry shows:
     - Date and Time
     - Event type
     - User who performed action
     - Details
     - Audit ID
6. Verify entries are in chronological order (newest first)
7. Verify Export Options:
   - Export to PDF button
   - Export to CSV button
   - Print Audit Trail button
8. Click Export to PDF
9. Verify PDF download starts
10. Click Export to CSV
11. Verify CSV download starts

**Expected Results:**
- Audit trail displays chronologically
- All entries show required fields
- Export options work correctly
- Print functionality available

**Actual Results:** [To be filled during testing]

**Pass/Fail:** [To be determined]

---

### Category 3: User Flow Tests

#### FLOW-001: Review Forwarded Application

**Test Type:** End-to-End
**Priority:** High
**Status:** Pending

**Objective:** Verify that Trustees can review forwarded applications end-to-end.

**Prerequisites:**
- User logged in as Trustee
- Forwarded applications exist

**Test Steps:**
1. Login as Trustee
2. Navigate to `/trustee/applications` (Forwarded for Review view)
3. Apply filter: Vertical = "All Verticals", Status = "Forwarded"
4. Search for application by name or tracking number
5. Click on application row
6. Verify Application Detail modal opens
7. Review Summary tab:
   - Read applicant information
   - Read superintendent recommendation
   - View flags
   - Preview documents (click on document card)
8. Click Interview tab
9. Verify interview status (Not Scheduled/Scheduled)
10. Click Decision tab
11. Review provisional decision options
12. Click Close to return to application list
13. Verify application list filters are preserved

**Expected Results:**
- Can access and review forwarded applications
- All sections accessible
- Filters maintained
- Documents previewable

**Actual Results:** [To be filled during testing]

**Pass/Fail:** [To be determined]

---

#### FLOW-002: Schedule Online Interview

**Test Type:** End-to-End
**Priority:** High
**Status:** Pending

**Objective:** Verify that Trustees can schedule online interviews correctly.

**Prerequisites:**
- User logged in as Trustee
- Application exists (no interview scheduled)

**Test Steps:**
1. Navigate to application detail
2. Click Interview tab
3. Select "Online" mode
4. Select meeting platform: "Google Meet"
5. Click "Generate New Link"
6. Verify meeting link is generated and displayed
7. Select date: December 30, 2025
8. Select time: 10:00 AM
9. Select duration: 30 minutes
10. Check "Send interview invitation to applicant"
11. Check "Send auto-reminder 24 hours before"
12. Add internal notes: "Schedule by Trustee John Doe"
13. Click "Schedule Interview"
14. Verify success message displayed
15. Verify interview tab updates to show scheduled details
16. Navigate to Interview Calendar view
17. Verify interview appears on calendar
18. Navigate to Interview Queue view
19. Verify interview appears in list

**Expected Results:**
- Interview scheduled successfully
- Meeting link generated
- Notifications configured
- Interview visible in all relevant views
- Internal notes saved

**Actual Results:** [To be filled during testing]

**Pass/Fail:** [To be determined]

---

#### FLOW-003: Schedule Physical Interview

**Test Type:** End-to-End
**Priority:** High
**Status:** Pending

**Objective:** Verify that Trustees can schedule physical interviews correctly.

**Prerequisites:**
- User logged in as Trustee
- Application exists (no interview scheduled)

**Test Steps:**
1. Navigate to application detail
2. Click Interview tab
3. Select "Physical" mode
4. Enter location: "Room 201, Boys Hostel Building"
5. Click "Select Room"
6. Verify room selection modal opens (placeholder for future room management)
7. Click "Cancel" on room selection
8. Verify location field still shows "Room 201, Boys Hostel Building"
9. Select date: December 30, 2025
10. Select time: 2:00 PM
11. Select duration: 30 minutes
12. Check "Send interview invitation to applicant"
13. Check "Send auto-reminder 24 hours before"
14. Click "Schedule Interview"
15. Verify success message displayed
16. Verify interview details show location correctly

**Expected Results:**
- Physical interview scheduled successfully
- Location saved correctly
- Notifications configured

**Actual Results:** [To be filled during testing]

**Pass/Fail:** [To be determined]

---

#### FLOW-004: Reschedule Interview

**Test Type:** End-to-End
**Priority:** High
**Status:** Pending

**Objective:** Verify that Trustees can reschedule interviews correctly.

**Prerequisites:**
- User logged in as Trustee
- Application has scheduled interview

**Test Steps:**
1. Navigate to application detail with scheduled interview
2. Click Interview tab
3. Click "Reschedule Interview" button
4. Verify rescheduling form opens with current values pre-filled
5. Update date to December 31, 2025
6. Update time to 3:00 PM
7. Keep other fields unchanged
8. Click "Confirm Reschedule"
9. Verify confirmation message displayed
10. Verify notification message: "Applicant will be notified of new schedule"
11. Verify interview details updated
12. Navigate to Interview Calendar
13. Verify interview moved to new date/time

**Expected Results:**
- Interview rescheduled successfully
- Applicant notified
- Calendar updated

**Actual Results:** [To be filled during testing]

**Pass/Fail:** [To be determined]

---

#### FLOW-005: Cancel Interview

**Test Type:** End-to-End
**Priority:** Medium
**Status:** Pending

**Objective:** Verify that Trustees can cancel interviews correctly.

**Prerequisites:**
- User logged in as Trustee
- Application has scheduled interview

**Test Steps:**
1. Navigate to application detail with scheduled interview
2. Click Interview tab
3. Click "Cancel Interview" button
4. Verify confirmation modal appears
5. Verify warning: "This will cancel the interview. Applicant will be notified."
6. Enter cancellation reason: "Time conflict with trustee schedule"
7. Click "Confirm Cancellation"
8. Verify success message displayed
9. Verify interview status changes to "NOT_SCHEDULED"
10. Verify applicant notification confirmed
11. Verify audit log entry created

**Expected Results:**
- Interview cancelled successfully
- Applicant notified
- Audit log updated

**Actual Results:** [To be filled during testing]

**Pass/Fail:** [To be determined]

---

#### FLOW-006: Conduct Online Interview

**Test Type:** End-to-End
**Priority:** High
**Status:** Pending

**Objective:** Verify that Trustees can join online interviews.

**Prerequisites:**
- User logged in as Trustee
- Online interview is scheduled and time has arrived

**Test Steps:**
1. Navigate to application detail with scheduled interview
2. Click Interview tab
3. Click "Join Interview" button
4. Verify meeting link opens in new tab/window
5. Verify Google Meet or Zoom page loads
6. Conduct interview (simulate)
7. Return to Trustee Panel tab
8. Click "Mark Interview as In Progress" (if available)
9. Verify interview status changes to "IN_PROGRESS"
10. Click "Complete Interview" (when done)
11. Verify evaluation form opens

**Expected Results:**
- Meeting link opens correctly
- Interview status updates appropriately
- Evaluation form accessible

**Actual Results:** [To be filled during testing]

**Pass/Fail:** [To be determined]

---

#### FLOW-007: Conduct Physical Interview

**Test Type:** End-to-End
**Priority:** High
**Status:** Pending

**Objective:** Verify that Trustees can mark physical interviews as conducted.

**Prerequisites:**
- User logged in as Trustee
- Physical interview is scheduled

**Test Steps:**
1. Navigate to application detail with scheduled physical interview
2. Click Interview tab
3. Click "Start Interview" button (available when time arrives)
4. Verify interview status changes to "IN_PROGRESS"
5. Conduct physical interview (simulate)
6. Click "Complete Interview" button
7. Verify evaluation form opens
8. Complete evaluation form (see FLOW-008)

**Expected Results:**
- Interview status updates correctly
- Evaluation form opens

**Actual Results:** [To be filled during testing]

**Pass/Fail:** [To be determined]

---

#### FLOW-008: Complete Interview Evaluation

**Test Type:** End-to-End
**Priority:** High
**Status:** Pending

**Objective:** Verify that Trustees can complete interview evaluations correctly.

**Prerequisites:**
- User logged in as Trustee
- Interview is in "IN_PROGRESS" or "COMPLETED" status

**Test Steps:**
1. Open interview evaluation form
2. Rate "Academic Background & Performance": 4/5
3. Add comment: "Strong academic foundation"
4. Rate "Communication Skills": 5/5
5. Add comment: "Excellent communication"
6. Rate "Discipline & Conduct": 4/5
7. Add comment: "Respectful demeanor"
8. Rate "Motivation & Fit for Hostel": 5/5
9. Add comment: "Genuine interest"
10. Verify Overall Score auto-calculates: 18/20
11. In Overall Observations (internal), write:
    "Candidate demonstrated strong academic background and excellent communication skills. Showed genuine interest in joining hostel. Recommended for final approval."
12. Select recommendation: "Approve"
13. Click "Save & Proceed to Final Decision"
14. Verify evaluation saved
15. Verify navigation to Decision tab
16. Verify Final Decision tab is now active

**Expected Results:**
- Evaluation form completes successfully
- Score calculates correctly
- Internal remarks saved
- Final Decision tab becomes active

**Actual Results:** [To be filled during testing]

**Pass/Fail:** [To be determined]

---

#### FLOW-009: Issue Provisional Approval (Interview Required)

**Test Type:** End-to-End
**Priority:** High
**Status:** Pending

**Objective:** Verify that Trustees can issue provisional approval requiring interview.

**Prerequisites:**
- User logged in as Trustee
- Application is in FORWARDED status

**Test Steps:**
1. Navigate to application detail
2. Click Decision tab
3. Select "Provisionally Approve (Schedule Interview Required)"
4. Review implications:
   - Applicant notified of provisional approval
   - Interview required
   - Final decision pending
5. Add internal remarks: "Interview recommended based on superintendent recommendation"
6. Check notification options:
   - Notify applicant
   - Notify superintendent
   - Send SMS/Email confirmation
7. Click "Issue Provisional Decision"
8. Verify success message displayed
9. Verify application status changes to "PROVISIONALLY_APPROVED"
10. Verify Interview tab becomes active
11. Navigate to application list
12. Verify application moves to "Interview Queue" or "Provisionally Approved" view

**Expected Results:**
- Provisional approval issued successfully
- Application status updated
- Interview tab enabled
- Notifications sent

**Actual Results:** [To be filled during testing]

**Pass/Fail:** [To be determined]

---

#### FLOW-010: Issue Provisional Approval (No Interview)

**Test Type:** End-to-End
**Priority:** High
**Status:** Pending

**Objective:** Verify that Trustees can issue provisional approval without requiring interview.

**Prerequisites:**
- User logged in as Trustee
- Application is in FORWARDED status

**Test Steps:**
1. Navigate to application detail
2. Click Decision tab
3. Select "Provisionally Approve (No Interview Required)"
4. Review implications:
   - Applicant notified of provisional approval
   - Interview NOT required
   - Can proceed directly to final decision
5. Add internal remarks: "Superintendent strong recommendation, no interview needed"
6. Check notification options
7. Click "Issue Provisional Decision"
8. Verify success message displayed
9. Verify application status changes to "PROVISIONALLY_APPROVED"
10. Verify Interview tab shows "No Interview Required"
11. Verify Final Decision tab is active
12. Navigate to application list
13. Verify application appears in "Pending Final Decision" view

**Expected Results:**
- Provisional approval issued without interview
- Application status updated
- Final decision available immediately

**Actual Results:** [To be filled during testing]

**Pass/Fail:** [To be determined]

---

#### FLOW-011: Reject Provisionally

**Test Type:** End-to-End
**Priority:** High
**Status:** Pending

**Objective:** Verify that Trustees can reject applications provisionally.

**Prerequisites:**
- User logged in as Trustee
- Application is in FORWARDED status

**Test Steps:**
1. Navigate to application detail
2. Click Decision tab
3. Select "Reject Provisionally"
4. Verify WARNING banner appears
5. Select rejection reason: "Does Not Meet Eligibility Criteria"
6. Add internal remarks: "Academic performance below threshold (60%, required 70%)"
7. Edit applicant message (template):
   "Thank you for your application. After review, we regret to inform you that your application does not meet our eligibility criteria at this time."
8. Review implications:
   - Applicant notified of rejection
   - Application archived after 1 year
   - Payment refunded
9. Click "Confirm Rejection"
10. Verify success message displayed
11. Verify application status changes to "REJECTED"
12. Verify refund confirmation message
13. Verify application removed from forwarded list
14. Navigate to "Rejections" view
15. Verify application appears there

**Expected Results:**
- Provisional rejection issued successfully
- Applicant notified
- Application status updated
- Refund triggered
- Application appears in rejections view

**Actual Results:** [To be filled during testing]

**Pass/Fail:** [To be determined]

---

#### FLOW-012: Issue Final Approval

**Test Type:** End-to-End
**Priority:** High
**Status:** Pending

**Objective:** Verify that Trustees can issue final approval, creating student accounts.

**Prerequisites:**
- User logged in as Trustee
- Application has PROVISIONALLY_APPROVED or INTERVIEW_COMPLETED status

**Test Steps:**
1. Navigate to application detail
2. Click Decision tab
3. Review Application Summary (provisional status, interview score)
4. Select "Final Approve"
5. Review implications:
   - Student account will be created
   - Login credentials sent via Email/SMS
   - Room allocation can proceed
   - Admission packet PDF generated
   - Notifications sent
6. Add internal remarks: "Final approval based on positive interview evaluation"
7. Edit approval message (template):
   "Congratulations! Your application has been approved. Login credentials will be sent to your registered email."
8. Click "Issue Final Approval"
9. Verify success message displayed:
   - Application approved
   - Student account created
   - Credentials sent
10. Verify application status changes to "APPROVED"
11. Navigate to "Final Approvals" view
12. Verify application appears with "Account Created" badge
13. Check that student account was created (verify with Accounts team or test account)

**Expected Results:**
- Final approval issued successfully
- Student account created
- Login credentials sent
- Admission packet generated
- Application status updated

**Actual Results:** [To be filled during testing]

**Pass/Fail:** [To be determined]

---

#### FLOW-013: Issue Final Rejection

**Test Type:** End-to-End
**Priority:** High
**Status:** Pending

**Objective:** Verify that Trustees can issue final rejection after interview.

**Prerequisites:**
- User logged in as Trustee
- Application has INTERVIEW_COMPLETED status

**Test Steps:**
1. Navigate to application detail with completed interview
2. Click Decision tab
3. Review interview evaluation (score: 12/20)
4. Select "Final Reject"
5. Verify WARNING banner appears: "This will permanently reject the application"
6. Select rejection reason: "Interview Performance Below Threshold"
7. Add internal remarks:
   "Despite provisional approval, interview revealed concerns about candidate's fit. Score of 12/20 below required threshold of 15/20."
8. Edit rejection message (template):
   "Thank you for participating in the interview. After careful consideration, we regret to inform you that your application has not been approved."
9. Review implications:
   - Applicant notified of final rejection
   - Application status → REJECTED
   - No student account created
   - Payment refunded
   - Application archived after 1 year
10. Click "Confirm Final Rejection"
11. Verify success message displayed
12. Verify application status changes to "REJECTED"
13. Verify refund confirmation message
14. Verify application appears in "Rejections" view

**Expected Results:**
- Final rejection issued successfully
- Applicant notified
- Application archived after 1 year
- Refund triggered

**Actual Results:** [To be filled during testing]

**Pass/Fail:** [To be determined]

---

#### FLOW-014: View Audit Trail

**Test Type:** End-to-End
**Priority:** Medium
**Status:** Pending

**Objective:** Verify that Trustees can view complete audit trails for applications.

**Prerequisites:**
- User logged in as Trustee
- Application has audit history

**Test Steps:**
1. Navigate to application detail
2. Click Audit tab
3. Verify audit trail displays chronologically
4. Review each audit entry:
   - Application submission
   - Payment verification
   - Superintendent review
   - Forward to trustees
   - Provisional approval
   - Interview scheduling
   - Interview evaluation
   - Final decision
5. Verify each entry shows:
   - Date and Time
   - Event type
   - User who performed action
   - Details
   - Audit ID
6. Click "Export to PDF"
7. Verify PDF download starts
8. Click "Export to CSV"
9. Verify CSV download starts
10. Click "Print Audit Trail"
11. Verify print dialog opens

**Expected Results:**
- Audit trail displays correctly
- All entries show required fields
- Export options work

**Actual Results:** [To be filled during testing]

**Pass/Fail:** [To be determined]

---

#### FLOW-015: Bulk Approve Applications

**Test Type:** End-to-End
**Priority:** Medium
**Status:** Pending

**Objective:** Verify that Trustees can approve multiple applications in bulk.

**Prerequisites:**
- User logged in as Trustee
- Multiple applications have INTERVIEW_COMPLETED status

**Test Steps:**
1. Navigate to "Pending Final Decision" view
2. Apply filters as needed
3. Check checkboxes for 3 applications
4. Click "Approve Selected" button
5. Verify Bulk Approval modal opens
6. Review list of selected applications
7. Add common remarks: "Batch approval based on positive interview evaluations"
8. Configure notifications: Notify all applicants, superintendents, accounts
9. Review implications:
   - Student accounts created for all
   - Credentials sent to all
   - Room allocation triggered for all
10. Click "Confirm Bulk Approval"
11. Verify success message: "3 applications approved successfully"
12. Verify all applications status changes to "APPROVED"
13. Verify applications appear in "Final Approvals" view with "Account Created" badge

**Expected Results:**
- Bulk approval works correctly
- Student accounts created for all
- Notifications sent in batch
- All applications updated

**Actual Results:** [To be filled during testing]

**Pass/Fail:** [To be determined]

---

### Category 4: State Management Tests

#### STATE-001: Application State - FORWARDED → PROVISIONALLY_APPROVED

**Test Type:** Functional
**Priority:** High
**Status:** Pending

**Objective:** Verify that application state transitions correctly from FORWARDED to PROVISIONALLY_APPROVED.

**Prerequisites:**
- User logged in as Trustee
- Application status is FORWARDED

**Test Steps:**
1. Navigate to application detail
2. Verify current status: FORWARDED
3. Issue provisional approval (FLOW-009 or FLOW-010)
4. Verify application status changes to PROVISIONALLY_APPROVED
5. Verify audit log entry created with:
   - Previous status: FORWARDED
   - New status: PROVISIONALLY_APPROVED
   - User: Trustee
   - Timestamp
6. Verify interview tab becomes active (if interview required)
7. Verify final decision tab becomes active (if no interview required)

**Expected Results:**
- State transition successful
- Audit log updated
- Appropriate tabs enabled

**Actual Results:** [To be filled during testing]

**Pass/Fail:** [To be determined]

---

#### STATE-002: Application State - PROVISIONALLY_APPROVED → INTERVIEW_SCHEDULED

**Test Type:** Functional
**Priority:** High
**Status:** Pending

**Objective:** Verify that application state transitions to INTERVIEW_SCHEDULED when interview is scheduled.

**Prerequisites:**
- User logged in as Trustee
- Application status is PROVISIONALLY_APPROVED (with interview required)

**Test Steps:**
1. Navigate to application detail
2. Verify current status: PROVISIONALLY_APPROVED
3. Schedule interview (FLOW-002 or FLOW-003)
4. Verify application status remains PROVISIONALLY_APPROVED
5. Verify interview status changes to SCHEDULED
6. Verify audit log entry created for interview scheduling
7. Verify interview appears in calendar and queue views

**Expected Results:**
- Interview scheduled successfully
- Interview state updated
- Application status unchanged
- Audit log updated

**Actual Results:** [To be filled during testing]

**Pass/Fail:** [To be determined]

---

#### STATE-003: Application State - INTERVIEW_SCHEDULED → INTERVIEW_COMPLETED

**Test Type:** Functional
**Priority:** High
**Status:** Pending

**Objective:** Verify that application/interview state transitions to COMPLETED after interview evaluation.

**Prerequisites:**
- User logged in as Trustee
- Interview status is SCHEDULED or IN_PROGRESS

**Test Steps:**
1. Navigate to application detail
2. Verify interview status: SCHEDULED or IN_PROGRESS
3. Complete interview evaluation (FLOW-008)
4. Verify interview status changes to COMPLETED
5. Verify application status changes to INTERVIEW_COMPLETED
6. Verify audit log entry created with interview evaluation details
7. Verify final decision tab becomes active
8. Verify interview score is saved and visible

**Expected Results:**
- Interview completed successfully
- Application state updated
- Evaluation saved
- Final decision enabled

**Actual Results:** [To be filled during testing]

**Pass/Fail:** [To be determined]

---

#### STATE-004: Application State - PROVISIONALLY_APPROVED → APPROVED

**Test Type:** Functional
**Priority:** High
**Status:** Pending

**Objective:** Verify that application state transitions to APPROVED on final approval.

**Prerequisites:**
- User logged in as Trustee
- Application status is PROVISIONALLY_APPROVED (no interview required)

**Test Steps:**
1. Navigate to application detail
2. Verify current status: PROVISIONALLY_APPROVED
3. Issue final approval (FLOW-012)
4. Verify application status changes to APPROVED
5. Verify audit log entry created with:
   - Previous status: PROVISIONALLY_APPROVED
   - New status: APPROVED
   - User: Trustee
   - Remarks
6. Verify student account created (Promotion Service triggered)
7. Verify credentials sent via Email/SMS
8. Verify room allocation notification sent to Accounts

**Expected Results:**
- Application approved successfully
- State transition logged
- Student account created
- Notifications sent

**Actual Results:** [To be filled during testing]

**Pass/Fail:** [To be determined]

---

#### STATE-005: Application State - PROVISIONALLY_APPROVED → REJECTED

**Test Type:** Functional
**Priority:** High
**Status:** Pending

**Objective:** Verify that application state transitions to REJECTED on provisional rejection.

**Prerequisites:**
- User logged in as Trustee
- Application status is FORWARDED or PROVISIONALLY_APPROVED

**Test Steps:**
1. Navigate to application detail
2. Verify current status: FORWARDED or PROVISIONALLY_APPROVED
3. Reject provisionally (FLOW-011)
4. Verify application status changes to REJECTED
5. Verify audit log entry created with rejection reason
6. Verify refund process triggered
7. Verify application archived (after 1 year - simulate)

**Expected Results:**
- Application rejected successfully
- State transition logged
- Refund triggered

**Actual Results:** [To be filled during testing]

**Pass/Fail:** [To be determined]

---

#### STATE-006: Interview State - NOT_SCHEDULED → SCHEDULED

**Test Type:** Functional
**Priority:** High
**Status:** Pending

**Objective:** Verify that interview state transitions from NOT_SCHEDULED to SCHEDULED.

**Prerequisites:**
- User logged in as Trustee
- No interview scheduled for application

**Test Steps:**
1. Navigate to application detail
2. Click Interview tab
3. Verify interview status: Not Scheduled
4. Schedule interview (FLOW-002 or FLOW-003)
5. Verify interview status changes to SCHEDULED
6. Verify interview details are saved
7. Verify interview appears in calendar

**Expected Results:**
- Interview scheduled successfully
- State updated
- Details saved

**Actual Results:** [To be filled during testing]

**Pass/Fail:** [To be determined]

---

#### STATE-007: Interview State - SCHEDULED → IN_PROGRESS

**Test Type:** Functional
**Priority:** High
**Status:** Pending

**Objective:** Verify that interview state transitions to IN_PROGRESS when interview starts.

**Prerequisites:**
- User logged in as Trustee
- Interview status is SCHEDULED

**Test Steps:**
1. Navigate to application detail with scheduled interview
2. Click Interview tab
3. Click "Start Interview" or "Join Interview" button
4. Verify interview status changes to IN_PROGRESS
5. Verify audit log entry created

**Expected Results:**
- Interview marked as in progress
- State logged

**Actual Results:** [To be filled during testing]

**Pass/Fail:** [To be determined]

---

#### STATE-008: Interview State - IN_PROGRESS → COMPLETED

**Test Type:** Functional
**Priority:** High
**Status:** Pending

**Objective:** Verify that interview state transitions to COMPLETED after evaluation.

**Prerequisites:**
- User logged in as Trustee
- Interview status is IN_PROGRESS

**Test Steps:**
1. Navigate to application detail with interview in progress
2. Click Interview tab
3. Click "Complete Interview" button
4. Complete evaluation form (FLOW-008)
5. Verify interview status changes to COMPLETED
6. Verify evaluation data is saved
7. Verify audit log entry created

**Expected Results:**
- Interview completed successfully
- Evaluation saved
- State logged

**Actual Results:** [To be filled during testing]

**Pass/Fail:** [To be determined]

---

#### STATE-009: Interview State - SCHEDULED → CANCELLED

**Test Type:** Functional
**Priority:** Medium
**Status:** Pending

**Objective:** Verify that interview state transitions to CANCELLED when cancelled.

**Prerequisites:**
- User logged in as Trustee
- Interview status is SCHEDULED

**Test Steps:**
1. Navigate to application detail with scheduled interview
2. Click Interview tab
3. Click "Cancel Interview" button
4. Enter cancellation reason
5. Click "Confirm Cancellation"
6. Verify interview status changes to CANCELLED
7. Verify applicant notified
8. Verify audit log entry created

**Expected Results:**
- Interview cancelled successfully
- Applicant notified
- State logged

**Actual Results:** [To be filled during testing]

**Pass/Fail:** [To be determined]

---

#### STATE-010: Interview State - SCHEDULED → MISSED

**Test Type:** Functional
**Priority:** Medium
**Status:** Pending

**Objective:** Verify that interview state transitions to MISSED when applicant doesn't attend.

**Prerequisites:**
- User logged in as Trustee
- Interview time has passed

**Test Steps:**
1. Navigate to Interview Queue view
2. Locate interview that has passed (applicant didn't attend)
3. Click "Mark as Missed" button (if available)
4. Verify interview status changes to MISSED
5. Verify applicant notified
6. Verify options to reschedule appear

**Expected Results:**
- Interview marked as missed
- Applicant notified
- Reschedule option available

**Actual Results:** [To be filled during testing]

**Pass/Fail:** [To be determined]

---

### Category 5: Data Separation Tests

#### DATA-001: Internal Remarks Not Visible to Students

**Test Type:** Security
**Priority:** Critical
**Status:** Pending

**Objective:** Verify that internal remarks are NOT visible to students or applicants.

**Prerequisites:**
- Trustee has added internal remarks to application
- Student account exists (after final approval)

**Test Steps:**
1. Login as Trustee
2. Navigate to application detail
3. Add internal remarks to application (e.g., in evaluation form or decision remarks)
4. Logout as Trustee
5. Login as Student (applicant)
6. Navigate to Student Dashboard
7. Navigate to Application Status or Outcome Summary
8. Verify internal remarks are NOT displayed
9. Verify only high-level outcome summary is visible
10. Verify no access to internal notes, interview scores, or detailed observations

**Expected Results:**
- Internal remarks are trustee-only
- Students see only outcome summary
- No internal data exposed to students

**Actual Results:** [To be filled during testing]

**Pass/Fail:** [To be determined]

---

#### DATA-002: Superintendent Remarks Visible to Trustees

**Test Type:** Functional
**Priority:** High
**Status:** Pending

**Objective:** Verify that superintendent remarks are visible to trustees.

**Prerequisites:**
- Superintendent has added remarks when forwarding application

**Test Steps:**
1. Login as Trustee
2. Navigate to application detail
3. Click Summary tab
4. Verify Superintendent Review section is displayed
5. Verify superintendent remarks are visible
6. Verify superintendent recommendation badge is displayed
7. Verify flags are visible

**Expected Results:**
- Superintendent remarks visible to trustees
- Recommendation displayed
- Flags visible

**Actual Results:** [To be filled during testing]

**Pass/Fail:** [To be determined]

---

#### DATA-003: Interview Scores Not Visible to Students

**Test Type:** Security
**Priority:** Critical
**Status:** Pending

**Objective:** Verify that interview scores are NOT visible to students.

**Prerequisites:**
- Trustee has completed interview evaluation with scores

**Test Steps:**
1. Login as Trustee
2. Navigate to application detail
3. Complete interview evaluation with scores (e.g., 18/20)
4. Logout as Trustee
5. Login as Student
6. Navigate to Application Status or Outcome Summary
7. Verify interview scores are NOT displayed
8. Verify only interview date/time is shown (if applicable)

**Expected Results:**
- Interview scores are trustee-only
- Students see only date/time, not scores

**Actual Results:** [To be filled during testing]

**Pass/Fail:** [To be determined]

---

#### DATA-004: Interview Observations Internal-Only

**Test Type:** Security
**Priority:** Critical
**Status:** Pending

**Objective:** Verify that interview observations are NOT visible to students.

**Prerequisites:**
- Trustee has added interview observations

**Test Steps:**
1. Login as Trustee
2. Navigate to application detail
3. Complete interview evaluation with observations
4. Verify observations are labeled "INTERNAL - NOT VISIBLE TO APPLICANT"
5. Logout as Trustee
6. Login as Student
7. Navigate to Application Status or Outcome Summary
8. Verify interview observations are NOT displayed

**Expected Results:**
- Interview observations are trustee-only
- Internal labeling enforced
- No observations exposed to students

**Actual Results:** [To be filled during testing]

**Pass/Fail:** [To be determined]

---

#### DATA-005: Decision Remarks Internal-Only

**Test Type:** Security
**Priority:** Critical
**Status:** Pending

**Objective:** Verify that decision remarks are NOT visible to students.

**Prerequisites:**
- Trustee has issued decision with internal remarks

**Test Steps:**
1. Login as Trustee
2. Navigate to application detail
3. Issue final approval with internal remarks
4. Verify remarks are labeled Internal
5. Logout as Trustee
6. Login as Student
7. Navigate to Application Status or Outcome Summary
8. Verify decision remarks are NOT displayed
9. Verify only approval/rejection status is shown

**Expected Results:**
- Decision remarks are trustee-only
- Students see only status, not rationale

**Actual Results:** [To be filled during testing]

**Pass/Fail:** [To be determined]

---

#### DATA-006: Outcome Summary Excludes Internal Data

**Test Type:** Security
**Priority:** Critical
**Status:** Pending

**Objective:** Verify that outcome summary card displays only student-facing data.

**Prerequisites:**
- Application has been approved or rejected
- Internal data exists (remarks, scores, observations)

**Test Steps:**
1. Login as Trustee
2. Navigate to application detail
3. Verify all internal data is visible
4. Logout as Trustee
5. Login as Student
6. Navigate to Outcome Summary card
7. Verify displayed data:
   - Application status (Approved/Rejected)
   - Decision date
   - Next steps (login credentials, room allocation, etc.)
8. Verify NOT displayed:
   - Superintendent remarks
   - Interview scores
   - Interview observations
   - Trustee decision remarks
   - Internal notes
   - Audit trail

**Expected Results:**
- Outcome summary shows only relevant data
- No internal data exposed
- Clear distinction between internal and public data

**Actual Results:** [To be filled during testing]

**Pass/Fail:** [To be determined]

---

#### DATA-007: Audit Trail Not Visible to Students

**Test Type:** Security
**Priority:** High
**Status:** Pending

**Objective:** Verify that audit trail is NOT visible to students.

**Prerequisites:**
- Application has audit history

**Test Steps:**
1. Login as Trustee
2. Navigate to application detail
3. Click Audit tab
4. Verify audit trail is displayed
5. Logout as Trustee
6. Login as Student
7. Navigate to Application Status or any student view
8. Verify audit trail tab does NOT exist
9. Verify audit trail is NOT accessible

**Expected Results:**
- Audit trail is trustee-only
- Students cannot access audit logs

**Actual Results:** [To be filled during testing]

**Pass/Fail:** [To be determined]

---

### Category 6: Audit Logging Tests

#### AUDIT-001: Provisional Approval Creates Audit Entry

**Test Type:** Functional
**Priority:** High
**Status:** Pending

**Objective:** Verify that issuing provisional approval creates an audit log entry.

**Prerequisites:**
- User logged in as Trustee
- Application is in FORWARDED status

**Test Steps:**
1. Navigate to application detail
2. Issue provisional approval with remarks
3. Navigate to Audit tab
4. Verify new audit entry is present with:
   - Timestamp
   - User: Trustee name
   - Event: "Provisional Approval Issued"
   - Previous status: FORWARDED
   - New status: PROVISIONALLY_APPROVED
   - Remarks
   - Audit ID

**Expected Results:**
- Audit entry created
- All required fields present
- Timestamp accurate

**Actual Results:** [To be filled during testing]

**Pass/Fail:** [To be determined]

---

#### AUDIT-002: Interview Scheduling Creates Audit Entry

**Test Type:** Functional
**Priority:** High
**Status:** Pending

**Objective:** Verify that scheduling interview creates an audit log entry.

**Prerequisites:**
- User logged in as Trustee
- No interview scheduled

**Test Steps:**
1. Navigate to application detail
2. Schedule interview with date, time, mode
3. Navigate to Audit tab
4. Verify new audit entry is present with:
   - Timestamp
   - User: Trustee name
   - Event: "Interview Scheduled"
   - Details: date, time, mode, meeting link/location
   - Audit ID

**Expected Results:**
- Audit entry created
- Interview details logged

**Actual Results:** [To be filled during testing]

**Pass/Fail:** [To be determined]

---

#### AUDIT-003: Interview Evaluation Creates Audit Entry

**Test Type:** Functional
**Priority:** High
**Status:** Pending

**Objective:** Verify that completing interview evaluation creates an audit log entry.

**Prerequisites:**
- User logged in as Trustee
- Interview is in progress

**Test Steps:**
1. Navigate to application detail
2. Complete interview evaluation with scores and observations
3. Navigate to Audit tab
4. Verify new audit entry is present with:
   - Timestamp
   - User: Trustee name
   - Event: "Interview Evaluation Completed"
   - Details: Overall score, recommendation
   - Note: Observations NOT logged (internal only)
   - Audit ID

**Expected Results:**
- Audit entry created
- Evaluation summary logged
- Internal observations excluded from public audit

**Actual Results:** [To be filled during testing]

**Pass/Fail:** [To be determined]

---

#### AUDIT-004: Final Approval Creates Audit Entry

**Test Type:** Functional
**Priority:** High
**Status:** Pending

**Objective:** Verify that issuing final approval creates an audit log entry.

**Prerequisites:**
- User logged in as Trustee
- Application has PROVISIONALLY_APPROVED status

**Test Steps:**
1. Navigate to application detail
2. Issue final approval with remarks
3. Navigate to Audit tab
4. Verify new audit entry is present with:
   - Timestamp
   - User: Trustee name
   - Event: "Final Approval Issued"
   - Previous status: PROVISIONALLY_APPROVED
   - New status: APPROVED
   - Remarks
   - Details: Student account created, credentials sent
   - Audit ID

**Expected Results:**
- Audit entry created
- Account creation logged
- All status transitions captured

**Actual Results:** [To be filled during testing]

**Pass/Fail:** [To be determined]

---

#### AUDIT-005: Final Rejection Creates Audit Entry

**Test Type:** Functional
**Priority:** High
**Status:** Pending

**Objective:** Verify that issuing final rejection creates an audit log entry.

**Prerequisites:**
- User logged in as Trustee
- Application has INTERVIEW_COMPLETED status

**Test Steps:**
1. Navigate to application detail
2. Issue final rejection with reason and remarks
3. Navigate to Audit tab
4. Verify new audit entry is present with:
   - Timestamp
   - User: Trustee name
   - Event: "Final Rejection Issued"
   - Previous status: INTERVIEW_COMPLETED
   - New status: REJECTED
   - Rejection reason
   - Remarks
   - Audit ID

**Expected Results:**
- Audit entry created
- Rejection reason logged
- Status transition captured

**Actual Results:** [To be filled during testing]

**Pass/Fail:** [To be determined]

---

#### AUDIT-006: Audit Trail is Immutable

**Test Type:** Security
**Priority:** Critical
**Status:** Pending

**Objective:** Verify that audit log entries cannot be modified or deleted.

**Prerequisites:**
- Audit entries exist

**Test Steps:**
1. Login as Trustee
2. Navigate to application detail
3. Click Audit tab
4. Verify audit log entries are read-only
5. Verify no edit/delete buttons exist for audit entries
6. Attempt to edit audit entry (via API or console if applicable)
7. Verify edit is blocked/returns error
8. Attempt to delete audit entry
9. Verify delete is blocked/returns error

**Expected Results:**
- Audit entries are immutable
- No edit/delete functionality
- Attempts to modify fail

**Actual Results:** [To be filled during testing]

**Pass/Fail:** [To be determined]

---

#### AUDIT-007: Audit Log Contains All Required Fields

**Test Type:** Functional
**Priority:** High
**Status:** Pending

**Objective:** Verify that audit log entries contain all required fields.

**Prerequisites:**
- Audit entries exist

**Test Steps:**
1. Navigate to application detail
2. Click Audit tab
3. For each audit entry, verify:
   - ID: Present
   - Timestamp: Present and accurate
   - User ID: Present
   - User Name: Present
   - User Role: Present (Superintendent/Trustee/Accounts/System)
   - Event: Present
   - Previous Status: Present (if applicable)
   - New Status: Present (if applicable)
   - Remarks: Present (if applicable)
   - Details: Present
   - IP Address: Present (if logged)
   - User Agent: Present (if logged)

**Expected Results:**
- All required fields present
- Data accurate

**Actual Results:** [To be filled during testing]

**Pass/Fail:** [To be determined]

---

#### AUDIT-008: Audit Trail Exports to PDF

**Test Type:** Functional
**Priority:** Medium
**Status:** Pending

**Objective:** Verify that audit trail can be exported to PDF.

**Prerequisites:**
- Application has audit history

**Test Steps:**
1. Navigate to application detail
2. Click Audit tab
3. Click "Export to PDF" button
4. Verify PDF download starts
5. Open downloaded PDF
6. Verify PDF contains:
   - Application ID and tracking number
   - Complete audit trail
   - All audit entries with timestamps
   - User information
   - Events and details
7. Verify PDF formatting is readable

**Expected Results:**
- PDF downloads successfully
- Contains complete audit trail
- Formatted correctly

**Actual Results:** [To be filled during testing]

**Pass/Fail:** [To be determined]

---

#### AUDIT-009: Audit Trail Exports to CSV

**Test Type:** Functional
**Priority:** Medium
**Status:** Pending

**Objective:** Verify that audit trail can be exported to CSV.

**Prerequisites:**
- Application has audit history

**Test Steps:**
1. Navigate to application detail
2. Click Audit tab
3. Click "Export to CSV" button
4. Verify CSV download starts
5. Open downloaded CSV
6. Verify CSV contains:
   - Header row with field names
   - One row per audit entry
   - All required columns (ID, Timestamp, User, Event, etc.)
7. Verify CSV is readable in spreadsheet software

**Expected Results:**
- CSV downloads successfully
- Contains complete audit trail
- Properly formatted

**Actual Results:** [To be filled during testing]

**Pass/Fail:** [To be determined]

---

### Category 7: Cross-Vertical Access Tests

#### VERT-001: View All Verticals Applications

**Test Type:** Functional
**Priority:** High
**Status:** Pending

**Objective:** Verify that Trustees can view applications from all three verticals.

**Prerequisites:**
- User logged in as Trustee
- Applications exist in all three verticals

**Test Steps:**
1. Navigate to `/trustee/applications`
2. Verify vertical selector shows "All Verticals"
3. Verify application count displays total from all verticals
4. Verify applications from Boys Hostel are displayed
5. Verify applications from Girls Ashram are displayed
6. Verify applications from Dharamshala are displayed
7. Verify vertical badges are visible for each application

**Expected Results:**
- All verticals applications visible
- Total count correct
- Vertical badges displayed

**Actual Results:** [To be filled during testing]

**Pass/Fail:** [To be determined]

---

#### VERT-002: Filter by Boys Hostel

**Test Type:** Functional
**Priority:** High
**Status:** Pending

**Objective:** Verify that Trustees can filter applications by Boys Hostel vertical.

**Prerequisites:**
- User logged in as Trustee
- Boys Hostel applications exist

**Test Steps:**
1. Navigate to `/trustee/applications`
2. Click vertical selector dropdown
3. Select "Boys Hostel"
4. Verify only Boys Hostel applications are displayed
5. Verify vertical badge shows "Boys Hostel"
6. Verify application count matches Boys Hostel count
7. Verify Girls and Dharamshala applications are NOT displayed

**Expected Results:**
- Only Boys Hostel applications displayed
- Count accurate
- Other verticals filtered out

**Actual Results:** [To be filled during testing]

**Pass/Fail:** [To be determined]

---

#### VERT-003: Filter by Girls Ashram

**Test Type:** Functional
**Priority:** High
**Status:** Pending

**Objective:** Verify that Trustees can filter applications by Girls Ashram vertical.

**Prerequisites:**
- User logged in as Trustee
- Girls Ashram applications exist

**Test Steps:**
1. Navigate to `/trustee/applications`
2. Click vertical selector dropdown
3. Select "Girls Ashram"
4. Verify only Girls Ashram applications are displayed
5. Verify vertical badge shows "Girls Ashram"
6. Verify application count matches Girls Ashram count
7. Verify Boys and Dharamshala applications are NOT displayed

**Expected Results:**
- Only Girls Ashram applications displayed
- Count accurate
- Other verticals filtered out

**Actual Results:** [To be filled during testing]

**Pass/Fail:** [To be determined]

---

#### VERT-004: Filter by Dharamshala

**Test Type:** Functional
**Priority:** High
**Status:** Pending

**Objective:** Verify that Trustees can filter applications by Dharamshala vertical.

**Prerequisites:**
- User logged in as Trustee
- Dharamshala applications exist

**Test Steps:**
1. Navigate to `/trustee/applications`
2. Click vertical selector dropdown
3. Select "Dharamshala"
4. Verify only Dharamshala applications are displayed
5. Verify vertical badge shows "Dharamshala"
6. Verify application count matches Dharamshala count
7. Verify Boys and Girls applications are NOT displayed

**Expected Results:**
- Only Dharamshala applications displayed
- Count accurate
- Other verticals filtered out

**Actual Results:** [To be filled during testing]

**Pass/Fail:** [To be determined]

---

#### VERT-005: Switch Verticals Maintains Context

**Test Type:** Functional
**Priority:** Medium
**Status:** Pending

**Objective:** Verify that switching verticals maintains navigation context.

**Prerequisites:**
- User logged in as Trustee

**Test Steps:**
1. Navigate to `/trustee/applications`
2. Apply filters: Status = "Forwarded", Priority = "High"
3. Switch vertical to "Boys Hostel"
4. Verify filters are still applied
5. Click on application in Boys Hostel
6. Open application detail
7. Switch vertical to "Girls Ashram" from header
8. Verify returns to application list with filters
9. Verify only Girls Ashram applications displayed

**Expected Results:**
- Filters persist across vertical switch
- Navigation context maintained
- Vertical switch updates content

**Actual Results:** [To be filled during testing]

**Pass/Fail:** [To be determined]

---

### Category 8: Integration Tests

#### INT-001: Superintendent Forward to Trustee

**Test Type:** Integration
**Priority:** High
**Status:** Pending

**Objective:** Verify that applications forwarded by superintendents appear in Trustee Dashboard.

**Prerequisites:**
- Superintendent account exists
- Trustee account exists
- Application exists in NEW status

**Test Steps:**
1. Login as Superintendent
2. Navigate to application detail
3. Click "Forward to Trustees"
4. Add remarks and recommendation
5. Click "Forward"
6. Verify application status changes to FORWARDED
7. Logout as Superintendent
8. Login as Trustee
9. Navigate to `/trustee/applications`
10. Verify application appears in "Forwarded for Review" view
11. Click on application
12. Verify superintendent remarks and recommendation are visible
13. Verify forwarding timestamp is correct

**Expected Results:**
- Application forwarded successfully
- Appears in Trustee Dashboard
- Superintendent data visible to trustees

**Actual Results:** [To be filled during testing]

**Pass/Fail:** [To be determined]

---

#### INT-002: Trustee Final Approval Triggers Account Creation

**Test Type:** Integration
**Priority:** High
**Status:** Pending

**Objective:** Verify that final approval triggers student account creation via Promotion Service.

**Prerequisites:**
- User logged in as Trustee
- Application has PROVISIONALLY_APPROVED status

**Test Steps:**
1. Navigate to application detail
2. Issue final approval (FLOW-012)
3. Verify success message includes "Student account created"
4. Check database or verify with Accounts team:
   - Student user record created
   - Email/phone match applicant data
   - Role set to STUDENT
   - Status set to ACTIVE
5. Verify credentials were sent:
   - Check email logs (if available)
   - Or test student login
6. Navigate to Accounts Dashboard (if accessible)
7. Verify application appears in room allocation queue

**Expected Results:**
- Student account created
- Credentials sent
- Accounts notified

**Actual Results:** [To be filled during testing]

**Pass/Fail:** [To be determined]

---

#### INT-003: Provisional Approval Notification to Applicant

**Test Type:** Integration
**Priority:** High
**Status:** Pending

**Objective:** Verify that provisional approval triggers notification to applicant.

**Prerequisites:**
- User logged in as Trustee
- Application in FORWARDED status

**Test Steps:**
1. Navigate to application detail
2. Issue provisional approval with notifications enabled
3. Verify success message includes "Applicant notified"
4. Check notification logs (or mock notification service):
   - Verify SMS sent to applicant mobile
   - Verify Email sent to applicant email
   - Verify WhatsApp sent (if enabled)
5. Verify notification content:
   - Application tracking number
   - Provisional approval message
   - Next steps (if applicable)

**Expected Results:**
- Applicant notified via SMS
- Applicant notified via Email
- WhatsApp notification sent (if enabled)
- Content correct

**Actual Results:** [To be filled during testing]

**Pass/Fail:** [To be determined]

---

#### INT-004: Interview Invitation Sent to Applicant

**Test Type:** Integration
**Priority:** High
**Status:** Pending

**Objective:** Verify that interview scheduling triggers invitation to applicant.

**Prerequisites:**
- User logged in as Trustee
- No interview scheduled

**Test Steps:**
1. Navigate to application detail
2. Schedule interview with invitation enabled
3. Verify success message includes "Invitation sent to applicant"
4. Check notification logs:
   - Verify SMS sent with interview details
   - Verify Email sent with meeting link/location
   - Verify WhatsApp sent (if enabled)
5. Verify notification content:
   - Interview date and time
   - Mode (Online/Physical)
   - Meeting link (if online)
   - Location (if physical)

**Expected Results:**
- Interview invitation sent via SMS
- Interview invitation sent via Email
- WhatsApp notification sent (if enabled)
- Content includes all interview details

**Actual Results:** [To be filled during testing]

**Pass/Fail:** [To be determined]

---

#### INT-005: Interview Auto-Reminder Sent

**Test Type:** Integration
**Priority:** High
**Status:** Pending

**Objective:** Verify that auto-reminder is sent 24 hours before interview.

**Prerequisites:**
- Interview scheduled with auto-reminder enabled
- System time/scheduler functionality available

**Test Steps:**
1. Schedule interview with auto-reminder enabled
2. Verify reminder is scheduled (check job queue or notification logs)
3. Simulate time advancement to 24 hours before interview
4. Verify reminder is triggered
5. Check notification logs:
   - Verify SMS sent as reminder
   - Verify Email sent as reminder
   - Verify WhatsApp sent (if enabled)
6. Verify reminder content:
   - Interview date and time
   - Mode details
   - Meeting link/location

**Expected Results:**
- Auto-reminder triggered at correct time
- Reminder sent via SMS
- Reminder sent via Email
- WhatsApp notification sent (if enabled)

**Actual Results:** [To be filled during testing]

**Pass/Fail:** [To be determined]

---

#### INT-006: Final Approval Notification to Applicant

**Test Type:** Integration
**Priority:** High
**Status:** Pending

**Objective:** Verify that final approval triggers notification to applicant with credentials.

**Prerequisites:**
- User logged in as Trustee
- Application has PROVISIONALLY_APPROVED status

**Test Steps:**
1. Navigate to application detail
2. Issue final approval
3. Verify success message includes "Applicant notified"
4. Check notification logs:
   - Verify SMS sent with approval message
   - Verify Email sent with login credentials
   - Verify WhatsApp sent (if enabled)
5. Verify notification content:
   - Approval message
   - Login credentials (username)
   - Temporary password instructions
   - Dashboard URL
6. Verify credentials are NOT logged in audit trail (security)

**Expected Results:**
- Approval notification sent
- Login credentials sent
- Credentials secure (not in audit logs)

**Actual Results:** [To be filled during testing]

**Pass/Fail:** [To be determined]

---

#### INT-007: Final Approval Notification to Accounts

**Test Type:** Integration
**Priority:** High
**Status:** Pending

**Objective:** Verify that final approval triggers notification to Accounts team for room allocation.

**Prerequisites:**
- User logged in as Trustee
- Application has PROVISIONALLY_APPROVED status

**Test Steps:**
1. Navigate to application detail
2. Issue final approval
3. Verify success message includes "Accounts notified"
4. Check notification logs:
   - Verify notification sent to Accounts team
   - Verify notification includes application details
   - Verify notification indicates readiness for room allocation
5. Login as Accounts (if possible) or verify with Accounts team
6. Navigate to Accounts Dashboard
7. Verify application appears in "Room Allocation" queue

**Expected Results:**
- Accounts team notified
- Application visible in room allocation queue
- Ready for next workflow step

**Actual Results:** [To be filled during testing]

**Pass/Fail:** [To be determined]

---

#### INT-008: Rejection Notification Sent

**Test Type:** Integration
**Priority:** High
**Status:** Pending

**Objective:** Verify that rejection triggers notification to applicant.

**Prerequisites:**
- User logged in as Trustee
- Application in FORWARDED or INTERVIEW_COMPLETED status

**Test Steps:**
1. Navigate to application detail
2. Issue rejection (provisional or final)
3. Verify success message includes "Applicant notified"
4. Check notification logs:
   - Verify SMS sent with rejection message
   - Verify Email sent with rejection details
   - Verify WhatsApp sent (if enabled)
5. Verify notification content:
   - Rejection message
   - Reason for rejection (high-level)
   - No internal remarks or detailed rationale
6. Verify refund process triggered (if payment made)

**Expected Results:**
- Rejection notification sent
- Reason provided (high-level only)
- Refund triggered (if applicable)

**Actual Results:** [To be filled during testing]

**Pass/Fail:** [To be determined]

---

## Test Execution Summary

### Test Execution Status

| Category | Total Tests | Passed | Failed | Skipped | Pass Rate |
|-----------|-------------|---------|---------|----------|-----------|
| Navigation | 6 | 0 | 0 | 6 | 0% |
| Screen Rendering | 18 | 0 | 0 | 18 | 0% |
| User Flow | 15 | 0 | 0 | 15 | 0% |
| State Management | 10 | 0 | 0 | 10 | 0% |
| Data Separation | 7 | 0 | 0 | 7 | 0% |
| Audit Logging | 9 | 0 | 0 | 9 | 0% |
| Cross-Vertical Access | 5 | 0 | 0 | 5 | 0% |
| Integration | 8 | 0 | 0 | 8 | 0% |
| **TOTAL** | **78** | **0** | **0** | **78** | **0%** |

---

## Execution Instructions

### Pre-Test Setup

1. **Environment Setup:**
   - Ensure development server is running
   - Verify mock data is loaded (db.json)
   - Ensure test user accounts exist (Trustee, Student, Superintendent)

2. **Database/State Reset:**
   - Reset application states if needed between tests
   - Clear audit logs if needed (for isolated testing)

3. **Browser Configuration:**
   - Use Chrome or Firefox for testing
   - Enable DevTools for console inspection
   - Disable pop-up blockers (for modals)

---

### Test Execution Procedure

1. **Execute Tests by Category:**
   - Start with Navigation tests (NAV-001 to NAV-006)
   - Proceed to Screen Rendering tests (SCR-001 to SCR-018)
   - Continue with User Flow tests (FLOW-001 to FLOW-015)
   - Complete State Management tests (STATE-001 to STATE-010)
   - Run Data Separation tests (DATA-001 to DATA-007) - CRITICAL
   - Run Audit Logging tests (AUDIT-001 to AUDIT-009)
   - Run Cross-Vertical Access tests (VERT-001 to VERT-005)
   - Complete with Integration tests (INT-001 to INT-008)

2. **Record Results:**
   - For each test, fill in "Actual Results"
   - Mark Pass/Fail
   - Add comments or screenshots for failures

3. **Report Defects:**
   - Log any failures with detailed steps
   - Include screenshots or console errors
   - Assign priority based on test category (Critical > High > Medium)

---

### Success Criteria

**Task 13.1 is complete when:**
- ✅ All Navigation tests pass (6/6)
- ✅ All Screen Rendering tests pass (18/18)
- ✅ All User Flow tests pass (15/15)
- ✅ All State Management tests pass (10/10)
- ✅ All Data Separation tests pass (7/7) - CRITICAL
- ✅ All Audit Logging tests pass (9/9)
- ✅ All Cross-Vertical Access tests pass (5/5)
- ✅ All Integration tests pass (8/8)

**Overall Pass Rate:** 100% (78/78 tests)

---

## Notes and Observations

[Fill in during testing]

---

## Known Issues

[Document any issues found during testing]

---

## Recommendations

[Document recommendations for improvements based on testing results]

---

## Sign-Off

**Tested By:** _________________
**Date:** _________________
**Status:** ☐ Pending ☐ In Progress ☐ Complete ☐ Failed
**Reviewer:** _________________
**Review Date:** _________________
