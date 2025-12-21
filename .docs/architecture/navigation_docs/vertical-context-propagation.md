# Vertical Context Propagation Rules

## Overview
This document defines the rules and implementation guidelines for vertical context propagation across the Hostel Management System. Vertical context refers to the selection of Boys Hostel, Girls Ashram, or Dharamshala, which affects content filtering, labeling, and navigation throughout the application.

## Context Persistence Mechanisms

### 1. URL Parameters
- **Primary Storage**: URL query parameters for bookmarkability and shareability
- **Format**: `?vertical=boys-hostel`, `?vertical=girls-ashram`, `?vertical=dharamshala`
- **Default**: Boys Hostel (fallback when no vertical specified)

### 2. Session State
- **Secondary Storage**: Browser session storage for consistent experience
- **Purpose**: Maintain vertical selection across page refreshes
- **Sync**: URL parameter takes precedence over session state

### 3. Component Props
- **Vertical Prop**: Passed down through component hierarchy
- **Type**: `HostelVertical` enum
- **Values**: `boys-hostel`, `girls-ashram`, `dharamshala`

## Propagation Rules

### 1. Global Context Initialization
```typescript
// Context provider initialization
const VerticalContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [vertical, setVertical] = useState<HostelVertical>('boys-hostel');
  
  // Initialize from URL or session
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlVertical = urlParams.get('vertical') as HostelVertical;
    const sessionVertical = sessionStorage.getItem('vertical') as HostelVertical;
    
    setVertical(urlVertical || sessionVertical || 'boys-hostel');
  }, []);
  
  // Persist to session and URL
  const updateVertical = (newVertical: HostelVertical) => {
    setVertical(newVertical);
    sessionStorage.setItem('vertical', newVertical);
    const urlParams = new URLSearchParams(window.location.search);
    urlParams.set('vertical', newVertical);
    window.history.replaceState({}, '', `${window.location.pathname}?${urlParams}`);
  };
  
  return (
    <VerticalContext.Provider value={{ vertical, updateVertical }}>
      {children}
    </VerticalContext.Provider>
  );
};
```

### 2. Content Filtering Rules
- **Applications**: Filter by vertical during submission and review
- **Rooms**: Show only rooms belonging to selected vertical
- **Residents**: Display residents from selected vertical
- **Fees**: Filter financial records by vertical
- **Leave Requests**: Filter by vertical context
- **Documents**: Show documents specific to vertical

### 3. Label and Text Updates
- **Dynamic Labels**: Update page titles, section headers, and navigation items
- **Contextual Messaging**: Include vertical name in status messages and notifications
- **Breadcrumb Updates**: Reflect vertical in navigation breadcrumbs

## Implementation Examples

### 1. Dashboard Content Filtering
```typescript
// Dashboard content component
const DashboardContent: React.FC = () => {
  const { vertical } = useVerticalContext();
  
  const rooms = useRooms(vertical); // Filter rooms by vertical
  const residents = useResidents(vertical); // Filter residents by vertical
  const fees = useFees(vertical); // Filter fees by vertical
  
  return (
    <div>
      <h2>{vertical === 'boys-hostel' ? 'Boys Hostel' : vertical === 'girls-ashram' ? 'Girls Ashram' : 'Dharamshala'} Dashboard</h2>
      <RoomsList rooms={rooms} />
      <ResidentsList residents={residents} />
      <FeesOverview fees={fees} />
    </div>
  );
};
```

### 2. Navigation Label Updates
```typescript
// Dynamic navigation labels
const NavigationItem: React.FC<{ item: NavigationItemProps }> = ({ item }) => {
  const { vertical } = useVerticalContext();
  
  const getLabel = () => {
    if (item.id === 'applications') {
      return `${vertical === 'boys-hostel' ? 'Boys' : vertical === 'girls-ashram' ? 'Girls' : 'Dharamshala'} Applications`;
    }
    return item.label;
  };
  
  return (
    <li>
      <a href={item.path}>{getLabel()}</a>
    </li>
  );
};
```

### 3. Vertical Switching Flow
```
[Dashboard] → [Vertical Selector] → [URL Update] → [Session Update] → [Content Re-render]
```

## State Management Guidelines

### 1. Context Hierarchy
```
App
├── VerticalContextProvider
│   ├── TopNavigation (includes vertical selector)
│   ├── MainContent (filtered by vertical)
│   └── SideNavigation (labels updated by vertical)
```

### 2. Data Fetching
- **API Calls**: Include vertical parameter in all data requests
- **Caching**: Cache data per vertical context
- **Invalidation**: Clear cache when vertical changes

### 3. Error Handling
- **Vertical Not Found**: Default to Boys Hostel if invalid vertical specified
- **Loading States**: Show loading indicator during vertical context switch
- **Error Boundaries**: Handle vertical-specific data loading errors

## Vertical-Specific Rules

### Boys Hostel
- **Color Scheme**: Blue accents
- **Default Content**: Boys-specific applications and residents
- **Navigation Labels**: "Boys Hostel" prefix for role-specific sections

### Girls Ashram
- **Color Scheme**: Purple accents  
- **Default Content**: Girls-specific applications and residents
- **Navigation Labels**: "Girls Ashram" prefix for role-specific sections

### Dharamshala
- **Color Scheme**: Brown accents
- **Default Content**: Dharamshala-specific applications and residents
- **Navigation Labels**: "Dharamshala" prefix for role-specific sections

## Edge Cases and Handling

### 1. Vertical Switching During Session
- **Behavior**: Re-render all vertical-dependent components
- **Data**: Refetch filtered data for new vertical
- **URL**: Update URL parameters
- **Session**: Update session storage

### 2. Invalid Vertical Parameter
- **Fallback**: Default to Boys Hostel
- **Logging**: Log invalid vertical attempts for analytics
- **User Feedback**: Show notification about vertical reset

### 3. Cross-Vertical Operations
- **Superintendent**: Can view all verticals with filter controls
- **Trustee**: Can review applications across verticals
- **Accounts**: Can view financial data across verticals

## Testing Scenarios

### 1. Basic Vertical Switching
- Switch from Boys Hostel → Girls Ashram
- Verify URL update and session persistence
- Confirm content re-render with correct data

### 2. Vertical Propagation
- Change vertical in top navigation
- Verify all dashboard components update
- Check navigation labels reflect new vertical

### 3. Bookmark and Share
- Bookmark a page with vertical parameter
- Share URL with vertical parameter
- Verify correct vertical loads on navigation

### 4. Error Handling
- Test with invalid vertical parameter
- Verify fallback behavior
- Check error logging

## Developer Guidelines

### 1. Component Design
- **Vertical-Aware Components**: Accept vertical prop for filtering
- **Context Usage**: Use VerticalContext for accessing current vertical
- **Conditional Rendering**: Show/hide content based on vertical

### 2. API Integration
- **Endpoint Format**: Include vertical parameter in API calls
- **Response Handling**: Handle vertical-specific data structures
- **Error Responses**: Gracefully handle vertical-specific errors

### 3. Performance Considerations
- **Memoization**: Memoize vertical-dependent data
- **Lazy Loading**: Lazy load vertical-specific components
- **Data Pagination**: Paginate data per vertical context

This vertical context propagation system ensures consistent user experience across all roles while maintaining the ability to filter and view content specific to each vertical (Boys Hostel, Girls Ashram, Dharamshala).