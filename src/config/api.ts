// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8020';

export const API_ENDPOINTS = {
  // Auth endpoints
  validateBranchToken: '/api/auth/validate-branch',
  verifySignupToken: '/api/auth/verify/customer/signup', // Token validation for signup
  register: '/api/auth/customer/sign-up',
  login: '/api/auth/customer/sign-in',
  profile: '/api/auth/profile',
  changePassword: '/api/auth/change-password',
  customerProfile: '/api/customer/me',
  updateCustomerProfile: '/api/customer/me', // PUT - Update customer profile
  
  // Branch details with token
  getBranchDetails: '/get-branch-details',
  
  // Daily updates
  dailyUpdates: '/api/dailyupdate/customer',
  markUpdateRead: '/api/daily-updates',
  
  // Meals
  mealByDate: '/api/meal', // Base endpoint, append /{date} in DD-MM-YYYY format
  mealConfig: '/api/mealconfig',
  cancelMeal: '/api/meal',
  updateMealSelection: '/api/meals/selection',
  
  // Complaints
  complaints: '/api/complaint',
  getComplaints: '/api/complaint/customer',
  
  // Rent payments
  rentPayments: '/api/customer/me/rent-list',
  generateQrCode: '/api/rent-payments/qr-code',
  submitPayment: '/api/transaction/me/customer-rent',
  
  // Dashboard
  dashboardStats: '/api/customer/dashboard/me',
};

export default {
  BASE_URL: API_BASE_URL,
  ENDPOINTS: API_ENDPOINTS,
};

