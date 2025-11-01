import React, { useEffect } from 'react';
import { Provider, useDispatch } from 'react-redux';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { store, AppDispatch } from './store';
import { useAuth } from './hooks/useAuth';
import { restoreSession, fetchCustomerProfile } from './store/slices/authSlice';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import LoginForm from './components/auth/LoginForm';
import RegistrationForm from './components/auth/RegistrationForm';
import Dashboard from './pages/Dashboard';
import DailyUpdates from './pages/DailyUpdates';
import MealMenu from './pages/MealMenu';
import Complaints from './pages/Complaints';
import Rent from './pages/Rent';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';
import InstallPWA from './components/common/InstallPWA';
import ErrorBoundary from './components/common/ErrorBoundary';

// Component to handle root path with token
const RootRedirect: React.FC = () => {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  
  // Check if there's a token in the URL
  const searchParams = new URLSearchParams(location.search);
  const token = searchParams.get('token');
  
  if (token) {
    // If token exists, redirect to register page with token
    return <Navigate to={`/register?token=${token}`} replace />;
  }
  
  // If authenticated, go to dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  // Otherwise, go to login
  return <Navigate to="/login" replace />;
};

const AppContent: React.FC = () => {
  const { isAuthenticated, isInitialized } = useAuth();
  const dispatch = useDispatch<AppDispatch>();

  // Restore session from localStorage on app load
  useEffect(() => {
    dispatch(restoreSession());
  }, [dispatch]);

  // Fetch customer profile when user is authenticated
  useEffect(() => {
    if (isAuthenticated && isInitialized) {
      dispatch(fetchCustomerProfile());
    }
  }, [dispatch, isAuthenticated, isInitialized]);

  // Show loading state while initializing
  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route 
          path="/login" 
          element={
            !isAuthenticated ? <LoginForm /> : <Navigate to="/dashboard" replace />
          } 
        />
        <Route 
          path="/register" 
          element={
            !isAuthenticated ? <RegistrationForm /> : <Navigate to="/dashboard" replace />
          } 
        />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/daily-updates"
          element={
            <ProtectedRoute>
              <Layout>
                <DailyUpdates />
              </Layout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/meal-menu"
          element={
            <ProtectedRoute>
              <Layout>
                <MealMenu />
              </Layout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/complaints"
          element={
            <ProtectedRoute>
              <Layout>
                <Complaints />
              </Layout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/rent"
          element={
            <ProtectedRoute>
              <Layout>
                <Rent />
              </Layout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Layout>
                <Profile />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Root path with smart redirect based on token */}
        <Route path="/" element={<RootRedirect />} />
        
        {/* 404 Not Found - for authenticated users */}
        {isAuthenticated && (
          <Route path="*" element={<NotFound />} />
        )}
        
        {/* Catch all route for unauthenticated users */}
        {!isAuthenticated && (
          <Route path="*" element={<Navigate to="/login" replace />} />
        )}
      </Routes>
    </Router>
  );
};

function App() {
  // Check if PWA is enabled via environment variable
  const isPWAEnabled = import.meta.env.VITE_ENABLE_PWA === 'true';
  
 
  
  return (
    <ErrorBoundary>
      <Provider store={store}>
        <div className="min-h-screen bg-gray-50">
          {isPWAEnabled && <InstallPWA />}
          <AppContent />
        </div>
      </Provider>
    </ErrorBoundary>
  );
}

export default App;