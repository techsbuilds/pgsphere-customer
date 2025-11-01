# Quick Start Guide - Token-Based Registration API Integration

## ✅ What's Been Implemented

**🔒 SECURITY UPDATE: Test user removed. Valid token required for registration.**

Your registration page now:
1. ✅ Extracts token from URL (`localhost:5154?token=...`)
2. ✅ Automatically calls `/get-branch-details` API in the background
3. ✅ Shows branch information at the top of the form
4. ✅ Displays a dropdown with available rooms from the API
5. ✅ Sends registration data with all required fields:
   - `customer_name`
   - `email`
   - `password`
   - `mobile_no`
   - `room` (Room ID from selected dropdown)
   - `branch` (Branch ID from API response)
   - `pgcode` (from API response)
   - `joining_date` (automatically set to today)
   - `added_by` (Admin ID from API response)
   - `added_by_type` (from API response)
   - `aadharcard` (file upload)

## 🚀 Setup Instructions

### 1. Create Environment File
Create a `.env` file in the project root:

```env
VITE_API_BASE_URL=http://localhost:8020
```

### 2. Install Dependencies (if needed)
```bash
npm install
```

### 3. Start Development Server
```bash
npm run dev
```

### 4. Test the Registration Flow
Open your browser and navigate to either:

**Option 1: Direct registration page**
```
http://localhost:5174/register?token=YOUR_TOKEN_HERE
```

**Option 2: Root path (automatically redirects to registration)**
```
http://localhost:5174?token=YOUR_TOKEN_HERE
```

Both URLs work! The root path will automatically detect the token and redirect to `/register?token=...`

## 📝 What Happens When User Visits Registration URL

### Without Token (localhost:5174/register)
❌ **Error Page Displayed** - User sees an error message explaining they need a valid registration link

### With Invalid Token (localhost:5174/register?token=invalid)
❌ **Error Page Displayed** - API validation fails, error message shown

### With Valid Token (localhost:5174/register?token=eyJhbG...)
✅ **Registration Flow Starts**:

1. **Token Extraction**: Token is read from URL parameter
2. **Single API Call** 🔐: 
   - API: `GET /api/auth/verify/customer/signup/{token}`
   - Returns: Token verification + Branch details + Rooms (all in one call!)
   - If `success: false` → Error page shown ❌
   - If `success: true` → Registration form shown with all data ✅
3. **Loading Screen**: Shows while fetching data from API
4. **Branch Display**: Branch name, address, and logo appear at top
5. **Room Dropdown**: Populated with available rooms showing:
   - Room ID
   - Room Type
   - Service Type (AC/Non-AC)
   - Occupancy (filled/capacity)
6. **Form Submission**: All data sent to `POST /api/auth/register` with multipart/form-data
7. **Registration Success**: 
   - Success message displayed
   - After 2 seconds → Redirected to Login page
   - Email pre-filled on login form
   - User can login with their new account

## 🔧 Files Modified

1. **`src/config/api.ts`** - New API configuration file
2. **`src/store/slices/authSlice.ts`** - Added branch details fetching and updated registration
3. **`src/components/auth/RegistrationForm.tsx`** - Updated form with room dropdown
4. **`API_DOCUMENTATION.md`** - Updated with new endpoints

## 🎯 Form Fields

### User Fills:
- Full Name ✏️
- Email ✏️
- Phone ✏️
- Room Selection (dropdown) ✏️
- Aadhaar Card (file) ✏️
- Password ✏️
- Confirm Password ✏️

### Auto-filled (Background):
- `branch` (from API) 🤖
- `pgcode` (from API) 🤖
- `joining_date` (today's date) 🤖
- `added_by` (from API) 🤖
- `added_by_type` (from API) 🤖

## 🔍 Testing Checklist

### Security Tests
- [ ] Registration page WITHOUT token shows error message
- [ ] Registration page with INVALID token shows error message
- [ ] Registration page with VALID token loads successfully

### Functionality Tests
- [ ] Token is extracted from URL
- [ ] Loading screen appears while fetching branch details
- [ ] Branch details API is called automatically
- [ ] Branch info displays at top of form
- [ ] Room dropdown shows available rooms
- [ ] Can select a room
- [ ] Can upload Aadhaar card
- [ ] Form validates (password match, required fields)
- [ ] Loading spinner shows during submission
- [ ] Registration data is sent with correct format
- [ ] Success/error notification appears

## 🐛 Troubleshooting

### No rooms showing in dropdown?
- Check if API is running on `http://localhost:8020`
- Verify token is valid and not expired
- Check browser console for API errors
- Ensure `/get-branch-details` endpoint returns rooms array

### API not connecting?
- Verify `.env` file exists with correct `VITE_API_BASE_URL`
- Restart dev server after creating/modifying `.env`
- Check CORS settings on backend API

### Form submission fails?
- Verify backend `/api/auth/register` endpoint accepts multipart/form-data
- Check all required fields are being sent
- Verify token is still valid

## 📞 API Endpoints

### 1. Verify Token & Get All Details (Single API Call)
```
GET http://localhost:8020/api/auth/verify/customer/signup/{token}

Response:
{
  "message": "All details retrived successfully.",
  "success": true,
  "data": {
    "branch": { ... },
    "pgDetails": { ... },
    "rooms": [ ... ]
  }
}
```
**Note:** This single API call verifies the token AND returns all branch/room data!

### 2. Customer Login
```
POST http://localhost:8020/api/auth/customer/sign-in
Content-Type: application/json

Body:
{
  "email": "ankit@gmail.com",
  "password": "secure",
  "userType": "Customer"
}
```

### 3. Register Customer
```
POST http://localhost:8020/api/auth/register
Content-Type: multipart/form-data

Body:
- customer_name
- email
- password
- mobile_no
- room (ID)
- branch (ID)
- pgcode
- joining_date (YYYY-MM-DD)
- added_by (ID)
- added_by_type
- aadharcard (file)
```

## 🎉 You're All Set!

The registration flow is now fully integrated with your backend API. Users can register by clicking the token link, selecting their room, and submitting the form!

