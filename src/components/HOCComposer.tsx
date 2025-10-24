import { ComponentType } from 'react';
import withAuth from './withAuth';
import withRole from './withRole';
import withLoading from './withLoading';
import withErrorBoundary from './withErrorBoundary';
import withAnalytics from './withAnalytics';
import withNotifications from './withNotifications';
import withWebSocket from './withWebSocket';

type UserRole = 'ADMIN' | 'MANAGER' | 'TRAINEE';

interface HOCComposerOptions {
  // Authentication options
  requireAuth?: boolean;
  allowedRoles?: UserRole[];
  
  // Loading options
  withLoading?: boolean;
  loadingText?: string;
  
  // Error handling options
  withErrorBoundary?: boolean;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  
  // Analytics options
  withAnalytics?: boolean;
  analyticsId?: string;
  
  
  // Notifications options
  withNotifications?: boolean;
  
  // WebSocket options
  withWebSocket?: boolean;
}

/**
 * HOC Composer - Easily combine multiple HOCs
 * Provides a clean API for applying multiple HOCs at once
 */
const HOCComposer = <P extends object>(
  WrappedComponent: ComponentType<P>,
  options: HOCComposerOptions = {}
) => {
  let EnhancedComponent: ComponentType<P> = WrappedComponent;

  // Apply HOCs in order (most restrictive to least restrictive)
  
  // 1. Error Boundary (outermost - catches all errors)
  if (options.withErrorBoundary) {
    EnhancedComponent = withErrorBoundary(EnhancedComponent);
  }

  // 2. Analytics (track everything)
  if (options.withAnalytics) {
    EnhancedComponent = withAnalytics(EnhancedComponent);
  }

  // 3. Notifications (provide notification context)
  if (options.withNotifications) {
    EnhancedComponent = withNotifications(EnhancedComponent);
  }

  // 4. WebSocket (provide WebSocket connection)
  if (options.withWebSocket) {
    EnhancedComponent = withWebSocket(EnhancedComponent);
  }

  // 5. Loading (handle loading states)
  if (options.withLoading) {
    EnhancedComponent = withLoading(EnhancedComponent);
  }

  // 6. Role-based access control
  if (options.requireAuth && options.allowedRoles) {
    EnhancedComponent = withRole(options.allowedRoles, withAuth(EnhancedComponent));
  } else if (options.requireAuth) {
    EnhancedComponent = withAuth(EnhancedComponent);
  }

  return EnhancedComponent;
};

// Pre-configured HOC combinations for common use cases
export const HOCPresets = {
  // Admin pages with full protection
  adminPage: <P extends object>(Component: ComponentType<P>) =>
    HOCComposer(Component, {
      requireAuth: true,
      allowedRoles: ['ADMIN'],
      withErrorBoundary: true,
      withAnalytics: true,
      withNotifications: true,
      withWebSocket: true,
      withLoading: true,
    }),

  // Manager pages with full protection
  managerPage: <P extends object>(Component: ComponentType<P>) =>
    HOCComposer(Component, {
      requireAuth: true,
      allowedRoles: ['ADMIN', 'MANAGER'],
      withErrorBoundary: true,
      withAnalytics: true,
      withNotifications: true,
      withWebSocket: true,
      withLoading: true,
    }),

  // Trainee pages with basic protection
  traineePage: <P extends object>(Component: ComponentType<P>) =>
    HOCComposer(Component, {
      requireAuth: true,
      allowedRoles: ['TRAINEE'],
      withErrorBoundary: true,
      withAnalytics: true,
      withNotifications: true,
      withWebSocket: true,
      withLoading: true,
    }),

  // Public pages with basic features
  publicPage: <P extends object>(Component: ComponentType<P>) =>
    HOCComposer(Component, {
      withErrorBoundary: true,
      withAnalytics: true,
      withNotifications: true,
      withWebSocket: true,
    }),

  // Data-heavy pages with loading states
  dataPage: <P extends object>(Component: ComponentType<P>) =>
    HOCComposer(Component, {
      requireAuth: true,
      withErrorBoundary: true,
      withAnalytics: true,
      withWebSocket: true,
      withLoading: true,
      loadingText: 'Loading data...',
    }),

  // Simple authenticated pages
  authPage: <P extends object>(Component: ComponentType<P>) =>
    HOCComposer(Component, {
      requireAuth: true,
      withErrorBoundary: true,
    }),
};

export default HOCComposer;
