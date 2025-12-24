# Parent Dashboard Implementation

## Overview
This module implements the parent/guardian view-only dashboard for monitoring their ward's hostel information.

## Files Structure
```
frontend/src/
├── app/
│   ├── login/parent/
│   │   └── page.tsx              # OTP-based parent login
│   └── dashboard/parent/
│       ├── page.tsx                # Main parent dashboard
│       ├── fees/
│       │   └── page.tsx            # Fee status and receipts
│       └── leave/
│           └── page.tsx            # Leave history
└── components/
    └── feedback/
        └── Tooltip.tsx             # Info tooltip component
```

## Key Features

### 1. OTP-Based Login (`/login/parent`)
- Mobile number validation (10 digits, starts with 6-9)
- OTP verification flow with resend timer
- Session creation with parent role scope
- DPDP compliance messaging

### 2. Parent Dashboard (`/dashboard/parent`)
- Student overview card (name, room, status)
- Fee status summary
- Leave history preview
- Recent notifications
- Quick links navigation

### 3. Fee Status View (`/dashboard/parent/fees`)
- Fee summary cards (paid, pending, overdue)
- Transaction history with download receipts
- View-only enforcement

### 4. Leave History View (`/dashboard/parent/leave`)
- Leave statistics (approved, rejected, pending, days taken)
- Detailed leave applications list
- Status filtering (upcoming, approved, rejected, completed)

## View-Only Enforcement

### Frontend
- All action buttons disabled (`disabled` attribute)
- No editable form inputs
- Explicit view-only badges
- Tooltips explaining restrictions
- DPDP compliance banners

### Backend (Required)
See `docs/PARENT_PERMISSIONS.md` for complete backend implementation requirements.

## Permissions Matrix

| Feature | Parent | Student | Admin |
|---------|---------|----------|--------|
| View student profile | ✅ | ✅ | ✅ |
| Edit student profile | ❌ | ✅ | ✅ |
| View fee status | ✅ | ✅ | ✅ |
| Make payments | ❌ | ✅ | ✅ |
| View leave history | ✅ | ✅ | ✅ |
| Submit leave request | ❌ | ✅ | ✅ |
| Cancel leave request | ❌ | ✅ | ✅ |
| Approve leave request | ❌ | ❌ | ✅ |
| Upload documents | ❌ | ✅ | ✅ |

## Design System Components Used

### Forms
- `Input` - For OTP and mobile number input

### Feedback
- `Tooltip` - For informational tooltips
- `InfoTooltip` - For DPDP and permission explanations
- `Badge` - For view-only indicators

### UI
- `Button` - For navigation and actions (disabled where appropriate)

## Navigation Flow

```
Landing Page
    ↓
[Parent/Guardian Login]
    ↓
Enter Mobile Number
    ↓
[Send OTP] → POST /api/otp/send
    ↓
Enter OTP
    ↓
[Verify OTP] → POST /api/otp/verify
    ↓
Parent Dashboard
    ↓
    ├─→ Fee Status View
    ├─→ Leave History View
    └─→ Logout
```

## API Endpoints (Required)

### Auth
- `POST /api/otp/send` - Send OTP to mobile
- `POST /api/otp/verify` - Verify OTP
- `POST /api/otp/resend` - Resend OTP

### Parent Data (GET only)
- `GET /api/students/:id` - Student profile
- `GET /api/fees?student_id=:id` - Fee history
- `GET /api/receipts/:id/download` - Download receipt
- `GET /api/leaves?student_id=:id` - Leave history
- `GET /api/notifications?student_id=:id` - Notifications

## Security Considerations

1. **OTP Verification**: Must use the same mobile number registered in student's application
2. **Role Enforcement**: Backend must verify parent role on every request
3. **Student Association**: Parents can only view their associated student IDs
4. **Session Timeout**: Sessions expire after 30 minutes of inactivity
5. **Audit Logging**: All parent access must be logged

## DPDP Compliance

- ✅ Explicit consent through OTP verification
- ✅ Data minimization (only essential information displayed)
- ✅ Purpose limitation (hostel management only)
- ✅ Access logging for audit trails
- ✅ Clear communication of data usage

## Testing Checklist

- [x] Mobile number validation (10 digits, 6-9 prefix)
- [x] OTP flow works with resend timer
- [x] All action buttons disabled on parent dashboard
- [x] No editable forms
- [x] DPDP banners visible on all pages
- [x] Tooltips appear on hover/focus
- [x] Navigation links work correctly
- [x] Responsive design on mobile
- [x] Accessibility (keyboard navigation, screen reader)

## Future Enhancements

1. Real-time notifications for leave updates
2. Email notifications for fee due reminders
3. Multi-language support
4. Dark mode support
5. Print-friendly views for reports
