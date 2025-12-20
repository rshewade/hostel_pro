# Information Architecture: Role-Based Navigation & Content Inventory

## Overview
This document defines the global information architecture and navigation structure for the Hostel Management Application, covering all user roles and their access patterns.

## User Roles & Access Patterns

### 1. Applicant (Pre-Approval, OTP-Based)
**Access Pattern:** Guest-first, no persistent account. OTP-verified sessions only.
**Primary Goals:** Submit application, track status, upload documents.

**Content Inventory:**
- Application Form (Admission form with personal details, documents)
- Status Tracking (Check application status via Tracking ID + OTP)
- Document Upload (PDF/JPG uploads for required documents)
- OTP Verification (Mobile number verification)

**Navigation Flow:**
- Landing Page → Select Vertical (Boys/Girls/Dharamshala) → Application Form
- Status Check → Enter Tracking ID → OTP Verification → Status View

### 2. Resident Student (Post-Approval, Full Dashboard)
**Access Pattern:** Authenticated user with full dashboard access after approval.
**Primary Goals:** Manage stay, view fees, request leaves, access documents, renew stay.

**Content Inventory:**
- Dashboard (Overview: fees due, leave status, room info, upcoming renewals)
- Fees & Payments (View outstanding fees, payment history, receipts)
- Leave Management (Request leave, view approval status, parent notifications)
- Room Information (Current room details, roommate info, facilities)
- Documents (Download legal documents, admission packets, undertakings)
- Renewal Process (6-month renewal applications, document updates)
- Exit Process (Exit application, final clearance, alumni status)

**Navigation Flow:**
- Login → Dashboard (default landing)
- Dashboard widgets link to detailed sections
- Breadcrumb navigation for deep sections

### 3. Superintendent (Boys/Girls/Dharamshala Specific)
**Access Pattern:** Role-based authentication with vertical filtering.
**Primary Goals:** Review applications, schedule interviews, manage approvals, oversee operations.

**Content Inventory:**
- Applications Queue (Filtered by vertical, status: new/pending/review/interview)
- Application Review (Candidate details, documents, eligibility verification)
- Interview Scheduling (Physical/online interview setup with Trustee coordination)
- Approval Workflow (Approve/reject with comments, status updates)
- Leave Approvals (Review student leave requests)
- Room Management (Room allocation, occupancy tracking)
- Communication Hub (Bulk notifications, announcements)
- Configuration (Vertical-specific settings, policies)

**Navigation Flow:**
- Login → Dashboard with vertical selector
- Primary nav: Applications, Leaves, Rooms, Communication, Config
- Vertical context applied to all views

### 4. Trustee
**Access Pattern:** Senior role with approval authority.
**Primary Goals:** Review forwarded applications, conduct interviews, final approvals.

**Content Inventory:**
- Forwarded Applications (High-priority applications from Superintendents)
- Interview Management (Scheduled interviews, evaluation forms)
- Final Approvals (Approve/reject with institutional authority)
- Audit Trail (View approval history, decision logs)

**Navigation Flow:**
- Login → Applications Queue
- Interview Calendar → Evaluation Forms
- Approval Dashboard

### 5. Accounts/Accounting Team
**Access Pattern:** Financial role with payment tracking.
**Primary Goals:** Track receivables, generate receipts, financial reporting.

**Content Inventory:**
- Receivables Dashboard (Outstanding payments, overdue notices)
- Payment Logs (Transaction history, receipts)
- Financial Exports (Reports for institutional records)
- Fee Structure Management (Update pricing, policies)

**Navigation Flow:**
- Login → Receivables Overview
- Payment tracking → Detailed logs
- Export tools for accounting

### 6. Parents/Local Guardians (View-Only, OTP-Based)
**Access Pattern:** OTP-verified, read-only access to ward's information.
**Primary Goals:** Monitor ward's status, view fees, track leave requests.

**Content Inventory:**
- Ward Dashboard (Student's current status, room, fees overview)
- Fee Information (View outstanding fees, payment history)
- Leave Tracking (View leave requests, approval status, notifications)

**Navigation Flow:**
- OTP Login → Select Ward → Dashboard
- Read-only views with parent notifications

## Global Navigation Patterns

### Navigation Types
- **Top Navigation:** Primary role-based sections
- **Side Navigation:** Detailed subsections within main areas
- **Breadcrumbs:** Deep navigation context (e.g., Dashboard > Fees > Payment History)
- **Role-Based Filtering:** Navigation items shown/hidden based on permissions

### Vertical Context
- Boys Hostel / Girls Ashram / Dharamshala selection
- Applied consistently across all dashboards
- Labels and filters updated based on vertical
- Content tailored to vertical-specific policies

### Future Module Placeholders
- Biometric Management (disabled)
- Visitor Management (disabled)
- Mess Management (disabled)
- Placed in navigation but visually disabled for scalability

## Login & Redirection Rules

### Entry Points
1. **Public Landing:** Apply / Check Status / Staff Login
2. **Staff Login:** Email/password → Role-based redirect
3. **Parent Access:** Mobile OTP → Ward selection

### Role-Based Redirects
- Superintendent → Applications dashboard (vertical-specific)
- Trustee → Interview queue
- Accounts → Receivables dashboard
- Student → Personal dashboard
- Parent → Ward selection → Dashboard

## User Flow Diagrams

### Applicant Journey
```
Landing → Select Vertical → Application Form → OTP Verify → Submit
                                           ↓
Status Check → Tracking ID + OTP → Status View
```

### Student Lifecycle
```
Application → Approval → Account Creation → Dashboard Access
    ↓              ↓              ↓              ↓
Tracking      Interview      Password Set     Full Access
```

### Approval Workflow
```
Application → Superintendent Review → Interview Schedule → Trustee Review → Approval/Rejection
     ↓              ↓                        ↓                   ↓
   Draft         Pending                   Scheduled         Final Status
```

## Global Sitemap

### Public/Guest Routes
```
/ (Landing Page)
/apply/[vertical] (Boys|Girls|Dharamshala)
/status (Status Check)
/login (Staff Login)
/parent-login (Parent OTP Login)
```

### Student Routes (Authenticated)
/dashboard
/fees
  /fees/history
  /fees/receipts
/leave
  /leave/request
  /leave/history
/room
/documents
  /documents/admission
  /documents/undertakings
/renewal
  /renewal/apply
  /renewal/status
/exit
  /exit/apply
  /exit/status

### Superintendent Routes (Role-Based, Vertical-Filtered)
/superintendent
  /superintendent/applications
    /superintendent/applications/[id] (Review)
    /superintendent/applications/[id]/interview (Schedule)
  /superintendent/leaves
  /superintendent/rooms
  /superintendent/communication
  /superintendent/config

### Trustee Routes
/trustee
  /trustee/applications
    /trustee/applications/[id] (Review & Approve)
  /trustee/interviews
    /trustee/interviews/schedule
    /trustee/interviews/[id] (Evaluation)

### Accounts Routes
/accounts
  /accounts/receivables
  /accounts/logs
  /accounts/exports

### Parent Routes (OTP-Verified, Read-Only)
/parent
  /parent/select-ward
  /parent/[ward-id]/dashboard
  /parent/[ward-id]/fees
  /parent/[ward-id]/leave

### Future Modules (Placeholder Routes - Disabled)
/biometric (Future: Access control)
/visitor (Future: Guest management)
/mess (Future: Dining management)

## Navigation Patterns & Component Design

### Navigation Hierarchy
1. **Top Navigation Bar:** Primary role-based sections, user menu, notifications
2. **Side Navigation:** Detailed subsections within main areas (expandable/collapsible)
3. **Breadcrumbs:** Context for deep navigation (Home > Section > Subsection > Page)
4. **Tabs:** Alternative views within the same section (e.g., Active vs. Archived applications)

### Role-Based Navigation Components

#### Student Navigation
```tsx
// Top Nav: Dashboard, Fees, Leave, Room, Documents, Renewal, Exit
// Side Nav: Contextual sub-items based on active top nav
<StudentNav role="student" vertical={selectedVertical}>
  <NavItem href="/dashboard" icon="dashboard" label="Dashboard" />
  <NavItem href="/fees" icon="payment" label="Fees & Payments" />
  <NavItem href="/leave" icon="calendar" label="Leave Management" />
  <NavItem href="/room" icon="bed" label="Room Information" />
  <NavItem href="/documents" icon="file" label="Documents" />
  <NavItem href="/renewal" icon="refresh" label="Renewal" />
  <NavItem href="/exit" icon="logout" label="Exit Process" />
</StudentNav>
```

#### Superintendent Navigation
```tsx
// Top Nav: Applications, Leaves, Rooms, Communication, Config
// Filtered by vertical context
<SuperintendentNav role="superintendent" vertical={selectedVertical}>
  <NavItem href="/superintendent/applications" icon="clipboard" label="Applications" badge={pendingCount} />
  <NavItem href="/superintendent/leaves" icon="calendar" label="Leave Approvals" />
  <NavItem href="/superintendent/rooms" icon="building" label="Room Management" />
  <NavItem href="/superintendent/communication" icon="message" label="Communication" />
  <NavItem href="/superintendent/config" icon="settings" label="Configuration" />
</SuperintendentNav>
```

#### Trustee Navigation
```tsx
// Top Nav: Applications, Interviews
<TrusteeNav role="trustee">
  <NavItem href="/trustee/applications" icon="clipboard-check" label="Review Applications" />
  <NavItem href="/trustee/interviews" icon="users" label="Interview Management" />
</TrusteeNav>
```

#### Accounts Navigation
```tsx
// Top Nav: Receivables, Logs, Exports
<AccountsNav role="accounts">
  <NavItem href="/accounts/receivables" icon="dollar" label="Receivables" />
  <NavItem href="/accounts/logs" icon="list" label="Payment Logs" />
  <NavItem href="/accounts/exports" icon="download" label="Exports" />
</AccountsNav>
```

#### Parent Navigation
```tsx
// Minimal nav after ward selection
<ParentNav role="parent" wardId={selectedWard}>
  <NavItem href={`/parent/${wardId}/dashboard`} icon="eye" label="Dashboard" />
  <NavItem href={`/parent/${wardId}/fees`} icon="dollar" label="Fees" />
  <NavItem href={`/parent/${wardId}/leave`} icon="calendar" label="Leave Status" />
</ParentNav>
```

### Conditional Styling & Props

#### Role-Based Styling
```tsx
const getNavStyles = (role: UserRole) => {
  const baseStyles = {
    backgroundColor: 'bg-white',
    textColor: 'text-blue-900',
    hoverColor: 'hover:bg-blue-50',
    activeColor: 'bg-blue-100 text-blue-900'
  };

  const roleVariants = {
    student: { ...baseStyles },
    superintendent: { ...baseStyles, accentColor: 'text-yellow-700' },
    trustee: { ...baseStyles, accentColor: 'text-red-700' },
    accounts: { ...baseStyles, accentColor: 'text-green-700' },
    parent: { ...baseStyles, readOnly: true }
  };

  return roleVariants[role] || baseStyles;
};
```

#### Vertical Context Styling
```tsx
const getVerticalStyles = (vertical: HostelVertical) => {
  const verticalThemes = {
    boys: { primary: 'blue', secondary: 'blue-50' },
    girls: { primary: 'purple', secondary: 'purple-50' },
    dharamshala: { primary: 'green', secondary: 'green-50' }
  };

  return verticalThemes[vertical];
};
```

### Navigation Component Props Interface
```tsx
interface NavigationProps {
  role: UserRole;
  vertical?: HostelVertical;
  userName: string;
  notifications?: Notification[];
  onLogout: () => void;
  onVerticalChange?: (vertical: HostelVertical) => void;
  className?: string;
}

interface NavItemProps {
  href: string;
  icon: IconName;
  label: string;
  badge?: number;
  disabled?: boolean;
  external?: boolean;
  children?: NavItemProps[];
}
```

### Responsive Behavior
- **Desktop:** Full side navigation with expandable sections
- **Tablet:** Collapsed side nav with tooltips, top nav remains
- **Mobile:** Hamburger menu with drawer navigation
- **Accessibility:** Keyboard navigation, screen reader support, high contrast mode

## Role-Based Routing & Authentication Flows

### Authentication Flow Diagram
```
┌─────────────────┐
│   Landing Page  │
│ /               │
└─────┬───────────┘
      │
      ├─ Apply ───────────────► Applicant Flow
      │  (OTP-based)
      │
      ├─ Check Status ───────► Status Tracking
      │  (Tracking ID + OTP)
      │
      ├─ Staff Login ───────► Role-Based Redirect
      │  (Email/Password)
      │
      └─ Parent Login ──────► Parent Flow
         (Mobile OTP)
```

### Role-Based Redirect Rules

#### Staff Login Redirects
```
Login Success → Check User Role
      │
      ├─ Role: superintendent ──► /superintendent/applications
      │    └── Check vertical → Apply vertical filter
      │
      ├─ Role: trustee ────────► /trustee/applications
      │
      ├─ Role: accounts ───────► /accounts/receivables
      │
      └─ Role: student ───────► /dashboard
```

#### Parent Login Flow
```
OTP Sent → OTP Verified
      │
      └─ Multiple Wards? ── Yes ──► Ward Selection Page
      │     │                          /parent/select-ward
      │     │
      │     └─ No ──► Direct to Dashboard
      │                       /parent/[ward-id]/dashboard
      │
      └─ Single Ward ───────────────► /parent/[ward-id]/dashboard
```

### Route Protection Flow
```
Route Access Attempt
      │
      ├─ Public Route? ── Yes ──► Allow Access
      │   (/, /apply/*, /status)
      │
      └─ Protected Route ──► Check Authentication
              │
              ├─ Not Authenticated ──► Redirect to Login
              │
              └─ Authenticated ─────► Check Role Permissions
                      │
                      ├─ Insufficient Permissions ──► 403 Forbidden
                      │
                      └─ Authorized ───────────────► Allow Access
```

### Vertical Context Propagation
```
User Selects Vertical (Boys/Girls/Dharamshala)
      │
      ├─ Store in Session/Local Storage
      │
      ├─ Update Navigation Labels
      │   └── "Boys Hostel Applications" vs "Girls Ashram Applications"
      │
      ├─ Apply Filters to Data
      │   └── Applications, Rooms, etc. filtered by vertical
      │
      └─ Update UI Theme Colors
          └── Blue for Boys, Purple for Girls, Green for Dharamshala
```

### Application Status Flow (Student Lifecycle)
```
Applicant Submits Application
      │
      ├─ Status: DRAFT ───────► Can edit application
      │
      ├─ Status: SUBMITTED ──► Superintendent review queue
      │
      ├─ Status: REVIEW ─────► Superintendent reviewing
      │
      ├─ Status: INTERVIEW ──► Trustee evaluation
      │
      ├─ Status: APPROVED ──► Account creation + student dashboard
      │     └── Redirect: /student/activate (password setup)
      │
      └─ Status: REJECTED ──► Archived (can reapply after 6 months)
```

### Student Activation Flow
```
Approval Confirmed
      │
      ├─ Email sent with activation link
      │
      └─ Student clicks link ──► Password Setup Page
              │                       /student/activate?token=xxx
              │
              ├─ Password Set ───────► Login redirect
              │     └── First login → Onboarding tour
              │
              └─ Invalid/Expired ──► Error page with resend option
```

### Leave Request Flow
```
Student Submits Leave Request
      │
      ├─ Status: PENDING ───► Superintendent approval queue
      │
      ├─ Status: APPROVED ──► Parent notification sent
      │     └── Student can leave
      │
      └─ Status: REJECTED ──► Student notified with reason
```

### Renewal Flow (Every 6 Months)
```
Renewal Due Date Approaching (30 days)
      │
      ├─ Student notified via dashboard
      │
      ├─ Student submits renewal ──► Status: PENDING_RENEWAL
      │
      ├─ Superintendent reviews ──► APPROVED / REJECTED
      │
      └─ Approved ───────────────► New 6-month term begins
```

### Exit Process Flow
```
Student Initiates Exit
      │
      ├─ Clear all dues ────────► Check fees, damages
      │
      ├─ Dues pending ─────────► Cannot exit
      │
      ├─ Dues cleared ─────────► Generate exit documents
      │
      └─ Final approval ───────► Alumni status
          └── Access restricted to read-only
```

## Implementation Notes

### Route Guards (Frontend)
```tsx
// middleware.ts or route guard component
const requireAuth = (allowedRoles: UserRole[]) => {
  return (Component: React.ComponentType) => {
    return (props: any) => {
      const { user, loading } = useAuth();

      if (loading) return <Spinner />;

      if (!user) {
        redirect('/login');
        return null;
      }

      if (!allowedRoles.includes(user.role)) {
        return <AccessDenied />;
      }

      return <Component {...props} />;
    };
  };
};

// Usage
const ProtectedStudentDashboard = requireAuth(['student'])(StudentDashboard);
```

### Route Configuration
```tsx
// routes.config.ts
export const routes = {
  public: ['/', '/apply/*', '/status', '/login', '/parent-login'],
  student: ['/dashboard', '/fees/*', '/leave/*', '/room', '/documents/*', '/renewal/*', '/exit/*'],
  superintendent: ['/superintendent/*'],
  trustee: ['/trustee/*'],
  accounts: ['/accounts/*'],
  parent: ['/parent/*']
};
```

## Vertical Context Propagation Rules

### Vertical Selection Impact

The vertical selection (Boys Hostel, Girls Ashram, Dharamshala) affects content, labels, and data filtering across all dashboards and interfaces.

#### Navigation Labels
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
```tsx
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

### Vertical Context in Components

#### Dashboard Cards
```tsx
<StudentDashboard vertical={selectedVertical}>
  <StatCard
    title={`${verticalThemes[vertical].logoText} Stats`}
    value={stats.totalStudents}
    icon="users"
    color={verticalThemes[vertical].primaryColor}
  />
</StudentDashboard>
```

#### Application Forms
```tsx
<ApplicationForm vertical={selectedVertical}>
  <VerticalBanner vertical={vertical}>
    Applying to {verticalThemes[vertical].logoText}
  </VerticalBanner>
  {/* Form fields vary by vertical policies */}
</ApplicationForm>
```

#### Room Allocation
```tsx
<RoomSelector vertical={selectedVertical}>
  {/* Only show rooms in selected vertical */}
  <RoomGrid vertical={vertical} />
</RoomSelector>
```

### Superintendent Vertical Assignment

Superintendents are assigned to specific verticals and can only access data within their vertical:

```
Superintendent A (Boys) → Can only see Boys Hostel applications/rooms/students
Superintendent B (Girls) → Can only see Girls Ashram applications/rooms/students
Superintendent C (Dharamshala) → Can only see Dharamshala applications/rooms/students
```

#### Cross-Vertical Access Rules
- **Trustees:** Can access all verticals (institutional authority)
- **Accounts:** Can access all verticals (financial oversight)
- **Parents:** Can only access their ward's information (regardless of vertical)
- **Students:** Can only access their own information (single vertical)

### Vertical Switching Rules

#### For Staff Users
- Superintendents cannot switch verticals (assigned to one)
- Trustees and Accounts can switch between verticals via dropdown
- Vertical selection persists across sessions

#### For Students
- Students are assigned to one vertical and cannot switch
- Vertical context shown in profile but not changeable

#### For Parents
- Parents see vertical context in ward information
- Cannot switch verticals (view-only access)

### Content Customization by Vertical

#### Policy Differences
- **Admission Requirements:** May vary by vertical
- **Fee Structures:** Different pricing for different verticals
- **Leave Policies:** Different rules for boys vs girls
- **Room Configurations:** Different room types/capacity

#### Document Templates
- **Undertakings:** Vertical-specific legal documents
- **Admission Packets:** Customized for each vertical
- **Exit Documents:** Vertical-branded paperwork

### Implementation in State Management

```tsx
interface AppState {
  user: User | null;
  vertical: HostelVertical;
  permissions: Permission[];
}

const useVertical = () => {
  const { vertical, setVertical } = useAppState();

  const switchVertical = (newVertical: HostelVertical) => {
    // Validate permissions
    if (!canSwitchVertical(user.role, newVertical)) {
      throw new Error('Insufficient permissions');
    }

    // Update state
    setVertical(newVertical);

    // Persist to localStorage
    localStorage.setItem('selectedVertical', newVertical);

    // Trigger data refetch with new vertical filter
    refetchData({ vertical: newVertical });
  };

  return { vertical, switchVertical };
};
```

## IA & Navigation Validation Activities

### PRD Requirements Mapping Validation

#### Step 1: Extract All PRD Requirements
Go through the complete PRD and extract all functional requirements, user stories, and acceptance criteria.

**PRD Sources to Review:**
- `.docs/prd/01-1.-product-overview.md`
- `.docs/prd/02-2.-user-roles-and-access.md`
- `.docs/prd/epics/` (all epic files)
- `.docs/prd.md` (main PRD document)

#### Step 2: Map Requirements to Sitemap Screens
For each requirement, identify which screen/page in the sitemap fulfills it.

**Validation Checklist:**
- [ ] Every user story maps to at least one screen
- [ ] Every acceptance criterion has a corresponding UI element
- [ ] No requirements are orphaned (no screen to fulfill them)
- [ ] No screens exist without corresponding requirements

**Example Mapping Table:**
| PRD Requirement | Screen/Page | Status |
|---|---|---|
| Applicant submits admission form | `/apply/[vertical]` | ✅ Mapped |
| Student views fees | `/fees` | ✅ Mapped |
| Superintendent reviews applications | `/superintendent/applications/[id]` | ✅ Mapped |

### Card Sorting & Tree Testing

#### Card Sorting Exercise (Internal Users)
1. **Prepare Cards:** Create cards for all main navigation items and key tasks
2. **Participants:** 2-3 internal stakeholders (PM, UX designer, developer)
3. **Method:** Open card sort - participants group cards into logical categories
4. **Analysis:** Compare results with our IA structure
5. **Time:** 30-45 minutes per participant

#### Tree Testing Exercise
1. **Prepare Tree:** Create a text-based representation of the navigation structure
2. **Tasks:** Give participants 5-7 findability tasks (e.g., "Find where to submit a leave request")
3. **Success Rate:** Measure if users can navigate to correct destinations
4. **Analysis:** Identify navigation dead ends or confusing paths

### Persona Lifecycle Walkthrough

#### Applicant to Alumni Journey Validation

**Applicant Phase:**
1. Landing → Select vertical → Fill application → Upload docs → Submit
2. Check status via tracking ID + OTP
3. **Validation:** No dead ends, clear next steps, status transparency

**Student Phase:**
1. Approval → Account creation → Password setup → Dashboard access
2. Daily use: Dashboard → Fees/Leave/Room management
3. Renewal cycle: Notification → Renewal application → Approval
4. **Validation:** Complete lifecycle coverage, no navigation loops

**Alumni Phase:**
1. Exit process → Final clearance → Alumni status
2. Limited read-only access
3. **Validation:** Clear exit path, appropriate access restrictions

**Staff Roles:**
1. Login → Role-based dashboard → Task completion
2. **Validation:** No cross-role confusion, appropriate permissions

### Vertical Context Consistency Check

#### Navigation Labels Audit
- [ ] All navigation items include vertical context when applicable
- [ ] "Boys Hostel Applications" vs generic "Applications"
- [ ] Breadcrumbs show vertical context: "Home > Boys Hostel > Applications"

#### Content Filtering Verification
- [ ] Applications list filtered by vertical
- [ ] Room management shows only relevant rooms
- [ ] Fee structures display vertical-specific pricing
- [ ] Documents use vertical-specific templates

#### UI Theme Consistency
- [ ] Color schemes applied correctly (Blue/Purple/Green)
- [ ] Vertical selection visible in header/navigation
- [ ] Theme persists across page navigations

### Accessibility & Usability Validation

#### Keyboard Navigation Test
- [ ] Tab through all navigation elements
- [ ] Enter/Space to activate items
- [ ] Escape to close menus/modals
- [ ] Arrow keys for dropdown navigation

#### Screen Reader Compatibility
- [ ] Navigation landmarks properly labeled
- [ ] Skip links for main content
- [ ] Alt text for all icons
- [ ] Role-based content announced correctly

#### Mobile Responsiveness
- [ ] Hamburger menu functions properly
- [ ] Touch targets meet 44px minimum
- [ ] Navigation drawer slides in/out smoothly
- [ ] Content reflows appropriately

### Performance & Technical Validation

#### Route Loading Performance
- [ ] Protected routes load within 2 seconds
- [ ] Role checks don't cause layout shifts
- [ ] Vertical filtering applies without full page reloads

#### Error Handling
- [ ] 404 pages for invalid routes
- [ ] 403 pages for insufficient permissions
- [ ] Graceful degradation for network errors
- [ ] Clear error messages with recovery options

### Stakeholder Review Process

#### Internal Review Meeting
1. **Present IA:** Walk through sitemap, navigation patterns, flow diagrams
2. **Demonstrate:** Show key user flows and vertical context
3. **Gather Feedback:** Note any gaps or concerns
4. **Action Items:** Document required changes

#### Sign-Off Criteria
- [ ] All PRD requirements mapped to screens
- [ ] Navigation structure approved by stakeholders
- [ ] Vertical context implementation validated
- [ ] Accessibility requirements met
- [ ] Performance benchmarks achieved

### Documentation Updates

After validation, update all relevant documentation:
- `.docs/architecture/information-architecture.md` (this document)
- `.docs/prd.md` (if any IA changes affect requirements)
- Component documentation with navigation props
- Developer guidelines for implementing role-based routing

## Implementation Guidelines

### Frontend Routing
- Use Next.js App Router with role-based route guards
- Protected routes with authentication checks
- Dynamic route parameters for vertical context
- Client-side navigation with loading states

### State Management
- Role context for navigation rendering
- Vertical selection persisted across sessions
- Permission-based component visibility

### Accessibility
- Keyboard navigation for all nav elements
- Screen reader support for role-based content
- High contrast for institutional environment