# Student Dashboard - Content Model & IA Design

## Overview
This document defines the information architecture and data model for the Student Dashboard (approved residents).

## Content Model

### 1. User Context
```typescript
interface StudentUserContext {
  id: string;
  name: string;
  email: string;
  vertical: 'BOYS_HOSTEL' | 'GIRLS_ASHRAM' | 'DHARAMSHALA';
  roomNumber: string;
  status: 'CHECKED_IN' | 'RENEWAL_DUE' | 'RENEWED' | 'EXIT_INITIATED' | 'EXITED';
  joiningDate: Date;
  renewalDate?: Date;
  academicYear: string;
  currentPeriod: 'SEMESTER_1' | 'SEMESTER_2';
  feeBalance: number;
  documentsApproved: number;
  documentsPending: number;
}
```

### 2. Journey Tracker
```typescript
interface JourneyStage {
  id: string;
  label: string;
  description: string;
  icon: string;
  status: 'COMPLETED' | 'CURRENT' | 'UPCOMING' | 'LOCKED';
  date?: Date;
}

interface JourneyTracker {
  stages: JourneyStage[];
  currentStageIndex: number;
}

// Journey stages for all residents:
// 1. Checked-in - "You are currently staying at the hostel"
// 2. Renewal Due - "Your 6-month renewal is approaching"
// 3. Renewed - "You have successfully renewed for next period"
// 4. Exited - "You have checked out from hostel"
```

### 3. Quick Actions
```typescript
interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  link: string;
  enabled: boolean;
  visibility: 'ALWAYS' | 'RENEWAL_WINDOW' | 'EXIT_ALLOWED' | 'PENDING_ITEMS';
  badge?: {
    text: string;
    variant: 'default' | 'warning' | 'error' | 'success';
  };
}

// Primary actions:
const quickActions: QuickAction[] = [
  {
    id: 'pay-fees',
    title: 'Pay Fees',
    description: 'View and pay your pending dues',
    icon: '💳',
    link: '/dashboard/student/fees',
    enabled: true,
    visibility: 'ALWAYS',
  },
  {
    id: 'download-letters',
    title: 'Download Letters',
    description: 'Get admission and official documents',
    icon: '📄',
    link: '/dashboard/student/documents',
    enabled: true,
    visibility: 'ALWAYS',
  },
  {
    id: 'apply-leave',
    title: 'Apply for Leave',
    description: 'Request leave from hostel',
    icon: '🏖️',
    link: '/dashboard/student/leave',
    enabled: true,
    visibility: 'ALWAYS',
  },
  {
    id: 'view-room',
    title: 'View Room Details',
    description: 'See your room information',
    icon: '🛏️',
    link: '/dashboard/student/room',
    enabled: true,
    visibility: 'ALWAYS',
  },
  {
    id: 'renew',
    title: 'Renew Now',
    description: 'Renew your stay for next semester',
    icon: '📜',
    link: '/dashboard/student/renewal',
    enabled: true,
    visibility: 'RENEWAL_WINDOW',
    badge: {
      text: 'Due in 30 days',
      variant: 'warning',
    },
  },
  {
    id: 'exit-process',
    title: 'Initiate Exit',
    description: 'Start checkout process from hostel',
    icon: '🚪',
    link: '/dashboard/student/exit',
    enabled: true,
    visibility: 'EXIT_ALLOWED',
  },
];
```

### 4. Notifications
```typescript
interface Notification {
  id: string;
  type: 'FEE_DUE' | 'RENEWAL_REMINDER' | 'LEAVE_DECISION' | 'ANNOUNCEMENT' | 'SYSTEM';
  title: string;
  message: string;
  timestamp: Date;
  priority: 'high' | 'medium' | 'low';
  actionRequired: boolean;
  actionLink?: string;
  isRead: boolean;
}

// Example notifications:
const notificationExamples: Notification[] = [
  {
    id: '1',
    type: 'FEE_DUE',
    title: 'Fee Payment Due',
    message: 'Your hostel fees for December 2025 are due by December 31.',
    timestamp: new Date('2025-12-20'),
    priority: 'high',
    actionRequired: true,
    actionLink: '/dashboard/student/fees',
    isRead: false,
  },
  {
    id: '2',
    type: 'RENEWAL_REMINDER',
    title: 'Renewal Reminder',
    message: 'Your 6-month renewal is due in 30 days. Complete renewal to avoid late fees.',
    timestamp: new Date('2025-12-18'),
    priority: 'medium',
    actionRequired: true,
    actionLink: '/dashboard/student/renewal',
    isRead: false,
  },
  {
    id: '3',
    type: 'LEAVE_DECISION',
    title: 'Leave Application Decision',
    message: 'Your leave request for December 25-30 has been approved.',
    timestamp: new Date('2025-12-22'),
    priority: 'medium',
    actionRequired: false,
    isRead: false,
  },
  {
    id: '4',
    type: 'ANNOUNCEMENT',
    title: 'Holiday Schedule',
    message: 'The hostel will remain closed from December 25 to January 1.',
    timestamp: new Date('2025-12-15'),
    priority: 'low',
    actionRequired: false,
    isRead: true,
  },
];
```

### 5. Key Summaries
```typescript
interface SummaryCard {
  id: string;
  title: string;
  value: string | number;
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'neutral';
    label: string;
  };
  link?: string;
}

// Summary cards:
const summaryCards: SummaryCard[] = [
  {
    id: 'days-stayed',
    title: 'Days Stayed',
    value: 92,
    trend: {
      value: 7,
      direction: 'up',
      label: 'This semester',
    },
  },
  {
    id: 'fees-paid',
    title: 'Fees Paid This Year',
    value: '₹25,000',
  },
  {
    id: 'leave-balance',
    title: 'Leave Balance',
    value: '5 days',
  },
  {
    id: 'documents',
    title: 'Documents',
    value: '2 pending',
    link: '/dashboard/student/documents',
  },
];
```

## Information Architecture

### Page Layout
```
┌────────────────────────────────────────────────────────────────────┐
│  Header (logo, vertical badge, navigation, logout)                │
├────────────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │ HERO STATUS AREA                                        │  │
│  │ - Journey Tracker (timeline/progress bar)                   │  │
│  │ - Status Badge (Checked-in, Renewal Due, etc.)            │  │
│  │ - Helper text ("What do I do next?")                    │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                               │
│  ┌─────────────┬─────────────┬─────────────┬─────────────┐  │
│  │ Quick       │ Quick       │ Quick       │ Quick       │  │
│  │ Action 1    │ Action 2    │ Action 3    │ Action 4    │  │
│  │ (Pay Fees)  │ (Download)  │ (Leave)     │ (Room)      │  │
│  │             │ (Letters)    │              │              │  │
│  └─────────────┴─────────────┴─────────────┴─────────────┘  │
│                                                               │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │ NOTIFICATIONS PANEL (scrollable list)                  │  │
│  │ - Filter tabs (All, Unread, Actions Required)        │  │
│  │ - Notification items with priority indicators             │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                               │
│  ┌─────────────────────┬───────────────────────────────────┐  │
│  │ SUMMARY CARDS      │ PROFILE QUICK INFO                │  │
│  │ - Days Stayed      │ - Room No: A-201                  │  │
│  │ - Fees Paid        │ - Joining Date                     │  │
│  │ - Leave Balance    │ - Current Status                    │  │
│  │ - Documents        │                                    │  │
│  └─────────────────────┴───────────────────────────────────┘  │
│                                                               │
└────────────────────────────────────────────────────────────────────┘
```

### Navigation Structure
```
Student Dashboard (/dashboard/student)
├── Fees (/dashboard/student/fees)
│   ├── Fee History
│   ├── Make Payment
│   └── Payment Receipts
├── Leave (/dashboard/student/leave)
│   ├── Apply for Leave
│   ├── Leave History
│   └── Leave Balance
├── Documents (/dashboard/student/documents)
│   ├── Upload Documents
│   ├── View Documents
│   └── Download Templates
├── Room (/dashboard/student/room)
│   ├── Room Details
│   ├── Roommates
│   └── Room Rules
├── Renewal (/dashboard/student/renewal)
│   ├── Initiate Renewal
│   ├── Upload Renewal Documents
│   └── Confirm Renewal
└── Exit (/dashboard/student/exit)
    ├── Start Exit Process
    ├── Exit Checklist
    └── Confirm Exit
```

### Responsive Layouts

#### Desktop (1024px+)
```
┌───────────────────────────────────────────────────────────────────────────┐
│  HERO STATUS AREA                                              │
│  Journey: [● ● ● ●] - Visual timeline                          │
│  Status: Checked-in - Green badge                                 │
│  Helper: "All systems active. No action required."                    │
├───────────────────────────────────────────────────────────────────────────┤
│  Quick Actions (4 columns)                                        │
│  ┌─────────┬─────────┬─────────┬─────────┐                     │
│  │ Pay Fees │ Download │  Leave   │ Room     │                     │
│  │          │ Letters   │          │          │                     │
│  └─────────┴─────────┴─────────┴─────────┘                     │
├───────────────────────────────────────────────────────────────────────────┤
│  Notifications (2 columns, 3 rows) + Profile (1 column)          │
│  ┌────────────────────┬───────────────────────────────────────────┐     │
│  │ Notifications List  │ Quick Profile Info              │     │
│  │ - Filter tabs       │ - Room: A-201                   │     │
│  │ - 6 items shown     │ - Joined: Aug 15, 2024          │     │
│  │                    │ - Status: Checked-in              │     │
│  │                    │                                 │     │
│  │                    │ - Renewal: Due in 92 days        │     │
│  └────────────────────┴───────────────────────────────────┘     │
└───────────────────────────────────────────────────────────────────────────┘
```

#### Tablet (768px - 1023px)
```
┌─────────────────────────────────────────────────────────────┐
│  HERO STATUS AREA                                    │
│  Journey: [● ● ● ●]                              │
│  Status: Checked-in                                   │
├─────────────────────────────────────────────────────────────┤
│  Quick Actions (2 columns, 3 rows)                  │
│  ┌─────────┬─────────┐                           │
│  │ Pay Fees │ Download │                           │
│  │          │ Letters   │                           │
│  ├─────────┼─────────┤                           │
│  │ Leave    │ Room      │                           │
│  │          │           │                           │
│  ├─────────┼─────────┤                           │
│  │ Renew    │ Exit      │                           │
│  │          │ (if allowed)                           │
│  └─────────┴─────────┘                           │
├─────────────────────────────────────────────────────────────┤
│  Notifications (full width)                            │
│  ┌─────────────────────────────────────────────┐     │
│  │ Notifications List with filters      │     │
│  │                                 │     │
│  └─────────────────────────────────────────────┘     │
│                                                 │
│  Quick Profile Card (below notifications)            │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────┐     │
│  │ Quick Profile Info                  │     │
│  │ - Room, Joined, Status, Renewal  │     │
│  └─────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

#### Mobile (<768px)
```
┌─────────────────────────────────────────────┐
│  HEADER (hamburger menu)                 │
├─────────────────────────────────────────────┤
│  HERO STATUS AREA                      │
│  Journey: [● ● ● ●]                │
│  Status: Checked-in                   │
│  Helper: "No action required"          │
├─────────────────────────────────────────────┤
│  QUICK ACTIONS (horizontal scroll)        │
│  [Pay Fees] [Download] [Leave] [Room]│
│  [Renew] [Exit]                    │
├─────────────────────────────────────────────┤
│  NOTIFICATIONS (expandable accordion)    │
│  ▼ Recent (3)                       │
│    - Fee due                           │
│    - Renewal reminder                   │
│    - Leave approved                     │
├─────────────────────────────────────────────┤
│  QUICK PROFILE INFO                  │
│  Room: A-201 | Joined: Aug 2024  │
│  Status: Checked-in                   │
└─────────────────────────────────────────────┘
```

### State-Based Visibility

#### New Resident (First-time checked in)
- **Hero Status**: "Welcome to hostel" message
- **Quick Actions**: All actions visible
- **Notifications**: Onboarding tips, rules orientation links
- **Profile**: Basic info only

#### Checked-in (Normal)
- **Hero Status**: Journey tracker at "Checked-in"
- **Quick Actions**: All actions except Renew (not due) and Exit (not allowed)
- **Notifications**: Fee reminders, announcements
- **Profile**: Full info with renewal countdown

#### Renewal Due (30 days before)
- **Hero Status**: Warning banner "Renewal due in 30 days"
- **Quick Actions**: Renew action prominent with "Due in 30 days" badge
- **Notifications**: Renewal reminders, late fee warnings
- **Profile**: Renewal deadline highlighted

#### Post-Renewal
- **Hero Status**: Success message "Renewed for next period"
- **Quick Actions**: All normal actions
- **Notifications**: Receipt download, new period announcements
- **Profile**: Updated renewal date

#### Exit Initiated
- **Hero Status**: Warning "Exit process started"
- **Quick Actions**: Exit checklist items (clear room, return keys)
- **Notifications**: Exit steps, deposit refund status
- **Profile**: Exit date, pending actions

#### Exited
- **Hero Status**: "Thank you for staying with us"
- **Quick Actions**: Apply for readmission (link to application)
- **Notifications**: None (archived)
- **Profile**: Exit summary, final balance

## Component Requirements

### Reusable Components
- `JourneyTracker` - Timeline/progress bar showing stages
- `QuickActionCard` - Individual action card with icon, title, description
- `NotificationItem` - Single notification with priority indicator
- `NotificationFilterTabs` - Tabs for filtering notifications
- `SummaryCard` - Compact summary display
- `StatusBadge` - Visual status indicator with color coding
- `HelperText` - "What do I do next" inline help

### Copy Guidelines
- **Student-friendly tone**: Use clear, encouraging language
- **Disciplined tone**: Maintain institutional authority
- **Helper text**: Explain next steps in simple language
- **DPDP compliance**: No sensitive internal data visible to students
- **Vertical context**: Always reference correct vertical (Boys/Girls/Dharamshala)

### Color Coding
- **Checked-in**: Green (`--color-green-600`)
- **Renewal Due**: Amber/Warning (`--color-gold-600`)
- **Renewed**: Blue/Success (`--color-sky-600`)
- **Exit Initiated**: Orange (`--color-orange-500`)
- **Exited**: Gray (`--color-gray-600`)
- **Priority High**: Red (`--color-red-600`)
- **Priority Medium**: Amber (`--color-gold-500`)
- **Priority Low**: Blue (`--color-sky-500`)
