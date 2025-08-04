import { Bell, Search, User, LogOut, Settings, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { CompanySwitcher } from "@/components/company/CompanySwitcher";
import { supabase } from "@/integrations/supabase/client";

export function AppHeader() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [userRole, setUserRole] = useState<string>('employee');
  const [notifications, setNotifications] = useState<any[]>([]);

  const unreadCount = notifications.filter(n => !n.read).length;
  const isEmployeeDashboard = location.pathname === '/app/employee-dashboard';
  const isEmployeeModule = location.pathname.startsWith('/app/') && !isEmployeeDashboard;

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

    // Listen for new notification events
    const handleNewNotification = (event: any) => {
      const { title, message, type, employeeName, requestId } = event.detail;
      const newNotification = {
        id: Date.now(),
        title,
        message,
        time: 'Just now',
        read: false,
        type,
        employeeName,
        requestId,
      };
      
      setNotifications(prev => [newNotification, ...prev]);
    };

    window.addEventListener('newNotification', handleNewNotification);

    return () => {
      window.removeEventListener('newNotification', handleNewNotification);
    };
  }, [user]);

  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      });
      navigate("/auth");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Get user initials for avatar
  const getUserInitials = (email: string) => {
    const name = email.split('@')[0];
    return name.split('.').map(part => part[0]?.toUpperCase()).join('').slice(0, 2) || 'U';
  };

  // Get display name from email
  const getDisplayName = (email: string) => {
    const name = email.split('@')[0];
    return name.split('.').map(part => 
      part.charAt(0).toUpperCase() + part.slice(1)
    ).join(' ');
  };

  const markAsRead = (id: number) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  return (
    <header className="h-16 border-b bg-card px-6 flex items-center justify-between">
      {/* Left Section */}
      <div className="flex items-center gap-4">
        {/* Show sidebar trigger only for admin/hr/manager */}
        {userRole !== 'employee' && <SidebarTrigger />}
        
        {/* Show home button for employees on dashboard */}
        {isEmployeeDashboard && (
          <div className="flex items-center gap-2">
            <Home className="h-5 w-5 text-primary" />
            <span className="font-semibold text-lg">My Dashboard</span>
          </div>
        )}
        
        {/* Show back to dashboard button for employee modules */}
        {isEmployeeModule && userRole === 'employee' && (
          <Button asChild variant="outline" size="sm">
            <Link to="/app/employee-dashboard" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              Dashboard
            </Link>
          </Button>
        )}
        
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={isEmployeeDashboard ? "Search..." : "Search employees, records..."}
            className="pl-10 w-80"
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        {/* Company Switcher - only for admin/hr/manager */}
        {userRole !== 'employee' && <CompanySwitcher />}
        
        {/* Notifications */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                >
                  {unreadCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="end">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold">Notifications</h4>
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={markAllAsRead}
                    className="text-xs"
                  >
                    Mark all read
                  </Button>
                )}
              </div>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  No notifications
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 border-b cursor-pointer hover:bg-muted/50 ${
                      !notification.read ? 'bg-muted/30' : ''
                    }`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{notification.title}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {notification.time}
                        </p>
                      </div>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-primary rounded-full ml-2 mt-1" />
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </PopoverContent>
        </Popover>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src="" />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {user ? getUserInitials(user.email || '') : 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="text-left">
                <p className="text-sm font-medium">
                  {user ? getDisplayName(user.email || '') : 'User'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {user?.email || 'user@company.com'}
                </p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}