import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { unregisterServiceWorkers } from './utils/unregisterServiceWorker';

// Check if PWA is enabled via environment variable
const isPWAEnabled = import.meta.env.VITE_ENABLE_PWA === 'true';

// Debug logging


// Unregister service workers if PWA is disabled
if (!isPWAEnabled) {
  unregisterServiceWorkers();
} else {
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
