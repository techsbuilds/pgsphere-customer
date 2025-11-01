# Authentication Guide

## Overview

This application implements a professional token-based authentication system with automatic token management and persistence.

## Authentication Flow

### 1. Login Process

When a user logs in successfully, the API returns:

```json
{
  "message": "Login Successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "userId": "68e1755524f31c723ff831ac",
    "userType": "Customer",
    "pgcode": "PG92D305"
  },
  "success": true
}
```

### 2. Automatic Token Management

The authentication system automatically:
- ✅ Extracts and stores the token from login response
- ✅ Persists token and user data in localStorage
- ✅ Restores session on page reload
- ✅ Redirects authenticated users to dashboard
- ✅ Protects routes requiring authentication
- ✅ Clears all data on logout

### 3. Token Storage

The following data is stored in localStorage:
- `token`: JWT authentication token
- `userId`: User's unique identifier
- `userType`: Type of user (Customer, Admin, etc.)
- `pgcode`: PG branch code

## Using Authentication in Components

### Get Current User & Token

```tsx
import { useAuth } from '../hooks/useAuth';

const MyComponent = () => {
  const { user, token, isAuthenticated, isApproved, logout } = useAuth();
  
  if (!isAuthenticated) {
    return <div>Please login</div>;
  }
  
  return (
    <div>
      <p>User ID: {user?.userId}</p>
      <p>PG Code: {user?.pgcode}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
};
```

### Making Authenticated API Calls

Use the `apiHelper` utilities to automatically include the authentication token:

#### GET Request

```tsx
import { authenticatedGet } from '../utils/apiHelper';
import { API_ENDPOINTS } from '../config/api';

const fetchDailyUpdates = async () => {
  try {
    const response = await authenticatedGet(API_ENDPOINTS.dailyUpdates);
    console.log(response.data);
  } catch (error) {
    console.error('Failed to fetch:', error);
  }
};
```

#### POST Request

```tsx
import { authenticatedPost } from '../utils/apiHelper';
import { API_ENDPOINTS } from '../config/api';

const submitComplaint = async (complaintData) => {
  try {
    const response = await authenticatedPost(
      API_ENDPOINTS.complaints,
      complaintData
    );
    console.log('Complaint submitted:', response);
  } catch (error) {
    console.error('Failed to submit:', error);
  }
};
```

#### PUT Request

```tsx
import { authenticatedPut } from '../utils/apiHelper';

const updateProfile = async (profileData) => {
  try {
    const response = await authenticatedPut(
      '/api/auth/profile',
      profileData
    );
    return response;
  } catch (error) {
    console.error('Update failed:', error);
  }
};
```

#### DELETE Request

```tsx
import { authenticatedDelete } from '../utils/apiHelper';

const deleteComplaint = async (complaintId) => {
  try {
    await authenticatedDelete(`/api/complaints/${complaintId}`);
  } catch (error) {
    console.error('Delete failed:', error);
  }
};
```

#### File Upload with FormData

```tsx
import { authenticatedFormData } from '../utils/apiHelper';

const uploadDocument = async (file: File) => {
  const formData = new FormData();
  formData.append('document', file);
  formData.append('userId', user.userId);
  
  try {
    const response = await authenticatedFormData(
      '/api/upload/document',
      formData
    );
    return response;
  } catch (error) {
    console.error('Upload failed:', error);
  }
};
```

#### Custom Authenticated Request

```tsx
import { authenticatedFetch } from '../utils/apiHelper';

const customRequest = async () => {
  try {
    const response = await authenticatedFetch('/api/custom-endpoint', {
      method: 'PATCH',
      body: JSON.stringify({ data: 'custom' }),
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Request failed:', error);
  }
};
```

## API Helper Functions

All functions automatically include the `Authorization: Bearer <token>` header:

| Function | Description |
|----------|-------------|
| `getAuthToken()` | Get the current auth token from localStorage |
| `getUserData()` | Get user data (token, userId, userType, pgcode) |
| `isAuthenticated()` | Check if user has valid token |
| `authenticatedFetch()` | Make custom authenticated request |
| `authenticatedGet()` | Make GET request |
| `authenticatedPost()` | Make POST request |
| `authenticatedPut()` | Make PUT request |
| `authenticatedDelete()` | Make DELETE request |
| `authenticatedFormData()` | Upload files with FormData |

## Error Handling

All API helper functions throw errors that can be caught:

```tsx
try {
  const data = await authenticatedGet('/api/endpoint');
  // Success
} catch (error) {
  if (error.message.includes('No authentication token')) {
    // User not logged in - redirect to login
    navigate('/login');
  } else {
    // Other error - show notification
    dispatch(showNotification({ 
      message: error.message, 
      type: 'error' 
    }));
  }
}
```

## Protected Routes

Routes are automatically protected using the `ProtectedRoute` component:

```tsx
<Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <Layout>
        <Dashboard />
      </Layout>
    </ProtectedRoute>
  }
/>
```

## Logout

To logout a user:

```tsx
import { useAuth } from '../hooks/useAuth';

const LogoutButton = () => {
  const { logout } = useAuth();
  
  return (
    <button onClick={logout}>
      Logout
    </button>
  );
};
```

This will:
1. Clear Redux state
2. Remove all auth data from localStorage
3. Redirect to login page (handled by ProtectedRoute)

## Redux Store Access

Direct access to auth state if needed:

```tsx
import { useSelector } from 'react-redux';
import { RootState } from '../store';

const MyComponent = () => {
  const { user, token, isLoading } = useSelector((state: RootState) => state.auth);
  
  // Use auth state
};
```

## Session Persistence

The authentication session is automatically restored on:
- Page refresh
- Browser restart (if localStorage persists)
- Opening app in new tab

The session restoration happens in `App.tsx` on component mount.

## Security Best Practices

✅ **Implemented:**
- Token stored in localStorage (consider httpOnly cookies for production)
- All authenticated requests include Authorization header
- Token automatically cleared on logout
- Protected routes redirect to login if not authenticated
- Session restored from localStorage on app load

🔒 **Recommended for Production:**
- Set token expiration and auto-refresh mechanism
- Implement token validation on protected routes
- Use httpOnly cookies instead of localStorage for XSS protection
- Add CSRF protection for state-changing operations
- Implement rate limiting on authentication endpoints

## Example: Complete Component with Authentication

```tsx
import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { authenticatedGet, authenticatedPost } from '../utils/apiHelper';
import { API_ENDPOINTS } from '../config/api';

const ComplaintsPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      fetchComplaints();
    }
  }, [isAuthenticated]);

  const fetchComplaints = async () => {
    try {
      setIsLoading(true);
      const response = await authenticatedGet(API_ENDPOINTS.complaints);
      setComplaints(response.data);
    } catch (error) {
      console.error('Failed to fetch complaints:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const submitComplaint = async (complaintText: string) => {
    try {
      const response = await authenticatedPost(API_ENDPOINTS.complaints, {
        userId: user?.userId,
        pgcode: user?.pgcode,
        complaint: complaintText,
      });
      
      // Refresh the list
      fetchComplaints();
      return response;
    } catch (error) {
      console.error('Failed to submit complaint:', error);
      throw error;
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Complaints for PG: {user?.pgcode}</h1>
      {/* Render complaints */}
    </div>
  );
};

export default ComplaintsPage;
```

## Troubleshooting

### Token not being sent with requests
- Ensure you're using the `authenticatedFetch` or related helper functions
- Check that token exists in localStorage
- Verify the token hasn't expired

### User not redirected after login
- Check if token is being stored correctly in Redux state
- Verify ProtectedRoute is wrapping the protected pages
- Check App.tsx routing logic

### Session not persisting after refresh
- Ensure `restoreSession` is being called in App.tsx
- Check browser localStorage to confirm token is saved
- Verify no errors in console during session restoration

---

For more information about the API endpoints, see [API_DOCUMENTATION.md](./API_DOCUMENTATION.md).
