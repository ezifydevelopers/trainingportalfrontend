interface WebSocketMessage {
  type: 'NEW_MESSAGE' | 'TYPING' | 'USER_ONLINE' | 'USER_OFFLINE' | 'JOIN_CHAT_ROOM' | 'LEAVE_CHAT_ROOM' | 'MODULE_COMPLETION';
  data: any;
}

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

class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private messageHandlers: Map<string, Function[]> = new Map();
  private isConnected = false;
  private userId: number | null = null;

  constructor() {
    this.setupEventListeners();
  }

  private setupEventListeners() {
    // Handle page visibility changes to reconnect when tab becomes visible
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && !this.isConnected && this.userId && this.ws?.readyState !== WebSocket.CONNECTING) {
        console.log('📱 Page became visible, reconnecting WebSocket...');
        this.connect(this.userId);
      }
    });

    // Handle online/offline events
    window.addEventListener('online', () => {
      if (!this.isConnected && this.userId && this.ws?.readyState !== WebSocket.CONNECTING) {
        console.log('🌐 Network came online, reconnecting WebSocket...');
        this.connect(this.userId);
      }
    });
  }

  connect(userId: number) {
    // Prevent multiple connections
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      console.log('WebSocket already connected, skipping connection');
      return;
    }

    // Close existing connection if any
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.userId = userId;
    const wsUrl = `${import.meta.env.VITE_WS_URL || 'ws://localhost:5000'}/ws?userId=${userId}`;
    
    console.log(`🔌 Connecting to WebSocket: ${wsUrl}`);
    
    try {
      this.ws = new WebSocket(wsUrl);
      this.setupWebSocketHandlers();
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      this.scheduleReconnect();
    }
  }

  private setupWebSocketHandlers() {
    if (!this.ws) return;

    this.ws.onopen = () => {
      console.log('🔌 WebSocket connected successfully');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      
      // Send user online status
      this.send({
        type: 'USER_ONLINE',
        data: { userId: this.userId }
      });
    };

    this.ws.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        console.log('📨 WebSocket message received:', message);
        this.handleMessage(message);
      } catch (error) {
        console.error('❌ Error parsing WebSocket message:', error);
      }
    };

    this.ws.onclose = (event) => {
      console.log('🔌 WebSocket disconnected:', event.code, event.reason);
      this.isConnected = false;
      
      // Only attempt reconnection if it wasn't a clean close
      if (!event.wasClean && this.userId) {
        console.log('🔄 WebSocket closed unexpectedly, scheduling reconnection...');
        this.scheduleReconnect();
      }
    };

    this.ws.onerror = (error) => {
      console.error('❌ WebSocket error:', error);
      // Don't set isConnected to false here, let onclose handle it
    };
  }

  private handleMessage(message: WebSocketMessage) {
    const handlers = this.messageHandlers.get(message.type) || [];
    handlers.forEach(handler => {
      try {
        handler(message.data);
      } catch (error) {
        console.error('Error in message handler:', error);
      }
    });
  }

  private scheduleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('Max reconnection attempts reached, stopping reconnection');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    console.log(`🔄 Scheduling reconnection attempt ${this.reconnectAttempts} in ${delay}ms`);
    
    setTimeout(() => {
      if (this.userId && !this.isConnected) {
        console.log(`🔄 Attempting reconnection...`);
        this.connect(this.userId);
      }
    }, delay);
  }

  send(message: WebSocketMessage) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket not connected, message not sent:', message);
    }
  }

  // Subscribe to specific message types
  on(messageType: string, handler: Function) {
    if (!this.messageHandlers.has(messageType)) {
      this.messageHandlers.set(messageType, []);
    }
    this.messageHandlers.get(messageType)!.push(handler);
  }

  // Unsubscribe from specific message types
  off(messageType: string, handler: Function) {
    const handlers = this.messageHandlers.get(messageType);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  // Send typing indicator
  sendTyping(chatRoomId: number, isTyping: boolean) {
    this.send({
      type: 'TYPING',
      data: {
        chatRoomId,
        userId: this.userId,
        isTyping
      }
    });
  }

  // Send new message
  sendNewMessage(message: ChatMessage) {
    this.send({
      type: 'NEW_MESSAGE',
      data: message
    });
  }

  disconnect() {
    if (this.ws) {
      // Clean disconnect
      this.ws.close(1000, 'User initiated disconnect');
      this.ws = null;
    }
    this.isConnected = false;
    this.userId = null;
  }

  getConnectionStatus() {
    return this.isConnected;
  }
}

// Create a singleton instance
const websocketService = new WebSocketService();
export default websocketService;
