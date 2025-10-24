import { useState, useEffect, useRef } from "react";
import { MessageSquare, Send, Paperclip, Image, Video, File, Phone, VideoIcon, MoreHorizontal } from "lucide-react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import withAuth from "@/components/withAuth";
import withRole from "@/components/withRole";
import { HOCPresets } from "@/components/HOCComposer";

interface Message {
  id: string;
  senderId: string;
  recipientId: string;
  content: string;
  timestamp: Date;
  attachmentType?: "image" | "video" | "document";
  attachmentUrl?: string;
}

interface Conversation {
  id: string;
  participants: string[];
  messages: Message[];
  lastMessageTimestamp: Date;
}


interface MessagesProps {
  user?: any;
  isAuthenticated?: boolean;
}
function Messages({ user, isAuthenticated }: MessagesProps) {
  const { allUsers, user } = useAuth();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [showAttachmentOptions, setShowAttachmentOptions] = useState(false);
  const [attachment, setAttachment] = useState<File | null>(null);
  const [attachmentType, setAttachmentType] = useState<"image" | "video" | "document" | null>(null);
  const [attachmentPreview, setAttachmentPreview] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Get users excluding current user
  const chatUsers = allUsers?.filter(u => u.id !== user?.id) || [];
  
  // Filter users based on search query
  const filteredChatUsers = chatUsers.filter(chatUser =>
    chatUser.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Load conversations from localStorage on component mount
  useEffect(() => {
    const storedConversations = localStorage.getItem("conversations");
    if (storedConversations) {
      try {
        const parsedConversations = JSON.parse(storedConversations);
        // Convert string dates back to Date objects
        const conversationsWithDates = parsedConversations.map((conv: any) => ({
          ...conv,
          lastMessageTimestamp: new Date(conv.lastMessageTimestamp),
          messages: conv.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }))
        }));
        setConversations(conversationsWithDates);
      } catch (error) {
      }
    }
  }, []);
  
  // Save conversations to localStorage whenever they change
  useEffect(() => {
    if (conversations.length > 0) {
      localStorage.setItem("conversations", JSON.stringify(conversations));
    }
  }, [conversations]);
  
  // Select first user by default if none selected and users exist
  useEffect(() => {
    if (!selectedUserId && chatUsers.length > 0) {
      setSelectedUserId(chatUsers[0].id);
    }
  }, [chatUsers, selectedUserId]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversations]);
  
  const getConversationId = (userId1: string, userId2: string) => {
    // Create a consistent ID by sorting user IDs alphabetically and joining
    return [userId1, userId2].sort().join("-");
  };
  
  const getCurrentConversation = () => {
    if (!user || !selectedUserId) return null;
    
    const conversationId = getConversationId(user.id, selectedUserId);
    const existingConversation = conversations.find(c => c.id === conversationId);
    
    if (existingConversation) {
      return existingConversation;
    }
    
    return null;
  };

  const getLastMessage = (userId: string) => {
    if (!user) return null;
    const conversationId = getConversationId(user.id, userId);
    const conversation = conversations.find(c => c.id === conversationId);
    if (!conversation || conversation.messages.length === 0) return null;
    return conversation.messages[conversation.messages.length - 1];
  };

  const handleFileSelect = (type: "image" | "video" | "document") => {
    setAttachmentType(type);
    
    if (fileInputRef.current) {
      // Set accepted file types based on attachment type
      if (type === "image") {
        fileInputRef.current.accept = "image/*";
      } else if (type === "video") {
        fileInputRef.current.accept = "video/*";
      } else {
        fileInputRef.current.accept = ".pdf,.doc,.docx,.txt";
      }
      
      fileInputRef.current.click();
    }
    
    setShowAttachmentOptions(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (!file) {
      setAttachment(null);
      setAttachmentPreview(null);
      return;
    }
    
    setAttachment(file);
    
    // Create preview for images
    if (attachmentType === "image" && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setAttachmentPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else if (attachmentType === "video" && file.type.startsWith("video/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setAttachmentPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      // For documents, just show the file name
      setAttachmentPreview(file.name);
    }
  };

  const clearAttachment = () => {
    setAttachment(null);
    setAttachmentPreview(null);
    setAttachmentType(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };
  
  const handleSendMessage = () => {
    if ((!messageInput.trim() && !attachment) || !user || !selectedUserId) return;
    
    const conversationId = getConversationId(user.id, selectedUserId);
    const now = new Date();
    
    // Create base message
    const newMessage: Message = {
      id: Math.random().toString(36).substring(2, 11),
      senderId: user.id,
      recipientId: selectedUserId,
      content: messageInput.trim(),
      timestamp: now,
    };

    // Add attachment info if present
    if (attachment && attachmentType) {
      // In a real app, we'd upload the file to a server and get a URL back
      // For this demo, we're creating object URLs from the file
      const objectUrl = URL.createObjectURL(attachment);
      
      newMessage.attachmentType = attachmentType;
      newMessage.attachmentUrl = objectUrl;
    }
    
    const existingConversation = conversations.find(c => c.id === conversationId);
    
    if (existingConversation) {
      // Update existing conversation
      setConversations(conversations.map(c => 
        c.id === conversationId 
          ? { 
              ...c, 
              messages: [...c.messages, newMessage],
              lastMessageTimestamp: now
            } 
          : c
      ));
    } else {
      // Create new conversation
      const newConversation: Conversation = {
        id: conversationId,
        participants: [user.id, selectedUserId],
        messages: [newMessage],
        lastMessageTimestamp: now
      };
      
      setConversations([...conversations, newConversation]);
    }
    
    // Clear input and attachment after sending
    setMessageInput("");
    clearAttachment();
    toast.success("Message sent");
  };
  
  const handleAttachment = (type: "image" | "video" | "document") => {
    handleFileSelect(type);
  };
  
  const currentConversation = getCurrentConversation();
  const selectedUser = allUsers?.find(u => u.id === selectedUserId);
  
  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const formatChatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Layout>
      <div className="flex h-[calc(100vh-64px)] bg-white">
        {/* Sidebar */}
        <div className="w-80 border-r border-gray-200 bg-white flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-xl font-semibold">Chats</h1>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Phone className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <VideoIcon className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {/* Search */}
            <div className="relative">
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-4 pr-4 h-10 bg-gray-50 border-0 rounded-lg"
              />
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            <Button variant="ghost" className="flex-1 justify-start p-4 h-12 rounded-none border-b-2 border-blue-500 text-blue-600">
              Chats
            </Button>
            <Button variant="ghost" className="flex-1 justify-start p-4 h-12 rounded-none text-gray-500">
              Calls
            </Button>
            <Button variant="ghost" className="flex-1 justify-start p-4 h-12 rounded-none text-gray-500">
              Contacts
            </Button>
            <Button variant="ghost" className="flex-1 justify-start p-4 h-12 rounded-none text-gray-500">
              Notification
            </Button>
          </div>

          {/* Chat list */}
          <div className="flex-1 overflow-y-auto">
            {filteredChatUsers.map(chatUser => {
              const lastMessage = getLastMessage(chatUser.id);
              const isSelected = selectedUserId === chatUser.id;
              
              return (
                <button
                  key={chatUser.id}
                  onClick={() => setSelectedUserId(chatUser.id)}
                  className={`w-full text-left p-4 hover:bg-gray-50 transition-colors border-l-4 ${
                    isSelected ? "bg-blue-50 border-blue-500" : "border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-blue-500 text-white">
                          {chatUser.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900 truncate">{chatUser.name}</h3>
                        {lastMessage && (
                          <span className="text-xs text-gray-500">
                            {formatTime(lastMessage.timestamp)}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 truncate">
                        {lastMessage ? lastMessage.content || "Media message" : "No messages yet"}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col">
          {selectedUser ? (
            <>
              {/* Chat header */}
              <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-blue-500 text-white">
                        {selectedUser.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                  </div>
                  <div>
                    <h2 className="font-semibold text-gray-900">{selectedUser.name}</h2>
                    <p className="text-sm text-green-600">Active now</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="h-9 w-9">
                    <Phone className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-9 w-9">
                    <VideoIcon className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-9 w-9">
                    <MoreHorizontal className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
                <div className="space-y-4">
                  {currentConversation?.messages.length ? (
                    currentConversation.messages.map((message, index) => {
                      const isOwnMessage = message.senderId === user?.id;
                      const showTime = index === 0 || 
                        currentConversation.messages[index - 1].timestamp.getTime() - message.timestamp.getTime() > 300000;

                      return (
                        <div key={message.id} className="space-y-1">
                          {showTime && (
                            <div className="text-center">
                              <span className="text-xs text-gray-500 bg-white px-3 py-1 rounded-full">
                                Today, {formatChatTime(message.timestamp)}
                              </span>
                            </div>
                          )}
                          <div className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}>
                            <div className={`max-w-xs lg:max-w-md ${isOwnMessage ? "order-2" : ""}`}>
                              {/* Attachment rendering */}
                              {message.attachmentType === "image" && message.attachmentUrl && (
                                <div className="mb-2 rounded-2xl overflow-hidden">
                                  <AspectRatio ratio={16 / 9} className="bg-muted">
                                    <img 
                                      src={message.attachmentUrl} 
                                      alt="Image attachment" 
                                      className="w-full h-full object-cover"
                                    />
                                  </AspectRatio>
                                </div>
                              )}
                              
                              {message.attachmentType === "video" && message.attachmentUrl && (
                                <div className="mb-2 rounded-2xl overflow-hidden">
                                  <video 
                                    src={message.attachmentUrl} 
                                    controls 
                                    className="w-full max-h-60"
                                  />
                                </div>
                              )}
                              
                              {message.attachmentType === "document" && message.attachmentUrl && (
                                <div className="mb-2 flex items-center gap-2 text-sm p-3 bg-white rounded-2xl border">
                                  <File className="h-4 w-4" />
                                  <a 
                                    href={message.attachmentUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="underline break-all"
                                  >
                                    Document attachment
                                  </a>
                                </div>
                              )}
                              
                              {/* Message content */}
                              {message.content && (
                                <div className={`px-4 py-2 rounded-2xl ${
                                  isOwnMessage 
                                    ? "bg-blue-500 text-white" 
                                    : "bg-white text-gray-900 shadow-sm"
                                }`}>
                                  {message.content}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="flex h-full items-center justify-center text-gray-500 flex-col">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                          <MessageSquare className="h-8 w-8 text-gray-400" />
                        </div>
                        <p className="text-lg font-medium">No messages yet</p>
                        <p className="text-sm">Start the conversation with {selectedUser.name}!</p>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Attachment preview */}
              {attachmentPreview && (
                <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
                  <div className="relative rounded-lg border border-gray-200 p-3 bg-white">
                    <button 
                      onClick={clearAttachment}
                      className="absolute top-2 right-2 bg-gray-200 rounded-full h-6 w-6 flex items-center justify-center text-gray-600 hover:bg-gray-300"
                    >
                      ×
                    </button>
                    
                    {attachmentType === "image" && (
                      <img 
                        src={attachmentPreview} 
                        alt="Upload preview" 
                        className="max-h-32 rounded-lg"
                      />
                    )}
                    
                    {attachmentType === "video" && (
                      <video 
                        src={attachmentPreview} 
                        className="max-h-32 rounded-lg" 
                        controls
                      />
                    )}
                    
                    {attachmentType === "document" && (
                      <div className="flex items-center gap-3">
                        <File className="h-6 w-6 text-gray-500" />
                        <span className="text-sm text-gray-700 truncate">{attachmentPreview}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Hidden file input */}
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileChange}
              />

              {/* Message input */}
              <div className="bg-white border-t border-gray-200 p-4">
                <div className="flex items-end gap-3">
                  <div className="relative">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowAttachmentOptions(!showAttachmentOptions)}
                      className="h-10 w-10"
                    >
                      <Paperclip className="h-5 w-5" />
                    </Button>
                    {showAttachmentOptions && (
                      <div className="absolute bottom-full left-0 mb-2 bg-white rounded-lg shadow-lg border border-gray-200 p-2 flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleFileSelect("image")}
                          title="Photo"
                          className="h-10 w-10"
                        >
                          <Image className="h-5 w-5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleFileSelect("video")}
                          title="Video"
                          className="h-10 w-10"
                        >
                          <Video className="h-5 w-5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleFileSelect("document")}
                          title="Document"
                          className="h-10 w-10"
                        >
                          <File className="h-5 w-5" />
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 relative">
                    <Input
                      placeholder="Type a message"
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      className="pr-12 h-10 rounded-full border-gray-300"
                    />
                    <Button
                      type="button"
                      size="icon"
                      onClick={handleSendMessage}
                      className="absolute right-1 top-1 h-8 w-8 rounded-full"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex h-full items-center justify-center text-gray-500 flex-col bg-gray-50">
              <div className="text-center">
                <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                  <MessageSquare className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">Your Messages</h3>
                <p className="text-gray-600 max-w-sm">
                  Send private photos and messages to a friend or group
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
// Export with authentication and role protection
// Export with comprehensive HOC protection
export default HOCPresets.managerPage(Messages);
