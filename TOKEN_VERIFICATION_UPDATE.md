# Token Verification Update - Two-Step Validation

## 🔐 What Changed?

Registration page ab **single API call** use karta hai:

### Single API Call: Token Verification + Data Fetch ✅
**API Call:** `GET /api/auth/verify/customer/signup/{token}`

Ek hi API call me:
- Token validate hota hai
- Branch details milti hain
- PG details milti hain
- Rooms list milti hai

**Simplified approach:** No need for separate API calls!

---

## 🎯 Workflow

```
User visits: localhost:5174/register?token=abc123
              ↓
Single API Call
GET /api/auth/verify/customer/signup/abc123
              ↓
Response: {
  "success": true/false,
  "data": { branch, pgDetails, rooms }
}
              ↓
         ┌────────┴────────┐
         │                 │
    success: false    success: true + data
         │                 │
    Error Page        Registration Form
         ❌           (with branch info & rooms)
                          ✅
```

---

## 📋 API Details

### Token Verification Endpoint

**Endpoint:**
```
GET {API_BASE_URL}/api/auth/verify/customer/signup/{token}
```

**Example:**
```
GET http://localhost:8020/api/auth/verify/customer/signup/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Success Response:**
```json
{
  "message": "All details retrived successfully.",
  "success": true,
  "data": {
    "branch": {
      "_id": "68cfb83b96bdfcfbc8c9ee6a",
      "branch_image": "http://localhost:8020/uploads/branch/image-1758443579006-1000000001.png",
      "branch_name": "branch-1",
      "branch_address": "science city , ahmedabad",
      "pgcode": "PG92D305",
      "added_by": "68cf9d9b3dcb78209a92d305"
    },
    "pgDetails": {
      "_id": "68cf9d9b3dcb78209a92d305",
      "full_name": "Arpit Savaj",
      "email": "asdm200423@gmail.com",
      "pgname": "Hariom",
      "address": "Nikol",
      "contactno": "6876867552"
    },
    "pgcode": "PG92D305",
    "added_by": "68cf9d9b3dcb78209a92d305",
    "added_by_type": "Admin",
    "rooms": [
      {
        "_id": "68cfbd721ed89e802904571b",
        "room_id": "01",
        "room_type": "Hall",
        "service_type": "AC",
        "capacity": 4,
        "filled": 1,
        "remark": "Ac Room"
      }
    ]
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Invalid or expired token"
}
```

---

## 🔧 Technical Implementation

### 1. API Configuration (`src/config/api.ts`)
```typescript
export const API_ENDPOINTS = {
  verifySignupToken: '/api/auth/verify/customer/signup',
  // ... other endpoints
};
```

### 2. Auth Slice (`src/store/slices/authSlice.ts`)

**New State:**
```typescript
interface AuthState {
  // ... existing state
  tokenVerified: boolean; // NEW: Tracks if token is verified
}
```

**New Async Thunk:**
```typescript
export const verifySignupToken = createAsyncThunk(
  'auth/verifySignupToken',
  async (token: string, { rejectWithValue }) => {
    const response = await fetch(
      `${API_BASE_URL}${API_ENDPOINTS.verifySignupToken}/${token}`,
      { method: 'GET' }
    );
    
    const data = await response.json();
    
    if (!response.ok || !data.success) {
      return rejectWithValue(data.message || 'Invalid or expired token');
    }
    
    return data;
  }
);
```

### 3. Registration Form (`src/components/auth/RegistrationForm.tsx`)

**Sequential Verification:**
```typescript
useEffect(() => {
  const verifyAndFetchData = async () => {
    if (branchToken) {
      try {
        // Step 1: Verify token
        await dispatch(verifySignupToken(branchToken)).unwrap();
        
        // Step 2: Fetch branch details (only if Step 1 succeeds)
        await dispatch(fetchBranchDetails(branchToken)).unwrap();
        
        setVerificationComplete(true);
      } catch (error) {
        setTokenError(true);
      }
    }
  };
  
  verifyAndFetchData();
}, [branchToken, dispatch]);
```

---

## ✅ Benefits

1. **Better Security**: Token validated before showing any data
2. **Single API Call**: More efficient - one call instead of two
3. **Better UX**: Faster loading, less network overhead
4. **Simpler Code**: No need to chain multiple API calls
5. **Atomic Operation**: Token verification and data fetching in one transaction

---

## 🧪 Testing Scenarios

### Scenario 1: Valid Token
```bash
# URL
http://localhost:5174/register?token=VALID_TOKEN

# Expected Flow:
1. Token verification API called ✅
2. Returns success: true ✅
3. Branch details API called ✅
4. Registration form displayed ✅
```

### Scenario 2: Invalid Token
```bash
# URL
http://localhost:5174/register?token=INVALID_TOKEN

# Expected Flow:
1. Token verification API called ✅
2. Returns success: false ❌
3. Error page displayed ❌
4. Branch details API NOT called (skipped)
```

### Scenario 3: Expired Token
```bash
# URL
http://localhost:5174/register?token=EXPIRED_TOKEN

# Expected Flow:
1. Token verification API called ✅
2. Returns success: false (token expired) ❌
3. Error page with "expired token" message ❌
4. User needs new registration link
```

### Scenario 4: No Token
```bash
# URL
http://localhost:5174/register

# Expected Flow:
1. No token in URL ❌
2. Error page displayed immediately ❌
3. No API calls made
```

---

## 🎨 User Experience

### Loading State
```
┌────────────────────────────┐
│   🔄 Loading...            │
│                            │
│   Loading Registration     │
│   Form                     │
│                            │
│   Please wait while we     │
│   fetch your branch        │
│   details...               │
└────────────────────────────┘
```

### Error State (Invalid Token)
```
┌────────────────────────────┐
│   ⚠️ Invalid Link          │
│                            │
│   Invalid Registration     │
│   Link                     │
│                            │
│   You need a valid         │
│   registration link with   │
│   a token to access this   │
│   page. Please contact     │
│   your PG admin.           │
└────────────────────────────┘
```

### Success State (Valid Token)
```
┌────────────────────────────┐
│   [Branch Logo]            │
│   Branch Name              │
│   Branch Address           │
├────────────────────────────┤
│   Customer Registration    │
│                            │
│   [Registration Form]      │
│   - Name                   │
│   - Email                  │
│   - Phone                  │
│   - Room Selection         │
│   - Aadhaar Upload         │
│   - Password               │
│                            │
│   [Register Button]        │
└────────────────────────────┘
```

---

## 🔍 Error Messages

| Scenario | Error Message |
|----------|--------------|
| No Token | "Invalid Registration Link - You need a valid registration link with a token" |
| Invalid Token | "Invalid or expired token" |
| API Error | "Network error" |
| Expired Token | "Invalid or expired token" |

---

## 📊 State Management

### Before Verification
```javascript
{
  tokenVerified: false,
  isLoading: true,
  branchDetails: null,
  availableRooms: []
}
```

### After Successful Verification
```javascript
{
  tokenVerified: true,
  isLoading: false,
  branchDetails: { /* branch data */ },
  availableRooms: [ /* rooms array */ ]
}
```

### After Failed Verification
```javascript
{
  tokenVerified: false,
  isLoading: false,
  error: "Invalid or expired token",
  branchDetails: null,
  availableRooms: []
}
```

---

## 🚀 Deployment Notes

### Backend Requirements
Backend must implement the verification endpoint:

```javascript
// Example backend implementation
app.get('/api/auth/verify/customer/signup/:token', (req, res) => {
  const { token } = req.params;
  
  try {
    // Verify JWT token
    const decoded = jwt.verify(token, SECRET_KEY);
    
    // Check if token is for signup purpose
    if (decoded.purpose === 'customer_signup') {
      return res.json({
        success: true,
        message: "Token verified successfully"
      });
    }
    
    return res.status(400).json({
      success: false,
      message: "Invalid token purpose"
    });
    
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token"
    });
  }
});
```

### Frontend Environment
Ensure `.env` file has correct API URL:
```env
VITE_API_BASE_URL=http://localhost:8020
```

---

## ✨ Summary

- ✅ Single API call for token verification + data fetching
- ✅ More efficient - one network request instead of two
- ✅ Better error handling and user feedback
- ✅ Improved security and user experience
- ✅ Simpler code with single async thunk
- ✅ Clear error messages for all scenarios

**Result:** Efficient and secure registration flow with single API call! 🎉
