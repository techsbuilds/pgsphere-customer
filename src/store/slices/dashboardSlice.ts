import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authenticatedGet } from '../../utils/apiHelper';
import { API_ENDPOINTS } from '../../config/api';

interface DashboardStats {
  dailyUpdateCount: number;
  complaintCount: number;
  pendingRentAmount: number;
  pendingRentMonths: number;
}

interface DashboardState {
  stats: DashboardStats | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: DashboardState = {
  stats: null,
  isLoading: false,
  error: null,
};

export const fetchDashboardStats = createAsyncThunk(
  'dashboard/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authenticatedGet(API_ENDPOINTS.dashboardStats);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch dashboard stats');
      }
      
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch dashboard stats');
    }
  }
);

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardStats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.stats = action.payload;
        state.isLoading = false;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as string) || action.error.message || 'Failed to fetch dashboard stats';
      });
  },
});

export default dashboardSlice.reducer;

