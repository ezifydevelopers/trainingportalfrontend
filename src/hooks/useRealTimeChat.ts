import { useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import websocketService from '@/services/websocketService';
import { toast } from 'sonner';

interface ChatMessage {
  id: number;
  content: string;
  senderId: number;
  sender: {
    id: number;
    name: string;
    role: string;
  };
  chatRoomId: number;
  createdAt: string;
  isRead: boolean;
}

interface UseRealTimeChatProps {
  onNewMessage: (message: ChatMessage) => void;
  onTypingIndicator: (userId: number, isTyping: boolean) => void;
  onUserOnline: (userId: number) => void;
  onUserOffline: (userId: number) => void;
}

export function useRealTimeChat({
  onNewMessage,
  onTypingIndicator,
  onUserOnline,
  onUserOffline
}: UseRealTimeChatProps) {
  const { user } = useAuth();
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Connect to WebSocket when user logs in
  useEffect(() => {
    if (user?.id) {
      // Only connect if not already connected
      if (!websocketService.getConnectionStatus()) {
        websocketService.connect(user.id);
      }
      
      // Set up message handlers
      websocketService.on('NEW_MESSAGE', onNewMessage);
      websocketService.on('TYPING', onTypingIndicator);
      websocketService.on('USER_ONLINE', onUserOnline);
      websocketService.on('USER_OFFLINE', onUserOffline);

      // Cleanup on unmount
      return () => {
        websocketService.off('NEW_MESSAGE', onNewMessage);
        websocketService.off('TYPING', onTypingIndicator);
        websocketService.off('USER_ONLINE', onUserOnline);
        websocketService.off('USER_OFFLINE', onUserOffline);
        // Don't disconnect here - let AuthContext handle it
      };
    }
  }, [user?.id, onNewMessage, onTypingIndicator, onUserOnline, onUserOffline]);

  // Send typing indicator
  const sendTypingIndicator = useCallback((chatRoomId: number, isTyping: boolean) => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    websocketService.sendTyping(chatRoomId, isTyping);

    // Auto-stop typing indicator after 3 seconds
    if (isTyping) {
      typingTimeoutRef.current = setTimeout(() => {
        websocketService.sendTyping(chatRoomId, false);
      }, 3000);
    }
  }, []);

  // Send new message via WebSocket
  const sendMessage = useCallback((message: ChatMessage) => {
    websocketService.sendNewMessage(message);
  }, []);

  // Get connection status
  const getConnectionStatus = useCallback(() => {
    return websocketService.getConnectionStatus();
  }, []);

  return {
    sendTypingIndicator,
    sendMessage,
    getConnectionStatus,
    isConnected: websocketService.getConnectionStatus()
  };
}
