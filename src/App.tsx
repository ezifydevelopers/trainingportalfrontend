import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth, UserRole } from "./contexts/AuthContext";
import { RouterProvider, useRouter } from "./contexts/RouterContext";

import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import LoginPage from "./pages/login/LoginPage";
import ForgotPasswordPage from "./pages/login/ForgotPasswordPage";
import ResetPasswordPage from "./pages/login/ResetPasswordPage";
import Unauthorized from "./pages/Unauthorized";
import TraineeSignup from "./pages/TraineeSignup";
import TraineeDashboard from "./pages/TraineeDashboard";
import TrainingModule from "./pages/TrainingModule";
import TrainingProgress from "./pages/TrainingProgress";
import TrackTrainee from "./pages/TrackTrainee";
import TrackTraineeDetail from "./pages/TrackTraineeDetail";
import AdminCompanyModules from "./pages/AdminCompanyModules";
import AdminHelpRequests from "./pages/AdminHelpRequests";
import AdminFeedback from "./pages/AdminFeedback";
import Chat from "./pages/Chat";

const queryClient = new QueryClient();

// Protected route component
const ProtectedRoute = ({ 
  children, 
  allowedRoles = ["TRAINEE", "ADMIN"] 
}: { 
  children: React.ReactNode, 
  allowedRoles?: UserRole[] 
}) => {
  const { RequireAuth } = useRouter();
  return <RequireAuth allowedRoles={allowedRoles}>{children}</RequireAuth>;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Index />} />
    <Route path="/login/:role" element={<LoginPage />} />
    <Route path="/forgot-password/:role" element={<ForgotPasswordPage />} />
    <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
    <Route path="/unauthorized" element={<Unauthorized />} />
    <Route path="/signup-trainee" element={<TraineeSignup />} />
    
    {/* Training Routes */}
    <Route 
      path="/training" 
      element={
        <ProtectedRoute allowedRoles={["TRAINEE"]}>
          <TraineeDashboard />
        </ProtectedRoute>
      } 
    />
    <Route 
      path="/training/progress" 
      element={
        <ProtectedRoute allowedRoles={["TRAINEE"]}>
          <TrainingProgress />
        </ProtectedRoute>
      } 
    />
    <Route 
      path="/training/module/:moduleId" 
      element={
        <ProtectedRoute allowedRoles={["TRAINEE"]}>
          <TrainingModule />
        </ProtectedRoute>
      } 
    />
    
    {/* Admin Routes */}
    <Route 
      path="/admin" 
      element={
        <ProtectedRoute allowedRoles={["ADMIN"]}>
          <Navigate to="/admin/company-modules" replace />
        </ProtectedRoute>
      }
    />
    <Route 
      path="/admin/track-trainee" 
      element={
        <ProtectedRoute allowedRoles={["ADMIN"]}>
          <TrackTrainee />
        </ProtectedRoute>
      }
    />
    <Route
      path="/admin/track-trainee/:id"
      element={
        <ProtectedRoute allowedRoles={["ADMIN"]}>
          <TrackTraineeDetail />
        </ProtectedRoute>
      }
    />
    <Route 
      path="/admin/company-modules" 
      element={
        <ProtectedRoute allowedRoles={["ADMIN"]}>
          <AdminCompanyModules />
        </ProtectedRoute>
      }
    />
    <Route 
      path="/admin/help-requests" 
      element={
        <ProtectedRoute allowedRoles={["ADMIN"]}>
          <AdminHelpRequests />
        </ProtectedRoute>
      }
    />
    <Route 
      path="/admin/feedback" 
      element={
        <ProtectedRoute allowedRoles={["ADMIN"]}>
          <AdminFeedback />
        </ProtectedRoute>
      }
    />
    
    {/* Chat Route - Available for both TRAINEE and ADMIN */}
    <Route 
      path="/chat" 
      element={
        <ProtectedRoute allowedRoles={["TRAINEE", "ADMIN"]}>
          <Chat />
        </ProtectedRoute>
      }
    />
    
    {/* Redirect dashboard to appropriate training page */}
    <Route 
      path="/dashboard" 
      element={
        <ProtectedRoute>
          <Navigate to="/training" replace />
        </ProtectedRoute>
      } 
    />
    
    {/* Catch-all route */}
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <RouterProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </RouterProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
