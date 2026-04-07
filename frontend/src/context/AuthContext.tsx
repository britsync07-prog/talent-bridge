'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

interface AuthContextType {
  user: any;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, role: 'EMPLOYER' | 'ENGINEER') => Promise<void>;
  registerEmployer: (data: any) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Wake up the backend (Render free tier spin-up)
    api.get('/health').catch(() => {});

    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const { data } = await api.get('/auth/me');
          setUser(data);
        } catch (error) {
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };
    fetchUser();
  }, []);

  const login = async (email: string, password: string) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', data.token);
    setUser(data);
    
    // Redirect based on role
    if (data.role === 'ADMIN') router.push('/dashboard/admin');
    else if (data.role === 'EMPLOYER') router.push('/dashboard/employer');
    else if (data.role === 'ENGINEER') router.push('/dashboard/engineer');
  };

  const signup = async (email: string, password: string, role: 'EMPLOYER' | 'ENGINEER') => {
    const endpoint = role === 'EMPLOYER' ? '/auth/register/employer' : '/auth/register/engineer';
    const { data } = await api.post(endpoint, { email, password });
    localStorage.setItem('token', data.token);
    setUser(data);
  };

  const registerEmployer = async (data: any) => {
    const response = await api.post('/auth/register/employer', data);
    localStorage.setItem('token', response.data.token);
    setUser(response.data);
    router.push('/dashboard/employer');
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, registerEmployer, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
