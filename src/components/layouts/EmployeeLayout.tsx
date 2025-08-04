import React, { memo } from 'react';
import { Outlet } from 'react-router-dom';
import { AppHeader } from '@/components/navigation/AppHeader';
import { PerformanceMonitor } from '@/components/performance/PerformanceMonitor';

// Simple layout for employees without sidebar
export const EmployeeLayout = memo(() => {
  return (
    <PerformanceMonitor name="EmployeeLayout">
      <div className="min-h-screen flex flex-col w-full bg-background">
        <AppHeader />
        
        <main className="flex-1 overflow-y-auto bg-muted/30 p-3 sm:p-4 md:p-6">
          <div className="max-w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </PerformanceMonitor>
  );
});

EmployeeLayout.displayName = 'EmployeeLayout';