import { useState, useEffect, useCallback } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import websocketService from '@/services/websocketService';
import { getApiBaseUrl } from '@/lib/api';
import { useMarkAllAsRead } from '@/hooks/useApi';

interface MessageNotification {
  id: string;
  message: string;
  senderName: string;
  chatRoomId: number;
  timestamp: Date;
  isRead: boolean;
  type: 'message' | 'module_completion';
}

interface MessageNotificationProps {
  unreadCount: number;
  onNotificationClick: (chatRoomId: number) => void;
  onUnreadCountChange?: () => void;
  enableClearAll?: boolean; // Option to disable clear all functionality
}

export default function MessageNotification({ unreadCount, onNotificationClick, onUnreadCountChange, enableClearAll = true }: MessageNotificationProps) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<MessageNotification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [lastMessageTime, setLastMessageTime] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isClearingAll, setIsClearingAll] = useState(false);

  // Function to fetch all unread messages
  const fetchRecentMessages = useCallback(async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const response = await fetch(`${getApiBaseUrl()}/chat/recent-messages?limit=50`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Convert recent messages to notification format
        const messageNotifications: MessageNotification[] = data.messages?.map((msg: { id: number; content: string; sender: { name: string }; chatRoomId: number; createdAt: string; isRead: boolean }) => ({
          id: `msg_${msg.id}`,
          message: msg.content,
          senderName: msg.sender.name,
          chatRoomId: msg.chatRoomId,
          timestamp: new Date(msg.createdAt),
          isRead: msg.isRead,
          type: 'message'
        })) || [];
        
        setNotifications(messageNotifications);
      }
    } catch (error) {
      // Error fetching recent messages
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Fetch recent messages when component mounts or when dropdown opens
  useEffect(() => {
    if (showNotifications) {
      fetchRecentMessages();
    }
  }, [showNotifications, user, fetchRecentMessages]);

  // Listen for real-time notifications from WebSocket
  useEffect(() => {
    if (!user) return;

    // Listen for new messages
    const handleNewMessage = (message: { id: number; content: string; senderId: number; sender: { name: string }; chatRoomId: number }) => {
      if (message.senderId !== user.id) {
        const newNotification: MessageNotification = {
          id: `msg_${message.id}_${Date.now()}`,
          message: message.content,
          senderName: message.sender.name,
          chatRoomId: message.chatRoomId,
          timestamp: new Date(),
          isRead: false,
          type: 'message'
        };
        
        setNotifications(prev => [newNotification, ...prev]);
        showNewMessageNotification(newNotification);
      }
    };

    // Listen for module completion notifications
    const handleModuleCompletion = (data: { traineeId: number; traineeName: string }) => {
      const newNotification: MessageNotification = {
        id: `module_${data.traineeId}_${Date.now()}`,
        message: `${data.traineeName} has completed all training modules!`,
        senderName: 'System',
        chatRoomId: 0, // System notification
        timestamp: new Date(),
        isRead: false,
        type: 'module_completion'
      };
      
      setNotifications(prev => [newNotification, ...prev]);
      showModuleCompletionNotification(newNotification);
    };

    // Set up WebSocket listeners
    websocketService.on('NEW_MESSAGE', handleNewMessage);
    websocketService.on('MODULE_COMPLETION', handleModuleCompletion);

    // Cleanup
    return () => {
      websocketService.off('NEW_MESSAGE', handleNewMessage);
      websocketService.off('MODULE_COMPLETION', handleModuleCompletion);
    };
  }, [user]);

  // Poll for unread messages every 10 seconds (less frequent to reduce spam)
  useEffect(() => {
    if (!user) return;

    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`${getApiBaseUrl()}/chat/unread-count`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          // Only show notification if there are actually new unread messages
          if (data.unreadCount > unreadCount && unreadCount > 0) {
            // New messages received - this will be handled by WebSocket now
          }
        }
      } catch (error) {
        // Error polling unread count
      }
    }, 10000);

    return () => clearInterval(pollInterval);
  }, [user, unreadCount]);

  const showNewMessageNotification = (notification: MessageNotification) => {
    // Create a browser notification if supported
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('New Message', {
        body: `${notification.senderName}: ${notification.message}`,
        icon: '/favicon.ico',
        tag: 'new-message'
      });
    }

  };

  const showModuleCompletionNotification = (notification: MessageNotification) => {
    // Create a browser notification if supported
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Training Completed!', {
        body: notification.message,
        icon: '/favicon.ico',
        tag: 'module-completion'
      });
    }

  };

  const markNotificationAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId 
          ? { ...notif, isRead: true }
          : notif
      )
    );
  };

  const clearAllNotifications = async () => {
    setIsClearingAll(true);
    
    try {
      // Simple approach: just mark all as read locally and refresh
      setNotifications(prev => prev.map(notif => ({ ...notif, isRead: true })));
      
      // Try to mark chat messages as read
      try {
        await fetch(`${getApiBaseUrl()}/chat/mark-all-read`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            'Content-Type': 'application/json'
          }
        });
      } catch (chatError) {
      }
      
      // Try to mark system notifications as read
      try {
        await fetch(`${getApiBaseUrl()}/admin/notifications/read-all`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            'Content-Type': 'application/json'
          }
        });
      } catch (notificationError) {
      }
      
      // Refresh the unread count in the parent component
      if (onUnreadCountChange) {
        onUnreadCountChange();
      }
      
      // Refresh the notifications list
      setTimeout(() => {
        fetchRecentMessages();
      }, 500);
      
      toast.success('All notifications cleared');
    } catch (error) {
      toast.error('Failed to clear notifications');
    } finally {
      setIsClearingAll(false);
    }
  };

  const refreshNotifications = () => {
    fetchRecentMessages();
  };

  const handleNotificationClick = async (notification: MessageNotification) => {
    // Mark as read locally
    markNotificationAsRead(notification.id);
    
    // Mark as read on server
    try {
      await fetch(`${getApiBaseUrl()}/chat/mark-read`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          chatRoomId: notification.chatRoomId,
          messageId: notification.id.replace('msg_', '')
        })
      });
      
      // Refresh the unread count in the parent component
      if (onUnreadCountChange) {
        onUnreadCountChange();
      }
    } catch (error) {
    }
    
    onNotificationClick(notification.chatRoomId);
    setShowNotifications(false);
  };

  return (
    <div className="relative">
      {/* Message Notification with Badge */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
      >
        <MessageCircle className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Button>

      {/* Notifications Dropdown */}
      {showNotifications && (
        <div className="absolute right-0 top-12 w-80 bg-white border rounded-lg shadow-lg z-50 max-h-96 overflow-hidden">
          <div className="p-3 border-b bg-gray-50 flex items-center justify-between">
            <h3 className="font-medium text-sm">Notifications</h3>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="text-xs">
                {unreadCount} total unread
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={refreshNotifications}
                className="h-6 px-2 text-xs"
                disabled={isLoading}
              >
                {isLoading ? '...' : 'Refresh'}
              </Button>
              {enableClearAll && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllNotifications}
                  disabled={isClearingAll || notifications.length === 0}
                  className="h-6 px-2 text-xs"
                  title={notifications.length === 0 ? "No notifications to clear" : "Clear all notifications"}
                >
                  {isClearingAll ? (
                    <>
                      <div className="h-3 w-3 animate-spin rounded-full border-2 border-gray-400 border-t-transparent mr-1" />
                      Clearing...
                    </>
                  ) : (
                    'Clear all'
                  )}
                </Button>
              )}
            </div>
          </div>

          <div className="max-h-64 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center text-gray-500">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-sm">Loading notifications...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <MessageCircle className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No unread messages</p>
                <p className="text-xs text-gray-400 mt-1">You're all caught up!</p>
              </div>
            ) : (
              <>
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 border-b cursor-pointer hover:bg-gray-50 ${
                      !notification.isRead ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {notification.senderName}
                        </p>
                        <p className="text-xs text-gray-600 truncate">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {notification.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                      {!notification.isRead && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full ml-2 flex-shrink-0" />
                      )}
                    </div>
                  </div>
                ))}
                {unreadCount > notifications.length && (
                  <div className="p-3 text-center text-gray-500 border-t">
                    <p className="text-xs">
                      Showing {notifications.length} of {unreadCount} unread messages
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Click "Refresh" to load more
                    </p>
                  </div>
                )}
              </>
            )}
          </div>

          {notifications.length > 0 && (
            <div className="p-2 border-t bg-gray-50">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowNotifications(false)}
                className="w-full text-xs"
              >
                Close
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
