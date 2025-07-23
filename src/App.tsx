import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { CompanyProvider } from "@/contexts/CompanyContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AppLayout } from "@/components/layouts/AppLayout";
import Dashboard from "./pages/Dashboard";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import Employees from "./pages/Employees";
import Attendance from "./pages/Attendance";
import Leave from "./pages/Leave";
import Assets from "./pages/Assets";
import Procurement from "./pages/Procurement";
import Expenses from "./pages/Expenses";
import Payroll from "./pages/Payroll";
import Loans from "./pages/Loans";
import Welfare from "./pages/Welfare";
import Timesheets from "./pages/Timesheets";
import Performance from "./pages/Performance";
import Recruitment from "./pages/Recruitment";
import Reports from "./pages/Reports";
import Users from "./pages/Users";
import Tickets from "./pages/Tickets";
import Tasks from "./pages/Tasks";
import Company from "./pages/Company";
import Settings from "./pages/Settings";
import LandingLogin from "./pages/LandingLogin";
import Onboarding from "./pages/Onboarding";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <CompanyProvider>
            <Routes>
              {/* Authentication Route */}
              <Route path="/auth" element={<LandingLogin />} />
              
              {/* Onboarding Route */}
              <Route path="/onboarding" element={<Onboarding />} />
              
              {/* Protected App Routes */}
              <Route path="/*" element={
                <ProtectedRoute>
                  <Routes>
                    <Route path="/" element={<AppLayout />}>
                      <Route index element={<Dashboard />} />
                      <Route path="dashboard" element={<Dashboard />} />
                      <Route path="employee-dashboard" element={<EmployeeDashboard />} />
                      <Route path="employees" element={<Employees />} />
                      <Route path="attendance" element={<Attendance />} />
                      <Route path="leave" element={<Leave />} />
                      <Route path="assets" element={<Assets />} />
                      <Route path="procurement" element={<Procurement />} />
                      <Route path="expenses" element={<Expenses />} />
                      <Route path="payroll" element={<Payroll />} />
                      <Route path="loans" element={<Loans />} />
                      <Route path="welfare" element={<Welfare />} />
                      <Route path="timesheets" element={<Timesheets />} />
                      <Route path="performance" element={<Performance />} />
                      <Route path="recruitment" element={<Recruitment />} />
                      <Route path="reports" element={<Reports />} />
                      <Route path="users" element={<Users />} />
                      <Route path="tickets" element={<Tickets />} />
                      <Route path="tasks" element={<Tasks />} />
                      <Route path="company" element={<Company />} />
                      <Route path="settings" element={<Settings />} />
                    </Route>
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </ProtectedRoute>
              } />
            </Routes>
          </CompanyProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
