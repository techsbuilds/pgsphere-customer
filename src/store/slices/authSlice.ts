import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { API_BASE_URL, API_ENDPOINTS } from '../../config/api';
import { authenticatedGet, authenticatedPut } from '../../utils/apiHelper';

interface User {
  id: string;
  userId?: string;
  email: string;
  fullName?: string;
  phone?: string;
  branchId?: string;
  address?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  floorNumber?: string;
  roomNumber?: string;
  roomType?: string;
  aadhaarCardUrl?: string;
  status?: 'pending' | 'approved' | 'rejected';
  registeredAt?: string;
  userType?: string;
  pgcode?: string;
}

interface CustomerProfile {
  _id: string;
  customer_name: string;
  email: string;
  mobile_no: string;
  deposite_amount?: number;
  paid_deposite_amount?: number;
  deposite_status?: string;
  rent_amount?: number;
  room: {
    _id: string;
    room_id: string;
    room_type: string;
    floor_id: {
      _id: string;
      floor_name: string;
      branch: string;
      pgcode: string;
      createdAt: string;
      updatedAt: string;
      __v: number;
    };
    service_type: string;
    capacity: number;
    filled: number;
    remark?: string;
    branch: string;
    added_by: string;
    added_by_type: string;
    pgcode: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
  };
  branch: {
    _id: string;
    branch_image: string | null;
    branch_name: string;
    branch_address: string;
    pgcode: string;
    added_by: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
  };
  joining_date: string;
  aadharcard_url: string;
  ref_person_name?: string;
  ref_person_contact_no?: string;
  added_by: string;
  added_by_type: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface CustomerProfileResponse {
  customer: CustomerProfile;
  pgname: string;
  pglogo: string;
}

interface Room {
  _id: string;
  room_id: string;
  room_type: string;
  floor_id: string;
  service_type: string;
  capacity: number;
  filled: number;
  remark?: string;
  branch: string;
}

interface BranchInfo {
  id: string;
  name: string;
  address: string;
  logoUrl?: string;
  shortName?: string;
}

interface BranchDetails {
  branch: {
    _id: string;
    branch_image: string;
    branch_name: string;
    branch_address: string;
    pgcode: string;
    added_by: string;
  };
  pgDetails: {
    _id: string;
    full_name: string;
    email: string;
    pgname: string;
    address: string;
    contactno: string;
  };
  pgcode: string;
  added_by: string;
  added_by_type: string;
  rooms?: Room[];
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  registrationToken: string | null;
  branchInfo: BranchInfo | null;
  branchDetails: BranchDetails | null;
  availableRooms: Room[];
  tokenVerified: boolean;
  isInitialized: boolean; // Track if we've tried to restore session
  customerProfile: CustomerProfile | null;
  pgName: string | null;
  pgLogo: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: false,
  error: null,
  registrationToken: null,
  branchInfo: null,
  branchDetails: null,
  availableRooms: [],
  tokenVerified: false,
  isInitialized: false, // Start as false
  customerProfile: null,
  pgName: null,
  pgLogo: null,
};

// Async thunks for API calls
export const validateBranchToken = createAsyncThunk(
  'auth/validateBranch',
  async (token: string) => {
    const response = await fetch('/api/auth/validate-branch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });
    return response.json();
  }
);

export const verifySignupToken = createAsyncThunk(
  'auth/verifySignupToken',
  async (token: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.verifySignupToken}/${token}`, {
        method: 'GET',
        headers: { 
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      
      if (!response.ok || !data.success) {
        return rejectWithValue(data.message || 'Invalid or expired token');
      }
      
      // API returns full branch details in data.data
      return data.data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

export const fetchBranchDetails = createAsyncThunk(
  'auth/fetchBranchDetails',
  async (token: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.getBranchDetails}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });
      
      const data = await response.json();
      
      if (!response.ok || !data.success) {
        return rejectWithValue(data.message || 'Failed to fetch branch details');
      }
      
      return data.data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

export const registerCustomer = createAsyncThunk(
  'auth/register',
  async (data: { 
    customer_name: string;
    email: string;
    password: string;
    mobile_no: string;
    room: string;
    branch: string;
    pgcode: string;
    joining_date: string;
    added_by: string;
    added_by_type: string;
    aadharcard: File;
  }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('customer_name', data.customer_name);
      formData.append('email', data.email);
      formData.append('password', data.password);
      formData.append('mobile_no', data.mobile_no);
      formData.append('room', data.room);
      formData.append('branch', data.branch);
      formData.append('pgcode', data.pgcode);
      formData.append('joining_date', data.joining_date);
      formData.append('added_by', data.added_by);
      formData.append('added_by_type', data.added_by_type);
      formData.append('aadharcard', data.aadharcard);

      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.register}`, {
        method: 'POST',
        body: formData,
      });
      
      const result = await response.json();
      
      if (!response.ok || !result.success) {
        return rejectWithValue(result.message || 'Registration failed');
      }
      
      return result;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

export const loginCustomer = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.login}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password,
          userType: 'Customer'
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok || !data.success) {
        return rejectWithValue(data.message || 'Login failed');
      }
      
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

export const fetchCustomerProfile = createAsyncThunk(
  'auth/fetchCustomerProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authenticatedGet(API_ENDPOINTS.customerProfile);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch customer profile');
      }
      
      // The API returns data in this structure: { customer: {...}, pgname: "...", pglogo: "..." }
      return response.data as CustomerProfileResponse;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch customer profile');
    }
  }
);

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (profileData: { name: string; mobile: string; email: string }, { rejectWithValue }) => {
    try {
      const response = await authenticatedPut(API_ENDPOINTS.updateCustomerProfile, profileData);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to update profile');
      }
      
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update profile');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.customerProfile = null;
      state.pgName = null;
      state.pgLogo = null;
      state.branchInfo = null;
      state.isInitialized = true; // Keep initialized as true after logout
      // Clear all auth-related data from localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      localStorage.removeItem('userType');
      localStorage.removeItem('pgcode');
    },
    clearError: (state) => {
      state.error = null;
    },
    setRegistrationToken: (state, action: PayloadAction<string>) => {
      state.registrationToken = action.payload;
    },
    // Restore session from localStorage on app load
    restoreSession: (state) => {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      const userType = localStorage.getItem('userType');
      const pgcode = localStorage.getItem('pgcode');
      
      if (token && userId && userType && pgcode) {
        state.token = token;
        state.user = {
          id: userId,
          userId: userId,
          userType: userType,
          pgcode: pgcode,
          email: '',
        };
      }
      // Mark as initialized regardless of whether we found a session
      state.isInitialized = true;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(validateBranchToken.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(validateBranchToken.fulfilled, (state, action) => {
        state.isLoading = false;
        state.branchInfo = action.payload.branch;
      })
      .addCase(validateBranchToken.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Invalid branch token';
      })
      .addCase(verifySignupToken.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.tokenVerified = false;
      })
      .addCase(verifySignupToken.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tokenVerified = true;
        // Store branch details from verification API response
        state.branchDetails = action.payload;
        state.availableRooms = action.payload.rooms || [];
        // Update branchInfo with fetched data
        if (action.payload.branch) {
          state.branchInfo = {
            id: action.payload.branch._id,
            name: action.payload.branch.branch_name,
            address: action.payload.branch.branch_address,
            logoUrl: action.payload.branch.branch_image,
          };
        }
      })
      .addCase(verifySignupToken.rejected, (state, action) => {
        state.isLoading = false;
        state.tokenVerified = false;
        state.error = action.payload as string || 'Token verification failed';
      })
      .addCase(fetchBranchDetails.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBranchDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        state.branchDetails = action.payload;
        state.availableRooms = action.payload.rooms || [];
        // Update branchInfo with fetched data
        if (action.payload.branch) {
          state.branchInfo = {
            id: action.payload.branch._id,
            name: action.payload.branch.branch_name,
            address: action.payload.branch.branch_address,
            logoUrl: action.payload.branch.branch_image,
          };
        }
      })
      .addCase(fetchBranchDetails.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string || 'Failed to fetch branch details';
      })
      .addCase(registerCustomer.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerCustomer.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.user) {
          state.user = action.payload.user;
        }
      })
      .addCase(registerCustomer.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string || 'Registration failed';
      })
      .addCase(loginCustomer.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginCustomer.fulfilled, (state, action) => {
        state.isLoading = false;
        // Extract data from the actual API response structure
        const { token, userId, userType, pgcode } = action.payload.data;
        
        // Create user object from the response
        state.user = {
          id: userId,
          userId: userId,
          userType: userType,
          pgcode: pgcode,
          email: '', // Will be populated from other API calls if needed
        };
        state.token = token;
        
        // Persist token and user data to localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('userId', userId);
        localStorage.setItem('userType', userType);
        localStorage.setItem('pgcode', pgcode);
      })
      .addCase(loginCustomer.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string || 'Login failed';
      })
      .addCase(updateProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state) => {
        state.isLoading = false;
        // Refresh customer profile after update
        // The actual profile data will be updated when fetchCustomerProfile is called
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Profile update failed';
      })
      .addCase(fetchCustomerProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCustomerProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        
        // Extract customer data from nested response
        const customerData = action.payload.customer;
        
        // Store customer profile
        state.customerProfile = customerData;
        
        // Store PG details
        state.pgName = action.payload.pgname;
        state.pgLogo = action.payload.pglogo;
        
        // Also update user with profile data for compatibility
        if (state.user) {
          state.user.fullName = customerData.customer_name;
          state.user.email = customerData.email;
          state.user.phone = customerData.mobile_no;
          state.user.aadhaarCardUrl = customerData.aadharcard_url;
          state.user.registeredAt = customerData.joining_date;
          state.user.floorNumber = customerData.room.floor_id.floor_name;
          state.user.roomNumber = customerData.room.room_id;
          state.user.roomType = customerData.room.room_type;
        }
        
        // Update branch info
        state.branchInfo = {
          id: customerData.branch._id,
          name: customerData.branch.branch_name,
          address: customerData.branch.branch_address,
          logoUrl: customerData.branch.branch_image || undefined,
        };
      })
      .addCase(fetchCustomerProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as string) || action.error.message || 'Failed to fetch customer profile';
      });
  },
});

export const { logout, clearError, setRegistrationToken, restoreSession } = authSlice.actions;
export default authSlice.reducer;