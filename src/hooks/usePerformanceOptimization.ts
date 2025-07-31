import { useEffect, useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { logMemoryUsage, optimizeNetworkRequests } from '@/utils/performance';

// Hook for general performance optimizations
export function usePerformanceOptimization() {
  useEffect(() => {
    // Optimize network requests on mount
    optimizeNetworkRequests();

    // Log memory usage in development
    if (process.env.NODE_ENV === 'development') {
      const interval = setInterval(logMemoryUsage, 30000); // Every 30 seconds
      return () => clearInterval(interval);
    }
  }, []);

  // Preload critical resources
  const preloadCriticalResources = useCallback(() => {
    const criticalResources = [
      '/api/user/profile',
      '/api/dashboard/stats',
    ];

    criticalResources.forEach(resource => {
      fetch(resource, { method: 'HEAD' }).catch(() => {
        // Silently fail for preloading
      });
    });
  }, []);

  return { preloadCriticalResources };
}

// Hook for optimized data fetching with pagination
export function useOptimizedPagination<T>(
  queryFn: (page: number, limit: number) => Promise<{ data: T[]; total: number }>,
  queryKey: string[],
  options?: {
    pageSize?: number;
    prefetchPages?: number;
  }
) {
  const pageSize = options?.pageSize || 50;
  const prefetchPages = options?.prefetchPages || 1;

  return useQuery({
    queryKey: [...queryKey, 'paginated'],
    queryFn: () => queryFn(1, pageSize),
    staleTime: 30 * 60 * 1000,
    gcTime: 2 * 60 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
}

// Hook for optimized search with debouncing
export function useOptimizedSearch<T>(
  searchFn: (query: string) => Promise<T[]>,
  queryKey: string[],
  searchQuery: string,
  delay: number = 300
) {
  const debouncedQuery = useMemo(() => {
    const timer = setTimeout(() => searchQuery, delay);
    return () => clearTimeout(timer);
  }, [searchQuery, delay]);

  return useQuery({
    queryKey: [...queryKey, 'search', searchQuery],
    queryFn: () => searchFn(searchQuery),
    enabled: searchQuery.length >= 2,
    staleTime: 5 * 60 * 1000, // 5 minutes for search results
    gcTime: 10 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
}

// Hook for resource cleanup
export function useResourceCleanup() {
  useEffect(() => {
    return () => {
      // Cancel any pending requests
      if ('AbortController' in window) {
        const controllers = (window as any).__abortControllers || [];
        controllers.forEach((controller: AbortController) => {
          controller.abort();
        });
      }

      // Clear any intervals
      const intervals = (window as any).__intervals || [];
      intervals.forEach(clearInterval);

      // Clear any timeouts
      const timeouts = (window as any).__timeouts || [];
      timeouts.forEach(clearTimeout);
    };
  }, []);
}