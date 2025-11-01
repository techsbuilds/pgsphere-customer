# PG Customer Portal - API Documentation

## Authentication APIs

### 1. Verify Signup Token & Get Details
**Endpoint:** `GET /api/auth/verify/customer/signup/{token}`

**Description:** Verifies the signup token AND returns branch details, PG details, and available rooms in a single API call.

**URL Parameters:**
- `token` (string): JWT token from registration URL

**Response (Success):**
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
        "floor_id": "68cfbc301ed89e8029045714",
        "service_type": "AC",
        "capacity": 4,
        "filled": 1,
        "remark": "Ac Room",
        "branch": "68cfb83b96bdfcfbc8c9ee6a",
        "pgcode": "PG92D305"
      }
    ]
  }
}
```

**Response (Error):**
```json
{
  "success": false,
  "message": "Invalid or expired token"
}
```

### 2. Get Branch Details with Token
**Endpoint:** `POST /get-branch-details`

**Description:** Fetches branch details, PG details, and available rooms using the token from registration URL.

**Headers:**
```
Content-Type: application/json
Authorization: Bearer <token>
```

**Response:**
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
        "floor_id": "68cfbc301ed89e8029045714",
        "service_type": "AC",
        "capacity": 4,
        "filled": 1,
        "remark": "Ac Room",
        "branch": "68cfb83b96bdfcfbc8c9ee6a",
        "added_by": "68cf9d9b3dcb78209a92d305",
        "added_by_type": "Admin",
        "pgcode": "PG92D305"
      }
    ]
  }
}
```

### 3. Validate Branch Token (Legacy)
**Endpoint:** `POST /api/auth/validate-branch`

**Description:** Validates the branch token from registration URL and returns branch information.

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "token": "bdaffktoken"
}
```

**Response:**
```json
{
  "success": true,
  "branch": {
    "id": "branch-001",
    "name": "Pgsphere Premium Residency",
    "shortName": "Pgsphere Premium...",
    "address": "Sector 15, Gurgaon, Haryana 122001",
    "logoUrl": "https://example.com/logos/Pgsphere-logo.png"
  }
}
```

### 4. Customer Registration
**Endpoint:** `POST /api/auth/register`

**Description:** Registers a new customer with complete details including room information and Aadhaar card.

**Headers:**
```
Content-Type: multipart/form-data
```

**Request Body (Form Data):**
```
customer_name: "John Doe"
email: "john.doe@email.com"
password: "securepassword123"
mobile_no: "6876867552"
room: "68cfbd721ed89e802904571b" (Room ID)
branch: "68cfb83b96bdfcfbc8c9ee6a" (Branch ID)
pgcode: "PG92D305"
joining_date: "2025-10-04" (YYYY-MM-DD format)
added_by: "68cf9d9b3dcb78209a92d305" (Admin ID)
added_by_type: "Admin"
aadharcard: <file>
```

**Response:**
```json
{
  "success": true,
  "message": "Registration successful. Awaiting admin approval.",
  "user": {
    "id": "user-123",
    "email": "john.doe@email.com",
    "fullName": "John Doe",
    "phone": "6876867552",
    "branchId": "68cfb83b96bdfcfbc8c9ee6a",
    "roomId": "68cfbd721ed89e802904571b",
    "pgcode": "PG92D305",
    "aadhaarCardUrl": "https://example.com/uploads/aadhaar/user-123.jpg",
    "status": "pending",
    "registeredAt": "2024-01-15T10:30:00Z"
  },
  "branchInfo": {
    "id": "branch-001",
    "name": "Pgsphere Premium Residency",
    "shortName": "Pgsphere Premium...",
    "address": "Sector 15, Gurgaon, Haryana 122001",
    "logoUrl": "https://example.com/logos/Pgsphere-logo.png"
  }
}
```

### 5. Customer Login
**Endpoint:** `POST /api/auth/customer/sign-in`

**Description:** Customer login with email, password, and userType.

**Request Body:**
```json
{
  "email": "ankit@gmail.com",
  "password": "secure",
  "userType": "Customer"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": "user-123",
    "email": "ankit@gmail.com",
    "fullName": "Ankit Kumar",
    "phone": "+91-9876543210",
    "branchId": "branch-001",
    "status": "approved",
    "registeredAt": "2024-01-15T10:30:00Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (Error - Invalid Credentials):**
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

**Response (Error - Account Not Verified):**
```json
{
  "success": false,
  "message": "Your account is not verified by admin."
}
```

**Frontend Handling:**
- Invalid credentials → Red error notification
- Account not verified → Yellow warning notification with message:
  "⏳ Your account is pending admin approval. Please wait for verification."

## Daily Updates APIs

### 3. Fetch Daily Updates
**Endpoint:** `GET /api/daily-updates`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "updates": [
    {
      "id": "update-001",
      "title": "Water Supply Maintenance",
      "content": "Water supply will be interrupted tomorrow from 10 AM to 2 PM for maintenance work.",
      "type": "maintenance",
      "date": "2024-01-20T09:00:00Z",
      "priority": "high",
      "isRead": false
    },
    {
      "id": "update-002",
      "title": "New WiFi Password",
      "content": "The WiFi password has been updated. New password: PG2024@Secure.",
      "type": "notice",
      "date": "2024-01-19T14:30:00Z",
      "priority": "medium",
      "isRead": true
    }
  ]
}
```

### 4. Mark Update as Read
**Endpoint:** `PATCH /api/daily-updates/{updateId}/read`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Update marked as read",
  "id": "update-001"
}
```

## Meal Menu APIs

### 5. Fetch Weekly Menu
**Endpoint:** `GET /api/meals/weekly`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "weeklyMenu": [
    {
      "date": "2024-01-20",
      "meals": [
        {
          "id": "meal-001",
          "name": "Aloo Paratha with Curd",
          "type": "breakfast",
          "description": "Fresh aloo paratha served with homemade curd and pickle"
        },
        {
          "id": "meal-002",
          "name": "Dal Rice with Sabji",
          "type": "lunch",
          "description": "Yellow dal, steamed rice, mixed vegetable curry, and salad"
        },
        {
          "id": "meal-003",
          "name": "Chicken Curry with Roti",
          "type": "dinner",
          "description": "Spicy chicken curry with fresh rotis and onion salad"
        }
      ],
      "cancelled": []
    }
  ]
}
```

### 6. Cancel Meal
**Endpoint:** `POST /api/meals/cancel`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "date": "2024-01-21",
  "mealType": "breakfast",
  "reason": "Going out for breakfast with friends"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Meal cancelled successfully",
  "date": "2024-01-21",
  "mealType": "breakfast"
}
```

## Complaints APIs

### 7. Submit Complaint
**Endpoint:** `POST /api/complaints`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "subject": "AC not working in Room 205",
  "description": "The air conditioner in my room has stopped working since yesterday. It's not cooling properly and making strange noises.",
  "category": "Room Issues",
  "priority": "high"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Complaint submitted successfully",
  "complaint": {
    "id": "complaint-123",
    "subject": "AC not working in Room 205",
    "description": "The air conditioner in my room has stopped working since yesterday.",
    "category": "Room Issues",
    "priority": "high",
    "status": "open",
    "submittedAt": "2024-01-20T15:30:00Z"
  }
}
```

### 8. Fetch All Complaints
**Endpoint:** `GET /api/complaints`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "complaints": [
    {
      "id": "complaint-001",
      "subject": "AC not working in Room 205",
      "description": "The air conditioner in my room has stopped working since yesterday.",
      "category": "Room Issues",
      "priority": "high",
      "status": "in-progress",
      "submittedAt": "2024-01-19T10:30:00Z"
    },
    {
      "id": "complaint-002",
      "subject": "Food quality issue",
      "description": "The dal served in lunch today was too salty.",
      "category": "Food Quality",
      "priority": "medium",
      "status": "resolved",
      "submittedAt": "2024-01-18T13:45:00Z",
      "resolvedAt": "2024-01-19T09:15:00Z"
    }
  ]
}
```

### 8a. Fetch Daily Meals
**Endpoint:** `GET /api/meals/daily?date=2024-01-20`

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `date` (required): Date in YYYY-MM-DD format

**Response:**
```json
{
  "success": true,
  "meals": {
    "date": "2024-01-20",
    "meals": [
      {
        "id": "meal-001",
        "name": "Aloo Paratha with Curd",
        "type": "breakfast",
        "description": "Fresh aloo paratha served with homemade curd and pickle",
        "selectionDeadline": "06:00",
        "isSelected": true,
        "canModify": false
      },
      {
        "id": "meal-002",
        "name": "Dal Rice with Sabji",
        "type": "lunch",
        "description": "Yellow dal, steamed rice, mixed vegetable curry, and salad",
        "selectionDeadline": "10:00",
        "isSelected": true,
        "canModify": true
      },
      {
        "id": "meal-003",
        "name": "Chicken Curry with Roti",
        "type": "dinner",
        "description": "Spicy chicken curry with fresh rotis and onion salad",
        "selectionDeadline": "16:00",
        "isSelected": false,
        "canModify": true
      }
    ],
    "cancelled": []
  }
}
```

### 8b. Update Meal Selection
**Endpoint:** `PUT /api/meals/selection`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "date": "2024-01-20",
  "mealId": "meal-001",
  "isSelected": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Meal selection updated successfully",
  "date": "2024-01-20",
  "mealId": "meal-001",
  "isSelected": true
}
```

## Rent Payment APIs

### 9. Fetch Rent Payments
**Endpoint:** `GET /api/rent-payments`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "payments": [
    {
      "id": "rent-2024-01",
      "month": "2024-01",
      "year": 2024,
      "monthName": "January",
      "amount": 15000,
      "status": "paid",
      "dueDate": "2024-01-05",
      "paidAt": "2024-01-03T10:30:00Z",
      "paymentMethod": "UPI"
    },
    {
      "id": "rent-2024-12",
      "month": "2024-12",
      "year": 2024,
      "monthName": "December",
      "amount": 15000,
      "status": "unpaid",
      "dueDate": "2024-12-05"
    }
  ]
}
```

### 10. Generate QR Code for Payment
**Endpoint:** `POST /api/rent-payments/qr-code`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "month": "2024-12"
}
```

**Response:**
```json
{
  "success": true,
  "qrCodeUrl": "https://api.example.com/qr-codes/rent-2024-12-abc123.png",
  "expiryTime": "2024-12-15T10:35:00Z",
  "amount": 15000,
  "paymentDetails": {
    "upiId": "owner@paytm",
    "accountNumber": "1234567890",
    "bankName": "State Bank of India"
  }
}
```

### 11. Submit Payment Screenshot
**Endpoint:** `POST /api/rent-payments/submit`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Request Body (Form Data):**
```
month: "2024-12"
screenshot: <file>
paymentMethod: "UPI"
amount: 15000
```

**Response:**
```json
{
  "success": true,
  "message": "Payment screenshot submitted successfully",
  "paymentSubmission": {
    "id": "submission-123",
    "month": "2024-12",
    "status": "pending",
    "screenshotUrl": "https://api.example.com/uploads/screenshots/submission-123.png",
    "submittedAt": "2024-12-15T10:30:00Z"
  }
}
```

### 12. Admin Verify Payment (Admin Only)
**Endpoint:** `PUT /api/admin/rent-payments/verify`

**Headers:**
```
Authorization: Bearer <admin-token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "submissionId": "submission-123",
  "status": "approved",
  "adminNotes": "Payment verified successfully"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment verification completed",
  "payment": {
    "id": "rent-2024-12",
    "month": "2024-12",
    "status": "paid",
    "paidAt": "2024-12-15T10:30:00Z",
    "paymentMethod": "UPI",
    "adminNotes": "Payment verified successfully"
  }
}
```

## Profile Management APIs

### 13. Get User Profile
**Endpoint:** `GET /api/auth/profile`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "user-123",
    "email": "testcustomer@gmail.com",
    "fullName": "Test Customer",
    "phone": "+91-9876543210",
    "branchId": "branch-001",
    "address": "123 Main Street, Sector 15, Gurgaon, Haryana 122001",
    "emergencyContact": "John Doe (Father)",
    "emergencyPhone": "+91-9876543211",
    "floorNumber": "2",
    "roomNumber": "205",
    "roomType": "Double Sharing",
    "aadhaarCardUrl": "https://example.com/uploads/aadhaar/user-123.jpg",
    "status": "approved",
    "registeredAt": "2024-01-15T10:30:00Z"
  },
  "branchInfo": {
    "id": "branch-001",
    "name": "Pgsphere Premium Residency",
    "shortName": "Pgsphere Premium...",
    "address": "Sector 15, Gurgaon, Haryana 122001",
    "logoUrl": "https://example.com/logos/Pgsphere-logo.png"
  }
}
```

### 14. Update User Profile
**Endpoint:** `PUT /api/auth/profile`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "fullName": "Updated Customer Name",
  "phone": "+91-9876543210",
  "address": "456 New Address, Sector 20, Gurgaon, Haryana 122002",
  "emergencyContact": "Jane Doe (Mother)",
  "emergencyPhone": "+91-9876543212",
  "floorNumber": "3",
  "roomNumber": "301",
  "roomType": "Single"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "user": {
    "id": "user-123",
    "email": "testcustomer@gmail.com",
    "fullName": "Updated Customer Name",
    "phone": "+91-9876543210",
    "branchId": "branch-001",
    "address": "456 New Address, Sector 20, Gurgaon, Haryana 122002",
    "emergencyContact": "Jane Doe (Mother)",
    "emergencyPhone": "+91-9876543212",
    "floorNumber": "3",
    "roomNumber": "301",
    "roomType": "Single",
    "aadhaarCardUrl": "https://example.com/uploads/aadhaar/user-123.jpg",
    "status": "approved",
    "registeredAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-12-15T10:30:00Z"
  },
  "branchInfo": {
    "id": "branch-001",
    "name": "Pgsphere Premium Residency",
    "shortName": "Pgsphere Premium...",
    "address": "Sector 15, Gurgaon, Haryana 122001",
    "logoUrl": "https://example.com/logos/Pgsphere-logo.png"
  }
}
```

### 15. Change Password
**Endpoint:** `PUT /api/auth/change-password`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword456",
  "confirmPassword": "newpassword456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

## Error Responses

All APIs can return error responses in the following format:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information"
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## Authentication Headers

For all protected endpoints, include the JWT token in the Authorization header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Data Types Reference

### User Status
- `pending` - Awaiting admin approval
- `approved` - Can access full application
- `rejected` - Registration denied

### Update Types
- `notice` - General notices
- `announcement` - Important announcements
- `maintenance` - Maintenance notifications

### Priority Levels
- `low` - Low priority
- `medium` - Medium priority
- `high` - High priority
- `urgent` - Urgent (for complaints only)

### Complaint Status
- `open` - Newly submitted
- `in-progress` - Being worked on
- `resolved` - Issue resolved
- `closed` - Complaint closed

### Leave Request Status
- `pending` - Awaiting approval
- `approved` - Request approved
- `rejected` - Request denied

### Meal Types
- `breakfast` - Morning meal
- `lunch` - Afternoon meal
- `dinner` - Evening meal

### Complaint Categories
- `Food Quality` - Issues with food
- `Room Issues` - Room-related problems
- `Staff Behavior` - Staff conduct issues
- `Maintenance` - Maintenance requests
- `Other` - Other issues