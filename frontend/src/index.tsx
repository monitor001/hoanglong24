import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { ConfigProvider } from 'antd';
import 'antd/dist/reset.css';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import './i18n';
import './axiosConfig';

// Import store and error handlers
import store from './store';
import { setupAllErrorHandlers } from './utils/reduxErrorHandler';

// Setup all error handlers before anything else
if (typeof window !== 'undefined') {
  setupAllErrorHandlers();
}

// Validate store before rendering
if (!store) {
  console.error('❌ Store is null in index.tsx');
  throw new Error('Redux store is not available');
}

if (typeof store.getState !== 'function') {
  console.error('❌ Store missing getState method in index.tsx');
  throw new Error('Redux store is corrupted - missing getState method');
}

if (typeof store.dispatch !== 'function') {
  console.error('❌ Store missing dispatch method in index.tsx');
  throw new Error('Redux store is corrupted - missing dispatch method');
}

if (typeof store.subscribe !== 'function') {
  console.error('❌ Store missing subscribe method in index.tsx');
  throw new Error('Redux store is corrupted - missing subscribe method');
}

// Test store functionality
try {
  const testState = store.getState();
  if (!testState || typeof testState !== 'object') {
    throw new Error('Store getState returned invalid state');
  }
} catch (testError) {
  console.error('❌ Store test failed in index.tsx:', testError);
  throw new Error(`Store test failed: ${testError.message}`);
}

// Ensure store is available in window for debugging
if (typeof window !== 'undefined') {
  try {
    (window as any).__REDUX_STORE__ = store;
  } catch (error) {
    console.warn('Failed to add store to window in index.tsx:', error);
  }
}

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <ConfigProvider>
        <App />
      </ConfigProvider>
    </Provider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

if (process.env.REACT_APP_TITLE) {
  document.title = process.env.REACT_APP_TITLE;
}
