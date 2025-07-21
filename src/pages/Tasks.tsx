import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TaskStats } from "@/components/tasks/TaskStats";
import { TaskAssignment } from "@/components/tasks/TaskAssignment";
import { TaskTable } from "@/components/tasks/TaskTable";
import { TaskCalendar } from "@/components/tasks/TaskCalendar";
import { TaskEscalation } from "@/components/tasks/TaskEscalation";

export default function Tasks() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Task Management</h1>
        <p className="text-muted-foreground">
          Assign tasks, track progress, and manage escalations seamlessly.
        </p>
      </div>

      <TaskStats />

      <Tabs defaultValue="my-tasks" className="w-full">
        <TabsList>
          <TabsTrigger value="my-tasks">My Tasks</TabsTrigger>
          <TabsTrigger value="assigned">Assigned Tasks</TabsTrigger>
          <TabsTrigger value="assign">Assign Task</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          <TabsTrigger value="escalations">Escalations</TabsTrigger>
        </TabsList>

        <TabsContent value="my-tasks" className="space-y-4">
          <TaskTable viewType="my-tasks" />
        </TabsContent>

        <TabsContent value="assigned" className="space-y-4">
          <TaskTable viewType="assigned" />
        </TabsContent>

        <TabsContent value="assign" className="space-y-4">
          <TaskAssignment />
        </TabsContent>

        <TabsContent value="calendar" className="space-y-4">
          <TaskCalendar />
        </TabsContent>

        <TabsContent value="escalations" className="space-y-4">
          <TaskEscalation />
        </TabsContent>
      </Tabs>
    </div>
  );
}