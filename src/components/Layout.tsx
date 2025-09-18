import { ReactNode, useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Sidebar from "./Sidebar";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import NotificationBell from "./NotificationBell";

export default function Layout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/");
  };


  const getInitials = (name: string): string => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  // Hide sidebar on trainee progress detail view
  const hideSidebar = location.pathname.startsWith("/admin/track-trainee/") && location.pathname.split("/").length === 4;

  return (
    <div className="flex h-screen bg-gray-50">
      {!hideSidebar && <Sidebar />}
      <div className="flex-1 flex flex-col">
        <header className="bg-white border-b border-gray-200 flex items-center justify-between px-6 py-4">
          <div className="flex-1"></div>
          <div className="flex items-center gap-2">
            {/* System Notifications */}
            {(user?.role === 'ADMIN' || user?.role === 'MANAGER') && (
              <NotificationBell />
            )}
            
            <div className="flex items-center gap-3 pl-3 border-l border-gray-200">
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">{user?.name}</div>
                <div className="text-xs text-gray-500 capitalize">{user?.role}</div>
              </div>
              <div className="h-10 w-10 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-semibold">
                {user && getInitials(user.name)}
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleLogout}
                className="text-gray-600 hover:text-red-600"
              >
                <LogOut className="h-4 w-4 mr-1" />
                Logout
              </Button>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
