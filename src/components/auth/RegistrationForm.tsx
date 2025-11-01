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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
        {/* Branch Information */}
        {branchInfo && (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            {branchInfo.logoUrl ? (
              <img 
                src={branchInfo.logoUrl} 
                alt={branchInfo.name}
                className="w-16 h-16 mx-auto mb-3 rounded-lg object-cover"
              />
            ) : (
              <div className="w-16 h-16 mx-auto mb-3 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">PG</span>
              </div>
            )}
            <h3 className="text-lg font-semibold text-gray-900">{branchInfo.name}</h3>
            <p className="text-sm text-gray-600 mt-1">{branchInfo.address}</p>
          </div>
        )}

        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {commonConfig.forms.registration.title}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Welcome to {branchInfo?.name || commonConfig.companyName}
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                {commonConfig.forms.registration.fields.fullName} *
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                required
                value={formData.fullName}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                {commonConfig.forms.registration.fields.email} *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
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
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Room Selection Section */}
            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Room Selection</h3>
              
              <div>
                <label htmlFor="selectedRoom" className="block text-sm font-medium text-gray-700">
                  Select Room *
                </label>
                <div className="relative">
                  <select
                    id="selectedRoom"
                    name="selectedRoom"
                    required
                    value={formData.selectedRoom}
                    onChange={handleChange}
                    disabled={!availableRooms.length}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                    style={{ 
                      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                      backgroundPosition: 'right 0.5rem center',
                      backgroundRepeat: 'no-repeat',
                      backgroundSize: '1.5em 1.5em'
                    }}
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
                </div>
                {availableRooms.length === 0 && branchDetails && (
                  <p className="mt-1 text-sm text-amber-600">
                    No rooms available at this time
                  </p>
                )}
              </div>
            </div>

            {/* Aadhaar Card Upload */}
            <div className="border-t border-gray-200 pt-4">
              <label htmlFor="aadhaarCard" className="block text-sm font-medium text-gray-700 mb-2">
                Aadhaar Card Upload *
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
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

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password *
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm Password *
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
          </div>
        </form>
        </div>
      </div>
    </>
  );
};

export default RegistrationForm;