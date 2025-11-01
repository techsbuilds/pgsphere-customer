import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { fetchCustomerProfile, updateProfile } from '../store/slices/authSlice';
import { showNotification } from '../store/slices/uiSlice';
import { User, Edit3, Save, X, Phone, Mail, Shield, UserCheck, Building2, IndianRupee, Calendar, Bed } from 'lucide-react';
import { ProfileSectionSkeleton, ProfileCardSkeleton } from '../components/common/Skeletons';

const Profile: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, branchInfo, customerProfile, isLoading: authLoading, pgLogo, pgName } = useSelector((state: RootState) => state.auth);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.fullName || '',
    email: user?.email || '',
    mobile: user?.phone || '',
  });

  // Fetch customer profile on mount
  useEffect(() => {
    dispatch(fetchCustomerProfile());
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.fullName || '',
        email: user.email || '',
        mobile: user.phone || '',
      });
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    if (!formData.name || !formData.email || !formData.mobile) {
      dispatch(showNotification({
        message: 'Please fill in all required fields',
        type: 'error'
      }));
      return;
    }

    setIsLoading(true);
    try {
      await dispatch(updateProfile(formData)).unwrap();
      
      dispatch(showNotification({
        message: 'Profile updated successfully!',
        type: 'success'
      }));
      
      // Refresh profile data
      await dispatch(fetchCustomerProfile()).unwrap();
      
      setIsEditing(false);
    } catch (error) {
      dispatch(showNotification({
        message: 'Failed to update profile. Please try again.',
        type: 'error'
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        name: user.fullName || '',
        email: user.email || '',
        mobile: user.phone || '',
      });
    }
    setIsEditing(false);
  };


  if (authLoading || !user) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="mb-6">
          <div className="flex items-center space-x-3">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Profile Settings
              </h1>
              <p className="text-gray-600 mt-1">
                Loading your profile information...
              </p>
            </div>
          </div>
        </div>

        {/* Profile Section Skeleton */}
        <ProfileSectionSkeleton />

        {/* Cards Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ProfileCardSkeleton />
          <ProfileCardSkeleton />
          <ProfileCardSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        {/* Desktop Layout */}
        <div className="hidden md:flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Profile Settings
              </h1>
              <p className="text-gray-600 mt-1">
                View and manage your personal information
              </p>
            </div>
          </div>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Edit3 size={20} />
              <span>Edit Profile</span>
            </button>
          ) : (
            <div className="flex space-x-2">
              <button
                onClick={handleCancel}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <X size={20} />
                <span>Cancel</span>
              </button>
              <button
                onClick={handleSave}
                disabled={isLoading}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <Save size={20} />
                )}
                <span>{isLoading ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden">
          <div className="flex items-center space-x-3 mb-3">
            <h1 className="text-xl font-bold text-gray-900">
              Profile Settings
            </h1>
          </div>
          <p className="text-gray-600 mb-4">
            View and manage your personal information
          </p>
          
          {/* Action Buttons - Mobile */}
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Edit3 size={20} />
              <span>Edit Profile</span>
            </button>
          ) : (
            <div className="flex space-x-2">
              <button
                onClick={handleCancel}
                className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <X size={20} />
                <span>Cancel</span>
              </button>
              <button
                onClick={handleSave}
                disabled={isLoading}
                className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <Save size={20} />
                )}
                <span>{isLoading ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Personal Information Form - Top Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
          <User size={20} className="mr-2 text-blue-500" />
              Personal Information
            </h3>
            
            <div className="space-y-6">
          {/* Editable Fields - Only Name, Email, Mobile */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    <User size={16} className="inline mr-1" />
                Full Name *
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  ) : (
                    <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md">
                  {user.fullName || 'Not provided'}
                    </div>
                  )}
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    <Mail size={16} className="inline mr-1" />
                Email *
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  ) : (
                    <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md">
                  {user.email || 'Not provided'}
                    </div>
                  )}
              </div>

                <div>
              <label htmlFor="mobile" className="block text-sm font-medium text-gray-700 mb-2">
                    <Phone size={16} className="inline mr-1" />
                Mobile Number *
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                  id="mobile"
                  name="mobile"
                  value={formData.mobile}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  ) : (
                    <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md">
                  {user.phone || 'Not provided'}
                    </div>
                  )}
            </div>
          </div>
        </div>
                </div>

      {/* Profile Information Cards */}
      <div className="space-y-6">
        {/* Top Row - Branch Info, Room Details, Financial Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Branch Information */}
            {branchInfo && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center">
                  <Building2 size={18} className="mr-2 text-blue-500" />
                  PG Information
                </h3>
                <div className="text-center">
                  {pgLogo && pgLogo.length > 0 ? (
                    <img 
                      src={pgLogo} 
                      alt={pgName || ''}
                      className="w-16 h-16 mx-auto mb-3 rounded-lg object-cover border-2 border-gray-100"
                    />
                  ) : (
                    <div className="w-16 h-16 mx-auto mb-3 bg-blue-600 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-xl">PG</span>
                    </div>
                  )}
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{pgName || 'PG'}</h3>
                  <h4 className="text-sm font-semibold text-gray-900 ">Branch: {branchInfo.name}</h4>
                  <p className="text-xs text-gray-600 mt-1 ">Branch Address: {branchInfo.address}</p>
                </div>
              </div>
            )}

            {/* Room Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center">
                <Bed size={18} className="mr-2 text-blue-500" />
                Room Details
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">Floor:</span>
                  <span className="text-xs font-medium text-gray-900">{user.floorNumber || 'N/A'}</span>
                    </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">Room:</span>
                  <span className="text-xs font-medium text-gray-900">{user.roomNumber || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">Type:</span>
                  <span className="text-xs font-medium text-gray-900">{user.roomType || 'N/A'}</span>
              </div>
                {customerProfile && (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600">Service:</span>
                      <span className="text-xs font-medium text-gray-900">{customerProfile.room.service_type}</span>
                  </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600">Capacity:</span>
                      <span className="text-xs font-medium text-gray-900">{customerProfile.room.capacity} persons</span>
              </div>
                    {customerProfile.room.remark && (
                      <div className="pt-2 border-t border-gray-100 mt-2 ">
                        <span className="text-xs text-black italic rounded-full px-2 py-1 bg-blue-100">{customerProfile.room.remark}</span>
                      </div>
                    )}
                  </>
                )}
              </div>
                  </div>

            {/* Rent & Deposit Information */}
            {customerProfile && (customerProfile.rent_amount || customerProfile.deposite_amount) ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center">
                  <IndianRupee size={18} className="mr-2 text-blue-500" />
                  Rent & Deposit Details
                </h3>
                <div className="space-y-3">
                  {customerProfile.rent_amount && (
                    <div className="p-3 bg-green-50 rounded-lg">
                      <p className="text-xs text-gray-600 mb-1">Monthly Rent</p>
                      <p className="text-lg font-bold text-green-700">₹{customerProfile.rent_amount.toLocaleString()}</p>
                      </div>
                    )}
                  {customerProfile.deposite_amount && (
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-xs text-gray-600 mb-1">Security Deposit</p>
                      <p className="text-lg font-bold text-blue-700">₹{customerProfile.deposite_amount.toLocaleString()}</p>
                      </div>
                    )}
                </div>
              </div>
            ) : (
              /* Identity Document as fallback */
              user.aadhaarCardUrl && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center">
                    <UserCheck size={18} className="mr-2 text-orange-500" />
                    Identity Document
                  </h3>
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-3 bg-orange-100 rounded-lg flex items-center justify-center">
                      <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-gray-900 mb-2">Aadhaar Card</p>
                    <a 
                      href={user.aadhaarCardUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-block px-3 py-1 text-xs text-blue-600 hover:text-blue-700 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
                    >
                      View Document
                    </a>
            </div>
          </div>
              )
            )}
        </div>
      </div>

      {/* Account Status Information */}
      {user.status && user.status !== 'approved' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-full mr-3">
              <Calendar size={20} className="text-yellow-600" />
            </div>
            <div>
              <h3 className="font-medium text-yellow-800">Account Status: {user.status}</h3>
              <p className="text-sm text-yellow-600 mt-1">
                {user.status === 'pending' 
                  ? 'Your account is currently under review. You will receive full access once approved by the admin.'
                  : 'Your account registration was not approved. Please contact the admin for more information.'
                }
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
