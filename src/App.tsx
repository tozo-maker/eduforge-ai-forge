import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "./contexts/AuthContext";
import Landing from "./pages/Landing";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ResetPassword from "./pages/auth/ResetPassword";
import VerifyEmail from "./pages/auth/VerifyEmail";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import MainLayout from "./components/layout/MainLayout";
import { Button } from "./components/ui/button";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Landing />} />
            
            {/* Auth Routes */}
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/register" element={<Register />} />
            <Route path="/auth/reset-password" element={<ResetPassword />} />
            <Route path="/auth/verify" element={<VerifyEmail />} />
            
            {/* Protected Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <MainLayout>
                  <Dashboard />
                </MainLayout>
              </ProtectedRoute>
            } />
            
            {/* Project Routes */}
            <Route path="/projects" element={
              <ProtectedRoute>
                <MainLayout>
                  <div className="container py-8">
                    <h1 className="text-3xl font-bold mb-6">My Projects</h1>
                    <p className="text-muted-foreground">This page is coming soon in the next phase.</p>
                  </div>
                </MainLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/projects/new" element={
              <ProtectedRoute>
                <MainLayout>
                  <div className="container py-8">
                    <h1 className="text-3xl font-bold mb-6">Create New Project</h1>
                    <p className="text-muted-foreground">The project creation wizard will be available soon.</p>
                    <Button variant="outline" className="mt-4" asChild>
                      <Link to="/dashboard">Back to Dashboard</Link>
                    </Button>
                  </div>
                </MainLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/projects/:id" element={
              <ProtectedRoute>
                <MainLayout>
                  <div className="container py-8">
                    <h1 className="text-3xl font-bold mb-6">Project Details</h1>
                    <p className="text-muted-foreground">Project details view is coming soon.</p>
                    <Button variant="outline" className="mt-4" asChild>
                      <Link to="/dashboard">Back to Dashboard</Link>
                    </Button>
                  </div>
                </MainLayout>
              </ProtectedRoute>
            } />
            
            {/* Templates Route - Protected */}
            <Route path="/templates" element={
              <ProtectedRoute>
                <MainLayout>
                  <div className="container py-8">
                    <h1 className="text-3xl font-bold mb-6">Templates</h1>
                    <p className="text-muted-foreground">The templates library will be available in the next phase.</p>
                  </div>
                </MainLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/templates/:id" element={
              <ProtectedRoute>
                <MainLayout>
                  <div className="container py-8">
                    <h1 className="text-3xl font-bold mb-6">Template Details</h1>
                    <p className="text-muted-foreground">Template details view is coming soon.</p>
                    <Button variant="outline" className="mt-4" asChild>
                      <Link to="/dashboard">Back to Dashboard</Link>
                    </Button>
                  </div>
                </MainLayout>
              </ProtectedRoute>
            } />
            
            {/* Settings Route - Protected */}
            <Route path="/settings" element={
              <ProtectedRoute>
                <MainLayout>
                  <div className="container py-8">
                    <h1 className="text-3xl font-bold mb-6">Account Settings</h1>
                    <p className="text-muted-foreground">Account settings will be available in the next phase.</p>
                  </div>
                </MainLayout>
              </ProtectedRoute>
            } />
            
            {/* Placeholder Routes */}
            <Route path="/terms" element={<div className="p-12"><h1 className="text-2xl font-bold">Terms of Service</h1><p className="mt-4">Coming Soon</p></div>} />
            <Route path="/privacy" element={<div className="p-12"><h1 className="text-2xl font-bold">Privacy Policy</h1><p className="mt-4">Coming Soon</p></div>} />
            
            {/* Catch-all Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
