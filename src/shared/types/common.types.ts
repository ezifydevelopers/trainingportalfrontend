/**
 * Centralized type definitions for the Training Portal application
 * Following professional standards with single source of truth
 */

export interface BaseEntity {
  id: number;
  createdAt: string;
  updatedAt: string;
}

export type UserRole = 'TRAINEE' | 'ADMIN' | 'MANAGER';
export type ResourceType = 'VIDEO' | 'PDF' | 'DOCUMENT' | 'IMAGE' | 'AUDIO';

export interface User extends BaseEntity {
  name: string;
  email: string;
  role: UserRole;
  isVerified: boolean;
  companyId?: number;
  company?: Company;
  calculatedProgress?: UserProgress;
  managedCompanies?: ManagerCompanyAssignment[];
}

export interface Company extends BaseEntity {
  name: string;
  logo?: string;
}

export interface ManagerCompanyAssignment extends BaseEntity {
  managerId: number;
  companyId: number;
  assignedAt: string;
  company: Company;
}

export interface Manager extends BaseEntity {
  name: string;
  email: string;
  role: 'MANAGER';
  isVerified: boolean;
  managedCompanies: ManagerCompanyAssignment[];
}

export interface Module extends BaseEntity {
  name: string;
  description?: string;
  order?: number;
  isResourceModule?: boolean;
  videos?: Video[];
  mcqs?: MCQ[];
  resources?: Resource[];
  completed?: boolean;
  score?: number;
}

export interface Video extends BaseEntity {
  url: string;
  duration: number;
  moduleId: number;
}

export interface MCQ extends BaseEntity {
  question: string;
  options: string[];
  answer: string;
  explanation?: string;
  moduleId: number;
}

export interface Resource extends BaseEntity {
  filename: string;
  originalName: string;
  type: ResourceType;
  duration?: number;
  estimatedReadingTime?: number;
  filePath: string;
  moduleId: number;
}

export interface UserProgress {
  overallProgress: number;
  modulesCompleted: number;
  averageScore: number;
  totalTimeSpent: number;
  totalModules: number;
  lastUpdated: string;
}

export interface ChatMessage extends BaseEntity {
  content: string;
  senderId: number;
  chatRoomId: number;
  isRead: boolean;
  sender: {
    name: string;
  };
}

export interface Notification extends BaseEntity {
  message: string;
  senderName: string;
  chatRoomId: number;
  isRead: boolean;
  type: 'message' | 'module_completion';
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Form Types
export interface CreateCompanyData {
  name: string;
  logo?: File;
}

export interface UpdateCompanyData {
  name?: string;
  logo?: File;
}

export interface CreateModuleData {
  name: string;
  description?: string;
  companyId: number;
}

export interface UpdateModuleData {
  name?: string;
  description?: string;
}

export interface CreateTraineeData {
  name: string;
  email: string;
  password: string;
  companyId: number;
}

export interface UpdateTraineeData {
  name?: string;
  email?: string;
  password?: string;
  companyId?: number;
  status?: string;
}

// UI State Types
export interface LoadingState {
  isLoading: boolean;
  error?: string;
}

export interface DialogState {
  isOpen: boolean;
  data?: any;
}

// Chart/Statistics Types
export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
  }[];
}

export interface StatCard {
  title: string;
  value: string | number;
  change?: number;
  changeType?: 'increase' | 'decrease' | 'neutral';
  icon?: React.ComponentType;
}
