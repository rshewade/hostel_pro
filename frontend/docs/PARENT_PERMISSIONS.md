# Parent Role Permissions - Backend API Requirements

## Overview
Parent/Guardian accounts have **view-only access** to their ward's hostel information. All modifications must be done by the student or hostel administration.

## Permission Scope

### Allowed Operations (Read-Only)
| Resource | Operations | Endpoints (GET) |
|-----------|-------------|-------------------|
| Student Profile | View | `/api/students/:id` |
| Fee Status | View | `/api/fees?student_id=:id` |
| Fee Receipts | Download | `/api/receipts/:id/download` |
| Leave History | View | `/api/leaves?student_id=:id` |
| Notifications | View | `/api/notifications?student_id=:id` |

### Forbidden Operations
| Resource | Forbidden Operations | Notes |
|-----------|----------------------|--------|
| Student Profile | Edit/Update | Must be done by student |
| Fee Payments | Process/Submit | Must go through official payment channels |
| Leave Applications | Create/Update/Cancel | Must be submitted by student |
| Room Changes | Request | Must be done by student/admin |
| Documents | Upload/Download (edit) | Must be done by student |
| Any POST/PUT/DELETE | All mutating operations | Blocked at middleware level |

## Backend Implementation Requirements

### 1. Role-Based Middleware
```typescript
// middleware/roleGuard.ts
export const requireParentRole = (req: Request) => {
  const user = getUserFromSession(req);
  
  if (user.role !== 'parent') {
    throw new ForbiddenError('Access denied: Parent role required');
  }
  
  // Ensure parent can only access their associated student IDs
  const associatedStudentIds = getAssociatedStudentIds(user.id);
  const requestedStudentId = req.params.student_id || req.query.student_id;
  
  if (requestedStudentId && !associatedStudentIds.includes(requestedStudentId)) {
    throw new ForbiddenError('Access denied: You can only view your own ward\'s information');
  }
  
  return true;
};
```

### 2. API Route Guards
```typescript
// Example route implementation
app.get('/api/fees', requireParentRole, async (req, res) => {
  // Ensure only GET requests are allowed
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  
  const studentId = req.query.student_id;
  const fees = await getFeesByStudentId(studentId);
  res.json(fees);
});

// Block all POST/PUT/DELETE for parent role
app.post('/api/leaves', requireParentRole, (req, res) => {
  res.status(403).json({ 
    error: 'Forbidden: Parents cannot submit leave requests. Please ask your ward to submit through their account.' 
  });
});
```

### 3. Response Headers for Security
```typescript
// Add security headers
res.setHeader('X-Role-Scope', 'read-only');
res.setHeader('X-Permission-Level', 'parent');
```

## Frontend Enforcement

### 1. Disabled Button States
All action buttons on parent dashboard should be:
- Disabled (`disabled` attribute)
- Visually indicated (grayed out)
- Include tooltips explaining why disabled

### 2. No Editable Forms
- Remove all form submission handlers
- Set all form inputs to `readOnly`
- Display data as static content where possible

### 3. Permission Context
```typescript
// context/permissions.tsx
export const useParentPermissions = () => {
  return {
    canEdit: false,
    canSubmitForms: false,
    canDownloadReceipts: true,
    canViewHistory: true,
    role: 'parent',
    scope: 'read-only'
  };
};
```

## Audit Logging

All parent access should be logged:
```typescript
await auditLog({
  userId: user.id,
  role: 'parent',
  action: 'VIEW',
  resource: `/api/fees?student_id=${studentId}`,
  timestamp: new Date(),
  ipAddress: req.ip
});
```

## DPDP Compliance

1. **Data Access**: Parents can only view their own ward's data
2. **Data Retention**: Access logs retained for 1 year per DPDP
3. **Data Deletion**: Parents can request deletion of their access logs
4. **Consent**: Implicit consent through OTP verification
5. **Purpose Limitation**: Data used solely for hostel management

## Security Checklist

- [x] All GET endpoints require parent role verification
- [x] POST/PUT/DELETE blocked at middleware for parent role
- [x] Student ID filtering enforced (can only view associated wards)
- [x] All API calls logged with user context
- [x] Rate limiting applied to prevent enumeration
- [x] Session tokens expire after 30 minutes of inactivity
- [x] Multi-factor authentication (OTP) enforced on every login
