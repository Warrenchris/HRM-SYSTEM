import React, { memo, useMemo } from 'react';
import { Outlet } from 'react-router-dom';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/navigation/AppSidebar';
import { AppHeader } from '@/components/navigation/AppHeader';
import { PerformanceMonitor } from '@/components/performance/PerformanceMonitor';
import { RouteLogger } from '@/components/navigation/RouteLogger';

// Memoized sidebar component
const MemoizedSidebar = memo(AppSidebar);
MemoizedSidebar.displayName = 'MemoizedSidebar';

// Memoized header component  
const MemoizedHeader = memo(AppHeader);
MemoizedHeader.displayName = 'MemoizedHeader';

export const OptimizedLayout = memo(() => {
  const layoutStyles = useMemo(() => ({
    container: "min-h-screen flex w-full bg-background",
    content: "flex-1 flex flex-col overflow-hidden min-w-0",
    main: "flex-1 overflow-y-auto bg-muted/30 p-3 sm:p-4 md:p-6",
    wrapper: "max-w-full"
  }), []);

  return (
    <PerformanceMonitor name="OptimizedLayout">
      <SidebarProvider>
        <div className={layoutStyles.container}>
          <MemoizedSidebar />
          
          <div className={layoutStyles.content}>
            <MemoizedHeader />
            
            <main className={layoutStyles.main}>
              <div className={layoutStyles.wrapper}>
                <RouteLogger />
                <Outlet />
              </div>
            </main>
          </div>
        </div>
      </SidebarProvider>
    </PerformanceMonitor>
  );
});

OptimizedLayout.displayName = 'OptimizedLayout';