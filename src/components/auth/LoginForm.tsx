import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loginCustomer } from '../../store/slices/authSlice';
import { showNotification } from '../../store/slices/uiSlice';
import { AppDispatch } from '../../store';
import commonConfig from '../../config/common.json';
import Notification from '../common/Notification';

const LoginForm: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const location = useLocation();
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  // Check if redirected from registration success
  useEffect(() => {
    const state = location.state as { registrationSuccess?: boolean; email?: string };
    if (state?.registrationSuccess) {
      dispatch(showNotification({ 
        message: '🎉 Registration successful! Please login to continue.', 
        type: 'success' 
      }));
      
      // Pre-fill email if available
      if (state.email) {
        setCredentials(prev => ({ ...prev, email: state.email }));
      }
      
      // Clear the state
      window.history.replaceState({}, document.title);
    }
  }, [location, dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await dispatch(loginCustomer(credentials)).unwrap();
      dispatch(showNotification({ 
        message: commonConfig.messages.loginSuccess, 
        type: 'success' 
      }));
    } catch (error: any) {
      console.log('🔍 Login Error:', error);
      console.log('🔍 Error Type:', typeof error);
      console.log('🔍 Error String:', String(error));
      
      // Check if account is not verified by admin
      const errorMessage = String(error).toLowerCase();
      
      if (errorMessage.includes('not verified') || errorMessage.includes('pending') || errorMessage.includes('approval')) {
        console.log('⚠️ Showing warning notification');
        dispatch(showNotification({ 
          message: '⏳ ' + commonConfig.messages.accountNotVerified, 
          type: 'warning' 
        }));
      } else {
        console.log('❌ Showing error notification');
        dispatch(showNotification({ 
          message: error || commonConfig.messages.loginError, 
          type: 'error' 
        }));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <>
      <Notification />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {commonConfig.messages.welcome}
          </p>
        </div>

        {/* Registration Success Message */}
        {location.state?.registrationSuccess && (
          <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">
                  Registration successful! Please login with your credentials.
                </p>
              </div>
            </div>
          </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={credentials.email}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={credentials.password}
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
                  Signing in...
                </span>
              ) : 'Sign In'}
            </button>
          </div>
        </form>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">
              Contact your PG admin for registration
            </Link>
          </p>
        </div>
        </div>
      </div>
    </>
  );
};

export default LoginForm;