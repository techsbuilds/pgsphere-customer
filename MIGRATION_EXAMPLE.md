# Migration Example: Adding Authentication to API Calls

This document shows how to update existing API calls in Redux slices to use the new authentication system.

## Before (Without Authentication)

```typescript
// src/store/slices/dailyUpdateSlice.ts - OLD VERSION

export const fetchDailyUpdates = createAsyncThunk(
  'dailyUpdate/fetchUpdates',
  async () => {
    const response = await fetch('/api/daily-updates');
    return response.json();
  }
);

export const markAsRead = createAsyncThunk(
  'dailyUpdate/markAsRead',
  async (updateId: string) => {
    const response = await fetch(`/api/daily-updates/${updateId}/read`, {
      method: 'PATCH',
    });
    return response.json();
  }
);
```

## After (With Authentication)

```typescript
// src/store/slices/dailyUpdateSlice.ts - NEW VERSION

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authenticatedGet, authenticatedFetch } from '../../utils/apiHelper';
import { API_ENDPOINTS } from '../../config/api';

export const fetchDailyUpdates = createAsyncThunk(
  'dailyUpdate/fetchUpdates',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authenticatedGet(API_ENDPOINTS.dailyUpdates);
      return response.data; // Return the data from the response
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch daily updates');
    }
  }
);

export const markAsRead = createAsyncThunk(
  'dailyUpdate/markAsRead',
  async (updateId: string, { rejectWithValue }) => {
    try {
      const response = await authenticatedFetch(
        `${API_ENDPOINTS.markUpdateRead}/${updateId}/read`,
        { method: 'PATCH' }
      );
      const data = await response.json();
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to mark as read');
    }
  }
);
```

## Complete Example: Updating complaintSlice.ts

### Before

```typescript
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchComplaints = createAsyncThunk(
  'complaint/fetchComplaints',
  async () => {
    const response = await fetch('/api/complaints');
    return response.json();
  }
);

export const submitComplaint = createAsyncThunk(
  'complaint/submit',
  async (complaintData: any) => {
    const response = await fetch('/api/complaints', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(complaintData),
    });
    return response.json();
  }
);
```

### After

```typescript
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authenticatedGet, authenticatedPost } from '../../utils/apiHelper';
import { API_ENDPOINTS } from '../../config/api';

export const fetchComplaints = createAsyncThunk(
  'complaint/fetchComplaints',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authenticatedGet(API_ENDPOINTS.complaints);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch complaints');
    }
  }
);

export const submitComplaint = createAsyncThunk(
  'complaint/submit',
  async (complaintData: any, { rejectWithValue }) => {
    try {
      const response = await authenticatedPost(
        API_ENDPOINTS.complaints,
        complaintData
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to submit complaint');
    }
  }
);
```

## Step-by-Step Migration Guide

### Step 1: Import the API helpers

```typescript
import { 
  authenticatedGet, 
  authenticatedPost, 
  authenticatedPut, 
  authenticatedDelete,
  authenticatedFetch 
} from '../../utils/apiHelper';
import { API_ENDPOINTS } from '../../config/api';
```

### Step 2: Update the async thunk

Replace the `fetch` call with the appropriate authenticated helper:

| HTTP Method | Old Code | New Helper |
|------------|----------|------------|
| GET | `fetch(url)` | `authenticatedGet(url)` |
| POST | `fetch(url, { method: 'POST', body })` | `authenticatedPost(url, data)` |
| PUT | `fetch(url, { method: 'PUT', body })` | `authenticatedPut(url, data)` |
| DELETE | `fetch(url, { method: 'DELETE' })` | `authenticatedDelete(url)` |
| Custom | `fetch(url, options)` | `authenticatedFetch(url, options)` |

### Step 3: Add error handling

Wrap the API call in try-catch and use `rejectWithValue`:

```typescript
async (params, { rejectWithValue }) => {
  try {
    const response = await authenticatedGet('/api/endpoint');
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.message || 'Request failed');
  }
}
```

### Step 4: Update the slice to handle errors

```typescript
extraReducers: (builder) => {
  builder
    .addCase(fetchData.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    })
    .addCase(fetchData.fulfilled, (state, action) => {
      state.isLoading = false;
      state.data = action.payload;
    })
    .addCase(fetchData.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string || 'Request failed';
    });
}
```

## Example: File Upload with Authentication

### Before

```typescript
export const uploadDocument = createAsyncThunk(
  'documents/upload',
  async (file: File) => {
    const formData = new FormData();
    formData.append('document', file);
    
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });
    return response.json();
  }
);
```

### After

```typescript
import { authenticatedFormData } from '../../utils/apiHelper';

export const uploadDocument = createAsyncThunk(
  'documents/upload',
  async (file: File, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('document', file);
      
      const response = await authenticatedFormData('/api/upload', formData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Upload failed');
    }
  }
);
```

## Common Patterns

### Pattern 1: Fetch list with filters

```typescript
export const fetchFilteredData = createAsyncThunk(
  'data/fetchFiltered',
  async (filters: { status: string; date: string }, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const response = await authenticatedGet(
        `${API_ENDPOINTS.data}?${queryParams}`
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);
```

### Pattern 2: Update item by ID

```typescript
export const updateItem = createAsyncThunk(
  'items/update',
  async ({ id, data }: { id: string; data: any }, { rejectWithValue }) => {
    try {
      const response = await authenticatedPut(
        `${API_ENDPOINTS.items}/${id}`,
        data
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);
```

### Pattern 3: Delete item

```typescript
export const deleteItem = createAsyncThunk(
  'items/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await authenticatedDelete(`${API_ENDPOINTS.items}/${id}`);
      return id; // Return the ID to remove from state
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);
```

## Benefits of This Approach

✅ **Automatic Token Management**: No need to manually get token from localStorage  
✅ **Consistent Error Handling**: All API calls handle errors the same way  
✅ **Type Safety**: TypeScript support for all helpers  
✅ **Easier Testing**: Mock the helpers instead of fetch  
✅ **Centralized Configuration**: Change auth header format in one place  
✅ **Better Developer Experience**: Less boilerplate code  

## Checklist for Migration

- [ ] Import `authenticatedGet`, `authenticatedPost`, etc. from `utils/apiHelper`
- [ ] Import `API_ENDPOINTS` from `config/api`
- [ ] Replace `fetch` calls with appropriate helper functions
- [ ] Add `rejectWithValue` to async thunk parameters
- [ ] Wrap API calls in try-catch blocks
- [ ] Return `response.data` instead of `response.json()`
- [ ] Update `.rejected` case in extraReducers to handle errors
- [ ] Test the API calls to ensure authentication works
- [ ] Remove any manual Authorization header logic

## Testing Your Changes

After migration, test each API call:

1. **Without Token**: Logout and try to access protected route - should redirect to login
2. **With Valid Token**: Login and verify API calls succeed
3. **With Expired Token**: Simulate expired token - should show proper error
4. **Network Error**: Disconnect network - should handle gracefully

## Next Steps

1. Update all slices one at a time
2. Test each slice after updating
3. Remove any duplicate token management code
4. Update API documentation with new patterns
5. Train team on new authentication system

---

For more information, see [AUTHENTICATION_GUIDE.md](./AUTHENTICATION_GUIDE.md)
