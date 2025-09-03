const API_BASE_URL = 'http://localhost:5000/api';

// Types based on the backend API
export interface User {
  id: number;
  name: string;
  email: string;
  role: 'TRAINEE' | 'ADMIN';
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
  video?: Video;
  mcqs: MCQ[];
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
  companyName: string;
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

    console.log(`=== API REQUEST DEBUG ===`);
    console.log(`URL: ${url}`);
    console.log(`Method: ${options.method || 'GET'}`);
    console.log(`Headers:`, headers);
    console.log(`Body:`, options.body);
    console.log(`Token present:`, !!this.token);
    console.log(`Token preview:`, this.token ? `${this.token.substring(0, 20)}...` : 'None');

    const response = await fetch(url, {
      ...options,
      headers,
    });

    console.log(`=== API RESPONSE DEBUG ===`);
    console.log(`Status: ${response.status}`);
    console.log(`Status text: ${response.statusText}`);
    console.log(`Headers:`, Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('API error response:', errorData);
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('API success response:', data);
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

  async getAllCompanies(): Promise<Company[]> {
    return this.request<Company[]>('/admin/companies');
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

  async getCompanyModules(companyId: number): Promise<TrainingModule[]> {
    // For now, get all modules and filter by companyId on the frontend
    // until the backend implements the company-specific endpoint
    const allModules = await this.request<TrainingModule[]>('/admin/modules');
    return allModules.filter(module => module.companyId === companyId);
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
}

export const apiClient = new ApiClient(); 