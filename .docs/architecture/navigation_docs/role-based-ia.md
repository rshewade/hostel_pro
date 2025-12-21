# Global Sitemap & Role-Based Information Architecture

## Overview
This document defines the complete information architecture and navigation structure for the Hostel Management Application, supporting all user roles and verticals (Boys Hostel, Girls Ashram, Dharamshala).

## Role-Based Sitemap

### 1. Applicant (Pre-Approval)
**Navigation Pattern**: Public landing page → Role-specific sections
**Sections**:
- Landing Page (Vertical Selection)
- Application Form (Multi-step wizard)
- Application Status Tracking
- Document Uploads
- Communication History (Limited)

### 2. Resident Student (Post-Approval)
**Navigation Pattern**: Side navigation dashboard
**Sections**:
- Dashboard (Overview, Status Tracker)
- Fees & Payments
- Room Details
- Leave Management
- Documents & Undertakings
- Renewal Module
- Communication
- Settings

### 3. Superintendent (Boys/Girls/Dharamshala)
**Navigation Pattern**: Side navigation admin dashboard
**Sections**:
- Applications Dashboard
- Leave Approvals
- Room Management
- Communication Templates
- Configuration
- Reports
- Audit Logs

### 4. Trustees
**Navigation Pattern**: Side navigation admin dashboard
**Sections**:
- Applications Review
- Interview Scheduling
- Final Approvals
- Reports
- Audit Logs

### 5. Accounts/Accounting Team
**Navigation Pattern**: Side navigation admin dashboard
**Sections**:
- Receivables Dashboard
- Payment Processing
- Receipt Generation
- Financial Reports
- Export Tools
- Audit Logs

### 6. Parents/Guardians
**Navigation Pattern**: Limited view dashboard
**Sections**:
- Dashboard (Child Status)
- Fees View
- Leave Status
- Communication
- Settings

## Global Navigation Patterns

### Primary Navigation
- **Top Navigation**: 
  - Logo/Brand
  - Vertical Selector (Boys/Girls/Dharamshala)
  - User Profile/Logout
  - Notifications

### Secondary Navigation
- **Side Navigation** (for dashboard roles):
  - Role-specific menu items
  - Active section highlighting
  - Collapsible sub-menus for deep sections

### Tertiary Navigation
- **Breadcrumbs**: For deep pages and sub-sections
- **Contextual Actions**: Within content areas

## Vertical Context Propagation

### Rules:
1. Vertical selection persists across sessions (URL parameter or session state)
2. All content filters by selected vertical
3. Navigation labels include vertical context
4. Role-specific data scoped to vertical

### Example:
- Superintendent Dashboard → Applications → Boys Hostel Applications
- Resident Dashboard → Fees → Boys Hostel Fees
- Parent Dashboard → Child Status → Boys Hostel Student

## Future Modules (Placeholders)

### Scalability Considerations:
- Biometric Attendance (placeholder nav item)
- Visitor Management (placeholder nav item) 
- Mess Management (placeholder nav item)
- Library Management (placeholder nav item)

## Routing & Redirection Rules

### Login Flows:
1. Landing → Apply Now → Application Form
2. Landing → Check Status → Application Tracking
3. Landing → Login → Role-based Dashboard
4. Parent Login → Parent Dashboard

### Post-Login Redirection:
- Applicants → Application Status
- Residents → Student Dashboard
- Superintendents → Applications Dashboard
- Trustees → Applications Review
- Accounts → Receivables Dashboard
- Parents → Parent Dashboard

## Navigation Guidelines

### Desktop vs Mobile:
- Desktop: Side navigation + top nav
- Mobile: Hamburger menu + bottom tab navigation

### Accessibility:
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support

### Performance:
- Lazy loading for deep sections
- Caching for frequently accessed data

## Validation Criteria

### Coverage:
- ✅ All PRD requirements mapped to IA
- ✅ Role separation maintained
- ✅ Vertical context propagation
- ✅ Future module placeholders included

### User Experience:
- Navigation depth ≤ 3 levels
- Clear visual hierarchy
- Consistent pattern application across roles
- Responsive design considerations

---

*This IA serves as the foundation for implementing role-based navigation in the Hostel Management Application.*