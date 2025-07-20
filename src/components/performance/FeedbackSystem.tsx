import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, Users, Star, Plus, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FeedbackRequest {
  id: string;
  type: "360" | "peer" | "upward" | "self";
  subject: string;
  requestedBy: string;
  status: "pending" | "in-progress" | "completed";
  dueDate: string;
  respondents: string[];
  completedBy: string[];
}

interface FeedbackItem {
  id: string;
  from: string;
  to: string;
  type: "positive" | "constructive" | "neutral";
  category: string;
  message: string;
  rating?: number;
  date: string;
  anonymous: boolean;
}

export function FeedbackSystem() {
  const [selectedTab, setSelectedTab] = useState("requests");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [feedbackType, setFeedbackType] = useState("");
  const [feedbackCategory, setFeedbackCategory] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [feedbackRating, setFeedbackRating] = useState<number>(0);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const { toast } = useToast();

  const feedbackRequests: FeedbackRequest[] = [
    {
      id: "FR001",
      type: "360",
      subject: "John Doe Q2 Performance Review",
      requestedBy: "Sarah Manager",
      status: "in-progress",
      dueDate: "2024-07-25",
      respondents: ["Jane Smith", "Mike Johnson", "Emily Brown", "Alex Director"],
      completedBy: ["Jane Smith", "Mike Johnson"],
    },
    {
      id: "FR002",
      type: "peer",
      subject: "Project Collaboration Feedback",
      requestedBy: "Mike Lead",
      status: "pending",
      dueDate: "2024-07-30",
      respondents: ["John Doe", "Jane Smith"],
      completedBy: [],
    },
  ];

  const feedbackItems: FeedbackItem[] = [
    {
      id: "FB001",
      from: "Jane Smith",
      to: "John Doe",
      type: "positive",
      category: "Technical Skills",
      message: "John consistently delivers high-quality code and demonstrates excellent problem-solving abilities.",
      rating: 5,
      date: "2024-07-20",
      anonymous: false,
    },
    {
      id: "FB002",
      from: "Anonymous",
      to: "John Doe", 
      type: "constructive",
      category: "Communication",
      message: "Could benefit from more frequent updates during project development to keep the team aligned.",
      rating: 3,
      date: "2024-07-19",
      anonymous: true,
    },
    {
      id: "FB003",
      from: "Mike Johnson",
      to: "Jane Smith",
      type: "positive",
      category: "Leadership",
      message: "Jane shows excellent leadership qualities and helps team members grow professionally.",
      rating: 5,
      date: "2024-07-18",
      anonymous: false,
    },
  ];

  const employees = ["John Doe", "Jane Smith", "Mike Johnson", "Emily Brown"];
  const categories = ["Technical Skills", "Communication", "Leadership", "Teamwork", "Problem Solving", "Initiative"];

  const getStatusBadge = (status: FeedbackRequest["status"]) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Completed</Badge>;
      case "in-progress":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">In Progress</Badge>;
      case "pending":
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  const getFeedbackTypeBadge = (type: FeedbackItem["type"]) => {
    switch (type) {
      case "positive":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Positive</Badge>;
      case "constructive":
        return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">Constructive</Badge>;
      case "neutral":
        return <Badge variant="outline">Neutral</Badge>;
    }
  };

  const renderStars = (rating: number, interactive = false, onRatingChange?: (rating: number) => void) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${interactive ? "cursor-pointer" : ""} ${
          i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
        }`}
        onClick={interactive && onRatingChange ? () => onRatingChange(i + 1) : undefined}
      />
    ));
  };

  const handleSubmitFeedback = () => {
    if (!selectedEmployee || !feedbackCategory || !feedbackMessage) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Feedback Submitted",
      description: `Feedback for ${selectedEmployee} has been submitted successfully`,
    });

    // Reset form
    setSelectedEmployee("");
    setFeedbackCategory("");
    setFeedbackMessage("");
    setFeedbackType("");
    setFeedbackRating(0);
    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              360° Feedback System
            </CardTitle>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Give Feedback
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Provide Feedback</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Employee *</Label>
                      <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select employee" />
                        </SelectTrigger>
                        <SelectContent>
                          {employees.map((employee) => (
                            <SelectItem key={employee} value={employee}>
                              {employee}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Category *</Label>
                      <Select value={feedbackCategory} onValueChange={setFeedbackCategory}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label>Type</Label>
                    <Select value={feedbackType} onValueChange={setFeedbackType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select feedback type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="positive">Positive</SelectItem>
                        <SelectItem value="constructive">Constructive</SelectItem>
                        <SelectItem value="neutral">Neutral</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Rating</Label>
                    <div className="flex items-center gap-2 mt-2">
                      {renderStars(feedbackRating, true, setFeedbackRating)}
                      <span className="ml-2 text-sm">
                        {feedbackRating > 0 ? `${feedbackRating}/5` : "Select rating"}
                      </span>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="feedback-message">Feedback Message *</Label>
                    <Textarea
                      id="feedback-message"
                      placeholder="Provide specific, actionable feedback..."
                      value={feedbackMessage}
                      onChange={(e) => setFeedbackMessage(e.target.value)}
                      rows={4}
                    />
                  </div>

                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSubmitFeedback}>
                      <Send className="h-4 w-4 mr-2" />
                      Submit Feedback
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="requests">Feedback Requests</TabsTrigger>
              <TabsTrigger value="received">Received Feedback</TabsTrigger>
              <TabsTrigger value="given">Given Feedback</TabsTrigger>
            </TabsList>

            <TabsContent value="requests" className="space-y-4">
              {feedbackRequests.map((request) => (
                <Card key={request.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-medium">{request.subject}</h3>
                        <p className="text-sm text-muted-foreground">
                          Requested by {request.requestedBy}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{request.type.toUpperCase()}</Badge>
                        {getStatusBadge(request.status)}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Progress: {request.completedBy.length}/{request.respondents.length} completed</span>
                        <span>Due: {new Date(request.dueDate).toLocaleDateString()}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-xs">
                        <Users className="h-4 w-4" />
                        <span>Respondents: {request.respondents.join(", ")}</span>
                      </div>
                      
                      {request.completedBy.length > 0 && (
                        <div className="text-xs text-green-600">
                          Completed by: {request.completedBy.join(", ")}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 mt-3">
                      <Button size="sm" variant="outline">
                        View Details
                      </Button>
                      {request.status !== "completed" && (
                        <Button size="sm">
                          Provide Feedback
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="received" className="space-y-4">
              {feedbackItems.filter(f => f.to === "John Doe").map((feedback) => (
                <Card key={feedback.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{feedback.category}</span>
                          {getFeedbackTypeBadge(feedback.type)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          From: {feedback.anonymous ? "Anonymous" : feedback.from}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        {feedback.rating && renderStars(feedback.rating)}
                        <span className="ml-1 text-sm">{feedback.rating}/5</span>
                      </div>
                    </div>

                    <p className="text-sm mb-2">{feedback.message}</p>
                    
                    <div className="text-xs text-muted-foreground">
                      {new Date(feedback.date).toLocaleDateString()}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="given" className="space-y-4">
              {feedbackItems.filter(f => f.from === "John Doe").map((feedback) => (
                <Card key={feedback.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{feedback.category}</span>
                          {getFeedbackTypeBadge(feedback.type)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          To: {feedback.to}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        {feedback.rating && renderStars(feedback.rating)}
                        <span className="ml-1 text-sm">{feedback.rating}/5</span>
                      </div>
                    </div>

                    <p className="text-sm mb-2">{feedback.message}</p>
                    
                    <div className="text-xs text-muted-foreground">
                      {new Date(feedback.date).toLocaleDateString()}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}