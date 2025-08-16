import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { Calendar, Clock, Save } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useCreateTimesheetEntryMutation, useProjectsQuery } from "@/hooks/queries/useTimesheetQuery";
import { useCurrentEmployee } from "@/hooks/useCurrentEmployee";


export function TimeEntry() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [project, setProject] = useState("");
  const [task, setTask] = useState("");
  const [description, setDescription] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [breakDuration, setBreakDuration] = useState("60");
  const { toast } = useToast();
  const { employee } = useCurrentEmployee();
  const createTimesheetEntry = useCreateTimesheetEntryMutation();
  const { data: projects } = useProjectsQuery();


  const calculateDuration = () => {
    if (!startTime || !endTime) return "0:00";
    
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    const breakMinutes = parseInt(breakDuration);
    
    let diffMinutes = (end.getTime() - start.getTime()) / (1000 * 60) - breakMinutes;
    
    if (diffMinutes < 0) diffMinutes = 0;
    
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    
    return `${hours}:${minutes.toString().padStart(2, '0')}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!project || !task || !startTime || !endTime) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (!employee?.id) {
      toast({
        title: "Error",
        description: "Employee information not found",
        variant: "destructive",
      });
      return;
    }

    const entryDate = format(selectedDate, 'yyyy-MM-dd');
    const startDateTime = `${entryDate}T${startTime}:00`;
    const endDateTime = `${entryDate}T${endTime}:00`;

    createTimesheetEntry.mutate({
      employee_id: employee.id,
      project_name: project,
      task_name: task,
      description: description || undefined,
      start_time: startDateTime,
      end_time: endDateTime,
      break_duration: parseInt(breakDuration),
      entry_date: entryDate,
    }, {
      onSuccess: () => {
        // Reset form
        setProject("");
        setTask("");
        setDescription("");
        setStartTime("");
        setEndTime("");
        setBreakDuration("60");
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Manual Time Entry
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="date">Date</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  id="date"
                  type="date"
                  value={format(selectedDate, 'yyyy-MM-dd')}
                  onChange={(e) => setSelectedDate(new Date(e.target.value))}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="project">Project</Label>
              <Input
                id="project"
                placeholder="Enter project name"
                value={project}
                onChange={(e) => setProject(e.target.value)}
                list="project-suggestions"
              />
              <datalist id="project-suggestions">
                {projects?.map((project) => (
                  <option key={project} value={project} />
                ))}
              </datalist>
            </div>

            <div>
              <Label htmlFor="task">Task Name</Label>
              <Input
                id="task"
                placeholder="Enter task name"
                value={task}
                onChange={(e) => setTask(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="break">Break Duration (minutes)</Label>
              <Select value={breakDuration} onValueChange={setBreakDuration}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">No break</SelectItem>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="45">45 minutes</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                  <SelectItem value="90">1.5 hours</SelectItem>
                  <SelectItem value="120">2 hours</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="startTime">Start Time</Label>
              <Input
                id="startTime"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="endTime">End Time</Label>
              <Input
                id="endTime"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
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

          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div>
              <Label className="text-sm font-medium">Calculated Duration</Label>
              <p className="text-2xl font-bold">{calculateDuration()}</p>
            </div>
            <Button type="submit" disabled={createTimesheetEntry.isPending}>
              <Save className="h-4 w-4 mr-2" />
              {createTimesheetEntry.isPending ? "Saving..." : "Save Entry"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}