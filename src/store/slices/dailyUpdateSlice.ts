import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authenticatedGet } from '../../utils/apiHelper';
import { API_ENDPOINTS } from '../../config/api';

interface DailyUpdate {
  _id: string;
  title: string;
  content_type: string; // "General", "Notice", etc.
  pgcode: string;
  branch: {
    _id: string;
    branch_image: string | null;
    branch_name: string;
    branch_address: string;
    pgcode: string;
  };
  added_by: string;
  added_by_type: string;
  createdAt: string;
  updatedAt: string;
}

interface DailyUpdateState {
  updates: DailyUpdate[];
  isLoading: boolean;
  error: string | null;
}

const initialState: DailyUpdateState = {
  updates: [],
  isLoading: false,
  error: null,
};

export const fetchDailyUpdates = createAsyncThunk(
  'dailyUpdate/fetchUpdates',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authenticatedGet(API_ENDPOINTS.dailyUpdates);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch daily updates');
      }
      
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch daily updates');
    }
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

const dailyUpdateSlice = createSlice({
  name: 'dailyUpdate',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDailyUpdates.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDailyUpdates.fulfilled, (state, action) => {
        // API returns { success: true, data: [...], message: "..." }
        state.updates = action.payload.data || [];
        state.isLoading = false;
      })
      .addCase(fetchDailyUpdates.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as string) || action.error.message || 'Failed to fetch daily updates';
      })
      .addCase(markAsRead.fulfilled, (state, action) => {
        const update = state.updates.find(u => u._id === action.payload.id);
        if (update) {
          // Mark as read if needed
        }
      });
  },
});

export default dailyUpdateSlice.reducer;