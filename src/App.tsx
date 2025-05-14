import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider } from '@/contexts/AuthContext';
import { TranslationProvider } from '@/contexts/TranslationContext';
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
import './App.css';
import { QueryClientProvider } from 'react-query';
import { queryClient } from '@/lib/react-query';
import OutlinePage from '@/pages/OutlinePage';
import Index from '@/pages/Index';

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="ui-theme">
      <TranslationProvider>
        <AuthProvider>
          <QueryClientProvider client={queryClient}>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/verify-email" element={<VerifyEmail />} />
                
                {/* Protected Routes */}
                <Route element={<ProtectedRoute />}>
                  <Route element={<MainLayout />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/projects/new" element={<NewProject />} />
                    <Route path="/projects/:projectId" element={<Content />} />
                    <Route path="/projects/:projectId/outline" element={<OutlinePage />} />
                    <Route path="/projects/:projectId/content" element={<Content />} />
                    <Route index element={<Index />} />
                  </Route>
                </Route>
                
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
            <Toaster />
          </QueryClientProvider>
        </AuthProvider>
      </TranslationProvider>
    </ThemeProvider>
  );
}

export default App;
