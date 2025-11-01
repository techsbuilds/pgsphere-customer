import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { toggleSidebar } from '../../store/slices/uiSlice';
import Sidebar from './Sidebar';
import Notification from '../common/Notification';
import { Menu } from 'lucide-react';
import { useInstallBanner } from '../../hooks/useInstallBanner';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const dispatch = useDispatch();
  const { sidebarOpen } = useSelector((state: RootState) => state.ui);
  const showInstallBanner = useInstallBanner();

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col min-w-0">
        {/* PWA Install Banner Spacer - Only when banner is visible */}
        {showInstallBanner && <div className="h-16 bg-transparent"></div>}
        
        {/* Mobile header */}
        <div className="lg:hidden bg-white shadow-sm p-4 flex items-center">
          <button
            onClick={() => dispatch(toggleSidebar())}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors mr-4"
          >
            <Menu size={24} />
          </button>
          <h1 className="text-lg font-semibold text-gray-800">Pgsphere</h1>
        </div>

        {/* Main content */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>

      <Notification />
    </div>
  );
};

export default Layout;