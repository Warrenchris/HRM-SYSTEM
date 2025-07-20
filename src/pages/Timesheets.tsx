import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TimesheetStats } from "@/components/timesheets/TimesheetStats";
import { TimeEntry } from "@/components/timesheets/TimeEntry";
import { TimesheetTable } from "@/components/timesheets/TimesheetTable";
import { TimesheetApprovals } from "@/components/timesheets/TimesheetApprovals";
import { ProjectTimer } from "@/components/timesheets/ProjectTimer";

export default function Timesheets() {
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
          <TabsTrigger value="approvals">Approvals</TabsTrigger>
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

        <TabsContent value="approvals" className="space-y-6">
          <TimesheetApprovals />
        </TabsContent>
      </Tabs>
    </div>
  );
}