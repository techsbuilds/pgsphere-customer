import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { registerCustomer, setRegistrationToken, verifySignupToken, fetchBranchDetails } from '../../store/slices/authSlice';
import { showNotification } from '../../store/slices/uiSlice';
import { RootState } from '../../store';
import { AppDispatch } from '../../store';
import commonConfig from '../../config/common.json';
import Notification from '../common/Notification';

const RegistrationForm: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { branchInfo, branchDetails, availableRooms, isLoading, tokenVerified } = useSelector((state: RootState) => state.auth);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    selectedRoom: '',
  });
  const [aadhaarCard, setAadhaarCard] = useState<File | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const branchToken = searchParams.get('token');
  const [tokenError, setTokenError] = useState(false);
  const [verificationComplete, setVerificationComplete] = useState(false);

  useEffect(() => {
    const verifyAndFetchData = async () => {
      if (branchToken) {
        dispatch(setRegistrationToken(branchToken));
        
        try {
          // Single API call: Verify token AND get branch details
          await dispatch(verifySignupToken(branchToken)).unwrap();
          
          setVerificationComplete(true);
        } catch (error) {
          setTokenError(true);
        }
      } else {
        setTokenError(true);
      }
    };

    verifyAndFetchData();
  }, [branchToken, dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      dispatch(showNotification({ message: 'Passwords do not match', type: 'error' }));
      return;
    }

    if (!branchToken || !branchDetails) {
      dispatch(showNotification({ message: 'Invalid registration link', type: 'error' }));
      return;
    }

    if (!aadhaarCard) {
      dispatch(showNotification({ message: 'Please upload Aadhaar card', type: 'error' }));
      return;
    }

    if (!formData.selectedRoom) {
      dispatch(showNotification({ message: 'Please select a room', type: 'error' }));
      return;
    }

    try {
      const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
      
      const response = await dispatch(registerCustomer({
        customer_name: formData.fullName,
        email: formData.email,
        password: formData.password,
        mobile_no: formData.phone,
        room: formData.selectedRoom, // Room ID
        branch: branchDetails.branch._id, // Branch ID
        pgcode: branchDetails.pgcode,
        joining_date: today,
        added_by: branchDetails.added_by, // Added by ID
        added_by_type: branchDetails.added_by_type,
        aadharcard: aadhaarCard,
      })).unwrap();
      
      // Show success message
      dispatch(showNotification({ 
        message: response.message || 'Registration successful! Please login to continue.', 
        type: 'success' 
      }));
      
      // Redirect to login page after 2 seconds
      setTimeout(() => {
        navigate('/login', { 
          replace: true,
          state: { 
            registrationSuccess: true,
            email: formData.email 
          }
        });
      }, 2000);
      
    } catch (error: any) {
      dispatch(showNotification({ 
        message: error || 'Registration failed. Please try again.', 
        type: 'error' 
      }));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Show error if no token or invalid token
  if (!branchToken || tokenError) {
    return (
      <>
        <Notification />
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full">
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Invalid Registration Link
              </h2>
              <p className="text-gray-600 mb-6">
                You need a valid registration link with a token to access this page. Please contact your PG admin to get a valid registration link.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> Registration links are provided by your PG administrator and contain a unique token for security purposes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Show loading state while fetching branch details
  if (isLoading && !branchDetails) {
    return (
      <>
        <Notification />
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full">
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Loading Registration Form
              </h2>
              <p className="text-gray-600">
                Please wait while we fetch your branch details...
              </p>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Notification />
      <div className="h-screen flex flex-col lg:flex-row overflow-hidden">
        {/* Left Column - Registration Form */}
        <div className="w-full lg:w-1/2 bg-white overflow-y-auto p-6 sm:p-8 lg:p-12">
          <div className="w-full max-w-md mx-auto py-8">
            {/* App Logo */}
            <div className="flex items-center justify-center mb-6">
              <img alt="PGSPHERE Logo" className="w-24 h-24 sm:w-28 sm:h-28" src="/icons/pgapplogo.svg" />
            </div>

            {/* Branch Information */}
            {branchInfo && (
              <div className="rounded-lg p-5 mb-6 border border-gray-200">
                <div className="flex items-center space-x-4">
                  {branchInfo.logoUrl ? (
                    <img 
                      src={branchInfo.logoUrl} 
                      alt={branchInfo.name}
                      className="w-14 h-14 rounded-lg object-cover border-2 border-white shadow-md"
                    />
                  ) : (
                    <div className="w-14 h-14 bg-white rounded-lg flex items-center justify-center shadow-md">
                      <span className="text-[#2e3d7c] font-bold text-xl">PG</span>
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="text-base font-semibold text-gray-900">Branch: {branchInfo.name}</h3>
                    <p className="text-xs text-gray-500 mt-1">Branch Address: {branchInfo.address}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Welcome Message */}
            <div className="mb-6 text-center">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                Create Your Account
              </h2>
              <p className="text-sm text-gray-600 mt-2">
                Join {branchInfo?.name || 'our PG community'}
              </p>
            </div>
        
            {/* Registration Form */}
            <form className="space-y-5" onSubmit={handleSubmit}>
              {/* Full Name */}
              <div>
                <label htmlFor="fullName" className="block text-sm font-semibold text-gray-900 mb-2">
                  {commonConfig.forms.registration.fields.fullName} *
                </label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#40529a] focus:border-transparent text-gray-900 placeholder-gray-400"
                />
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-900 mb-2">
                  {commonConfig.forms.registration.fields.email} *
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#40529a] focus:border-transparent text-gray-900 placeholder-gray-400"
                />
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="phone" className="block text-sm font-semibold text-gray-900 mb-2">
                  {commonConfig.forms.registration.fields.phone} *
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91-9876543210"
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#40529a] focus:border-transparent text-gray-900 placeholder-gray-400"
                />
              </div>

              {/* Room Selection Section */}
              <div className="border-t border-gray-200 pt-5">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Room Selection</h3>
                
                <div>
                  <label htmlFor="selectedRoom" className="block text-sm font-semibold text-gray-900 mb-2">
                    Select Room *
                  </label>
                  <select
                    id="selectedRoom"
                    name="selectedRoom"
                    required
                    value={formData.selectedRoom}
                    onChange={handleChange}
                    disabled={!availableRooms.length}
                    className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#40529a] focus:border-transparent text-gray-900 bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">
                      {availableRooms.length ? 'Select a room' : 'Loading rooms...'}
                    </option>
                    {availableRooms.map((room) => (
                      <option key={room._id} value={room._id}>
                        Room {room.room_id} - {room.room_type} ({room.service_type}) - {room.filled}/{room.capacity} occupied
                      </option>
                    ))}
                  </select>
                  {availableRooms.length === 0 && branchDetails && (
                    <p className="mt-2 text-sm text-amber-600">
                      No rooms available at this time
                    </p>
                  )}
                </div>
              </div>

              {/* Aadhaar Card Upload */}
              <div className="border-t border-gray-200 pt-5">
                <label htmlFor="aadhaarCard" className="block text-sm font-semibold text-gray-900 mb-2">
                  Aadhaar Card Upload *
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-[#40529a] transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setAadhaarCard(e.target.files?.[0] || null)}
                    className="hidden"
                    id="aadhaar-upload"
                  />
                  
                  {aadhaarCard ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <span className="text-sm text-green-600 font-medium">
                          {aadhaarCard.name}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setAadhaarCard(null)}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <label
                      htmlFor="aadhaar-upload"
                      className="cursor-pointer flex flex-col items-center space-y-2"
                    >
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                      </svg>
                      <span className="text-sm text-gray-600">
                        Click to upload Aadhaar card
                      </span>
                    </label>
                  )}
                </div>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-900 mb-2">
                  Password *
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={handleChange}
                    className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#40529a] focus:border-transparent text-gray-900 placeholder-gray-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-900 mb-2">
                  Confirm Password *
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#40529a] focus:border-transparent text-gray-900 placeholder-gray-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? (
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Register Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-[#2e3d7c] hover:bg-[#27346b] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : 'Register'}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column - Marketing Content */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#6b79b6] via-[#40529a] to-[#27346b] items-center justify-center p-12 relative overflow-hidden">
          <div className="max-w-lg w-full space-y-8 text-center z-10">
            {/* Illustration */}
            <div className="flex justify-center mb-8">
              <div className="relative">
                <img 
                  src="/icons/login-page-mobile.png" 
                  alt="Modern Living Illustration" 
                  className="w-full h-auto max-w-md"
                />
              </div>
            </div>

            {/* Headline */}
            <div className="pb-4">
              <h1 className="text-2xl sm:text-3xl font-bold text-white text-start mb-2">
              Stay Connected, Stay Comfortable.
              </h1>
              <p className="text-sm lg:text-base text-white leading-relaxed text-start">
              Your PG journey - simplified and always within reach.
              </p>
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        </div>
      </div>
    </>
  );
};

export default RegistrationForm;