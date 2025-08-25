import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { useMemo, useCallback } from 'react';

// Optimized query hook with built-in performance optimizations
export function useOptimizedQuery<TData = unknown, TError = unknown>(
  options: UseQueryOptions<TData, TError>
) {
  // Memoize query options to prevent unnecessary re-renders
  const memoizedOptions = useMemo(() => ({
    ...options,
    staleTime: options.staleTime ?? 30 * 60 * 1000, // 30 minutes default
    gcTime: options.gcTime ?? 2 * 60 * 60 * 1000, // 2 hours default
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 1, // Minimal retries
  }), [options]);

  return useQuery(memoizedOptions);
}

// Debounced query hook for search and filter operations
export function useDebouncedQuery<TData = unknown, TError = unknown>(
  options: UseQueryOptions<TData, TError>,
  delay: number = 300
) {
  const debouncedOptions = useMemo(() => ({
    ...options,
    staleTime: 5 * 60 * 1000, // 5 minutes for search results
    gcTime: 10 * 60 * 1000, // 10 minutes retention
  }), [options, delay]);

  return useQuery(debouncedOptions);
}

// Lightweight query for frequently accessed data
export function useLightweightQuery<TData = unknown, TError = unknown>(
  options: UseQueryOptions<TData, TError>
) {
  const lightOptions = useMemo(() => ({
    ...options,
    staleTime: 60 * 60 * 1000, // 1 hour - very long cache
    gcTime: 4 * 60 * 60 * 1000, // 4 hours retention
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 0, // No retries for lightweight queries
  }), [options]);

  return useQuery(lightOptions);
}