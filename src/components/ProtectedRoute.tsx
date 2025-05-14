
import { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  
  useEffect(() => {
    console.log('ProtectedRoute: isLoading =', isLoading, 'user =', user?.id);
  }, [isLoading, user]);

  if (isLoading) {
    console.log('ProtectedRoute: still loading auth state');
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    console.log('ProtectedRoute: no user, redirecting to login');
    // Redirect to the login page with the current location as the "from" state
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  console.log('ProtectedRoute: user authenticated, rendering children');
  return <>{children || <Outlet />}</>;
};

export default ProtectedRoute;
