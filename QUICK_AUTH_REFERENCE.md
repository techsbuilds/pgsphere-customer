# Quick Authentication Reference / जल्दी प्रमाणीकरण संदर्भ

## 🚀 What's Done / क्या हो गया

✅ **Login के बाद token automatically save हो जाता है**  
✅ **User को dashboard पे automatically redirect हो जाता है**  
✅ **Token सभी API calls में automatically include हो जाता है**  
✅ **Page refresh के बाद भी user logged in रहता है**  
✅ **Professional authentication system ready है**

---

## 📋 How to Use / कैसे इस्तेमाल करें

### 1️⃣ Login (Already Working) ✅

```typescript
// LoginForm.tsx - ALREADY WORKING
// User login करता है → Token save हो जाता है → Dashboard redirect
```

**Kya hota hai:**
- User email/password डालता है
- API call होती है
- Response में token, userId, userType, pgcode आता है
- सब automatically localStorage और Redux में save हो जाता है
- User dashboard पे redirect हो जाता है

---

### 2️⃣ API Call with Token / Token के साथ API Call

**पुराना तरीका (गलत):**
```typescript
// DON'T DO THIS ❌
const response = await fetch('/api/daily-updates');
```

**नया तरीका (सही):**
```typescript
// DO THIS ✅
import { authenticatedGet } from '../utils/apiHelper';

const response = await authenticatedGet('/api/daily-updates');
// Token automatically include हो जाएगा!
```

---

### 3️⃣ Different API Calls / अलग-अलग API Calls

#### GET Request
```typescript
import { authenticatedGet } from '../utils/apiHelper';

const getData = async () => {
  const response = await authenticatedGet('/api/complaints');
  return response.data;
};
```

#### POST Request
```typescript
import { authenticatedPost } from '../utils/apiHelper';

const submitData = async (complaintText) => {
  const response = await authenticatedPost('/api/complaints', {
    complaint: complaintText,
    userId: user.userId,
    pgcode: user.pgcode
  });
  return response.data;
};
```

#### PUT Request (Update)
```typescript
import { authenticatedPut } from '../utils/apiHelper';

const updateData = async (id, data) => {
  const response = await authenticatedPut(`/api/complaints/${id}`, data);
  return response.data;
};
```

#### DELETE Request
```typescript
import { authenticatedDelete } from '../utils/apiHelper';

const deleteData = async (id) => {
  await authenticatedDelete(`/api/complaints/${id}`);
};
```

#### File Upload
```typescript
import { authenticatedFormData } from '../utils/apiHelper';

const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await authenticatedFormData('/api/upload', formData);
  return response.data;
};
```

---

### 4️⃣ User Info Access / User की जानकारी

```typescript
import { useAuth } from '../hooks/useAuth';

const MyComponent = () => {
  const { user, token, isAuthenticated, logout } = useAuth();
  
  console.log(user?.userId);     // "68e1755524f31c723ff831ac"
  console.log(user?.userType);   // "Customer"
  console.log(user?.pgcode);     // "PG92D305"
  console.log(token);            // "eyJhbGci..."
  console.log(isAuthenticated);  // true/false
  
  return (
    <div>
      <p>User ID: {user?.userId}</p>
      <p>PG Code: {user?.pgcode}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
};
```

---

### 5️⃣ Redux Slice में API Call / Redux Slice में कैसे करें

**Example: complaintSlice.ts**

```typescript
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authenticatedGet, authenticatedPost } from '../../utils/apiHelper';
import { API_ENDPOINTS } from '../../config/api';

// Fetch complaints
export const fetchComplaints = createAsyncThunk(
  'complaint/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authenticatedGet(API_ENDPOINTS.complaints);
      return response.data; // Token automatically include hai
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Submit complaint
export const submitComplaint = createAsyncThunk(
  'complaint/submit',
  async (complaintData, { rejectWithValue }) => {
    try {
      const response = await authenticatedPost(
        API_ENDPOINTS.complaints,
        complaintData
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
```

---

## 🔑 Important Points / महत्वपूर्ण बातें

### Token Storage / Token कहाँ है:
```javascript
localStorage.getItem('token')      // JWT token
localStorage.getItem('userId')     // User ID
localStorage.getItem('userType')   // "Customer"
localStorage.getItem('pgcode')     // "PG92D305"
```

### Token Header Format / Token header में कैसे जाता है:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Auto-include / Automatically include होता है:
- ✅ `authenticatedGet()`
- ✅ `authenticatedPost()`
- ✅ `authenticatedPut()`
- ✅ `authenticatedDelete()`
- ✅ `authenticatedFormData()`
- ✅ `authenticatedFetch()`

---

## 🛡️ Protection / सुरक्षा

### Protected Routes (Already Working) ✅
```typescript
// App.tsx - ALREADY WORKING
<ProtectedRoute>
  <Layout>
    <Dashboard />
  </Layout>
</ProtectedRoute>
```

**Kya hota hai:**
- Agar token नहीं है → Login page पे redirect
- Agar token है → Page render होता है

---

## 🔄 Session Persistence / सेशन बना रहता है

### Page Reload होने पर (Already Working) ✅
```typescript
// App.tsx - ALREADY WORKING
useEffect(() => {
  dispatch(restoreSession()); // localStorage से restore
}, []);
```

**Kya hota hai:**
- Page refresh होता है
- localStorage से token read होता है
- Redux में restore हो जाता है
- User logged in रहता है

---

## 🚪 Logout / लॉगआउट

```typescript
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

**Kya hota hai:**
- Redux state clear
- localStorage clear
- Login page पे redirect

---

## 📚 Documentation Files / दस्तावेज़

1. **AUTHENTICATION_GUIDE.md** - Complete detailed guide
2. **AUTHENTICATION_IMPLEMENTATION.md** - Implementation summary
3. **AUTHENTICATION_FLOW.md** - Visual flow diagrams
4. **MIGRATION_EXAMPLE.md** - How to update existing code
5. **QUICK_AUTH_REFERENCE.md** - This file (quick reference)

---

## ✅ Testing Checklist / टेस्टिंग चेकलिस्ट

### Test करने के लिए:

1. **Login Test**
   - Login page पे जाओ
   - Email/password डालो
   - Dashboard पे redirect होना चाहिए ✅

2. **Token Storage Test**
   - Login करने के बाद
   - Browser DevTools खोलो
   - Application → Local Storage
   - `token`, `userId`, `userType`, `pgcode` दिखना चाहिए ✅

3. **API Call Test**
   - Login करो
   - Network tab खोलो (DevTools)
   - कोई page visit करो जो API call करता है
   - Request headers में `Authorization: Bearer ...` दिखना चाहिए ✅

4. **Session Persistence Test**
   - Login करो
   - Page refresh करो (F5)
   - Logged in रहना चाहिए ✅

5. **Protected Route Test**
   - Logout करो
   - `/dashboard` URL manually enter करो
   - Login page पे redirect होना चाहिए ✅

6. **Logout Test**
   - Login करो
   - Logout button click करो
   - localStorage clear होना चाहिए
   - Login page पे redirect होना चाहिए ✅

---

## 🎯 Quick Migration Guide / जल्दी से कैसे update करें

### अगर पुराने API calls हैं तो:

**Step 1:** Import करो
```typescript
import { authenticatedGet, authenticatedPost } from '../utils/apiHelper';
```

**Step 2:** `fetch` को replace करो
```typescript
// पहले
const response = await fetch('/api/endpoint');

// अब
const response = await authenticatedGet('/api/endpoint');
```

**Step 3:** Done! Token automatically include हो जाएगा 🎉

---

## 🆘 Troubleshooting / समस्याएं

### Problem: Token नहीं भेज रहा
**Solution:** `authenticatedGet/Post/Put/Delete` use करो, normal `fetch` नहीं

### Problem: Logout के बाद भी logged in दिख रहा
**Solution:** Browser cache clear करो और page reload करो

### Problem: Page reload पे logout हो जाता है
**Solution:** Check करो localStorage में token है या नहीं

### Problem: 401 Unauthorized error
**Solution:** Token expire हो गया होगा, logout करो और फिर से login करो

---

## 💡 Pro Tips

1. **हमेशा** `authenticatedGet/Post/Put/Delete` use करो
2. **कभी भी** manually token add करने की जरूरत नहीं
3. **Redux slice में** try-catch use करो
4. **Error handling** properly करो
5. **Network tab** से API calls check करो (DevTools)

---

## 🎉 Summary / सारांश

### Ye sab automatically ho raha hai:
✅ Login → Token save  
✅ Token → localStorage + Redux  
✅ API calls → Token automatically include  
✅ Page reload → Session restore  
✅ Protected routes → Auto redirect if not logged in  
✅ Logout → Everything clear  

### Bas itna karna hai:
```typescript
// API call karna ho to
import { authenticatedGet } from '../utils/apiHelper';
const data = await authenticatedGet('/api/endpoint');
```

**That's it! Bahut simple hai! 🚀**

---

## 📞 Need Help? / मदद चाहिए?

Check these files in order:
1. This file (QUICK_AUTH_REFERENCE.md) - Quick reference
2. AUTHENTICATION_GUIDE.md - Detailed guide with examples
3. MIGRATION_EXAMPLE.md - How to update existing code
4. AUTHENTICATION_FLOW.md - Visual diagrams

**All authentication is working perfectly! Just use the helper functions! 🎊**
