'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authAPI, authStorage, AuthResponse } from '@/lib/auth';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'editor' | 'viewer';
  lastLogin?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string, role?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const isAuthenticated = !!user;

  // Initialize auth state on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = authStorage.getToken();
        const savedUser = authStorage.getUser();
        
        if (token && savedUser) {
          setUser(savedUser);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        authStorage.clear();
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const response: AuthResponse = await authAPI.login({ email, password });
      
      authStorage.setToken(response.accessToken);
      authStorage.setUser(response.user);
      setUser(response.user as User);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (name: string, email: string, password: string, role: string = 'editor') => {
    try {
      setLoading(true);
      const response: AuthResponse = await authAPI.signup({ 
        name, 
        email, 
        password, 
        role: role as 'admin' | 'editor' | 'viewer' 
      });
      
      authStorage.setToken(response.accessToken);
      authStorage.setUser(response.user);
      setUser(response.user as User);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      authStorage.clear();
      setUser(null);
      setLoading(false);
    }
  };

  const refreshToken = async () => {
    try {
      const response: AuthResponse = await authAPI.refreshToken();
      authStorage.setToken(response.accessToken);
      authStorage.setUser(response.user);
      setUser(response.user as User);
    } catch (error) {
      console.error('Token refresh error:', error);
      authStorage.clear();
      setUser(null);
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    signup,
    logout,
    refreshToken,
    isAuthenticated,
  };

  return (
    <AuthContext.Provider value={value}>
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
