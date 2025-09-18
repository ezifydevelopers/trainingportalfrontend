import { logger } from './logger';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:7001/api';

// Export the API base URL for use in other files
export const getApiBaseUrl = () => API_BASE_URL;

// Types based on the backend API
export interface User {
  id: number;
  name: string;
  email: string;
  role: 'TRAINEE' | 'ADMIN' | 'MANAGER';
  companyId?: number;
  isVerified: boolean;
  company?: {
    id: number;
    name: string;
  };
  calculatedProgress?: {
    overallProgress: number;
    modulesCompleted: number;
    averageScore: number;
    totalTimeSpent: number;
    totalModules: number;
    lastUpdated: string;
  };
  managedCompanies?: ManagerCompanyAssignment[];
}

export interface ManagerCompanyAssignment {
  id: number;
  managerId: number;
  companyId: number;
  assignedAt: string;
  company: Company;
}

export interface Manager {
  id: number;
  name: string;
  email: string;
  role: 'MANAGER';
  isVerified: boolean;
  managedCompanies: ManagerCompanyAssignment[];
}

export interface Company {
  id: number;
  name: string;
  logo?: string;
}

export interface Video {
  id: number;
  url: string;
  duration: number;
}

export interface Resource {
  id: number;
  filename: string;
  originalName: string;
  type: 'VIDEO' | 'PDF' | 'DOCUMENT' | 'IMAGE' | 'AUDIO';
  duration?: number;
  estimatedReadingTime?: number;
  filePath: string;
  url: string;
  moduleId: number;
  createdAt: string;
  updatedAt: string;
}

export interface ResourceTimeTracking {
  id: number;
  resourceId: number;
  userId: number;
  timeSpent: number;
  lastUpdated: string;
}

export interface MCQ {
  id: number;
  question: string;
  options: string[];
  answer: string;
  explanation?: string;
}

export interface TrainingModule {
  id: number;
  name: string;
  companyId: number;
  order: number;
  isResourceModule?: boolean;
  videos: Video[];
  mcqs: MCQ[];
  resources?: Resource[];
  unlocked?: boolean;
  completed?: boolean;
  pass?: boolean;
  score?: number;
}

export interface ModuleProgress {
  moduleId: number;
  moduleName: string;
  timeSpentOnVideo: number;
  marksObtained: number;
  pass: boolean;
  completed: boolean;
  videoDuration: number;
  unlocked: boolean;
  isResourceModule?: boolean;
}

export interface DashboardData {
  overallProgress: number;
  modulesCompleted: number;
  averageScore: number;
  totalTimeSpent: number;
  currentModule?: {
    moduleId: number;
    moduleName: string;
    videoDuration: number;
  };
  moduleProgress: ModuleProgress[];
}

export interface TraineeProgress {
  overallProgress: number;
  modulesCompleted: number;
  averageScore: number;
  totalTimeSpent: number;
  moduleProgress: {
    moduleId: number;
    moduleName: string;
    score: number;
    videoDuration: number;
    timeSpent: number;
    pass: boolean;
  }[];
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface SignupResponse {
  message: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
}

export interface SignupRequest {
  name: string;
  email: string;
  password: string;
  companyName: string | null;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface MCQAnswer {
  questionId: number;
  selectedOption: string;
}

export interface MCQSubmission {
  answers: Record<number, string>;
}

export interface MCQResult {
  message: string;
  score: number;
  pass: boolean;
}

export interface MCQResponse {
  message: string;
  score: number;
  pass: boolean;
}

export interface TimeSpentUpdate {
  timeSpent: number;
}

export interface HelpRequest {
  id: number;
  traineeId: number;
  moduleId?: number;
  message?: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
  trainee: {
    id: number;
    name: string;
    email: string;
    company?: {
      id: number;
      name: string;
    };
  };
  module?: {
    id: number;
    name: string;
  };
}

export interface HelpRequestResponse {
  message: string;
  helpRequest: {
    id: number;
    status: string;
    createdAt: string;
  };
}

export interface Feedback {
  id: number;
  traineeId: number;
  moduleId: number;
  rating: number;
  comment?: string;
  createdAt: string;
  updatedAt: string;
  trainee: {
    id: number;
    name: string;
    email: string;
    company?: {
      id: number;
      name: string;
    };
  };
  module: {
    id: number;
    name: string;
  };
}

export interface FeedbackSubmission {
  moduleId: number;
  rating: number;
  comment?: string;
}

export interface FeedbackResponse {
  message: string;
  feedback: {
    id: number;
    rating: number;
    comment?: string;
    createdAt: string;
  };
}

export interface FeedbackStats {
  totalFeedback: number;
  averageRating: number;
  ratingDistribution: Array<{
    rating: number;
    _count: { rating: number };
  }>;
  moduleFeedback: Array<{
    moduleId: number;
    _count: { id: number };
    _avg: { rating: number };
    module: { name: string };
  }>;
}

// API client with authentication
class ApiClient {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
  }

  clearToken() {
    this.token = null;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    // Log API request if debug mode is enabled
    logger.apiRequest(url, options.method || 'GET', options.body);

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      logger.error('API Error:', { url, status: response.status, error: errorData });
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // Log API response if debug mode is enabled
    logger.apiResponse(url, response.status, data);
    return data;
  }

  // Authentication endpoints
  async signup(data: SignupRequest): Promise<SignupResponse> {
    return this.request<SignupResponse>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async login(data: LoginRequest): Promise<LoginResponse> {
    return this.request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async adminLogin(data: LoginRequest): Promise<LoginResponse> {
    return this.request<LoginResponse>('/auth/admin/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Public endpoints (no authentication required)
  async getPublicCompanies(): Promise<Company[]> {
    return this.request<Company[]>('/companies');
  }

  // Trainee endpoints (require trainee authentication)
  async getDashboard(): Promise<DashboardData> {
    return this.request<DashboardData>('/trainee/dashboard');
  }

  async getModules(): Promise<ModuleProgress[]> {
    return this.request<ModuleProgress[]>('/trainee/modules');
  }

  async getModule(moduleId: number): Promise<TrainingModule> {
    return this.request<TrainingModule>(`/trainee/modules/${moduleId}`);
  }

  async completeModule(moduleId: number): Promise<{ 
    message: string; 
    hasMCQs?: boolean; 
    autoPassed?: boolean; 
  }> {
    return this.request<{ 
      message: string; 
      hasMCQs?: boolean; 
      autoPassed?: boolean; 
    }>(`/trainee/modules/${moduleId}/complete`, {
      method: 'POST',
    });
  }

  // MCQ methods
  async submitMCQ(moduleId: number, answers: Record<number, string>): Promise<MCQResponse> {
    return this.request<MCQResponse>(`/trainee/modules/${moduleId}/mcq`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers }),
    });
  }

  async updateTimeSpent(moduleId: number, timeSpent: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/trainee/modules/${moduleId}/time`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ timeSpent }),
    });
  }


  // Admin endpoints (require admin authentication)
  async getAllTrainees(): Promise<User[]> {
    return this.request<User[]>('/admin/trainees');
  }

  async createTrainee(data: {
    name: string;
    email: string;
    password: string;
    companyId: number;
  }): Promise<{ message: string; user: User }> {
    return this.request<{ message: string; user: User }>('/admin/trainees', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTrainee(id: number, data: {
    name?: string;
    email?: string;
    password?: string;
    companyId?: number;
  }): Promise<{ message: string; user: User }> {
    return this.request<{ message: string; user: User }>(`/admin/trainees/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteTrainee(id: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/admin/trainees/${id}`, {
      method: 'DELETE',
    });
  }

  async getTraineeProgress(traineeId: number): Promise<TraineeProgress> {
    return this.request<TraineeProgress>(`/admin/trainees/${traineeId}/progress`);
  }

  async getCompanyTraineesProgress(companyId: number): Promise<{
    trainees: Array<{
      id: number;
      name: string;
      email: string;
      companyId: number;
      progress: Array<{
        id: number;
        userId: number;
        moduleId: number;
        completed: boolean;
        score: number | null;
        timeSpent: number | null;
        pass: boolean;
        createdAt: string;
        updatedAt: string;
        module: {
          id: number;
          name: string;
          companyId: number;
        };
      }>;
      calculatedProgress: {
        overallProgress: number;
        modulesCompleted: number;
        totalModules: number;
        averageScore: number;
        totalTimeSpent: number;
      };
    }>;
    totalTrainees: number;
  }> {
    return this.request(`/admin/companies/${companyId}/trainees-progress`);
  }

  async getTimeTrackingStats(params?: {
    traineeId?: number;
    companyId?: number;
    startDate?: string;
    endDate?: string;
  }): Promise<{
    success: boolean;
    stats: {
      totalTrainees: number;
      totalModules: number;
      totalTimeSpent: number;
      averageTimePerTrainee: number;
      averageTimePerModule: number;
      timeDistribution: {
        under30min: number;
        thirtyTo60min: number;
        oneTo2hours: number;
        twoTo4hours: number;
        over4hours: number;
      };
      traineeStats: Array<{
        traineeId: number;
        traineeName: string;
        traineeEmail: string;
        company: { id: number; name: string } | null;
        totalTimeSpent: number;
        totalModules: number;
        completedModules: number;
        completionRate: number;
        averageScore: number;
        timeInHours: number;
        timeInMinutes: number;
      }>;
      companyStats: Array<{
        companyName: string;
        traineeCount: number;
        totalTimeSpent: number;
        averageTimePerTrainee: number;
        completionRate: number;
      }>;
    };
    generatedAt: string;
  }> {
    const queryParams = new URLSearchParams();
    if (params?.traineeId) queryParams.append('traineeId', params.traineeId.toString());
    if (params?.companyId) queryParams.append('companyId', params.companyId.toString());
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    
    const url = `/admin/time-tracking/stats${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.request(url);
  }

  async getAllCompanies(): Promise<{ success: boolean; companies: Company[] }> {
    return this.request<{ success: boolean; companies: Company[] }>('/admin/companies');
  }

  async createCompany(data: FormData): Promise<{ message: string; company: Company }> {
    const url = `${API_BASE_URL}/admin/companies`;
    
    const headers: Record<string, string> = {};
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: data,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async updateCompany(id: number, data: FormData): Promise<Company> {
    const url = `${API_BASE_URL}/admin/companies/${id}`;
    
    const headers: Record<string, string> = {};
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      method: 'PUT',
      headers,
      body: data,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async deleteCompany(id: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/admin/companies/${id}`, {
      method: 'DELETE',
    });
  }

  async getAllModules(): Promise<{
    id: number;
    name: string;
    companyId: number;
    company: { id: number; name: string };
    video?: { id: number; duration: number };
    _count: { mcqs: number };
  }[]> {
    return this.request('/admin/modules');
  }

  async addModuleToCompany(companyId: number, name: string): Promise<{
    message: string;
    module: { id: number; name: string; companyId: number };
  }> {
    return this.request(`/admin/companies/${companyId}/modules`, {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
  }

  async updateModule(id: number, name: string): Promise<{
    message: string;
    module: { id: number; name: string; companyId: number };
  }> {
    return this.request(`/admin/modules/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ name }),
    });
  }

  async deleteModule(id: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/admin/modules/${id}`, {
      method: 'DELETE',
    });
  }

  async addVideoToModule(moduleId: number, videoFile: File, duration: number): Promise<{
    message: string;
    video: { id: number; url: string; duration: number };
  }> {
    const formData = new FormData();
    formData.append('video', videoFile);
    formData.append('duration', duration.toString());

    const url = `${API_BASE_URL}/admin/modules/${moduleId}/video`;
    
    const headers: Record<string, string> = {};
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async addMCQsToModule(moduleId: number, mcqs: {
    question: string;
    options: string[];
    answer: string;
    explanation?: string;
  }[]): Promise<{ message: string; count: number }> {
    return this.request(`/admin/modules/${moduleId}/mcqs`, {
      method: 'POST',
      body: JSON.stringify({ mcqs }),
    });
  }

  async getCompanyModules(companyId: number): Promise<{ modules: TrainingModule[] }> {
    // Get all modules and filter by companyId on the frontend
    const allModules = await this.request<TrainingModule[]>('/admin/modules');
    const filteredModules = allModules.filter(module => module.companyId === companyId);
    return { modules: filteredModules };
  }

  async getAllUsers(): Promise<User[]> {
    return this.request<User[]>('/admin/users');
  }

  // Help request methods
  async requestHelp(data: { moduleId?: number; message?: string }): Promise<HelpRequestResponse> {
    return this.request<HelpRequestResponse>('/trainee/help', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  }

  async getHelpRequests(): Promise<HelpRequest[]> {
    return this.request<HelpRequest[]>('/admin/help-requests');
  }

  async updateHelpRequest(id: number, status: string, adminNotes?: string): Promise<{ message: string; helpRequest: HelpRequest }> {
    return this.request<{ message: string; helpRequest: HelpRequest }>(`/admin/help-requests/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, adminNotes }),
    });
  }

  // Feedback methods
  async submitFeedback(data: FeedbackSubmission): Promise<FeedbackResponse> {
    return this.request<FeedbackResponse>('/trainee/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  }

  async getFeedback(moduleId: number): Promise<Feedback> {
    return this.request<Feedback>(`/trainee/feedback/${moduleId}`);
  }

  async getAllFeedback(): Promise<Feedback[]> {
    return this.request<Feedback[]>('/admin/feedback');
  }

  async getFeedbackByModule(moduleId: number): Promise<Feedback[]> {
    return this.request<Feedback[]>(`/admin/feedback/module/${moduleId}`);
  }

  async getFeedbackStats(): Promise<FeedbackStats> {
    return this.request<FeedbackStats>('/admin/feedback/stats');
  }

  // Resource management methods
  async addResource(data: {
    moduleId: number;
    resourceFile: File;
    type: string;
    duration?: number;
    estimatedReadingTime?: number;
  }): Promise<any> {
    const formData = new FormData();
    formData.append('moduleId', data.moduleId.toString());
    formData.append('resourceFile', data.resourceFile);
    formData.append('type', data.type);
    if (data.duration) {
      formData.append('duration', data.duration.toString());
    }
    if (data.estimatedReadingTime) {
      formData.append('estimatedReadingTime', data.estimatedReadingTime.toString());
    }

    return this.request('/admin/resources', {
      method: 'POST',
      body: formData,
    });
  }

  async getModuleResources(moduleId: number): Promise<Resource[]> {
    const response = await this.request<{ success: boolean; resources: Resource[] }>(`/admin/resources/module/${moduleId}`);
    return response.resources || [];
  }

  async deleteResource(resourceId: number): Promise<any> {
    return this.request(`/admin/resources/${resourceId}`, {
      method: 'DELETE',
    });
  }

  async updateResourceTimeTracking(data: {
    resourceId: number;
    timeSpent: number;
  }): Promise<any> {
    return this.request('/trainee/resource-time-tracking', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
  }

  async getResourceTimeTracking(resourceId: number): Promise<any> {
    return this.request(`/trainee/resource-time-tracking/${resourceId}`);
  }

  // Manager management methods
  async getManagers() {
    return this.request<{ success: boolean; managers: Manager[] }>('/admin/managers');
  }

  async createManager(data: { name: string; email: string; password: string }) {
    return this.request<{ success: boolean; manager: Manager }>('/admin/managers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateManager(id: number, data: { name?: string; email?: string; password?: string }) {
    return this.request<{ success: boolean; manager: Manager }>(`/admin/managers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteManager(id: number) {
    return this.request<{ success: boolean; message: string }>(`/admin/managers/${id}`, {
      method: 'DELETE',
    });
  }

  async getManagerCompanies(managerId: number) {
    return this.request<{ success: boolean; companies: ManagerCompanyAssignment[] }>(`/admin/managers/${managerId}/companies`);
  }

  async assignCompanyToManager(managerId: number, companyId: number) {
    return this.request<{ success: boolean; assignment: ManagerCompanyAssignment }>(`/admin/managers/${managerId}/assign-company`, {
      method: 'POST',
      body: JSON.stringify({ companyId }),
    });
  }

  async unassignCompanyFromManager(managerId: number, companyId: number) {
    return this.request<{ success: boolean; message: string }>(`/admin/managers/${managerId}/unassign-company/${companyId}`, {
      method: 'DELETE',
    });
  }

  // Manager-specific methods
  async getCompanyTrainees(companyId: number) {
    return this.request<{ success: boolean; trainees: User[] }>(`/admin/companies/${companyId}/trainees`);
  }

  // Trainee management methods - duplicates removed

  // Notification methods
  async getNotifications(limit = 50, offset = 0) {
    return this.request<{ success: boolean; notifications: any[] }>(`/admin/notifications?limit=${limit}&offset=${offset}`);
  }

  async markNotificationAsRead(notificationId: number) {
    return this.request<{ success: boolean; message: string }>(`/admin/notifications/${notificationId}/read`, {
      method: 'PUT',
    });
  }

  async markAllNotificationsAsRead() {
    return this.request<{ success: boolean; message: string }>('/admin/notifications/read-all', {
      method: 'PUT',
    });
  }

  async getUnreadNotificationCount() {
    return this.request<{ success: boolean; unreadCount: number }>('/admin/notifications/unread-count');
  }

}

export const apiClient = new ApiClient(); 