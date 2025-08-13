import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { CompanyProvider } from "@/contexts/CompanyContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { RoleBasedRoute } from "@/components/auth/RoleBasedRoute";
import { OptimizedLayout } from "@/components/layouts/OptimizedLayout";
import { EmployeeLayout } from "@/components/layouts/EmployeeLayout";
import { Suspense, lazy, useState, useEffect } from "react";
import { ErrorBoundary } from "@/components/ui/error-boundary";
// Supabase access elsewhere uses `src/integrations/supabase/client`

// Lazy load all pages for better performance
const Dashboard = lazy(() => import("./pages/Dashboard"));
const EmployeeDashboard = lazy(() => import("./pages/EmployeeDashboard"));
const Employees = lazy(() => import("./pages/Employees"));
const Announcements = lazy(() => import("./pages/Announcements"));
const Attendance = lazy(() => import("./pages/Attendance"));
const Leave = lazy(() => import("./pages/Leave"));
const Assets = lazy(() => import("./pages/Assets"));
const Expenses = lazy(() => import("./pages/Expenses"));
const Payroll = lazy(() => import("./pages/Payroll"));
const Timesheets = lazy(() => import("./pages/Timesheets"));
const Performance = lazy(() => import("./pages/Performance"));
const Reports = lazy(() => import("./pages/Reports"));
const Users = lazy(() => import("./pages/Users"));
const Tickets = lazy(() => import("./pages/Tickets"));
const Tasks = lazy(() => import("./pages/Tasks"));
const Company = lazy(() => import("./pages/Company"));
const Settings = lazy(() => import("./pages/Settings"));
const Landing = lazy(() => import("./pages/Landing"));
const LandingLogin = lazy(() => import("./pages/LandingLogin"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Demo `Page` with direct Supabase query removed to avoid multiple clients

// Optimized QueryClient with performance settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 60 * 1000, // 30 minutes
      gcTime: 2 * 60 * 60 * 1000, // 2 hours
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      retry: 1,
      networkMode: 'online',
    },
    mutations: {
      retry: 0,
      networkMode: 'online',
    },
  },
});

// Loading component for Suspense
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <CompanyProvider>
            <ErrorBoundary>
              <Suspense fallback={<PageLoader />}>
                <Routes>
                {/* Public routes */}
                <Route path="/" element={<Landing />} />
                <Route path="/auth" element={<LandingLogin />} />
                
                {/* Protected App Routes */}
                <Route path="/app/*" element={
                  <ProtectedRoute>
                    <Routes>
                      {/* Employee-specific dashboard */}
                      <Route path="employee-dashboard" element={
                        <RoleBasedRoute allowedRoles={['employee', 'admin', 'hr', 'manager']}>
                          <EmployeeLayout />
                        </RoleBasedRoute>
                      }>
                        <Route index element={<EmployeeDashboard />} />
                      </Route>

                      {/* Admin/HR/Manager routes using OptimizedLayout */}
                      <Route path="" element={
                        <RoleBasedRoute allowedRoles={['admin', 'hr', 'manager']}>
                          <OptimizedLayout />
                        </RoleBasedRoute>
                      }>
                        <Route index element={<Dashboard />} />
                        <Route path="dashboard" element={<Dashboard />} />
                        <Route path="employees" element={<Employees />} />
                        <Route path="announcements" element={<Announcements />} />
                        <Route path="attendance" element={<Attendance />} />
                        <Route path="leave" element={<Leave />} />
                        <Route path="assets" element={<Assets />} />
                        <Route path="expenses" element={<Expenses />} />
                        <Route path="payroll" element={<Payroll />} />
                        <Route path="timesheets" element={<Timesheets />} />
                        <Route path="performance" element={<Performance />} />
                        <Route path="reports" element={<Reports />} />
                        <Route path="users" element={<Users />} />
                        <Route path="tickets" element={<Tickets />} />
                        <Route path="tasks" element={<Tasks />} />
                        <Route path="company" element={<Company />} />
                        <Route path="onboarding" element={<Onboarding />} />
                        <Route path="settings" element={<Settings />} />
                        {/* demo route removed */}
                      </Route>

                      {/* Employee accessible routes using EmployeeLayout for employee role */}
                      <Route path="employee/*" element={
                        <RoleBasedRoute allowedRoles={['employee']} redirectTo="/app/employee-dashboard">
                          <EmployeeLayout />
                        </RoleBasedRoute>
                      }>
                        <Route path="attendance" element={<Attendance />} />
                        <Route path="leave" element={<Leave />} />
                        <Route path="expenses" element={<Expenses />} />
                        <Route path="tasks" element={<Tasks />} />
                        <Route path="timesheets" element={<Timesheets />} />
                        <Route path="performance" element={<Performance />} />
                      </Route>
                    </Routes>
                  </ProtectedRoute>
                } />
                
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </ErrorBoundary>
          </CompanyProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;