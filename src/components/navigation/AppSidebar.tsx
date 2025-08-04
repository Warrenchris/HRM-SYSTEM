import { NavLink, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  Users,
  User,
  Clock,
  Calendar,
  Package,
  CreditCard,
  DollarSign,
  FileText,
  TrendingUp,
  BarChart3,
  Shield,
  Building,
  Home,
  Settings,
  Ticket,
  CheckSquare,
  Megaphone,
  Rocket
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

const mainModules = [
  { title: "Dashboard", url: "/app", icon: Home },
  { title: "My Dashboard", url: "/app/employee-dashboard", icon: User },
  { title: "Employees", url: "/app/employees", icon: Users },
  { title: "Announcements", url: "/app/announcements", icon: Megaphone },
  { title: "Attendance", url: "/app/attendance", icon: Clock },
  { title: "Leave Management", url: "/app/leave", icon: Calendar },
  { title: "Asset Management", url: "/app/assets", icon: Package },
  { title: "Expenses", url: "/app/expenses", icon: CreditCard },
  { title: "Payroll", url: "/app/payroll", icon: DollarSign },
  { title: "Timesheets", url: "/app/timesheets", icon: FileText },
  { title: "Task Management", url: "/app/tasks", icon: CheckSquare },
  { title: "Tickets", url: "/app/tickets", icon: Ticket },
];

const managementModules = [
  { title: "Performance", url: "/app/performance", icon: TrendingUp },
  { title: "Reports", url: "/app/reports", icon: BarChart3 },
];

const adminModules = [
  { title: "User Management", url: "/app/users", icon: Shield },
  { title: "Company Setup", url: "/app/company", icon: Building },
  { title: "Company Onboarding", url: "/app/onboarding", icon: Rocket },
  { title: "Settings", url: "/app/settings", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const { user } = useAuth();
  const location = useLocation();
  const currentPath = location.pathname;
  const collapsed = state === "collapsed";
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user) return;
      
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('user_id', user.id)
          .single();
        
        setUserRole(profile?.role || 'employee');
      } catch (error) {
        console.error('Error fetching user role:', error);
        setUserRole('employee');
      }
    };

    fetchUserRole();
  }, [user]);

  const isActive = (path: string) => currentPath === path || currentPath === path + '/';
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive 
      ? "bg-primary/10 text-primary font-medium border-r-2 border-primary" 
      : "hover:bg-muted/50 text-muted-foreground hover:text-foreground";

  // Filter modules based on user role
  const getVisibleMainModules = () => {
    if (userRole === 'employee') {
      return mainModules.filter(item => 
        item.title === "My Dashboard" || 
        ['Attendance', 'Leave Management', 'Expenses', 'Task Management', 'Timesheets'].includes(item.title)
      );
    }
    // Admin, HR, Manager can see all main modules except "My Dashboard"
    return mainModules.filter(item => item.title !== "My Dashboard");
  };

  const showManagementModules = userRole && ['admin', 'hr', 'manager'].includes(userRole);
  const showAdminModules = userRole && ['admin', 'hr'].includes(userRole);

  return (
    <Sidebar className={collapsed ? "w-14" : "w-64"} collapsible="icon">
      <SidebarContent className="bg-card border-r">
        {/* Logo Section */}
        <div className="p-4 border-b">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Building className="w-4 h-4 text-white" />
            </div>
            {!collapsed && (
              <div>
                <h2 className="font-bold text-lg text-foreground">HRM Pro</h2>
                <p className="text-xs text-muted-foreground">Enterprise Suite</p>
              </div>
            )}
          </div>
        </div>

        {/* Main Modules */}
        <SidebarGroup>
          <SidebarGroupLabel>Core Modules</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {getVisibleMainModules().map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      end={item.url === "/app"} 
                      className={getNavCls}
                    >
                      <item.icon className="w-4 h-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Management Modules */}
        {showManagementModules && (
          <SidebarGroup>
            <SidebarGroupLabel>Management</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {managementModules.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink to={item.url} className={getNavCls}>
                        <item.icon className="w-4 h-4" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Admin Modules */}
        {showAdminModules && (
          <SidebarGroup>
            <SidebarGroupLabel>Administration</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminModules.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink to={item.url} className={getNavCls}>
                        <item.icon className="w-4 h-4" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  );
}