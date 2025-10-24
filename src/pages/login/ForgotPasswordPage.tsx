
import { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Database, ArrowLeft } from "lucide-react";
import { HOCPresets } from "@/components/HOCComposer";

interface ForgotPasswordPageProps {
  user?: any;
  isAuthenticated?: boolean;
}

function ForgotPasswordPage({ user, isAuthenticated }: ForgotPasswordPageProps) {
  const { role } = useParams<{ role: string }>();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();
  const { forgotPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const success = await forgotPassword(email);
    
    setIsLoading(false);
    
    if (success) {
      setSubmitted(true);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <div className="flex justify-center">
            <Database className="h-10 w-10" />
          </div>
          <h1 className="mt-4 text-2xl font-bold">Reset Password</h1>
          <p className="mt-2 text-gray-600">
            {!submitted 
              ? "Enter your email and we'll send you a link to reset your password" 
              : "Check your email for a password reset link"}
          </p>
        </div>

        {!submitted ? (
          <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
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
              />
            </div>
            <Button 
              type="submit" 
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Sending..." : "Send Reset Link"}
            </Button>
          </form>
        ) : (
          <div className="mt-6">
            <Button
              className="w-full"
              onClick={() => navigate(`/login/${role || "member"}`)}
            >
              Return to Login
            </Button>
          </div>
        )}

        <div className="mt-4 text-center">
          <Link 
            to={`/login/${role || "member"}`} 
            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}
// Export with comprehensive HOC protection
export default HOCPresets.publicPage(ForgotPasswordPage);
