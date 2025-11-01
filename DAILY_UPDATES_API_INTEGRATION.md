# Daily Updates API Integration

## Overview
This document describes the integration of the daily updates GET API into the Daily Updates page and Dashboard.

## API Endpoint

### Get Daily Updates (Customer)
- **Endpoint**: `/api/dailyupdate/customer`
- **Method**: GET
- **Authentication**: Token passed via cookie (`pgtoken`)

### Example Request
```bash
curl --location 'http://localhost:8020/api/dailyupdate/customer' \
--header 'Cookie: pgtoken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
```

### Example Response
```json
{
    "message": "Getting Daily-update by Customer Successfully.",
    "data": [
        {
            "_id": "68e93c518df21044ef368ea2",
            "title": "Kaii Naii",
            "content_type": "General",
            "pgcode": "PGC246F7",
            "branch": {
                "_id": "68d91fa33f891cf0dbc5be58",
                "branch_image": null,
                "branch_name": "thomas",
                "branch_address": "Thaltej, Gujarat",
                "pgcode": "PGC246F7",
                "added_by": "68cf0d8ca6935b34b9c246f7",
                "createdAt": "2025-09-28T11:44:35.351Z",
                "updatedAt": "2025-09-28T11:44:35.351Z",
                "__v": 0
            },
            "added_by": "68cf0d8ca6935b34b9c246f7",
            "added_by_type": "Admin",
            "createdAt": "2025-10-10T17:03:13.753Z",
            "updatedAt": "2025-10-10T17:03:13.753Z",
            "__v": 0
        }
    ],
    "success": true
}
```

## Changes Made

### 1. API Configuration (`src/config/api.ts`)
Updated endpoint:
```typescript
dailyUpdates: '/api/dailyupdate/customer'  // Changed from '/api/daily-updates'
```

### 2. Redux Slice (`src/store/slices/dailyUpdateSlice.ts`)

#### Updated Interface
**Before:**
```typescript
interface DailyUpdate {
  id: string;
  title: string;
  content: string;
  type: 'notice' | 'announcement' | 'maintenance';
  date: string;
  priority: 'low' | 'medium' | 'high';
  isRead: boolean;
}
```

**After:**
```typescript
interface DailyUpdate {
  _id: string;
  title: string;
  content_type: string; // "General", "Notice", etc.
  pgcode: string;
  branch: {
    _id: string;
    branch_image: string | null;
    branch_name: string;
    branch_address: string;
    pgcode: string;
  };
  added_by: string;
  added_by_type: string;
  createdAt: string;
  updatedAt: string;
}
```

#### Updated Thunk
```typescript
export const fetchDailyUpdates = createAsyncThunk(
  'dailyUpdate/fetchUpdates',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authenticatedGet(API_ENDPOINTS.dailyUpdates);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch daily updates');
      }
      
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch daily updates');
    }
  }
);
```

#### Updated Reducer
```typescript
.addCase(fetchDailyUpdates.fulfilled, (state, action) => {
  // API returns { success: true, data: [...], message: "..." }
  state.updates = action.payload.data || [];
  state.isLoading = false;
})
```

### 3. Daily Updates Component (`src/pages/DailyUpdates.tsx`)

#### Updated Field Mappings
- `update.id` → `update._id`
- `update.type` → `update.content_type`
- `update.date` → `update.createdAt`
- Removed `update.priority` (not in API)
- Removed `update.isRead` (not in API)
- Removed `update.content` (not in API - showing "No content available")

#### Updated Type Handling
Added case normalization and new "General" type:
```typescript
const getTypeIcon = (type: string) => {
  const normalizedType = type.toLowerCase();
  switch (normalizedType) {
    case 'notice':
      return Bell;
    case 'announcement':
      return Info;
    case 'maintenance':
      return Wrench;
    case 'general':        // ✅ Added
      return AlertCircle;
    default:
      return AlertCircle;
  }
};

const getTypeColor = (type: string) => {
  const normalizedType = type.toLowerCase();
  switch (normalizedType) {
    case 'general':        // ✅ Added
      return 'bg-purple-50 border-purple-200 text-purple-700';
    // ... other cases
  }
};
```

#### Enhanced Display
Now shows:
- Update title
- Content type (General, Notice, etc.)
- Branch name
- Created date and time
- Type-specific icon and color

### 4. Dashboard Component (`src/pages/Dashboard.tsx`)

#### Updated Field References
```typescript
{updates.slice(0, 5).map((update) => (
  <div key={update._id}>              // ✅ Changed from update.id
    <h3>{update.title}</h3>
    <span>{update.content_type}</span> // ✅ Changed from update.type
    <div>
      {format(new Date(update.createdAt), 'MMM dd, yyyy')} // ✅ Changed from update.date
    </div>
  </div>
))}
```

#### Simplified Stats
Changed from "Unread Updates" to "Daily Updates" and shows total count:
```typescript
{
  title: 'Daily Updates',
  value: updates.length,  // All updates, not just unread
  icon: Bell,
  // ...
}
```

## API Response Structure

### Fields Used

| API Field | Type | Display Location |
|-----------|------|------------------|
| `_id` | string | Key for React list |
| `title` | string | Update heading |
| `content_type` | string | Type badge |
| `branch.branch_name` | string | Branch info |
| `createdAt` | string | Date/time display |
| `updatedAt` | string | Not displayed |
| `pgcode` | string | Not displayed |
| `added_by` | string | Not displayed |
| `added_by_type` | string | Not displayed |

### Supported Content Types

The API can return various content types. The app handles:
- **General** - Purple icon (AlertCircle)
- **Notice** - Blue icon (Bell)
- **Announcement** - Green icon (Info)
- **Maintenance** - Orange icon (Wrench)

### Note: Missing Content Field

The current API response doesn't include a `content` or `description` field with the actual message body. The display shows "No content available" as a placeholder. If your API should include content, you may need to:
1. Update the backend to include a `content` or `description` field
2. Update the interface to include that field
3. Update the display to show the actual content

## Features

### ✅ Authenticated API Call
- Token sent via cookie automatically
- Uses `authenticatedGet` helper

### ✅ Proper Data Extraction
- Extracts updates from `response.data`
- Handles empty arrays gracefully

### ✅ Type-safe Interface
- TypeScript interface matches API structure
- Full type safety

### ✅ Case-insensitive Type Handling
- Handles "General", "general", "GENERAL" consistently
- Robust string comparison

### ✅ Loading States
- Shows spinner during fetch
- Proper error handling

### ✅ Responsive Design
- Desktop and mobile layouts
- Optimized for all screen sizes

## Testing Checklist

- [x] Daily updates load on page mount
- [x] GET API `/api/dailyupdate/customer` called with token
- [x] Updates list displays correctly
- [x] Type badges show correct colors
- [x] Icons display for each type
- [x] Branch name displayed
- [x] Created date formatted correctly
- [x] Dashboard shows recent updates (top 5)
- [x] Stats card shows update count
- [x] No "filter is not a function" errors
- [x] No linter errors
- [x] Empty state shows when no updates

## Dashboard Integration

The Dashboard now shows the 5 most recent updates with:
- Update title
- Content type badge
- Created date
- Blue icon (simplified)

Stats card changed:
- **Before**: "Unread Updates" (with isRead filter)
- **After**: "Daily Updates" (total count)

## Future Enhancements

1. **Add Content Field**: Request backend to include update content/description
2. **Read/Unread Status**: Implement mark as read functionality
3. **Filtering**: Add filters by content type
4. **Pagination**: Handle large numbers of updates
5. **Search**: Add search functionality
6. **Notifications**: Show new update notifications
7. **Categories**: Better categorization of updates

