import { useMemo, useCallback, useRef } from 'react';

// Memoized calculation hook
export function useMemoizedCalculation<T>(
  calculation: () => T,
  dependencies: React.DependencyList
): T {
  return useMemo(calculation, dependencies);
}

// Stable callback hook that prevents unnecessary re-renders
export function useStableCallback<T extends (...args: any[]) => any>(
  callback: T,
  dependencies: React.DependencyList
): T {
  return useCallback(callback, dependencies);
}

// Debounced value hook
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Previous value tracking hook
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();
  
  useEffect(() => {
    ref.current = value;
  });
  
  return ref.current;
}

// Memoized object comparison
export function useDeepCompareMemo<T>(
  factory: () => T,
  dependencies: React.DependencyList
): T {
  const ref = useRef<React.DependencyList>();
  
  if (!ref.current || !areEqual(ref.current, dependencies)) {
    ref.current = dependencies;
  }
  
  return useMemo(factory, ref.current);
}

function areEqual(a: React.DependencyList, b: React.DependencyList): boolean {
  if (a.length !== b.length) return false;
  
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  
  return true;
}

import { useState, useEffect } from 'react';