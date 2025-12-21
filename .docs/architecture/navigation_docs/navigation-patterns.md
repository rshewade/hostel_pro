# Navigation Patterns & Component Props for Role-Based Navigation

## Overview
This document defines the navigation patterns, component props, and conditional styles for implementing role-based navigation in the Hostel Management Application.

## Navigation Pattern Selection

### 1. Top Navigation (Global)
**Pattern**: Horizontal navigation bar
**Components**: 
- Logo/Brand
- Vertical Selector
- User Profile/Logout
- Notifications

### 2. Side Navigation (Dashboard Roles)
**Pattern**: Vertical sidebar navigation
**Components**:
- Role-specific menu items
- Active section highlighting
- Collapsible sub-menus
- Mobile-responsive hamburger menu

### 3. Breadcrumbs (Tertiary Navigation)
**Pattern**: Horizontal breadcrumb trail
**Components**:
- Page hierarchy display
- Clickable navigation
- Responsive truncation

## Component Props & Conditional Styles

### NavigationItem Props
```typescript
interface NavigationItemProps {
  id: string;
  label: string;
  icon?: React.ReactNode;
  path: string;
  role?: UserRole[];
  vertical?: HostelVertical[];
  children?: NavigationItemProps[];
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  badge?: string;
  badgeColor?: 'default' | 'success' | 'warning' | 'error' | 'info';
}
```

### Navigation Props
```typescript
interface NavigationProps {
  role: UserRole;
  vertical: HostelVertical;
  items: NavigationItemProps[];
  variant: 'top' | 'side' | 'breadcrumbs';
  className?: string;
  onVerticalChange?: (vertical: HostelVertical) => void;
  onRoleChange?: (role: UserRole) => void;
}
```

## Role-Specific Navigation Patterns

### Applicant Navigation
**Pattern**: Minimal top navigation
- Vertical selector
- Application status link
- Login/Logout

### Resident Student Navigation
**Pattern**: Side navigation with dashboard
- Dashboard overview
- Fees & Payments
- Room Details
- Leave Management
- Documents
- Renewal
- Communication

### Superintendent Navigation
**Pattern**: Comprehensive side navigation
- Applications Dashboard
- Leave Approvals
- Room Management
- Communication Templates
- Configuration
- Reports
- Audit Logs

### Trustees Navigation
**Pattern**: Focused side navigation
- Applications Review
- Interview Scheduling
- Final Approvals
- Reports
- Audit Logs

### Accounts Navigation
**Pattern**: Financial-focused navigation
- Receivables Dashboard
- Payment Processing
- Receipt Generation
- Financial Reports
- Export Tools
- Audit Logs

### Parents Navigation
**Pattern**: Limited navigation
- Dashboard (Child Status)
- Fees View
- Leave Status
- Communication
- Settings

## Conditional Styling Rules

### Role-Based Styling
```css
/* Student role styling */
.student-nav {
  background: linear-gradient(135deg, #f0f4ff 0%, #e6f0ff 100%);
  border-left: 4px solid #3b82f6;
}

/* Superintendent role styling */
.superintendent-nav {
  background: linear-gradient(135deg, #fef3e2 0%, #fdf7ed 100%);
  border-left: 4px solid #f59e0b;
}

/* Trustee role styling */
.trustee-nav {
  background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%);
  border-left: 4px solid #10b981;
}

/* Accounts role styling */
.accounts-nav {
  background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
  border-left: 4px solid #ef4444;
}

/* Parent role styling */
.parent-nav {
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border-left: 4px solid #06b6d4;
}
```

### Vertical Context Styling
```css
/* Boys Hostel styling */
.boys-hostel {
  border-color: #1e40af;
}

/* Girls Ashram styling */
.girls-ashram {
  border-color: #a21caf;
}

/* Dharamshala styling */
.dharamshala {
  border-color: #7c2d12;
}
```

### Responsive Design
```css
/* Desktop navigation */
@media (min-width: 1024px) {
  .side-nav {
    display: block;
    width: 256px;
  }
}

/* Tablet navigation */
@media (min-width: 768px) and (max-width: 1023px) {
  .side-nav {
    width: 200px;
  }
}

/* Mobile navigation */
@media (max-width: 767px) {
  .side-nav {
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    width: 280px;
    height: 100vh;
    z-index: 50;
  }
  
  .mobile-nav-toggle {
    display: block;
  }
}
```

## Component Implementation Examples

### Top Navigation Component
```typescript
const TopNavigation: React.FC<TopNavigationProps> = ({
  role,
  vertical,
  onVerticalChange,
  onLogout
}) => {
  return (
    <header className="top-nav">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Logo />
            <VerticalSelector 
              currentVertical={vertical}
              onVerticalChange={onVerticalChange}
            />
          </div>
          
          {/* Navigation items */}
          <div className="flex items-center space-x-6">
            <NavigationLink 
              label="Dashboard" 
              path="/dashboard" 
              role={role}
            />
            <Notifications />
            <UserMenu onLogout={onLogout} />
          </div>
        </div>
      </div>
    </header>
  );
};
```

### Side Navigation Component
```typescript
const SideNavigation: React.FC<SideNavigationProps> = ({
  role,
  vertical,
  activeSection,
  onSectionClick
}) => {
  const navItems = getNavigationItems(role, vertical);
  
  return (
    <aside className={`side-nav ${role}-nav ${vertical}-context`}>
      <nav className="py-6">
        <ul className="space-y-2">
          {navItems.map(item => (
            <li key={item.id}>
              <NavigationItem
                item={item}
                active={item.id === activeSection}
                onClick={() => onSectionClick(item.id)}
                role={role}
                vertical={vertical}
              />
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};
```

### Breadcrumbs Component
```typescript
const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ paths }) => {
  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        {paths.map((path, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && <ChevronRight className="w-4 h-4 mx-2" />}
            <NavigationLink
              label={path.label}
              path={path.path}
              active={index === paths.length - 1}
            />
          </li>
        ))}
      </ol>
    </nav>
  );
};
```

## Props Configuration Examples

### Student Navigation Props
```typescript
const studentNavItems: NavigationItemProps[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: <HomeIcon />,
    path: '/dashboard',
    role: [USER_ROLES.STUDENT],
    active: true
  },
  {
    id: 'fees',
    label: 'Fees & Payments',
    icon: <CreditCardIcon />,
    path: '/fees',
    role: [USER_ROLES.STUDENT]
  },
  {
    id: 'room',
    label: 'Room Details',
    icon: <BedIcon />,
    path: '/room',
    role: [USER_ROLES.STUDENT]
  },
  {
    id: 'leave',
    label: 'Leave Management',
    icon: <CalendarIcon />,
    path: '/leave',
    role: [USER_ROLES.STUDENT]
  }
];
```

### Superintendent Navigation Props
```typescript
const superintendentNavItems: NavigationItemProps[] = [
  {
    id: 'applications',
    label: 'Applications',
    icon: <FileTextIcon />,
    path: '/applications',
    role: [USER_ROLES.SUPERINTENDENT],
    badge: '12',
    badgeColor: 'warning'
  },
  {
    id: 'leaves',
    label: 'Leave Approvals',
    icon: <CalendarIcon />,
    path: '/leaves',
    role: [USER_ROLES.SUPERINTENDENT]
  },
  {
    id: 'rooms',
    label: 'Room Management',
    icon: <BedIcon />,
    path: '/rooms',
    role: [USER_ROLES.SUPERINTENDENT]
  },
  {
    id: 'communication',
    label: 'Communication',
    icon: <MessageIcon />,
    path: '/communication',
    role: [USER_ROLES.SUPERINTENDENT]
  }
];
```

## Validation Criteria

### Pattern Consistency
- ✅ Consistent navigation pattern per role
- ✅ Clear visual hierarchy
- ✅ Responsive design implementation
- ✅ Accessibility compliance

### Role Separation
- ✅ Role-specific navigation items
- ✅ Conditional styling by role
- ✅ Vertical context propagation
- ✅ Permission-based access

### User Experience
- ✅ Navigation depth ≤ 3 levels
- ✅ Clear active state indication
- ✅ Mobile-responsive design
- ✅ Keyboard navigation support

This navigation pattern implementation provides a foundation for building role-based navigation in the Hostel Management Application with proper component props, conditional styling, and responsive design considerations.