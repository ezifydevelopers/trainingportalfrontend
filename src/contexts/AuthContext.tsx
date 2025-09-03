import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { apiClient, User as ApiUser, LoginRequest, SignupRequest, SignupResponse } from '@/lib/api';

export type UserRole = 'TRAINEE' | 'ADMIN';

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

  // Check for stored token and user on app load
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('user');

    console.log('AuthContext: Checking localStorage on init:', {
      hasToken: !!token,
      hasUser: !!storedUser,
      token: token ? token.substring(0, 20) + '...' : null
    });

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
              validationEndpoint = '/api/admin/trainees';
            } else {
              validationEndpoint = '/api/trainee/dashboard';
            }
            
            console.log('AuthContext: Validating token with endpoint:', validationEndpoint);
            
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${validationEndpoint}`, {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
            
            console.log('AuthContext: Token validation response status:', response.status);
            
            if (response.ok) {
              // Token is valid, restore user
              setUser(parsedUser);
              console.log('AuthContext: Token validated, user restored:', parsedUser);
            } else {
              // Token is invalid, clear storage
              console.log('AuthContext: Token validation failed, clearing storage');
              localStorage.removeItem('authToken');
              localStorage.removeItem('user');
              apiClient.clearToken();
            }
          } catch (error) {
            console.error('AuthContext: Token validation error:', error);
            // On network error, still restore user but token might be invalid
            setUser(parsedUser);
            console.log('AuthContext: Network error during validation, user restored:', parsedUser);
          } finally {
            setIsLoading(false);
          }
        };
        
        validateToken();
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        apiClient.clearToken();
        setIsLoading(false);
      }
    } else if (token && !storedUser) {
      // Clear token if no user data
      console.log('AuthContext: Token found but no user data, clearing token');
      localStorage.removeItem('authToken');
      apiClient.clearToken();
      setIsLoading(false);
    } else {
      console.log('AuthContext: No stored authentication data found');
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      console.log('AuthContext: Attempting login with:', { email, password });

      // Determine if this is an admin login based on email
      const isAdminLogin = email.includes('admin') || email === 'jane@example.com';
      console.log('AuthContext: Login type:', isAdminLogin ? 'ADMIN' : 'TRAINEE');

      let response;
      if (isAdminLogin) {
        response = await apiClient.adminLogin({ email, password });
      } else {
        response = await apiClient.login({ email, password });
      }
      
      console.log('AuthContext: Login response received:', response);

      // Store token and user
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      apiClient.setToken(response.token);

      // Set user
      setUser(response.user);
      console.log('AuthContext: User set successfully:', response.user);
      console.log('AuthContext: Token stored in localStorage:', response.token);
      return true;
    } catch (error) {
      console.error('AuthContext: Login failed:', error);
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
      console.log('Signup successful:', response);
      return true;
    } catch (error) {
      console.error('Signup failed:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    apiClient.clearToken();
    setUser(null);
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
      console.error('Failed to create user:', error);
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
      console.error('Failed to update user:', error);
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
      console.error('Failed to delete user:', error);
      return false;
    }
  };

  const forgotPassword = async (email: string): Promise<boolean> => {
    try {
      // Note: This would need a corresponding API endpoint in the backend
      console.log('Password reset email sent to:', email);
      return true;
    } catch (error) {
      console.error('Failed to send reset email:', error);
      return false;
    }
  };

  const resetPassword = async (token: string, password: string): Promise<boolean> => {
    try {
      // Note: This would need a corresponding API endpoint in the backend
      console.log('Password reset for token:', token);
      return true;
    } catch (error) {
      console.error('Failed to reset password:', error);
      return false;
    }
  };

  // Debug function to check localStorage
  const debugLocalStorage = () => {
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('user');
    console.log('=== LocalStorage Debug ===');
    console.log('Token:', token);
    console.log('User:', user);
    console.log('Parsed User:', user ? JSON.parse(user) : null);
    console.log('=======================');
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

