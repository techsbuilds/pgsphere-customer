# Skeleton Components Guide

## Overview

This guide documents the skeleton loading components created for the PG Customer Portal application. Skeleton components provide a better user experience during data loading by showing placeholder content instead of simple spinners.

**All skeleton components are fully responsive** and adapt to mobile, tablet, and desktop screen sizes using Tailwind CSS responsive breakpoints.

## File Location

**Main File**: `src/components/common/Skeletons.tsx`

## Available Skeleton Components

**Total Components:** 16 skeleton components + 1 base component

### Mobile Responsiveness Features

All skeleton components include:
- ✅ **Mobile-first design** - Optimized for small screens
- ✅ **Responsive sizing** - Different sizes for mobile (`h-3`, `w-20`) vs desktop (`md:h-4`, `md:w-24`)
- ✅ **Layout adaptation** - Different layouts for mobile vs desktop (e.g., vertical stacking on mobile, horizontal on desktop)
- ✅ **Touch-friendly spacing** - Appropriate padding and margins for mobile interactions
- ✅ **Breakpoint support** - Uses Tailwind breakpoints: `sm:`, `md:`, `lg:`, `xl:`

### 1. Base Skeleton Component

```typescript
<Skeleton className="h-4 w-24" />
```

A basic skeleton block that can be customized with any className.

**Props:**
- `className` (optional): Additional CSS classes for customization

---

### 2. StatCardSkeleton

Used for loading dashboard statistics cards.

**Usage:**
```typescript
import { StatCardSkeleton } from '../components/common/Skeletons';

// In your component
<StatCardSkeleton />
```

**Responsive Features:**
- Smaller text/icons on mobile (`h-3`, `w-6`) 
- Larger text/icons on desktop (`lg:h-4`, `lg:w-10`)
- Responsive padding (`p-4 lg:p-6`)

**Used in:**
- Dashboard.tsx (Stats Grid)

---

### 3. MealCardSkeleton

Used for loading meal cards with items.

**Usage:**
```typescript
import { MealCardSkeleton } from '../components/common/Skeletons';

<MealCardSkeleton />
```

**Responsive Features:**
- **Desktop layout**: Horizontal layout with toggle on the right
- **Mobile layout**: Toggle in absolute position, content stacks vertically
- Responsive padding (`p-4 md:p-5`)
- Different item sizes (`h-7 md:h-8`)

**Used in:**
- Dashboard.tsx (Today's Meals section)
- MealMenu.tsx (Meal Display component)

---

### 4. UpdateCardSkeleton

Used for loading daily update/announcement cards.

**Usage:**
```typescript
import { UpdateCardSkeleton } from '../components/common/Skeletons';

<UpdateCardSkeleton />
```

**Responsive Features:**
- **Desktop**: Shows icon (12x12) on left with content on right
- **Mobile**: Shows smaller icon (10x10) with stacked content and bottom metadata
- Separate layouts using `hidden md:flex` and `md:hidden`
- Responsive padding (`p-4 md:p-6`)

**Used in:**
- DailyUpdates.tsx (Updates List)
- Dashboard.tsx (Recent Updates section via DashboardUpdatesSkeleton)

---

### 5. ComplaintCardSkeleton

Used for loading complaint cards.

**Usage:**
```typescript
import { ComplaintCardSkeleton } from '../components/common/Skeletons';

<ComplaintCardSkeleton />
```

**Responsive Features:**
- **Desktop**: Horizontal layout with status badge on right
- **Mobile**: Status badge in absolute position (top-right), vertical content
- Separate complete layouts for mobile and desktop
- Mobile includes bottom border with metadata

**Used in:**
- Complaints.tsx (Complaints List)

---

### 6. RentCardSkeleton

Used for loading rent payment cards.

**Usage:**
```typescript
import { RentCardSkeleton } from '../components/common/Skeletons';

<RentCardSkeleton />
```

**Used in:**
- Rent.tsx (Rent Payments Grid)

---

### 7. ProfileSectionSkeleton

Used for loading profile form sections.

**Usage:**
```typescript
import { ProfileSectionSkeleton } from '../components/common/Skeletons';

<ProfileSectionSkeleton />
```

**Used in:**
- Profile.tsx (Personal Information section)

---

### 8. ProfileCardSkeleton

Used for loading smaller profile information cards.

**Usage:**
```typescript
import { ProfileCardSkeleton } from '../components/common/Skeletons';

<ProfileCardSkeleton />
```

**Used in:**
- Profile.tsx (Branch Info, Room Details, Financial Details)

---

### 9. ListSkeleton

Generic skeleton for list items.

**Usage:**
```typescript
import { ListSkeleton } from '../components/common/Skeletons';

<ListSkeleton items={5} />
```

**Props:**
- `items` (optional, default: 5): Number of skeleton items to display

---

### 10. DashboardMealsSkeleton

Composite skeleton specifically for dashboard meals section.

**Usage:**
```typescript
import { DashboardMealsSkeleton } from '../components/common/Skeletons';

<DashboardMealsSkeleton />
```

**Used in:**
- Dashboard.tsx (Today's Meals section)

---

### 11. DashboardUpdatesSkeleton

Composite skeleton specifically for dashboard updates section.

**Usage:**
```typescript
import { DashboardUpdatesSkeleton } from '../components/common/Skeletons';

<DashboardUpdatesSkeleton />
```

**Used in:**
- Dashboard.tsx (Recent Updates section)

---

### 12. PageHeaderSkeleton

Skeleton for page headers with responsive design.

**Usage:**
```typescript
import { PageHeaderSkeleton } from '../components/common/Skeletons';

<PageHeaderSkeleton />
```

---

### 13. WeekNavigationSkeleton

Skeleton for week date navigation in meal menu.

**Usage:**
```typescript
import { WeekNavigationSkeleton } from '../components/common/Skeletons';

<WeekNavigationSkeleton />
```

---

### 14. FullPageSkeleton

Complete page skeleton with header, stats, and content areas.

**Usage:**
```typescript
import { FullPageSkeleton } from '../components/common/Skeletons';

<FullPageSkeleton />
```

---

### 15. CenteredSpinner

Simple centered loading spinner for basic loading states.

**Usage:**
```typescript
import { CenteredSpinner } from '../components/common/Skeletons';

<CenteredSpinner size="md" />
```

**Props:**
- `size` (optional): 'sm' | 'md' | 'lg' (default: 'md')

---

### 16. SidebarSkeleton

Skeleton for the sidebar navigation with header, menu items, and logout button.

**Usage:**
```typescript
import { SidebarSkeleton } from '../components/common/Skeletons';

<SidebarSkeleton />
```

**Responsive Features:**
- **Mobile**: Hidden by default with `-translate-x-full` (slide-in behavior)
- **Desktop**: Static sidebar with `lg:translate-x-0 lg:static`
- Responsive padding (`p-4 md:p-6`)
- Responsive icon sizes (`w-4 h-4 md:w-5 md:h-5`)
- Close button skeleton visible only on mobile (`lg:hidden`)

**Used in:**
- Sidebar.tsx (Main sidebar component)

---

## Implementation Examples

### Example 1: Dashboard Page

```typescript
import { StatCardSkeleton, DashboardMealsSkeleton, DashboardUpdatesSkeleton } from '../components/common/Skeletons';

// Stats Grid
{statsLoading ? (
  <>
    <StatCardSkeleton />
    <StatCardSkeleton />
    <StatCardSkeleton />
    <StatCardSkeleton />
  </>
) : (
  // Actual stats cards
)}

// Meals Section
{mealsLoading ? (
  <DashboardMealsSkeleton />
) : (
  // Actual meals content
)}

// Updates Section
{updatesLoading ? (
  <DashboardUpdatesSkeleton />
) : (
  // Actual updates content
)}
```

### Example 2: Daily Updates Page

```typescript
import { UpdateCardSkeleton } from '../components/common/Skeletons';

{isLoading ? (
  <div className="space-y-4">
    <UpdateCardSkeleton />
    <UpdateCardSkeleton />
    <UpdateCardSkeleton />
    <UpdateCardSkeleton />
    <UpdateCardSkeleton />
  </div>
) : (
  // Actual updates
)}
```

### Example 3: Rent Payments Page

```typescript
import { RentCardSkeleton } from '../components/common/Skeletons';

{isLoading ? (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
    {Array.from({ length: 8 }).map((_, index) => (
      <RentCardSkeleton key={index} />
    ))}
  </div>
) : (
  // Actual rent cards
)}
```

### Example 4: Sidebar Component

```typescript
import { SidebarSkeleton } from '../common/Skeletons';

const Sidebar: React.FC = () => {
  const { user, isLoading } = useSelector((state: RootState) => state.auth);

  // Show skeleton only on initial load when user data is not available yet
  // This prevents the sidebar from disappearing when other auth actions trigger loading
  if (isLoading && !user) {
    return <SidebarSkeleton />;
  }

  return (
    // Actual sidebar content
  );
};
```

## Design Principles

1. **Consistency**: All skeletons use a consistent gray color palette and animation
2. **Responsive**: All skeletons fully adapt to mobile, tablet, and desktop screens
3. **Performance**: Uses CSS animations for smooth performance
4. **Accessibility**: Provides visual feedback without blocking user interaction
5. **Maintainability**: Separate components for different use cases
6. **Mobile-First**: Designed primarily for mobile devices with progressive enhancement

## Responsive Design Strategy

### Breakpoints Used

- **Mobile (default)**: < 768px - Smaller text, compact spacing, vertical layouts
- **Tablet (md:)**: ≥ 768px - Medium-sized elements, some horizontal layouts
- **Desktop (lg:)**: ≥ 1024px - Larger elements, full horizontal layouts
- **Wide (xl:)**: ≥ 1280px - Maximum spacing and sizing

### Common Responsive Patterns

1. **Size Scaling**: Elements scale up on larger screens
   ```tsx
   <Skeleton className="h-3 w-20 md:h-4 md:w-24 lg:h-5 lg:w-28" />
   ```

2. **Layout Changes**: Different layouts for mobile vs desktop
   ```tsx
   <div className="hidden md:flex">Desktop Layout</div>
   <div className="md:hidden">Mobile Layout</div>
   ```

3. **Spacing Adjustments**: Padding/margins increase on larger screens
   ```tsx
   <div className="p-4 md:p-6 lg:p-8">
   ```

4. **Grid Adaptation**: Grids stack on mobile, expand on desktop
   ```tsx
   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
   ```

## Styling

All skeletons use:
- Base color: `bg-gray-200`
- Animation: `animate-pulse` (Tailwind CSS utility)
- Border radius: Matches the actual component design

## Best Practices

1. **Match the Layout**: Skeleton should closely match the actual component's layout
2. **Appropriate Count**: Show realistic number of skeleton items
3. **Loading State**: Always check loading state before showing skeletons
4. **Transitions**: Consider smooth transitions between skeleton and actual content
5. **Error Handling**: Have fallback UI for error states separate from loading states

## Files Updated

The following files were updated to use skeleton components:

1. **src/pages/Dashboard.tsx**
   - Added StatCardSkeleton for stats grid
   - Added DashboardMealsSkeleton for meals section
   - Added DashboardUpdatesSkeleton for updates section

2. **src/pages/DailyUpdates.tsx**
   - Added UpdateCardSkeleton for updates list

3. **src/pages/MealMenu.tsx**
   - Added MealCardSkeleton for meal display

4. **src/pages/Complaints.tsx**
   - Added ComplaintCardSkeleton for complaints list

5. **src/pages/Rent.tsx**
   - Added RentCardSkeleton for rent payments grid

6. **src/pages/Profile.tsx**
   - Added ProfileSectionSkeleton for main profile section
   - Added ProfileCardSkeleton for profile info cards

7. **src/components/layout/Sidebar.tsx**
   - Added SidebarSkeleton for sidebar loading state
   - Replaces loader with content-aware skeleton

## Future Enhancements

Potential improvements for skeleton components:

1. Add shimmer effect for more engaging loading animation
2. Create skeleton variants for different card sizes
3. Add skeleton for table components
4. Add skeleton for chart/graph components
5. Create page-specific composite skeletons for other pages

## Troubleshooting

### Skeleton not appearing
- Verify the loading state is properly set in Redux store
- Check that the skeleton component is imported correctly
- Ensure the conditional rendering is correct

### Skeleton layout doesn't match
- Compare skeleton structure with actual component
- Adjust className values to match spacing and sizing
- Consider responsive breakpoints

### Performance issues
- Reduce number of skeleton elements if too many
- Use CSS animations instead of JavaScript
- Consider lazy loading for large lists

## Support

For questions or issues with skeleton components, please refer to:
- Tailwind CSS documentation for styling
- React documentation for component patterns
- Project README for general setup

