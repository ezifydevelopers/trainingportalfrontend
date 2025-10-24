import React, { ComponentType, useEffect, useState, useRef } from 'react';
import websocketService from '@/services/websocketService';

interface WebSocketMessage {
  type: 'NEW_MESSAGE' | 'TYPING' | 'USER_ONLINE' | 'USER_OFFLINE' | 'JOIN_CHAT_ROOM' | 'LEAVE_CHAT_ROOM' | 'MODULE_COMPLETION' | string;
  data: any;
}

interface WithWebSocketProps {
  isConnected?: boolean;
  sendMessage?: (message: WebSocketMessage) => void;
  subscribe?: (messageType: string, handler: (data: any) => void) => void;
  unsubscribe?: (messageType: string, handler: (data: any) => void) => void;
  connectionStatus?: 'connecting' | 'connected' | 'disconnected' | 'error';
  lastMessage?: WebSocketMessage | null;
  reconnectAttempts?: number;
}

/**
 * Higher-Order Component for WebSocket connection management
 * Provides WebSocket functionality and connection state management
 */
const withWebSocket = <P extends object>(
  WrappedComponent: ComponentType<P & WithWebSocketProps>
) => {
  const WebSocketComponent = (props: P & WithWebSocketProps) => {
    const [isConnected, setIsConnected] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
    const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
    const [reconnectAttempts, setReconnectAttempts] = useState(0);
    const messageHandlers = useRef<Map<string, Set<(data: any) => void>>>(new Map());

    // Initialize WebSocket connection
    useEffect(() => {
      const handleConnectionChange = (connected: boolean) => {
        setIsConnected(connected);
        setConnectionStatus(connected ? 'connected' : 'disconnected');
      };

      // Subscribe to connection status changes
      websocketService.on('connection_status', handleConnectionChange);

      // Get initial connection status
      setIsConnected(websocketService.getConnectionStatus());
      setConnectionStatus(websocketService.getConnectionStatus() ? 'connected' : 'disconnected');

      return () => {
        websocketService.off('connection_status', handleConnectionChange);
      };
    }, []);

    // Send message through WebSocket
    const sendMessage = (message: WebSocketMessage) => {
      if (isConnected) {
        websocketService.send(message);
      } else {
        console.warn('WebSocket not connected. Message not sent:', message);
      }
    };

    // Subscribe to specific message types
    const subscribe = (messageType: string, handler: (data: any) => void) => {
      // Store handler for cleanup
      if (!messageHandlers.current.has(messageType)) {
        messageHandlers.current.set(messageType, new Set());
      }
      messageHandlers.current.get(messageType)!.add(handler);

      // Subscribe to WebSocket service
      websocketService.on(messageType, (data: any) => {
        setLastMessage({ type: messageType, data });
        handler(data);
      });
    };

    // Unsubscribe from message types
    const unsubscribe = (messageType: string, handler: (data: any) => void) => {
      if (messageHandlers.current.has(messageType)) {
        messageHandlers.current.get(messageType)!.delete(handler);
      }
      websocketService.off(messageType, handler);
    };

    // Cleanup on unmount
    useEffect(() => {
      return () => {
        // Clean up all handlers
        messageHandlers.current.forEach((handlers, messageType) => {
          handlers.forEach(handler => {
            websocketService.off(messageType, handler);
          });
        });
        messageHandlers.current.clear();
      };
    }, []);

    // Monitor connection attempts
    useEffect(() => {
      const handleReconnectAttempt = () => {
        setReconnectAttempts(prev => prev + 1);
        setConnectionStatus('connecting');
      };

      const handleConnectionError = () => {
        setConnectionStatus('error');
      };

      // Listen for reconnection attempts
      websocketService.on('reconnect_attempt', handleReconnectAttempt);
      websocketService.on('connection_error', handleConnectionError);

      return () => {
        websocketService.off('reconnect_attempt', handleReconnectAttempt);
        websocketService.off('connection_error', handleConnectionError);
      };
    }, []);

    return (
      <WrappedComponent
        {...(props as P)}
        isConnected={isConnected}
        sendMessage={sendMessage}
        subscribe={subscribe}
        unsubscribe={unsubscribe}
        connectionStatus={connectionStatus}
        lastMessage={lastMessage}
        reconnectAttempts={reconnectAttempts}
      />
    );
  };

  // Set display name for debugging
  WebSocketComponent.displayName = `withWebSocket(${WrappedComponent.displayName || WrappedComponent.name})`;

  return WebSocketComponent;
};

export default withWebSocket;
