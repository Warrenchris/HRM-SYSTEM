import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

interface RoleBasedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  redirectTo?: string;
}

export function RoleBasedRoute({ 
  children, 
  allowedRoles = ['admin', 'hr', 'manager'], 
  redirectTo = '/app/employee-dashboard' 
}: RoleBasedRouteProps) {
  const { user } = useAuth();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('user_id', user.id)
          .single();

        const role = profile?.role || 'employee';
        setUserRole(role);
        
        // If user is an employee and trying to access admin/hr pages, redirect to employee dashboard
        if (role === 'employee' && !allowedRoles.includes('employee')) {
          navigate(redirectTo, { replace: true });
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
        setUserRole('employee');
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, [user, navigate, location.pathname, allowedRoles, redirectTo]);

  // Show loading while checking user role
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex h-screen">
          {/* Sidebar skeleton */}
          <div className="w-64 border-r bg-card p-4">
            <Skeleton className="h-8 w-32 mb-6" />
            <div className="space-y-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          </div>
          
          {/* Main content skeleton */}
          <div className="flex-1 p-6">
            <Skeleton className="h-8 w-48 mb-4" />
            <Skeleton className="h-4 w-96 mb-6" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!user || userRole === null) {
    return null;
  }

  return <>{children}</>;
}