import React from 'react';
import { NavLink } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { toggleSidebar } from '../../store/slices/uiSlice';
import { logoutCustomer } from '../../store/slices/authSlice';
import { 
  Home, 
  Bell, 
  Utensils, 
  MessageSquare, 
  User, 
  LogOut,
  X,
  Coins
} from 'lucide-react';
import commonConfig from '../../config/common.json';
import { SidebarSkeleton } from '../common/Skeletons';

const Sidebar: React.FC = () => {
  const dispatch = useDispatch();
  const { sidebarOpen } = useSelector((state: RootState) => state.ui);
  const { user, isLoading } = useSelector((state: RootState) => state.auth);

  const navItems = [
    { path: '/dashboard', icon: Home, label: commonConfig.navigation.dashboard },
    { path: '/daily-updates', icon: Bell, label: commonConfig.navigation.dailyUpdate },
    { path: '/meal-menu', icon: Utensils, label: commonConfig.navigation.mealMenu },
    { path: '/complaints', icon: MessageSquare, label: commonConfig.navigation.complaints },
    { path: '/rent', icon: Coins , label: commonConfig.navigation.rent },
    { path: '/profile', icon: User, label: commonConfig.navigation.profile },
  ];

  const handleLogout = async () => {
    try {
      await dispatch(logoutCustomer()).unwrap();
      // Redirect to login page after successful logout
      window.location.href = '/login';
    } catch (error) {
      // Even if API fails, redirect to login (state already cleared)
      window.location.href = '/login';
    }
  };

  // Close sidebar when navigating (especially for mobile)
  const handleNavigation = () => {
    if (sidebarOpen) {
      dispatch(toggleSidebar());
    }
  };

  // Show skeleton only on initial load when user data is not available yet
  if (isLoading && !user) {
    return <SidebarSkeleton />;
  }

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => dispatch(toggleSidebar())}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:shadow-none ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } w-64`}>
        
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">

                <img 
                  src="/icons/pgapplogo.svg" 
                  alt="Pgsphere"
                  className="w-10 h-12 rounded-lg object-cover"
                />
              
              <h1 className="text-lg font-bold text-[#202947]">
                 Pgsphere
              </h1>
            </div>
            <button
              onClick={() => dispatch(toggleSidebar())}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          {user && (
            <div className="mt-3">
              <p className="text-sm font-medium text-gray-700">{user.fullName}</p>
              <p className="text-xs text-gray-500">{user.email}</p>
              
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="px-4 py-6 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={handleNavigation}
              className={({ isActive }) =>
                `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'bg-[#e1e5f3] text-[#2e3d7c] border-r-2 border-[#40529a]'
                    : 'text-[#202947] hover:bg-[#f3f5fa] hover:text-[#27346b]'
                }`
              }
            >
              <item.icon size={20} className="mr-3" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut size={20} className="mr-3" />
            Logout
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;