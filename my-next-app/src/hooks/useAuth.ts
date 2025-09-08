import { useState, useEffect, useCallback } from 'react';
import { User, AuthState, LoginCredentials, RegisterData } from '@/types/auth';
import { useToast } from '@/hooks/use-toast';

const API_BASE = '/api';

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isLoading: true,
    isAuthenticated: false,
  });

  const { toast } = useToast();

  // Initialize auth state from localStorage
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const userData = localStorage.getItem('user_data');

    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        setAuthState({
          user,
          token,
          isLoading: false,
          isAuthenticated: true,
        });
      } catch (error) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    } else {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));

      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }

      const { user, token } = await response.json();

      localStorage.setItem('auth_token', token);
      localStorage.setItem('user_data', JSON.stringify(user));

      setAuthState({
        user,
        token,
        isLoading: false,
        isAuthenticated: true,
      });

      toast({
        title: 'Welcome back!',
        description: `Logged in as ${user.name}`,
      });

      return { success: true };
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      const message = error instanceof Error ? error.message : 'Login failed';
      
      toast({
        title: 'Login Failed',
        description: message,
        variant: 'destructive',
      });

      return { success: false, error: message };
    }
  }, [toast]);

  const register = useCallback(async (data: RegisterData) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));

      const response = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Registration failed');
      }

      const { user, token } = await response.json();

      localStorage.setItem('auth_token', token);
      localStorage.setItem('user_data', JSON.stringify(user));

      setAuthState({
        user,
        token,
        isLoading: false,
        isAuthenticated: true,
      });

      toast({
        title: 'Account Created!',
        description: `Welcome to UMLTutor, ${user.name}`,
      });

      return { success: true };
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      const message = error instanceof Error ? error.message : 'Registration failed';
      
      toast({
        title: 'Registration Failed',
        description: message,
        variant: 'destructive',
      });

      return { success: false, error: message };
    }
  }, [toast]);

  const logout = useCallback(() => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');

    setAuthState({
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,
    });

    toast({
      title: 'Logged Out',
      description: 'See you next time!',
    });
  }, [toast]);

  const refreshProfile = useCallback(async () => {
    if (!authState.token) return;

    try {
      const response = await fetch(`${API_BASE}/user/profile`, {
        headers: {
          'Authorization': `Bearer ${authState.token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          logout();
        }
        return;
      }

      const user = await response.json();
      localStorage.setItem('user_data', JSON.stringify(user));
      
      setAuthState(prev => ({ ...prev, user }));
    } catch (error) {
      console.error('Failed to refresh profile:', error);
    }
  }, [authState.token, logout]);

  return {
    ...authState,
    login,
    register,
    logout,
    refreshProfile,
  };
}
