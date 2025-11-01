import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authenticatedGet, authenticatedPost } from '../../utils/apiHelper';
import { API_ENDPOINTS } from '../../config/api';

interface Complaint {
  _id: string;
  subject: string;
  description: string;
  category: string;
  status: string; // "Open", "Close", "In Progress", etc.
  added_by: string | null;
  pgcode: string;
  branch: string;
  createdAt: string;
  updatedAt: string;
  close_by?: string;
  close_by_type?: string;
  priority?: string; // Optional, for backward compatibility
}

interface ComplaintState {
  complaints: Complaint[];
  isLoading: boolean;
  error: string | null;
}

const initialState: ComplaintState = {
  complaints: [],
  isLoading: false,
  error: null,
};

export const submitComplaint = createAsyncThunk(
  'complaint/submit',
  async (complaintData: { subject: string; description: string; category: string }, { rejectWithValue }) => {
    try {
      const response = await authenticatedPost(API_ENDPOINTS.complaints, complaintData);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to submit complaint');
      }
      
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to submit complaint');
    }
  }
);

export const fetchComplaints = createAsyncThunk(
  'complaint/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authenticatedGet(API_ENDPOINTS.getComplaints);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch complaints');
      }
      
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch complaints');
    }
  }
);

const complaintSlice = createSlice({
  name: 'complaint',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(submitComplaint.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(submitComplaint.fulfilled, (state, action) => {
        // Refetch complaints after successful submission
        state.isLoading = false;
      })
      .addCase(submitComplaint.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as string) || action.error.message || 'Failed to submit complaint';
      })
      .addCase(fetchComplaints.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchComplaints.fulfilled, (state, action) => {
        // API returns { success: true, data: [...], message: "..." }
        state.complaints = action.payload.data || [];
        state.isLoading = false;
      })
      .addCase(fetchComplaints.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as string) || action.error.message || 'Failed to fetch complaints';
      });
  },
});

export default complaintSlice.reducer;