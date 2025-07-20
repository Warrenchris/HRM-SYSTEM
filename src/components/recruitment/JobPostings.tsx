import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Briefcase, MapPin, Clock, DollarSign, Share } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface JobPosting {
  id: string;
  title: string;
  department: string;
  location: string;
  type: "full-time" | "part-time" | "contract" | "internship";
  experience: string;
  salary: { min: number; max: number };
  status: "active" | "paused" | "closed" | "draft";
  applications: number;
  postedDate: string;
  deadline: string;
  description: string;
  requirements: string[];
  benefits: string[];
  zapierWebhook?: string;
}

export function JobPostings() {
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [jobTitle, setJobTitle] = useState("");
  const [jobDepartment, setJobDepartment] = useState("");
  const [jobLocation, setJobLocation] = useState("");
  const [jobType, setJobType] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [minSalary, setMinSalary] = useState("");
  const [maxSalary, setMaxSalary] = useState("");
  const [zapierWebhook, setZapierWebhook] = useState("");
  const { toast } = useToast();

  const jobPostings: JobPosting[] = [
    {
      id: "JP001",
      title: "Senior Frontend Developer",
      department: "Engineering",
      location: "Nairobi, Kenya",
      type: "full-time",
      experience: "5+ years",
      salary: { min: 800000, max: 1200000 },
      status: "active",
      applications: 23,
      postedDate: "2024-07-15",
      deadline: "2024-08-15",
      description: "We're looking for a skilled Senior Frontend Developer to join our dynamic team...",
      requirements: ["React.js", "TypeScript", "5+ years experience", "Team leadership"],
      benefits: ["Health Insurance", "Remote Work", "Professional Development"],
    },
    {
      id: "JP002",
      title: "Product Manager",
      department: "Product",
      location: "Remote",
      type: "full-time",
      experience: "3+ years",
      salary: { min: 600000, max: 900000 },
      status: "active",
      applications: 17,
      postedDate: "2024-07-18",
      deadline: "2024-08-18",
      description: "Join our product team to drive innovation and strategy...",
      requirements: ["Product Strategy", "Agile/Scrum", "Data Analysis", "Communication"],
      benefits: ["Equity", "Flexible Hours", "Learning Budget"],
    },
    {
      id: "JP003",
      title: "UI/UX Designer",
      department: "Design",
      location: "Nairobi, Kenya",
      type: "full-time",
      experience: "2+ years",
      salary: { min: 400000, max: 700000 },
      status: "paused",
      applications: 31,
      postedDate: "2024-07-10",
      deadline: "2024-08-10",
      description: "Create beautiful and intuitive user experiences...",
      requirements: ["Figma", "User Research", "Prototyping", "Design Systems"],
      benefits: ["Creative Freedom", "Modern Equipment", "Team Events"],
    },
  ];

  const departments = ["Engineering", "Product", "Design", "Marketing", "Sales", "HR", "Finance"];
  const locations = ["Nairobi, Kenya", "Remote", "Hybrid", "Mombasa, Kenya"];

  const getStatusBadge = (status: JobPosting["status"]) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>;
      case "paused":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Paused</Badge>;
      case "closed":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Closed</Badge>;
      case "draft":
        return <Badge variant="outline">Draft</Badge>;
    }
  };

  const handleCreateJob = async () => {
    if (!jobTitle || !jobDepartment || !jobLocation || !jobType) {
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
            action: "job_posted",
            job_title: jobTitle,
            department: jobDepartment,
            location: jobLocation,
            type: jobType,
            timestamp: new Date().toISOString(),
          }),
        });

        toast({
          title: "Job Posted & Automated",
          description: `Job "${jobTitle}" has been posted and Zapier webhook triggered`,
        });
      } catch (error) {
        toast({
          title: "Job Posted",
          description: `Job "${jobTitle}" has been posted (webhook failed)`,
        });
      }
    } else {
      toast({
        title: "Job Posted",
        description: `Job "${jobTitle}" has been posted successfully`,
      });
    }

    // Reset form
    setJobTitle("");
    setJobDepartment("");
    setJobLocation("");
    setJobType("");
    setJobDescription("");
    setMinSalary("");
    setMaxSalary("");
    setZapierWebhook("");
    setIsDialogOpen(false);
  };

  const handleShareJob = (jobId: string, title: string) => {
    const jobUrl = `${window.location.origin}/jobs/${jobId}`;
    navigator.clipboard.writeText(jobUrl);
    toast({
      title: "Job Link Copied",
      description: `Share link for "${title}" copied to clipboard`,
    });
  };

  const filteredJobs = jobPostings.filter(job => 
    selectedFilter === "all" || job.status === selectedFilter
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Job Postings
          </CardTitle>
          <div className="flex items-center gap-2">
            <Select value={selectedFilter} onValueChange={setSelectedFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Jobs</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Post Job
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create Job Posting</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  <div>
                    <Label htmlFor="job-title">Job Title *</Label>
                    <Input
                      id="job-title"
                      placeholder="Enter job title"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Department *</Label>
                      <Select value={jobDepartment} onValueChange={setJobDepartment}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          {departments.map((dept) => (
                            <SelectItem key={dept} value={dept}>
                              {dept}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Location *</Label>
                      <Select value={jobLocation} onValueChange={setJobLocation}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select location" />
                        </SelectTrigger>
                        <SelectContent>
                          {locations.map((location) => (
                            <SelectItem key={location} value={location}>
                              {location}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label>Job Type *</Label>
                    <Select value={jobType} onValueChange={setJobType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select job type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full-time">Full Time</SelectItem>
                        <SelectItem value="part-time">Part Time</SelectItem>
                        <SelectItem value="contract">Contract</SelectItem>
                        <SelectItem value="internship">Internship</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="min-salary">Min Salary (KES)</Label>
                      <Input
                        id="min-salary"
                        type="number"
                        placeholder="Minimum salary"
                        value={minSalary}
                        onChange={(e) => setMinSalary(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="max-salary">Max Salary (KES)</Label>
                      <Input
                        id="max-salary"
                        type="number"
                        placeholder="Maximum salary"
                        value={maxSalary}
                        onChange={(e) => setMaxSalary(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="job-description">Job Description</Label>
                    <Textarea
                      id="job-description"
                      placeholder="Describe the role, responsibilities, and requirements"
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      rows={4}
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
                      Automatically trigger workflows when job is posted
                    </p>
                  </div>

                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateJob}>
                      Post Job
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
                <TableHead>Job Title</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Applications</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredJobs.map((job) => (
                <TableRow key={job.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{job.title}</div>
                      <div className="text-sm text-muted-foreground">
                        Posted {new Date(job.postedDate).toLocaleDateString()}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{job.department}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      {job.location}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {job.type.replace('-', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <span className="font-medium">{job.applications}</span>
                      <span className="text-sm text-muted-foreground">candidates</span>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(job.status)}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleShareJob(job.id, job.title)}
                      >
                        <Share className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        Edit
                      </Button>
                      {job.status === "paused" ? (
                        <Button size="sm">Resume</Button>
                      ) : (
                        <Button size="sm" variant="outline">Pause</Button>
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
  );
}