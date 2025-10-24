import React, { ComponentType } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface WithRoleProps {
  user?: any;
  isAuthenticated?: boolean;
}

type UserRole = 'ADMIN' | 'MANAGER' | 'TRAINEE';

/**
 * Higher-Order Component for role-based access control
 * Wraps components that require specific user roles
 * Redirects to unauthorized page if user doesn't have required role
 */
const withRole = <P extends object>(
  allowedRoles: UserRole[],
  WrappedComponent: ComponentType<P & WithRoleProps>
) => {
  const RoleProtectedComponent = (props: P) => {
    const { user, isAuthenticated } = useAuth();

    // If not authenticated, redirect to login
    if (!isAuthenticated || !user) {
      return <Navigate to="/login" replace />;
    }

    // Check if user has required role
    const hasRequiredRole = allowedRoles.includes(user.role as UserRole);

    if (!hasRequiredRole) {
      return <Navigate to="/unauthorized" replace />;
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
  RoleProtectedComponent.displayName = `withRole(${allowedRoles.join(',')})(${WrappedComponent.displayName || WrappedComponent.name})`;

  return RoleProtectedComponent;
};

export default withRole;
