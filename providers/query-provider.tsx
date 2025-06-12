"use client"

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Interface for axios error responses
interface AxiosError extends Error {
  response?: {
    status: number;
  };
}

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // With SSR, we usually want to set some default staleTime
      // above 0 to avoid refetching immediately on the client
      staleTime: 60 * 1000, // 1 minute
      retry: (failureCount, error: Error) => {
        // Don't retry on 401 (unauthorized) errors
        if ((error as AxiosError)?.response?.status === 401) {
          return false;
        }
        // Retry up to 3 times for other errors
        return failureCount < 3;
      },
    },
    mutations: {
      retry: false,
    },
  },
});

interface QueryProviderProps {
  children: React.ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
} 