import { Outlet } from "react-router-dom";
import { AppHeader } from "@/components/navigation/AppHeader";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Calendar, Clock, FileText, LogOut, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export function EmployeeLayout() {
  const { signOut } = useAuth();
  const location = useLocation();

  const navigationItems = [
    {
      title: "My Dashboard",
      href: "/employee-dashboard",
      icon: User,
    },
    {
      title: "Attendance",
      href: "/attendance",
      icon: Clock,
    },
    {
      title: "Leave Requests",
      href: "/leave",
      icon: Calendar,
    },
    {
      title: "Timesheets",
      href: "/timesheets",
      icon: FileText,
    },
  ];

  return (
    <div className="min-h-screen flex w-full bg-background">
      {/* Employee Sidebar */}
      <div className="w-64 border-r bg-card">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-14 items-center border-b px-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <User className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-bold">SigmaHRM</h1>
                <p className="text-xs text-muted-foreground">Employee Portal</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-auto p-4">
            <nav className="space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground ${
                      isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.title}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Sign Out */}
          <div className="border-t p-4">
            <Button
              variant="ghost"
              onClick={signOut}
              className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <AppHeader />
        
        <main className="flex-1 overflow-y-auto bg-muted/30 p-3 sm:p-4 md:p-6">
          <div className="max-w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}