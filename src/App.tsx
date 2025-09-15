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
import AdminManagerManagement from "./pages/AdminManagerManagement";
import AdminHelpRequests from "./pages/AdminHelpRequests";
import AdminFeedback from "./pages/AdminFeedback";
import PendingTrainees from "./pages/PendingTrainees";
import ManagerDashboard from "./pages/ManagerDashboard";
import ManagerCompanyModules from "./pages/ManagerCompanyModules";
import ManagerTrainees from "./pages/ManagerTrainees";
import ManagerProgress from "./pages/ManagerProgress";
import Chat from "./pages/Chat";

const queryClient = new QueryClient();

// Dashboard redirect component to redirect to the appropriate page based on the user's role
const DashboardRedirect = () => {
  const { user } = useAuth();
  
  if (user?.role === "TRAINEE") {
    return <Navigate to="/training" replace />;
  } else if (user?.role === "MANAGER") {
    return <Navigate to="/manager/dashboard" replace />;
  } else if (user?.role === "ADMIN") {
    return <Navigate to="/admin/company-modules" replace />;
  }
  
  return <Navigate to="/" replace />;
};

// Protected route component
const ProtectedRoute = ({ 
  children, 
  allowedRoles = ["TRAINEE", "MANAGER", "ADMIN"] 
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
      path="/admin/managers" 
      element={
        <ProtectedRoute allowedRoles={["ADMIN"]}>
          <AdminManagerManagement />
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
    <Route 
      path="/admin/pending-trainees" 
      element={
        <ProtectedRoute allowedRoles={["ADMIN"]}>
          <PendingTrainees />
        </ProtectedRoute>
      }
    />
    
    {/* Manager Routes */}
    <Route 
      path="/manager" 
      element={
        <ProtectedRoute allowedRoles={["MANAGER"]}>
          <Navigate to="/manager/dashboard" replace />
        </ProtectedRoute>
      }
    />
    <Route 
      path="/manager/dashboard" 
      element={
        <ProtectedRoute allowedRoles={["MANAGER"]}>
          <ManagerDashboard />
        </ProtectedRoute>
      }
    />
    <Route 
      path="/manager/company/:companyId/modules" 
      element={
        <ProtectedRoute allowedRoles={["MANAGER"]}>
          <ManagerCompanyModules />
        </ProtectedRoute>
      }
    />
    <Route 
      path="/manager/company/:companyId/trainees" 
      element={
        <ProtectedRoute allowedRoles={["MANAGER"]}>
          <ManagerTrainees />
        </ProtectedRoute>
      }
    />
    <Route 
      path="/manager/company/:companyId/progress" 
      element={
        <ProtectedRoute allowedRoles={["MANAGER"]}>
          <ManagerProgress />
        </ProtectedRoute>
      }
    />
    <Route 
      path="/manager/company/:companyId/trainee/:traineeId" 
      element={
        <ProtectedRoute allowedRoles={["MANAGER"]}>
          <TrackTraineeDetail />
        </ProtectedRoute>
      }
    />
    
    {/* Chat Route - Available for TRAINEE, MANAGER, and ADMIN */}
    <Route 
      path="/chat"
      element={
        <ProtectedRoute allowedRoles={["TRAINEE", "MANAGER", "ADMIN"]}>
          <Chat />
        </ProtectedRoute>
      }
    />
    
    {/* Redirect dashboard to appropriate page based on role */}
    <Route 
      path="/dashboard" 
      element={
        <ProtectedRoute>
          <DashboardRedirect />
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
      <BrowserRouter>
        <AuthProvider>
          <RouterProvider>
            <AppRoutes />
          </RouterProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
