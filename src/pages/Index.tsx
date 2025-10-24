
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { HOCPresets } from "@/components/HOCComposer";

interface IndexProps {
  user?: any;
  isAuthenticated?: boolean;
}

const Index = ({ user, isAuthenticated }: IndexProps) => {
  const { isLoading } = useAuth();

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

  // Redirect based on user role
  if (user) {
    if (user.role === "TRAINEE") {
      return <Navigate to="/training" />;
    }
    if (user.role === "MANAGER") {
      return <Navigate to="/manager/dashboard" />;
    }
    if (user.role === "ADMIN") {
      return <Navigate to="/admin/company-modules" />;
    }
    return <Navigate to="/training" />;
  }

  // Default redirect to trainee login
  return <Navigate to="/login/TRAINEE" />;
};

// Export with comprehensive HOC protection
export default HOCPresets.publicPage(Index);
