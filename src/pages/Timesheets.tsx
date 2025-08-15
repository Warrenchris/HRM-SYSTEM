import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TimesheetStats } from "@/components/timesheets/TimesheetStats";
import { TimeEntry } from "@/components/timesheets/TimeEntry";
import { TimesheetTable } from "@/components/timesheets/TimesheetTable";
import { TimesheetApprovals } from "@/components/timesheets/TimesheetApprovals";
import { ProjectTimer } from "@/components/timesheets/ProjectTimer";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export default function Timesheets() {
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
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Timesheets</h1>
        <p className="text-muted-foreground">
          Track time, manage projects, and submit timesheets for approval
        </p>
      </div>

      <TimesheetStats />

      <Tabs defaultValue="timer" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="timer">Timer</TabsTrigger>
          <TabsTrigger value="entry">Time Entry</TabsTrigger>
          <TabsTrigger value="timesheets">My Timesheets</TabsTrigger>
          {canApprove && <TabsTrigger value="approvals">Approvals</TabsTrigger>}
        </TabsList>

        <TabsContent value="timer" className="space-y-6">
          <ProjectTimer />
        </TabsContent>

        <TabsContent value="entry" className="space-y-6">
          <TimeEntry />
        </TabsContent>

        <TabsContent value="timesheets" className="space-y-6">
          <TimesheetTable />
        </TabsContent>

        {canApprove && (
          <TabsContent value="approvals" className="space-y-6">
            <TimesheetApprovals />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}