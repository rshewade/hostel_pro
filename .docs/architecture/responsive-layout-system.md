# Responsive Layout System

## Breakpoints

| Name | Range | Columns | Max Content Width | Usage |
|------|-------|---------|-------------------|-------|
| `xs` | 0 - 639px | 4 | 100% | Mobile phones |
| `sm` | 640 - 767px | 4 | 640px | Large phones |
| `md` | 768 - 1023px | 8 | 768px | Tablets portrait |
| `lg` | 1024 - 1279px | 12 | 1024px | Tablets landscape / Small laptops |
| `xl` | 1280 - 1535px | 12 | 1280px | Desktops |
| `2xl` | 1536px+ | 12 | 1440px | Large screens |

## Grid System

### Column Configuration
```typescript
const GRID_CONFIG = {
  xs: { columns: 4, gutter: 16, margin: 16 },
  sm: { columns: 4, gutter: 16, margin: 20 },
  md: { columns: 8, gutter: 24, margin: 24 },
  lg: { columns: 12, gutter: 24, margin: 32 },
  xl: { columns: 12, gutter: 32, margin: 48 },
  '2xl': { columns: 12, gutter: 32, margin: 64 },
};
```

### Gutter Sizes (from spacing tokens)
- `gutter-xs`: 8px
- `gutter-sm`: 12px
- `gutter-md`: 16px
- `gutter-lg`: 24px
- `gutter-xl`: 32px

### Container Max Widths
- `container-sm`: 640px (Forms, modals)
- `container-md`: 768px (Content pages)
- `container-lg`: 1024px (Dashboards)
- `container-xl`: 1280px (Full layouts)
- `container-2xl`: 1440px (Wide displays)

## Responsive Behavior Rules

### Navigation
- **Desktop (lg+)**: Sidebar visible, horizontal nav items
- **Tablet (md)**: Collapsible sidebar, horizontal nav
- **Mobile (sm/xs)**: Hamburger menu, bottom nav or stacked

### Tables
- **Desktop (lg+)**: Full columns, horizontal scroll
- **Tablet (md)**: Priority columns, horizontal scroll
- **Mobile (sm/xs)**: Card view or stacked rows

### Forms
- **Desktop (lg+)**: 2-column layouts for related fields
- **Tablet (md)**: 2-column with reduced spacing
- **Mobile (sm/xs)**: Single column, stacked fields

### Cards & Grids
- **Desktop (lg+)**: 4 cards per row
- **Tablet (md)**: 2-3 cards per row
- **Mobile (sm/xs)**: 1 card per row

### Modals
- **Desktop**: Max width 600px, centered
- **Tablet**: Max width 500px
- **Mobile**: Full width with padding

## CSS Implementation

### Using CSS Grid
```css
.grid-container {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 24px;
  padding: 0 32px;
  max-width: 1280px;
  margin: 0 auto;
}

.col-span-12 { grid-column: span 12; }
.col-span-8 { grid-column: span 8; }
.col-span-6 { grid-column: span 6; }
.col-span-4 { grid-column: span 4; }
.col-span-3 { grid-column: span 3; }
```

### Using Flexbox
```css
.flex-row {
  display: flex;
  flex-wrap: wrap;
  margin: -12px;
}

.flex-item {
  flex: 1 1 300px;
  padding: 12px;
}
```

### Media Queries
```css
/* Mobile first approach */

/* Small - Large phones */
@media (min-width: 640px) {
  .container { max-width: 640px; }
}

/* Medium - Tablets */
@media (min-width: 768px) {
  .container { max-width: 768px; }
  .grid { grid-template-columns: repeat(8, 1fr); }
}

/* Large - Tablets landscape / Small laptops */
@media (min-width: 1024px) {
  .container { max-width: 1024px; }
  .grid { grid-template-columns: repeat(12, 1fr); }
}

/* XL - Desktops */
@media (min-width: 1280px) {
  .container { max-width: 1280px; }
}

/* 2XL - Large screens */
@media (min-width: 1536px) {
  .container { max-width: 1440px; }
}
```

## Typography Scaling

| Element | xs | sm | md | lg | xl |
|---------|----|----|----|----|-----|
| h1 | 28px | 32px | 36px | 40px | 44px |
| h2 | 24px | 26px | 28px | 32px | 36px |
| h3 | 20px | 22px | 24px | 26px | 28px |
| body | 14px | 14px | 15px | 15px | 16px |
| line-height | 1.5 | 1.5 | 1.5 | 1.5 | 1.6 |

## Print Styles

```css
@media print {
  .no-print { display: none !important; }
  .container { max-width: 100% !important; }
  .page-break { page-break-before: always; }
}
```

## Accessibility Considerations

- Minimum touch target: 44x44px
- Focus indicators visible at all sizes
- Text zoom support up to 200%
- Reduced motion support

## Implementation Checklist

- [ ] All containers use responsive max-widths
- [ ] Grid components use defined column counts
- [ ] Spacing uses design tokens (no ad-hoc values)
- [ ] Tables have horizontal scroll on mobile
- [ ] Forms stack correctly on mobile
- [ ] Navigation collapses appropriately
- [ ] Modals fit within viewport
- [ ] Print styles applied
