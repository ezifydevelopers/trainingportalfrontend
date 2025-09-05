import { useState, useEffect, useRef } from "react";
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
  }, [user]);

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

  const fetchUnreadCount = async () => {
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

    // Show toast notification
    toast.success('New message received!', {
      action: {
        label: 'View',
        onClick: () => setShowUserList(false)
      }
    });
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
      <div className="flex h-[calc(100vh-4rem)] bg-white">
                 {/* Chat Rooms Sidebar */}
         <div className="w-80 border-r border-gray-200 bg-white flex flex-col shadow-sm">
           <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
             <div className="mb-4">
               <h2 className="text-xl font-bold text-gray-900 mb-2">Cross-Company Chat</h2>
               <p className="text-sm text-gray-600">Connect with trainees and managers from any company</p>
             </div>
             
             <Button
               size="sm"
               onClick={() => setShowUserList(!showUserList)}
               variant={showUserList ? "default" : "outline"}
               className="w-full h-10 font-medium"
             >
               <Users className="h-4 w-4 mr-2" />
               {showUserList ? 'Show Chats' : 'New Chat'}
             </Button>
            
                         {showUserList && (
               <div className="mt-4 space-y-3">
                 <div className="relative">
                   <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                   <Input
                     placeholder="Search users by name or email..."
                     value={searchQuery}
                     onChange={(e) => setSearchQuery(e.target.value)}
                     className="pl-10 h-10 text-sm border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                   />
                 </div>
                                 <ScrollArea className="h-80">
                   <div className="space-y-2 pr-2">
                     {filteredUsers.map((user) => (
                       <div
                         key={user.id}
                         className="flex items-center p-4 hover:bg-blue-50 rounded-xl cursor-pointer transition-all duration-200 border border-transparent hover:border-blue-200 hover:shadow-sm"
                         onClick={() => startChatWithUser(user.id)}
                       >
                         <Avatar className="h-12 w-12 mr-4 ring-2 ring-gray-100">
                           <AvatarFallback className="text-base font-semibold bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                             {user.name.charAt(0)}
                           </AvatarFallback>
                         </Avatar>
                         <div className="flex-1 min-w-0">
                           <div className="flex items-center gap-2 mb-1">
                             <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
                             <Badge 
                               variant={user.role === 'ADMIN' ? "default" : "secondary"} 
                               className="text-xs px-2 py-1 font-medium"
                             >
                               {user.role}
                             </Badge>
                           </div>
                           <p className="text-xs text-gray-500 truncate mb-2">{user.email}</p>
                           {user.company && (
                             <Badge variant="outline" className="text-xs px-3 py-1 bg-gray-50 text-gray-700 border-gray-200">
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
            <div className="flex-1 overflow-hidden">
              <ScrollArea className="h-full">
                                 <div className="p-3 space-y-2">
                   {chatRooms.length === 0 ? (
                     <div className="text-center py-12 text-gray-500">
                       <MessageCircle className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                       <p className="text-sm font-medium">No chats yet</p>
                       <p className="text-xs">Start a new conversation</p>
                     </div>
                   ) : (
                     chatRooms.map((chatRoom) => {
                       const otherUser = getOtherParticipant(chatRoom);
                       const lastMessage = getLastMessage(chatRoom);
                        
                       return (
                         <div
                           key={chatRoom.id}
                           className={`flex items-center p-4 rounded-xl cursor-pointer transition-all duration-200 ${
                             selectedChatRoom?.id === chatRoom.id 
                               ? 'bg-blue-100 border border-blue-300 shadow-sm' 
                               : 'hover:bg-gray-50 border border-transparent hover:border-gray-200 hover:shadow-sm'
                           }`}
                           onClick={() => setSelectedChatRoom(chatRoom)}
                         >
                           <Avatar className="h-11 w-11 mr-4 ring-2 ring-gray-100">
                             <AvatarFallback className="text-sm font-semibold bg-gradient-to-br from-gray-500 to-gray-600 text-white">
                               {otherUser?.name.charAt(0)}
                             </AvatarFallback>
                           </Avatar>
                           <div className="flex-1 min-w-0">
                             <div className="flex items-center justify-between mb-2">
                               <p className="text-sm font-semibold text-gray-900 truncate">{otherUser?.name}</p>
                               {lastMessage && (
                                 <span className="text-xs text-gray-500 flex-shrink-0 ml-2 bg-gray-100 px-2 py-1 rounded-full">
                                   {formatTime(lastMessage.createdAt)}
                                 </span>
                               )}
                             </div>
                             {lastMessage && (
                               <p className="text-xs text-gray-600 truncate leading-relaxed">
                                 {lastMessage.sender.id === user.id ? 'You: ' : ''}
                                 {lastMessage.content}
                               </p>
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

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-gray-50/30">
          {selectedChatRoom ? (
            <>
                             {/* Chat Header */}
               <div className="p-6 border-b border-gray-100 bg-white shadow-sm">
                 <div className="flex items-center justify-between">
                   <div className="flex items-center">
                     <Avatar className="h-12 w-12 mr-4 ring-2 ring-gray-100">
                       <AvatarFallback className="text-base font-semibold bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                         {getOtherParticipant(selectedChatRoom)?.name.charAt(0)}
                       </AvatarFallback>
                     </Avatar>
                     <div>
                       <h3 className="font-bold text-gray-900 text-xl mb-2">
                         {getOtherParticipant(selectedChatRoom)?.name}
                       </h3>
                       <div className="flex items-center gap-3">
                         <Badge 
                           variant={getOtherParticipant(selectedChatRoom)?.role === 'ADMIN' ? "default" : "secondary"} 
                           className="text-xs px-3 py-1 font-medium"
                         >
                           {getOtherParticipant(selectedChatRoom)?.role}
                         </Badge>
                         {/* Company Badge */}
                         {getOtherParticipant(selectedChatRoom)?.company && (
                           <Badge variant="outline" className="text-xs px-3 py-1 bg-gray-50 text-gray-700 border-gray-200">
                             {getOtherParticipant(selectedChatRoom)?.company?.name}
                           </Badge>
                         )}
                         {/* Online/Offline Status */}
                         {getOtherParticipant(selectedChatRoom) && (
                           <div className="flex items-center gap-2 ml-3">
                             <div className={`w-3 h-3 rounded-full ${
                               onlineUsers.has(getOtherParticipant(selectedChatRoom)!.id) 
                                 ? 'bg-green-500' 
                                 : 'bg-gray-400'
                             }`} />
                             <span className="text-xs font-medium text-gray-600">
                               {onlineUsers.has(getOtherParticipant(selectedChatRoom)!.id) ? 'Online' : 'Offline'}
                             </span>
                           </div>
                         )}
                       </div>
                     </div>
                   </div>
                                     <div className="flex items-center gap-3">
                     {/* Connection Status */}
                     <div className={`flex items-center gap-2 text-xs px-3 py-2 rounded-full ${
                       isConnected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                     }`}>
                       {isConnected ? (
                         <Wifi className="h-4 w-4" />
                       ) : (
                         <WifiOff className="h-4 w-4" />
                       )}
                       <span className="font-medium">
                         {isConnected ? 'Connected' : 'Disconnected'}
                       </span>
                     </div>
                     
                     <Button 
                       variant="ghost" 
                       size="sm"
                       onClick={() => setShowNotificationSettings(true)}
                       title="Notification Settings"
                       className="h-9 w-9 p-0 hover:bg-gray-100"
                     >
                       <Settings className="h-4 w-4" />
                     </Button>
                     <Button variant="ghost" size="sm" className="h-9 w-9 p-0 hover:bg-gray-100">
                       <MoreVertical className="h-4 w-4" />
                     </Button>
                   </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-hidden bg-gradient-to-b from-gray-50/50 to-white">
                <ScrollArea className="h-full">
                  <div className="p-6 space-y-4">
                    {messages.length === 0 ? (
                      <div className="text-center py-12 text-gray-500">
                        <MessageCircle className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                        <p className="text-sm font-medium">No messages yet</p>
                        <p className="text-xs">Start the conversation!</p>
                      </div>
                    ) : (
                      <>
                        {messages.map((message) => (
                          <div
                            key={message.id}
                            className={`flex ${message.senderId === user.id ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-sm ${
                                message.senderId === user.id
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-white text-gray-900 border border-gray-200'
                              }`}
                            >
                              <p className="text-sm leading-relaxed">{message.content}</p>
                              <p className={`text-xs mt-2 ${
                                message.senderId === user.id ? 'text-blue-100' : 'text-gray-400'
                              }`}>
                                {formatTime(message.createdAt)}
                              </p>
                            </div>
                          </div>
                        ))}
                        
                        {/* Typing Indicator */}
                        {typingUsers.size > 0 && (
                          <div className="flex justify-start">
                            <div className="bg-white text-gray-900 px-4 py-3 rounded-2xl border border-gray-200 shadow-sm">
                              <div className="flex items-center gap-3">
                                <div className="flex space-x-1">
                                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
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

                             {/* Message Input */}
               <div className="p-6 border-t border-gray-100 bg-white shadow-sm">
                 <div className="flex space-x-3">
                   <div className="flex-1 relative">
                     <Input
                       placeholder="Type your message here..."
                       value={newMessage}
                       onChange={handleInputChange}
                       onKeyPress={handleKeyPress}
                       className="pr-14 h-12 text-sm border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl shadow-sm"
                     />
                     <Button 
                       onClick={sendMessage} 
                       disabled={!newMessage.trim()}
                       size="sm"
                       className="absolute right-2 top-1/2 transform -translate-y-1/2 h-9 w-9 p-0 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 rounded-lg shadow-sm"
                     >
                       <Send className="h-4 w-4" />
                     </Button>
                   </div>
                 </div>
               </div>
            </>
          ) : (
                         /* Welcome Screen */
             <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50">
               <div className="text-center max-w-lg mx-auto px-8">
                 <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-8 shadow-xl">
                   <MessageCircle className="h-12 w-12 text-white" />
                 </div>
                 <h3 className="text-3xl font-bold text-gray-900 mb-4">
                   Welcome to Cross-Company Chat
                 </h3>
                 <p className="text-gray-600 mb-8 leading-relaxed text-lg">
                   Connect with trainees and managers from any company. Start meaningful conversations and build professional relationships across organizations.
                 </p>
                 <Button 
                   onClick={() => setShowUserList(true)}
                   size="lg"
                   className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 px-8 py-4 rounded-xl shadow-lg text-white font-semibold text-base"
                 >
                   <Users className="h-5 w-5 mr-3" />
                   Start New Chat
                 </Button>
               </div>
             </div>
          )}
        </div>
      </div>

      {/* Notification Settings Modal */}
      {showNotificationSettings && (
        <NotificationSettings onClose={() => setShowNotificationSettings(false)} />
      )}
    </Layout>
  );
}
