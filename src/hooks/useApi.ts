import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import type { 
  DashboardData, 
  ModuleProgress, 
  TrainingModule, 
  MCQSubmission, 
  MCQResult,
  User,
  Company,
  TraineeProgress,
  SignupRequest,
  LoginRequest
} from '@/lib/api';

// Authentication hooks
export const useLogin = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: LoginRequest) => apiClient.login(data),
    onSuccess: (data) => {
      // Invalidate and refetch user data
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
};

export const useSignup = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: SignupRequest) => apiClient.signup(data),
    onSuccess: (data) => {
      // Invalidate and refetch user data
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
};

export const useAdminLogin = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: LoginRequest) => apiClient.adminLogin(data),
    onSuccess: (data) => {
      // Invalidate and refetch user data
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
};

// Public hooks (no authentication required)
export const usePublicCompanies = () => {
  return useQuery({
    queryKey: ['public-companies'],
    queryFn: () => apiClient.getPublicCompanies(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Trainee hooks
export const useDashboard = () => {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: () => apiClient.getDashboard(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useModules = () => {
  return useQuery({
    queryKey: ['modules'],
    queryFn: () => apiClient.getModules(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useModule = (moduleId: number) => {
  return useQuery({
    queryKey: ['module', moduleId],
    queryFn: () => apiClient.getModule(moduleId),
    enabled: !!moduleId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCompleteModule = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (moduleId: number) => apiClient.completeModule(moduleId),
    onSuccess: (_, moduleId) => {
      // Invalidate and refetch dashboard, modules list, and specific module data
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['modules'] });
      queryClient.invalidateQueries({ queryKey: ['module', moduleId] });
    },
  });
};

export const useSubmitMCQ = () => {
  return useMutation({
    mutationFn: ({ moduleId, answers }: { moduleId: number; answers: Record<number, string> }) => 
      apiClient.submitMCQ(moduleId, answers),
  });
};

// Admin hooks
export const useAllTrainees = () => {
  console.log('=== USE ALL TRAINEES DEBUG ===');
  console.log('Hook called');
  
  return useQuery({
    queryKey: ['trainees'],
    queryFn: async () => {
      console.log('Executing getAllTrainees query...');
      const result = await apiClient.getAllTrainees();
      console.log('getAllTrainees result:', result);
      return result;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useCreateTrainee = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: { name: string; email: string; password: string; companyId: number }) => 
      apiClient.createTrainee(data),
    onSuccess: () => {
      // Invalidate and refetch trainees data
      queryClient.invalidateQueries({ queryKey: ['trainees'] });
    },
  });
};

export const useUpdateTrainee = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: { name?: string; email?: string; password?: string; companyId?: number } }) => 
      apiClient.updateTrainee(id, data),
    onSuccess: () => {
      // Invalidate and refetch trainees data
      queryClient.invalidateQueries({ queryKey: ['trainees'] });
    },
  });
};

export const useDeleteTrainee = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => apiClient.deleteTrainee(id),
    onSuccess: () => {
      // Invalidate and refetch trainees data
      queryClient.invalidateQueries({ queryKey: ['trainees'] });
    },
  });
};

export const useTraineeProgress = (traineeId: number) => {
  return useQuery({
    queryKey: ['trainee-progress', traineeId],
    queryFn: () => apiClient.getTraineeProgress(traineeId),
    enabled: !!traineeId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useAllCompanies = () => {
  return useQuery({
    queryKey: ['companies'],
    queryFn: () => apiClient.getAllCompanies(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCreateCompany = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: FormData) => apiClient.createCompany(data),
    onSuccess: () => {
      // Invalidate and refetch companies data
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      queryClient.invalidateQueries({ queryKey: ['public-companies'] });
    },
  });
};

export const useUpdateCompany = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: FormData }) => apiClient.updateCompany(id, data),
    onSuccess: () => {
      // Invalidate and refetch companies data
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      queryClient.invalidateQueries({ queryKey: ['public-companies'] });
    },
  });
};

export const useDeleteCompany = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => apiClient.deleteCompany(id),
    onSuccess: () => {
      // Invalidate and refetch companies data
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      queryClient.invalidateQueries({ queryKey: ['public-companies'] });
    },
  });
};

export const useAllModules = () => {
  return useQuery({
    queryKey: ['admin-modules'],
    queryFn: () => apiClient.getAllModules(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useCompanyModules = (companyId: number | null) => {
  return useQuery({
    queryKey: ["company-modules", companyId],
    queryFn: () => companyId ? apiClient.getCompanyModules(companyId) : Promise.resolve([]),
    enabled: !!companyId,
    staleTime: 2 * 60 * 1000,
  });
};

export const useAddModuleToCompany = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ companyId, name }: { companyId: number; name: string }) =>
      apiClient.addModuleToCompany(companyId, name),
    onSuccess: (_, variables) => {
      // Invalidate all module-related queries to ensure data consistency across the app
      queryClient.invalidateQueries({ queryKey: ["company-modules", variables.companyId] });
      queryClient.invalidateQueries({ queryKey: ["admin-modules"] });
      queryClient.invalidateQueries({ queryKey: ["modules"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["trainees"] });
      queryClient.invalidateQueries({ queryKey: ["trainee-progress"] });
      
      // Also invalidate any module-specific queries
      queryClient.invalidateQueries({ 
        predicate: (query) => 
          query.queryKey[0] === 'module' || 
          query.queryKey[0] === 'trainee-progress'
      });
    },
  });
};

export const useUpdateModule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, name }: { id: number; name: string }) =>
      apiClient.updateModule(id, name),
    onSuccess: () => {
      // Invalidate all module-related queries to ensure data consistency across the app
      queryClient.invalidateQueries({ queryKey: ["admin-modules"] });
      queryClient.invalidateQueries({ queryKey: ["company-modules"] });
      queryClient.invalidateQueries({ queryKey: ["modules"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["trainees"] });
      queryClient.invalidateQueries({ queryKey: ["trainee-progress"] });
      
      // Also invalidate any module-specific queries
      queryClient.invalidateQueries({ 
        predicate: (query) => 
          query.queryKey[0] === 'module' || 
          query.queryKey[0] === 'trainee-progress'
      });
    },
  });
};

export const useDeleteModule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => apiClient.deleteModule(id),
    onSuccess: () => {
      // Invalidate all module-related queries to ensure data consistency across the app
      queryClient.invalidateQueries({ queryKey: ["admin-modules"] });
      queryClient.invalidateQueries({ queryKey: ["company-modules"] });
      queryClient.invalidateQueries({ queryKey: ["modules"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["trainees"] });
      queryClient.invalidateQueries({ queryKey: ["trainee-progress"] });
      
      // Also invalidate any module-specific queries
      queryClient.invalidateQueries({ 
        predicate: (query) => 
          query.queryKey[0] === 'module' || 
          query.queryKey[0] === 'trainee-progress'
      });
    },
  });
};

export const useAddVideoToModule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ moduleId, videoFile, duration }: { moduleId: number; videoFile: File; duration: number }) =>
      apiClient.addVideoToModule(moduleId, videoFile, duration),
    onSuccess: () => {
      // Invalidate all module-related queries to ensure data consistency across the app
      queryClient.invalidateQueries({ queryKey: ["admin-modules"] });
      queryClient.invalidateQueries({ queryKey: ["company-modules"] });
      queryClient.invalidateQueries({ queryKey: ["modules"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["trainees"] });
      queryClient.invalidateQueries({ queryKey: ["trainee-progress"] });
      
      // Also invalidate any module-specific queries
      queryClient.invalidateQueries({ 
        predicate: (query) => 
          query.queryKey[0] === 'module' || 
          query.queryKey[0] === 'trainee-progress'
      });
    },
  });
};

export const useAddMCQsToModule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ moduleId, mcqs }: { moduleId: number; mcqs: { question: string; options: string[]; answer: string; explanation?: string }[] }) =>
      apiClient.addMCQsToModule(moduleId, mcqs),
    onSuccess: () => {
      // Invalidate all module-related queries to ensure data consistency across the app
      queryClient.invalidateQueries({ queryKey: ["admin-modules"] });
      queryClient.invalidateQueries({ queryKey: ["company-modules"] });
      queryClient.invalidateQueries({ queryKey: ["modules"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["trainees"] });
      queryClient.invalidateQueries({ queryKey: ["trainee-progress"] });
      
      // Also invalidate any module-specific queries
      queryClient.invalidateQueries({ 
        predicate: (query) => 
          query.queryKey[0] === 'module' || 
          query.queryKey[0] === 'trainee-progress'
      });
    },
  });
};

export const useAllUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => apiClient.getAllUsers(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}; 

export const useUpdateTimeSpent = () => {
  return useMutation({
    mutationFn: ({ moduleId, timeSpent }: { moduleId: number; timeSpent: number }) => 
      apiClient.updateTimeSpent(moduleId, timeSpent),
  });
};

// Help request hooks
export const useRequestHelp = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { moduleId?: number; message?: string }) => 
      apiClient.requestHelp(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['help-requests'] });
    },
  });
};

export const useGetHelpRequests = () => {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: ['help-requests'],
    queryFn: () => apiClient.getHelpRequests(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useUpdateHelpRequest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, status, adminNotes }: { id: number; status: string; adminNotes?: string }) => 
      apiClient.updateHelpRequest(id, status, adminNotes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['help-requests'] });
    },
  });
};

// Feedback hooks
export const useSubmitFeedback = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: { moduleId: number; rating: number; comment?: string }) => 
      apiClient.submitFeedback(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedback'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};

export const useGetFeedback = (moduleId: number) => {
  return useQuery({
    queryKey: ['feedback', moduleId],
    queryFn: () => apiClient.getFeedback(moduleId),
    enabled: !!moduleId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useGetAllFeedback = () => {
  return useQuery({
    queryKey: ['all-feedback'],
    queryFn: () => apiClient.getAllFeedback(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useGetFeedbackByModule = (moduleId: number) => {
  return useQuery({
    queryKey: ['feedback-by-module', moduleId],
    queryFn: () => apiClient.getFeedbackByModule(moduleId),
    enabled: !!moduleId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useGetFeedbackStats = () => {
  return useQuery({
    queryKey: ['feedback-stats'],
    queryFn: () => apiClient.getFeedbackStats(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}; 