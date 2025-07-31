import { useUserRole } from "@/hooks/useUserRole";
import { AppLayout } from "@/components/layouts/AppLayout";
import { EmployeeLayout } from "@/components/layouts/EmployeeLayout";
import { Skeleton } from "@/components/ui/skeleton";
import { Routes, Route } from "react-router-dom";
import Dashboard from "@/pages/Dashboard";
import EmployeeDashboard from "@/pages/EmployeeDashboard";
import Employees from "@/pages/Employees";
import Announcements from "@/pages/Announcements";
import Attendance from "@/pages/Attendance";
import Leave from "@/pages/Leave";
import Assets from "@/pages/Assets";
import Procurement from "@/pages/Procurement";
import Expenses from "@/pages/Expenses";
import Payroll from "@/pages/Payroll";
import Loans from "@/pages/Loans";
import Welfare from "@/pages/Welfare";
import Timesheets from "@/pages/Timesheets";
import Performance from "@/pages/Performance";
import Recruitment from "@/pages/Recruitment";
import Reports from "@/pages/Reports";
import Users from "@/pages/Users";
import Tickets from "@/pages/Tickets";
import Tasks from "@/pages/Tasks";
import Company from "@/pages/Company";
import Settings from "@/pages/Settings";
import Onboarding from "@/pages/Onboarding";
import NotFound from "@/pages/NotFound";

export function RoleBasedRoute() {
  const { isEmployee, loading } = useUserRole();
  
  console.log('RoleBasedRoute: isEmployee =', isEmployee, 'loading =', loading);

  if (loading) {
    console.log('RoleBasedRoute: Showing loading skeleton');
    return (
      <div className="min-h-screen bg-background">
        <div className="flex h-screen">
          <div className="w-64 border-r bg-card p-4">
            <Skeleton className="h-8 w-32 mb-6" />
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          </div>
          <div className="flex-1 p-6">
            <Skeleton className="h-8 w-48 mb-4" />
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </div>
    );
  }

  // Employee routes - restricted access
  if (isEmployee) {
    console.log('RoleBasedRoute: Rendering employee routes');
    return (
      <Routes>
        <Route path="/" element={<EmployeeLayout />}>
          <Route index element={<EmployeeDashboard />} />
          <Route path="employee-dashboard" element={<EmployeeDashboard />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="leave" element={<Leave />} />
          <Route path="timesheets" element={<Timesheets />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    );
  }

  // Admin routes - full access
  console.log('RoleBasedRoute: Rendering admin routes');
  return (
    <Routes>
      <Route path="/" element={<AppLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="employee-dashboard" element={<EmployeeDashboard />} />
        <Route path="employees" element={<Employees />} />
        <Route path="announcements" element={<Announcements />} />
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
        <Route path="onboarding" element={<Onboarding />} />
        <Route path="settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}