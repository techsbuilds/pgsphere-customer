// Utility to unregister existing service workers in development
export const unregisterServiceWorkers = async () => {
  if ('serviceWorker' in navigator && import.meta.env.DEV) {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      
      for (const registration of registrations) {
        const unregistered = await registration.unregister();
        if (unregistered) {
          console.log('🧹 Unregistered service worker:', registration.scope);
        }
      }
      
      if (registrations.length > 0) {
        console.log('✅ All service workers unregistered in development mode');
      }
    } catch (error) {
      console.error('Failed to unregister service workers:', error);
    }
  }
};

