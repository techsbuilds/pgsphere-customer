import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { API_BASE_URL, API_ENDPOINTS } from '../../config/api';
import { authenticatedGet, authenticatedFormData } from '../../utils/apiHelper';

interface ExtraCharge {
  name: string;
  amount: number;
}

interface BankAccount {
  _id: string;
  account_holdername: string;
  pgcode: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface ScannerDetails {
  _id: string;
  sc_image: string;
  bankaccount: BankAccount;
  pgcode: string;
  branch: string[];
  status: string;
  added_by: string;
  added_by_type: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface PaymentRequest {
  amount: number;
  payment_proof: string;
  month: number;
  year: number;
  status: string; // "completed", "rejected", "pending"
  payment_mode: string;
}

interface RentPayment {
  month: number;
  status: string; // "Pending", "Paid", etc.
  year: number;
  rent_amount: number;
  pending: number;
  extra_charges: ExtraCharge[];
  requestList: PaymentRequest[];
}

interface PaymentSubmission {
  amount: number;
  payment_mode: string;
  month: number;
  year: number;
  bank_account: string;
  payment_proof?: File;
}

interface RentState {
  customerId: string | null;
  customer_name: string | null;
  mobile_no: string | null;
  payments: RentPayment[];
  scannerDetails: ScannerDetails | null;
  isLoading: boolean;
  error: string | null;
  qrCodeUrl: string | null;
  qrCodeExpiry: string | null;
  showTransactions: boolean;
  transactions: any[];
}

const initialState: RentState = {
  customerId: null,
  customer_name: null,
  mobile_no: null,
  payments: [],
  scannerDetails: null,
  isLoading: false,
  error: null,
  qrCodeUrl: null,
  qrCodeExpiry: null,
  showTransactions: false,
  transactions: [],
};

export const fetchRentPayments = createAsyncThunk(
  'rent/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const result = await authenticatedGet(API_ENDPOINTS.rentPayments);
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch rent payments');
      }
      
      return result.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const generateQRCode = createAsyncThunk(
  'rent/generateQR',
  async (month: string) => {
    const response = await fetch('/api/rent-payments/qr-code', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ month }),
    });
    return response.json();
  }
);

export const submitPaymentScreenshot = createAsyncThunk(
  'rent/submitScreenshot',
  async (paymentData: PaymentSubmission, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('amount', paymentData.amount.toString());
      formData.append('payment_mode', paymentData.payment_mode);
      formData.append('month', paymentData.month.toString());
      formData.append('year', paymentData.year.toString());
      formData.append('bank_account', paymentData.bank_account);
      
      // Only append payment_proof if it exists (not required for cash)
      if (paymentData.payment_proof) {
        formData.append('payment_proof', paymentData.payment_proof);
      }

      const result = await authenticatedFormData(API_ENDPOINTS.submitPayment, formData);
      return result;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const rentSlice = createSlice({
  name: 'rent',
  initialState,
  reducers: {
    clearQRCode: (state) => {
      state.qrCodeUrl = null;
      state.qrCodeExpiry = null;
    },
    toggleTransactionsModal: (state, action) => {
      state.showTransactions = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRentPayments.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchRentPayments.fulfilled, (state, action) => {
        state.customerId = action.payload.customerId;
        state.customer_name = action.payload.customer_name;
        state.mobile_no = action.payload.mobile_no;
        state.payments = action.payload.rentList || [];
        state.scannerDetails = action.payload.scannerDetails;
        state.isLoading = false;
      })
      .addCase(fetchRentPayments.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch rent payments';
      })
      .addCase(generateQRCode.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(generateQRCode.fulfilled, (state, action) => {
        state.qrCodeUrl = action.payload.qrCodeUrl;
        state.qrCodeExpiry = action.payload.expiryTime;
        state.isLoading = false;
      })
      .addCase(generateQRCode.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to generate QR code';
      })
      .addCase(submitPaymentScreenshot.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(submitPaymentScreenshot.fulfilled, (state, action) => {
        const updatedPayment = state.payments.find(p => p.month === action.payload.month);
        if (updatedPayment) {
          updatedPayment.status = 'Pending';
        }
        state.isLoading = false;
      })
      .addCase(submitPaymentScreenshot.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to submit payment screenshot';
      });
  },
});

export const { clearQRCode, toggleTransactionsModal } = rentSlice.actions;
export default rentSlice.reducer;
