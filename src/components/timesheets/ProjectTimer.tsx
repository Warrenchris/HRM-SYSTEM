import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Play, Pause, Square, Timer } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCreateTimesheetEntryMutation, useTimesheetEntriesQuery, useProjectsQuery } from "@/hooks/queries/useTimesheetQuery";
import { useCurrentEmployee } from "@/hooks/useCurrentEmployee";
import { format } from "date-fns";

interface TimeEntry {
  id: string;
  project: string;
  task: string;
  description: string;
  startTime: Date;
  endTime?: Date;
  duration: number;
}

export function ProjectTimer() {
  const [isRunning, setIsRunning] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [selectedProject, setSelectedProject] = useState("");
  const [taskName, setTaskName] = useState("");
  const [description, setDescription] = useState("");
  const [startTime, setStartTime] = useState<Date | null>(null);
  const { toast } = useToast();
  const { employee } = useCurrentEmployee();
  const createTimesheetEntry = useCreateTimesheetEntryMutation();
  const today = format(new Date(), 'yyyy-MM-dd');
  const { data: todayEntries = [] } = useTimesheetEntriesQuery(employee?.id, today);
  const { data: projects = [] } = useProjectsQuery();


  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && startTime) {
      interval = setInterval(() => {
        setCurrentTime(Date.now() - startTime.getTime());
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, startTime]);

  const formatTime = (milliseconds: number) => {
    const seconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    if (!selectedProject || !taskName) {
      toast({
        title: "Missing Information",
        description: "Please select a project and enter a task name",
        variant: "destructive",
      });
      return;
    }

    setIsRunning(true);
    setStartTime(new Date());
    setCurrentTime(0);
    toast({
      title: "Timer Started",
      description: `Tracking time for ${taskName}`,
    });
  };

  const handlePause = () => {
    setIsRunning(false);
    toast({
      title: "Timer Paused",
      description: "Time tracking paused",
    });
  };

  const handleStop = () => {
    if (startTime && employee?.id) {
      const endTime = new Date();
      
      createTimesheetEntry.mutate({
        employee_id: employee.id,
        project_name: selectedProject,
        task_name: taskName,
        description: description || undefined,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        break_duration: 0,
        entry_date: format(startTime, 'yyyy-MM-dd'),
      }, {
        onSuccess: () => {
          // Reset timer
          setIsRunning(false);
          setCurrentTime(0);
          setStartTime(null);
          setTaskName("");
          setDescription("");
        }
      });
    }
  };

  const getTotalTime = () => {
    const timerTime = isRunning ? currentTime : 0;
    const entriesTime = todayEntries.reduce((total, entry) => total + (entry.total_hours * 3600 * 1000), 0);
    return timerTime + entriesTime;
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Timer className="h-5 w-5" />
            Project Timer
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <div className="text-4xl font-mono font-bold mb-2">
              {formatTime(currentTime)}
            </div>
            <p className="text-sm text-muted-foreground">
              Today's Total: {formatTime(getTotalTime())}
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="project">Project</Label>
              <Input
                id="project"
                placeholder="Enter project name"
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                list="project-suggestions"
              />
              <datalist id="project-suggestions">
                {projects.map((project) => (
                  <option key={project} value={project} />
                ))}
              </datalist>
            </div>

            <div>
              <Label htmlFor="task">Task Name</Label>
              <Input
                id="task"
                placeholder="Enter task name"
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Add task description..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="flex gap-2">
              {!isRunning ? (
                <Button
                  onClick={handleStart}
                  disabled={!selectedProject || !taskName}
                  className="flex-1"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Start Timer
                </Button>
              ) : (
                <>
                  <Button
                    onClick={handlePause}
                    variant="outline"
                    className="flex-1"
                  >
                    <Pause className="h-4 w-4 mr-2" />
                    Pause
                  </Button>
                  <Button
                    onClick={handleStop}
                    variant="destructive"
                    className="flex-1"
                  >
                    <Square className="h-4 w-4 mr-2" />
                    Stop & Save
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Today's Entries</CardTitle>
        </CardHeader>
        <CardContent>
          {todayEntries.length === 0 ? (
            <div className="text-center py-8">
              <Timer className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No time entries for today</p>
            </div>
          ) : (
            <div className="space-y-3">
              {todayEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between p-3 bg-muted rounded-lg"
                >
                  <div>
                    <div className="font-medium">{entry.task_name}</div>
                    <div className="text-sm text-muted-foreground">
                      {entry.project_name}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">
                      {entry.total_hours ? `${entry.total_hours.toFixed(1)}h` : '0h'}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {format(new Date(entry.start_time), 'HH:mm')} - {format(new Date(entry.end_time), 'HH:mm')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}