# Role-Based Navigation Structure & Information Architecture

## Overview

This document defines the comprehensive role-based navigation structure and information architecture for the Jain Hostel Management Application. It covers all user roles, their content requirements, navigation flows, and technical implementation guidelines for Phase 1 db.json prototyping.

## Executive Summary

The application serves 6 distinct user roles across 3 verticals (Boys Hostel, Girls Ashram, Dharamshala) with a guest-first admission architecture. Each role has specific information needs, access patterns, and workflow requirements that drive the navigation structure.

## 1. Role-Based Content Inventory

### 1.1 Applicant (Pre-Approval, OTP-Based)

**Access Pattern:** Guest-first, no persistent account. OTP-verified sessions only.
**Primary Goals:** Submit application, track status, upload documents.
**Authentication:** Mobile OTP verification only.

#### Content Requirements:
- **Application Form**
  - Multi-step wizard (Personal Details → Academic Info → Hostel Preferences → References → Documents)
  - Progress indicator with save-as-draft capability
  - Vertical selection (Boys/Girls/Dharamshala) with routing logic
  - Document upload (PDF/JPG) with preview functionality
  - Strong inline validations and helper text

- **Status Tracking**
  - Public tracking page (Tracking ID + OTP verification)
  - Visual timeline: Draft → Submitted → Review → Interview → Approved/Rejected
  - Interview schedule details (if applicable)
  - Actionable prompts ("Interview link is active", "Pending document re-upload")
  - Download links for provisional letters

- **Document Management**
  - Upload signed documents (Student declaration, Parent consent, Local guardian undertaking)
  - Document preview before submission
  - Status indicators: Pending / Uploaded / Verified
  - Print-optimized layouts for audit and physical submission

#### Navigation Structure:
```
Landing Page
├── Select Vertical (Boys/Girls/Dharamshala)
├── Application Form
│   ├── Step 1: Personal Details
│   ├── Step 2: Academic & Course Information
│   ├── Step 3: Hostel Preferences
│   ├── Step 4: References
│   └── Step 5: Document Upload
├── Status Tracking (Public)
│   ├── Enter Tracking ID
│   ├── OTP Verification
│   └── Status View
└── Document Upload Portal
```

#### Entry Points:
- `/` (Landing Page) → "Apply Now" CTA
- `/apply/boys` → Boys Hostel Application
- `/apply/girls` → Girls Ashram Application
- `/apply/dharamshala` → Dharamshala Application
- `/status` → Application Status Tracking

---

### 1.2 Resident/Student (Post-Approval, Full Dashboard)

**Access Pattern:** Authenticated user with full dashboard access after approval.
**Primary Goals:** Manage stay, view fees, request leaves, access documents, renew stay.
**Authentication:** Email/password (generated after approval).

#### Content Requirements:
- **Dashboard (Central Command Center)**
  - High-level status tracker (Resident Journey): Checked-in → Renewal Due → Renewed → Exited
  - Quick action cards: Pay Fees, Download Letters, Apply for Leave, View Room Details
  - Notifications & alerts: Fee reminders, Renewal reminders (6-month cycle)
  - Upcoming deadlines and important dates

- **Fees & Payments**
  - Fee breakup: Processing fee, Hostel fees, Security deposit, Key deposit
  - Payment methods: UPI, QR Code
  - Status badges: Paid / Pending / Failed / Overdue
  - Receipt download (print-friendly)
  - Payment history with transaction details

- **Leave Management**
  - Apply for leave: Short leave, Night-out, Multi-day leave
  - Leave history with approval status
  - Parent notification status
  - Leave balance and policies

- **Room Information**
  - Current room number and sharing details
  - Joining date and check-in confirmation
  - Roommate information (if applicable)
  - Room facilities and amenities

- **Documents & Undertakings**
  - Download admission packets and legal documents
  - Digital acknowledgement history
  - Undertaking status and compliance tracking
  - Print-optimized document views

- **Renewal Process (6-Month Cycle)**
  - Renewal reminders and timeline
  - Re-upload updated certificates/marksheets
  - Fee top-up for renewal
  - Simplified approval workflow
  - Renewal consent prompts
  - Renewal status tracking

- **Exit Process**
  - Exit request submission
  - Clearance checklist: Room inventory, Key return, ID card return
  - Exit approval status
  - Exit certificate download (print-ready)

#### Navigation Structure:
```
Student Dashboard
├── Overview (Default Landing)
│   ├── Status Tracker
│   ├── Quick Actions
│   └── Notifications
├── Fees & Payments
│   ├── Outstanding Fees
│   ├── Payment History
│   ├── Receipts
│   └── Fee Structure
├── Leave Management
│   ├── Apply for Leave
│   ├── Leave History
│   └── Leave Policies
├── Room Information
│   ├── Current Room Details
│   ├── Roommate Info
│   └── Facilities
├── Documents
│   ├── Admission Packets
│   ├── Undertakings
│   ├── Certificates
│   └── Legal Documents
├── Renewal
│   ├── Current Status
│   ├── Apply for Renewal
│   ├── Document Updates
│   └── Renewal History
└── Exit Process
    ├── Apply for Exit
    ├── Clearance Status
    └── Exit Documents
```

#### Entry Points:
- `/login` → Role-based redirect to `/dashboard`
- `/dashboard` (Default landing after login)

---

### 1.3 Superintendent (Boys/Girls/Dharamshala Specific)

**Access Pattern:** Role-based authentication with vertical filtering.
**Primary Goals:** Review applications, schedule interviews, manage approvals, oversee operations.
**Authentication:** Email/password with role-based permissions.

#### Content Requirements:
- **Applications Queue**
  - Application list with filters: New, Under Review, Approved, Rejected
  - Vertical-specific filtering (Boys/Girls/Dharamshala)
  - Search and sort functionality
  - Bulk actions for common operations

- **Application Review**
  - Detailed application view: Student details, Uploaded documents, Payment status
  - Document verification tools
  - Actions: Approve, Reject, Forward to Trustees
  - Internal notes and comments system

- **Interview Scheduling**
  - Schedule physical or online interviews
  - Coordinate with Trustees for availability
  - Interview mode selection: Online (Zoom/Google Meet) or Physical
  - Date, time, location/meeting link management
  - Auto interview reminders (24 hours before)

- **Approval Workflow**
  - Provisional approval/rejection authority
  - Status update capabilities
  - Bulk communication tools
  - Approval history and audit trail

- **Leave Approvals**
  - Student leave request queue
  - Approval/rejection with remarks
  - Parent notification triggers
  - Leave policy configuration

- **Room Management**
  - Room matrix with capacity indicators
  - Allocate/change rooms
  - Occupancy status tracking
  - Room maintenance requests

- **Communication Hub**
  - Bulk notifications and announcements
  - Message templates (editable)
  - Communication logs (WhatsApp/SMS/Email history)
  - Fee reminder schedule management

- **Configuration & Admin**
  - Define leave approval rules
  - Define parent notification rules
  - Vertical-specific policy settings
  - User management for their vertical

#### Navigation Structure:
```
Superintendent Dashboard
├── Applications
│   ├── New Applications
│   ├── Under Review
│   ├── Interview Scheduled
│   ├── Approved
│   ├── Rejected
│   └── Application Details
│       ├── Student Information
│       ├── Documents Review
│       ├── Interview Scheduling
│       └── Actions (Approve/Reject/Forward)
├── Leave Management
│   ├── Pending Approvals
│   ├── Approved Leaves
│   ├── Leave History
│   └── Leave Policies
├── Room Management
│   ├── Room Allocation
│   ├── Occupancy Matrix
│   ├── Room Changes
│   └── Maintenance Requests
├── Communication
│   ├── Send Announcements
│   ├── Message Templates
│   ├── Communication Logs
│   └── Fee Reminders
└── Configuration
    ├── Vertical Settings
    ├── Approval Rules
    ├── Notification Rules
    └── User Management
```

#### Entry Points:
- `/login` → Role-based redirect to `/superintendent/applications`
- Vertical context automatically applied based on user assignment

---

### 1.4 Trustee

**Access Pattern:** Senior role with approval authority.
**Primary Goals:** Review forwarded applications, conduct interviews, final approvals.
**Authentication:** Email/password with elevated permissions.

#### Content Requirements:
- **Forwarded Applications**
  - High-priority applications from Superintendents
  - Cross-vertical access (can see all verticals)
  - Application priority indicators
  - Superintendent recommendations

- **Interview Management**
  - Scheduled interviews calendar view
  - Interview evaluation forms
  - Interview remarks and scoring
  - Meeting link management for online interviews

- **Final Approvals**
  - Final selection/rejection authority
  - Institutional approval workflows
  - Bulk approval capabilities
  - Decision documentation

- **Audit Trail**
  - Approval history across all verticals
  - Decision logs with timestamps
  - Authority tracking
  - Compliance reporting

#### Navigation Structure:
```
Trustee Dashboard
├── Applications
│   ├── Forwarded for Review
│   ├── Interview Queue
│   ├── Final Approvals
│   └── Application Details
│       ├── Superintendent Review
│       ├── Interview Evaluation
│       └── Final Decision
├── Interview Management
│   ├── Interview Calendar
│   ├── Scheduled Interviews
│   ├── Evaluation Forms
│   └── Interview History
├── Approvals
│   ├── Pending Final Approval
│   ├── Approved Applications
│   ├── Rejected Applications
│   └── Bulk Actions
└── Audit & Reports
    ├── Approval History
    ├── Decision Logs
    ├── Authority Reports
    └── Compliance Tracking
```

#### Entry Points:
- `/login` → Role-based redirect to `/trustee/applications`
- Cross-vertical access with vertical selector

---

### 1.5 Accounts/Accounting Team

**Access Pattern:** Financial role with payment tracking.
**Primary Goals:** Track receivables, generate receipts, financial reporting.
**Authentication:** Email/password with financial permissions.

#### Content Requirements:
- **Receivables Dashboard**
  - Outstanding payments overview
  - Overdue notices and escalations
  - Payment tracking by vertical
  - Financial KPIs and metrics

- **Payment Logs**
  - Transaction history with detailed records
  - Receipt generation under multiple heads
  - Payment method tracking
  - Failed payment analysis

- **Financial Exports**
  - Export-ready layouts for Tally integration
  - Financial reports for institutional records
  - Tax and compliance reporting
  - Custom report generation

- **Fee Structure Management**
  - Update pricing policies
  - Vertical-specific fee structures
  - Discount and scholarship management
  - Fee revision workflows

#### Navigation Structure:
```
Accounts Dashboard
├── Receivables
│   ├── Outstanding Payments
│   ├── Overdue Notices
│   ├── Payment Tracking
│   └── Financial KPIs
├── Payment Logs
│   ├── Transaction History
│   ├── Receipt Generation
│   ├── Payment Methods
│   └── Failed Payments
├── Reports & Exports
│   ├── Tally Integration
│   ├── Financial Reports
│   ├── Tax Reports
│   └── Custom Reports
└── Fee Management
    ├── Fee Structures
    ├── Pricing Updates
    ├── Discounts & Scholarships
    └── Fee Revisions
```

#### Entry Points:
- `/login` → Role-based redirect to `/accounts/receivables`
- Cross-vertical financial oversight

---

### 1.6 Parents/Local Guardians (View-Only, OTP-Based)

**Access Pattern:** OTP-verified, read-only access to ward's information.
**Primary Goals:** Monitor ward's status, view fees, track leave requests.
**Authentication:** Mobile OTP verification.

#### Content Requirements:
- **Ward Dashboard**
  - Student's current status overview
  - Room and accommodation details
  - Fees overview and payment status
  - Important notifications and alerts

- **Fee Information**
  - View outstanding fees and payment history
  - Receipt access and download
  - Payment due dates and reminders
  - Fee structure transparency

- **Leave Tracking**
  - View leave requests and approval status
  - Leave notifications and updates
  - Leave history and patterns
  - Emergency contact information

#### Navigation Structure:
```
Parent Dashboard
├── Ward Selection (if multiple children)
├── Ward Dashboard
│   ├── Status Overview
│   ├── Room Information
│   ├── Notifications
│   └── Quick Links
├── Fee Information
│   ├── Outstanding Fees
│   ├── Payment History
│   ├── Receipts
│   └── Due Dates
└── Leave Tracking
    ├── Current Leave Status
    ├── Leave History
    ├── Notifications
    └── Emergency Contacts
```

#### Entry Points:
- `/parent-login` → OTP verification → Ward selection → Dashboard
- Read-only access with notification preferences

---

## 2. Global Navigation Patterns

### 2.1 Navigation Hierarchy

#### Primary Navigation (Top Level)
- **Role-based sections:** Main functional areas for each role
- **User menu:** Profile, settings, logout
- **Notifications:** Real-time alerts and updates
- **Vertical selector:** For multi-vertical roles (Trustee, Accounts)

#### Secondary Navigation (Side/Sub Navigation)
- **Contextual subsections:** Detailed areas within main sections
- **Expandable/collapsible:** Space-efficient navigation
- **Badge indicators:** Pending items, notifications
- **Search functionality:** Quick access to specific items

#### Tertiary Navigation (Breadcrumbs/Tabs)
- **Breadcrumbs:** Deep navigation context
- **Tabs:** Alternative views within same section
- **Filters:** Data refinement options
- **Pagination:** Large dataset navigation

### 2.2 Responsive Navigation Patterns

#### Desktop (1024px+)
- Full side navigation with expandable sections
- Top navigation bar with user menu
- Breadcrumbs for deep navigation
- Persistent vertical selector

#### Tablet (768px - 1023px)
- Collapsed side navigation with tooltips
- Top navigation remains visible
- Drawer navigation for secondary items
- Touch-friendly interaction targets

#### Mobile (320px - 767px)
- Hamburger menu with drawer navigation
- Bottom navigation for primary actions
- Swipe gestures for navigation
- Optimized for thumb navigation

### 2.3 Accessibility Navigation Features

#### Keyboard Navigation
- Tab order follows logical flow
- Skip links for main content
- Arrow keys for dropdown navigation
- Enter/Space for activation
- Escape for closing menus/modals

#### Screen Reader Support
- Navigation landmarks properly labeled
- ARIA attributes for dynamic content
- Role-based content announcements
- Alternative text for all icons

#### High Contrast Support
- Sufficient color contrast ratios
- Focus indicators clearly visible
- Alternative visual cues beyond color
- Scalable text and interface elements

---

## 3. Vertical Context Propagation

### 3.1 Vertical Selection Impact

The vertical selection (Boys Hostel, Girls Ashram, Dharamshala) affects content, labels, and data filtering across all dashboards and interfaces.

#### Navigation Labels by Vertical
- **Boys Hostel:** "Boys Hostel Applications", "Boys Hostel Rooms", "Boys Hostel Configuration"
- **Girls Ashram:** "Girls Ashram Applications", "Girls Ashram Rooms", "Girls Ashram Configuration"
- **Dharamshala:** "Dharamshala Applications", "Dharamshala Rooms", "Dharamshala Configuration"

#### Data Filtering Rules
1. **Applications:** Filtered by selected vertical
2. **Rooms:** Show only rooms in selected vertical
3. **Students:** Show only students in selected vertical
4. **Superintendents:** Can only access their assigned vertical
5. **Fees/Payments:** Filtered by vertical-specific pricing
6. **Documents:** Vertical-specific templates and undertakings

#### UI Theme Variations
```typescript
const verticalThemes = {
  boys: {
    primaryColor: '#1e40af', // Blue
    secondaryColor: '#dbeafe',
    accentColor: '#fbbf24', // Yellow accent
    logoText: 'Boys Hostel'
  },
  girls: {
    primaryColor: '#7c3aed', // Purple
    secondaryColor: '#ede9fe',
    accentColor: '#f59e0b', // Orange accent
    logoText: 'Girls Ashram'
  },
  dharamshala: {
    primaryColor: '#059669', // Green
    secondaryColor: '#d1fae5',
    accentColor: '#d97706', // Amber accent
    logoText: 'Dharamshala'
  }
};
```

### 3.2 Role-Based Vertical Access

#### Vertical Assignment Rules
- **Superintendents:** Assigned to specific vertical, cannot switch
- **Trustees:** Can access all verticals with selector
- **Accounts:** Can access all verticals for financial oversight
- **Students:** Assigned to one vertical, cannot switch
- **Parents:** View vertical context in ward information
- **Applicants:** Select vertical during application process

#### Cross-Vertical Access Matrix
| Role | Boys Hostel | Girls Ashram | Dharamshala | Switch Capability |
|------|-------------|--------------|-------------|-------------------|
| Applicant | ✅ (Selection) | ✅ (Selection) | ✅ (Selection) | ❌ (One-time) |
| Student | ✅ (Assigned) | ❌ | ❌ | ❌ |
| Superintendent | ✅ (Assigned) | ❌ | ❌ | ❌ |
| Trustee | ✅ | ✅ | ✅ | ✅ |
| Accounts | ✅ | ✅ | ✅ | ✅ |
| Parent | ✅ (Ward-based) | ✅ (Ward-based) | ✅ (Ward-based) | ❌ (Read-only) |

---

## 4. User Flow Diagrams

### 4.1 Applicant Journey
```
Landing Page → Select Vertical → Application Form → OTP Verify → Submit
                                            ↓
Status Check → Tracking ID + OTP → Status View → Interview → Final Decision
```

### 4.2 Student Lifecycle
```
Application → Approval → Account Creation → Dashboard Access
     ↓              ↓              ↓              ↓
  Tracking      Interview      Password Set     Full Access
     ↓              ↓              ↓              ↓
Status Updates  Evaluation    First Login    Daily Usage
```

### 4.3 Approval Workflow
```
Application → Superintendent Review → Interview Schedule → Trustee Review → Final Decision
     ↓              ↓                        ↓                   ↓              ↓
   Draft         Pending                  Scheduled         Evaluation    Approved/Rejected
```

### 4.4 Leave Request Flow
```
Student Request → Superintendent Review → Approval/Rejection → Parent Notification
       ↓                    ↓                      ↓                    ↓
   Form Submit         Queue Review           Status Update        SMS/Email
```

### 4.5 Renewal Process Flow
```
Renewal Due (30 days) → Student Notification → Renewal Application → Review → Approval
         ↓                      ↓                      ↓              ↓         ↓
   Dashboard Alert        Email/SMS              Document Update    Queue    New Term
```

---

## 5. Global Sitemap

### 5.1 Public/Guest Routes
```
/ (Landing Page)
├── /apply/boys (Boys Hostel Application)
├── /apply/girls (Girls Ashram Application)
├── /apply/dharamshala (Dharamshala Application)
├── /status (Application Status Check)
├── /login (Staff Login)
└── /parent-login (Parent OTP Login)
```

### 5.2 Student Routes (Authenticated)
```
/dashboard (Default landing)
├── /fees
│   ├── /fees/outstanding
│   ├── /fees/history
│   └── /fees/receipts
├── /leave
│   ├── /leave/request
│   ├── /leave/history
│   └── /leave/policies
├── /room
│   ├── /room/details
│   ├── /room/roommates
│   └── /room/facilities
├── /documents
│   ├── /documents/admission
│   ├── /documents/undertakings
│   └── /documents/certificates
├── /renewal
│   ├── /renewal/status
│   ├── /renewal/apply
│   └── /renewal/history
└── /exit
    ├── /exit/apply
    ├── /exit/clearance
    └── /exit/documents
```

### 5.3 Superintendent Routes (Role-Based, Vertical-Filtered)
```
/superintendent
├── /superintendent/applications
│   ├── /superintendent/applications/new
│   ├── /superintendent/applications/review
│   ├── /superintendent/applications/interview
│   ├── /superintendent/applications/approved
│   ├── /superintendent/applications/rejected
│   └── /superintendent/applications/[id]
│       ├── /superintendent/applications/[id]/review
│       ├── /superintendent/applications/[id]/interview
│       └── /superintendent/applications/[id]/decision
├── /superintendent/leaves
│   ├── /superintendent/leaves/pending
│   ├── /superintendent/leaves/approved
│   └── /superintendent/leaves/history
├── /superintendent/rooms
│   ├── /superintendent/rooms/allocation
│   ├── /superintendent/rooms/occupancy
│   └── /superintendent/rooms/maintenance
├── /superintendent/communication
│   ├── /superintendent/communication/announcements
│   ├── /superintendent/communication/templates
│   └── /superintendent/communication/logs
└── /superintendent/config
    ├── /superintendent/config/policies
    ├── /superintendent/config/notifications
    └── /superintendent/config/users
```

### 5.4 Trustee Routes
```
/trustee
├── /trustee/applications
│   ├── /trustee/applications/forwarded
│   ├── /trustee/applications/interview
│   ├── /trustee/applications/final-approval
│   └── /trustee/applications/[id]
│       ├── /trustee/applications/[id]/review
│       ├── /trustee/applications/[id]/interview
│       └── /trustee/applications/[id]/decision
├── /trustee/interviews
│   ├── /trustee/interviews/calendar
│   ├── /trustee/interviews/scheduled
│   └── /trustee/interviews/[id]/evaluation
└── /trustee/audit
    ├── /trustee/audit/approvals
    ├── /trustee/audit/decisions
    └── /trustee/audit/reports
```

### 5.5 Accounts Routes
```
/accounts
├── /accounts/receivables
│   ├── /accounts/receivables/outstanding
│   ├── /accounts/receivables/overdue
│   └── /accounts/receivables/tracking
├── /accounts/payments
│   ├── /accounts/payments/logs
│   ├── /accounts/payments/receipts
│   └── /accounts/payments/failed
├── /accounts/reports
│   ├── /accounts/reports/financial
│   ├── /accounts/reports/tally
│   └── /accounts/reports/custom
└── /accounts/fees
    ├── /accounts/fees/structure
    ├── /accounts/fees/updates
    └── /accounts/fees/discounts
```

### 5.6 Parent Routes (OTP-Verified, Read-Only)
```
/parent
├── /parent/login (OTP verification)
├── /parent/select-ward (if multiple children)
└── /parent/[ward-id]
    ├── /parent/[ward-id]/dashboard
    ├── /parent/[ward-id]/fees
    └── /parent/[ward-id]/leave
```

### 5.7 Future Module Routes (Placeholder - Disabled)
```
/biometric (Future: Access control)
/visitor (Future: Guest management)
/mess (Future: Dining management)
```

---

## 6. Role Access Matrix

### 6.1 Route Protection Rules

| Route Pattern | Applicant | Student | Superintendent | Trustee | Accounts | Parent |
|---------------|-----------|---------|----------------|---------|----------|--------|
| `/` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/apply/*` | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `/status` | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `/login` | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| `/parent-login` | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| `/dashboard` | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| `/fees/*` | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| `/leave/*` | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| `/room/*` | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| `/documents/*` | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| `/renewal/*` | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| `/exit/*` | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| `/superintendent/*` | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| `/trustee/*` | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| `/accounts/*` | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| `/parent/*` | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |

### 6.2 Data Access Permissions

| Data Type | Applicant | Student | Superintendent | Trustee | Accounts | Parent |
|-----------|-----------|---------|----------------|---------|----------|--------|
| Own Application | ✅ (Read) | ✅ (Read) | ❌ | ❌ | ❌ | ❌ |
| All Applications | ❌ | ❌ | ✅ (Vertical) | ✅ (All) | ❌ | ❌ |
| Student Data | ❌ | ✅ (Own) | ✅ (Vertical) | ✅ (All) | ❌ | ✅ (Ward) |
| Financial Data | ❌ | ✅ (Own) | ❌ | ❌ | ✅ (All) | ✅ (Ward) |
| Room Data | ❌ | ✅ (Own) | ✅ (Vertical) | ✅ (All) | ❌ | ✅ (Ward) |
| Leave Data | ❌ | ✅ (Own) | ✅ (Vertical) | ❌ | ❌ | ✅ (Ward) |
| Documents | ✅ (Own) | ✅ (Own) | ✅ (Vertical) | ✅ (All) | ❌ | ✅ (Ward) |
| Audit Logs | ❌ | ❌ | ✅ (Vertical) | ✅ (All) | ✅ (Financial) | ❌ |

---

## 7. Entry Point Mapping

### 7.1 Authentication Flow Entry Points

#### Public Entry Points
- **Landing Page (`/`):** Primary entry for all users
  - "Apply Now" → Applicant flow
  - "Check Status" → Status tracking
  - "Staff Login" → Role-based authentication
  - "Parent Login" → Parent OTP flow

#### Role-Based Login Redirects
```typescript
const getLoginRedirect = (userRole: UserRole): string => {
  switch (userRole) {
    case 'student':
      return '/dashboard';
    case 'superintendent':
      return '/superintendent/applications';
    case 'trustee':
      return '/trustee/applications';
    case 'accounts':
      return '/accounts/receivables';
    default:
      return '/';
  }
};
```

#### Parent Login Flow
```
/parent-login → OTP Verification → Ward Selection (if multiple) → Dashboard
```

### 7.2 Deep Link Entry Points

#### Application Tracking
- **Direct Status Check:** `/status?tracking=ABC123` → Auto-populate tracking ID
- **Email Links:** Status update emails contain direct links to status page

#### Interview Links
- **Interview Invitations:** `/interview/join?token=xyz` → Direct interview access
- **Trustee Interview Dashboard:** `/trustee/interviews/[id]` → Specific interview

#### Document Access
- **Student Documents:** `/documents/admission?download=true` → Direct download
- **Receipt Links:** `/fees/receipts/[id]` → Specific receipt view

#### Emergency Access
- **Parent Emergency:** `/parent/emergency?ward=[id]&otp=auto` → Quick access during emergencies
- **Staff Emergency:** `/emergency/contact` → Emergency contact information

---

## 8. Technical Implementation Guidelines

### 8.1 Frontend Routing (Next.js App Router)

#### Route Structure
```typescript
// app/layout.tsx - Root layout with role detection
// app/(public)/layout.tsx - Public pages layout
// app/(auth)/layout.tsx - Authenticated pages layout
// app/(roles)/[role]/layout.tsx - Role-specific layouts

// Route examples:
// app/(public)/page.tsx - Landing page
// app/(public)/apply/[vertical]/page.tsx - Application form
// app/(public)/status/page.tsx - Status tracking
// app/(auth)/dashboard/page.tsx - Student dashboard
// app/(auth)/superintendent/applications/page.tsx - Superintendent applications
```

#### Route Guards Implementation
```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('auth-token');
  
  // Public routes
  if (pathname.startsWith('/apply') || pathname === '/status') {
    return NextResponse.next();
  }
  
  // Protected routes
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/superintendent')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    
    // Role-based access validation
    const userRole = validateToken(token);
    if (!hasAccess(userRole, pathname)) {
      return NextResponse.redirect(new URL('/403', request.url));
    }
  }
  
  return NextResponse.next();
}
```

### 8.2 State Management

#### Navigation State
```typescript
interface NavigationState {
  currentRole: UserRole | null;
  selectedVertical: HostelVertical;
  breadcrumbs: BreadcrumbItem[];
  notifications: Notification[];
  sidebarCollapsed: boolean;
}

const useNavigation = () => {
  const [state, setState] = useState<NavigationState>({
    currentRole: null,
    selectedVertical: 'boys',
    breadcrumbs: [],
    notifications: [],
    sidebarCollapsed: false
  });
  
  const updateVertical = (vertical: HostelVertical) => {
    setState(prev => ({ ...prev, selectedVertical: vertical }));
    // Persist to localStorage
    localStorage.setItem('selectedVertical', vertical);
  };
  
  return { state, updateVertical };
};
```

#### Role Context
```typescript
interface RoleContextType {
  user: User | null;
  role: UserRole | null;
  permissions: Permission[];
  vertical: HostelVertical;
  canAccess: (resource: string) => boolean;
  canSwitchVertical: () => boolean;
}

const RoleContext = createContext<RoleContextType | null>(null);

export const useRole = () => {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error('useRole must be used within RoleProvider');
  }
  return context;
};
```

### 8.3 Component Architecture

#### Navigation Components
```typescript
// components/navigation/RoleBasedNav.tsx
interface RoleBasedNavProps {
  role: UserRole;
  vertical?: HostelVertical;
  collapsed?: boolean;
  onVerticalChange?: (vertical: HostelVertical) => void;
}

export function RoleBasedNav({ role, vertical, collapsed, onVerticalChange }: RoleBasedNavProps) {
  const navItems = getNavItemsForRole(role);
  
  return (
    <nav className={cn('role-nav', `role-nav--${role}`, collapsed && 'collapsed')}>
      {/* Vertical selector for multi-vertical roles */}
      {canSwitchVertical(role) && (
        <VerticalSelector value={vertical} onChange={onVerticalChange} />
      )}
      
      {/* Navigation items */}
      {navItems.map(item => (
        <NavItem key={item.id} {...item} vertical={vertical} />
      ))}
    </nav>
  );
}
```

#### Route Protection Component
```typescript
// components/auth/ProtectedRoute.tsx
interface ProtectedRouteProps {
  allowedRoles: UserRole[];
  requiredPermissions?: Permission[];
  children: React.ReactNode;
}

export function ProtectedRoute({ allowedRoles, requiredPermissions, children }: ProtectedRouteProps) {
  const { user, role, permissions } = useRole();
  const router = useRouter();
  
  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    
    if (!allowedRoles.includes(role)) {
      router.push('/403');
      return;
    }
    
    if (requiredPermissions && !hasPermissions(permissions, requiredPermissions)) {
      router.push('/403');
      return;
    }
  }, [user, role, permissions]);
  
  if (!user || !allowedRoles.includes(role)) {
    return <LoadingSpinner />;
  }
  
  return <>{children}</>;
}
```

### 8.4 Responsive Navigation Implementation

#### Mobile Navigation
```typescript
// components/navigation/MobileNav.tsx
export function MobileNav({ role, vertical }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <>
      {/* Mobile header */}
      <header className="mobile-nav-header">
        <button onClick={() => setIsOpen(true)}>
          <HamburgerIcon />
        </button>
        <VerticalBadge vertical={vertical} />
        <UserMenu />
      </header>
      
      {/* Mobile drawer */}
      <Drawer isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <RoleBasedNav role={role} vertical={vertical} />
      </Drawer>
      
      {/* Bottom navigation for primary actions */}
      <BottomNav role={role} />
    </>
  );
}
```

#### Responsive Breakpoints
```css
/* Navigation responsive styles */
.role-nav {
  @media (max-width: 767px) {
    /* Mobile: Drawer navigation */
    position: fixed;
    top: 0;
    left: -100%;
    width: 280px;
    height: 100vh;
    transition: left 0.3s ease;
    
    &.open {
      left: 0;
    }
  }
  
  @media (min-width: 768px) and (max-width: 1023px) {
    /* Tablet: Collapsed sidebar */
    width: 64px;
    
    .nav-label {
      display: none;
    }
  }
  
  @media (min-width: 1024px) {
    /* Desktop: Full sidebar */
    width: 240px;
  }
}
```

---

## 9. Phase 1 Implementation Priorities

### 9.1 Critical Path Components

#### Week 1: Core Navigation Infrastructure
1. **RoleBasedNav Component**
   - Basic navigation structure
   - Role-based item filtering
   - Vertical context support

2. **Route Protection**
   - Authentication middleware
   - Role-based access guards
   - Redirect logic implementation

3. **Layout Components**
   - Public layout (landing, application)
   - Authenticated layout (dashboards)
   - Role-specific layouts

#### Week 2: Role-Specific Navigation
1. **Student Navigation**
   - Dashboard navigation
   - Quick action cards
   - Status indicators

2. **Superintendent Navigation**
   - Application queue navigation
   - Vertical filtering
   - Bulk action interfaces

3. **Applicant Flow Navigation**
   - Multi-step form navigation
   - Progress indicators
   - Status tracking interface

#### Week 3: Advanced Features
1. **Responsive Navigation**
   - Mobile drawer implementation
   - Tablet collapsed sidebar
   - Touch-friendly interactions

2. **Accessibility Features**
   - Keyboard navigation
   - Screen reader support
   - Focus management

3. **Vertical Context**
   - Theme switching
   - Data filtering
   - Label customization

### 9.2 db.json Mock Data Structure

#### Navigation Data
```json
{
  "navigation": {
    "student": [
      {
        "id": "dashboard",
        "label": "Dashboard",
        "href": "/dashboard",
        "icon": "dashboard",
        "badge": null
      },
      {
        "id": "fees",
        "label": "Fees & Payments",
        "href": "/fees",
        "icon": "payment",
        "badge": 2
      }
    ],
    "superintendent": [
      {
        "id": "applications",
        "label": "Applications",
        "href": "/superintendent/applications",
        "icon": "clipboard",
        "badge": 15,
        "children": [
          {
            "id": "new",
            "label": "New Applications",
            "href": "/superintendent/applications/new",
            "badge": 8
          }
        ]
      }
    ]
  },
  "verticals": [
    {
      "id": "boys",
      "name": "Boys Hostel",
      "theme": {
        "primary": "#1e40af",
        "secondary": "#dbeafe",
        "accent": "#fbbf24"
      }
    }
  ]
}
```

#### User Roles and Permissions
```json
{
  "users": [
    {
      "id": "user-1",
      "email": "student@example.com",
      "role": "student",
      "vertical": "boys",
      "permissions": ["view_own_data", "request_leave", "pay_fees"]
    },
    {
      "id": "user-2",
      "email": "super@example.com",
      "role": "superintendent",
      "vertical": "boys",
      "permissions": ["review_applications", "approve_leaves", "manage_rooms"]
    }
  ]
}
```

### 9.3 Testing Strategy

#### Navigation Testing Checklist
- [ ] Role-based navigation items display correctly
- [ ] Unauthorized routes redirect appropriately
- [ ] Vertical context applies consistently
- [ ] Mobile navigation functions properly
- [ ] Keyboard navigation works
- [ ] Screen reader compatibility
- [ ] Performance under load

#### User Flow Testing
- [ ] Applicant can complete application flow
- [ ] Student can access all dashboard features
- [ ] Superintendent can review applications
- [ ] Trustee can conduct interviews
- [ ] Accounts can track payments
- [ ] Parents can view ward information

---

## 10. Future Enhancements

### 10.1 Advanced Navigation Features

#### Smart Navigation
- **Contextual suggestions:** Based on user behavior and pending tasks
- **Quick actions:** Floating action button for common tasks
- **Search integration:** Global search across all accessible content
- **Recent items:** Quick access to recently viewed pages

#### Personalization
- **Customizable dashboards:** User-configurable widget layouts
- **Navigation preferences:** Collapsible sections, favorite items
- **Theme customization:** Dark mode, high contrast options
- **Language support:** Multi-language navigation labels

#### Analytics Integration
- **Navigation analytics:** Track user paths and pain points
- **Performance monitoring:** Navigation load times and errors
- **User behavior insights:** Most used features and workflows
- **A/B testing:** Navigation layout and flow optimization

### 10.2 Mobile App Considerations

#### Native App Navigation
- **Tab-based navigation:** Bottom tabs for primary sections
- **Stack navigation:** Hierarchical page navigation
- **Drawer navigation:** Side menu for secondary features
- **Deep linking:** Direct access to specific screens

#### Progressive Web App (PWA)
- **Offline navigation:** Cached navigation structure
- **Push notifications:** Navigation to relevant content
- **App-like experience:** Native-feeling navigation patterns
- **Installation prompts:** Add to home screen functionality

---

## Conclusion

This comprehensive role-based navigation structure and information architecture provides a solid foundation for implementing the Jain Hostel Management Application. The design prioritizes user experience, accessibility, and institutional requirements while maintaining scalability for future enhancements.

The architecture supports the guest-first admission flow, role-based access control, and vertical context propagation essential for the application's success. Implementation should follow the phased approach outlined, with continuous testing and validation throughout the development process.

Regular review and updates of this architecture will ensure it continues to meet evolving user needs and business requirements as the application grows and matures.