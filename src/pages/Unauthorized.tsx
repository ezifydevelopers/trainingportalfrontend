
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ShieldAlert } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function Unauthorized() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  const handleBack = () => {
    navigate(-1);
  };
  
  const handleLogout = () => {
    logout();
    navigate("/login/member");
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md text-center">
        <div className="flex justify-center">
          <div className="h-20 w-20 rounded-full bg-red-100 flex items-center justify-center">
            <ShieldAlert className="h-10 w-10 text-red-600" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <p className="text-gray-600">
          You don't have permission to access this page. Please contact an administrator if you believe this is an error.
        </p>
        
        <div className="flex justify-center gap-4 pt-4">
          <Button variant="outline" onClick={handleBack}>
            Go Back
          </Button>
          <Button onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
}
