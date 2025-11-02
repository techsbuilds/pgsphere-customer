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
        setCredentials(prev => ({ ...prev, email: state.email || '' }));
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

  const [showPassword, setShowPassword] = useState(false);

  return (
    <>
      <Notification />
      <div className="min-h-screen flex flex-col lg:flex-row">
        {/* Left Column - Login Form */}
        <div className="w-full lg:w-1/2 bg-white flex items-center justify-center min-h-screen lg:min-h-0 p-6 sm:p-8 lg:p-12">
          <div className="w-full max-w-md">
            {/* Logo */}
            <div className="flex items-center justify-center">
              {/* <img 
                src="/icons/pgapplogo.svg" 
                alt="PGSPHERE Logo" 
                className="h-20 w-auto"
              /> */}
              <img alt="logo" className="w-24 h-24 sm:w-32 sm:h-32 lg:w-36 lg:h-36" src="/icons/pgapplogo.svg" />
            </div>

            {/* Welcome Message */}
            <div className="mb-3 p-3 text-center ">
              <h2 className="text-sm sm:text-sm font-semibold text-gray-500">
                Welcome to Pgsphere! Please login to your account.
              </h2>
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

            {/* Login Form */}
            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-900 mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={credentials.email}
                  onChange={handleChange}
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#40529a] focus:border-transparent text-gray-900 placeholder-gray-400"
                />
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-900 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={credentials.password}
                    placeholder='Enter your password'
                    onChange={handleChange}
                    className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#40529a] focus:border-transparent text-gray-900"
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

              {/* Login Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-[#2e3d7c] hover:bg-[#27346b] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed "
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </span>
                ) : 'Log in'}
              </button>
            </form>

            {/* Sign Up Link */}
            <div className="text-center mt-2">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <Link to="/register" className="font-medium text-[#2e3d7c] hover:text-[#40529a]">
                  Contact your PG admin for registration
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Right Column - Marketing Content */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#6b79b6] via-[#40529a] to-[#27346b] items-center justify-center p-12 relative overflow-hidden">
          <div className="max-w-lg w-full space-y-6 lg:space-y-8 text-center z-10">
            {/* Illustration */}
            <div className="flex justify-center mb-4 lg:mb-8">
              <div className="relative">
                <img 
                  src="/icons/login-page-mobile.png" 
                  alt="Modern Living Illustration" 
                  className="w-full h-auto max-w-xs sm:max-w-sm lg:max-w-md"
                />
              </div>
            </div>

            {/* Headline */}
            <div className="pb-4">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white text-start mb-2">
              Stay Connected, Stay Comfortable.
              </h1>
              <p className="text-sm lg:text-base text-white leading-relaxed text-start">
              Your PG journey - simplified and always within reach.
              </p>
            </div>

            
          </div>

          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-32 h-32 lg:w-64 lg:h-64 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 lg:w-64 lg:h-64 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        </div>
      </div>
    </>
  );
};

export default LoginForm;