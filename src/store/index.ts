import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import dailyUpdateReducer from './slices/dailyUpdateSlice';
import mealReducer from './slices/mealSlice';
import complaintReducer from './slices/complaintSlice';
import rentReducer from './slices/rentSlice';
import dashboardReducer from './slices/dashboardSlice';
import uiReducer from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    dailyUpdate: dailyUpdateReducer,
    meal: mealReducer,
    complaint: complaintReducer,
    rent: rentReducer,
    dashboard: dashboardReducer,
    ui: uiReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;