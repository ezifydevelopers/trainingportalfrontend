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

export const useCompanyTraineesProgress = (companyId: number | null) => {
  return useQuery({
    queryKey: ['company-trainees-progress', companyId],
    queryFn: () => apiClient.getCompanyTraineesProgress(companyId!),
    enabled: !!companyId && companyId > 0,
    staleTime: 30 * 1000, // 30 seconds for more real-time data
    refetchInterval: 60 * 1000, // Refetch every minute for real-time updates
  });
};

export const useAllCompanies = () => {
  return useQuery({
    queryKey: ['companies'],
    queryFn: () => apiClient.getAllCompanies(),
    staleTime: 30 * 1000, // 30 seconds - more frequent updates
    refetchInterval: 5 * 60 * 1000, // Auto-refetch every 5 minutes
    refetchIntervalInBackground: true, // Continue refetching when tab is not active
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

export const useDuplicateCompanyData = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ sourceCompanyId, targetCompanyId }: { sourceCompanyId: number; targetCompanyId: number }) => 
      apiClient.duplicateCompanyData(sourceCompanyId, targetCompanyId),
    onSuccess: () => {
      // Invalidate and refetch companies and modules data
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      queryClient.invalidateQueries({ queryKey: ['public-companies'] });
      queryClient.invalidateQueries({ queryKey: ['company-modules'] });
      queryClient.invalidateQueries({ queryKey: ['admin-modules'] });
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
    queryFn: async () => {
      if (!companyId) return [];
      const result = await apiClient.getCompanyModules(companyId);
      return result.modules || [];
    },
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
    mutationFn: ({ id, ...data }: { 
      id: number; 
      name: string;
      videoFile?: File;
      duration?: number;
      mcqs?: Array<{
        question: string;
        options: string[];
        answer: string;
        explanation?: string;
      }>;
      youtubeUrl?: string;
      youtubeTitle?: string;
      youtubeThumbnail?: string;
      videoType?: 'file' | 'youtube';
      removeVideo?: boolean;
    }) =>
      apiClient.updateModule(id, data),
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
    mutationFn: ({ moduleId, videoFile, duration, youtubeUrl, youtubeTitle, youtubeThumbnail, videoType }: { 
      moduleId: number; 
      videoFile: File | null; 
      duration: number;
      youtubeUrl?: string;
      youtubeTitle?: string;
      youtubeThumbnail?: string;
      videoType?: string;
    }) =>
      apiClient.addVideoToModule(moduleId, videoFile, duration, youtubeUrl, youtubeTitle, youtubeThumbnail, videoType),
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

// Resource management hooks
export const useAddResource = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: {
      moduleId: number;
      resourceFile: File;
      type: string;
      duration?: number;
      estimatedReadingTime?: number;
    }) => apiClient.addResource(data),
    onSuccess: (data, variables) => {
      // Invalidate module resources query
      queryClient.invalidateQueries({ queryKey: ['module-resources', variables.moduleId] });
      // Invalidate all company modules queries
      queryClient.invalidateQueries({ queryKey: ['company-modules'] });
      // Also invalidate all modules queries to ensure data consistency
      queryClient.invalidateQueries({ queryKey: ['modules'] });
    },
  });
};

export const useGetModuleResources = (moduleId: number) => {
  return useQuery({
    queryKey: ['module-resources', moduleId],
    queryFn: () => apiClient.getModuleResources(moduleId),
    enabled: !!moduleId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useDeleteResource = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (resourceId: number) => apiClient.deleteResource(resourceId),
    onSuccess: () => {
      // Invalidate all module resources queries
      queryClient.invalidateQueries({ queryKey: ['module-resources'] });
      // Invalidate company modules query
      queryClient.invalidateQueries({ queryKey: ['company-modules'] });
    },
  });
};

export const useUpdateResourceTimeTracking = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: {
      resourceId: number;
      timeSpent: number;
    }) => apiClient.updateResourceTimeTracking(data),
    onSuccess: () => {
      // Invalidate resource time tracking queries
      queryClient.invalidateQueries({ queryKey: ['resource-time-tracking'] });
    },
  });
};

export const useGetResourceTimeTracking = (resourceId: number) => {
  return useQuery({
    queryKey: ['resource-time-tracking', resourceId],
    queryFn: () => apiClient.getResourceTimeTracking(resourceId),
    enabled: !!resourceId,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

// Manager management hooks
export const useGetManagers = () => {
  return useQuery({
    queryKey: ['managers'],
    queryFn: () => apiClient.getManagers(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCreateManager = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: { name: string; email: string; password: string }) => 
      apiClient.createManager(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['managers'] });
    },
  });
};

export const useUpdateManager = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: { name?: string; email?: string; password?: string } }) => 
      apiClient.updateManager(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['managers'] });
    },
  });
};

export const useDeleteManager = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => apiClient.deleteManager(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['managers'] });
    },
  });
};

export const useGetManagerCompanies = (managerId: number) => {
  return useQuery({
    queryKey: ['manager-companies', managerId],
    queryFn: () => apiClient.getManagerCompanies(managerId),
    enabled: !!managerId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useAssignCompanyToManager = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ managerId, companyId }: { managerId: number; companyId: number }) => 
      apiClient.assignCompanyToManager(managerId, companyId),
    onSuccess: (_, { managerId }) => {
      queryClient.invalidateQueries({ queryKey: ['managers'] });
      queryClient.invalidateQueries({ queryKey: ['manager-companies', managerId] });
    },
  });
};

export const useUnassignCompanyFromManager = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ managerId, companyId }: { managerId: number; companyId: number }) => 
      apiClient.unassignCompanyFromManager(managerId, companyId),
    onSuccess: (_, { managerId }) => {
      queryClient.invalidateQueries({ queryKey: ['managers'] });
      queryClient.invalidateQueries({ queryKey: ['manager-companies', managerId] });
    },
  });
};

// Manager-specific hooks

export const useGetCompanyTrainees = (companyId: number) => {
  return useQuery({
    queryKey: ['company-trainees', companyId],
    queryFn: () => apiClient.getCompanyTrainees(companyId),
    enabled: !!companyId,
  });
};

// Time tracking hooks
export const useTimeTrackingStats = (params?: {
  traineeId?: number;
  companyId?: number;
  startDate?: string;
  endDate?: string;
}) => {
  return useQuery({
    queryKey: ['time-tracking-stats', params],
    queryFn: () => apiClient.getTimeTrackingStats(params),
    staleTime: 30 * 1000, // 30 seconds - more frequent updates
    refetchInterval: 60 * 1000, // Auto-refetch every 60 seconds
    refetchIntervalInBackground: true, // Continue refetching when tab is not active
  });
};

// Trainee management hooks
export const useAllTrainees = () => {
  return useQuery({
    queryKey: ['trainees'],
    queryFn: async () => {
      const response = await apiClient.getAllTrainees();
      // The API is returning the trainees directly as an array, not wrapped in an object
      return response;
    },
    staleTime: 30 * 1000,
    refetchInterval: 2 * 60 * 1000, // Refetch every 2 minutes
    refetchIntervalInBackground: true,
  });
};

export const useUpdateTrainee = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: number; updates: { companyId?: number; status?: string } }) =>
      apiClient.updateTrainee(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainees'] });
      queryClient.invalidateQueries({ queryKey: ['companies'] });
    },
  });
};

// Notification hooks
export const useNotifications = (limit = 50, offset = 0) => {
  return useQuery({
    queryKey: ['notifications', limit, offset],
    queryFn: () => apiClient.getNotifications(limit, offset),
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute
    refetchIntervalInBackground: true,
  });
};

export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (notificationId: number) => apiClient.markNotificationAsRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};

export const useMarkAllAsRead = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => apiClient.markAllNotificationsAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};

export const useUnreadNotificationCount = () => {
  return useQuery({
    queryKey: ['unread-notification-count'],
    queryFn: () => apiClient.getUnreadNotificationCount(),
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute
    refetchIntervalInBackground: true,
  });
};
