import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { CompanyProvider } from "@/contexts/CompanyContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { OptimizedLayout } from "@/components/layouts/OptimizedLayout";
import { Suspense, lazy } from "react";

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
const LandingLogin = lazy(() => import("./pages/LandingLogin"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const NotFound = lazy(() => import("./pages/NotFound"));

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
            <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* Authentication Route */}
                <Route path="/auth" element={<LandingLogin />} />
                
                {/* Protected App Routes */}
                <Route path="/*" element={
                  <ProtectedRoute>
                    <Routes>
                      <Route path="/" element={<OptimizedLayout />}>
                        <Route index element={<Dashboard />} />
                        <Route path="dashboard" element={<Dashboard />} />
                        <Route path="employee-dashboard" element={<EmployeeDashboard />} />
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
                      </Route>
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </ProtectedRoute>
                } />
              </Routes>
            </Suspense>
          </CompanyProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
