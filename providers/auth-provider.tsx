"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { userKeys } from '@/hooks/useUser';
import { setAuthToken } from '@/lib/api';

interface AuthContextType {
  token: string | null;
  setToken: (token: string | null) => void;
  isClient: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const queryClient = useQueryClient();

  const handleSetToken = (newToken: string | null) => {
    if (newToken) {
      localStorage.setItem('token', newToken);
      setAuthToken(newToken);
    } else {
      localStorage.removeItem('token');
      setAuthToken(null);
      // Clear all user-related queries when token is removed
      queryClient.removeQueries({ queryKey: userKeys.all });
    }
    setToken(newToken);
  };

  useEffect(() => {
    setIsClient(true);
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      setAuthToken(storedToken);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ token, setToken: handleSetToken, isClient }}>
      {children}
    </AuthContext.Provider>
  );
} 