import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { logout } from '../store/slices/authSlice';

export const useAuth = () => {
  const dispatch = useDispatch();
  const { user, token, isLoading, error, isInitialized } = useSelector((state: RootState) => state.auth);

  // User is authenticated if they have a valid token
  const isAuthenticated = !!token && !!user;
  
  // Check if user is approved (if status field exists, otherwise assume approved if authenticated)
  const isApproved = user?.status ? user.status === 'approved' : isAuthenticated;

  const handleLogout = () => {
    dispatch(logout());
  };

  return {
    user,
    token,
    isLoading,
    error,
    isAuthenticated,
    isApproved,
    isInitialized,
    logout: handleLogout,
  };
};