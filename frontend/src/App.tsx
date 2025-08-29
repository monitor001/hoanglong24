import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, theme, App as AntdApp } from 'antd';
import { QueryClient, QueryClientProvider } from 'react-query';
import { useTranslation } from 'react-i18next';
import { useSelector, TypedUseSelectorHook, useDispatch } from 'react-redux';

// Store
import { RootState, AppDispatch } from './store';

// Utils
import { sessionCleanup } from './utils/sessionCleanup';
import { setupAllErrorHandlers } from './utils/reduxErrorHandler';

// Styles
import './index.css';
import './styles/dark-theme-fixes.css';
import './styles/mobile-improvements.css';
import './styles/unified-statistics-cards.css';
import './styles/tablet-landscape-unified-forms.css';
import './styles/tablet-landscape-all-forms.css';
import './styles/tablet-landscape-special-forms.css';
import './styles/action-buttons-layout-fix.css';
import './styles/modern-auth.css';

// Layouts
import MainLayout from './layouts/MainLayout';
import ModernAuthLayout from './layouts/ModernAuthLayout';

// Pages
import ModernLogin from './pages/ModernLogin';
import Dashboard from './pages/Dashboard';
import ProjectsNew from './pages/ProjectsNew';
import ProjectDetail from './pages/ProjectDetail';
import DocumentsISO from './pages/DocumentsISO';
import DocumentDetail from './pages/DocumentDetail';
import Tasks from './pages/Tasks';
import TaskDetail from './pages/TaskDetail';
import Users from './pages/Users';
import UserDetail from './pages/UserDetail';
import Licenses from './pages/Licenses';
import Settings from './pages/Settings';
import Issues from './pages/Issues';
import Kaizen from './pages/Kaizen';
import IssueDetail from './pages/IssueDetail';
import CalendarPage from './pages/CalendarPage';
import Reports from './pages/Reports';
import Notes from './pages/Notes';
import DesignChecklist from './pages/DesignChecklist';
import ApprovalKanban from './pages/ApprovalKanban';
import TodoList from './pages/TodoList';
import NotFound from './pages/NotFound';

// Hooks
import { useTheme } from './hooks/useTheme';

// Components
import ReduxErrorBoundary from './components/ReduxErrorBoundary';
import SafeStoreProvider from './components/SafeStoreProvider';
import ReduxDebugPanel from './components/ReduxDebugPanel';
import PreferencesManager from './components/PreferencesManager';
import AuthChecker from './components/AuthChecker';

// Typed useSelector hook
const useTypedSelector: TypedUseSelectorHook<RootState> = useSelector;

// Create a query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Private Route Component
const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const auth = useTypedSelector((state) => state.auth);
  
  if (!auth.token) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

// Admin Route Component
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const auth = useTypedSelector((state) => state.auth);
  
  if (!auth.token) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

// App Initialization Component
const AppInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useDispatch<AppDispatch>();
  const auth = useTypedSelector((state) => state.auth);
  
  useEffect(() => {
    if (auth.token && auth.user?.id) {
      console.log('✅ App initialization: Authentication validated successfully');
    }
  }, [auth]);
  
  return <>{children}</>;
};

const App: React.FC = () => {
  const { i18n } = useTranslation();
  const { actualIsDarkMode } = useTheme();

  useEffect(() => {
    setupAllErrorHandlers();
    sessionCleanup.initialize();
    
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage) {
      i18n.changeLanguage(savedLanguage);
    }
    
    console.log('✅ App initialized successfully');
    
    return () => {
      sessionCleanup.stop();
    };
  }, [i18n]);

  return (
    <ReduxErrorBoundary>
      <SafeStoreProvider>
        <QueryClientProvider client={queryClient}>
          <ConfigProvider
            theme={{
              algorithm: actualIsDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
              token: {
                colorPrimary: '#1890ff',
              },
            }}
          >
            <AntdApp>
              <AuthChecker>
                <PreferencesManager>
                  <AppInitializer>
                    <Router>
                      <Routes>
                        {/* Auth routes */}
                        <Route element={<ModernAuthLayout />}>
                          <Route path="/login" element={<ModernLogin />} />
                        </Route>

                        {/* Protected routes */}
                        <Route element={<MainLayout />}>
                          <Route path="/" element={<Navigate to="/dashboard" replace />} />
                          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
                          
                          <Route path="/projects" element={<PrivateRoute><ProjectsNew /></PrivateRoute>} />
                          <Route path="/projects/:id" element={<PrivateRoute><ProjectDetail /></PrivateRoute>} />
                          
                          <Route path="/documents-iso" element={<PrivateRoute><DocumentsISO /></PrivateRoute>} />
                          <Route path="/documents/:id" element={<PrivateRoute><DocumentDetail /></PrivateRoute>} />
                          
                          <Route path="/tasks" element={<PrivateRoute><Tasks /></PrivateRoute>} />
                          <Route path="/tasks/:id" element={<PrivateRoute><TaskDetail /></PrivateRoute>} />
                          
                          <Route path="/users" element={<AdminRoute><Users /></AdminRoute>} />
                          <Route path="/users/:id" element={<AdminRoute><UserDetail /></AdminRoute>} />
                          
                          <Route path="/licenses" element={<AdminRoute><Licenses /></AdminRoute>} />
                          
                          <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
                          <Route path="/issues" element={<PrivateRoute><Issues /></PrivateRoute>} />
                          <Route path="/issues/:id" element={<PrivateRoute><IssueDetail /></PrivateRoute>} />
                          
                          <Route path="/kaizen" element={<PrivateRoute><Kaizen /></PrivateRoute>} />
                          <Route path="/calendar" element={<PrivateRoute><CalendarPage /></PrivateRoute>} />
                          <Route path="/reports" element={<PrivateRoute><Reports /></PrivateRoute>} />
                          <Route path="/notes" element={<PrivateRoute><Notes /></PrivateRoute>} />
                          <Route path="/design-checklist" element={<PrivateRoute><DesignChecklist /></PrivateRoute>} />
                          <Route path="/approval-kanban" element={<PrivateRoute><ApprovalKanban /></PrivateRoute>} />
                          <Route path="/todo-list" element={<PrivateRoute><TodoList /></PrivateRoute>} />
                        </Route>

                        {/* Not found */}
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </Router>
                  </AppInitializer>
                </PreferencesManager>
              </AuthChecker>
              
              {/* Debug Panel - Only in development */}
              <ReduxDebugPanel />
            </AntdApp>
          </ConfigProvider>
        </QueryClientProvider>
      </SafeStoreProvider>
    </ReduxErrorBoundary>
  );
};

export default App;
