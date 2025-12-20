# Component Library Architecture

This document outlines the architecture, naming conventions, and development guidelines for the hostel management application's component library.

## Directory Structure

```
components/
├── index.ts           # Main export file
├── types.ts           # TypeScript interfaces and types
├── utils.ts           # Utility functions
├── constants.ts       # Component configuration constants
├── ui/                # Atomic UI components (buttons, badges, etc.)
├── forms/             # Form input components
├── data/              # Data display components (tables, cards, etc.)
├── feedback/          # User feedback components (modals, toasts, etc.)
├── layout/            # Layout utility components
└── icons/             # Icon components and utilities
```

## Naming Conventions

### Component Names
- **PascalCase**: Component file names and export names
- **Descriptive**: Use clear, descriptive names (e.g., `DataTable`, `StatusBadge`, `ConfirmationModal`)

### File Naming
- Component files: `ComponentName.tsx`
- Index files: `index.ts` (for directory exports)
- Test files: `ComponentName.test.tsx`
- Story files: `ComponentName.stories.tsx`

### Props Naming
- **camelCase**: All prop names
- **Boolean props**: Use `is` or `has` prefix for clarity (e.g., `isLoading`, `hasError`)
- **Event handlers**: Use `on` prefix (e.g., `onClick`, `onChange`)
- **Callback props**: Use `on` prefix for consistency

### CSS Class Naming
- **Tailwind utilities**: Primary styling approach
- **Design system tokens**: Use CSS custom properties from `globals.css`
- **Component-specific**: Use descriptive class names with component prefix when needed

## Component Architecture

### Base Component Structure

Each component should follow this pattern:

```typescript
import { cn } from '../utils';
import type { BaseComponentProps } from '../types';

interface ComponentNameProps extends BaseComponentProps {
  // Component-specific props
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
}

export function ComponentName({
  className,
  variant = 'primary',
  size = 'md',
  disabled = false,
  ...props
}: ComponentNameProps) {
  return (
    <div
      className={cn(
        // Base styles
        'base-classes',
        // Variant styles
        variant === 'primary' && 'variant-primary-classes',
        variant === 'secondary' && 'variant-secondary-classes',
        // Size styles
        size === 'sm' && 'size-sm-classes',
        size === 'md' && 'size-md-classes',
        size === 'lg' && 'size-lg-classes',
        // State styles
        disabled && 'disabled-classes',
        // Custom classes
        className
      )}
      {...props}
    />
  );
}
```

### Component Categories

#### UI Components (Atomic)
- **Purpose**: Basic building blocks
- **Examples**: Button, Badge, Chip, Tag, Icon
- **Characteristics**: Small, reusable, no complex logic

#### Form Components
- **Purpose**: User input collection
- **Examples**: Input, Textarea, Select, Checkbox, Radio, DatePicker
- **Characteristics**: Form validation, accessibility compliance

#### Data Display Components
- **Purpose**: Information presentation
- **Examples**: Table, Card, List, Badge, Stepper, Tabs, Accordion
- **Characteristics**: Data binding, sorting, filtering capabilities

#### Feedback Components
- **Purpose**: User communication
- **Examples**: Modal, Toast, Banner, Alert, Spinner, Loading states
- **Characteristics**: Temporary, dismissible, status communication

#### Layout Components
- **Purpose**: Page structure and spacing
- **Examples**: Container, Grid, Flex, Spacer
- **Characteristics**: CSS Grid/Flexbox utilities, responsive design

## Design System Integration

### Color Usage
- Use design system color tokens from `globals.css`
- Semantic colors for states (success, error, warning, info)
- Consistent color mapping across components

### Typography
- Use typography utility classes from `globals.css`
- Consistent text hierarchy
- Accessible contrast ratios

### Spacing
- Use spacing tokens (4px base scale)
- Consistent component padding and margins
- Responsive spacing where appropriate

### Shadows and Elevation
- Subtle institutional shadows
- Consistent elevation hierarchy
- Card-specific shadow treatment

## Accessibility Guidelines

### ARIA Support
- Proper ARIA labels and descriptions
- Keyboard navigation support
- Screen reader compatibility

### Focus Management
- Visible focus indicators
- Logical tab order
- Focus trapping in modals

### Color and Contrast
- WCAG AA compliance (4.5:1 for text, 3:1 for large text)
- Don't rely solely on color for meaning
- Support for high contrast themes

## Performance Considerations

### Bundle Size
- Tree-shakable exports
- Lazy loading for heavy components
- Minimal dependencies

### Rendering
- Memoization for expensive operations
- Proper key props in lists
- Avoid unnecessary re-renders

### Images and Assets
- Optimized image loading
- Proper alt text
- Lazy loading for off-screen content

## Testing Strategy

### Unit Tests
- Component rendering
- Props handling
- User interactions
- Accessibility compliance

### Integration Tests
- Component composition
- Form workflows
- Data flow

### Visual Regression
- Storybook stories for visual testing
- Consistent across browsers

## Development Workflow

### Component Creation
1. Define component interface in `types.ts`
2. Implement component with proper TypeScript types
3. Add to appropriate category directory
4. Export from `index.ts`
5. Create Storybook story
6. Add unit tests
7. Update documentation

### Code Review Checklist
- [ ] TypeScript types are properly defined
- [ ] Accessibility guidelines followed
- [ ] Responsive design implemented
- [ ] Design system tokens used
- [ ] Proper error handling
- [ ] Tests written and passing
- [ ] Documentation updated

## Migration Notes

### From Existing Components
- Gradually migrate existing components to new architecture
- Maintain backward compatibility during transition
- Update imports in consuming components

### Breaking Changes
- Document any breaking changes clearly
- Provide migration guides
- Update consuming code incrementally