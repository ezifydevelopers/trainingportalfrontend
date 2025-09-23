import { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useAuth, UserRole } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Database, User, Users, ShieldCheck, GraduationCap } from "lucide-react";
import { toast } from "sonner";

export default function LoginPage() {
  const { role } = useParams<{ role: string }>();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login, isLoading: authLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const success = await login(email, password);
      
      if (success) {
        toast.success("Login successful!");
        
        // Get the current user to determine their role
        const currentUser = JSON.parse(localStorage.getItem('user') || 'null');
        
        // Redirect based on user role
        if (currentUser?.role === 'TRAINEE') {
          navigate('/training');
        } else if (currentUser?.role === 'MANAGER') {
          navigate('/manager/dashboard');
        } else if (currentUser?.role === 'ADMIN') {
          navigate('/admin/company-modules');
        } else {
          // Fallback redirect
          navigate('/training');
        }
      } else {
        toast.error("Invalid email or password");
      }
    } catch (error) {
      toast.error("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleIcon = () => {
    switch (role) {
      case "ADMIN":
        return <ShieldCheck className="h-8 w-8 text-purple-600" />;
      case "MANAGER":
        return <Users className="h-8 w-8 text-blue-600" />;
      case "TRAINEE":
        return <GraduationCap className="h-8 w-8 text-orange-600" />;
      default:
        return <User className="h-8 w-8 text-green-600" />;
    }
  };

  const getRoleTitle = () => {
    switch (role) {
      case "ADMIN":
        return "Admin Login";
      case "MANAGER":
        return "Manager Login";
      case "TRAINEE":
        return "Trainee Login";
      default:
        return "Login";
    }
  };

  const isFormDisabled = isLoading || authLoading;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md p-6 sm:p-8 space-y-6 sm:space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <div className="flex justify-center">
            <Database className="h-8 w-8 sm:h-10 sm:w-10" />
          </div>
          <h1 className="mt-4 text-lg sm:text-xl lg:text-2xl font-bold">Training Portal Test</h1>
          <div className="mt-4 sm:mt-6 inline-flex items-center justify-center p-3 sm:p-4 bg-gray-100 rounded-full">
            {getRoleIcon()}
          </div>
          <h2 className="mt-3 sm:mt-4 text-base sm:text-lg lg:text-xl font-semibold">{getRoleTitle()}</h2>
        </div>

        <form className="mt-4 sm:mt-6 space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1"
              required
              disabled={isFormDisabled}
            />
          </div>
          <div>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <Link
                to={`/forgot-password/${role}`}
                className="text-sm text-blue-600 hover:text-blue-800 self-start sm:self-auto"
              >
                Forgot password?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1"
              required
              disabled={isFormDisabled}
            />
          </div>
          <Button 
            type="submit" 
            className="w-full"
            disabled={isFormDisabled}
          >
            {isLoading ? "Logging in..." : "Login"}
          </Button>
        </form>

        {role === "TRAINEE" && (
          <div className="mt-4 text-center">
            <span className="text-sm text-gray-600">Don't have an account?</span>
            <Link
              to="/signup-trainee"
              className="ml-2 text-sm text-orange-600 hover:text-orange-800 font-medium"
            >
              Sign up as Trainee
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
