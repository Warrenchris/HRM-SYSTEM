import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CalendarIcon, Plus, Video, MapPin, Clock, Users } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface Interview {
  id: string;
  candidateName: string;
  candidateEmail: string;
  position: string;
  type: "phone" | "video" | "in-person" | "technical";
  stage: "initial" | "technical" | "final" | "hr";
  date: string;
  time: string;
  duration: number;
  interviewer: string[];
  location?: string;
  meetingLink?: string;
  status: "scheduled" | "completed" | "cancelled" | "no-show";
  notes?: string;
  rating?: number;
}

export function InterviewScheduling() {
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [candidateName, setCandidateName] = useState("");
  const [candidateEmail, setCandidateEmail] = useState("");
  const [interviewPosition, setInterviewPosition] = useState("");
  const [interviewType, setInterviewType] = useState("");
  const [interviewStage, setInterviewStage] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState("");
  const [duration, setDuration] = useState("60");
  const [interviewer, setInterviewer] = useState("");
  const [meetingLink, setMeetingLink] = useState("");
  const [zapierWebhook, setZapierWebhook] = useState("");
  const { toast } = useToast();

  const interviews: Interview[] = [
    {
      id: "I001",
      candidateName: "Sarah Johnson",
      candidateEmail: "sarah.johnson@email.com",
      position: "Senior Frontend Developer",
      type: "video",
      stage: "technical",
      date: "2024-07-25",
      time: "10:00",
      duration: 90,
      interviewer: ["John Smith", "Technical Lead"],
      meetingLink: "https://meet.google.com/abc-defg-hij",
      status: "scheduled",
    },
    {
      id: "I002",
      candidateName: "Michael Ochieng",
      candidateEmail: "m.ochieng@email.com",
      position: "Product Manager",
      type: "in-person",
      stage: "final",
      date: "2024-07-26",
      time: "14:00",
      duration: 60,
      interviewer: ["Jane Director", "CEO"],
      location: "Conference Room A",
      status: "scheduled",
    },
    {
      id: "I003",
      candidateName: "Grace Wanjiku",
      candidateEmail: "grace.w@email.com",
      position: "UI/UX Designer",
      type: "phone",
      stage: "initial",
      date: "2024-07-24",
      time: "11:00",
      duration: 30,
      interviewer: ["Design Manager"],
      status: "completed",
      rating: 4.0,
      notes: "Good portfolio, needs more experience with design systems",
    },
    {
      id: "I004",
      candidateName: "David Kipchoge",
      candidateEmail: "d.kipchoge@email.com",
      position: "Senior Frontend Developer",
      type: "technical",
      stage: "technical",
      date: "2024-07-27",
      time: "15:30",
      duration: 120,
      interviewer: ["Senior Developer", "Team Lead"],
      meetingLink: "https://zoom.us/j/123456789",
      status: "scheduled",
    },
  ];

  const positions = ["Senior Frontend Developer", "Product Manager", "UI/UX Designer"];
  const interviewers = ["John Smith", "Jane Director", "Design Manager", "Technical Lead", "Senior Developer"];

  const getStatusBadge = (status: Interview["status"]) => {
    switch (status) {
      case "scheduled":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Scheduled</Badge>;
      case "completed":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Completed</Badge>;
      case "cancelled":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Cancelled</Badge>;
      case "no-show":
        return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">No Show</Badge>;
    }
  };

  const getTypeBadge = (type: Interview["type"]) => {
    switch (type) {
      case "phone":
        return <Badge variant="outline">Phone</Badge>;
      case "video":
        return <Badge className="bg-blue-50 text-blue-700 hover:bg-blue-50">Video</Badge>;
      case "in-person":
        return <Badge className="bg-green-50 text-green-700 hover:bg-green-50">In-Person</Badge>;
      case "technical":
        return <Badge className="bg-purple-50 text-purple-700 hover:bg-purple-50">Technical</Badge>;
    }
  };

  const handleScheduleInterview = async () => {
    if (!candidateName || !candidateEmail || !interviewPosition || !selectedDate || !selectedTime) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // If Zapier webhook is provided, trigger it
    if (zapierWebhook) {
      try {
        await fetch(zapierWebhook, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          mode: "no-cors",
          body: JSON.stringify({
            action: "interview_scheduled",
            candidate_name: candidateName,
            candidate_email: candidateEmail,
            position: interviewPosition,
            interview_type: interviewType,
            date: format(selectedDate, "yyyy-MM-dd"),
            time: selectedTime,
            interviewer: interviewer,
            timestamp: new Date().toISOString(),
          }),
        });

        toast({
          title: "Interview Scheduled & Automated",
          description: `Interview with ${candidateName} scheduled and Zapier webhook triggered`,
        });
      } catch (error) {
        toast({
          title: "Interview Scheduled",
          description: `Interview with ${candidateName} has been scheduled`,
        });
      }
    } else {
      toast({
        title: "Interview Scheduled",
        description: `Interview with ${candidateName} has been scheduled successfully`,
      });
    }

    // Reset form
    setCandidateName("");
    setCandidateEmail("");
    setInterviewPosition("");
    setInterviewType("");
    setInterviewStage("");
    setSelectedDate(undefined);
    setSelectedTime("");
    setDuration("60");
    setInterviewer("");
    setMeetingLink("");
    setIsDialogOpen(false);
  };

  const filteredInterviews = interviews.filter(interview => 
    selectedFilter === "all" || interview.status === selectedFilter
  );

  const getTodayInterviews = () => {
    const today = new Date().toISOString().split('T')[0];
    return interviews.filter(interview => interview.date === today && interview.status === "scheduled");
  };

  return (
    <div className="space-y-6">
      {/* Today's Interviews Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Today's Interviews ({getTodayInterviews().length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {getTodayInterviews().length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No interviews scheduled for today</p>
          ) : (
            <div className="space-y-3">
              {getTodayInterviews().map((interview) => (
                <div key={interview.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="text-sm font-medium">{interview.time}</div>
                    <div>
                      <div className="font-medium">{interview.candidateName}</div>
                      <div className="text-sm text-muted-foreground">{interview.position}</div>
                    </div>
                    {getTypeBadge(interview.type)}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline">
                      Join Interview
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Interview Schedule
            </CardTitle>
            <div className="flex items-center gap-2">
              <Select value={selectedFilter} onValueChange={setSelectedFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Interviews</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Schedule Interview
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Schedule Interview</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="candidate-name">Candidate Name *</Label>
                        <Input
                          id="candidate-name"
                          placeholder="Enter candidate name"
                          value={candidateName}
                          onChange={(e) => setCandidateName(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="candidate-email">Candidate Email *</Label>
                        <Input
                          id="candidate-email"
                          type="email"
                          placeholder="candidate@email.com"
                          value={candidateEmail}
                          onChange={(e) => setCandidateEmail(e.target.value)}
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Position *</Label>
                      <Select value={interviewPosition} onValueChange={setInterviewPosition}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select position" />
                        </SelectTrigger>
                        <SelectContent>
                          {positions.map((position) => (
                            <SelectItem key={position} value={position}>
                              {position}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Interview Type</Label>
                        <Select value={interviewType} onValueChange={setInterviewType}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="phone">Phone</SelectItem>
                            <SelectItem value="video">Video</SelectItem>
                            <SelectItem value="in-person">In-Person</SelectItem>
                            <SelectItem value="technical">Technical</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Interview Stage</Label>
                        <Select value={interviewStage} onValueChange={setInterviewStage}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select stage" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="initial">Initial</SelectItem>
                            <SelectItem value="technical">Technical</SelectItem>
                            <SelectItem value="final">Final</SelectItem>
                            <SelectItem value="hr">HR</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label>Date *</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !selectedDate && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {selectedDate ? format(selectedDate, "PPP") : "Pick date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={selectedDate}
                              onSelect={setSelectedDate}
                              initialFocus
                              className="pointer-events-auto"
                            />
                          </PopoverContent>
                        </Popover>
                      </div>

                      <div>
                        <Label htmlFor="time">Time *</Label>
                        <Input
                          id="time"
                          type="time"
                          value={selectedTime}
                          onChange={(e) => setSelectedTime(e.target.value)}
                        />
                      </div>

                      <div>
                        <Label htmlFor="duration">Duration (minutes)</Label>
                        <Input
                          id="duration"
                          type="number"
                          value={duration}
                          onChange={(e) => setDuration(e.target.value)}
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Interviewer</Label>
                      <Select value={interviewer} onValueChange={setInterviewer}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select interviewer" />
                        </SelectTrigger>
                        <SelectContent>
                          {interviewers.map((person) => (
                            <SelectItem key={person} value={person}>
                              {person}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="meeting-link">Meeting Link (for video interviews)</Label>
                      <Input
                        id="meeting-link"
                        placeholder="https://meet.google.com/..."
                        value={meetingLink}
                        onChange={(e) => setMeetingLink(e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="zapier-webhook">Zapier Webhook URL (Optional)</Label>
                      <Input
                        id="zapier-webhook"
                        placeholder="https://hooks.zapier.com/hooks/catch/..."
                        value={zapierWebhook}
                        onChange={(e) => setZapierWebhook(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Automatically send calendar invites and notifications
                      </p>
                    </div>

                    <div className="flex gap-2 justify-end">
                      <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleScheduleInterview}>
                        Schedule Interview
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Candidate</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Interviewer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInterviews.map((interview) => (
                  <TableRow key={interview.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{interview.candidateName}</div>
                        <div className="text-sm text-muted-foreground">
                          {interview.candidateEmail}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{interview.position}</div>
                        <div className="text-sm text-muted-foreground">
                          {interview.stage} stage
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {new Date(interview.date).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {interview.time} ({interview.duration}min)
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getTypeBadge(interview.type)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{interview.interviewer.join(", ")}</span>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(interview.status)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {interview.meetingLink && (
                          <Button size="sm" variant="outline">
                            <Video className="h-4 w-4" />
                          </Button>
                        )}
                        <Button size="sm" variant="outline">
                          Reschedule
                        </Button>
                        {interview.status === "scheduled" && (
                          <Button size="sm" variant="outline">
                            Cancel
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}