import { useEffect, useMemo, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LeaveStats } from "@/components/leave/LeaveStats";
import { LeaveRequestForm } from "@/components/leave/LeaveRequestForm";
import { LeaveHistory } from "@/components/leave/LeaveHistory";
import { LeaveCalendar } from "@/components/leave/LeaveCalendar";
import { LeaveApprovals } from "@/components/leave/LeaveApprovals";
import { Calendar, Clock, FileText, CheckCircle, BarChart3 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export default function Leave() {
  const [activeTab, setActiveTab] = useState("overview");
  const { user } = useAuth();
  const [role, setRole] = useState<"employee" | "manager" | "hr" | "admin" | "ceo" | null>(null);

  useEffect(() => {
    const fetchRole = async () => {
      try {
        if (!user) {
          setRole(null);
          return;
        }
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("user_id", user.id)
          .single();
        setRole((profile?.role as any) || "employee");
      } catch {
        setRole("employee");
      }
    };
    fetchRole();
  }, [user]);

  const canApprove = useMemo(() => role === "manager" || role === "hr" || role === "admin" || role === "ceo", [role]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Leave Management</h1>
        <p className="text-muted-foreground">
          Manage your leave requests, track balances, and view team calendars
        </p>
      </div>

      {/* Leave Stats */}
      <LeaveStats />

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="overflow-x-auto">
          <TabsList className="w-full justify-start sm:justify-center min-w-fit">
            <TabsTrigger value="overview" className="flex items-center gap-1 sm:gap-2">
              <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="request" className="flex items-center gap-1 sm:gap-2">
              <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">New Request</span>
              <span className="sm:hidden">Request</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-1 sm:gap-2">
              <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">My Requests</span>
              <span className="sm:hidden">History</span>
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center gap-1 sm:gap-2">
              <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Team Calendar</span>
              <span className="sm:hidden">Calendar</span>
            </TabsTrigger>
            {canApprove && (
              <TabsTrigger value="approvals" className="flex items-center gap-1 sm:gap-2">
                <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Approvals</span>
                <span className="sm:hidden">Approve</span>
              </TabsTrigger>
            )}
          </TabsList>
        </div>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common leave management tasks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <button
                    onClick={() => setActiveTab("request")}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-primary" />
                      <span className="font-medium">Submit Leave Request</span>
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab("calendar")}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-primary" />
                      <span className="font-medium">View Team Calendar</span>
                    </div>
                  </button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest leave requests and updates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-2 rounded border-l-4 border-l-green-500 bg-green-50 dark:bg-green-950/20">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Annual Leave Approved</p>
                      <p className="text-xs text-muted-foreground">Dec 25-31, 2024</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-2 rounded border-l-4 border-l-yellow-500 bg-yellow-50 dark:bg-yellow-950/20">
                    <Clock className="h-4 w-4 text-yellow-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Sick Leave Pending</p>
                      <p className="text-xs text-muted-foreground">Jan 15, 2025</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="request">
          <LeaveRequestForm />
        </TabsContent>

        <TabsContent value="history">
          <LeaveHistory />
        </TabsContent>

        <TabsContent value="calendar">
          <LeaveCalendar />
        </TabsContent>

        {canApprove && (
          <TabsContent value="approvals">
            <LeaveApprovals />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}