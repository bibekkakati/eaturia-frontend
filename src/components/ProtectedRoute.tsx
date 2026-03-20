import React from 'react';
import { Navigate, useLocation } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { getStoredUserRole, getDashboardForRole, type UserRole } from '../utils/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  /** If provided, only users with this role can access the route.
   *  Others are redirected to their own dashboard. */
  requiredRole?: UserRole;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { isAuthenticated, isInitialized } = useAuth();
  const location = useLocation();

  // Wait for localStorage hydration before making any decision
  if (!isInitialized) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#fff',
      }}>
        <div style={{
          width: 28,
          height: 28,
          border: '2px solid #000',
          borderTopColor: 'transparent',
          borderRadius: '50%',
          animation: 'spin 0.7s linear infinite',
        }} />
      </div>
    );
  }

  // Not logged in at all — send to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Logged in but wrong role — send to their own dashboard
  if (requiredRole) {
    const userRole = getStoredUserRole();
    if (userRole !== requiredRole) {
      return <Navigate to={getDashboardForRole(userRole)} replace />;
    }
  }

  return <>{children}</>;
};
