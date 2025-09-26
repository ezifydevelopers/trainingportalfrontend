import { useState, useEffect, useRef, useCallback } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { Send, MessageCircle, Users, Search, MoreVertical, Settings, Wifi, WifiOff } from "lucide-react";
import { toast } from "sonner";
import NotificationSettings from "@/components/NotificationSettings";
import { useRealTimeChat } from "@/hooks/useRealTimeChat";
import websocketService from "@/services/websocketService";
import { getApiBaseUrl } from "@/lib/api";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  company?: {
    id: number;
    name: string;
  };
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
  createdAt: string;
  isRead: boolean;
  chatRoomId: number; // Added for real-time handling
}

interface ChatRoom {
  id: number;
  type: string;
  participants: Array<{
    user: User;
    isActive: boolean;
  }>;
  messages: ChatMessage[];
  updatedAt: string;
}

export default function Chat() {
  const { user } = useAuth();
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [selectedChatRoom, setSelectedChatRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [companyUsers, setCompanyUsers] = useState<User[]>([]);
  const [showUserList, setShowUserList] = useState(false);
  
  // Debug logging for showUserList state changes
  useEffect(() => {

  }, [showUserList]);
  const [searchQuery, setSearchQuery] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);
  
  // Real-time chat state
  const [typingUsers, setTypingUsers] = useState<Set<number>>(new Set());
  const [onlineUsers, setOnlineUsers] = useState<Set<number>>(new Set());
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Real-time chat handlers
  const handleNewMessage = (message: ChatMessage) => {
    // Check if we already have this message to prevent duplicates
    if (messages.some(m => m.id === message.id)) {
      return;
    }

    // Don't add messages that the current user just sent (they're already in local state)
    if (message.senderId === user?.id) {
      return;
    }

    // Add new message to current chat if it matches
    if (selectedChatRoom && message.chatRoomId === selectedChatRoom.id) {
      setMessages(prev => [...prev, message]);
      scrollToBottom();
    }
    
    // Update chat rooms with new message
    setChatRooms(prev => 
      prev.map(room => 
        room.id === message.chatRoomId 
          ? { 
              ...room, 
              messages: [message, ...room.messages], 
              updatedAt: new Date().toISOString() 
            }
          : room
      )
    );
    
    // Update unread count if message is not from current user
    if (message.senderId !== user?.id) {
      setUnreadCount(prev => prev + 1);
      
      // Show notification for new message only once
      showNewMessageNotification();
    }
  };

  const handleTypingIndicator = (userId: number, isTyping: boolean) => {
    if (isTyping) {
      setTypingUsers(prev => new Set(prev).add(userId));
    } else {
      setTypingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
  };

  const handleUserOnline = (userId: number) => {
    setOnlineUsers(prev => new Set(prev).add(userId));
  };

  const handleUserOffline = (userId: number) => {
    setOnlineUsers(prev => {
      const newSet = new Set(prev);
      newSet.delete(userId);
      return newSet;
    });
  };

  // Initialize real-time chat
  const { sendTypingIndicator, sendMessage: sendRealTimeMessage, isConnected } = useRealTimeChat({
    onNewMessage: handleNewMessage,
    onTypingIndicator: handleTypingIndicator,
    onUserOnline: handleUserOnline,
    onUserOffline: handleUserOffline
  });

  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await fetch(`${getApiBaseUrl()}/chat/unread-count`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.unreadCount);
        
        // If there are new unread messages, show notification
        if (data.unreadCount > 0 && data.unreadCount > unreadCount) {
          showNewMessageNotification();
        }
      }
    } catch (error) {

    }
  }, [unreadCount]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (user) {
      
      // Request notification permission
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
      }
      
      fetchChatRooms();
      fetchCompanyUsers();
      fetchUnreadCount();
      
      // Set up real-time polling for new messages
      const messagePollingInterval = setInterval(() => {
        fetchUnreadCount();
        if (selectedChatRoom) {
          fetchMessages(selectedChatRoom.id);
        }
      }, 5000); // Poll every 5 seconds
      
      return () => clearInterval(messagePollingInterval);
    }
  }, [user, fetchUnreadCount]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (selectedChatRoom) {
      fetchMessages(selectedChatRoom.id);
      
      // Join chat room via WebSocket for real-time updates
      if (isConnected && user?.id) {
        websocketService.send({
          type: 'JOIN_CHAT_ROOM',
          data: { chatRoomId: selectedChatRoom.id }
        });
      }
    }
  }, [selectedChatRoom, isConnected, user?.id]);

  // Cleanup effect for leaving chat rooms
  useEffect(() => {
    return () => {
      // Leave current chat room when component unmounts
      if (selectedChatRoom && isConnected && user?.id) {
        websocketService.send({
          type: 'LEAVE_CHAT_ROOM',
          data: { chatRoomId: selectedChatRoom.id }
        });
      }
    };
  }, [selectedChatRoom, isConnected, user?.id]);

  const fetchChatRooms = async () => {
    try {
      const response = await fetch(`${getApiBaseUrl()}/chat/rooms`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setChatRooms(data);
      }
    } catch (error) {

    }
  };

  const fetchCompanyUsers = async () => {
    try {
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(`${getApiBaseUrl()}/chat/users`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCompanyUsers(data);
      } else {
        const errorData = await response.json();
        toast.error(`Failed to fetch users: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      toast.error('Failed to fetch company users');
    }
  };

  const fetchMessages = async (chatRoomId: number) => {
    try {
      const response = await fetch(`${getApiBaseUrl()}/chat/rooms/${chatRoomId}/messages`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      }
    } catch (error) {

    }
  };

  const showNewMessageNotification = () => {
    // Create browser notification if supported
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('New Message', {
        body: 'You have received a new message',
        icon: '/favicon.ico',
        tag: 'new-message'
      });
    }

  };

  const startChatWithUser = async (participantId: number) => {
    try {
      setIsLoading(true);
      const response = await fetch(`${getApiBaseUrl()}/chat/direct/${participantId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      
      if (response.ok) {
        const chatRoom = await response.json();
        setSelectedChatRoom(chatRoom);
        setShowUserList(false);
        setSearchQuery("");
        
        // Add to chat rooms if not already present
        if (!chatRooms.find(room => room.id === chatRoom.id)) {
          setChatRooms(prev => [chatRoom, ...prev]);
        }
      }
    } catch (error) {
      toast.error('Failed to start chat');
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedChatRoom) return;

    try {
      const response = await fetch(`${getApiBaseUrl()}/chat/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          chatRoomId: selectedChatRoom.id,
          content: newMessage.trim(),
          senderId: user?.id
        })
      });
      
      if (response.ok) {
        const message = await response.json();
        
        // Add message to local state immediately for instant display
        setMessages(prev => [...prev, message]);
        setNewMessage("");
        
        // Update chat room in list with new message
        setChatRooms(prev => 
          prev.map(room => 
            room.id === selectedChatRoom.id 
              ? { ...room, messages: [message, ...room.messages], updatedAt: new Date().toISOString() }
              : room
          )
        );
        
        // Note: Backend handles WebSocket broadcasting automatically after saving to database
        // No need to send via WebSocket here to avoid duplication
        
        // Stop typing indicator
        sendTypingIndicator(selectedChatRoom.id, false);
        
        // Scroll to bottom
        scrollToBottom();
      }
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    } else {
      // Send typing indicator when user starts typing
      if (selectedChatRoom && newMessage.trim()) {
        sendTypingIndicator(selectedChatRoom.id, true);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    
    // Send typing indicator when user types
    if (selectedChatRoom && e.target.value.trim()) {
      sendTypingIndicator(selectedChatRoom.id, true);
    }
  };

  const getOtherParticipant = (chatRoom: ChatRoom) => {
    return chatRoom.participants.find(p => p.user.id !== user?.id)?.user;
  };

  const getLastMessage = (chatRoom: ChatRoom) => {
    return chatRoom.messages[0];
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const filteredUsers = companyUsers.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!user) {
    return null;
  }

    return (
    <Layout>
      <div className="flex flex-col sm:flex-row h-[calc(100vh-4rem)] bg-gray-50">
        {/* Enhanced Chat Rooms Sidebar */}
        <div className={`w-full sm:w-80 lg:w-96 border-r border-gray-200 bg-white flex flex-col shadow-xl ${selectedChatRoom ? 'hidden sm:flex' : 'flex'}`}>
          <div className="p-3 sm:p-4 lg:p-6 border-b border-gray-100 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
            <div className="mb-3 sm:mb-4 lg:mb-6">
              <h2 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold mb-1 sm:mb-2 lg:mb-3">Cross-Company Chat</h2>
              <p className="text-blue-100 text-xs sm:text-sm lg:text-base xl:text-lg">Connect with trainees and managers from any company</p>
            </div>
            
            <Button
              onClick={() => setShowUserList(!showUserList)}
              className={`w-full h-9 sm:h-10 lg:h-12 font-semibold text-xs sm:text-sm lg:text-base rounded-lg sm:rounded-xl shadow-lg ${
                showUserList 
                  ? 'bg-white text-blue-600 hover:bg-blue-50' 
                  : 'bg-white/20 text-white hover:bg-white/30 border border-white/30'
              }`}
            >
              <Users className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 mr-1 sm:mr-2 lg:mr-3" />
              {showUserList ? 'Show Chats' : 'New Chat'}
            </Button>
            
            {showUserList && (
              <div className="mt-4 sm:mt-6 space-y-3 sm:space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                  <Input
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 sm:pl-12 h-9 sm:h-10 lg:h-12 text-sm sm:text-base border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg sm:rounded-xl bg-white/90"
                  />
                </div>
                <ScrollArea className="h-64 sm:h-80 lg:h-96">
                  <div className="space-y-2 sm:space-y-3 pr-2 sm:pr-3">
                    {filteredUsers.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center p-3 sm:p-4 lg:p-5 hover:bg-white/20 rounded-xl sm:rounded-2xl cursor-pointer transition-all duration-300 border border-transparent hover:border-white/30 hover:shadow-lg transform hover:-translate-y-1"
                        onClick={() => startChatWithUser(user.id)}
                      >
                        <Avatar className="h-10 w-10 sm:h-12 sm:w-12 lg:h-14 lg:w-14 mr-3 sm:mr-4 ring-2 sm:ring-4 ring-white/20">
                          <AvatarFallback className="text-sm sm:text-base lg:text-lg font-bold bg-gradient-to-br from-white to-blue-100 text-blue-600">
                            {user.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                            <p className="text-sm sm:text-base font-bold text-white truncate">{user.name}</p>
                            <Badge 
                              className={`text-xs px-2 sm:px-3 py-0.5 sm:py-1 font-semibold ${
                                user.role === 'ADMIN' 
                                  ? 'bg-yellow-500 text-white' 
                                  : 'bg-green-500 text-white'
                              }`}
                            >
                              {user.role}
                            </Badge>
                          </div>
                          <p className="text-xs sm:text-sm text-blue-100 truncate mb-1 sm:mb-2">{user.email}</p>
                          {user.company && (
                            <Badge className="text-xs px-2 sm:px-3 py-0.5 sm:py-1 bg-white/20 text-white border border-white/30">
                              {user.company.name}
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}
          </div>

          {!showUserList && (
            <div className="flex-1 overflow-hidden bg-white">
              <ScrollArea className="h-full">
                <div className="p-2 sm:p-3 space-y-1 sm:space-y-2">
                  {chatRooms.length === 0 ? (
                    <div className="text-center py-8 sm:py-12 lg:py-16">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                        <MessageCircle className="h-8 w-8 sm:h-10 sm:w-10 text-gray-400" />
                      </div>
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">No Chats Yet</h3>
                      <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">Start a new conversation to connect with others</p>
                      <Button 
                        onClick={() => setShowUserList(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl text-sm sm:text-base"
                      >
                        <Users className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                        Start New Chat
                      </Button>
                    </div>
                  ) : (
                    chatRooms.map((chatRoom) => {
                      const otherUser = getOtherParticipant(chatRoom);
                      const lastMessage = getLastMessage(chatRoom);
                       
                      return (
                        <div
                          key={chatRoom.id}
                          className={`flex items-center p-2 sm:p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                            selectedChatRoom?.id === chatRoom.id 
                              ? 'bg-blue-50 border border-blue-300' 
                              : 'hover:bg-gray-50 border border-transparent hover:border-gray-200'
                          }`}
                          onClick={() => setSelectedChatRoom(chatRoom)}
                        >
                          <Avatar className="h-8 w-8 sm:h-10 sm:w-10 mr-2 sm:mr-3">
                            <AvatarFallback className="text-xs sm:text-sm font-semibold bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                              {otherUser?.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-sm sm:text-base font-semibold text-gray-900 truncate">{otherUser?.name}</p>
                              {lastMessage && (
                                <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                                  {formatTime(lastMessage.createdAt)}
                                </span>
                              )}
                            </div>
                            {lastMessage && (
                              <div className="space-y-1">
                                <p className="text-xs sm:text-sm text-gray-600 truncate">
                                  <span className="font-medium text-blue-600">
                                    {lastMessage.sender.id === user.id ? 'You: ' : `${otherUser?.name}: `}
                                  </span>
                                  {lastMessage.content}
                                </p>
                                <div className="flex items-center gap-1">
                                  <Badge 
                                    className={`text-xs px-1.5 sm:px-2 py-0.5 ${
                                      otherUser?.role === 'ADMIN' 
                                        ? 'bg-yellow-100 text-yellow-800' 
                                        : 'bg-green-100 text-green-800'
                                    }`}
                                  >
                                    {otherUser?.role}
                                  </Badge>
                                  {otherUser?.company && (
                                    <Badge variant="outline" className="text-xs px-1.5 sm:px-2 py-0.5">
                                      {otherUser.company.name}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>

        {/* Enhanced Chat Area */}
        <div className="flex-1 flex flex-col bg-gray-50">
          {selectedChatRoom ? (
            <>
              {/* Mobile Chat Header - WhatsApp Style - Sticky */}
              <div className="sticky top-0 z-10 p-3 sm:p-4 lg:p-6 border-b border-gray-200 bg-white shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4 min-w-0 flex-1">
                    {/* Back button for mobile */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedChatRoom(null)}
                      className="sm:hidden h-8 w-8 p-0 hover:bg-gray-100 rounded-full mr-2"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </Button>
                    
                    <Avatar className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 ring-1 sm:ring-2 ring-gray-100">
                      <AvatarFallback className="text-sm sm:text-base lg:text-lg font-bold bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                        {getOtherParticipant(selectedChatRoom)?.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 truncate">
                        {getOtherParticipant(selectedChatRoom)?.name}
                      </h3>
                      <div className="flex items-center gap-1 sm:gap-2 mt-1">
                        {(() => {
                          const otherUser = getOtherParticipant(selectedChatRoom);
                          if (!otherUser) return null;
                          
                          return (
                            <>
                              <div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${
                                onlineUsers.has(otherUser.id) 
                                  ? 'bg-green-500' 
                                  : 'bg-gray-400'
                              }`} />
                              <span className="text-xs sm:text-sm text-gray-600">
                                {onlineUsers.has(otherUser.id) ? 'Online' : 'Offline'}
                              </span>
                              <Badge 
                                className={`text-xs px-1.5 sm:px-2 py-0.5 font-semibold ${
                                  otherUser.role === 'ADMIN' 
                                    ? 'bg-yellow-500 text-white' 
                                    : 'bg-green-500 text-white'
                                }`}
                              >
                                {otherUser.role}
                              </Badge>
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1 sm:gap-2">
                    {/* Connection Status - Hidden on mobile */}
                    <div className={`hidden sm:flex items-center gap-2 text-xs px-2 py-1 rounded-lg font-semibold ${
                      isConnected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {isConnected ? (
                        <Wifi className="h-3 w-3" />
                      ) : (
                        <WifiOff className="h-3 w-3" />
                      )}
                      <span className="hidden lg:inline">
                        {isConnected ? 'Connected' : 'Disconnected'}
                      </span>
                    </div>
                    
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setShowNotificationSettings(true)}
                      title="Notification Settings"
                      className="h-8 w-8 sm:h-9 sm:w-9 p-0 hover:bg-gray-100 rounded-full"
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 sm:h-9 sm:w-9 p-0 hover:bg-gray-100 rounded-full">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Messages - WhatsApp Style */}
              <div className="flex-1 overflow-hidden bg-gradient-to-b from-gray-50 to-white">
                <ScrollArea className="h-full">
                  <div className="p-2 sm:p-4 space-y-2 sm:space-y-3">
                    {messages.length === 0 ? (
                      <div className="text-center py-8 sm:py-12 lg:py-16">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                          <MessageCircle className="h-6 w-6 sm:h-8 sm:w-8 lg:h-10 lg:w-10 text-gray-400" />
                        </div>
                        <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 mb-2 sm:mb-3">No Messages Yet</h3>
                        <p className="text-gray-600 text-xs sm:text-sm lg:text-base">Start the conversation by sending your first message!</p>
                      </div>
                    ) : (
                      <>
                        {messages.map((message) => (
                          <div
                            key={message.id}
                            className={`flex ${message.senderId === user.id ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-xs sm:max-w-sm lg:max-w-md px-3 py-2 rounded-2xl ${
                                message.senderId === user.id
                                  ? 'bg-blue-500 text-white rounded-br-md'
                                  : 'bg-white text-gray-900 border border-gray-200 rounded-bl-md'
                              }`}
                            >
                              <p className="text-sm leading-relaxed break-words">{message.content}</p>
                              <p className={`text-xs mt-1 ${
                                message.senderId === user.id ? 'text-blue-100' : 'text-gray-500'
                              }`}>
                                {formatTime(message.createdAt)}
                              </p>
                            </div>
                          </div>
                        ))}
                        
                        {/* Typing Indicator */}
                        {typingUsers.size > 0 && (
                          <div className="flex justify-start">
                            <div className="bg-white text-gray-900 px-3 py-2 rounded-2xl border border-gray-200 rounded-bl-md">
                              <div className="flex items-center gap-2">
                                <div className="flex space-x-1">
                                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"></div>
                                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                </div>
                                <span className="text-xs text-gray-600">
                                  {Array.from(typingUsers).map(userId => {
                                    const typingUser = companyUsers.find(u => u.id === userId);
                                    return typingUser?.name;
                                  }).filter(Boolean).join(', ')} is typing...
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                    
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>
              </div>

              {/* Mobile Message Input - WhatsApp Style - Sticky */}
              <div className="sticky bottom-0 z-10 p-2 sm:p-4 lg:p-6 border-t border-gray-200 bg-white shadow-sm">
                <div className="flex space-x-2 sm:space-x-3">
                  <div className="flex-1 relative">
                    <Input
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={handleInputChange}
                      onKeyPress={handleKeyPress}
                      className="pr-10 sm:pr-12 h-9 sm:h-10 lg:h-12 text-sm sm:text-base border border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-full sm:rounded-2xl shadow-sm"
                    />
                    <Button 
                      onClick={sendMessage} 
                      disabled={!newMessage.trim()}
                      size="sm"
                      className="absolute right-1 sm:right-2 top-1/2 transform -translate-y-1/2 h-7 w-7 sm:h-8 sm:w-8 p-0 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 rounded-full shadow-sm"
                    >
                      <Send className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>

      {/* Notification Settings Modal */}
      {showNotificationSettings && (
        <NotificationSettings onClose={() => setShowNotificationSettings(false)} />
      )}
    </Layout>
  );
}
