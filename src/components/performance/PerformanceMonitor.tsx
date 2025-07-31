import React, { useEffect, useRef } from 'react';

interface PerformanceMonitorProps {
  children: React.ReactNode;
  name?: string;
}

export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  children,
  name = 'Component'
}) => {
  const renderStartTime = useRef<number>();
  const mountTime = useRef<number>();

  useEffect(() => {
    mountTime.current = performance.now();
    
    return () => {
      if (mountTime.current) {
        const unmountTime = performance.now();
        const totalTime = unmountTime - mountTime.current;
        
        if (process.env.NODE_ENV === 'development') {
          console.log(`${name} lifecycle: ${totalTime.toFixed(2)}ms`);
        }
      }
    };
  }, [name]);

  useEffect(() => {
    renderStartTime.current = performance.now();
  });

  useEffect(() => {
    if (renderStartTime.current) {
      const renderEndTime = performance.now();
      const renderTime = renderEndTime - renderStartTime.current;
      
      if (process.env.NODE_ENV === 'development' && renderTime > 16) {
        console.warn(`${name} slow render: ${renderTime.toFixed(2)}ms`);
      }
    }
  });

  return <>{children}</>;
};