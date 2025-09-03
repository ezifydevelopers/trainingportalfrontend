
import { createContext, useContext, ReactNode } from "react";
import { useAuth, UserRole } from "./AuthContext";
import { Navigate } from "react-router-dom";

interface RouterContextType {
  RequireAuth: ({ children, allowedRoles }: { children: ReactNode, allowedRoles: UserRole[] }) => JSX.Element;
}

const RouterContext = createContext<RouterContextType | undefined>(undefined);

export function RouterProvider({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();

  const RequireAuth = ({ children, allowedRoles }: { children: ReactNode, allowedRoles: UserRole[] }) => {
    // Show loading state while authentication is being restored
    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg font-medium">Loading...</p>
            <p className="text-gray-500 text-sm mt-2">Please wait while we restore your session</p>
          </div>
        </div>
      );
    }

    // If not loading and no user, redirect to login
    if (!user) {
      return <Navigate to="/login/TRAINEE" />;
    }

    // If user doesn't have permission, redirect to unauthorized
    if (!allowedRoles.includes(user.role)) {
      return <Navigate to="/unauthorized" />;
    }

    return <>{children}</>;
  };

  return (
    <RouterContext.Provider value={{ RequireAuth }}>
      {children}
    </RouterContext.Provider>
  );
}

export function useRouter() {
  const context = useContext(RouterContext);
  if (context === undefined) {
    throw new Error("useRouter must be used within a RouterProvider");
  }
  return context;
}
