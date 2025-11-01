# Meal API Implementation - Fetch Meal by Date

## Overview
This document describes the implementation of the meal fetching API that retrieves meals for a specific date.

## API Endpoint

### Fetch Meal by Date
- **Endpoint**: `/api/meal/{date}`
- **Method**: GET
- **Date Format**: DD-MM-YYYY (e.g., `06-10-2025`)
- **Authentication**: Token passed via cookie (`pgtoken`)

### Example Request
```bash
curl --location 'http://localhost:8020/api/meal/06-10-2025' \
--header 'Cookie: pgtoken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
```

### Example Response
```json
{
    "message": "Get Meal Successfully by Day.",
    "meal": [
        {
            "_id": "68e23ce629bf36293af9b2c5",
            "date": "2025-10-06T00:00:00.000Z",
            "meals": [
                {
                    "items": ["Dal Fry", "Rice", "Salad"],
                    "type": "Lunch",
                    "description": "Healthy lunch with dal and rice",
                    "cancelled": [],
                    "_id": "68e23ce629bf36293af9b2c6"
                },
                {
                    "items": ["Paneer Butter Masala", "Roti", "Gulab Jamun"],
                    "type": "Dinner",
                    "description": "Special dinner with sweet dish",
                    "cancelled": ["68e23785c0188363f6609b9e"],
                    "_id": "68e23ce629bf36293af9b2c7"
                }
            ],
            "pgcode": "PGC246F7",
            "branch": ["68d91fa33f891cf0dbc5be58"],
            "added_by": "68cf0d8ca6935b34b9c246f7",
            "added_by_type": "Admin",
            "createdAt": "2025-10-05T09:39:50.558Z",
            "updatedAt": "2025-10-05T09:45:42.404Z",
            "__v": 1
        }
    ],
    "success": true
}
```

## Implementation Details

### 1. API Configuration (`src/config/api.ts`)
Added new endpoint:
```typescript
mealByDate: '/api/meal', // Base endpoint, append /{date} in DD-MM-YYYY format
```

### 2. Redux State Management (`src/store/slices/mealSlice.ts`)

#### New Transform Function
Created `transformDailyMealResponse()` to transform the API response into the application's state structure:
- Combines meals from multiple entries for the same day
- Converts string arrays of items to structured objects
- Determines if meals can be modified based on deadline times
- Identifies cancelled meals
- Calculates full day selection status

#### New Async Thunk
```typescript
export const fetchMealByDate = createAsyncThunk(
  'meal/fetchByDate',
  async (date: string, { rejectWithValue }) => {
    // Converts date from yyyy-MM-dd to DD-MM-YYYY format
    // Calls the API endpoint
    // Returns transformed data
  }
);
```

#### State Updates
- Updates or adds meals to `weeklyMenu` state
- Maintains loading and error states
- Integrates seamlessly with existing meal management

### 3. Meal Menu Component Integration (`src/pages/MealMenu.tsx`)

Added automatic fetching when date is selected:
```typescript
useEffect(() => {
  if (selectedDate) {
    dispatch(fetchMealByDate(selectedDate));
  }
}, [selectedDate, dispatch]);
```

### 4. Dashboard Component Integration (`src/pages/Dashboard.tsx`)

Replaced weekly menu fetch with date-specific API for today's meals:
```typescript
useEffect(() => {
  dispatch(fetchDailyUpdates());
  
  // Fetch today's meals using the date-specific API
  const today = format(new Date(), 'yyyy-MM-dd');
  dispatch(fetchMealByDate(today));
  
  dispatch(fetchComplaints());
  dispatch(fetchRentPayments());
}, [dispatch]);
```

**Benefits:**
- Only fetches today's meals instead of the entire week
- Reduces unnecessary data transfer
- Faster initial dashboard load
- Uses the same API endpoint as the Meal Menu page for consistency

## Features

### Date Format Conversion
- Frontend uses: `yyyy-MM-dd` (e.g., "2025-10-06")
- API expects: `DD-MM-YYYY` (e.g., "06-10-2025")
- Automatic conversion handled in the thunk action

### Meal Status Management
- **Cancelled Meals**: Identified by non-empty `cancelled` array
- **Time-based Modifications**: 
  - Breakfast: Can modify until 06:00
  - Lunch: Can modify until 10:00
  - Dinner: Can modify until 16:00

### Multiple Meal Entries
Handles multiple meal entries for the same date (e.g., from different branches or updates)

### Token Authentication
- Token stored in localStorage
- Automatically sent as cookie (`pgtoken`) with each request
- Handled by `authenticatedGet()` helper function

## Benefits

1. **Real-time Data**: Fetches fresh meal data when user selects a date
2. **Flexible**: Handles multiple meal entries per day
3. **Type-safe**: Full TypeScript support
4. **Error Handling**: Proper error states and rejection handling
5. **Seamless Integration**: Works with existing meal management features

## Usage Flow

### Meal Menu Page
1. User navigates to Meal Menu page
2. Weekly menu is loaded initially (existing behavior)
3. User clicks on a specific date
4. `fetchMealByDate` is triggered automatically
5. API call is made with date in DD-MM-YYYY format
6. Response is transformed and merged into the weekly menu state
7. UI updates to show meals for selected date

### Dashboard Page
1. User navigates to Dashboard
2. `fetchMealByDate` is called with today's date (current date in yyyy-MM-dd format)
3. API receives request in DD-MM-YYYY format
4. Today's meals are displayed in the "Today's Meals" section
5. Users can interact with meal selections directly from the dashboard

## Testing

### Meal Menu Page
1. Navigate to the Meal Menu page
2. Select different dates from the week navigation
3. Verify that meals are loaded for each selected date
4. Check that cancelled meals are displayed correctly
5. Verify that modification deadlines are enforced
6. Ensure loading states are shown during API calls

### Dashboard Page
1. Navigate to the Dashboard
2. Verify that today's meals are displayed in the "Today's Meals" section
3. Check that meal counts are accurate in the stats card
4. Test meal selection toggles (individual and full day)
5. Verify that cancelled meals show proper status
6. Ensure expired meals display the "Time Expired" badge
7. Check that the full day toggle works correctly

## Error Handling

- Network errors are caught and displayed to the user
- Invalid responses trigger error notifications
- Loading states prevent duplicate requests
- Failed requests don't break existing state

## Future Enhancements

Potential improvements:
1. Cache meals by date to reduce API calls
2. Add refresh button for manual data reload
3. Implement optimistic updates for meal selections
4. Add offline support with local storage
5. Pre-fetch meals for adjacent dates

