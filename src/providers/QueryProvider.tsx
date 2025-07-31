import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 15 * 60 * 1000, // 15 minutes - longer cache for better performance
      gcTime: 60 * 60 * 1000, // 1 hour cache retention
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }
        return failureCount < 1; // Reduce retries further
      },
      refetchOnWindowFocus: false,
      refetchOnMount: false, // Changed to false for better performance
      refetchOnReconnect: false, // Prevent unnecessary refetches
    },
    mutations: {
      retry: 0, // No retries for mutations
    },
  },
});

interface QueryProviderProps {
  children: ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

export { queryClient };