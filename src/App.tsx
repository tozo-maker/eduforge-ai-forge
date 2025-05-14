
import { BrowserRouter as Router, Route, Routes, Navigate, Outlet } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider } from '@/contexts/AuthContext';
import { TranslationProvider } from '@/contexts/TranslationContext';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/react-query';
import Login from '@/pages/auth/Login';
import Register from '@/pages/auth/Register';
import ResetPassword from '@/pages/auth/ResetPassword';
import VerifyEmail from '@/pages/auth/VerifyEmail';
import Dashboard from '@/pages/Dashboard';
import Landing from '@/pages/Landing';
import NotFound from '@/pages/NotFound';
import ProtectedRoute from '@/components/ProtectedRoute';
import Content from '@/pages/Content';
import MainLayout from '@/components/layout/MainLayout';
import NewProject from '@/pages/NewProject';
import OutlinePage from '@/pages/OutlinePage';
import './App.css';

function App() {
  console.log('App component rendering');
  return (
    <ThemeProvider defaultTheme="system" storageKey="ui-theme">
      <TranslationProvider>
        <QueryClientProvider client={queryClient}>
          <Router>
            <AuthProvider>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/verify-email" element={<VerifyEmail />} />
                
                {/* Auth Routes (for backward compatibility) */}
                <Route path="/auth/login" element={<Navigate to="/login" replace />} />
                <Route path="/auth/register" element={<Navigate to="/register" replace />} />
                <Route path="/auth/reset-password" element={<Navigate to="/reset-password" replace />} />
                <Route path="/auth/verify" element={<Navigate to="/verify-email" replace />} />
                
                {/* Protected Routes */}
                <Route element={
                  <ProtectedRoute>
                    <Outlet />
                  </ProtectedRoute>
                }>
                  <Route element={<MainLayout />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/projects/new" element={<NewProject />} />
                    <Route path="/projects/:projectId" element={<Content />} />
                    <Route path="/projects/:projectId/outline" element={<OutlinePage />} />
                    <Route path="/projects/:projectId/content" element={<Content />} />
                  </Route>
                </Route>
                
                {/* Root redirect */}
                <Route path="/index" element={<Navigate to="/" replace />} />
                
                {/* 404 Route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
              <Toaster />
            </AuthProvider>
          </Router>
        </QueryClientProvider>
      </TranslationProvider>
    </ThemeProvider>
  );
}

export default App;
