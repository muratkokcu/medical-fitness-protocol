import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  organization: string;
  lastLogin?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    organization: string;
    role?: string;
  }) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        
        authAPI.getProfile()
          .then(response => {
            const updatedUser = response.data.data.user;
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
          })
          .catch(() => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUser(null);
          });
      } catch (error) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
      }
    }
    
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await authAPI.login(email, password);
      const { token, user: userData } = response.data.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  };

  const register = async (data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    organization: string;
    role?: string;
  }) => {
    try {
      const response = await authAPI.register(data);
      const { token, user: userData } = response.data.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const isAuthenticated = !!user;

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    register,
    logout,
    isAuthenticated,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};