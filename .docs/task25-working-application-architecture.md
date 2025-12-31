# Working Application Architecture - Task 25

## Overview
This document defines the end-to-end user journeys and navigation flows for all personas in the Jain Hostel Management Application. The working application demonstrates complete user flows with interactive state transitions.

---

## Persona Entry Points & Starting Screens

### 1. APPLICANT (Guest)
**Starting Point:** `/` (Landing Page)

**Flow Path:**
```
/ → /apply → /apply/boys-hostel/contact → /apply/boys-hostel/verify → /apply/boys-hostel/form → /track/[id]
```

**Key Navigation:**
- "Apply Now" CTA → `/apply`
- "Check Status" CTA → `/track`
- Vertical selection cards → Contact page for each vertical
- OTP verification → Form wizard
- Form submission → Tracking page with tracking ID

**Component States to Demonstrate:**
- OTP input: empty, focused, filled, error, success
- Stepper: each step transition
- Tracking badges: DRAFT, SUBMITTED, REVIEW, INTERVIEW, APPROVED

---

### 2. STUDENT (Resident)
**Starting Point:** `/login`

**Flow Path:**
```
/login → /dashboard/student → /dashboard/student/fees → /dashboard/student/leave
                                              → /dashboard/student/room
                                              → /dashboard/student/renewal
                                              → /dashboard/student/exit
```

**Key Navigation:**
- Login form → Dashboard
- Dashboard "Pay Fees" → Fees page with payment flow
- Dashboard "Apply for Leave" → Leave form
- Dashboard "View Room" → Room details
- Dashboard "Renew Now" → Renewal wizard
- Dashboard "Exit" → Exit request flow

**Residency States:**
- CHECKED_IN (default)
- RENEWAL_DUE (30 days before expiry)
- RENEWED (after renewal completion)
- EXIT_INITIATED (after exit request)
- EXITED (read-only mode after approval)

---

### 3. SUPERINTENDENT (Admin - Boys/Girls/Dharamshala)
**Starting Point:** `/login`

**Flow Path:**
```
/login → /dashboard/superintendent → /dashboard/superintendent/leaves
                                   → /dashboard/superintendent/config
```

**Key Navigation:**
- Login → Superintendent Dashboard
- Dashboard "Applications" tab → Application review
- Dashboard "Leaves" tab → Leave approval list
- Dashboard "Communication" tab → Message sending
- Dashboard "Settings" tab → Configuration

**Actions to Wire:**
- Review → Approve/Reject/Forward modals
- Leave approval with notification rules
- Message templates and communication history

---

### 4. TRUSTEE (Final Approval Authority)
**Starting Point:** `/login`

**Flow Path:**
```
/login → /dashboard/trustee → Application Review → Interview Scheduling → Final Decision
```

**Key Navigation:**
- Login → Trustee Dashboard
- View forwarded applications
- Schedule interviews
- Approve/Reject final decisions

---

### 5. ACCOUNTS (Finance Team)
**Starting Point:** `/login`

**Flow Path:**
```
/login → /dashboard/accounts → Receivables View → Export Actions
```

**Key Navigation:**
- Login → Accounts Dashboard
- View pending receivables
- Export financial reports

---

### 6. PARENT (Guardian)
**Starting Point:** `/login/parent`

**Flow Path:**
```
/login/parent → /dashboard/parent → /dashboard/parent/leave
```

**Key Navigation:**
- OTP Login → Parent Dashboard
- View fee status
- View leave requests and history
- Notifications (read-only)

---

## Cross-Journey Links

| From | To | Trigger |
|------|-----|---------|
| Landing | Applicant Apply | "Apply Now" button |
| Landing | Application Tracking | "Check Status" button |
| Landing | Login | "Login" button |
| Landing | Parent Login | "Parent" button |
| Apply | OTP Verify | Contact form submit |
| Tracking | Login | "Login" link |
| Student Dashboard | All student features | Quick action cards |
| Super Dashboard | All admin features | Tab navigation |
| Parent Dashboard | Leave View | Tab navigation |

---

## Interactive Component States

### Buttons
- Default, Hover, Focused, Disabled, Loading
- Primary, Secondary, Destructive variants

### Form Fields
- Empty, Focused, Filled, Error states
- Validation feedback

### Badges/Status
- Info, Success, Warning, Error variants
- State transitions (e.g., NEW → UNDER_REVIEW → APPROVED)

### Tables
- Row hover, Selection states
- Filter chip toggles
- Pagination controls

### Navigation
- Active tab indicators
- Breadcrumb trails
- Back navigation

---

## Device Responsiveness

| Viewport | Layout | Notes |
|----------|--------|-------|
| Mobile (< 768px) | Single column | Hamburger menu for nav |
| Tablet (768-1024px) | 2-column grid | Collapsible sidebars |
| Desktop (> 1024px) | Full layout | All nav visible |

---

## Working Application Routes Summary

```
PUBLIC ROUTES:
/                           - Landing page
/apply                      - Vertical selection
/apply/boys-hostel/contact  - Boys contact entry
/apply/boys-hostel/verify   - Boys OTP verification
/apply/boys-hostel/form     - Boys application form
/apply/girls-ashram/contact - Girls contact entry
/apply/girls-ashram/form    - Girls application form
/apply/dharamshala/contact  - Dharamshala contact entry
/apply/dharamshala/form     - Dharamshala form
/track                      - Tracking entry
/track/[id]                 - Tracking status view
/login                      - Staff login
/login/parent               - Parent OTP login
/dpdp-policy                - Privacy policy

STUDENT ROUTES:
/dashboard/student              - Student dashboard
/dashboard/student/fees         - Fees & payments
/dashboard/student/leave        - Leave application
/dashboard/student/room         - Room details
/dashboard/student/renewal      - Stay renewal
/dashboard/student/exit         - Exit request
/dashboard/student/documents    - Documents
/dashboard/student/biometric    - Biometric (coming soon)
/dashboard/student/mess         - Mess (coming soon)
/dashboard/student/visitor      - Visitor (coming soon)

SUPERINTENDENT ROUTES:
/dashboard/superintendent       - Super dashboard
/dashboard/superintendent/leaves - Leave management
/dashboard/superintendent/config - Configuration

ADMIN/TRUSTEE ROUTES:
/dashboard/admin                - Admin dashboard
/dashboard/admin/renewal        - Renewal approvals
/dashboard/admin/exit-approval  - Exit approvals
/dashboard/admin/room-allocation - Room allocation
/dashboard/admin/mess           - Mess management
/dashboard/admin/biometric      - Biometric
/dashboard/admin/visitor        - Visitor management
/dashboard/admin/clearance      - Clearance

TRUSTEE ROUTES:
/dashboard/trustee              - Trustee dashboard

ACCOUNTS ROUTES:
/dashboard/accounts             - Accounts dashboard

PARENT ROUTES:
/dashboard/parent               - Parent dashboard
/dashboard/parent/leave         - Leave view

DESIGN SYSTEM:
/design-system                  - Component library
/design-system/architecture     - Design architecture
```

---

## Annotation & Tour Overlay

A global tour component should be available at `/tour` or as an overlay with:
- Hotspot hints on complex screens
- Flow annotations explaining transitions
- Persona-specific guided tours
- Interactive step indicators

---

## Validation Checklist

- [ ] All CTAs navigate to correct next step
- [ ] Back/Cancel buttons work correctly
- [ ] Error states display properly
- [ ] Loading states are visible
- [ ] Success feedback after actions
- [ ] Mobile responsive on all screens
- [ ] No dead ends or broken links
- [ ] All component variants demonstrated
