import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { HOCPresets } from "@/components/HOCComposer";

interface TraineeSignupProps {
  user?: any;
  isAuthenticated?: boolean;
}

function TraineeSignup({ user, isAuthenticated }: TraineeSignupProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { signup, isLoading: authLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const success = await signup({
        name,
        email,
        password,
        companyName: null // No company assigned yet - pending approval
      });

      if (success) {
        toast.success("Signup successful! Your account is pending approval. You will be notified once an admin assigns you to a company.");
        
        // Redirect to login page
        navigate('/login/TRAINEE');
      } else {
        toast.error("Signup failed. Please try again.");
      }
    } catch (error) {
      toast.error("Signup failed. Please check your information and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const isFormDisabled = isLoading || authLoading;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Trainee Signup</h1>
          <p className="text-sm text-gray-600 mt-2">
            Your account will be reviewed and approved by an administrator
          </p>
        </div>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              className="mt-1"
              disabled={isFormDisabled}
              placeholder="Enter your full name"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="mt-1"
              disabled={isFormDisabled}
              placeholder="your@email.com"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="mt-1"
              disabled={isFormDisabled}
              placeholder="Create a strong password"
              minLength={6}
            />
          </div>
          <Button 
            type="submit" 
            className="w-full"
            disabled={isFormDisabled}
          >
            {isLoading ? "Creating Account..." : "Sign Up"}
          </Button>
        </form>
        
        <div className="mt-6 text-center">
          <span className="text-sm text-gray-600">Already have an account?</span>
          <a
            href="/login/TRAINEE"
            className="ml-2 text-sm text-orange-600 hover:text-orange-800 font-medium"
          >
            Sign in as Trainee
          </a>
        </div>

      </div>
    </div>
  );
}
// Export with comprehensive HOC protection
export default HOCPresets.publicPage(TraineeSignup);
