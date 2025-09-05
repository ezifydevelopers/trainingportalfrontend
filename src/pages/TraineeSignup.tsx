import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { usePublicCompanies } from "@/hooks/useApi";
import { toast } from "sonner";

export default function TraineeSignup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [companyId, setCompanyId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { signup, isLoading: authLoading } = useAuth();
  const { data: companies, isLoading: companiesLoading, error: companiesError } = usePublicCompanies();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Find the selected company to get its name
      const selectedCompany = companies?.find(company => company.id.toString() === companyId);
      if (!selectedCompany) {
        toast.error("Please select a company");
        return;
      }

      const success = await signup({
        name,
        email,
        password,
        companyName: selectedCompany.name
      });

      if (success) {
        toast.success("Signup successful! Please log in with your credentials.");
        
        // Redirect to login page instead of auto-login
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

  const isFormDisabled = isLoading || authLoading || companiesLoading;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center">Trainee Signup</h1>
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
          <div>
            <label htmlFor="company" className="block text-sm font-medium text-gray-700">Company</label>
            <Select value={companyId} onValueChange={setCompanyId} disabled={isFormDisabled}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder={companiesLoading ? "Loading companies..." : companiesError ? "Error loading companies" : "Select your company"} />
              </SelectTrigger>
              <SelectContent>
                {!companiesLoading && !companiesError && companies && companies.length > 0 && (
                  companies.map((company) => (
                    <SelectItem key={company.id} value={company.id.toString()}>
                      {company.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
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

        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Backend Integration:</strong><br />
            Your account will be created in the backend database and you'll be automatically logged in.
          </p>
        </div>
      </div>
    </div>
  );
} 