# Role-Based Routing and Login/Redirect Rules

## Overview
This document defines the routing logic and redirection rules for the Jain Hostel Management System, covering all user roles and their respective login flows.

## Login Entry Points

### Public Entry Points
1. **Landing Page** (`/`)
   - Vertical selection: Boys Hostel, Girls Ashram, Dharamshala
   - CTAs: Apply Now, Check Application Status, Login

2. **Application Status Check** (`/check-status`)
   - Tracking number input
   - OTP verification for identity confirmation

3. **Login Page** (`/login`)
   - Multi-role login form
   - Role-based redirection

## Role-Based Routing Logic

### Applicant (Guest)
- **Entry**: Landing → Apply Now
- **Flow**: 
  - Landing → Vertical Selection → Mobile/Email Input → OTP Verification → Application Wizard
- **Post-OTP**: Application Status Page
- **No persistent dashboard** - only tracking status
- **Redirect**: After OTP verification, to `/status/:trackingNumber`

### Student (Resident)
- **Entry**: Landing → Login
- **Flow**:
  - Login → First-time password setup (if needed) → Student Dashboard
- **Post-login**: Student Dashboard (`/dashboard`)
- **Redirect Rules**:
  - Successful login: `/dashboard`
  - First-time login: `/dashboard?setup=true`
  - Invalid credentials: `/login?error=invalid`

### Parent/Guardian
- **Entry**: Landing → Login (Parent Option)
- **Flow**:
  - Login → OTP Verification → Parent Dashboard
- **Post-login**: Parent Dashboard (`/parent-dashboard`)
- **Redirect Rules**:
  - Successful OTP: `/parent-dashboard`
  - Invalid OTP: `/login?error=invalid`

### Superintendent
- **Entry**: Landing → Login (Superintendent Option)
- **Flow**:
  - Login → Superintendent Dashboard
- **Post-login**: Superintendent Dashboard (`/superintendent-dashboard`)
- **Redirect Rules**:
  - Successful login: `/superintendent-dashboard`
  - Invalid credentials: `/login?error=invalid`

### Trustee
- **Entry**: Landing → Login (Trustee Option)
- **Flow**:
  - Login → Trustee Dashboard
- **Post-login**: Trustee Dashboard (`/trustee-dashboard`)
- **Redirect Rules**:
  - Successful login: `/trustee-dashboard`
  - Invalid credentials: `/login?error=invalid`

### Accounts
- **Entry**: Landing → Login (Accounts Option)
- **Flow**:
  - Login → Accounts Dashboard
- **Post-login**: Accounts Dashboard (`/accounts-dashboard`)
- **Redirect Rules**:
  - Successful login: `/accounts-dashboard`
  - Invalid credentials: `/login?error=invalid`

## Guard Hooks and Access Restrictions

### Authentication Guards
```typescript
// Example implementation for React Router
const AuthGuard = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <Loading />;
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }
  
  return children;
};
```

### Route Protection
- **Student Routes**: Require `STUDENT` role
- **Superintendent Routes**: Require `SUPERINTENDENT` role + vertical context
- **Trustee Routes**: Require `TRUSTEE` role
- **Accounts Routes**: Require `ACCOUNTS` role
- **Parent Routes**: Require `PARENT` role + linked student

## Flow Diagrams

### Applicant Flow
```
[Landing] → [Vertical Selection] → [Mobile/Email Input] → [OTP Verification] → [Application Status]
```

### Student Flow
```
[Landing] → [Login] → [Dashboard]
```

### Parent Flow
```
[Landing] → [Login (Parent)] → [OTP Verification] → [Parent Dashboard]
```

### Superintendent Flow
```
[Landing] → [Login (Superintendent)] → [Dashboard]
```

### Trustee Flow
```
[Landing] → [Login (Trustee)] → [Dashboard]
```

### Accounts Flow
```
[Landing] → [Login (Accounts)] → [Dashboard]
```

## Edge Cases and Error Handling

### Wrong Role Login
- If user attempts to access role-specific pages without proper authentication
- Redirect to unauthorized page with clear messaging
- Log the attempt for security monitoring

### Session Expiry
- Auto-logout after 30 minutes of inactivity
- Redirect to login page with session expired message
- Preserve attempted URL for post-login redirect

### Role Switch
- Admin roles can switch between roles (Superintendent → Trustee)
- Student/Parent roles cannot switch roles
- Clear indication of current role in dashboard

## Developer Notes for Implementation

### React Router Configuration
```typescript
// App.tsx
const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={
          <AuthGuard requiredRole="STUDENT">
            <StudentDashboard />
          </AuthGuard>
        } />
        <Route path="/superintendent-dashboard" element={
          <AuthGuard requiredRole="SUPERINTENDENT">
            <SuperintendentDashboard />
          </AuthGuard>
        } />
        {/* Additional routes... */}
      </Routes>
    </BrowserRouter>
  );
};
```

### Role-Based Redirection
```typescript
// Auth service example
const handleLogin = async (credentials) => {
  const user = await authenticate(credentials);
  
  if (user.role === 'STUDENT') {
    return '/dashboard';
  } else if (user.role === 'PARENT') {
    return '/parent-dashboard';
  }
  // Additional role checks...
};
```

### Vertical Context Handling
- Vertical selection persists in session/storage
- Routes include vertical parameter when needed
- Superintendent dashboard filters by vertical

## Testing Scenarios

1. **Successful Login Flows**: Verify each role redirects correctly
2. **Invalid Credentials**: Test error handling and messaging
3. **Session Expiry**: Test auto-logout and redirect behavior
4. **Wrong Role Access**: Test guard protection
5. **Role Switching**: Test admin role switching functionality

This routing structure ensures clear separation of concerns between roles while maintaining a consistent user experience across the hostel management system.