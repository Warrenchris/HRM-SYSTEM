import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "@/components/layouts/AppLayout";
import Dashboard from "./pages/Dashboard";
import Employees from "./pages/Employees";
import Attendance from "./pages/Attendance";
import Leave from "./pages/Leave";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<Dashboard />} />
            {/* HRM Module Routes - Will be implemented */}
            <Route path="/employees" element={<Employees />} />
            <Route path="/attendance" element={<Attendance />} />
            <Route path="/leave" element={<Leave />} />
            <Route path="/expenses" element={<div className="p-8 text-center text-muted-foreground">Expenses Module - Coming Soon</div>} />
            <Route path="/payroll" element={<div className="p-8 text-center text-muted-foreground">Payroll Module - Coming Soon</div>} />
            <Route path="/loans" element={<div className="p-8 text-center text-muted-foreground">Loan Management - Coming Soon</div>} />
            <Route path="/timesheets" element={<div className="p-8 text-center text-muted-foreground">Timesheets Module - Coming Soon</div>} />
            <Route path="/performance" element={<div className="p-8 text-center text-muted-foreground">Performance Management - Coming Soon</div>} />
            <Route path="/recruitment" element={<div className="p-8 text-center text-muted-foreground">Recruitment Module - Coming Soon</div>} />
            <Route path="/reports" element={<div className="p-8 text-center text-muted-foreground">Reports & Analytics - Coming Soon</div>} />
            <Route path="/users" element={<div className="p-8 text-center text-muted-foreground">User Management - Coming Soon</div>} />
            <Route path="/company" element={<div className="p-8 text-center text-muted-foreground">Company Setup - Coming Soon</div>} />
            <Route path="/settings" element={<div className="p-8 text-center text-muted-foreground">Settings - Coming Soon</div>} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
