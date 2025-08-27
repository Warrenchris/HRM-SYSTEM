import React, { memo } from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { AppHeader } from '@/components/navigation/AppHeader';
import { PerformanceMonitor } from '@/components/performance/PerformanceMonitor';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Home } from 'lucide-react';
import { RouteLogger } from '@/components/navigation/RouteLogger';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';

// Simple layout for employees without sidebar
export const EmployeeLayout = memo(() => {
  const location = useLocation();
  
  // Get current page name from pathname
  const getPageName = (pathname: string) => {
    const segments = pathname.split('/').filter(Boolean);
    const lastSegment = segments[segments.length - 1];
    
    const pageNames: Record<string, string> = {
      'attendance': 'Attendance',
      'leave': 'Leave Management',
      'expenses': 'Expenses',
      'tasks': 'Tasks',
      'timesheets': 'Timesheets',
      'performance': 'Performance',
    };
    
    return pageNames[lastSegment] || 'Dashboard';
  };

  const currentPageName = getPageName(location.pathname);
  const isMainDashboard = location.pathname === '/app/employee-dashboard';

  return (
    <PerformanceMonitor name="EmployeeLayout">
      <div className="min-h-screen flex flex-col w-full bg-background">
        <AppHeader />
        
        {/* Navigation breadcrumb - only show on module pages */}
        {!isMainDashboard && (
          <div className="border-b bg-card px-6 py-3">
            <div className="flex items-center justify-between">
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                      <Link to="/app/employee-dashboard" className="flex items-center gap-1">
                        <Home className="h-4 w-4" />
                        Dashboard
                      </Link>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>{currentPageName}</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
              
              <Button asChild variant="outline" size="sm">
                <Link to="/app/employee-dashboard" className="flex items-center gap-2">
                  <ChevronLeft className="h-4 w-4" />
                  Back to Dashboard
                </Link>
              </Button>
            </div>
          </div>
        )}
        
        <main className="flex-1 overflow-y-auto bg-muted/30 p-3 sm:p-4 md:p-6">
          <div className="max-w-full">
            <RouteLogger />
            <Outlet />
          </div>
        </main>
      </div>
    </PerformanceMonitor>
  );
});

EmployeeLayout.displayName = 'EmployeeLayout';