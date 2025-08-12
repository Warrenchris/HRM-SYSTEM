import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useCompany } from "@/contexts/CompanyContext";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading: authLoading } = useAuth();
  const [roleLoading, setRoleLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/landing");
      return;
    }

    // Check user role and redirect to appropriate dashboard
    const checkUserRoleAndRedirect = async () => {
      if (!user || authLoading) return;

      try {
        // Ensure we have a valid session before querying
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          console.error('No valid session found');
          setRoleLoading(false);
          return;
        }

        // Add a small delay to ensure JWT context is properly set
        await new Promise(resolve => setTimeout(resolve, 100));

        const { data: profile, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error('Error fetching user profile:', error);
          // If profile query fails, assume employee role and continue
          const userRole = 'employee';
          handleRedirect(userRole);
        } else {
          const userRole = profile?.role || 'employee';
          handleRedirect(userRole);
        }
      } catch (error) {
        console.error('Error checking user role:', error);
        // On any error, assume employee role and continue
        handleRedirect('employee');
      } finally {
        setRoleLoading(false);
      }
    };

    const handleRedirect = (userRole: string) => {
      // If employee is trying to access root path, redirect to employee dashboard
      if (userRole === 'employee' && (location.pathname === '/app' || location.pathname === '/app/' || location.pathname === '/app/dashboard')) {
        navigate('/app/employee-dashboard', { replace: true });
      }
    };

    if (!authLoading && user) {
      checkUserRoleAndRedirect();
    }
  }, [user, authLoading, navigate, location.pathname]);

  if (authLoading || roleLoading) {
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

  if (!user) {
    return null;
  }

  return <>{children}</>;
}