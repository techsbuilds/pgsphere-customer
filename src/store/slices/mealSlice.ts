import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { format, addDays, startOfWeek, parseISO } from 'date-fns';
import { authenticatedGet, authenticatedPut, authenticatedPost } from '../../utils/apiHelper';
import { API_ENDPOINTS } from '../../config/api';

interface MealSubItem {
  id: string;
  name: string;
}

interface MealItem {
  id: string;
  name: string;
  type: 'breakfast' | 'lunch' | 'dinner';
  description: string;
  selectionDeadline: string; // Time until when user can select/deselect
  isSelected: boolean; // Whether user has selected this meal
  canModify: boolean; // Whether user can still modify selection
  items: MealSubItem[]; // Individual meal items (display only)
}

interface DayMeal {
  date: string;
  meals: MealItem[];
  cancelled: string[];
  fullDaySelected: boolean; // Whether user selected all meals for the day
}

interface MealConfig {
  breakfast_time: string;
  lunch_time: string;
  dinner_time: string;
}

interface MealState {
  weeklyMenu: DayMeal[];
  dailyMeals: DayMeal | null;
  mealConfig: MealConfig | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: MealState = {
  dailyMeals: null,
  weeklyMenu: [],
  mealConfig: null,
  isLoading: false,
  error: null,
};

// Helper function to transform daily meal API response to our state structure
const transformDailyMealResponse = (apiResponse: any, requestedDate: string): DayMeal => {
  const mealData = apiResponse.meal || [];
  
  // If no data for this day or empty array
  if (mealData.length === 0) {
    return {
      date: requestedDate,
      meals: [],
      cancelled: [],
      fullDaySelected: false,
    };
  }
  
  // Combine all meals from all entries
  const allMeals: MealItem[] = [];
  
  mealData.forEach((dayEntry: any, entryIndex: number) => {
    const meals: MealItem[] = dayEntry.meals.map((meal: any, mealIndex: number) => {
      // Transform items from array of strings to array of objects
      const items: MealSubItem[] = meal.items.map((itemName: string, itemIndex: number) => ({
        id: `item-${entryIndex}-${mealIndex}-${itemIndex}`,
        name: itemName,
      }));
      
      const mealType = meal.type.toLowerCase();
      const now = new Date();
      const mealDate = parseISO(dayEntry.date);
      
      // Determine if meal can be modified based on selection deadlines
      let canModify = false;
      if (format(mealDate, 'yyyy-MM-dd') === format(now, 'yyyy-MM-dd')) {
        // For today, check time
        const currentHour = now.getHours();
        if (mealType === 'breakfast' && currentHour < 6) canModify = true;
        else if (mealType === 'lunch' && currentHour < 10) canModify = true;
        else if (mealType === 'dinner' && currentHour < 16) canModify = true;
      } else if (mealDate > now) {
        // Future dates can be modified
        canModify = true;
      }
      
      // Check if this meal is cancelled
      const isCancelled = meal.cancelled && meal.cancelled.length > 0;
      
      return {
        id: `meal-${entryIndex}-${mealIndex}`,
        name: meal.type,
        type: mealType as 'breakfast' | 'lunch' | 'dinner',
        description: meal.description || '',
        selectionDeadline: mealType === 'breakfast' ? '06:00' : mealType === 'lunch' ? '10:00' : '16:00',
        isSelected: !isCancelled, // Not selected if cancelled
        canModify,
        items,
      };
    });
    
    allMeals.push(...meals);
  });
  
  // Get cancelled meal types
  const cancelledTypes: string[] = [];
  mealData.forEach((dayEntry: any) => {
    dayEntry.meals.forEach((meal: any) => {
      if (meal.cancelled && meal.cancelled.length > 0) {
        cancelledTypes.push(meal.type.toLowerCase());
      }
    });
  });
  
  return {
    date: requestedDate,
    meals: allMeals,
    cancelled: cancelledTypes,
    fullDaySelected: allMeals.length > 0 && allMeals.every(m => m.isSelected),
  };
};

// Fetch meal config (times for breakfast, lunch, dinner)
export const fetchMealConfig = createAsyncThunk(
  'meal/fetchConfig',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authenticatedGet(API_ENDPOINTS.mealConfig);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch meal config');
      }
      
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch meal config');
    }
  }
);

// Fetch meal by date (DD-MM-YYYY format)
export const fetchMealByDate = createAsyncThunk(
  'meal/fetchByDate',
  async (date: string, { rejectWithValue }) => {
    try {
      // Convert date from yyyy-MM-dd to DD-MM-YYYY format
      const [year, month, day] = date.split('-');
      const formattedDate = `${day}-${month}-${year}`;
      
      const response = await authenticatedGet(`${API_ENDPOINTS.mealByDate}/${formattedDate}`);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch meal for date');
      }
      
      return { data: response, requestedDate: date };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch meal for date');
    }
  }
);

export const updateMealSelection = createAsyncThunk(
  'meal/updateSelection',
  async (data: { date: string; mealId: string; isSelected: boolean }) => {
    const response = await authenticatedPut(API_ENDPOINTS.updateMealSelection, data);
    return response;
  }
);


export const updateFullDaySelection = createAsyncThunk(
  'meal/updateFullDay',
  async (data: { date: string; isSelected: boolean }) => {
    const response = await authenticatedPut('/api/meals/full-day', data);
    return response;
  }
);

export const cancelMeal = createAsyncThunk(
  'meal/cancel',
  async (data: { date: string; type: string }, { rejectWithValue }) => {
    try {
      const response = await authenticatedPut(API_ENDPOINTS.cancelMeal, {
        date: data.date,
        type: data.type
      });
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to cancel meal');
      }
      
      return { date: data.date, mealType: data.type };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to cancel meal');
    }
  }
);

const mealSlice = createSlice({
  name: 'meal',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMealConfig.fulfilled, (state, action) => {
        state.mealConfig = action.payload;
      })
      .addCase(fetchMealConfig.rejected, (state, action) => {
        state.error = (action.payload as string) || action.error.message || 'Failed to fetch meal config';
      })
      .addCase(fetchMealByDate.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMealByDate.fulfilled, (state, action) => {
        const { data, requestedDate } = action.payload;
        const transformedMeal = transformDailyMealResponse(data, requestedDate);
        
        // Update or add to weeklyMenu
        const existingIndex = state.weeklyMenu.findIndex(d => d.date === requestedDate);
        if (existingIndex >= 0) {
          state.weeklyMenu[existingIndex] = transformedMeal;
        } else {
          state.weeklyMenu.push(transformedMeal);
        }
        
        state.isLoading = false;
      })
      .addCase(fetchMealByDate.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as string) || action.error.message || 'Failed to fetch meal by date';
      })
      .addCase(updateMealSelection.fulfilled, (state, action) => {
        const { date, mealId, isSelected } = action.payload;
        
        // Update weeklyMenu
        const dayMeal = state.weeklyMenu.find(d => d.date === date);
        if (dayMeal) {
          const meal = dayMeal.meals.find(m => m.id === mealId);
          if (meal) {
            meal.isSelected = isSelected;
          }
        }
      })
      .addCase(updateFullDaySelection.fulfilled, (state, action) => {
        const { date, isSelected } = action.payload;
        
        // Update weeklyMenu
        const dayMeal = state.weeklyMenu.find(d => d.date === date);
        if (dayMeal) {
          dayMeal.fullDaySelected = isSelected;
          dayMeal.meals.forEach(meal => {
            if (meal.canModify) {
              meal.isSelected = isSelected;
            }
          });
        }
      })
      .addCase(cancelMeal.fulfilled, (state, action) => {
        const { date, mealType } = action.payload;
        // Convert date from DD-MM-YYYY to yyyy-MM-dd for state
        const [day, month, year] = date.split('-');
        const stateDate = `${year}-${month}-${day}`;
        
        // Update weeklyMenu
        const dayMeal = state.weeklyMenu.find(d => d.date === stateDate);
        if (dayMeal) {
          const mealLower = mealType.toLowerCase();
          if (!dayMeal.cancelled.includes(mealLower)) {
            dayMeal.cancelled.push(mealLower);
          }
          // Mark the meal as not selected
          const meal = dayMeal.meals.find(m => m.type === mealLower);
          if (meal) {
            meal.isSelected = false;
          }
        }
      });
  },
});

export default mealSlice.reducer;