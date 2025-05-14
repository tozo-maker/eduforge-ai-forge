
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

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="eduforge-theme">
      <TranslationProvider>
        <Router>
          <AuthProvider>
            <Routes>
              <Route path="/landing" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/verify-email" element={<VerifyEmail />} />

              <Route path="/" element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }>
                <Route index element={<Dashboard />} />
                <Route path="dashboard" element={<Navigate to="/" replace />} />
                <Route path="projects/new" element={<NewProject />} />
                <Route path="content" element={<Content />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster />
          </AuthProvider>
        </Router>
      </TranslationProvider>
    </ThemeProvider>
  );
}

export default App;
