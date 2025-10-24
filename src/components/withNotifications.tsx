import React, { ComponentType, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Bell, CheckCircle, AlertCircle, Info, X } from 'lucide-react';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface WithNotificationsProps {
  showNotification?: (notification: Omit<Notification, 'id'>) => void;
  showSuccess?: (title: string, message?: string) => void;
  showError?: (title: string, message?: string) => void;
  showWarning?: (title: string, message?: string) => void;
  showInfo?: (title: string, message?: string) => void;
  notifications?: Notification[];
  clearNotification?: (id: string) => void;
  clearAllNotifications?: () => void;
}

/**
 * Higher-Order Component for notification management
 * Provides toast notifications and notification state management
 */
const withNotifications = <P extends object>(
  WrappedComponent: ComponentType<P & WithNotificationsProps>
) => {
  const NotificationComponent = (props: P & WithNotificationsProps) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    // Generate unique ID
    const generateId = () => Math.random().toString(36).substr(2, 9);

    // Show notification
    const showNotification = (notification: Omit<Notification, 'id'>) => {
      const id = generateId();
      const newNotification: Notification = {
        id,
        duration: 5000,
        ...notification,
      };

      setNotifications(prev => [...prev, newNotification]);

      // Show toast based on type
      switch (notification.type) {
        case 'success':
          toast.success(notification.title, {
            description: notification.message,
            duration: notification.duration,
          });
          break;
        case 'error':
          toast.error(notification.title, {
            description: notification.message,
            duration: notification.duration,
          });
          break;
        case 'warning':
          toast.warning(notification.title, {
            description: notification.message,
            duration: notification.duration,
          });
          break;
        case 'info':
          toast.info(notification.title, {
            description: notification.message,
            duration: notification.duration,
          });
          break;
      }

      // Auto-remove after duration
      if (notification.duration && notification.duration > 0) {
        setTimeout(() => {
          clearNotification(id);
        }, notification.duration);
      }
    };

    // Convenience methods
    const showSuccess = (title: string, message?: string) => {
      showNotification({ type: 'success', title, message });
    };

    const showError = (title: string, message?: string) => {
      showNotification({ type: 'error', title, message });
    };

    const showWarning = (title: string, message?: string) => {
      showNotification({ type: 'warning', title, message });
    };

    const showInfo = (title: string, message?: string) => {
      showNotification({ type: 'info', title, message });
    };

    // Clear notification
    const clearNotification = (id: string) => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    };

    // Clear all notifications
    const clearAllNotifications = () => {
      setNotifications([]);
    };

    return (
      <WrappedComponent
        {...(props as P)}
        showNotification={showNotification}
        showSuccess={showSuccess}
        showError={showError}
        showWarning={showWarning}
        showInfo={showInfo}
        notifications={notifications}
        clearNotification={clearNotification}
        clearAllNotifications={clearAllNotifications}
      />
    );
  };

  // Set display name for debugging
  NotificationComponent.displayName = `withNotifications(${WrappedComponent.displayName || WrappedComponent.name})`;

  return NotificationComponent;
};

export default withNotifications;
