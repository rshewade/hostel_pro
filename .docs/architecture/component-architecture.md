# Component Architecture & Design System Guidelines

> **Version:** 1.0
> **Last Updated:** December 2024
> **Status:** Active

This document establishes the component architecture, naming conventions, and design token consumption strategy for the Hostel Management Application UI component library.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Component Hierarchy](#component-hierarchy)
3. [Folder Structure](#folder-structure)
4. [Naming Conventions](#naming-conventions)
5. [Variant Properties Schema](#variant-properties-schema)
6. [Design Token Consumption](#design-token-consumption)
7. [Component Patterns](#component-patterns)
8. [Accessibility Requirements](#accessibility-requirements)
9. [Developer Mapping](#developer-mapping)

---

## Architecture Overview

### Design Philosophy

The component library follows a **Compositional Architecture** organized by functional domain rather than strict Atomic Design. This approach provides:

- **Practical Organization**: Components grouped by use case (forms, data, feedback)
- **Clear Boundaries**: Each category has distinct responsibilities
- **Scalability**: Easy to add new components within established patterns
- **Developer Experience**: Intuitive imports aligned with mental models

### Technology Stack

| Technology | Purpose |
|------------|---------|
| **React 18+** | Component framework with hooks |
| **TypeScript 5+** | Type safety and IDE support |
| **Tailwind CSS v4** | Utility-first styling |
| **CSS Variables** | Design tokens (colors, spacing, typography) |
| **clsx + tailwind-merge** | Class name composition via `cn()` utility |

---

## Component Hierarchy

### Category Structure

```
Components
├── forms/          # Form controls and inputs
├── ui/             # Basic UI elements (buttons, badges)
├── data/           # Data display components
├── feedback/       # User feedback components
├── layout/         # Layout utilities
└── [shared files]  # types.ts, constants.ts, utils.ts
```

### Category Definitions

#### Forms (`/forms`)
Input controls that collect user data.

| Component | Description | MUI Equivalent |
|-----------|-------------|----------------|
| Input | Text input field | TextField |
| Textarea | Multi-line text input | TextField (multiline) |
| Select | Dropdown selection | Select |
| Checkbox | Boolean toggle | Checkbox |
| Radio | Single selection from group | Radio |
| RadioGroup | Radio button group container | RadioGroup |
| DatePicker | Date selection | DatePicker |

#### UI (`/ui`)
Basic interactive and display elements.

| Component | Description | MUI Equivalent |
|-----------|-------------|----------------|
| Button | Action trigger | Button |
| Badge | Status indicator | Badge/Chip |
| Chip | Compact interactive element | Chip |
| Tag | Label/category indicator | Chip (variant) |

#### Data (`/data`)
Components for displaying structured data.

| Component | Description | MUI Equivalent |
|-----------|-------------|----------------|
| Table | Tabular data display | Table |
| Card | Content container | Card |
| List | Vertical item list | List |
| Stepper | Multi-step progress | Stepper |
| Tabs | Tabbed content | Tabs |
| Accordion | Collapsible sections | Accordion |

#### Feedback (`/feedback`)
User notification and state components.

| Component | Description | MUI Equivalent |
|-----------|-------------|----------------|
| Modal | Dialog overlay | Dialog |
| Toast | Temporary notification | Snackbar |
| Banner | Persistent message | Alert |
| Alert | Inline feedback | Alert |
| Spinner | Loading indicator | CircularProgress |
| EmptyState | No data placeholder | - |

#### Layout (`/layout`)
Structural and spacing utilities.

| Component | Description | MUI Equivalent |
|-----------|-------------|----------------|
| Container | Max-width wrapper | Container |
| Grid | CSS Grid wrapper | Grid |
| Flex | Flexbox wrapper | Stack |
| Spacer | Vertical spacing | - |

---

## Folder Structure

```
frontend/src/components/
├── index.ts              # Main exports (barrel file)
├── types.ts              # Shared TypeScript interfaces
├── constants.ts          # Reusable class mappings & constants
├── utils.ts              # Utility functions (cn, formatters)
│
├── forms/
│   ├── index.ts          # Form component exports
│   ├── Input.tsx
│   ├── Textarea.tsx
│   ├── Select.tsx
│   ├── Checkbox.tsx
│   ├── Radio.tsx
│   └── DatePicker.tsx
│
├── ui/
│   ├── index.ts          # UI component exports
│   ├── Button.tsx
│   ├── Badge.tsx
│   ├── Chip.tsx
│   └── Tag.tsx
│
├── data/
│   ├── index.ts          # Data component exports
│   ├── Table.tsx
│   ├── Card.tsx
│   ├── List.tsx
│   ├── Stepper.tsx
│   ├── Tabs.tsx
│   └── Accordion.tsx
│
├── feedback/
│   ├── index.ts          # Feedback component exports
│   ├── Modal.tsx
│   ├── Toast.tsx
│   ├── Banner.tsx
│   ├── Alert.tsx
│   ├── Spinner.tsx
│   └── EmptyState.tsx
│
└── layout/
    ├── index.ts          # Layout component exports
    ├── Container.tsx
    ├── Grid.tsx
    ├── Flex.tsx
    └── Spacer.tsx
```

---

## Naming Conventions

### File Naming

| Type | Convention | Example |
|------|------------|---------|
| Component files | PascalCase | `Button.tsx`, `DatePicker.tsx` |
| Index files | lowercase | `index.ts` |
| Utility files | camelCase | `utils.ts`, `constants.ts` |
| Type files | camelCase | `types.ts` |

### Component Naming

```tsx
// Component name matches file name (PascalCase)
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(...)

// Always set displayName for DevTools
Button.displayName = 'Button';
```

### Props Interface Naming

```tsx
// Pattern: {ComponentName}Props
export interface ButtonProps extends BaseComponentProps { ... }
export interface InputProps extends FormFieldProps { ... }
export interface ModalProps extends BaseComponentProps { ... }
```

### Type Naming

```tsx
// Variants use {Name}Variant pattern
export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive';
export type SizeVariant = 'sm' | 'md' | 'lg';
export type StatusVariant = 'default' | 'success' | 'warning' | 'error' | 'info';
```

### Constants Naming

```tsx
// SCREAMING_SNAKE_CASE for constant objects
export const BUTTON_VARIANT_CLASSES = { ... };
export const SIZE_CLASSES = { ... };
export const APPLICATION_STATUSES = { ... };
```

---

## Variant Properties Schema

### Standard Variants

All components should use these standardized variant names where applicable:

#### Size Variants
```tsx
type SizeVariant = 'sm' | 'md' | 'lg';

// Size mappings (in constants.ts)
export const SIZE_CLASSES = {
  sm: 'text-sm px-3 py-1.5',
  md: 'text-base px-4 py-2',
  lg: 'text-lg px-6 py-3',
} as const;
```

#### Status Variants
```tsx
type StatusVariant = 'default' | 'success' | 'warning' | 'error' | 'info';

// Used for: Badge, Alert, Banner, Toast
export const STATUS_BADGE_CLASSES = {
  default: 'bg-gray-100 text-gray-800',
  success: 'bg-green-100 text-green-800',
  warning: 'bg-yellow-100 text-yellow-800',
  error: 'bg-red-100 text-red-800',
  info: 'bg-blue-100 text-blue-800',
} as const;
```

#### Button Variants
```tsx
type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive';

export const BUTTON_VARIANT_CLASSES = {
  primary: 'bg-gold-500 text-navy-950 hover:bg-gold-600 focus:ring-gold-500',
  secondary: 'bg-white text-navy-700 border border-gray-300 hover:bg-gray-50',
  ghost: 'text-navy-700 hover:bg-gray-100',
  destructive: 'bg-red-500 text-white hover:bg-red-600',
} as const;
```

#### Input Variants
```tsx
type InputVariant = 'default' | 'error' | 'success';

export const INPUT_VARIANT_CLASSES = {
  default: 'border-gray-300 focus:border-gold-500 focus:ring-gold-500',
  error: 'border-red-500 focus:border-red-500 focus:ring-red-500',
  success: 'border-green-500 focus:border-green-500 focus:ring-green-500',
} as const;
```

### State Props (Boolean)

Standard boolean props for component states:

| Prop | Type | Description |
|------|------|-------------|
| `disabled` | boolean | Prevents interaction |
| `loading` | boolean | Shows loading state |
| `required` | boolean | Marks field as required |
| `readOnly` | boolean | Prevents editing but allows selection |
| `fullWidth` | boolean | Expands to container width |
| `closable` | boolean | Shows close button |

### Common Props Pattern

```tsx
interface CommonComponentProps {
  className?: string;        // Additional CSS classes
  id?: string;               // HTML id attribute
  'data-testid'?: string;    // Testing identifier
  children?: ReactNode;      // Child content
}
```

---

## Design Token Consumption

### Token Categories

Tokens are defined in `globals.css` as CSS custom properties:

| Category | Prefix | Example |
|----------|--------|---------|
| Colors (primitive) | `--color-` | `--color-navy-500` |
| Background | `--bg-` | `--bg-primary` |
| Text | `--text-` | `--text-primary` |
| Border | `--border-` | `--border-primary` |
| Surface | `--surface-` | `--surface-elevated` |
| State | `--state-` | `--state-success-bg` |
| Spacing | `--space-` | `--space-4` |
| Typography | `--text-`, `--font-`, `--leading-` | `--text-lg` |
| Radius | `--radius-` | `--radius-md` |
| Shadow | `--shadow-` | `--shadow-card` |
| Transition | `--transition-` | `--transition-fast` |
| Z-index | `--z-` | `--z-modal` |

### Token Usage Rules

#### DO: Use Semantic Tokens

```tsx
// Correct - uses semantic tokens
<div style={{ backgroundColor: 'var(--bg-primary)' }}>
<span style={{ color: 'var(--text-secondary)' }}>

// In Tailwind classes (when mapped)
<div className="bg-surface text-navy-900">
```

#### DON'T: Use Raw Values

```tsx
// Incorrect - raw hex values
<div style={{ backgroundColor: '#ffffff' }}>
<span style={{ color: '#6b7280' }}>

// Incorrect - raw pixel values
<div style={{ padding: '16px', borderRadius: '8px' }}>
```

### Tailwind Integration

Tokens are exposed to Tailwind via `@theme inline` in `globals.css`:

```css
@theme inline {
  --color-navy-500: var(--color-navy-500);
  --color-gold-500: var(--color-gold-500);
  --font-serif: var(--font-serif);
}
```

Use Tailwind utilities that map to these tokens:

```tsx
// Tailwind classes using design tokens
<button className="bg-gold-500 text-navy-950 hover:bg-gold-600">
<p className="text-navy-700 font-sans">
```

### CSS Variable Usage in Components

For inline styles (when Tailwind doesn't cover):

```tsx
// Correct pattern
<div
  style={{
    backgroundColor: 'var(--surface-primary)',
    borderRadius: 'var(--radius-lg)',
    boxShadow: 'var(--shadow-card)',
  }}
>
```

---

## Component Patterns

### ID Generation for SSR Compatibility

**IMPORTANT**: Never use `Math.random()` for generating IDs in components. It causes hydration mismatches between server and client.

```tsx
// WRONG - causes hydration mismatch
const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

// CORRECT - use React's useId() hook
import { useId } from 'react';

const generatedId = useId();
const inputId = id || `input-${generatedId}`;
```

### Standard Component Template

```tsx
import { forwardRef, useId } from 'react';
import { cn } from '../utils';
import { SIZE_CLASSES } from '../constants';
import type { BaseComponentProps, SizeVariant } from '../types';

export interface ComponentNameProps extends BaseComponentProps {
  size?: SizeVariant;
  disabled?: boolean;
  // ... other props
}

const ComponentName = forwardRef<HTMLDivElement, ComponentNameProps>(({
  className,
  size = 'md',
  disabled = false,
  children,
  ...props
}, ref) => {
  const classes = cn(
    // Base styles
    'inline-flex items-center',
    // Size variant
    SIZE_CLASSES[size],
    // State styles
    disabled && 'opacity-50 cursor-not-allowed',
    // Custom classes (always last)
    className
  );

  return (
    <div ref={ref} className={classes} {...props}>
      {children}
    </div>
  );
});

ComponentName.displayName = 'ComponentName';

export { ComponentName };
```

### Form Field Pattern

Form fields wrap inputs with labels, error messages, and helper text:

```tsx
const FormField = forwardRef<HTMLInputElement, FormFieldProps>(({
  label,
  error,
  helperText,
  required,
  id,
  ...props
}, ref) => {
  const inputId = id || generateId('input');
  const errorId = error ? `${inputId}-error` : undefined;

  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-navy-900">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <input
        ref={ref}
        id={inputId}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={errorId}
        {...props}
      />

      {error && (
        <p id={errorId} className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      {helperText && !error && (
        <p className="text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
});
```

### Compound Component Pattern

For complex components with multiple parts (e.g., Tabs, Accordion):

```tsx
// Tabs.tsx
interface TabsContextValue {
  activeTab: string;
  setActiveTab: (id: string) => void;
}

const TabsContext = createContext<TabsContextValue | null>(null);

const Tabs = ({ children, defaultActiveTab }) => {
  const [activeTab, setActiveTab] = useState(defaultActiveTab);

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className="tabs-container">{children}</div>
    </TabsContext.Provider>
  );
};

const TabList = ({ children }) => (
  <div role="tablist" className="flex border-b">{children}</div>
);

const Tab = ({ id, children }) => {
  const { activeTab, setActiveTab } = useContext(TabsContext);
  return (
    <button
      role="tab"
      aria-selected={activeTab === id}
      onClick={() => setActiveTab(id)}
    >
      {children}
    </button>
  );
};

const TabPanel = ({ id, children }) => {
  const { activeTab } = useContext(TabsContext);
  if (activeTab !== id) return null;
  return <div role="tabpanel">{children}</div>;
};

Tabs.List = TabList;
Tabs.Tab = Tab;
Tabs.Panel = TabPanel;
```

---

## Accessibility Requirements

### All Components Must

1. **Support keyboard navigation**
   - Interactive elements focusable via Tab
   - Escape key closes overlays
   - Arrow keys for navigation where applicable

2. **Include ARIA attributes**
   - `role` attributes for semantic meaning
   - `aria-label` or `aria-labelledby` for unnamed elements
   - `aria-describedby` for additional descriptions
   - `aria-invalid` for error states
   - `aria-expanded` for collapsible elements

3. **Maintain focus visibility**
   - Never remove focus outline (`outline: none` without alternative)
   - Use `focus-visible` for keyboard-only focus styles

4. **Meet contrast requirements**
   - 4.5:1 for normal text
   - 3:1 for large text (18px+ or 14px+ bold)

### Component-Specific Requirements

| Component | Requirements |
|-----------|--------------|
| Button | `aria-disabled` when loading, spinner has `role="status"` |
| Modal | Focus trap, return focus on close, `role="dialog"` |
| Toast | `role="alert"` or `role="status"` based on urgency |
| Form inputs | Associated labels, error descriptions linked via `aria-describedby` |
| Tabs | `role="tablist"`, `role="tab"`, `role="tabpanel"` |
| Accordion | `aria-expanded`, `aria-controls` |

---

## Developer Mapping

### Common UI Library Equivalents

| Our Component | MUI | Ant Design | Chakra UI |
|---------------|-----|------------|-----------|
| Button | Button | Button | Button |
| Input | TextField | Input | Input |
| Select | Select | Select | Select |
| Checkbox | Checkbox | Checkbox | Checkbox |
| Radio | Radio | Radio | Radio |
| Badge | Chip | Tag | Badge |
| Card | Card | Card | Box |
| Table | Table | Table | Table |
| Modal | Dialog | Modal | Modal |
| Tabs | Tabs | Tabs | Tabs |
| Accordion | Accordion | Collapse | Accordion |
| Toast | Snackbar | message | useToast |
| Spinner | CircularProgress | Spin | Spinner |

### Import Examples

```tsx
// Import individual components
import { Button, Input, Modal } from '@/components';

// Import from category
import { Button, Badge, Chip } from '@/components/ui';
import { Input, Select, Checkbox } from '@/components/forms';

// Import types
import type { ButtonVariant, SizeVariant } from '@/components/types';
```

---

## Maintenance Checklist

When adding or modifying components:

- [ ] Component uses `forwardRef` for ref forwarding
- [ ] Props interface extends appropriate base type
- [ ] All variants use standardized type definitions
- [ ] Styles consume design tokens (no raw values)
- [ ] `displayName` is set for DevTools
- [ ] Accessibility requirements met
- [ ] Component exported from category index and main index
- [ ] TypeScript types are properly exported
- [ ] Added to design system demo page for visual testing
