import { useState, useEffect } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import websocketService from '@/services/websocketService';
import { getApiBaseUrl } from '@/lib/api';

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
}

export default function MessageNotificationSimple({ unreadCount, onNotificationClick, onUnreadCountChange }: MessageNotificationProps) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<MessageNotification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [lastMessageTime, setLastMessageTime] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Function to fetch all unread messages
  const fetchRecentMessages = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const response = await fetch(`${getApiBaseUrl()}/chat/recent-messages`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const messages = data.messages || [];
        
        // Transform messages to notification format
        const transformedNotifications: MessageNotification[] = messages.map((msg: any) => ({
          id: `msg_${msg.id}`,
          message: msg.message,
          senderName: msg.senderName || 'Unknown',
          chatRoomId: msg.chatRoomId,
          timestamp: new Date(msg.createdAt),
          isRead: msg.isRead || false,
          type: 'message' as const
        }));

        setNotifications(transformedNotifications);
        setLastMessageTime(new Date());
      }
    } catch (error) {
      console.error('Error fetching recent messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch messages on component mount and when user changes
  useEffect(() => {
    if (user) {
      fetchRecentMessages();
    }
  }, [user]);

  // Set up WebSocket listener for new messages
  useEffect(() => {
    if (!user) return;

    const handleNewMessage = (message: any) => {
      const newNotification: MessageNotification = {
        id: `msg_${message.id}`,
        message: message.message,
        senderName: message.senderName || 'Unknown',
        chatRoomId: message.chatRoomId,
        timestamp: new Date(message.createdAt),
        isRead: false,
        type: 'message'
      };

      setNotifications(prev => [newNotification, ...prev]);
      
      // Show browser notification if supported
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(`New message from ${newNotification.senderName}`, {
          body: newNotification.message,
          icon: '/favicon.ico',
          tag: 'new-message'
        });
      }


      // Update unread count
      if (onUnreadCountChange) {
        onUnreadCountChange();
      }
    };

    websocketService.on('newMessage', handleNewMessage);

    return () => {
      websocketService.off('newMessage', handleNewMessage);
    };
  }, [user, onUnreadCountChange]);

  const markNotificationAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId 
          ? { ...notif, isRead: true }
          : notif
      )
    );
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
      
      // Update unread count
      if (onUnreadCountChange) {
        onUnreadCountChange();
      }
    } catch (error) {
      console.error('Error marking message as read:', error);
    }

    // Call the parent click handler
    onNotificationClick(notification.chatRoomId);
    setShowNotifications(false);
  };

  const refreshNotifications = () => {
    fetchRecentMessages();
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const unreadNotifications = notifications.filter(n => !n.isRead);

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative"
      >
        <MessageCircle className="h-6 w-6" />
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs p-0"
          >
            {unreadCount}
          </Badge>
        )}
      </Button>

      {showNotifications && (
        <div className="absolute right-0 top-12 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="bg-blue-50 text-blue-700">
                  {unreadNotifications.length} unread
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={refreshNotifications}
                  disabled={isLoading}
                  className="h-6 px-2 text-xs"
                >
                  {isLoading ? '...' : 'Refresh'}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowNotifications(false)}
                  className="h-6 w-6"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="max-h-64 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center text-gray-500">
                Loading notifications...
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No notifications
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                      !notification.isRead ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <MessageCircle className="h-4 w-4 text-blue-600" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900">
                            {notification.senderName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatTime(notification.timestamp)}
                          </p>
                        </div>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                        {!notification.isRead && (
                          <div className="mt-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-3 border-t border-gray-200 bg-gray-50">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowNotifications(false)}
              className="w-full"
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
