# Complaint API Integration

## Overview
This document describes the integration of the complaint creation and fetching APIs into the Complaints page, with simplified form fields.

## API Endpoints

### 1. Get Complaints (Customer)
- **Endpoint**: `/api/complaint/customer`
- **Method**: GET
- **Authentication**: Token passed via cookie (`pgtoken`)

### Example Request
```bash
curl --location 'http://localhost:8020/api/complaint/customer' \
--header 'Cookie: pgtoken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
```

### Example Response
```json
{
    "message": "Successfully Getting Complaints by Customer.",
    "data": [
        {
            "_id": "68df8dd53459347d4f0c1351",
            "subject": "jay ho",
            "description": "jay shree Ram",
            "category": "Room Issue",
            "status": "Close",
            "added_by": null,
            "pgcode": "PGC246F7",
            "branch": "68d91fa33f891cf0dbc5be58",
            "createdAt": "2025-10-03T08:48:21.197Z",
            "updatedAt": "2025-10-03T09:21:31.406Z",
            "__v": 0,
            "close_by": "68cfca13b7c193107ec733e6",
            "close_by_type": "Admin"
        }
    ],
    "success": true
}
```

### 2. Create Complaint
- **Endpoint**: `/api/complaint`
- **Method**: POST
- **Authentication**: Token passed via cookie (`pgtoken`)
- **Content-Type**: application/json

### Request Body
```json
{
    "subject": "jay ho",
    "description": "jay shree Ram",
    "category": "Room Issue"
}
```

### Example Request
```bash
curl --location 'http://localhost:8020/api/complaint' \
--header 'Content-Type: application/json' \
--header 'Cookie: pgtoken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' \
--data '{
    "subject":"jay ho",
    "description":"jay shree Ram",
    "category":"Room Issue"
}'
```

## Changes Made

### 1. API Configuration (`src/config/api.ts`)
Updated and added complaint endpoints:
```typescript
// Complaints
complaints: '/api/complaint',           // POST - Create complaint
getComplaints: '/api/complaint/customer', // GET - Fetch complaints
```

### 2. Redux State Management (`src/store/slices/complaintSlice.ts`)

#### Added Imports
```typescript
import { authenticatedGet, authenticatedPost } from '../../utils/apiHelper';
import { API_ENDPOINTS } from '../../config/api';
```

#### Updated `submitComplaint` Thunk
**Before:**
```typescript
export const submitComplaint = createAsyncThunk(
  'complaint/submit',
  async (complaintData: Omit<Complaint, 'id' | 'status' | 'submittedAt'>) => {
    const response = await fetch('/api/complaints', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(complaintData),
    });
    return response.json();
  }
);
```

**After:**
```typescript
export const submitComplaint = createAsyncThunk(
  'complaint/submit',
  async (complaintData: { subject: string; description: string; category: string }, { rejectWithValue }) => {
    try {
      const response = await authenticatedPost(API_ENDPOINTS.complaints, complaintData);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to submit complaint');
      }
      
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to submit complaint');
    }
  }
);
```

#### Updated `fetchComplaints` Thunk
Now uses `authenticatedGet` with the customer-specific endpoint and proper error handling:
```typescript
export const fetchComplaints = createAsyncThunk(
  'complaint/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authenticatedGet(API_ENDPOINTS.getComplaints);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch complaints');
      }
      
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch complaints');
    }
  }
);
```

#### Updated Complaint Interface
Changed to match the actual API response structure:
```typescript
interface Complaint {
  _id: string;              // Changed from 'id'
  subject: string;
  description: string;
  category: string;
  status: string;           // "Open", "Close", "In Progress"
  added_by: string | null;
  pgcode: string;
  branch: string;
  createdAt: string;        // Changed from 'submittedAt'
  updatedAt: string;
  close_by?: string;
  close_by_type?: string;
  priority?: string;        // Optional
}
```

#### Enhanced Reducer
Added loading and error states, plus proper data extraction:
```typescript
extraReducers: (builder) => {
  builder
    // ... submitComplaint cases
    .addCase(fetchComplaints.fulfilled, (state, action) => {
      // API returns { success: true, data: [...], message: "..." }
      // ✅ Fixed: Extract complaints from response.data
      state.complaints = action.payload.data || [];
      state.isLoading = false;
    })
}
```

**Key Fix:** The API returns complaints in `response.data`, not directly. This fixes the "complaints.filter is not a function" error.

### 3. Complaints Component (`src/pages/Complaints.tsx`)

#### Fixed Field Mappings
Updated to use the correct field names from the API:
- `complaint.id` → `complaint._id`
- `complaint.submittedAt` → `complaint.createdAt`
- Removed `complaint.resolvedAt` (not in API response)
- Removed `complaint.priority` display (not in API response)

#### Updated Status Handling
The API returns status values like "Open", "Close", "In Progress" (with capital letters), so status checks now normalize the case:
```typescript
const getStatusIcon = (status: string) => {
  const normalizedStatus = status.toLowerCase();
  switch (normalizedStatus) {
    case 'close':
    case 'closed':
    case 'resolved':
      return CheckCircle;
    case 'in progress':
    case 'in-progress':
      return Clock;
    default:
      return AlertTriangle;
  }
};
```

#### Simplified Form Data
**Before:**
```typescript
const [formData, setFormData] = useState({
  subject: '',
  description: '',
  category: '',
  priority: 'medium',  // ❌ Removed
});
```

**After:**
```typescript
const [formData, setFormData] = useState({
  subject: '',
  description: '',
  category: '',
});
```

#### Removed Priority Field from Form
The priority field has been completely removed from the complaint form UI, as it's not required by the API.

#### Added Auto-Refresh After Submission
```typescript
try {
  await dispatch(submitComplaint(formData)).unwrap();
  dispatch(showNotification({
    message: commonConfig.messages.complaintSubmitted,
    type: 'success'
  }));
  
  // Refetch complaints to get the updated list
  dispatch(fetchComplaints());  // ✅ Added
  
  setShowForm(false);
  setFormData({ subject: '', description: '', category: '' });
} catch (error) {
  // Error handling
}
```

#### Enhanced Textarea with Placeholder
```typescript
<textarea
  id="description"
  required
  value={formData.description}
  onChange={(e) => setFormData({...formData, description: e.target.value})}
  rows={4}
  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
  placeholder="Describe your complaint in detail..."  // ✅ Added
/>
```

## Form Fields

The complaint form now has **only 3 required fields**:

### 1. Subject
- **Type**: Text input
- **Required**: Yes
- **Label**: Subject
- **Example**: "AC not working in Room 205"

### 2. Category
- **Type**: Dropdown select
- **Required**: Yes
- **Label**: Category
- **Options**: Loaded from `commonConfig.complaintCategories`
- **Examples**: "Room Issue", "Food Quality", "Maintenance", etc.

### 3. Description
- **Type**: Textarea
- **Required**: Yes
- **Label**: Description
- **Rows**: 4
- **Placeholder**: "Describe your complaint in detail..."
- **Example**: "The air conditioner has stopped working since yesterday..."

## Features

### ✅ Simplified Form
- Removed unnecessary "Priority" field
- Only 3 essential fields: Subject, Category, Description
- Cleaner, faster user experience

### ✅ Token Authentication
- Token automatically sent as cookie (`pgtoken`)
- Uses `authenticatedPost` helper function
- No manual token handling required

### ✅ Error Handling
- Comprehensive try-catch blocks
- User-friendly error notifications
- Proper error state management in Redux

### ✅ Loading States
- Shows loading indicator during submission
- Prevents duplicate submissions
- Better UX feedback

### ✅ Auto-Refresh
- Automatically fetches updated complaint list after submission
- Users see their new complaint immediately
- No manual page refresh needed

### ✅ Form Reset
- Form clears after successful submission
- Modal closes automatically
- Ready for next submission

## API Call Flow

```
User Submits Form
    ↓
Validate Required Fields (subject, description, category)
    ↓
dispatch(submitComplaint(formData))
    ↓
authenticatedPost('/api/complaint', { subject, description, category })
    ↓ (Cookie: pgtoken automatically included)
API Response: { success: true, message: "..." }
    ↓
Show Success Notification
    ↓
dispatch(fetchComplaints())
    ↓
Update Redux State with New Complaint List
    ↓
UI Re-renders with New Complaint
    ↓
Close Modal & Reset Form
```

## Benefits

### 1. **Cleaner API**
- Only sends necessary data
- Matches backend requirements exactly
- No unnecessary fields

### 2. **Better UX**
- Fewer fields to fill
- Faster complaint submission
- Clear, focused form

### 3. **Consistent Authentication**
- Uses same authentication pattern as other features
- Token handled automatically
- Secure cookie-based auth

### 4. **Type Safety**
- TypeScript types ensure correct data structure
- Compile-time error catching
- Better developer experience

### 5. **Error Resilience**
- Proper error handling at every level
- User-friendly error messages
- No silent failures

## Fixed Issues

### ✅ "complaints.filter is not a function" Error
**Cause:** The API returns complaints in `response.data` array, but the reducer was trying to set the entire response object as the complaints array.

**Solution:** Updated the reducer to extract the data properly:
```typescript
state.complaints = action.payload.data || [];  // Extract from .data property
```

### ✅ Field Name Mismatches
**Cause:** API uses `_id`, `createdAt`, etc., but component was using `id`, `submittedAt`.

**Solution:** Updated all references in the component to use the correct field names.

### ✅ Status Case Sensitivity
**Cause:** API returns "Open", "Close" (capital first letter), but checks were case-sensitive.

**Solution:** Added case normalization in status comparison functions.

## Testing Checklist

- [x] Complaints load on page mount
- [x] GET API `/api/complaint/customer` is called with token
- [x] Complaints list displays correctly
- [x] Status badges show correct colors (Open, Close, In Progress)
- [x] Form displays with 3 fields (subject, category, description)
- [x] Priority field is removed from form and display
- [x] Form validation works (required fields)
- [x] Submit button triggers API call
- [x] Token is sent via cookie
- [x] Success notification: "Complaint created successfully"
- [x] Complaints list refreshes after submission
- [x] Form resets and modal closes after submission
- [x] Error handling works for failed requests
- [x] Loading state shows during submission and fetching
- [x] No TypeScript/linter errors
- [x] No "filter is not a function" errors

## Example Usage

### Submitting a Complaint

1. User clicks "New Complaint" button
2. Modal opens with simplified form
3. User fills in:
   - **Subject**: "Broken window in Room 305"
   - **Category**: "Room Issue"
   - **Description**: "The window latch is broken and won't close properly, causing cold air to come in."
4. User clicks "Submit Complaint"
5. API call is made with token in cookie
6. Success message appears
7. Complaints list refreshes automatically
8. New complaint appears in the list
9. Form closes and resets

## Error Scenarios

### 1. Empty Required Fields
- **Trigger**: Submitting form without filling required fields
- **Response**: "Please fill in all required fields" error notification
- **Action**: Form stays open, user can correct

### 2. API Failure
- **Trigger**: Network error or server error
- **Response**: "Failed to submit complaint. Please try again." error notification
- **Action**: Form stays open with data intact, user can retry

### 3. Authentication Failure
- **Trigger**: Invalid or expired token
- **Response**: Authentication error from apiHelper
- **Action**: User redirected to login (handled by auth system)

## Migration Notes

- **Breaking Change**: Priority field removed from form
- **Backward Compatible**: Existing complaints with priority still display correctly
- **API Change**: Endpoint changed from `/api/complaints` to `/api/complaint`
- **No Data Loss**: All existing complaints remain intact

## Future Enhancements

Potential improvements:
1. Add file attachment support for complaints
2. Implement complaint editing functionality
3. Add real-time status updates via WebSocket
4. Allow users to add comments/follow-ups
5. Implement complaint filtering and search
6. Add complaint analytics and statistics


