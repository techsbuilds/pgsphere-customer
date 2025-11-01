import { useState, useEffect } from 'react';

export const useInstallBanner = () => {
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone ||
      document.referrer.includes('android-app://');
    
    const isDismissed = localStorage.getItem('pwa-install-dismissed');
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    // Show banner if not standalone and (not dismissed or in development)
    const shouldShow = !isStandalone && (!isDismissed || isDevelopment);
    setShowInstallBanner(shouldShow);

    // Listen for beforeinstallprompt event to show banner
    const handleBeforeInstallPrompt = () => {
      if (!isStandalone && !isDismissed) {
        setShowInstallBanner(true);
      }
    };

    // Listen for storage changes to update banner state
    const handleStorageChange = () => {
      const newIsDismissed = localStorage.getItem('pwa-install-dismissed');
      const newShouldShow = !isStandalone && (!newIsDismissed || isDevelopment);
      setShowInstallBanner(newShouldShow);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    // Also listen for custom event when banner is dismissed
    const handleBannerDismiss = () => {
      setShowInstallBanner(false);
    };
    
    window.addEventListener('pwa-banner-dismissed', handleBannerDismiss);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('pwa-banner-dismissed', handleBannerDismiss);
    };
  }, []);

  return showInstallBanner;
};
