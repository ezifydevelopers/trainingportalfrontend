import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { apiClient, User as ApiUser, LoginRequest, SignupRequest, SignupResponse, getApiBaseUrl } from '@/lib/api';
import { useQueryClient } from '@tanstack/react-query';
import websocketService from '@/services/websocketService';

export type UserRole = 'TRAINEE' | 'MANAGER' | 'ADMIN';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  companyId?: number;
  isVerified: boolean;
  company?: {
    id: number;
    name: string;
  };
}

interface CreateUserData {
  name: string;
  email: string;
  password: string;
  companyId: number;
}

interface AuthContextType {
  user: User | null;
  allUsers: User[];
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  signup: (data: SignupRequest) => Promise<boolean>;
  updateUser: (userData: User) => void;
  createUser: (userData: CreateUserData) => Promise<boolean>;
  updateUserById: (userData: Partial<User> & { id: number }) => Promise<boolean>;
  deleteUser: (userId: number) => Promise<boolean>;
  forgotPassword: (email: string) => Promise<boolean>;
  resetPassword: (token: string, password: string) => Promise<boolean>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();

  // Check for stored token and user on app load
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('user');


    if (token && storedUser) {
      apiClient.setToken(token);
      try {
        const parsedUser = JSON.parse(storedUser);
        
        // Validate token by making a test API call
        const validateToken = async () => {
          try {
            // Use a simple endpoint that just validates the token
            // For admin users, we'll use the trainees endpoint, but for trainees, we'll use their dashboard
            let validationEndpoint = '';
            if (parsedUser.role === 'ADMIN') {
              validationEndpoint = '/admin/trainees';
            } else {
              validationEndpoint = '/trainee/dashboard';
            }
            
            const apiUrl = `${getApiBaseUrl()}${validationEndpoint}`;
            
            const response = await fetch(apiUrl, {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
            
            if (response.ok) {
              // Token is valid, restore user
              setUser(parsedUser);
              
              // Connect to WebSocket for real-time notifications
              websocketService.connect(parsedUser.id);
            } else {
              // Token is invalid, clear storage and cache
              localStorage.removeItem('authToken');
              localStorage.removeItem('user');
              apiClient.clearToken();
              queryClient.clear();
            }
          } catch (error) {
            // On network error, still restore user but token might be invalid
            setUser(parsedUser);
            
            // Connect to WebSocket for real-time notifications
            websocketService.connect(parsedUser.id);
          } finally {
            setIsLoading(false);
          }
        };
        
        validateToken();
      } catch (error) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        apiClient.clearToken();
        queryClient.clear();
        setIsLoading(false);
      }
    } else if (token && !storedUser) {
      // Clear token if no user data
      localStorage.removeItem('authToken');
      apiClient.clearToken();
      queryClient.clear();
      setIsLoading(false);
    } else {
      setIsLoading(false);
    }
  }, [queryClient]);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);

      // Determine if this is an admin login based on email
      const isAdminLogin = email.includes('admin') || email === 'jane@example.com';

      let response;
      if (isAdminLogin) {
        response = await apiClient.adminLogin({ email, password });
      } else {
        response = await apiClient.login({ email, password });
      }
      

      // Store token and user
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      apiClient.setToken(response.token);

      // Set user
      setUser(response.user);
      
      // Connect to WebSocket for real-time notifications
      websocketService.connect(response.user.id);
      
      return true;
    } catch (error) {
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (data: SignupRequest): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await apiClient.signup(data);

      // Don't store token or user - let them login separately
      // The backend signup endpoint doesn't return a token
      return true;
    } catch (error) {
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    // Disconnect WebSocket
    websocketService.disconnect();
    
    // Clear authentication data
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    apiClient.clearToken();
    setUser(null);
    
    // Clear all React Query cache to prevent data leakage between users
    queryClient.clear();
  };

  const updateUser = (userData: User) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    // Also update in allUsers if it exists
    setAllUsers(prev => prev.map(u => u.id === userData.id ? userData : u));
  };

  const createUser = async (userData: CreateUserData): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await apiClient.createTrainee(userData);

      // Add to allUsers list
      setAllUsers(prev => [...prev, response.user]);
      return true;
    } catch (error) {
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserById = async (userData: Partial<User> & { id: number }): Promise<boolean> => {
    try {
      // Note: This would need a corresponding API endpoint in the backend
      // For now, we'll just update the local state
      setAllUsers(prev => prev.map(u => u.id === userData.id ? { ...u, ...userData } : u));

      // If updating current user
      if (user && user.id === userData.id) {
        const updatedUser = { ...user, ...userData };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }

      return true;
    } catch (error) {
      return false;
    }
  };

  const deleteUser = async (userId: number): Promise<boolean> => {
    try {
      // Note: This would need a corresponding API endpoint in the backend
      // For now, we'll just update the local state
      setAllUsers(prev => prev.filter(u => u.id !== userId));
      return true;
    } catch (error) {
      return false;
    }
  };

  const forgotPassword = async (email: string): Promise<boolean> => {
    try {
      // Note: This would need a corresponding API endpoint in the backend
      return true;
    } catch (error) {
      return false;
    }
  };

  const resetPassword = async (token: string, password: string): Promise<boolean> => {
    try {
      // Note: This would need a corresponding API endpoint in the backend
      return true;
    } catch (error) {
      return false;
    }
  };

  // Debug function to check localStorage
  const debugLocalStorage = () => {
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('user');
  };

  // Expose debug function in development
  if (import.meta.env.MODE === 'development') {
    (window as any).debugAuth = debugLocalStorage;
  }

  return (
    <AuthContext.Provider value={{
      user,
      allUsers,
      login,
      logout,
      signup,
      updateUser,
      createUser,
      updateUserById,
      deleteUser,
      forgotPassword,
      resetPassword,
      isLoading
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

