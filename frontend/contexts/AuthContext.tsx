'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  token: string | null;
  isAdmin: boolean;
  login: (token: string, username: string) => void;
  logout: () => void;
  isInitialized: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const router = useRouter();

  useEffect(() => {
    try {
      const savedToken = localStorage.getItem('bmf_admin_token');
      if (savedToken) {
        setToken(savedToken);
        setIsAdmin(true);
      }
    } catch (e) {
      console.error('Failed to load token from localStorage', e);
    }
    setIsInitialized(true);
  }, []);

  const login = (jwtToken: string, username: string) => {
    localStorage.setItem('bmf_admin_token', jwtToken);
    setToken(jwtToken);
    setIsAdmin(true);
  };

  const logout = () => {
    localStorage.removeItem('bmf_admin_token');
    setToken(null);
    setIsAdmin(false);
    router.push('/');
  };

  return (
    <AuthContext.Provider value={{ token, isAdmin, login, logout, isInitialized }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
