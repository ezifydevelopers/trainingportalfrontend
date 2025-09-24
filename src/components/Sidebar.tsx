
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useGetHelpRequests, useAllCompanies, useGetManagerCompanies } from "@/hooks/useApi";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { 
  BookOpen, 
  GraduationCap, 
  Trophy, 
  Users, 
  HelpCircle,
  MessageSquare,
  MessageCircle,
  UserCog,
  Building2,
  Award,
  X
} from "lucide-react";

interface NavItem {
  name: string;
  path: string;
  icon: JSX.Element;
  roles?: string[];
  badge?: number;
  children?: NavItem[];
}

interface SidebarProps {
  onClose?: () => void;
}

export default function Sidebar({ onClose }: SidebarProps) {
  const { user } = useAuth();
  const location = useLocation();
  const { data: helpRequests = [] } = useGetHelpRequests();

  // Get only assigned companies for manager
  const { data: managerCompaniesData, isLoading: managerCompaniesLoading } = useGetManagerCompanies(user?.id || 0);
  const managerCompanies = user?.role === 'MANAGER' 
    ? (managerCompaniesData?.companies?.map((assignment: { company: { id: number; name: string; logo?: string } }) => assignment.company) || [])
    : [];

  // Debug logging
  if (user?.role === 'MANAGER') {

  }

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
    }
  ];

  // Manager navigation - simplified with single Trainees and Progress
  const managerNavItems: NavItem[] = [
    { 
      name: "Manager Dashboard", 
      path: "/manager", 
      icon: <UserCog className="w-5 h-5 mr-2" /> 
    },
    { 
      name: "Trainees", 
      path: "/manager/trainees", 
      icon: <Users className="w-5 h-5 mr-2" /> 
    },
    { 
      name: "Progress", 
      path: "/manager/progress", 
      icon: <Trophy className="w-5 h-5 mr-2" /> 
    },
    { 
      name: "Chat", 
      path: "/chat", 
      icon: <MessageCircle className="w-5 h-5 mr-2" />,
    }
  ];

  // Admin navigation for training management
  const adminNavItems: NavItem[] = [
    { 
      name: "Pending Trainees", 
      path: "/admin/pending-trainees", 
      icon: <Users className="w-5 h-5 mr-2" /> 
    },
    { 
      name: "Trainee Management", 
      path: "/admin/track-trainee", 
      icon: <Users className="w-5 h-5 mr-2" /> 
    },
    { 
      name: "Manager Management", 
      path: "/admin/managers", 
      icon: <UserCog className="w-5 h-5 mr-2" /> 
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
    }
  ];

  // Choose navigation based on user role
  let navigationItems: NavItem[] = [];
  
  if (user?.role === "TRAINEE") {
    navigationItems = traineeNavItems;
  } else if (user?.role === "MANAGER") {
    navigationItems = managerNavItems;
  } else if (user?.role === "ADMIN") {
    navigationItems = adminNavItems;
  }

  const getTitle = () => {
    return "Training Portal";
  };

  const isPathActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <div className="w-56 bg-white border-r border-gray-200 h-screen flex flex-col overflow-y-auto">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-blue-600" />
            <h1 className="text-lg font-bold text-blue-600">{getTitle()}</h1>
          </div>
          {onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="md:hidden"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
      <div className="flex-1">
        <nav className="px-2 py-3">
          <ul className="space-y-1">
            {user?.role === 'MANAGER' && managerCompaniesLoading && (
              <li className="px-4 py-3 text-sm text-gray-500">
                Loading companies...
              </li>
            )}
            {user?.role === 'MANAGER' && !managerCompaniesLoading && managerCompanies.length === 0 && (
              <li className="px-4 py-3 text-sm text-gray-500">
                No companies assigned
              </li>
            )}
            {navigationItems.map((item, index) => (
              <li key={`${item.path}-${index}`}>
                {item.path === "#" ? (
                  // Company header (non-clickable)
                  <div className="px-4 py-2 mt-4 first:mt-0">
                    <div className="flex items-center text-gray-500 text-sm font-semibold uppercase tracking-wide">
                      {item.icon}
                      {item.name}
                    </div>
                  </div>
                ) : (
                  // Regular clickable item
                  <Link
                    to={item.path}
                    onClick={onClose}
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
                )}
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
}
