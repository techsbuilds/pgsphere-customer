import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useDispatch } from 'react-redux';
import { setSidebarOpen } from '../../store/slices/uiSlice';
import { AppDispatch } from '../../store';
import { Download, X, Share, Plus } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

const InstallPWA: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone ||
      document.referrer.includes('android-app://');
    
    setIsStandalone(isStandaloneMode);

    // Check if iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(isIOSDevice);


    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowInstallPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Show install prompt for iOS or if not dismissed
    const isDismissed = localStorage.getItem('pwa-install-dismissed');
    
    if (!isStandaloneMode && !isDismissed) {
      if (isIOSDevice) {
        setShowInstallPrompt(true);
        // Close sidebar on mobile devices when install dialog shows
        dispatch(setSidebarOpen(false));
      } else {
        // For other browsers, show after a delay to check for beforeinstallprompt
        setTimeout(() => {
          setShowInstallPrompt(true);
          // Close sidebar on mobile devices when install dialog shows
          const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
                          window.innerWidth < 1024;
          if (isMobile) {
            dispatch(setSidebarOpen(false));
          }
        }, 2000); // Show after 2 seconds
      }
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [dispatch]);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      // Android/Chrome/Edge
      try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        
        if (outcome === 'accepted') {
          setDeferredPrompt(null);
          setShowInstallPrompt(false);
        }
      } catch (error) {
        // Handle install error silently
      }
    } else if (isIOS) {
      // iOS Safari - Show instructions modal
      // Modal is already visible, no action needed
    } else {
      // Fallback - show generic instructions
      alert('To install this app:\n\n1. Open browser menu\n2. Look for "Install app" or "Add to Home Screen"\n3. Follow the prompts');
    }
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    // Remember user dismissed (optional - could use localStorage)
    localStorage.setItem('pwa-install-dismissed', 'true');
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent('pwa-banner-dismissed'));
  };

  // Don't show if already installed
  if (isStandalone) {
    return null;
  }

  // Show if not dismissed and not installed
  const shouldShow = showInstallPrompt;

  if (!shouldShow) {
    return null;
  }

  return (
    <>
      {/* Floating Install Button */}
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={handleInstallClick}
          className="flex items-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all hover:scale-105"
        >
          <Download size={20} />
          <span className="font-medium">Install App</span>
        </button>
      </div>

      {/* Install Banner - Fixed positioning to avoid sidebar overlap */}
      <div className="fixed top-0 left-0 right-0 bg-blue-600 text-white p-3 z-40 shadow-lg">
        <div className="flex items-center justify-between max-w-7xl mx-auto px-4 lg:ml-64 lg:px-0">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center p-1">
              <img 
                src="/icons/pgapplogo.svg" 
                alt="Pgsphere Logo" 
                className="w-full h-full object-contain"
                style={{ maxWidth: '100%', maxHeight: '100%' }}
              />
            </div>
            <div>
              <p className="text-sm font-medium">Install Pgsphere App</p>
              <p className="text-xs opacity-90">Get quick access to your PG services</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={handleInstallClick}
              className="flex items-center space-x-1 px-3 py-1 bg-white text-blue-600 rounded-md text-sm font-medium hover:bg-gray-100 transition-colors"
            >
              <Download size={16} />
              <span>Install</span>
            </button>
            <button
              onClick={handleDismiss}
              className="p-1 hover:bg-blue-700 rounded-md transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* iOS Install Instructions Modal */}
      {isIOS && showInstallPrompt && (
        <>
          {createPortal(
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[100]">
              <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center mx-auto mb-4 p-1 shadow-sm border">
                    <div className="w-full h-full relative">
                      <img 
                        src="/icons/pgapplogo.svg" 
                        alt="Pgsphere Logo" 
                        className="w-full h-full object-contain"
                        style={{ maxWidth: '100%', maxHeight: '100%' }}
                      />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Install Pgsphere App
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Add Pgsphere to your home screen for quick access
                  </p>
                  
                  <div className="space-y-4 text-left">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-bold text-sm">1</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-700">Tap the</span>
                        <div className="flex items-center space-x-1 px-2 py-1 bg-gray-100 rounded">
                          <Share size={14} />
                          <span className="text-xs font-medium">Share</span>
                        </div>
                        <span className="text-sm text-gray-700">button</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-bold text-sm">2</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-700">Select</span>
                        <div className="flex items-center space-x-1 px-2 py-1 bg-gray-100 rounded">
                          <Plus size={14} />
                          <span className="text-xs font-medium">Add to Home Screen</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={handleDismiss}
                    className="w-full mt-6 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Got it!
                  </button>
                </div>
              </div>
            </div>,
            document.body
          )}
        </>
      )}
    </>
  );
};

export default InstallPWA;
