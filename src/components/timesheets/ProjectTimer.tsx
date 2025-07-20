import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Play, Pause, Square, Timer } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
  const [todayEntries, setTodayEntries] = useState<TimeEntry[]>([]);
  const { toast } = useToast();

  const projects = [
    "HR Management System",
    "E-commerce Platform",
    "Mobile App Development", 
    "Data Analytics Dashboard",
    "Client Website",
  ];

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
    if (startTime) {
      const endTime = new Date();
      const duration = endTime.getTime() - startTime.getTime();
      
      const newEntry: TimeEntry = {
        id: Date.now().toString(),
        project: selectedProject,
        task: taskName,
        description,
        startTime,
        endTime,
        duration,
      };

      setTodayEntries([...todayEntries, newEntry]);
      
      // Reset timer
      setIsRunning(false);
      setCurrentTime(0);
      setStartTime(null);
      setTaskName("");
      setDescription("");
      
      toast({
        title: "Time Entry Saved",
        description: `${formatTime(duration)} logged for ${taskName}`,
      });
    }
  };

  const getTotalTime = () => {
    const timerTime = isRunning ? currentTime : 0;
    const entriesTime = todayEntries.reduce((total, entry) => total + entry.duration, 0);
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
        <CardContent className="space-y-4">
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
              <Select value={selectedProject} onValueChange={setSelectedProject}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project} value={project}>
                      {project}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                placeholder="Enter task description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <div className="flex gap-2">
            {!isRunning ? (
              <Button onClick={handleStart} className="flex-1">
                <Play className="h-4 w-4 mr-2" />
                Start
              </Button>
            ) : (
              <Button onClick={handlePause} variant="outline" className="flex-1">
                <Pause className="h-4 w-4 mr-2" />
                Pause
              </Button>
            )}
            <Button onClick={handleStop} variant="destructive" disabled={!startTime}>
              <Square className="h-4 w-4 mr-2" />
              Stop
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Today's Entries</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {todayEntries.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No time entries for today
              </p>
            ) : (
              todayEntries.map((entry) => (
                <div key={entry.id} className="border rounded-lg p-3 space-y-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{entry.task}</p>
                      <p className="text-sm text-muted-foreground">{entry.project}</p>
                    </div>
                    <span className="font-mono text-sm">
                      {formatTime(entry.duration)}
                    </span>
                  </div>
                  {entry.description && (
                    <p className="text-sm text-muted-foreground">{entry.description}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {entry.startTime.toLocaleTimeString()} - {entry.endTime?.toLocaleTimeString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}