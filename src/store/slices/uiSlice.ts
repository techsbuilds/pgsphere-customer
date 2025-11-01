import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  sidebarOpen: boolean;
  loading: boolean;
  notification: {
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
    visible: boolean;
  } | null;
}

// Check if device is mobile to set appropriate sidebar state
const isMobileDevice = typeof window !== 'undefined' && (
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
  window.innerWidth < 1024 // Also consider small screen sizes as mobile
);

const initialState: UIState = {
  sidebarOpen: !isMobileDevice, // Close sidebar by default on mobile devices
  loading: false,
  notification: null,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    showNotification: (state, action: PayloadAction<{
      message: string;
      type: 'success' | 'error' | 'info' | 'warning';
    }>) => {
      state.notification = {
        ...action.payload,
        visible: true,
      };
    },
    hideNotification: (state) => {
      state.notification = null;
    },
  },
});

export const { toggleSidebar, setSidebarOpen, setLoading, showNotification, hideNotification } = uiSlice.actions;
export default uiSlice.reducer;