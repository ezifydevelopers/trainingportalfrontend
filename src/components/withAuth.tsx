import React, { ComponentType } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface WithAuthProps {
  user?: any;
  isAuthenticated?: boolean;
}

/**
 * Higher-Order Component for authentication
 * Wraps components that require authentication
 * Redirects to login if user is not authenticated
 */
const withAuth = <P extends object>(
  WrappedComponent: ComponentType<P & WithAuthProps>
) => {
  const AuthenticatedComponent = (props: P) => {
    const { user, isAuthenticated } = useAuth();
    const location = useLocation();

    // If not authenticated, redirect to login with return URL
    if (!isAuthenticated || !user) {
      return (
        <Navigate 
          to="/login" 
          state={{ from: location.pathname }} 
          replace 
        />
      );
    }

    // Pass user data and authentication status to wrapped component
    return (
      <WrappedComponent
        {...props}
        user={user}
        isAuthenticated={isAuthenticated}
      />
    );
  };

  // Set display name for debugging
  AuthenticatedComponent.displayName = `withAuth(${WrappedComponent.displayName || WrappedComponent.name})`;

  return AuthenticatedComponent;
};

export default withAuth;
