import { configureStore } from '@reduxjs/toolkit';

// Import all slices
import authReducer from './slices/authSlice';
import projectReducer from './slices/projectSlice';
import documentReducer from './slices/documentSlice';
import taskReducer from './slices/taskSlice';
import userReducer from './slices/userSlice';
import uiReducer from './slices/uiSlice';

// Create the store with proper reducers
const store = configureStore({
  reducer: {
    auth: authReducer,
    projects: projectReducer,
    documents: documentReducer,
    tasks: taskReducer,
    users: userReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
      immutableCheck: false
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

// Export types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Export the store instance
export { store };

// Export default store
export default store; 