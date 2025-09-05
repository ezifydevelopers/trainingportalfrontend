import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { MessageCircle } from "lucide-react";
import { getApiBaseUrl } from "@/lib/api";

interface ChatNotificationProps {
  className?: string;
}

export default function ChatNotification({ className = "" }: ChatNotificationProps) {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchUnreadCount();
    
    // Poll for unread messages every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    
    return () => clearInterval(interval);
  }, []);

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
      }
    } catch (error) {
    }
  };

  if (unreadCount === 0) {
    return null;
  }

  return (
    <div className={`relative ${className}`}>
      <MessageCircle className="h-5 w-5" />
      <Badge 
        variant="destructive" 
        className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
      >
        {unreadCount > 99 ? '99+' : unreadCount}
      </Badge>
    </div>
  );
}
