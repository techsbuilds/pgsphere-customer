# API Integration Implementation Summary

## Overview
This document summarizes the API integration implemented for the PG Customer Portal registration flow with token-based authentication.

**⚠️ IMPORTANT: Test user has been REMOVED. The application now requires a valid token to access the registration page.**

## What Was Implemented

### 1. API Configuration (`src/config/api.ts`)
- Created centralized API configuration file
- Configurable base URL via environment variable `VITE_API_BASE_URL`
- Default base URL: `http://localhost:8020`
- Organized API endpoints for easy maintenance

### 2. Updated Authentication Slice (`src/store/slices/authSlice.ts`)
Added new functionality:
- **New Interface**: `BranchDetails` to store branch, PG, and room information
- **New Interface**: `Room` to store room details
- **New State Variables**:
  - `branchDetails`: Stores complete branch information from API
  - `availableRooms`: Array of available rooms for selection

#### New Async Thunk: `fetchBranchDetails`
- **Endpoint**: `POST /get-branch-details`
- **Headers**: Includes `Authorization: Bearer <token>`
- Fetches branch details, PG details, and available rooms
- Updates state with branch information and available rooms

#### Updated `registerCustomer` Async Thunk
New request body format:
```javascript
{
  customer_name: string,
  email: string,
  password: string,
  mobile_no: string,
  room: string,          // Room ID
  branch: string,        // Branch ID
  pgcode: string,
  joining_date: string,  // Auto-filled with today's date (YYYY-MM-DD)
  added_by: string,      // Admin ID from branch details
  added_by_type: string, // e.g., "Admin"
  aadharcard: File
}
```

### 3. Smart URL Routing (`src/App.tsx`)

#### Token-Based Redirect:
- Added `RootRedirect` component for intelligent routing
- **Root path with token**: `localhost:5174?token=...` → Redirects to `/register?token=...`
- **Root path without token**: Redirects to login or dashboard (based on auth status)
- Makes registration links simpler for admins to share

### 4. Updated Registration Form (`src/components/auth/RegistrationForm.tsx`)

#### Security Features:
1. **Token Validation**: Registration page ONLY accessible with valid token in URL
2. **No Token = No Access**: Shows error page if token is missing or invalid
3. **Loading State**: Shows loading screen while validating token and fetching data
4. **Error Handling**: Displays user-friendly error messages for invalid tokens

#### Changes Made:
1. **Removed Fields**:
   - Address
   - Emergency Contact
   - Emergency Phone
   - Floor Number (manual input)
   - Room Number (manual input)
   - Room Type (manual select)

2. **Added Fields**:
   - Room Selection dropdown (populated from API)

3. **Simplified Form Fields**:
   - Full Name
   - Email
   - Phone
   - Room Selection (dropdown with available rooms)
   - Aadhaar Card Upload
   - Password
   - Confirm Password

4. **Room Dropdown Features**:
   - Displays: Room ID, Room Type, Service Type, and Occupancy
   - Example: "Room 01 - Hall (AC) - 1/4 occupied"
   - Disabled state when no rooms are available
   - Shows loading state while fetching rooms

5. **Auto-filled Fields** (sent in background):
   - `joining_date`: Automatically set to today's date
   - `branch`: Branch ID from API response
   - `pgcode`: PG code from API response
   - `added_by`: Admin ID from API response
   - `added_by_type`: Admin type from API response

6. **Loading States**:
   - Button disabled during submission
   - Spinner animation during processing
   - "Processing..." text shown during submission

### 4. Updated API Documentation (`API_DOCUMENTATION.md`)
- Added new endpoint documentation for `/get-branch-details`
- Updated registration endpoint with new request body format
- Included example responses with actual API structure

## Flow Diagram

```
User clicks registration link with token
           ↓
Two possible URLs:
1. localhost:5174/register?token=eyJhbGc...
2. localhost:5174?token=eyJhbGc... (auto-redirects to option 1)
           ↓
RegistrationForm component loads
           ↓
useEffect detects token in URL
           ↓
Single API Call - Token Verification + Data Fetch
Dispatches verifySignupToken(token)
           ↓
API Call: GET /api/auth/verify/customer/signup/{token}
           ↓
API Response:
  - If success: false → Show Error Page ❌
  - If success: true → Returns ALL data ✅
           ↓
Response contains:
  - Branch details
  - PG details
  - Available rooms
           ↓
State updated:
  - tokenVerified: true
  - branchInfo (shown at top)
  - availableRooms (populates dropdown)
  - branchDetails (stored for registration)
           ↓
User fills form:
  - Name, Email, Phone
  - Selects Room from dropdown
  - Uploads Aadhaar card
  - Sets password
           ↓
User clicks Register
           ↓
Form validates:
  - Password match
  - Room selected
  - Aadhaar uploaded
           ↓
Dispatches registerCustomer with:
  - User inputs
  - Selected room ID
  - Auto-filled: branch ID, pgcode, joining_date,
    added_by, added_by_type
           ↓
API Call: POST /api/auth/register
Content-Type: multipart/form-data
           ↓
API Response: {
  "message": "New customer account created successfully.",
  "success": true
}
           ↓
Success notification shown
           ↓
Wait 2 seconds
           ↓
Redirect to Login Page
  - Email pre-filled
  - Success message displayed
  - User can now login
```

## Environment Setup

### Required Environment Variable
Create a `.env` file in the project root:
```env
VITE_API_BASE_URL=http://localhost:8020
```

### For Production
Update the environment variable to point to your production API:
```env
VITE_API_BASE_URL=https://api.yourpgportal.com
```

## Testing the Integration

### 1. Start the Development Server
```bash
npm run dev
```

### 2. Test with Token URL
Navigate to:
```
http://localhost:5174/register?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3. Expected Behavior
1. Branch information displays at the top with logo/name
2. Room dropdown populates with available rooms
3. Form fields are ready for input
4. On submission:
   - Loading spinner shows
   - API call is made with correct format
   - Success/error notification displays

## API Endpoints Used

### 1. Get Branch Details
- **URL**: `POST /get-branch-details`
- **Headers**: `Authorization: Bearer <token>`
- **Purpose**: Fetch branch, PG, and room information

### 2. Register Customer
- **URL**: `POST /api/auth/register`
- **Content-Type**: `multipart/form-data`
- **Purpose**: Register new customer with room assignment

## Key Features

✅ Token-based registration flow  
✅ Automatic branch details fetching  
✅ Dynamic room selection dropdown  
✅ Auto-filled joining date (today)  
✅ Proper file upload for Aadhaar card  
✅ Loading states and disabled buttons  
✅ Error handling and notifications  
✅ Responsive UI design  
✅ Type-safe implementation with TypeScript  

## Notes

- The token is extracted from the URL query parameter `?token=...`
- All required IDs (branch, room, added_by) are sent to the backend
- Joining date is automatically set to today's date
- User is not required to select joining date
- Room dropdown shows occupancy information for better UX
- Form is disabled during submission to prevent duplicate requests

## Future Enhancements

Potential improvements:
- Add room availability real-time updates
- Show room images in dropdown
- Add room details preview modal
- Implement retry logic for failed API calls
- Add offline support with service workers

