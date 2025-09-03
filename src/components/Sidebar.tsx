
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useGetHelpRequests } from "@/hooks/useApi";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import ChatNotification from "./ChatNotification";
import { 
  BookOpen, 
  GraduationCap, 
  Trophy, 
  Users, 
  HelpCircle,
  MessageSquare,
  MessageCircle
} from "lucide-react";

interface NavItem {
  name: string;
  path: string;
  icon: JSX.Element;
  roles?: string[];
  badge?: number;
}

interface SidebarProps {
  unreadCount?: number;
}

export default function Sidebar({ unreadCount = 0 }: SidebarProps) {
  const { user } = useAuth();
  const location = useLocation();
  const { data: helpRequests = [] } = useGetHelpRequests();

  // Calculate pending help requests count
  const pendingHelpRequests = helpRequests.filter(r => r.status === 'PENDING').length;

  // Training navigation for trainees
  const traineeNavItems: NavItem[] = [
    { 
      name: "Training Dashboard", 
      path: "/training", 
      icon: <GraduationCap className="w-5 h-5 mr-2" /> 
    },
    { 
      name: "My Progress", 
      path: "/training/progress", 
      icon: <Trophy className="w-5 h-5 mr-2" /> 
    },
    { 
      name: "Chat", 
      path: "/chat", 
      icon: <MessageCircle className="w-5 h-5 mr-2" />,
      badge: unreadCount > 0 ? unreadCount : undefined
    }
  ];

  // Admin navigation for training management
  const adminNavItems: NavItem[] = [
    { 
      name: "Trainee Management", 
      path: "/admin/track-trainee", 
      icon: <Users className="w-5 h-5 mr-2" /> 
    },
    { 
      name: "Training Modules", 
      path: "/admin/company-modules", 
      icon: <BookOpen className="w-5 h-5 mr-2" /> 
    },
    { 
      name: "Help Requests", 
      path: "/admin/help-requests", 
      icon: <HelpCircle className="w-5 h-5 mr-2" />,
      badge: pendingHelpRequests > 0 ? pendingHelpRequests : undefined
    },
    { 
      name: "Feedback", 
      path: "/admin/feedback", 
      icon: <MessageSquare className="w-5 h-5 mr-2" /> 
    },
    { 
      name: "Chat", 
      path: "/chat", 
      icon: <MessageCircle className="w-5 h-5 mr-2" />,
      badge: unreadCount > 0 ? unreadCount : undefined
    }
  ];

  // Choose navigation based on user role
  let navigationItems: NavItem[] = [];
  
  if (user?.role === "TRAINEE") {
    navigationItems = traineeNavItems;
  } else if (user?.role === "ADMIN") {
    navigationItems = adminNavItems;
  }

  const getTitle = () => {
    return "Training Portal";
  };

  return (
    <div className="w-56 bg-white border-r border-gray-200 h-screen flex flex-col overflow-y-auto">
      <div className="p-4 border-b">
        <div className="flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-blue-600" />
          <h1 className="text-lg font-bold text-blue-600">{getTitle()}</h1>
        </div>
      </div>
      <div className="flex-1">
        <nav className="px-2 py-3">
          <ul className="space-y-1">
            {navigationItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={cn(
                    "flex items-center px-4 py-3 rounded-md hover:bg-blue-50 transition-colors",
                    location.pathname === item.path ? "bg-blue-100 font-medium text-blue-700" : "text-gray-700"
                  )}
                >
                  {item.icon}
                  {item.name}
                  {item.badge && (
                    <Badge variant="secondary" className="ml-2">
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
}
